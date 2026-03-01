import React from "react";
import { Sparkles, Users, Award, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-slate-900 py-24 lg:py-32">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-transparent to-transparent" />
                    <div className="absolute top-0 right-0 h-96 w-96 translate-x-1/3 -translate-y-1/3 rounded-full bg-indigo-500/20 blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-96 w-96 -translate-x-1/3 translate-y-1/3 rounded-full bg-indigo-600/20 blur-3xl" />
                </div>
                <div className="container relative z-10 mx-auto px-4 md:px-6">
                    <div className="max-w-3xl text-center mx-auto">
                        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl mb-6">
                            Empowering Careers with <span className="text-indigo-400">AI Innovation</span>
                        </h1>
                        <p className="text-lg text-slate-300 md:text-xl/relaxed">
                            At Aura.Ai, we believe that navigating your career shouldn&apos;t be a shot in the dark.
                            We&apos;re building the future of professional development by combining artificial intelligence
                            with human expertise.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="py-20 lg:py-28 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 mb-2">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Our Mission</h2>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                To democratize expert career guidance. We leverage cutting-edge AI to provide personalized assessments,
                                and connect ambitious individuals with world-class mentors who can accelerate their growth.
                                Your potential is limitless; we just provide the roadmap.
                            </p>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-indigo-100 to-indigo-50 blur-xl opacity-50" />
                            <div className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                                <div className="grid gap-6">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 mt-1">
                                            <Users className="h-6 w-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-semibold text-slate-900 mb-2">Community First</h4>
                                            <p className="text-slate-600">Building a network of lifelong learners and industry veterans.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 mt-1">
                                            <Award className="h-6 w-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-semibold text-slate-900 mb-2">Excellence</h4>
                                            <p className="text-slate-600">Vetting only the top 1% of mentors to ensure highest quality guidance.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 mt-1">
                                            <Zap className="h-6 w-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-semibold text-slate-900 mb-2">Innovation</h4>
                                            <p className="text-slate-600">Continuously refining our AI models to provide the most accurate career insights.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-slate-50 border-t border-slate-200">
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
                        Ready to Accelerate Your Career?
                    </h2>
                    <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                        Join thousands of professionals who have already discovered their ideal career path and connected with their perfect mentor.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/assessment">
                            <Button size="lg" className="w-full sm:w-auto h-12 px-8 font-semibold shadow-md shadow-indigo-600/20">
                                Take Assessment
                            </Button>
                        </Link>
                        <Link href="/mentors">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 font-semibold">
                                Browse Mentors
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
