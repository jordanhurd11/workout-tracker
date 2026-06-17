// ========================================
// WORKOUT TRACKER - VANILLA JAVASCRIPT
// ========================================

// ========================================
// 1. EXERCISE DATABASE BY MUSCLE GROUP
// ========================================

const EXERCISES_BY_MUSCLE = {
    "Chest": [
        "Barbell Bench Press", "Incline Barbell Bench Press", "Decline Barbell Bench Press",
        "Dumbbell Bench Press", "Incline Dumbbell Press", "Decline Dumbbell Press",
        "Dumbbell Fly", "Incline Dumbbell Fly", "Cable Fly", "Pec Deck Machine Fly",
        "Chest Press Machine", "Push-Up", "Weighted Push-Up", "Dips (Chest Focus)"
    ],
    "Back": [
        "Pull-Up", "Chin-Up", "Lat Pulldown", "Close Grip Lat Pulldown",
        "Barbell Row", "Pendlay Row", "T-Bar Row", "Dumbbell Row",
        "Seated Cable Row", "Chest Supported Row", "Machine Row",
        "Straight Arm Pulldown", "Deadlift", "Rack Pull"
    ],
    "Shoulders": [
        "Overhead Press", "Seated Dumbbell Shoulder Press", "Arnold Press",
        "Machine Shoulder Press", "Lateral Raise", "Cable Lateral Raise",
        "Front Raise", "Rear Delt Fly", "Reverse Pec Deck", "Face Pull", "Upright Row"
    ],
    "Biceps": [
        "Barbell Curl", "EZ Bar Curl", "Dumbbell Curl", "Alternating Dumbbell Curl",
        "Hammer Curl", "Preacher Curl", "Cable Curl", "Concentration Curl",
        "Incline Dumbbell Curl", "Spider Curl"
    ],
    "Triceps": [
        "Tricep Pushdown", "Rope Pushdown", "Skull Crusher", "Close Grip Bench Press",
        "Overhead Tricep Extension", "Dumbbell Kickback", "Dips (Tricep Focus)",
        "Cable Overhead Extension", "Machine Tricep Extension"
    ],
    "Legs": [
        "Back Squat", "Front Squat", "Hack Squat", "Leg Press",
        "Bulgarian Split Squat", "Walking Lunge", "Leg Extension", "Goblet Squat",
        "Romanian Deadlift", "Stiff Leg Deadlift", "Lying Leg Curl",
        "Seated Leg Curl", "Glute Ham Raise", "Nordic Curl",
        "Hip Thrust", "Glute Bridge", "Cable Kickback", "Step-Up",
        "Standing Calf Raise", "Seated Calf Raise", "Leg Press Calf Raise", "Single Leg Calf Raise"
    ],
    "Core": [
        "Crunch", "Sit-Up", "Cable Crunch", "Hanging Leg Raise", "Hanging Knee Raise",
        "Russian Twist", "Bicycle Crunch", "Ab Wheel Rollout", "Plank", "Side Plank", "Mountain Climbers"
    ],
    "Forearms": [
        "Barbell Wrist Curl", "Dumbbell Wrist Curl", "Barbell Reverse Wrist Curl",
        "Dumbbell Reverse Wrist Curl", "Cable Wrist Curl", "EZ Bar Wrist Curl",
        "Farmer's Carry", "Plate Pinch", "Wrist Roller", "Lever Curl"
    ],
};

// Create exercise to muscle mapping
const EXERCISE_TO_MUSCLE = {};
Object.entries(EXERCISES_BY_MUSCLE).forEach(([muscle, exercises]) => {
    exercises.forEach(ex => {
        EXERCISE_TO_MUSCLE[ex] = muscle;
    });
});

// ========================================
// 2. DOM ELEMENTS
// ========================================

// Create Workout Section
const workoutNameInput = document.getElementById('workoutName');
const workoutDateInput = document.getElementById('workoutDate');
const startWorkoutBtn = document.getElementById('startWorkoutBtn');

// Add Exercise Section
const addExerciseForm = document.getElementById('addExerciseForm');
const exerciseSelect = document.getElementById('exerciseSelect');
const exerciseNumSetsInput = document.getElementById('exerciseNumSets');
const exerciseSetsContainer = document.getElementById('exerciseSetsContainer');
const addExerciseBtn = document.getElementById('addExerciseBtn');
const cancelExerciseBtn = document.getElementById('cancelExerciseBtn');

// Current Workout Display
const currentWorkoutDisplay = document.getElementById('currentWorkoutDisplay');
const currentExercisesList = document.getElementById('currentExercisesList');
const addAnotherExerciseBtn = document.getElementById('addAnotherExerciseBtn');
const saveWorkoutBtn = document.getElementById('saveWorkoutBtn');
const cancelWorkoutBtn = document.getElementById('cancelWorkoutBtn');

// Stats Section
const totalWorkoutsDisplay = document.getElementById('totalWorkouts');
const totalVolumeDisplay = document.getElementById('totalVolume');

// Exercise Progress Section
const workoutProgressContainer = document.getElementById('workoutProgress');

// Workout History Section
const workoutHistoryContainer = document.getElementById('workoutHistory');
const clearBtn = document.getElementById('clearBtn');

// Workout Detail Modal
const workoutDetailModal = document.getElementById('workoutDetailModal');
const closeWorkoutDetailBtn = document.getElementById('closeWorkoutDetailBtn');
const workoutDetailTitle = document.getElementById('workoutDetailTitle');
const workoutDetailDate = document.getElementById('workoutDetailDate');
const workoutDetailExercises = document.getElementById('workoutDetailExercises');

// Exercise Detail Modal
const exerciseDetailModal = document.getElementById('exerciseDetailModal');
const closeDetailBtn = document.getElementById('closeDetailBtn');
const exerciseDetailTitle = document.getElementById('exerciseDetailTitle');
const exerciseProgressChart = document.getElementById('exerciseProgressChart');
const exerciseWorkoutHistory = document.getElementById('exerciseWorkoutHistory');

// ========================================
// 3. STATE
// ========================================

let workouts = [];
let currentWorkout = {
    id: null,
    name: "",
    date: "",
    exercises: []
};

const STORAGE_KEY = 'workoutTrackerData';

// ========================================
// 4. INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    populateExerciseDropdown();
    setDefaultDate();
    loadFromLocalStorage();
    setupEventListeners();
    renderStats();
});

// ========================================
// 5. POPULATE EXERCISE DROPDOWN
// ========================================

function populateExerciseDropdown() {
    exerciseSelect.innerHTML = '<option value="">Select an exercise...</option>';

    Object.entries(EXERCISES_BY_MUSCLE).forEach(([muscle, exercises]) => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = muscle;

        exercises.forEach(exercise => {
            const option = document.createElement('option');
            option.value = exercise;
            option.textContent = exercise;
            optgroup.appendChild(option);
        });

        exerciseSelect.appendChild(optgroup);
    });
}

// ========================================
// 6. SET DEFAULT DATE
// ========================================

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    workoutDateInput.value = today;
}

// ========================================
// 7. EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Workout creation workflow
    startWorkoutBtn.addEventListener('click', startNewWorkout);
    addExerciseBtn.addEventListener('click', addExerciseToCurrentWorkout);
    cancelExerciseBtn.addEventListener('click', cancelAddingExercise);
    addAnotherExerciseBtn.addEventListener('click', showAddExerciseForm);
    saveWorkoutBtn.addEventListener('click', saveCurrentWorkout);
    cancelWorkoutBtn.addEventListener('click', cancelCurrentWorkout);

    // Exercise set input generation
    exerciseNumSetsInput.addEventListener('change', () => {
        const numSets = parseInt(exerciseNumSetsInput.value);
        if (numSets > 0) {
            generateExerciseSetInputs(numSets);
        }
    });

    // Modals
    closeDetailBtn.addEventListener('click', closeExerciseDetail);
    closeWorkoutDetailBtn.addEventListener('click', closeWorkoutDetail);
    
    // History
    clearBtn.addEventListener('click', resetAllData);
}

// ========================================
// 8. WORKOUT CREATION WORKFLOW
// ========================================

function startNewWorkout() {
    const name = workoutNameInput.value.trim();
    const date = workoutDateInput.value;

    if (!name) {
        alert('Please enter a workout name');
        return;
    }

    if (!date) {
        alert('Please select a date');
        return;
    }

    currentWorkout = {
        id: crypto.randomUUID(),
        name: name,
        date: date,
        exercises: []
    };

    // Hide setup form, show add exercise form
    document.getElementById('workoutSetupForm').classList.add('hidden');
    showAddExerciseForm();
}

function showAddExerciseForm() {
    addExerciseForm.classList.remove('hidden');
    exerciseSetsContainer.innerHTML = '';
    exerciseSelect.value = '';
    exerciseNumSetsInput.value = '';
}

function generateExerciseSetInputs(numberOfSets) {
    exerciseSetsContainer.innerHTML = '';

    for (let i = 1; i <= numberOfSets; i++) {
        const setGroup = document.createElement('div');
        setGroup.className = 'exercise-set-input-group';

        setGroup.innerHTML = `
            <div class="exercise-set-number">Set ${i}</div>
            <div class="form-group">
                <label for="ex-weight-${i}">Weight (lbs)</label>
                <input 
                    type="number" 
                    id="ex-weight-${i}" 
                    class="exercise-set-weight"
                    min="0" 
                    step="0.5"
                    required
                >
            </div>
            <div class="form-group">
                <label for="ex-reps-${i}">Reps</label>
                <input 
                    type="number" 
                    id="ex-reps-${i}" 
                    class="exercise-set-reps"
                    min="1"
                    required
                >
            </div>
        `;

        exerciseSetsContainer.appendChild(setGroup);
    }
}

function addExerciseToCurrentWorkout() {
    const exercise = exerciseSelect.value.trim();
    const muscleGroup = EXERCISE_TO_MUSCLE[exercise];
    const numSets = parseInt(exerciseNumSetsInput.value);

    if (!exercise || !numSets) {
        alert('Please select an exercise and number of sets');
        return;
    }

    // Collect all sets
    const sets = [];
    for (let i = 1; i <= numSets; i++) {
        const weight = parseFloat(document.getElementById(`ex-weight-${i}`).value);
        const reps = parseInt(document.getElementById(`ex-reps-${i}`).value);

        if (!weight || !reps) {
            alert(`Please fill in all fields for Set ${i}`);
            return;
        }

        sets.push({ weight, reps });
    }

    // Add exercise to current workout
    const exerciseEntry = {
        exercise: exercise,
        muscleGroup: muscleGroup,
        sets: sets
    };

    currentWorkout.exercises.push(exerciseEntry);

    // Update display
    addExerciseForm.classList.add('hidden');
    updateCurrentWorkoutDisplay();
}

function updateCurrentWorkoutDisplay() {
    currentExercisesList.innerHTML = '';

    currentWorkout.exercises.forEach((exercise, index) => {
        const setInfo = exercise.sets.map((set, i) => 
            `Set ${i + 1}: ${set.weight} lbs × ${set.reps} reps`
        ).join(' | ');

        const item = document.createElement('div');
        item.className = 'current-exercise-item';
        item.innerHTML = `
            <div class="current-exercise-item-details">
                <h4>${exercise.exercise}</h4>
                <p class="current-exercise-item-muscle">${exercise.muscleGroup}</p>
                <p class="current-exercise-item-sets">${setInfo}</p>
            </div>
            <div class="current-exercise-item-remove">
                <button class="btn btn-delete" onclick="removeExerciseFromCurrentWorkout(${index})">Remove</button>
            </div>
        `;

        currentExercisesList.appendChild(item);
    });

    currentWorkoutDisplay.classList.remove('hidden');
}

function removeExerciseFromCurrentWorkout(index) {
    currentWorkout.exercises.splice(index, 1);
    updateCurrentWorkoutDisplay();

    if (currentWorkout.exercises.length === 0) {
        currentWorkoutDisplay.classList.add('hidden');
        showAddExerciseForm();
    }
}

function cancelAddingExercise() {
    if (currentWorkout.exercises.length === 0) {
        cancelCurrentWorkout();
    } else {
        addExerciseForm.classList.add('hidden');
        currentWorkoutDisplay.classList.remove('hidden');
    }
}

function saveCurrentWorkout() {
    if (currentWorkout.exercises.length === 0) {
        alert('Add at least one exercise before saving');
        return;
    }

    workouts.push({ ...currentWorkout });
    saveToLocalStorage();

    // Reset form
    currentWorkout = { id: null, name: "", date: "", exercises: [] };
    document.getElementById('workoutSetupForm').classList.remove('hidden');
    addExerciseForm.classList.add('hidden');
    currentWorkoutDisplay.classList.add('hidden');
    currentExercisesList.innerHTML = '';
    workoutNameInput.value = '';
    setDefaultDate();

    // Update displays
    renderStats();
}

function cancelCurrentWorkout() {
    currentWorkout = { id: null, name: "", date: "", exercises: [] };
    document.getElementById('workoutSetupForm').classList.remove('hidden');
    addExerciseForm.classList.add('hidden');
    currentWorkoutDisplay.classList.add('hidden');
    workoutNameInput.value = '';
    setDefaultDate();
}

// ========================================
// 9. GET ALL EXERCISE ENTRIES
// ========================================

function getAllExerciseEntries(workoutsArray) {
    const entries = [];

    workoutsArray.forEach(workout => {
        workout.exercises.forEach(exercise => {
            entries.push({
                exercise: exercise.exercise,
                muscleGroup: exercise.muscleGroup,
                workoutName: workout.name,
                workoutDate: workout.date,
                sets: exercise.sets,
                highestWeight: getHighestWeightFromSets(exercise.sets)
            });
        });
    });

    return entries;
}

// ========================================
// 10. GET HIGHEST WEIGHT FROM SETS
// ========================================

function getHighestWeightFromSets(sets) {
    if (!sets || sets.length === 0) return 0;
    return Math.max(...sets.map(set => set.weight));
}

// ========================================
// 11. GET MOST RECENT ENTRY BY EXERCISE
// ========================================

function getMostRecentEntryByExercise(workoutsArray) {
    const allEntries = getAllExerciseEntries(workoutsArray);
    const latestEntries = {};

    allEntries.forEach(entry => {
        const exercise = entry.exercise;
        const workoutDate = new Date(entry.workoutDate);

        if (!latestEntries[exercise] || workoutDate > new Date(latestEntries[exercise].workoutDate)) {
            latestEntries[exercise] = entry;
        }
    });

    return Object.values(latestEntries).sort((a, b) => a.exercise.localeCompare(b.exercise));
}

// ========================================
// 12. RENDER EXERCISE PROGRESS
// ========================================

function renderExerciseProgress() {
    const recentEntries = getMostRecentEntryByExercise(workouts);
    workoutProgressContainer.innerHTML = '';

    if (recentEntries.length === 0) {
        workoutProgressContainer.innerHTML = '<p class="empty-message">No workouts yet. Add one to track your progress!</p>';
        return;
    }

    recentEntries.forEach(entry => {
        const dateObj = new Date(entry.workoutDate);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const card = document.createElement('div');
        card.className = 'progress-card';
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <div class="progress-card-exercise">${entry.exercise}</div>
            <div class="progress-card-muscle">${entry.muscleGroup}</div>
            <div class="progress-card-1rm">${entry.highestWeight} lbs</div>
            <div class="progress-card-1rm-label">Highest Weight</div>
            <div class="progress-card-date">${dateStr}</div>
            <div class="progress-card-sets">${entry.sets.length} set${entry.sets.length !== 1 ? 's' : ''}</div>
            <div class="progress-card-click-hint">Click for history</div>
        `;

        card.addEventListener('click', () => openExerciseDetail(entry.exercise));
        workoutProgressContainer.appendChild(card);
    });
}

// ========================================
// 13. GET EXERCISE HISTORY
// ========================================

function getExerciseHistory(exerciseName) {
    const allEntries = getAllExerciseEntries(workouts);
    return allEntries
        .filter(entry => entry.exercise === exerciseName)
        .sort((a, b) => new Date(a.workoutDate) - new Date(b.workoutDate));
}

// ========================================
// 14. OPEN EXERCISE DETAIL
// ========================================

function openExerciseDetail(exerciseName) {
    exerciseDetailTitle.textContent = exerciseName;
    const history = getExerciseHistory(exerciseName);

    if (history.length === 0) {
        exerciseWorkoutHistory.innerHTML = '<p class="empty-message">No history for this exercise</p>';
        return;
    }

    exerciseWorkoutHistory.innerHTML = '';

    history.forEach(entry => {
        const dateObj = new Date(entry.workoutDate);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const item = document.createElement('div');
        item.className = 'exercise-workout-item';
        item.innerHTML = `
            <div class="exercise-workout-item-date">${entry.workoutName} - ${dateStr}</div>
            <div class="exercise-workout-item-1rm">Highest: ${entry.highestWeight} lbs</div>
            <div class="exercise-workout-item-sets">
                ${entry.sets.map((set, i) => `Set ${i + 1}: ${set.weight} lbs × ${set.reps} reps`).join(' | ')}
            </div>
        `;

        exerciseWorkoutHistory.appendChild(item);
    });

    // Draw chart
    drawExerciseProgressChart(history);

    exerciseDetailModal.classList.remove('hidden');
}

// ========================================
// 15. CLOSE EXERCISE DETAIL
// ========================================

function closeExerciseDetail() {
    exerciseDetailModal.classList.add('hidden');
}

// ========================================
// 16. OPEN WORKOUT DETAIL
// ========================================

function openWorkoutDetail(workoutId) {
    const workout = workouts.find(w => w.id === workoutId);
    if (!workout) return;

    workoutDetailTitle.textContent = workout.name;
    const dateObj = new Date(workout.date);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    workoutDetailDate.textContent = dateStr;

    workoutDetailExercises.innerHTML = '';

    workout.exercises.forEach(exercise => {
        const item = document.createElement('div');
        item.className = 'workout-detail-exercise';
        item.innerHTML = `
            <h4>${exercise.exercise}</h4>
            <p class="workout-detail-exercise-muscle">${exercise.muscleGroup}</p>
            <div class="workout-detail-exercise-sets">
                ${exercise.sets.map((set, i) => 
                    `<div class="workout-detail-set">Set ${i + 1}: ${set.weight} lbs × ${set.reps} reps</div>`
                ).join('')}
            </div>
        `;

        workoutDetailExercises.appendChild(item);
    });

    workoutDetailModal.classList.remove('hidden');
}

// ========================================
// 17. CLOSE WORKOUT DETAIL
// ========================================

function closeWorkoutDetail() {
    workoutDetailModal.classList.add('hidden');
}

// ========================================
// 18. DRAW EXERCISE PROGRESS CHART
// ========================================

function drawExerciseProgressChart(history) {
    if (history.length < 2) {
        exerciseProgressChart.style.display = 'none';
        const container = exerciseProgressChart.parentElement;
        let emptyMsg = container.querySelector('.exercise-chart-empty');
        if (!emptyMsg) {
            emptyMsg = document.createElement('div');
            emptyMsg.className = 'exercise-chart-empty';
            emptyMsg.textContent = 'Need at least 2 entries to show progress chart';
            container.insertBefore(emptyMsg, exerciseProgressChart);
        }
        return;
    }

    exerciseProgressChart.style.display = 'block';
    const container = exerciseProgressChart.parentElement;
    const emptyMsg = container.querySelector('.exercise-chart-empty');
    if (emptyMsg) emptyMsg.style.display = 'none';

    const ctx = exerciseProgressChart.getContext('2d');
    const width = exerciseProgressChart.width;
    const height = exerciseProgressChart.height;

    // Calculate dimensions
    const padding = 40;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Get data
    const weights = history.map(h => h.highestWeight);
    const maxWeight = Math.max(...weights);
    const minWeight = Math.min(...weights);
    const weightRange = maxWeight - minWeight || maxWeight;

    // Draw grid and axes
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    // Draw horizontal grid lines
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();

        // Y-axis labels
        const weight = maxWeight - (weightRange / 5) * i;
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(weight), padding - 10, y + 4);
    }

    // Draw vertical grid lines
    for (let i = 0; i < history.length; i++) {
        const x = padding + (chartWidth / (history.length - 1)) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Plot data points and line
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    ctx.beginPath();

    history.forEach((entry, i) => {
        const x = padding + (chartWidth / (history.length - 1)) * i;
        const y = height - padding - ((entry.highestWeight - minWeight) / weightRange) * chartHeight;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();

    // Draw data points
    ctx.fillStyle = '#667eea';
    history.forEach((entry, i) => {
        const x = padding + (chartWidth / (history.length - 1)) * i;
        const y = height - padding - ((entry.highestWeight - minWeight) / weightRange) * chartHeight;

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        // X-axis label (date)
        const dateObj = new Date(entry.workoutDate);
        const dateStr = (dateObj.getMonth() + 1) + '/' + dateObj.getDate();
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(dateStr, x, height - padding + 20);
    });

    // Draw Y-axis label
    ctx.save();
    ctx.translate(10, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#666';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Weight (lbs)', 0, 0);
    ctx.restore();
}

// ========================================
// 19. RENDER WORKOUT HISTORY
// ========================================

function renderWorkoutHistory() {
    workoutHistoryContainer.innerHTML = '';

    if (workouts.length === 0) {
        workoutHistoryContainer.innerHTML = '<p class="empty-message">No workouts yet. Add one to get started!</p>';
        return;
    }

    // Sort by date descending
    const sorted = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach(workout => {
        const dateObj = new Date(workout.date);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
        const totalVolume = calculateWorkoutVolume(workout);
        const exerciseNames = workout.exercises.map(ex => ex.exercise).join(', ');

        const item = document.createElement('div');
        item.className = 'workout-item';
        item.style.cursor = 'pointer';
        item.innerHTML = `
            <div class="workout-details">
                <h3>${workout.name}</h3>
                <p>${dateStr}</p>
                <p style="color: #667eea; font-weight: 600; margin: 10px 0;">
                    ${workout.exercises.length} exercise${workout.exercises.length !== 1 ? 's' : ''} · ${totalSets} set${totalSets !== 1 ? 's' : ''} · ${totalVolume.toLocaleString()} lbs
                </p>
                <p style="color: #666; font-size: 0.9em; margin-top: 8px;">${exerciseNames}</p>
            </div>
            <div class="delete-btn">
                <button class="btn btn-delete" onclick="event.stopPropagation(); deleteWorkout('${workout.id}')">Delete</button>
            </div>
        `;

        item.addEventListener('click', () => openWorkoutDetail(workout.id));
        workoutHistoryContainer.appendChild(item);
    });
}

// ========================================
// 20. CALCULATE WORKOUT VOLUME
// ========================================

function calculateWorkoutVolume(workout) {
    return workout.exercises.reduce((total, exercise) => {
        const exerciseVolume = exercise.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
        return total + exerciseVolume;
    }, 0);
}

// ========================================
// 21. CALCULATE TOTAL STATS
// ========================================

function updateTotalStats() {
    totalWorkoutsDisplay.textContent = workouts.length;

    const totalVolume = workouts.reduce((sum, workout) => {
        return sum + calculateWorkoutVolume(workout);
    }, 0);

    totalVolumeDisplay.textContent = totalVolume.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

// ========================================
// 22. RENDER STATS
// ========================================

function renderStats() {
    updateTotalStats();
    renderWorkoutHistory();
    renderExerciseProgress();
}

// ========================================
// 23. DELETE WORKOUT
// ========================================

function deleteWorkout(workoutId) {
    if (confirm('Are you sure you want to delete this workout?')) {
        workouts = workouts.filter(w => w.id !== workoutId);
        saveToLocalStorage();
        renderStats();
    }
}

// ========================================
// 24. RESET ALL DATA
// ========================================

function resetAllData() {
    if (workouts.length === 0) {
        alert('No workouts to clear!');
        return;
    }

    if (confirm('Are you sure? This will delete ALL workouts permanently.')) {
        workouts = [];
        saveToLocalStorage();
        renderStats();
    }
}

// ========================================
// 25. LOAD FROM LOCAL STORAGE
// ========================================

function loadFromLocalStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            
            // Validate that data has new format (with exercises array in each workout)
            // If old format detected, clear it
            if (Array.isArray(parsed) && parsed.length > 0) {
                if (!parsed[0].exercises && parsed[0].sets) {
                    // Old format detected - clear and use fresh start
                    console.log('Old data format detected, clearing for fresh start');
                    workouts = [];
                    localStorage.removeItem(STORAGE_KEY);
                    return;
                }
            }
            
            workouts = parsed;
            console.log('Loaded workouts:', workouts);
        }
    } catch (error) {
        console.error('Error loading data:', error);
        workouts = [];
    }
}

// ========================================
// 26. SAVE TO LOCAL STORAGE
// ========================================

function saveToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

console.log('Workout Tracker initialized successfully!');
