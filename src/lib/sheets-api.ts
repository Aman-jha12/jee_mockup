/**
 * Google Apps Script API Layer
 * Centralized API communication for the exam platform
 * 
 * Backend actions (from Apps Script doPost):
 * - checkUser: Check if user has attempts remaining
 * - verifyUser: Create/update user and mark verified=true, increment attempt count
 * - submitExam: Submit exam results
 */

const API_TIMEOUT = 30000; // 30 seconds

// ============================================================================
// Types
// ============================================================================

export interface CheckUserResponse {
  allowed: boolean;
  attempts: number;
  reason?: string;
}

export interface VerifyUserPayload {
  action: 'verifyUser';
  number: string;
  name: string;
  city: string;
  classStatus: string;
  stream: string;
  email: string;
}

export interface VerifyUserResponse {
  success: boolean;
  message?: string;
  attempts?: number;
}

export interface SubmitExamPayload {
  action: 'submitExam';
  number: string;
  totalMarks: number;
  maths: number;
  physics: number;
  chemistry: number;
  attempt?: number;
}

export interface SubmitExamResponse {
  success: boolean;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// ============================================================================
// Utility: Fetch with Timeout
// ============================================================================

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = API_TIMEOUT,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    console.log('[Sheets API] Sending request to:', url);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    console.log('[Sheets API] Response status:', response.status);
    return response;
  } catch (error) {
    console.error('[Sheets API] Fetch error:', error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================================================
// Utility: Safe JSON Parsing
// ============================================================================

function safeParseJSON<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

// ============================================================================
// Utility: API Call Handler
// ============================================================================

async function callAppsScript<T>(
  payload: unknown,
): Promise<{ success: boolean; data?: T; error?: ApiError }> {
  // Use same-origin server proxy to avoid CORS issues
  const url = '/api/sheets';

  try {
    console.log('[Sheets API] ====== NEW REQUEST ======');
    console.log('[Sheets API] Calling action:', { action: (payload as any)?.action });

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('[Sheets API] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Sheets API] ❌ ERROR: Response not OK', { status: response.status, errorText });

      return {
        success: false,
        error: {
          code: `HTTP_${response.status}`,
          message: `API request failed with status ${response.status}`,
          details: errorText,
        },
      };
    }

    const text = await response.text();
    console.log('[Sheets API] Response text:', text);

    const data = safeParseJSON<T>(text);

    if (!data) {
      console.error('[Sheets API] ❌ ERROR: Failed to parse response as JSON:', text);
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: 'Failed to parse API response',
          details: text,
        },
      };
    }

    console.log('[Sheets API] ✅ SUCCESS:', data);
    console.log('[Sheets API] ====== END REQUEST ======');
    return {
      success: true,
      data,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('[Sheets API] ❌ ERROR: Request timeout');
        return {
          success: false,
          error: {
            code: 'TIMEOUT',
            message: 'API request timed out',
          },
        };
      }

      console.error('[Sheets API] ❌ ERROR: Network error:', error.message);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error.message || 'Network error occurred',
        },
      };
    }

    console.error('[Sheets API] ❌ ERROR: Unknown error:', error);
    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
      },
    };
  }
}

// ============================================================================
// Public API Functions
// ============================================================================

/**
 * Create or update user in the database
 * Called when user submits the registration form
 */
export async function createUser(
  data: {
    name: string;
    number: string;
    email: string;
    city: string;
    classStatus: string;
    stream: string;
  },
): Promise<{ success: boolean; error?: ApiError }> {
  const result = await callAppsScript<{ success: boolean }>({
    action: 'createUser',
    ...data,
  });

  return {
    success: result.success && (result.data?.success ?? false),
    error: result.error,
  };
}

/**
 * Check if user has attempts remaining
 * Returns allowed=false if user has already used 2 attempts
 * Called BEFORE OTP verification
 */
export async function checkAttempts(
  number: string,
): Promise<{ success: boolean; allowed: boolean; attempts?: number; error?: ApiError }> {
  const result = await callAppsScript<CheckUserResponse>({
    action: 'checkAttempts',
    number,
  });

  if (!result.success) {
    return {
      success: false,
      allowed: false,
      error: result.error,
    };
  }

  return {
    success: true,
    allowed: result.data?.allowed ?? false,
    attempts: result.data?.attempts,
  };
}

/**
 * Verify user, create/update row, and increment attempt count
 * Called AFTER successful OTP verification
 * If new user: creates row with verified=true, attempt_count=1
 * If existing user: updates row with latest details, sets verified=true, increments attempt_count
 * Backend blocks user if attempts >= 2 after increment
 */
export async function verifyUser(
  data: {
    number: string;
    name: string;
    city: string;
    classStatus: string;
    stream: string;
    email: string;
  },
): Promise<{ success: boolean; attempts?: number; error?: ApiError }> {
  const result = await callAppsScript<VerifyUserResponse>({
    action: 'verifyUser',
    ...data,
  });

  return {
    success: result.success && (result.data?.success ?? false),
    attempts: result.data?.attempts,
    error: result.error,
  };
}

/**
 * Submit exam results
 * Called after exam completion
 * Backend automatically stores attempt 1 and attempt 2 scores
 */
export async function submitExam(
  data: Omit<SubmitExamPayload, 'action'>,
): Promise<{ success: boolean; error?: ApiError }> {
  const result = await callAppsScript<SubmitExamResponse>({
    action: 'submitExam',
    ...data,
  });

  return {
    success: result.success && (result.data?.success ?? false),
    error: result.error,
  };
}
