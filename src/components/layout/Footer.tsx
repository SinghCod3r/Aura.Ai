import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Footer() {
    return (
        <footer className="relative border-t border-slate-200/60 bg-slate-50 overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="container relative mx-auto px-4 md:px-6 py-16">
                <div className="grid gap-12 md:grid-cols-4 lg:gap-8">
                    <div className="space-y-4 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 group w-fit">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900">Aura<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">.Ai</span></span>
                        </Link>
                        <p className="text-sm leading-relaxed text-slate-500 max-w-xs">
                            AI-driven career roadmaps and elite 1:1 mentorship to help you land your dream job with absolute confidence.
                        </p>
                    </div>
                    <div>
                        <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-slate-900">Platform</h3>
                        <ul className="space-y-3 test-sm font-medium text-slate-500">
                            <li><Link href="/assessment" className="hover:text-indigo-600 transition-colors block w-fit">AI Career Assessment</Link></li>
                            <li><Link href="/mentors" className="hover:text-indigo-600 transition-colors block w-fit">Browse Mentors</Link></li>
                            <li><Link href="/services" className="hover:text-indigo-600 transition-colors block w-fit">Services & Pricing</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-slate-900">Company</h3>
                        <ul className="space-y-3 text-sm font-medium text-slate-500">
                            <li><Link href="/about" className="hover:text-indigo-600 transition-colors block w-fit">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-indigo-600 transition-colors block w-fit">Contact</Link></li>
                            <li><Link href="/privacy" className="hover:text-indigo-600 transition-colors block w-fit">Privacy Policy</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-slate-900">Connect</h3>
                        <ul className="space-y-3 text-sm font-medium text-slate-500">
                            <li><a href="#" className="hover:text-indigo-600 transition-colors block w-fit">Twitter</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors block w-fit">LinkedIn</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors block w-fit">Discord Community</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-16 border-t border-slate-200/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium text-slate-400">
                    <p>© {new Date().getFullYear()} Aura.Ai Platform. All rights reserved.</p>
                    <div className="flex gap-4">
                        <span className="text-slate-300">Made with Aura.Ai</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
