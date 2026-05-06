# Deployment Quick Reference

## Prerequisites
- Google Apps Script backend deployed with 3 endpoints:
  - `checkUser` action
  - `verifyUser` action  
  - `submitExam` action

## Environment Setup

### Step 1: Configure .env.local
```bash
# Required variable
NEXT_PUBLIC_SHEETS_API_URL=https://script.google.com/macros/d/YOUR_SCRIPT_ID/usurp
```

Replace `YOUR_SCRIPT_ID` with your Apps Script deployment ID.

### Step 2: Verify Apps Script Endpoints

Your Apps Script must accept POST requests with these payloads:

**1. Check User Attempts**
```javascript
Request: {
  "action": "checkUser",
  "number": "9999999999"
}

Response: {
  "allowed": true/false,
  "attempts": 0,
  "message": "Optional message"
}
```

**2. Verify User**
```javascript
Request: {
  "action": "verifyUser",
  "name": "John Doe",
  "number": "9999999999",
  "city": "Mumbai",
  "classStatus": "student",
  "stream": "PCM",
  "email": "john@example.com"
}

Response: {
  "success": true,
  "message": "User verified",
  "userId": "optional-id"
}
```

**3. Submit Exam**
```javascript
Request: {
  "action": "submitExam",
  "number": "9999999999",
  "totalMarks": 240,
  "maths": 80,
  "physics": 75,
  "chemistry": 85
}

Response: {
  "success": true,
  "message": "Exam submitted successfully"
}
```

## Build & Deploy

### Local Testing
```bash
# Install dependencies
pnpm install

# Build production bundle
pnpm build

# Run production server
pnpm start

# Visit: http://localhost:3000
```

### Production Deployment
```bash
# Build
pnpm build

# Deploy to your host (Vercel, Railway, etc.)
# Or run: pnpm start
```

## End-to-End Testing Flow

### Test 1: Complete Exam Attempt
1. Navigate to landing page
2. Enter valid form data
3. Submit → Should proceed to OTP
4. Enter valid OTP (format: 6 digits)
5. Should verify and redirect to instructions
6. Click "Start Exam" → Opens exam page
7. Answer questions across all sections
8. Submit exam → Should show results

### Test 2: Blocked User
1. Create test user with 2 attempts in Google Sheet
2. Navigate to landing page
3. Enter user's phone number
4. Submit form → Should show blocking UI
5. Message: "You have already used your maximum 2 attempts"

### Test 3: Form Validation
1. Try to submit with empty fields → Show required errors
2. Try with invalid phone (9 digits) → Show phone error
3. Try with invalid email → Show email error
4. Try with invalid stream → Show stream error
5. All errors should be field-specific

### Test 4: API Error Handling
1. Disable internet → Should show network error
2. With invalid Apps Script URL → Should show API error
3. With malformed response → Should handle gracefully

### Test 5: Session Persistence
1. Complete verification
2. Refresh page → User should remain verified
3. Close browser and reopen → Session should persist
4. Complete exam → Should appear in Google Sheet

## Troubleshooting

### Issue: "Failed to parse API response"
- Check Apps Script returns valid JSON
- Verify response structure matches expected format
- Check browser console for detailed error

### Issue: "API request timed out"
- Check network connectivity
- Verify Apps Script deployment is accessible
- Check Apps Script execution logs

### Issue: Form validation errors persist
- Clear browser cache/localStorage
- Check validation.ts for correct rules
- Verify form field names match validation

### Issue: User data not saving to Google Sheet
- Check Apps Script deployment ID in .env.local
- Verify Google Sheet is accessible
- Check Apps Script execution logs
- Verify sheet formula/script is correctly configured

### Issue: OTP not being sent
- This requires backend implementation (not frontend)
- Verify Apps Script sends OTP via email/SMS
- Check backend logs for OTP sending errors

## Monitoring & Logs

### Frontend Logs
- Check browser console for JavaScript errors
- Check Network tab for API calls and responses
- localStorage inspection in DevTools

### Backend Monitoring
- Check Google Apps Script execution logs
- Monitor Google Sheet for new submissions
- Set up alerts for errors

## Performance Metrics

- API timeout: 30 seconds
- Form validation: <100ms
- Exam submission: <5 seconds (depends on network)
- Session storage: <1KB per user

## Security Checklist

- [ ] NEXT_PUBLIC_SHEETS_API_URL configured
- [ ] Apps Script validates all input data
- [ ] Phone number used as unique ID
- [ ] Attempt limiting enforced on backend
- [ ] OTP verification required
- [ ] HTTPS enabled for production
- [ ] CORS properly configured
- [ ] No sensitive data in localStorage

## Success Indicators

✅ Landing page loads without errors
✅ Form validation works on all fields
✅ API calls complete without timeout
✅ Verified user can access exam
✅ Exam submission saves to Google Sheet
✅ Blocking UI works for 2-attempt users
✅ Error messages are helpful and clear
✅ Loading states display during API calls

## Support

For issues:
1. Check browser console for errors
2. Inspect Network tab for API responses
3. Review Apps Script execution logs
4. Verify .env.local configuration
5. Check that Google Sheet structure matches expected format

---
Build Date: 2024-05-06
Last Updated: 2024-05-06
Status: Production Ready ✅
