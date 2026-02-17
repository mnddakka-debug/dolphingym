import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { useApp } from '../context/AppContext';
import { getFilteredNavItems, TRANSLATIONS } from '../constants';
import { Bell, UserCircle, ShieldCheck, User as UserIcon, Dumbbell } from 'lucide-react';
import Logo from './Logo';
const Layout = ({ children }) => {
    const { language, activeTab, setActiveTab, user, getExpiringMembers } = useApp();
    const t = TRANSLATIONS[language];
    const isRTL = language === 'ar';
    const expiringCount = getExpiringMembers().length;
    if (!user)
        return _jsx(_Fragment, { children: children });
    const filteredNavItems = getFilteredNavItems(user.role);
    const RoleBadge = () => {
        switch (user.role) {
            case 'admin':
                return (_jsxs("div", { className: "flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full", children: [_jsx(ShieldCheck, { size: 10, className: "text-blue-400" }), _jsx("span", { className: "text-[8px] font-black text-blue-400 uppercase tracking-widest", children: t.adminAccess.split(' ')[0] })] }));
            case 'trainer':
                return (_jsxs("div", { className: "flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full", children: [_jsx(UserIcon, { size: 10, className: "text-orange-400" }), _jsx("span", { className: "text-[8px] font-black text-orange-400 uppercase tracking-widest", children: t.trainer })] }));
            default:
                return (_jsxs("div", { className: "flex items-center gap-1.5 bg-gray-500/10 border border-white/5 px-2.5 py-1 rounded-full", children: [_jsx(Dumbbell, { size: 10, className: "text-gray-400" }), _jsx("span", { className: "text-[8px] font-black text-gray-400 uppercase tracking-widest", children: t.trainee.split(' ')[0] })] }));
        }
    };
    return (_jsxs("div", { className: `min-h-screen flex flex-col bg-[#000000] text-white ${isRTL ? 'font-arabic' : ''}`, dir: isRTL ? 'rtl' : 'ltr', children: [_jsxs("header", { className: "fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md z-50 flex items-center justify-between px-6 border-b border-white/5", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Logo, { size: 42 }), _jsxs("div", { className: "flex flex-col", children: [_jsx("h1", { className: "text-lg font-black blue-gradient tracking-[0.15em] whitespace-nowrap drop-shadow-sm uppercase leading-none", children: t.appName }), _jsx("div", { className: "mt-1", children: _jsx(RoleBadge, {}) })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("button", { className: "p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors relative", children: [_jsx(Bell, { size: 20, className: "text-blue-400" }), expiringCount > 0 && (_jsx("span", { className: "absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border-2 border-black" }))] }), _jsxs("div", { className: "flex items-center gap-2 group cursor-pointer", onClick: () => setActiveTab('settings'), children: [_jsx("span", { className: "hidden sm:inline-block text-sm font-bold group-hover:text-blue-400 transition-colors", children: user?.name }), _jsx(UserCircle, { size: 28, className: "text-gray-400 group-hover:text-white transition-colors" })] })] })] }), _jsx("main", { className: "flex-1 pt-24 pb-24 px-4 sm:px-6 max-w-lg mx-auto w-full bg-[#000000]", children: children }), _jsx("nav", { className: "fixed bottom-0 left-0 right-0 h-20 bg-[#0a0a0a]/90 backdrop-blur-lg border-t border-white/10 z-50 px-4 sm:px-10 flex items-center justify-between max-w-lg mx-auto", children: filteredNavItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (_jsxs("button", { onClick: () => setActiveTab(item.id), className: `flex-1 flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-blue-400 scale-110' : 'text-gray-500 hover:text-white'}`, children: [_jsx("div", { className: `p-2 rounded-xl transition-all ${isActive ? 'bg-blue-400/10' : ''}`, children: item.icon }), _jsx("span", { className: "text-[10px] uppercase tracking-tighter font-black", children: language === 'en' ? item.labelEn : item.labelAr })] }, item.id));
                }) })] }));
};
export default Layout;
