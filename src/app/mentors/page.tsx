import React from 'react';
import { Search, Filter, Star, MapPin, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import connectToDatabase from '@/lib/mongoose';
import { User, MentorProfile, DUMMY_MENTORS } from '@/models';
import MentorCard from './MentorCard';

export default async function MentorsPage() {
    await connectToDatabase();

    // Fetch only approved mentor profiles and their associated User docs
    const mentorProfiles = await MentorProfile.find({ isApproved: true }).populate({
        path: 'userId', // Changed from user to userId based on the schema
        model: User
    }).lean();

    // Map DB data to match the UI shape
    let mentors = mentorProfiles.map((p: any) => {
        const user = p.userId;
        return {
            id: p._id.toString(),
            userId: user?._id?.toString(),
            name: user?.name || "Unknown Mentor",
            role: p.designation || "AI Mentor",
            company: p.company || "Independent",
            location: "Remote", // Defaulting to remote for now
            rating: p.averageRating || 5.0,
            reviews: p.totalReviews || 0,
            skills: p.expertise || [],
            image: "bg-indigo-600",
            hourlyRate: p.hourlyRate || 50
        };
    });

    // Use dummy mentors if none are found in the DB
    if (mentors.length === 0) {
        mentors = DUMMY_MENTORS.map(m => ({
            ...m,
            userId: m.id, // For dummy data, use same ID
            skills: m.expertise // Explicitly map expertise to skills
        }));
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 lg:py-20">
            <div className="container mx-auto px-4 md:px-6">

                {/* Header Section */}
                <div className="max-w-3xl mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-6">
                        Find Your Perfect <span className="text-indigo-600">Mentor</span>
                    </h1>
                    <p className="text-lg text-slate-600">
                        Connect with industry experts who can guide your career journey. Our mentors are experienced professionals ready to share their knowledge and help you succeed.
                    </p>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-12 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, role, or company..."
                            className="w-full pl-10 pr-4 py-2 bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-400"
                        />
                    </div>
                    <div className="h-px w-full sm:h-auto sm:w-px bg-slate-200" />
                    <Button variant="ghost" className="text-slate-600 font-medium">
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                    </Button>
                </div>

                {/* Mentor Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mentors.map((mentor) => (
                        <MentorCard key={mentor.id} mentor={mentor} />
                    ))}
                    {mentors.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500">
                            No mentors available yet. Check back soon!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
