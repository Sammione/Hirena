import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Settings, Shield, Loader2, Save, X, Upload, Sparkles } from 'lucide-react';
import { VoicePitch } from '../components/VoicePitch';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import { parseCVToProfile } from '../lib/openai';
import { extractTextFromFile } from '../utils/docs';

export default function Profile() {
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isParsing, setIsParsing] = useState(false);

    const [editData, setEditData] = useState({
        full_name: '',
        target_role: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
        experience: [] as any[],
        skills: [] as string[]
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (data) {
                setProfile(data);
                setEditData({
                    full_name: data.full_name || '',
                    target_role: data.target_role || '',
                    email: data.email || user.email || '',
                    phone: data.phone || '',
                    location: data.location || '',
                    bio: data.bio || '',
                    experience: data.experience || [],
                    skills: data.skills || []
                });
            } else {
                // If no profile exists, create a blank one automatically
                const newProfile = {
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || '',
                    onboarded: false
                };
                await supabase.from('profiles').upsert(newProfile);
                setProfile(newProfile);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: editData.full_name,
                    target_role: editData.target_role,
                    email: editData.email,
                    phone: editData.phone,
                    location: editData.location,
                    bio: editData.bio,
                    experience: editData.experience,
                    skills: editData.skills,
                    onboarded: true,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            setIsEditing(false);
            fetchProfile();
        } catch (err) {
            console.error('Error saving profile:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('You must be logged in to upload a CV.');
                return;
            }

            const text = await extractTextFromFile(file);
            const data = await parseCVToProfile(text);

            const upsertData = {
                id: user.id,
                full_name: data.full_name || editData.full_name,
                target_role: data.target_role || editData.target_role,
                email: data.email || editData.email,
                phone: data.phone || editData.phone,
                location: data.location || editData.location,
                bio: data.bio || editData.bio,
                experience: data.experience || editData.experience,
                skills: Array.from(new Set([...editData.skills, ...(data.skills || [])])),
                onboarded: true,
                updated_at: new Date().toISOString()
            };

            const { error: upsertError } = await supabase
                .from('profiles')
                .upsert(upsertData);

            if (upsertError) throw upsertError;

            // NEW: Also save the raw text to cv_analyses so other pages can see it
            await supabase.from('cv_analyses').insert({
                user_id: user.id,
                cv_text: text,
                score: 70, // Default estimate
                readiness_score: 70
            });

            await fetchProfile();
            alert('Success! Your profile has been updated from your CV.');
        } catch (err: any) {
            console.error('Final Error Profile page:', err);
            alert(err.message || 'An unexpected error occurred while processing your CV.');
        } finally {
            setIsParsing(false);
            if (e.target) e.target.value = '';
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-brand-emerald-500 animate-spin mb-4" />
                <p className="text-slate-500 font-bold">Loading your professional profile...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="card overflow-hidden">
                <div className="h-48 bg-brand-blue-900 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-blue-900 via-brand-blue-800 to-indigo-900 opacity-80"></div>
                </div>
                <div className="px-8 pb-8 relative">
                    <div className="relative flex flex-col md:flex-row md:items-end gap-6 -mt-12 mb-6">
                        <div className="w-32 h-32 rounded-3xl border-4 border-white bg-slate-100 flex items-center justify-center shadow-xl z-20">
                            <User className="w-16 h-16 text-slate-300" />
                        </div>
                        <div className="flex-1 pb-2 z-20">
                            {isEditing ? (
                                <div className="space-y-2 max-w-md">
                                    <input
                                        className="text-2xl font-bold bg-white border border-slate-200 px-3 py-1 rounded-lg w-full"
                                        value={editData.full_name}
                                        onChange={e => setEditData({ ...editData, full_name: e.target.value })}
                                        placeholder="Full Name"
                                    />
                                    <input
                                        className="text-slate-500 font-medium bg-white border border-slate-200 px-3 py-1 rounded-lg w-full"
                                        value={editData.target_role}
                                        onChange={e => setEditData({ ...editData, target_role: e.target.value })}
                                        placeholder="Target Role"
                                    />
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-3xl font-bold text-slate-900">{profile?.full_name || 'Set Your Name'}</h1>
                                    <p className="text-slate-500 font-medium">{profile?.target_role || 'No Role Set'} • {profile?.location || 'Global'}</p>
                                </>
                            )}
                        </div>
                        <div className="flex gap-3 pb-2 z-20">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="btn-primary px-6 py-2 rounded-xl flex items-center gap-2"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <label className="bg-brand-emerald-50 text-brand-emerald-600 px-6 py-2 rounded-xl border border-brand-emerald-200 hover:bg-brand-emerald-100 transition-all font-bold cursor-pointer flex items-center gap-2">
                                        {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                        {isParsing ? 'Parsing CV...' : 'Import from CV'}
                                        <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={handleCVUpload} />
                                    </label>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="btn-primary px-6 py-2 rounded-xl"
                                    >
                                        Edit Profile
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Basic Info Fields in Edit Mode */}
                    {isEditing && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-6 bg-slate-50 rounded-2xl animate-in slide-in-from-bottom-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Email</label>
                                <input
                                    className="w-full bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm"
                                    value={editData.email}
                                    onChange={e => setEditData({ ...editData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Phone</label>
                                <input
                                    className="w-full bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm"
                                    value={editData.phone}
                                    onChange={e => setEditData({ ...editData, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Location</label>
                                <input
                                    className="w-full bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm"
                                    value={editData.location}
                                    onChange={e => setEditData({ ...editData, location: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {!isEditing && (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div className="text-xs">
                                    <p className="font-bold text-slate-900">Email</p>
                                    <p className="text-slate-500">{profile?.email || 'No email set'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div className="text-xs">
                                    <p className="font-bold text-slate-900">Phone</p>
                                    <p className="text-slate-500">{profile?.phone || 'No phone set'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div className="text-xs">
                                    <p className="font-bold text-slate-900">Location</p>
                                    <p className="text-slate-500">{profile?.location || 'No location set'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    <Briefcase className="w-4 h-4" />
                                </div>
                                <div className="text-xs">
                                    <p className="font-bold text-slate-900">Availability</p>
                                    <p className="text-brand-emerald-600 font-bold">Open to Offers</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Bio Section */}
                    {(profile?.bio || isEditing) && (
                        <div className="card p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-brand-emerald-500" /> Professional Summary
                            </h2>
                            {isEditing ? (
                                <textarea
                                    className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald-500/20"
                                    placeholder="Write a brief professional bio..."
                                    value={editData.bio}
                                    onChange={e => setEditData({ ...editData, bio: e.target.value })}
                                />
                            ) : (
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    {profile?.bio}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="card p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-brand-emerald-500" /> Professional Experience
                            </div>
                            {!isEditing && (
                                <button className="text-[10px] font-black uppercase tracking-widest text-brand-blue-900 hover:bg-slate-50 px-3 py-1 rounded-lg">Add Experience</button>
                            )}
                        </h2>
                        <div className="space-y-8">
                            {profile?.experience?.length > 0 ? (
                                profile.experience.map((exp: any, i: number) => (
                                    <div key={i} className="flex gap-4 relative last:after:hidden after:absolute after:left-5 after:top-10 after:bottom-0 after:w-px after:bg-slate-100">
                                        <div className="w-10 h-10 rounded-lg border border-slate-100 flex-shrink-0 flex items-center justify-center p-2 bg-white z-10 text-brand-blue-900">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{exp.title}</h3>
                                            <p className="text-sm font-medium text-slate-600">{exp.company}</p>
                                            <p className="text-xs text-slate-400 mt-1">{exp.duration}</p>
                                            <p className="text-sm text-slate-500 mt-3 leading-relaxed">{exp.description}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                    <Briefcase className="w-12 h-12 mb-4 opacity-20" />
                                    <p className="text-sm font-medium">No experience listed. Import your CV to populate this!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="card p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-brand-emerald-500" /> Skills & Expertise
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {(isEditing ? editData.skills : profile?.skills || []).length > 0 ? (
                                (isEditing ? editData.skills : profile?.skills).map((skill: string) => (
                                    <span key={skill} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2 group">
                                        {skill}
                                        {isEditing && (
                                            <button
                                                onClick={() => setEditData({ ...editData, skills: editData.skills.filter(s => s !== skill) })}
                                                className="hover:text-red-500"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </span>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 italic">No skills listed yet.</p>
                            )}
                        </div>
                        {isEditing && (
                            <div className="mt-4 flex gap-2">
                                <input
                                    placeholder="Add skill..."
                                    className="flex-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs"
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            const val = (e.target as HTMLInputElement).value.trim();
                                            if (val && !editData.skills.includes(val)) {
                                                setEditData({ ...editData, skills: [...editData.skills, val] });
                                                (e.target as HTMLInputElement).value = '';
                                            }
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="card p-6 border-slate-900 bg-brand-emerald-50">
                        <h3 className="text-sm font-bold text-brand-blue-900 mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Professional Profile
                        </h3>
                        <p className="text-xs text-brand-blue-900/70 leading-relaxed font-medium">
                            Keep your profile updated to receive personalized job matches and career pathway recommendations.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

