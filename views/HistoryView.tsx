
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
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom duration-500 pb-12 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
          <History className="text-blue-400" size={32} />
          {t.history}
        </h1>
        <div className="bg-blue-500/10 border border-blue-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-2">
          <TrendingUp size={16} className="text-blue-400" />
          <span className="text-[10px] sm:text-xs font-black text-blue-400 uppercase tracking-widest leading-none">Monthly Progress +15%</span>
        </div>
      </div>

      {/* Activity Dots / Mini Heatmap */}
      <div className="bg-[#111111] p-5 sm:p-6 rounded-3xl border border-white/5 shadow-xl">
        <h3 className="text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-[0.2em] mb-4">{t.recentActivity}</h3>
        <div className="flex justify-between items-center px-1 overflow-x-auto gap-2 sm:gap-4 no-scrollbar">
          {Array.from({ length: 28 }).map((_, i) => { // Increased dots to 28 for wider screens
            const hasActivity = Math.random() > 0.4;
            return (
              <div
                key={i}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm transition-all shrink-0 ${hasActivity ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-white/5'
                  }`}
              />
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {MOCK_HISTORY.map((entry) => (
          <div
            key={entry.id}
            className="bg-[#0f0f0f] border border-white/5 rounded-[2rem] p-5 sm:p-6 flex flex-col gap-4 group hover:border-blue-500/30 transition-all active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/5 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all shrink-0 shadow-inner">
                  <Calendar size={24} />
                </div>
                <div className="truncate">
                  <h3 className="font-black text-lg sm:text-xl group-hover:text-blue-400 transition-colors uppercase tracking-tight truncate">{entry.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-bold tracking-wide mt-0.5 truncate">
                    {formatDate(entry.date)} • {formatTime(entry.date)}
                  </p>
                </div>
              </div>
              <div className="bg-white/5 p-2 sm:p-3 rounded-xl text-gray-400 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors shrink-0 ml-2">
                <ChevronRight size={20} />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-4 border-t border-white/5 mt-auto">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 shadow-inner">
                  <Timer size={16} />
                </div>
                <div>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 font-black uppercase leading-none mb-1">{t.avgDuration.split(' ')[1]}</p>
                  <p className="text-sm sm:text-base font-black text-white">{entry.duration} <span className="text-[10px] opacity-60 uppercase">{t.mins}</span></p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-xl text-orange-400 shadow-inner">
                  <Zap size={16} />
                </div>
                <div>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 font-black uppercase leading-none mb-1">{t.caloriesBurned.split(' ')[0]}</p>
                  <p className="text-sm sm:text-base font-black text-white">{entry.calories} <span className="text-[10px] opacity-60 uppercase">kcal</span></p>
                </div>
              </div>

              <div className="ml-auto flex flex-col items-end">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 bg-[#1a1a1a] px-3 py-1 rounded-lg border border-white/5 whitespace-nowrap">{entry.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
