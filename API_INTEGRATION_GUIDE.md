# API Integration Examples & Testing Guide

## Overview
This guide shows exact request/response formats for integration with Google Apps Script.

---

## 1. CHECK USER ATTEMPTS

### Purpose
Verify if user has remaining attempts (max 2 per user)

### Frontend Code
```typescript
import { checkUserAttempts } from '@/lib/sheets-api'

const result = await checkUserAttempts('9999999999')

if (result.success) {
  if (result.allowed) {
    // Proceed to OTP
  } else {
    // Show blocking UI
  }
} else {
  // Show error: result.error?.message
}
```

### HTTP Request
```
POST https://script.google.com/macros/d/{SCRIPT_ID}/usurp
Content-Type: application/json

{
  "action": "checkUser",
  "number": "9999999999"
}
```

### Success Response
```json
{
  "allowed": true,
  "attempts": 0,
  "message": "You can proceed"
}
```

### Blocked Response
```json
{
  "allowed": false,
  "attempts": 2,
  "message": "Maximum attempts reached"
}
```

### Error Response (HTTP 500)
```json
{
  "error": "Database error",
  "code": "DB_ERROR"
}
```

### Frontend Error Handling
```typescript
// Network timeout (no response after 30s)
// error.code === 'TIMEOUT'
// error.message === 'API request timed out...'

// Network failure
// error.code === 'NETWORK_ERROR'
// error.message === 'Connection refused'

// Invalid JSON response
// error.code === 'PARSE_ERROR'
// error.message === 'Failed to parse API response'

// HTTP error
// error.code === 'HTTP_500'
// error.message === 'API request failed with status 500'
```

---

## 2. VERIFY USER

### Purpose
Save user details after OTP verification and create/update user record

### Frontend Code
```typescript
import { verifyUserDetails } from '@/lib/sheets-api'

const result = await verifyUserDetails({
  name: 'John Doe',
  number: '9999999999',
  city: 'Mumbai',
  classStatus: 'student',
  stream: 'PCM',
  email: 'john@example.com'
})

if (result.success) {
  // Save to exam-session
  saveVerifiedUser({
    name: 'John Doe',
    number: '9999999999',
    // ...rest of data
    userId: result.userId,
    verifiedAt: Date.now()
  })
  // Redirect to exam
} else {
  // Show error
}
```

### HTTP Request
```
POST https://script.google.com/macros/d/{SCRIPT_ID}/usurp
Content-Type: application/json

{
  "action": "verifyUser",
  "name": "John Doe",
  "number": "9999999999",
  "city": "Mumbai",
  "classStatus": "student",
  "stream": "PCM",
  "email": "john@example.com"
}
```

### Success Response
```json
{
  "success": true,
  "message": "User verified successfully",
  "userId": "user-12345"
}
```

### Backend Actions (Apps Script)
```javascript
// 1. Look up user by phone number in Google Sheet
// 2. If not found:
//    - Create new row with provided data
//    - Set VERIFIED = true
//    - Set ATTEMPT_COUNT = 1
// 3. If found:
//    - Update data fields
//    - Set VERIFIED = true
//    - Increment ATTEMPT_COUNT (if not already verified)
```

### Error Responses
```json
// Invalid phone format
{
  "success": false,
  "message": "Invalid phone number format"
}

// Database error
{
  "success": false,
  "message": "Failed to update user record"
}
```

---

## 3. SUBMIT EXAM

### Purpose
Submit exam marks to Google Sheet after exam completion

### Frontend Code
```typescript
import { submitExamResults } from '@/lib/sheets-api'
import { loadVerifiedUser } from '@/lib/exam-session'

const verifiedUser = loadVerifiedUser()

const result = await submitExamResults({
  number: verifiedUser.number,
  totalMarks: 240,
  maths: 80,
  physics: 75,
  chemistry: 85
})

if (result.success) {
  // Mark exam as submitted
  markExamSubmitted()
  // Redirect to results
  router.push('/result')
} else {
  // Show error: result.error?.message
}
```

### HTTP Request
```
POST https://script.google.com/macros/d/{SCRIPT_ID}/usurp
Content-Type: application/json

{
  "action": "submitExam",
  "number": "9999999999",
  "totalMarks": 240,
  "maths": 80.50,
  "physics": 75.25,
  "chemistry": 84.75
}
```

### Success Response
```json
{
  "success": true,
  "message": "Exam submitted successfully"
}
```

### Backend Actions (Apps Script)
```javascript
// 1. Look up user by phone number
// 2. Update exam marks columns:
//    - TOTAL_MARKS = 240
//    - MATHS = 80.50
//    - PHYSICS = 75.25
//    - CHEMISTRY = 84.75
// 3. Set SUBMITTED = true
// 4. Set SUBMISSION_TIME = timestamp
// 5. Return success response
```

### Error Responses
```json
// User not found
{
  "success": false,
  "message": "User not found in database"
}

// Invalid marks format
{
  "success": false,
  "message": "Invalid marks provided"
}

// Database error
{
  "success": false,
  "message": "Failed to save exam results"
}
```

---

## Testing with cURL

### Test 1: Check User Attempts
```bash
curl -X POST \
  https://script.google.com/macros/d/YOUR_SCRIPT_ID/usurp \
  -H 'Content-Type: application/json' \
  -d '{
    "action": "checkUser",
    "number": "9999999999"
  }'
```

### Test 2: Verify User
```bash
curl -X POST \
  https://script.google.com/macros/d/YOUR_SCRIPT_ID/usurp \
  -H 'Content-Type: application/json' \
  -d '{
    "action": "verifyUser",
    "name": "John Doe",
    "number": "9999999999",
    "city": "Mumbai",
    "classStatus": "student",
    "stream": "PCM",
    "email": "john@example.com"
  }'
```

### Test 3: Submit Exam
```bash
curl -X POST \
  https://script.google.com/macros/d/YOUR_SCRIPT_ID/usurp \
  -H 'Content-Type: application/json' \
  -d '{
    "action": "submitExam",
    "number": "9999999999",
    "totalMarks": 240,
    "maths": 80.50,
    "physics": 75.25,
    "chemistry": 84.75
  }'
```

---

## Google Sheet Structure

Recommended columns for the Google Sheet:

```
| A          | B        | C       | D       | E            | F      |
|------------|----------|---------|---------|--------------|--------|
| PHONE      | NAME     | EMAIL   | CITY    | CLASS_STATUS | STREAM |
| 9999999999 | John Doe | j@e.com | Mumbai  | student      | PCM    |

| G        | H       | I         | J           | K           | L              |
|----------|---------|-----------|-------------|-------------|----------------|
| VERIFIED | CREATED | SUBMITTED | TOTAL_MARKS | MATHS       | PHYSICS        |
| TRUE     | time    | time      | 240         | 80.50       | 75.25          |

| M           | N              | O            |
|-------------|----------------|-------------|
| CHEMISTRY   | ATTEMPT_COUNT  | LAST_ATTEMPT|
| 84.75       | 1              | timestamp   |
```

---

## Frontend Validation Rules

Before sending to API, frontend validates:

### checkUserAttempts
- Phone: 10 digits, starts with 6-9
- Already handled by form validation

### verifyUserDetails
- Name: non-empty, max 100 chars
- Number: 10 digits, starts with 6-9
- Email: valid format (RFC 5322 simplified)
- City: non-empty, max 50 chars
- ClassStatus: "student" or "other"
- Stream: "PCM", "PCB", or "BOTH"

### submitExamResults
- Number: 10 digits, starts with 6-9
- TotalMarks: 0-300 (within exam max)
- Maths: 0-100 (per subject max)
- Physics: 0-100
- Chemistry: 0-100

---

## Error Recovery

### If Submission Fails
```typescript
// Frontend catches error and displays to user
// User can retry by clicking Submit again
// No state is lost, form data preserved

// Backend should be idempotent:
// If resubmitted, should update record (not duplicate)
```

### If User Closes Browser Mid-Submission
```typescript
// Exam session saved in localStorage
// User can return to exam page
// Submit button still available for retry
```

### If Network Timeout (30s+)
```typescript
// Frontend shows: "API request timed out"
// User can retry after waiting
// No partial data sent to backend
```

---

## Success Metrics

Track these for monitoring:

```javascript
// Submission success rate
successful_submissions / total_attempts

// Average response time
sum(response_times) / count

// Error rate by type
- timeout_errors
- network_errors
- parse_errors
- http_errors
- validation_errors

// User flow completion
started / verified / submitted
```

---

## Example Workflow

### Complete User Journey
```
1. User lands on page
   POST /api/checkUser → {"allowed": true, "attempts": 0}
   ✅ Proceed to OTP

2. User verifies OTP
   POST /api/verifyUser → {"success": true, "userId": "123"}
   ✅ User saved, redirect to exam

3. User completes exam
   POST /api/submitExam → {"success": true}
   ✅ Results saved, show results page

4. Results displayed from localStorage marks
```

### Failed Journey
```
1. User lands on page
   POST /api/checkUser → {"allowed": false, "attempts": 2}
   ❌ Show blocking UI, flow stops

2. Alternative: Network error
   POST /api/checkUser → Network timeout after 30s
   ❌ Show "Connection error", allow retry
```

---

## Monitoring Endpoints

Recommended monitoring setup:

```javascript
// Log all API calls
console.log({
  timestamp: new Date(),
  action: 'checkUser',
  phone: '9999999999',
  response: { allowed: true, attempts: 0 },
  duration_ms: 234
})

// Track errors
console.error({
  timestamp: new Date(),
  action: 'submitExam',
  error: 'TIMEOUT',
  message: 'API request timed out...',
  duration_ms: 30000
})
```

---

## Local Development Testing

### Start dev server
```bash
pnpm dev
# Open http://localhost:3000
```

### Test with invalid Apps Script URL
```bash
# In .env.local
NEXT_PUBLIC_SHEETS_API_URL=https://invalid-url.com
# Should show proper error message
```

### Inspect localStorage
```javascript
// In browser console
localStorage.getItem('exam-verified-user')
localStorage.getItem('exam-submitted')
```

### Mock API responses
```typescript
// For testing without real backend
const mockCheckUser = async (number: string) => ({
  success: true,
  allowed: number !== '9999999999',
  attempts: 0
})
```

---

## Production Checklist

- [ ] Apps Script deployed and tested
- [ ] NEXT_PUBLIC_SHEETS_API_URL configured
- [ ] Google Sheet structure ready
- [ ] OTP mechanism implemented in backend
- [ ] Attempt limiting logic working
- [ ] Error logging in place
- [ ] Performance tested with multiple users
- [ ] Security review completed
- [ ] Rollback plan prepared
- [ ] Monitoring/alerting configured
