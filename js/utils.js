/**
 * FIXED UTILS.JS - Utility functions for AvatarCommerce
 * Enhanced with better error handling and authentication
 */

// Ensure CONFIG is available
if (typeof window.CONFIG === 'undefined') {
    console.error('❌ CONFIG not found. Make sure config.js is loaded first.');
}

const UTILS = {
    /**
     * FIXED Authentication utilities
     */
    auth: {
        /**
         * Get current user data with enhanced error handling
         * @returns {Object|null} User data or null if not logged in
         */
        getCurrentUser: () => {
            try {
                const userStr = localStorage.getItem(window.CONFIG?.AUTH?.USER_KEY || 'user');
                if (!userStr) return null;
                
                const userData = JSON.parse(userStr);
                
                // Handle different user data structures from login/register
                if (userData.data && userData.data.user) {
                    // New API response format
                    return {
                        ...userData.data.user,
                        userType: userData.data.userType || 'influencer'
                    };
                } else if (userData.user && userData.user.username) {
                    // Nested user object
                    return {
                        ...userData.user,
                        userType: userData.userType || 'influencer'
                    };
                } else if (userData.username) {
                    // Direct user object
                    return userData;
                } else {
                    console.warn('⚠️ Invalid user data structure:', userData);
                    return null;
                }
            } catch (error) {
                console.error('❌ Error getting current user:', error);
                return null;
            }
        },
        
        /**
         * Get authentication token
         * @returns {string|null} JWT token or null
         */
        getToken: () => {
            return localStorage.getItem(window.CONFIG?.AUTH?.TOKEN_KEY || 'token');
        },
        
        /**
         * Check if user is logged in
         * @returns {boolean} True if user is logged in
         */
        isAuthenticated: () => {
            const token = UTILS.auth.getToken();
            const user = UTILS.auth.getCurrentUser();
            return !!(token && user);
        },
        
        /**
         * Check if user is logged in (alias)
         * @returns {boolean} True if user is logged in
         */
        isLoggedIn: () => {
            return UTILS.auth.isAuthenticated();
        },
        
        /**
         * Check if current user is an influencer
         * @returns {boolean} True if user is an influencer
         */
        isInfluencer: () => {
            const user = UTILS.auth.getCurrentUser();
            return user && user.userType === 'influencer';
        },
        
        /**
         * Check if current user is a fan
         * @returns {boolean} True if user is a fan
         */
        isFan: () => {
            const user = UTILS.auth.getCurrentUser();
            return user && user.userType === 'fan';
        },
        
        /**
         * Logout current user
         */
        logout: () => {
            const config = window.CONFIG?.AUTH || {};
            localStorage.removeItem(config.TOKEN_KEY || 'token');
            localStorage.removeItem(config.USER_KEY || 'user');
            localStorage.removeItem(config.REFRESH_TOKEN_KEY || 'refresh_token');
            
            // Determine redirect URL based on current location
            const currentPath = window.location.pathname;
            if (currentPath.includes('/pages/')) {
                window.location.href = './login.html';
            } else {
                window.location.href = '/pages/login.html';
            }
        },
        
        /**
         * Redirect to login if not authenticated
         */
        requireAuth: () => {
            if (!UTILS.auth.isAuthenticated()) {
                console.log('❌ Authentication required, redirecting to login');
                UTILS.auth.logout();
                return false;
            }
            return true;
        },
        
        /**
         * Redirect to login if not an influencer
         */
        requireInfluencer: () => {
            if (!UTILS.auth.isAuthenticated()) {
                console.log('❌ Authentication required');
                UTILS.auth.logout();
                return false;
            }
            
            if (!UTILS.auth.isInfluencer()) {
                console.log('❌ Influencer access required');
                UTILS.auth.logout();
                return false;
            }
            
            return true;
        },
        
        /**
         * Redirect to login if not a fan
         */
        requireFan: () => {
            if (!UTILS.auth.isAuthenticated()) {
                console.log('❌ Authentication required');
                UTILS.auth.logout();
                return false;
            }
            
            if (!UTILS.auth.isFan()) {
                console.log('❌ Fan access required');
                UTILS.auth.logout();
                return false;
            }
            
            return true;
        },
        
        /**
         * Save user data after login/register
         * @param {Object} loginResponse - Response from login/register API
         */
        saveUserData: (loginResponse) => {
            try {
                if (!loginResponse || !loginResponse.data) {
                    throw new Error('Invalid login response');
                }
                
                const { data } = loginResponse;
                const config = window.CONFIG?.AUTH || {};
                
                // Save token
                if (data.token) {
                    localStorage.setItem(config.TOKEN_KEY || 'token', data.token);
                }
                
                // Save user data in consistent format
                const userData = {
                    ...data.user,
                    userType: data.userType || 'influencer'
                };
                
                localStorage.setItem(config.USER_KEY || 'user', JSON.stringify(userData));
                
                console.log('✅ User data saved successfully:', userData.username);
                return true;
            } catch (error) {
                console.error('❌ Error saving user data:', error);
                return false;
            }
        }
    },
    
    /**
     * Enhanced UI utilities
     */
    ui: {
        /**
         * Get initials from name
         * @param {string} name - Full name
         * @returns {string} Initials
         */
        getInitials: (name) => {
            if (!name || typeof name !== 'string') return '?';
            
            return name.split(' ')
                .filter(word => word.length > 0)
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
        },
        
        /**
         * Show alert message with enhanced styling
         * @param {string} message - Alert message
         * @param {string} type - Alert type (success, error, warning, info)
         * @param {Element|null} container - Container element (optional)
         * @param {number} duration - Display duration in milliseconds
         */
        showAlert: (message, type = 'info', container = null, duration = null) => {
            const alertDuration = duration || window.CONFIG?.UI?.ALERT_DURATION || 5000;
            
            // Find or create alert container
            let alertEl = container;
            
            if (!alertEl) {
                // Look for existing alert container
                alertEl = document.getElementById('dashboard-alert') || 
                         document.querySelector('.alert-container') || 
                         document.querySelector('.alert');
                
                // Create new alert if none found
                if (!alertEl) {
                    alertEl = document.createElement('div');
                    alertEl.style.position = 'fixed';
                    alertEl.style.top = '20px';
                    alertEl.style.right = '20px';
                    alertEl.style.zIndex = '10000';
                    alertEl.style.maxWidth = '400px';
                    alertEl.style.padding = '15px 20px';
                    alertEl.style.borderRadius = '8px';
                    alertEl.style.fontWeight = '500';
                    alertEl.style.fontSize = '14px';
                    alertEl.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    alertEl.style.transform = 'translateX(100%)';
                    alertEl.style.transition = 'all 0.3s ease';
                    
                    document.body.appendChild(alertEl);
                }
            }
            
            // Set alert content and styling
            alertEl.className = `alert alert-${type} show`;
            alertEl.textContent = message;
            alertEl.style.display = 'block';
            
            // Color scheme
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
            
            // Animate in
            setTimeout(() => {
                alertEl.style.transform = 'translateX(0)';
            }, 10);
            
            // Auto-hide after duration
            setTimeout(() => {
                alertEl.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (alertEl.parentNode && !container) {
                        alertEl.parentNode.removeChild(alertEl);
                    } else if (container) {
                        alertEl.style.display = 'none';
                        alertEl.classList.remove('show');
                    }
                }, 300);
            }, alertDuration);
        },
        
        /**
         * Toggle button loading state
         * @param {Element} button - Button element
         * @param {boolean} isLoading - Loading state
         * @param {string} loadingText - Text to show while loading
         */
        toggleButtonLoading: (button, isLoading, loadingText = 'Loading...') => {
            if (!button) return;
            
            if (isLoading) {
                button.disabled = true;
                button.dataset.originalText = button.innerHTML;
                button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
                button.style.pointerEvents = 'none';
            } else {
                button.disabled = false;
                button.innerHTML = button.dataset.originalText || 'Submit';
                button.style.pointerEvents = 'auto';
            }
        },
        
        /**
         * Show loading overlay
         * @param {string} message - Loading message
         * @returns {Element} Overlay element
         */
        showLoading: (message = 'Loading...') => {
            const overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                backdrop-filter: blur(2px);
            `;
            
            overlay.innerHTML = `
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    text-align: center;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                    max-width: 300px;
                ">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #5e60ce; margin-bottom: 15px;"></i>
                    <div style="font-weight: 500; color: #333;">${message}</div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            return overlay;
        },
        
        /**
         * Hide loading overlay
         */
        hideLoading: () => {
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                }, 300);
            }
        },
        
        /**
         * Show confirmation dialog
         * @param {string} message - Confirmation message
         * @param {string} confirmText - Confirm button text
         * @param {string} cancelText - Cancel button text
         * @returns {Promise<boolean>} User choice
         */
        showConfirm: (message, confirmText = 'Confirm', cancelText = 'Cancel') => {
            return new Promise((resolve) => {
                // Use native confirm as fallback
                if (!document.body) {
                    resolve(confirm(message));
                    return;
                }
                
                const modal = document.createElement('div');
                modal.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    backdrop-filter: blur(2px);
                `;
                
                modal.innerHTML = `
                    <div style="
                        background: white;
                        padding: 30px;
                        border-radius: 12px;
                        max-width: 400px;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                    ">
                        <div style="margin-bottom: 20px; font-size: 16px; color: #333; line-height: 1.5;">
                            ${message}
                        </div>
                        <div style="display: flex; gap: 10px; justify-content: flex-end;">
                            <button id="confirm-cancel" style="
                                padding: 8px 16px;
                                border: 1px solid #ddd;
                                background: white;
                                color: #666;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 14px;
                            ">${cancelText}</button>
                            <button id="confirm-ok" style="
                                padding: 8px 16px;
                                border: none;
                                background: #5e60ce;
                                color: white;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 14px;
                            ">${confirmText}</button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                const cleanup = () => {
                    if (modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                    }
                };
                
                modal.querySelector('#confirm-ok').addEventListener('click', () => {
                    cleanup();
                    resolve(true);
                });
                
                modal.querySelector('#confirm-cancel').addEventListener('click', () => {
                    cleanup();
                    resolve(false);
                });
                
                // Close on backdrop click
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        cleanup();
                        resolve(false);
                    }
                });
            });
        }
    },
    
    /**
     * Enhanced API utilities
     */
    api: {
        /**
         * Get API base URL
         * @returns {string} API base URL
         */
        getBaseUrl: () => {
            return window.CONFIG?.API?.BASE_URL || 'http://localhost:2000/api';
        },
        
        /**
         * Get default headers for API requests
         * @param {boolean} includeAuth - Include authorization header
         * @returns {Object} Headers object
         */
        getHeaders: (includeAuth = true) => {
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
            
            if (includeAuth) {
                const token = UTILS.auth.getToken();
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }
            
            return headers;
        },
        
        /**
         * Make API request with enhanced error handling
         * @param {string} endpoint - API endpoint
         * @param {Object} options - Fetch options
         * @returns {Promise<Object>} API response
         */
        request: async (endpoint, options = {}) => {
            const baseUrl = UTILS.api.getBaseUrl();
            const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
            
            const config = {
                headers: UTILS.api.getHeaders(options.auth !== false),
                ...options
            };
            
            try {
                console.log(`📡 API Request: ${config.method || 'GET'} ${url}`);
                
                const response = await fetch(url, config);
                const data = await response.json();
                
                console.log(`📡 API Response: ${response.status}`, data);
                
                if (!response.ok) {
                    throw new Error(data.message || `HTTP ${response.status}`);
                }
                
                return data;
            } catch (error) {
                console.error('❌ API Request failed:', error);
                throw error;
            }
        },
        
        /**
         * Handle API errors consistently
         * @param {Error} error - Error object
         * @param {string} defaultMessage - Default error message
         */
        handleError: (error, defaultMessage = 'An error occurred') => {
            let message = defaultMessage;
            
            if (error.message) {
                message = error.message;
            } else if (typeof error === 'string') {
                message = error;
            }
            
            // Handle common errors
            if (message.includes('401') || message.includes('Unauthorized')) {
                message = 'Session expired. Please log in again.';
                setTimeout(() => UTILS.auth.logout(), 2000);
            } else if (message.includes('404')) {
                message = 'Resource not found.';
            } else if (message.includes('500')) {
                message = 'Server error. Please try again later.';
            }
            
            UTILS.ui.showAlert(message, 'error');
        }
    },
    
    /**
     * Enhanced format utilities
     */
    format: {
        /**
         * Format file size
         * @param {number} bytes - File size in bytes
         * @returns {string} Formatted file size
         */
        fileSize: (bytes) => {
            if (!bytes || bytes === 0) return '0 B';
            
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        },
        
        /**
         * Format duration
         * @param {number} seconds - Duration in seconds
         * @returns {string} Formatted duration
         */
        duration: (seconds) => {
            if (!seconds || seconds < 0) return '0s';
            
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            
            if (hours > 0) {
                return `${hours}h ${minutes}m ${remainingSeconds}s`;
            } else if (minutes > 0) {
                return `${minutes}m ${remainingSeconds}s`;
            } else {
                return `${remainingSeconds}s`;
            }
        },
        
        /**
         * Format currency
         * @param {number} amount - Amount to format
         * @param {string} currency - Currency code
         * @returns {string} Formatted currency
         */
        currency: (amount, currency = 'USD') => {
            if (typeof amount !== 'number') return 'N/A';
            
            try {
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency
                }).format(amount);
            } catch (error) {
                return `${currency} ${amount.toFixed(2)}`;
            }
        },
        
        /**
         * Format date
         * @param {string|Date} date - Date to format
         * @param {Object} options - Formatting options
         * @returns {string} Formatted date
         */
        date: (date, options = {}) => {
            if (!date) return 'N/A';
            
            try {
                const dateObj = typeof date === 'string' ? new Date(date) : date;
                
                const defaultOptions = {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    ...options
                };
                
                return dateObj.toLocaleDateString('en-US', defaultOptions);
            } catch (error) {
                console.error('Date formatting error:', error);
                return 'Invalid Date';
            }
        },
        
        /**
         * Format relative time (e.g., "2 hours ago")
         * @param {string|Date} date - Date to format
         * @returns {string} Relative time string
         */
        timeAgo: (date) => {
            if (!date) return 'N/A';
            
            try {
                const dateObj = typeof date === 'string' ? new Date(date) : date;
                const now = new Date();
                const diffInSeconds = Math.floor((now - dateObj) / 1000);
                
                const intervals = [
                    { label: 'year', seconds: 31536000 },
                    { label: 'month', seconds: 2592000 },
                    { label: 'week', seconds: 604800 },
                    { label: 'day', seconds: 86400 },
                    { label: 'hour', seconds: 3600 },
                    { label: 'minute', seconds: 60 }
                ];
                
                for (const interval of intervals) {
                    const count = Math.floor(diffInSeconds / interval.seconds);
                    if (count >= 1) {
                        return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
                    }
                }
                
                return 'Just now';
            } catch (error) {
                console.error('Time ago formatting error:', error);
                return 'N/A';
            }
        }
    },
    
    /**
     * Validation utilities
     */
    validation: {
        /**
         * Validate email address
         * @param {string} email - Email to validate
         * @returns {boolean} Is valid email
         */
        email: (email) => {
            if (!email || typeof email !== 'string') return false;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },
        
        /**
         * Validate username
         * @param {string} username - Username to validate
         * @returns {Object} Validation result
         */
        username: (username) => {
            if (!username || typeof username !== 'string') {
                return { valid: false, message: 'Username is required' };
            }
            
            if (username.length < 3) {
                return { valid: false, message: 'Username must be at least 3 characters' };
            }
            
            if (username.length > 30) {
                return { valid: false, message: 'Username must be less than 30 characters' };
            }
            
            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                return { valid: false, message: 'Username can only contain letters, numbers, and underscores' };
            }
            
            return { valid: true };
        },
        
        /**
         * Validate password
         * @param {string} password - Password to validate
         * @returns {Object} Validation result
         */
        password: (password) => {
            if (!password || typeof password !== 'string') {
                return { valid: false, message: 'Password is required' };
            }
            
            if (password.length < 6) {
                return { valid: false, message: 'Password must be at least 6 characters' };
            }
            
            if (password.length > 100) {
                return { valid: false, message: 'Password is too long' };
            }
            
            return { valid: true };
        }
    },
    
    /**
     * Storage utilities
     */
    storage: {
        /**
         * Set item in localStorage with error handling
         * @param {string} key - Storage key
         * @param {any} value - Value to store
         * @returns {boolean} Success status
         */
        set: (key, value) => {
            try {
                const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
                localStorage.setItem(key, serializedValue);
                return true;
            } catch (error) {
                console.error('Storage set error:', error);
                return false;
            }
        },
        
        /**
         * Get item from localStorage with error handling
         * @param {string} key - Storage key
         * @param {any} defaultValue - Default value if not found
         * @returns {any} Stored value or default
         */
        get: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(key);
                if (item === null) return defaultValue;
                
                try {
                    return JSON.parse(item);
                } catch {
                    return item;
                }
            } catch (error) {
                console.error('Storage get error:', error);
                return defaultValue;
            }
        },
        
        /**
         * Remove item from localStorage
         * @param {string} key - Storage key
         * @returns {boolean} Success status
         */
        remove: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Storage remove error:', error);
                return false;
            }
        },
        
        /**
         * Clear all localStorage
         * @returns {boolean} Success status
         */
        clear: () => {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('Storage clear error:', error);
                return false;
            }
        }
    }
};

// Make UTILS available globally
window.UTILS = UTILS;

// Compatibility with existing code
if (!window.CONFIG) {
    console.warn('⚠️ CONFIG not loaded. Some features may not work correctly.');
}

console.log('✅ Enhanced UTILS.js loaded successfully');

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UTILS;
}