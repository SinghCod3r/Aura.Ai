import React from 'react';
import { Bot, Users, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ServicesPage() {
    const services = [
        {
            id: "assessment",
            icon: <Bot className="h-8 w-8" />,
            title: "AI Career Assessment",
            description: "Take our in-depth test to discover your ideal AI career path based on your skills and interests.",
            features: [
                "Personalized skill gap analysis",
                "Role-matching algorithm",
                "Actionable learning roadmap",
                "Industry salary insights"
            ],
            link: "/assessment",
            popular: false
        },
        {
            id: "mentorship",
            icon: <Users className="h-8 w-8" />,
            title: "1:1 Mentorship",
            description: "Get personalized guidance from industry veterans who have walked the path you want to take.",
            features: [
                "Weekly 45-minute video calls",
                "Unlimited chat support",
                "Mock interviews & feedback",
                "Project architecture reviews"
            ],
            link: "/mentors",
            popular: true
        },
        {
            id: "resume",
            icon: <FileText className="h-8 w-8" />,
            title: "Resume & Portfolio Review",
            description: "Have an expert review your resume and portfolio to ensure you stand out to top employers.",
            features: [
                "ATS optimization strategies",
                "Project highlighting",
                "GitHub profile review",
                "Cover letter templates"
            ],
            link: "/contact",
            popular: false
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-16 lg:py-24">
            <div className="container mx-auto px-4 md:px-6">

                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-6">
                        Accelerate Your <span className="text-indigo-600">Career</span>
                    </h1>
                    <p className="text-lg text-slate-600">
                        Discover how Aura.Ai can help you reach your professional goals faster with our specialized offerings and AI-driven insights.
                    </p>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className={`relative flex flex-col bg-white rounded-3xl p-8 transition-transform hover:-translate-y-1 duration-300 ${service.popular
                                    ? "border-2 border-indigo-600 shadow-xl shadow-indigo-600/10"
                                    : "border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md"
                                }`}
                        >
                            {service.popular && (
                                <div className="absolute top-0 right-8 -translate-y-1/2">
                                    <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-8">
                                <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-6 ${service.popular ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "bg-indigo-50 text-indigo-600"
                                    }`}>
                                    {service.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h3>
                                <p className="text-slate-600 leading-relaxed min-h-[80px]">
                                    {service.description}
                                </p>
                            </div>

                            <div className="flex-1 space-y-4 mb-8">
                                {service.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start">
                                        <CheckCircle2 className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${service.popular ? "text-indigo-600" : "text-green-500"
                                            }`} />
                                        <span className="text-slate-600">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto">
                                <Link href={service.link}>
                                    <Button
                                        size="lg"
                                        variant={service.popular ? "default" : "outline"}
                                        className={`w-full h-12 font-semibold group ${service.popular ? "shadow-md shadow-indigo-600/20" : ""
                                            }`}
                                    >
                                        Get Started
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Enterprise CTA */}
                <div className="max-w-4xl mx-auto mt-20 bg-indigo-900 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900" />
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-white mb-4">Looking for Team Solutions?</h3>
                        <p className="text-indigo-200 mb-8 max-w-2xl mx-auto">
                            We offer customized upskilling and mentorship programs for forward-thinking engineering teams.
                        </p>
                        <Link href="/contact">
                            <Button variant="outline" className="bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white font-semibold px-8 h-12">
                                Contact Enterprise Sales
                            </Button>
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
