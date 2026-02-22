import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    Loader2, Sparkles, TrendingUp, AlertTriangle, Zap, ChevronRight,
    BarChart3, Brain, Rocket, History, History as TimeIcon
} from 'lucide-react';
import { cn } from '../utils/cn';
import { generateCareerTimeline, CareerTimeline } from '../lib/openai';

const formatSalary = (amount: number, currency: string) => {
    if (currency === 'NGN') {
        if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
        return `₦${(amount / 1_000).toFixed(0)}K`;
    }
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount}`;
};

const urgencyDot = (urgency: string) => {
    if (urgency === 'high') return 'bg-red-500';
    if (urgency === 'medium') return 'bg-amber-500';
    return 'bg-slate-400';
};

const periodColors = [
    { bg: 'bg-slate-100', text: 'text-slate-600', bar: 'bg-slate-400', ring: 'ring-slate-300' },
    { bg: 'bg-brand-emerald-50', text: 'text-brand-emerald-700', bar: 'bg-brand-emerald-500', ring: 'ring-brand-emerald-300' },
    { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500', ring: 'ring-blue-300' },
    { bg: 'bg-purple-50', text: 'text-purple-700', bar: 'bg-purple-500', ring: 'ring-purple-300' },
];

export default function CareerPathway() {
    const [targetRole, setTargetRole] = useState('');
    const [timeline, setTimeline] = useState<CareerTimeline | null>(null);
    const [isGeneratingTimeline, setIsGeneratingTimeline] = useState(false);
    const [userCV, setUserCV] = useState('');
    const [userSkills, setUserSkills] = useState<string[]>([]);
    const [activeTimelineNode, setActiveTimelineNode] = useState(0);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch CV
        const { data: cvData } = await supabase
            .from('cv_analyses')
            .select('cv_text, analysis')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (cvData?.cv_text) setUserCV(cvData.cv_text);

        // Fetch profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('target_role, skills')
            .eq('id', user.id)
            .single();

        if (profile?.target_role) setTargetRole(profile.target_role);
        if (profile?.skills) setUserSkills(Array.isArray(profile.skills) ? profile.skills : []);

        // Auto-generate timeline if we have role + CV
        if (profile?.target_role && cvData?.cv_text) {
            handleGenerateTimeline(profile.target_role, Array.isArray(profile.skills) ? profile.skills : [], cvData.cv_text);
        }
    };

    const handleGenerateTimeline = async (role?: string, skills?: string[], cv?: string) => {
        const r = role || targetRole;
        const s = skills || userSkills;
        const c = cv || userCV;

        if (!r) return;

        setIsGeneratingTimeline(true);
        try {
            const result = await generateCareerTimeline(r, s.length ? s : ['JavaScript', 'React'], c || undefined);
            setTimeline(result);
        } catch (err) {
            console.error('Timeline generation failed:', err);
        } finally {
            setIsGeneratingTimeline(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <History className="w-8 h-8 text-brand-blue-900" />
                        Career Time Machine
                    </h1>
                    <p className="text-slate-500 font-medium">Predicting your trajectory and identifying your skill risks.</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Enter target role (e.g. AI Engineer)"
                        className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-emerald-500 min-w-[240px] text-sm font-medium"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateTimeline()}
                    />
                    <button
                        onClick={() => handleGenerateTimeline()}
                        disabled={isGeneratingTimeline || !targetRole}
                        className="bg-brand-blue-900 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap disabled:opacity-50 font-bold shadow-lg shadow-brand-blue-900/10 hover:bg-brand-blue-800 transition-all active:scale-95"
                    >
                        {isGeneratingTimeline ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-brand-emerald-400" />}
                        Predict My Future
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-blue-900 via-slate-900 to-slate-800 p-8 text-white shadow-2xl min-h-[500px] flex flex-col justify-center">
                {/* bg decorations */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full -ml-24 -mb-24 blur-3xl pointer-events-none" />

                <div className="relative z-10 w-full">
                    {isGeneratingTimeline && (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-brand-emerald-500 animate-spin" />
                                <Brain className="w-6 h-6 text-brand-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <h3 className="text-xl font-bold">Scanning the future...</h3>
                            <p className="text-white/70 font-medium text-sm">Analysing market trends and skill demand for {targetRole}</p>
                        </div>
                    )}

                    {!timeline && !isGeneratingTimeline && (
                        <div className="text-center py-20">
                            <Rocket className="w-16 h-16 text-white/20 mx-auto mb-6" />
                            <h3 className="text-2xl font-black mb-3">Ready to travel in time?</h3>
                            <p className="text-white/50 font-medium text-lg max-w-md mx-auto">
                                Enter your dream role above and we'll predict your salary and title growth over the next 5 years.
                            </p>
                        </div>
                    )}

                    {timeline && !isGeneratingTimeline && (
                        <div className="space-y-8 animate-in fade-in duration-700">
                            {/* Summary Box */}
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="flex-1 p-6 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="w-5 h-5 text-brand-emerald-400" />
                                        <span className="text-xs font-black uppercase tracking-widest text-white/50">Trajectory Analysis</span>
                                    </div>
                                    <p className="text-xl font-bold leading-relaxed">{timeline.summary}</p>
                                </div>
                                <div className="w-full md:w-64 p-6 bg-brand-emerald-500/10 rounded-3xl border border-brand-emerald-500/20 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-emerald-400 mb-2">Current Baseline</p>
                                    <p className="text-3xl font-black text-white">{formatSalary(timeline.currentSalaryMax, timeline.currency)}</p>
                                    <p className="text-xs font-bold text-white/50 mt-1">Estimated Annual Pay</p>
                                </div>
                            </div>

                            {/* The Future Pipeline */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {(timeline.timeline || []).map((node, i) => {
                                    const isActive = activeTimelineNode === i;
                                    return (
                                        <button
                                            key={node.period}
                                            onClick={() => setActiveTimelineNode(i)}
                                            className={cn(
                                                "text-left p-6 rounded-3xl border-2 transition-all duration-300 relative group overflow-hidden",
                                                isActive
                                                    ? "bg-white text-slate-900 border-white scale-105 shadow-2xl"
                                                    : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                                            )}
                                        >
                                            {isActive && (
                                                <div className="absolute top-0 right-0 p-2">
                                                    <TimeIcon className="w-4 h-4 text-brand-emerald-500" />
                                                </div>
                                            )}
                                            <div className={cn("text-[10px] font-black uppercase tracking-widest mb-3", isActive ? "text-brand-emerald-600" : "text-white/40")}>
                                                {node.period}
                                            </div>
                                            <div className={cn("text-lg font-black leading-tight mb-2", isActive ? "text-slate-900" : "text-white group-hover:text-brand-emerald-400")}>
                                                {node.title}
                                            </div>
                                            <div className={cn("text-sm font-bold mb-4", isActive ? "text-brand-emerald-600" : "text-brand-emerald-400")}>
                                                {formatSalary(node.salary_min, node.salary_currency)} – {formatSalary(node.salary_max, node.salary_currency)}
                                            </div>
                                            <div className="mt-auto">
                                                <div className={cn("flex justify-between text-[10px] font-bold mb-1.5", isActive ? "text-slate-400" : "text-white/30")}>
                                                    <span>Probability</span>
                                                    <span>{node.probability}%</span>
                                                </div>
                                                <div className={cn("w-full h-1.5 rounded-full overflow-hidden", isActive ? "bg-slate-100" : "bg-white/10")}>
                                                    <div
                                                        className={cn("h-full rounded-full transition-all duration-1000", isActive ? "bg-brand-emerald-500" : "bg-white/30")}
                                                        style={{ width: `${node.probability}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Detail Panel */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Active Node Detail */}
                                    {timeline.timeline?.[activeTimelineNode] && (
                                        <div className="p-8 bg-white/5 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center gap-6 group">
                                            <div className="p-6 bg-brand-emerald-500 text-white rounded-3xl shadow-xl shadow-brand-emerald-500/20 group-hover:rotate-3 transition-transform">
                                                <Zap className="w-8 h-8" />
                                            </div>
                                            <div className="text-center md:text-left">
                                                <p className="text-xs text-white/40 font-black uppercase tracking-widest mb-1">Key Skill to Unlock this Level</p>
                                                <h4 className="text-3xl font-black text-white">{timeline.timeline[activeTimelineNode].key_skill}</h4>
                                                <p className="text-white/60 text-sm mt-2 font-medium">Master this to increase your {timeline.timeline[activeTimelineNode].period} success probability.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Risk Alerts */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-4">
                                            <p className="text-xs font-black uppercase tracking-widest text-red-400 flex items-center gap-2 px-1">
                                                <AlertTriangle className="w-4 h-4" /> Market Risk Alerts
                                            </p>
                                            {(timeline.riskAlerts || []).map((alert, i) => (
                                                <div key={i} className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10 flex gap-4">
                                                    <div className={cn("w-1.5 rounded-full flex-shrink-0", urgencyDot(alert.urgency))} />
                                                    <div>
                                                        <p className="text-white font-bold text-sm tracking-tight">{alert.skill}</p>
                                                        <p className="text-white/40 text-[11px] mt-1 leading-relaxed font-medium">{alert.risk}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-xs font-black uppercase tracking-widest text-brand-emerald-400 flex items-center gap-2 px-1">
                                                <TrendingUp className="w-4 h-4" /> Opportunities
                                            </p>
                                            {(timeline.opportunities || []).map((opp, i) => (
                                                <div key={i} className="p-4 bg-brand-emerald-500/5 rounded-2xl border border-brand-emerald-500/10 flex gap-4">
                                                    <div className="p-2 bg-brand-emerald-500/20 rounded-lg flex-shrink-0 h-fit">
                                                        <Zap className="w-3 h-3 text-brand-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-sm tracking-tight">{opp.skill}</p>
                                                        <p className="text-white/40 text-[11px] mt-1 leading-relaxed font-medium">{opp.reason}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Do Nothing Sidebar */}
                                <div className="space-y-6">
                                    <div className="p-8 bg-black/40 rounded-3xl border border-white/5 h-full flex flex-col">
                                        <div className="p-3 bg-red-500/20 rounded-2xl w-fit mb-6">
                                            <AlertTriangle className="w-6 h-6 text-red-500" />
                                        </div>
                                        <h4 className="text-xl font-black text-red-400 mb-4 uppercase tracking-tighter">The "No-Action" Outcome</h4>
                                        <p className="text-white/80 font-medium leading-relaxed italic text-lg mb-8">
                                            "{timeline.doNothingOutcome}"
                                        </p>
                                        <div className="mt-auto pt-6 border-t border-white/10 uppercase text-[10px] font-black text-white/30 tracking-widest">
                                            Status: Stagnation Risk Detected
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* AI Advisor Box */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 p-8 rounded-3xl bg-white border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
                        <Brain className="w-6 h-6 text-brand-blue-900" />
                        AI Career Advisor
                    </h3>
                    <p className="text-slate-500 mb-6 font-medium">Ask specific questions about your timeline or how to overcome a risk.</p>
                    <div className="flex gap-2">
                        <input
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue-900 text-sm font-medium"
                            placeholder="How can I prepare for the year 3 transition?"
                        />
                        <button className="bg-brand-blue-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand-blue-800 transition-all active:scale-95">
                            Ask AI
                        </button>
                    </div>
                </div>

                <div className="p-8 rounded-3xl bg-brand-emerald-50 border border-brand-emerald-100 flex flex-col justify-center">
                    <h4 className="text-lg font-black text-brand-emerald-900 mb-2 tracking-tight">Ready to act?</h4>
                    <p className="text-brand-emerald-700/70 text-sm font-medium mb-6 leading-relaxed">
                        Use the Salary Negotiator to secure your year 1 target pay today.
                    </p>
                    <button className="w-full bg-brand-emerald-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-emerald-500/20 hover:bg-brand-emerald-600 transition-all">
                        Upgrade Your Income
                    </button>
                </div>
            </div>
        </div>
    );
}
