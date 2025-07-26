// FIXED API CLIENT - Remove problematic debug calls
class APIClient {
    constructor() {
        this.baseURL = 'http://localhost:2000/api';
        this.timeout = 15000;
        
        console.log('📡 API Client initialized:', this.baseURL);
    }
    
    /**
     * Get default headers for requests
     */
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        if (includeAuth && window.UTILS?.auth?.getToken) {
            const token = window.UTILS.auth.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return headers;
    }
    
    /**
     * Make HTTP request
     */
    async request(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
        
        const config = {
            method: 'GET',
            headers: this.getHeaders(options.auth !== false),
            ...options
        };
        
        // Don't stringify FormData
        if (config.body && !options.isFormData && typeof config.body !== 'string') {
            config.body = JSON.stringify(config.body);
        }
        
        try {
            console.log(`📡 API Request: ${config.method} ${url}`);
            
            const response = await fetch(url, config);
            
            let data;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = { message: await response.text() };
            }
            
            console.log(`📡 API Response (${response.status}):`, data);
            
            if (!response.ok) {
                const error = new Error(data.message || `HTTP ${response.status}`);
                error.status = response.status;
                error.data = data;
                throw error;
            }
            
            return data;
            
        } catch (error) {
            console.error(`❌ API Request failed:`, error.message);
            throw error;
        }
    }
    
    /**
     * GET request
     */
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }
    
    /**
     * POST request
     */
    async post(endpoint, data = null, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: data
        });
    }
    
    /**
     * PUT request
     */
    async put(endpoint, data = null, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: data
        });
    }
    
    /**
     * DELETE request
     */
    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
    
    /**
     * Health check - FIXED to use correct endpoint
     */
    async healthCheck() {
        try {
            console.log('🏥 Performing health check...');
            return await this.get('/health', { auth: false });
        } catch (error) {
            console.error('❌ Health check failed:', error);
            throw error;
        }
    }
    
    /**
     * Test backend connection - SIMPLIFIED
     */
    async testConnection() {
        try {
            console.log('🔍 Testing backend connection...');
            const health = await this.healthCheck();
            console.log('✅ Backend connection successful');
            return true;
        } catch (error) {
            console.log('❌ Backend connection failed:', error.message);
            return false;
        }
    }
    
    // =============================================================================
    // AUTHENTICATION METHODS
    // =============================================================================
    
    /**
     * Register new user
     */
    async register(userData) {
        try {
            console.log('📝 Registering user:', userData.username);
            const response = await this.post('/register', userData);
            
            if (response.status === 'success' && window.UTILS?.auth?.saveUserData) {
                window.UTILS.auth.saveUserData(response);
            }
            
            return response;
        } catch (error) {
            console.error('❌ Registration failed:', error);
            throw error;
        }
    }
    
    /**
     * Login user
     */
    async login(credentials) {
        try {
            console.log('🔐 Logging in user:', credentials.username);
            const response = await this.post('/login', credentials);
            
            if (response.status === 'success' && window.UTILS?.auth?.saveUserData) {
                window.UTILS.auth.saveUserData(response);
            }
            
            return response;
        } catch (error) {
            console.error('❌ Login failed:', error);
            throw error;
        }
    }
    
    // =============================================================================
    // CHAT METHODS
    // =============================================================================
    
    /**
     * Send chat message
     */
    async sendChatMessage(messageData) {
        try {
            console.log('💬 Sending chat message');
            return await this.post('/chat', messageData, { auth: false });
        } catch (error) {
            console.error('❌ Send chat message failed:', error);
            throw error;
        }
    }
    
    /**
     * Get chat info for username
     */
    async getChatInfo(username) {
        try {
            console.log('💬 Getting chat info for:', username);
            return await this.get(`/chat/${username}`, { auth: false });
        } catch (error) {
            console.error('❌ Get chat info failed:', error);
            throw error;
        }
    }
    
    // =============================================================================
    // PROFILE METHODS
    // =============================================================================
    
    /**
     * Get user profile
     */
    async getProfile() {
        try {
            console.log('👤 Getting user profile');
            return await this.get('/influencer/profile');
        } catch (error) {
            console.error('❌ Get profile failed:', error);
            throw error;
        }
    }
    
    /**
     * Update user profile
     */
    async updateProfile(profileData) {
        try {
            console.log('👤 Updating user profile');
            return await this.put('/influencer/profile', profileData);
        } catch (error) {
            console.error('❌ Update profile failed:', error);
            throw error;
        }
    }
}

// Create global API instance
window.API = new APIClient();

console.log('✅ Fixed API Client loaded successfully');

// Test connection on load (optional)
setTimeout(async () => {
    try {
        const connected = await window.API.testConnection();
        if (connected) {
            console.log('🌐 Backend connection verified');
        } else {
            console.log('⚠️ Backend connection issue - check if server is running');
        }
    } catch (error) {
        console.log('⚠️ Could not verify backend connection');
    }
}, 2000);