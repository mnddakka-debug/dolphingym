import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS, NAV_ITEMS } from '../constants';
import {
    ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

const HubView: React.FC = () => {
    const { language, setActiveTab } = useApp();
    const t = TRANSLATIONS[language];

    // Map the icons and sub-categories
    const categorizedItems = useMemo(() => {
        const aiTools = ['ai_form', 'coach'];
        const community = ['squads', 'leaderboard_view', 'challenges', 'community', 'matchmaker'];
        const services = ['store', 'marketplace', 'vod', 'live'];
        const gymInfo = ['progress_vault', 'floor_plan', 'plans'];

        return {
            aiTools: NAV_ITEMS.filter(i => aiTools.includes(i.id)),
            community: NAV_ITEMS.filter(i => community.includes(i.id)),
            services: NAV_ITEMS.filter(i => services.includes(i.id)),
            gymInfo: NAV_ITEMS.filter(i => gymInfo.includes(i.id))
        };
    }, []);

    const CategorySection = ({ title, items, themeColor, delay }: { title: string, items: any[], themeColor: { text: string, bg: string, border: string, glow: string }, delay: number }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
            className="mb-14"
        >
            <div className="flex items-center gap-4 mb-8">
                <div className={`w-1.5 h-6 rounded-full ${themeColor.glow} shadow-[0_0_15px_${themeColor.glow.replace('bg-', '')}]`} />
                <h2 className={`text-lg sm:text-xl font-black uppercase tracking-[0.25em] ${themeColor.text} drop-shadow-md`}>
                    {title}
                </h2>
                <div className={`flex-1 h-[1px] bg-gradient-to-r ${themeColor.glow.replace('bg-', 'from-')}/20 to-transparent ml-4`} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className="group relative bg-[#0a0a0b]/80 backdrop-blur-md border border-white/5 rounded-[2rem] p-7 text-left transition-all duration-500 hover:scale-[1.03] hover:space-y-1 hover:border-white/20 hover:bg-[#111112]/90 hover:shadow-2xl hover:shadow-black/50 overflow-hidden flex flex-col justify-between min-h-[200px]"
                    >
                        {/* Background Glow */}
                        <div className={`absolute -bottom-20 -right-20 w-48 h-48 ${themeColor.glow} rounded-full blur-[80px] opacity-[0.07] group-hover:opacity-[0.25] transition-opacity duration-700 z-0`} />

                        {/* Top Section */}
                        <div className="relative z-10 flex flex-col items-start gap-5">
                            <div className={`w-14 h-14 rounded-[1.25rem] ${themeColor.bg} flex items-center justify-center border border-white/5 group-hover:border-white/20 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 shadow-xl shadow-black/40 relative`}>
                                <div className={`absolute inset-0 rounded-[1.25rem] bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                <div className={`${themeColor.text} relative z-10`}>
                                    {item.icon}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-black text-sm sm:text-base text-gray-200 tracking-[0.15em] uppercase mb-2 group-hover:text-white transition-colors">
                                    {language === 'en' ? item.labelEn : item.labelAr}
                                </h3>
                            </div>
                        </div>

                        {/* Bottom / Arrow */}
                        <div className="flex items-center justify-between mt-8 relative z-10 border-t border-white/5 pt-5 group-hover:border-white/10 transition-colors duration-500">
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.3em] group-hover:text-gray-400 transition-colors">
                                {language === 'en' ? 'Launch' : 'تشغيل'}
                            </span>
                            <div className={`w-8 h-8 rounded-full bg-[#161618] flex items-center justify-center group-hover:${themeColor.bg} transition-all duration-500 border border-white/5 group-hover:${themeColor.border}`}>
                                <ChevronRight size={14} className={`text-gray-500 group-hover:${themeColor.text} transition-colors translate-x-0 group-hover:translate-x-0.5`} />
                            </div>
                        </div>

                    </button>
                ))}
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-32 px-4 sm:px-8 relative max-w-7xl mx-auto">

            <header className="mb-16 relative z-10 pt-4">
                <div className="absolute top-0 right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
                <div className="absolute top-10 left-10 w-48 h-48 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

                <div className="flex items-center gap-5 mb-opacity-0">
                    <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-sm">
                        <span className="text-2xl animate-pulse">✨</span>
                    </div>
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-[0.15em] text-white">
                            {t.hubExplore}
                        </h1>
                        <p className="text-gray-400 font-bold text-xs sm:text-xs tracking-[0.3em] uppercase mt-2 opacity-70">
                            Discover your full <span className="text-blue-400">Dolphin</span> experience
                        </p>
                    </div>
                </div>
            </header>

            <div className="space-y-2 relative z-10">
                <CategorySection
                    title={t.aiTools || "AI & Smart Tools"}
                    items={categorizedItems.aiTools}
                    themeColor={{ text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', glow: 'bg-blue-500' }}
                    delay={0.1}
                />
                <CategorySection
                    title={t.gamification || "Gamification & Community"}
                    items={categorizedItems.community}
                    themeColor={{ text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', glow: 'bg-purple-500' }}
                    delay={0.2}
                />
                <CategorySection
                    title={t.services || "Gym Services"}
                    items={categorizedItems.services}
                    themeColor={{ text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', glow: 'bg-orange-500' }}
                    delay={0.3}
                />
                <CategorySection
                    title={language === 'en' ? "Personal Tracking" : "التتبع الشخصي"}
                    items={categorizedItems.gymInfo}
                    themeColor={{ text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', glow: 'bg-green-500' }}
                    delay={0.4}
                />
            </div>

            {/* Ambient Background */}
            <div className="fixed -bottom-40 -left-40 w-[60vw] h-[60vw] bg-blue-900/5 rounded-full blur-[150px] pointer-events-none z-0" />
            <div className="fixed top-1/4 -right-40 w-[50vw] h-[50vw] bg-purple-900/5 rounded-full blur-[150px] pointer-events-none z-0" />
        </div>
    );
};

export default HubView;
