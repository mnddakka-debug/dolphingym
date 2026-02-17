import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS, MOCK_WORKOUTS } from '../constants';
// Added Dumbbell to imports
import { Play, Timer, Zap, CheckCircle2, ChevronRight, X, Trophy, ArrowRight, Pause, PlayCircle, Dumbbell } from 'lucide-react';
const WorkoutView = () => {
    const { language, setActiveTab, addPoints } = useApp();
    const t = TRANSLATIONS[language];
    // State for active session
    const [activeWorkout, setActiveWorkout] = useState(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [sessionSeconds, setSessionSeconds] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [completedSets, setCompletedSets] = useState(0);
    const [showSummary, setShowSummary] = useState(false);
    // Timer logic
    useEffect(() => {
        let interval;
        if (activeWorkout && !isPaused && !showSummary) {
            interval = setInterval(() => {
                setSessionSeconds(s => s + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [activeWorkout, isPaused, showSummary]);
    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    const startSession = (workout) => {
        setActiveWorkout(workout);
        setCurrentExerciseIndex(0);
        setSessionSeconds(0);
        setCompletedSets(0);
        setShowSummary(false);
    };
    const handleFinishWorkout = () => {
        const pointsEarned = activeWorkout.calories / 10 + 50; // Logic for GP
        addPoints(Math.round(pointsEarned));
        setShowSummary(true);
    };
    const nextExercise = () => {
        if (currentExerciseIndex < activeWorkout.exercises.length - 1) {
            setCurrentExerciseIndex(prev => prev + 1);
            setCompletedSets(0);
        }
        else {
            handleFinishWorkout();
        }
    };
    // 1. SUMMARY VIEW
    if (showSummary) {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center min-h-[70vh] text-center animate-in zoom-in duration-500", children: [_jsxs("div", { className: "relative mb-8", children: [_jsx("div", { className: "absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" }), _jsx("div", { className: "w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center shadow-2xl relative z-10", children: _jsx(Trophy, { size: 48, className: "text-white" }) })] }), _jsx("h2", { className: "text-3xl font-black blue-gradient uppercase tracking-widest mb-2", children: t.congrats }), _jsx("p", { className: "text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-8", children: t.milestone }), _jsxs("div", { className: "grid grid-cols-2 gap-4 w-full mb-10", children: [_jsxs("div", { className: "bg-white/5 border border-white/10 p-4 rounded-2xl", children: [_jsx("p", { className: "text-[8px] text-gray-500 font-black uppercase mb-1", children: t.avgDuration.split(' ')[1] }), _jsx("p", { className: "text-xl font-black text-white", children: formatTime(sessionSeconds) })] }), _jsxs("div", { className: "bg-white/5 border border-white/10 p-4 rounded-2xl", children: [_jsx("p", { className: "text-[8px] text-gray-500 font-black uppercase mb-1", children: t.pointsEarned.split(' ')[0] }), _jsxs("p", { className: "text-xl font-black text-blue-400", children: ["+", Math.round(activeWorkout.calories / 10 + 50), " ", t.ep] })] })] }), _jsx("button", { onClick: () => { setActiveWorkout(null); setActiveTab('dashboard'); }, className: "w-full py-5 blue-bg rounded-[2rem] text-white font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all", children: t.saveChanges })] }));
    }
    // 2. ACTIVE SESSION VIEW
    if (activeWorkout) {
        const exercise = activeWorkout.exercises[currentExerciseIndex];
        const progress = ((currentExerciseIndex + 1) / activeWorkout.exercises.length) * 100;
        return (_jsxs("div", { className: "fixed inset-0 bg-black z-[60] flex flex-col p-6 animate-in slide-in-from-bottom duration-500", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsx("button", { onClick: () => setActiveWorkout(null), className: "p-3 bg-white/5 rounded-2xl text-gray-400 hover:text-white transition-colors", children: _jsx(X, { size: 20 }) }), _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-sm font-black uppercase tracking-[0.2em]", children: activeWorkout.title }), _jsx("p", { className: "text-[10px] text-blue-400 font-bold uppercase mt-1", children: exercise.category || activeWorkout.category })] }), _jsx("button", { onClick: () => setIsPaused(!isPaused), className: `p-3 rounded-2xl transition-all ${isPaused ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/5 text-gray-400'}`, children: isPaused ? _jsx(PlayCircle, { size: 20 }) : _jsx(Pause, { size: 20 }) })] }), _jsx("div", { className: "w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-12", children: _jsx("div", { className: "h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-700", style: { width: `${progress}%` } }) }), _jsxs("div", { className: "flex flex-col items-center mb-12", children: [_jsxs("div", { className: "flex items-center gap-2 text-gray-500 mb-2", children: [_jsx(Timer, { size: 14 }), _jsx("span", { className: "text-[10px] font-black uppercase tracking-[0.3em]", children: "Session Time" })] }), _jsx("h3", { className: "text-6xl font-black tracking-tighter tabular-nums", children: formatTime(sessionSeconds) })] }), _jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-center px-4", children: [_jsxs("span", { className: "text-blue-500 font-black text-xs uppercase tracking-[0.4em] mb-4", children: ["Exercise ", currentExerciseIndex + 1, " of ", activeWorkout.exercises.length] }), _jsx("h1", { className: "text-4xl font-black mb-6 uppercase leading-tight", children: exercise.name }), _jsxs("div", { className: "flex gap-8 mb-10", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1", children: t.sets }), _jsx("p", { className: "text-3xl font-black", children: exercise.sets })] }), _jsx("div", { className: "w-px h-12 bg-white/10" }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1", children: t.reps }), _jsx("p", { className: "text-3xl font-black", children: exercise.reps })] })] }), _jsxs("p", { className: "text-gray-400 text-xs font-medium leading-relaxed max-w-[280px] italic", children: ["\"", exercise.instructions, "\""] })] }), _jsxs("div", { className: "mt-auto space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-[2rem]", children: [_jsx("div", { className: "flex gap-1.5", children: Array.from({ length: exercise.sets }).map((_, i) => (_jsx("div", { className: `w-8 h-2 rounded-full transition-all duration-300 ${i < completedSets ? 'bg-blue-500' : 'bg-white/10'}` }, i))) }), _jsxs("p", { className: "text-[10px] font-black text-gray-500 uppercase", children: ["Set ", completedSets, " of ", exercise.sets] })] }), _jsxs("div", { className: "flex gap-4", children: [_jsxs("button", { onClick: () => setCompletedSets(prev => Math.min(prev + 1, exercise.sets)), disabled: completedSets >= exercise.sets, className: "flex-1 py-5 bg-white/10 border border-white/10 rounded-[2rem] font-black uppercase text-sm flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-30", children: [_jsx(CheckCircle2, { size: 18 }), " Complete Set"] }), _jsx("button", { onClick: nextExercise, className: "w-20 py-5 blue-bg rounded-[2rem] flex items-center justify-center text-white active:scale-95 transition-all shadow-lg", children: _jsx(ArrowRight, { size: 24 }) })] })] })] }));
    }
    // 3. LIST VIEW (Default)
    return (_jsxs("div", { className: "flex flex-col gap-6 animate-in slide-in-from-bottom duration-500 pb-12", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h1", { className: "text-2xl font-black flex items-center gap-3", children: [_jsx(Dumbbell, { className: "text-blue-400", size: 28 }), t.workouts] }), _jsx("button", { className: "text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20", onClick: () => setActiveTab('history'), children: t.history })] }), _jsx("div", { className: "flex flex-col gap-4", children: MOCK_WORKOUTS.map((workout) => (_jsxs("div", { onClick: () => startSession(workout), className: "bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] p-5 flex items-center gap-5 hover:border-blue-500/30 transition-all cursor-pointer group active:scale-[0.98] shadow-lg", children: [_jsxs("div", { className: "w-20 h-20 rounded-[1.5rem] bg-[#1a1a1a] flex items-center justify-center overflow-hidden relative border border-white/5 shadow-inner", children: [_jsx("img", { src: `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200&h=200&auto=format&fit=crop`, alt: workout.title, className: "w-full h-full object-cover opacity-40 group-hover:opacity-70 group-hover:scale-110 transition-all duration-500" }), _jsx(Zap, { size: 24, className: "absolute text-blue-400 opacity-50" })] }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "flex items-center gap-2 mb-1", children: _jsx("span", { className: "text-[8px] font-black uppercase tracking-[0.2em] text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20", children: workout.category }) }), _jsx("h3", { className: "font-black text-xl uppercase tracking-tight", children: workout.title }), _jsxs("div", { className: "flex items-center gap-4 mt-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(Timer, { size: 12, className: "text-blue-400" }), " ", workout.duration, " ", t.mins] }), _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(Zap, { size: 12, className: "text-orange-400" }), " ", workout.calories, " kcal"] })] })] }), _jsx("div", { className: "w-12 h-12 rounded-full blue-bg flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform", children: _jsx(Play, { size: 20, className: "text-white fill-current ml-1" }) })] }, workout.id))) }), _jsxs("div", { className: "mt-4 bg-[#111111] rounded-[2.5rem] p-6 border border-white/5", children: [_jsxs("h3", { className: "font-black text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-2", children: [_jsx(Zap, { size: 14, className: "text-blue-400" }), t.exerciseDetails, " (Preview)"] }), _jsx("div", { className: "space-y-4", children: MOCK_WORKOUTS[0].exercises.map((ex) => (_jsxs("div", { className: "p-4 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-all", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-black", children: ex.name[0] }), _jsxs("div", { children: [_jsx("p", { className: "font-black text-sm uppercase tracking-tight", children: ex.name }), _jsxs("p", { className: "text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5", children: [ex.sets, " ", t.sets, " \u2022 ", ex.reps, " ", t.reps] })] })] }), _jsx(ChevronRight, { size: 18, className: "text-gray-700" })] }, ex.id))) })] }), _jsxs("button", { onClick: () => startSession(MOCK_WORKOUTS[0]), className: "w-full py-5 blue-bg rounded-[2rem] font-black text-white text-lg shadow-2xl shadow-blue-500/30 mt-4 active:scale-95 transition-all flex items-center justify-center gap-3 group uppercase tracking-widest", children: [_jsx(Play, { size: 22, className: "fill-current group-hover:scale-110 transition-transform" }), t.startWorkout] })] }));
};
export default WorkoutView;
