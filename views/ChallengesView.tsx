
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Trophy, Medal, Star, Target, Calendar, ChevronRight, Users, Flame } from 'lucide-react';
import { Challenge } from '../types';

const ChallengesView: React.FC = () => {
    const { language, challenges, challengeEntries, user, addChallenge, activeTab } = useApp();
    const t = TRANSLATIONS[language];
    const [activeTabSub, setActiveTabSub] = useState<'active' | 'leaderboard'>('active');

    const getMyProgress = (challengeId: string) => {
        if (!user) return 0;
        const entry = challengeEntries.find(e => e.challengeId === challengeId && e.memberId === user.id);
        return entry ? entry.currentValue : 0;
    };

    const getLeaderboard = (challengeId: string) => {
        const entries = challengeEntries.filter(e => e.challengeId === challengeId);
        return entries.sort((a, b) => b.currentValue - a.currentValue).slice(0, 10);
    };

    return (
        <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-500 pb-12 w-full max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-black blue-gradient uppercase tracking-widest">{t.challenges}</h1>
                <div className="flex gap-2 bg-[#111] p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setActiveTabSub('active')}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTabSub === 'active' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        {t.myChallenges}
                    </button>
                    <button
                        onClick={() => setActiveTabSub('leaderboard')}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTabSub === 'leaderboard' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        {t.leaderboard}
                    </button>
                </div>
            </div>

            {activeTabSub === 'active' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {challenges.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-white/10 rounded-3xl">
                            <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="uppercase tracking-widest text-sm font-bold">No active challenges</p>
                        </div>
                    ) : (
                        challenges.map(challenge => {
                            const progress = getMyProgress(challenge.id);
                            const percent = Math.min(100, Math.round((progress / challenge.targetValue) * 100));

                            return (
                                <div key={challenge.id} className="bg-[#0f0f0f] border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-xl">
                                    {/* Background Accents */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[100%] z-0 group-hover:bg-blue-500/10 transition-colors" />

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-2xl shadow-inner border border-white/5">
                                                {challenge.badgeEmoji}
                                            </div>
                                            <span className="bg-green-500/10 text-green-400 text-[10px] font-black uppercase px-2 py-1 rounded-lg border border-green-500/20">
                                                {challenge.pointReward} GP
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-black uppercase tracking-tight mb-1 group-hover:text-blue-400 transition-colors">{challenge.title}</h3>
                                        <p className="text-xs text-gray-500 font-medium mb-6 line-clamp-2">{challenge.description}</p>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                                                <span className="text-gray-400">Progress</span>
                                                <span className="text-blue-400">{progress} / {challenge.targetValue} {challenge.unit}</span>
                                            </div>
                                            <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Calendar size={14} />
                                                <span className="text-[10px] font-bold uppercase">{new Date(challenge.endDate).toLocaleDateString()}</span>
                                            </div>
                                            <button className="bg-white/5 hover:bg-blue-500 hover:text-white text-gray-300 p-2 rounded-xl transition-all active:scale-95">
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {activeTabSub === 'leaderboard' && (
                <div className="grid grid-cols-1 gap-8">
                    {challenges.map(challenge => (
                        <div key={challenge.id} className="bg-[#0f0f0f] border border-white/5 p-6 sm:p-8 rounded-[2.5rem]">
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-3xl">
                                    {challenge.badgeEmoji}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight">{challenge.title}</h3>
                                    <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mt-1">Top Performers</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {getLeaderboard(challenge.id).length === 0 ? (
                                    <p className="text-center text-gray-600 py-4 text-sm font-medium">No participants yet</p>
                                ) : (
                                    getLeaderboard(challenge.id).map((entry, idx) => (
                                        <div key={entry.id} className="flex items-center justify-between bg-[#141414] p-4 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 flex items-center justify-center font-black text-sm rounded-lg ${idx === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' :
                                                        idx === 1 ? 'bg-gray-300 text-black shadow-lg shadow-gray-300/20' :
                                                            idx === 2 ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' :
                                                                'bg-white/5 text-gray-500'
                                                    }`}>
                                                    {idx + 1}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`font-bold text-sm ${entry.memberId === user?.id ? 'text-blue-400' : 'text-white'}`}>
                                                        {entry.memberName} {entry.memberId === user?.id && '(You)'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-600 font-black uppercase tracking-wider">
                                                        {idx === 0 ? 'Champion' : 'Challenger'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-black text-white">{entry.currentValue}</span>
                                                <span className="text-[10px] text-gray-500 font-black uppercase">{challenge.unit}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChallengesView;
