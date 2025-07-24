// =============================================================================
// CONFIG.JS - Complete AvatarCommerce Configuration with ChatLinkManager - FIXED
// =============================================================================

(function() {
    'use strict';
    
    // =============================================================================
    // CORE CONFIGURATION
    // =============================================================================
    
    window.CONFIG = {
        // API Configuration
        API: {
            BASE_URL: 'http://localhost:2000/api',
            TIMEOUT: 15000,
            RETRY_ATTEMPTS: 3,
            RETRY_DELAY: 1000
        },
        
        // Authentication
        AUTH: {
            TOKEN_KEY: 'token',
            USER_KEY: 'user',
            REFRESH_TOKEN_KEY: 'refresh_token',
            TOKEN_EXPIRY_KEY: 'token_expiry'
        },
        
        // Chat Configuration
        CHAT: {
            DEFAULT_CHAT_PATH: '/chat.html',
            EMBED_CHAT_PATH: '/chat.html',
            SESSION_STORAGE_KEY: 'chat_session',
            MESSAGE_STORAGE_KEY: 'chat_messages',
            MAX_STORED_MESSAGES: 50
        },
        
        // Upload Configuration
        UPLOAD: {
            MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
            ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            ALLOWED_AUDIO_TYPES: ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/webm'],
            ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        },
        
        // Embed Widget Configuration
        EMBED: {
            DEFAULT_WIDTH: '400px',
            DEFAULT_HEIGHT: '600px',
            DEFAULT_POSITION: 'bottom-right',
            DEFAULT_THEME: 'default',
            DEFAULT_TRIGGER_TEXT: 'Chat with me!',
            AUTO_OPEN_DELAY: 3000,
            VALID_POSITIONS: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
            VALID_THEMES: ['default', 'dark', 'light'],
            VALID_SIZES: ['350px', '400px', '500px', '100%', '300px', '600px', '700px', '100vh']
        },
        
        // Voice Configuration
        VOICE: {
            DEFAULT_VOICE_ID: '2d5b0e6cf36f460aa7fc47e3eee4ba54',
            VOICE_PREVIEW_DURATION: 30,
            RECORDING_MAX_DURATION: 300, // 5 minutes
            RECORDING_MIN_DURATION: 1,
            SAMPLE_RATE: 16000
        },
        
        // UI Configuration
        UI: {
            ALERT_DURATION: 5000,
            LOADING_DELAY: 300,
            ANIMATION_DURATION: 300,
            DEBOUNCE_DELAY: 500
        }
    };
    
    // =============================================================================
    // CHAT LINK MANAGER - INTEGRATED
    // =============================================================================
    
    class ChatLinkManager {
        constructor() {
            this.baseUrl = window.location.origin;
            this.chatPath = CONFIG.CHAT.DEFAULT_CHAT_PATH;
            this.initialized = false;
            this.config = CONFIG.EMBED;
            
            this.init();
        }
        
        init() {
            console.log('🔗 ChatLinkManager initializing...');
            
            // Auto-fix template variables on page load
            this.fixTemplateVariables();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize copy buttons
            this.initializeCopyButtons();
            
            this.initialized = true;
            console.log('✅ ChatLinkManager initialized successfully');
        }
        
        // =============================================================================
        // CHAT LINK GENERATION
        // =============================================================================
        
        /**
         * Generate a chat URL for a given username
         * @param {string} username - The influencer's username
         * @param {Object} options - Additional options
         * @returns {string} Complete chat URL
         */
        generateChatUrl(username, options = {}) {
            if (!username) {
                throw new Error('Username is required for chat URL generation');
            }
            
            const cleanUsername = encodeURIComponent(username.trim());
            const params = new URLSearchParams({
                username: cleanUsername
            });
            
            // Add optional parameters
            if (options.embed) params.set('embed', 'true');
            if (options.theme) params.set('theme', options.theme);
            if (options.autoOpen) params.set('autoopen', 'true');
            if (options.ref) params.set('ref', options.ref);
            
            const chatUrl = `${this.baseUrl}${this.chatPath}?${params.toString()}`;
            
            console.log('🔗 Generated chat URL:', chatUrl);
            return chatUrl;
        }
        
        /**
         * Generate a shareable chat link with additional metadata
         * @param {string} username - The influencer's username
         * @param {Object} metadata - Additional metadata
         * @returns {Object} Chat link with metadata
         */
        generateShareableLink(username, metadata = {}) {
            const chatUrl = this.generateChatUrl(username);
            
            return {
                url: chatUrl,
                shortUrl: chatUrl, // Could be shortened with a service
                qrCodeUrl: this.generateQRCodeUrl(chatUrl),
                socialText: `Chat with ${username}'s AI Avatar! 🤖`,
                embedCode: this.generateEmbedCode(this.config, username),
                metadata: {
                    username,
                    createdAt: new Date().toISOString(),
                    ...metadata
                }
            };
        }
        
        /**
         * Generate QR code URL for a given text
         * @param {string} text - Text to encode
         * @returns {string} QR code image URL
         */
        generateQRCodeUrl(text) {
            return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
        }
        
        // =============================================================================
        // EMBED CODE GENERATION
        // =============================================================================
        
        /**
         * Generate embed code for a widget
         * @param {Object} config - Widget configuration
         * @param {string} username - The influencer's username
         * @returns {string} Complete embed code
         */
        generateEmbedCode(config, username) {
            if (!username) {
                throw new Error('Username is required for embed code generation');
            }
            
            const validation = this.validateEmbedConfig(config);
            if (!validation.isValid) {
                throw new Error('Invalid embed configuration: ' + validation.errors.join(', '));
            }
            
            const chatUrl = this.generateChatUrl(username, { embed: true });
            const widgetId = `ac-widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            const embedCode = `<!-- AvatarCommerce Chat Widget for ${username} -->
<div id="${widgetId}"></div>
<script>
(function() {
    'use strict';
    
    // Widget Configuration
    const config = {
        username: '${username}',
        chatUrl: '${chatUrl}',
        width: '${config.width || this.config.DEFAULT_WIDTH}',
        height: '${config.height || this.config.DEFAULT_HEIGHT}',
        position: '${config.position || this.config.DEFAULT_POSITION}',
        theme: '${config.theme || this.config.DEFAULT_THEME}',
        triggerText: '${config.trigger_text || this.config.DEFAULT_TRIGGER_TEXT}',
        autoOpen: ${config.auto_open || false},
        autoOpenDelay: ${config.auto_open_delay || this.config.AUTO_OPEN_DELAY},
        customCSS: \`${config.custom_css || ''}\`
    };
    
    // Create widget container
    const container = document.getElementById('${widgetId}');
    if (!container) {
        console.error('AvatarCommerce: Container element not found');
        return;
    }
    
    // Position styles helper
    function getPositionStyles(position) {
        const positions = {
            'bottom-right': 'bottom: 20px; right: 20px;',
            'bottom-left': 'bottom: 20px; left: 20px;',
            'top-right': 'top: 20px; right: 20px;',
            'top-left': 'top: 20px; left: 20px;'
        };
        return positions[position] || positions['bottom-right'];
    }
    
    // Theme styles helper
    function getThemeStyles(theme) {
        const themes = {
            'default': {
                primaryColor: '#5e60ce',
                backgroundColor: '#ffffff',
                textColor: '#333333',
                headerColor: '#5e60ce'
            },
            'dark': {
                primaryColor: '#7c3aed',
                backgroundColor: '#1f2937',
                textColor: '#f9fafb',
                headerColor: '#374151'
            },
            'light': {
                primaryColor: '#3b82f6',
                backgroundColor: '#f8fafc',
                textColor: '#1e293b',
                headerColor: '#e2e8f0'
            }
        };
        return themes[theme] || themes['default'];
    }
    
    const themeStyles = getThemeStyles(config.theme);
    
    // Widget HTML
    const widgetHtml = \`
        <div class="ac-widget" style="
            position: fixed;
            \${getPositionStyles(config.position)}
            z-index: 9999;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        ">
            <div class="ac-trigger" style="
                background: \${themeStyles.primaryColor};
                color: white;
                padding: 12px 20px;
                border-radius: 25px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transition: all 0.3s ease;
                font-weight: 500;
                font-size: 14px;
                border: none;
                outline: none;
                user-select: none;
                display: flex;
                align-items: center;
                gap: 8px;
            " onclick="toggleAvatarCommerceChat()" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <i class="fas fa-comments"></i>
                <span>\${config.triggerText}</span>
            </div>
            
            <div class="ac-chat-container" style="
                position: absolute;
                \${config.position.startsWith('top') ? 'top: 60px;' : 'bottom: 60px;'}
                \${config.position.endsWith('left') ? 'left: 0;' : 'right: 0;'}
                width: \${config.width};
                height: \${config.height};
                max-width: 100vw;
                max-height: 100vh;
                background: \${themeStyles.backgroundColor};
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                overflow: hidden;
                display: none;
                flex-direction: column;
                border: 1px solid rgba(0,0,0,0.1);
                transform: scale(0.9);
                opacity: 0;
                transition: all 0.3s ease;
            ">
                <div class="ac-chat-header" style="
                    background: \${themeStyles.headerColor};
                    color: white;
                    padding: 15px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 14px;
                    font-weight: 600;
                ">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-robot"></i>
                        <span>Chat with \${config.username}</span>
                    </div>
                    <div style="
                        cursor: pointer; 
                        width: 24px; 
                        height: 24px; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center;
                        border-radius: 4px;
                        transition: background-color 0.2s;
                        font-size: 16px;
                    " onclick="toggleAvatarCommerceChat()" onmouseover="this.style.backgroundColor='rgba(255,255,255,0.1)'" onmouseout="this.style.backgroundColor='transparent'">
                        ✕
                    </div>
                </div>
                
                <iframe 
                    src="\${config.chatUrl}" 
                    style="
                        flex: 1;
                        border: none;
                        width: 100%;
                        height: 100%;
                        background: #f8fafc;
                    "
                    allow="microphone; camera; geolocation"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-popups-to-escape-sandbox"
                    loading="lazy"
                ></iframe>
            </div>
        </div>
        
        <style>
            .ac-widget * {
                box-sizing: border-box;
            }
            
            .ac-chat-container.ac-open {
                display: flex !important;
                opacity: 1 !important;
                transform: scale(1) !important;
            }
            
            \${config.customCSS}
        </style>
    \`;
    
    // Toggle chat function
    window.toggleAvatarCommerceChat = function() {
        const chatContainer = document.querySelector('.ac-chat-container');
        const trigger = document.querySelector('.ac-trigger');
        
        if (!chatContainer) return;
        
        if (chatContainer.classList.contains('ac-open')) {
            chatContainer.classList.remove('ac-open');
            setTimeout(() => {
                chatContainer.style.display = 'none';
            }, 300);
        } else {
            chatContainer.style.display = 'flex';
            setTimeout(() => {
                chatContainer.classList.add('ac-open');
            }, 10);
            
            // Analytics tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'chat_widget_opened', {
                    'influencer': config.username,
                    'theme': config.theme
                });
            }
        }
    };
    
    // Insert widget into container
    container.innerHTML = widgetHtml;
    
    // Load Font Awesome if not already loaded
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
        document.head.appendChild(link);
    }
    
    // Auto-open after delay
    if (config.autoOpen) {
        setTimeout(() => {
            window.toggleAvatarCommerceChat();
        }, config.autoOpenDelay);
    }
    
    // Responsive behavior
    function handleResize() {
        const chatContainer = document.querySelector('.ac-chat-container');
        if (chatContainer && window.innerWidth < 768) {
            chatContainer.style.width = '100vw';
            chatContainer.style.height = '100vh';
            chatContainer.style.position = 'fixed';
            chatContainer.style.top = '0';
            chatContainer.style.left = '0';
            chatContainer.style.right = '0';
            chatContainer.style.bottom = '0';
            chatContainer.style.borderRadius = '0';
        }
    }
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    console.log('✅ AvatarCommerce Chat Widget loaded for:', config.username);
    
})();
</script>
<!-- End AvatarCommerce Chat Widget -->`;
            
            return embedCode;
        }
        
        /**
         * Generate live preview HTML for embed testing
         * @param {Object} config - Widget configuration  
         * @param {string} username - The influencer's username
         * @returns {string} Preview HTML
         */
        generatePreviewHTML(config, username) {
            const chatUrl = this.generateChatUrl(username, { embed: true });
            const widgetId = `preview-widget-${Date.now()}`;
            
            return `
                <div id="${widgetId}" style="position: relative; width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; overflow: hidden;">
                    <div style="position: absolute; top: 20px; left: 20px; color: white; font-size: 14px; font-weight: 500;">
                        <i class="fas fa-desktop" style="margin-right: 8px;"></i>
                        Website Preview
                    </div>
                    
                    <div class="ac-widget" style="
                        position: absolute;
                        ${this.getPositionStyles(config.position)}
                        z-index: 10;
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    ">
                        <div class="ac-trigger" style="
                            background: ${config.theme === 'dark' ? '#7c3aed' : '#5e60ce'};
                            color: white;
                            padding: 12px 20px;
                            border-radius: 25px;
                            cursor: pointer;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                            transition: all 0.3s ease;
                            font-weight: 500;
                            font-size: 14px;
                            border: none;
                            outline: none;
                            user-select: none;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        " onclick="togglePreviewChat('${widgetId}')">
                            <i class="fas fa-comments"></i>
                            <span>${config.trigger_text || 'Chat with me!'}</span>
                        </div>
                        
                        <div class="ac-chat-container" style="
                            position: absolute;
                            ${config.position.startsWith('top') ? 'top: 60px;' : 'bottom: 60px;'}
                            ${config.position.endsWith('left') ? 'left: 0;' : 'right: 0;'}
                            width: ${config.width};
                            height: ${config.height};
                            max-width: 350px;
                            max-height: 300px;
                            background: white;
                            border-radius: 12px;
                            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                            overflow: hidden;
                            display: none;
                            flex-direction: column;
                            border: 1px solid rgba(0,0,0,0.1);
                        ">
                            <div class="ac-chat-header" style="
                                background: ${config.theme === 'dark' ? '#374151' : '#5e60ce'};
                                color: white;
                                padding: 12px 16px;
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                font-size: 13px;
                                font-weight: 600;
                            ">
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <i class="fas fa-robot"></i>
                                    <span>Chat with ${username}</span>
                                </div>
                                <div style="
                                    cursor: pointer; 
                                    width: 20px; 
                                    height: 20px; 
                                    display: flex; 
                                    align-items: center; 
                                    justify-content: center;
                                    border-radius: 4px;
                                    transition: background-color 0.2s;
                                    font-size: 14px;
                                " onclick="togglePreviewChat('${widgetId}')">
                                    ✕
                                </div>
                            </div>
                            
                            <div style="
                                flex: 1;
                                padding: 16px;
                                background: #f8fafc;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                text-align: center;
                                color: #64748b;
                                font-size: 13px;
                            ">
                                <i class="fas fa-comments" style="font-size: 24px; margin-bottom: 8px; color: #5e60ce;"></i>
                                <div style="font-weight: 500; margin-bottom: 4px;">Chat Preview</div>
                                <div>This is how your chat will appear</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <script>
                    window.togglePreviewChat = function(widgetId) {
                        const widget = document.getElementById(widgetId);
                        const chatContainer = widget.querySelector('.ac-chat-container');
                        
                        if (chatContainer.style.display === 'none' || !chatContainer.style.display) {
                            chatContainer.style.display = 'flex';
                        } else {
                            chatContainer.style.display = 'none';
                        }
                    };
                </script>
            `;
        }
        
        /**
         * Validate embed configuration
         * @param {Object} config - Configuration to validate
         * @returns {Object} Validation result
         */
        validateEmbedConfig(config) {
            const errors = [];
            const warnings = [];
            
            // Validate width
            if (config.width && !this.isValidSize(config.width)) {
                errors.push('Width must be a valid CSS size (e.g., 400px, 100%)');
            }
            
            // Validate height
            if (config.height && !this.isValidSize(config.height)) {
                errors.push('Height must be a valid CSS size (e.g., 600px, 100vh)');
            }
            
            // Validate position
            if (config.position && !this.config.VALID_POSITIONS.includes(config.position)) {
                errors.push('Position must be one of: ' + this.config.VALID_POSITIONS.join(', '));
            }
            
            // Validate theme
            if (config.theme && !this.config.VALID_THEMES.includes(config.theme)) {
                errors.push('Theme must be one of: ' + this.config.VALID_THEMES.join(', '));
            }
            
            // Validate trigger text
            if (config.trigger_text && config.trigger_text.length > 50) {
                warnings.push('Trigger text should be 50 characters or less for better display');
            }
            
            // Validate auto-open delay
            if (config.auto_open_delay && (config.auto_open_delay < 1000 || config.auto_open_delay > 10000)) {
                warnings.push('Auto-open delay should be between 1-10 seconds');
            }
            
            return {
                isValid: errors.length === 0,
                errors,
                warnings
            };
        }
        
        /**
         * Get position styles for CSS
         * @param {string} position - Position value
         * @returns {string} CSS position styles
         */
        getPositionStyles(position) {
            const positions = {
                'bottom-right': 'bottom: 20px; right: 20px;',
                'bottom-left': 'bottom: 20px; left: 20px;',
                'top-right': 'top: 20px; right: 20px;',
                'top-left': 'top: 20px; left: 20px;'
            };
            return positions[position] || positions['bottom-right'];
        }
        
        /**
         * Check if a size value is valid CSS
         * @param {string} size - Size value to validate
         * @returns {boolean} Whether the size is valid
         */
        isValidSize(size) {
            const sizeRegex = /^(\d+(\.\d+)?(px|em|rem|%|vh|vw|vmin|vmax)|auto|inherit|initial)$/;
            return sizeRegex.test(size);
        }
        
        // =============================================================================
        // TEMPLATE VARIABLE FIXING
        // =============================================================================
        
        /**
         * Fix template variables in the current page
         */
        fixTemplateVariables() {
            const user = this.getCurrentUser();
            if (!user || !user.username) return;
            
            console.log('🔧 Fixing template variables for user:', user.username);
            
            // Fix href attributes
            document.querySelectorAll('[href*="${user.username}"]').forEach(element => {
                const newHref = element.href.replace(/\$\{user\.username\}/g, user.username);
                element.href = newHref;
            });
            
            // Fix text content
            document.querySelectorAll('*').forEach(element => {
                if (element.childNodes.length === 1 && 
                    element.childNodes[0].nodeType === Node.TEXT_NODE &&
                    element.textContent.includes('${user.username}')) {
                    element.textContent = element.textContent.replace(/\$\{user\.username\}/g, user.username);
                }
            });
            
            // Fix input values
            document.querySelectorAll('input[value*="${user.username}"]').forEach(element => {
                element.value = element.value.replace(/\$\{user\.username\}/g, user.username);
            });
            
            // Fix placeholder attributes
            document.querySelectorAll('[placeholder*="${user.username}"]').forEach(element => {
                element.placeholder = element.placeholder.replace(/\$\{user\.username\}/g, user.username);
            });
        }
        
        /**
         * Set chat links for all elements on the page
         */
        setChatLinks() {
            const user = this.getCurrentUser();
            if (!user || !user.username) return;
            
            // Set chat link inputs
            document.querySelectorAll('#chat-link, #chat-url, .chat-link-input').forEach(input => {
                if (input && input.tagName === 'INPUT') {
                    const chatUrl = this.generateChatUrl(user.username);
                    input.value = chatUrl;
                }
            });
            
            // Set preview chat links
            document.querySelectorAll('#preview-chat-link, .preview-chat-link').forEach(link => {
                if (link && link.tagName === 'A') {
                    const chatUrl = this.generateChatUrl(user.username);
                    link.href = chatUrl;
                }
            });
            
            // Set direct chat links
            document.querySelectorAll('#direct-chat-link, .direct-chat-link').forEach(link => {
                if (link && link.tagName === 'A') {
                    const chatUrl = this.generateChatUrl(user.username);
                    link.href = chatUrl;
                }
            });
        }
        
        // =============================================================================
        // UTILITY FUNCTIONS
        // =============================================================================
        
        /**
         * Get current user from localStorage
         * @returns {Object|null} User object or null
         */
        getCurrentUser() {
            try {
                const userStr = localStorage.getItem(CONFIG.AUTH.USER_KEY);
                return userStr ? JSON.parse(userStr) : null;
            } catch (error) {
                console.error('Error getting current user:', error);
                return null;
            }
        }
        
        /**
         * Copy text to clipboard
         * @param {string} text - Text to copy
         * @returns {Promise<boolean>} Success status
         */
        async copyToClipboard(text) {
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                    return true;
                } else {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    textArea.style.position = 'fixed';
                    textArea.style.opacity = '0';
                    textArea.style.left = '-999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    
                    try {
                        const successful = document.execCommand('copy');
                        document.body.removeChild(textArea);
                        return successful;
                    } catch (err) {
                        document.body.removeChild(textArea);
                        return false;
                    }
                }
            } catch (error) {
                console.error('Error copying to clipboard:', error);
                return false;
            }
        }
        
        /**
         * Show success message near an element
         * @param {string} message - Message to show
         * @param {Element} element - Element to show message near
         */
        showSuccessMessage(message, element) {
            const successEl = document.createElement('div');
            successEl.textContent = message;
            successEl.style.cssText = `
                position: absolute;
                top: -35px;
                right: 0;
                background: #10b981;
                color: white;
                padding: 6px 12px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
                z-index: 1000;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.3s ease;
                pointer-events: none;
            `;
            
            element.style.position = 'relative';
            element.appendChild(successEl);
            
            // Animate in
            setTimeout(() => {
                successEl.style.opacity = '1';
                successEl.style.transform = 'translateY(0)';
            }, 10);
            
            // Remove after delay
            setTimeout(() => {
                successEl.style.opacity = '0';
                successEl.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    if (successEl.parentNode) {
                        successEl.parentNode.removeChild(successEl);
                    }
                }, 300);
            }, 2000);
        }
        
        /**
         * Setup event listeners for automatic functionality
         */
        setupEventListeners() {
            // Set chat links when page loads
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(() => {
                        this.setChatLinks();
                        this.fixTemplateVariables();
                    }, 100);
                });
            } else {
                setTimeout(() => {
                    this.setChatLinks();
                    this.fixTemplateVariables();
                }, 100);
            }
            
            // Re-run when user data changes
            window.addEventListener('storage', (e) => {
                if (e.key === CONFIG.AUTH.USER_KEY) {
                    this.fixTemplateVariables();
                    this.setChatLinks();
                }
            });
        }
        
        /**
         * Initialize copy functionality for elements
         * @param {string} selector - CSS selector for copy buttons
         */
        initializeCopyButtons(selector = '.copy-btn, [data-copy]') {
            const buttons = document.querySelectorAll(selector);
            
            buttons.forEach(button => {
                // Remove existing listeners
                button.removeEventListener('click', this.handleCopyClick);
                
                // Add new listener
                button.addEventListener('click', this.handleCopyClick.bind(this));
            });
        }
        
        /**
         * Handle copy button click
         * @param {Event} e - Click event
         */
        async handleCopyClick(e) {
            const button = e.target.closest('.copy-btn, [data-copy]');
            if (!button) return;
            
            const textToCopy = button.dataset.copy || 
                             button.getAttribute('data-copy') ||
                             button.previousElementSibling?.value || 
                             button.parentElement?.querySelector('input')?.value ||
                             button.parentElement?.querySelector('textarea')?.value;
            
            if (textToCopy) {
                const success = await this.copyToClipboard(textToCopy);
                if (success) {
                    const originalHTML = button.innerHTML;
                    button.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    button.style.pointerEvents = 'none';
                    
                    setTimeout(() => {
                        button.innerHTML = originalHTML;
                        button.style.pointerEvents = 'auto';
                    }, 2000);
                    
                    this.showSuccessMessage('Copied!', button);
                } else {
                    this.showSuccessMessage('Failed to copy', button);
                }
            }
        }
        
        // =============================================================================
        // SOCIAL SHARING
        // =============================================================================
        
        /**
         * Generate social media sharing URLs
         * @param {string} username - The influencer's username
         * @returns {Object} Social sharing URLs
         */
        generateSocialUrls(username) {
            const chatUrl = this.generateChatUrl(username);
            const shareText = `Chat with ${username}'s AI Avatar! 🤖`;
            
            return {
                facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(chatUrl)}`,
                twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(chatUrl)}&text=${encodeURIComponent(shareText)}`,
                linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(chatUrl)}`,
                whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + chatUrl)}`,
                telegram: `https://t.me/share/url?url=${encodeURIComponent(chatUrl)}&text=${encodeURIComponent(shareText)}`
            };
        }
        
        // =============================================================================
        // PUBLIC API
        // =============================================================================
        
        /**
         * Get a complete shareable package for an influencer
         * @param {string} username - The influencer's username
         * @returns {Object} Complete sharing package
         */
        getSharePackage(username) {
            const chatLink = this.generateShareableLink(username);
            const embedCode = this.generateEmbedCode(this.config, username);
            const socialUrls = this.generateSocialUrls(username);
            
            return {
                chatLink,
                embedCode,
                socialUrls,
                qrCode: chatLink.qrCodeUrl,
                analytics: {
                    trackingId: `ac-${username}-${Date.now()}`,
                    events: ['chat_opened', 'message_sent', 'product_clicked']
                }
            };
        }
        
        /**
         * Update live preview
         * @param {string} containerId - Container element ID
         * @param {Object} config - Widget configuration
         * @param {string} username - Username
         */
        updateLivePreview(containerId, config, username) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            const previewHTML = this.generatePreviewHTML(config, username);
            container.innerHTML = previewHTML;
        }
    }
    
    // =============================================================================
    // UTILITY FUNCTIONS - FIXED
    // =============================================================================
    
    window.UTILS = {
        // Authentication utilities - FIXED with getToken method
        auth: {
            /**
             * Get authentication token
             * @returns {string|null} JWT token or null
             */
            getToken: () => {
                return localStorage.getItem(CONFIG.AUTH.TOKEN_KEY);
            },
            
            isAuthenticated: () => {
                const token = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY);
                const user = localStorage.getItem(CONFIG.AUTH.USER_KEY);
                return !!(token && user);
            },
            
            getCurrentUser: () => {
                try {
                    const userStr = localStorage.getItem(CONFIG.AUTH.USER_KEY);
                    return userStr ? JSON.parse(userStr) : null;
                } catch (error) {
                    console.error('Error getting current user:', error);
                    return null;
                }
            },
            
            requireInfluencer: () => {
                const user = window.UTILS.auth.getCurrentUser();
                if (!user || user.userType !== 'influencer') {
                    window.location.href = '../pages/login.html';
                    return false;
                }
                return true;
            },
            
            logout: () => {
                localStorage.removeItem(CONFIG.AUTH.TOKEN_KEY);
                localStorage.removeItem(CONFIG.AUTH.USER_KEY);
                localStorage.removeItem(CONFIG.AUTH.REFRESH_TOKEN_KEY);
                window.location.href = '../pages/login.html';
            }
        },
        
        // UI utilities
        ui: {
            getInitials: (name) => {
                if (!name) return '?';
                return name.split(' ')
                    .map(word => word[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2);
            },
            
            showAlert: (message, type = 'info', container = null) => {
                const alertEl = container || document.createElement('div');
                alertEl.className = `alert alert-${type}`;
                alertEl.textContent = message;
                alertEl.style.display = 'block';
                
                if (!container) {
                    alertEl.style.position = 'fixed';
                    alertEl.style.top = '20px';
                    alertEl.style.right = '20px';
                    alertEl.style.zIndex = '10000';
                    alertEl.style.padding = '15px 20px';
                    alertEl.style.borderRadius = '8px';
                    alertEl.style.fontWeight = '500';
                    alertEl.style.maxWidth = '400px';
                    
                    const colors = {
                        success: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
                        error: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' },
                        warning: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
                        info: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' }
                    };
                    
                    const color = colors[type] || colors.info;
                    alertEl.style.backgroundColor = color.bg;
                    alertEl.style.color = color.text;
                    alertEl.style.border = `1px solid ${color.border}`;
                    
                    document.body.appendChild(alertEl);
                    
                    setTimeout(() => {
                        if (alertEl.parentNode) {
                            alertEl.parentNode.removeChild(alertEl);
                        }
                    }, CONFIG.UI.ALERT_DURATION);
                } else {
                    setTimeout(() => {
                        alertEl.style.display = 'none';
                    }, CONFIG.UI.ALERT_DURATION);
                }
            },
            
            toggleButtonLoading: (button, isLoading, loadingText = 'Loading...') => {
                if (isLoading) {
                    button.disabled = true;
                    button.dataset.originalText = button.innerHTML;
                    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
                } else {
                    button.disabled = false;
                    button.innerHTML = button.dataset.originalText || 'Submit';
                }
            }
        },
        
        // Format utilities
        format: {
            fileSize: (bytes) => {
                if (bytes === 0) return '0 B';
                const k = 1024;
                const sizes = ['B', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
            },
            
            duration: (seconds) => {
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = seconds % 60;
                return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
            },
            
            currency: (amount, currency = 'USD') => {
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency
                }).format(amount);
            }
        }
    };
    
    // =============================================================================
    // INITIALIZE GLOBAL INSTANCES
    // =============================================================================
    
    // Create global ChatLinkManager instance
    window.ChatLinkManager = new ChatLinkManager();
    
    // Global initialization function
    window.initializeAvatarCommerce = function() {
        console.log('🚀 AvatarCommerce initialized');
        
        // Fix any remaining template variables
        if (window.ChatLinkManager) {
            window.ChatLinkManager.fixTemplateVariables();
            window.ChatLinkManager.setChatLinks();
        }
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initializeAvatarCommerce);
    } else {
        window.initializeAvatarCommerce();
    }
    
    console.log('📦 AvatarCommerce Config.js loaded with integrated ChatLinkManager - FIXED');
    
})();