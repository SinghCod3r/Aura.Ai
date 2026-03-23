// src/lib/interviewPolicyEngine.ts

// A heuristic engine that mimics Reinforcement Learning Dialogue Policies.
// It maps the "State" of the interview (Vocab usage, answer length, difficulty multiplier)
// to the optimal "Action" (The structure of the next question).

interface InterviewState {
    historyLength: number;
    lastAnswerWords: number;
    technicalDensity: number;
    difficultyMultiplier: number; // 1-10 scale
    detectedKeywords: string[];
    domain: string;
    intent?: 'brief' | 'detailed' | 'struggling' | 'clarification';
}

// Common technical stop words to ignore when calculating density
const STOP_WORDS = new Set(['the','and','but','for','with','this','that','have','from','just','like','some','what','when','where','how','why','are','you','your','can','will','would','could','should','test','testing','also','more','want','give', 'i', 'am', 'to', 'in', 'it', 'on', 'is', 'a']);

// 1. STATE CLASSIFICATION (Reward function equivalent)
export const calculateAnswerState = (lastAnswer: string, currentDifficulty: number): { newDifficulty: number, keywords: string[], density: number, intent: 'brief' | 'detailed' | 'struggling' | 'clarification' } => {
    const rawWords = lastAnswer.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(w => w.trim() !== '');
    const totalWords = rawWords.length;
    
    const technicalKeywords = rawWords.filter(w => w.length > 5 && !STOP_WORDS.has(w));
    const uniqueKeywords = Array.from(new Set(technicalKeywords));
    
    // Density represents how technically "thick" the answer is
    const density = totalWords === 0 ? 0 : (uniqueKeywords.length / totalWords);
    
    let newDifficulty = currentDifficulty;
    let intent: 'brief' | 'detailed' | 'struggling' | 'clarification' = 'detailed';

    // Detect if the user is asking a conversational question or is confused
    const isAskingQuestion = lastAnswer.toLowerCase().match(/(can you explain|what do you mean|rephrase|repeat|didn't understand|elaborate|clarify|what is|how do you)/);

    if (isAskingQuestion) {
         intent = 'clarification';
         // Don't penalize difficulty for asking a valid question
    } else if (totalWords < 15) {
        intent = 'brief';
        newDifficulty = Math.max(1, currentDifficulty - 1); // Decrease difficulty because they are quiet
    } else if (lastAnswer.toLowerCase().match(/(idk|i don't know|not sure|confused|never used)/)) {
        intent = 'struggling';
        newDifficulty = Math.max(1, currentDifficulty - 2); // Drop difficulty significantly
    } else if (density > 0.15 && totalWords > 20) {
        intent = 'detailed';
        newDifficulty = Math.min(10, currentDifficulty + 1.5); // Increase challenge for smart answers
    } else {
         intent = 'detailed'; // Generic pass
    }

    return { newDifficulty, keywords: uniqueKeywords.slice(0, 4), density, intent };
};

// 2. POLICY SELECTION (Action execution)
export const determineNextAction = (state: InterviewState): string => {
    const pivotWord = state.detectedKeywords.length > 0 
        ? state.detectedKeywords[Math.floor(Math.random() * state.detectedKeywords.length)] 
        : state.domain;

    // Action Policy Matrix based on current State
    if (state.historyLength === 0) {
        // Native spoken string (bypasses LLM)
        return `Hello! Welcome to your ${state.domain} interview. It's great to meet you. To start things off, I'd love to hear a bit more about you as a developer. Could you briefly introduce yourself, explain your current career needs, and tell me what specific projects or goals led you to focus on this domain?`;
    }

    // Policy: User is asking for clarification/rephrasing
    if (state.intent === 'clarification') {
        return `The candidate is asking for clarification or is confused by the last question. Warmly and playfully rephrase the previous technical question involving '${pivotWord}'. Give them a tiny hint if necessary, but keep the core challenge intact.`;
    }

    // Policy: User gave a very short answer
    if (state.lastAnswerWords < 15) {
        return `The candidate's last answer was extremely brief. Push them for more detail. Ask them to provide a concrete technical example or a real-world scenario where they applied '${pivotWord}' to prove their understanding.`;
    }
    
    // Policy: User is struggling
    if (state.intent === 'struggling') {
        return `The candidate is struggling or doesn't know the answer. Be empathetic and encouraging. Pivot slightly to a more fundamental, easier question related to '${pivotWord}' or fundamental ${state.domain} concepts to rebuild their confidence.`;
    }

    // Policy: High Difficulty Level Reached (Stress Test Action)
    if (state.difficultyMultiplier >= 7) {
        const stressActions = [
            `The candidate is doing exceptionally well. Propose a high-stress production catastrophe involving '${pivotWord}' (e.g., 10x traffic spike or node failure) and ask how they would architect a resilient fallback.`,
            `The candidate has deep technical density. Challenge them by artificially constraining their environment: ask how they would optimize their approach to '${pivotWord}' if their compute/memory budget was abruptly cut by 50%.`,
            `Ask them to critically evaluate the exact low-level, systemic tradeoffs between their approach to '${pivotWord}' versus industry-standard deterministic alternatives.`
        ];
        return stressActions[Math.floor(Math.random() * stressActions.length)];
    }

    // Policy: Low/Medium Difficulty Level (Exploration Action)
    if (state.difficultyMultiplier < 4) {
        const exploreActions = [
            `Ask them to explain the fundamental, core purpose of '${pivotWord}' as if they were mentoring a junior developer.`,
            `Ask them to describe the biggest structural advantage of using '${pivotWord}' within the ${state.domain} ecosystem.`,
            `Ask them to outline common edge-cases or beginner mistakes developers make when implementing '${pivotWord}'.`
        ];
        return exploreActions[Math.floor(Math.random() * exploreActions.length)];
    }

    // Policy: Standard Progression (Mid-Level Contextual)
    const standardActions = [
        `Act like a deeply curious human engineer. Drill down into the smallest, most specific microscopic technical detail of their last answer regarding '${pivotWord}'. Ask them exactly *why* they chose that specific implementation and what underlying needs drove that architectural decision.`,
        `Adopt a collaborative, human tone. Ask them to describe a highly specific, painful edge case or obscure underlying bug they encountered when dealing with '${pivotWord}', and how they felt solving it.`,
        `Be incredibly detailed. Ask them to walk you step-by-step through the exact granular metrics and hidden variables they would monitor to ensure their approach to '${pivotWord}' doesn't silently break in production.`
    ];
    
    return standardActions[Math.floor(Math.random() * standardActions.length)];
};

// 3. FINAL EVALUATION POLICY
export const evaluateSessionPolicy = (history: { role: string; answer: string }[], domain: string, finalDifficulty: number) => {
    let totalScore = 50; // Base score
    
    // Factor 1: The peak technical depth reached (Difficulty represents RL Reward max)
    const peakBonus = (finalDifficulty / 10) * 30; // Up to 30 points for reaching hard questions
    totalScore += peakBonus;

    // Factor 2: Verbal Fluency & Strict Gibberish Detection
    let totalWords = 0;
    let totalTechWords = 0;

    history.forEach((h: { role: string; answer: string }) => {
        const words = h.answer.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(w => w.trim() !== '');
        totalWords += words.length;
        const techWords = words.filter(w => w.length > 4 && !STOP_WORDS.has(w));
        totalTechWords += techWords.length;
    });

    const avgWords = history.length > 0 ? (totalWords / history.length) : 0;
    const overallDensity = totalWords > 0 ? (totalTechWords / totalWords) : 0;
    
    let isGibberish = false;
    if (overallDensity < 0.04) {
        // Strict Gibberish Penalty - Override score
        totalScore = Math.min(totalScore, 20); 
        isGibberish = true;
    } else {
        if (avgWords > 40) totalScore += 10;
        else if (avgWords > 20) totalScore += 5;
    }
    
    // Factor 3: Sentiment & Confidence Analysis
    const sentiments = { positive: 0, negative: 0, hesitant: 0, confident: 0 };
    history.forEach((h: { role: string; answer: string }) => {
        const text = h.answer.toLowerCase();
        if (text.match(/(sure|definitely|absolutely|confident|clear|easy|expert|always)/)) sentiments.confident++;
        if (text.match(/(think|maybe|probably|not sure|guess|idk|confused|never)/)) sentiments.hesitant++;
        if (text.match(/(good|great|awesome|love|like|enjoy)/)) sentiments.positive++;
        if (text.match(/(bad|hate|awful|terrible|struggle|hard)/)) sentiments.negative++;
    });

    // Adjust score based on confidence ratio
    if (sentiments.confident > sentiments.hesitant) {
        totalScore += 10; // Bonus for authoritative delivery
    } else if (sentiments.hesitant > sentiments.confident + 2) {
        totalScore -= 5;  // Slight penalty for excessive uncertainty
    }

    totalScore = Math.min(Math.round(totalScore), 99); // Max 99

    const strengths = [];
    const weaknesses = [];

    if (finalDifficulty >= 7) {
        strengths.push("Excellent use of advanced technical vocabulary and concepts.");
    } else {
        weaknesses.push(`Missed opportunities to utilize deep terminology related to ${domain}.`);
    }

    if (avgWords < 20) {
         weaknesses.push("Verbal explanations were too brief or lacked extensive systemic detail.");
    } else {
         strengths.push("Provided generous context and detailed explanations organically.");
    }

    if (sentiments.confident > sentiments.hesitant) {
         strengths.push("Displayed strong assertive communication and confidence in technical decisions.");
    } else if (sentiments.hesitant > 0) {
         weaknesses.push("Communication occasionally showed hesitation or uncertainty; practice delivering answers more assertively.");
    }

    let roadmap = "";
    const recommendations = [];

    if (isGibberish) {
         roadmap = `Your interview score was capped at ${totalScore} because your responses consistently lacked substantive technical vocabulary related to ${domain}. You must formulate actual architectural answers rather than conversational filler.`;
         recommendations.push(`Familiarize yourself with the core technical dictionary of ${domain}.`);
         recommendations.push("Avoid typing disjointed characters or overly brief conversational remarks.");
    } else if (totalScore > 80) {
         roadmap = `Your interview policy score of ${totalScore} indicates a High-Senior level state. Focus on system design and architectural team leadership for ${domain}.`;
         recommendations.push("Lead architectural discussions in your current role.");
         recommendations.push("Author a deep-dive technical blog post.");
    } else if (totalScore >= 60) {
         roadmap = `Your ${totalScore}/100 score indicates solid mid-level competence. Your next step is to master the underlying performance tradeoffs of ${domain}.`;
         recommendations.push("Study advanced technical tradeoffs and edge-case scaling.");
         if (sentiments.hesitant > 1) recommendations.push("Practice mock interviews to build verbal assertiveness.");
    } else {
         roadmap = `Your score of ${totalScore} suggests an entry-level technical grasp. Begin by building full-stack ${domain} applications without tutorials to aggressively build deep technical muscle memory.`;
         recommendations.push(`Build complex, unguided projects in ${domain}.`);
         recommendations.push("Master the core fundamentals of the technology stack.");
         if (sentiments.hesitant > 0) recommendations.push("Don't let hesitation hold you back; build projects to gain true confidence.");
    }

    return { score: totalScore, strengths, weaknesses, roadmap, recommendations };
};
