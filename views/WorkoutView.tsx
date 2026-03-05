
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS, MOCK_WORKOUTS } from '../constants';
// Added Dumbbell to imports
import { Play, Timer, Zap, CheckCircle2, ChevronRight, X, ChevronLeft, Award, Trophy, ArrowRight, Pause, PlayCircle, Dumbbell } from 'lucide-react';

const WorkoutView: React.FC = () => {
  const { language, setActiveTab, addPoints } = useApp();
  const t = TRANSLATIONS[language];

  // State for active session
  const [activeWorkout, setActiveWorkout] = useState<any | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [completedSets, setCompletedSets] = useState<number>(0);
  const [showSummary, setShowSummary] = useState(false);
  const [rpe, setRpe] = useState<number>(5);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (activeWorkout && !isPaused && !showSummary) {
      interval = setInterval(() => {
        setSessionSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeWorkout, isPaused, showSummary]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = (workout: any) => {
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
    } else {
      handleFinishWorkout();
    }
  };

  // 1. SUMMARY VIEW
  if (showSummary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-in zoom-in duration-500">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
          <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center shadow-2xl relative z-10">
            <Trophy size={48} className="text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-black blue-gradient uppercase tracking-widest mb-2">{t.congrats}</h2>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-8">{t.milestone}</p>

        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <p className="text-[8px] text-gray-500 font-black uppercase mb-1">{t.avgDuration.split(' ')[1]}</p>
            <p className="text-xl font-black text-white">{formatTime(sessionSeconds)}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <p className="text-[8px] text-gray-500 font-black uppercase mb-1">{t.pointsEarned.split(' ')[0]}</p>
            <p className="text-xl font-black text-blue-400">+{Math.round(activeWorkout.calories / 10 + 50)} {t.ep}</p>
          </div>
        </div>

        <div className="w-full max-w-sm mb-10 bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] shadow-inner">
          <label className="text-xs font-black uppercase text-gray-400 tracking-widest flex items-center justify-between mb-4">
            Intensity (RPE)
            <span className="text-blue-400 text-2xl bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20">{rpe}<span className="text-sm text-gray-500">/10</span></span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={rpe}
            onChange={(e) => setRpe(parseInt(e.target.value))}
            className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
          />
          <div className="flex justify-between text-[9px] text-gray-500 font-black uppercase tracking-widest mt-4">
            <span>Easy</span>
            <span className="text-center">Moderate</span>
            <span className="text-right text-red-500/50">Max</span>
          </div>
        </div>

        <button
          onClick={() => { setActiveWorkout(null); setActiveTab('dashboard'); }}
          className="w-full py-5 blue-bg rounded-[2rem] text-white font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all text-sm"
        >
          Submit Feedback & Finish
        </button>
      </div>
    );
  }

  // 2. ACTIVE SESSION VIEW
  if (activeWorkout) {
    const exercise = activeWorkout.exercises[currentExerciseIndex];
    const progress = ((currentExerciseIndex + 1) / activeWorkout.exercises.length) * 100;

    return (
      <div className="fixed inset-0 bg-black z-[60] flex flex-col p-6 animate-in slide-in-from-bottom duration-500">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setActiveWorkout(null)} className="p-3 bg-white/5 rounded-2xl text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
          <div className="text-center">
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">{activeWorkout.title}</h2>
            <p className="text-[10px] text-blue-400 font-bold uppercase mt-1">{exercise.category || activeWorkout.category}</p>
          </div>
          <button onClick={() => setIsPaused(!isPaused)} className={`p-3 rounded-2xl transition-all ${isPaused ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/5 text-gray-400'}`}>
            {isPaused ? <PlayCircle size={20} /> : <Pause size={20} />}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-12">
          <div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>

        {/* Timer Display */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Timer size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Session Time</span>
          </div>
          <h3 className="text-6xl font-black tracking-tighter tabular-nums">{formatTime(sessionSeconds)}</h3>
        </div>

        {/* Current Exercise Card */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <span className="text-blue-500 font-black text-xs uppercase tracking-[0.4em] mb-4">Exercise {currentExerciseIndex + 1} of {activeWorkout.exercises.length}</span>
          <h1 className="text-4xl font-black mb-6 uppercase leading-tight">{exercise.name}</h1>

          <div className="flex gap-8 mb-10">
            <div>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{t.sets}</p>
              <p className="text-3xl font-black">{exercise.sets}</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{t.reps}</p>
              <p className="text-3xl font-black">{exercise.reps}</p>
            </div>
          </div>

          <p className="text-gray-400 text-xs font-medium leading-relaxed max-w-[280px] italic">
            "{exercise.instructions}"
          </p>
        </div>

        {/* Set Counter / Navigation */}
        <div className="mt-auto space-y-4">
          <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-[2rem]">
            <div className="flex gap-1.5">
              {Array.from({ length: exercise.sets }).map((_, i) => (
                <div key={i} className={`w-8 h-2 rounded-full transition-all duration-300 ${i < completedSets ? 'bg-blue-500' : 'bg-white/10'}`} />
              ))}
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase">Set {completedSets} of {exercise.sets}</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setCompletedSets(prev => Math.min(prev + 1, exercise.sets))}
              disabled={completedSets >= exercise.sets}
              className="flex-1 py-5 bg-white/10 border border-white/10 rounded-[2rem] font-black uppercase text-sm flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-30"
            >
              <CheckCircle2 size={18} /> Complete Set
            </button>

            <button
              onClick={nextExercise}
              className="w-20 py-5 blue-bg rounded-[2rem] flex items-center justify-center text-white active:scale-95 transition-all shadow-lg"
            >
              <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. LIST VIEW (Default)
  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom duration-500 pb-12 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
          <Dumbbell className="text-blue-400" size={32} />
          {t.workouts}
        </h1>
        <button className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-blue-500/20 hover:bg-blue-500/20 transition-colors" onClick={() => setActiveTab('history')}>
          {t.history}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8 gap-4">
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-2">Available Programs</h2>
          {MOCK_WORKOUTS.map((workout) => (
            <div
              key={workout.id}
              onClick={() => startSession(workout)}
              className="bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] p-5 sm:p-6 flex items-center gap-5 sm:gap-6 hover:border-blue-500/30 transition-all cursor-pointer group active:scale-[0.98] shadow-lg hover:shadow-blue-500/10"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] bg-[#1a1a1a] flex items-center justify-center overflow-hidden relative border border-white/5 shadow-inner shrink-0">
                <img
                  src={`https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200&h=200&auto=format&fit=crop`}
                  alt={workout.title}
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-70 group-hover:scale-110 transition-all duration-500"
                />
                <Zap size={24} className="absolute text-blue-400 opacity-50 shadow-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">{workout.category}</span>
                </div>
                <h3 className="font-black text-xl sm:text-2xl uppercase tracking-tight truncate">{workout.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <Timer size={14} className="text-blue-400" /> {workout.duration} {t.mins}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Zap size={14} className="text-orange-400" /> {workout.calories} kcal
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full blue-bg flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform shrink-0">
                <Play size={20} className="text-white fill-current ml-1" />
              </div>
            </div>
          ))}
        </div>

        {/* Featured Exercise Breakdown & CTA */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#111111] rounded-[2.5rem] p-6 sm:p-8 border border-white/5 flex-1 flex flex-col">
            <h3 className="font-black text-xs sm:text-sm uppercase tracking-[0.2em] mb-6 flex items-center gap-2 text-gray-400">
              <Zap size={16} className="text-blue-400" />
              {t.exerciseDetails} (Preview)
            </h3>
            <div className="space-y-4 flex-1">
              {MOCK_WORKOUTS[0].exercises.map((ex) => (
                <div key={ex.id} className="p-4 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-transparent flex items-center justify-center text-blue-400 font-black border border-blue-500/20 group-hover:scale-105 transition-transform">
                      {ex.name[0]}
                    </div>
                    <div>
                      <p className="font-black text-sm sm:text-base uppercase tracking-tight text-gray-200 group-hover:text-white transition-colors">{ex.name}</p>
                      <p className="text-[10px] text-blue-400/80 font-bold uppercase tracking-widest mt-1">{ex.sets} {t.sets} • {ex.reps} {t.reps}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                </div>
              ))}
            </div>

            <button
              onClick={() => startSession(MOCK_WORKOUTS[0])}
              className="w-full py-5 blue-bg rounded-[2rem] font-black text-white text-lg sm:text-xl shadow-2xl shadow-blue-500/30 mt-8 active:scale-95 transition-all flex items-center justify-center gap-3 group uppercase tracking-widest hover:brightness-110"
            >
              <Play size={24} className="fill-current group-hover:scale-110 transition-transform" />
              {t.startWorkout}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutView;
