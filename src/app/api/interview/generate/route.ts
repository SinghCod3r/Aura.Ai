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
            // Treat the deepDiveAnswer as the 0th state to generate a hyper-customized instruction
            newQuestion = determineNextAction({
                historyLength: 0,
                lastAnswerWords: deepDiveAnswer.split(' ').length,
                technicalDensity: 0.5,
                difficultyMultiplier: currentDifficulty,
                detectedKeywords: [deepDiveAnswer.substring(0, 100)], // Use snippet as pivot
                domain: primaryDomain,
                intent: 'detailed'
            });
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
        // TIMELINE EVALUATOR (Overrides LLM for Intros/Outros)
        // -----------------------------------------------------------------------------------
        const timeLeft = body.timeLeft !== undefined ? body.timeLeft : 900;
        
        // Trigger closing interaction when under 60 seconds or hitting question 14
        const isClosingPhase = (timeLeft <= 60 && timeLeft > 0 && currentQuestionIndex > 8) || currentQuestionIndex === 14;
        
        // Completely terminate the interview loop on the NEXT turn
        const isFinished = timeLeft <= 0 || currentQuestionIndex >= 15;

        if (isFinished) {
            newQuestion = `Thank you so much for your time today. I really enjoyed learning about your granular experience conceptually and technically in ${primaryDomain}. I have everything I need. This concludes our formal interview! You can submit now to receive your personalized critique and roadmap.`;
        } else if (isClosingPhase) {
            newQuestion = `We are just about out of time for today's session. Before we wrap up completely, do you have any specific questions for me about the role, or would you like some quick initial feedback on how you did today?`;
        } else if (currentQuestionIndex > 0) {
            // -----------------------------------------------------------------------------------
            // HYBRID GENERATIVE REFINEMENT (Passing Policy -> Local LLM for human polish)
            // -----------------------------------------------------------------------------------
            try {
                 const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
                 const ollamaModel = "qwen:0.5b";

                 const conversationHistory = history && history.length > 0 
                      ? history.map((h: any) => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.answer}`).join('\n')
                      : "This is the very first question of the interview.";
                 
                 const ollamaResponse = await fetch(`${ollamaBaseUrl}/api/chat`, {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({
                         model: ollamaModel,
                         messages: [
                             {
                                 role: "system",
                                 content: `You are Aura, an expert technical interviewer. You must ONLY output the exact next spoken question to ask the candidate. DO NOT write a script. DO NOT say "Hello" or "How can I help you". DO NOT answer the user's questions. Your only purpose is to act as the interviewer and ask the next technical question based on the instruction.`
                             },
                             {
                                 role: "user",
                                 content: `Candidate Profile: Domain: ${primaryDomain}, Experience: ${experience}.

Recent Interview History:
${conversationHistory}

INSTRUCTION FOR NEXT QUESTION: "${newQuestion}"

Formulate the INSTRUCTION into a single, natural, highly specific human question. Speak directly to the candidate using "you". Do not say "Ask them".
Output ONLY the question text.`
                             }
                         ],
                         stream: false,
                         options: { temperature: 0.2 } // Extremely low temperature to prevent creative scripts
                     })
                 });

                 if (ollamaResponse.ok) {
                     const data = await ollamaResponse.json();
                     let formatted = data.message.content.trim();
                     
                     // Brutal Regex to strip Qwen zero-shot hallucination preambles
                     formatted = formatted.replace(/^The EXACT next question.*?would be:\s*"?/i, "");
                     formatted = formatted.replace(/^Here is the.*?question:\s*"?/i, "");
                     formatted = formatted.replace(/"$/g, ""); // strip trailing quotes
                     
                     const lowerF = formatted.toLowerCase();
                     // Aggressive Anti-hallucination check for small models
                     if (
                         lowerF.includes("the candidate") ||
                         lowerF.includes("ask them") ||
                         lowerF.includes("[instruction]") ||
                         !formatted.includes("?")
                     ) {
                         console.warn("LLM Leaked Instruction. Using safe fallback.");
                         newQuestion = `In the context of ${primaryDomain}, can you elaborate on your experience specifically handling that kind of architecture?`;
                     } else if (formatted.length > 5) {
                         newQuestion = formatted.includes("Assistant:") ? formatted.split("Assistant:")[1].trim() : formatted;
                         newQuestion = newQuestion.replace(/^Question: /i, "");
                     }
                 }
            } catch (e) {
                 console.warn("Local LLM failed to refine policy question. Falling back to native policy string.");
            }
        }

        return NextResponse.json({
            success: true,
            question: newQuestion,
            newDifficulty: newDifficulty,
            isFinished: isFinished
        });

    } catch (error: unknown) {
        console.error("Interview Question Generation error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
