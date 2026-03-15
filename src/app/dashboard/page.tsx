import React from 'react';
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongoose';
import { User, Booking, MentorProfile, AssessmentResult, Payment } from '@/models';
import { GraduationCap, Briefcase, Settings, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ReceiptButton from './ReceiptGenerator';

export default async function DashboardPage() {
    const clerkUser = await currentUser();

    if (!clerkUser) {
        redirect('/sign-in');
    }

    await connectToDatabase();

    let user = await User.findOne({ clerkId: clerkUser.id });

    if (!user) {
        // Fallback for local development if Clerk webhook hasn't fired
        const email = clerkUser.emailAddresses[0]?.emailAddress || '';
        const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || email.split('@')[0];

        try {
            user = await User.create({
                clerkId: clerkUser.id,
                email: email,
                name: name,
                image: clerkUser.imageUrl || '',
                role: "STUDENT"
            });
            console.log("Created user via Dashboard fallback logic");
        } catch (error) {
            console.error("Failed to create user fallback:", error);
            redirect('/sign-in');
        }
    }

    const isStudent = user.role === 'STUDENT';
    const isMentor = user.role === 'MENTOR';
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    const isSuperAdmin = user.role === 'SUPER_ADMIN';

    // Global queries needed across different views
    const assessmentResult = isStudent ? await AssessmentResult.findOne({ userId: user._id }).sort({ createdAt: -1 }) : null;
    
    // Enhanced booking query for students to show mentor name and time
    const bookings = await Booking.find({
        $or: [{ studentId: user._id }, { mentorId: user._id }]
    })
    .populate({
        path: 'mentorId',
        populate: { path: 'userId', select: 'name email' }
    })
    .populate('slotId')
    .sort({ createdAt: -1 })
    .limit(10);

    const payments = isMentor ? await Payment.find({ 'metadata.mentorId': user._id, status: 'SUCCESS' }) : [];
    
    // Get related payments for receipts
    const studentPayments = isStudent ? await Payment.find({ userId: user._id, status: 'SUCCESS' }).lean() : [];

    let totalUsers = 0, activeMentors = 0, totalSessions = 0;
    let recentActivity: any[] = [];
    let pendingMentors: any[] = [];

    if (isAdmin) {
        totalUsers = await User.countDocuments();
        activeMentors = await MentorProfile.countDocuments({ isApproved: true });
        totalSessions = await Booking.countDocuments();
        recentActivity = await Booking.find().sort({ createdAt: -1 }).limit(3);

        // Fetch Mentors awaiting approval
        pendingMentors = await MentorProfile.find({ isApproved: false }).populate("userId", "name email");
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4 md:px-6 max-w-5xl">

                {/* Dashboard Header */}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
                            Welcome back, {user.name || user.email.split('@')[0]} 👋
                        </h1>
                        <p className="text-slate-600">
                            You are logged in with the <strong className={`uppercase tracking-wide ${isSuperAdmin ? 'text-purple-600' : 'text-indigo-600'}`}>{user.role}</strong> role.
                        </p>
                    </div>
                </header>

                {/* --- STUDENT DASHBOARD VIEW --- */}
                {isStudent && (() => {
                    const upcomingBookings = bookings.filter((b: any) => b.studentId.toString() === user._id.toString() && b.status === 'CONFIRMED');
                    const profileCompletion = user.name && user.role ? 100 : 33;

                    return (
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                                            <GraduationCap className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">Your AI Career Roadmap</h2>
                                            <p className="text-sm text-slate-600">Generated from your latest assessment</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center py-12">
                                        {assessmentResult ? (
                                            <div className="text-left space-y-4">
                                                <h3 className="font-semibold text-lg text-slate-800">Your Recommended Focus:</h3>
                                                <p className="text-slate-600">{assessmentResult.roadmap.slice(0, 150)}...</p>
                                                <Link href="/assessment">
                                                    <Button variant="outline" className="mt-2">View Full Roadmap</Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-slate-500 mb-4">You haven't taken the AI assessment yet.</p>
                                                <Link href="/assessment">
                                                    <Button className="font-semibold shadow-md shadow-indigo-600/20">
                                                        Start Assessment
                                                    </Button>
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-slate-900">Upcoming Sessions</h2>
                                        <Link href="/mentors" className="text-sm text-indigo-600 font-semibold hover:underline">
                                            Book More
                                        </Link>
                                    </div>
                                    
                                    {upcomingBookings.length > 0 ? (
                                        <div className="space-y-4">
                                            {upcomingBookings.map((b: any, i: number) => {
                                                const mentor = b.mentorId as any;
                                                const mentorUser = mentor?.userId as any;
                                                const slot = b.slotId as any;
                                                const payment = studentPayments.find(p => p.bookingId?.toString() === b._id.toString());
                                                
                                                return (
                                                    <div key={i} className="flex flex-col sm:flex-row justify-between sm:items-center p-5 bg-slate-50 rounded-xl border border-slate-100 gap-4">
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                                                                {mentorUser?.name?.charAt(0) || "M"}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900">{mentorUser?.name || "AI Mentor"}</p>
                                                                <p className="text-xs text-slate-500 mb-1">{mentor?.designation || "Mentorship"}</p>
                                                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                                                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                                                        {slot ? new Date(slot.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'Date TBD'}
                                                                    </span>
                                                                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                                                        {slot ? new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time TBD'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex flex-col sm:items-end gap-2">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full w-fit">
                                                                Confirmed
                                                            </span>
                                                            {payment && (
                                                                <ReceiptButton 
                                                                    data={{
                                                                        bookingId: b._id.toString(),
                                                                        transactionId: payment.razorpayPaymentId || payment.razorpayOrderId,
                                                                        date: payment.createdAt.toString(),
                                                                        studentName: user.name || "Student",
                                                                        mentorName: mentorUser?.name || "AI Mentor",
                                                                        serviceName: b.serviceId?.toString() || "Mentorship Session",
                                                                        amount: payment.amount
                                                                    }}
                                                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold border-b border-indigo-200 pb-0.5 w-fit"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                                            <p className="text-slate-500 mb-4">No upcoming mentorship sessions.</p>
                                            <Link href="/mentors">
                                                <Button variant="outline" className="font-semibold">
                                                    Find a Mentor
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                    <h3 className="font-bold text-slate-900 mb-4">Profile Completion</h3>
                                    <div className="w-full bg-slate-100 h-2 rounded-full mb-2">
                                        <div className={`bg-indigo-600 h-2 rounded-full`} style={{ width: `${profileCompletion}%` }}></div>
                                    </div>
                                    <p className="text-xs text-slate-500 text-right">{profileCompletion}% Complete</p>
                                    {profileCompletion < 100 && (
                                        <Button variant="outline" className="w-full mt-4">
                                            Complete Profile
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* --- MENTOR DASHBOARD VIEW --- */}
                {isMentor && (() => {
                    const upcomingSessions = bookings.filter((b: any) => b.mentorId.toString() === user._id.toString() && b.status === 'CONFIRMED');
                    const totalEarnings = payments.reduce((acc: number, p: any) => acc + (p.amount / 100), 0); // Assuming Razorpay paisa

                    return (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                                        <Briefcase className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Upcoming Sessions</h2>
                                        <p className="text-sm text-slate-600">Manage your active mentees</p>
                                    </div>
                                </div>
                                <div className="py-2 text-left">
                                    {upcomingSessions.length > 0 ? (
                                        <ul className="space-y-4">
                                            {upcomingSessions.map((session: any, index: number) => {
                                                const student = session.studentId as any;
                                                const slot = session.slotId as any;
                                                return (
                                                    <li key={index} className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold shrink-0">
                                                                {student?.name?.charAt(0) || "S"}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-900">{student?.name || "Student"}</p>
                                                                <p className="text-xs text-slate-500">
                                                                    {slot ? new Date(slot.startTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Time TBD'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full w-fit">
                                                                Confirmed
                                                            </span>
                                                            <Button variant="outline" size="sm" className="h-8 text-xs">Join Call</Button>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                                            <p className="text-slate-500 text-sm">No scheduled sessions for this week.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">Mentor Performance</h2>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="text-sm text-slate-500 mb-1">Total Earnings</p>
                                        <p className="text-2xl font-bold text-slate-900">₹{totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="text-sm text-slate-500 mb-1">Average Rating</p>
                                        <p className="text-2xl font-bold text-slate-900 text-amber-500">4.9 ★</p>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full">
                                    Manage Availability
                                </Button>
                            </div>
                        </div>
                    );
                })()}

                {/* --- SUPER ADMIN & ADMIN DASHBOARD VIEW --- */}
                {isAdmin && (
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`p-3 rounded-xl ${isSuperAdmin ? 'bg-purple-100 text-purple-600' : 'bg-red-100 text-red-600'}`}>
                                    <Settings className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">{isSuperAdmin ? 'Super Admin Override' : 'Admin Control Panel'}</h2>
                                    <p className="text-sm text-slate-600">Approve Mentors and oversee the platform</p>
                                </div>
                            </div>

                            <div className="mt-8 mb-6">
                                <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center justify-between">
                                    Pending Mentor Applications
                                    <span className="bg-amber-100 text-amber-700 py-1 px-3 rounded-full text-xs">{pendingMentors.length}</span>
                                </h3>
                                {pendingMentors.length > 0 ? (
                                    <ul className="space-y-4">
                                        {pendingMentors.map((mentorProfile: any, idx: number) => {
                                            const applicantName = mentorProfile.userId?.name || mentorProfile.userId?.email || "Unknown User";
                                            return (
                                                <li key={idx} className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                                    <div>
                                                        <p className="font-bold text-slate-900">{applicantName}</p>
                                                        <p className="text-slate-500 text-sm">{mentorProfile.designation} @ {mentorProfile.company}</p>
                                                        <p className="text-slate-600 text-sm mt-2 line-clamp-1 italic">"{mentorProfile.bio}"</p>
                                                    </div>
                                                    <form action="/api/admin/approve-mentor" method="POST" className="shrink-0 flex gap-2">
                                                        <input type="hidden" name="mentorId" value={mentorProfile._id.toString()} />
                                                        <input type="hidden" name="userId" value={mentorProfile.userId._id.toString()} />
                                                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Approve</Button>
                                                    </form>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                ) : (
                                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                                        <p className="text-slate-500 mb-2">No pending applications.</p>
                                        <p className="text-sm text-slate-400">All caught up!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-6">Platform Stats</h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Total Users</p>
                                    <p className="text-3xl font-bold text-slate-900">{totalUsers.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Active Mentors</p>
                                    <p className="text-3xl font-bold text-slate-900">{activeMentors.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Total Sessions Booked</p>
                                    <p className="text-3xl font-bold text-slate-900">{totalSessions.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
