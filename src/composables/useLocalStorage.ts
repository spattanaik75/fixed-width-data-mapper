import { ref } from 'vue';
import type { FieldMapping, ParsedRecord } from '../types';

const STORAGE_KEY = 'ice-mapper-session';

interface SessionData {
  mappings: FieldMapping[];
  rawRecords: string[];
  parsedRecords: ParsedRecord[];
  timestamp: number;
}

export function useLocalStorage() {
  const hasSession = ref(false);

  // Check if there's an existing session
  const checkSession = (): boolean => {
    const stored = localStorage.getItem(STORAGE_KEY);
    hasSession.value = !!stored;
    return hasSession.value;
  };

  // Save session
  const saveSession = (
    mappings: FieldMapping[],
    rawRecords: string[],
    parsedRecords: ParsedRecord[]
  ): void => {
    const sessionData: SessionData = {
      mappings,
      rawRecords,
      parsedRecords,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
      hasSession.value = true;
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  // Load session
  const loadSession = (): SessionData | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      
      const sessionData: SessionData = JSON.parse(stored);
      return sessionData;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  };

  // Clear session
  const clearSession = (): void => {
    localStorage.removeItem(STORAGE_KEY);
    hasSession.value = false;
  };

  // Get session age in hours
  const getSessionAge = (): number | null => {
    const session = loadSession();
    if (!session) return null;
    
    const ageMs = Date.now() - session.timestamp;
    return Math.floor(ageMs / (1000 * 60 * 60)); // Convert to hours
  };

  // Auto-save watch helper
  const setupAutoSave = (
    getMappings: () => FieldMapping[],
    getRawRecords: () => string[],
    getParsedRecords: () => ParsedRecord[]
  ) => {
    // Debounce auto-save
    let saveTimeout: NodeJS.Timeout;
    
    const triggerSave = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        const mappings = getMappings();
        const rawRecords = getRawRecords();
        const parsedRecords = getParsedRecords();
        
        if (mappings.length > 0) {
          saveSession(mappings, rawRecords, parsedRecords);
        }
      }, 2000); // Save 2 seconds after last change
    };

    return triggerSave;
  };

  // Initialize
  checkSession();

  return {
    hasSession,
    checkSession,
    saveSession,
    loadSession,
    clearSession,
    getSessionAge,
    setupAutoSave
  };
}
