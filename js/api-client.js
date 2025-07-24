// js/api-client.js - API Request Handler
class APIClient {
    constructor(baseURL = CONFIG.API.BASE_URL) {
        this.baseURL = baseURL;
        this.timeout = CONFIG.API.TIMEOUT;
    }
    
    // Get authentication headers
    getAuthHeaders() {
        const token = UTILS.auth.getToken();
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }
    
    // Handle API response
    async handleResponse(response) {
        let data;
        
        try {
            data = await response.json();
        } catch (error) {
            throw new Error('Invalid JSON response from server');
        }
        
        if (!response.ok) {
            // Handle authentication errors
            if (response.status === 401) {
                UTILS.auth.logout();
                throw new Error('Authentication required');
            }
            
            throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        return data;
    }
    
    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const defaultOptions = {
            headers: this.getAuthHeaders(),
            timeout: this.timeout
        };
        
        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            
            const response = await fetch(url, {
                ...finalOptions,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            return await this.handleResponse(response);
            
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }
    
    // GET request
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, {
            method: 'GET'
        });
    }
    
    // POST request
    async post(endpoint, data = null) {
        return this.request(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : null
        });
    }
    
    // PUT request
    async put(endpoint, data = null) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : null
        });
    }
    
    // PATCH request
    async patch(endpoint, data = null) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : null
        });
    }
    
    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
    
    // File upload (multipart/form-data)
    async upload(endpoint, formData) {
        const token = UTILS.auth.getToken();
        const headers = {};
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Don't set Content-Type for FormData - browser will set it with boundary
        return this.request(endpoint, {
            method: 'POST',
            headers,
            body: formData
        });
    }
    
    // Specialized API methods
    
    // Authentication
    async login(credentials) {
        return this.post('/auth/login', credentials);
    }
    
    async register(userData) {
        return this.post('/auth/register', userData);
    }
    
    // Profile
    async getProfile() {
        return this.get('/influencer/profile');
    }
    
    async updateProfile(profileData) {
        return this.put('/influencer/profile', profileData);
    }
    
    // Avatar
    async createAvatar(imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        return this.upload('/avatar/create', formData);
    }
    
    async listVoices() {
        return this.get('/avatar/list-voices');
    }
    
    async generateTestVideo(avatarId, text, voiceId) {
        return this.post('/avatar/test-video', {
            avatar_id: avatarId,
            text,
            voice_id: voiceId
        });
    }
    
    async getVideoStatus(videoId) {
        return this.get(`/avatar/video-status/${videoId}`);
    }
    
    // Voice
    async saveVoicePreference(voiceId) {
        return this.post('/voice/preference', {
            voice_id: voiceId
        });
    }
    
    async getVoicePreference() {
        return this.get('/voice/preference');
    }
    
    async createVoiceClone(formData) {
        return this.upload('/voice/clone', formData);
    }
    
    async textToSpeech(text, voiceId) {
        return this.post('/voice/text-to-speech', {
            text,
            voice_id: voiceId
        });
    }
    
    // Chat
    async sendChatMessage(message, influencerId, sessionId, voiceMode = false) {
        return this.post('/chat', {
            message,
            influencer_id: influencerId,
            session_id: sessionId,
            voice_mode: voiceMode
        });
    }
    
    async getChatInfo(username) {
        return this.get(`/chat/${username}`);
    }
    
    // Affiliate
    async getAffiliateLinks() {
        return this.get('/affiliate');
    }
    
    async addAffiliateLink(platformData) {
        return this.post('/affiliate', platformData);
    }
    
    async removeAffiliateLink(platform) {
        return this.delete(`/affiliate/${platform}`);
    }
    
    async getAffiliateAnalytics(timeframe = '7d') {
        return this.get('/affiliate/analytics', { timeframe });
    }
    
    // Analytics
    async getDashboardAnalytics() {
        return this.get('/analytics/dashboard');
    }
    
    async getPromotionAnalytics() {
        return this.get('/analytics/promotion');
    }
    
    // Settings
    async getSettings() {
        return this.get('/settings');
    }
    
    async updateSettings(settings) {
        return this.put('/settings', settings);
    }
    
    // Knowledge Management
    async savePersonalInfo(personalData) {
        return this.post('/knowledge/personal-info', personalData);
    }
    
    async uploadKnowledgeDocument(file) {
        const formData = new FormData();
        formData.append('document', file);
        return this.upload('/knowledge/upload', formData);
    }
    
    async getKnowledgeDocuments() {
        return this.get('/knowledge/documents');
    }
    
    async deleteKnowledgeDocument(documentId) {
        return this.delete(`/knowledge/documents/${documentId}`);
    }
}

// Enhanced API with error handling and loading states
class EnhancedAPI extends APIClient {
    constructor() {
        super();
        this.requestQueue = new Map();
        this.loadingStates = new Map();
    }
    
    // Show loading state for a request
    setLoading(key, isLoading) {
        this.loadingStates.set(key, isLoading);
        
        // Dispatch custom event for UI components to listen to
        window.dispatchEvent(new CustomEvent('apiLoadingStateChange', {
            detail: { key, isLoading }
        }));
        
        return isLoading;
    }
    
    // Check if a request is currently loading
    isLoading(key) {
        return this.loadingStates.get(key) || false;
    }
    
    // Enhanced request with loading states and duplicate prevention
    async enhancedRequest(key, requestFn, showAlert = true) {
        // Prevent duplicate requests
        if (this.requestQueue.has(key)) {
            console.log(`Request "${key}" already in progress, using existing promise`);
            return this.requestQueue.get(key);
        }
        
        this.setLoading(key, true);
        
        const requestPromise = (async () => {
            try {
                const result = await requestFn();
                
                if (showAlert && result.status === 'success' && result.message) {
                    UTILS.ui.showAlert(result.message, 'success');
                }
                
                return result;
                
            } catch (error) {
                console.error(`API request "${key}" failed:`, error);
                
                if (showAlert) {
                    UTILS.ui.showAlert(error.message || 'Request failed', 'error');
                }
                
                throw error;
                
            } finally {
                this.setLoading(key, false);
                this.requestQueue.delete(key);
            }
        })();
        
        this.requestQueue.set(key, requestPromise);
        return requestPromise;
    }
    
    // Enhanced methods with loading states
    async loginWithLoading(credentials) {
        return this.enhancedRequest('login', () => this.login(credentials));
    }
    
    async registerWithLoading(userData) {
        return this.enhancedRequest('register', () => this.register(userData));
    }
    
    async createAvatarWithLoading(imageFile) {
        return this.enhancedRequest('createAvatar', () => this.createAvatar(imageFile));
    }
    
    async saveVoicePreferenceWithLoading(voiceId) {
        return this.enhancedRequest('saveVoicePreference', 
            () => this.saveVoicePreference(voiceId), false);
    }
    
    async loadAffiliateDataWithLoading() {
        return this.enhancedRequest('loadAffiliateData', 
            () => this.getAffiliateLinks(), false);
    }
    
    async connectPlatformWithLoading(platformData) {
        return this.enhancedRequest('connectPlatform', 
            () => this.addAffiliateLink(platformData));
    }
}

// Create global API instance
const API = new EnhancedAPI();

// Make API client globally available
window.API = API;

console.log('🌐 API client loaded');