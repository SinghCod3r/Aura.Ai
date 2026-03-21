"use client";

import React, { useState } from 'react';
import { ArrowLeft, Brain, Code, Target, Sparkles, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AssessmentPage() {
    const [step, setStep] = useState(1);
    const totalSteps = 4; // Step 4 is the final preparation step

    // Form State
    const [domains, setDomains] = useState<string[]>([]);
    const [experience, setExperience] = useState("");
    const [goal, setGoal] = useState("");
    const [deepDiveAnswer, setDeepDiveAnswer] = useState("");

    // Result State
    const [result, setResult] = useState<any>(null);

    const toggleDomain = (domain: string) => {
        if (domains.includes(domain)) {
            setDomains(domains.filter(d => d !== domain));
        } else {
            if (domains.length < 3) {
                setDomains([...domains, domain]);
            } else {
                toast("You can select up to 3 domains max.", { icon: "📈" });
            }
        }
    };

    const startInterview = () => {
        // Store context in sessionStorage to pass to the interview page without DB
        sessionStorage.setItem("interviewContext", JSON.stringify({
            domains,
            experience,
            goal,
            deepDiveAnswer
        }));
        
        // Redirect to the interview page
        window.location.href = "/assessment/interview";
    };

    const handleGoalSelection = (selectedGoal: string) => {
        setGoal(selectedGoal);
        setStep(4);
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 mb-6">
                                <Code className="h-8 w-8" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                                Which areas interest you the most?
                            </h2>
                            <p className="text-slate-600 max-w-lg mx-auto">
                                Select the domains where you want to focus your career growth. (Select up to 3)
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                            {[
                                "Machine Learning", "Data Science", "Generative AI",
                                "Web Development", "Cloud Architecture", "Product Management",
                                "Mobile Development", "Cyber Security"
                            ].map((skill, i) => (
                                <label
                                    key={i}
                                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${domains.includes(skill) ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-indigo-300'}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={domains.includes(skill)}
                                        onChange={() => toggleDomain(skill)}
                                        className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-600 ml-2"
                                    />
                                    <span className="ml-4 font-medium text-slate-900">{skill}</span>
                                </label>
                            ))}
                        </div>

                        <div className="max-w-2xl mx-auto flex justify-end">
                            <Button
                                size="lg"
                                onClick={() => setStep(2)}
                                disabled={domains.length === 0}
                                className="w-full sm:w-auto font-semibold shadow-md shadow-indigo-600/20"
                            >
                                Continue <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 mb-6">
                                <Brain className="h-8 w-8" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                                What is your current experience level?
                            </h2>
                            <p className="text-slate-600 max-w-lg mx-auto">
                                Help our AI understand your baseline in {domains.length > 0 ? domains.join(', ') : 'Tech'} so we can calibrate the interview.
                            </p>
                        </div>

                        <div className="grid gap-4 max-w-2xl mx-auto">
                            {[
                                { title: "Beginner", desc: "Just starting out, learning the basics" },
                                { title: "Intermediate", desc: "1-3 years experience, comfortable with fundamentals" },
                                { title: "Advanced", desc: "3-5+ years, leading projects or teams" },
                                { title: "Expert", desc: "10+ years, deep domain expertise" }
                            ].map((option, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setExperience(option.title);
                                        setStep(3);
                                    }}
                                    className={`flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl border-2 transition-all group text-left w-full ${experience === option.title ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-indigo-300'}`}
                                >
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-1">{option.title}</h4>
                                        <p className="text-slate-500 text-sm">{option.desc}</p>
                                    </div>
                                    <ChevronRight className={`h-5 w-5 hidden md:block ${experience === option.title ? 'text-indigo-600' : 'text-slate-300 group-hover:text-indigo-400'}`} />
                                </button>
                            ))}
                        </div>
                        <div className="max-w-2xl mx-auto flex justify-end opacity-0 pointer-events-none">
                            <Button size="lg">Continue</Button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 mb-6">
                                <Target className="h-8 w-8" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                                What is your primary career goal right now?
                            </h2>
                        </div>

                        <div className="grid gap-4 max-w-2xl mx-auto">
                            {[
                                "Getting my first tech job",
                                "Transitioning to a new role (e.g., SWE to PM)",
                                "Getting promoted to a senior level",
                                "Starting my own tech company"
                            ].map((option, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleGoalSelection(option)}
                                    className="flex items-center p-6 rounded-2xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all text-left w-full group"
                                >
                                    <div className="flex-1">
                                        <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-900">{option}</h4>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-600" />
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 mb-6">
                                <Sparkles className="h-8 w-8" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                                Give us a bit more context
                            </h2>
                            <p className="text-slate-600 max-w-lg mx-auto">
                                What specific challenges are you currently facing in your journey towards `{goal}`?
                            </p>
                        </div>

                        <div className="max-w-2xl mx-auto">
                            <textarea
                                value={deepDiveAnswer}
                                onChange={(e) => setDeepDiveAnswer(e.target.value)}
                                placeholder="E.g., I'm struggling to understand system design for large scale apps, or I find it hard to crack the initial screening rounds..."
                                className="w-full h-40 p-4 rounded-2xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 resize-none transition-all outline-none"
                            />
                            
                            <div className="mt-8 flex justify-end">
                                <Button
                                    size="lg"
                                    onClick={startInterview}
                                    disabled={deepDiveAnswer.trim().length < 10}
                                    className="w-full sm:w-auto font-semibold shadow-lg shadow-indigo-600/20 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                                >
                                    Start AI Interview
                                </Button>
                            </div>
                            <p className="text-center text-sm text-slate-500 mt-4">
                                Ensure your webcam and microphone permissions are ready for the next step.
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const displayStepLabel = step;

    return (
        <div className="min-h-screen bg-slate-50/50 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Assessment Header */}
            <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-xl border-b border-indigo-100/50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => step > 1 && step < 4 ? setStep(step - 1) : window.history.back()}
                        className={`flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors ${step >= 4 ? 'opacity-0 pointer-events-none' : ''}`}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {step > 1 ? "Back" : "Exit"}
                    </button>

                    <div className={`flex items-center gap-2`}>
                        <span className="text-sm font-bold text-indigo-600">Step {displayStepLabel}</span>
                        <span className="text-sm font-medium text-slate-400">of 4</span>
                    </div>
                </div>
            </header>

            {/* Progress Bar */}
            <div className={`w-full bg-slate-100 h-1.5`}>
                <div
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-1.5 transition-all duration-700 ease-out"
                    style={{ width: `${(displayStepLabel / 4) * 100}%` }}
                />
            </div>

            {/* Main Content Area */}
            <main className="container mx-auto px-4 py-12 lg:py-20 relative">
                {/* Decorative background blurs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-400/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10">
                    {renderStepContent()}
                </div>
            </main>
        </div>
    );
}
