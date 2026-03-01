import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, LayoutDashboard } from "lucide-react";
import { UserButton, SignInButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongoose";
import { User } from "@/models";

export default async function Navbar() {
    const clerkUser = await currentUser();
    let dbUser = null;

    if (clerkUser) {
        await connectToDatabase();
        dbUser = await User.findOne({ clerkId: clerkUser.id });
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-indigo-500/10 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/40">
            <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 relative">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">
                            Aura<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">.Ai</span>
                        </span>
                    </Link>
                </div>
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                    <Link href="/#how-it-works" className="relative hover:text-indigo-600 transition-colors py-2 group">
                        How it Works
                        <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full"></span>
                    </Link>
                    <Link href="/mentors" className="relative hover:text-indigo-600 transition-colors py-2 group">
                        Find a Mentor
                        <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full"></span>
                    </Link>
                    <Link href="/services" className="relative hover:text-indigo-600 transition-colors py-2 group">
                        Services
                        <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full"></span>
                    </Link>
                </nav>
                <div className="flex items-center gap-4">
                    {clerkUser ? (
                        <>
                            {/* Logged In State */}
                            {dbUser && (
                                <div className="hidden sm:flex items-center gap-3 mr-2">
                                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
                                        <span className="text-sm font-medium text-slate-700">
                                            {dbUser.name || dbUser.email.split('@')[0]}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-full ml-1">
                                            {dbUser.role}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <Link href="/dashboard">
                                <Button variant="ghost" size="icon" className="text-slate-600 hover:text-indigo-600" title="Dashboard">
                                    <LayoutDashboard className="h-5 w-5" />
                                </Button>
                            </Link>

                            <UserButton afterSignOutUrl="/" />
                        </>
                    ) : (
                        <>
                            {/* Logged Out State */}
                            <SignInButton mode="modal">
                                <Button variant="ghost" className="hidden sm:inline-block font-semibold">Sign In</Button>
                            </SignInButton>
                            <Link href="/assessment">
                                <Button className="font-semibold shadow-md shadow-indigo-600/20">
                                    Take Free Test
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
