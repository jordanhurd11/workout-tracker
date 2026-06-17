# Workout Tracker - Learning Guide

This document explains the key JavaScript concepts you asked about and how they're implemented in this project.

## 1. Storing Workout Entries in an Array of Objects

**What:** Workouts are stored in an array where each workout is an object.

**Where in code:** `script.js` - Line 1-2

```javascript
let workouts = [];
// After adding a workout:
const workout = {
    id: Date.now(),           // Unique identifier
    exercise: "Bench Press",  // Exercise name
    sets: 3,                  // Number of sets
    reps: 8,                  // Reps per set
    weight: 185,              // Weight in pounds
    date: "2025-06-17",       // Workout date
    volume: 4440              // Calculated: sets × reps × weight
};
workouts.push(workout); // Add to array
```

**Why:** Objects let you organize related data together. The array lets you store multiple workouts and perform calculations on all of them.

---

## 2. Calculating Totals from Arrays

**What:** Using the `.reduce()` method to sum up values.

**Where in code:** `script.js` - Line 169-175

```javascript
function calculateTotalVolume(workoutsToCalculate = workouts) {
    return workoutsToCalculate.reduce((total, workout) => {
        return total + workout.volume;
    }, 0);
}
```

**How it works:**
- Start with `total = 0` (the second argument to `reduce()`)
- For each workout, add its volume to the total
- Return the final total

**Example:**
```
Workout 1: 3 × 8 × 185 = 4440
Workout 2: 4 × 6 × 225 = 5400
Total: 4440 + 5400 = 9840
```

---

## 3. Filtering Workouts by Exercise

**What:** Using `.filter()` to get only workouts that match a criteria.

**Where in code:** `script.js` - Line 194-204

```javascript
function getFilteredWorkouts() {
    const selectedExercise = filterExercise.value; // Get selected exercise from dropdown
    
    if (selectedExercise === '') {
        return workouts; // Return all if no filter selected
    }
    
    return workouts.filter(workout => workout.exercise === selectedExercise);
    // This returns a NEW array with only matching workouts
}
```

**How it works:**
- `.filter()` returns a new array with items that pass the test
- We test if `workout.exercise === selectedExercise`
- Only workouts where this is true are included

**Example:**
```javascript
// Original array
[
    { exercise: "Bench Press", weight: 185 },
    { exercise: "Squats", weight: 225 },
    { exercise: "Bench Press", weight: 195 }
]

// After filter("Bench Press")
[
    { exercise: "Bench Press", weight: 185 },
    { exercise: "Bench Press", weight: 195 }
]
```

---

## 4. Updating the DOM Dynamically

**What:** Creating HTML elements in JavaScript and adding them to the page.

**Where in code:** `script.js` - Line 239-268

```javascript
function createWorkoutElement(workout) {
    // 1. Create a new div element
    const div = document.createElement('div');
    
    // 2. Add CSS class
    div.className = 'workout-item';
    
    // 3. Set HTML content using template literal
    div.innerHTML = `
        <div class="workout-details">
            <h3>${workout.exercise}</h3>
            <p>Weight: ${workout.weight} lbs</p>
        </div>
    `;
    
    // 4. Return the element (to be added to page)
    return div;
}

// Then in renderWorkouts():
sortedWorkouts.forEach(workout => {
    const element = createWorkoutElement(workout);
    workoutHistory.appendChild(element); // Add to page!
});
```

**Key methods:**
- `document.createElement()` - Create a new element
- `.innerHTML` - Set the HTML content
- `.appendChild()` - Add an element as a child
- `.textContent` - Add text (safer than innerHTML for user input)

**Why this is dynamic:** The HTML is created based on the data in your JavaScript, not hardcoded in the HTML file.

---

## 5. Using localStorage to Save Data

**What:** Saving data in the browser so it persists when you refresh or close the page.

**Where in code:** `script.js` - Line 136-157

```javascript
const STORAGE_KEY = 'workoutTrackerData';

// SAVING DATA
function saveToLocalStorage() {
    // 1. Convert array to JSON string
    const jsonString = JSON.stringify(workouts);
    // Result: '[{"id":1622000000000,"exercise":"Bench Press",...}]'
    
    // 2. Save to localStorage with a key
    localStorage.setItem(STORAGE_KEY, jsonString);
}

// LOADING DATA
function loadFromLocalStorage() {
    // 1. Get the JSON string from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    
    // 2. Convert JSON string back to array
    if (stored) {
        workouts = JSON.parse(stored);
    }
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
});
```

**Key concepts:**
- `JSON.stringify()` - Converts objects/arrays to a string for storage
- `JSON.parse()` - Converts a JSON string back to objects/arrays
- `localStorage.setItem(key, value)` - Save data
- `localStorage.getItem(key)` - Retrieve data

**How it persists:**
1. User adds a workout
2. JavaScript saves it to localStorage (like a tiny database in the browser)
3. User closes browser
4. User reopens the page
5. JavaScript loads the data from localStorage
6. All workouts are still there! ✨

---

## 6. Personal Records Calculation

**What:** Finding the maximum weight for each exercise.

**Where in code:** `script.js` - Line 311-340

```javascript
function getPersonalRecords() {
    const records = {}; // Object to store records by exercise
    
    workouts.forEach(workout => {
        const exercise = workout.exercise;
        
        // If this exercise doesn't exist in records yet, create it
        if (!records[exercise]) {
            records[exercise] = {
                exercise: exercise,
                maxWeight: workout.weight,
                maxVolume: workout.volume,
                totalWorkouts: 0
            };
        }
        
        // Update max weight if this workout is heavier
        if (workout.weight > records[exercise].maxWeight) {
            records[exercise].maxWeight = workout.weight;
        }
        
        // Update max volume if this workout is higher volume
        if (workout.volume > records[exercise].maxVolume) {
            records[exercise].maxVolume = workout.volume;
        }
        
        // Count total workouts
        records[exercise].totalWorkouts++;
    });
    
    return records;
}
```

**Example:**
```javascript
// Input workouts:
[
    { exercise: "Bench Press", weight: 185 },
    { exercise: "Bench Press", weight: 195 },
    { exercise: "Squats", weight: 225 }
]

// Output records:
{
    "Bench Press": { maxWeight: 195, ... },
    "Squats": { maxWeight: 225, ... }
}
```

---

## 7. Event Listeners (User Interactions)

**What:** Detecting when the user does something and responding.

**Where in code:** `script.js` - Various locations

```javascript
// When form is submitted
workoutForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Stop page reload
    // ... get form values and add workout
});

// When filter dropdown changes
filterExercise.addEventListener('change', () => {
    renderWorkouts();
    updateStats();
});

// When clear button is clicked
clearBtn.addEventListener('click', () => {
    // ... clear all workouts
});
```

---

## Quiz: Do You Understand These Concepts?

Try to explain these in your own words:

1. **What's the difference between storing data in an array vs. an object?**
   - Answer: Arrays are for multiple items; objects are for grouped properties.

2. **If you have 100 workouts, how would you find the total volume?**
   - Answer: Use `.reduce()` to sum the `volume` property of each workout.

3. **How would you show only Bench Press workouts?**
   - Answer: Use `.filter()` to keep only workouts where `exercise === "Bench Press"`.

4. **What happens when the user closes the browser?**
   - Answer: The array in memory is cleared, but localStorage still has the data. When the page loads again, `loadFromLocalStorage()` restores it.

5. **How do you add a new row to the history when a user submits the form?**
   - Answer: Create a new HTML element with `createElement()` and add it with `appendChild()`.

---

## Common Patterns Used

### Pattern 1: Add Data → Save → Update Display
```javascript
workoutForm.addEventListener('submit', () => {
    workouts.push(newWorkout);      // 1. Add to array
    saveToLocalStorage();             // 2. Save to localStorage
    renderWorkouts();                 // 3. Update display
});
```

### Pattern 2: Get → Filter → Display
```javascript
const filtered = getFilteredWorkouts();
filtered.forEach(workout => {
    const element = createWorkoutElement(workout);
    container.appendChild(element);
});
```

### Pattern 3: Get → Calculate → Display
```javascript
const records = getPersonalRecords();
Object.values(records).forEach(record => {
    // Display each record
});
```

---

## Next Steps to Learn More

1. **Try modifying the code:**
   - Change what data is stored (add rpe/difficulty, notes, etc.)
   - Add sorting options (by date, by weight, etc.)
   - Add a search feature

2. **Learn related concepts:**
   - Array methods: `.map()`, `.sort()`, `.find()`
   - More DOM methods: `.addEventListener()`, `.classList`
   - Form validation in JavaScript

3. **Explore data visualization:**
   - Chart libraries like Chart.js to visualize progress
   - Graphs of weight over time for each exercise

Good luck with your fitness journey! 💪
