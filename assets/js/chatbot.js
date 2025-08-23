/**
 * MIRASENS Chatbot Widget
 * Multilingual AI-powered chatbot with Google Gemini integration
 */

class MirasensChatbot {
    constructor(config = {}) {
        // Detect if we're in production or development
        const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        
        this.config = {
            apiUrl: config.apiUrl || (isProduction 
                ? `${window.location.protocol}//${window.location.hostname}/api` // Production: same domain
                : 'http://localhost:3001/api' // Development: localhost
            ),
            language: config.language || 'fr',
            autoDetectLanguage: config.autoDetectLanguage !== false,
            showWelcomeMessage: config.showWelcomeMessage !== false,
            ...config
        };
        
        this.isOpen = false;
        this.conversationHistory = [];
        this.currentLanguage = this.config.language;
        this.isTyping = false;
        
        this.translations = {
            fr: {
                title: 'Assistant MIRASENS',
                subtitle: 'Expert IoT • En ligne',
                placeholder: 'Tapez votre message...',
                send: 'Envoyer',
                welcome: {
                    title: 'Bonjour ! 👋',
                    message: 'Je suis l\'assistant IA de MIRASENS. Comment puis-je vous aider avec vos projets IoT aujourd\'hui ?'
                },
                quickActions: {
                    title: 'Questions rapides :',
                    actions: [
                        'Nos solutions',
                        'Smart Agriculture', 
                        'Prix et devis',
                        'Contact expert'
                    ]
                },
                errors: {
                    network: 'Erreur de connexion. Veuillez réessayer.',
                    general: 'Une erreur s\'est produite. Veuillez réessayer.',
                    timeout: 'Délai d\'attente dépassé. Veuillez réessayer.'
                },
                typing: 'Assistant en train d\'écrire...'
            },
            en: {
                title: 'MIRASENS Assistant',
                subtitle: 'IoT Expert • Online',
                placeholder: 'Type your message...',
                send: 'Send',
                welcome: {
                    title: 'Hello! 👋',
                    message: 'I\'m the MIRASENS AI assistant. How can I help you with your IoT projects today?'
                },
                quickActions: {
                    title: 'Quick questions:',
                    actions: [
                        'Our solutions',
                        'Smart Agriculture',
                        'Pricing & quotes', 
                        'Contact expert'
                    ]
                },
                errors: {
                    network: 'Connection error. Please try again.',
                    general: 'An error occurred. Please try again.',
                    timeout: 'Request timeout. Please try again.'
                },
                typing: 'Assistant is typing...'
            }
        };
        
        this.init();
    }
    
    init() {
        this.detectLanguage();
        this.createWidget();
        this.attachEventListeners();
        this.setupLanguageChangeListener();
        this.showWelcomeMessage();
    }
    
    setupLanguageChangeListener() {
        // Listen for i18next language changes
        if (window.i18next) {
            window.i18next.on('languageChanged', (lng) => {
                console.log('Chatbot detected language change to:', lng);
                const newLang = lng.split('-')[0];
                if (['fr', 'en'].includes(newLang) && newLang !== this.currentLanguage) {
                    this.updateLanguage(newLang);
                }
            });
        }
        
        // Also listen for storage events (when language is changed in localStorage)
        window.addEventListener('storage', (e) => {
            if (e.key === 'userLanguage' && e.newValue !== e.oldValue) {
                const newLang = e.newValue;
                if (['fr', 'en'].includes(newLang) && newLang !== this.currentLanguage) {
                    console.log('Chatbot detected localStorage language change to:', newLang);
                    this.updateLanguage(newLang);
                }
            }
        });
        
        // Listen for custom language change events
        window.addEventListener('languageChanged', (e) => {
            const newLang = e.detail?.language || e.detail;
            if (['fr', 'en'].includes(newLang) && newLang !== this.currentLanguage) {
                console.log('Chatbot detected custom language change event:', newLang);
                this.updateLanguage(newLang);
            }
        });
    }
    
    updateLanguage(newLanguage = null) {
        // If a new language is provided, validate and set it
        if (newLanguage) {
            if (!['fr', 'en'].includes(newLanguage)) {
                console.warn('Invalid language provided to updateLanguage:', newLanguage);
                return;
            }
            this.currentLanguage = newLanguage;
            // Save to localStorage
            localStorage.setItem('chatbotLanguage', newLanguage);
        }
        
        // Ensure we have a valid current language
        if (!this.currentLanguage) {
            console.warn('Cannot update language: currentLanguage is undefined');
            return;
        }
        
        // Update the chatbot interface with new language
        this.updateChatbotInterface();
        
        // Update language indicator
        this.updateLanguageIndicator();
        
        // Show language change notification if language was changed and chat is open
        if (this.isOpen && newLanguage) {
            this.addLanguageChangeMessage();
        }
        
        console.log('Chatbot language updated to:', this.currentLanguage);
    }
    
    updateChatbotInterface() {
        // Update header content
        const headerTitle = this.widget.querySelector('.chatbot-info h4');
        const headerSubtitle = this.widget.querySelector('.chatbot-info p');
        const inputPlaceholder = this.widget.querySelector('.message-input');
        
        if (headerTitle) {
            headerTitle.textContent = this.translations[this.currentLanguage].title;
        }
        if (headerSubtitle) {
            headerSubtitle.textContent = this.translations[this.currentLanguage].subtitle;
        }
        if (inputPlaceholder) {
            inputPlaceholder.placeholder = this.translations[this.currentLanguage].placeholder;
        }
        
        // Update quick actions if they exist
        this.updateQuickActions();
    }
    
    updateLanguageIndicator() {
        const indicator = this.widget.querySelector('.language-indicator');
        if (indicator && this.currentLanguage) {
            indicator.textContent = this.currentLanguage.toUpperCase();
        }
    }
    
    updateQuickActions() {
        const quickActionsContainer = this.widget.querySelector('.quick-actions');
        if (quickActionsContainer) {
            const title = quickActionsContainer.querySelector('.quick-actions-title');
            const buttons = quickActionsContainer.querySelectorAll('.quick-action-btn');
            
            if (title) {
                title.textContent = this.translations[this.currentLanguage].quickActions.title;
            }
            
            buttons.forEach((btn, index) => {
                if (this.translations[this.currentLanguage].quickActions.actions[index]) {
                    btn.textContent = this.translations[this.currentLanguage].quickActions.actions[index];
                }
            });
        }
    }
    
    addLanguageChangeMessage() {
        if (!this.currentLanguage) {
            console.warn('Cannot add language change message: currentLanguage is undefined');
            return;
        }
        
        const message = this.currentLanguage === 'fr' 
            ? "🌐 Interface mise à jour en français"
            : "🌐 Interface updated to English";
            
        this.addMessage(message, 'bot', { isSystemMessage: true });
    }
    
    detectLanguage() {
        if (this.config.autoDetectLanguage) {
            // Check i18next current language if available
            if (window.i18next && window.i18next.language) {
                const lang = window.i18next.language.split('-')[0];
                if (['fr', 'en'].includes(lang)) {
                    this.currentLanguage = lang;
                    return;
                }
            }
            
            // Check URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const urlLang = urlParams.get('lang');
            if (urlLang && ['fr', 'en'].includes(urlLang)) {
                this.currentLanguage = urlLang;
                return;
            }
            
            // Check localStorage
            const storedLang = localStorage.getItem('userLanguage');
            if (storedLang && ['fr', 'en'].includes(storedLang)) {
                this.currentLanguage = storedLang;
                return;
            }
            
            // Check browser language
            const browserLang = navigator.language.split('-')[0];
            if (['fr', 'en'].includes(browserLang)) {
                this.currentLanguage = browserLang;
            }
        }
    }
    
    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            value = value?.[k];
        }
        
        return value || key;
    }
    
    createWidget() {
        const widget = document.createElement('div');
        widget.className = 'mirasens-chatbot';
        widget.innerHTML = `
            <div class="chatbot-window" id="chatbot-window">
                <div class="chatbot-header">
                    <div class="language-indicator">${this.currentLanguage.toUpperCase()}</div>
                    <div class="chatbot-header-content">
                        <div class="chatbot-avatar">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path fill="white" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                        </div>
                        <div class="chatbot-info">
                            <h4>${this.t('title')}</h4>
                            <p>${this.t('subtitle')}</p>
                        </div>
                    </div>
                    <button class="chatbot-close" id="chatbot-close">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                
                <div class="chatbot-messages" id="chatbot-messages">
                    <!-- Messages will be inserted here -->
                </div>
                
                <div class="typing-indicator" id="typing-indicator">
                    <span>${this.t('typing')}</span>
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
                
                <div class="quick-actions" id="quick-actions">
                    <div class="quick-actions-title">${this.t('quickActions.title')}</div>
                    <div class="quick-actions-buttons">
                        ${this.t('quickActions.actions').map(action => 
                            `<button class="quick-action-btn" data-action="${action}">${action}</button>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="chatbot-input">
                    <textarea 
                        class="chatbot-input-field" 
                        id="chatbot-input"
                        placeholder="${this.t('placeholder')}"
                        rows="1"
                    ></textarea>
                    <button class="chatbot-send" id="chatbot-send" title="${this.t('send')}">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <button class="chatbot-toggle" id="chatbot-toggle">
                <div class="chatbot-notification" id="chatbot-notification" style="display: none;">1</div>
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
            </button>
        `;
        
        document.body.appendChild(widget);
        this.widget = widget;
    }
    
    attachEventListeners() {
        const toggle = document.getElementById('chatbot-toggle');
        const close = document.getElementById('chatbot-close');
        const input = document.getElementById('chatbot-input');
        const send = document.getElementById('chatbot-send');
        const quickActions = document.getElementById('quick-actions');
        
        toggle.addEventListener('click', () => this.toggleChat());
        close.addEventListener('click', () => this.closeChat());
        send.addEventListener('click', () => this.sendMessage());
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        input.addEventListener('input', () => {
            this.autoResizeTextarea(input);
        });
        
        quickActions.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-action-btn')) {
                const action = e.target.getAttribute('data-action');
                this.sendMessage(action);
                this.hideQuickActions();
            }
        });
        
        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.widget.contains(e.target)) {
                this.closeChat();
            }
        });
    }
    
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    }
    
    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }
    
    openChat() {
        const window = document.getElementById('chatbot-window');
        const toggle = document.getElementById('chatbot-toggle');
        const notification = document.getElementById('chatbot-notification');
        
        window.classList.add('active');
        toggle.classList.add('active');
        notification.style.display = 'none';
        
        this.isOpen = true;
        
        // Focus input after animation
        setTimeout(() => {
            document.getElementById('chatbot-input').focus();
        }, 300);
    }
    
    closeChat() {
        const window = document.getElementById('chatbot-window');
        const toggle = document.getElementById('chatbot-toggle');
        
        window.classList.remove('active');
        toggle.classList.remove('active');
        this.isOpen = false;
    }
    
    clearMessages() {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
    }
    
    showWelcomeMessage() {
        if (this.config.showWelcomeMessage) {
            const welcomeMsg = `
                <div class="welcome-message">
                    <h4>${this.t('welcome.title')}</h4>
                    <p>${this.t('welcome.message')}</p>
                </div>
            `;
            this.addMessage('bot', welcomeMsg);
        }
    }
    
    hideQuickActions() {
        const quickActions = document.getElementById('quick-actions');
        quickActions.style.display = 'none';
    }
    
    async sendMessage(text = null) {
        const input = document.getElementById('chatbot-input');
        const message = text || input.value.trim();
        
        if (!message) return;
        
        // Clear input and resize
        if (!text) {
            input.value = '';
            this.autoResizeTextarea(input);
        }
        
        // Add user message
        this.addMessage('user', message);
        this.conversationHistory.push({ role: 'user', content: message });
        
        // Show typing indicator
        this.showTyping();
        
        try {
            const response = await this.callChatAPI(message);
            this.hideTyping();
            
            if (response.response) {
                this.addMessage('bot', response.response);
                this.conversationHistory.push({ role: 'assistant', content: response.response });
                
                // Update language if detected differently
                if (response.language && response.language !== this.currentLanguage) {
                    this.updateLanguage(response.language);
                }
            } else {
                throw new Error('Empty response');
            }
            
        } catch (error) {
            this.hideTyping();
            console.error('Chat error:', error);
            
            let errorMessage = this.t('errors.general');
            if (error.message.includes('fetch')) {
                errorMessage = this.t('errors.network');
            } else if (error.message.includes('timeout')) {
                errorMessage = this.t('errors.timeout');
            }
            
            this.addMessage('bot', errorMessage, true);
        }
        
        // Scroll to bottom
        this.scrollToBottom();
    }
    
    async callChatAPI(message) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
        
        try {
            const response = await fetch(`${this.config.apiUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    language: this.currentLanguage || 'fr', // Send current language
                    conversationHistory: this.conversationHistory.slice(-10) // Last 10 messages
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
            
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    
    addMessage(sender, content, options = {}) {
        // Handle legacy isError parameter
        if (typeof options === 'boolean') {
            options = { isError: options };
        }
        
        const { isError = false, isSystemMessage = false } = options;
        
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        
        let className = `message ${sender}`;
        if (isError) className += ' error';
        if (isSystemMessage) className += ' system';
        
        messageDiv.className = className;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">
                ${content}
                <div class="message-time">${time}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    showTyping() {
        const typingIndicator = document.getElementById('typing-indicator');
        typingIndicator.classList.add('active');
        this.isTyping = true;
        this.scrollToBottom();
    }
    
    hideTyping() {
        const typingIndicator = document.getElementById('typing-indicator');
        typingIndicator.classList.remove('active');
        this.isTyping = false;
    }
    
    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbot-messages');
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }
    
    showNotification() {
        if (!this.isOpen) {
            const notification = document.getElementById('chatbot-notification');
            notification.style.display = 'flex';
        }
    }
    
    // Public API methods
    openChatWindow() {
        this.openChat();
    }
    
    sendCustomMessage(message) {
        this.sendMessage(message);
    }
    
    setLanguage(language) {
        if (['fr', 'en'].includes(language)) {
            this.currentLanguage = language;
            this.updateLanguage(language);
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if chatbot should be initialized
    if (!document.querySelector('.mirasens-chatbot')) {
        // Initialize with configuration based on current page language
        let language = 'fr'; // default
        
        // Try to get language from i18next
        if (window.i18next && window.i18next.language) {
            language = window.i18next.language.split('-')[0];
        }
        
        window.mirasensChatbot = new MirasensChatbot({
            language: language,
            apiUrl: 'http://localhost:3001/api' // Update this for production
        });
    }
});

// Make MirasensChatbot available globally
window.MirasensChatbot = MirasensChatbot;
