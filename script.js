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

// Muscle Group Progress Section
const muscleGroupStatsContainer = document.getElementById('muscleGroupStats');

// Workout History Section
const workoutHistoryContainer = document.getElementById('workoutHistory');
const clearBtn = document.getElementById('clearBtn');

// Workout Detail Modal
const workoutDetailModal = document.getElementById('workoutDetailModal');
const closeWorkoutDetailBtn = document.getElementById('closeWorkoutDetailBtn');
const startFromDetailBtn = document.getElementById('startFromDetailBtn');
const workoutDetailTitle = document.getElementById('workoutDetailTitle');
const workoutDetailDate = document.getElementById('workoutDetailDate');
const workoutDetailExercises = document.getElementById('workoutDetailExercises');
let currentDetailWorkoutId = null;

// Exercise Detail Modal
const exerciseDetailModal = document.getElementById('exerciseDetailModal');
const closeDetailBtn = document.getElementById('closeDetailBtn');
const exerciseDetailTitle = document.getElementById('exerciseDetailTitle');
const exerciseProgressChart = document.getElementById('exerciseProgressChart');
const exerciseWorkoutHistory = document.getElementById('exerciseWorkoutHistory');

// New Dashboard Features
const startNewWorkoutBtn = document.getElementById('startNewWorkoutBtn');
const workoutLayoutModal = document.getElementById('workoutLayoutModal');
const closeLayoutModalBtn = document.getElementById('closeLayoutModalBtn');
const createNewWorkoutBtn = document.getElementById('createNewWorkoutBtn');
const layoutModalOverlay = document.getElementById('layoutModalOverlay');
const workoutCalendar = document.getElementById('workoutCalendar');
const totalProgressDisplay = document.getElementById('totalProgress');
const progressChartContainer = document.getElementById('progressChart');
const createWorkoutSection = document.getElementById('createWorkoutSection');

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
let templateQueue = [];

const currentPage = document.body.getAttribute('data-page') || 'dashboard';

const STORAGE_KEY = 'workoutTrackerData';

// ========================================
// 4. INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();

    if (currentPage === 'dashboard') {
        populateExerciseDropdown();
        setDefaultDate();
        setupEventListeners();
        updateTotalStats();
        renderWorkoutHistory();
        renderWorkoutCalendar();
        renderProgressChart();
    } else if (currentPage === 'statistics') {
        renderMuscleGroupProgress();
    } else if (currentPage === 'achievements') {
        renderPersonalRecords();
    }
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

// ========================================
// 6B. EVENT LISTENERS (null-safe)
// ========================================

function setupEventListeners() {
    if (startWorkoutBtn) startWorkoutBtn.addEventListener('click', startNewWorkout);
    if (addExerciseBtn) addExerciseBtn.addEventListener('click', addExerciseToCurrentWorkout);
    if (cancelExerciseBtn) cancelExerciseBtn.addEventListener('click', cancelAddingExercise);
    if (addAnotherExerciseBtn) addAnotherExerciseBtn.addEventListener('click', showAddExerciseForm);
    if (saveWorkoutBtn) saveWorkoutBtn.addEventListener('click', saveCurrentWorkout);
    if (cancelWorkoutBtn) cancelWorkoutBtn.addEventListener('click', cancelCurrentWorkout);

    if (exerciseNumSetsInput) {
        exerciseNumSetsInput.addEventListener('change', () => {
            const numSets = parseInt(exerciseNumSetsInput.value);
            if (numSets > 0) generateExerciseSetInputs(numSets);
        });
    }

    if (closeDetailBtn) closeDetailBtn.addEventListener('click', closeExerciseDetail);
    if (closeWorkoutDetailBtn) closeWorkoutDetailBtn.addEventListener('click', closeWorkoutDetail);
    if (startFromDetailBtn) startFromDetailBtn.addEventListener('click', () => {
        if (currentDetailWorkoutId) startWorkoutFromId(currentDetailWorkoutId);
    });
    if (clearBtn) clearBtn.addEventListener('click', resetAllData);
    if (startNewWorkoutBtn) startNewWorkoutBtn.addEventListener('click', () => showWorkoutLayoutModal());
    if (closeLayoutModalBtn) closeLayoutModalBtn.addEventListener('click', () => closeWorkoutLayoutModal());
    if (layoutModalOverlay) layoutModalOverlay.addEventListener('click', () => closeWorkoutLayoutModal());
    if (createNewWorkoutBtn) createNewWorkoutBtn.addEventListener('click', () => startNewWorkoutFromModal());
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

    // If working through a template, pre-fill the next exercise automatically
    if (templateQueue.length > 0) {
        showAddExerciseForm();
        prefillNextTemplateExercise();
    }
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
    templateQueue = [];
    document.getElementById('workoutSetupForm').classList.remove('hidden');
    addExerciseForm.classList.add('hidden');
    currentWorkoutDisplay.classList.add('hidden');
    workoutNameInput.value = '';
    setDefaultDate();
}

// ========================================
// 8B. EPLEY 1RM FORMULA
// ========================================

function epley1RM(weight, reps) {
    if (reps === 1) return weight;
    return weight * (1 + reps / 30);
}

function getBest1RM(sets) {
    if (!sets || sets.length === 0) return 0;
    return Math.max(...sets.map(set => epley1RM(set.weight, set.reps)));
}

// For each exercise: find the first-ever workout date, then take the highest
// Epley 1RM across ALL sets from ALL workouts on that date.
// Returns { exercise -> { date, best1RM } }
function buildFirstEverMap(allEntries) {
    const byExercise = {};
    allEntries.forEach(e => {
        if (!byExercise[e.exercise]) byExercise[e.exercise] = [];
        byExercise[e.exercise].push(e);
    });
    const map = {};
    Object.keys(byExercise).forEach(ex => {
        const entries = byExercise[ex];
        const firstDate = entries.reduce((min, e) => e.workoutDate < min ? e.workoutDate : min, entries[0].workoutDate);
        const best1RM = Math.max(...entries.filter(e => e.workoutDate === firstDate).map(e => e.best1RM));
        map[ex] = { date: firstDate, best1RM };
    });
    return map;
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
                highestWeight: getHighestWeightFromSets(exercise.sets),
                best1RM: getBest1RM(exercise.sets)
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
// 12B. GET MUSCLE GROUP STATS
// ========================================

function getMuscleGroupStats(workoutsArray) {
    const muscleGroupData = {};

    // Aggregate all exercises by muscle group
    workoutsArray.forEach(workout => {
        workout.exercises.forEach(exercise => {
            const muscle = exercise.muscleGroup;

            if (!muscleGroupData[muscle]) {
                muscleGroupData[muscle] = {
                    muscle: muscle,
                    totalVolume: 0,
                    exerciseCount: 0,
                    maxWeight: 0,
                    workoutCount: 0,
                    lastWorkoutDate: null,
                    exercises: new Set()
                };
            }

            muscleGroupData[muscle].exercises.add(exercise.exercise);

            // Calculate volume for each set
            exercise.sets.forEach(set => {
                muscleGroupData[muscle].totalVolume += set.weight * set.reps;
                muscleGroupData[muscle].maxWeight = Math.max(muscleGroupData[muscle].maxWeight, set.weight);
            });

            // Track last workout date
            const workoutDate = new Date(workout.date);
            if (!muscleGroupData[muscle].lastWorkoutDate || workoutDate > new Date(muscleGroupData[muscle].lastWorkoutDate)) {
                muscleGroupData[muscle].lastWorkoutDate = workout.date;
            }

            muscleGroupData[muscle].workoutCount++;
        });
    });

    // Convert to array and add exercise count
    return Object.values(muscleGroupData)
        .map(data => ({
            ...data,
            exerciseCount: data.exercises.size
        }))
        .sort((a, b) => b.totalVolume - a.totalVolume);
}

// ========================================
// 12B2. CALCULATE MUSCLE GROUP PERCENT CHANGES
// ========================================

function getMuscleGroupPercentChanges() {
    const allEntries = getAllExerciseEntries(workouts);
    const firstEver = buildFirstEverMap(allEntries);

    const byMuscleExercise = {};
    allEntries.forEach(e => {
        const muscle = e.muscleGroup;
        if (!byMuscleExercise[muscle]) byMuscleExercise[muscle] = {};
        if (!byMuscleExercise[muscle][e.exercise]) byMuscleExercise[muscle][e.exercise] = [];
        byMuscleExercise[muscle][e.exercise].push(e);
    });

    return Object.keys(byMuscleExercise).map(muscle => {
        let totalPercentIncrease = 0;
        const exerciseChanges = [];

        Object.keys(byMuscleExercise[muscle]).forEach(exercise => {
            const base = firstEver[exercise];
            const entries = byMuscleExercise[muscle][exercise].filter(e => e.workoutDate > base.date);
            if (entries.length === 0) return;
            const lastDate = entries.reduce((max, e) => e.workoutDate > max ? e.workoutDate : max, entries[0].workoutDate);
            const latestBest = Math.max(...entries.filter(e => e.workoutDate === lastDate).map(e => e.best1RM));
            if (base.best1RM > 0) {
                const pct = ((latestBest - base.best1RM) / base.best1RM) * 100;
                totalPercentIncrease += pct;
                exerciseChanges.push({ exercise, percentChange: pct });
            }
        });

        return {
            muscle,
            percentChange: totalPercentIncrease,
            totalPercentIncrease,
            exerciseChanges,
            isIncrease: totalPercentIncrease >= 0
        };
    }).sort((a, b) => b.totalPercentIncrease - a.totalPercentIncrease);
}

// ========================================
// 12B3. DRAW MUSCLE GROUP RADAR CHART
// ========================================

function drawMuscleGroupRadarChart() {
    const radarCanvas = document.getElementById('radarChart');
    if (!radarCanvas) return;

    const percentChanges = getMuscleGroupPercentChanges();

    if (percentChanges.length === 0) {
        radarCanvas.style.display = 'none';
        return;
    }

    radarCanvas.style.display = 'block';
    const ctx = radarCanvas.getContext('2d');
    const width = radarCanvas.width;
    const height = radarCanvas.height;

    // Clear canvas with subtle background
    ctx.clearRect(0, 0, width, height);
    const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height));
    bgGradient.addColorStop(0, '#ffffff');
    bgGradient.addColorStop(1, '#f8f9fa');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2 - 10; // Shift up slightly for better layout
    const radius = Math.min(width, height) / 2 - 100;
    const sides = percentChanges.length;
    const angleSlice = (Math.PI * 2) / sides;

    // Draw concentric circles with gradient
    for (let i = 1; i <= 5; i++) {
        const r = (radius / 5) * i;
        const opacity = 0.15 - (i * 0.02);
        ctx.strokeStyle = `rgba(102, 126, 234, ${opacity})`;
        ctx.lineWidth = i === 5 ? 2 : 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Draw axes and labels
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    percentChanges.forEach((change, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        // Draw axis line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Draw label with better positioning
        const labelDistance = radius + 35;
        const labelX = centerX + labelDistance * Math.cos(angle);
        const labelY = centerY + labelDistance * Math.sin(angle);
        ctx.fillStyle = '#2d2d2d';
        ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
        ctx.fillText(change.muscle, labelX, labelY);
    });

    // Draw data points first to layer properly
    const dataPoints = [];
    percentChanges.forEach((change, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const normalizedValue = Math.max(0, Math.min(100, change.percentChange + 50));
        const value = (normalizedValue / 100) * radius;
        const x = centerX + value * Math.cos(angle);
        const y = centerY + value * Math.sin(angle);
        dataPoints.push({ x, y, change });
    });

    // Draw data polygon with gradient
    const polyGradient = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
    polyGradient.addColorStop(0, 'rgba(102, 126, 234, 0.15)');
    polyGradient.addColorStop(0.5, 'rgba(102, 126, 234, 0.08)');
    polyGradient.addColorStop(1, 'rgba(102, 126, 234, 0.15)');
    
    ctx.strokeStyle = '#667eea';
    ctx.fillStyle = polyGradient;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    dataPoints.forEach((point, i) => {
        if (i === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw data points with glow effect
    dataPoints.forEach((point) => {
        const color = point.change.isIncrease ? '#4caf50' : '#f44336';
        
        // Glow effect
        ctx.fillStyle = color.replace(')', ', 0.2)').replace('rgb', 'rgba');
        ctx.beginPath();
        ctx.arc(point.x, point.y, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Outer ring
        ctx.strokeStyle = color.replace(')', ', 0.4)').replace('rgb', 'rgba');
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
        ctx.stroke();
        
        // Center dot
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw legend with better styling
    ctx.font = '12px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    const legendY = height - 20;
    ctx.fillText('● Green: Gain  |  ● Red: Decline  |  Center: 0%  |  Outer: +100%', centerX, legendY);
}

// ========================================
// 12C. RENDER MUSCLE GROUP PROGRESS
// ========================================

function renderMuscleGroupProgress() {
    const container = document.getElementById('muscleGroupStats');
    if (!container) return;

    const muscleChanges = getMuscleGroupPercentChanges();
    container.innerHTML = '';

    if (muscleChanges.length === 0) {
        container.innerHTML = '<p class="empty-message">No workouts yet. Add workouts to see statistics!</p>';
        return;
    }

    muscleChanges.forEach(group => {
        const card = document.createElement('div');
        card.className = 'muscle-group-card';

        const sign = group.totalPercentIncrease >= 0 ? '+' : '';
        const changeClass = group.totalPercentIncrease >= 0 ? 'positive' : 'negative';

        const breakdown = group.exerciseChanges.length > 0
            ? group.exerciseChanges.map(ex => {
                const exSign = ex.percentChange >= 0 ? '+' : '';
                return `<div class="exercise-change-row">
                    <span class="exercise-change-name">${ex.exercise}</span>
                    <span class="exercise-change-value ${ex.percentChange >= 0 ? 'positive' : 'negative'}">${exSign}${ex.percentChange.toFixed(1)}%</span>
                </div>`;
              }).join('')
            : '<p class="empty-message" style="font-size:0.85em;margin:8px 0 0;">Need 2+ entries per exercise to show data.</p>';

        card.innerHTML = `
            <div class="muscle-group-card-name">${group.muscle}</div>
            <div class="muscle-group-total-change ${changeClass}">${sign}${group.totalPercentIncrease.toFixed(1)}%</div>
            <div class="muscle-group-exercises-breakdown">${breakdown}</div>
        `;

        container.appendChild(card);
    });
}

// ========================================
// 12D. RENDER PERSONAL RECORDS
// ========================================

function renderPersonalRecords() {
    const container = document.getElementById('personalRecords');
    if (!container) return;

    const allEntries = getAllExerciseEntries(workouts);

    if (allEntries.length === 0) {
        container.innerHTML = '<p class="empty-message">No workouts yet. Add one to see your personal records!</p>';
        return;
    }

    // Find best set (by Epley 1RM) for each exercise
    const prByExercise = {};
    allEntries.forEach(entry => {
        entry.sets.forEach(set => {
            const est1RM = epley1RM(set.weight, set.reps);
            if (!prByExercise[entry.exercise] || est1RM > prByExercise[entry.exercise].est1RM) {
                prByExercise[entry.exercise] = {
                    exercise: entry.exercise,
                    muscleGroup: entry.muscleGroup,
                    weight: set.weight,
                    reps: set.reps,
                    est1RM: est1RM
                };
            }
        });
    });

    // Group by muscle group
    const byMuscle = {};
    Object.values(prByExercise).forEach(pr => {
        if (!byMuscle[pr.muscleGroup]) byMuscle[pr.muscleGroup] = [];
        byMuscle[pr.muscleGroup].push(pr);
    });

    container.innerHTML = '';
    Object.keys(byMuscle).sort().forEach(muscle => {
        const section = document.createElement('div');
        section.className = 'pr-muscle-group';
        section.innerHTML = `<h3 class="pr-muscle-title">${muscle}</h3>`;

        byMuscle[muscle].sort((a, b) => a.exercise.localeCompare(b.exercise)).forEach(pr => {
            const card = document.createElement('div');
            card.className = 'pr-card';
            card.innerHTML = `
                <div class="pr-exercise-name">${pr.exercise} <span class="pr-label">PR</span></div>
                <div class="pr-set">${pr.weight} lbs × ${pr.reps} reps</div>
                <div class="pr-estimated"><em>Estimated 1RM: ${pr.est1RM.toFixed(1)} lbs</em></div>
            `;
            section.appendChild(card);
        });

        container.appendChild(section);
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
    currentDetailWorkoutId = workoutId;

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
            <div class="workout-card-actions">
                <button class="btn btn-start-history" onclick="event.stopPropagation(); startWorkoutFromId('${workout.id}')">▶ Start</button>
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
    if (totalWorkoutsDisplay) totalWorkoutsDisplay.textContent = workouts.length;

    const daysLabel = document.getElementById('workoutDaysLabel');
    if (daysLabel) {
        if (workouts.length > 0) {
            const dates = workouts.map(w => new Date(w.date));
            const firstDate = new Date(Math.min(...dates));
            const today = new Date();
            const days = Math.round((today - firstDate) / (1000 * 60 * 60 * 24)) + 1;
            daysLabel.textContent = `over ${days} day${days !== 1 ? 's' : ''}`;
        } else {
            daysLabel.textContent = '';
        }
    }

    const totalProgress = calculateTotalProgressPercentage();
    if (totalProgressDisplay) {
        const sign = totalProgress >= 0 ? '+' : '';
        totalProgressDisplay.textContent = sign + totalProgress.toFixed(1) + '%';
    }
}

// ========================================
// 22. RENDER STATS
// ========================================

function renderStats() {
    updateTotalStats();
    renderWorkoutHistory();
    renderWorkoutCalendar();
    renderProgressChart();
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

// ========================================
// 27. NEW DASHBOARD FEATURES
// ========================================

// ========================================
// 27A. SHOW WORKOUT LAYOUT MODAL
// ========================================

function showWorkoutLayoutModal() {
    renderPastWorkoutsInModal();
    workoutLayoutModal.classList.remove('hidden');
}

function closeWorkoutLayoutModal() {
    workoutLayoutModal.classList.add('hidden');
}

function startNewWorkoutFromModal() {
    closeWorkoutLayoutModal();
    createWorkoutSection.classList.remove('hidden');
    document.getElementById('workoutSetupForm').classList.remove('hidden');
    workoutNameInput.focus();
}

function renderPastWorkoutsInModal() {
    const pastWorkoutsList = document.getElementById('pastWorkoutsList');
    pastWorkoutsList.innerHTML = '';

    if (workouts.length === 0) {
        pastWorkoutsList.innerHTML = '<p class="empty-message">No past workouts available yet</p>';
        return;
    }

    // Get unique workout names (templates)
    const workoutNames = [...new Set(workouts.map(w => w.name))];
    
    workoutNames.forEach(name => {
        const item = document.createElement('div');
        item.className = 'past-workout-item';
        
        const lastWorkout = workouts.find(w => w.name === name);
        const exerciseNames = lastWorkout.exercises.map(e => e.exercise).slice(0, 3).join(', ');
        const moreExercises = lastWorkout.exercises.length > 3 ? ` +${lastWorkout.exercises.length - 3} more` : '';
        
        item.innerHTML = `
            <div>
                <div class="past-workout-item-name">${name}</div>
                <div class="past-workout-item-exercises">${exerciseNames}${moreExercises}</div>
            </div>
        `;
        
        item.addEventListener('click', () => useWorkoutTemplate(name));
        pastWorkoutsList.appendChild(item);
    });
}

function startWorkoutFromId(workoutId) {
    const template = workouts.find(w => w.id === workoutId);
    if (!template) return;

    // Close any open modals
    if (workoutDetailModal) workoutDetailModal.classList.add('hidden');
    closeWorkoutLayoutModal();

    // Show the create section and pre-fill name + today's date
    createWorkoutSection.classList.remove('hidden');
    workoutNameInput.value = template.name;
    setDefaultDate();
    startNewWorkout();

    // Queue exercises for one-at-a-time editing
    templateQueue = [...template.exercises];
    prefillNextTemplateExercise();

    createWorkoutSection.scrollIntoView({ behavior: 'smooth' });
}

function useWorkoutTemplate(workoutName) {
    const template = workouts.find(w => w.name === workoutName);
    if (!template) return;

    closeWorkoutLayoutModal();
    createWorkoutSection.classList.remove('hidden');
    workoutNameInput.value = workoutName;
    setDefaultDate();
    startNewWorkout();

    // Queue all template exercises so the user can review/edit each one
    templateQueue = [...template.exercises];
    prefillNextTemplateExercise();
}

function prefillNextTemplateExercise() {
    if (templateQueue.length === 0) return;

    const exercise = templateQueue.shift();
    exerciseSelect.value = exercise.exercise;
    exerciseNumSetsInput.value = exercise.sets.length;
    generateExerciseSetInputs(exercise.sets.length);

    exercise.sets.forEach((set, i) => {
        document.getElementById(`ex-weight-${i + 1}`).value = set.weight;
        document.getElementById(`ex-reps-${i + 1}`).value = set.reps;
    });
}

// ========================================
// 27B. RENDER WORKOUT CALENDAR
// ========================================

function renderWorkoutCalendar() {
    workoutCalendar.innerHTML = '';

    if (!workoutCalendar) return;

    // Get current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Get first day and number of days in month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Collect workout dates
    const workoutDates = new Set();
    workouts.forEach(workout => {
        const date = new Date(workout.date);
        if (date.getFullYear() === year && date.getMonth() === month) {
            workoutDates.add(date.getDate());
        }
    });

    // Get today's date
    const today = new Date();
    const todayDate = today.getDate();

    // Add previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayEl = createCalendarDayElement(day, 'future');
        workoutCalendar.appendChild(dayEl);
    }

    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
        let status = 'future';
        
        if (day < todayDate) {
            status = workoutDates.has(day) ? 'worked-out' : 'no-workout';
        } else if (day === todayDate) {
            status = workoutDates.has(day) ? 'worked-out' : 'no-workout';
        } else {
            status = 'future';
        }

        const dayEl = createCalendarDayElement(day, status);
        workoutCalendar.appendChild(dayEl);
    }

    // Add next month days
    const totalCells = workoutCalendar.children.length;
    const remainingCells = 42 - totalCells; // 6 rows × 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayEl = createCalendarDayElement(day, 'future');
        workoutCalendar.appendChild(dayEl);
    }
}

function createCalendarDayElement(day, status) {
    const dayEl = document.createElement('div');
    dayEl.className = `calendar-day ${status}`;
    dayEl.innerHTML = `<span class="calendar-day-number">${day}</span>`;
    return dayEl;
}

// ========================================
// 27C. CALCULATE TOTAL PROGRESS PERCENTAGE
// ========================================

function calculateTotalProgressPercentage() {
    const allEntries = getAllExerciseEntries(workouts);
    if (allEntries.length === 0) return 0;

    const firstEver = buildFirstEverMap(allEntries);
    const byExercise = {};
    allEntries.forEach(e => {
        if (!byExercise[e.exercise]) byExercise[e.exercise] = [];
        byExercise[e.exercise].push(e);
    });

    let total = 0;
    Object.keys(firstEver).forEach(exercise => {
        const base = firstEver[exercise];
        const entries = byExercise[exercise].filter(e => e.workoutDate > base.date);
        if (entries.length === 0) return;
        const lastDate = entries.reduce((max, e) => e.workoutDate > max ? e.workoutDate : max, entries[0].workoutDate);
        const latestBest = Math.max(...entries.filter(e => e.workoutDate === lastDate).map(e => e.best1RM));
        if (base.best1RM > 0) total += ((latestBest - base.best1RM) / base.best1RM) * 100;
    });

    return total;
}

// ========================================
// 27D. RENDER OVERALL PROGRESS CHART
// ========================================

function renderProgressChart() {
    const canvas = document.getElementById('progressChart');
    if (!canvas) return;

    const container = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const cssW = container ? container.clientWidth  : 800;
    const cssH = container ? container.clientHeight : 280;

    // High-DPI: buffer is dpr× larger, CSS displays it at cssW×cssH
    canvas.width  = cssW * dpr;
    canvas.height = cssH * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // All drawing uses CSS pixel dimensions
    const width  = cssW;
    const height = cssH;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#1e1c35';   // match dark card background
    ctx.fillRect(0, 0, width, height);

    const allEntries = getAllExerciseEntries(workouts);
    const uniqueDates = [...new Set(allEntries.map(e => e.workoutDate))].sort();

    if (uniqueDates.length < 2) {
        ctx.fillStyle = '#bbb';
        ctx.font = '14px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Add at least 2 workout dates to see progress over time', width / 2, height / 2);
        return;
    }

    // Fixed baseline per exercise: best 1RM across all sets on the first-ever date
    const firstEver = buildFirstEverMap(allEntries);

    // At each date point: sum percent changes (first-ever vs best on most recent date up to here)
    const percentages = uniqueDates.map(date => {
        let total = 0;
        Object.keys(firstEver).forEach(exercise => {
            const base = firstEver[exercise];
            // Only include entries strictly after the first date
            const laterEntries = allEntries.filter(e => e.exercise === exercise && e.workoutDate > base.date && e.workoutDate <= date);
            if (laterEntries.length === 0) return;
            const lastDate = laterEntries.reduce((max, e) => e.workoutDate > max ? e.workoutDate : max, laterEntries[0].workoutDate);
            const latestBest = Math.max(...laterEntries.filter(e => e.workoutDate === lastDate).map(e => e.best1RM));
            if (base.best1RM > 0) total += ((latestBest - base.best1RM) / base.best1RM) * 100;
        });
        return total;
    });

    // Leave extra bottom padding for rotated date labels
    const pad = { top: 30, right: 30, bottom: 65, left: 58 };
    const cw = width - pad.left - pad.right;
    const ch = height - pad.top - pad.bottom;

    const maxP = Math.max(...percentages, 0.1);
    const minP = Math.min(...percentages, 0);
    const buf = (maxP - minP) * 0.18 || 2;
    const pMax = maxP + buf;
    const pMin = minP - buf / 2;
    const pRange = pMax - pMin;

    const getX = i => pad.left + (cw / Math.max(uniqueDates.length - 1, 1)) * i;
    const getY = p => pad.top + ((pMax - p) / pRange) * ch;

    const pts = percentages.map((p, i) => ({ x: getX(i), y: getY(p) }));

    // Draw bezier curve segments — no moveTo inside so the path stays continuous
    function drawCurveSegments() {
        for (let i = 0; i < pts.length - 1; i++) {
            const cpx = (pts[i].x + pts[i + 1].x) / 2;
            const cpy = (pts[i].y + pts[i + 1].y) / 2;
            ctx.quadraticCurveTo(pts[i].x, pts[i].y, cpx, cpy);
        }
        ctx.quadraticCurveTo(
            pts[pts.length - 2].x, pts[pts.length - 2].y,
            pts[pts.length - 1].x, pts[pts.length - 1].y
        );
    }

    const NEON = '#39ff8a';

    // Neon green gradient fill — single closed path
    const grad = ctx.createLinearGradient(0, pad.top, 0, height - pad.bottom);
    grad.addColorStop(0, 'rgba(57, 255, 138, 0.28)');
    grad.addColorStop(1, 'rgba(57, 255, 138, 0.00)');

    ctx.beginPath();
    ctx.moveTo(pts[0].x, height - pad.bottom);
    ctx.lineTo(pts[0].x, pts[0].y);
    drawCurveSegments();
    ctx.lineTo(pts[pts.length - 1].x, height - pad.bottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Neon green stroke with glow
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    drawCurveSegments();
    ctx.strokeStyle = NEON;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = NEON;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Y-axis labels — muted on dark bg
    ctx.fillStyle = '#4e4c6a';
    ctx.font = '11px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const p = pMax - (pRange / 4) * i;
        const y = pad.top + (ch / 4) * i;
        ctx.fillText((p >= 0 ? '+' : '') + p.toFixed(0) + '%', pad.left - 8, y + 4);
    }

    // Rotated date labels at every point
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    pts.forEach((pt, i) => {
        const d = new Date(uniqueDates[i]);
        const label = MONTHS[d.getMonth()] + ' ' + d.getDate();
        ctx.save();
        ctx.translate(pt.x, height - pad.bottom + 8);
        ctx.rotate(-Math.PI / 4);
        ctx.fillStyle = '#4e4c6a';
        ctx.font = '10px -apple-system, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(label, 0, 0);
        ctx.restore();
    });
}

console.log('Workout Tracker initialized successfully!');
