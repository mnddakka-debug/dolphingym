
import React from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS, MOCK_HISTORY } from '../constants';
import { Calendar, Timer, Zap, History, TrendingUp, ChevronRight } from 'lucide-react';

const HistoryView: React.FC = () => {
  const { language } = useApp();
  const t = TRANSLATIONS[language];
  const isRTL = language === 'ar';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom duration-500 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black flex items-center gap-3">
          <History className="text-blue-400" size={28} />
          {t.history}
        </h1>
        <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full flex items-center gap-2">
            <TrendingUp size={14} className="text-blue-400" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Monthly Progress +15%</span>
        </div>
      </div>

      {/* Activity Dots / Mini Heatmap */}
      <div className="bg-[#111111] p-5 rounded-3xl border border-white/5 shadow-xl">
        <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-4">{t.recentActivity}</h3>
        <div className="flex justify-between items-center px-1">
          {Array.from({ length: 14 }).map((_, i) => {
            const hasActivity = Math.random() > 0.4;
            return (
              <div 
                key={i} 
                className={`w-3.5 h-3.5 rounded-sm transition-all ${
                  hasActivity ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-white/5'
                }`}
              />
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_HISTORY.map((entry) => (
          <div 
            key={entry.id} 
            className="bg-[#0f0f0f] border border-white/5 rounded-[2rem] p-5 flex flex-col gap-4 group hover:border-blue-500/20 transition-all active:scale-[0.98]"
          >
            <div className="flex items-start justify-between">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/5 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all">
                    <Calendar size={20} />
                 </div>
                 <div>
                    <h3 className="font-black text-lg group-hover:text-blue-400 transition-colors uppercase tracking-tight">{entry.title}</h3>
                    <p className="text-xs text-gray-500 font-bold tracking-wide">
                      {formatDate(entry.date)} • {formatTime(entry.date)}
                    </p>
                 </div>
               </div>
               <div className="bg-white/5 p-2 rounded-xl text-gray-400">
                  <ChevronRight size={18} />
               </div>
            </div>

            <div className="flex items-center gap-6 pt-2 border-t border-white/5">
               <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                    <Timer size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase leading-none">{t.avgDuration.split(' ')[1]}</p>
                    <p className="text-sm font-black text-white mt-1">{entry.duration} <span className="text-[10px] opacity-60 uppercase">{t.mins}</span></p>
                  </div>
               </div>
               
               <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-400">
                    <Zap size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase leading-none">{t.caloriesBurned.split(' ')[0]}</p>
                    <p className="text-sm font-black text-white mt-1">{entry.calories} <span className="text-[10px] opacity-60 uppercase">kcal</span></p>
                  </div>
               </div>

               <div className="ml-auto flex flex-col items-end">
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-600 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{entry.category}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
