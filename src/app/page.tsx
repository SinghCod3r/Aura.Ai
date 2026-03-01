import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Star, BookOpen, Target, CalendarDays, BrainCircuit, LineChart } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-24 pb-32">
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-indigo-50 to-white" />
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

        <div className="container relative mx-auto px-4 md:px-6 text-center">
          <div className="mx-auto max-w-3xl space-y-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
              Build Your Career with <br className="hidden sm:block" />
              <span className="gradient-text">AI & Real Mentors</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-600 sm:text-xl leading-relaxed">
              Stop guessing your career path. Get a personalized AI roadmap and book 1:1 sessions with industry experts to land your dream job faster.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/assessment">
                <Button size="lg" className="w-full sm:w-auto font-semibold gap-2 shadow-indigo-600/20 shadow-lg">
                  Take Free AI Test <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/mentors">
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold bg-white">
                  Find a Mentor
                </Button>
              </Link>
            </div>

            {/* Quick social proof */}
            <div className="pt-8 flex items-center justify-center gap-4 text-sm text-slate-500 font-medium">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shadow-sm">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-start">
                <div className="flex text-yellow-500">
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                </div>
                <span>Trusted by 5,000+ students</span>
              </div>
            </div>
          </div>

          {/* Dashboard Mockup Component placeholder */}
          <div className="mx-auto mt-16 max-w-5xl rounded-2xl border border-slate-200 bg-white/50 p-2 shadow-2xl glass-effect">
            <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
              <div className="aspect-video w-full bg-slate-100 flex items-center justify-center">
                <span className="text-slate-400 font-medium flex flex-col items-center gap-2">
                  <LineChart className="h-10 w-10 text-indigo-300" />
                  Dashboard Interactive Preview
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-slate-50 py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Why are you still struggling?
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              The traditional college system doesn&apos;t prepare you for the real world. We fix that.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
              <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center mb-6 text-red-600">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">No Clear Roadmap</h3>
              <p className="text-slate-600">You&apos;re applying everywhere without a strategy, wasting months on the wrong skills.</p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
              <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center mb-6 text-orange-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Weak Resume</h3>
              <p className="text-slate-600">Your resume blends in with thousands of others because it lacks impact and ATS optimization.</p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-6 text-indigo-600">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Interview Anxiety</h3>
              <p className="text-slate-600">You freeze up during technical or behavioral interviews due to lack of mock practice.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How Aura.Ai Works
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              A simple, structured 3-step process to accelerate your career growth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-indigo-100" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-white border-4 border-indigo-50 shadow-xl flex items-center justify-center mb-6 text-indigo-600">
                <BrainCircuit className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">1. AI Assessment</h3>
              <p className="text-slate-600">Take a 5-minute intelligent quiz. Our AI diagnoses your strengths and skill gaps instantly.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-white border-4 border-indigo-50 shadow-xl flex items-center justify-center mb-6 text-indigo-600">
                <Target className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">2. Custom Roadmap</h3>
              <p className="text-slate-600">Get a personalized 3-month action plan detailing exact skills to learn and projects to build.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-indigo-600 border-4 border-indigo-100 shadow-xl flex items-center justify-center mb-6 text-white text-shadow-md">
                <CalendarDays className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">3. 1:1 Mentorship</h3>
              <p className="text-slate-600">Book sessions with FAANG + Top Tech mentors for resume reviews and mock interviews.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-indigo-900 to-purple-900 py-24 relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-indigo-500 opacity-20 rounded-full blur-3xl"></div>

        <div className="container relative mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl mb-6">
            Ready to Fast-Track Your Career?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-indigo-200 mb-10">
            Join thousands of students who have transformed their career trajectory using Aura.Ai. The first assessment is completely free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/assessment">
              <Button size="lg" className="w-full sm:w-auto font-semibold gap-2 bg-white text-indigo-900 hover:bg-indigo-50 px-8 h-14">
                Take Free Assessment
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-indigo-200 text-sm">
            <CheckCircle2 className="h-4 w-4" /> No credit card required for assessment
          </div>
        </div>
      </section>
    </div>
  );
}
