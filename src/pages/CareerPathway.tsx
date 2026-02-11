import React, { useState } from 'react';
import { CheckCircle2, Circle, Lock, ArrowRight, BookOpen, Clock, Award, Loader2, Sparkles } from 'lucide-react';
import { careerRoadmap as mockRoadmap } from '../data/mockData';
import { cn } from '../utils/cn';
import { createCareerRoadmap, CareerRoadmap } from '../lib/openai';

export default function CareerPathway() {
    const [targetRole, setTargetRole] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [customRoadmap, setCustomRoadmap] = useState<CareerRoadmap | null>(null);

    const handleGenerateRoadmap = async () => {
        if (!targetRole) return;
        setIsGenerating(true);
        try {
            const roadmap = await createCareerRoadmap(targetRole, ['JavaScript', 'React', 'Tailwind']);
            setCustomRoadmap(roadmap);
        } catch (error) {
            console.error('Failed to generate roadmap:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const roadmapToDisplay = customRoadmap
        ? customRoadmap.milestones.map((m, i) => ({
            id: i + 1,
            title: m.title,
            status: i === 0 ? 'In Progress' : 'Locked',
            duration: m.estimatedDuration,
            skills: m.skillsToLearn,
            description: m.description
        }))
        : mockRoadmap;

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
                    {customRoadmap && (
                        <div className="mb-8 p-4 bg-brand-emerald-50 border border-brand-emerald-100 rounded-2xl text-brand-emerald-900 text-sm font-medium animate-in slide-in-from-top-4">
                            <Sparkles className="w-5 h-5 mb-2" />
                            <p>{customRoadmap.summary}</p>
                        </div>
                    )}

                    <div className="space-y-12 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {roadmapToDisplay.map((stage, index) => (
                            <div key={stage.id} className="relative pl-16 group">
                                <div className={cn(
                                    "absolute left-0 top-1 w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-all",
                                    stage.status === 'Completed' ? "bg-brand-emerald-500" :
                                        stage.status === 'In Progress' ? "bg-brand-blue-900 animate-pulse" : "bg-slate-200"
                                )}>
                                    {stage.status === 'Completed' && <CheckCircle2 className="w-6 h-6 text-white" />}
                                    {stage.status === 'In Progress' && <Circle className="w-6 h-6 text-white" />}
                                    {stage.status === 'Locked' && <Lock className="w-4 h-4 text-slate-500" />}
                                </div>

                                <div className={cn(
                                    "card p-6 transition-all",
                                    stage.status === 'In Progress' ? "border-brand-emerald-500 shadow-lg shadow-brand-emerald-500/5" : "hover:border-slate-300"
                                )}>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                                                    stage.status === 'Completed' ? "bg-brand-emerald-50 text-brand-emerald-600" :
                                                        stage.status === 'In Progress' ? "bg-brand-blue-50 text-brand-blue-600" : "bg-slate-100 text-slate-500"
                                                )}>
                                                    Module {index + 1} • {stage.status}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900">{stage.title}</h3>
                                            {'description' in stage && (
                                                <p className="mt-2 text-sm text-slate-600 leading-relaxed font-medium">{stage.description as string}</p>
                                            )}
                                            <div className="flex items-center gap-4 mt-3 text-sm text-slate-500 font-medium">
                                                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {stage.duration}</span>
                                                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {stage.skills.length} skills</span>
                                            </div>
                                        </div>
                                        {stage.status !== 'Locked' && (
                                            <button className={cn(
                                                "px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all",
                                                stage.status === 'Completed' ? "text-brand-emerald-600 bg-brand-emerald-50 hover:bg-brand-emerald-100" :
                                                    "text-white bg-brand-blue-900 hover:bg-brand-blue-800"
                                            )}>
                                                {stage.status === 'Completed' ? 'Review Content' : 'Continue Learning'} <ArrowRight className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4">
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
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Milestone Progress</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-500 font-medium">Stage 2 Progress</span>
                                    <span className="text-brand-blue-900 font-bold">65%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-brand-emerald-500 w-[65%] rounded-full"></div>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Award className="w-5 h-5 text-brand-emerald-500" />
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900">Next Badge</h4>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                    Complete 'Modern Frameworks' to earn the <b>React Specialist</b> badge and unlock 15+ job matches.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
