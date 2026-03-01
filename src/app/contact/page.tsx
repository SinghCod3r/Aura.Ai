"use client";

import React, { useState } from "react";
import { Mail, MessageSquare, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-16 lg:py-24">
            <div className="container mx-auto px-4 md:px-6">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-6">
                        Get in Touch
                    </h1>
                    <p className="text-lg text-slate-600">
                        Have questions about our AI assessment, mentorship program, or anything else?
                        Our team is here to help you navigate your career journey.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">

                    {/* Contact Info Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-6">
                                <Mail className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Email Us</h3>
                            <p className="text-slate-600 mb-4">Our friendly team is here to help.</p>
                            <a href="mailto:hello@aura.ai" className="text-indigo-600 font-semibold hover:underline">hello@aura.ai</a>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-6">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Live Chat</h3>
                            <p className="text-slate-600 mb-4">Chat with our support team.</p>
                            <button className="text-indigo-600 font-semibold hover:underline">Start a chat</button>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 lg:p-12">
                        {isSubmitted ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-6">
                                    <Send className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">Message Sent!</h3>
                                <p className="text-slate-600 mb-8 max-w-md">
                                    Thank you for reaching out. A member of our team will get back to you within 24 hours.
                                </p>
                                <Button onClick={() => setIsSubmitted(false)} variant="outline">
                                    Send another message
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="first-name" className="text-sm font-medium text-slate-900">First Name</label>
                                        <input
                                            type="text"
                                            id="first-name"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="last-name" className="text-sm font-medium text-slate-900">Last Name</label>
                                        <input
                                            type="text"
                                            id="last-name"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-slate-900">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium text-slate-900">Message</label>
                                    <textarea
                                        id="message"
                                        required
                                        rows={5}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all resize-none"
                                        placeholder="How can we help you?"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-12 text-base font-semibold"
                                >
                                    {isSubmitting ? "Sending..." : "Send Message"}
                                </Button>
                            </form>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
