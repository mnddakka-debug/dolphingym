import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Video, Users, Clock, CalendarDays, ExternalLink, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LiveTrainingView: React.FC = () => {
    const { language, user, liveSessions, joinLiveSession } = useApp();
    const t = TRANSLATIONS[language];
    const [now, setNow] = useState(Date.now());

    // Update clock every minute to check if sessions are starting
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(interval);
    }, []);

    // Sort upcoming sessions first
    const sortedSessions = [...liveSessions].sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());

    const isLive = (scheduledTime: string, durationMins: number) => {
        const start = new Date(scheduledTime).getTime();
        const end = start + (durationMins * 60 * 1000);
        return now >= start && now <= end;
    };

    const isPast = (scheduledTime: string, durationMins: number) => {
        const start = new Date(scheduledTime).getTime();
        const end = start + (durationMins * 60 * 1000);
        return now > end;
    };

    const timeUntil = (scheduledTime: string) => {
        const start = new Date(scheduledTime).getTime();
        const diffBase = start - now;
        if (diffBase <= 0) return 'Starting soon';

        const diffMins = Math.floor(diffBase / (1000 * 60));
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `In ${days} day${days > 1 ? 's' : ''}`;
        }
        if (hours > 0) return `In ${hours}h ${mins}m`;
        return `In ${mins} minutes`;
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-20 w-full max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                        <div className="relative">
                            <Video className="text-purple-500" size={24} />
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-white">Live Classes</h1>
                        <p className="text-[10px] sm:text-xs text-purple-400/80 font-black uppercase tracking-widest mt-1">Join the Community in Real-Time</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-bold text-white mb-2 pl-1">Upcoming Sessions</h2>
                <AnimatePresence>
                    {sortedSessions.map((session) => {
                        const live = isLive(session.scheduledTime, session.durationMins);
                        const past = isPast(session.scheduledTime, session.durationMins);
                        const hasJoined = user && session.participants.includes(user.id);

                        // Keep past sessions visible for demo, but typically they're hidden/moved
                        return (
                            <motion.div
                                key={session.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-[#111] border rounded-3xl p-6 relative overflow-hidden transition-all ${live
                                        ? 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
                                        : past
                                            ? 'border-white/5 opacity-50'
                                            : 'border-white/10 hover:border-white/20'
                                    }`}
                            >
                                {/* Live Badge Background */}
                                {live && (
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-red-500" />
                                )}

                                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            {live ? (
                                                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-red-500 text-white flex items-center gap-1.5 animate-pulse shadow-lg shadow-red-500/20">
                                                    <span className="w-1.5 h-1.5 bg-white rounded-full" /> Live Now
                                                </span>
                                            ) : past ? (
                                                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-gray-800 text-gray-400 border border-gray-700">
                                                    Ended
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                    Upcoming
                                                </span>
                                            )}
                                            <span className="text-sm font-bold text-white text-lg">{session.title}</span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-6 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">
                                            <div className="flex items-center gap-1.5">
                                                <CalendarDays size={14} className="text-gray-400" />
                                                {new Date(session.scheduledTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} className="text-gray-400" />
                                                {new Date(session.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                <span className="text-gray-600 normal-case ml-1">({session.durationMins}m)</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users size={14} className="text-gray-400" />
                                                {session.instructorName}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-3 w-full md:w-auto mt-2 md:mt-0">
                                        {!past && !live && (
                                            <div className="text-xs font-black text-purple-400 uppercase tracking-widest bg-purple-900/20 px-4 py-2 rounded-xl">
                                                {timeUntil(session.scheduledTime)}
                                            </div>
                                        )}

                                        {live && !hasJoined && (
                                            <button
                                                onClick={() => {
                                                    joinLiveSession(session.id);
                                                    window.open(session.meetLink, '_blank');
                                                }}
                                                className="w-full md:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-500/20 active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                Join Session <ExternalLink size={14} />
                                            </button>
                                        )}

                                        {hasJoined && (live || past) && (
                                            <div className="w-full md:w-auto px-6 py-3 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                                <CheckCircle2 size={16} /> Joined
                                            </div>
                                        )}

                                        {!live && !past && (
                                            <button
                                                className="w-full md:w-auto px-6 py-3 rounded-xl bg-[#222] hover:bg-[#333] text-gray-400 hover:text-white border border-white/5 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                            >
                                                Remind Me
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {liveSessions.length === 0 && (
                    <div className="p-12 border border-white/5 rounded-3xl bg-[#111] text-center">
                        <Video size={32} className="text-gray-600 mx-auto mb-3" />
                        <p className="text-sm font-bold text-gray-500">No live sessions scheduled to display right now.</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default LiveTrainingView;
