import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { ShoppingBag, Star, Check, Clock, Lock } from 'lucide-react';
import { Reward } from '../types';

const StoreView: React.FC = () => {
    const { language, user, rewards, redeemReward, redemptions } = useApp();
    const t = TRANSLATIONS[language];
    const [tab, setTab] = useState<'store' | 'mine'>('store');
    const [feedback, setFeedback] = useState<{ id: string; success: boolean } | null>(null);

    const myRedemptions = redemptions.filter(r => r.memberId === user?.id).sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime());

    const handleRedeem = (reward: Reward) => {
        if (!user || user.points < reward.pointCost) {
            setFeedback({ id: reward.id, success: false });
            setTimeout(() => setFeedback(null), 2000);
            return;
        }
        const ok = redeemReward(reward.id);
        setFeedback({ id: reward.id, success: ok });
        setTimeout(() => setFeedback(null), 2500);
    };

    return (
        <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-500/20">
                        <ShoppingBag className="text-yellow-400" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{t.store}</h1>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">Spend your points</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-2xl">
                    <Star size={16} className="text-yellow-400" />
                    <span className="font-black text-yellow-400">{user?.points?.toLocaleString()} GP</span>
                </div>
            </div>

            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
                {[{ id: 'store', label: t.store }, { id: 'mine', label: t.myRedemptions }].map(tab_ => (
                    <button key={tab_.id} onClick={() => setTab(tab_.id as any)} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === tab_.id ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'text-gray-500 hover:text-white'}`}>
                        {tab_.label}
                    </button>
                ))}
            </div>

            {tab === 'store' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {rewards.map(reward => {
                        const canAfford = (user?.points || 0) >= reward.pointCost;
                        const outOfStock = reward.stock === 0;
                        const fb = feedback?.id === reward.id;
                        return (
                            <div key={reward.id} className={`bg-[#111] rounded-[2rem] border p-6 flex flex-col gap-4 transition-all duration-300 ${outOfStock ? 'border-white/5 opacity-50' : canAfford ? 'border-yellow-500/20 hover:border-yellow-500/40' : 'border-white/5'}`}>
                                <div className="text-5xl text-center">{reward.emoji}</div>
                                <div className="text-center">
                                    <h3 className="font-black text-base">{reward.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{reward.description}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Star size={14} className="text-yellow-400" />
                                        <span className="font-black text-yellow-400 text-sm">{reward.pointCost.toLocaleString()} GP</span>
                                    </div>
                                    {reward.stock > 0 && <span className="text-[10px] text-gray-500 font-bold">{reward.stock} left</span>}
                                    {reward.stock === -1 && <span className="text-[10px] text-green-500 font-bold">∞ Available</span>}
                                    {reward.stock === 0 && <span className="text-[10px] text-red-500 font-bold">Out of stock</span>}
                                </div>
                                <button
                                    onClick={() => !outOfStock && handleRedeem(reward)}
                                    disabled={outOfStock}
                                    className={`w-full py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border ${fb ? (feedback!.success ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30')
                                        : outOfStock ? 'bg-white/5 text-gray-600 border-white/5 cursor-not-allowed'
                                            : canAfford ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20'
                                                : 'bg-white/5 text-gray-500 border-white/5 cursor-not-allowed'
                                        }`}
                                >
                                    {fb ? (feedback!.success ? '✓ Redeemed!' : t.insufficientPoints)
                                        : outOfStock ? 'Out of Stock'
                                            : !canAfford ? (<span className="flex items-center justify-center gap-2"><Lock size={14} />{t.insufficientPoints}</span>)
                                                : t.redeemReward}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {tab === 'mine' && (
                <div className="bg-[#111] rounded-[2rem] border border-white/5 overflow-hidden">
                    {myRedemptions.length === 0 ? (
                        <div className="flex flex-col items-center py-16 text-gray-600">
                            <ShoppingBag size={48} className="mb-3 opacity-20" />
                            <p className="text-sm font-bold">No redemptions yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {myRedemptions.map(r => (
                                <div key={r.id} className="flex items-center justify-between px-5 py-4">
                                    <div>
                                        <p className="font-bold text-sm">{r.rewardName}</p>
                                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                            <Clock size={10} /> {new Date(r.redeemedAt).toLocaleDateString()} • {r.pointsSpent.toLocaleString()} GP
                                        </p>
                                    </div>
                                    <Check size={18} className="text-green-500" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StoreView;
