import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Users, Crown, ShieldAlert, Plus, LogOut, ArrowRight, Star, Flame } from 'lucide-react';

const GymSquadsView: React.FC = () => {
    const { language, squads, user, createSquad, joinSquad, leaveSquad, members } = useApp();
    const t = TRANSLATIONS[language];

    const [showCreate, setShowCreate] = useState(false);
    const [newSquadName, setNewSquadName] = useState('');
    const [newSquadDesc, setNewSquadDesc] = useState('');

    const mySquad = squads.find(s => s.id === user?.squadId);
    const sortedSquads = [...squads].sort((a, b) => b.totalPoints - a.totalPoints);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSquadName.trim() && newSquadDesc.trim()) {
            createSquad(newSquadName, newSquadDesc);
            setShowCreate(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center gap-3">
                    <Users className="text-blue-400" size={32} />
                    {language === 'en' ? 'Gym Squads' : 'فِرق النادي'}
                </h1>
                {user?.squadId ? (
                    <button onClick={() => user.squadId && leaveSquad(user.squadId)} className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
                        <LogOut size={16} />
                        {language === 'en' ? 'Leave Squad' : 'مغادرة الفريق'}
                    </button>
                ) : (
                    <button onClick={() => setShowCreate(!showCreate)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
                        <Plus size={16} />
                        {language === 'en' ? 'Create Squad' : 'إنشاء فريق'}
                    </button>
                )}
            </div>

            {showCreate && !mySquad && (
                <form onSubmit={handleCreate} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 animate-in slide-in-from-top-4">
                    <h2 className="text-xl font-bold mb-4">{language === 'en' ? 'Create a New Squad' : 'إنشاء فريق جديد'}</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400 block mb-1">{language === 'en' ? 'Squad Name' : 'اسم الفريق'}</label>
                            <input type="text" value={newSquadName} onChange={e => setNewSquadName(e.target.value)} required
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 focus:border-blue-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 block mb-1">{language === 'en' ? 'Description (Motto)' : 'الوصف / الشعار'}</label>
                            <input type="text" value={newSquadDesc} onChange={e => setNewSquadDesc(e.target.value)} required
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 focus:border-blue-500 focus:outline-none" />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600">Cancel</button>
                            <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold">Create</button>
                        </div>
                    </div>
                </form>
            )}

            {mySquad && (
                <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 rounded-2xl p-6 border border-blue-500/30">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-1">{language === 'en' ? 'Your Squad' : 'فريقك'}</p>
                            <h2 className="text-3xl font-black">{mySquad.name}</h2>
                            <p className="text-indigo-300 italic">"{mySquad.description}"</p>
                        </div>

                        <div className="bg-black/40 p-4 rounded-xl flex items-center gap-6">
                            <div className="text-center">
                                <p className="text-slate-400 text-xs uppercase">{language === 'en' ? 'Members' : 'الأعضاء'}</p>
                                <p className="text-2xl font-bold text-white">{mySquad.memberIds.length}</p>
                            </div>
                            <div className="h-10 w-px bg-white/10"></div>
                            <div className="text-center">
                                <p className="text-slate-400 text-xs uppercase">{language === 'en' ? 'Total Points' : 'إجمالي النقاط'}</p>
                                <p className="text-2xl font-bold text-yellow-400 flex items-center gap-1 justify-center">
                                    <Star size={16} fill="currentColor" /> {mySquad.totalPoints}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-widest">{language === 'en' ? 'Roster' : 'القائمة'}</h3>
                        <div className="flex flex-wrap gap-3">
                            {mySquad.memberIds.map(id => {
                                const m = members.find(mbr => mbr.id === id);
                                return m ? (
                                    <div key={id} className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${id === mySquad.captainId ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/10 text-white'}`}>
                                        {id === mySquad.captainId && <Crown size={14} />}
                                        {m.name} {id === user?.id && '(You)'}
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>
                </div>
            )}

            <div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Flame className="text-orange-400" />
                    {language === 'en' ? 'Squad Leaderboards' : 'صدارة الفرق'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedSquads.map((squad, idx) => (
                        <div key={squad.id} className={`bg-slate-800/80 rounded-2xl p-6 border relative overflow-hidden transition-all hover:scale-[1.02] ${squad.id === mySquad?.id ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-slate-700'}`}>
                            <div className={`absolute top-0 w-full left-0 h-1 ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-slate-300' : idx === 2 ? 'bg-orange-400' : 'bg-slate-600'}`}></div>

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-3">
                                    <div className="text-3xl font-black text-slate-600">#{idx + 1}</div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{squad.name}</h3>
                                        <p className="text-xs text-slate-400 truncate max-w-[150px]">{squad.description}</p>
                                    </div>
                                </div>
                                {!mySquad && (
                                    <button onClick={() => joinSquad(squad.id)} className="bg-white/10 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors">
                                        <ArrowRight size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="flex justify-between items-end mt-6">
                                <div className="flex -space-x-2">
                                    {[...Array(Math.min(squad.memberIds.length, 3))].map((_, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold">👤</div>
                                    ))}
                                    {squad.memberIds.length > 3 && (
                                        <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">+{squad.memberIds.length - 3}</div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-yellow-400 font-black text-xl flex items-center gap-1">
                                        {squad.totalPoints} <Star size={16} fill="currentColor" />
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {sortedSquads.length === 0 && (
                        <div className="col-span-full text-center py-10 text-slate-500">
                            {language === 'en' ? 'No squads formed yet. Be the first!' : 'لم يتم تشكيل أي فريق بعد. كن الأول!'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GymSquadsView;
