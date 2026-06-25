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
    exercises.forEach(ex => { EXERCISE_TO_MUSCLE[ex] = muscle; });
});

// ========================================
// VOLUME LANDMARK CONSTANTS
// ========================================

const VOLUME_MUSCLES = ['Chest','Back','Shoulders','Biceps','Triceps','Legs','Core','Forearms'];

const VOLUME_OPTIMAL_RANGES = {
    'Chest':     { min: 10, max: 20 },
    'Back':      { min: 12, max: 20 },
    'Shoulders': { min: 10, max: 18 },
    'Biceps':    { min:  8, max: 14 },
    'Triceps':   { min:  8, max: 14 },
    'Legs':      { min: 14, max: 22 },
    'Core':      { min:  6, max: 12 },
    'Forearms':  { min:  4, max: 10 },
};

// VOLUME_MUSCLE_MAP: each exercise → single primary volume group
const VOLUME_MUSCLE_MAP = {
    // Chest
    'Barbell Bench Press':'Chest','Incline Barbell Bench Press':'Chest',
    'Decline Barbell Bench Press':'Chest','Dumbbell Bench Press':'Chest',
    'Incline Dumbbell Press':'Chest','Decline Dumbbell Press':'Chest',
    'Dumbbell Fly':'Chest','Incline Dumbbell Fly':'Chest','Cable Fly':'Chest',
    'Pec Deck Machine Fly':'Chest','Chest Press Machine':'Chest',
    'Push-Up':'Chest','Weighted Push-Up':'Chest','Dips (Chest Focus)':'Chest',
    // Back
    'Pull-Up':'Back','Chin-Up':'Back','Lat Pulldown':'Back',
    'Close Grip Lat Pulldown':'Back','Barbell Row':'Back','Pendlay Row':'Back',
    'T-Bar Row':'Back','Dumbbell Row':'Back','Seated Cable Row':'Back',
    'Chest Supported Row':'Back','Machine Row':'Back',
    'Straight Arm Pulldown':'Back','Deadlift':'Back','Rack Pull':'Back',
    // Shoulders (all shoulder exercises → single group)
    'Overhead Press':'Shoulders','Seated Dumbbell Shoulder Press':'Shoulders',
    'Arnold Press':'Shoulders','Machine Shoulder Press':'Shoulders',
    'Lateral Raise':'Shoulders','Cable Lateral Raise':'Shoulders',
    'Front Raise':'Shoulders','Rear Delt Fly':'Shoulders',
    'Reverse Pec Deck':'Shoulders','Face Pull':'Shoulders','Upright Row':'Shoulders',
    // Biceps
    'Barbell Curl':'Biceps','EZ Bar Curl':'Biceps','Dumbbell Curl':'Biceps',
    'Alternating Dumbbell Curl':'Biceps','Hammer Curl':'Biceps','Preacher Curl':'Biceps',
    'Cable Curl':'Biceps','Concentration Curl':'Biceps',
    'Incline Dumbbell Curl':'Biceps','Spider Curl':'Biceps',
    // Triceps
    'Tricep Pushdown':'Triceps','Rope Pushdown':'Triceps','Skull Crusher':'Triceps',
    'Close Grip Bench Press':'Triceps','Overhead Tricep Extension':'Triceps',
    'Dumbbell Kickback':'Triceps','Dips (Tricep Focus)':'Triceps',
    'Cable Overhead Extension':'Triceps','Machine Tricep Extension':'Triceps',
    // Legs (all leg exercises → single group)
    'Back Squat':'Legs','Front Squat':'Legs','Hack Squat':'Legs',
    'Leg Press':'Legs','Bulgarian Split Squat':'Legs','Walking Lunge':'Legs',
    'Leg Extension':'Legs','Goblet Squat':'Legs','Step-Up':'Legs',
    'Romanian Deadlift':'Legs','Stiff Leg Deadlift':'Legs',
    'Lying Leg Curl':'Legs','Seated Leg Curl':'Legs',
    'Glute Ham Raise':'Legs','Nordic Curl':'Legs',
    'Hip Thrust':'Legs','Glute Bridge':'Legs','Cable Kickback':'Legs',
    'Standing Calf Raise':'Legs','Seated Calf Raise':'Legs',
    'Leg Press Calf Raise':'Legs','Single Leg Calf Raise':'Legs',
    // Core
    'Crunch':'Core','Sit-Up':'Core','Cable Crunch':'Core',
    'Hanging Leg Raise':'Core','Hanging Knee Raise':'Core','Russian Twist':'Core',
    'Bicycle Crunch':'Core','Ab Wheel Rollout':'Core','Plank':'Core',
    'Side Plank':'Core','Mountain Climbers':'Core',
    // Forearms
    'Barbell Wrist Curl':'Forearms','Dumbbell Wrist Curl':'Forearms',
    'Barbell Reverse Wrist Curl':'Forearms','Dumbbell Reverse Wrist Curl':'Forearms',
    'Cable Wrist Curl':'Forearms','EZ Bar Wrist Curl':'Forearms',
    "Farmer's Carry":'Forearms','Plate Pinch':'Forearms',
    'Wrist Roller':'Forearms','Lever Curl':'Forearms'
};

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
let plannedWorkouts = [];
let planExercises = [];
let selectedTemplateId = null;
let chartAnimId = null;
let chartState  = null;
let editingWorkoutId    = null;
let lastDeletedWorkout  = null;
let undoTimer           = null;
let calendarYear  = new Date().getFullYear();
let calendarMonth = new Date().getMonth();

const currentPage = document.body.getAttribute('data-page') || 'dashboard';
const PLANNED_STORAGE_KEY = 'plannedWorkoutsData';

// ========================================
// THEME TOGGLE
// ========================================

function initTheme() {
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
    }
    updateThemeToggleUI();
}

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateThemeToggleUI();
    // Redraw canvas charts with new background colour
    if (currentPage === 'dashboard') {
        drawChartFull();
        renderMuscleRadar();
    } else if (currentPage === 'statistics') {
        renderMuscleGroupProgress();
    }
}

function updateThemeToggleUI() {
    const isLight = document.body.classList.contains('light-mode');
    const icon  = document.getElementById('themeIcon');
    const label = document.getElementById('themeLabel');
    if (icon)  icon.textContent  = isLight ? '🌙' : '☀️';
    if (label) label.textContent = isLight ? 'Dark Mode' : 'Light Mode';
}

function chartBg()    { return document.body.classList.contains('light-mode') ? '#ffffff' : '#1e1c35'; }
function chartLabel() { return document.body.classList.contains('light-mode') ? '#9ca3af' : '#4e4c6a'; }

// ========================================
// KEYBOARD SHORTCUTS
// ========================================

// ========================================
// MOBILE SIDEBAR
// ========================================

function setupMobileSidebar() {
    // Inject overlay behind sidebar
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebarOverlay';
    overlay.addEventListener('click', closeSidebar);
    document.body.appendChild(overlay);

    // Inject hamburger into header (first child)
    const header = document.querySelector('header');
    if (header) {
        const btn = document.createElement('button');
        btn.className = 'hamburger-btn';
        btn.setAttribute('aria-label', 'Open menu');
        btn.innerHTML = '&#9776;';
        btn.addEventListener('click', toggleSidebar);
        header.insertBefore(btn, header.firstChild);
    }
}

function toggleSidebar() {
    document.querySelector('.sidebar')?.classList.toggle('sidebar-open');
    document.getElementById('sidebarOverlay')?.classList.toggle('sidebar-overlay-open');
}

function closeSidebar() {
    document.querySelector('.sidebar')?.classList.remove('sidebar-open');
    document.getElementById('sidebarOverlay')?.classList.remove('sidebar-overlay-open');
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
        const tag = document.activeElement ? document.activeElement.tagName : '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        if (e.key === 'n' || e.key === 'N') showWorkoutLayoutModal();
        if (e.key === 'Escape') {
            closeWorkoutLayoutModal();
            const planModal = document.getElementById('planWorkoutModal');
            if (planModal) planModal.classList.add('hidden');
        }
    });
}

// ========================================
// UNDO DELETE
// ========================================

function showUndoToast(workoutName) {
    const old = document.getElementById('undoToast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.id = 'undoToast';
    toast.className = 'undo-toast';
    toast.innerHTML =
        '<div class="undo-toast-msg">Deleted "' + workoutName + '"</div>' +
        '<button class="undo-toast-btn" onclick="undoDelete()">Undo</button>' +
        '<div class="undo-progress-bar"><div class="undo-progress-fill"></div></div>';
    document.body.appendChild(toast);

    requestAnimationFrame(() => requestAnimationFrame(() => {
        toast.classList.add('undo-toast-show');
        const fill = toast.querySelector('.undo-progress-fill');
        if (fill) { fill.style.transition = 'width 5s linear'; fill.style.width = '0%'; }
    }));

    undoTimer = setTimeout(() => {
        toast.classList.add('undo-toast-hide');
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
        lastDeletedWorkout = null; undoTimer = null;
    }, 5000);
}

function undoDelete() {
    if (!lastDeletedWorkout) return;
    clearTimeout(undoTimer); undoTimer = null;
    workouts.push(lastDeletedWorkout);
    lastDeletedWorkout = null;
    saveToLocalStorage(); renderStats();
    const toast = document.getElementById('undoToast');
    if (toast) { toast.classList.add('undo-toast-hide'); setTimeout(() => toast.remove(), 400); }
}

// ========================================
// ANIMATION HELPERS
// ========================================

function animateCounter(element, target, formatter, duration) {
    if (!element) return;
    duration = duration || 700;
    const startRaw = element.textContent.replace(/[^0-9.\-]/g, '');
    const start = parseFloat(startRaw) || 0;
    const startTime = performance.now();

    function tick(now) {
        const t = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 2); // ease-out quad
        const current = start + (target - start) * eased;
        element.textContent = formatter(current);
        if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

const STORAGE_KEY = 'workoutTrackerData';

// ========================================
// 4. INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupMobileSidebar();
    setupCalendarTooltip();
    loadFromLocalStorage();
    loadPlannedWorkouts();

    if (currentPage === 'dashboard') {
        populateExerciseDropdown();
        populatePlanExerciseDropdown();
        setDefaultDate();
        setupEventListeners();
        setupKeyboardShortcuts();

        // If the user tapped a planned workout on the calendar, load it now
        const pendingPlanId = sessionStorage.getItem('pendingPlan');
        if (pendingPlanId) {
            const plan = plannedWorkouts.find(p => p.id === pendingPlanId);
            sessionStorage.removeItem('pendingPlan');
            if (plan) {
                plannedWorkouts = plannedWorkouts.filter(p => p.id !== pendingPlanId);
                savePlannedWorkouts();
                setTimeout(() => loadFromPlannedWorkout(plan), 50);
            }
        }

        updateTotalStats();
        renderWorkoutHistory();
        renderWorkoutCalendar();
        renderProgressChart();
        renderMuscleRadar();

        // Radar tooltip element
        const rtt = document.createElement('div');
        rtt.id = 'radarTooltip'; rtt.className = 'radar-tooltip'; rtt.style.display = 'none';
        document.body.appendChild(rtt);
        setupRadarHover(document.getElementById('muscleRadarChart'));

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                renderProgressChart();
                renderMuscleRadar();
            }, 150);
        });

        // Chart animates on hover
        const chartContainer = document.querySelector('.progress-chart-container');
        if (chartContainer) {
            chartContainer.addEventListener('mouseenter', animateChartOnHover);
        }
    } else if (currentPage === 'statistics') {
        renderMuscleGroupProgress();
        renderWeeklyVolumeLandmarks();
    } else if (currentPage === 'achievements') {
        renderPersonalRecords();
        document.getElementById('prSearch')?.addEventListener('input', renderPersonalRecords);
    } else if (currentPage === 'calendar') {
        renderCalendarPage();
    }
});

// ========================================
// 5. POPULATE EXERCISE DROPDOWN
// ========================================

function populateExerciseDropdown() {
    const dropdown = document.getElementById('exerciseDropdown');
    if (!dropdown) return;

    dropdown.innerHTML = '';
    Object.entries(EXERCISES_BY_MUSCLE).forEach(([muscle, exercises]) => {
        const groupEl = document.createElement('div');
        groupEl.className = 'exercise-dropdown-group';
        groupEl.textContent = muscle;
        dropdown.appendChild(groupEl);
        exercises.forEach(ex => {
            const item = document.createElement('div');
            item.className = 'exercise-dropdown-item';
            item.textContent = ex;
            item.addEventListener('mousedown', e => { e.preventDefault(); selectExercise(ex); });
            dropdown.appendChild(item);
        });
    });

    const searchInput = document.getElementById('exerciseSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterExerciseDropdown);
        searchInput.addEventListener('focus', () => { filterExerciseDropdown(); dropdown.classList.remove('hidden'); });
        searchInput.addEventListener('blur',  () => { setTimeout(() => dropdown.classList.add('hidden'), 160); });
    }
}

function filterExerciseDropdown() {
    const dropdown   = document.getElementById('exerciseDropdown');
    const searchInput = document.getElementById('exerciseSearchInput');
    if (!dropdown || !searchInput) return;
    const q = searchInput.value.toLowerCase().trim();
    dropdown.classList.remove('hidden');
    dropdown.querySelectorAll('.exercise-dropdown-item').forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
    dropdown.querySelectorAll('.exercise-dropdown-group').forEach(group => {
        let el = group.nextElementSibling; let visible = false;
        while (el && !el.classList.contains('exercise-dropdown-group')) {
            if (el.style.display !== 'none') visible = true;
            el = el.nextElementSibling;
        }
        group.style.display = visible ? '' : 'none';
    });
}

function selectExercise(value) {
    const hidden = document.getElementById('exerciseSelect');
    const searchInput = document.getElementById('exerciseSearchInput');
    const dropdown = document.getElementById('exerciseDropdown');
    if (hidden) hidden.value = value;
    if (searchInput) searchInput.value = value;
    if (dropdown) dropdown.classList.add('hidden');
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
    // Search filter for history
    const historySearch = document.getElementById('historySearch');
    if (historySearch) historySearch.addEventListener('input', () => renderWorkoutHistory());

    if (startNewWorkoutBtn) startNewWorkoutBtn.addEventListener('click', () => showWorkoutLayoutModal());
    if (closeLayoutModalBtn) closeLayoutModalBtn.addEventListener('click', () => closeWorkoutLayoutModal());
    if (layoutModalOverlay) layoutModalOverlay.addEventListener('click', () => closeWorkoutLayoutModal());
    if (createNewWorkoutBtn) createNewWorkoutBtn.addEventListener('click', () => startNewWorkoutFromModal());

    // Dashboard calendar navigation
    const dashPrev = document.getElementById('dashCalPrevBtn');
    const dashNext = document.getElementById('dashCalNextBtn');
    if (dashPrev) dashPrev.addEventListener('click', () => {
        calendarMonth--;
        if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
        renderWorkoutCalendar();
    });
    if (dashNext) dashNext.addEventListener('click', () => {
        calendarMonth++;
        if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
        renderWorkoutCalendar();
    });

    // Plan workout modal (shared with calendar page, now also on dashboard)
    document.getElementById('closePlanModalBtn')?.addEventListener('click', closePlanModal);
    document.getElementById('cancelPlanBtn')?.addEventListener('click', closePlanModal);
    document.getElementById('planModalBackdrop')?.addEventListener('click', closePlanModal);
    document.getElementById('addPlanExerciseBtn')?.addEventListener('click', addPlanExercise);
    document.getElementById('savePlanBtn')?.addEventListener('click', savePlan);
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
    if (exerciseSelect) exerciseSelect.value = '';
    const si = document.getElementById('exerciseSearchInput');
    if (si) si.value = '';
    if (exerciseNumSetsInput) exerciseNumSetsInput.value = '';

    // Scroll to the add exercise form so the user sees it immediately
    setTimeout(() => {
        if (addExerciseForm) addExerciseForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
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
    const exercise = (document.getElementById('exerciseSelect') || exerciseSelect || {}).value?.trim() || '';
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

    currentWorkout.exercises.forEach((exercise, exIdx) => {
        const item = document.createElement('div');
        item.className = 'current-exercise-item';

        const detailsEl = document.createElement('div');
        detailsEl.className = 'current-exercise-item-details';

        const nameEl = document.createElement('h4');
        nameEl.textContent = exercise.exercise;

        const muscleEl = document.createElement('p');
        muscleEl.className = 'current-exercise-item-muscle';
        muscleEl.textContent = exercise.muscleGroup;

        const setsEl = document.createElement('div');
        setsEl.className = 'current-sets-edit';

        exercise.sets.forEach((set, si) => {
            const row = document.createElement('div');
            row.className = 'current-set-edit-row';
            row.innerHTML =
                '<span class="set-label">Set ' + (si + 1) + '</span>' +
                '<input type="number" class="set-weight-edit" value="' + set.weight + '" min="0" step="0.5" placeholder="lbs">' +
                '<span class="set-unit">lbs ×</span>' +
                '<input type="number" class="set-reps-edit" value="' + set.reps + '" min="1" placeholder="reps">' +
                '<span class="set-unit">reps</span>';

            // Live-update currentWorkout when user edits
            row.querySelector('.set-weight-edit').addEventListener('input', function() {
                const v = parseFloat(this.value);
                if (!isNaN(v)) currentWorkout.exercises[exIdx].sets[si].weight = v;
            });
            row.querySelector('.set-reps-edit').addEventListener('input', function() {
                const v = parseInt(this.value);
                if (!isNaN(v)) currentWorkout.exercises[exIdx].sets[si].reps = v;
            });

            setsEl.appendChild(row);
        });

        detailsEl.appendChild(nameEl);
        detailsEl.appendChild(muscleEl);
        detailsEl.appendChild(setsEl);

        const removeEl = document.createElement('div');
        removeEl.className = 'current-exercise-item-remove';
        removeEl.innerHTML = '<button class="btn btn-delete" onclick="removeExerciseFromCurrentWorkout(' + exIdx + ')">Remove</button>';

        item.appendChild(detailsEl);
        item.appendChild(removeEl);
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

    const newPRs = checkForNewPRs(currentWorkout);

    if (editingWorkoutId) {
        const idx = workouts.findIndex(w => w.id === editingWorkoutId);
        if (idx !== -1) workouts[idx] = { ...currentWorkout };
        editingWorkoutId = null;
        if (saveWorkoutBtn) saveWorkoutBtn.textContent = 'Save Workout';
    } else {
        workouts.push({ ...currentWorkout });
    }
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

    // Show PR celebration if any new records were set
    if (newPRs.length > 0) setTimeout(() => showPRCelebration(newPRs), 400);
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

// Returns time-series percent change data for one muscle group
function getMuscleGroupProgressOverTime(muscle) {
    const allEntries = getAllExerciseEntries(workouts);
    const muscleEntries = allEntries.filter(e => e.muscleGroup === muscle);
    if (muscleEntries.length < 2) return null;

    const firstEver = buildFirstEverMap(muscleEntries);
    const uniqueDates = [...new Set(muscleEntries.map(e => e.workoutDate))].sort();
    if (uniqueDates.length < 2) return null;

    const percentages = uniqueDates.map(date => {
        let total = 0;
        Object.keys(firstEver).forEach(exercise => {
            const base = firstEver[exercise];
            const later = muscleEntries.filter(e =>
                e.exercise === exercise && e.workoutDate > base.date && e.workoutDate <= date
            );
            if (!later.length) return;
            const lastDate = later.reduce((m, e) => e.workoutDate > m ? e.workoutDate : m, later[0].workoutDate);
            const best = Math.max(...later.filter(e => e.workoutDate === lastDate).map(e => e.best1RM));
            if (base.best1RM > 0) total += ((best - base.best1RM) / base.best1RM) * 100;
        });
        return total;
    });

    return { dates: uniqueDates, percentages };
}

// Draw mini neon-green chart into a canvas element; animate=true plays left-to-right reveal
function drawMiniChart(canvas, data, animate) {
    if (!canvas || !data) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth || 260;
    const h = canvas.offsetHeight || 72;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const { dates, percentages } = data;
    const pad = { top: 6, right: 6, bottom: 6, left: 6 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;

    const maxP = Math.max(...percentages, 0.1);
    const minP = Math.min(...percentages, 0);
    const buf  = (maxP - minP) * 0.2 || 1;
    const pMax = maxP + buf;
    const pMin = minP - buf;
    const pRange = pMax - pMin;

    const getX = i => pad.left + (cw / Math.max(dates.length - 1, 1)) * i;
    const getY = p => pad.top + ((pMax - p) / pRange) * ch;
    const pts = percentages.map((p, i) => ({ x: getX(i), y: getY(p) }));

    function drawCurve() {
        if (pts.length === 2) { ctx.lineTo(pts[1].x, pts[1].y); return; }
        const t = 0.35;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[Math.max(i-1,0)], p1 = pts[i];
            const p2 = pts[i+1], p3 = pts[Math.min(i+2, pts.length-1)];
            ctx.bezierCurveTo(
                p1.x+(p2.x-p0.x)*t, p1.y+(p2.y-p0.y)*t,
                p2.x-(p3.x-p1.x)*t, p2.y-(p3.y-p1.y)*t,
                p2.x, p2.y
            );
        }
    }

    const NEON = '#39ff8a';
    const grad = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
    grad.addColorStop(0,   'rgba(57,255,138,0.35)');
    grad.addColorStop(1,   'rgba(57,255,138,0)');

    function paint(progress) {
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, pad.left + cw * progress, h);
        ctx.clip();

        ctx.beginPath();
        ctx.moveTo(pts[0].x, h - pad.bottom);
        ctx.lineTo(pts[0].x, pts[0].y);
        drawCurve();
        ctx.lineTo(pts[pts.length-1].x, h - pad.bottom);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        drawCurve();
        ctx.strokeStyle = NEON;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.restore();
    }

    if (!animate) { paint(1); return; }

    const DURATION = 1000;
    let start = null;
    function frame(ts) {
        if (!start) start = ts;
        const t = Math.min((ts - start) / DURATION, 1);
        paint(1 - Math.pow(1 - t, 3));
        if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

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

        const sign        = group.totalPercentIncrease >= 0 ? '+' : '';
        const changeClass = group.totalPercentIncrease >= 0 ? 'positive' : 'negative';
        const target      = group.totalPercentIncrease;

        const breakdown = group.exerciseChanges.length > 0
            ? group.exerciseChanges.map(ex => {
                const exSign = ex.percentChange >= 0 ? '+' : '';
                return `<div class="exercise-change-row">
                    <span class="exercise-change-name">${ex.exercise}</span>
                    <span class="exercise-change-value ${ex.percentChange >= 0 ? 'positive' : 'negative'}">${exSign}${ex.percentChange.toFixed(1)}%</span>
                </div>`;
              }).join('')
            : '<p class="empty-message" style="font-size:0.85em;margin:8px 0 0;">Need 2+ entries per exercise to show data.</p>';

        // Build card HTML
        const nameEl     = document.createElement('div');
        nameEl.className = 'muscle-group-card-name';
        nameEl.textContent = group.muscle;

        const changeEl     = document.createElement('div');
        changeEl.className = 'muscle-group-total-change ' + changeClass;
        changeEl.textContent = sign + target.toFixed(1) + '%';

        const miniCanvas     = document.createElement('canvas');
        miniCanvas.className = 'muscle-mini-chart';

        const breakdownEl     = document.createElement('div');
        breakdownEl.className = 'muscle-group-exercises-breakdown';
        breakdownEl.innerHTML = breakdown;

        card.appendChild(nameEl);
        card.appendChild(changeEl);
        card.appendChild(miniCanvas);
        card.appendChild(breakdownEl);
        container.appendChild(card);

        // Calculate chart data and draw statically
        const chartData = getMuscleGroupProgressOverTime(group.muscle);
        setTimeout(() => drawMiniChart(miniCanvas, chartData, false), 0);

        // On hover: animate counter + chart
        card.addEventListener('mouseenter', () => {
            animateCounter(changeEl, target, v => (v >= 0 ? '+' : '') + v.toFixed(1) + '%', 700);
            drawMiniChart(miniCanvas, chartData, true);
        });
    });
}

// ========================================
// 12D. RENDER PERSONAL RECORDS
// ========================================

function renderPersonalRecords() {
    const container = document.getElementById('personalRecords');
    if (!container) return;

    const query = (document.getElementById('prSearch')?.value || '').toLowerCase().trim();
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

    // Filter by search query, then group by muscle group
    const byMuscle = {};
    Object.values(prByExercise)
        .filter(pr => !query || pr.exercise.toLowerCase().includes(query))
        .forEach(pr => {
            if (!byMuscle[pr.muscleGroup]) byMuscle[pr.muscleGroup] = [];
            byMuscle[pr.muscleGroup].push(pr);
        });

    container.innerHTML = '';
    if (Object.keys(byMuscle).length === 0) {
        container.innerHTML = '<p class="empty-message">No exercises match your search.</p>';
        return;
    }
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

    // Apply search filter
    const query = (document.getElementById('historySearch')?.value || '').toLowerCase().trim();
    let sorted = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (query) {
        sorted = sorted.filter(w =>
            w.name.toLowerCase().includes(query) ||
            w.exercises.some(e => e.exercise.toLowerCase().includes(query))
        );
    }

    if (sorted.length === 0) {
        workoutHistoryContainer.innerHTML = '<p class="empty-message">No workouts match your search.</p>';
        return;
    }

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
                <button class="btn btn-edit-history" onclick="event.stopPropagation(); editWorkout('${workout.id}')">✏️ Edit</button>
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
    // Animate total workouts count
    animateCounter(
        totalWorkoutsDisplay,
        workouts.length,
        v => Math.round(v).toString()
    );

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

    // Animate streak
    const streakEl = document.getElementById('weekStreak');
    animateCounter(streakEl, calculateWeekStreak(), v => Math.round(v).toString());

    // Animate total progress percentage
    const totalProgress = calculateTotalProgressPercentage();
    animateCounter(
        totalProgressDisplay,
        totalProgress,
        v => (v >= 0 ? '+' : '') + v.toFixed(1) + '%'
    );
}

function calculateWeekStreak() {
    if (workouts.length === 0) return 0;

    // Get Monday timestamp for any date
    function weekStart(date) {
        const d = new Date(date); d.setHours(0,0,0,0);
        const day = d.getDay();
        d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
        return d.getTime();
    }

    const weeksWithWorkout = new Set(
        workouts.map(w => weekStart(new Date(w.date + 'T00:00:00')))
    );

    const todayWeek = weekStart(new Date());
    let check = weeksWithWorkout.has(todayWeek) ? todayWeek : todayWeek - 7 * 86400000;
    let streak = 0;

    while (weeksWithWorkout.has(check)) {
        streak++;
        check -= 7 * 86400000;
        if (streak > 104) break;
    }
    return streak;
}

// ========================================
// 22. RENDER STATS
// ========================================

function renderStats() {
    updateTotalStats();
    renderWorkoutHistory();
    renderWorkoutCalendar();
    renderProgressChart();
    renderMuscleRadar();
}

// ========================================
// 23. DELETE WORKOUT
// ========================================

function deleteWorkout(workoutId) {
    const workout = workouts.find(w => w.id === workoutId);
    if (!workout) return;
    // Clear any pending undo
    if (undoTimer) { clearTimeout(undoTimer); undoTimer = null; }
    const prev = document.getElementById('undoToast');
    if (prev) prev.remove();

    lastDeletedWorkout = workout;
    workouts = workouts.filter(w => w.id !== workoutId);
    saveToLocalStorage();
    renderStats();
    showUndoToast(workout.name);
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
    selectExercise(exercise.exercise);

    if (exercise.sets && exercise.sets.length > 0) {
        // Past workout template — pre-fill sets and weights
        if (exerciseNumSetsInput) exerciseNumSetsInput.value = exercise.sets.length;
        generateExerciseSetInputs(exercise.sets.length);
        exercise.sets.forEach((set, i) => {
            const w = document.getElementById('ex-weight-' + (i + 1));
            const r = document.getElementById('ex-reps-'   + (i + 1));
            if (w) w.value = set.weight;
            if (r) r.value = set.reps;
        });
    } else {
        // Planned workout — exercise name only, user fills in sets
        if (exerciseNumSetsInput) exerciseNumSetsInput.value = '';
        if (exerciseSetsContainer) exerciseSetsContainer.innerHTML = '';
    }
}

// ========================================
// 27B. RENDER WORKOUT CALENDAR
// ========================================

function renderWorkoutCalendar() {
    if (!workoutCalendar) return;

    // Update month/year label (same state variables as full calendar page)
    const MONTHS = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    const label = document.getElementById('dashCalMonthYear');
    if (label) label.textContent = MONTHS[calendarMonth] + ' ' + calendarYear;

    const today = new Date();
    today.setHours(0,0,0,0);

    // Completed workouts this month
    const completedMap = {};
    workouts.forEach(w => {
        const d = new Date(w.date + 'T00:00:00');
        if (d.getFullYear() === calendarYear && d.getMonth() === calendarMonth) {
            const day = d.getDate();
            if (!completedMap[day]) completedMap[day] = [];
            completedMap[day].push(w.name);
        }
    });

    // Planned workouts this month
    const plannedMap = {};
    plannedWorkouts.forEach(p => {
        const d = new Date(p.date + 'T00:00:00');
        if (d.getFullYear() === calendarYear && d.getMonth() === calendarMonth) {
            const day = d.getDate();
            if (!plannedMap[day]) plannedMap[day] = [];
            plannedMap[day].push(p);
        }
    });

    const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth    = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    workoutCalendar.innerHTML = '';

    // Blank filler cells
    for (let i = 0; i < firstDayOfWeek; i++) {
        const blank = document.createElement('div');
        blank.className = 'cal-day cal-blank';
        workoutCalendar.appendChild(blank);
    }

    // Day cells — identical logic + classes to renderFullCalendar()
    for (let day = 1; day <= daysInMonth; day++) {
        const cellDate   = new Date(calendarYear, calendarMonth, day);
        const isToday    = cellDate.getTime() === today.getTime();
        const isPast     = cellDate < today;
        const isFuture   = cellDate > today;

        const completed  = completedMap[day] || [];
        const plans      = plannedMap[day]   || [];
        const hasCompleted = completed.length > 0;
        const hasPlanned   = plans.length > 0;

        let status = 'grey';
        if (hasCompleted)                status = 'green';
        else if (isPast || isToday)      status = 'red';
        else if (isFuture && hasPlanned) status = 'blue';

        const cell = document.createElement('div');
        cell.className = 'cal-day cal-' + status + (isToday ? ' cal-today' : '');
        const mm = String(calendarMonth + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        cell.dataset.date = calendarYear + '-' + mm + '-' + dd;

        const numEl = document.createElement('div');
        numEl.className = 'cal-day-number';
        numEl.textContent = day;
        cell.appendChild(numEl);

        completed.forEach(name => {
            const lbl = document.createElement('div');
            lbl.className = 'cal-event-label cal-label-green';
            lbl.textContent = name;
            cell.appendChild(lbl);
        });

        plans.forEach(p => {
            const lbl = document.createElement('div');
            lbl.className = 'cal-event-label cal-label-blue';
            lbl.textContent = p.name + (p.time ? ' ' + formatTime(p.time) : '');
            cell.appendChild(lbl);
        });

        if (hasPlanned && !hasCompleted && isFuture) {
            cell.style.cursor = 'pointer';
            cell.addEventListener('click', () => startFromPlan(plans[0].id));
        } else if (isFuture || isToday) {
            cell.style.cursor = 'pointer';
            cell.addEventListener('click', () => openPlanModal(cellDate));
        }

        cell.addEventListener('mouseenter', () => showCalTooltip(day, calendarYear, calendarMonth, completedMap, plannedMap, cell));
        cell.addEventListener('mouseleave', hideCalTooltip);

        workoutCalendar.appendChild(cell);
    }
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

    // Catmull-Rom cubic bezier — smooth tangent continuity, no kinks at joins
    function drawCurveSegments() {
        if (pts.length === 2) { ctx.lineTo(pts[1].x, pts[1].y); return; }
        const t = 0.35; // tension
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[Math.max(i - 1, 0)];
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p3 = pts[Math.min(i + 2, pts.length - 1)];
            ctx.bezierCurveTo(
                p1.x + (p2.x - p0.x) * t,
                p1.y + (p2.y - p0.y) * t,
                p2.x - (p3.x - p1.x) * t,
                p2.y - (p3.y - p1.y) * t,
                p2.x, p2.y
            );
        }
    }

    const NEON = '#39ff8a';
    const grad = ctx.createLinearGradient(0, pad.top, 0, height - pad.bottom);
    grad.addColorStop(0.00, 'rgba(57, 255, 138, 0.38)');
    grad.addColorStop(0.18, 'rgba(57, 255, 138, 0.18)');
    grad.addColorStop(1.00, 'rgba(57, 255, 138, 0.00)');

    // Save state so hover animation can replay with latest data
    chartState = { ctx, canvas, width, height, pts, grad, pad, cw, ch,
                   pMax, pRange, uniqueDates, drawCurve: drawCurveSegments };

    // Draw statically (instant) on every render
    drawChartFull();
}

function drawChartFull() {
    if (!chartState) return;
    const { ctx, width, height, pts, grad, pad, cw, ch, pMax, pRange, uniqueDates } = chartState;
    const NEON = '#39ff8a';
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = chartBg();
    ctx.fillRect(0, 0, width, height);

    // Y-axis labels
    ctx.fillStyle = chartLabel();
    ctx.font = '11px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const p = pMax - (pRange / 4) * i;
        const y = pad.top + (ch / 4) * i;
        ctx.fillText((p >= 0 ? '+' : '') + p.toFixed(0) + '%', pad.left - 8, y + 4);
    }

    // X-axis date labels
    pts.forEach((pt, i) => {
        const d = new Date(uniqueDates[i]);
        const label = MONTHS[d.getMonth()] + ' ' + d.getDate();
        ctx.save();
        ctx.translate(pt.x, height - pad.bottom + 8);
        ctx.rotate(-Math.PI / 4);
        ctx.fillStyle = chartLabel();
        ctx.font = '10px -apple-system, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(label, 0, 0);
        ctx.restore();
    });

    // Gradient fill
    ctx.beginPath();
    ctx.moveTo(pts[0].x, height - pad.bottom);
    ctx.lineTo(pts[0].x, pts[0].y);
    chartState.drawCurve();
    ctx.lineTo(pts[pts.length - 1].x, height - pad.bottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Neon stroke
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    chartState.drawCurve();
    ctx.strokeStyle = NEON;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
}

function animateChartOnHover() {
    if (!chartState) return;
    const { ctx, width, height, pts, grad, pad, cw, ch, pMax, pRange, uniqueDates } = chartState;
    const NEON = '#39ff8a';
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    if (chartAnimId) { cancelAnimationFrame(chartAnimId); chartAnimId = null; }

    const ANIM_DURATION = 1200;
    let animStart = null;

    function drawLabels() {
        ctx.fillStyle = chartLabel();
        ctx.font = '11px -apple-system, sans-serif';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 4; i++) {
            const p = pMax - (pRange / 4) * i;
            const y = pad.top + (ch / 4) * i;
            ctx.fillText((p >= 0 ? '+' : '') + p.toFixed(0) + '%', pad.left - 8, y + 4);
        }
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

    function frame(timestamp) {
        if (!animStart) animStart = timestamp;
        const t = Math.min((timestamp - animStart) / ANIM_DURATION, 1);
        const eased = 1 - Math.pow(1 - t, 3);

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = chartBg();
        ctx.fillRect(0, 0, width, height);
        drawLabels();

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, pad.left + cw * eased, height);
        ctx.clip();

        ctx.beginPath();
        ctx.moveTo(pts[0].x, height - pad.bottom);
        ctx.lineTo(pts[0].x, pts[0].y);
        chartState.drawCurve();
        ctx.lineTo(pts[pts.length - 1].x, height - pad.bottom);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        chartState.drawCurve();
        ctx.strokeStyle = NEON;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        ctx.restore();

        if (t < 1) {
            chartAnimId = requestAnimationFrame(frame);
        } else {
            chartAnimId = null;
        }
    }

    chartAnimId = requestAnimationFrame(frame);
}

console.log('Workout Tracker initialized successfully!');

// ========================================
// PLANNED WORKOUTS — PERSISTENCE
// ========================================

function loadPlannedWorkouts() {
    try {
        const stored = localStorage.getItem(PLANNED_STORAGE_KEY);
        if (stored) plannedWorkouts = JSON.parse(stored);
    } catch (e) { plannedWorkouts = []; }
}

function savePlannedWorkouts() {
    try {
        localStorage.setItem(PLANNED_STORAGE_KEY, JSON.stringify(plannedWorkouts));
    } catch (e) {}
}

// ========================================
// CALENDAR PAGE — RENDERING
// ========================================

function renderCalendarPage() {
    populatePlanExerciseDropdown();
    renderFullCalendar();
    setupCalendarListeners();
}

function populatePlanExerciseDropdown() {
    const sel = document.getElementById('planExerciseSelect');
    if (!sel) return;
    sel.innerHTML = '<option value="">Select an exercise...</option>';
    Object.entries(EXERCISES_BY_MUSCLE).forEach(([muscle, exercises]) => {
        const grp = document.createElement('optgroup');
        grp.label = muscle;
        exercises.forEach(ex => {
            const opt = document.createElement('option');
            opt.value = ex;
            opt.textContent = ex;
            grp.appendChild(opt);
        });
        sel.appendChild(grp);
    });
}

function renderFullCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthLabel = document.getElementById('calendarMonthYear');
    if (!grid) return;

    const MONTHS = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    if (monthLabel) monthLabel.textContent = MONTHS[calendarMonth] + ' ' + calendarYear;

    const today = new Date();
    today.setHours(0,0,0,0);

    const completedMap = {};
    workouts.forEach(w => {
        const d = new Date(w.date + 'T00:00:00');
        if (d.getFullYear() === calendarYear && d.getMonth() === calendarMonth) {
            const day = d.getDate();
            if (!completedMap[day]) completedMap[day] = [];
            completedMap[day].push(w.name);
        }
    });

    const plannedMap = {};
    plannedWorkouts.forEach(p => {
        const d = new Date(p.date + 'T00:00:00');
        if (d.getFullYear() === calendarYear && d.getMonth() === calendarMonth) {
            const day = d.getDate();
            if (!plannedMap[day]) plannedMap[day] = [];
            plannedMap[day].push(p);
        }
    });

    const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth    = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    grid.innerHTML = '';

    for (let i = 0; i < firstDayOfWeek; i++) {
        const blank = document.createElement('div');
        blank.className = 'cal-day cal-blank';
        grid.appendChild(blank);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cellDate = new Date(calendarYear, calendarMonth, day);
        const isToday  = cellDate.getTime() === today.getTime();
        const isPast   = cellDate <  today;
        const isFuture = cellDate >  today;

        const completed = completedMap[day] || [];
        const plans     = plannedMap[day]   || [];
        const hasCompleted = completed.length > 0;
        const hasPlanned   = plans.length   > 0;

        let status = 'grey';
        if (hasCompleted)                status = 'green';
        else if (isPast || isToday)      status = 'red';
        else if (isFuture && hasPlanned) status = 'blue';

        const cell = document.createElement('div');
        cell.className = 'cal-day cal-' + status + (isToday ? ' cal-today' : '');
        const mm2 = String(calendarMonth + 1).padStart(2, '0');
        const dd2 = String(day).padStart(2, '0');
        cell.dataset.date = calendarYear + '-' + mm2 + '-' + dd2;

        const numEl = document.createElement('div');
        numEl.className = 'cal-day-number';
        numEl.textContent = day;
        cell.appendChild(numEl);

        completed.forEach(name => {
            const lbl = document.createElement('div');
            lbl.className = 'cal-event-label cal-label-green';
            lbl.textContent = name;
            cell.appendChild(lbl);
        });

        plans.forEach(p => {
            const lbl = document.createElement('div');
            lbl.className = 'cal-event-label cal-label-blue';
            lbl.textContent = p.name + (p.time ? ' ' + formatTime(p.time) : '');
            cell.appendChild(lbl);
        });

        if (hasPlanned && !hasCompleted && isFuture) {
            cell.style.cursor = 'pointer';
            cell.addEventListener('click', () => startFromPlan(plans[0].id));
        } else if (isFuture || isToday) {
            cell.style.cursor = 'pointer';
            cell.addEventListener('click', () => openPlanModal(cellDate));
        }

        cell.addEventListener('mouseenter', () => showCalTooltip(day, calendarYear, calendarMonth, completedMap, plannedMap, cell));
        cell.addEventListener('mouseleave', hideCalTooltip);

        grid.appendChild(cell);
    }
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    const hour = parseInt(parts[0]);
    const min  = parts[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12  = hour % 12 || 12;
    return h12 + ':' + min + ' ' + ampm;
}

// ========================================
// CALENDAR — LISTENERS
// ========================================

function setupCalendarListeners() {
    const prev = document.getElementById('calPrevBtn');
    const next = document.getElementById('calNextBtn');
    const closeBtn  = document.getElementById('closePlanModalBtn');
    const cancelBtn = document.getElementById('cancelPlanBtn');
    const backdrop  = document.getElementById('planModalBackdrop');
    const addEx     = document.getElementById('addPlanExerciseBtn');
    const saveBtn   = document.getElementById('savePlanBtn');

    if (prev) prev.addEventListener('click', () => {
        calendarMonth--;
        if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
        renderFullCalendar();
    });
    if (next) next.addEventListener('click', () => {
        calendarMonth++;
        if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
        renderFullCalendar();
    });
    if (closeBtn)  closeBtn.addEventListener('click', closePlanModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closePlanModal);
    if (backdrop)  backdrop.addEventListener('click', closePlanModal);
    if (addEx)     addEx.addEventListener('click', addPlanExercise);
    if (saveBtn)   saveBtn.addEventListener('click', savePlan);
}

// ========================================
// PLAN MODAL
// ========================================

function openPlanModal(date) {
    const modal = document.getElementById('planWorkoutModal');
    if (!modal) return;

    // Pre-fill date, clear other fields
    const dateStr = date.toISOString().split('T')[0];
    const di = document.getElementById('planDate');
    if (di) di.value = dateStr;
    const ni = document.getElementById('planName');
    if (ni) ni.value = '';
    const ti = document.getElementById('planTime');
    if (ti) ti.value = '';

    // Reset exercise list and template selection
    planExercises = [];
    selectedTemplateId = null;
    renderPlanExerciseList();

    // Populate past workout template buttons
    const pastList = document.getElementById('planPastWorkoutsList');
    if (pastList) {
        pastList.innerHTML = '';
        const uniqueNames = [...new Set(workouts.map(w => w.name))];
        if (uniqueNames.length === 0) {
            pastList.innerHTML = '<p class="empty-message" style="font-size:0.82em;margin:0;">No past workouts yet</p>';
        } else {
            uniqueNames.forEach(name => {
                const btn = document.createElement('button');
                btn.className = 'btn-plan-template';
                btn.textContent = name;
                btn.addEventListener('click', () => selectPlanTemplate(name, btn, pastList));
                pastList.appendChild(btn);
            });
        }
    }

    modal.classList.remove('hidden');
}

function selectPlanTemplate(workoutName, btn, container) {
    // Find the most recent workout with this name
    const template = [...workouts]
        .filter(w => w.name === workoutName)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    if (!template) return;

    // Highlight selected button
    container.querySelectorAll('.btn-plan-template').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    // Auto-fill workout name
    const ni = document.getElementById('planName');
    if (ni) ni.value = workoutName;

    // Store template ID so we can pre-fill weights when starting
    selectedTemplateId = template.id;

    // Show exercise names from that workout
    planExercises = template.exercises.map(e => e.exercise);
    renderPlanExerciseList();
}

function closePlanModal() {
    const modal = document.getElementById('planWorkoutModal');
    if (modal) modal.classList.add('hidden');
}

function addPlanExercise() {
    const sel = document.getElementById('planExerciseSelect');
    if (!sel || !sel.value) return;
    if (!planExercises.includes(sel.value)) {
        planExercises.push(sel.value);
        renderPlanExerciseList();
    }
    sel.value = '';
}

function renderPlanExerciseList() {
    const container = document.getElementById('planExerciseList');
    if (!container) return;
    container.innerHTML = '';
    planExercises.forEach(function(ex, i) {
        const item = document.createElement('div');
        item.className = 'plan-exercise-item';
        item.innerHTML = '<span>' + ex + '</span>' +
            '<button class="btn-remove-plan-ex" onclick="removePlanExercise(' + i + ')">&#x2715;</button>';
        container.appendChild(item);
    });
}

function removePlanExercise(index) {
    planExercises.splice(index, 1);
    renderPlanExerciseList();
}

function savePlan() {
    const name = (document.getElementById('planName') || {}).value;
    const date = (document.getElementById('planDate') || {}).value;
    const time = (document.getElementById('planTime') || {}).value;
    if (!name || !name.trim()) { alert('Please enter a workout name'); return; }
    if (!date) { alert('Please select a date'); return; }
    plannedWorkouts.push({
        id: crypto.randomUUID(),
        name: name.trim(),
        date: date,
        time: time || '',
        exercises: planExercises.slice(),
        templateWorkoutId: selectedTemplateId || null
    });
    const savedDate = date;
    savePlannedWorkouts();
    closePlanModal();
    if (currentPage === 'calendar') {
        renderFullCalendar();
    } else {
        renderWorkoutCalendar();
    }

    // Pulse the newly blue calendar day
    requestAnimationFrame(() => {
        const cell = document.querySelector('[data-date="' + savedDate + '"]');
        if (cell) {
            cell.classList.add('cal-pulse');
            cell.addEventListener('animationend', () => cell.classList.remove('cal-pulse'), { once: true });
        }
    });
}

// ========================================
// START WORKOUT FROM PLAN
// ========================================

function startFromPlan(planId) {
    sessionStorage.setItem('pendingPlan', planId);
    location.href = 'index.html';
}

function loadFromPlannedWorkout(plan) {
    if (createWorkoutSection) createWorkoutSection.classList.remove('hidden');
    if (workoutNameInput) workoutNameInput.value = plan.name;
    setDefaultDate();
    startNewWorkout();

    if (plan.templateWorkoutId) {
        // Created from a past workout — pre-fill weights/reps from that session
        const template = workouts.find(w => w.id === plan.templateWorkoutId);
        if (template) {
            templateQueue = template.exercises.map(ex => ({ ...ex }));
            prefillNextTemplateExercise();
            if (createWorkoutSection) createWorkoutSection.scrollIntoView({ behavior: 'smooth' });
            return;
        }
    }

    // Manually planned exercises — exercise name pre-selected, weights/reps blank
    if (plan.exercises && plan.exercises.length > 0) {
        templateQueue = plan.exercises.map(ex => ({ exercise: ex, sets: [] }));
        prefillNextTemplateExercise();
    }

    if (createWorkoutSection) createWorkoutSection.scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// FEATURE 2 — EDIT WORKOUT
// ========================================

function editWorkout(workoutId) {
    const workout = workouts.find(w => w.id === workoutId);
    if (!workout) return;

    editingWorkoutId = workoutId;

    if (workoutDetailModal) workoutDetailModal.classList.add('hidden');

    createWorkoutSection.classList.remove('hidden');
    if (workoutNameInput) workoutNameInput.value = workout.name;
    if (workoutDateInput) workoutDateInput.value = workout.date;
    // Load existing exercises into currentWorkout
    currentWorkout = {
        id: workout.id,
        name: workout.name,
        date: workout.date,
        exercises: workout.exercises.map(e => ({
            ...e,
            sets: e.sets.map(s => ({ ...s }))
        }))
    };

    // Skip the setup form, show exercises directly
    document.getElementById('workoutSetupForm').classList.add('hidden');
    addExerciseForm.classList.add('hidden');
    updateCurrentWorkoutDisplay();

    if (saveWorkoutBtn) saveWorkoutBtn.textContent = 'Update Workout';

    createWorkoutSection.scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// FEATURE 5 — EXPORT TO CSV
// ========================================

function exportToCSV() {
    if (workouts.length === 0) {
        alert('No workouts to export.');
        return;
    }

    const rows = [
        ['Date', 'Workout Name', 'Exercise', 'Muscle Group', 'Set', 'Weight (lbs)', 'Reps', 'Est. 1RM (lbs)']
    ];

    const sorted = [...workouts].sort((a, b) => new Date(a.date) - new Date(b.date));
    sorted.forEach(workout => {
        workout.exercises.forEach(exercise => {
            exercise.sets.forEach((set, i) => {
                rows.push([
                    workout.date,
                    workout.name,
                    exercise.exercise,
                    exercise.muscleGroup || '',
                    i + 1,
                    set.weight,
                    set.reps,
                    epley1RM(set.weight, set.reps).toFixed(1)
                ]);
            });
        });
    });

    const csv = rows.map(row =>
        row.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'workout-history-' + new Date().toISOString().split('T')[0] + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ========================================
// FEATURE 9 — PR CELEBRATION
// ========================================

function checkForNewPRs(workout) {
    const allPrev = getAllExerciseEntries(workouts.filter(w => w.id !== workout.id));
    const prevBestByExercise = {};
    allPrev.forEach(e => {
        if (!prevBestByExercise[e.exercise] || e.best1RM > prevBestByExercise[e.exercise]) {
            prevBestByExercise[e.exercise] = e.best1RM;
        }
    });

    const newPRs = [];
    workout.exercises.forEach(exercise => {
        const newBest1RM = getBest1RM(exercise.sets);
        const prevBest   = prevBestByExercise[exercise.exercise] || 0;

        if (newBest1RM > prevBest) {
            // Find the actual set with the highest 1RM
            const bestSet = exercise.sets.reduce((best, set) =>
                epley1RM(set.weight, set.reps) > epley1RM(best.weight, best.reps) ? set : best
            );
            newPRs.push({
                exercise: exercise.exercise,
                weight: bestSet.weight,
                reps: bestSet.reps,
                est1RM: newBest1RM
            });
        }
    });
    return newPRs;
}

function showPRCelebration(prs) {
    if (!prs.length) return;

    // Remove any existing toast
    const existing = document.getElementById('prToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'prToast';
    toast.className = 'pr-toast';

    const plural = prs.length > 1 ? 's' : '';
    toast.innerHTML =
        '<div class="pr-toast-header">🎉 New Personal Record' + plural + '!</div>' +
        prs.map(pr =>
            '<div class="pr-toast-item">🏆 ' + pr.exercise + ': ' +
            pr.weight + ' lbs × ' + pr.reps + ' reps' +
            '<span class="pr-toast-1rm">Est. 1RM: ' + pr.est1RM.toFixed(1) + ' lbs</span></div>'
        ).join('') +
        '<div class="pr-toast-link">View Personal Records →</div>';

    toast.style.cursor = 'pointer';
    toast.addEventListener('click', () => location.href = 'achievements.html');

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('pr-toast-show'));
    });

    setTimeout(() => {
        toast.classList.add('pr-toast-hide');
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}

// ========================================
// CALENDAR DAY TOOLTIP
// ========================================

function setupCalendarTooltip() {
    const tt = document.createElement('div');
    tt.id = 'calTooltip';
    tt.className = 'cal-tooltip';
    tt.style.display = 'none';
    document.body.appendChild(tt);
    window.addEventListener('scroll', hideCalTooltip, { passive: true });
}

function showCalTooltip(day, year, month, completedMap, plannedMap, cellEl) {
    const tt = document.getElementById('calTooltip');
    if (!tt) return;

    const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    const dayWorkouts = workouts.filter(w => w.date === dateStr);
    const plans       = plannedMap[day] || [];

    const today    = new Date(); today.setHours(0,0,0,0);
    const cellDate = new Date(year, month, day);
    const isPast   = cellDate < today;
    const isToday  = cellDate.getTime() === today.getTime();

    const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const DAY_NAMES   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    let html = '<div class="cal-tt-date">' + DAY_NAMES[cellDate.getDay()] + ', ' + MONTHS_FULL[month] + ' ' + day + ', ' + year + '</div>';

    if (dayWorkouts.length > 0) {
        dayWorkouts.forEach(function(w) {
            const totalSets = w.exercises.reduce(function(s,e){ return s + e.sets.length; }, 0);
            const vol       = w.exercises.reduce(function(t,e){ return t + e.sets.reduce(function(s,set){ return s + set.weight*set.reps; }, 0); }, 0);
            const exLines   = w.exercises.slice(0,4).map(function(e){ return '• ' + e.exercise; }).join('<br>');
            const more      = w.exercises.length > 4 ? '<br>• +' + (w.exercises.length-4) + ' more' : '';
            html += '<div class="cal-tt-workout">' +
                '<div class="cal-tt-workout-name">💪 ' + w.name + '</div>' +
                '<div class="cal-tt-stats">' + w.exercises.length + ' exercise' + (w.exercises.length!==1?'s':'') + ' · ' + totalSets + ' set' + (totalSets!==1?'s':'') + ' · ' + vol.toLocaleString() + ' lbs</div>' +
                '<div class="cal-tt-exercises">' + exLines + more + '</div>' +
                '</div>';
        });
    } else if (plans.length > 0) {
        plans.forEach(function(p) {
            const timeStr  = p.time ? '<div class="cal-tt-time">⏰ ' + formatTime(p.time) + '</div>' : '';
            const exLines  = p.exercises && p.exercises.length > 0
                ? '<div class="cal-tt-exercises">' + p.exercises.slice(0,4).map(function(e){ return '• '+e; }).join('<br>') + (p.exercises.length>4?'<br>• +' + (p.exercises.length-4)+' more':'') + '</div>'
                : '';
            html += '<div class="cal-tt-plan">' +
                '<div class="cal-tt-plan-name">📅 ' + p.name + '</div>' +
                timeStr + exLines +
                '<div class="cal-tt-hint">Click to start this workout</div>' +
                '</div>';
        });
    } else if (isPast || isToday) {
        html += '<div class="cal-tt-rest">😴 Rest day — no workout logged</div>';
    } else {
        html += '<div class="cal-tt-empty">No workout planned<br><span class="cal-tt-hint">Click to plan one</span></div>';
    }

    tt.innerHTML = html;
    tt.style.visibility = 'hidden';
    tt.style.display = 'block';

    const rect   = cellEl.getBoundingClientRect();
    const ttRect = tt.getBoundingClientRect();
    let top  = rect.top - ttRect.height - 10;
    let left = rect.left + rect.width / 2 - ttRect.width / 2;

    if (top < 10) top = rect.bottom + 10;
    if (left + ttRect.width > window.innerWidth - 10) left = window.innerWidth - ttRect.width - 10;
    if (left < 10) left = 10;

    tt.style.top  = top  + 'px';
    tt.style.left = left + 'px';
    tt.style.visibility = 'visible';
}

function hideCalTooltip() {
    const tt = document.getElementById('calTooltip');
    if (tt) tt.style.display = 'none';
}

// ========================================
// WEEKLY VOLUME LANDMARKS
// ========================================

function getWeekBounds(weekOffset) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dow = now.getDay();
    const daysToMon = dow === 0 ? 6 : dow - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysToMon + weekOffset * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: monday.toISOString().split('T')[0], end: sunday.toISOString().split('T')[0] };
}

function getWeekVolume(weekOffset) {
    const { start, end } = getWeekBounds(weekOffset);
    const vol = {};
    VOLUME_MUSCLES.forEach(m => vol[m] = 0);
    workouts.forEach(workout => {
        if (workout.date >= start && workout.date <= end) {
            workout.exercises.forEach(ex => {
                const muscle = VOLUME_MUSCLE_MAP[ex.exercise];
                if (muscle) vol[muscle] += ex.sets.length;
            });
        }
    });
    return vol;
}

function getVolumeStatus(sets) {
    if (sets === 0)  return { label: 'No Volume',   emoji: String.fromCodePoint(0x26AB), cls: 'vs-none',      msg: 'No direct sets recorded this week.' };
    if (sets <= 5)   return { label: 'Undertrained', emoji: String.fromCodePoint(0x1F534), cls: 'vs-under',   msg: 'Needs significantly more weekly volume.' };
    if (sets <= 9)   return { label: 'Minimum',      emoji: String.fromCodePoint(0x1F7E1), cls: 'vs-min',     msg: 'Enough to maintain or make slow progress.' };
    if (sets <= 20)  return { label: 'Optimal',      emoji: String.fromCodePoint(0x1F7E2), cls: 'vs-optimal', msg: 'Excellent weekly training volume for muscle growth.' };
    if (sets <= 25)  return { label: 'High Volume',  emoji: String.fromCodePoint(0x1F535), cls: 'vs-high',    msg: 'High volume. Ensure adequate recovery.' };
    return             { label: 'Excessive',         emoji: String.fromCodePoint(0x1F7E3), cls: 'vs-excessive',msg: 'Recovery may become limiting. Consider reducing weekly volume.' };
}

function getBarColor(sets) {
    if (sets <= 20) return '#22c55e';
    if (sets <= 25) return '#3b82f6';
    return '#a855f7';
}

function renderWeeklyVolumeLandmarks() {
    const summaryEl  = document.getElementById('volumeSummaryCard');
    const gridEl     = document.getElementById('volumeMuscleCards');
    const insightsEl = document.getElementById('coachingInsights');
    if (!summaryEl || !gridEl || !insightsEl) return;

    const weekVols  = [0, -1, -2, -3].map(getWeekVolume);
    const thisWeek  = weekVols[0];

    const avg4 = {};
    VOLUME_MUSCLES.forEach(m => {
        avg4[m] = (weekVols[0][m] + weekVols[1][m] + weekVols[2][m] + weekVols[3][m]) / 4;
    });

    const totalThisWeek = VOLUME_MUSCLES.reduce((s, m) => s + thisWeek[m], 0);
    const weekTotals    = weekVols.map(v => VOLUME_MUSCLES.reduce((s, m) => s + v[m], 0));
    const avg4Total     = weekTotals.reduce((s, v) => s + v, 0) / 4;
    const avgPerMuscle  = totalThisWeek / VOLUME_MUSCLES.length;
    const sortedByVol   = VOLUME_MUSCLES.slice().sort((a, b) => thisWeek[b] - thisWeek[a]);
    const mostTrained   = sortedByVol[0] + ' (' + thisWeek[sortedByVol[0]] + ')';
    const leastTrained  = sortedByVol[sortedByVol.length - 1] + ' (' + thisWeek[sortedByVol[sortedByVol.length - 1]] + ')';
    const optimalCount  = VOLUME_MUSCLES.filter(m => thisWeek[m] >= 10 && thisWeek[m] <= 20).length;

    // Summary card
    summaryEl.innerHTML = [
        '<div class="vol-summary-card">',
        '<h3 class="vol-summary-title">Weekly Volume Summary</h3>',
        '<div class="vol-summary-grid">',
        '<div class="vol-sum-item"><div class="vol-sum-label">Total Weekly Sets</div><div class="vol-sum-value" id="vsTotalSets">0</div></div>',
        '<div class="vol-sum-item"><div class="vol-sum-label">4-Week Average</div><div class="vol-sum-value" id="vs4Avg">0</div></div>',
        '<div class="vol-sum-item"><div class="vol-sum-label">Avg Sets / Muscle</div><div class="vol-sum-value" id="vsAvgMuscle">0</div></div>',
        '<div class="vol-sum-item"><div class="vol-sum-label">Most Trained</div><div class="vol-sum-value vol-sum-text">' + mostTrained + '</div></div>',
        '<div class="vol-sum-item"><div class="vol-sum-label">Least Trained</div><div class="vol-sum-value vol-sum-text">' + leastTrained + '</div></div>',
        '<div class="vol-sum-item"><div class="vol-sum-label">Optimal Muscles</div><div class="vol-sum-value" id="vsOptimal">0</div></div>',
        '</div></div>'
    ].join('');

    animateCounter(document.getElementById('vsTotalSets'), totalThisWeek,  v => Math.round(v).toString());
    animateCounter(document.getElementById('vs4Avg'),      avg4Total,       v => v.toFixed(1));
    animateCounter(document.getElementById('vsAvgMuscle'), avgPerMuscle,    v => v.toFixed(1));
    animateCounter(document.getElementById('vsOptimal'),   optimalCount,    v => Math.round(v) + ' / ' + VOLUME_MUSCLES.length);

    // Muscle cards
    gridEl.innerHTML = '';
    const TOOLTIP_TXT = 'Current research suggests approximately 10-20 hard working sets per muscle group per week is the optimal range for maximizing muscle growth for most trained individuals. Beginners often require less volume, while advanced lifters may benefit from more depending on recovery.';

    VOLUME_MUSCLES.forEach(muscle => {
        const sets   = thisWeek[muscle];
        const avg    = avg4[muscle];
        const status = getVolumeStatus(sets);
        const pct    = Math.min((sets / 20) * 100, 100);
        const color  = getBarColor(sets);

        const card = document.createElement('div');
        card.className = 'vol-muscle-card';
        card.innerHTML = [
            '<div class="vmc-header">',
            '<div class="vmc-name">' + muscle + '</div>',
            '<div class="vmc-badge ' + status.cls + '">' + status.emoji + ' ' + status.label + '</div>',
            '</div>',
            '<div class="vmc-stats">',
            '<div class="vmc-stat"><div class="vmc-stat-label">This Week</div>',
            '<div class="vmc-stat-val" data-target="' + sets + '">0 Sets</div></div>',
            '<div class="vmc-stat"><div class="vmc-stat-label">4-Week Avg</div>',
            '<div class="vmc-stat-val">' + avg.toFixed(1) + ' Sets</div></div>',
            '</div>',
            '<div class="vmc-bar-wrap">',
            '<div class="vmc-bar"><div class="vmc-bar-fill" data-pct="' + pct + '" style="width:0%;background:' + color + '"></div></div>',
            '</div>',
            '<div class="vmc-range">Optimal Range: 10-20 Sets ',
            '<span class="info-icon" data-tip="' + TOOLTIP_TXT + '">i</span></div>',
            '<div class="vmc-msg">' + status.msg + '</div>'
        ].join('');

        gridEl.appendChild(card);

        const valEl = card.querySelector('.vmc-stat-val[data-target]');
        if (valEl) animateCounter(valEl, sets, v => Math.round(v) + ' Sets', 900);
    });

    // Animate bars
    requestAnimationFrame(() => requestAnimationFrame(() => {
        gridEl.querySelectorAll('.vmc-bar-fill').forEach(bar => {
            bar.style.transition = 'width 1s cubic-bezier(0.22,1,0.36,1)';
            bar.style.width = bar.dataset.pct + '%';
        });
    }));

    // Coaching insights
    const insights = [];
    VOLUME_MUSCLES.forEach(m => {
        const s = thisWeek[m];
        if (s === 0)              insights.push({ type: 'warn', text: m + ' received no direct sets this week.' });
        else if (s <= 5)          insights.push({ type: 'warn', text: m + ' is undertrained this week (' + s + ' sets).' });
        else if (s > 25)          insights.push({ type: 'warn', text: m + ' volume may be excessive (' + s + ' sets). Consider recovery.' });
        else if (s >= 10 && s <= 20) insights.push({ type: 'good', text: m + ' is in the optimal growth range (' + s + ' sets).' });
    });

    if (thisWeek[sortedByVol[0]] > 0)
        insights.unshift({ type: 'fire', text: sortedByVol[0] + ' has the highest weekly volume (' + thisWeek[sortedByVol[0]] + ' sets).' });

    const upperMuscles = ['Chest','Back','Front Delts','Side Delts','Rear Delts','Biceps','Triceps'];
    if (upperMuscles.every(m => thisWeek[m] >= 10 && thisWeek[m] <= 20))
        insights.push({ type: 'flex', text: 'Great balance across all upper body muscles this week.' });

    const iconMap = { good: '&#10003;', warn: '&#9888;', fire: '&#128293;', flex: '&#128170;' };
    insightsEl.innerHTML = insights.length === 0 ? '' :
        '<div class="coaching-card"><h3 class="coaching-title">Weekly Coaching Insights</h3>' +
        insights.slice(0, 9).map(ins =>
            '<div class="coaching-row coaching-' + ins.type + '"><span class="coaching-icon">' +
            iconMap[ins.type] + '</span><span>' + ins.text + '</span></div>'
        ).join('') + '</div>';
}

// ========================================
// VOLUME LANDMARKS v2 — HELPERS
// ========================================

function getAvgOptimalRange() {
    var mins = VOLUME_MUSCLES.map(function(m){ return VOLUME_OPTIMAL_RANGES[m].min; });
    var maxs = VOLUME_MUSCLES.map(function(m){ return VOLUME_OPTIMAL_RANGES[m].max; });
    var n = VOLUME_MUSCLES.length;
    return {
        min: mins.reduce(function(s,v){return s+v;},0) / n,
        max: maxs.reduce(function(s,v){return s+v;},0) / n
    };
}

function countDistinctWeeksWithWorkouts() {
    var weekStarts = new Set();
    workouts.forEach(function(w) {
        var d = new Date(w.date + 'T00:00:00');
        var dow = d.getDay();
        var daysToMon = dow === 0 ? 6 : dow - 1;
        var mon = new Date(d);
        mon.setDate(d.getDate() - daysToMon);
        weekStarts.add(mon.toISOString().split('T')[0]);
    });
    return weekStarts.size;
}

function getAdaptiveAverageData() {
    var distinctWeeks = countDistinctWeeksWithWorkouts();
    var divisor = Math.min(Math.max(distinctWeeks, 1), 4);
    var weekVols = [0, -1, -2, -3].map(getWeekVolume);

    var avgLabel = distinctWeeks >= 4
        ? '4-Week Rolling Avg'
        : ('Avg Since Tracking (' + divisor + (divisor === 1 ? ' Week)' : ' Weeks)'));

    var avg = {};
    VOLUME_MUSCLES.forEach(function(m) {
        var total = 0;
        for (var i = 0; i < divisor; i++) total += (weekVols[i][m] || 0);
        avg[m] = total / divisor;
    });

    var weekTotals = weekVols.map(function(v) {
        return VOLUME_MUSCLES.reduce(function(s, m){ return s + v[m]; }, 0);
    });
    var avgTotal = 0;
    for (var i = 0; i < divisor; i++) avgTotal += weekTotals[i];
    avgTotal = avgTotal / divisor;

    return { avg: avg, avgTotal: avgTotal, divisor: divisor, label: avgLabel, weekVols: weekVols };
}

function getVolumeStatus(sets, muscle) {
    var range = VOLUME_OPTIMAL_RANGES[muscle] || { min: 10, max: 20 };
    var min = range.min; var max = range.max;
    if (sets === 0)       return { label:'No Volume',     color:'#EF4444', cls:'vs-none',      badge:'⚫', msg:'No direct sets recorded this week.' };
    if (sets < min)       return { label:'Below Optimal', color:'#F97316', cls:'vs-below',     badge:'🟠', msg:'Below the recommended weekly volume for this muscle group.' };
    if (sets <= max)      return { label:'Optimal',       color:'#22C55E', cls:'vs-optimal',   badge:'🟢', msg:'Excellent weekly training volume for muscle growth.' };
    if (sets <= max + 5)  return { label:'High Volume',   color:'#3B82F6', cls:'vs-high',      badge:'🔵', msg:'High volume. Ensure adequate recovery.' };
    return                 { label:'Excessive',           color:'#A855F7', cls:'vs-excessive', badge:'🟣', msg:'Recovery may become limiting. Consider reducing weekly volume.' };
}

function getVolumeSummaryColor(avgPerMuscle) {
    var r = getAvgOptimalRange();
    if (avgPerMuscle === 0)         return '#EF4444';
    if (avgPerMuscle < r.min)       return '#F97316';
    if (avgPerMuscle <= r.max)      return '#22C55E';
    if (avgPerMuscle <= r.max * 1.3) return '#3B82F6';
    return '#A855F7';
}

function getMuscleStatusColor(sets, muscle) {
    return getVolumeStatus(sets, muscle).color;
}

function getOptimalMusclesColor(count, total) {
    var pct = count / total;
    if (pct === 0)   return '#EF4444';
    if (pct < 0.4)   return '#F97316';
    if (pct < 0.7)   return '#86efac';
    if (pct < 0.9)   return '#22c55e';
    return '#00ff88';
}

function getSummaryBadge(avgPerMuscle, optimalCount, total) {
    var r = getAvgOptimalRange();
    var pct = optimalCount / total;
    if (avgPerMuscle < r.min * 0.5)              return { text:'Needs More Volume', color:'#EF4444' };
    if (avgPerMuscle < r.min)                    return { text:'Building Volume',   color:'#F97316' };
    if (avgPerMuscle > r.max * 1.3)              return { text:'Recovery Risk',     color:'#A855F7' };
    if (avgPerMuscle > r.max)                    return { text:'High Volume Week',  color:'#3B82F6' };
    if (pct >= 0.7)                              return { text:'Well Balanced',     color:'#22C55E' };
    return                                               { text:'Building Volume',  color:'#F97316' };
}

function getCoachingSentence(thisWeek, optimalCount, total, avgPerMuscle) {
    var r = getAvgOptimalRange();
    var pct = optimalCount / total;
    var excessive = VOLUME_MUSCLES.filter(function(m){ return thisWeek[m] > VOLUME_OPTIMAL_RANGES[m].max + 5; });
    if (excessive.length >= 2)  return 'Training volume is unusually high this week. Prioritize sleep and recovery.';
    if (optimalCount === total)  return 'Excellent training balance across all major muscle groups this week.';
    if (avgPerMuscle < r.min * 0.5) return 'Most muscle groups are below their recommended weekly volume. Aim to increase training frequency.';
    if (pct >= 0.7)              return 'Strong training week. A couple of muscle groups could use a bit more volume.';
    if (pct >= 0.4)              return "You're making good progress, but several muscle groups still need more weekly volume.";
    return 'Several muscle groups are below their recommended weekly volume. Focus on hitting all major muscles.';
}

// ========================================
// VOLUME LANDMARKS v2 — MAIN RENDER
// ========================================

function renderWeeklyVolumeLandmarks() {
    var summaryEl  = document.getElementById('volumeSummaryCard');
    var gridEl     = document.getElementById('volumeMuscleCards');
    var insightsEl = document.getElementById('coachingInsights');
    if (!summaryEl || !gridEl || !insightsEl) return;

    var data      = getAdaptiveAverageData();
    var thisWeek  = data.weekVols[0];
    var avg       = data.avg;

    var totalThisWeek = VOLUME_MUSCLES.reduce(function(s,m){ return s + thisWeek[m]; }, 0);
    var avgPerMuscle  = totalThisWeek / VOLUME_MUSCLES.length;
    var sortedByVol   = VOLUME_MUSCLES.slice().sort(function(a,b){ return thisWeek[b]-thisWeek[a]; });
    var mostMuscle    = sortedByVol[0];
    var leastMuscle   = sortedByVol[sortedByVol.length-1];
    var optimalCount  = VOLUME_MUSCLES.filter(function(m){
        var r = VOLUME_OPTIMAL_RANGES[m];
        return thisWeek[m] >= r.min && thisWeek[m] <= r.max;
    }).length;

    var summaryColor  = getVolumeSummaryColor(avgPerMuscle);
    var mostColor     = getMuscleStatusColor(thisWeek[mostMuscle], mostMuscle);
    var leastColor    = getMuscleStatusColor(thisWeek[leastMuscle], leastMuscle);
    var optimalColor  = getOptimalMusclesColor(optimalCount, VOLUME_MUSCLES.length);
    var badge         = getSummaryBadge(avgPerMuscle, optimalCount, VOLUME_MUSCLES.length);
    var coachMsg      = getCoachingSentence(thisWeek, optimalCount, VOLUME_MUSCLES.length, avgPerMuscle);

    summaryEl.innerHTML = [
        '<div class="vol-summary-card">',
        '<div class="vol-summary-header">',
        '<h3 class="vol-summary-title">Weekly Volume Summary</h3>',
        '<div class="vol-summary-badge" style="background:' + badge.color + '20;color:' + badge.color + ';border:1px solid ' + badge.color + '40">' + badge.text + '</div>',
        '</div>',
        '<div class="vol-coaching-sentence">' + coachMsg + '</div>',
        '<div class="vol-summary-grid">',
        '<div class="vol-sum-item"><div class="vol-sum-label">Total Weekly Sets</div>',
        '<div class="vol-sum-value" id="vsTotalSets" style="color:' + summaryColor + '">0</div></div>',
        '<div class="vol-sum-item"><div class="vol-sum-label">' + data.label + '</div>',
        '<div class="vol-sum-value" id="vs4Avg" style="color:' + summaryColor + '">0</div></div>',
        '<div class="vol-sum-item"><div class="vol-sum-label">Avg Sets / Muscle</div>',
        '<div class="vol-sum-value" id="vsAvgMuscle" style="color:' + summaryColor + '">0</div></div>',
        '<div class="vol-sum-item"><div class="vol-sum-label">Most Trained</div>',
        '<div class="vol-sum-value vol-sum-text" style="color:' + mostColor + '">' + mostMuscle + ' (' + thisWeek[mostMuscle] + ')</div></div>',
        '<div class="vol-sum-item"><div class="vol-sum-label">Least Trained</div>',
        '<div class="vol-sum-value vol-sum-text" style="color:' + leastColor + '">' + leastMuscle + ' (' + thisWeek[leastMuscle] + ')</div></div>',
        '<div class="vol-sum-item"><div class="vol-sum-label">Optimal Muscles</div>',
        '<div class="vol-sum-value" id="vsOptimal" style="color:' + optimalColor + '">0</div></div>',
        '</div></div>'
    ].join('');

    animateCounter(document.getElementById('vsTotalSets'), totalThisWeek, function(v){ return Math.round(v).toString(); });
    animateCounter(document.getElementById('vs4Avg'),      data.avgTotal,  function(v){ return v.toFixed(1); });
    animateCounter(document.getElementById('vsAvgMuscle'), avgPerMuscle,   function(v){ return v.toFixed(1); });
    animateCounter(document.getElementById('vsOptimal'),   optimalCount,   function(v){ return Math.round(v) + ' / ' + VOLUME_MUSCLES.length; });

    // Muscle cards
    gridEl.innerHTML = '';
    var TOOLTIP_TXT = 'Current research suggests 10-20 hard working sets per muscle group per week is optimal for most trained individuals. Each muscle group has its own evidence-based recommendation shown above.';

    VOLUME_MUSCLES.forEach(function(muscle) {
        var sets   = thisWeek[muscle];
        var avgSets = avg[muscle];
        var range  = VOLUME_OPTIMAL_RANGES[muscle];
        var status = getVolumeStatus(sets, muscle);
        var pct    = Math.min((sets / range.max) * 100, 100);

        var card = document.createElement('div');
        card.className = 'vol-muscle-card';
        card.innerHTML = [
            '<div class="vmc-header">',
            '<div class="vmc-name">' + muscle + '</div>',
            '<div class="vmc-badge ' + status.cls + '" style="color:' + status.color + ';background:' + status.color + '18;border-color:' + status.color + '40">' + status.badge + ' ' + status.label + '</div>',
            '</div>',
            '<div class="vmc-stats">',
            '<div class="vmc-stat"><div class="vmc-stat-label">This Week</div>',
            '<div class="vmc-stat-val" data-target="' + sets + '" style="color:' + status.color + '">0 Sets</div></div>',
            '<div class="vmc-stat"><div class="vmc-stat-label">' + data.label + '</div>',
            '<div class="vmc-stat-val">' + avgSets.toFixed(1) + ' Sets</div></div>',
            '</div>',
            '<div class="vmc-bar-wrap">',
            '<div class="vmc-bar"><div class="vmc-bar-fill" data-pct="' + pct + '" style="width:0%;background:' + status.color + '"></div></div>',
            '</div>',
            '<div class="vmc-range">Optimal Range: ' + range.min + '–' + range.max + ' Sets ',
            '<span class="info-icon" data-tip="' + TOOLTIP_TXT + '">i</span></div>',
            '<div class="vmc-msg">' + status.msg + '</div>'
        ].join('');

        gridEl.appendChild(card);

        var valEl = card.querySelector('.vmc-stat-val[data-target]');
        if (valEl) animateCounter(valEl, sets, function(v){ return Math.round(v) + ' Sets'; }, 900);
    });

    requestAnimationFrame(function() {
        requestAnimationFrame(function() {
            gridEl.querySelectorAll('.vmc-bar-fill').forEach(function(bar) {
                bar.style.transition = 'width 1s cubic-bezier(0.22,1,0.36,1)';
                bar.style.width = bar.dataset.pct + '%';
            });
        });
    });

    // Coaching insights (per-muscle rows)
    var insights = [];
    VOLUME_MUSCLES.forEach(function(m) {
        var s = thisWeek[m];
        var r = VOLUME_OPTIMAL_RANGES[m];
        if (s === 0)              insights.push({ type:'warn', text: m + ' received no direct sets this week.' });
        else if (s < r.min)       insights.push({ type:'warn', text: m + ' is below the optimal range (' + s + ' of ' + r.min + '–' + r.max + ' sets).' });
        else if (s > r.max + 5)   insights.push({ type:'warn', text: m + ' volume may be excessive (' + s + ' sets). Consider recovery.' });
        else if (s >= r.min)      insights.push({ type:'good', text: m + ' is in the optimal growth range (' + s + ' sets).' });
    });
    if (thisWeek[mostMuscle] > 0)
        insights.unshift({ type:'fire', text: mostMuscle + ' has the highest weekly volume (' + thisWeek[mostMuscle] + ' sets).' });

    var iconMap = { good:'&#10003;', warn:'&#9888;', fire:'&#128293;', flex:'&#128170;' };
    insightsEl.innerHTML = insights.length === 0 ? '' :
        '<div class="coaching-card"><h3 class="coaching-title">Weekly Coaching Insights</h3>' +
        insights.slice(0, 9).map(function(ins) {
            return '<div class="coaching-row coaching-' + ins.type + '"><span class="coaching-icon">' +
                   iconMap[ins.type] + '</span><span>' + ins.text + '</span></div>';
        }).join('') + '</div>';
}

// ========================================
// MUSCLE DEVELOPMENT RADAR
// ========================================

var radarDataPts  = [];
var radarAnimId2  = null;

function getRadarData() {
    // Reuses getMuscleGroupPercentChanges() — single source of truth
    var changes = getMuscleGroupPercentChanges();
    var map = {};
    changes.forEach(function(c) { map[c.muscle] = c.totalPercentIncrease; });
    return ['Chest','Back','Shoulders','Biceps','Triceps','Legs','Core','Forearms'].map(function(m) {
        return { name: m, value: map[m] !== undefined ? map[m] : 0 };
    });
}

function getRadarScale(maxVal) {
    if (maxVal <= 0)   return 20;
    if (maxVal <= 15)  return 20;
    if (maxVal <= 30)  return 50;
    if (maxVal <= 75)  return 100;
    if (maxVal <= 125) return 150;
    return Math.ceil(maxVal / 50) * 50;
}

function calculateBalanceScore(data) {
    var vals  = data.map(function(d) { return d.value; });
    var mean  = vals.reduce(function(s,v){return s+v;},0) / vals.length;
    var avgDev = vals.reduce(function(s,v){return s+Math.abs(v-mean);},0) / vals.length;
    var score = Math.max(0, Math.min(100, 100 - avgDev));
    var rating, color;
    if      (score >= 90) { rating = 'Excellent';             color = '#22c55e'; }
    else if (score >= 75) { rating = 'Good';                  color = '#22c55e'; }
    else if (score >= 60) { rating = 'Moderate Imbalance';    color = '#f97316'; }
    else if (score >= 40) { rating = 'Needs Improvement';     color = '#ef4444'; }
    else                  { rating = 'Significant Imbalance'; color = '#ef4444'; }
    return { score: score, rating: rating, color: color };
}

function generateRadarRecommendation(sorted) {
    var top    = sorted[0];
    var bottom = sorted[sorted.length - 1];
    var upperMuscles = ['Chest','Back','Shoulders','Biceps','Triceps'];
    var lowerMuscles = ['Legs','Core'];
    var upperData = sorted.filter(function(d){ return upperMuscles.indexOf(d.name) !== -1; });
    var lowerData = sorted.filter(function(d){ return lowerMuscles.indexOf(d.name) !== -1; });
    var upperAvg = upperData.length ? upperData.reduce(function(s,d){return s+d.value;},0)/upperData.length : 0;
    var lowerAvg = lowerData.length ? lowerData.reduce(function(s,d){return s+d.value;},0)/lowerData.length : 0;

    if (sorted.every(function(d){ return d.value > 0; }) && Math.abs(upperAvg - lowerAvg) < 5)
        return 'Excellent balance across all major muscle groups.';
    if (upperAvg > lowerAvg + 15)
        return 'Your upper body is progressing faster than your lower body. Prioritize leg training.';
    if (lowerAvg > upperAvg + 15)
        return 'Your lower body is outpacing your upper body development.';
    if (bottom.value <= 0)
        return bottom.name + ' has shown the least improvement. Consider adding targeted exercises.';
    if (top.value > 0 && bottom.value < top.value * 0.3)
        return bottom.name + ' development is falling behind. Prioritize direct training for better balance.';
    return 'Good overall progress. Keep focusing on ' + bottom.name + ' to improve muscular symmetry.';
}

function drawRadarCanvas(canvas, data, animProgress) {
    var dpr  = window.devicePixelRatio || 1;
    var size = canvas.offsetWidth || 360;
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    var maxVal  = Math.max.apply(null, data.map(function(d){ return d.value; }).concat([0]));
    var scale   = getRadarScale(maxVal);
    var n       = data.length;
    var cx      = size / 2;
    var cy      = size / 2;
    var radius  = size * 0.34;
    var step    = (2 * Math.PI) / n;
    var rings   = 4;
    var NEON    = '#39ff8a';
    var isLight = document.body.classList.contains('light-mode');
    var lblColor  = isLight ? '#1f2937'              : '#f0eeff';
    var gridColor = isLight ? 'rgba(0,0,0,0.07)'     : 'rgba(255,255,255,0.07)';
    var scaleColor = isLight ? 'rgba(0,0,0,0.25)'    : 'rgba(255,255,255,0.22)';

    ctx.clearRect(0, 0, size, size);

    // Grid rings (polygon shape)
    for (var r = 1; r <= rings; r++) {
        var rr = (radius / rings) * r;
        ctx.beginPath();
        for (var i = 0; i < n; i++) {
            var a = step * i - Math.PI / 2;
            if (i === 0) ctx.moveTo(cx + rr*Math.cos(a), cy + rr*Math.sin(a));
            else         ctx.lineTo(cx + rr*Math.cos(a), cy + rr*Math.sin(a));
        }
        ctx.closePath();
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Scale labels on top axis
        var val = (scale / rings) * r;
        ctx.fillStyle = scaleColor;
        ctx.font = '9px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('+' + Math.round(val) + '%', cx, cy - rr - 4);
    }

    // Axis lines
    for (var i = 0; i < n; i++) {
        var a = step * i - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + radius*Math.cos(a), cy + radius*Math.sin(a));
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Data polygon (animated by animProgress 0→1)
    var pts = data.map(function(d, i) {
        var a   = step * i - Math.PI / 2;
        var pct = Math.max(0, d.value) / scale * animProgress;
        var rv  = radius * Math.min(pct, 1.0);
        return { x: cx + rv*Math.cos(a), y: cy + rv*Math.sin(a) };
    });

    // Fill
    ctx.beginPath();
    pts.forEach(function(p, i) { i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
    ctx.closePath();
    ctx.fillStyle = 'rgba(57,255,138,0.12)';
    ctx.fill();

    // Stroke
    ctx.beginPath();
    pts.forEach(function(p, i) { i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
    ctx.closePath();
    ctx.strokeStyle = NEON;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Dots at vertices
    pts.forEach(function(p) {
        ctx.fillStyle = NEON;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Labels (always at full radius, independent of animation)
    var LABEL_GAP = 26;
    data.forEach(function(d, i) {
        var a  = step * i - Math.PI / 2;
        var lx = cx + (radius + LABEL_GAP) * Math.cos(a);
        var ly = cy + (radius + LABEL_GAP) * Math.sin(a);
        var ca = Math.cos(a);
        var ta = Math.abs(ca) < 0.15 ? 'center' : (ca > 0 ? 'left' : 'right');

        ctx.fillStyle = lblColor;
        ctx.font = 'bold 11px -apple-system, sans-serif';
        ctx.textAlign = ta;
        ctx.fillText(d.name, lx, ly);

        var sign = d.value >= 0 ? '+' : '';
        ctx.fillStyle = d.value > 0 ? NEON : (isLight ? '#9ca3af' : '#6b7280');
        ctx.font = '10px -apple-system, sans-serif';
        ctx.fillText(sign + d.value.toFixed(1) + '%', lx, ly + 13);
    });

    return pts;
}

function animateRadarChart(canvas, data) {
    if (radarAnimId2) { cancelAnimationFrame(radarAnimId2); radarAnimId2 = null; }
    var DURATION = 1000;
    var start = null;

    function frame(ts) {
        if (!start) start = ts;
        var t     = Math.min((ts - start) / DURATION, 1);
        var eased = 1 - Math.pow(1 - t, 3);
        var pts   = drawRadarCanvas(canvas, data, eased);
        if (t >= 1) {
            radarDataPts = pts.map(function(p, i) {
                return { x: p.x, y: p.y, name: data[i].name, value: data[i].value };
            });
            radarAnimId2 = null;
        } else {
            radarAnimId2 = requestAnimationFrame(frame);
        }
    }
    radarAnimId2 = requestAnimationFrame(frame);
}

function renderRadarInsights(el, data) {
    var sorted    = data.slice().sort(function(a,b){ return b.value - a.value; });
    var strongest = sorted[0];
    var weakest   = sorted[sorted.length - 1];
    var balance   = calculateBalanceScore(data);
    var rec       = generateRadarRecommendation(sorted);

    var sColor = strongest.value > 0 ? '#22c55e' : '#9ca3af';
    var wColor = weakest.value  > 0 ? '#f97316' : '#ef4444';

    el.innerHTML = [
        '<div class="radar-insights-card">',
        '<h3 class="radar-insights-title">Muscle Development Insights</h3>',

        '<div class="ri-item">',
        '<div class="ri-label">🏆 Strongest Muscle Group</div>',
        '<div class="ri-value" style="color:' + sColor + '">' + strongest.name + '</div>',
        '<div class="ri-sub" style="color:' + sColor + '">' + (strongest.value>=0?'+':'') + strongest.value.toFixed(1) + '% Est. 1RM Improvement</div>',
        '</div>',

        '<div class="ri-item">',
        '<div class="ri-label">📉 Needs Attention</div>',
        '<div class="ri-value" style="color:' + wColor + '">' + weakest.name + '</div>',
        '<div class="ri-sub" style="color:' + wColor + '">' + (weakest.value>=0?'+':'') + weakest.value.toFixed(1) + '% Est. 1RM Improvement</div>',
        '</div>',

        '<div class="ri-item">',
        '<div class="ri-label">⚖ Muscle Balance Score</div>',
        '<div class="ri-value" style="color:' + balance.color + '">' + balance.score.toFixed(0) + '</div>',
        '<div class="ri-sub" style="color:' + balance.color + '">' + balance.rating + '</div>',
        '</div>',

        '<div class="ri-item ri-recommendation">',
        '<div class="ri-label">💡 Recommendation</div>',
        '<div class="ri-rec-text">' + rec + '</div>',
        '</div>',

        '</div>'
    ].join('');
}

function setupRadarHover(canvas) {
    var tt = document.getElementById('radarTooltip');
    if (!tt || !canvas) return;

    canvas.addEventListener('mousemove', function(e) {
        var rect  = canvas.getBoundingClientRect();
        var scaleX = (canvas.width / (window.devicePixelRatio || 1)) / rect.width;
        var scaleY = (canvas.height / (window.devicePixelRatio || 1)) / rect.height;
        var mx = (e.clientX - rect.left) * scaleX;
        var my = (e.clientY - rect.top)  * scaleY;

        var found = null;
        radarDataPts.forEach(function(p) {
            var dx = mx - p.x, dy = my - p.y;
            if (Math.sqrt(dx*dx + dy*dy) < 18) found = p;
        });

        if (found) {
            tt.innerHTML =
                '<div class="rtt-name">' + found.name + '</div>' +
                '<div class="rtt-val">'  + (found.value>=0?'+':'') + found.value.toFixed(1) + '%</div>' +
                '<div class="rtt-note">Est. 1RM Improvement</div>';
            tt.style.display = 'block';
            tt.style.left = (e.clientX + 14) + 'px';
            tt.style.top  = (e.clientY - 10) + 'px';
        } else {
            tt.style.display = 'none';
        }
    });

    canvas.addEventListener('mouseleave', function() {
        if (tt) tt.style.display = 'none';
    });
}

function renderMuscleRadar() {
    var canvas     = document.getElementById('muscleRadarChart');
    var insightsEl = document.getElementById('radarInsights');
    var emptyEl    = document.getElementById('radarEmpty');
    if (!canvas || !insightsEl) return;

    var data    = getRadarData();
    var hasData = data.some(function(d){ return d.value !== 0; });

    if (!hasData) {
        canvas.style.display = 'none';
        if (emptyEl) emptyEl.classList.remove('hidden');
        insightsEl.innerHTML = '';
        return;
    }

    canvas.style.display = 'block';
    if (emptyEl) emptyEl.classList.add('hidden');

    animateRadarChart(canvas, data);
    renderRadarInsights(insightsEl, data);
}
