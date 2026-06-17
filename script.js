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

const workoutForm = document.getElementById('workoutForm');
const exerciseSelect = document.getElementById('exercise');
const numSetsInput = document.getElementById('numSets');
const workoutDateInput = document.getElementById('workoutDate');
const setsContainer = document.getElementById('setsContainer');
const workoutHistory = document.getElementById('workoutHistory');
const totalWorkoutsDisplay = document.getElementById('totalWorkouts');
const totalVolumeDisplay = document.getElementById('totalVolume');
const personalRecords = document.getElementById('personalRecords');
const clearBtn = document.getElementById('clearBtn');
const radarCanvas = document.getElementById('radarChart');
const muscleGroupStats = document.getElementById('muscleGroupStats');
const workoutProgress = document.getElementById('workoutProgress');
const exerciseDetailModal = document.getElementById('exerciseDetailModal');
const exerciseDetailTitle = document.getElementById('exerciseDetailTitle');
const closeDetailBtn = document.getElementById('closeDetailBtn');
const exerciseProgressChart = document.getElementById('exerciseProgressChart');
const exerciseWorkoutHistory = document.getElementById('exerciseWorkoutHistory');

// ========================================
// 3. STATE
// ========================================

let workouts = [];
const STORAGE_KEY = 'workoutTrackerData';

// ========================================
// 4. INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    populateExerciseDropdown();
    loadFromLocalStorage();
    setDefaultDate();
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
    numSetsInput.addEventListener('change', () => {
        const numSets = parseInt(numSetsInput.value);
        if (numSets > 0) {
            generateSetInputs(numSets);
        }
    });

    workoutForm.addEventListener('submit', addWorkout);
    clearBtn.addEventListener('click', resetAllData);
    closeDetailBtn.addEventListener('click', closeExerciseDetail);

    // Close modal when clicking outside
    exerciseDetailModal.addEventListener('click', (e) => {
        if (e.target === exerciseDetailModal) {
            closeExerciseDetail();
        }
    });
}

// ========================================
// 8. GENERATE SET INPUTS
// ========================================

function generateSetInputs(numberOfSets) {
    setsContainer.innerHTML = '';

    for (let i = 1; i <= numberOfSets; i++) {
        const setGroup = document.createElement('div');
        setGroup.className = 'set-input-group';

        setGroup.innerHTML = `
            <div class="set-number">Set ${i}</div>
            <div class="form-group">
                <label for="weight-${i}">Weight (lbs)</label>
                <input 
                    type="number" 
                    id="weight-${i}" 
                    class="set-weight"
                    min="0" 
                    step="0.5"
                    required
                >
            </div>
            <div class="form-group">
                <label for="reps-${i}">Reps</label>
                <input 
                    type="number" 
                    id="reps-${i}" 
                    class="set-reps"
                    min="1"
                    required
                >
            </div>
        `;

        setsContainer.appendChild(setGroup);
    }
}

// ========================================
// 9. ADD WORKOUT
// ========================================

function addWorkout(event) {
    event.preventDefault();

    const exercise = exerciseSelect.value.trim();
    const muscle = EXERCISE_TO_MUSCLE[exercise];
    const date = workoutDateInput.value;
    const numSets = parseInt(numSetsInput.value);

    if (!exercise || !numSets) {
        alert('Please select an exercise and number of sets');
        return;
    }

    // Collect all sets
    const sets = [];
    for (let i = 1; i <= numSets; i++) {
        const weight = parseFloat(document.getElementById(`weight-${i}`).value);
        const reps = parseInt(document.getElementById(`reps-${i}`).value);

        if (!weight || !reps) {
            alert(`Please fill in all fields for Set ${i}`);
            return;
        }

        sets.push({ weight, reps });
    }

    // Create workout object
    const workout = {
        id: Date.now(),
        exercise,
        muscle,
        date,
        sets
    };

    workouts.push(workout);
    saveToLocalStorage();

    // Reset form
    workoutForm.reset();
    setsContainer.innerHTML = '';
    setDefaultDate();

    // Update UI
    renderStats();
}

// ========================================
// 10. LOAD FROM LOCAL STORAGE
// ========================================

function loadFromLocalStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            workouts = JSON.parse(stored);
            console.log('Loaded workouts:', workouts);
        }
    } catch (error) {
        console.error('Error loading data:', error);
        workouts = [];
    }
}

// ========================================
// 11. SAVE TO LOCAL STORAGE
// ========================================

function saveToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// ========================================
// 12. RENDER STATS (Main Update Function)
// ========================================

function renderStats() {
    renderWorkoutHistory();
    updateTotalStats();
    renderWorkoutProgress();
    renderPersonalRecords();
    drawRadarChart();
}

// ========================================
// 13. UPDATE TOTAL STATS
// ========================================

function updateTotalStats() {
    totalWorkoutsDisplay.textContent = workouts.length;

    const totalVolume = workouts.reduce((sum, workout) => {
        const workoutVolume = workout.sets.reduce((setSum, set) => {
            return setSum + (set.weight * set.reps);
        }, 0);
        return sum + workoutVolume;
    }, 0);

    totalVolumeDisplay.textContent = totalVolume.toLocaleString('en-US', {
        maximumFractionDigits: 0
    });
}

// ========================================
// 14. RENDER WORKOUT HISTORY
// ========================================

function renderWorkoutHistory() {
    workoutHistory.innerHTML = '';

    if (workouts.length === 0) {
        workoutHistory.innerHTML = '<p class="empty-message">No workouts yet. Add one to get started!</p>';
        return;
    }

    // Sort by date descending
    const sorted = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach(workout => {
        const item = document.createElement('div');
        item.className = 'workout-item';

        const date = new Date(workout.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Calculate volume for this workout
        const workoutVolume = workout.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);

        // Format sets info
        const setsInfo = workout.sets.map((set, idx) => 
            `Set ${idx + 1}: ${set.weight} lbs × ${set.reps} reps`
        ).join(' | ');

        item.innerHTML = `
            <div class="workout-details">
                <h3>${workout.exercise}</h3>
                <p class="muscle-label">${workout.muscle}</p>
                <p class="sets-info">${setsInfo}</p>
                <div class="workout-stats">
                    <span class="stat-badge volume">Volume: ${workoutVolume.toLocaleString()} lbs</span>
                    <span class="stat-badge date">${date}</span>
                </div>
            </div>
            <div class="delete-btn">
                <button class="btn btn-delete" onclick="deleteWorkout(${workout.id})">Delete</button>
            </div>
        `;

        workoutHistory.appendChild(item);
    });
}

// ========================================
// 15. DELETE WORKOUT
// ========================================

function deleteWorkout(id) {
    workouts = workouts.filter(w => w.id !== id);
    saveToLocalStorage();
    renderStats();
}

// ========================================
// 16. RENDER PERSONAL RECORDS
// ========================================

function renderPersonalRecords() {
    personalRecords.innerHTML = '';

    if (workouts.length === 0) {
        personalRecords.innerHTML = '<p class="empty-message">No workouts yet. Add one to see your personal records!</p>';
        return;
    }

    // Group by exercise
    const byExercise = {};
    workouts.forEach(workout => {
        if (!byExercise[workout.exercise]) {
            byExercise[workout.exercise] = [];
        }
        byExercise[workout.exercise].push(workout);
    });

    // Get records for each exercise
    const records = Object.entries(byExercise).map(([exercise, workoutList]) => {
        const maxWeight = Math.max(...workoutList.flatMap(w => w.sets.map(s => s.weight)));
        
        // Calculate total volume
        const totalVolume = workoutList.reduce((sum, w) => {
            return sum + w.sets.reduce((s, set) => s + (set.weight * set.reps), 0);
        }, 0);

        return {
            exercise,
            maxWeight,
            totalVolume,
            totalSets: workoutList.reduce((sum, w) => sum + w.sets.length, 0)
        };
    });

    // Sort by exercise name
    records.sort((a, b) => a.exercise.localeCompare(b.exercise));

    // Render
    records.forEach(record => {
        const card = document.createElement('div');
        card.className = 'record-card';

        card.innerHTML = `
            <h3>${record.exercise}</h3>
            <div class="record-pr">${record.maxWeight} lbs</div>
            <p><strong>Total Volume:</strong> ${record.totalVolume.toLocaleString()} lbs</p>
            <p><strong>Total Sets:</strong> ${record.totalSets}</p>
        `;

        personalRecords.appendChild(card);
    });
}

// ========================================
// 17. CALCULATE EXERCISE PROGRESS
// ========================================

function calculateExerciseProgress() {
    const exerciseProgress = {};

    // Group workouts by exercise
    const byExercise = {};
    workouts.forEach(workout => {
        if (!byExercise[workout.exercise]) {
            byExercise[workout.exercise] = [];
        }
        byExercise[workout.exercise].push(workout);
    });

    // Calculate progress for each exercise
    Object.entries(byExercise).forEach(([exercise, workoutList]) => {
        if (workoutList.length < 2) return; // Need at least 2 workouts

        // Sort by date
        const sorted = [...workoutList].sort((a, b) => new Date(a.date) - new Date(b.date));

        // Get earliest and latest
        const earliest = sorted[0];
        const latest = sorted[sorted.length - 1];

        // Get best set from each
        const earliestBestSet = earliest.sets.reduce((max, set) => 
            estimateOneRepMax(set.weight, set.reps) > estimateOneRepMax(max.weight, max.reps) ? set : max
        );

        const latestBestSet = latest.sets.reduce((max, set) => 
            estimateOneRepMax(set.weight, set.reps) > estimateOneRepMax(max.weight, max.reps) ? set : max
        );

        const earliestScore = estimateOneRepMax(earliestBestSet.weight, earliestBestSet.reps);
        const latestScore = estimateOneRepMax(latestBestSet.weight, latestBestSet.reps);

        const percentChange = ((latestScore - earliestScore) / earliestScore) * 100;

        exerciseProgress[exercise] = {
            percentChange: Math.round(percentChange * 10) / 10,
            earliest: earliestScore,
            latest: latestScore
        };
    });

    return exerciseProgress;
}

// ========================================
// 18. ESTIMATE ONE REP MAX
// ========================================

function estimateOneRepMax(weight, reps) {
    if (reps <= 0) return weight;
    return weight * (1 + reps / 30);
}

// ========================================
// 19. CALCULATE MUSCLE GROUP PROGRESS
// ========================================

function calculateMuscleGroupProgress() {
    const exerciseProgress = calculateExerciseProgress();
    const muscleProgress = {};

    // Initialize all muscles
    Object.keys(EXERCISES_BY_MUSCLE).forEach(muscle => {
        muscleProgress[muscle] = 0;
    });

    // Sum progress by muscle group
    Object.entries(exerciseProgress).forEach(([exercise, data]) => {
        const muscle = EXERCISE_TO_MUSCLE[exercise];
        if (muscle) {
            muscleProgress[muscle] += data.percentChange;
        }
    });

    return muscleProgress;
}

// ========================================
// 20. DRAW RADAR CHART
// ========================================

function drawRadarChart() {
    const muscleProgress = calculateMuscleGroupProgress();
    const ctx = radarCanvas.getContext('2d');

    // Set canvas size
    radarCanvas.width = 400;
    radarCanvas.height = 400;

    // Get muscles with data
    const muscles = Object.keys(muscleProgress).filter(m => EXERCISES_BY_MUSCLE[m]);
    const values = muscles.map(m => Math.max(0, muscleProgress[m])); // Clamp negative to 0 for display

    // Find max value for scaling
    const maxValue = Math.max(50, Math.max(...values));
    const angleSlice = (Math.PI * 2) / muscles.length;
    const radius = 120;
    const centerX = radarCanvas.width / 2;
    const centerY = radarCanvas.height / 2;

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.fillStyle = 'rgba(102, 126, 234, 0.05)';

    for (let i = 0; i < 5; i++) {
        const currentRadius = (radius / 5) * (i + 1);
        ctx.beginPath();

        for (let j = 0; j < muscles.length; j++) {
            const angle = angleSlice * j - Math.PI / 2;
            const x = centerX + currentRadius * Math.cos(angle);
            const y = centerY + currentRadius * Math.sin(angle);
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#ccc';
    for (let i = 0; i < muscles.length; i++) {
        const angle = angleSlice * i - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    // Draw data polygon
    ctx.strokeStyle = '#667eea';
    ctx.fillStyle = 'rgba(102, 126, 234, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < muscles.length; i++) {
        const angle = angleSlice * i - Math.PI / 2;
        const scaledRadius = (values[i] / maxValue) * radius;
        const x = centerX + scaledRadius * Math.cos(angle);
        const y = centerY + scaledRadius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw points
    ctx.fillStyle = '#667eea';
    for (let i = 0; i < muscles.length; i++) {
        const angle = angleSlice * i - Math.PI / 2;
        const scaledRadius = (values[i] / maxValue) * radius;
        const x = centerX + scaledRadius * Math.cos(angle);
        const y = centerY + scaledRadius * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw labels
    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';

    muscles.forEach((muscle, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const labelRadius = radius + 35;
        const x = centerX + labelRadius * Math.cos(angle);
        const y = centerY + labelRadius * Math.sin(angle);
        ctx.fillText(muscle, x, y);
    });

    // Render muscle group stats
    renderMuscleGroupStats(muscleProgress, muscles);
}

// ========================================
// 21. RENDER MUSCLE GROUP STATS
// ========================================

function renderMuscleGroupStats(muscleProgress, muscles) {
    muscleGroupStats.innerHTML = '';

    muscles.forEach(muscle => {
        const value = muscleProgress[muscle];
        const isNegative = value < 0;

        const stat = document.createElement('div');
        stat.className = `muscle-stat ${isNegative ? 'negative' : ''}`;

        stat.innerHTML = `
            <span class="name">${muscle}</span>
            <span class="value">${value.toFixed(1)}%</span>
        `;

        muscleGroupStats.appendChild(stat);
    });
}

// ========================================
// 22. RESET ALL DATA
// ========================================

function resetAllData() {
    if (workouts.length === 0) {
        alert('No workouts to clear!');
        return;
    }

    const confirmed = confirm('Are you sure? This will delete ALL workouts permanently.');
    if (confirmed) {
        workouts = [];
        saveToLocalStorage();
        renderStats();
        console.log('All data cleared');
    }
}

// ========================================
// 23. GET MOST RECENT WORKOUT BY EXERCISE
// ========================================

function getMostRecentWorkoutByExercise(workoutsList) {
    const latestWorkouts = {};

    workoutsList.forEach(workout => {
        const exercise = workout.exercise;
        const workoutDate = new Date(workout.date);

        if (!latestWorkouts[exercise] || workoutDate > new Date(latestWorkouts[exercise].date)) {
            latestWorkouts[exercise] = workout;
        }
    });

    return Object.values(latestWorkouts).sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
}

// ========================================
// 24. CALCULATE BEST ONE REP MAX FOR WORKOUT
// ========================================

function calculateWorkoutBestOneRepMax(workout) {
    if (!workout.sets || workout.sets.length === 0) {
        return 0;
    }

    let bestOneRepMax = 0;
    workout.sets.forEach(set => {
        const oneRepMax = estimateOneRepMax(set.weight, set.reps);
        bestOneRepMax = Math.max(bestOneRepMax, oneRepMax);
    });

    return bestOneRepMax;
}

// ========================================
// 25. RENDER WORKOUT PROGRESS (Latest by Exercise)
// ========================================

function renderWorkoutProgress() {
    workoutProgress.innerHTML = '';

    if (workouts.length === 0) {
        workoutProgress.innerHTML = '<p class="empty-message">No workouts yet. Add one to track your progress!</p>';
        return;
    }

    const mostRecentWorkouts = getMostRecentWorkoutByExercise(workouts);

    mostRecentWorkouts.forEach(workout => {
        const bestOneRepMax = calculateWorkoutBestOneRepMax(workout);
        const date = new Date(workout.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const setsText = `${workout.sets.length} set${workout.sets.length > 1 ? 's' : ''}`;

        const card = document.createElement('div');
        card.className = 'progress-card';
        card.onclick = () => openExerciseDetail(workout.exercise);

        card.innerHTML = `
            <div class="progress-card-exercise">${workout.exercise}</div>
            <div class="progress-card-muscle">${workout.muscle}</div>
            <div class="progress-card-1rm">${bestOneRepMax.toFixed(1)} lbs</div>
            <div class="progress-card-1rm-label">Estimated 1RM</div>
            <div class="progress-card-date">${date}</div>
            <div class="progress-card-sets">${setsText}</div>
            <div class="progress-card-click-hint">Click to view all workouts for this exercise</div>
        `;

        workoutProgress.appendChild(card);
    });
}

// ========================================
// 26. GET WORKOUTS FOR EXERCISE
// ========================================

function getWorkoutsForExercise(exerciseName) {
    return workouts
        .filter(w => w.exercise === exerciseName)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
}

// ========================================
// 27. OPEN EXERCISE DETAIL VIEW
// ========================================

function openExerciseDetail(exerciseName) {
    const exerciseWorkouts = getWorkoutsForExercise(exerciseName);
    
    if (exerciseWorkouts.length === 0) {
        return;
    }

    exerciseDetailTitle.textContent = exerciseName;
    
    renderExerciseWorkoutHistory(exerciseWorkouts);
    drawExerciseProgressChart(exerciseWorkouts);
    
    exerciseDetailModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// ========================================
// 28. CLOSE EXERCISE DETAIL VIEW
// ========================================

function closeExerciseDetail() {
    exerciseDetailModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// ========================================
// 29. RENDER EXERCISE WORKOUT HISTORY
// ========================================

function renderExerciseWorkoutHistory(exerciseWorkouts) {
    exerciseWorkoutHistory.innerHTML = '<h3>Workout History</h3>';

    exerciseWorkouts.forEach(workout => {
        const date = new Date(workout.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const bestOneRepMax = calculateWorkoutBestOneRepMax(workout);
        
        const setsInfo = workout.sets.map((set, idx) => 
            `Set ${idx + 1}: ${set.weight} lbs × ${set.reps} reps (1RM: ${estimateOneRepMax(set.weight, set.reps).toFixed(1)} lbs)`
        ).join(' | ');

        const item = document.createElement('div');
        item.className = 'exercise-workout-item';

        item.innerHTML = `
            <div class="exercise-workout-item-date">${date}</div>
            <div class="exercise-workout-item-1rm">Best 1RM: ${bestOneRepMax.toFixed(1)} lbs</div>
            <div class="exercise-workout-item-sets">${setsInfo}</div>
        `;

        exerciseWorkoutHistory.appendChild(item);
    });
}

// ========================================
// 30. DRAW EXERCISE PROGRESS CHART
// ========================================

function drawExerciseProgressChart(exerciseWorkouts) {
    const ctx = exerciseProgressChart.getContext('2d');

    // Set canvas size
    exerciseProgressChart.width = exerciseProgressChart.parentElement.clientWidth - 40;
    exerciseProgressChart.height = 300;

    if (exerciseWorkouts.length === 0) {
        ctx.fillStyle = '#999';
        ctx.font = '14px Arial';
        ctx.fillText('No workout data available', 20, 150);
        return;
    }

    // Prepare data
    const dataPoints = exerciseWorkouts.map(workout => ({
        date: new Date(workout.date),
        oneRepMax: calculateWorkoutBestOneRepMax(workout)
    }));

    // Find min and max values
    const oneRepMaxValues = dataPoints.map(p => p.oneRepMax);
    const minOneRepMax = Math.min(...oneRepMaxValues);
    const maxOneRepMax = Math.max(...oneRepMaxValues);
    const padding = (maxOneRepMax - minOneRepMax) * 0.1 || 10;
    const yMin = minOneRepMax - padding;
    const yMax = maxOneRepMax + padding;

    const padding_left = 50;
    const padding_right = 20;
    const padding_top = 30;
    const padding_bottom = 40;

    const graphWidth = exerciseProgressChart.width - padding_left - padding_right;
    const graphHeight = exerciseProgressChart.height - padding_top - padding_bottom;

    // Draw background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, exerciseProgressChart.width, exerciseProgressChart.height);

    // Draw grid lines
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding_top + (graphHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding_left, y);
        ctx.lineTo(exerciseProgressChart.width - padding_right, y);
        ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding_left, padding_top);
    ctx.lineTo(padding_left, exerciseProgressChart.height - padding_bottom);
    ctx.lineTo(exerciseProgressChart.width - padding_right, exerciseProgressChart.height - padding_bottom);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Date', exerciseProgressChart.width / 2, exerciseProgressChart.height - 10);

    ctx.save();
    ctx.translate(15, exerciseProgressChart.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Estimated 1RM (lbs)', 0, 0);
    ctx.restore();

    // Draw Y-axis labels
    ctx.textAlign = 'right';
    ctx.font = '11px Arial';
    for (let i = 0; i <= 5; i++) {
        const y = padding_top + (graphHeight / 5) * i;
        const value = yMax - (i / 5) * (yMax - yMin);
        ctx.fillText(value.toFixed(0), padding_left - 10, y + 4);
    }

    // Draw X-axis labels
    ctx.textAlign = 'center';
    dataPoints.forEach((point, idx) => {
        const x = padding_left + (idx / (dataPoints.length - 1 || 1)) * graphWidth;
        const dateStr = point.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        ctx.fillText(dateStr, x, exerciseProgressChart.height - padding_bottom + 20);
    });

    // Plot data points
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#667eea';

    ctx.beginPath();
    dataPoints.forEach((point, idx) => {
        const x = padding_left + (idx / (dataPoints.length - 1 || 1)) * graphWidth;
        const y = padding_top + graphHeight - ((point.oneRepMax - yMin) / (yMax - yMin)) * graphHeight;

        if (idx === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();

    // Draw points
    dataPoints.forEach((point, idx) => {
        const x = padding_left + (idx / (dataPoints.length - 1 || 1)) * graphWidth;
        const y = padding_top + graphHeight - ((point.oneRepMax - yMin) / (yMax - yMin)) * graphHeight;

        ctx.fillStyle = '#667eea';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Draw title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Estimated 1RM Progress Over Time', exerciseProgressChart.width / 2, 20);
}

// ========================================
// 23. KEYBOARD SHORTCUTS
// ========================================

document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        exerciseSelect.focus();
    }

    if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        workoutForm.dispatchEvent(new Event('submit'));
    }
});

console.log('Workout Tracker initialized successfully!');
