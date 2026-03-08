import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { MessageCircle, Send, User as UserIcon, ArrowLeft } from 'lucide-react';

const MessagesView: React.FC = () => {
    const { language, user, members, messages, sendMessage, markMessageRead, getUnreadCount } = useApp();
    const t = TRANSLATIONS[language];
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [newText, setNewText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isTrainer = user?.role === 'admin' || user?.role === 'trainer';

    // Contacts differ depending on role
    const contacts = useMemo(() => {
        if (isTrainer) return members;
        // Members can message real trainers and admins
        return members.filter(m => m.role === 'admin' || m.role === 'trainer');
    }, [isTrainer, members]);

    const selectedContact = contacts.find(c => c.id === selectedContactId);

    const conversation = useMemo(() => {
        if (!user || !selectedContactId) return [];
        return messages.filter(m =>
            (m.fromId === user.id && m.toId === selectedContactId) ||
            (m.fromId === selectedContactId && m.toId === user.id)
        ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [messages, user, selectedContactId]);

    // Mark messages as read when opening conversation
    useEffect(() => {
        if (!selectedContactId || !user) return;
        messages.filter(m => m.toId === user.id && m.fromId === selectedContactId && !m.read)
            .forEach(m => markMessageRead(m.id));
    }, [selectedContactId, messages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);

    const handleSend = () => {
        if (!newText.trim() || !selectedContactId || !selectedContact) return;
        sendMessage(selectedContactId, selectedContact.name, newText.trim());
        setNewText('');
    };

    const getLastMessage = (contactId: string) => {
        const conv = messages.filter(m =>
            (m.fromId === user?.id && m.toId === contactId) ||
            (m.fromId === contactId && m.toId === user?.id)
        ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return conv[0] || null;
    };

    const getUnreadFromContact = (contactId: string) =>
        messages.filter(m => m.fromId === contactId && m.toId === user?.id && !m.read).length;

    return (
        <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-500 pb-12 h-full">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20">
                    <MessageCircle className="text-cyan-400" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{t.messages}</h1>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                        {getUnreadCount()} unread
                    </p>
                </div>
            </div>

            <div className="flex gap-4 h-[600px]">
                {/* Contact list */}
                <div className={`bg-[#111] rounded-[2rem] border border-white/5 overflow-hidden flex flex-col ${selectedContactId ? 'hidden sm:flex w-72 shrink-0' : 'flex-1 sm:w-72 sm:flex-none sm:shrink-0'}`}>
                    <div className="p-4 border-b border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Conversations</p>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {contacts.map(contact => {
                            const last = getLastMessage(contact.id);
                            const unread = getUnreadFromContact(contact.id);
                            return (
                                <button
                                    key={contact.id}
                                    onClick={() => setSelectedContactId(contact.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-white/5 transition-all border-b border-white/5 ${selectedContactId === contact.id ? 'bg-cyan-500/5 border-l-2 border-l-cyan-500' : ''}`}
                                >
                                    <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-sm font-black text-cyan-400 shrink-0">
                                        {contact.name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-sm truncate">{contact.name}</p>
                                            {unread > 0 && <span className="bg-cyan-500 text-black text-[9px] px-1.5 py-0.5 rounded-full font-black shrink-0">{unread}</span>}
                                        </div>
                                        {last && <p className="text-[10px] text-gray-500 truncate mt-0.5">{last.text}</p>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Chat area */}
                {selectedContactId && selectedContact ? (
                    <div className="flex-1 bg-[#111] rounded-[2rem] border border-white/5 flex flex-col overflow-hidden">
                        {/* Chat header */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                            <button onClick={() => setSelectedContactId(null)} className="sm:hidden text-gray-400 mr-1"><ArrowLeft size={20} /></button>
                            <div className="w-9 h-9 bg-cyan-500/10 rounded-xl flex items-center justify-center text-sm font-black text-cyan-400">
                                {selectedContact.name[0]}
                            </div>
                            <div>
                                <p className="font-black text-sm">{selectedContact.name}</p>
                                <p className="text-[10px] text-gray-500 capitalize">{selectedContact.role}</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {conversation.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-gray-600">
                                    <MessageCircle size={40} className="mb-2 opacity-20" />
                                    <p className="text-sm">{t.noMessages}</p>
                                </div>
                            )}
                            {conversation.map(msg => {
                                const isMe = msg.fromId === user?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-cyan-500/20 text-cyan-100 rounded-br-md' : 'bg-white/5 text-gray-200 rounded-bl-md'}`}>
                                            <p>{msg.text}</p>
                                            <p className={`text-[9px] mt-1.5 ${isMe ? 'text-cyan-500/50 text-right' : 'text-gray-600'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/5 flex gap-3">
                            <input
                                value={newText}
                                onChange={e => setNewText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-cyan-500 transition-all"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!newText.trim()}
                                className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-4 rounded-2xl hover:bg-cyan-500/20 transition-all disabled:opacity-30"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 hidden sm:flex items-center justify-center bg-[#111] rounded-[2rem] border border-white/5">
                        <div className="text-center text-gray-600">
                            <MessageCircle size={48} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm">Select a conversation</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesView;
