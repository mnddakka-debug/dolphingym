import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Users, Package, LogOut, X, Search, Edit2, Trash2, Clock, Plus, Hammer, Trash, Info } from 'lucide-react';
const AdminView = () => {
    const { language, logout, members, equipment, addMember, updateMember, deleteMember, addEquipment, updateEquipment, deleteEquipment, expiryDays } = useApp();
    const t = TRANSLATIONS[language];
    const [activeSubView, setActiveSubView] = useState('players');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    // Players Form Data
    const [playerForm, setPlayerForm] = useState({
        name: '',
        email: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentMethod: 'cash'
    });
    // Equipment Form Data
    const [eqForm, setEqForm] = useState({
        nameEn: '',
        nameAr: '',
        category: 'strength',
        status: 'available',
        quantity: 1
    });
    const getPlayerStatus = (endDate) => {
        const end = new Date(endDate).getTime();
        const now = Date.now();
        const diff = end - now;
        const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (daysLeft <= 0)
            return 'expired';
        if (daysLeft <= expiryDays)
            return 'expiring';
        return 'active';
    };
    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
            const status = getPlayerStatus(member.subscriptionEndDate);
            if (filter === 'active')
                return matchesSearch && status === 'active';
            if (filter === 'expiring')
                return matchesSearch && status === 'expiring';
            if (filter === 'expired')
                return matchesSearch && status === 'expired';
            return matchesSearch;
        });
    }, [members, searchTerm, filter, expiryDays]);
    const filteredEquipment = useMemo(() => {
        return equipment.filter(item => {
            const matchesSearch = (item.nameEn + item.nameAr).toLowerCase().includes(searchTerm.toLowerCase());
            if (filter !== 'all' && item.status !== filter)
                return false;
            return matchesSearch;
        });
    }, [equipment, searchTerm, filter]);
    const stats = useMemo(() => {
        return {
            totalAssets: equipment.reduce((acc, curr) => acc + curr.quantity, 0),
            broken: equipment.filter(e => e.status === 'broken').length,
            repairing: equipment.filter(e => e.status === 'maintenance').length
        };
    }, [equipment]);
    const handleOpenAdd = () => {
        setEditingItem(null);
        if (activeSubView === 'players') {
            setPlayerForm({
                name: '', email: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                paymentMethod: 'cash'
            });
        }
        else {
            setEqForm({
                nameEn: '', nameAr: '',
                category: 'strength', status: 'available', quantity: 1
            });
        }
        setShowModal(true);
    };
    const handleOpenEdit = (item) => {
        setEditingItem(item);
        if (activeSubView === 'players') {
            setPlayerForm({
                name: item.name, email: item.email,
                startDate: item.subscriptionStartDate?.split('T')[0] || '',
                endDate: item.subscriptionEndDate?.split('T')[0] || '',
                paymentMethod: item.paymentMethod || 'cash'
            });
        }
        else {
            setEqForm({
                nameEn: item.nameEn, nameAr: item.nameAr,
                category: item.category, status: item.status, quantity: item.quantity
            });
        }
        setShowModal(true);
    };
    const handleSubmit = () => {
        if (activeSubView === 'players') {
            if (!playerForm.name)
                return;
            if (editingItem)
                updateMember(editingItem.id, playerForm);
            else
                addMember(playerForm);
        }
        else {
            if (!eqForm.nameEn || !eqForm.nameAr)
                return;
            if (editingItem)
                updateEquipment(editingItem.id, eqForm);
            else
                addEquipment(eqForm);
        }
        setShowModal(false);
    };
    const getStatusStyle = (status) => {
        switch (status) {
            case 'available': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'maintenance': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'broken': return 'bg-red-500/10 text-red-500 border-red-500/20';
        }
    };
    return (_jsxs("div", { className: "flex flex-col gap-6 animate-in slide-in-from-right duration-500 pb-12", children: [_jsx("h1", { className: "text-2xl font-black blue-gradient uppercase tracking-widest", children: t.admin }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("button", { onClick: () => { setActiveSubView('players'); setFilter('all'); }, className: `flex flex-col items-center justify-center p-5 rounded-3xl border transition-all group ${activeSubView === 'players' ? 'blue-bg border-blue-400 shadow-xl' : 'bg-[#111] border-white/5 hover:border-white/20'}`, children: [_jsx(Users, { className: `mb-3 group-hover:scale-110 transition-transform ${activeSubView === 'players' ? 'text-white' : 'text-blue-400'}`, size: 28 }), _jsx("span", { className: `font-black text-xs uppercase tracking-widest ${activeSubView === 'players' ? 'text-white' : 'text-gray-400'}`, children: t.manageUsers })] }), _jsxs("button", { onClick: () => { setActiveSubView('equipment'); setFilter('all'); }, className: `flex flex-col items-center justify-center p-5 rounded-3xl border transition-all group ${activeSubView === 'equipment' ? 'blue-bg border-blue-400 shadow-xl' : 'bg-[#111] border-white/5 hover:border-white/20'}`, children: [_jsx(Package, { className: `mb-3 group-hover:scale-110 transition-transform ${activeSubView === 'equipment' ? 'text-white' : 'text-blue-400'}`, size: 28 }), _jsx("span", { className: `font-black text-xs uppercase tracking-widest ${activeSubView === 'equipment' ? 'text-white' : 'text-gray-400'}`, children: t.manageEquipment })] })] }), _jsxs("div", { className: "bg-[#0f0f0f] border border-white/5 p-6 rounded-[2.5rem] shadow-2xl", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h3", { className: "font-black text-sm uppercase tracking-[0.2em] flex items-center gap-2", children: [activeSubView === 'players' ? _jsx(Users, { size: 18, className: "text-blue-400" }) : _jsx(Package, { size: 18, className: "text-blue-400" }), activeSubView === 'players' ? t.members : t.inventory] }), _jsx("button", { onClick: handleOpenAdd, className: "w-10 h-10 rounded-2xl blue-bg flex items-center justify-center text-white blue-glow shadow-lg active:scale-90 transition-all", children: _jsx(Plus, { size: 22, strokeWidth: 3 }) })] }), activeSubView === 'equipment' && (_jsxs("div", { className: "grid grid-cols-3 gap-3 mb-6", children: [_jsxs("div", { className: "bg-white/5 p-3 rounded-2xl border border-white/5 text-center", children: [_jsx("p", { className: "text-[8px] text-gray-500 font-black uppercase mb-1", children: t.totalEquipment }), _jsx("p", { className: "text-lg font-black", children: stats.totalAssets })] }), _jsxs("div", { className: "bg-orange-500/5 p-3 rounded-2xl border border-orange-500/10 text-center", children: [_jsx("p", { className: "text-[8px] text-orange-500 font-black uppercase mb-1", children: t.maintenanceShort }), _jsx("p", { className: "text-lg font-black text-orange-500", children: stats.repairing })] }), _jsxs("div", { className: "bg-red-500/5 p-3 rounded-2xl border border-red-500/10 text-center", children: [_jsx("p", { className: "text-[8px] text-red-500 font-black uppercase mb-1", children: t.brokenDevices }), _jsx("p", { className: "text-lg font-black text-red-500", children: stats.broken })] })] })), _jsxs("div", { className: "flex flex-col gap-4 mb-6", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { size: 16, className: "absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" }), _jsx("input", { type: "text", placeholder: t.searchMembers, value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-xs focus:outline-none focus:border-blue-500 transition-all" })] }), _jsx("div", { className: "flex gap-2 overflow-x-auto pb-1 no-scrollbar", children: activeSubView === 'players' ? (['all', 'active', 'expiring', 'expired'].map(f => (_jsx("button", { onClick: () => setFilter(f), className: `px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${filter === f ? 'blue-bg border-blue-400 text-white' : 'bg-white/5 border-white/10 text-gray-500'}`, children: t[f] || f }, f)))) : (['all', 'available', 'maintenance', 'broken'].map(f => (_jsx("button", { onClick: () => setFilter(f), className: `px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${filter === f ? 'blue-bg border-blue-400 text-white' : 'bg-white/5 border-white/10 text-gray-500'}`, children: t[f] || f }, f)))) })] }), _jsxs("div", { className: "space-y-3", children: [activeSubView === 'players' ? (filteredMembers.map(member => (_jsxs("div", { className: "p-4 bg-[#111] rounded-2xl border border-white/5 flex items-center justify-between group hover:border-blue-500/20 transition-all", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-black text-xs uppercase", children: member.name[0] }), _jsxs("div", { children: [_jsx("p", { className: "font-black text-sm uppercase tracking-tight", children: member.name }), _jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [_jsx("p", { className: "text-[10px] text-gray-500 font-bold", children: member.email }), _jsx("span", { className: "text-[8px] bg-white/5 px-1.5 py-0.5 rounded uppercase font-black text-blue-400/60 border border-white/5", children: member.paymentMethod === 'click' ? t.click : t.cash })] })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleOpenEdit(member), className: "p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all", children: _jsx(Edit2, { size: 14, className: "text-gray-400" }) }), _jsx("button", { onClick: () => deleteMember(member.id), className: "p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all", children: _jsx(Trash2, { size: 14, className: "text-red-500" }) })] })] }, member.id)))) : (filteredEquipment.map(item => (_jsxs("div", { className: "p-4 bg-[#111] rounded-2xl border border-white/5 flex flex-col gap-4 group hover:border-blue-500/20 transition-all", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/10", children: _jsx(Hammer, { size: 24 }) }), _jsxs("div", { children: [_jsx("h4", { className: "font-black text-sm uppercase tracking-tight", children: language === 'en' ? item.nameEn : item.nameAr }), _jsxs("p", { className: "text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5", children: [t[item.category], " \u2022 ", t.quantity, ": ", item.quantity] })] })] }), _jsx("span", { className: `text-[8px] font-black uppercase px-2 py-1 rounded-lg border ${getStatusStyle(item.status)}`, children: t[item.status] })] }), _jsxs("div", { className: "flex items-center justify-between pt-3 border-t border-white/5", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { size: 12, className: "text-gray-500" }), _jsxs("span", { className: "text-[9px] text-gray-500 font-bold uppercase", children: [t.lastMaintenance, ": ", item.lastMaintenance] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleOpenEdit(item), className: "p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all", children: _jsx(Edit2, { size: 12 }) }), _jsx("button", { onClick: () => deleteEquipment(item.id), className: "p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all", children: _jsx(Trash, { size: 12, className: "text-red-500" }) })] })] })] }, item.id)))), (activeSubView === 'players' ? filteredMembers : filteredEquipment).length === 0 && (_jsxs("div", { className: "py-12 text-center flex flex-col items-center gap-4 opacity-40", children: [_jsx(Info, { size: 40 }), _jsx("p", { className: "text-xs font-bold uppercase tracking-[0.2em]", children: "No records found" })] }))] })] }), showModal && (_jsx("div", { className: "fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in zoom-in-95 duration-300", children: _jsxs("div", { className: "bg-[#111] w-full max-w-sm rounded-[3rem] border border-white/10 p-8 shadow-2xl overflow-y-auto max-h-[90vh]", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsx("h3", { className: "font-black text-xl blue-gradient uppercase tracking-widest", children: editingItem ? t.update : (activeSubView === 'players' ? t.addMember : t.addEquipment) }), _jsx("button", { onClick: () => setShowModal(false), className: "text-gray-500 hover:text-white transition-colors", children: _jsx(X, { size: 24 }) })] }), _jsxs("div", { className: "space-y-5", children: [activeSubView === 'players' ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1", children: t.memberName }), _jsx("input", { type: "text", value: playerForm.name, onChange: e => setPlayerForm({ ...playerForm, name: e.target.value }), className: "w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:border-blue-500 focus:outline-none transition-all" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1", children: t.email }), _jsx("input", { type: "email", value: playerForm.email, onChange: e => setPlayerForm({ ...playerForm, email: e.target.value }), className: "w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:border-blue-500 focus:outline-none transition-all" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1", children: t.startDate }), _jsx("input", { type: "date", value: playerForm.startDate, onChange: e => setPlayerForm({ ...playerForm, startDate: e.target.value }), className: "w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-3 text-xs focus:border-blue-500 focus:outline-none transition-all" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1", children: t.endDate }), _jsx("input", { type: "date", value: playerForm.endDate, onChange: e => setPlayerForm({ ...playerForm, endDate: e.target.value }), className: "w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-3 text-xs focus:border-blue-500 focus:outline-none transition-all" })] })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-1.5", children: [_jsxs("label", { className: "text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1", children: [t.equipmentName, " (EN)"] }), _jsx("input", { type: "text", value: eqForm.nameEn, onChange: e => setEqForm({ ...eqForm, nameEn: e.target.value }), className: "w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:border-blue-500 focus:outline-none transition-all" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsxs("label", { className: "text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1", children: [t.equipmentName, " (AR)"] }), _jsx("input", { type: "text", value: eqForm.nameAr, onChange: e => setEqForm({ ...eqForm, nameAr: e.target.value }), className: "w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm font-arabic focus:border-blue-500 focus:outline-none transition-all" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1", children: t.category }), _jsxs("select", { value: eqForm.category, onChange: e => setEqForm({ ...eqForm, category: e.target.value }), className: "w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-3 text-xs focus:border-blue-500 focus:outline-none appearance-none", children: [_jsx("option", { value: "strength", children: t.strength }), _jsx("option", { value: "cardio", children: t.cardio }), _jsx("option", { value: "flexibility", children: t.flexibility }), _jsx("option", { value: "weights", children: t.weights })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1", children: t.status }), _jsxs("select", { value: eqForm.status, onChange: e => setEqForm({ ...eqForm, status: e.target.value }), className: "w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-3 text-xs focus:border-blue-500 focus:outline-none appearance-none", children: [_jsx("option", { value: "available", children: t.available }), _jsx("option", { value: "maintenance", children: t.maintenance }), _jsx("option", { value: "broken", children: t.broken })] })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1", children: t.quantity }), _jsx("input", { type: "number", min: "1", value: eqForm.quantity, onChange: e => setEqForm({ ...eqForm, quantity: parseInt(e.target.value) }), className: "w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:border-blue-500 focus:outline-none transition-all" })] })] })), _jsx("button", { onClick: handleSubmit, className: "w-full py-5 blue-bg blue-glow rounded-3xl text-white font-black text-lg mt-6 uppercase tracking-widest active:scale-[0.98] transition-all", children: editingItem ? t.update : t.save })] })] }) })), _jsxs("button", { onClick: logout, className: "w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95 text-xs", children: [_jsx(LogOut, { size: 18 }), t.logout] })] }));
};
export default AdminView;
