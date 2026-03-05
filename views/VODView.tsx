import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Play, Clock, User, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoContent } from '../types';

const VODView: React.FC = () => {
    const { language, videos } = useApp();
    const t = TRANSLATIONS[language];

    const [activeVideo, setActiveVideo] = useState<VideoContent | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const categories = ['All', ...Array.from(new Set(videos.map(v => v.category)))];

    const filteredVideos = selectedCategory === 'All'
        ? videos
        : videos.filter(v => v.category === selectedCategory);

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-20 w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                        <Play className="text-red-500" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-widest text-white">Video Library</h1>
                        <p className="text-xs text-red-400/80 font-black uppercase tracking-widest mt-1">On-Demand Workouts</p>
                    </div>
                </div>
            </div>

            {/* Categories Filter */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 pt-1 border-b border-white/5">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-5 py-2.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === category
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 scale-105'
                            : 'bg-[#111] text-gray-500 border border-white/5 hover:border-white/20 hover:text-white'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredVideos.map((video) => (
                        <motion.div
                            key={video.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="group bg-[#111] border border-white/5 rounded-3xl overflow-hidden hover:border-red-500/30 transition-colors cursor-pointer"
                            onClick={() => setActiveVideo(video)}
                        >
                            {/* Thumbnail Container */}
                            <div className="relative aspect-video overflow-hidden bg-black w-full">
                                <img
                                    src={video.thumbnailUrl}
                                    alt={video.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                                />
                                {/* Play overlay */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-16 h-16 bg-red-500/90 rounded-full flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform shadow-2xl shadow-red-500/50">
                                        <Play size={32} className="ml-1" />
                                    </div>
                                </div>
                                {/* Duration Badge */}
                                <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-black text-white flex items-center gap-1 border border-white/10">
                                    <Clock size={10} className="text-red-400" />
                                    {video.durationMins}m
                                </div>
                            </div>

                            {/* Info Container */}
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20">
                                        {video.category}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition-colors">{video.title}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{video.description}</p>

                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest pt-4 border-t border-white/5">
                                    <User size={14} className="text-gray-500" />
                                    {video.instructorName}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredVideos.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-[#111] border border-white/5 rounded-3xl">
                        <Sparkles size={48} className="text-white/10 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Videos Found</h3>
                        <p className="text-gray-500 text-sm">Try selecting a different category.</p>
                    </div>
                )}
            </div>

            {/* Video Player Modal */}
            {activeVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/50">
                            <h2 className="text-sm font-bold text-white truncate px-2">{activeVideo.title} <span className="text-gray-500 font-normal ml-2">with {activeVideo.instructorName}</span></h2>
                            <button
                                onClick={() => setActiveVideo(null)}
                                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Video Container (16:9 aspect ratio) */}
                        <div className="relative w-full aspect-video bg-black flex flex-col items-center justify-center group overflow-hidden">
                            {activeVideo.videoUrl.includes('youtube.com') || activeVideo.videoUrl.includes('youtu.be') ? (
                                <iframe
                                    src={activeVideo.videoUrl}
                                    title={activeVideo.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full border-0"
                                />
                            ) : (
                                <video
                                    src={activeVideo.videoUrl}
                                    poster={activeVideo.thumbnailUrl}
                                    controls
                                    autoPlay
                                    className="w-full h-full object-contain"
                                    controlsList="nodownload"
                                >
                                    Your browser does not support HTML5 video.
                                </video>
                            )}
                        </div>

                        {/* Description below video */}
                        <div className="p-6 bg-[#111]">
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <h3 className="text-xl font-black text-white">{activeVideo.title}</h3>
                                <span className="text-xs font-black uppercase tracking-widest bg-red-500/10 text-red-500 px-3 py-1 rounded-full border border-red-500/20 whitespace-nowrap">
                                    {activeVideo.category}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed max-w-3xl">
                                {activeVideo.description}
                            </p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default VODView;
