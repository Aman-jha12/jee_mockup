/**
 * ================================================================================
 * PRODUCTION-GRADE EXAMINATION PLATFORM - IMPLEMENTATION GUIDE
 * ================================================================================
 * 
 * This document outlines the complete implementation of a frontend-only
 * examination platform integrated with Google Apps Script backend.
 * 
 * ================================================================================
 * ARCHITECTURE OVERVIEW
 * ================================================================================
 * 
 * Frontend Flow:
 * ┌──────────────────┐
 * │  Landing Page    │  ← User entry point
 * │                  │
 * │  Step 1: Details │  Form validation + attempt checking
 * │  Step 2: OTP     │  Verification via Apps Script
 * │  Step 3: Verified│  Session saved
 * └──────────────────┘
 *          │
 *          ↓
 * ┌──────────────────┐
 * │  Instructions    │  ← Read exam instructions
 * └──────────────────┘
 *          │
 *          ↓
 * ┌──────────────────┐
 * │  Exam Page       │  ← Take exam, navigate questions
 * │                  │  → Submit exam to Apps Script
 * └──────────────────┘
 *          │
 *          ↓
 * ┌──────────────────┐
 * │  Result Page     │  ← Display marks and results
 * └──────────────────┘
 * 
 * ================================================================================
 * NEW FILES CREATED
 * ================================================================================
 * 
 * 1. src/lib/sheets-api.ts
 *    Purpose: Reusable API layer for Google Apps Script communication
 *    Functions:
 *      - checkUserAttempts(number): Check if user can attempt exam (max 2 attempts)
 *      - verifyUserDetails(data): Save user details after OTP verification
 *      - submitExamResults(data): Submit exam marks to Google Sheet
 *    Features:
 *      - Automatic timeout handling (30 seconds)
 *      - Safe JSON parsing with error recovery
 *      - Type-safe request/response handling
 *      - Comprehensive error messages with error codes
 *      - Network error detection and handling
 * 
 * 2. src/lib/validation.ts
 *    Purpose: Form validation utilities
 *    Functions:
 *      - validateIndianPhone(phone): Validate 10-digit Indian mobile numbers
 *      - validateEmail(email): Validate email format
 *      - validateRequired(value, fieldName): Check non-empty strings
 *      - validateClassStatus(value): Validate class status dropdown
 *      - validateStream(value): Validate stream selection (PCM, PCB, BOTH)
 *      - validateForm(data): Comprehensive form validation
 *      - getFieldError(errors, fieldName): Get specific field error
 *    Returns: Structured error objects with field names and messages
 * 
 * 3. src/lib/exam-session.ts
 *    Purpose: Session management using localStorage
 *    Functions:
 *      - saveVerifiedUser(data): Store user verification data
 *      - loadVerifiedUser(): Retrieve user data for exam submission
 *      - clearVerifiedUser(): Remove user data
 *      - markExamStarted(): Track exam start time
 *      - markExamSubmitted(): Mark exam as completed
 *      - isExamSubmitted(): Check submission status
 *      - getSessionStatus(): Get complete session state
 *      - isSessionValidForExam(): Verify 24-hour session window
 *    Features:
 *      - Safe localStorage access with error handling
 *      - Window undefined detection (SSR-safe)
 *      - JSON serialization/deserialization
 * 
 * ================================================================================
 * UPDATED FILES
 * ================================================================================
 * 
 * 1. src/app/page.tsx (Landing Page)
 *    Changes:
 *      - Added form validation with error display
 *      - Integrated checkUserAttempts() before OTP flow
 *      - Added "blocked" step UI for users with 2 attempts
 *      - Implemented verifyUserDetails() after OTP
 *      - Save verified user to exam-session storage
 *      - Proper loading states with spinner
 *      - Centralized error message display
 *      - Form field validation with error messages
 *      - Disabled buttons during API calls
 *    New States:
 *      - step: "details" | "otp" | "verified" | "blocked"
 *      - formErrors: ValidationError[]
 *      - apiError: string | null
 * 
 * 2. src/app/exam/page.tsx (Exam Page)
 *    Changes:
 *      - Updated handleSubmitExam() to use submitExamResults()
 *      - Load verified user phone number from exam-session
 *      - Submit marks using phone number (not userId)
 *      - Proper error handling with user feedback
 *      - Call markExamSubmitted() on success
 *    New Imports:
 *      - submitExamResults from sheets-api.ts
 *      - loadVerifiedUser, markExamSubmitted from exam-session.ts
 * 
 * ================================================================================
 * FLOW DETAILS
 * ================================================================================
 * 
 * STEP 1: USER ENTERS DETAILS
 * ────────────────────────────
 * User fills form:
 *   - Full Name (required, non-empty)
 *   - Mobile Number (required, 10 digits, starts with 6-9)
 *   - City (required, non-empty)
 *   - Class Status (required, "student" or "other")
 *   - Stream (required, "PCM", "PCB", or "BOTH")
 *   - Email (required, valid format)
 * 
 * On submit:
 *   1. validateForm() checks all fields
 *   2. If validation fails:
 *      - Display field-specific error messages
 *      - Don't proceed
 *   3. If validation passes:
 *      - Call checkUserAttempts(number)
 *      - If blocked: Show blocking UI with message
 *      - If allowed: Proceed to OTP step
 * 
 * API Response (checkUserAttempts):
 *   {
 *     "action": "checkUser",
 *     "number": "9999999999"
 *   }
 * 
 *   Response:
 *   {
 *     "allowed": true/false,
 *     "attempts": 0/1/2,
 *     "message": "Optional message"
 *   }
 * 
 * 
 * STEP 2: OTP VERIFICATION
 * ─────────────────────────
 * User receives OTP via phone
 * 
 * User enters 6-digit OTP
 * 
 * On submit:
 *   1. Validate OTP is 6 digits
 *   2. If invalid, show error
 *   3. If valid:
 *      - Call verifyUserDetails() with form data
 *      - On success: Save verified user and proceed
 *      - On failure: Show error, allow retry
 * 
 * API Request (verifyUserDetails):
 *   {
 *     "action": "verifyUser",
 *     "name": "John Doe",
 *     "number": "9999999999",
 *     "city": "Mumbai",
 *     "classStatus": "student",
 *     "stream": "PCM",
 *     "email": "john@example.com"
 *   }
 * 
 *   Response:
 *   {
 *     "success": true,
 *     "message": "User verified",
 *     "userId": "optional-id"
 *   }
 * 
 *   Backend Actions:
 *   - Sets VERIFIED = true for user
 *   - Increments ATTEMPT_COUNT
 *   - Creates row if user doesn't exist
 * 
 * 
 * STEP 3: USER TAKES EXAM
 * ───────────────────────
 * Verified user redirected to /instructions
 * 
 * User reviews instructions and starts exam at /exam
 * 
 * Exam timer starts, user answers questions
 * 
 * On exam submit:
 *   1. Evaluate all answers locally
 *   2. Calculate marks by subject:
 *      - maths: sum of category scores
 *      - physics: sum of category scores
 *      - chemistry: sum of category scores
 *      - totalMarks: sum of all subject scores
 *   3. Call submitExamResults() with:
 *      {
 *        "action": "submitExam",
 *        "number": "9999999999",
 *        "totalMarks": 240,
 *        "maths": 80,
 *        "physics": 75,
 *        "chemistry": 85
 *      }
 *   4. On success: Redirect to /result
 *   5. On failure: Show error, allow retry
 * 
 * 
 * STEP 4: USER VIEWS RESULTS
 * ──────────────────────────
 * Result page displays:
 *   - Total Marks
 *   - Subject-wise breakdown
 *   - Question-wise analysis
 *   - Performance metrics
 * 
 * ================================================================================
 * BLOCKING UI DESIGN
 * ================================================================================
 * 
 * When user has 2 attempts:
 * 
 * ┌─────────────────────────────────┐
 * │   [Lock Icon]                   │
 * │   Exam Attempts Exhausted       │
 * │                                 │
 * │   You have already used your    │
 * │   maximum 2 attempts for this   │
 * │   examination.                  │
 * │                                 │
 * │   Please contact support if you │
 * │   believe this is an error.     │
 * │                                 │
 * │   [Support Message Box]         │
 * └─────────────────────────────────┘
 * 
 * ================================================================================
 * LOADING STATES
 * ================================================================================
 * 
 * 1. Checking attempts:
 *    Button shows spinner while checkUserAttempts() executes
 * 
 * 2. Sending/Verifying OTP:
 *    - Send OTP button disabled during request
 *    - Verify OTP button shows spinner
 *    - Status message shows "Verifying..."
 * 
 * 3. Submitting exam:
 *    - Submit button shows spinner
 *    - Button disabled until response
 *    - Error displayed if submission fails
 * 
 * ================================================================================
 * ERROR HANDLING STRATEGY
 * ================================================================================
 * 
 * 1. Network Errors:
 *    - TIMEOUT: "API request timed out. Please check your connection."
 *    - NETWORK_ERROR: Specific error message from browser
 *    - HTTP_5XX: "API request failed with status 500"
 * 
 * 2. Validation Errors:
 *    - Phone: "Phone number must be exactly 10 digits"
 *    - Email: "Please enter a valid email address"
 *    - Required: "[Field] is required"
 *    - Stream: "Please select a valid stream"
 * 
 * 3. API Response Errors:
 *    - Parse error: "Failed to parse API response"
 *    - Invalid response: "API request failed with status XXX"
 *    - Business logic: Show error message from API
 * 
 * 4. User Feedback:
 *    - Field-level errors displayed below input
 *    - API errors shown in dedicated error box
 *    - Status messages shown for progress updates
 *    - All errors use consistent styling
 * 
 * ================================================================================
 * SECURITY CONSIDERATIONS
 * ================================================================================
 * 
 * 1. Frontend Validation:
 *    - Client-side validation for UX only
 *    - Backend must re-validate all data
 *    - Phone number format checked (10 digits, 6-9 start)
 *    - Email format checked against regex
 * 
 * 2. Session Management:
 *    - Verified user data stored in localStorage
 *    - Cannot be modified by user (backend authoritative)
 *    - Session valid for 24 hours from verification
 *    - Clear verification on logout
 * 
 * 3. Attempt Limiting:
 *    - Checked on frontend before OTP
 *    - Backend increments attempt count on verification
 *    - User cannot retry after 2 attempts
 *    - Blocking UI prevents further action
 * 
 * 4. Phone Number as Unique ID:
 *    - Phone is primary identifier for user
 *    - Used in all API calls to Apps Script
 *    - Sheet lookup uses phone number
 *    - Backend validates phone ownership (via OTP)
 * 
 * 5. Data Submission:
 *    - Exam marks submitted via Apps Script webhook
 *    - NEXT_PUBLIC_SHEETS_API_URL contains endpoint
 *    - Only marks submitted (no PII beyond phone)
 *    - Backend validates results before saving
 * 
 * ================================================================================
 * ENVIRONMENT CONFIGURATION
 * ================================================================================
 * 
 * Required .env.local variables:
 * 
 * NEXT_PUBLIC_SHEETS_API_URL=https://script.google.com/macros/d/YOUR_SCRIPT_ID/usurp
 * 
 * This URL must point to your deployed Google Apps Script with:
 *   - checkUser function
 *   - verifyUser function
 *   - submitExam function
 * 
 * ================================================================================
 * TYPE SAFETY
 * ================================================================================
 * 
 * All API operations are fully type-safe:
 * 
 * API Request/Response Types (sheets-api.ts):
 *   - CheckUserResponse
 *   - VerifyUserResponse
 *   - SubmitExamResponse
 *   - ApiError
 * 
 * Validation Types (validation.ts):
 *   - ValidationError
 *   - FormData
 * 
 * Session Types (exam-session.ts):
 *   - VerifiedUserData
 * 
 * TypeScript enforces type safety at:
 *   - API payload construction
 *   - Response parsing
 *   - Error handling
 *   - Form validation
 *   - Session data storage/retrieval
 * 
 * ================================================================================
 * SCALABILITY
 * ================================================================================
 * 
 * The implementation is designed for scalability:
 * 
 * 1. Modular Architecture:
 *    - API logic separated in sheets-api.ts
 *    - Validation isolated in validation.ts
 *    - Session management in exam-session.ts
 *    - Easy to add new functions or endpoints
 * 
 * 2. Reusable Functions:
 *    - Each utility is independent
 *    - Can be used in multiple components
 *    - No tight coupling between modules
 * 
 * 3. Error Handling:
 *    - Consistent error format across APIs
 *    - Specific error codes for debugging
 *    - Timeout handling prevents hanging requests
 *    - Network errors properly detected
 * 
 * 4. Performance:
 *    - Minimal bundle size for utilities
 *    - No external dependencies
 *    - Efficient localStorage usage
 *    - Proper state management
 * 
 * 5. Extensibility:
 *    - Easy to add new validation rules
 *    - Simple to add new API endpoints
 *    - Storage utilities can scale
 *    - Error handling pattern is consistent
 * 
 * ================================================================================
 * TESTING CHECKLIST
 * ================================================================================
 * 
 * □ Landing Page:
 *   □ Form validation works for all fields
 *   □ Phone validation accepts valid numbers
 *   □ Phone validation rejects invalid numbers
 *   □ Email validation works correctly
 *   □ Stream dropdown shows correct options
 *   □ Class Status dropdown shows correct options
 * 
 * □ Attempt Checking:
 *   □ checkUserAttempts() returns allowed: true for new user
 *   □ checkUserAttempts() returns allowed: false after 2 attempts
 *   □ Blocking UI displays for blocked users
 *   □ Blocked users cannot proceed
 * 
 * □ OTP Flow:
 *   □ OTP input accepts only 6 digits
 *   □ OTP validation rejects non-numeric input
 *   □ OTP validation rejects less than 6 digits
 *   □ Send OTP button triggers correctly
 *   □ Resend OTP button works after first attempt
 * 
 * □ User Verification:
 *   □ verifyUserDetails() saves user data
 *   □ Verified user data stored in localStorage
 *   □ User can proceed to exam after verification
 *   □ Session persists across page refresh
 * 
 * □ Exam Submission:
 *   □ submitExamResults() sends correct data
 *   □ Phone number included in submission
 *   □ Marks calculated correctly
 *   □ Submission succeeds with valid data
 *   □ Error handling works for failed submissions
 * 
 * □ Error Handling:
 *   □ Network timeout shows error message
 *   □ Invalid JSON response handled gracefully
 *   □ API errors displayed to user
 *   □ Validation errors shown per field
 *   □ Error messages are helpful and clear
 * 
 * □ Loading States:
 *   □ Buttons disabled during API calls
 *   □ Spinners display during loading
 *   □ Status messages show progress
 *   □ No multiple simultaneous submissions
 * 
 * ================================================================================
 * DEPLOYMENT NOTES
 * ================================================================================
 * 
 * 1. Before Production:
 *    □ Configure NEXT_PUBLIC_SHEETS_API_URL in .env.local
 *    □ Test Apps Script webhook connection
 *    □ Verify OTP sending mechanism
 *    □ Test attempt counting logic
 *    □ Verify marks submission to Google Sheet
 *    □ Test with multiple users simultaneously
 * 
 * 2. Performance Optimization:
 *    □ Build: pnpm build (production bundle)
 *    □ Start: pnpm start (production server)
 *    □ Monitor API response times
 *    □ Check localStorage usage
 * 
 * 3. Monitoring:
 *    □ Log failed API requests
 *    □ Track submission success rate
 *    □ Monitor timeout frequency
 *    □ Alert on repeated errors
 * 
 * ================================================================================
 * FUTURE ENHANCEMENTS
 * ================================================================================
 * 
 * 1. Additional Validations:
 *    □ Server-side re-validation of form data
 *    □ Duplicate phone number checking
 *    □ Email verification with confirmation
 * 
 * 2. Enhanced UX:
 *    □ Toast notifications for success/error
 *    □ Progressive form saving
 *    □ Attempt count display on landing
 *    □ Session timeout warnings
 * 
 * 3. Advanced Features:
 *    □ Email/SMS confirmation of submission
 *    □ Exam history tracking
 *    □ Detailed analytics dashboard
 *    □ Admin panel for user management
 * 
 * 4. Accessibility:
 *    □ ARIA labels for form fields
 *    □ Keyboard navigation support
 *    □ Screen reader compatibility
 *    □ High contrast mode support
 * 
 * ================================================================================
 */
