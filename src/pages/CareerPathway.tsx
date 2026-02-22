import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    CheckCircle2, Circle, Lock, ArrowRight, BookOpen, Clock, Award,
    Loader2, Sparkles, TrendingUp, AlertTriangle, Zap, ChevronRight,
    BarChart3, Brain, Rocket
} from 'lucide-react';
import { cn } from '../utils/cn';
import { createCareerRoadmap, CareerRoadmap, generateCareerTimeline, CareerTimeline } from '../lib/openai';

const formatSalary = (amount: number, currency: string) => {
    if (currency === 'NGN') {
        if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
        return `₦${(amount / 1_000).toFixed(0)}K`;
    }
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount}`;
};

const urgencyColor = (urgency: string) => {
    if (urgency === 'high') return 'bg-red-50 border-red-200 text-red-700';
    if (urgency === 'medium') return 'bg-amber-50 border-amber-200 text-amber-700';
    return 'bg-slate-50 border-slate-200 text-slate-600';
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
    const [isGenerating, setIsGenerating] = useState(false);
    const [customRoadmap, setCustomRoadmap] = useState<CareerRoadmap | null>(null);
    const [roadmapId, setRoadmapId] = useState<string | null>(null);

    // Time Machine state
    const [timeline, setTimeline] = useState<CareerTimeline | null>(null);
    const [isGeneratingTimeline, setIsGeneratingTimeline] = useState(false);
    const [userCV, setUserCV] = useState('');
    const [userSkills, setUserSkills] = useState<string[]>([]);
    const [activeTimelineNode, setActiveTimelineNode] = useState(0);

    useEffect(() => {
        fetchRoadmap();
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
        if (cvData?.analysis?.skillGaps) {
            // extract skills from analysis
        }

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

    const fetchRoadmap = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('career_roadmaps')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (data) {
            setRoadmapId(data.id);
            setTargetRole(data.objective);
            setCustomRoadmap({ milestones: data.milestones, summary: data.summary });
        }
    };

    const updateRoadmapInDB = async (updatedRoadmap: CareerRoadmap) => {
        if (!roadmapId) return;
        try {
            await supabase.from('career_roadmaps').update({
                milestones: updatedRoadmap.milestones,
                summary: updatedRoadmap.summary
            }).eq('id', roadmapId);
        } catch (err) {
            console.error('Failed to update roadmap:', err);
        }
    };

    const handleGenerateRoadmap = async () => {
        if (!targetRole) return;
        setIsGenerating(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const roadmap = await createCareerRoadmap(targetRole, userSkills.length ? userSkills : ['JavaScript', 'React', 'Tailwind']);
            if (user) {
                const { data, error: saveError } = await supabase.from('career_roadmaps').insert({
                    user_id: user.id,
                    objective: targetRole,
                    summary: roadmap.summary,
                    milestones: roadmap.milestones
                }).select().single();
                if (saveError) throw saveError;
                if (data) setRoadmapId(data.id);
            }
            setCustomRoadmap(roadmap);
        } catch (error) {
            console.error('Failed to generate roadmap:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleResource = async (mIdx: number, rIdx: number) => {
        if (!customRoadmap) return;
        const newRoadmap = { ...customRoadmap };
        newRoadmap.milestones[mIdx].resources[rIdx].completed = !newRoadmap.milestones[mIdx].resources[rIdx].completed;
        setCustomRoadmap(newRoadmap);
        await updateRoadmapInDB(newRoadmap);
    };

    const toggleMilestone = async (mIdx: number) => {
        if (!customRoadmap) return;
        const newRoadmap = { ...customRoadmap };
        newRoadmap.milestones[mIdx].completed = !newRoadmap.milestones[mIdx].completed;
        setCustomRoadmap(newRoadmap);
        await updateRoadmapInDB(newRoadmap);
    };

    const roadmapToDisplay = (customRoadmap && Array.isArray(customRoadmap.milestones))
        ? customRoadmap.milestones.map((m, i) => ({
            id: i + 1,
            title: m?.title || 'Unknown Milestone',
            status: m?.completed ? 'Completed' : (i === 0 || customRoadmap.milestones[i - 1]?.completed ? 'In Progress' : 'Locked'),
            duration: m?.estimatedDuration || 'TBD',
            skills: Array.isArray(m?.skillsToLearn) ? m.skillsToLearn : [],
            description: m?.description || '',
            resources: Array.isArray(m?.resources) ? m.resources : []
        }))
        : [];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">

            {/* ═══════════════════════════════════════════════════ */}
            {/*              CAREER TIME MACHINE                    */}
            {/* ═══════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-blue-900 via-slate-900 to-slate-800 p-8 text-white shadow-2xl">
                {/* bg decorations */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full -ml-24 -mb-24 blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/10 rounded-2xl">
                                <Brain className="w-7 h-7 text-brand-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">⏳ Career Time Machine</h2>
                                <p className="text-sm text-white/60 font-medium">AI predicts your future — based on your real skills & market data</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleGenerateTimeline()}
                            disabled={isGeneratingTimeline || !targetRole}
                            className="flex items-center gap-2 px-6 py-3 bg-brand-emerald-500 hover:bg-brand-emerald-400 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-emerald-500/30 active:scale-95 disabled:opacity-50 whitespace-nowrap"
                        >
                            {isGeneratingTimeline
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Predicting...</>
                                : <><Sparkles className="w-4 h-4" /> Predict My Future</>
                            }
                        </button>
                    </div>

                    {isGeneratingTimeline && (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-4 border-brand-emerald-500/30 border-t-brand-emerald-500 animate-spin" />
                                <Brain className="w-6 h-6 text-brand-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <p className="text-white/70 font-medium text-sm">Analysing your skills against global market data...</p>
                        </div>
                    )}

                    {!timeline && !isGeneratingTimeline && (
                        <div className="text-center py-12 border border-white/10 rounded-2xl bg-white/5">
                            <Rocket className="w-10 h-10 text-white/20 mx-auto mb-3" />
                            <p className="text-white/50 font-medium text-sm">
                                {targetRole
                                    ? `Click "Predict My Future" to see your career trajectory as a ${targetRole}`
                                    : 'Set your target role below first, then come back here to see your future.'
                                }
                            </p>
                        </div>
                    )}

                    {timeline && !isGeneratingTimeline && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* Summary */}
                            <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                                <p className="text-white/90 font-medium text-sm leading-relaxed">{timeline.summary}</p>
                            </div>

                            {/* Current salary baseline */}
                            <div className="flex items-center gap-2 text-xs text-white/50 font-bold uppercase tracking-widest">
                                <BarChart3 className="w-4 h-4" />
                                Current baseline: {formatSalary(timeline.currentSalaryMin, timeline.currency)} – {formatSalary(timeline.currentSalaryMax, timeline.currency)}/yr as {timeline.currentTitle}
                            </div>

                            {/* Timeline nodes */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {(timeline.timeline || []).map((node, i) => {
                                    const colors = periodColors[i] || periodColors[3];
                                    const isActive = activeTimelineNode === i;
                                    return (
                                        <button
                                            key={node.period}
                                            onClick={() => setActiveTimelineNode(i)}
                                            className={cn(
                                                "text-left p-4 rounded-2xl border-2 transition-all duration-300",
                                                isActive
                                                    ? "bg-white text-slate-900 border-white scale-105 shadow-2xl"
                                                    : "bg-white/10 border-white/10 hover:bg-white/15 hover:border-white/20"
                                            )}
                                        >
                                            <div className={cn("text-[10px] font-black uppercase tracking-widest mb-2", isActive ? "text-brand-emerald-600" : "text-white/50")}>
                                                {node.period}
                                            </div>
                                            <div className={cn("text-base font-black leading-tight mb-1", isActive ? "text-slate-900" : "text-white")}>
                                                {node.title}
                                            </div>
                                            <div className={cn("text-sm font-bold", isActive ? "text-brand-emerald-600" : "text-brand-emerald-400")}>
                                                {formatSalary(node.salary_min, node.salary_currency)} – {formatSalary(node.salary_max, node.salary_currency)}
                                            </div>
                                            <div className="mt-3">
                                                <div className={cn("text-[10px] font-bold mb-1", isActive ? "text-slate-500" : "text-white/40")}>
                                                    {node.probability}% likely
                                                </div>
                                                <div className={cn("w-full h-1.5 rounded-full", isActive ? "bg-slate-100" : "bg-white/10")}>
                                                    <div
                                                        className={cn("h-full rounded-full transition-all duration-700", isActive ? "bg-brand-emerald-500" : "bg-brand-emerald-400")}
                                                        style={{ width: `${node.probability}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Active node detail */}
                            {timeline.timeline?.[activeTimelineNode] && (
                                <div className="p-5 bg-white/10 rounded-2xl border border-white/10 flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-300">
                                    <div className="p-3 bg-brand-emerald-500/20 rounded-xl flex-shrink-0">
                                        <Zap className="w-5 h-5 text-brand-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/50 font-bold uppercase tracking-widest mb-0.5">Key skill to unlock {timeline.timeline[activeTimelineNode].period}</p>
                                        <p className="text-white font-black text-lg">{timeline.timeline[activeTimelineNode].key_skill}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-white/30 ml-auto" />
                                </div>
                            )}

                            {/* Risk + Opportunity split */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Risk Alerts */}
                                <div className="space-y-3">
                                    <p className="text-xs font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                                        <AlertTriangle className="w-3.5 h-3.5" /> Skill Risk Alerts
                                    </p>
                                    {(timeline.riskAlerts || []).map((alert, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-red-500/20">
                                            <span className={cn("mt-1.5 w-2 h-2 rounded-full flex-shrink-0", urgencyDot(alert.urgency))} />
                                            <div>
                                                <p className="text-white font-bold text-sm">{alert.skill}</p>
                                                <p className="text-white/50 text-xs font-medium">{alert.risk}</p>
                                            </div>
                                            <span className={cn(
                                                "ml-auto px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex-shrink-0",
                                                alert.urgency === 'high' ? 'bg-red-500/20 text-red-300' :
                                                    alert.urgency === 'medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-white/50'
                                            )}>
                                                {alert.urgency}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Opportunities */}
                                <div className="space-y-3">
                                    <p className="text-xs font-black uppercase tracking-widest text-brand-emerald-400 flex items-center gap-2">
                                        <TrendingUp className="w-3.5 h-3.5" /> Hot Opportunities
                                    </p>
                                    {(timeline.opportunities || []).map((opp, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-brand-emerald-500/20">
                                            <div className="mt-1 p-1 bg-brand-emerald-500/20 rounded-md flex-shrink-0">
                                                <Zap className="w-3 h-3 text-brand-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-sm">{opp.skill}</p>
                                                <p className="text-white/50 text-xs font-medium">{opp.reason}</p>
                                            </div>
                                            <span className="ml-auto px-2 py-0.5 bg-brand-emerald-500/20 text-brand-emerald-300 rounded-full text-[10px] font-black uppercase flex-shrink-0">
                                                {opp.timeToLearn}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Do nothing warning */}
                            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-1">If you do nothing...</p>
                                    <p className="text-white/70 text-sm font-medium">{timeline.doNothingOutcome}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════ */}
            {/*              CAREER PATHWAY (Roadmap)               */}
            {/* ═══════════════════════════════════════════════════ */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Your Career Pathway</h1>
                    <p className="text-slate-500">
                        {customRoadmap
                            ? `Your AI-generated path to becoming a ${targetRole}.`
                            : 'Generate a personalized learning roadmap to reach your goal.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Enter target role (e.g. AI Engineer)"
                        className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-emerald-500 min-w-[240px] text-sm font-medium"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateRoadmap()}
                    />
                    <button
                        onClick={handleGenerateRoadmap}
                        disabled={isGenerating || !targetRole}
                        className="bg-brand-blue-900 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap disabled:opacity-50 font-bold shadow-lg shadow-brand-blue-900/10 hover:bg-brand-blue-800 transition-all active:scale-95"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-brand-emerald-400" />}
                        Generate Roadmap
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                    {isGenerating && (
                        <div className="space-y-8 animate-pulse">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="card p-8 border-slate-100 bg-white shadow-sm flex gap-6">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0" />
                                    <div className="flex-1 space-y-4">
                                        <div className="h-6 bg-slate-200 rounded w-1/4" />
                                        <div className="h-4 bg-slate-100 rounded w-full" />
                                        <div className="h-4 bg-slate-100 rounded w-2/3" />
                                        <div className="pt-4 grid grid-cols-2 gap-4">
                                            <div className="h-20 bg-slate-50 rounded-xl" />
                                            <div className="h-20 bg-slate-50 rounded-xl" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!customRoadmap && !isGenerating && (
                        <div className="text-center py-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No Roadmap Yet</h3>
                            <p className="text-slate-500 max-w-sm mx-auto font-medium">Enter your dream role above and we'll build a custom AI learning path with real courses just for you.</p>
                        </div>
                    )}

                    {customRoadmap && (
                        <div className="mb-8 p-6 bg-brand-emerald-50 border border-brand-emerald-100 rounded-2xl text-brand-emerald-900 text-sm font-medium animate-in slide-in-from-top-4 flex items-start gap-3">
                            <Sparkles className="w-5 h-5 mt-0.5 text-brand-emerald-600 flex-shrink-0" />
                            <p>{customRoadmap.summary}</p>
                        </div>
                    )}

                    <div className="relative space-y-12">
                        {roadmapToDisplay.length > 0 && (
                            <div className="absolute left-6 top-2 bottom-6 w-1 hidden md:block">
                                <svg className="h-full w-full overflow-visible">
                                    <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
                                    <line
                                        x1="50%" y1="0" x2="50%"
                                        y2={`${(roadmapToDisplay.filter(s => s.status === 'Completed').length / roadmapToDisplay.length) * 100}%`}
                                        stroke="#10B981" strokeWidth="2" strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                            </div>
                        )}

                        {roadmapToDisplay.map((stage, mIdx) => (
                            <div key={stage.id} className="relative pl-0 md:pl-16 group">
                                <div className={cn(
                                    "absolute left-0 top-1 w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-all duration-500 hidden md:flex",
                                    stage.status === 'Completed' ? "bg-brand-emerald-500 scale-110" :
                                        stage.status === 'In Progress' ? "bg-brand-blue-900 animate-pulse scale-110" : "bg-slate-200"
                                )}>
                                    {stage.status === 'Completed' && <CheckCircle2 className="w-6 h-6 text-white" />}
                                    {stage.status === 'In Progress' && <Circle className="w-6 h-6 text-white" />}
                                    {stage.status === 'Locked' && <Lock className="w-4 h-4 text-slate-500" />}
                                </div>

                                <div className={cn(
                                    "card p-6 transition-all duration-300",
                                    stage.status === 'In Progress' ? "border-brand-emerald-500 shadow-xl shadow-brand-emerald-500/10 ring-1 ring-brand-emerald-500/20" : "hover:border-brand-emerald-200 hover:shadow-lg",
                                    stage.status === 'Locked' && "opacity-70 grayscale-[0.5]"
                                )}>
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                                                    stage.status === 'Completed' ? "bg-brand-emerald-100 text-brand-emerald-700" :
                                                        stage.status === 'In Progress' ? "bg-brand-blue-50 text-brand-blue-700" : "bg-slate-100 text-slate-500"
                                                )}>
                                                    Module {mIdx + 1} • {stage.status}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-blue-900 transition-colors">{stage.title}</h3>
                                            <p className="mt-2 text-sm text-slate-600 leading-relaxed font-medium">{stage.description}</p>
                                            <div className="flex items-center gap-4 mt-3 text-xs font-bold text-slate-400 uppercase tracking-wide">
                                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {stage.duration}</span>
                                                <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> {stage.skills.length} skills</span>
                                            </div>
                                        </div>

                                        {stage.status !== 'Locked' && (
                                            <button
                                                onClick={() => toggleMilestone(mIdx)}
                                                className={cn(
                                                    "px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 whitespace-nowrap",
                                                    stage.status === 'Completed'
                                                        ? "text-brand-emerald-700 bg-emerald-50 border border-brand-emerald-200"
                                                        : "text-white bg-brand-blue-900 hover:bg-brand-blue-800 shadow-brand-blue-900/20"
                                                )}
                                            >
                                                {stage.status === 'Completed'
                                                    ? <><CheckCircle2 className="w-4 h-4" /> Completed</>
                                                    : <>Mark Module as Done <ArrowRight className="w-4 h-4" /></>
                                                }
                                            </button>
                                        )}
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Skills to Master</p>
                                            <div className="grid grid-cols-1 gap-3">
                                                {stage.skills.map(skill => (
                                                    <div key={skill} className="flex items-center gap-2">
                                                        <div className={cn("w-2 h-2 rounded-full", stage.status === 'Completed' ? "bg-brand-emerald-500" : "bg-slate-300")} />
                                                        <span className="text-xs font-bold text-slate-600">{skill}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {stage.status !== 'Locked' && (
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">AI Selected Resources</p>
                                                <div className="space-y-3">
                                                    {stage.resources.map((resource, rIdx) => (
                                                        <div key={resource.url} className="flex items-center justify-between group/res">
                                                            <a
                                                                href={resource.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={e => e.stopPropagation()}
                                                                className={cn(
                                                                    "text-xs font-bold flex items-center gap-2 transition-colors",
                                                                    resource.completed ? "text-slate-400 line-through" : "text-brand-blue-900 hover:text-brand-emerald-500"
                                                                )}
                                                            >
                                                                {resource.platform === 'YouTube' ? <Sparkles className="w-3 h-3 text-red-500" /> : <Award className="w-3 h-3 text-blue-500" />}
                                                                {resource.title}
                                                            </a>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); toggleResource(mIdx, rIdx); }}
                                                                className={cn(
                                                                    "p-1.5 rounded-lg border transition-all",
                                                                    resource.completed
                                                                        ? "bg-brand-emerald-500 border-brand-emerald-500 text-white"
                                                                        : "border-slate-200 text-slate-300 hover:border-brand-emerald-500 hover:text-brand-emerald-500"
                                                                )}
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="card p-6 border-brand-emerald-500 bg-brand-emerald-50/20">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-brand-emerald-500" />
                            AI Career Advice
                        </h3>
                        <p className="text-sm text-slate-600 mb-4 font-medium leading-relaxed">
                            Need help choosing your next step? Ask our AI Career Coach.
                        </p>
                        <textarea
                            className="w-full h-24 p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-emerald-500 mb-4 bg-white"
                            placeholder="How can I transition from Frontend to Backend?"
                        />
                        <button className="w-full btn-secondary py-3 rounded-xl text-sm font-bold shadow-lg shadow-brand-emerald-500/10">
                            Ask Career AI
                        </button>
                    </div>

                    <div className="card p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Overall Progress</h3>
                        <div className="space-y-6">
                            {customRoadmap ? (
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-500 font-medium">Roadmap Completion</span>
                                        <span className="text-brand-blue-900 font-bold">
                                            {Math.round((roadmapToDisplay.filter(s => s.status === 'Completed').length / (roadmapToDisplay.length || 1)) * 100)}%
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-brand-emerald-500 transition-all duration-1000"
                                            style={{ width: `${(roadmapToDisplay.filter(s => s.status === 'Completed').length / (roadmapToDisplay.length || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 text-center py-4 italic font-medium">Generate a roadmap to track your progress.</p>
                            )}

                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Award className="w-5 h-5 text-brand-emerald-500" />
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900">Next Badge</h4>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                    {customRoadmap
                                        ? `Complete "${roadmapToDisplay.find(s => s.status === 'In Progress')?.title || 'your path'}" to earn your next career badge.`
                                        : 'Start your journey to earn industry-recognized badges.'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
