# Quick Start Guide - Silicon Teklogic Conclave Quiz Portal

## First-Time Setup (Admin)

### Step 1: Access Admin Dashboard
1. Open the application in your browser
2. You'll be directed to the admin login page (or navigate to `/admin`)
3. Click **"Login with Internet Identity"**
4. Complete the Internet Identity authentication process
5. Enter admin password: `admin123`
6. Click **"Access Admin Dashboard"**

### Step 2: Add Participant Emails
1. In the Admin Dashboard, click the **"Emails"** tab
2. Enter participant email addresses one by one
3. Click **"Add Email"** for each
4. Only these whitelisted emails can register for the quiz

**Tip**: You can search for specific emails using the search box.

### Step 3: Add Questions to Question Bank
1. Click the **"Questions"** tab
2. Click **"Add Question"** button
3. Fill in the question details:
   - **Question Text**: The actual question
   - **Type**: Choose "Multiple Choice" or "Short Answer"
   - **Round**: Enter round number (1, 2, 3, etc.)
   - **Subject**: Enter subject name (Physics, Math, CS, etc.)
   - **Options** (MCQ only): Enter at least 2 options
   - **Correct Answer**: Enter the exact correct answer
4. Click **"Add Question"**
5. Repeat to add more questions (aim for 50+ questions for good variety)

**Tip**: You can filter questions by Round or Subject using the dropdown filters.

### Step 4: Test the System
1. Add your own email to the whitelist
2. Open a new browser window/tab (or use incognito mode)
3. Navigate to `/register`
4. Register with your test email
5. Take the quiz to test the flow
6. Check results page
7. Return to admin dashboard to verify submission appears

### Step 5: Monitor During Event
1. Keep the **"Participants"** tab open to see registrations in real-time
2. Use the **"Leaderboard"** tab to track top performers
3. After the quiz period ends, click **"Export to Excel"** to download results

---

## Participant Instructions

### How to Register and Take the Quiz

1. **Navigate to Registration Page**
   - Go to `/register` or use the provided link
   - Your email must be pre-approved by the admin

2. **Fill Registration Form**
   - Name
   - Registration Number (must be unique)
   - Email (must be on whitelist)
   - College

3. **Start Quiz**
   - After successful registration, you'll be automatically redirected to the quiz
   - You'll see a 30-minute countdown timer
   - 20 random questions will be presented

4. **Answer Questions**
   - Click on question numbers to jump to any question
   - For MCQ: Select one option
   - For Short Answer: Type your answer
   - Questions turn green when answered
   - Current question is highlighted in blue

5. **Submit Quiz**
   - Click **"Submit Quiz"** when ready
   - Or wait for auto-submit when timer reaches 0
   - Confirm your submission

6. **View Results**
   - Your score will be displayed immediately
   - See correct vs incorrect answers
   - Check your performance badge

**Important**: 
- You can only take the quiz once
- Make sure to answer all questions before submitting
- The quiz auto-submits when time runs out

---

## Admin Quick Reference

### Default Credentials
- **Password**: `admin123`
- **Access**: Must login with Internet Identity first

### Key Actions

| Action | Location | Notes |
|--------|----------|-------|
| Add participant email | Emails tab | Required before registration |
| Add question | Questions tab | Need 20+ for one full quiz |
| View submissions | Participants tab | Real-time updates |
| Check rankings | Leaderboard tab | Sorted by score |
| Export results | Top-right button | Downloads .xlsx file |
| Edit question | Questions tab → Edit button | Updates existing question |
| Delete question | Questions tab → Delete button | Permanent deletion |
| Remove email | Emails tab → Remove button | Revokes access |

### Question Bank Best Practices

- **Minimum**: 20 questions (for one unique quiz)
- **Recommended**: 50-100 questions (for variety)
- **Optimal**: 100+ questions (ensures each participant gets unique set)

### Question Types

**Multiple Choice (MCQ)**:
- Add 2-6 options
- One correct answer
- Options are shuffled for participants

**Short Answer**:
- Free text input
- Case-insensitive matching
- Must match exactly (spaces/punctuation matter)

### Organizing Questions

- **By Round**: Use for different quiz rounds (Round 1, 2, 3)
- **By Subject**: Use for categorization (Physics, Math, CS)
- Filter combinations help you review specific question sets

### During the Event

1. **Monitor Registrations**: 
   - Watch Participants tab for new registrations
   - Ensure all expected participants have registered

2. **Track Progress**:
   - Check submission count vs registration count
   - See who hasn't submitted yet

3. **Leaderboard**:
   - Display on projector for live rankings (optional)
   - Top 3 automatically highlighted

4. **Post-Event**:
   - Export results to Excel
   - Share with organizers
   - Keep backup of question bank

---

## Troubleshooting

### Participant Can't Register
- **Check**: Is their email in the whitelist?
- **Check**: Is registration number unique?
- **Fix**: Add email to whitelist or use different registration number

### No Questions Appearing in Quiz
- **Check**: Are there questions in the question bank?
- **Fix**: Admin must add at least 20 questions

### Timer Not Starting
- **Check**: Browser JavaScript enabled?
- **Fix**: Refresh page or try different browser

### Excel Export Not Working
- **Check**: Browser popup blocker?
- **Fix**: Allow downloads from the site

### Admin Can't Login
- **Check**: Completed Internet Identity authentication?
- **Check**: Entered correct password (`admin123`)?
- **Fix**: Try logging out of Internet Identity and logging back in

---

## Tips for Success

### Before the Event
- [ ] Test the complete flow with dummy data
- [ ] Add all participant emails to whitelist
- [ ] Prepare question bank (50+ questions recommended)
- [ ] Verify all questions have correct answers
- [ ] Test on different devices (desktop, mobile, tablet)
- [ ] Share registration link with participants

### During the Event
- [ ] Keep admin dashboard open for monitoring
- [ ] Have backup contact method for participant issues
- [ ] Monitor submission count vs registration count
- [ ] Be ready to help with technical issues

### After the Event
- [ ] Export results immediately
- [ ] Verify all expected submissions are recorded
- [ ] Share results with relevant stakeholders
- [ ] Archive question bank for future events

---

## Customization Options

### Change Quiz Duration
Edit `QuizPage.tsx`, line 17:
```typescript
const QUIZ_DURATION = 30 * 60; // Change 30 to desired minutes
```

### Change Number of Questions
Edit `QuizPage.tsx`, line 18:
```typescript
const QUESTION_COUNT = 20; // Change to desired count
```

### Change Admin Password
Edit `AdminDashboard.tsx`, line ~130:
```typescript
if (adminPassword !== 'admin123') { // Change 'admin123' to new password
```

### Change Event Name/Logo
Edit `Header.tsx` to update logo path and event name styling

---

## Support

For questions or issues:
1. Check this guide first
2. Review the main README (QUIZ_PORTAL_README.md)
3. Check browser console for error messages
4. Verify Internet Computer canister is running

---

**Event**: Silicon Teklogic Conclave  
**Platform**: Internet Computer (Web3)  
**Built with**: caffeine.ai

Good luck with your quiz event! 🎓✨
