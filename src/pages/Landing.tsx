import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Ghost,
    Sparkles,
    Zap,
    TrendingUp,
    ChevronRight,
    Shield,
    Globe,
    CheckCircle2,
    Terminal,
    ArrowRight,
    MessageSquare,
    Cpu
} from 'lucide-react';
import { cn } from '../utils/cn';

const TERMINAL_LINES = [
    '> Initializing Hirena Ghost Protocol...',
    '> Scanning global job boards [LinkedIn, Indeed, Otta]...',
    '> Pattern matching User_001 skills against 432 roles...',
    '> Found 94% match at NeuraCore AI.',
    '> Generating tailored cover letter...',
    '> Sending WhatsApp alert to user...',
    '> STATUS: ACTIVE. Hunting continues...'
];

export default function Landing() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [terminalLines, setTerminalLines] = useState<string[]>([]);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (currentLineIndex >= TERMINAL_LINES.length) return;

        const timer = setTimeout(() => {
            const currentFullLine = TERMINAL_LINES[currentLineIndex];

            if (currentCharIndex < currentFullLine.length) {
                setTerminalLines(prev => {
                    const newLines = [...prev];
                    if (newLines[currentLineIndex] === undefined) {
                        newLines[currentLineIndex] = currentFullLine[currentCharIndex];
                    } else {
                        newLines[currentLineIndex] += currentFullLine[currentCharIndex];
                    }
                    return newLines;
                });
                setCurrentCharIndex(prev => prev + 1);
            } else {
                setCurrentLineIndex(prev => prev + 1);
                setCurrentCharIndex(0);
            }
        }, 30);

        return () => clearTimeout(timer);
    }, [currentLineIndex, currentCharIndex]);

    const features = [
        {
            icon: <Ghost className="w-6 h-6" />,
            title: 'Ghost Hunter AI',
            desc: 'Your autonomous agent that scans job boards 24/7. It doesn\'t sleep, it doesn\'t get tired, it just hunts.',
            color: 'emerald'
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            title: 'Career Time Machine',
            desc: 'Predict your 5-year salary trajectory and job titles based on real-time market data and industry shifts.',
            color: 'blue'
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: 'One-Click Alignment',
            desc: 'Tailor your CV to any job description in 5 seconds. Perfect keywords, every single time.',
            color: 'purple'
        },
        {
            icon: <MessageSquare className="w-6 h-6" />,
            title: 'WhatsApp Alerts',
            desc: 'Get instant notifications the second a 90%+ match is found. Be the first to apply, every time.',
            color: 'cyan'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-brand-emerald-500/30 selection:text-brand-emerald-200 font-sans overflow-x-hidden">
            {/* Header */}
            <nav className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
                scrolled ? "bg-slate-950/80 backdrop-blur-xl border-b border-white/5 py-4" : "bg-transparent py-6"
            )}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-10 h-10 bg-brand-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-emerald-500/20 group-hover:rotate-12 transition-transform">
                            <Ghost className="text-white w-6 h-6" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-white uppercase italic">Hirena</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
                        <a href="#features" className="hover:text-brand-emerald-400 transition-colors">Intelligence</a>
                        <a href="#how-it-works" className="hover:text-brand-emerald-400 transition-colors">Ghost Hunter</a>
                        <a href="#pricing" className="hover:text-brand-emerald-400 transition-colors">Pricing</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/login')} className="text-sm font-bold text-white hover:text-brand-emerald-400 transition-colors hidden sm:block">Log In</button>
                        <button
                            onClick={() => navigate('/onboarding')}
                            className="bg-white text-slate-950 px-6 py-2.5 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-brand-emerald-400 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5"
                        >
                            Start Hunting
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-emerald-500/10 rounded-full blur-[120px] -z-10" />
                <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-brand-blue-500/10 rounded-full blur-[100px] -z-10" />

                <div className="max-w-6xl mx-auto text-center relative">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                        <Sparkles className="w-3 h-3" />
                        The World's First Autonomous AI Career Agent
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        The Job Hunt is <span className="text-slate-700 italic">Dead.</span><br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-emerald-400 to-brand-blue-400">Long live the Ghost.</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium mb-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                        While you sleep, Hirena's Ghost Hunter protocols scan global job boards, tailor your documents, and alert you on WhatsApp. Your career on autopilot.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        <button
                            onClick={() => navigate('/onboarding')}
                            className="group relative w-full sm:w-auto px-8 py-5 bg-brand-emerald-500 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-brand-emerald-500/30 hover:bg-brand-emerald-600 transition-all active:scale-[0.98]"
                        >
                            <span className="flex items-center justify-center gap-2">
                                Activate Your Hunter
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                        <button
                            onClick={() => navigate('/pathway')}
                            className="w-full sm:w-auto px-8 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-white/10 transition-all active:scale-[0.98] backdrop-blur-sm"
                        >
                            See My Future Pay
                        </button>
                    </div>

                    {/* Floating Terminal Preview */}
                    <div className="mt-20 relative max-w-4xl mx-auto group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-brand-emerald-500 to-brand-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-white/5">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                                </div>
                                <div className="flex-1 flex justify-center">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                        <Terminal className="w-3 h-3" /> Ghost_Protocol_Terminal.exe
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 text-left font-mono text-sm text-brand-emerald-400/90 leading-relaxed whitespace-pre-wrap min-h-[220px]">
                                {terminalLines.map((line, idx) => (
                                    <div key={idx}>{line}</div>
                                ))}
                                <span className="w-2 h-4 bg-brand-emerald-500 inline-block animate-pulse ml-1 align-middle" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">
                            High-Frequency Career Intelligence
                        </h2>
                        <p className="text-slate-400 font-medium text-lg">
                            We don't just build resumes. We build an unfair advantage.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((f, i) => (
                            <div key={i} className="group p-8 bg-white/5 border border-white/10 rounded-3xl hover:border-brand-emerald-500/30 hover:bg-white/[0.07] transition-all">
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform",
                                    f.color === 'emerald' ? "bg-brand-emerald-500/20 text-brand-emerald-400" :
                                        f.color === 'blue' ? "bg-brand-blue-500/20 text-brand-blue-400" :
                                            f.color === 'purple' ? "bg-purple-500/20 text-purple-400" :
                                                "bg-cyan-500/20 text-cyan-400"
                                )}>
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{f.title}</h3>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">
                            Choose Your Hunter Level
                        </h2>
                        <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto">
                            Whether you're just starting your hunt or looking for full autonomous career management, we have a protocol for you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Basic Tier */}
                        <div className="group p-8 bg-white/5 border border-white/10 rounded-[32px] hover:border-white/20 transition-all flex flex-col">
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">Scout</h3>
                                <p className="text-slate-500 text-sm font-medium">For occasional hunters.</p>
                            </div>
                            <div className="mb-8">
                                <span className="text-4xl font-black text-white">$0</span>
                                <span className="text-slate-500 text-sm font-bold ml-2 uppercase tracking-widest">Free</span>
                            </div>
                            <ul className="space-y-4 mb-10 flex-1">
                                {[
                                    '1 CV Analysis / Month',
                                    'Manual Job Discovery',
                                    'Basic Salary Insights',
                                    'Community Support'
                                ].map((feat) => (
                                    <li key={feat} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                                        <CheckCircle2 className="w-4 h-4 text-slate-600" />
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => navigate('/onboarding')}
                                className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                            >
                                Start for Free
                            </button>
                        </div>

                        {/* Pro Tier (Ghost) */}
                        <div className="group p-8 bg-gradient-to-b from-brand-emerald-500/10 to-transparent border-2 border-brand-emerald-500/50 rounded-[32px] relative shadow-2xl shadow-brand-emerald-500/10 flex flex-col transform md:-translate-y-4">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-emerald-500/20">
                                Most Popular
                            </div>
                            <div className="mb-8 pt-4">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                    Ghost <Zap className="w-4 h-4 text-brand-emerald-400 fill-current" />
                                </h3>
                                <p className="text-slate-400 text-sm font-medium">Full autonomous hunting suite.</p>
                            </div>
                            <div className="mb-8">
                                <span className="text-4xl font-black text-white">$19</span>
                                <span className="text-slate-500 text-sm font-bold ml-2 uppercase tracking-widest">/ Month</span>
                            </div>
                            <ul className="space-y-4 mb-10 flex-1">
                                {[
                                    'Unlimited CV Analyses',
                                    '24/7 Ghost Hunter AI',
                                    'Real-time WhatsApp Alerts',
                                    'Career Time Machine (5Y)',
                                    'AI Cover Letter Generator',
                                    'Salary Negotiator Bot'
                                ].map((feat) => (
                                    <li key={feat} className="flex items-center gap-3 text-sm text-white font-bold">
                                        <CheckCircle2 className="w-5 h-5 text-brand-emerald-500" />
                                        {feat}
                                    </li>
                                ))}
                                <li className="flex items-center gap-3 text-sm text-brand-emerald-400 font-black italic">
                                    <Sparkles className="w-5 h-5" />
                                    Ghost Apply (Beta)
                                </li>
                            </ul>
                            <button
                                onClick={() => navigate('/onboarding')}
                                className="w-full py-5 bg-brand-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-emerald-500/20 hover:bg-brand-emerald-600 transition-all active:scale-95"
                            >
                                Go Pro Now
                            </button>
                        </div>

                        {/* Enterprise Tier */}
                        <div className="group p-8 bg-white/5 border border-white/10 rounded-[32px] hover:border-white/20 transition-all flex flex-col">
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">Phantom</h3>
                                <p className="text-slate-500 text-sm font-medium">For high-end talent & execs.</p>
                            </div>
                            <div className="mb-8">
                                <span className="text-4xl font-black text-white">$49</span>
                                <span className="text-slate-500 text-sm font-bold ml-2 uppercase tracking-widest">/ Month</span>
                            </div>
                            <ul className="space-y-4 mb-10 flex-1">
                                {[
                                    'Everything in Ghost Pro',
                                    'Executive Deep-Dive Reports',
                                    '1-on-1 AI Strategy Calls',
                                    'Priority RapidAPI Nodes',
                                    'Phantom Apply (Full Auto)',
                                    'White-Glove Onboarding'
                                ].map((feat) => (
                                    <li key={feat} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                                        <CheckCircle2 className="w-4 h-4 text-brand-blue-400" />
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => navigate('/onboarding')}
                                className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                            >
                                Contact Sales
                            </button>
                        </div>
                    </div>

                    <p className="text-center mt-12 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
                        Secure Checkout via Stripe • Cancel Anytime
                    </p>
                </div>
            </section>

            {/* Stats / CTA Area */}
            <section className="py-32 px-6 relative">
                <div className="absolute inset-0 bg-brand-emerald-500/5 -z-10" />
                <div className="max-w-4xl mx-auto bg-gradient-to-br from-brand-emerald-500 to-brand-blue-600 rounded-[40px] p-10 md:p-16 text-center shadow-3xl shadow-brand-emerald-500/20 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-[1.1]">
                            Stop searching.<br />Start being found.
                        </h2>
                        <p className="text-white/80 font-bold mb-10 text-lg md:text-xl">
                            Join 1,200+ elite engineers and professionals using Hirena to automate their growth.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button
                                onClick={() => navigate('/onboarding')}
                                className="w-full sm:w-auto px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-xl uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-2xl"
                            >
                                Get Early Access
                            </button>
                            <div className="flex flex-col items-center sm:items-start gap-1">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-brand-emerald-500 bg-slate-800 flex items-center justify-center text-[10px] font-black text-white uppercase italic">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                    <div className="w-8 h-8 rounded-full border-2 border-brand-emerald-500 bg-brand-emerald-400 flex items-center justify-center text-[10px] font-black text-slate-900">
                                        +50
                                    </div>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Currently active in Lagos & London</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-emerald-500 rounded-lg flex items-center justify-center">
                            <Ghost className="text-white w-5 h-5" />
                        </div>
                        <span className="text-lg font-black tracking-tighter text-white uppercase italic">Hirena</span>
                    </div>

                    <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <a href="#" className="hover:text-brand-emerald-400 transition-colors">Twitter</a>
                        <a href="#" className="hover:text-brand-emerald-400 transition-colors">LinkedIn</a>
                        <a href="#" className="hover:text-brand-emerald-400 transition-colors">API Docs</a>
                        <a href="#" className="hover:text-brand-emerald-400 transition-colors">Privacy</a>
                    </div>

                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        © 2026 Hirena AI. Built for the high-end hunter.
                    </p>
                </div>
            </footer>
        </div>
    );
}
