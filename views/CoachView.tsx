import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Send, Bot, Loader2, ChevronDown, Plus, MessageSquare, Trash2, Menu, X, ChevronRight, ChevronLeft } from 'lucide-react';

interface Message {
  role: 'user' | 'coach';
  text: string;
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
  messages: Message[];
}

// Combined Agents: each has its own system persona + the best available API model
const AGENTS = [
  { id: 'coach-mini', emoji: '🏋️', label: 'Elite Coach', sub: 'GPT-4o Mini', color: '#3b82f6', modelId: 'keyless-gpt-4o-mini', systemPrefix: '' },
  { id: 'chatgpt', emoji: '🤖', label: 'ChatGPT', sub: 'GPT-4o Mini', color: '#10a37f', modelId: 'keyless-gpt-4o-mini', systemPrefix: 'You are ChatGPT, a large language model trained by OpenAI. Be helpful, witty, warm yet honest. Be direct; avoid sycophantic flattery. Ask a single follow-up question when natural.\n\n' },
  { id: 'gpt4o', emoji: '✨', label: 'GPT-4o', sub: 'GPT-4o', color: '#10a37f', modelId: 'keyless-gpt-4o', systemPrefix: "You are GPT-4o, OpenAI's multimodal flagship model. Be helpful, harmless, and honest. Think step by step for complex problems.\n\n" },
  { id: 'gpt41', emoji: '🧠', label: 'GPT-4.1', sub: 'GPT-4o', color: '#10a37f', modelId: 'keyless-gpt-4o', systemPrefix: 'You are GPT-4.1 made by OpenAI. You excel at instruction following and long-context understanding. Be precise, analytical, and thorough.\n\n' },
  { id: 'o3', emoji: '🧩', label: 'o3 Reasoning', sub: 'GPT-4o', color: '#6366f1', modelId: 'keyless-gpt-4o', systemPrefix: "You are o3, OpenAI's advanced reasoning model. You excel at complex multi-step reasoning. Think carefully and break down problems systematically.\n\n" },
  { id: 'claude', emoji: '🔮', label: 'Claude Sonnet', sub: 'Claude 3.5 Sonnet', color: '#d97706', modelId: 'keyless-claude-3.5-sonnet', systemPrefix: 'You are Claude, an AI assistant by Anthropic. Be thoughtful, nuanced, and careful. Think through problems step by step and acknowledge uncertainty.\n\n' },
  { id: 'grok', emoji: '⚡', label: 'Grok 4', sub: 'Mixtral 8x7b', color: '#9333ea', modelId: 'keyless-mixtral-8x7b', systemPrefix: 'You are Grok 4, built by xAI. You have continuously updated knowledge. Use tables for data. Be direct and not afraid to make well-substantiated claims. Employ deep reasoning.\n\n' },
  { id: 'gemini', emoji: '🌟', label: 'Gemini 2.5 Pro', sub: 'Llama 3.1 70B', color: '#4285f4', modelId: 'keyless-llama-3.1-70b', systemPrefix: 'You are Gemini, a helpful AI assistant by Google. Be accurate without hallucination. Be thorough and informative. Present all possible answers when multiple exist.\n\n' },
];

const CoachView: React.FC = () => {
  const { language, user } = useApp();
  const t = TRANSLATIONS[language];
  const isArabic = language === 'ar';

  // -- State for Chat Sessions --
  const STORAGE_KEY = 'dolphin-gym-coach-sessions';
  const getInitialSessions = (): ChatSession[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) { console.error('Error loading sessions', e); }
    return [];
  };

  const createInitialMessage = (): Message => ({
    role: 'coach',
    text: isArabic ? "مرحباً! أنا مدربك الذكي. هل أنت مستعد لتحقيق أهدافك الرياضية اليوم؟"
      : "Hey! I'm your Elite AI Coach. Ready to crush your fitness goals today?"
  });

  const [sessions, setSessions] = useState<ChatSession[]>(getInitialSessions());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Sidebar Toggles
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true); // Desktop sidebar toggle

  // Automatically select the most recent session or create a new one on first load
  useEffect(() => {
    if (sessions.length === 0) {
      handleNewSession();
    } else if (!activeSessionId) {
      // Find the most recently updated session
      const mostRecent = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt)[0];
      setActiveSessionId(mostRecent.id);
    }
  }, []);

  // Sync to LocalStorage whenever sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [sessions]);

  // Derived state: Active messages
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession?.messages || [];


  // -- General State --
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(AGENTS[0].id);
  const [showAgentMenu, setShowAgentMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const arabicTone = "استخدم لهجة رياضية محفزة جداً وشبابية (مزيج من الفصحى المبسطة والمصطلحات الرياضية الحماسية الدارجة في الجيم مثل 'يا وحش' و 'عاش').";
  const englishTone = "Use a highly engaging, motivational, and professional gym-bro tone (e.g., 'let's go', 'crush it').";

  const agent = AGENTS.find(a => a.id === selectedAgentId) || AGENTS[0];

  const systemPrompt = `${agent.systemPrefix}You are a professional gym trainer and nutritionist named 'Elite Coach'.
You provide concise, motivating, and scientifically-backed fitness advice.
Tone instructions: ${isArabic ? arabicTone : englishTone}
The user is ${user?.name || 'an athlete'}, age ${user?.age || 'unknown'}, weight ${user?.weight || 'unknown'}kg, goal is ${user?.goal || 'fitness'}.
If the user mentions their recent workout felt too hard (high RPE like 8-10), suggest lighter loads and recovery. If it felt too easy (RPE < 5), suggest progressive overload.
ALWAYS respond in ${isArabic ? 'Arabic' : 'English'}.`;

  // -- Handlers --
  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: isArabic ? 'محادثة جديدة' : 'New Chat',
      updatedAt: Date.now(),
      messages: [createInitialMessage()]
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setIsSidebarOpen(false);
    setIsDesktopSidebarOpen(true);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);

    if (activeSessionId === id) {
      if (newSessions.length > 0) {
        setActiveSessionId(newSessions[0].id);
      } else {
        // If empty, immediately create a new one
        const fallbackId = crypto.randomUUID();
        setSessions([{
          id: fallbackId,
          title: isArabic ? 'محادثة جديدة' : 'New Chat',
          updatedAt: Date.now(),
          messages: [createInitialMessage()]
        }]);
        setActiveSessionId(fallbackId);
      }
    }
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setIsSidebarOpen(false);
  };

  const updateSessionMessages = (newMessages: Message[], newTitle?: string) => {
    if (!activeSessionId) return;
    setSessions(prev => prev.map(session => {
      if (session.id === activeSessionId) {
        return {
          ...session,
          messages: newMessages,
          updatedAt: Date.now(),
          title: newTitle ? newTitle : session.title
        };
      }
      return session;
    }));
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !activeSessionId) return;

    const userMessage = input;
    setInput('');

    // Check if we need to auto-title the session (if it's the first user message)
    let newTitle = undefined;
    if (messages.length === 1 && messages[0].role === 'coach') {
      newTitle = userMessage.length > 25 ? userMessage.substring(0, 25) + '...' : userMessage;
    }

    const newMessagesList = [...messages, { role: 'user' as const, text: userMessage }];
    updateSessionMessages(newMessagesList, newTitle);
    setLoading(true);

    let aiText: string | null = null;
    const GEMINI_KEY = 'AIzaSyDgh-bx_t04TBzCSmPng_yH6GaQeM3acoQ';
    const isProduction = import.meta.env.PROD;

    // 1️⃣ Try local AI backend ONLY in dev mode (not on Netlify/mobile)
    if (!isProduction) {
      try {
        const response = await fetch('/api/ai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(4000),
          body: JSON.stringify({
            model: agent.modelId,
            conversation_id: activeSessionId,
            stream: false,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
          }),
        });
        if (response.ok) {
          const data = await response.json();
          aiText = data?.choices?.[0]?.message?.content || null;
        }
      } catch {
        // Local backend unavailable — fall through to Gemini
      }
    }

    // 2️⃣ Pollinations.AI — free, no key, works globally from browser
    if (!aiText) {
      try {
        const pollinationsRes = await fetch('https://text.pollinations.ai/openai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'openai',
            messages: [
              { role: 'system', content: systemPrompt },
              ...newMessagesList
                .filter((m, idx) => !(m.role === 'coach' && idx === 0))
                .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
            ],
            temperature: 0.8,
            max_tokens: 500,
            stream: false,
            private: true
          })
        });
        if (pollinationsRes.ok) {
          const pData = await pollinationsRes.json();
          aiText = pData.choices?.[0]?.message?.content || null;
        } else {
          console.error('Pollinations error:', pollinationsRes.status);
        }
      } catch (err) {
        console.error('Pollinations error:', err);
      }
    }

    if (aiText) {
      updateSessionMessages([...newMessagesList, { role: 'coach', text: aiText }]);
      setLoading(false);
      return;
    }

    // Both failed
    try {
      throw new Error('Both AI backends unavailable');
    } catch (error) {
      console.error(error);
      const errMsg = isArabic
        ? "⚠️ خادم الذكاء الاصطناعي غير متاح. يرجى تشغيل ai-backend/start.bat أولاً."
        : "⚠️ AI server is offline. Please run ai-backend/start.bat first.";
      updateSessionMessages([...newMessagesList, { role: 'coach', text: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  // Sort sessions for sidebar
  const sortedSessions = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className={`flex h-[calc(100vh-180px)] animate-in zoom-in-95 duration-500 relative overflow-hidden ${isArabic ? 'flex-row-reverse' : ''}`}>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col h-full min-w-0 transition-all duration-300 ${isDesktopSidebarOpen ? (isArabic ? 'ml-0 lg:ml-6' : 'mr-0 lg:mr-6') : 'mx-0 lg:mx-12'}`}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 hover:bg-white/5 rounded-xl transition-colors">
              <Menu size={20} className="text-white/70" />
            </button>
            <button
              onClick={() => setIsDesktopSidebarOpen(prev => !prev)}
              className="hidden lg:flex p-2 -ml-2 -mr-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-[#3b82f6]"
            >
              {isDesktopSidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            <div className={`w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 ${!isDesktopSidebarOpen ? 'ml-2' : ''}`}>
              <Bot size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">{t.aiCoach}</h1>
              <p className="text-[10px] text-green-500 flex items-center gap-1 font-bold tracking-widest uppercase mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> Online
              </p>
            </div>
          </div>

          {/* Single Agent Selector */}
          <div className="relative">
            <button
              onClick={() => setShowAgentMenu(p => !p)}
              className="flex items-center gap-2 bg-[#111] border rounded-xl px-3 py-2 hover:opacity-90 transition-all shadow-sm"
              style={{ borderColor: agent.color + '55' }}
            >
              <span className="text-base leading-none">{agent.emoji}</span>
              <div className="flex flex-col items-start">
                <span className="font-bold text-[11px] leading-tight" style={{ color: agent.color }}>{agent.label}</span>
                <span className="text-[9px] text-white/35 leading-tight">{agent.sub}</span>
              </div>
              <ChevronDown size={13} style={{ color: agent.color }} className={showAgentMenu ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>
            {showAgentMenu && (
              <div className="absolute right-0 top-full mt-2 bg-[#131316] border border-white/10 rounded-2xl overflow-hidden z-30 min-w-[260px] shadow-2xl">
                <p className="text-[9px] text-white/30 uppercase tracking-widest font-black px-4 pt-3 pb-1.5 border-b border-white/5">Select AI Agent</p>
                {AGENTS.map(a => (
                  <button
                    key={a.id}
                    onClick={() => { setSelectedAgentId(a.id); setShowAgentMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors flex items-center gap-3 ${selectedAgentId === a.id ? 'bg-white/5' : ''}`}
                  >
                    <span className="text-base">{a.emoji}</span>
                    <div className="flex flex-col flex-1">
                      <span className="text-xs font-semibold leading-tight" style={{ color: a.color }}>{a.label}</span>
                      <span className="text-[9px] text-white/35 leading-tight">via {a.sub}</span>
                    </div>
                    {selectedAgentId === a.id && <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Active</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>


        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar scroll-smooth">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${m.role === 'user'
                ? 'bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] text-[#0a0a0b] font-medium rounded-tr-sm'
                : 'bg-[#18181b] border border-white/5 text-white/90 rounded-tl-sm'
                }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#18181b] border border-white/5 p-4 rounded-3xl rounded-tl-sm flex items-center gap-3">
                <Loader2 size={16} className="animate-spin text-[#3b82f6]" />
                <span className="text-xs text-white/50 animate-pulse">{isArabic ? 'يكتب...' : 'Typing...'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="mt-4 relative mb-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isArabic ? 'اسأل مدربك الذكي...' : 'Ask your AI Coach anything...'}
            className={`w-full bg-[#111111] border border-white/10 rounded-2xl py-4 ${isArabic ? 'pr-6 pl-14' : 'px-6 pr-14'} focus:outline-none focus:border-[#3b82f6] transition-all focus:ring-1 focus:ring-[#3b82f6]/50 shadow-inner`}
          />
          <button
            onClick={handleSend}
            className={`absolute ${isArabic ? 'left-3' : 'right-3'} top-2 w-10 h-10 bg-[#3b82f6] hover:bg-[#1d4ed8] hover:scale-105 active:scale-95 transition-all rounded-xl flex items-center justify-center text-[#0a0a0b] shadow-lg disabled:opacity-50 disabled:hover:scale-100`}
            disabled={loading || !input.trim()}
          >
            <Send size={18} className={isArabic ? 'rotate-180' : ''} />
          </button>
        </div>
      </div >

      {/* History Sidebar */}
      < div className={`
        fixed inset-y-0 ${isArabic ? 'left-0' : 'right-0'} z-50 w-72 bg-[#0a0a0b] border-${isArabic ? 'r' : 'l'} border-white/10 p-4 flex flex-col transition-all duration-300 ease-in-out
        lg:static lg:h-full lg:bg-transparent lg:border-none lg:p-0
        ${isSidebarOpen ? 'translate-x-0' : (isArabic ? '-translate-x-full lg:translate-x-0' : 'translate-x-full lg:translate-x-0')}
        ${isDesktopSidebarOpen ? 'lg:w-64 lg:opacity-100' : 'lg:w-0 lg:opacity-0 lg:overflow-hidden lg:invisible'}
      `}>
        <div className="flex items-center justify-between mb-4 lg:hidden pb-4 border-b border-white/10">
          <h2 className="font-bold text-white/90">{isArabic ? 'سجل المحادثات' : 'Chat History'}</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-white/50 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <button
          onClick={handleNewSession}
          className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl py-3 text-sm font-medium transition-colors mb-6 shadow-sm group whitespace-nowrap"
        >
          <Plus size={16} className="text-[#3b82f6] group-hover:rotate-90 transition-transform duration-300" />
          {isArabic ? 'محادثة جديدة' : 'New Chat'}
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
          {sortedSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => handleSelectSession(session.id)}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${activeSessionId === session.id
                ? 'bg-[#3b82f6]/10 border-[#3b82f6]/30'
                : 'bg-transparent border-transparent hover:bg-white/5'
                }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={16} className={activeSessionId === session.id ? 'text-[#3b82f6]' : 'text-white/40'} />
                <div className="flex flex-col overflow-hidden">
                  <span className={`text-sm truncate font-medium w-40 ${activeSessionId === session.id ? 'text-[#3b82f6]' : 'text-white/80'}`}>
                    {session.title}
                  </span>
                  <span className="text-[10px] text-white/40 mt-0.5">
                    {new Date(session.updatedAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => handleDeleteSession(session.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-red-400/70 hover:text-red-400 rounded-lg transition-all flex-shrink-0"
                title={isArabic ? 'حذف' : 'Delete'}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {sortedSessions.length === 0 && (
            <div className="text-center text-white/40 text-sm mt-10">
              {isArabic ? 'لا توجد محادثات سابقة' : 'No previous chats'}
            </div>
          )}
        </div>
      </div >

    </div >
  );
};

export default CoachView;

