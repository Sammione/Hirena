import React from 'react';
import {
    TrendingUp,
    Briefcase,
    Target,
    ArrowUpRight,
    ChevronRight,
    BookOpen
} from 'lucide-react';
import {
    ResponsiveContainer,
    RadialBarChart,
    RadialBar,
    Legend,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import { userStats } from '../data/mockData';

const skillGapData = [
    { name: 'Cloud', gap: 40, fill: '#102a43' },
    { name: 'Testing', gap: 60, fill: '#10b981' },
    { name: 'CI/CD', gap: 20, fill: '#334e68' },
];

export default function Dashboard() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">Welcome back, Chidubem</h1>
                <p className="text-slate-500">Here's what's happening with your career progress today.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={TrendingUp}
                    label="Readiness Score"
                    value={`${userStats.readinessScore}%`}
                    trend="+5% this month"
                    color="emerald"
                />
                <StatCard
                    icon={Briefcase}
                    label="Job Matches"
                    value={userStats.jobMatches.toString()}
                    trend="12 new today"
                    color="blue"
                />
                <StatCard
                    icon={Target}
                    label="Skill Gaps"
                    value="3 Priority"
                    trend="Decreased by 2"
                    color="indigo"
                />
                <StatCard
                    icon={BookOpen}
                    label="Learning Hours"
                    value="24h"
                    trend="+4h this week"
                    color="teal"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 card p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-bold text-slate-900">Skill Gap Overview</h2>
                        <button className="text-sm font-medium text-brand-emerald-600 hover:text-brand-emerald-700 flex items-center gap-1">
                            View Detailed Analysis <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={skillGapData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="gap" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Recommended Actions</h2>
                    <div className="space-y-4">
                        {userStats.recommendedActions.map((item) => (
                            <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-brand-emerald-200 transition-all cursor-pointer group">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className={cn(
                                            "text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-white border mb-2 inline-block",
                                            item.type === 'Learning' ? "text-emerald-600 border-emerald-100" : "text-blue-600 border-blue-100"
                                        )}>
                                            {item.type}
                                        </span>
                                        <p className="text-sm font-semibold text-slate-900 group-hover:text-brand-emerald-700 transition-colors">
                                            {item.action}
                                        </p>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-brand-emerald-500 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-medium hover:border-brand-emerald-500 hover:text-brand-emerald-600 transition-all text-sm">
                        + Customize Roadmap
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, trend, color }: any) {
    const colors: any = {
        emerald: 'bg-emerald-50 text-emerald-600',
        blue: 'bg-blue-50 text-blue-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        teal: 'bg-teal-50 text-teal-600',
    };

    return (
        <div className="card p-6 flex flex-col justify-between">
            <div className="flex items-start justify-between">
                <div className={cn("p-3 rounded-xl", colors[color])}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div className="mt-4">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{value}</h3>
                <p className="text-xs font-medium text-emerald-600 mt-2 flex items-center gap-1">
                    {trend}
                </p>
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
