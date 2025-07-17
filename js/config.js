// config.js - Complete Configuration with ChatLinkManager
// Global configuration for AvatarCommerce platform

/**
 * =============================================================================
 * MAIN CONFIGURATION
 * =============================================================================
 */

const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'http://localhost:2000/api',
        TIMEOUT: 30000,
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000
    },
    
    // Application Settings
    APP: {
        NAME: 'AvatarCommerce',
        VERSION: '2.0.0',
        ENVIRONMENT: 'development', // development, staging, production
        DEBUG: true
    },
    
    // File Upload Settings
    UPLOAD: {
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        ALLOWED_AUDIO_TYPES: ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/webm'],
        CHUNK_SIZE: 1024 * 1024 // 1MB chunks for large uploads
    },
    
    // Chat Settings
    CHAT: {
        MAX_MESSAGE_LENGTH: 1000,
        TYPING_INDICATOR_TIMEOUT: 30000,
        MESSAGE_HISTORY_LIMIT: 50,
        AUTO_SCROLL: true
    },
    
    // Voice Settings
    VOICE: {
        DEFAULT_VOICE_ID: '2d5b0e6cf36f460aa7fc47e3eee4ba54',
        SAMPLE_RATE: 44100,
        MIN_RECORDING_DURATION: 3000, // 3 seconds
        MAX_RECORDING_DURATION: 30000 // 30 seconds
    },
    
    // UI Settings
    UI: {
        THEME: 'default',
        ANIMATION_DURATION: 300,
        TOAST_DURATION: 5000,
        DEBOUNCE_DELAY: 300
    }
};

/**
 * =============================================================================
 * CHAT LINK MANAGER
 * =============================================================================
 */

class ChatLinkManager {
    constructor() {
        this.baseUrl = this.getBaseUrl();
        this.cache = new Map();
        this.init();
    }

    init() {
        console.log('ChatLinkManager initialized with base URL:', this.baseUrl);
        
        // Add global styles for success messages
        this.addGlobalStyles();
        
        // Listen for page unload to clean up cache
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => {
                this.cache.clear();
            });
        }
    }

    getBaseUrl() {
        if (typeof window !== 'undefined') {
            return window.location.origin;
        }
        return 'http://localhost:3000'; // fallback for server-side
    }

    /**
     * Generate a proper chat URL for an influencer
     * @param {string} username - The influencer's username
     * @param {Object} options - Additional options (embed, theme, etc.)
     * @returns {string} - Complete chat URL
     */
    generateChatUrl(username, options = {}) {
        if (!username) {
            console.error('Username is required for chat URL generation');
            return '#';
        }

        // Check cache first
        const cacheKey = `${username}_${JSON.stringify(options)}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Clean and validate username
        const cleanUsername = this.cleanUsername(username);
        if (!this.isValidUsername(cleanUsername)) {
            console.error('Invalid username format:', username);
            return '#';
        }

        // Build URL with parameters
        const params = new URLSearchParams();
        params.set('username', cleanUsername);
        
        if (options.embed) params.set('embed', 'true');
        if (options.theme) params.set('theme', options.theme);
        if (options.autoplay !== undefined) params.set('autoplay', options.autoplay);
        if (options.voice_id) params.set('voice_id', options.voice_id);

        const chatUrl = `${this.baseUrl}/chat.html?${params.toString()}`;
        
        // Cache the result
        this.cache.set(cacheKey, chatUrl);
        
        console.log(`Generated chat URL for ${username}:`, chatUrl);
        return chatUrl;
    }

    /**
     * Generate embed code for chatbot widget
     * @param {Object} config - Widget configuration
     * @param {string} username - Influencer username
     * @returns {string} - HTML embed code
     */
    generateEmbedCode(config, username) {
        if (!username) {
            throw new Error('Username is required for embed code generation');
        }

        if (!this.isValidUsername(username)) {
            throw new Error('Invalid username format');
        }

        const chatUrl = this.generateChatUrl(username, { embed: true });
        const widgetId = `ac-widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Parse position
        const [vPos, hPos] = (config.position || 'bottom-right').split('-');
        const positionStyles = this.getPositionStyles(vPos, hPos);
        
        // Generate unique function names to avoid conflicts
        const toggleFn = `toggleWidget_${widgetId.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const closeFn = `closeWidget_${widgetId.replace(/[^a-zA-Z0-9]/g, '_')}`;
        
        const embedCode = `<!-- AvatarCommerce Chatbot Widget -->
<div id="${widgetId}" class="ac-chatbot-widget" style="
    position: fixed;
    ${positionStyles}
    z-index: 9999;
    width: ${config.width || '400px'};
    height: ${config.height || '600px'};
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    ${config.auto_open ? '' : 'display: none;'}
">
    <!-- Trigger Button -->
    <button id="${widgetId}-trigger" class="ac-widget-trigger" style="
        position: absolute;
        bottom: -60px;
        right: 0;
        background: linear-gradient(135deg, #5e60ce, #7c3aed);
        color: white;
        border: none;
        padding: 14px 24px;
        border-radius: 30px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        box-shadow: 0 4px 20px rgba(94, 96, 206, 0.3);
        transition: all 0.3s ease;
        ${config.auto_open ? 'display: none;' : ''}
        white-space: nowrap;
        user-select: none;
    " onclick="${toggleFn}()" onmouseenter="this.style.transform='translateY(-3px) scale(1.05)'; this.style.boxShadow='0 8px 30px rgba(94, 96, 206, 0.4)'" onmouseleave="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 4px 20px rgba(94, 96, 206, 0.3)'">
        ${this.escapeHtml(config.trigger_text || 'Chat with me!')}
    </button>
    
    <!-- Chat Widget Container -->
    <div id="${widgetId}-container" class="ac-widget-container" style="
        width: 100%;
        height: 100%;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 12px 48px rgba(0,0,0,0.15);
        background: white;
        position: relative;
        opacity: 0;
        transform: scale(0.9) translateY(20px);
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    ">
        <!-- Header Bar -->
        <div style="
            background: linear-gradient(135deg, #5e60ce, #7c3aed);
            color: white;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-weight: 600;
            font-size: 14px;
        ">
            <span>💬 AI Assistant</span>
            <button onclick="${closeFn}()" style="
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                font-weight: bold;
                transition: all 0.2s ease;
            " onmouseenter="this.style.background='rgba(255,255,255,0.3)'" onmouseleave="this.style.background='rgba(255,255,255,0.2)'">×</button>
        </div>
        
        <!-- Chat Frame -->
        <iframe 
            src="${chatUrl}"
            width="100%"
            height="calc(100% - 48px)"
            frameborder="0"
            allow="microphone; camera"
            style="border: none; display: block;"
            title="AI Chat Assistant"
            loading="lazy">
        </iframe>
    </div>
</div>

<script>
// Widget control functions with unique names
function ${toggleFn}() {
    const widget = document.getElementById('${widgetId}');
    const trigger = document.getElementById('${widgetId}-trigger');
    const container = document.getElementById('${widgetId}-container');
    
    if (widget && trigger && container) {
        widget.style.display = 'block';
        trigger.style.display = 'none';
        
        // Animate container entrance
        setTimeout(() => {
            container.style.opacity = '1';
            container.style.transform = 'scale(1) translateY(0)';
        }, 10);
    }
}

function ${closeFn}() {
    const widget = document.getElementById('${widgetId}');
    const trigger = document.getElementById('${widgetId}-trigger');
    const container = document.getElementById('${widgetId}-container');
    
    if (widget && trigger && container) {
        // Animate container exit
        container.style.opacity = '0';
        container.style.transform = 'scale(0.9) translateY(20px)';
        
        setTimeout(() => {
            widget.style.display = 'none';
            trigger.style.display = 'block';
        }, 300);
    }
}

// Auto-open functionality
${config.auto_open ? `
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        ${toggleFn}();
    }, ${config.auto_open_delay || 3000});
});
` : ''}

// Add pulse animation
document.addEventListener('DOMContentLoaded', function() {
    const trigger = document.getElementById('${widgetId}-trigger');
    if (trigger && !${config.auto_open}) {
        // Add subtle pulse animation
        setInterval(() => {
            trigger.style.animation = 'none';
            setTimeout(() => {
                trigger.style.animation = 'ac-pulse-${widgetId} 2s ease-in-out';
            }, 10);
        }, 5000);
        
        // Add keyframes
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes ac-pulse-${widgetId} {
                0% { box-shadow: 0 4px 20px rgba(94, 96, 206, 0.3); }
                50% { box-shadow: 0 4px 30px rgba(94, 96, 206, 0.6), 0 0 0 8px rgba(94, 96, 206, 0.1); }
                100% { box-shadow: 0 4px 20px rgba(94, 96, 206, 0.3); }
            }
        \`;
        document.head.appendChild(style);
    }
});
</script>

${config.custom_css ? `<style>\n/* Custom CSS */\n${config.custom_css}\n</style>` : ''}
<!-- End AvatarCommerce Widget -->`;

        return embedCode;
    }

    /**
     * Get CSS positioning styles based on position
     * @param {string} vPos - Vertical position (top/bottom)
     * @param {string} hPos - Horizontal position (left/right)
     * @returns {string} - CSS positioning styles
     */
    getPositionStyles(vPos, hPos) {
        const offset = '20px';
        let styles = '';
        
        if (vPos === 'top') {
            styles += `top: ${offset}; `;
        } else {
            styles += `bottom: ${offset}; `;
        }
        
        if (hPos === 'left') {
            styles += `left: ${offset}; `;
        } else {
            styles += `right: ${offset}; `;
        }
        
        return styles;
    }

/**
 * Generate a preview URL for the embed widget
 * @param {string} username - Influencer username
 * @param {Object} config - Widget configuration
 * @returns {string} - Preview URL
 */
generatePreviewUrl(username, config = {}) {
    if (!username) {
        console.warn('Username required for preview URL generation');
        return '#';
    }
    
    const cleanUsername = this.cleanUsername(username);
    if (!this.isValidUsername(cleanUsername)) {
        console.error('Invalid username for preview URL:', username);
        return '#';
    }
    
    // Check if embed-preview.html exists, otherwise fallback to regular chat
    const params = new URLSearchParams();
    params.set('username', cleanUsername);
    params.set('preview', 'true');
    
    if (config.width) params.set('width', config.width);
    if (config.height) params.set('height', config.height);
    if (config.position) params.set('position', config.position);
    if (config.theme) params.set('theme', config.theme);
    
    // Use chat.html with preview parameter as fallback
    const previewUrl = `${this.baseUrl}/chat.html?${params.toString()}`;
    
    console.log(`Generated preview URL for ${username}:`, previewUrl);
    return previewUrl;
}

    /**
     * Clean username for URL usage
     * @param {string} username - Raw username
     * @returns {string} - Cleaned username
     */
    cleanUsername(username) {
        if (!username) return '';
        return username.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '');
    }

    /**
     * Validate username format
     * @param {string} username - Username to validate
     * @returns {boolean} - Is valid
     */
    isValidUsername(username) {
        if (!username || typeof username !== 'string') {
            return false;
        }
        
        // Allow letters, numbers, underscores, hyphens
        const validPattern = /^[a-zA-Z0-9_-]+$/;
        return validPattern.test(username.trim()) && username.length >= 2 && username.length <= 50;
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Copy text to clipboard with modern API fallback
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} - Success status
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers or non-HTTPS
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.cssText = 'position:absolute;left:-9999px;opacity:0;';
                document.body.appendChild(textArea);
                textArea.select();
                textArea.setSelectionRange(0, 99999);
                
                const success = document.execCommand('copy');
                document.body.removeChild(textArea);
                return success;
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    }

    /**
     * Show a temporary success message
     * @param {string} message - Message to show
     * @param {HTMLElement} targetElement - Element to show message near
     * @param {number} duration - Duration in milliseconds
     */
    showSuccessMessage(message, targetElement, duration = 2500) {
        // Remove any existing success messages
        const existingMessages = document.querySelectorAll('.ac-success-message');
        existingMessages.forEach(msg => msg.remove());
        
        const successDiv = document.createElement('div');
        successDiv.className = 'ac-success-message';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            position: absolute;
            top: -45px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            animation: ac-fadeInOut ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1);
            pointer-events: none;
            white-space: nowrap;
        `;
        
        // Ensure target element is relatively positioned
        const originalPosition = targetElement.style.position;
        if (!originalPosition || originalPosition === 'static') {
            targetElement.style.position = 'relative';
        }
        
        targetElement.appendChild(successDiv);
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
            // Restore original position if we changed it
            if (!originalPosition) {
                targetElement.style.position = '';
            }
        }, duration);
    }

    /**
     * Add global styles for success messages and animations
     */
    addGlobalStyles() {
        if (document.getElementById('ac-global-styles')) {
            return; // Already added
        }
        
        const style = document.createElement('style');
        style.id = 'ac-global-styles';
        style.textContent = `
            @keyframes ac-fadeInOut {
                0% { 
                    opacity: 0; 
                    transform: translateX(-50%) translateY(10px) scale(0.9); 
                }
                15% { 
                    opacity: 1; 
                    transform: translateX(-50%) translateY(0) scale(1); 
                }
                85% { 
                    opacity: 1; 
                    transform: translateX(-50%) translateY(0) scale(1); 
                }
                100% { 
                    opacity: 0; 
                    transform: translateX(-50%) translateY(-10px) scale(0.9); 
                }
            }
            
            .ac-success-message {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            /* Responsive embed styles */
            @media (max-width: 768px) {
                .ac-chatbot-widget {
                    width: calc(100vw - 40px) !important;
                    height: calc(100vh - 100px) !important;
                    left: 20px !important;
                    right: 20px !important;
                    bottom: 20px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Generate shareable link for social media
     * @param {string} username - Influencer username
     * @param {string} platform - Social platform (twitter, facebook, etc.)
     * @returns {string} - Shareable URL
     */
    generateShareableLink(username, platform = 'generic') {
        const chatUrl = this.generateChatUrl(username);
        const message = `Chat with ${username}'s AI assistant!`;
        
        switch (platform) {
            case 'twitter':
                return `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(chatUrl)}`;
            case 'facebook':
                return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(chatUrl)}`;
            case 'linkedin':
                return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(chatUrl)}`;
            case 'whatsapp':
                return `https://wa.me/?text=${encodeURIComponent(message + ' ' + chatUrl)}`;
            default:
                return chatUrl;
        }
    }

    /**
     * Validate embed configuration
     * @param {Object} config - Embed configuration
     * @returns {Object} - Validation result
     */
    validateEmbedConfig(config) {
        const errors = [];
        const warnings = [];
        
        // Validate dimensions
        if (config.width && !config.width.match(/^\d+(px|%|em|rem)$/)) {
            errors.push('Invalid width format. Use px, %, em, or rem units.');
        }
        
        if (config.height && !config.height.match(/^\d+(px|%|em|rem)$/)) {
            errors.push('Invalid height format. Use px, %, em, or rem units.');
        }
        
        // Validate position
        const validPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        if (config.position && !validPositions.includes(config.position)) {
            errors.push('Invalid position. Must be one of: ' + validPositions.join(', '));
        }
        
        // Validate trigger text length
        if (config.trigger_text && config.trigger_text.length > 50) {
            warnings.push('Trigger text is quite long. Consider keeping it under 50 characters.');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
}

/**
 * =============================================================================
 * UTILITY FUNCTIONS
 * =============================================================================
 */

const Utils = {
    /**
     * Debounce function to limit function calls
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function to limit function calls
     */
    throttle(func, limit) {
        let lastFunc;
        let lastRan;
        return function(...args) {
            if (!lastRan) {
                func.apply(this, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(() => {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(this, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    },

    /**
     * Format file size in human-readable format
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Generate random ID
     */
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = CONFIG.UI.TOAST_DURATION) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        // Set background color based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        toast.style.background = colors[type] || colors.info;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 10);

        // Animate out and remove
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }
};

/**
 * =============================================================================
 * GLOBAL INITIALIZATION
 * =============================================================================
 */

// Initialize ChatLinkManager and make it globally available
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.ChatLinkManager = new ChatLinkManager();
    window.Utils = Utils;
    
    console.log('✅ AvatarCommerce Config loaded successfully');
    console.log('📊 Config:', CONFIG);
    console.log('🔗 ChatLinkManager ready');
    
    // Initialize global error handling
    window.addEventListener('error', (event) => {
        if (CONFIG.APP.DEBUG) {
            console.error('Global error:', event.error);
        }
    });
    
    // Initialize global unhandled promise rejection handling
    window.addEventListener('unhandledrejection', (event) => {
        if (CONFIG.APP.DEBUG) {
            console.error('Unhandled promise rejection:', event.reason);
        }
    });
    
} else if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        CONFIG,
        ChatLinkManager,
        Utils
    };
}

/**
 * =============================================================================
 * LEGACY COMPATIBILITY
 * =============================================================================
 */

// For backwards compatibility with existing code
if (typeof window !== 'undefined') {
    // Legacy global variables
    window.API_BASE_URL = CONFIG.API.BASE_URL;
    window.UPLOAD_CONFIG = CONFIG.UPLOAD;
    
    // Legacy ChatLinkManager reference
    window.chatLinkManager = window.ChatLinkManager;
}