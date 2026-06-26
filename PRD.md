# Product Requirements Document
## WorkoutPlanner — Strength Progress Tracker

---

### 1. Problem Statement

Gym-goers who lift weights have no simple, free, browser-based tool that tracks whether they are actually getting stronger over time. Existing apps are subscription-based, require accounts, or bury progress data behind paywalls. A person who trains regularly needs to know: *am I stronger than I was six weeks ago, and which muscles am I neglecting?*

---

### 2. Product Goal

Build a static, browser-only workout tracker that logs completed workouts, calculates estimated one-rep maxes using the Epley formula, and visualizes strength progress across every major muscle group — with no account, no server, and no cost.

---

### 3. Users

**Primary user:** A college-aged individual who lifts 3–5 times per week, tracks weights and reps in a notes app or by memory, and wants to see objective strength progress without a subscription.

---

### 4. Core User Stories

| As a user I want to… | So that… |
|---|---|
| Log a completed workout with exercises, sets, weight, and reps | I have a record of every training session |
| See my estimated one-rep max calculated automatically | I know my true strength without maxing out |
| Track progress for every muscle group as a percentage increase | I can identify which muscles are improving and which are stalling |
| Plan future workouts on a calendar | I never show up to the gym without a plan |
| See my personal records for every exercise and how they improved over time | I can visualize my long-term progress |
| Reuse past workouts or saved templates | I don't have to re-enter the same routine every week |
| Export my data to a spreadsheet | I can back up or analyze my history outside the app |

---

### 5. Functional Requirements

#### 5.1 Workout Logging
- User can create a workout with a name and date
- User can add exercises from a searchable library of 103 exercises organized by muscle group
- Each exercise supports one of four input types:
  - **Weighted:** weight (lbs) + reps — calculates Epley 1RM
  - **Bodyweight:** reps only (e.g., Crunch, Hanging Leg Raise)
  - **Timed:** minutes + seconds (e.g., Plank, Side Plank), stored as total seconds
  - **Optional Weighted:** toggle between Bodyweight or + Weight (e.g., Pull-Up, Dips) — tracked as separate progression paths
- Sets within each exercise are editable inline before saving
- Saving a workout detects new personal records and shows a celebration toast

#### 5.2 Progress Calculations
- **Epley 1RM formula:** `weight × (1 + reps / 30)`
- **Per-exercise baseline:** best set from the first-ever workout date (highest Epley 1RM across all sets that day)
- **Per-exercise progress:** `((current best 1RM − baseline 1RM) / baseline 1RM) × 100`
- **Bodyweight progress:** highest reps, first vs. most recent
- **Timed progress:** longest duration, first vs. most recent
- **Muscle group progress:** sum of all individual exercise percent increases within that muscle group
- **Total progress:** sum of all muscle group percent increases

#### 5.3 Dashboard
- **Start New Workout** button — choose from past workout template or create new
- **3 stat cards:** Total Workouts (with "over X days" label), Week Streak, Total Exercise Progress %
- **Progress chart:** neon green line chart of cumulative total percent change over time; animates on hover; redraws on resize
- **Muscle Development Radar:** spider chart across 8 muscle groups with Insights panel (strongest, needs attention, balance score, recommendation)
- **Mini calendar:** color-coded month view — green (completed), red (missed), blue (planned), grey (open future)
- Keyboard shortcut: `N` opens Start New Workout modal

#### 5.4 Statistics Page
- **Percent Increase by Muscle Group:** cards per muscle with exercise breakdown; hover animates counter from 0 and draws mini chart
- **Weekly Volume Landmarks:** summary card + 13 muscle group cards showing this week's sets vs. 4-week rolling average vs. research-based optimal ranges; animated progress bars; coaching insights section

#### 5.5 Calendar Page
- Full month grid with prev/next navigation
- Click a grey future day → Plan a Workout modal (name, date, time, exercises from library, or load past workout template)
- Click a blue planned day → navigates to Dashboard and starts that workout pre-loaded
- Mini calendar on Dashboard synced to same data

#### 5.6 Achievements Page
- Personal Records per exercise, grouped by muscle group (best set by Epley 1RM, best reps, or best duration depending on type)
- Collapsible **PR History Timeline** per exercise showing every time a new record was set, with date and workout name
- Search bar to filter by exercise name

#### 5.7 Templates Page
- Create, edit, duplicate, and delete reusable workout templates
- Template stores: name, description, exercises, sets, default weight/reps/duration, exercise mode
- **Start Workout from Template** → Dashboard pre-fills form with template exercises
- **Save as Template** button on every history card
- Search/filter by template name, exercise, or muscle group

#### 5.8 Workout History
- All completed workouts displayed in reverse chronological order
- Live search filters by workout name or exercise
- Each card shows: name, date, exercise list, volume or "Bodyweight"
- Buttons: ▶ Start Again, ✏️ Edit, 📋 Save as Template, Delete (with 5-second undo toast)
- Edit reloads workout into creation form; sets are editable inline

#### 5.9 Data Export
- Export full workout history as a `.csv` file
- Columns: Date, Workout Name, Exercise, Muscle Group, Set #, Weight, Reps, Estimated 1RM

---

### 6. Non-Functional Requirements

| Requirement | Implementation |
|---|---|
| No server required | All data in `localStorage`; runs as static files on GitHub Pages |
| No external libraries | 100% vanilla JavaScript — no React, Vue, jQuery, or CDN imports |
| Persistent data | Three `localStorage` keys: `workoutTrackerData`, `plannedWorkoutsData`, `workoutTemplatesData` |
| Dark / light mode | Toggle stored in `localStorage`; all canvas charts redraw with correct colors on toggle |
| Responsive | Hamburger sidebar on mobile; single-column grids below 768px; touch-safe hover animations |
| Performance | All calculations efficient for years of history; charts redraw only on change or resize; `requestAnimationFrame` for animations |

---

### 7. Data Model

```
Workout {
  id, name, date,
  exercises: [{ exercise, muscleGroup, sets: [{ weight?, reps?, duration?, mode }] }]
}

PlannedWorkout {
  id, name, date, time,
  exercises: [string],
  templateWorkoutId?
}

Template {
  templateId, templateName, description, createdAt, updatedAt,
  exercises: [{ exercise, muscleGroup, mode, sets: [{ weight?, reps?, duration?, mode }] }]
}
```

---

### 8. Exercise Library

103 exercises across 8 muscle groups (Chest, Back, Shoulders, Biceps, Triceps, Legs, Core, Forearms), each classified as weighted, bodyweight, timed, or optional-weighted. Stored as a JavaScript constant — no external data source.

---

### 9. Out of Scope

- User accounts or authentication
- Cloud sync or multi-device access
- Social features or sharing
- Video guides or form instructions
- Nutrition or calorie tracking

---

### 10. Extensions Completed

localStorage persistence · Keyboard shortcuts · Dark/light mode · Animations on state changes · CSV export · 5 separate pages · Undo last delete · Mobile-optimized layout