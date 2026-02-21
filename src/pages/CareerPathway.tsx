import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle2, Circle, Lock, ArrowRight, BookOpen, Clock, Award, Loader2, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';
import { createCareerRoadmap, CareerRoadmap } from '../lib/openai';

export default function CareerPathway() {
    const [targetRole, setTargetRole] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [customRoadmap, setCustomRoadmap] = useState<CareerRoadmap | null>(null);
    const [roadmapId, setRoadmapId] = useState<string | null>(null);

    useEffect(() => {
        fetchRoadmap();
    }, []);

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
            setCustomRoadmap({
                milestones: data.milestones,
                summary: data.summary
            });
        }
    };

    const updateRoadmapInDB = async (updatedRoadmap: CareerRoadmap) => {
        if (!roadmapId) return;
        try {
            await supabase
                .from('career_roadmaps')
                .update({
                    milestones: updatedRoadmap.milestones,
                    summary: updatedRoadmap.summary
                })
                .eq('id', roadmapId);
        } catch (err) {
            console.error('Failed to update roadmap:', err);
        }
    };

    const handleGenerateRoadmap = async () => {
        if (!targetRole) return;
        setIsGenerating(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const currentSkills = ['JavaScript', 'React', 'Tailwind']; // Fallback

            const roadmap = await createCareerRoadmap(targetRole, currentSkills);

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
        const resource = newRoadmap.milestones[mIdx].resources[rIdx];
        resource.completed = !resource.completed;
        setCustomRoadmap(newRoadmap);
        await updateRoadmapInDB(newRoadmap);
    };

    const toggleMilestone = async (mIdx: number) => {
        if (!customRoadmap) return;
        const newRoadmap = { ...customRoadmap };
        const milestone = newRoadmap.milestones[mIdx];
        milestone.completed = !milestone.completed;
        setCustomRoadmap(newRoadmap);
        await updateRoadmapInDB(newRoadmap);
    };

    const roadmapToDisplay = customRoadmap
        ? customRoadmap.milestones.map((m, i) => ({
            id: i + 1,
            title: m.title,
            status: m.completed ? 'Completed' : (i === 0 || customRoadmap.milestones[i - 1]?.completed ? 'In Progress' : 'Locked'),
            duration: m.estimatedDuration,
            skills: m.skillsToLearn,
            description: m.description,
            resources: m.resources || []
        }))
        : [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Your Career Pathway</h1>
                    <p className="text-slate-500">
                        {customRoadmap
                            ? `Your AI-generated path to becoming a ${targetRole}.`
                            : "Your personalized roadmap to becoming a Senior Software Architect."
                        }
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Enter target role (e.g. AI Engineer)"
                        className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-emerald-500 min-w-[240px]"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                    />
                    <button
                        onClick={handleGenerateRoadmap}
                        disabled={isGenerating || !targetRole}
                        className="btn-primary px-6 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Generate Roadmap
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                    {!customRoadmap && !isGenerating && (
                        <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900">No Roadmap Found</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">Enter a target role above and generate your AI-powered career pathway to get started.</p>
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
                                    <line
                                        x1="50%" y1="0" x2="50%" y2="100%"
                                        stroke="#E2E8F0"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                    <line
                                        x1="50%" y1="0" x2="50%" y2={`${(roadmapToDisplay.filter(s => s.status === 'Completed').length / roadmapToDisplay.length) * 100}%`}
                                        stroke="#10B981"
                                        strokeWidth="2"
                                        strokeLinecap="round"
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
                                    stage.status === 'In Progress' ? "border-brand-emerald-500 shadow-xl shadow-brand-emerald-500/10 ring-1 ring-brand-emerald-500/20" : "hover:border-brand-emerald-200 hover:shadow-lg hover:shadow-brand-emerald-500/5",
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
                                                    stage.status === 'Completed' ? "text-brand-emerald-700 bg-emerald-50 border border-brand-emerald-200" :
                                                        "text-white bg-brand-blue-900 hover:bg-brand-blue-800 shadow-brand-blue-900/20"
                                                )}
                                            >
                                                {stage.status === 'Completed' ? (
                                                    <><CheckCircle2 className="w-4 h-4" /> Completed</>
                                                ) : (
                                                    <>Mark Module as Done <ArrowRight className="w-4 h-4" /></>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Skills to Master</p>
                                            <div className="grid grid-cols-1 gap-3">
                                                {stage.skills.map(skill => (
                                                    <div key={skill} className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full",
                                                            stage.status === 'Completed' ? "bg-brand-emerald-500" : "bg-slate-300"
                                                        )}></div>
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
                                                                className={cn(
                                                                    "text-xs font-bold flex items-center gap-2 transition-colors",
                                                                    resource.completed ? "text-slate-400 line-through" : "text-brand-blue-900 hover:text-brand-emerald-500"
                                                                )}
                                                            >
                                                                {resource.platform === 'YouTube' ? <Sparkles className="w-3 h-3 text-red-500" /> : <Award className="w-3 h-3 text-blue-500" />}
                                                                {resource.title}
                                                            </a>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleResource(mIdx, rIdx);
                                                                }}
                                                                className={cn(
                                                                    "p-1.5 rounded-lg border transition-all",
                                                                    resource.completed ? "bg-brand-emerald-500 border-brand-emerald-500 text-white" : "border-slate-200 text-slate-300 hover:border-brand-emerald-500 hover:text-brand-emerald-500"
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
                        ></textarea>
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
                                        ></div>
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
                                        : "Start your journey to earn industry-recognized badges."
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
