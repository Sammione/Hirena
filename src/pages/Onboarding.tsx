import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Briefcase, GraduationCap, Code, ArrowRight, Sparkles, Check } from 'lucide-react';
import { cn } from '../utils/cn';

export default function Onboarding() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [profile, setProfile] = useState({
        target_role: '',
        experience_level: '',
        skills: [] as string[]
    });

    const [skillInput, setSkillInput] = useState('');

    const handleNext = () => setStep(prev => prev + 1);

    const toggleSkill = (skill: string) => {
        setProfile(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill]
        }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('profiles')
                .update({
                    target_role: profile.target_role,
                    experience_level: profile.experience_level,
                    skills: profile.skills,
                    onboarded: true // I'll need to add this column or use existence of data
                })
                .eq('id', user.id);

            if (error) throw error;

            // Hard reload to refresh all auth states
            window.location.href = '/dashboard';
        } catch (err) {
            console.error('Onboarding failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const commonSkills = [
        'React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'UI/UX Design',
        'Project Management', 'Java', 'Go', 'SQL', 'PostgreSQL', 'NoSQL', 'MongoDB',
        'C++', 'C#', 'PHP', 'Laravel', 'Swift', 'Kotlin', 'Flutter', 'React Native',
        'GraphQL', 'REST API', 'Kubernetes', 'Terraform', 'CI/CD', 'Jenkins',
        'Data Analysis', 'Machine Learning', 'AI', 'NLP', 'Cloud Computing',
        'Cybersecurity', 'Agile', 'Scrum', 'Product Management', 'Digital Marketing',
        'Sales', 'Customer Success', 'Business Development', 'Finance', 'Accounting'
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-emerald-500/5 rounded-full blur-[100px] -mr-64 -mt-64"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-blue-900/5 rounded-full blur-[100px] -ml-64 -mb-64"></div>

            <div className="max-w-md w-full relative z-10">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-500",
                                    step >= i ? "w-12 bg-brand-emerald-500" : "w-6 bg-slate-200"
                                )}
                            />
                        ))}
                    </div>
                </div>

                <div className="card p-8 bg-white shadow-2xl shadow-slate-900/5 border-slate-100 rounded-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="p-3 bg-brand-emerald-50 rounded-2xl w-fit">
                                <Briefcase className="w-8 h-8 text-brand-emerald-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 leading-tight">What's your dream role?</h1>
                                <p className="text-slate-500 font-medium mt-2">We'll use this to match you with global opportunities.</p>
                            </div>
                            <input
                                type="text"
                                placeholder="e.g. Senior Frontend Engineer"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-emerald-500/10 focus:border-brand-emerald-500 outline-none font-bold transition-all"
                                value={profile.target_role}
                                onChange={(e) => setProfile(prev => ({ ...prev, target_role: e.target.value }))}
                            />
                            <button
                                onClick={handleNext}
                                disabled={!profile.target_role}
                                className="w-full py-4 bg-brand-blue-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-brand-blue-800 transition-all shadow-xl shadow-brand-blue-900/20 disabled:opacity-50"
                            >
                                Continue <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="p-3 bg-indigo-50 rounded-2xl w-fit">
                                <GraduationCap className="w-8 h-8 text-indigo-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 leading-tight">Experience level?</h1>
                                <p className="text-slate-500 font-medium mt-2">Tell us where you are in your journey.</p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {['Junior (0-2 yrs)', 'Mid-Level (3-5 yrs)', 'Senior (5+ yrs)', 'Lead/Architect'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setProfile(prev => ({ ...prev, experience_level: level }))}
                                        className={cn(
                                            "w-full p-4 rounded-2xl border-2 transition-all font-bold text-left flex items-center justify-between",
                                            profile.experience_level === level
                                                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                                                : "bg-slate-50 border-transparent text-slate-600 hover:border-slate-200"
                                        )}
                                    >
                                        {level}
                                        {profile.experience_level === level && <Check className="w-5 h-5" />}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleNext}
                                disabled={!profile.experience_level}
                                className="w-full py-4 bg-brand-blue-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-brand-blue-800 transition-all shadow-xl shadow-brand-blue-900/20 disabled:opacity-50"
                            >
                                Almost there <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="p-3 bg-brand-emerald-50 rounded-2xl w-fit">
                                <Code className="w-8 h-8 text-brand-emerald-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 leading-tight">Top Skills?</h1>
                                <p className="text-slate-500 font-medium mt-2">Pick your core weapons or add custom ones.</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {commonSkills.map(skill => (
                                    <button
                                        key={skill}
                                        onClick={() => toggleSkill(skill)}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-bold transition-all border-2",
                                            profile.skills.includes(skill)
                                                ? "bg-brand-emerald-500 border-brand-emerald-500 text-white shadow-lg shadow-brand-emerald-500/20"
                                                : "bg-slate-50 border-transparent text-slate-600 hover:border-slate-200"
                                        )}
                                    >
                                        {skill}
                                    </button>
                                ))}
                            </div>

                            <div className="relative mt-4">
                                <input
                                    type="text"
                                    placeholder="Add other skills..."
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-emerald-500/10 focus:border-brand-emerald-500 outline-none font-bold transition-all text-sm"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && skillInput.trim()) {
                                            toggleSkill(skillInput.trim());
                                            setSkillInput('');
                                        }
                                    }}
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || profile.skills.length === 0}
                                className="w-full py-4 bg-brand-blue-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-brand-blue-800 transition-all shadow-xl shadow-brand-blue-900/20 disabled:opacity-50"
                            >
                                {isLoading ? 'Finalizing...' : 'Enter Hirena Dashboard'} <Sparkles className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
