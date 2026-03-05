import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Heart, MessageSquare, Send, Users } from 'lucide-react';

const SocialView: React.FC = () => {
    const { language, user, socialPosts, addSocialPost, toggleLikePost, addCommentToPost } = useApp();
    const t = TRANSLATIONS[language];
    const [newPostContent, setNewPostContent] = useState('');
    const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

    const handlePostSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;
        addSocialPost(newPostContent);
        setNewPostContent('');
    };

    const handleCommentSubmit = (e: React.FormEvent, postId: string) => {
        e.preventDefault();
        const text = commentInputs[postId];
        if (!text?.trim()) return;
        addCommentToPost(postId, text);
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    };

    const timeAgo = (dateStr: string) => {
        const diffInMs = new Date().getTime() - new Date(dateStr).getTime();
        const diffInMins = Math.floor(diffInMs / 60000);
        if (diffInMins < 60) return `${diffInMins}m ago`;
        const diffInHours = Math.floor(diffInMins / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return `${Math.floor(diffInHours / 24)}d ago`;
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-12 w-full max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-gray-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">Community</h2>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mt-1">
                        Social Feed <span className="text-blue-500">.</span>
                    </h1>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 shrink-0">
                    <Users size={24} />
                </div>
            </div>

            {user?.role !== 'admin' && (
                <form onSubmit={handlePostSubmit} className="bg-[#0f0f0f] border border-white/5 rounded-[2rem] p-5 shadow-xl flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg select-none">
                            {user?.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <textarea
                            value={newPostContent}
                            onChange={e => setNewPostContent(e.target.value)}
                            placeholder="Share your workout progress..."
                            className="w-full bg-transparent border-none focus:ring-0 resize-none h-20 text-white placeholder:text-gray-600 font-medium"
                        />
                    </div>
                    <div className="flex justify-end border-t border-white/5 pt-4">
                        <button
                            type="submit"
                            disabled={!newPostContent.trim()}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-xl text-white font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                        >
                            Post
                        </button>
                    </div>
                </form>
            )}

            <div className="flex flex-col gap-6">
                {socialPosts.map(post => {
                    const isLiked = user && post.likedBy.includes(user.id);
                    return (
                        <div key={post.id} className="bg-[#0f0f0f] border border-white/5 rounded-[2rem] p-5 sm:p-6 shadow-xl flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg select-none">
                                        {post.authorName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white leading-tight">{post.authorName}</h3>
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{timeAgo(post.timestamp)}</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-300 font-medium whitespace-pre-wrap">{post.content}</p>

                            <div className="flex items-center gap-6 mt-2 pt-4 border-t border-white/5">
                                <button
                                    onClick={() => toggleLikePost(post.id)}
                                    className={`flex items-center gap-2 group transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}
                                >
                                    <Heart size={20} className={`transition-transform active:scale-75 ${isLiked ? 'fill-current' : ''}`} />
                                    <span className="text-xs font-black">{post.likesCount}</span>
                                </button>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <MessageSquare size={20} />
                                    <span className="text-xs font-black">{post.comments.length}</span>
                                </div>
                            </div>

                            {/* Comments Section */}
                            {post.comments.length > 0 && (
                                <div className="flex flex-col gap-4 mt-2 bg-black/20 rounded-2xl p-4">
                                    {post.comments.map(comment => (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-400 font-bold text-xs shrink-0 select-none">
                                                {comment.authorName.substring(0, 1).toUpperCase()}
                                            </div>
                                            <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-none p-3 pb-4 relative">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <span className="font-bold text-sm text-gray-200">{comment.authorName}</span>
                                                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{timeAgo(comment.timestamp)}</span>
                                                </div>
                                                <p className="text-gray-400 text-xs font-medium">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Comment */}
                            {user && user.role !== 'admin' && (
                                <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="relative mt-2">
                                    <input
                                        type="text"
                                        value={commentInputs[post.id] || ''}
                                        onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                        placeholder="Write a comment..."
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-3 pl-4 pr-12 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-all text-xs font-medium placeholder:text-gray-600"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!(commentInputs[post.id] || '').trim()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send size={16} />
                                    </button>
                                </form>
                            )}
                        </div>
                    );
                })}

                {socialPosts.length === 0 && (
                    <div className="text-center py-20 bg-[#0f0f0f] border border-white/5 rounded-[2rem] flex flex-col items-center justify-center opacity-70">
                        <Users size={48} className="text-gray-600 mb-4" />
                        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest">No Posts Yet</h3>
                        <p className="text-sm text-gray-500 font-medium">Be the first to share something with the community!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialView;
