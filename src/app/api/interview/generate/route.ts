import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { calculateAnswerState, determineNextAction } from "@/lib/interviewPolicyEngine";

export async function POST(req: Request) {
    try {
        const clerkUser = await currentUser();
        if (!clerkUser && process.env.NODE_ENV !== "development") {
            return NextResponse.json({ error: "Unauthorized - Please log in." }, { status: 401 });
        }

        const body = await req.json();
        const { context, history, currentQuestionIndex } = body;
        
        // Destructure context
        const { domains, experience, goal, deepDiveAnswer } = context;
        const primaryDomain = domains?.[0] || 'Technical';
        
        // Provide default state tracking if not sent by client (for backward compatibility during dev)
        const currentDifficulty = body.currentDifficulty !== undefined ? body.currentDifficulty : 5;

        // -----------------------------------------------------------------------------------
        // REINFORCEMENT LEARNING POLICY ENGINE (No GenAI)
        // -----------------------------------------------------------------------------------

        let newQuestion = "";
        let newDifficulty = currentDifficulty;

        if (currentQuestionIndex === 0) {
            newQuestion = `Hi ${clerkUser?.firstName || 'there'}, my name is Aura. Regarding your goal of ${goal} in ${primaryDomain}... You mentioned your biggest challenge is "${deepDiveAnswer}". Since you have ${experience} experience, tell me exactly how you plan to overcome that specific challenge.`;
        } else {
            // 1. Analyze the state of the candidate's last answer
            if (!history || history.length === 0) {
                 return NextResponse.json({ error: "Interview history is empty or invalid" }, { status: 400 });
            }
            const lastAnswer = history[history.length - 1].answer;
            const stateResult = calculateAnswerState(lastAnswer, currentDifficulty);
            
            newDifficulty = stateResult.newDifficulty;
            
            const currentState = {
                historyLength: history.length,
                lastAnswerWords: lastAnswer.split(' ').length,
                technicalDensity: stateResult.density,
                difficultyMultiplier: newDifficulty,
                detectedKeywords: stateResult.keywords,
                domain: primaryDomain
            };

            // 2. Select optimal action based on state
            newQuestion = determineNextAction(currentState);
        }

        // Simulate "thinking latency" for realism
        await new Promise((resolve) => setTimeout(resolve, 800));

        // -----------------------------------------------------------------------------------
        // HYBRID GENERATIVE REFINEMENT (Passing Policy -> Local LLM for human polish)
        // -----------------------------------------------------------------------------------
        try {
             const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
             const ollamaModel = "qwen:0.5b";

             // The LLM's only job is to take the mathematically selected question and make it sound human/empathetic.
             const rephrasePrompt = `You are a friendly, human-like interviewer. The candidate just said: "${history.length > 0 ? history[history.length - 1].answer : goal}". Rephrase the following follow-up instruction into a natural, conversational question. Do not answer it. Just rephrase it warmly: "${newQuestion}"`;

             const ollamaResponse = await fetch(`${ollamaBaseUrl}/api/generate`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                     model: ollamaModel,
                     prompt: rephrasePrompt,
                     stream: false,
                     options: { temperature: 0.7 }
                 })
             });

             if (ollamaResponse.ok) {
                 const data = await ollamaResponse.json();
                 const formatted = data.response.trim();
                 
                 // Anti-hallucination check for small models
                 if (formatted.includes("?") && formatted.length > 20 && !formatted.toLowerCase().includes("sure")) {
                     // Strip out conversational prefixes tiny models sometimes add
                     if (formatted.includes(":")) {
                          newQuestion = formatted.split(":")[1].trim();
                     } else {
                          newQuestion = formatted;
                     }
                 }
             }
        } catch (e) {
             console.warn("Local LLM failed to refine policy question. Falling back to native policy string.");
        }

        const isFinished = currentQuestionIndex >= 4;

        if (isFinished) {
            newQuestion = "Thank you for your detailed responses. This concludes the formal technical assessment portion. You may now submit to view your final engineering roadmap and performance score.";
        }

        return NextResponse.json({
            success: true,
            question: newQuestion,
            newDifficulty: newDifficulty, // Pass updated RL state back to client
            isFinished: currentQuestionIndex >= 4
        });

    } catch (error: unknown) {
        console.error("Interview Question Generation error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
