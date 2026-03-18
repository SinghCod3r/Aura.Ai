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
        return `Welcome to the technical screening. Walk me through the high-level architecture you would prioritize for a modern ${state.domain} project and why.`;
    }

    // Policy: User is asking for clarification/rephrasing
    // We cast it to any here to satisfy the interface if we haven't strictly added it yet, but theoretically the state object should carry it.
    if ((state as any).intent === 'clarification') {
        return `No problem, let me rephrase. I'm asking about your practical experience with ${pivotWord}. Tell me about a specific time you had to use it in a project, and what challenges you faced.`;
    }

    // Policy: User gave a very short answer
    if (state.lastAnswerWords < 15) {
        return `I need more specific detail than that. Give me a concrete technical example of a time you applied the concept of ${pivotWord} in a real project.`;
    }

    // Policy: High Difficulty Level Reached (Stress Test Action)
    if (state.difficultyMultiplier >= 7) {
        const stressActions = [
            `You brought up '${pivotWord}'. Let's assume production traffic suddenly 10x's and that specific part fails catastrophically. How do you architect a resilient fallback?`,
            `I understand your standard approach to ${pivotWord}. However, if I cut your compute budget by 50%, how would you optimize that implementation to survive?`,
            `Explain the exact low-level tradeoffs between your approach to ${pivotWord} versus standard deterministic models?`
        ];
        return stressActions[Math.floor(Math.random() * stressActions.length)];
    }

    // Policy: Low/Medium Difficulty Level (Exploration Action)
    if (state.difficultyMultiplier < 4) {
        const exploreActions = [
            `Okay, let's talk more broadly about ${pivotWord}. What common mistakes do beginners make when setting that up?`,
            `In your experience, what is the biggest advantage of using ${pivotWord} in ${state.domain}?`,
            `Could you explain the purpose of ${pivotWord} as if I were a junior developer?`
        ];
        return exploreActions[Math.floor(Math.random() * exploreActions.length)];
    }

    // Policy: Standard Progression (Mid-Level Contextual)
    const standardActions = [
        `Interesting choice regarding ${pivotWord}. Can you describe a scenario where that specific approach backfired or didn't scale well?`,
        `How do you typically handle edge cases when dealing with the implementation of ${pivotWord}?`,
        `How do you measure the performance impact of your solutions involving ${pivotWord} once deployed?`
    ];
    
    return standardActions[Math.floor(Math.random() * standardActions.length)];
};

// 3. FINAL EVALUATION POLICY
export const evaluateSessionPolicy = (history: any[], domain: string, finalDifficulty: number) => {
    let totalScore = 50; // Base score
    
    // Factor 1: The peak technical depth reached (Difficulty represents RL Reward max)
    const peakBonus = (finalDifficulty / 10) * 30; // Up to 30 points for reaching hard questions
    totalScore += peakBonus;

    // Factor 2: Verbal Fluency
    let totalWords = 0;
    history.forEach((h: any) => totalWords += h.answer.split(' ').length);
    const avgWords = history.length > 0 ? (totalWords / history.length) : 0;
    
    if (avgWords > 40) totalScore += 15;
    else if (avgWords > 20) totalScore += 5;
    
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

    let roadmap = "";
    const recommendations = [];

    if (totalScore > 80) {
         roadmap = `Your interview policy score of ${totalScore} indicates a High-Senior level state. Focus on system design and architectural team leadership for ${domain}.`;
         recommendations.push("Lead architectural discussions in your current role.");
         recommendations.push("Author a deep-dive technical blog post.");
    } else if (totalScore >= 60) {
         roadmap = `Your ${totalScore}/100 score indicates solid mid-level competence. Your next step is to master the underlying performance tradeoffs of ${domain}.`;
         recommendations.push("Study advanced technical tradeoffs and edge-case scaling.");
         recommendations.push("Conduct mock interviews focused exclusively on System Design.");
    } else {
         roadmap = `Your score of ${totalScore} suggests an entry-level technical grasp. Begin by building 3 full-stack ${domain} applications without tutorials to aggressively build deep technical muscle memory.`;
         recommendations.push(`Build complex, unguided projects in ${domain}.`);
         recommendations.push("Master the core fundamentals of the technology stack.");
    }

    return { score: totalScore, strengths, weaknesses, roadmap, recommendations };
};
