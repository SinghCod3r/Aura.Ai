"use client";

import React, { useState } from 'react';
import { ArrowLeft, Brain, Code, Target, Sparkles, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AssessmentPage() {
    const [step, setStep] = useState(1);

    // Form State
    const [experience, setExperience] = useState("");
    const [domains, setDomains] = useState<string[]>([]);

    // Result State
    const [result, setResult] = useState<{ roadmap: string; recommendations: string[] } | null>(null);

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

    const submitAssessment = async (finalGoal: string) => {
        setStep(4); // Move to Loading step immediately

        try {
            const res = await fetch("/api/assessment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    experience,
                    domains,
                    goal: finalGoal,
                    score: 85 // Arbitrary starting score for the MVP
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to generate roadmap");
            }

            // Simulate AI reading time for effect before showing results
            setTimeout(() => {
                setResult(data);
                setStep(5);
            }, 2500);

        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred");
            // Revert back so they can try again if auth fails
            setStep(3);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 mb-6">
                                <Brain className="h-8 w-8" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                                What is your current experience level in Tech?
                            </h2>
                            <p className="text-slate-600 max-w-lg mx-auto">
                                Help our AI understand your baseline so we can provide the most relevant career roadmap.
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
                                        setStep(2);
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
            case 2:
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
                                onClick={() => setStep(3)}
                                disabled={domains.length === 0}
                                className="w-full sm:w-auto font-semibold shadow-md shadow-indigo-600/20"
                            >
                                Continue <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
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
                                    onClick={() => submitAssessment(option)}
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
                    <div className="space-y-8 animate-in zoom-in-95 duration-500 text-center max-w-2xl mx-auto py-20 flex flex-col items-center justify-center">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full"></div>
                            <Loader2 className="h-20 w-20 text-indigo-600 animate-spin relative z-10" />
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-4">
                            Analyzing your profile...
                        </h2>
                        <p className="text-lg text-slate-500 max-w-md mx-auto">
                            Our AI is referencing thousands of industry career paths to build your exact personalized roadmap.
                        </p>
                    </div>
                );
            case 5:
                if (!result) return null;

                return (
                    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 text-center max-w-3xl mx-auto py-8">
                        <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6 shadow-inner ring-8 ring-emerald-50">
                            <CheckCircle2 className="h-12 w-12" />
                        </div>
                        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
                            Assessment Complete!
                        </h2>
                        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                            We&apos;ve processed your {experience.toLowerCase()} level experience focusing on {domains.join(" and ")} to map out your shortest path to success.
                        </p>

                        <div className="bg-white p-8 rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-500/5 mb-8 text-left relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>

                            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                                <Sparkles className="h-6 w-6 text-indigo-600 mr-3" />
                                Your Dynamic Target Path
                            </h3>
                            <p className="text-slate-600 mb-8 text-lg leading-relaxed border-l-4 border-indigo-200 pl-4 py-1">
                                {result.roadmap}
                            </p>

                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-sm">Recommended Next Steps</h4>
                                <ul className="space-y-3 text-slate-600 mb-6">
                                    {result.recommendations.map((rec: string, i: number) => (
                                        <li key={i} className="flex items-start">
                                            <div className="bg-indigo-100 rounded-full p-1 mr-3 mt-0.5">
                                                <ChevronRight className="h-4 w-4 text-indigo-700" />
                                            </div>
                                            <span className="font-medium">{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <Link href="/dashboard" className="w-full">
                                <Button size="lg" className="w-full text-base h-14 font-bold shadow-lg shadow-indigo-600/20 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 transition-all">
                                    View on Dashboard
                                </Button>
                            </Link>
                            <Link href="/mentors" className="w-full">
                                <Button size="lg" variant="outline" className="w-full text-base h-14 border-2 border-slate-200 hover:bg-slate-50 transition-colors font-semibold">
                                    Browse Matching Mentors
                                </Button>
                            </Link>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const displayStepLabel = step < 4 ? step : 3; // Cap visually at 3

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

                    <div className={`flex items-center gap-2 ${step >= 4 ? 'opacity-0' : ''}`}>
                        <span className="text-sm font-bold text-indigo-600">Step {displayStepLabel}</span>
                        <span className="text-sm font-medium text-slate-400">of 3</span>
                    </div>
                </div>
            </header>

            {/* Progress Bar */}
            <div className={`w-full bg-slate-100 h-1.5 ${step >= 4 ? 'opacity-0' : ''}`}>
                <div
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-1.5 transition-all duration-700 ease-out"
                    style={{ width: `${(displayStepLabel / 3) * 100}%` }}
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
