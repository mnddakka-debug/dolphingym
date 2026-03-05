// Configuration
const API_BASE_URL = 'http://localhost:1337';
let conversationId = null;
let currentLanguage = 'ar';
let isProcessing = false;

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const modelSelect = document.getElementById('model-select');
const connectionStatus = document.getElementById('connection-status');

// Language translations
const translations = {
    ar: {
        headerTitle: 'مساعد الذكاء الاصطناعي',
        welcomeTitle: 'مرحباً! أنا مساعدك الذكي',
        welcomeText: 'اكتب أي سؤال وسأحاول مساعدتك. يمكنك الكتابة بالعربية أو الإنجليزية.',
        inputPlaceholder: 'اكتب رسالتك هنا...',
        inputHint: 'اضغط Enter للإرسال أو Shift+Enter لسطر جديد',
        connected: 'متصل',
        disconnected: 'غير متصل',
        newChat: 'محادثة جديدة',
        selectModel: 'اختر النموذج:',
        language: 'اللغة:',
        errorConnection: 'تعذر الاتصال بالخادم. تأكد من تشغيل API على http://localhost:1337',
        errorGeneric: 'حدث خطأ. يرجى المحاولة مرة أخرى.'
    },
    en: {
        headerTitle: 'AI Assistant',
        welcomeTitle: 'Hello! I\'m your smart assistant',
        welcomeText: 'Type any question and I\'ll try to help you. You can write in Arabic or English.',
        inputPlaceholder: 'Type your message here...',
        inputHint: 'Press Enter to send or Shift+Enter for new line',
        connected: 'Connected',
        disconnected: 'Disconnected',
        newChat: 'New Chat',
        selectModel: 'Select Model:',
        language: 'Language:',
        errorConnection: 'Could not connect to server. Make sure API is running on http://localhost:1337',
        errorGeneric: 'An error occurred. Please try again.'
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkConnection();
    loadTheme();
    setInterval(checkConnection, 30000); // Check connection every 30 seconds
});

// Check API connection
async function checkConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/v1/models`);
        if (response.ok) {
            updateConnectionStatus(true);
            const data = await response.json();
            updateModelList(data.data);
        } else {
            updateConnectionStatus(false);
        }
    } catch (error) {
        updateConnectionStatus(false);
    }
}

// Update connection status indicator
function updateConnectionStatus(connected) {
    const statusDot = document.querySelector('.status-dot');
    const t = translations[currentLanguage];
    
    if (connected) {
        statusDot.classList.remove('disconnected');
        connectionStatus.textContent = t.connected;
    } else {
        statusDot.classList.add('disconnected');
        connectionStatus.textContent = t.disconnected;
    }
}

// Update model list from API
function updateModelList(models) {
    if (!models || models.length === 0) return;
    
    // Keep default options, they match what the API provides
}

// Send message
async function sendMessage(event) {
    if (event) event.preventDefault();
    
    const message = messageInput.value.trim();
    if (!message || isProcessing) return;
    
    isProcessing = true;
    sendBtn.disabled = true;
    sendBtn.classList.add('loading');
    
    // Clear welcome message if present
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    // Add user message to chat
    addMessage(message, 'user');
    messageInput.value = '';
    autoResize(messageInput);
    
    // Add typing indicator
    const typingIndicator = addTypingIndicator();
    
    try {
        const response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: modelSelect.value,
                messages: [
                    { role: 'user', content: message }
                ],
                conversation_id: conversationId,
                stream: false
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update conversation ID
        if (data.id) {
            conversationId = data.id;
        }
        
        // Remove typing indicator
        typingIndicator.remove();
        
        // Add AI response
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const aiMessage = data.choices[0].message.content || 
                             (data.choices[0].message.audio && data.choices[0].message.audio.transcript);
            if (aiMessage) {
                addMessage(aiMessage, 'assistant');
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
        typingIndicator.remove();
        
        const t = translations[currentLanguage];
        showError(error.message.includes('fetch') ? t.errorConnection : t.errorGeneric);
    } finally {
        isProcessing = false;
        sendBtn.disabled = false;
        sendBtn.classList.remove('loading');
        messageInput.focus();
    }
}

// Send quick message
function sendQuickMessage(message) {
    messageInput.value = message;
    sendMessage();
}

// Add message to chat
function addMessage(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatarSvg = role === 'user' 
        ? '<svg viewBox="0 0 24 24" fill="none"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>';
    
    // Format content with markdown-like styling
    const formattedContent = formatMessage(content);
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            ${avatarSvg}
        </div>
        <div class="message-content">
            ${formattedContent}
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Format message content
function formatMessage(content) {
    // Escape HTML
    content = content.replace(/&/g, '&amp;')
                     .replace(/</g, '&lt;')
                     .replace(/>/g, '&gt;');
    
    // Code blocks
    content = content.replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    
    // Inline code
    content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Bold text
    content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Italic text
    content = content.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Line breaks
    content = content.replace(/\n/g, '<br>');
    
    // Wrap in paragraph
    return `<p>${content}</p>`;
}

// Add typing indicator
function addTypingIndicator() {
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'message assistant';
    indicatorDiv.id = 'typing-indicator';
    
    indicatorDiv.innerHTML = `
        <div class="message-avatar">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(indicatorDiv);
    scrollToBottom();
    
    return indicatorDiv;
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
        </svg>
        <span>${message}</span>
    `;
    
    chatMessages.appendChild(errorDiv);
    scrollToBottom();
    
    // Remove error after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Auto-resize textarea
function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
}

// Handle keyboard input
function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Start new chat
function startNewChat() {
    conversationId = null;
    chatMessages.innerHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" fill="currentColor"/>
                </svg>
            </div>
            <h2 id="welcome-title">${translations[currentLanguage].welcomeTitle}</h2>
            <p id="welcome-text">${translations[currentLanguage].welcomeText}</p>
            <div class="quick-actions">
                <button class="quick-action" onclick="sendQuickMessage('ما هي أحدث التقنيات في الذكاء الاصطناعي؟')">
                    <span>🤖</span> أحدث تقنيات AI
                </button>
                <button class="quick-action" onclick="sendQuickMessage('اكتب لي قصة قصيرة')">
                    <span>📝</span> اكتب قصة
                </button>
                <button class="quick-action" onclick="sendQuickMessage('What can you help me with?')">
                    <span>💡</span> Help me
                </button>
            </div>
        </div>
    `;
    messageInput.focus();
}

// Toggle sidebar (mobile)
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('hidden');
}

// Set language
function setLanguage(lang) {
    currentLanguage = lang;
    const t = translations[lang];
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    // Update text direction
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Update UI text
    document.getElementById('header-title').textContent = t.headerTitle;
    document.getElementById('message-input').placeholder = t.inputPlaceholder;
    document.getElementById('input-hint').textContent = t.inputHint;
    
    // Update welcome message if present
    const welcomeTitle = document.getElementById('welcome-title');
    const welcomeText = document.getElementById('welcome-text');
    if (welcomeTitle) welcomeTitle.textContent = t.welcomeTitle;
    if (welcomeText) welcomeText.textContent = t.welcomeText;
    
    // Update connection status
    const statusDot = document.querySelector('.status-dot');
    connectionStatus.textContent = statusDot.classList.contains('disconnected') 
        ? t.disconnected 
        : t.connected;
}

// Toggle theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    updateThemeIcon(newTheme);
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

// Update theme icon
function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    if (theme === 'dark') {
        themeIcon.innerHTML = '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" fill="currentColor"/>';
    } else {
        themeIcon.innerHTML = '<path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" fill="currentColor"/>';
    }
}

// Close sidebar when clicking outside (mobile)
document.addEventListener('click', (event) => {
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (window.innerWidth <= 768 && 
        !sidebar.contains(event.target) && 
        !menuToggle.contains(event.target) &&
        !sidebar.classList.contains('hidden')) {
        sidebar.classList.add('hidden');
    }
});
