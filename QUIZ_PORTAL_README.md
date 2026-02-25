# Silicon Teklogic Conclave Quiz Portal

A temporary quiz portal built for college technical events, supporting 200+ participants with an admin panel for managing questions and exporting results.

## Features

### 1. Participant Registration
- Email-based access control (admin-approved whitelist)
- Registration form with validation
- Prevents duplicate registration numbers
- Fields: Name, Registration Number, Email, College

### 2. Quiz Interface
- 20 randomly selected questions from question bank
- Support for MCQ and Short Answer questions
- 30-minute timer with auto-submit
- Question navigation panel showing attempted/unattempted status
- Cannot retake after submission

### 3. Results Page
- Immediate score display after submission
- Detailed breakdown with correct/incorrect answers
- Performance badge (Excellent/Good/Needs Improvement)
- Complete answer comparison table

### 4. Admin Dashboard
Protected by password (default: `admin123`)

**Features:**
- **Question Bank Manager**
  - Add, edit, delete questions
  - Support for MCQ and Short Answer types
  - Organize by round and subject
  - Filter questions by round/subject
  
- **Email Whitelist Manager**
  - Add/remove approved participant emails
  - Search functionality
  - Only whitelisted emails can register

- **Participant Dashboard**
  - View all registered participants
  - See scores and submission times
  - Track who has/hasn't attempted the quiz
  - Search by name or registration number

- **Leaderboard**
  - Ranked by score (highest to lowest)
  - Top 3 highlighted with trophy icons
  - Shows submission timestamps

- **Excel Export**
  - Download all participant data with scores
  - One-click export to `.xlsx` format
  - Includes: Name, Registration Number, Email, College, Score, Submission Time

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **UI Components**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS with custom OKLCH color system
- **Router**: TanStack Router
- **Backend**: Internet Computer (Motoko canister)
- **State Management**: React Query for server state
- **Forms**: react-hook-form
- **Notifications**: Sonner (toast)
- **Excel Export**: SheetJS (xlsx)

## Design System

### Color Palette
- **Background**: Light blue (`oklch(0.96 0.015 230)`)
- **Primary**: Deep blue for interactive elements
- **Accent**: Red for "SI" and "TE" branding emphasis
- **Semantic colors**: Green for correct answers, red for incorrect

### Branding
- **Event Name**: Silicon Teklogic Conclave
  - "SI" and "TE" highlighted in red
- **Logo**: VLSI circular logo (displayed in header)

## Routes

| Route | Description |
|-------|-------------|
| `/` or `/admin` | Admin Dashboard (password-protected) |
| `/register` | Participant Registration |
| `/quiz?regNo=XXX` | Quiz Taking Interface |
| `/results?regNo=XXX` | Results Display |

## Key Files

### Pages
- `src/frontend/src/pages/AdminDashboard.tsx` - Admin panel with all management features
- `src/frontend/src/pages/RegisterPage.tsx` - Registration form with email validation
- `src/frontend/src/pages/QuizPage.tsx` - Quiz interface with timer and navigation
- `src/frontend/src/pages/ResultsPage.tsx` - Score and answer breakdown

### Components
- `src/frontend/src/components/Header.tsx` - Shared header with logo and event name

### Utils
- `src/frontend/src/utils/excelExport.ts` - Excel export functionality
- `src/frontend/src/utils/questionRandomizer.ts` - Fisher-Yates shuffle for question selection

### Routing
- `src/frontend/src/App.tsx` - Main app with TanStack Router configuration

## Admin Access

1. Visit `/admin`
2. Click "Login with Internet Identity"
3. Complete Internet Identity authentication
4. Enter admin password: `admin123`
5. Click "Access Admin Dashboard"

## Quiz Flow

1. **Admin Setup**:
   - Add participant emails to whitelist
   - Add questions to question bank (organized by round/subject)

2. **Participant Registration**:
   - Visit `/register`
   - Fill form (system validates email against whitelist)
   - Redirected to quiz on successful registration

3. **Take Quiz**:
   - 20 random questions displayed
   - 30-minute timer countdown
   - Navigate between questions
   - Submit manually or auto-submit on timeout

4. **View Results**:
   - Immediate score display
   - Detailed answer comparison
   - No retake option

5. **Admin Review**:
   - View all submissions in Participant Dashboard
   - Check leaderboard
   - Export results to Excel

## Question Bank Structure

Each question contains:
- **Text**: The question content
- **Type**: MCQ or Short Answer
- **Options**: Array of choices (for MCQ only)
- **Correct Answer**: The right answer for scoring
- **Round**: Numeric round identifier (1, 2, 3...)
- **Subject**: Subject category (e.g., Physics, Math, CS)

## Random Question Selection

- System loads all available questions from backend
- Uses Fisher-Yates shuffle algorithm for true randomization
- Selects 20 unique questions per participant
- Each participant gets a different question order
- No two participants see questions in the same sequence

## Data Storage

All data is stored on the Internet Computer blockchain:
- Questions persist across sessions
- Participant registrations are permanent
- Quiz submissions are immutable
- Email whitelist is managed by admin

## Security Features

- Email whitelist prevents unauthorized access
- Internet Identity authentication for admin
- Password protection for admin dashboard
- Duplicate registration prevention
- One-time quiz submission (no retakes)

## Scoring System

- Each correct answer = 1 point
- Case-insensitive comparison for Short Answer questions
- Exact match with correct answer required
- Score calculated client-side, verified server-side
- Immediate feedback on submission

## Excel Export Format

Exported file contains:
- Name
- Registration Number
- Email
- College
- Score (out of 20)
- Submission Time (formatted as local datetime)

## Performance Considerations

- Questions loaded once per quiz session
- React Query caching for admin dashboard
- Optimized table rendering with ScrollArea
- Debounced search inputs
- Efficient state management

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-responsive design
- Touch-friendly navigation
- Optimized for phones and tablets

## Development Commands

```bash
# Type check
pnpm --filter '@caffeine/template-frontend' typescript-check

# Lint
pnpm --filter '@caffeine/template-frontend' lint

# Build
pnpm --filter '@caffeine/template-frontend' build:skip-bindings

# Dev server
pnpm --filter '@caffeine/template-frontend' start
```

## Customization

### Change Admin Password
Edit `AdminDashboard.tsx`, line ~130:
```typescript
if (adminPassword !== 'admin123') {
```

### Change Quiz Duration
Edit `QuizPage.tsx`, line ~17:
```typescript
const QUIZ_DURATION = 30 * 60; // 30 minutes in seconds
```

### Change Question Count
Edit `QuizPage.tsx`, line ~18:
```typescript
const QUESTION_COUNT = 20;
```

### Change Color Theme
Edit `src/frontend/index.css` to modify OKLCH color values

## Troubleshooting

### "Email not whitelisted" error
- Admin must add participant email to whitelist first
- Check spelling/capitalization of email

### "Registration number already exists"
- Each registration number must be unique
- Use a different registration number

### Questions not loading
- Admin must add questions to question bank first
- Check backend canister is deployed

### Timer not working
- Ensure JavaScript is enabled
- Check browser console for errors

### Excel export not downloading
- Check browser popup/download settings
- Ensure `xlsx` library is installed

## Future Enhancements (Not Implemented)

- Bulk email import from CSV
- Bulk question import from JSON/Excel
- Real-time leaderboard updates
- Email notifications for participants
- Detailed analytics dashboard
- Question categories/difficulty levels
- Timed per-question (not just overall)
- Image support in questions
- Multiple quiz sessions/rounds

## Footer

© 2026. Built with ❤️ using [caffeine.ai](https://caffeine.ai)

---

**Note**: This is a temporary quiz portal designed for 2-day college events. All data persists on the Internet Computer blockchain but can be cleared if needed.
