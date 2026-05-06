/**
 * Form Validation Utilities
 * Validates user input for the exam platform
 */

export interface ValidationError {
  field: string;
  message: string;
}

// ============================================================================
// Validators
// ============================================================================

/**
 * Validate Indian mobile number
 * Accepts 10 digits starting with 6-9
 */
export function validateIndianPhone(phone: string): { valid: boolean; error?: string } {
  const cleaned = phone.replace(/\D/g, '');

  if (!cleaned) {
    return { valid: false, error: 'Phone number is required' };
  }

  if (cleaned.length !== 10) {
    return { valid: false, error: 'Phone number must be exactly 10 digits' };
  }

  if (!/^[6-9]/.test(cleaned)) {
    return { valid: false, error: 'Phone number must start with 6, 7, 8, or 9' };
  }

  return { valid: true };
}

/**
 * Validate email address
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || !email.trim()) {
    return { valid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true };
}

/**
 * Validate non-empty string
 */
export function validateRequired(
  value: string,
  fieldName: string,
): { valid: boolean; error?: string } {
  if (!value || !value.trim()) {
    return { valid: false, error: `${fieldName} is required` };
  }

  return { valid: true };
}

/**
 * Validate class status
 */
export function validateClassStatus(value: string): { valid: boolean; error?: string } {
  const validStatuses = ['student', 'other'];

  if (!value || !validStatuses.includes(value.toLowerCase())) {
    return { valid: false, error: 'Please select a valid class status' };
  }

  return { valid: true };
}

/**
 * Validate stream
 */
export function validateStream(value: string): { valid: boolean; error?: string } {
  const validStreams = ['PCM', 'PCB', 'BOTH'];

  if (!value || !validStreams.includes(value.toUpperCase())) {
    return { valid: false, error: 'Please select a valid stream' };
  }

  return { valid: true };
}

// ============================================================================
// Form Validation
// ============================================================================

export interface FormData {
  name?: string;
  number?: string;
  city?: string;
  classStatus?: string;
  stream?: string;
  email?: string;
}

export function validateForm(data: FormData): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  // Name
  const nameValidation = validateRequired(data.name || '', 'Name');
  if (!nameValidation.valid) {
    errors.push({ field: 'name', message: nameValidation.error! });
  }

  // Phone
  const phoneValidation = validateIndianPhone(data.number || '');
  if (!phoneValidation.valid) {
    errors.push({ field: 'number', message: phoneValidation.error! });
  }

  // City
  const cityValidation = validateRequired(data.city || '', 'City');
  if (!cityValidation.valid) {
    errors.push({ field: 'city', message: cityValidation.error! });
  }

  // Class Status
  const classStatusValidation = validateClassStatus(data.classStatus || '');
  if (!classStatusValidation.valid) {
    errors.push({ field: 'classStatus', message: classStatusValidation.error! });
  }

  // Stream
  const streamValidation = validateStream(data.stream || '');
  if (!streamValidation.valid) {
    errors.push({ field: 'stream', message: streamValidation.error! });
  }

  // Email
  const emailValidation = validateEmail(data.email || '');
  if (!emailValidation.valid) {
    errors.push({ field: 'email', message: emailValidation.error! });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get error message for a specific field
 */
export function getFieldError(errors: ValidationError[], fieldName: string): string | undefined {
  return errors.find((err) => err.field === fieldName)?.message;
}
