# 💪 WorkoutPlanner — Strength Progress Tracker

A browser-based workout tracker that logs training sessions, calculates estimated one-rep maxes using the Epley formula, and visualizes strength progress across every major muscle group. No account, no subscription, no server — everything runs in your browser.

**🔗 Live Site:** https://jordanhurd11.github.io/workout-tracker/

**📁 Repository:** https://github.com/jordanhurd11/workout-tracker

---

## What It Does

Most gym apps are bloated or require subscriptions. This tool is built for someone who lifts consistently and wants to see objective strength progress without any of that. You log your workouts, and the app does the math — calculating estimated 1RMs, tracking progress per muscle group, and showing you whether you're actually getting stronger over time.

---

## Features

### Dashboard
- **Start New Workout** — choose a saved template, start from a past workout, or build from scratch
- **Total Workouts & Week Streak** — tracks consistency over time
- **Total Exercise Progress %** — combined Epley 1RM percent increase across all exercises
- **Progress Chart** — neon green line chart of cumulative strength change over time (animates on hover)
- **Muscle Development Radar** — spider chart across 8 muscle groups with insights panel
- **Mini Calendar** — color-coded month view synced with the Calendar page
- **Workout History** — search, edit, export to CSV, or start again from any past workout

### Statistics Page
- **Percent Increase by Muscle Group** — per-muscle charts with exercise breakdowns
- **Weekly Volume Landmarks** — compares your weekly sets to research-based optimal ranges (10–20 for Chest, 14–22 for Legs, etc.) with coaching insights

### Calendar Page
- Plan future workouts with name, time, and exercises
- Color-coded calendar: green (completed), red (missed), blue (planned), grey (open)
- Click a planned workout to start it pre-loaded on the Dashboard

### Achievements Page
- **Personal Records** — best set per exercise based on Epley estimated 1RM
- **PR History Timeline** — shows every time a new record was set, with date and workout name

### Templates Page
- Create, edit, duplicate, and delete reusable workout routines
- Save any past workout as a template with one click
- Start a workout from a template — it pre-fills the form with today's date

---

## How to Use

1. Open the live site
2. Click **Start New Workout** on the Dashboard
3. Name your workout, pick today's date, then add exercises
4. For each exercise, select it from the searchable library, enter your sets, and fill in weight/reps (or reps only for bodyweight, or time for timed exercises like Plank)
5. Click **Save Workout** — stats, charts, and records update instantly
6. Use the **Calendar** to plan future sessions and the **Templates** page to save routines you repeat

---

## Exercise Types Supported

| Type | Input | Example |
|---|---|---|
| Weighted | Weight (lbs) + Reps | Bench Press, Squat |
| Bodyweight | Reps only | Crunch, Hanging Leg Raise |
| Timed | Minutes + Seconds | Plank, Side Plank |
| Optional Weighted | Toggle BW or + Weight | Pull-Up, Dips |

---

## Technical Concepts Used

**State management across multiple pages**
All workout data (`workoutTrackerData`), planned workouts (`plannedWorkoutsData`), and templates (`workoutTemplatesData`) are stored in `localStorage`. `sessionStorage` is used to pass data between pages (e.g., starting a template from the Templates page and landing on the Dashboard with it pre-loaded).

**Epley 1RM Formula**
`Estimated 1RM = weight × (1 + reps / 30)`
Used to calculate and compare strength across workouts. The highest 1RM from each exercise's first-ever session is the baseline; the most recent session's best 1RM is the current value.

**Canvas API for custom charts**
The progress chart, muscle development radar, and muscle group mini-charts are all drawn with the native Canvas API — no Chart.js or external libraries.

**`requestAnimationFrame` for animations**
The progress chart line draws itself left-to-right on hover. Stat counters animate from previous value to new value on every workout save.

**Dynamic DOM updates**
Every interaction re-renders the relevant section of the page with no page refresh. Event delegation handles dynamically generated content like exercise set inputs.

---

## Project Structure

```
workout-tracker/
├── index.html          # Dashboard
├── statistics.html     # Workout Statistics page
├── calendar.html       # Calendar page
├── achievements.html   # Achievements / Personal Records page
├── templates.html      # Workout Templates page
├── script.js           # All application logic (~4,000 lines, vanilla JS)
├── styles.css          # Core styling (dark theme)
├── ui-polish.css       # UI enhancements (animations, hover effects)
├── .nojekyll           # Prevents GitHub Pages from running Jekyll
├── PROPOSAL.md         # Project proposal
├── PRD.md              # Product Requirements Document
└── README.md           # This file
```

---

## What I Learned

- How to use the **Canvas API** to draw interactive charts and radar graphs without any libraries
- How to structure **localStorage** so multiple data types (workouts, templates, planned workouts) stay organized and remain backwards-compatible as the app evolves
- How to use **requestAnimationFrame** for smooth, performant animations
- How to manage **state across separate HTML pages** using `sessionStorage` to pass data between pages
- How to build a complete multi-page application with vanilla JavaScript — routing, state, and navigation handled entirely without a framework

---

Built with vanilla JavaScript, HTML, and CSS. No frameworks, no libraries, no server.
