import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { CalendarCheck2, UserCheck, AlertTriangle, Users, Clock, CheckCircle2, ChevronRight, BarChart2 } from 'lucide-react';

const AttendanceView: React.FC = () => {
    const { language, attendance, members, logAttendance, user } = useApp();
    const t = TRANSLATIONS[language];
    const [activeSection, setActiveSection] = useState<'today' | 'monthly' | 'absent'>('today');

    const today = new Date().toDateString();

    const todayRecords = useMemo(() =>
        attendance.filter(r => new Date(r.timestamp).toDateString() === today)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        [attendance]
    );

    const absentMembers = useMemo(() => {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return members.filter(m => {
            const lastCheckIn = attendance.filter(r => r.memberId === m.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
            return !lastCheckIn || new Date(lastCheckIn.timestamp).getTime() < sevenDaysAgo;
        });
    }, [members, attendance]);

    const monthlyStats = useMemo(() => {
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const monthAttendance = attendance.filter(r => {
            const d = new Date(r.timestamp);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        });
        const memberStats = members.map(m => ({
            ...m,
            sessions: monthAttendance.filter(r => r.memberId === m.id).length,
        })).sort((a, b) => b.sessions - a.sessions);
        return memberStats;
    }, [attendance, members]);

    const tabs = [
        { id: 'today', label: t.todayAttendance, icon: <UserCheck size={16} /> },
        { id: 'monthly', label: t.monthlyReport, icon: <BarChart2 size={16} /> },
        { id: 'absent', label: t.absentAlert, icon: <AlertTriangle size={16} />, badge: absentMembers.length },
    ];

    const methodColor = (method: string) => {
        if (method === 'qr') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        if (method === 'face') return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
        return 'text-green-400 bg-green-500/10 border-green-500/20';
    };

    return (
        <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-500 pb-12">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/20">
                    <CalendarCheck2 className="text-green-400" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{t.attendance}</h1>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                        {todayRecords.length} check-ins today
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSection(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeSection === tab.id ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'text-gray-500 hover:text-white'}`}
                    >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                        {tab.badge ? <span className="bg-red-500 text-white text-[9px] px-1.5 rounded-full">{tab.badge}</span> : null}
                    </button>
                ))}
            </div>

            {/* Today Section */}
            {activeSection === 'today' && (
                <div className="space-y-4">
                    {/* Quick manual check-in (admin/trainer only) */}
                    {(user?.role === 'admin' || user?.role === 'trainer') && (
                        <div className="bg-[#111] rounded-[2rem] border border-white/5 p-5">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">{t.markPresent} — Quick Add</p>
                            <div className="flex flex-wrap gap-2">
                                {members.map(m => {
                                    const checked = todayRecords.some(r => r.memberId === m.id);
                                    return (
                                        <button
                                            key={m.id}
                                            onClick={() => !checked && logAttendance(m.id, m.name, 'manual')}
                                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${checked ? 'bg-green-500/10 text-green-400 border-green-500/20 cursor-default' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'}`}
                                        >
                                            {checked && <span className="mr-1">✓</span>}{m.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Today's log */}
                    <div className="bg-[#111] rounded-[2rem] border border-white/5 overflow-hidden">
                        <div className="p-5 border-b border-white/5 flex items-center justify-between">
                            <h3 className="font-black uppercase tracking-widest text-sm text-green-400">{t.todayAttendance}</h3>
                            <span className="text-xs text-gray-500">{new Date().toLocaleDateString()}</span>
                        </div>
                        {todayRecords.length === 0 ? (
                            <div className="flex flex-col items-center py-16 text-gray-600">
                                <CalendarCheck2 size={48} className="mb-3 opacity-20" />
                                <p className="text-sm font-bold">No check-ins yet today</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {todayRecords.map(r => (
                                    <div key={r.id} className="flex items-center justify-between px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-green-500/10 rounded-xl flex items-center justify-center text-sm font-black text-green-400">
                                                {r.memberName[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{r.memberName}</p>
                                                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                                    <Clock size={10} /> {new Date(r.timestamp).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${methodColor(r.method)}`}>
                                            {r.method.toUpperCase()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Monthly Report */}
            {activeSection === 'monthly' && (
                <div className="bg-[#111] rounded-[2rem] border border-white/5 overflow-hidden">
                    <div className="p-5 border-b border-white/5">
                        <h3 className="font-black uppercase tracking-widest text-sm text-green-400">{t.monthlyReport} — {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        {monthlyStats.map((m, i) => (
                            <div key={m.id} className="flex items-center justify-between px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-gray-400/20 text-gray-300' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-gray-500'}`}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{m.name}</p>
                                        <p className="text-[10px] text-gray-500">{m.sessions} sessions this month</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 bg-white/5 rounded-full w-24 overflow-hidden">
                                        <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.min(100, (m.sessions / 30) * 100)}%` }} />
                                    </div>
                                    <span className="text-xs font-black text-green-400 w-6 text-right">{m.sessions}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Absent Alert */}
            {activeSection === 'absent' && (
                <div className="space-y-3">
                    {absentMembers.length === 0 ? (
                        <div className="bg-[#111] rounded-[2rem] border border-green-500/20 flex flex-col items-center py-16 text-gray-500">
                            <CheckCircle2 size={48} className="text-green-500 mb-3" />
                            <p className="font-bold">All members have checked in recently!</p>
                        </div>
                    ) : absentMembers.map(m => {
                        const last = attendance.filter(r => r.memberId === m.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                        const daysAgo = last ? Math.floor((Date.now() - new Date(last.timestamp).getTime()) / (1000 * 60 * 60 * 24)) : null;
                        return (
                            <div key={m.id} className="bg-[#111] rounded-[2rem] border border-red-500/20 px-5 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-sm font-black text-red-400">
                                        {m.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{m.name}</p>
                                        <p className="text-[10px] text-red-400 font-bold">
                                            {daysAgo === null ? 'Never checked in' : `Last seen ${daysAgo} days ago`}
                                        </p>
                                    </div>
                                </div>
                                <AlertTriangle size={18} className="text-red-500 animate-pulse" />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AttendanceView;
