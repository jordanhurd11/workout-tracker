## PROPOSAL

- What I'm building: 

A personal strength training tracker that logs workouts, calculates estimated one-rep maxes using the Epley formula, and visualizes progress across muscle groups over time.

- Who it's for / why: 

Built for myself — I lift regularly but had no easy way to track whether I'm actually getting stronger over time. Most gym apps are bloated or require subscriptions; I wanted something lightweight that lives in my browser, shows real strength progress using the Epley 1RM formula, and helps me plan future sessions without forgetting what I did last week.

What it tracks:

Completed workouts — name, date, exercises, sets, weight/reps/duration per set, exercise mode (weighted, bodyweight, or timed)
Planned workouts — future calendar entries with name, date, time, and exercises
Workout templates — reusable routines with default weights, reps, and exercise configurations
User preference — dark/light mode toggle stored across sessions

- Core features:

1. Log workouts with weighted, bodyweight, and timed exercises — calculates Epley 1RM automatically
2. Track strength progress per exercise and per muscle group with percent increase calculations
3. Dashboard with a radar chart, progress graph, weekly streak, and color-coded calendar
4. Calendar page to plan future workouts and receive reminders when starting them
5. Achievements page showing personal records and how each PR improved over time

- What I don't know yet: which JavaScript concepts will you need to figure out?

How to draw charts and animated visualizations using the Canvas API without any libraries
How to structure localStorage so multiple data types (workouts, templates, planned workouts) stay organized and backwards-compatible as the app evolves
How to use requestAnimationFrame for smooth, performant animations (progress chart drawing, counter animations)
How to manage state across separate HTML pages using sessionStorage to pass data between pages 