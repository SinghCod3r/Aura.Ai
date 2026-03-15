import React from "react";
import { Star, MapPin, Briefcase, ArrowLeft } from "lucide-react";
import Link from "next/link";
import connectToDatabase from "@/lib/mongoose";
import { User, MentorProfile, DUMMY_MENTORS, Service } from "@/models";
import BookingForm from "./BookingForm";
import { notFound } from "next/navigation";
import mongoose from "mongoose";

// Hardcoded fallback services when mentor has no DB services
const FALLBACK_SERVICES = [
    {
        id: "svc_resume",
        title: "Resume Review",
        price: 99,
        originalPrice: 199,
        description: "Detailed feedback to get your resume ATS-ready and standing out.",
        durationMins: 30,
    },
    {
        id: "svc_interview",
        title: "Interview Prep",
        price: 299,
        originalPrice: 499,
        description: "Mock interview session with actionable feedback on your answers.",
        durationMins: 45,
    },
    {
        id: "svc_dsa",
        title: "DSA 1:1",
        price: 699,
        originalPrice: 999,
        description: "Intensive 1-on-1 pair programming and algorithm problem solving.",
        durationMins: 60,
    },
];

export default async function MentorProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    await connectToDatabase();
    const { id } = await params;

    let mentor: any = null;
    let services: any[] = [];
    let isDummy = false;

    // Try to find mentor in DB first
    if (mongoose.Types.ObjectId.isValid(id)) {
        const profile = await MentorProfile.findById(id)
            .populate({ path: "userId", model: User })
            .lean();

        if (profile) {
            const user = profile.userId as any;
            mentor = {
                id: (profile._id as any).toString(),
                userId: user?._id?.toString(),
                name: user?.name || "Unknown Mentor",
                role: profile.designation || "AI Mentor",
                company: profile.company || "Independent",
                location: "Remote",
                rating: profile.averageRating || 5.0,
                reviews: profile.totalReviews || 0,
                skills: profile.expertise || [],
                image: "bg-indigo-600",
                hourlyRate: profile.hourlyRate || 50,
                bio: profile.bio || "",
            };

            // Fetch real services from DB
            const dbServices = await Service.find({
                mentorProfileId: profile._id,
                isActive: true,
            }).lean();

            services = dbServices.map((s: any) => ({
                id: s._id.toString(),
                title: s.title,
                price: s.price,
                description: s.description,
                durationMins: s.durationMins,
            }));
        }
    }

    // If not found in DB, check dummy mentors
    if (!mentor) {
        const dummy = DUMMY_MENTORS.find((m) => m.id === id);
        if (dummy) {
            isDummy = true;
            mentor = {
                ...dummy,
                userId: dummy.id,
                skills: dummy.expertise,
            };
        }
    }

    if (!mentor) {
        notFound();
    }

    // Use fallback services if none found in DB
    if (services.length === 0) {
        services = FALLBACK_SERVICES;
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 lg:py-20">
            <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                {/* Back Button */}
                <Link
                    href="/mentors"
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-8 group"
                >
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to All Mentors
                </Link>

                {/* Mentor Profile Header */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm mb-8">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <div
                            className={`w-20 h-20 rounded-full flex-shrink-0 ${mentor.image} flex items-center justify-center text-white text-3xl font-bold shadow-lg`}
                        >
                            {mentor.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                                {mentor.name}
                            </h1>
                            <p className="text-lg font-medium text-slate-600 mb-4">
                                {mentor.role}
                            </p>

                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 mb-4">
                                <div className="flex items-center">
                                    <Briefcase className="mr-2 h-4 w-4 text-indigo-400" />
                                    {mentor.company}
                                </div>
                                <div className="flex items-center">
                                    <MapPin className="mr-2 h-4 w-4 text-indigo-400" />
                                    {mentor.location}
                                </div>
                                <div className="flex items-center">
                                    <Star className="mr-2 h-4 w-4 text-amber-500 fill-amber-500" />
                                    <span className="font-semibold text-slate-900 mr-1">
                                        {mentor.rating}
                                    </span>
                                    ({mentor.reviews} reviews)
                                </div>
                            </div>

                            {mentor.bio && (
                                <p className="text-slate-600 leading-relaxed">
                                    {mentor.bio}
                                </p>
                            )}

                            {/* Skills Tags */}
                            <div className="flex flex-wrap gap-2 mt-4">
                                {mentor.skills?.map((skill: string) => (
                                    <span
                                        key={skill}
                                        className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Section */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">
                        Book a Session
                    </h2>
                    <BookingForm
                        mentorId={mentor.userId || mentor.id}
                        services={services}
                        hourlyRate={mentor.hourlyRate}
                        isDummy={isDummy}
                    />
                </div>
            </div>
        </div>
    );
}
