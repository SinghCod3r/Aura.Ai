"use client";

import { Star, MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Mentor {
    id: string;
    userId: string;
    name: string;
    role: string;
    company: string;
    location: string;
    rating: number;
    reviews: number;
    skills: string[];
    image: string;
    hourlyRate: number;
}

export default function MentorCard({ mentor }: { mentor: Mentor }) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 transition-all duration-300 group flex flex-col">

            {/* Profile Header */}
            <div className="flex items-start gap-4 mb-6">
                <div className={`w-16 h-16 rounded-full flex-shrink-0 ${mentor.image} flex items-center justify-center text-white text-2xl font-bold shadow-inner`}>
                    {mentor.name.charAt(0)}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {mentor.name}
                    </h3>
                    <p className="text-sm font-medium text-slate-600">{mentor.role}</p>
                </div>
            </div>

            {/* Info Details */}
            <div className="space-y-3 flex-1 mb-6">
                <div className="flex items-center text-slate-600 text-sm">
                    <Briefcase className="mr-2 h-4 w-4 text-indigo-400" />
                    {mentor.company}
                </div>
                <div className="flex items-center text-slate-600 text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-indigo-400" />
                    {mentor.location}
                </div>
                <div className="flex items-center text-slate-600 text-sm">
                    <Star className="mr-2 h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="font-semibold text-slate-900 mr-1">{mentor.rating}</span>
                    ({mentor.reviews} reviews)
                </div>
            </div>

            {/* Skills Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
                {mentor.skills?.map((skill: string) => (
                    <span key={skill} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md">
                        {skill}
                    </span>
                ))}
            </div>

            {/* View Profile Button */}
            <div className="mt-auto">
                <Button asChild className="w-full font-semibold shadow-md shadow-indigo-600/10">
                    <Link href={`/mentors/${mentor.id || mentor.userId}`}>
                        View Profile & Book
                    </Link>
                </Button>
            </div>
        </div>
    );
}

