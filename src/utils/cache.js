// src/utils/cache.js
// Utility functions for localStorage and sessionStorage caching

const CACHE_PREFIX = 'student_social_';
const CACHE_VERSION = 'v1_';

/**
 * LocalStorage Cache Utility
 * For persistent data that should survive browser sessions
 */
export const localCache = {
  /**
   * Set item in localStorage with expiration
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (default: 24 hours)
   */
  set(key, value, ttl = 24 * 60 * 60 * 1000) {
    try {
      const item = {
        value,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(
        `${CACHE_PREFIX}${CACHE_VERSION}${key}`,
        JSON.stringify(item)
      );
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  },

  /**
   * Get item from localStorage
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if expired/not found
   */
  get(key) {
    try {
      const itemStr = localStorage.getItem(`${CACHE_PREFIX}${CACHE_VERSION}${key}`);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);
      const now = Date.now();

      // Check if expired
      if (now - item.timestamp > item.ttl) {
        this.remove(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('Error getting localStorage:', error);
      return null;
    }
  },

  /**
   * Remove item from localStorage
   * @param {string} key - Cache key
   */
  remove(key) {
    try {
      localStorage.removeItem(`${CACHE_PREFIX}${CACHE_VERSION}${key}`);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  /**
   * Clear all cache items
   */
  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  /**
   * Check if key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  },
};

/**
 * SessionStorage Cache Utility
 * For temporary data that should only last the browser session
 */
export const sessionCache = {
  /**
   * Set item in sessionStorage
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   */
  set(key, value) {
    try {
      sessionStorage.setItem(
        `${CACHE_PREFIX}${CACHE_VERSION}${key}`,
        JSON.stringify(value)
      );
    } catch (error) {
      console.error('Error setting sessionStorage:', error);
    }
  },

  /**
   * Get item from sessionStorage
   * @param {string} key - Cache key
   * @returns {any|null}
   */
  get(key) {
    try {
      const itemStr = sessionStorage.getItem(`${CACHE_PREFIX}${CACHE_VERSION}${key}`);
      if (!itemStr) return null;
      return JSON.parse(itemStr);
    } catch (error) {
      console.error('Error getting sessionStorage:', error);
      return null;
    }
  },

  /**
   * Remove item from sessionStorage
   * @param {string} key - Cache key
   */
  remove(key) {
    try {
      sessionStorage.removeItem(`${CACHE_PREFIX}${CACHE_VERSION}${key}`);
    } catch (error) {
      console.error('Error removing from sessionStorage:', error);
    }
  },

  /**
   * Clear all session cache items
   */
  clear() {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  },

  /**
   * Check if key exists
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  },
};

/**
 * Specific cache keys for the application
 */
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  USER_SETTINGS: 'user_settings',
  FOLLOWING_LIST: 'following_list',
  FOLLOWERS_LIST: 'followers_list',
  SUGGESTED_USERS: 'suggested_users',
  RECENT_SEARCHES: 'recent_searches',
  THEME_PREFERENCE: 'theme_preference',
  LAST_VISITED_PAGE: 'last_visited_page',
};

/**
 * Helper function to cache user profile
 */
export const cacheUserProfile = (userId, profileData) => {
  localCache.set(`${CACHE_KEYS.USER_PROFILE}_${userId}`, profileData, 30 * 60 * 1000); // 30 minutes
};

/**
 * Helper function to get cached user profile
 */
export const getCachedUserProfile = (userId) => {
  return localCache.get(`${CACHE_KEYS.USER_PROFILE}_${userId}`);
};

/**
 * Helper function to invalidate user profile cache
 */
export const invalidateUserProfile = (userId) => {
  localCache.remove(`${CACHE_KEYS.USER_PROFILE}_${userId}`);
};

/**
 * Helper function to cache search results temporarily
 */
export const cacheSearchResults = (query, results) => {
  sessionCache.set(`search_${query}`, results);
};

/**
 * Helper function to get cached search results
 */
export const getCachedSearchResults = (query) => {
  return sessionCache.get(`search_${query}`);
};
