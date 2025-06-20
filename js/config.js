/**
 * AvatarCommerce Configuration
 * Central configuration for the application
 */

const isLocalDevelopment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';

const CONFIG = {
    API: {
        // Auto-detect development vs production
        BASE_URL: isLocalDevelopment ? 'http://localhost:2000/api' : 'http://44.202.144.180:2000/api',
        
        TIMEOUT: 30000,
        RETRY_ATTEMPTS: 2
    },
    
    // Rest of your config remains the same...
    AUTH: {
        TOKEN_KEY: 'token',
        USER_KEY: 'user',
        SESSION_DURATION: 30
    },
    
    ROUTES: {
        LOGIN: 'login.html',
        REGISTER: 'register.html',
        DASHBOARD: 'dashboard.html',
        HOME: '../index.html'
    },

    // File Upload
    UPLOAD: {
        MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB in bytes
        ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png'],
        MAX_AUDIO_SIZE: 10 * 1024 * 1024, // 10MB in bytes
        ALLOWED_AUDIO_TYPES: ['audio/mp3', 'audio/mpeg', 'audio/wav']
    },
    
    // Avatar
    AVATAR: {
        MAX_RECORDING_DURATION: 30, // Maximum audio recording duration in seconds
        DEFAULT_AVATAR_ID: '21m00Tcm4TlvDq8ikWAM' // Default avatar ID (if applicable)
    },
    
    // Chat
    CHAT: {
        MAX_MESSAGE_LENGTH: 500, // Maximum message length
        HISTORY_LIMIT: 50, // Number of messages to load in chat history
        TYPING_INDICATOR_DELAY: 1000 // Milliseconds to show typing indicator
    },
    
    // Analytics
    ANALYTICS: {
        CHART_COLORS: [
            '#5e60ce', '#64dfdf', '#48bfe3', '#56cfe1',
            '#72efdd', '#80ffdb', '#a5a6e0', '#c77dff'
        ],
        DATE_RANGES: [
            { label: 'Today', value: 'today' },
            { label: 'Yesterday', value: 'yesterday' },
            { label: 'Last 7 days', value: '7days' },
            { label: 'Last 30 days', value: '30days' },
            { label: 'This month', value: 'thisMonth' },
            { label: 'Last month', value: 'lastMonth' }
        ]
    },
    
    // Feature flags for enabling/disabling features
    FEATURES: {
        VOICE_ENABLED: true,
        PRODUCT_RECOMMENDATIONS: true,
        ANALYTICS_DASHBOARD: true
    },
    
    // S3 Website Info (for debugging)
    FRONTEND: {
        S3_ORIGIN: 'http://avatarcommerce.s3-website-us-east-1.amazonaws.com',
        CURRENT_ORIGIN: window.location.origin // Will be set at runtime
    }
};

// Log configuration on load for debugging
console.log('🔧 AvatarCommerce Config Loaded');
console.log('🔧 Environment:', isLocalDevelopment ? 'Local Development' : 'Production');
console.log('🔧 API Base URL:', CONFIG.API.BASE_URL);
console.log('🔧 Current Origin:', window.location.origin);
console.log('🔧 Expected S3 Origin:', CONFIG.FRONTEND.S3_ORIGIN);
console.log('🔧 Origins Match:', window.location.origin === CONFIG.FRONTEND.S3_ORIGIN);

// Freeze the config object to prevent modifications
Object.freeze(CONFIG);