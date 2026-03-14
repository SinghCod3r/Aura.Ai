"use client";

import { useState } from "react";
import { Star, MapPin, Briefcase, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import CheckoutButton from "./CheckoutButton";

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
    const [isExpanded, setIsExpanded] = useState(false);

    const PRICING_TIERS = [
        {
            id: "svc_resume",
            name: "Resume Review",
            price: 99,
            originalPrice: 199,
            description: "Detailed feedback to get your resume ATS-ready and standing out."
        },
        {
            id: "svc_interview",
            name: "Interview Prep",
            price: 299,
            originalPrice: 499,
            description: "Mock interview session with actionable feedback on your answers."
        },
        {
            id: "svc_dsa",
            name: "DSA 1:1",
            price: 699,
            originalPrice: 999,
            description: "Intensive 1-on-1 pair programming and algorithm problem solving."
        }
    ];

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

            {/* Book Mentorship Button (Direct Access) */}
            <div className="mb-4">
                <CheckoutButton
                    mentorId={mentor.userId || mentor.id}
                    serviceId="svc_default_mentorship"
                    serviceName="1:1 Mentorship Session"
                    price={mentor.hourlyRate || 50}
                />
            </div>

            {/* Expand / Collapse Button */}
            <Button
                variant="outline"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors mb-2"
            >
                {isExpanded ? "Hide Other Services" : "View Services"}
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {/* Expanded Content: Pricing Tiers */}
            {isExpanded && (
                <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Available Services</h4>

                    {PRICING_TIERS.map((tier) => (
                        <div key={tier.id} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-bold text-slate-900">{tier.name}</p>
                                    <p className="text-xs text-slate-600 mt-1">{tier.description}</p>
                                </div>
                                <div className="text-right ml-4 flex-shrink-0">
                                    <p className="text-xs text-slate-500 line-through">₹{tier.originalPrice}</p>
                                    <p className="text-lg font-extrabold text-indigo-600">₹{tier.price}</p>
                                </div>
                            </div>
                            <div className="mt-3">
                                <CheckoutButton
                                    mentorId={mentor.userId || mentor.id}
                                    serviceId={tier.id}
                                    serviceName={tier.name}
                                    price={tier.price}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
