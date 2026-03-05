import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { TRANSLATIONS } from '../constants';
import { ShoppingBag, Plus, X, Star, Clock, CheckCircle2, ShieldCheck, Tag, Trash2 } from 'lucide-react';
import { TrainerPlan } from '../types';

const MarketplaceView: React.FC = () => {
    const { user, language, marketplacePlans, publishPlan, purchasePlan } = useApp();
    const t = TRANSLATIONS[language];
    const isTrainer = user?.role === 'freelance_trainer';
    const isAdmin = user?.role === 'admin';
    const isMember = user?.role === 'member';

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPlan, setNewPlan] = useState<Partial<TrainerPlan>>({
        title: '', description: '', price: 0, durationWeeks: 4, features: []
    });
    const [featureInput, setFeatureInput] = useState('');

    const activePlans = marketplacePlans.filter(p => p.active);

    const handleCreatePlan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlan.title || !newPlan.price) return;
        publishPlan(newPlan);
        setShowCreateModal(false);
        setNewPlan({ title: '', description: '', price: 0, durationWeeks: 4, features: [] });
    };

    const addFeature = () => {
        if (featureInput.trim() && newPlan.features) {
            setNewPlan({ ...newPlan, features: [...newPlan.features, featureInput.trim()] });
            setFeatureInput('');
        }
    };

    const handlePurchase = (planId: string) => {
        const success = purchasePlan(planId);
        if (success) {
            alert("Plan purchased successfully! A new workout plan has been added to your account.");
        } else {
            alert("Purchase failed. You might already own this plan or have insufficient permissions.");
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#111] p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none" />
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <ShoppingBag className="text-green-400" size={28} />
                        Trainer Marketplace
                    </h2>
                    <p className="text-gray-400 mt-2 text-sm max-w-xl">Browse and purchase exclusive workout and nutrition plans from certified freelance trainers. Elevate your fitness journey today.</p>
                </div>
                {isTrainer && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(34,197,94,0.3)] z-10"
                    >
                        <Plus size={18} /> Publish New Plan
                    </button>
                )}
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activePlans.length === 0 ? (
                    <div className="col-span-full py-20 text-center flex flex-col items-center justify-center bg-[#111] rounded-3xl border border-white/5">
                        <ShoppingBag size={48} className="text-gray-600 mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-gray-400 mb-2">No Plans Available Yet</h3>
                        <p className="text-gray-500 text-sm max-w-md">Our freelance trainers are working hard to create amazing plans for you. Check back soon!</p>
                    </div>
                ) : (
                    activePlans.map(plan => (
                        <div key={plan.id} className="bg-[#111] rounded-[2rem] p-6 border border-white/5 shadow-xl flex flex-col group hover:border-green-500/30 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors" />

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                    <h3 className="text-xl font-black text-white">{plan.title}</h3>
                                    <p className="text-green-400 text-sm font-bold flex items-center gap-1 mt-1">
                                        <ShieldCheck size={14} /> By {plan.trainerName}
                                    </p>
                                </div>
                                <div className="bg-green-500/10 text-green-400 px-3 py-1.5 rounded-lg flex items-center gap-1 font-black shadow-inner border border-green-500/20">
                                    <Tag size={14} /> ${plan.price}
                                </div>
                            </div>

                            <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1 relative z-10">
                                {plan.description}
                            </p>

                            <div className="space-y-3 mb-6 relative z-10">
                                <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 p-2 rounded-lg">
                                    <Clock size={16} className="text-blue-400" />
                                    <span className="font-bold">Duration:</span> {plan.durationWeeks} Weeks
                                </div>
                                <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5">
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">What's Included</p>
                                    <ul className="space-y-2">
                                        {plan.features.slice(0, 3).map((f, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                                <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                        {plan.features.length > 3 && (
                                            <li className="text-xs text-gray-500 font-bold ml-6">+ {plan.features.length - 3} more...</li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-auto relative z-10">
                                {isMember ? (
                                    <button
                                        onClick={() => handlePurchase(plan.id)}
                                        className="w-full bg-white text-black hover:bg-green-400 hover:text-black py-3 rounded-xl font-black transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        Buy Plan Now
                                    </button>
                                ) : isTrainer && plan.trainerId === user.id ? (
                                    <div className="w-full bg-green-500/10 text-green-500 py-3 rounded-xl font-black text-center border border-green-500/20">
                                        Your Plan (Active)
                                    </div>
                                ) : (
                                    <div className="w-full bg-white/5 text-gray-500 py-3 rounded-xl font-bold text-center border border-white/5">
                                        View Only
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Plan Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#111] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-xl relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full p-2"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                                <div className="bg-green-500/20 p-3 rounded-2xl">
                                    <Star className="text-green-500" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white">Publish New Plan</h3>
                                    <p className="text-sm text-gray-400">Create a premium offering for gym members.</p>
                                </div>
                            </div>

                            <form onSubmit={handleCreatePlan} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Plan Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={newPlan.title}
                                        onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                                        className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500/50 transition-colors font-medium"
                                        placeholder="e.g. 12-Week Lean Muscle Program"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Price ($)</label>
                                        <input
                                            type="number"
                                            required
                                            min={0}
                                            value={newPlan.price || ''}
                                            onChange={(e) => setNewPlan({ ...newPlan, price: parseFloat(e.target.value) })}
                                            className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500/50 transition-colors font-medium"
                                            placeholder="e.g. 49.99"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Duration (Weeks)</label>
                                        <input
                                            type="number"
                                            required
                                            min={1}
                                            value={newPlan.durationWeeks}
                                            onChange={(e) => setNewPlan({ ...newPlan, durationWeeks: parseInt(e.target.value) })}
                                            className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500/50 transition-colors font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                                    <textarea
                                        rows={3}
                                        value={newPlan.description}
                                        onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                                        className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500/50 transition-colors font-medium resize-none"
                                        placeholder="Describe what members will achieve..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Key Features</label>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={featureInput}
                                            onChange={(e) => setFeatureInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                            className="flex-1 bg-[#161616] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500/50 transition-colors font-medium text-sm"
                                            placeholder="e.g. Custom Meal Plan"
                                        />
                                        <button
                                            type="button"
                                            onClick={addFeature}
                                            className="bg-white/10 hover:bg-white/20 text-white px-4 rounded-xl transition-colors font-bold"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {newPlan.features && newPlan.features.length > 0 && (
                                        <div className="bg-[#161616] p-3 rounded-xl border border-white/5 mt-2">
                                            <ul className="space-y-2">
                                                {newPlan.features.map((f, i) => (
                                                    <li key={i} className="flex items-center justify-between text-sm bg-black/40 px-3 py-2 rounded-lg border border-white/5">
                                                        <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> {f}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setNewPlan({ ...newPlan, features: newPlan.features?.filter((_, idx) => idx !== i) })}
                                                            className="text-red-400 hover:text-red-300 p-1"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-white/5 flex justify-end gap-3 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-green-500 hover:bg-green-400 text-white px-8 py-3 rounded-xl font-black shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all active:scale-95"
                                    >
                                        Publish Plan
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MarketplaceView;
