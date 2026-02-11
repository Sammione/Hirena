import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    CheckCircle2,
    Globe,
    Zap,
    Target,
    TrendingUp,
    Briefcase,
    Users
} from 'lucide-react';

export default function Landing() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <img src="/logo.svg" alt="Hirena Logo" className="w-10 h-10" />
                    <span className="text-brand-blue-900 font-bold text-xl">HIRENA</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-slate-600 font-medium">
                    <a href="#features" className="hover:text-brand-emerald-500 transition-colors">Features</a>
                    <a href="#how-it-works" className="hover:text-brand-emerald-500 transition-colors">How it Works</a>
                    <a href="#pricing" className="hover:text-brand-emerald-500 transition-colors">Pricing</a>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login" className="text-slate-600 font-medium hover:text-brand-blue-900">Log in</Link>
                    <Link to="/register" className="bg-brand-blue-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-brand-blue-800 transition-all">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute top-0 right-0 -z-10 bg-gradient-to-l from-emerald-50 to-transparent w-1/2 h-full rounded-l-[100px]"></div>
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-emerald-50 text-brand-emerald-700 rounded-full font-semibold text-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-emerald-500"></span>
                            </span>
                            Empowering Africa's Next Workforce
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold text-brand-blue-900 leading-[1.1]">
                            The Intelligence Layer for Your <span className="text-brand-emerald-500">Career.</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-xl leading-relaxed">
                            HIRENA uses AI to map your skills, identify gaps, and connect you with remote and local opportunities across Africa and beyond.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/register" className="flex items-center justify-center gap-2 bg-brand-blue-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-blue-800 transition-all shadow-xl shadow-brand-blue-900/20">
                                Join HIRENA <ArrowRight className="w-5 h-5" />
                            </Link>
                            <button className="flex items-center justify-center gap-2 bg-white text-brand-blue-900 border-2 border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all">
                                See How it Works
                            </button>
                        </div>
                        <div className="flex items-center gap-6 pt-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-slate-500 font-medium tracking-tight">
                                <span className="text-slate-900 font-bold">12,000+</span> professionals already scaling.
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="bg-white rounded-3xl shadow-2xl p-4 border border-slate-100 relative z-10">
                            {/* Dashboard Mockup Component or Image */}
                            <div className="aspect-[4/3] bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center">
                                <div className="text-slate-300 flex flex-col items-center">
                                    <Target className="w-16 h-16 mb-4 opacity-20" />
                                    <div className="w-48 h-2 bg-slate-200 rounded-full mb-3"></div>
                                    <div className="w-32 h-2 bg-slate-200 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-emerald-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-blue-900/10 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-brand-blue-900 py-16">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
                    <LandingStat value="95%" label="Match Accuracy" />
                    <LandingStat value="45k+" label="Job Postings" />
                    <LandingStat value="12" label="African Hubs" />
                    <LandingStat value="3.5x" label="Avg Salary Increase" />
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                        <h2 className="text-brand-emerald-500 font-bold tracking-widest text-sm uppercase">Engineered for growth</h2>
                        <h3 className="text-4xl font-bold text-brand-blue-900 leading-tight">Professional-grade tools to fast-track your career.</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={TrendingUp}
                            title="Career Mapping"
                            description="Visualize your trajectory from current skills to your dream role with AI-generated roadmaps."
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Skill Gap Analysis"
                            description="Know exactly which certification or project you need to unlock the next level of income."
                        />
                        <FeatureCard
                            icon={Globe}
                            title="Global Connections"
                            description="Access remote roles from international companies looking for African talent."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="pb-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="bg-gradient-to-br from-brand-blue-900 to-brand-blue-800 rounded-[40px] p-12 lg:p-20 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                            <div className="grid grid-cols-10 h-full">
                                {Array.from({ length: 100 }).map((_, i) => (
                                    <div key={i} className="border-[0.5px] border-white/20"></div>
                                ))}
                            </div>
                        </div>
                        <div className="relative z-10 space-y-8">
                            <h2 className="text-4xl lg:text-6xl font-bold text-white max-w-4xl mx-auto">
                                Ready to take the next step in your career?
                            </h2>
                            <p className="text-brand-blue-200 text-xl max-w-2xl mx-auto">
                                Join thousands of African professionals who are building their future with HIRENA.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/register" className="bg-brand-emerald-500 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-brand-emerald-600 transition-all shadow-xl shadow-brand-emerald-500/20">
                                    Create Free Account
                                </Link>
                                <Link to="/jobs" className="bg-white/10 text-white backdrop-blur-md px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white/20 transition-all">
                                    Browse Jobs
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 border-t border-slate-200 pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-12">
                    <div className="space-y-6 max-w-xs">
                        <div className="flex items-center gap-2">
                            <img src="/logo.svg" alt="Hirena Logo" className="w-8 h-8" />
                            <span className="text-brand-blue-900 font-bold text-xl">HIRENA</span>
                        </div>
                        <p className="text-slate-500 leading-relaxed">
                            The intelligence layer for the African workforce. Find your path, build your skills, get hired.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 flex-1 max-w-2xl">
                        <FooterColumn title="Platform" links={['Discovery', 'Roadmaps', 'CV Builder', 'Job Board']} />
                        <FooterColumn title="Company" links={['About Us', 'Careers', 'Contact', 'Blog']} />
                        <FooterColumn title="Legal" links={['Privacy Policy', 'Terms of Service', 'Cookie Policy']} />
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
                    <p>© 2026 HIRENA. Built for Africa by Hirena Tech.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-brand-blue-900 transition-colors">Twitter</a>
                        <a href="#" className="hover:text-brand-blue-900 transition-colors">LinkedIn</a>
                        <a href="#" className="hover:text-brand-blue-900 transition-colors">Instagram</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function LandingStat({ value, label }: { value: string, label: string }) {
    return (
        <div className="text-center group">
            <div className="text-4xl font-bold text-white mb-2 group-hover:text-brand-emerald-400 transition-colors">{value}</div>
            <div className="text-brand-blue-300 font-medium">{label}</div>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="p-8 rounded-3xl border border-slate-100 hover:border-brand-emerald-200 hover:shadow-2xl hover:shadow-brand-emerald-500/5 transition-all group">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-blue-900 mb-6 group-hover:bg-brand-emerald-500 group-hover:text-white transition-all">
                <Icon className="w-7 h-7" />
            </div>
            <h4 className="text-xl font-bold text-brand-blue-900 mb-4">{title}</h4>
            <p className="text-slate-600 leading-relaxed">
                {description}
            </p>
        </div>
    );
}

function FooterColumn({ title, links }: { title: string, links: string[] }) {
    return (
        <div className="space-y-6">
            <h5 className="font-bold text-brand-blue-900">{title}</h5>
            <ul className="space-y-4">
                {links.map(link => (
                    <li key={link}>
                        <a href="#" className="text-slate-500 hover:text-brand-emerald-600 transition-colors">{link}</a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
