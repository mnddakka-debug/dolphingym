import React from 'react';
import { Medal, Trophy, TrendingUp, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';

const LeaderboardView: React.FC = () => {
    const { language, members, user } = useApp();
    const t = TRANSLATIONS[language];

    // Sort members by points descending
    const sortedMembers = [...members].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 10);

    return (
        <div className="space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center gap-3">
                    <Medal className="text-yellow-400" size={32} />
                    {t.leaderboards || 'Gym Leaderboard'}
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Top 3 Podium (Mock data for visuals or use top 3 members) */}
                {sortedMembers.slice(0, 3).map((m, idx) => (
                    <div key={m.id} className={`p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden border ${idx === 0 ? 'bg-gradient-to-b from-yellow-500/20 to-slate-900 border-yellow-500/50 order-first md:order-2 md:-mt-8' :
                            idx === 1 ? 'bg-gradient-to-b from-slate-300/20 to-slate-900 border-slate-300/50 order-2 md:order-1' :
                                'bg-gradient-to-b from-orange-400/20 to-slate-900 border-orange-400/50 order-3 md:order-3'
                        }`}>
                        <div className={`absolute top-0 w-full h-1 ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-slate-300' : 'bg-orange-400'
                            }`}></div>

                        <div className="w-20 h-20 rounded-full mb-4 flex items-center justify-center text-3xl font-bold bg-slate-800 border-4 border-slate-900 relative shadow-xl">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                        </div>

                        <h2 className="text-xl font-bold">{m.name}</h2>
                        <div className="flex items-center gap-2 mt-2 text-yellow-500">
                            <Star size={16} fill="currentColor" />
                            <span className="font-bold">{m.points} {t.dolphinCoins || 'Dolphin Coins'}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Trophy className="text-blue-400" />
                        {language === 'en' ? 'Top Members' : 'أفضل اللاعبين'}
                    </h2>
                    <span className="text-slate-400 text-sm">{language === 'en' ? 'Resets at end of month' : 'يتم تصفير النتائج نهاية الشهر'}</span>
                </div>

                <div className="space-y-3">
                    {sortedMembers.map((m, index) => {
                        const isCurrentUser = user && user.id === m.id;
                        return (
                            <div
                                key={m.id}
                                className={`p-4 rounded-xl flex items-center justify-between transition-colors ${isCurrentUser ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-slate-900/50 hover:bg-slate-800 border border-slate-700/50'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 text-center text-lg font-bold text-slate-400">
                                        {index + 1}
                                    </div>
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                        {m.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${isCurrentUser ? 'text-blue-400' : 'text-slate-200'}`}>
                                            {m.name} {isCurrentUser && (language === 'en' ? '(You)' : '(أنت)')}
                                        </h3>
                                        <p className="text-xs text-slate-500">{m.badges.length} {language === 'en' ? 'Badges' : 'أوسمة'}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end">
                                    <span className="font-bold text-yellow-400 flex items-center gap-1">
                                        {m.points} <Star size={14} fill="currentColor" />
                                    </span>
                                    {index < 3 && (
                                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                                            <TrendingUp size={12} /> +120 {language === 'en' ? 'this week' : 'هذا الأسبوع'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LeaderboardView;
