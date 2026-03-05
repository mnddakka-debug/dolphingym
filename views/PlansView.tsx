import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Clipboard, Plus, Trash2, Dumbbell, ChevronDown, TrendingUp, Save, Apple, Scale } from 'lucide-react';
import { WorkoutPlan, PlannedExercise } from '../types';

const EXERCISE_TEMPLATES = [
    'Bench Press', 'Squat', 'Deadlift', 'Pull-Up', 'Push-Up', 'Overhead Press',
    'Bicep Curl', 'Tricep Dip', 'Leg Press', 'Lat Pulldown', 'Burpees', 'Plank',
];

const PlansView: React.FC = () => {
    const { language, user, members, workoutPlans, addWorkoutPlan, updateWorkoutPlan, weightEntries, addWeightEntry } = useApp();
    const t = TRANSLATIONS[language];
    const isTrainer = user?.role === 'admin' || user?.role === 'trainer';

    const [activeTab, setActiveTab] = useState<'plan' | 'weight'>('plan');
    const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || '');
    const [planTitle, setPlanTitle] = useState('Custom Training Plan');
    const [exercises, setExercises] = useState<PlannedExercise[]>([]);
    const [nutritionNotes, setNutritionNotes] = useState('');
    const [calorieTarget, setCalorieTarget] = useState('');
    const [proteinTarget, setProteinTarget] = useState('');
    const [newWeight, setNewWeight] = useState('');
    const [saved, setSaved] = useState(false);

    const myPlan = workoutPlans.find(p => p.memberId === user?.id);
    const targetPlan = isTrainer ? workoutPlans.find(p => p.memberId === selectedMemberId) : myPlan;
    const myWeights = weightEntries.filter(w => w.memberId === user?.id).sort((a, b) => a.date.localeCompare(b.date));

    const addExercise = () => {
        setExercises([...exercises, { id: Math.random().toString(36).substr(2, 9), name: 'New Exercise', sets: 3, reps: 10, restSeconds: 60 }]);
    };

    const updateExercise = (id: string, field: keyof PlannedExercise, value: any) => {
        setExercises(exercises.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const removeExercise = (id: string) => setExercises(exercises.filter(e => e.id !== id));

    const handleSave = () => {
        const memberId = isTrainer ? selectedMemberId : (user?.id || '');
        if (targetPlan) {
            updateWorkoutPlan(targetPlan.id, { title: planTitle, exercises, nutritionNotes, calorieTarget: Number(calorieTarget), proteinTarget: Number(proteinTarget) });
        } else {
            addWorkoutPlan({ memberId, title: planTitle, exercises, nutritionNotes, calorieTarget: Number(calorieTarget), proteinTarget: Number(proteinTarget) });
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleLogWeight = () => {
        const w = parseFloat(newWeight);
        if (isNaN(w) || w <= 0) return;
        addWeightEntry(w);
        setNewWeight('');
    };

    const maxW = myWeights.length ? Math.max(...myWeights.map(w => w.weightKg)) : 100;
    const minW = myWeights.length ? Math.min(...myWeights.map(w => w.weightKg)) : 50;

    return (
        <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-500 pb-12">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
                    <Clipboard className="text-purple-400" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{t.plans}</h1>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                        {isTrainer ? t.assignPlan : t.myPlan}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
                {[{ id: 'plan', label: isTrainer ? t.assignPlan : t.myPlan, icon: <Dumbbell size={15} /> }, { id: 'weight', label: t.weightTracker, icon: <TrendingUp size={15} /> }].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-gray-500 hover:text-white'}`}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'plan' && (
                <div className="space-y-4">
                    {isTrainer && (
                        <div className="bg-[#111] rounded-[2rem] border border-white/5 p-5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Select Member</label>
                            <select value={selectedMemberId} onChange={e => setSelectedMemberId(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-purple-500">
                                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="bg-[#111] rounded-[2rem] border border-white/5 p-5 space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Plan Title</label>
                            <input value={planTitle} onChange={e => setPlanTitle(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-purple-500" />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-purple-400">Exercises</label>
                                <button onClick={addExercise} className="flex items-center gap-1.5 text-xs text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20 hover:bg-purple-500/20 transition-all font-black">
                                    <Plus size={14} /> Add
                                </button>
                            </div>
                            <div className="space-y-3">
                                {exercises.map(ex => (
                                    <div key={ex.id} className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <select value={ex.name} onChange={e => updateExercise(ex.id, 'name', e.target.value)} className="flex-1 bg-transparent text-sm font-bold focus:outline-none">
                                                {EXERCISE_TEMPLATES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                            <button onClick={() => removeExercise(ex.id)} className="text-red-500/50 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            {(['sets', 'reps', 'restSeconds'] as const).map(field => (
                                                <div key={field}>
                                                    <label className="text-gray-600 uppercase text-[9px] tracking-widest block mb-1">{field === 'restSeconds' ? 'Rest (s)' : field}</label>
                                                    <input type="number" value={ex[field]} onChange={e => updateExercise(ex.id, field, Number(e.target.value))} className="w-full bg-black/30 border border-white/10 rounded-lg py-1.5 px-2 text-center font-bold focus:outline-none focus:border-purple-500" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {exercises.length === 0 && <p className="text-center text-gray-600 text-sm py-6">No exercises yet. Click "Add" to start building the plan.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Nutrition */}
                    <div className="bg-[#111] rounded-[2rem] border border-white/5 p-5 space-y-4">
                        <h3 className="text-sm font-black text-green-400 uppercase tracking-widest flex items-center gap-2"><Apple size={16} /> Nutrition Plan</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 block">Daily Calories</label>
                                <input type="number" value={calorieTarget} onChange={e => setCalorieTarget(e.target.value)} placeholder="e.g. 2500" className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-green-500" />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 block">Protein (g)</label>
                                <input type="number" value={proteinTarget} onChange={e => setProteinTarget(e.target.value)} placeholder="e.g. 180" className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-green-500" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 block">Notes</label>
                            <textarea value={nutritionNotes} onChange={e => setNutritionNotes(e.target.value)} rows={3} placeholder="Meal timing, food preferences, dietary restrictions..." className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-green-500 resize-none" />
                        </div>
                    </div>

                    <button onClick={handleSave} className={`w-full py-4 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 ${saved ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20'}`}>
                        <Save size={18} /> {saved ? 'Saved!' : 'Save Plan'}
                    </button>
                </div>
            )}

            {/* Weight Tracker */}
            {activeTab === 'weight' && (
                <div className="space-y-4">
                    <div className="bg-[#111] rounded-[2rem] border border-white/5 p-5">
                        <h3 className="text-sm font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Scale size={16} /> {t.logWeight}</h3>
                        <div className="flex gap-3">
                            <input type="number" value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder="Enter weight (kg)" className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-purple-500" />
                            <button onClick={handleLogWeight} className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-6 py-3 rounded-xl font-black text-sm hover:bg-purple-500/20 transition-all">Log</button>
                        </div>
                    </div>

                    {myWeights.length > 0 && (
                        <div className="bg-[#111] rounded-[2rem] border border-white/5 p-5">
                            <h3 className="text-sm font-black text-purple-400 uppercase tracking-widest mb-6">{t.weightTracker}</h3>
                            {/* CSS Chart */}
                            <div className="flex items-end gap-1.5 h-32 mb-3">
                                {myWeights.slice(-20).map((w, i) => {
                                    const pct = maxW === minW ? 50 : ((w.weightKg - minW) / (maxW - minW)) * 100;
                                    return (
                                        <div key={w.id} className="flex-1 flex flex-col items-center gap-1" title={`${w.weightKg}kg on ${w.date}`}>
                                            <div className="w-full bg-purple-500 rounded-t-sm transition-all" style={{ height: `${Math.max(10, pct)}%` }} />
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="space-y-2 mt-4">
                                {myWeights.slice(-5).reverse().map(w => (
                                    <div key={w.id} className="flex justify-between text-xs text-gray-400">
                                        <span>{w.date}</span>
                                        <span className="font-black text-white">{w.weightKg} kg</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PlansView;
