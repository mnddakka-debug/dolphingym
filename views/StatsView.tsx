
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS, CHART_DATA, MOCK_BADGES, MOCK_LEADERBOARD } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from 'recharts';
import { Weight, Ruler, Target, Calendar, Trophy, Medal, Lock, Info, Banknote, CreditCard, Activity, Bot, Sparkles, Loader2 } from 'lucide-react';

const MOCK_BODY_COMP = [
  { month: 'Jan', weight: 82, fat: 22 },
  { month: 'Feb', weight: 81.5, fat: 21.5 },
  { month: 'Mar', weight: 80, fat: 20 },
  { month: 'Apr', weight: 79, fat: 19 },
  { month: 'May', weight: 78.5, fat: 18.5 },
  { month: 'Jun', weight: 77, fat: 17.5 },
];

const StatsView: React.FC = () => {
  const { language, user, weightEntries, workoutPlans } = useApp();
  const t = TRANSLATIONS[language];
  const [activeSubTab, setActiveSubTab] = useState<'personal' | 'leaderboard'>('personal');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const prompt = `
        Analyze fitness progress for ${user?.name}.
        Current Weight: ${user?.weightKg || user?.weight || 'N/A'} kg.
        Height: ${user?.heightCm || user?.height || 'N/A'} cm.
        
        Recent Weight Entries: ${JSON.stringify(weightEntries.filter(w => w.memberId === user?.id).slice(-5))}
        Workout Plans: ${JSON.stringify(workoutPlans.filter(p => p.memberId === user?.id).map(p => p.title))}
        
        Provide a consolidated 3-sentence summary of progress and 3 bullet-point recommendations for improvement. Keep it encouraging and professional.
      `;

      const response = await fetch('http://localhost:5000/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "keyless-gpt-4o",
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0]?.message?.content) {
        setAiAnalysis(data.choices[0].message.content);
      } else {
        setAiAnalysis("Unable to generate analysis at this time.");
      }
    } catch (error) {
      console.error("AI Analysis Failed", error);
      setAiAnalysis("Connection to AI Coach failed. Please try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700 pb-12 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">{t.stats}</h1>
        <div className="flex bg-white/5 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('personal')}
            className={`px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${activeSubTab === 'personal' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {t.profile}
          </button>
          <button
            onClick={() => setActiveSubTab('leaderboard')}
            className={`px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${activeSubTab === 'leaderboard' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {t.leaderboard}
          </button>
        </div>
      </div>

      {activeSubTab === 'personal' ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4 hover:border-blue-500/30 transition-colors">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Weight className="text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{t.weight}</p>
                <p className="font-bold text-lg">{user?.weight || '--'} <span className="text-sm font-normal text-gray-500">{t.kg}</span></p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4 hover:border-blue-500/30 transition-colors">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Ruler className="text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{t.height}</p>
                <p className="font-bold text-lg">{user?.height || '--'} <span className="text-sm font-normal text-gray-500">{t.cm}</span></p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4 hover:border-blue-500/30 transition-colors">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Calendar className="text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{t.subscription}</p>
                <p className="text-xs font-bold text-gray-100">
                  {user?.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString() : '--'}
                </p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center gap-4 hover:border-blue-500/30 transition-colors">
              <div className={`p-3 rounded-xl ${user?.paymentMethod === 'click' ? 'bg-blue-500/10' : 'bg-green-500/10'}`}>
                {user?.paymentMethod === 'click' ? <CreditCard className="text-blue-400" size={24} /> : <Banknote className="text-green-500" size={24} />}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{t.paymentMethod}</p>
                <p className="font-bold text-sm capitalize">{user?.paymentMethod ? t[user.paymentMethod as keyof typeof t] : '--'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#111111] rounded-[2rem] p-6 sm:p-8 border border-white/5 shadow-xl flex flex-col min-h-[300px]">
              <h3 className="font-black text-sm uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-6">
                <Calendar size={18} className="text-blue-400" /> Activity Frequency
              </h3>
              <div className="flex-1 w-full min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CHART_DATA}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }} />
                    <Bar dataKey="duration" radius={[6, 6, 0, 0]} maxBarSize={60}>
                      {CHART_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 5 ? '#3b82f6' : '#1d4ed8'} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Badges Section */}
            <div className="bg-[#111111] rounded-[2rem] p-6 sm:p-8 border border-white/5 shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-sm uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Trophy size={18} className="text-blue-400" /> {t.badges}
                </h3>
                <span className="text-xs font-bold bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">{MOCK_BADGES.filter(b => b.unlocked).length} / {MOCK_BADGES.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 flex-1">
                {MOCK_BADGES.map((badge) => (
                  <div key={badge.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${badge.unlocked ? 'bg-gradient-to-br from-blue-900/10 to-[#111] border-blue-500/20 hover:border-blue-500/40' : 'bg-[#0a0a0b] border-white/5 opacity-50'}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0 ${badge.unlocked ? 'bg-gradient-to-br from-blue-500/20 to-transparent border border-blue-500/40 shadow-inner' : 'bg-white/5 border border-white/10'}`}>
                      {badge.unlocked ? badge.icon : <Lock size={20} className="text-gray-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold truncate ${badge.unlocked ? 'text-white' : 'text-gray-500'}`}>{language === 'en' ? badge.nameEn : badge.nameAr}</p>
                      <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-tight">{language === 'en' ? badge.descriptionEn : badge.descriptionAr}</p>
                    </div>
                    {badge.unlocked && <Trophy size={16} className="text-blue-400/50 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          </div>



          {/* AI Analysis Card */}
          <div className="bg-gradient-to-br from-[#111] to-[#0d0d10] rounded-[2rem] p-6 sm:p-8 border border-white/5 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none" />

            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="font-black text-sm uppercase tracking-widest text-purple-400 flex items-center gap-2">
                <Bot size={18} /> {t.aiCoach} Analysis
              </h3>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]"
              >
                {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {isAnalyzing ? 'Analyzing...' : 'Analyze My Progress'}
              </button>
            </div>

            {aiAnalysis ? (
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap font-medium">{aiAnalysis}</p>
                <div className="mt-4 flex gap-2">
                  <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-1 rounded-md uppercase font-bold tracking-wider">GPT-Based Insight</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 relative z-10 opacity-50">
                <Bot size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-sm font-bold text-gray-500">Tap the button to generate comprehensive AI insights based on your data.</p>
              </div>
            )}
          </div>

          {/* Body Composition Tracker */}
          <div className="bg-[#111111] rounded-[2rem] p-6 sm:p-8 border border-white/5 shadow-xl flex flex-col mt-2">
            <h3 className="font-black text-sm uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-6">
              <Activity size={18} className="text-blue-400" /> Body Composition Tracking
            </h3>
            <div className="h-[250px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_BODY_COMP} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                  <XAxis dataKey="month" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                  <YAxis yAxisId="right" orientation="right" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', fontWeight: 900 }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                  <Line yAxisId="left" type="monotone" name="Weight (kg)" dataKey="weight" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#111', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" name="Body Fat (%)" dataKey="fat" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#111', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
          {/* Top 3 Podiums */}
          <div className="flex items-end justify-center gap-6 sm:gap-12 py-10 px-4 bg-gradient-to-b from-[#111] to-transparent rounded-[3rem] border border-white/5">
            <div className="flex flex-col items-center gap-3 mb-4 sm:mb-8">
              <div className="relative group">
                <img src={MOCK_LEADERBOARD[1].avatar} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-gray-400 shadow-xl object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute -bottom-3 -right-3 bg-gradient-to-br from-gray-300 to-gray-500 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-black border-2 border-[#111] shadow-lg">2</div>
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-400 mt-2">{MOCK_LEADERBOARD[1].name.split(' ')[0]}</p>
              <p className="text-sm sm:text-base font-black text-white">{MOCK_LEADERBOARD[1].points} <span className="text-[10px] text-gray-500 uppercase">{t.ep}</span></p>
            </div>

            <div className="flex flex-col items-center gap-3 z-10">
              <div className="relative group">
                <img src={MOCK_LEADERBOARD[0].avatar} className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)] object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute -bottom-4 -right-1 bg-gradient-to-br from-blue-400 to-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-lg font-black text-white border-4 border-[#111] shadow-xl">1</div>
                <Medal className="absolute -top-8 left-1/2 -translate-x-1/2 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" size={40} />
              </div>
              <p className="text-lg sm:text-xl font-black blue-gradient mt-4">{MOCK_LEADERBOARD[0].name.split(' ')[0]}</p>
              <p className="text-base sm:text-lg font-black text-blue-400">{MOCK_LEADERBOARD[0].points} <span className="text-[10px] text-blue-500/50 uppercase">{t.ep}</span></p>
            </div>

            <div className="flex flex-col items-center gap-3 mb-5 sm:mb-10">
              <div className="relative group">
                <img src={MOCK_LEADERBOARD[2].avatar} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-[#cd7f32] shadow-xl object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-[#cd7f32] to-[#8a5a22] w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white border-2 border-[#111] shadow-lg">3</div>
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-[#cd7f32] mt-2">{MOCK_LEADERBOARD[2].name.split(' ')[0]}</p>
              <p className="text-xs sm:text-sm font-black text-white">{MOCK_LEADERBOARD[2].points} <span className="text-[10px] text-gray-500 uppercase">{t.ep}</span></p>
            </div>
          </div>

          <div className="space-y-3 px-2 sm:px-0">
            {MOCK_LEADERBOARD.slice(3).map((player) => (
              <div key={player.id} className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all hover:scale-[1.01] ${player.isCurrentUser ? 'bg-gradient-to-r from-blue-900/30 to-blue-500/10 border-blue-500/40 shadow-lg' : 'bg-[#111] border-white/5 hover:bg-white/5'}`}>
                <div className="flex items-center gap-4 sm:gap-6">
                  <span className="w-8 text-center text-sm font-black text-gray-600">#{player.rank}</span>
                  <img src={player.avatar} className="w-12 h-12 rounded-full border border-white/10 object-cover" />
                  <div>
                    <p className={`font-bold text-sm sm:text-base ${player.isCurrentUser ? 'text-blue-400' : 'text-gray-200'}`}>{player.name}</p>
                    {player.isCurrentUser && <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-md mt-1 inline-block">You</span>}
                  </div>
                </div>
                <p className="font-black text-sm sm:text-base tracking-wide">{player.points.toLocaleString()} <span className="text-[10px] text-gray-500 uppercase ml-1">{t.ep}</span></p>
              </div>
            ))}
          </div>

          <div className="bg-blue-500/5 border border-blue-500/20 p-5 rounded-3xl flex items-start sm:items-center gap-4 mt-6 max-w-2xl mx-auto">
            <div className="p-3 bg-blue-500/10 rounded-full shrink-0">
              <Info size={24} className="text-blue-400" />
            </div>
            <p className="text-xs sm:text-sm text-blue-200/70 leading-relaxed font-medium">
              Earn <span className="text-blue-400 font-black">50 EP</span> for every workout completed and <span className="text-blue-400 font-black">10 EP</span> for daily check-ins. Top 3 members get a free protein shake every month!
            </p>
          </div>
        </div>
      )
      }
    </div >
  );
};

export default StatsView;
