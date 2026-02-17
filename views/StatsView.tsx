
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS, CHART_DATA, MOCK_BADGES, MOCK_LEADERBOARD } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Weight, Ruler, Target, Calendar, Trophy, Medal, Lock, Info, Banknote, CreditCard } from 'lucide-react';

const StatsView: React.FC = () => {
  const { language, user } = useApp();
  const t = TRANSLATIONS[language];
  const [activeSubTab, setActiveSubTab] = useState<'personal' | 'leaderboard'>('personal');

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.stats}</h1>
        <div className="flex bg-white/5 p-1 rounded-xl">
           <button 
             onClick={() => setActiveSubTab('personal')}
             className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeSubTab === 'personal' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
           >
             {t.profile}
           </button>
           <button 
             onClick={() => setActiveSubTab('leaderboard')}
             className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeSubTab === 'leaderboard' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
           >
             {t.leaderboard}
           </button>
        </div>
      </div>

      {activeSubTab === 'personal' ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
              <Weight className="text-blue-400" />
              <div>
                <p className="text-xs text-gray-400">{t.weight}</p>
                <p className="font-bold">{user?.weight || '--'} {t.kg}</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
              <Ruler className="text-blue-400" />
              <div>
                <p className="text-xs text-gray-400">{t.height}</p>
                <p className="font-bold">{user?.height || '--'} {t.cm}</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
              <Calendar className="text-blue-400" />
              <div>
                <p className="text-xs text-gray-400">{t.subscription}</p>
                <p className="text-[10px] font-bold text-gray-200">
                  {user?.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString() : '--'}
                </p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
              {user?.paymentMethod === 'click' ? <CreditCard className="text-blue-400" /> : <Banknote className="text-green-500" />}
              <div>
                <p className="text-xs text-gray-400">{t.paymentMethod}</p>
                <p className="font-bold capitalize">{user?.paymentMethod ? t[user.paymentMethod as keyof typeof t.en] : '--'}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#111111] rounded-2xl p-5 border border-white/5">
            <h3 className="font-bold mb-6">Activity Frequency</h3>
            <div className="h-48">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CHART_DATA}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#000', border: 'none'}} />
                    <Bar dataKey="duration" radius={[6, 6, 0, 0]}>
                      {CHART_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 5 ? '#3b82f6' : '#1d4ed8'} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </div>

          {/* Badges Section */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
               <h3 className="font-bold text-lg">{t.badges}</h3>
               <span className="text-xs text-gray-500">{MOCK_BADGES.filter(b => b.unlocked).length} / {MOCK_BADGES.length}</span>
             </div>
             <div className="grid grid-cols-1 gap-3">
                {MOCK_BADGES.map((badge) => (
                  <div key={badge.id} className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${badge.unlocked ? 'bg-[#111111] border-blue-500/20' : 'bg-[#0a0a0b] border-white/5 opacity-50'}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${badge.unlocked ? 'bg-gradient-to-br from-blue-500/20 to-transparent border border-blue-500/40' : 'bg-white/5 border border-white/10'}`}>
                      {badge.unlocked ? badge.icon : <Lock size={20} className="text-gray-600" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold ${badge.unlocked ? 'text-white' : 'text-gray-500'}`}>{language === 'en' ? badge.nameEn : badge.nameAr}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{language === 'en' ? badge.descriptionEn : badge.descriptionAr}</p>
                    </div>
                    {badge.unlocked && <Trophy size={16} className="text-blue-400" />}
                  </div>
                ))}
             </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Top 3 Podiums */}
          <div className="flex items-end justify-center gap-4 py-8 px-4">
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="relative">
                <img src={MOCK_LEADERBOARD[1].avatar} className="w-16 h-16 rounded-full border-4 border-gray-400 shadow-xl" />
                <div className="absolute -bottom-2 -right-2 bg-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-black">2</div>
              </div>
              <p className="text-[10px] font-bold text-gray-400 mt-1">{MOCK_LEADERBOARD[1].name.split(' ')[0]}</p>
              <p className="text-xs font-bold text-white">{MOCK_LEADERBOARD[1].points} {t.ep}</p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <img src={MOCK_LEADERBOARD[0].avatar} className="w-20 h-20 rounded-full border-4 border-blue-500 shadow-xl blue-glow" />
                <div className="absolute -bottom-2 -right-2 bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white border-2 border-[#0a0a0b]">1</div>
                <Medal className="absolute -top-6 left-1/2 -translate-x-1/2 text-blue-400" size={28} />
              </div>
              <p className="text-sm font-bold blue-gradient mt-2">{MOCK_LEADERBOARD[0].name.split(' ')[0]}</p>
              <p className="text-sm font-bold text-blue-400">{MOCK_LEADERBOARD[0].points} {t.ep}</p>
            </div>

            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="relative">
                <img src={MOCK_LEADERBOARD[2].avatar} className="w-16 h-16 rounded-full border-4 border-[#cd7f32] shadow-xl" />
                <div className="absolute -bottom-2 -right-2 bg-[#cd7f32] w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-black">3</div>
              </div>
              <p className="text-[10px] font-bold text-[#cd7f32] mt-1">{MOCK_LEADERBOARD[2].name.split(' ')[0]}</p>
              <p className="text-xs font-bold text-white">{MOCK_LEADERBOARD[2].points} {t.ep}</p>
            </div>
          </div>

          <div className="space-y-2">
            {MOCK_LEADERBOARD.slice(3).map((player) => (
              <div key={player.id} className={`flex items-center justify-between p-4 rounded-2xl border ${player.isCurrentUser ? 'bg-blue-500/10 border-blue-500/30 shadow-lg' : 'bg-white/5 border-white/5'}`}>
                <div className="flex items-center gap-4">
                  <span className="w-6 text-xs font-bold text-gray-500">#{player.rank}</span>
                  <img src={player.avatar} className="w-10 h-10 rounded-full border border-white/10" />
                  <div>
                    <p className={`font-bold text-sm ${player.isCurrentUser ? 'text-blue-400' : 'text-white'}`}>{player.name}</p>
                    {player.isCurrentUser && <span className="text-[8px] uppercase tracking-widest text-blue-400 font-bold">You</span>}
                  </div>
                </div>
                <p className="font-bold text-sm">{player.points.toLocaleString()} <span className="text-[10px] text-gray-500 uppercase">{t.ep}</span></p>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-start gap-3 mt-4">
             <Info size={20} className="text-blue-400 flex-shrink-0" />
             <p className="text-[10px] text-blue-200/70 leading-relaxed">
               Earn <span className="text-blue-400 font-bold">50 EP</span> for every workout completed and <span className="text-blue-400 font-bold">10 EP</span> for daily check-ins. Top 3 members get a free protein shake every month!
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsView;
