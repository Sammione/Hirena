import React from 'react';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Settings, Shield } from 'lucide-react';

export default function Profile() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="card overflow-hidden">
                <div className="h-48 bg-brand-blue-900 relative">
                    <button className="absolute bottom-4 right-6 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-white/20 transition-all border border-white/20">
                        <Settings className="w-4 h-4" /> Edit Cover
                    </button>
                </div>
                <div className="px-8 pb-8">
                    <div className="relative flex flex-col md:flex-row md:items-end gap-6 -mt-12 mb-6">
                        <div className="w-32 h-32 rounded-3xl border-4 border-white bg-slate-100 overflow-hidden shadow-xl">
                            <img src="https://i.pravatar.cc/150?u=chidubem" alt="profile" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 pb-2">
                            <h1 className="text-3xl font-bold text-slate-900">Chidubem Okafor</h1>
                            <p className="text-slate-500 font-medium">Full Stack Developer • Lagos, Nigeria</p>
                        </div>
                        <div className="flex gap-3 pb-2">
                            <button className="btn-primary px-6 py-2 rounded-xl">Edit Profile</button>
                            <button className="p-2 border rounded-xl hover:bg-slate-50 transition-all text-slate-400">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                <Mail className="w-4 h-4" />
                            </div>
                            <div className="text-xs">
                                <p className="font-bold text-slate-900">Email</p>
                                <p className="text-slate-500">chidubem.o@hirena.me</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                <Phone className="w-4 h-4" />
                            </div>
                            <div className="text-xs">
                                <p className="font-bold text-slate-900">Phone</p>
                                <p className="text-slate-500">+234 (0) 812 345 6789</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <div className="text-xs">
                                <p className="font-bold text-slate-900">Location</p>
                                <p className="text-slate-500">Ikeja, Lagos</p>
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
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="card p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-brand-emerald-500" /> Professional Experience
                        </h2>
                        <div className="space-y-8">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex gap-4 relative before:absolute before:left-5 before:top-10 before:bottom-0 before:w-px before:bg-slate-100 last:before:hidden">
                                    <div className="w-10 h-10 rounded-lg border border-slate-100 flex-shrink-0 flex items-center justify-center p-2 bg-white z-10">
                                        <img src={`https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=50&h=50&fit=crop`} alt="company" className="rounded grayscale" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Senior Product Engineer</h3>
                                        <p className="text-sm font-medium text-slate-600">FinPay Solution • Full-time</p>
                                        <p className="text-xs text-slate-400 mt-1">Jan 2022 - Present • 2 yrs 4 mos</p>
                                        <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                                            Leading the migration of the core payment gateway from PHP to Node.js.
                                            Improving system throughput by 40% and reducing latency by 200ms.
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-brand-emerald-500" /> Education
                        </h2>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-lg border border-slate-100 flex items-center justify-center p-2">
                                    <GraduationCap className="w-5 h-5 text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">B.Sc Computer Science</h3>
                                    <p className="text-sm font-medium text-slate-600">University of Lagos</p>
                                    <p className="text-xs text-slate-400 mt-1">2014 - 2018</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="card p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-brand-emerald-500" /> Skills & Endorsements
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'System Design', 'UI/UX'].map(skill => (
                                <span key={skill} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:border-brand-emerald-300 transition-all cursor-default">
                                    {skill}
                                </span>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-2 text-sm font-bold text-brand-blue-900 hover:text-brand-blue-700 transition-all">
                            Add New Skill
                        </button>
                    </div>

                    <div className="card p-6 border-slate-900 bg-brand-emerald-50">
                        <h3 className="text-sm font-bold text-brand-blue-900 mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Verified Professional
                        </h3>
                        <p className="text-xs text-brand-blue-900/70 leading-relaxed font-medium">
                            Your profile is verified. Employers can see your validated skill endorsements.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
