import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-16 lg:py-24">
            <div className="container mx-auto px-4 md:px-6 max-w-4xl">

                <div className="mb-12">
                    <Link href="/" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 mb-6 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-lg text-slate-600">
                        Last updated: October 24, 2023
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-indigo-600">
                    <p className="lead text-xl text-slate-700 mb-8 font-medium">
                        At Aura.Ai, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-6">1. Information We Collect</h2>
                    <p className="mb-4">We may collect information about you in a variety of ways. The information we may collect includes:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-8 text-slate-600">
                        <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information.</li>
                        <li><strong>Professional Data:</strong> Information related to your career, including your resume, skills, current role, and career goals that you provide during our AI assessment.</li>
                        <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-12 mb-6">2. Use of Your Information</h2>
                    <p className="mb-4">Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-8 text-slate-600">
                        <li>Create and manage your account.</li>
                        <li>Generate your personalized AI career assessment and roadmap.</li>
                        <li>Match you with appropriate mentors based on your profile.</li>
                        <li>Email you regarding your account or order.</li>
                        <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-12 mb-6">3. Disclosure of Your Information</h2>
                    <p className="mb-8 text-slate-600">
                        We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                        <br /><br />
                        <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.
                        <br /><br />
                        <strong>With Mentors:</strong> Limited profile information is shared with potential mentors to facilitate the matching and mentorship process. We never share your contact information without explicit consent.
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-6">4. Security of Your Information</h2>
                    <p className="mb-8 text-slate-600">
                        We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-6">5. Contact Us</h2>
                    <p className="mb-8 text-slate-600">
                        If you have questions or comments about this Privacy Policy, please contact us at:
                        <br /><br />
                        <strong>Aura.Ai Privacy Team</strong><br />
                        <a href="mailto:privacy@aura.ai" className="font-semibold text-indigo-600 hover:underline">privacy@aura.ai</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
