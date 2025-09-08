// Local storage utilities for saving and loading game data

/**
 * Save data to localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} data - Data to save (will be JSON.stringify'd)
 * @returns {boolean} Success status
 */
export function save(key, data) {
  try {
    const jsonString = JSON.stringify(data);
    localStorage.setItem(key, jsonString);
    return true;
  } catch (error) {
    console.warn(
      `Failed to save data to localStorage for key "${key}":`,
      error
    );
    return false;
  }
}

/**
 * Load data from localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if loading fails
 * @returns {*} Loaded data or default value
 */
export function load(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (error) {
    console.warn(
      `Failed to load data from localStorage for key "${key}":`,
      error
    );
    return defaultValue;
  }
}

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export function remove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(
      `Failed to remove data from localStorage for key "${key}":`,
      error
    );
    return false;
  }
}

/**
 * Check if localStorage is available
 * @returns {boolean} True if localStorage is available
 */
export function isAvailable() {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get all keys that start with a prefix
 * @param {string} prefix - Key prefix to search for
 * @returns {string[]} Array of matching keys
 */
export function getKeysWithPrefix(prefix) {
  const keys = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }
  } catch (error) {
    console.warn(`Failed to get keys with prefix "${prefix}":`, error);
  }
  return keys;
}

/**
 * Clear all data with a specific prefix
 * @param {string} prefix - Key prefix to clear
 * @returns {number} Number of items cleared
 */
export function clearPrefix(prefix) {
  const keys = getKeysWithPrefix(prefix);
  let cleared = 0;

  keys.forEach((key) => {
    if (remove(key)) {
      cleared++;
    }
  });

  return cleared;
}

/**
 * Get storage usage information
 * @returns {Object} Storage usage info
 */
export function getStorageInfo() {
  if (!isAvailable()) {
    return { available: false, used: 0, total: 0, remaining: 0 };
  }

  try {
    // Calculate used space
    let used = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }

    // Estimate total available space (usually ~5MB)
    const total = 5 * 1024 * 1024; // 5MB in bytes
    const remaining = total - used;

    return {
      available: true,
      used,
      total,
      remaining,
      usedMB: (used / 1024 / 1024).toFixed(2),
      totalMB: (total / 1024 / 1024).toFixed(2),
      remainingMB: (remaining / 1024 / 1024).toFixed(2),
      usagePercentage: ((used / total) * 100).toFixed(2),
    };
  } catch (error) {
    console.warn('Failed to calculate storage info:', error);
    return { available: false, used: 0, total: 0, remaining: 0 };
  }
}

/**
 * Backup all data to a JSON string
 * @param {string[]} keys - Optional array of specific keys to backup
 * @returns {string|null} JSON string of backed up data
 */
export function backup(keys = null) {
  try {
    const data = {};
    const keysToBackup = keys || Object.keys(localStorage);

    keysToBackup.forEach((key) => {
      if (localStorage.hasOwnProperty(key)) {
        data[key] = localStorage.getItem(key);
      }
    });

    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.warn('Failed to backup localStorage data:', error);
    return null;
  }
}

/**
 * Restore data from a backup JSON string
 * @param {string} backupData - JSON string from backup()
 * @param {boolean} overwrite - Whether to overwrite existing data
 * @returns {boolean} Success status
 */
export function restore(backupData, overwrite = false) {
  try {
    const data = JSON.parse(backupData);
    let restored = 0;

    for (const [key, value] of Object.entries(data)) {
      if (overwrite || !localStorage.hasOwnProperty(key)) {
        localStorage.setItem(key, value);
        restored++;
      }
    }

    console.log(`Restored ${restored} items from backup`);
    return true;
  } catch (error) {
    console.warn('Failed to restore localStorage data:', error);
    return false;
  }
}
