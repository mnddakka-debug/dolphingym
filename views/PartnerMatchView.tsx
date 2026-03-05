import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Users, CheckCircle, XCircle, UserPlus, Compass, Activity, Clock } from 'lucide-react';
import { motion } from 'motion/react';

const PartnerMatchView: React.FC = () => {
    const { language, user, members, matchRequests, sendMatchRequest, acceptMatchRequest } = useApp();
    const t = TRANSLATIONS[language];

    // Derive active requests
    const myIncomingRequests = matchRequests.filter(r => r.toUserId === user?.id && r.status === 'pending');
    const myOutgoingRequests = matchRequests.filter(r => r.fromUserId === user?.id);
    const myPartners = matchRequests.filter(r => r.status === 'accepted' && (r.fromUserId === user?.id || r.toUserId === user?.id));

    // Find matches (members with the same goal or preferred time)
    const matches = useMemo(() => {
        if (!user) return [];
        return members.filter(m => {
            if (m.id === user.id) return false;
            if (m.role !== 'member') return false;

            const isAlreadyPartner = myPartners.some(p => p.fromUserId === m.id || p.toUserId === m.id);
            if (isAlreadyPartner) return false;

            const hasPendingReq = [...myIncomingRequests, ...myOutgoingRequests].some(r => r.fromUserId === m.id || r.toUserId === m.id);
            if (hasPendingReq) return false;

            const sameGoal = m.goal && m.goal === user.goal;
            const sameTime = m.preferredWorkoutTime && m.preferredWorkoutTime === user.preferredWorkoutTime;

            // Suggest if at least one matches, weight higher if both
            return sameGoal || sameTime;
        }).sort((a, b) => {
            let scoreA = (a.goal === user.goal ? 1 : 0) + (a.preferredWorkoutTime === user.preferredWorkoutTime ? 1 : 0);
            let scoreB = (b.goal === user.goal ? 1 : 0) + (b.preferredWorkoutTime === user.preferredWorkoutTime ? 1 : 0);
            return scoreB - scoreA;
        }).slice(0, 10);
    }, [user, members, myPartners, myIncomingRequests, myOutgoingRequests]);

    const getTimeLabel = (time?: string) => {
        if (time === 'morning') return 'Morning (6 AM - 12 PM)';
        if (time === 'afternoon') return 'Afternoon (12 PM - 5 PM)';
        if (time === 'evening') return 'Evening (5 PM - 11 PM)';
        return 'Anytime';
    };

    const getGoalLabel = (goal?: string) => {
        if (!goal) return 'Stay Fit';
        return goal.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-12 w-full max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-gray-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">Community</h2>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mt-1 flex items-center gap-3">
                        <Users className="text-blue-500" size={32} /> Partner Matchmaker<span className="blue-gradient text-3xl lg:text-5xl">.</span>
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Recommendations */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-xl flex flex-col gap-5">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-black text-sm sm:text-base uppercase tracking-[0.2em] flex items-center gap-2">
                                <Compass size={18} className="text-blue-400" /> Recommended Partners
                            </h3>
                        </div>

                        {matches.length === 0 ? (
                            <div className="py-10 text-center text-gray-500 font-bold px-4 border border-dashed border-white/10 rounded-3xl">
                                No new matches available right now. Tell us more about your goals in settings to find better matches!
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {matches.map((m, i) => (
                                    <motion.div
                                        key={m.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-[#1a1a1a] border border-white/5 p-5 rounded-[2rem] flex flex-col gap-4 group hover:border-blue-500/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px]">
                                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                                    {m.profileImage ? (
                                                        <img src={m.profileImage} alt={m.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Users className="text-blue-400" size={24} />
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-white font-black text-lg">{m.name}</h4>
                                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{m.badges?.length || 0} Badges Earned</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 mt-2">
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-black/50 p-2 rounded-xl border border-white/5">
                                                <Activity size={14} className="text-green-400" /> Goal: <span className="text-white">{getGoalLabel(m.goal)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-black/50 p-2 rounded-xl border border-white/5">
                                                <Clock size={14} className="text-orange-400" /> Time: <span className="text-white">{getTimeLabel(m.preferredWorkoutTime)}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => sendMatchRequest(m.id)}
                                            className="mt-2 w-full bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 font-black uppercase tracking-widest text-xs py-3 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <UserPlus size={16} /> Send Request
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Requests & Active Partners */}
                <div className="flex flex-col gap-6">
                    {/* Incoming Requests */}
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-6 shadow-xl flex flex-col gap-5">
                        <h3 className="font-black text-sm uppercase tracking-[0.2em] flex items-center gap-2">
                            <Users size={18} className="text-purple-400" /> Pending Requests
                            {myIncomingRequests.length > 0 && (
                                <span className="ml-auto bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded-full">{myIncomingRequests.length}</span>
                            )}
                        </h3>

                        {myIncomingRequests.length === 0 ? (
                            <p className="text-[10px] text-gray-500 font-bold text-center py-6 uppercase tracking-widest">No pending requests</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {myIncomingRequests.map(req => (
                                    <div key={req.id} className="bg-[#111] p-3 rounded-2xl flex items-center justify-between border border-white/5 hover:border-purple-500/30 transition-colors">
                                        <span className="text-xs font-bold text-white">{req.fromUserName}</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => acceptMatchRequest(req.id)}
                                                className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                                            >
                                                <CheckCircle size={16} />
                                            </button>
                                            <button className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                                                <XCircle size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Active Partners */}
                    <div className="bg-gradient-to-br from-blue-900/20 to-[#0f0f0f] border border-blue-500/20 rounded-[2.5rem] p-6 shadow-xl flex flex-col gap-5 border border-white/5">
                        <h3 className="font-black text-sm uppercase tracking-[0.2em] flex items-center gap-2 text-white">
                            <Activity size={18} className="text-blue-500" /> My Partners
                        </h3>
                        {myPartners.length === 0 ? (
                            <p className="text-[10px] text-gray-500 font-bold text-center py-6 uppercase tracking-widest">You have no partners yet</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {myPartners.map(p => {
                                    const partnerName = p.fromUserId === user?.id ? p.toUserName : p.fromUserName;
                                    return (
                                        <div key={p.id} className="bg-blue-500/10 p-4 rounded-2xl flex items-center gap-4 border border-blue-500/20">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                <Users size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white">{partnerName}</p>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Matched</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerMatchView;
