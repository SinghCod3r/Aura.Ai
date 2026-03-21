"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, TrendingUp, AlertCircle, Sparkles, ChevronRight, BarChart3, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function ReportContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            window.location.href = "/assessment";
            return;
        }

        const fetchReport = async () => {
            const fallbackDataStr = sessionStorage.getItem("fallbackReport");
            let fallbackData = null;
            if (fallbackDataStr) {
                 try { fallbackData = JSON.parse(fallbackDataStr); } catch (e) {}
            }

            if (id.startsWith("fallback-") && fallbackData) {
                 setReport(fallbackData);
                 setLoading(false);
                 return;
            }

            try {
                const res = await fetch(`/api/assessment/${id}`);
                const data = await res.json();
                
                if (data.success) {
                    setReport(data.report);
                } else if (fallbackData) {
                    setReport(fallbackData);
                }
            } catch (err) {
                console.error("Failed to fetch from DB, using fallback if available:", err);
                if (fallbackData) {
                     setReport(fallbackData);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600 font-medium animate-pulse">Loading your custom evaluation...</p>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-4">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Report Not Found</h2>
                <p className="text-slate-600 mb-6">We couldn't locate your assessment results.</p>
                <Link href="/assessment">
                    <Button>Return to Assessment</Button>
                </Link>
            </div>
        );
    }

    const score = report.skillGap?.overallScore || 0;

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
                <div className="container mx-auto px-4 h-16 flex items-center">
                    <Link href="/dashboard" className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-5xl">
                
                <div className="text-center mb-12 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6 shadow-inner ring-8 ring-emerald-50">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
                        AI Interview Evaluation
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Here is the deep-dive analysis of your technical interview. Use these insights to target your weaknesses and accelerate your career.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animate-in slide-in-from-bottom-8 duration-700">
                    {/* Score Card */}
                    <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                            <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
                            Overall Score
                        </h3>
                        <div className="relative flex items-center justify-center">
                            <svg className="w-40 h-40 transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-indigo-600" strokeDasharray="440" strokeDashoffset={440 - (440 * score) / 100} strokeLinecap="round" />
                            </svg>
                            <span className="absolute text-5xl font-black text-slate-900">{score}</span>
                        </div>
                        <p className="mt-6 text-slate-600 text-center text-sm font-medium">Out of 100 benchmarked against industry standards.</p>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {/* Strengths */}
                        <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
                            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 text-emerald-600">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">
                                Core Strengths
                            </h3>
                            <ul className="space-y-4">
                                {report.skillGap?.strengths?.map((item: string, i: number) => (
                                    <li key={i} className="flex items-start">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                                        <span className="text-slate-600 font-medium leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
                            <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center mb-4 text-rose-600">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">
                                Areas for Improvement
                            </h3>
                            <ul className="space-y-4">
                                {report.skillGap?.weaknesses?.map((item: string, i: number) => (
                                    <li key={i} className="flex items-start">
                                        <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                        </div>
                                        <span className="text-slate-600 font-medium leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Target Path / Roadmap */}
                <div className="rounded-2xl bg-white p-8 md:p-12 shadow-sm border border-indigo-100 animate-in slide-in-from-bottom-10 duration-1000 mb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    
                    <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-6 text-indigo-600">
                        <BrainCircuit className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-6 relative z-10">
                        Your Personalized Growth Roadmap
                    </h3>
                    
                    <p className="text-slate-600 mb-10 text-lg leading-relaxed border-l-4 border-indigo-200 pl-6 py-2 relative z-10">
                        {report.roadmap}
                    </p>

                    <div className="relative z-10 bg-slate-50 border border-slate-100 rounded-xl p-6 sm:p-8">
                        <h4 className="font-bold text-slate-900 uppercase tracking-wider text-sm mb-6 flex items-center">
                            <Sparkles className="h-4 w-4 mr-2 text-indigo-500" /> Recommended Next Steps
                        </h4>
                        <ul className="space-y-4 text-slate-600">
                            {report.recommendations?.map((rec: string, i: number) => (
                                <li key={i} className="flex items-start group">
                                    <div className="bg-white rounded-full p-1.5 mr-4 mt-0.5 shadow-sm border border-slate-200">
                                        <ChevronRight className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <span className="text-lg font-medium">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in duration-1000 delay-300">
                    <Link href="/dashboard">
                        <Button size="lg" className="w-full sm:w-auto font-semibold gap-2 shadow-indigo-600/20 shadow-lg">
                            View on Dashboard
                        </Button>
                    </Link>
                    <Link href="/mentors">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold bg-white">
                            Browse Matching Mentors
                        </Button>
                    </Link>
                </div>

            </main>
        </div>
    );
}

export default function ReportPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600 font-medium animate-pulse">Loading report context...</p>
            </div>
        }>
            <ReportContent />
        </Suspense>
    );
}
