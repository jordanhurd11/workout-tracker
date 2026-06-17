# 💪 Workout Progress Tracker

A simple, intuitive front-end JavaScript application for logging workouts, tracking progress, and analyzing fitness statistics over time.

## Features

✅ **Add Workouts** - Log exercise name, sets, reps, weight, and date  
✅ **Workout History** - View all logged workouts in a clean, organized list  
✅ **Total Volume Calculation** - Automatically calculates total volume (sets × reps × weight)  
✅ **Personal Records** - Track your max weight and max volume for each exercise  
✅ **Filter by Exercise** - View workouts for a specific exercise  
✅ **Persistent Storage** - Data saves to browser localStorage automatically  
✅ **Delete Workouts** - Remove individual workouts or clear entire history  
✅ **Responsive Design** - Works great on desktop, tablet, and mobile  

## How to Use

1. **Open the Application**
   - Open `index.html` in your web browser

2. **Add a Workout**
   - Fill in the form: Exercise name, Sets, Reps, Weight, and Date
   - Click "Add Workout" button
   - Your workout is automatically saved!

3. **View Your Stats**
   - See total workouts and total volume at the top
   - Personal records show your max weight and volume for each exercise

4. **Filter Workouts**
   - Use the "Filter by Exercise" dropdown to view workouts for a specific exercise
   - Stats and personal records update based on your filter

5. **Manage Workouts**
   - Click "Delete" on any workout to remove it
   - Use "Clear All History" to delete all workouts at once

6. **Keyboard Shortcuts**
   - `Alt + Q` - Focus on exercise input field
   - `Alt + S` - Submit the form

## Project Structure

```
workout-tracker/
├── index.html      # HTML structure with form and display areas
├── styles.css      # Responsive styling and animations
├── script.js       # Core logic and functionality
└── README.md       # Documentation
```

## Technical Concepts Covered

### 1. **Array of Objects**
```javascript
const workouts = [
  { id: 1622000000000, exercise: "Bench Press", sets: 3, reps: 8, weight: 185, date: "2025-06-17", volume: 4440 },
  { id: 1622000001000, exercise: "Squats", sets: 4, reps: 6, weight: 225, date: "2025-06-17", volume: 5400 }
];
```

### 2. **Calculating Totals**
```javascript
function calculateTotalVolume(workoutsArray) {
    return workoutsArray.reduce((total, workout) => {
        return total + workout.volume;
    }, 0);
}
```

### 3. **Filtering Arrays**
```javascript
const filteredWorkouts = workouts.filter(w => w.exercise === selectedExercise);
```

### 4. **DOM Manipulation**
```javascript
const element = document.createElement('div');
element.className = 'workout-item';
element.innerHTML = `<h3>${workout.exercise}</h3>`;
document.getElementById('container').appendChild(element);
```

### 5. **localStorage for Persistence**
```javascript
// Save
localStorage.setItem('workoutTrackerData', JSON.stringify(workouts));

// Load
const workouts = JSON.parse(localStorage.getItem('workoutTrackerData'));
```

## Key JavaScript Features

### Event Listeners
- Form submission handler for adding workouts
- Filter dropdown change listener
- Clear all button click handler
- Delete button handlers on each workout

### Data Transformation
- Sorting workouts by date
- Extracting unique exercises
- Calculating personal records by exercise
- Aggregating statistics

### Error Handling
- Try-catch blocks for localStorage operations
- Confirmation dialogs for destructive actions
- Input validation through HTML5 form attributes

## Browser Compatibility

- Chrome ✓
- Firefox ✓
- Safari ✓
- Edge ✓
- Requires localStorage support (modern browsers)

## Future Enhancement Ideas

- 📊 Charts and graphs for progress visualization
- 💾 Export data to CSV or JSON
- 📱 Progressive Web App (PWA) capabilities
- 🎯 Goal tracking and target setting
- 📈 Progress trends and analytics
- 🔄 Sync across devices with cloud storage
- 🏆 Achievements and milestones
- 📊 Body weight and body measurements tracking

## Getting Started

1. Save all files in the same folder
2. Open `index.html` in your browser
3. Start logging workouts!
4. Your data is automatically saved to your browser's localStorage

## Tips for Best Results

- Be consistent with exercise names (e.g., always use "Bench Press", not "BP" or "Bench")
- Log workouts soon after completing them to maintain accuracy
- Regularly review your personal records for motivation
- Use the filter to focus on specific exercises and track progress
- Clear old data periodically if storage becomes an issue

---

Built with 💪 and JavaScript | Stay consistent, stay strong!
