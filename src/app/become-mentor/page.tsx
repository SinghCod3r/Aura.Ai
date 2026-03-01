import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongoose";
import { User } from "@/models";
import { Briefcase, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function BecomeMentorPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
        redirect("/sign-in");
    }

    if (user.role === "MENTOR" || user.role === "ADMIN") {
        return (
            <div className="min-h-screen bg-slate-50 py-20 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md text-center">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">You&apos;re already a Mentor!</h2>
                    <p className="text-slate-600 mb-8">Your account is fully upgraded. Head over to your dashboard to manage your sessions.</p>
                    <a href="/dashboard">
                        <Button className="w-full">Go to Dashboard</Button>
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 lg:py-20">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
                        <Briefcase className="w-8 h-8 -rotate-12" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mb-4">Become a Mentor</h1>
                    <p className="text-lg text-slate-600">Share your expertise and guide the next generation of AI professionals.</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                    <form action="/api/mentors/apply" method="POST" className="space-y-6">
                        {/* We use a traditional form action for simplicity in this demo, but could easily be a Client Component using fetch */}

                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-1">Current Company</label>
                            <input
                                type="text"
                                id="company"
                                name="company"
                                required
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-shadow"
                                placeholder="e.g. Google, OpenAI, Startup Inc."
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">Job Role</label>
                            <input
                                type="text"
                                id="role"
                                name="role"
                                required
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-shadow"
                                placeholder="e.g. Senior ML Engineer, Data Scientist"
                            />
                        </div>

                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">Professional Bio</label>
                            <textarea
                                id="bio"
                                name="bio"
                                rows={4}
                                required
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-shadow resize-none"
                                placeholder="Tell mentees about your experience and what you can help them with..."
                            />
                        </div>

                        <div>
                            <label htmlFor="skills" className="block text-sm font-medium text-slate-700 mb-1">Key Skills (comma separated)</label>
                            <input
                                type="text"
                                id="skills"
                                name="skills"
                                required
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-shadow"
                                placeholder="e.g. Python, PyTorch, System Design, Career Advice"
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <Button type="submit" className="w-full text-lg py-6 font-bold shadow-md shadow-indigo-600/20">
                                Submit Application
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
