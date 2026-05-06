/**
 * Exam Session Management
 * Handles localStorage operations for exam session state and verified user data
 */

// ============================================================================
// Types
// ============================================================================

export interface VerifiedUserData {
  name: string;
  number: string;
  city: string;
  classStatus: string;
  stream: string;
  email: string;
  userId?: string;
  attempts?: number;
  verifiedAt: number; // timestamp
}

// ============================================================================
// Storage Keys
// ============================================================================

const VERIFIED_USER_KEY = 'exam-verified-user';

// ============================================================================
// Safe Storage Operations
// ============================================================================

/**
 * Safely parse JSON from storage
 */
function safeParseJSON<T>(text: string | null): T | null {
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Check if localStorage is available
 */
function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Verified User Management
// ============================================================================

/**
 * Save verified user data to localStorage
 */
export function saveVerifiedUser(userData: VerifiedUserData): void {
  if (!isStorageAvailable()) return;

  try {
    const data: VerifiedUserData = {
      ...userData,
      verifiedAt: userData.verifiedAt || Date.now(),
    };

    localStorage.setItem(VERIFIED_USER_KEY, JSON.stringify(data));
  } catch {
    console.error('Failed to save verified user data');
  }
}

/**
 * Load verified user data from localStorage
 */
export function loadVerifiedUser(): VerifiedUserData | null {
  if (!isStorageAvailable()) return null;

  try {
    const text = localStorage.getItem(VERIFIED_USER_KEY);
    return safeParseJSON<VerifiedUserData>(text);
  } catch {
    console.error('Failed to load verified user data');
    return null;
  }
}

/**
 * Clear verified user data
 */
export function clearVerifiedUser(): void {
  if (!isStorageAvailable()) return;

  try {
    localStorage.removeItem(VERIFIED_USER_KEY);
  } catch {
    console.error('Failed to clear verified user data');
  }
}

/**
 * Get verified user phone number (useful for exam submission)
 */
export function getVerifiedUserNumber(): string | null {
  const user = loadVerifiedUser();
  return user?.number ?? null;
}

// ============================================================================
// Exam Session Tracking
// ============================================================================

/**
 * Mark exam as started
 */
export function markExamStarted(): void {
  if (!isStorageAvailable()) return;

  try {
    localStorage.setItem('exam-started-at', Date.now().toString());
  } catch {
    console.error('Failed to mark exam as started');
  }
}

/**
 * Mark exam as submitted
 */
export function markExamSubmitted(): void {
  if (!isStorageAvailable()) return;

  try {
    localStorage.setItem('exam-submitted', 'true');
    localStorage.setItem('exam-submitted-at', Date.now().toString());
  } catch {
    console.error('Failed to mark exam as submitted');
  }
}

/**
 * Check if exam has been submitted
 */
export function isExamSubmitted(): boolean {
  if (!isStorageAvailable()) return false;

  try {
    return localStorage.getItem('exam-submitted') === 'true';
  } catch {
    return false;
  }
}

// ============================================================================
// Session Status
// ============================================================================

/**
 * Get session status
 */
export function getSessionStatus(): {
  isVerified: boolean;
  isSubmitted: boolean;
  verifiedUser: VerifiedUserData | null;
} {
  const verifiedUser = loadVerifiedUser();

  return {
    isVerified: !!verifiedUser,
    isSubmitted: isExamSubmitted(),
    verifiedUser,
  };
}

// ============================================================================
// Session Cleanup
// ============================================================================

/**
 * Clear all exam-related session data
 * Call this after exam submission to reset for next attempt
 */
export function clearAllExamData(): void {
  if (!isStorageAvailable()) return;

  try {
    localStorage.removeItem('exam-started-at');
    localStorage.removeItem('exam-submitted');
    localStorage.removeItem('exam-submitted-at');
    // Note: We DON'T clear verified user here - user can retake same session
  } catch {
    console.error('Failed to clear exam data');
  }
}

/**
 * Logout user completely
 * Clears all exam data and user verification
 */
export function logoutExamSession(): void {
  clearAllExamData();
  clearVerifiedUser();
}

// ============================================================================
// Utility: Check Session Validity
// ============================================================================

/**
 * Check if session is valid for exam access
 */
export function isSessionValidForExam(): boolean {
  const user = loadVerifiedUser();

  if (!user) {
    return false;
  }

  // Session valid if verified within last 24 hours
  const now = Date.now();
  const verificationAge = now - user.verifiedAt;
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

  return verificationAge <= TWENTY_FOUR_HOURS;
}
