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

// ========================================
// EXERCISE TYPE SYSTEM
// ========================================

const EXERCISE_TYPE_MAP = {
    // Timed only
    'Plank': 'timed', 'Side Plank': 'timed',

    // Bodyweight only (reps, no weight option)
    'Hanging Knee Raise': 'bodyweight',
    'Bicycle Crunch':     'bodyweight',
    'Ab Wheel Rollout':   'bodyweight',
    'Mountain Climbers':  'bodyweight',

    // Optional weighted — Bodyweight OR + Weight toggle
    // Upper body
    'Pull-Up':            'optional_weighted',
    'Chin-Up':            'optional_weighted',
    'Push-Up':            'optional_weighted',
    'Dips (Chest Focus)': 'optional_weighted',
    'Dips (Tricep Focus)':'optional_weighted',
    // Core
    'Crunch':             'optional_weighted',
    'Sit-Up':             'optional_weighted',
    'Hanging Leg Raise':  'optional_weighted',
    'Russian Twist':      'optional_weighted',
    // Legs
    'Back Squat':         'optional_weighted',
    'Bulgarian Split Squat':'optional_weighted',
    'Walking Lunge':      'optional_weighted',
    'Goblet Squat':       'optional_weighted',
    'Hip Thrust':         'optional_weighted',
    'Step-Up':            'optional_weighted',
    'Standing Calf Raise':'optional_weighted',
    'Single Leg Calf Raise':'optional_weighted',
    // Cable Crunch and all others default to 'weighted'
};

function getExerciseType(name) { return EXERCISE_TYPE_MAP[name] || 'weighted'; }

function getExerciseSetMode(sets) {
    if (!sets || sets.length === 0) return 'weighted';
    return sets[0].mode || 'weighted'; // backwards compat: no mode = weighted
}

function getProgressValue(sets) {
    if (!sets || sets.length === 0) return 0;
    const mode = getExerciseSetMode(sets);
    if (mode === 'timed')     return Math.max(...sets.map(s => s.duration || 0));
    if (mode === 'bodyweight') return Math.max(...sets.map(s => s.reps || 0));
    // weighted — Epley 1RM (existing)
    const wSets = sets.filter(s => s.weight > 0 && s.reps > 0);
    return wSets.length ? Math.max(...wSets.map(s => epley1RM(s.weight, s.reps))) : 0;
}

function getProgressKey(exerciseName, mode) {
    // Optional-weighted exercises track BW and weighted paths separately
    if (getExerciseType(exerciseName) === 'optional_weighted') {
        return exerciseName + ':' + (mode || 'weighted');
    }
    return exerciseName;
}

function formatSetForDisplay(set) {
    const mode = set.mode || 'weighted';
    if (mode === 'timed') {
        const d = set.duration || 0;
        const m = Math.floor(d / 60), s = d % 60;
        return m > 0 ? m + 'm ' + s + 's' : d + ' sec';
    }
    if (mode === 'bodyweight') return 'BW × ' + (set.reps || 0) + ' reps';
    // weighted — include +lbs label for optional_weighted
    const prefix = set.mode === 'weighted' && set._optional ? '+' : '';
    return prefix + (set.weight || 0) + ' lbs × ' + (set.reps || 0) + ' reps';
}

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
let templateQueue      = [];
let pendingTemplate    = null;
let currentExerciseMode = 'weighted'; // updated when user selects an exercise
let plannedWorkouts  = [];
let planExercises = [];
let selectedTemplateId = null;
let editingPlanId = null;       // set when editing an existing planned workout
let calTooltipHideTimer = null; // delay so tooltip stays visible when mouse moves to its buttons
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

    // Detect exercise type and update the mode toggle + reset mode
    const type = getExerciseType(value);
    if (type === 'optional_weighted') {
        currentExerciseMode = 'bodyweight';
        updateModeToggleUI(true, 'bodyweight');
    } else {
        currentExerciseMode = type === 'timed' ? 'timed' : (type === 'bodyweight' ? 'bodyweight' : 'weighted');
        updateModeToggleUI(false);
    }

    // Re-render set inputs if number already entered
    const n = parseInt(document.getElementById('exerciseNumSets')?.value);
    if (n > 0) generateExerciseSetInputs(n);
}

function updateModeToggleUI(show, activeMode) {
    const toggle = document.getElementById('exerciseModeToggle');
    if (!toggle) return;
    if (!show) { toggle.classList.add('hidden'); return; }
    toggle.classList.remove('hidden');
    document.getElementById('modeBtnBW')?.classList.toggle('mode-btn-active', activeMode === 'bodyweight');
    document.getElementById('modeBtnWeighted')?.classList.toggle('mode-btn-active', activeMode === 'weighted');
}

function setExerciseMode(mode) {
    currentExerciseMode = mode;
    document.getElementById('modeBtnBW')?.classList.toggle('mode-btn-active', mode === 'bodyweight');
    document.getElementById('modeBtnWeighted')?.classList.toggle('mode-btn-active', mode === 'weighted');
    const n = parseInt(document.getElementById('exerciseNumSets')?.value);
    if (n > 0) generateExerciseSetInputs(n);
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

    // If a template was waiting (started from history/calendar), load its exercises
    if (pendingTemplate) {
        templateQueue   = pendingTemplate;
        pendingTemplate = null;
        showAddExerciseForm();
        prefillNextTemplateExercise();
    } else {
        showAddExerciseForm();
    }
}

function showAddExerciseForm() {
    addExerciseForm.classList.remove('hidden');
    exerciseSetsContainer.innerHTML = '';
    if (exerciseSelect) exerciseSelect.value = '';
    const si = document.getElementById('exerciseSearchInput');
    if (si) si.value = '';
    if (exerciseNumSetsInput) exerciseNumSetsInput.value = '';
    currentExerciseMode = 'weighted';
    updateModeToggleUI(false);

    setTimeout(() => {
        if (addExerciseForm) addExerciseForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
}

function generateExerciseSetInputs(numberOfSets) {
    exerciseSetsContainer.innerHTML = '';
    for (let i = 1; i <= numberOfSets; i++) {
        const g = document.createElement('div');
        g.className = 'exercise-set-input-group';
        if (currentExerciseMode === 'timed') {
            g.innerHTML = `
                <div class="exercise-set-number">Set ${i}</div>
                <div class="form-group timed-input">
                    <label for="ex-minutes-${i}">Min</label>
                    <input type="number" id="ex-minutes-${i}" class="exercise-set-minutes" min="0" value="0">
                </div>
                <div class="form-group timed-input">
                    <label for="ex-seconds-${i}">Sec</label>
                    <input type="number" id="ex-seconds-${i}" class="exercise-set-seconds" min="0" max="59" value="0">
                </div>`;
        } else if (currentExerciseMode === 'bodyweight') {
            g.innerHTML = `
                <div class="exercise-set-number">Set ${i}</div>
                <div class="bw-mode-label">Bodyweight</div>
                <div class="form-group">
                    <label for="ex-reps-${i}">Reps</label>
                    <input type="number" id="ex-reps-${i}" class="exercise-set-reps" min="1">
                </div>`;
        } else {
            g.innerHTML = `
                <div class="exercise-set-number">Set ${i}</div>
                <div class="form-group">
                    <label for="ex-weight-${i}">Weight (lbs)</label>
                    <input type="number" id="ex-weight-${i}" class="exercise-set-weight" min="0" step="0.5">
                </div>
                <div class="form-group">
                    <label for="ex-reps-${i}">Reps</label>
                    <input type="number" id="ex-reps-${i}" class="exercise-set-reps" min="1">
                </div>`;
        }
        exerciseSetsContainer.appendChild(g);
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

    const sets = [];
    const groups = exerciseSetsContainer.querySelectorAll('.exercise-set-input-group');
    for (let i = 0; i < groups.length; i++) {
        const g = groups[i];
        const setNum = i + 1;
        if (currentExerciseMode === 'timed') {
            const mins = parseInt(g.querySelector('.exercise-set-minutes')?.value) || 0;
            const secs = parseInt(g.querySelector('.exercise-set-seconds')?.value) || 0;
            const duration = mins * 60 + secs;
            if (duration <= 0) { alert('Please enter a duration for Set ' + setNum); return; }
            sets.push({ duration, mode: 'timed' });
        } else if (currentExerciseMode === 'bodyweight') {
            const reps = parseInt(g.querySelector('.exercise-set-reps')?.value);
            if (!reps || reps <= 0) { alert('Please enter reps for Set ' + setNum); return; }
            sets.push({ reps, mode: 'bodyweight' });
        } else {
            const weight = parseFloat(g.querySelector('.exercise-set-weight')?.value);
            const reps   = parseInt(g.querySelector('.exercise-set-reps')?.value);
            if (!weight || !reps) { alert('Please fill in all fields for Set ' + setNum); return; }
            sets.push({ weight, reps, mode: 'weighted' });
        }
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
            const row  = document.createElement('div');
            row.className = 'current-set-edit-row';
            const mode = set.mode || 'weighted';

            if (mode === 'timed') {
                const d = set.duration || 0;
                row.innerHTML =
                    '<span class="set-label">Set ' + (si+1) + '</span>' +
                    '<input type="number" class="set-weight-edit" value="' + Math.floor(d/60) + '" min="0" placeholder="min" style="width:60px!important">' +
                    '<span class="set-unit">m</span>' +
                    '<input type="number" class="set-reps-edit" value="' + (d%60) + '" min="0" max="59" placeholder="sec" style="width:60px!important">' +
                    '<span class="set-unit">s</span>';
                row.querySelector('.set-weight-edit').addEventListener('input', function() {
                    const m = parseInt(this.value)||0, s = parseInt(row.querySelector('.set-reps-edit').value)||0;
                    currentWorkout.exercises[exIdx].sets[si].duration = m*60+s;
                });
                row.querySelector('.set-reps-edit').addEventListener('input', function() {
                    const m = parseInt(row.querySelector('.set-weight-edit').value)||0, s = parseInt(this.value)||0;
                    currentWorkout.exercises[exIdx].sets[si].duration = m*60+s;
                });
            } else if (mode === 'bodyweight') {
                row.innerHTML =
                    '<span class="set-label">Set ' + (si+1) + '</span>' +
                    '<span class="set-unit">BW ×</span>' +
                    '<input type="number" class="set-reps-edit" value="' + (set.reps||'') + '" min="1" placeholder="reps">' +
                    '<span class="set-unit">reps</span>';
                row.querySelector('.set-reps-edit').addEventListener('input', function() {
                    const v = parseInt(this.value);
                    if (!isNaN(v)) currentWorkout.exercises[exIdx].sets[si].reps = v;
                });
            } else {
                row.innerHTML =
                    '<span class="set-label">Set ' + (si+1) + '</span>' +
                    '<input type="number" class="set-weight-edit" value="' + (set.weight||'') + '" min="0" step="0.5" placeholder="lbs">' +
                    '<span class="set-unit">lbs ×</span>' +
                    '<input type="number" class="set-reps-edit" value="' + (set.reps||'') + '" min="1" placeholder="reps">' +
                    '<span class="set-unit">reps</span>';
                row.querySelector('.set-weight-edit').addEventListener('input', function() {
                    const v = parseFloat(this.value);
                    if (!isNaN(v)) currentWorkout.exercises[exIdx].sets[si].weight = v;
                });
                row.querySelector('.set-reps-edit').addEventListener('input', function() {
                    const v = parseInt(this.value);
                    if (!isNaN(v)) currentWorkout.exercises[exIdx].sets[si].reps = v;
                });
            }
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
    currentWorkout  = { id: null, name: "", date: "", exercises: [] };
    templateQueue   = [];
    pendingTemplate = null;
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
    const wSets = sets.filter(s => (s.mode || 'weighted') === 'weighted' && s.weight > 0 && s.reps > 0);
    return wSets.length ? Math.max(...wSets.map(s => epley1RM(s.weight, s.reps))) : 0;
}

// For each exercise: find the first-ever workout date, then take the highest
// Epley 1RM across ALL sets from ALL workouts on that date.
// Returns { exercise -> { date, best1RM } }
function buildFirstEverMap(allEntries) {
    const byKey = {};
    allEntries.forEach(e => {
        const k = e.progressKey || e.exercise;
        if (!byKey[k]) byKey[k] = [];
        byKey[k].push(e);
    });
    const map = {};
    Object.keys(byKey).forEach(k => {
        const entries   = byKey[k];
        const firstDate = entries.reduce((min, e) => e.workoutDate < min ? e.workoutDate : min, entries[0].workoutDate);
        const bestPV    = Math.max(...entries.filter(e => e.workoutDate === firstDate).map(e => e.progressValue || e.best1RM || 0));
        map[k] = { date: firstDate, best1RM: bestPV, progressValue: bestPV };
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
            const mode = getExerciseSetMode(exercise.sets);
            const pv   = getProgressValue(exercise.sets);
            const pkey = getProgressKey(exercise.exercise, mode);
            entries.push({
                exercise:      exercise.exercise,
                muscleGroup:   exercise.muscleGroup,
                workoutName:   workout.name,
                workoutDate:   workout.date,
                sets:          exercise.sets,
                highestWeight: getHighestWeightFromSets(exercise.sets),
                best1RM:       getBest1RM(exercise.sets),
                progressValue: pv,
                exerciseMode:  mode,
                progressKey:   pkey
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
            <div class="progress-card-1rm">${formatProgressMetric(entry)}</div>
            <div class="progress-card-1rm-label">${progressMetricLabel(entry)}</div>
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
        const k = e.progressKey || e.exercise;
        if (!byMuscleExercise[muscle][k]) byMuscleExercise[muscle][k] = [];
        byMuscleExercise[muscle][k].push(e);
    });

    return Object.keys(byMuscleExercise).map(muscle => {
        let totalPercentIncrease = 0;
        const exerciseChanges = [];

        Object.keys(byMuscleExercise[muscle]).forEach(key => {
            const base    = firstEver[key];
            if (!base) return;
            const entries = byMuscleExercise[muscle][key].filter(e => e.workoutDate > base.date);
            if (entries.length === 0) return;
            const lastDate   = entries.reduce((max, e) => e.workoutDate > max ? e.workoutDate : max, entries[0].workoutDate);
            const latestBest = Math.max(...entries.filter(e => e.workoutDate === lastDate).map(e => e.progressValue || 0));
            if (base.progressValue > 0) {
                const pct = ((latestBest - base.progressValue) / base.progressValue) * 100;
                totalPercentIncrease += pct;
                exerciseChanges.push({ exercise: key, percentChange: pct });
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
        Object.keys(firstEver).forEach(k => {
            const base = firstEver[k];
            const later = muscleEntries.filter(e =>
                (e.progressKey || e.exercise) === k && e.workoutDate > base.date && e.workoutDate <= date
            );
            if (!later.length) return;
            const lastDate = later.reduce((m, e) => e.workoutDate > m ? e.workoutDate : m, later[0].workoutDate);
            const best = Math.max(...later.filter(e => e.workoutDate === lastDate).map(e => e.progressValue || 0));
            if (base.progressValue > 0) total += ((best - base.progressValue) / base.progressValue) * 100;
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

    // Find best set per exercise using mode-aware progress value
    const prByExercise = {};
    allEntries.forEach(entry => {
        entry.sets.forEach(set => {
            const mode = set.mode || 'weighted';
            let pv;
            if (mode === 'timed')      pv = set.duration || 0;
            else if (mode === 'bodyweight') pv = set.reps || 0;
            else pv = (set.weight > 0 && set.reps > 0) ? epley1RM(set.weight, set.reps) : 0;

            if (!prByExercise[entry.exercise] || pv > prByExercise[entry.exercise].pv) {
                prByExercise[entry.exercise] = {
                    exercise:    entry.exercise,
                    muscleGroup: entry.muscleGroup,
                    set:         set,
                    mode:        mode,
                    pv:          pv
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
            const setDisplay = formatSetForDisplay(pr.set);
            let metricLabel;
            if (pr.mode === 'timed')          metricLabel = 'Best Duration';
            else if (pr.mode === 'bodyweight') metricLabel = 'Best Reps';
            else                               metricLabel = 'Estimated 1RM: ' + pr.pv.toFixed(1) + ' lbs';
            card.innerHTML = `
                <div class="pr-exercise-name">${pr.exercise} <span class="pr-label">PR</span></div>
                <div class="pr-set">${setDisplay}</div>
                <div class="pr-estimated"><em>${metricLabel}</em></div>
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
            <div class="exercise-workout-item-1rm">${progressMetricLabel(entry)}: ${formatProgressMetric(entry)}</div>
            <div class="exercise-workout-item-sets">
                ${entry.sets.map((set, i) => `Set ${i + 1}: ${formatSetForDisplay(set)}`).join(' | ')}
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
                    `<div class="workout-detail-set">Set ${i + 1}: ${formatSetForDisplay(set)}</div>`
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
    const weights = history.map(h => h.progressValue || h.highestWeight || 0);
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
        const y = height - padding - (((entry.progressValue || entry.highestWeight || 0) - minWeight) / weightRange) * chartHeight;

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
        const y = height - padding - (((entry.progressValue || entry.highestWeight || 0) - minWeight) / weightRange) * chartHeight;

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
                    ${workout.exercises.length} exercise${workout.exercises.length !== 1 ? 's' : ''} · ${totalSets} set${totalSets !== 1 ? 's' : ''} · ${totalVolume > 0 ? totalVolume.toLocaleString() + ' lbs' : 'Bodyweight'}
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
        const exerciseVolume = exercise.sets.reduce((sum, set) => {
            const mode = set.mode || 'weighted';
            if (mode !== 'weighted' || !set.weight || !set.reps) return sum;
            return sum + set.weight * set.reps;
        }, 0);
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

    // Read directly from localStorage — avoids any variable scope/order issues
    let templates = [];
    try {
        const stored = localStorage.getItem('workoutTemplatesData');
        if (stored) templates = JSON.parse(stored);
    } catch(e) { templates = []; }

    if (templates.length === 0) {
        pastWorkoutsList.innerHTML =
            '<p class="empty-message" style="font-size:0.85em;padding:12px 0;">' +
            'No saved templates yet.<br>Create one on the Templates page.' +
            '</p>';
        return;
    }

    // Sort most recently updated first
    templates.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));

    templates.forEach(template => {
        const item = document.createElement('div');
        item.className = 'past-workout-item';

        const exerciseNames = (template.exercises || []).map(e => e.exercise).slice(0, 3).join(', ');
        const more = (template.exercises || []).length > 3 ? ` +${(template.exercises).length - 3} more` : '';

        item.innerHTML =
            '<div>' +
            '<div class="past-workout-item-name">' + (template.templateName || 'Unnamed') + '</div>' +
            '<div class="past-workout-item-exercises">' + (exerciseNames || 'No exercises') + more + '</div>' +
            '</div>';

        item.addEventListener('click', () => {
            closeWorkoutLayoutModal();
            loadFromTemplateObj(template);
        });
        pastWorkoutsList.appendChild(item);
    });
}

function startWorkoutFromId(workoutId) {
    const template = workouts.find(w => w.id === workoutId);
    if (!template) return;

    if (workoutDetailModal) workoutDetailModal.classList.add('hidden');
    closeWorkoutLayoutModal();

    // Show setup form so user can confirm/change the date
    createWorkoutSection.classList.remove('hidden');
    if (workoutNameInput) workoutNameInput.value = template.name;
    setDefaultDate();
    document.getElementById('workoutSetupForm').classList.remove('hidden');
    if (addExerciseForm)       addExerciseForm.classList.add('hidden');
    if (currentWorkoutDisplay) currentWorkoutDisplay.classList.add('hidden');

    // Store exercises — loaded after user clicks "Start Workout"
    pendingTemplate = template.exercises.map(ex => ({ ...ex }));

    createWorkoutSection.scrollIntoView({ behavior: 'smooth' });
}

function useWorkoutTemplate(workoutName) {
    // Always use the most recent workout with this name so sets/reps are up to date
    const template = workouts
        .filter(w => w.name === workoutName)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    if (!template) return;

    closeWorkoutLayoutModal();
    createWorkoutSection.classList.remove('hidden');
    if (workoutNameInput) workoutNameInput.value = workoutName;
    setDefaultDate();
    document.getElementById('workoutSetupForm').classList.remove('hidden');
    if (addExerciseForm)       addExerciseForm.classList.add('hidden');
    if (currentWorkoutDisplay) currentWorkoutDisplay.classList.add('hidden');

    // Store exercises — loaded after user clicks "Start Workout"
    pendingTemplate = template.exercises.map(ex => ({ ...ex }));

    createWorkoutSection.scrollIntoView({ behavior: 'smooth' });
}

function prefillNextTemplateExercise() {
    if (templateQueue.length === 0) return;
    const exercise = templateQueue.shift();
    selectExercise(exercise.exercise);

    if (exercise.sets && exercise.sets.length > 0) {
        const mode = getExerciseSetMode(exercise.sets);
        currentExerciseMode = mode;
        updateModeToggleUI(getExerciseType(exercise.exercise) === 'optional_weighted', mode);
        if (exerciseNumSetsInput) exerciseNumSetsInput.value = exercise.sets.length;
        generateExerciseSetInputs(exercise.sets.length);
        const groups = exerciseSetsContainer.querySelectorAll('.exercise-set-input-group');
        exercise.sets.forEach((set, i) => {
            const g = groups[i]; if (!g) return;
            if (mode === 'timed' && set.duration != null) {
                const mEl = g.querySelector('.exercise-set-minutes');
                const sEl = g.querySelector('.exercise-set-seconds');
                if (mEl) mEl.value = Math.floor(set.duration / 60);
                if (sEl) sEl.value = set.duration % 60;
            } else if (mode === 'bodyweight' && set.reps) {
                const rEl = g.querySelector('.exercise-set-reps');
                if (rEl) rEl.value = set.reps;
            } else if (set.weight && set.reps) {
                const wEl = g.querySelector('.exercise-set-weight');
                const rEl = g.querySelector('.exercise-set-reps');
                if (wEl) wEl.value = set.weight;
                if (rEl) rEl.value = set.reps;
            }
        });
    } else {
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

        plans.forEach(function(p) {
            const lbl = document.createElement('div');
            lbl.className = 'cal-event-label cal-label-blue';
            lbl.textContent = p.name + (p.time ? ' ' + formatTime(p.time) : '');
            lbl.style.cursor = 'pointer';
            lbl.title = 'Click to start or delete';
            // Always clickable directly — works even when a completed workout is on the same day
            lbl.addEventListener('click', (function(plan){ return function(e){ e.stopPropagation(); showPlanOptions(plan); }; })(p));
            cell.appendChild(lbl);
        });

        if (hasPlanned && !hasCompleted) {
            cell.style.cursor = 'pointer';
            cell.addEventListener('click', () => startFromPlan(plans[0].id));
        } else if (isFuture || isToday) {
            cell.style.cursor = 'pointer';
            cell.addEventListener('click', () => openPlanModal(cellDate));
        }

        cell.addEventListener('mouseenter', function(){ clearTimeout(calTooltipHideTimer); showCalTooltip(day, calendarYear, calendarMonth, completedMap, plannedMap, cell); });
        cell.addEventListener('mouseleave', scheduleHideCalTooltip);

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
    const byKey = {};
    allEntries.forEach(e => {
        const k = e.progressKey || e.exercise;
        if (!byKey[k]) byKey[k] = [];
        byKey[k].push(e);
    });

    let total = 0;
    Object.keys(firstEver).forEach(k => {
        const base    = firstEver[k];
        const entries = (byKey[k] || []).filter(e => e.workoutDate > base.date);
        if (!entries.length) return;
        const lastDate   = entries.reduce((max, e) => e.workoutDate > max ? e.workoutDate : max, entries[0].workoutDate);
        const latestBest = Math.max(...entries.filter(e => e.workoutDate === lastDate).map(e => e.progressValue || 0));
        if (base.progressValue > 0) total += ((latestBest - base.progressValue) / base.progressValue) * 100;
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
        Object.keys(firstEver).forEach(k => {
            const base = firstEver[k];
            const laterEntries = allEntries.filter(e => (e.progressKey || e.exercise) === k && e.workoutDate > base.date && e.workoutDate <= date);
            if (!laterEntries.length) return;
            const lastDate   = laterEntries.reduce((max, e) => e.workoutDate > max ? e.workoutDate : max, laterEntries[0].workoutDate);
            const latestBest = Math.max(...laterEntries.filter(e => e.workoutDate === lastDate).map(e => e.progressValue || 0));
            if (base.progressValue > 0) total += ((latestBest - base.progressValue) / base.progressValue) * 100;
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

        plans.forEach(function(p) {
            const lbl = document.createElement('div');
            lbl.className = 'cal-event-label cal-label-blue';
            lbl.textContent = p.name + (p.time ? ' ' + formatTime(p.time) : '');
            lbl.style.cursor = 'pointer';
            lbl.title = 'Click to start or delete';
            lbl.addEventListener('click', (function(plan){ return function(e){ e.stopPropagation(); showPlanOptions(plan); }; })(p));
            cell.appendChild(lbl);
        });

        if (hasPlanned && !hasCompleted) {
            cell.style.cursor = 'pointer';
            (function(p){ cell.addEventListener('click', function(){ showPlanOptions(p); }); })(plans[0]);
        } else if (isFuture || isToday) {
            cell.style.cursor = 'pointer';
            (function(d){ cell.addEventListener('click', function(){ openPlanModal(d); }); })(cellDate);
        }

        cell.addEventListener('mouseenter', function(){ clearTimeout(calTooltipHideTimer); showCalTooltip(day, calendarYear, calendarMonth, completedMap, plannedMap, cell); });
        cell.addEventListener('mouseleave', scheduleHideCalTooltip);

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
    editingPlanId = null;
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

    if (editingPlanId) {
        // Update existing planned workout in-place
        const idx = plannedWorkouts.findIndex(function(p){ return p.id === editingPlanId; });
        if (idx !== -1) {
            plannedWorkouts[idx] = {
                id: editingPlanId,
                name: name.trim(),
                date: date,
                time: time || '',
                exercises: planExercises.slice(),
                templateWorkoutId: selectedTemplateId || plannedWorkouts[idx].templateWorkoutId || null
            };
        }
    } else {
        plannedWorkouts.push({
            id: crypto.randomUUID(),
            name: name.trim(),
            date: date,
            time: time || '',
            exercises: planExercises.slice(),
            templateWorkoutId: selectedTemplateId || null
        });
    }
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
    document.getElementById('workoutSetupForm')?.classList.remove('hidden');
    if (addExerciseForm)       addExerciseForm.classList.add('hidden');
    if (currentWorkoutDisplay) currentWorkoutDisplay.classList.add('hidden');

    // Store exercises — loaded after user confirms date and clicks "Start Workout"
    if (plan.templateWorkoutId) {
        const template = workouts.find(w => w.id === plan.templateWorkoutId);
        if (template) {
            pendingTemplate = template.exercises.map(ex => ({ ...ex }));
        }
    } else if (plan.exercises && plan.exercises.length > 0) {
        pendingTemplate = plan.exercises.map(ex => ({ exercise: ex, sets: [] }));
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
        if (!prevBestByExercise[e.exercise] || e.progressValue > prevBestByExercise[e.exercise]) {
            prevBestByExercise[e.exercise] = e.progressValue;
        }
    });

    const newPRs = [];
    workout.exercises.forEach(exercise => {
        const newBestPV = getProgressValue(exercise.sets);
        const prevBest  = prevBestByExercise[exercise.exercise] || 0;

        if (newBestPV > prevBest) {
            // Find the set with the best progress value
            const bestSet = exercise.sets.reduce((best, set) => {
                const pvSet  = getProgressValue([set]);
                const pvBest = getProgressValue([best]);
                return pvSet > pvBest ? set : best;
            }, exercise.sets[0]);
            newPRs.push({
                exercise: exercise.exercise,
                set:      bestSet,
                pv:       newBestPV
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
            '<div class="pr-toast-item">🏆 ' + pr.exercise + ': ' + formatSetForDisplay(pr.set) + '</div>'
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

    const hasPlans = plans.length > 0;

    if (dayWorkouts.length > 0) {
        dayWorkouts.forEach(function(w) {
            const totalSets = w.exercises.reduce(function(s,e){ return s + e.sets.length; }, 0);
            const vol       = w.exercises.reduce(function(t,e){ return t + e.sets.reduce(function(s,set){ return s + (set.weight||0)*(set.reps||0); }, 0); }, 0);
            const exLines   = w.exercises.slice(0,4).map(function(e){ return '• ' + e.exercise; }).join('<br>');
            const more      = w.exercises.length > 4 ? '<br>• +' + (w.exercises.length-4) + ' more' : '';
            html += '<div class="cal-tt-workout">' +
                '<div class="cal-tt-workout-name">💪 ' + w.name + '</div>' +
                '<div class="cal-tt-stats">' + w.exercises.length + ' exercise' + (w.exercises.length!==1?'s':'') + ' · ' + totalSets + ' set' + (totalSets!==1?'s':'') + ' · ' + vol.toLocaleString() + ' lbs</div>' +
                '<div class="cal-tt-exercises">' + exLines + more + '</div>' +
                '</div>';
        });
    } else if (!hasPlans && (isPast || isToday)) {
        html += '<div class="cal-tt-rest">😴 Rest day — no workout logged</div>';
    } else if (!hasPlans) {
        html += '<div class="cal-tt-empty">No workout planned<br><span class="cal-tt-hint">Click to plan one</span></div>';
    }

    // Planned workouts — always shown even alongside completed ones
    if (hasPlans) {
        plans.forEach(function(p) {
            const timeStr = p.time ? '<div class="cal-tt-time">⏰ ' + formatTime(p.time) + '</div>' : '';
            const exLines = p.exercises && p.exercises.length > 0
                ? '<div class="cal-tt-exercises">' + p.exercises.slice(0,4).map(function(e){ return '• '+e; }).join('<br>') + (p.exercises.length>4?'<br>• +'+(p.exercises.length-4)+' more':'') + '</div>'
                : '';
            html += '<div class="cal-tt-plan">' +
                '<div class="cal-tt-plan-name">📅 ' + p.name + '</div>' +
                timeStr + exLines +
                '<div class="cal-tt-plan-btns">' +
                    '<button class="cal-tt-btn cal-tt-btn-start" data-pid="' + p.id + '">▶ Start</button>' +
                    '<button class="cal-tt-btn cal-tt-btn-edit"  data-pid="' + p.id + '">✏️ Edit</button>' +
                    '<button class="cal-tt-btn cal-tt-btn-del"   data-pid="' + p.id + '">🗑 Delete</button>' +
                '</div>' +
                '</div>';
        });
    }

    tt.innerHTML = html;

    // Make tooltip interactive (pointer-events on) when it has action buttons
    tt.style.pointerEvents = hasPlans ? 'auto' : 'none';

    // Wire up the plan action buttons
    if (hasPlans) {
        tt.querySelectorAll('.cal-tt-btn-start').forEach(function(btn) {
            btn.addEventListener('click', function(e) { e.stopPropagation(); hideCalTooltip(); startFromPlan(btn.dataset.pid); });
        });
        tt.querySelectorAll('.cal-tt-btn-edit').forEach(function(btn) {
            btn.addEventListener('click', function(e) { e.stopPropagation(); hideCalTooltip(); editPlanWorkout(btn.dataset.pid); });
        });
        tt.querySelectorAll('.cal-tt-btn-del').forEach(function(btn) {
            btn.addEventListener('click', function(e) { e.stopPropagation(); hideCalTooltip(); deletePlannedWorkout(btn.dataset.pid); });
        });
        // Keep tooltip visible while mouse is over it
        tt.addEventListener('mouseenter', function(){ clearTimeout(calTooltipHideTimer); });
        tt.addEventListener('mouseleave', scheduleHideCalTooltip);
    }

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

function scheduleHideCalTooltip() {
    calTooltipHideTimer = setTimeout(hideCalTooltip, 180);
}

function hideCalTooltip() {
    clearTimeout(calTooltipHideTimer);
    const tt = document.getElementById('calTooltip');
    if (tt) { tt.style.display = 'none'; tt.style.pointerEvents = 'none'; }
}

// Edit a planned workout — opens plan modal pre-filled with existing data
function editPlanWorkout(planId) {
    const plan = plannedWorkouts.find(function(p){ return p.id === planId; });
    if (!plan) return;

    editingPlanId = planId;

    const modal = document.getElementById('planWorkoutModal');
    if (!modal) return;

    const ni = document.getElementById('planName');  if (ni) ni.value = plan.name;
    const di = document.getElementById('planDate');  if (di) di.value = plan.date;
    const ti = document.getElementById('planTime');  if (ti) ti.value = plan.time || '';

    planExercises = plan.exercises ? plan.exercises.slice() : [];
    selectedTemplateId = plan.templateWorkoutId || null;
    renderPlanExerciseList();

    // Populate exercise dropdown if not already done
    populatePlanExerciseDropdown();

    modal.classList.remove('hidden');
}

// ========================================
// WEEKLY VOLUME LANDMARKS
// ========================================

function getWeekBounds(weekOffset) {
    // Rolling 7-day window anchored to today, not Monday-Sunday calendar week.
    // offset 0  → today-6 to today (last 7 days)
    // offset -1 → today-13 to today-7 (previous 7 days)
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setDate(now.getDate() + weekOffset * 7);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
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
            '<div class="vmc-stat"><div class="vmc-stat-label">Last 7 Days</div>',
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

    var avgLabel = distinctWeeks >= 4
        ? '4-Period Rolling Avg'
        : ('Avg Since Tracking (' + divisor + (divisor === 1 ? ' Period)' : ' Periods)'));

    // Current week is always shown for "Total Weekly Sets"
    var thisWeek = getWeekVolume(0);

    // For the average: collect the most recent weeks that actually HAVE workouts
    // (not just the most recent calendar weeks, which may be empty)
    var avgWeeks = [];
    if (distinctWeeks >= 4) {
        // Rolling 4-week average — use the 4 most recent calendar weeks (includes empty ones)
        avgWeeks = [0, -1, -2, -3].map(getWeekVolume);
    } else {
        // Adaptive — find the most recent 'divisor' weeks with workout data
        for (var offset = 0; avgWeeks.length < divisor && offset >= -52; offset--) {
            var v = getWeekVolume(offset);
            var weekTotal = VOLUME_MUSCLES.reduce(function(s, m){ return s + (v[m] || 0); }, 0);
            if (weekTotal > 0 || offset === 0) {   // always include current week
                avgWeeks.push(v);
            }
        }
        // Pad to divisor with empty weeks in case not enough history found
        while (avgWeeks.length < divisor) avgWeeks.push({});
    }

    var avg = {};
    VOLUME_MUSCLES.forEach(function(m) {
        var total = 0;
        for (var i = 0; i < divisor; i++) total += (avgWeeks[i][m] || 0);
        avg[m] = total / divisor;
    });

    var avgTotal = 0;
    for (var i = 0; i < divisor; i++) {
        avgTotal += VOLUME_MUSCLES.reduce(function(s, m){ return s + (avgWeeks[i][m] || 0); }, 0);
    }
    avgTotal = avgTotal / divisor;

    // weekVols[0] is always the current week (for individual card rendering)
    var weekVols = [thisWeek].concat(avgWeeks.slice(1));

    return { avg: avg, avgTotal: avgTotal, divisor: divisor, label: avgLabel, weekVols: weekVols };
}

// Returns a display string for an entry's best progress metric
function formatProgressMetric(entry) {
    const mode = entry.exerciseMode || getExerciseSetMode(entry.sets);
    if (mode === 'timed') {
        const d = entry.progressValue || 0;
        const m = Math.floor(d / 60), s = d % 60;
        return m > 0 ? m + 'm ' + s + 's' : d + ' sec';
    }
    if (mode === 'bodyweight') return (entry.progressValue || 0) + ' reps';
    return (entry.highestWeight || 0) + ' lbs';
}

function progressMetricLabel(entry) {
    const mode = entry.exerciseMode || getExerciseSetMode(entry.sets);
    if (mode === 'timed')      return 'Best Duration';
    if (mode === 'bodyweight') return 'Best Reps';
    return 'Highest Weight';
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
        '<div class="vol-sum-item"><div class="vol-sum-label">Sets (Last 7 Days)</div>',
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
            '<div class="vmc-stat"><div class="vmc-stat-label">Last 7 Days</div>',
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
        '<div class="ri-sub" style="color:' + sColor + '">' + (strongest.value>=0?'+':'') + strongest.value.toFixed(1) + '%</div>',
        '</div>',

        '<div class="ri-item">',
        '<div class="ri-label">📉 Needs Attention</div>',
        '<div class="ri-value" style="color:' + wColor + '">' + weakest.name + '</div>',
        '<div class="ri-sub" style="color:' + wColor + '">' + (weakest.value>=0?'+':'') + weakest.value.toFixed(1) + '%</div>',
        '</div>',

        '<div class="ri-item">',
        '<div class="ri-label">⚖ Muscle Balance Score <span class="info-icon" data-tip="Measures how evenly all 8 muscle groups are progressing. Calculated as 100 minus the average deviation of each muscle from the overall mean. A score of 100 means every muscle is progressing at the exact same rate. The score drops as some muscles fall significantly behind others. Aim for 75+ for well-rounded development.">i</span></div>',
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
                '';
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

// ========================================
// PR HISTORY TIMELINE
// ========================================

function getPRTimeline(progressKey) {
    const allEntries = getAllExerciseEntries(workouts);
    const entries = allEntries
        .filter(e => (e.progressKey || e.exercise) === progressKey)
        .sort((a, b) => a.workoutDate.localeCompare(b.workoutDate));

    const timeline = [];
    let best = 0;

    entries.forEach(entry => {
        if (entry.progressValue > best) {
            best = entry.progressValue;
            const bestSet = entry.sets.reduce(function(b, s) {
                return getProgressValue([s]) > getProgressValue([b]) ? s : b;
            }, entry.sets[0]);
            timeline.push({
                date:        entry.workoutDate,
                workoutName: entry.workoutName,
                set:         bestSet,
                value:       entry.progressValue,
                mode:        entry.exerciseMode || getExerciseSetMode(entry.sets)
            });
        }
    });

    return timeline;
}

function formatPRValue(item) {
    var mode = item.mode || 'weighted';
    var set  = item.set;
    if (mode === 'timed') {
        var d = set.duration || 0, m = Math.floor(d/60), s = d%60;
        return m > 0 ? m + 'm ' + s + 's' : d + ' sec';
    }
    if (mode === 'bodyweight') return (set.reps || 0) + ' reps';
    return (set.weight || 0) + ' lbs × ' + (set.reps || 0) + ' reps';
}

function formatPRSubLabel(item) {
    var mode = item.mode || 'weighted';
    if (mode === 'timed')      return 'Duration';
    if (mode === 'bodyweight') return 'Max Reps';
    return 'Est. 1RM: ' + item.value.toFixed(1) + ' lbs';
}

function renderPRTimeline(progressKey) {
    var timeline = getPRTimeline(progressKey);
    if (timeline.length <= 1) {
        return '<div class="pr-tl-empty">' +
            (timeline.length === 1 ? 'First PR recorded. Complete more workouts to build your PR timeline.' : 'No PR history yet.') +
            '</div>';
    }

    var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var html = '<div class="pr-tl-list">';
    timeline.forEach(function(item, i) {
        var d    = new Date(item.date + 'T00:00:00');
        var dateStr = MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
        var isCurrent = i === timeline.length - 1;
        html += '<div class="pr-tl-item' + (isCurrent ? ' pr-tl-current' : '') + '">' +
            '<div class="pr-tl-dot' + (isCurrent ? ' pr-tl-dot-current' : '') + '"></div>' +
            (i < timeline.length - 1 ? '<div class="pr-tl-line"></div>' : '') +
            '<div class="pr-tl-content">' +
                '<div class="pr-tl-value">' + formatPRValue(item) + (isCurrent ? ' <span class="pr-tl-badge">Current</span>' : '') + '</div>' +
                '<div class="pr-tl-sub">' + formatPRSubLabel(item) + '</div>' +
                '<div class="pr-tl-meta">' + dateStr + ' · ' + item.workoutName + '</div>' +
            '</div>' +
            '</div>';
    });
    return html + '</div>';
}

// ========================================
// RENDER PERSONAL RECORDS v2 (overrides above — adds PR timeline)
// ========================================

function togglePRTimeline(id) {
    var drawer = document.getElementById(id);
    var btn    = drawer ? drawer.previousElementSibling : null;
    if (!drawer) return;
    var hidden = drawer.classList.toggle('hidden');
    if (btn) btn.querySelector('.pr-tl-arrow').textContent = hidden ? '▶' : '▼';
}

function renderPersonalRecords() {
    var container = document.getElementById('personalRecords');
    if (!container) return;

    var query      = (document.getElementById('prSearch') ? document.getElementById('prSearch').value : '').toLowerCase().trim();
    var allEntries = getAllExerciseEntries(workouts);

    if (allEntries.length === 0) {
        container.innerHTML = '<p class="empty-message">No workouts yet. Add one to see your personal records!</p>';
        return;
    }

    // Find best set per exercise using mode-aware progress value
    var prByExercise = {};
    allEntries.forEach(function(entry) {
        entry.sets.forEach(function(set) {
            var mode = set.mode || 'weighted';
            var pv;
            if (mode === 'timed')           pv = set.duration || 0;
            else if (mode === 'bodyweight') pv = set.reps || 0;
            else pv = (set.weight > 0 && set.reps > 0) ? epley1RM(set.weight, set.reps) : 0;

            var key = getProgressKey(entry.exercise, mode);
            if (!prByExercise[key] || pv > prByExercise[key].pv) {
                prByExercise[key] = {
                    exercise:    entry.exercise,
                    muscleGroup: entry.muscleGroup,
                    set:         set,
                    mode:        mode,
                    pv:          pv,
                    progressKey: key
                };
            }
        });
    });

    // Filter by search
    var byMuscle = {};
    Object.values(prByExercise)
        .filter(function(pr) { return !query || pr.exercise.toLowerCase().includes(query); })
        .forEach(function(pr) {
            if (!byMuscle[pr.muscleGroup]) byMuscle[pr.muscleGroup] = [];
            byMuscle[pr.muscleGroup].push(pr);
        });

    container.innerHTML = '';
    if (Object.keys(byMuscle).length === 0) {
        container.innerHTML = '<p class="empty-message">No exercises match your search.</p>';
        return;
    }

    Object.keys(byMuscle).sort().forEach(function(muscle) {
        var section = document.createElement('div');
        section.className = 'pr-muscle-group';
        section.innerHTML = '<h3 class="pr-muscle-title">' + muscle + '</h3>';

        byMuscle[muscle].sort(function(a, b) { return a.exercise.localeCompare(b.exercise); }).forEach(function(pr) {
            var card      = document.createElement('div');
            card.className = 'pr-card';

            var setDisplay  = formatSetForDisplay(pr.set);
            var metricLabel;
            if (pr.mode === 'timed')          metricLabel = 'Best Duration';
            else if (pr.mode === 'bodyweight') metricLabel = 'Best Reps';
            else                               metricLabel = 'Estimated 1RM: ' + pr.pv.toFixed(1) + ' lbs';

            var tlId   = 'tl_' + pr.progressKey.replace(/[^a-z0-9]/gi, '_');
            var tlHtml = renderPRTimeline(pr.progressKey);

            card.innerHTML =
                '<div class="pr-exercise-name">' + pr.exercise + ' <span class="pr-label">PR</span></div>' +
                '<div class="pr-set">' + setDisplay + '</div>' +
                '<div class="pr-estimated"><em>' + metricLabel + '</em></div>' +
                '<button class="pr-timeline-toggle" onclick="togglePRTimeline(\'' + tlId + '\')"><span class="pr-tl-arrow">&#9654;</span> PR History</button>' +
                '<div class="pr-timeline-drawer hidden" id="' + tlId + '">' + tlHtml + '</div>';

            section.appendChild(card);
        });

        container.appendChild(section);
    });
}

// ========================================
// WORKOUT TEMPLATES SYSTEM
// ========================================

var workoutTemplates      = [];
var editingTemplateId     = null;
var templateBuilderExs    = [];   // exercises in editor
var teModeState           = 'weighted';
const TEMPLATES_STORAGE_KEY = 'workoutTemplatesData';

function loadTemplates() {
    try {
        var stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
        if (stored) workoutTemplates = JSON.parse(stored);
    } catch(e) { workoutTemplates = []; }
}

function saveTemplatesData() {
    try { localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(workoutTemplates)); } catch(e) {}
}

// ── Page render ──────────────────────────

function renderTemplatesPage() {
    loadTemplates();
    populateTemplateExerciseDropdown();
    renderTemplatesList();
}

function renderTemplatesList() {
    var container = document.getElementById('templatesList');
    if (!container) return;
    var q = (document.getElementById('templateSearch') ? document.getElementById('templateSearch').value : '').toLowerCase().trim();

    var list = workoutTemplates.slice().sort(function(a,b){ return b.updatedAt.localeCompare(a.updatedAt); });
    if (q) {
        list = list.filter(function(t) {
            return t.templateName.toLowerCase().includes(q) ||
                (t.description||'').toLowerCase().includes(q) ||
                t.exercises.some(function(e){ return e.exercise.toLowerCase().includes(q) || (e.muscleGroup||'').toLowerCase().includes(q); });
        });
    }

    container.innerHTML = '';
    if (list.length === 0) {
        container.innerHTML =
            '<div class="template-empty">' +
            '<div class="template-empty-icon">📋</div>' +
            '<h3>No workout templates yet' + (q ? ' matching your search' : '') + '</h3>' +
            (q ? '' : '<p>Create reusable routines like Push Day, Pull Day, Legs, Upper, or Full Body to start workouts faster.</p>' +
                '<button class="btn btn-primary" onclick="openTemplateEditor(null)">Create Your First Template</button>') +
            '</div>';
        return;
    }

    list.forEach(function(t) { container.appendChild(createTemplateCard(t)); });
}

function createTemplateCard(t) {
    var muscles   = [...new Set(t.exercises.map(function(e){ return e.muscleGroup || ''; }).filter(Boolean))].slice(0,4);
    var totalSets = t.exercises.reduce(function(s,e){ return s + (e.sets ? e.sets.length : 0); }, 0);
    var updDate   = t.updatedAt ? new Date(t.updatedAt + 'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '';

    var card = document.createElement('div');
    card.className = 'template-card';
    card.innerHTML =
        '<div class="tc-header">' +
            '<h3 class="tc-name">' + t.templateName + '</h3>' +
            (t.description ? '<p class="tc-desc">' + t.description + '</p>' : '') +
        '</div>' +
        '<div class="tc-muscles">' + muscles.map(function(m){ return '<span class="tc-muscle-tag">' + m + '</span>'; }).join('') + '</div>' +
        '<div class="tc-stats">' +
            '<span>' + t.exercises.length + ' exercise' + (t.exercises.length!==1?'s':'') + '</span>' +
            '<span>' + totalSets + ' set' + (totalSets!==1?'s':'') + '</span>' +
            (updDate ? '<span>Updated ' + updDate + '</span>' : '') +
        '</div>' +
        '<div class="tc-actions">' +
            '<button class="btn btn-primary tc-btn-start" onclick="startFromTemplate(\'' + t.templateId + '\')">▶ Start Workout</button>' +
            '<button class="btn btn-secondary tc-btn" onclick="openTemplateEditor(\'' + t.templateId + '\')">✏️ Edit</button>' +
            '<button class="btn tc-btn tc-btn-dup" onclick="duplicateTemplate(\'' + t.templateId + '\')">⧉ Duplicate</button>' +
            '<button class="btn btn-delete tc-btn" onclick="deleteTemplate(\'' + t.templateId + '\')">Delete</button>' +
        '</div>';
    return card;
}

// ── Template Editor ──────────────────────

function openTemplateEditor(templateId) {
    editingTemplateId = templateId;
    templateBuilderExs = [];

    if (templateId) {
        var t = workoutTemplates.find(function(x){ return x.templateId === templateId; });
        if (!t) return;
        document.getElementById('teTitle').textContent     = 'Edit Template';
        document.getElementById('teName').value            = t.templateName;
        document.getElementById('teDescription').value     = t.description || '';
        templateBuilderExs = t.exercises.map(function(e){ return Object.assign({}, e, { sets: e.sets ? e.sets.map(function(s){ return Object.assign({}, s); }) : [] }); });
    } else {
        document.getElementById('teTitle').textContent = 'Create Template';
        document.getElementById('teName').value        = '';
        document.getElementById('teDescription').value = '';
    }

    clearTEAddForm();
    renderTEExerciseList();
    document.getElementById('templateEditorModal').classList.remove('hidden');
}

function closeTemplateEditor() {
    document.getElementById('templateEditorModal').classList.add('hidden');
    editingTemplateId = null;
    templateBuilderExs = [];
}

function clearTEAddForm() {
    var si = document.getElementById('teExerciseSearch');
    var hi = document.getElementById('teExerciseSelect');
    if (si) si.value = '';
    if (hi) hi.value = '';
    var ns = document.getElementById('teNumSets');
    if (ns) ns.value = '';
    document.getElementById('teSetDefaults').innerHTML = '';
    teModeState = 'weighted';
    updateTEModeToggleUI(false);
    var dd = document.getElementById('teExerciseDropdown');
    if (dd) dd.classList.add('hidden');
}

function renderTEExerciseList() {
    var list = document.getElementById('teExercisesList');
    if (!list) return;
    list.innerHTML = '';
    if (templateBuilderExs.length === 0) {
        list.innerHTML = '<p class="te-ex-empty">No exercises added yet.</p>';
        return;
    }
    templateBuilderExs.forEach(function(ex, i) {
        var mode     = ex.mode || (ex.sets && ex.sets[0] ? ex.sets[0].mode || 'weighted' : 'weighted');
        var setsSum  = ex.sets ? ex.sets.length : 0;
        var setLabel = setsSum === 1 ? '1 set' : setsSum + ' sets';
        var defVal   = '';
        if (ex.sets && ex.sets.length > 0) {
            var s = ex.sets[0];
            if (mode === 'timed')           defVal = ' · ' + (s.duration||0) + 's';
            else if (mode === 'bodyweight') defVal = ' · BW × ' + (s.reps||'?');
            else                            defVal = ' · ' + (s.weight||'?') + ' lbs × ' + (s.reps||'?');
        }

        var row = document.createElement('div');
        row.className = 'te-ex-item';
        row.innerHTML =
            '<div class="te-ex-info">' +
                '<span class="te-ex-name">' + ex.exercise + '</span>' +
                '<span class="te-ex-meta">' + (ex.muscleGroup||'') + ' · ' + setLabel + defVal + '</span>' +
            '</div>' +
            '<button class="btn-remove-plan-ex" onclick="removeTEExercise(' + i + ')">✕</button>';
        list.appendChild(row);
    });
}

function removeTEExercise(index) {
    templateBuilderExs.splice(index, 1);
    renderTEExerciseList();
}

function setTEMode(mode) {
    teModeState = mode;
    document.getElementById('teModeBtnBW') && document.getElementById('teModeBtnBW').classList.toggle('mode-btn-active', mode === 'bodyweight');
    document.getElementById('teModeBtnW')  && document.getElementById('teModeBtnW').classList.toggle('mode-btn-active',  mode === 'weighted');
    refreshTESetInputs();
}

function updateTEModeToggleUI(show, activeMode) {
    var tog = document.getElementById('teModeToggle');
    if (!tog) return;
    if (!show) { tog.classList.add('hidden'); return; }
    tog.classList.remove('hidden');
    document.getElementById('teModeBtnBW') && document.getElementById('teModeBtnBW').classList.toggle('mode-btn-active', activeMode === 'bodyweight');
    document.getElementById('teModeBtnW')  && document.getElementById('teModeBtnW').classList.toggle('mode-btn-active',  activeMode === 'weighted');
}

function refreshTESetInputs() {
    var n = parseInt(document.getElementById('teNumSets') ? document.getElementById('teNumSets').value : 0) || 0;
    var container = document.getElementById('teSetDefaults');
    if (!container || n <= 0) { if (container) container.innerHTML = ''; return; }

    container.innerHTML = '';
    for (var i = 1; i <= Math.min(n, 10); i++) {
        var row = document.createElement('div');
        row.className = 'current-set-edit-row';
        var inner = '<span class="set-label">Set ' + i + '</span>';
        if (teModeState === 'timed') {
            inner += '<input type="number" class="set-weight-edit te-min" min="0" placeholder="min" value="0">' +
                     '<span class="set-unit">m</span>' +
                     '<input type="number" class="set-reps-edit te-sec" min="0" max="59" placeholder="sec" value="0">' +
                     '<span class="set-unit">s</span>';
        } else if (teModeState === 'bodyweight') {
            inner += '<span class="set-unit">BW ×</span>' +
                     '<input type="number" class="set-reps-edit" min="1" placeholder="reps">' +
                     '<span class="set-unit">reps</span>';
        } else {
            inner += '<input type="number" class="set-weight-edit" min="0" step="0.5" placeholder="lbs">' +
                     '<span class="set-unit">lbs ×</span>' +
                     '<input type="number" class="set-reps-edit" min="1" placeholder="reps">' +
                     '<span class="set-unit">reps</span>';
        }
        row.innerHTML = inner;
        container.appendChild(row);
    }
}

function addExerciseToTemplateBuilder() {
    var exName = document.getElementById('teExerciseSelect') ? document.getElementById('teExerciseSelect').value.trim() : '';
    if (!exName) { alert('Please select an exercise.'); return; }
    var n = parseInt(document.getElementById('teNumSets') ? document.getElementById('teNumSets').value : 0) || 0;
    if (n <= 0) { alert('Please enter number of sets.'); return; }

    var rows = document.getElementById('teSetDefaults') ? document.getElementById('teSetDefaults').querySelectorAll('.current-set-edit-row') : [];
    var sets = [];
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (teModeState === 'timed') {
            var m = parseInt(row.querySelector('.te-min') ? row.querySelector('.te-min').value : 0) || 0;
            var s = parseInt(row.querySelector('.te-sec') ? row.querySelector('.te-sec').value : 0) || 0;
            sets.push({ duration: m*60+s, mode: 'timed' });
        } else if (teModeState === 'bodyweight') {
            sets.push({ reps: parseInt(row.querySelector('.set-reps-edit') ? row.querySelector('.set-reps-edit').value : 0) || 0, mode: 'bodyweight' });
        } else {
            sets.push({
                weight: parseFloat(row.querySelector('.set-weight-edit') ? row.querySelector('.set-weight-edit').value : 0) || 0,
                reps:   parseInt(row.querySelector('.set-reps-edit') ? row.querySelector('.set-reps-edit').value : 0) || 0,
                mode:   'weighted'
            });
        }
    }

    templateBuilderExs.push({
        exercise:    exName,
        muscleGroup: EXERCISE_TO_MUSCLE[exName] || '',
        mode:        teModeState,
        sets:        sets
    });

    renderTEExerciseList();
    clearTEAddForm();
}

function saveTemplate() {
    var name = document.getElementById('teName') ? document.getElementById('teName').value.trim() : '';
    if (!name) { alert('Please enter a template name.'); return; }

    var now = new Date().toISOString().split('T')[0];
    if (editingTemplateId) {
        var idx = workoutTemplates.findIndex(function(t){ return t.templateId === editingTemplateId; });
        if (idx !== -1) {
            workoutTemplates[idx].templateName  = name;
            workoutTemplates[idx].description   = document.getElementById('teDescription') ? document.getElementById('teDescription').value.trim() : '';
            workoutTemplates[idx].exercises     = templateBuilderExs.slice();
            workoutTemplates[idx].updatedAt     = now;
        }
    } else {
        workoutTemplates.push({
            templateId:   crypto.randomUUID(),
            templateName: name,
            description:  document.getElementById('teDescription') ? document.getElementById('teDescription').value.trim() : '',
            createdAt:    now,
            updatedAt:    now,
            exercises:    templateBuilderExs.slice()
        });
    }
    saveTemplatesData();
    closeTemplateEditor();
    renderTemplatesList();
    showToastMsg('Template saved!', '#22c55e');
}

function deleteTemplate(templateId) {
    if (!confirm('Delete this template? This will not affect completed workouts.')) return;
    workoutTemplates = workoutTemplates.filter(function(t){ return t.templateId !== templateId; });
    saveTemplatesData();
    renderTemplatesList();
}

function duplicateTemplate(templateId) {
    var orig = workoutTemplates.find(function(t){ return t.templateId === templateId; });
    if (!orig) return;
    var now = new Date().toISOString().split('T')[0];
    var copy = JSON.parse(JSON.stringify(orig));
    copy.templateId   = crypto.randomUUID();
    copy.templateName = orig.templateName + ' Copy';
    copy.createdAt    = now;
    copy.updatedAt    = now;
    workoutTemplates.push(copy);
    saveTemplatesData();
    renderTemplatesList();
    showToastMsg('Template duplicated!', '#6c5cd2');
}

// ── Start workout from template ──────────

function startFromTemplate(templateId) {
    sessionStorage.setItem('pendingTemplateId', templateId);
    location.href = 'index.html';
}

function loadFromTemplateObj(template) {
    if (createWorkoutSection) createWorkoutSection.classList.remove('hidden');
    if (workoutNameInput) workoutNameInput.value = template.templateName;
    setDefaultDate();
    var sf = document.getElementById('workoutSetupForm');
    if (sf) sf.classList.remove('hidden');
    if (addExerciseForm)       addExerciseForm.classList.add('hidden');
    if (currentWorkoutDisplay) currentWorkoutDisplay.classList.add('hidden');
    pendingTemplate = template.exercises.map(function(ex){
        return Object.assign({}, ex, { sets: (ex.sets||[]).map(function(s){ return Object.assign({}, s); }) });
    });
    if (createWorkoutSection) createWorkoutSection.scrollIntoView({ behavior: 'smooth' });
}

// ── Save past workout as template ────────

function saveWorkoutAsTemplate(workoutId) {
    loadTemplates();
    var workout = workouts.find(function(w){ return w.id === workoutId; });
    if (!workout) return;
    var now = new Date().toISOString().split('T')[0];
    workoutTemplates.push({
        templateId:   crypto.randomUUID(),
        templateName: workout.name,
        description:  '',
        createdAt:    now,
        updatedAt:    now,
        exercises:    workout.exercises.map(function(ex){
            return {
                exercise:    ex.exercise,
                muscleGroup: ex.muscleGroup,
                mode:        getExerciseSetMode(ex.sets),
                sets:        ex.sets.map(function(s){ return Object.assign({}, s); })
            };
        })
    });
    saveTemplatesData();
    showToastMsg('Template saved: ' + workout.name, '#22c55e');
}

// ── Exercise dropdown for template editor ─

function populateTemplateExerciseDropdown() {
    var dropdown = document.getElementById('teExerciseDropdown');
    if (!dropdown) return;
    dropdown.innerHTML = '';
    Object.entries(EXERCISES_BY_MUSCLE).forEach(function(entry) {
        var muscle = entry[0], exercises = entry[1];
        var g = document.createElement('div');
        g.className = 'exercise-dropdown-group';
        g.textContent = muscle;
        dropdown.appendChild(g);
        exercises.forEach(function(ex) {
            var item = document.createElement('div');
            item.className = 'exercise-dropdown-item';
            item.textContent = ex;
            item.addEventListener('mousedown', function(e) {
                e.preventDefault();
                selectTEExercise(ex);
            });
            dropdown.appendChild(item);
        });
    });

    var searchInput = document.getElementById('teExerciseSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterTEDropdown);
        searchInput.addEventListener('focus', function() {
            filterTEDropdown();
            dropdown.classList.remove('hidden');
        });
        searchInput.addEventListener('blur', function() {
            setTimeout(function() { dropdown.classList.add('hidden'); }, 160);
        });
    }
}

function filterTEDropdown() {
    var dd = document.getElementById('teExerciseDropdown');
    var si = document.getElementById('teExerciseSearch');
    if (!dd || !si) return;
    var q = si.value.toLowerCase().trim();
    dd.classList.remove('hidden');
    dd.querySelectorAll('.exercise-dropdown-item').forEach(function(item) {
        item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
    dd.querySelectorAll('.exercise-dropdown-group').forEach(function(group) {
        var el = group.nextElementSibling, vis = false;
        while (el && !el.classList.contains('exercise-dropdown-group')) {
            if (el.style.display !== 'none') vis = true;
            el = el.nextElementSibling;
        }
        group.style.display = vis ? '' : 'none';
    });
}

function selectTEExercise(value) {
    var hi = document.getElementById('teExerciseSelect');
    var si = document.getElementById('teExerciseSearch');
    var dd = document.getElementById('teExerciseDropdown');
    if (hi) hi.value = value;
    if (si) si.value = value;
    if (dd) dd.classList.add('hidden');

    var type = getExerciseType(value);
    if (type === 'optional_weighted') {
        teModeState = 'bodyweight';
        updateTEModeToggleUI(true, 'bodyweight');
    } else {
        teModeState = type === 'timed' ? 'timed' : (type === 'bodyweight' ? 'bodyweight' : 'weighted');
        updateTEModeToggleUI(false);
    }
    refreshTESetInputs();
}

// ── Generic toast helper ─────────────────

function showToastMsg(msg, color) {
    var t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(0);background:' + color + ';color:#fff;padding:12px 24px;border-radius:10px;font-weight:700;font-size:0.9em;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.4);transition:opacity 0.4s';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function() { t.style.opacity = '0'; setTimeout(function() { t.remove(); }, 400); }, 2500);
}

// ── Templates page DOMContentLoaded hook (appended) ──
(function() {
    var _orig = document.addEventListener;
    // Run templates page init if needed — triggered by currentPage already set
    if (typeof currentPage !== 'undefined' && currentPage === 'templates') {
        document.addEventListener('DOMContentLoaded', function() {
            // renderTemplatesPage already called in main DOMContentLoaded if page is 'templates'
            // but we add it here as a fallback
            if (typeof renderTemplatesPage === 'function' && !document.getElementById('templatesList').children.length) {
                renderTemplatesPage();
            }
        });
    }
})();

// Patch the single DOMContentLoaded to handle templates + pendingTemplateId
document.addEventListener('DOMContentLoaded', function patchDCL() {
    // Templates page
    if (typeof currentPage !== 'undefined' && currentPage === 'templates') {
        if (typeof renderTemplatesPage === 'function') renderTemplatesPage();
    }
    // Dashboard: start workout from template
    if (typeof currentPage !== 'undefined' && currentPage === 'dashboard') {
        var ptId = sessionStorage.getItem('pendingTemplateId');
        if (ptId) {
            sessionStorage.removeItem('pendingTemplateId');
            if (typeof loadTemplates === 'function') loadTemplates();
            if (typeof workoutTemplates !== 'undefined') {
                var tpl = workoutTemplates.find(function(t){ return t.templateId === ptId; });
                if (tpl && typeof loadFromTemplateObj === 'function') {
                    setTimeout(function(){ loadFromTemplateObj(tpl); }, 150);
                }
            }
        }
    }
});

// ── Override renderWorkoutHistory to add "Save as Template" button ──
var _origRWH = renderWorkoutHistory;
renderWorkoutHistory = function() {
    _origRWH();
    // Add "Save as Template" buttons to all cards after render
    if (workoutHistoryContainer) {
        workoutHistoryContainer.querySelectorAll('.workout-card-actions').forEach(function(actions) {
            if (actions.querySelector('.btn-save-template')) return; // already added
            var editBtn = actions.querySelector('.btn-edit-history');
            var wid = null;
            // Find workout id from the onclick of the Start button
            var startBtn = actions.querySelector('.btn-start-history');
            if (startBtn) {
                var m = startBtn.getAttribute('onclick').match(/'([^']+)'\)/);
                if (m) wid = m[1];
            }
            if (!wid) return;
            var btn = document.createElement('button');
            btn.className = 'btn btn-save-template';
            btn.textContent = '📋 Save as Template';
            btn.setAttribute('onclick', "event.stopPropagation(); saveWorkoutAsTemplate('" + wid + "')");
            if (editBtn) {
                actions.insertBefore(btn, editBtn.nextSibling);
            } else {
                actions.insertBefore(btn, actions.lastElementChild);
            }
        });
    }
};

// ========================================
// PLAN OPTIONS MODAL (Start or Delete)
// ========================================

function showPlanOptions(plan) {
    var existing = document.getElementById('planOptionsModal');
    if (existing) existing.remove();

    var timeStr = plan.time ? '<div class="po-time">&#9201; ' + formatTime(plan.time) + '</div>' : '';
    var exList = (plan.exercises && plan.exercises.length > 0)
        ? '<div class="po-exercises">' + plan.exercises.slice(0,4).map(function(e){ return '• ' + e; }).join('<br>') +
          (plan.exercises.length > 4 ? '<br>• +' + (plan.exercises.length - 4) + ' more' : '') + '</div>'
        : '';

    var modal = document.createElement('div');
    modal.id = 'planOptionsModal';
    modal.className = 'plan-options-modal';
    modal.innerHTML =
        '<div class="po-backdrop" onclick="closePlanOptions()"></div>' +
        '<div class="po-content">' +
            '<div class="po-header">' +
                '<div class="po-name">' + plan.name + '</div>' +
                timeStr + exList +
            '</div>' +
            '<div class="po-actions">' +
                '<button class="btn btn-primary" onclick="closePlanOptions(); startFromPlan(\'' + plan.id + '\')">&#9654; Start Workout</button>' +
                '<button class="btn btn-danger" onclick="closePlanOptions(); deletePlannedWorkout(\'' + plan.id + '\')">&#128465; Delete Plan</button>' +
                '<button class="btn btn-secondary" onclick="closePlanOptions()">Cancel</button>' +
            '</div>' +
        '</div>';

    document.body.appendChild(modal);
    requestAnimationFrame(function() { requestAnimationFrame(function() { modal.classList.add('po-visible'); }); });
}

function closePlanOptions() {
    var modal = document.getElementById('planOptionsModal');
    if (modal) modal.remove();
}

function deletePlannedWorkout(planId) {
    plannedWorkouts = plannedWorkouts.filter(function(p) { return p.id !== planId; });
    savePlannedWorkouts();
    if (currentPage === 'calendar') {
        renderFullCalendar();
    } else {
        renderWorkoutCalendar();
    }
}

// ============================================================
// FAST WORKOUT LOGGING SYSTEM
// Designed to feel like Strong / Hevy — minimal taps to log a set.
// All existing data structures and localStorage keys are preserved.
// ============================================================

// ── Rest Timer state ─────────────────────────────────────────
var restTimerInterval  = null;
var restTimerSeconds   = 0;
var restTimerRunning   = false;
var restTimerDefault   = 90; // seconds — user can change via the UI

function formatRestTime(secs) {
    var m = Math.floor(secs / 60);
    var s = secs % 60;
    return m + ':' + (s < 10 ? '0' + s : s);
}

function startRestTimer() {
    stopRestTimer();
    restTimerSeconds  = restTimerDefault;
    restTimerRunning  = true;
    updateRestTimerDisplay();
    restTimerInterval = setInterval(function() {
        if (restTimerSeconds > 0) {
            restTimerSeconds--;
            updateRestTimerDisplay();
        } else {
            stopRestTimer();
            var bar = document.getElementById('restTimerBar');
            if (bar) bar.classList.add('rest-timer-done');
        }
    }, 1000);
}

function stopRestTimer() {
    clearInterval(restTimerInterval);
    restTimerRunning = false;
}

function resetRestTimer() {
    stopRestTimer();
    restTimerSeconds = 0;
    var bar = document.getElementById('restTimerBar');
    if (bar) bar.classList.remove('rest-timer-done');
    updateRestTimerDisplay();
}

function updateRestTimerDisplay() {
    var el = document.getElementById('restTimerDisplay');
    if (!el) return;
    if (restTimerSeconds > 0 || restTimerRunning) {
        el.textContent = 'Rest  ' + formatRestTime(restTimerSeconds);
        var bar = document.getElementById('restTimerBar');
        if (bar) bar.classList.toggle('rest-timer-running', restTimerRunning);
    } else {
        el.textContent = '⏱ Rest Timer';
    }
}

// ── Look up previous workout for "Last time" display ─────────
function getLastWorkoutForExercise(exerciseName) {
    var currentDate = currentWorkout.date || '9999-99-99';
    // Search workouts in reverse-date order, skip the current session
    var history = workouts
        .filter(function(w) { return w.id !== currentWorkout.id; })
        .sort(function(a, b) { return b.date.localeCompare(a.date); });

    for (var i = 0; i < history.length; i++) {
        var ex = history[i].exercises.find(function(e) { return e.exercise === exerciseName; });
        if (ex) return ex;
    }
    return null;
}

function formatSetShort(set) {
    var m = set.mode || 'weighted';
    if (m === 'timed') {
        var d = set.duration || 0;
        var min = Math.floor(d/60), sec = d%60;
        return min > 0 ? min + 'm' + sec + 's' : sec + 's';
    }
    if (m === 'bodyweight') return 'BW×' + (set.reps || 0);
    return (set.weight || 0) + '×' + (set.reps || 0);
}

// ── Set management ───────────────────────────────────────────

// Toggle set as completed; starts rest timer on completion
function completeSet(exIdx, setIdx) {
    var sets = currentWorkout.exercises[exIdx] && currentWorkout.exercises[exIdx].sets;
    if (!sets || !sets[setIdx]) return;
    sets[setIdx].completed = !sets[setIdx].completed;
    if (sets[setIdx].completed) {
        startRestTimer();
        document.getElementById('restTimerBar') && document.getElementById('restTimerBar').classList.remove('rest-timer-done');
    }
    renderActiveWorkout();
}

// Add a set to an exercise, duplicating the previous set's values
function addSetToExercise(exIdx) {
    var exercise = currentWorkout.exercises[exIdx];
    if (!exercise) return;
    var sets = exercise.sets;
    var newSet;
    if (sets.length > 0) {
        // Duplicate last set, mark as incomplete
        newSet = Object.assign({}, sets[sets.length - 1], { completed: false });
    } else {
        var mode = getExerciseType(exercise.exercise);
        if (mode === 'timed')      newSet = { duration: 60, mode: 'timed', completed: false };
        else if (mode === 'bodyweight') newSet = { reps: 10, mode: 'bodyweight', completed: false };
        else                            newSet = { weight: 0, reps: 10, mode: 'weighted', completed: false };
    }
    exercise.sets.push(newSet);
    renderActiveWorkout();
}

// Remove a single set (removes exercise card if last set deleted)
function removeSetFromExercise(exIdx, setIdx) {
    var exercise = currentWorkout.exercises[exIdx];
    if (!exercise) return;
    exercise.sets.splice(setIdx, 1);
    if (exercise.sets.length === 0) {
        currentWorkout.exercises.splice(exIdx, 1);
    }
    renderActiveWorkout();
}

// Remove entire exercise card
function removeExerciseCard(exIdx) {
    currentWorkout.exercises.splice(exIdx, 1);
    renderActiveWorkout();
}

// Quick +/- adjustments — update data then re-render
function adjustWeight(exIdx, setIdx, delta) {
    var set = currentWorkout.exercises[exIdx] && currentWorkout.exercises[exIdx].sets[setIdx];
    if (!set) return;
    set.weight = Math.max(0, ((set.weight || 0) + delta));
    renderActiveWorkout();
}

function adjustReps(exIdx, setIdx, delta) {
    var set = currentWorkout.exercises[exIdx] && currentWorkout.exercises[exIdx].sets[setIdx];
    if (!set) return;
    set.reps = Math.max(1, ((set.reps || 0) + delta));
    renderActiveWorkout();
}

// Update weight from inline input without re-rendering (keeps focus)
function updateSetWeight(exIdx, setIdx, val) {
    var set = currentWorkout.exercises[exIdx] && currentWorkout.exercises[exIdx].sets[setIdx];
    if (set) set.weight = parseFloat(val) || 0;
}
function updateSetReps(exIdx, setIdx, val) {
    var set = currentWorkout.exercises[exIdx] && currentWorkout.exercises[exIdx].sets[setIdx];
    if (set) set.reps = parseInt(val) || 0;
}
function updateSetDuration(exIdx, setIdx, mins, secs) {
    var set = currentWorkout.exercises[exIdx] && currentWorkout.exercises[exIdx].sets[setIdx];
    if (set) set.duration = (parseInt(mins)||0)*60 + (parseInt(secs)||0);
}

// ── Main render: Active workout card view ────────────────────
function renderActiveWorkout() {
    var container = document.getElementById('currentExercisesList');
    var display   = document.getElementById('currentWorkoutDisplay');
    if (!container || !display) return;

    display.classList.remove('hidden');

    // ── Rest timer bar (injected once above the list) ───────
    var timerBar = document.getElementById('restTimerBar');
    if (!timerBar) {
        timerBar = document.createElement('div');
        timerBar.id = 'restTimerBar';
        timerBar.className = 'rest-timer-bar';
        timerBar.innerHTML =
            '<span id="restTimerDisplay">⏱ Rest Timer</span>' +
            '<div class="rest-timer-controls">' +
                '<button onclick="startRestTimer()" class="rest-btn">Start</button>' +
                '<button onclick="resetRestTimer()" class="rest-btn">Reset</button>' +
                '<select id="restTimerSelect" onchange="restTimerDefault=parseInt(this.value)" class="rest-select">' +
                    '<option value="60">60s</option>' +
                    '<option value="90" selected>90s</option>' +
                    '<option value="120">2m</option>' +
                    '<option value="180">3m</option>' +
                '</select>' +
            '</div>';
        // Insert before the exercise list
        var h3 = display.querySelector('h3');
        if (h3) h3.after(timerBar);
        else container.before(timerBar);
    }
    updateRestTimerDisplay();

    container.innerHTML = '';

    if (currentWorkout.exercises.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:24px 0;">No exercises yet — add one below.</p>';
        return;
    }

    currentWorkout.exercises.forEach(function(exercise, exIdx) {
        var card = document.createElement('div');
        card.className = 'active-exercise-card';

        var mode = exercise.sets.length > 0 ? (exercise.sets[0].mode || 'weighted') : (getExerciseType(exercise.exercise) === 'timed' ? 'timed' : getExerciseType(exercise.exercise) === 'bodyweight' ? 'bodyweight' : 'weighted');

        // "Last time" lookup
        var lastEx = getLastWorkoutForExercise(exercise.exercise);
        var lastHtml = '';
        if (lastEx && lastEx.sets && lastEx.sets.length > 0) {
            lastHtml = '<div class="last-time-row">Last: ' +
                lastEx.sets.map(formatSetShort).join(' · ') +
                '</div>';
        }

        // Build each set row
        var setRows = exercise.sets.map(function(set, setIdx) {
            var sm        = set.mode || 'weighted';
            var done      = set.completed ? ' set-row-done' : '';
            var doneIcon  = set.completed ? '✓' : '○';
            var doneCls   = set.completed ? ' complete-done' : '';

            var inputsHtml = '';
            if (sm === 'timed') {
                var d = set.duration || 0;
                var mm = Math.floor(d/60), ss = d%60;
                inputsHtml =
                    '<input type="number" class="fast-input" value="' + mm + '" min="0"' +
                    ' onchange="updateSetDuration(' + exIdx + ',' + setIdx + ',this.value,document.getElementById(\'ss_' + exIdx + '_' + setIdx + '\').value)"' +
                    '> <span class="set-unit">m</span>' +
                    '<input type="number" class="fast-input" id="ss_' + exIdx + '_' + setIdx + '" value="' + ss + '" min="0" max="59"' +
                    ' onchange="updateSetDuration(' + exIdx + ',' + setIdx + ',document.getElementById(\'mm_' + exIdx + '_' + setIdx + '\').value,this.value)"' +
                    '> <span class="set-unit">s</span>';
            } else if (sm === 'bodyweight') {
                inputsHtml =
                    '<span class="bw-pill">BW</span>' +
                    '<input type="number" class="fast-input" value="' + (set.reps || '') + '" min="1" placeholder="reps"' +
                    ' onchange="updateSetReps(' + exIdx + ',' + setIdx + ',this.value)">' +
                    '<span class="set-unit">reps</span>' +
                    '<div class="quick-adj">' +
                        '<button onclick="adjustReps(' + exIdx + ',' + setIdx + ',-1)">-1</button>' +
                        '<button onclick="adjustReps(' + exIdx + ',' + setIdx + ',1)">+1</button>' +
                    '</div>';
            } else {
                inputsHtml =
                    '<input type="number" class="fast-input fast-weight" value="' + (set.weight || '') + '" min="0" step="2.5" placeholder="lbs"' +
                    ' onchange="updateSetWeight(' + exIdx + ',' + setIdx + ',this.value)">' +
                    '<span class="set-unit">×</span>' +
                    '<input type="number" class="fast-input fast-reps" value="' + (set.reps || '') + '" min="1" placeholder="reps"' +
                    ' onchange="updateSetReps(' + exIdx + ',' + setIdx + ',this.value)">' +
                    '<div class="quick-adj">' +
                        '<button onclick="adjustWeight(' + exIdx + ',' + setIdx + ',-5)">-5</button>' +
                        '<button onclick="adjustWeight(' + exIdx + ',' + setIdx + ',5)">+5</button>' +
                        '<button onclick="adjustReps(' + exIdx + ',' + setIdx + ',-1)">-1r</button>' +
                        '<button onclick="adjustReps(' + exIdx + ',' + setIdx + ',1)">+1r</button>' +
                    '</div>';
            }

            return '<div class="active-set-row' + done + '">' +
                '<span class="set-num-label">Set ' + (setIdx+1) + '</span>' +
                '<div class="set-row-inputs">' + inputsHtml + '</div>' +
                '<button class="complete-btn' + doneCls + '" onclick="completeSet(' + exIdx + ',' + setIdx + ')" title="Complete set">' + doneIcon + '</button>' +
                '<button class="remove-set-x" onclick="removeSetFromExercise(' + exIdx + ',' + setIdx + ')" title="Remove set">✕</button>' +
                '</div>';
        }).join('');

        card.innerHTML =
            '<div class="active-ex-header">' +
                '<div class="active-ex-name">' + exercise.exercise + '</div>' +
                '<span class="active-ex-muscle">' + (exercise.muscleGroup || '') + '</span>' +
                '<button class="remove-ex-x" onclick="removeExerciseCard(' + exIdx + ')" title="Remove exercise">✕</button>' +
            '</div>' +
            lastHtml +
            '<div class="active-sets-list">' + setRows + '</div>' +
            '<button class="add-set-btn-fast" onclick="addSetToExercise(' + exIdx + ')">+ Set</button>';

        container.appendChild(card);
    });
}

// ── Override updateCurrentWorkoutDisplay to use new renderer ─
// Preserves all existing callers — they just get the new UI.
function updateCurrentWorkoutDisplay() {
    renderActiveWorkout();
}

// ── Strip completed flags before saving (keeps localStorage clean) ─
var _origSaveCurrentWorkout = saveCurrentWorkout;
saveCurrentWorkout = function() {
    // Temporarily strip completed flags from sets before the original save runs
    currentWorkout.exercises = currentWorkout.exercises.map(function(ex) {
        return Object.assign({}, ex, {
            sets: ex.sets.map(function(s) {
                var clean = Object.assign({}, s);
                delete clean.completed;
                return clean;
            })
        });
    });
    _origSaveCurrentWorkout();
};

// ============================================================
// REST TIMER UPDATE: toggle, custom time, save rest per set
// Overrides the initial fast_log.js functions at runtime
// (var assignment beats hoisted function declarations)
// ============================================================

// Restore state — default ON, persisted in localStorage
var restTimerEnabled      = localStorage.getItem('restTimerEnabled') !== 'false';
var lastSetCompletedTime  = null;  // tracks when the last set was completed

// ── Build the full timer bar HTML ─────────────────────────────
function getRestTimerBarHTML() {
    var mins = Math.floor(restTimerDefault / 60);
    var secs = restTimerDefault % 60;
    return (
        // Top row: toggle + live display + start/reset
        '<div class="rest-top-row">' +
            '<button class="rest-toggle ' + (restTimerEnabled ? 'rest-toggle-on' : 'rest-toggle-off') +
                '" onclick="toggleRestTimer()" title="Enable or disable the rest timer">' +
                (restTimerEnabled ? '⏸ Timer ON' : '▷ Timer OFF') +
            '</button>' +
            '<span id="restTimerDisplay">' + (restTimerEnabled ? '⏱ Rest Timer' : 'Rest timer disabled') + '</span>' +
            '<div class="rest-ctrl-btns">' +
                '<button class="rest-btn" onclick="startRestTimer()"' + (!restTimerEnabled ? ' disabled' : '') + '>Start</button>' +
                '<button class="rest-btn" onclick="resetRestTimer()">Reset</button>' +
            '</div>' +
        '</div>' +
        // Bottom row: custom time input + presets (hidden when timer is OFF)
        '<div class="rest-bottom-row' + (!restTimerEnabled ? ' rest-row-hidden' : '') + '">' +
            '<span class="rest-cfg-label">Set time:</span>' +
            '<input type="number" id="customRestMin" class="rest-time-input" value="' + mins + '" min="0" max="99" placeholder="0"> <span class="rest-unit">min</span>' +
            '<input type="number" id="customRestSec" class="rest-time-input" value="' + secs + '" min="0" max="59" placeholder="0"> <span class="rest-unit">sec</span>' +
            '<button class="rest-btn" onclick="setCustomRestTime()">Set</button>' +
            '<div class="rest-presets">' +
                '<button class="rest-preset" onclick="setQuickRestTime(60)">1m</button>' +
                '<button class="rest-preset" onclick="setQuickRestTime(90)">90s</button>' +
                '<button class="rest-preset" onclick="setQuickRestTime(120)">2m</button>' +
                '<button class="rest-preset" onclick="setQuickRestTime(180)">3m</button>' +
            '</div>' +
        '</div>'
    );
}

// Rebuild just the bar content without touching other UI
function refreshRestTimerBar() {
    var bar = document.getElementById('restTimerBar');
    if (bar) {
        bar.innerHTML = getRestTimerBarHTML();
        updateRestTimerDisplay();
    }
}

// Toggle ON/OFF and persist to localStorage
function toggleRestTimer() {
    restTimerEnabled = !restTimerEnabled;
    localStorage.setItem('restTimerEnabled', String(restTimerEnabled));
    if (!restTimerEnabled) {
        stopRestTimer();
        restTimerSeconds = 0;
    }
    refreshRestTimerBar();
}

// Read the custom min/sec inputs and update restTimerDefault
function setCustomRestTime() {
    var mins = parseInt(document.getElementById('customRestMin') ? document.getElementById('customRestMin').value : 0) || 0;
    var secs = parseInt(document.getElementById('customRestSec') ? document.getElementById('customRestSec').value : 0) || 0;
    var total = mins * 60 + secs;
    if (total > 0) restTimerDefault = total;
}

// Quick preset — also updates the min/sec inputs so they stay in sync
function setQuickRestTime(seconds) {
    restTimerDefault = seconds;
    var minEl = document.getElementById('customRestMin');
    var secEl = document.getElementById('customRestSec');
    if (minEl) minEl.value = Math.floor(seconds / 60);
    if (secEl) secEl.value = seconds % 60;
}

// ── Override completeSet to track rest time and check toggle ──
var completeSet = function(exIdx, setIdx) {
    var sets = currentWorkout.exercises[exIdx] && currentWorkout.exercises[exIdx].sets;
    if (!sets || !sets[setIdx]) return;

    sets[setIdx].completed = !sets[setIdx].completed;

    if (sets[setIdx].completed) {
        var now = Date.now();

        // Record how long since the last completed set (rest taken)
        if (lastSetCompletedTime !== null) {
            var restTaken = Math.round((now - lastSetCompletedTime) / 1000);
            sets[setIdx].restTaken = restTaken;  // persisted with the workout
        }
        lastSetCompletedTime = now;

        // Only start timer if it's enabled
        if (restTimerEnabled) {
            var bar = document.getElementById('restTimerBar');
            if (bar) bar.classList.remove('rest-timer-done');
            startRestTimer();
        }
    } else {
        // Un-completing: clear rest data and don't affect timer
        delete sets[setIdx].restTaken;
    }

    renderActiveWorkout();
};

// ── Override renderActiveWorkout to use the new timer bar ─────
var renderActiveWorkout = function() {
    var container = document.getElementById('currentExercisesList');
    var display   = document.getElementById('currentWorkoutDisplay');
    if (!container || !display) return;

    display.classList.remove('hidden');

    // Create the timer bar once; refresh its contents on setting changes
    var timerBar = document.getElementById('restTimerBar');
    if (!timerBar) {
        timerBar = document.createElement('div');
        timerBar.id        = 'restTimerBar';
        timerBar.className = 'rest-timer-bar';
        timerBar.innerHTML = getRestTimerBarHTML();
        var h3 = display.querySelector('h3');
        if (h3) h3.after(timerBar);
        else container.before(timerBar);
        updateRestTimerDisplay();
    }

    container.innerHTML = '';

    if (currentWorkout.exercises.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:24px 0;">No exercises yet — add one below.</p>';
        return;
    }

    currentWorkout.exercises.forEach(function(exercise, exIdx) {
        var card = document.createElement('div');
        card.className = 'active-exercise-card';

        var exType = getExerciseType(exercise.exercise);
        var mode   = exercise.sets.length > 0
            ? (exercise.sets[0].mode || 'weighted')
            : (exType === 'timed' ? 'timed' : exType === 'bodyweight' ? 'bodyweight' : 'weighted');

        // "Last time" row
        var lastEx   = getLastWorkoutForExercise(exercise.exercise);
        var lastHtml = '';
        if (lastEx && lastEx.sets && lastEx.sets.length > 0) {
            lastHtml = '<div class="last-time-row">Last: ' +
                lastEx.sets.map(formatSetShort).join(' · ') + '</div>';
        }

        // Set rows
        var setRows = exercise.sets.map(function(set, setIdx) {
            var sm       = set.mode || 'weighted';
            var done     = set.completed ? ' set-row-done' : '';
            var doneIcon = set.completed ? '✓' : '○';
            var doneCls  = set.completed ? ' complete-done' : '';

            // Show saved rest time for completed sets (after the first)
            var restInfo = (set.completed && set.restTaken)
                ? '<span class="set-rest-info" title="Rest taken before this set">⏱ ' + formatRestTime(set.restTaken) + '</span>'
                : '';

            var inputsHtml = '';
            if (sm === 'timed') {
                var d = set.duration || 0;
                var mm = Math.floor(d/60), ss = d%60;
                inputsHtml =
                    '<input type="number" class="fast-input" value="' + mm + '" min="0"' +
                    ' onchange="(function(){var ex=currentWorkout.exercises[' + exIdx + '];if(ex&&ex.sets[' + setIdx + '])ex.sets[' + setIdx + '].duration=(parseInt(this.value)||0)*60+((ex.sets[' + setIdx + '].duration||0)%60);}).call(this)"> m ' +
                    '<input type="number" class="fast-input" value="' + ss + '" min="0" max="59"' +
                    ' onchange="(function(){var ex=currentWorkout.exercises[' + exIdx + '];if(ex&&ex.sets[' + setIdx + '])ex.sets[' + setIdx + '].duration=Math.floor((ex.sets[' + setIdx + '].duration||0)/60)*60+(parseInt(this.value)||0);}).call(this)"> s';
            } else if (sm === 'bodyweight') {
                inputsHtml =
                    '<span class="bw-pill">BW</span>' +
                    '<input type="number" class="fast-input" value="' + (set.reps || '') + '" min="1" placeholder="reps"' +
                    ' onchange="updateSetReps(' + exIdx + ',' + setIdx + ',this.value)">' +
                    ' <span class="set-unit">reps</span>' +
                    '<div class="quick-adj">' +
                        '<button onclick="adjustReps(' + exIdx + ',' + setIdx + ',-1)">-1</button>' +
                        '<button onclick="adjustReps(' + exIdx + ',' + setIdx + ',1)">+1</button>' +
                    '</div>';
            } else {
                inputsHtml =
                    '<input type="number" class="fast-input fast-weight" value="' + (set.weight || '') + '" min="0" step="2.5" placeholder="lbs"' +
                    ' onchange="updateSetWeight(' + exIdx + ',' + setIdx + ',this.value)">' +
                    ' <span class="set-unit">×</span> ' +
                    '<input type="number" class="fast-input fast-reps" value="' + (set.reps || '') + '" min="1" placeholder="reps"' +
                    ' onchange="updateSetReps(' + exIdx + ',' + setIdx + ',this.value)">' +
                    '<div class="quick-adj">' +
                        '<button onclick="adjustWeight(' + exIdx + ',' + setIdx + ',-5)">-5</button>' +
                        '<button onclick="adjustWeight(' + exIdx + ',' + setIdx + ',5)">+5</button>' +
                        '<button onclick="adjustReps(' + exIdx + ',' + setIdx + ',-1)">-1r</button>' +
                        '<button onclick="adjustReps(' + exIdx + ',' + setIdx + ',1)">+1r</button>' +
                    '</div>';
            }

            return '<div class="active-set-row' + done + '">' +
                '<span class="set-num-label">Set ' + (setIdx+1) + '</span>' +
                '<div class="set-row-inputs">' + inputsHtml + '</div>' +
                restInfo +
                '<button class="complete-btn' + doneCls + '" onclick="completeSet(' + exIdx + ',' + setIdx + ')" title="Mark set complete">' + doneIcon + '</button>' +
                '<button class="remove-set-x" onclick="removeSetFromExercise(' + exIdx + ',' + setIdx + ')" title="Remove set">✕</button>' +
            '</div>';
        }).join('');

        card.innerHTML =
            '<div class="active-ex-header">' +
                '<div class="active-ex-name">' + exercise.exercise + '</div>' +
                '<span class="active-ex-muscle">' + (exercise.muscleGroup || '') + '</span>' +
                '<button class="remove-ex-x" onclick="removeExerciseCard(' + exIdx + ')" title="Remove exercise">✕</button>' +
            '</div>' +
            lastHtml +
            '<div class="active-sets-list">' + setRows + '</div>' +
            '<button class="add-set-btn-fast" onclick="addSetToExercise(' + exIdx + ')">+ Set</button>';

        container.appendChild(card);
    });
};

// Keep updateCurrentWorkoutDisplay pointing at the new renderer
var updateCurrentWorkoutDisplay = function() {
    renderActiveWorkout();
};

// ============================================================
// REST TIME PERSISTENCE
// Saves restTimerDefault per exercise and globally.
// Loaded automatically when an exercise appears in the workout.
// ============================================================

var REST_DEFAULT_KEY  = 'restTimerDefault';   // global fallback
var REST_EXERCISE_KEY = 'exerciseRestTimes';  // per-exercise map

// On script load, restore the last used global default
(function() {
    var saved = parseInt(localStorage.getItem(REST_DEFAULT_KEY));
    if (saved > 0) restTimerDefault = saved;
})();

// Persist the global default whenever it changes
function saveRestDefault() {
    localStorage.setItem(REST_DEFAULT_KEY, String(restTimerDefault));
}

// Save the preferred rest time for a specific exercise
function saveExerciseRestTime(exerciseName, seconds) {
    var prefs = {};
    try { prefs = JSON.parse(localStorage.getItem(REST_EXERCISE_KEY) || '{}'); } catch(e) {}
    prefs[exerciseName] = seconds;
    localStorage.setItem(REST_EXERCISE_KEY, JSON.stringify(prefs));
}

// Load the saved rest time for a specific exercise
// Returns the saved value, or the global default if none saved
function loadExerciseRestTime(exerciseName) {
    try {
        var prefs = JSON.parse(localStorage.getItem(REST_EXERCISE_KEY) || '{}');
        return prefs[exerciseName] || null;
    } catch(e) { return null; }
}

// Apply the saved rest time for an exercise to the active timer
// Called when a new exercise card becomes "active" (first set completed)
function applyExerciseRestPreference(exerciseName) {
    var saved = loadExerciseRestTime(exerciseName);
    if (saved && saved > 0 && saved !== restTimerDefault) {
        restTimerDefault = saved;
        saveRestDefault();
        // Update the timer bar inputs to reflect the loaded preference
        var minEl = document.getElementById('customRestMin');
        var secEl = document.getElementById('customRestSec');
        if (minEl) minEl.value = Math.floor(saved / 60);
        if (secEl) secEl.value = saved % 60;
        updateRestTimerDisplay();
    }
}

// Override setCustomRestTime to also persist
var setCustomRestTime = function() {
    var mins = parseInt(document.getElementById('customRestMin') ? document.getElementById('customRestMin').value : 0) || 0;
    var secs = parseInt(document.getElementById('customRestSec') ? document.getElementById('customRestSec').value : 0) || 0;
    var total = mins * 60 + secs;
    if (total > 0) {
        restTimerDefault = total;
        saveRestDefault();
        // Also save for every exercise currently in the workout
        if (currentWorkout && currentWorkout.exercises) {
            currentWorkout.exercises.forEach(function(ex) {
                saveExerciseRestTime(ex.exercise, total);
            });
        }
    }
};

// Override setQuickRestTime to also persist
var setQuickRestTime = function(seconds) {
    restTimerDefault = seconds;
    saveRestDefault();
    // Save for every exercise currently in the workout
    if (currentWorkout && currentWorkout.exercises) {
        currentWorkout.exercises.forEach(function(ex) {
            saveExerciseRestTime(ex.exercise, seconds);
        });
    }
    var minEl = document.getElementById('customRestMin');
    var secEl = document.getElementById('customRestSec');
    if (minEl) minEl.value = Math.floor(seconds / 60);
    if (secEl) secEl.value = seconds % 60;
};

// Override completeSet to also save the rest preference per exercise
var completeSet = function(exIdx, setIdx) {
    var exercise = currentWorkout.exercises[exIdx];
    var sets = exercise && exercise.sets;
    if (!sets || !sets[setIdx]) return;

    sets[setIdx].completed = !sets[setIdx].completed;

    if (sets[setIdx].completed) {
        var now = Date.now();

        // Record actual rest taken since the last completed set
        if (lastSetCompletedTime !== null) {
            var restTaken = Math.round((now - lastSetCompletedTime) / 1000);
            sets[setIdx].restTaken = restTaken;
        }
        lastSetCompletedTime = now;

        // Save restTimerDefault as this exercise's preferred rest time
        if (exercise && exercise.exercise) {
            saveExerciseRestTime(exercise.exercise, restTimerDefault);
            saveRestDefault();
        }

        // Start timer only if enabled
        if (restTimerEnabled) {
            var bar = document.getElementById('restTimerBar');
            if (bar) bar.classList.remove('rest-timer-done');
            startRestTimer();
        }

        // When switching to a different exercise, apply its saved preference
        // (look at the next exercise in the list)
        var nextIdx = exIdx + 1;
        if (nextIdx < currentWorkout.exercises.length) {
            applyExerciseRestPreference(currentWorkout.exercises[nextIdx].exercise);
        }

    } else {
        delete sets[setIdx].restTaken;
    }

    renderActiveWorkout();
};

// Show saved rest time in the "Last time" row of each exercise card
// Override getLastWorkoutForExercise display to include rest info
function getExerciseRestSummary(exerciseName) {
    var saved = loadExerciseRestTime(exerciseName);
    if (!saved) return '';
    return ' · ⏱ ' + formatRestTime(saved) + ' rest';
}

// Override renderActiveWorkout — shows saved rest time, applies exercise preference
var renderActiveWorkout = function() {
    var container = document.getElementById('currentExercisesList');
    var display   = document.getElementById('currentWorkoutDisplay');
    if (!container || !display) return;
    display.classList.remove('hidden');

    var timerBar = document.getElementById('restTimerBar');
    if (!timerBar) {
        timerBar = document.createElement('div');
        timerBar.id = 'restTimerBar';
        timerBar.className = 'rest-timer-bar';
        timerBar.innerHTML = getRestTimerBarHTML();
        var h3 = display.querySelector('h3');
        if (h3) h3.after(timerBar); else container.before(timerBar);
        updateRestTimerDisplay();
    }

    container.innerHTML = '';

    if (currentWorkout.exercises.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:24px 0;">No exercises yet.</p>';
        return;
    }

    // Apply rest pref for the first exercise that still has incomplete sets
    var firstInc = currentWorkout.exercises.find(function(ex) {
        return ex.sets.some(function(s){ return !s.completed; });
    });
    if (firstInc) applyExerciseRestPreference(firstInc.exercise);

    currentWorkout.exercises.forEach(function(exercise, exIdx) {
        var card = document.createElement('div');
        card.className = 'active-exercise-card';

        var exType = getExerciseType(exercise.exercise);
        var mode = exercise.sets.length > 0
            ? (exercise.sets[0].mode || 'weighted')
            : (exType === 'timed' ? 'timed' : exType === 'bodyweight' ? 'bodyweight' : 'weighted');

        var lastEx   = getLastWorkoutForExercise(exercise.exercise);
        var restHint = getExerciseRestSummary(exercise.exercise);
        var lastHtml = '';
        if (lastEx && lastEx.sets && lastEx.sets.length > 0) {
            lastHtml = '<div class="last-time-row">Last: ' +
                lastEx.sets.map(formatSetShort).join(' · ') + restHint + '</div>';
        } else if (restHint) {
            lastHtml = '<div class="last-time-row">' + restHint.replace(' · ','') + '</div>';
        }

        var setRows = exercise.sets.map(function(set, setIdx) {
            var sm       = set.mode || 'weighted';
            var done     = set.completed ? ' set-row-done' : '';
            var doneIcon = set.completed ? '✓' : '○';
            var doneCls  = set.completed ? ' complete-done' : '';
            var restInfo = (set.completed && set.restTaken)
                ? '<span class="set-rest-info">⏱ ' + formatRestTime(set.restTaken) + '</span>'
                : '';

            var inputsHtml = '';
            if (sm === 'timed') {
                var d = set.duration || 0;
                var mm = Math.floor(d/60), ss = d%60;
                inputsHtml =
                    '<input type="number" class="fast-input" value="' + mm + '" min="0"' +
                    ' onchange="(function(){var ex=currentWorkout.exercises[' + exIdx + '];if(ex&&ex.sets[' + setIdx + '])ex.sets[' + setIdx + '].duration=(parseInt(this.value)||0)*60+((ex.sets[' + setIdx + '].duration||0)%60);}).call(this)"> m ' +
                    '<input type="number" class="fast-input" value="' + ss + '" min="0" max="59"' +
                    ' onchange="(function(){var ex=currentWorkout.exercises[' + exIdx + '];if(ex&&ex.sets[' + setIdx + '])ex.sets[' + setIdx + '].duration=Math.floor((ex.sets[' + setIdx + '].duration||0)/60)*60+(parseInt(this.value)||0);}).call(this)"> s';
            } else if (sm === 'bodyweight') {
                inputsHtml =
                    '<span class="bw-pill">BW</span>' +
                    '<input type="number" class="fast-input" value="' + (set.reps||'') + '" min="1" placeholder="reps"' +
                    ' onchange="updateSetReps(' + exIdx + ',' + setIdx + ',this.value)">' +
                    '<span class="set-unit">reps</span>' +
                    '<div class="quick-adj">' +
                        '<button onclick="adjustReps(' + exIdx + ',' + setIdx + ',-1)">-1</button>' +
                        '<button onclick="adjustReps(' + exIdx + ',' + setIdx + ',1)">+1</button>' +
                    '</div>';
            } else {
                inputsHtml =
                    '<input type="number" class="fast-input fast-weight" value="' + (set.weight||'') + '" min="0" step="2.5" placeholder="lbs"' +
                    ' onchange="updateSetWeight(' + exIdx + ',' + setIdx + ',this.value)">' +
                    '<span class="set-unit">×</span>' +
                    '<input type="number" class="fast-input fast-reps" value="' + (set.reps||'') + '" min="1" placeholder="reps"' +
                    ' onchange="updateSetReps(' + exIdx + ',' + setIdx + ',this.value)">' +
                    '<div class="quick-adj">' +
                        '<button onclick="adjustWeight(' + exIdx + ',' + setIdx + ',-5)">-5</button>' +
                        '<button onclick="adjustWeight(' + exIdx + ',' + setIdx + ',5)">+5</button>' +
                        '<button onclick="adjustReps(' + exIdx + ',' + setIdx + ',-1)">-1r</button>' +
                        '<button onclick="adjustReps(' + exIdx + ',' + setIdx + ',1)">+1r</button>' +
                    '</div>';
            }

            return '<div class="active-set-row' + done + '">' +
                '<span class="set-num-label">Set ' + (setIdx+1) + '</span>' +
                '<div class="set-row-inputs">' + inputsHtml + '</div>' +
                restInfo +
                '<button class="complete-btn' + doneCls + '" onclick="completeSet(' + exIdx + ',' + setIdx + ')">' + doneIcon + '</button>' +
                '<button class="remove-set-x" onclick="removeSetFromExercise(' + exIdx + ',' + setIdx + ')">&#x2715;</button>' +
            '</div>';
        }).join('');

        card.innerHTML =
            '<div class="active-ex-header">' +
                '<div class="active-ex-name">' + exercise.exercise + '</div>' +
                '<span class="active-ex-muscle">' + (exercise.muscleGroup||'') + '</span>' +
                '<button class="remove-ex-x" onclick="removeExerciseCard(' + exIdx + ')">&#x2715;</button>' +
            '</div>' +
            lastHtml +
            '<div class="active-sets-list">' + setRows + '</div>' +
            '<button class="add-set-btn-fast" onclick="addSetToExercise(' + exIdx + ')">+ Set</button>';

        container.appendChild(card);
    });
};

var updateCurrentWorkoutDisplay = function() { renderActiveWorkout(); };

// ============================================================
// WORKOUT TIMING & REST TIMER v2
// - Count-UP rest timer (not preset picker)
// - Start Now vs Log Past Workout flow
// - Live duration counter while workout is active
// - Manual rest entry for past workouts
// - All data saved to localStorage, backward compatible
// ============================================================

// ── State ────────────────────────────────────────────────────
var workoutIsLive             = true;   // true = Start Now, false = Log Past
var workoutLiveStartTimestamp = null;   // Date.now() when "Start Now" pressed
var workoutDurationInterval   = null;   // interval ID for live duration display
var restIsRunning             = false;  // is a count-up rest timer active?
var restCountSeconds          = 0;      // current count-up value
var restCountInterval         = null;   // interval ID for count-up
var restForExIdx              = -1;     // exercise index the timer belongs to
var restForSetIdx             = -1;     // set index (-1 = pre-first-set rest)

// ── Workout type selector ─────────────────────────────────────
function selectWorkoutType(type) {
    workoutIsLive = (type === 'live');

    var btnNow   = document.getElementById('btnStartNow');
    var btnPast  = document.getElementById('btnLogPast');
    var pastArea = document.getElementById('pastWorkoutTimeInputs');
    var dateEl   = document.getElementById('workoutDate');

    if (btnNow)  btnNow.classList.toggle('active',  workoutIsLive);
    if (btnPast) btnPast.classList.toggle('active', !workoutIsLive);
    if (pastArea) pastArea.classList.toggle('hidden', workoutIsLive);

    if (!workoutIsLive) {
        // Default start time to "now" if blank
        var now   = new Date();
        var hhmm  = pad2(now.getHours()) + ':' + pad2(now.getMinutes());
        var sEl   = document.getElementById('workoutStartTimeInput');
        if (sEl && !sEl.value) sEl.value = hhmm;

        // Wire duration preview on both time inputs
        ['workoutStartTimeInput', 'workoutEndTimeInput'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el && !el._timingWired) {
                el.addEventListener('change', updatePastDurationPreview);
                el._timingWired = true;
            }
        });
        if (dateEl) dateEl.addEventListener('change', updatePastDurationPreview);
    }
}

function pad2(n) { return n < 10 ? '0' + n : String(n); }

function updatePastDurationPreview() {
    var preview = document.getElementById('pastWorkoutDurationPreview');
    if (!preview) return;
    var date = document.getElementById('workoutDate') ? document.getElementById('workoutDate').value : '';
    var sVal = document.getElementById('workoutStartTimeInput') ? document.getElementById('workoutStartTimeInput').value : '';
    var eVal = document.getElementById('workoutEndTimeInput')   ? document.getElementById('workoutEndTimeInput').value   : '';
    if (!date || !sVal || !eVal) { preview.textContent = ''; return; }

    var startDt = new Date(date + 'T' + sVal);
    var endDt   = new Date(date + 'T' + eVal);
    var diff    = Math.round((endDt - startDt) / 1000);

    if (diff <= 0) {
        preview.textContent = '⚠ End time must be after start time';
        preview.className   = 'duration-preview duration-error';
    } else if (endDt > new Date()) {
        preview.textContent = '⚠ End time cannot be in the future';
        preview.className   = 'duration-preview duration-error';
    } else {
        var h = Math.floor(diff / 3600), m = Math.floor((diff % 3600) / 60);
        preview.textContent = '✓ Duration: ' + (h > 0 ? h + ' hr ' : '') + m + ' min';
        preview.className   = 'duration-preview duration-ok';
    }
}

// ── Live workout duration display ─────────────────────────────
function startWorkoutDurationTimer() {
    clearInterval(workoutDurationInterval);
    workoutDurationInterval = setInterval(function() {
        var el = document.getElementById('liveDurationDisplay');
        if (!el || !workoutLiveStartTimestamp) return;
        var secs = Math.floor((Date.now() - workoutLiveStartTimestamp) / 1000);
        var h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
        el.textContent = (h > 0 ? h + ':' + pad2(m) : m) + ':' + pad2(s);
    }, 1000);
}

function stopWorkoutDurationTimer() {
    clearInterval(workoutDurationInterval);
    workoutDurationInterval = null;
}

// ── Count-UP rest timer ───────────────────────────────────────
function startRestCountUp(exIdx, setIdx) {
    // Stop & save any existing rest timer first
    if (restIsRunning) stopRestSave();

    restIsRunning    = true;
    restCountSeconds = 0;
    restForExIdx     = exIdx;
    restForSetIdx    = setIdx;

    clearInterval(restCountInterval);
    restCountInterval = setInterval(function() {
        restCountSeconds++;
        // Update inline element in the exercise card
        var inlineId = 'restInline_' + exIdx + '_' + setIdx;
        var inlineEl = document.getElementById(inlineId);
        if (inlineEl) inlineEl.textContent = formatRestTime(restCountSeconds);
    }, 1000);

    renderActiveWorkout();
}

// Stop and SAVE the rest duration
function stopRestSave() {
    clearInterval(restCountInterval);
    restCountInterval = null;

    if (restIsRunning && restCountSeconds > 0) {
        var ex = currentWorkout.exercises[restForExIdx];
        if (ex) {
            if (restForSetIdx === -1) {
                ex.preSetRest = restCountSeconds;
            } else if (ex.sets[restForSetIdx]) {
                ex.sets[restForSetIdx].restTaken = restCountSeconds;
                if (typeof saveExerciseRestTime === 'function') saveExerciseRestTime(ex.exercise, restCountSeconds);
            }
        }
    }

    restIsRunning    = false;
    restCountSeconds = 0;
    restForExIdx     = -1;
    restForSetIdx    = -1;

    renderActiveWorkout();
}

// Stop WITHOUT saving (e.g., on cancel)
function stopRestDiscard() {
    clearInterval(restCountInterval);
    restCountInterval = null;
    restIsRunning    = false;
    restCountSeconds = 0;
    restForExIdx     = -1;
    restForSetIdx    = -1;
    renderActiveWorkout();
}

// ── Override startNewWorkout ──────────────────────────────────
var startNewWorkout = function() {
    var name = workoutNameInput ? workoutNameInput.value.trim() : '';
    var date = workoutDateInput ? workoutDateInput.value : '';
    if (!name) { alert('Please enter a workout name'); return; }
    if (!date) { alert('Please select a date');        return; }

    if (!workoutIsLive) {
        var sVal = document.getElementById('workoutStartTimeInput') ? document.getElementById('workoutStartTimeInput').value : '';
        var eVal = document.getElementById('workoutEndTimeInput')   ? document.getElementById('workoutEndTimeInput').value   : '';
        if (!sVal) { alert('Please enter a start time'); return; }
        if (!eVal) { alert('Please enter an end time');  return; }
        var startDt = new Date(date + 'T' + sVal);
        var endDt   = new Date(date + 'T' + eVal);
        if (endDt <= startDt)  { alert('End time must be after start time'); return; }
        if (endDt > new Date()) { alert('End time cannot be in the future');  return; }
    }

    currentWorkout = { id: crypto.randomUUID(), name: name, date: date, exercises: [] };

    if (workoutIsLive) {
        workoutLiveStartTimestamp       = Date.now();
        currentWorkout.workoutStartTime = new Date(workoutLiveStartTimestamp).toISOString();
        startWorkoutDurationTimer();
    } else {
        var sIso = new Date(date + 'T' + document.getElementById('workoutStartTimeInput').value).toISOString();
        var eIso = new Date(date + 'T' + document.getElementById('workoutEndTimeInput').value).toISOString();
        currentWorkout.workoutStartTime = sIso;
        currentWorkout.workoutEndTime   = eIso;
        currentWorkout.workoutDuration  = Math.round((new Date(eIso) - new Date(sIso)) / 1000);
    }

    document.getElementById('workoutSetupForm').classList.add('hidden');

    // Respect pendingTemplate (set when loading from a template/history card)
    if (pendingTemplate) {
        templateQueue   = pendingTemplate;
        pendingTemplate = null;
        showAddExerciseForm();
        prefillNextTemplateExercise();
    } else {
        showAddExerciseForm();
    }
};

// ── Override saveCurrentWorkout ───────────────────────────────
var saveCurrentWorkout = function() {
    if (currentWorkout.exercises.length === 0) {
        alert('Add at least one exercise before saving');
        return;
    }

    // Save end time & duration for live workouts
    if (workoutIsLive && workoutLiveStartTimestamp) {
        var endTs = Date.now();
        currentWorkout.workoutEndTime  = new Date(endTs).toISOString();
        currentWorkout.workoutDuration = Math.round((endTs - workoutLiveStartTimestamp) / 1000);
    }

    // Stop any running timers
    stopWorkoutDurationTimer();
    if (restIsRunning) stopRestSave();

    // Check for new PRs before saving
    var prsList = (typeof checkForNewPRs === 'function') ? checkForNewPRs(currentWorkout) : [];

    // Strip only UI-only 'completed' flag — keep restTaken, preSetRest, timing data
    var toSave = Object.assign({}, currentWorkout, {
        exercises: currentWorkout.exercises.map(function(ex) {
            return Object.assign({}, ex, {
                sets: ex.sets.map(function(s) {
                    var c = Object.assign({}, s);
                    delete c.completed;
                    return c;
                })
            });
        })
    });

    workouts.push(toSave);
    saveToLocalStorage();

    // Reset state
    workoutLiveStartTimestamp = null;
    workoutIsLive             = true;
    currentWorkout            = { id: null, name: '', date: '', exercises: [] };
    templateQueue             = [];
    pendingTemplate           = null;

    document.getElementById('workoutSetupForm').classList.remove('hidden');
    if (addExerciseForm)       addExerciseForm.classList.add('hidden');
    if (currentWorkoutDisplay) currentWorkoutDisplay.classList.add('hidden');
    if (currentExercisesList)  currentExercisesList.innerHTML = '';
    if (workoutNameInput)      workoutNameInput.value = '';
    setDefaultDate();
    selectWorkoutType('live');

    // Remove timer bar so it rebuilds fresh next workout
    var bar = document.getElementById('restTimerBar');
    if (bar) bar.remove();

    if (typeof createWorkoutSection !== 'undefined' && createWorkoutSection)
        createWorkoutSection.classList.add('hidden');

    renderStats();
    if (prsList && prsList.length > 0) setTimeout(function() { showPRCelebration(prsList); }, 400);
};

// ── Override completeSet ──────────────────────────────────────
var completeSet = function(exIdx, setIdx) {
    var exercise = currentWorkout.exercises[exIdx];
    var sets = exercise && exercise.sets;
    if (!sets || !sets[setIdx]) return;

    // If a rest timer is running for a different set, stop and save it
    if (restIsRunning && (restForExIdx !== exIdx || restForSetIdx !== setIdx)) {
        stopRestSave();
    }

    sets[setIdx].completed = !sets[setIdx].completed;

    if (sets[setIdx].completed) {
        lastSetCompletedTime = Date.now();

        // Auto-start count-up rest timer for LIVE workouts only
        if (workoutIsLive && !restIsRunning) {
            startRestCountUp(exIdx, setIdx);
            return; // renderActiveWorkout called inside startRestCountUp
        }
    } else {
        // Un-complete: stop rest timer if it belongs to this set
        if (restIsRunning && restForExIdx === exIdx && restForSetIdx === setIdx) {
            stopRestDiscard();
            return;
        }
        delete sets[setIdx].restTaken;
    }

    renderActiveWorkout();
};

// ── Main render: active workout cards ─────────────────────────
var renderActiveWorkout = function() {
    var container = document.getElementById('currentExercisesList');
    var display   = document.getElementById('currentWorkoutDisplay');
    if (!container || !display) return;
    display.classList.remove('hidden');

    // Live duration bar (replaces old rest timer bar for header display)
    var durBar = document.getElementById('liveDurationBar');
    if (!durBar && workoutIsLive) {
        durBar = document.createElement('div');
        durBar.id        = 'liveDurationBar';
        durBar.className = 'live-duration-bar';
        durBar.innerHTML =
            '<span class="live-dur-label">⏱ Workout</span>' +
            '<span id="liveDurationDisplay" class="live-dur-time">0:00</span>';
        var h3 = display.querySelector('h3');
        if (h3) h3.after(durBar); else container.before(durBar);
    }
    if (!durBar && !workoutIsLive) {
        // Past workout: show calculated duration
        var calculated = currentWorkout.workoutDuration;
        if (calculated) {
            durBar = document.createElement('div');
            durBar.id        = 'liveDurationBar';
            durBar.className = 'live-duration-bar live-duration-past';
            var h = Math.floor(calculated/3600), m = Math.floor((calculated%3600)/60);
            durBar.innerHTML =
                '<span class="live-dur-label">📋 Past Workout</span>' +
                '<span class="live-dur-time">' + (h > 0 ? h + ' hr ' : '') + m + ' min</span>';
            var h3b = display.querySelector('h3');
            if (h3b) h3b.after(durBar); else container.before(durBar);
        }
    }

    // Remove old rest-timer-bar (it's replaced by per-set inline timers)
    var oldBar = document.getElementById('restTimerBar');
    if (oldBar) oldBar.remove();

    container.innerHTML = '';

    if (currentWorkout.exercises.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:24px 0;">No exercises yet — add one below.</p>';
        return;
    }

    // Apply saved rest preference for the first incomplete exercise
    if (typeof applyExerciseRestPreference === 'function') {
        var firstInc = currentWorkout.exercises.find(function(ex) {
            return ex.sets.some(function(s){ return !s.completed; });
        });
        if (firstInc) applyExerciseRestPreference(firstInc.exercise);
    }

    currentWorkout.exercises.forEach(function(exercise, exIdx) {
        var card = document.createElement('div');
        card.className = 'active-exercise-card';

        // Last time row
        var lastEx    = (typeof getLastWorkoutForExercise === 'function') ? getLastWorkoutForExercise(exercise.exercise) : null;
        var restHint  = (typeof getExerciseRestSummary === 'function')    ? getExerciseRestSummary(exercise.exercise)    : '';
        var lastHtml  = '';
        if (lastEx && lastEx.sets && lastEx.sets.length > 0) {
            lastHtml = '<div class="last-time-row">Last: ' +
                lastEx.sets.map(function(s){ return (typeof formatSetShort === 'function') ? formatSetShort(s) : ''; }).join(' · ') +
                restHint + '</div>';
        }

        // Pre-first-set "Start Rest" area
        var preRestHtml = '';
        var isPreRest   = restIsRunning && restForExIdx === exIdx && restForSetIdx === -1;
        if (!workoutIsLive) {
            // Past workout: manual pre-set rest input
            var preRestVal = exercise.preSetRest || 0;
            preRestHtml = '<div class="pre-set-rest past-rest-row">' +
                '<span class="rest-label-small">Pre-set rest:</span>' +
                '<input type="number" class="rest-manual-input" value="' + Math.floor(preRestVal/60) + '" min="0" placeholder="0"' +
                ' onchange="(function(el){var ex=currentWorkout.exercises[' + exIdx + '];if(ex)ex.preSetRest=(parseInt(el.value)||0)*60+((ex.preSetRest||0)%60);}).call(this,this)"> min ' +
                '<input type="number" class="rest-manual-input" value="' + (preRestVal%60) + '" min="0" max="59" placeholder="0"' +
                ' onchange="(function(el){var ex=currentWorkout.exercises[' + exIdx + '];if(ex)ex.preSetRest=Math.floor((ex.preSetRest||0)/60)*60+(parseInt(el.value)||0);}).call(this,this)"> sec' +
                '</div>';
        } else if (isPreRest) {
            preRestHtml = '<div class="pre-set-rest">' +
                '<span class="rest-running-label">⏱ Rest <span id="restInline_' + exIdx + '_-1" class="rest-count">' + formatRestTime(restCountSeconds) + '</span></span>' +
                '<button class="stop-rest-btn" onclick="stopRestSave()">■ Stop Rest</button>' +
                '</div>';
        } else {
            preRestHtml = '<div class="pre-set-rest">' +
                '<button class="start-rest-btn" onclick="startRestCountUp(' + exIdx + ',-1)">⏱ Start Rest</button>' +
                '</div>';
        }

        // Build set rows
        var setRows = exercise.sets.map(function(set, setIdx) {
            var sm       = set.mode || 'weighted';
            var done     = set.completed ? ' set-row-done' : '';
            var doneIcon = set.completed ? '✓' : '○';
            var doneCls  = set.completed ? ' complete-done' : '';

            var inputsHtml = '';
            if (sm === 'timed') {
                var d = set.duration || 0;
                inputsHtml =
                    '<input type="number" class="fast-input" value="' + Math.floor(d/60) + '" min="0"' +
                    ' onchange="(function(){var ex=currentWorkout.exercises[' + exIdx + '];if(ex&&ex.sets[' + setIdx + '])ex.sets[' + setIdx + '].duration=(parseInt(this.value)||0)*60+((ex.sets[' + setIdx + '].duration||0)%60);}).call(this)"> m ' +
                    '<input type="number" class="fast-input" value="' + (d%60) + '" min="0" max="59"' +
                    ' onchange="(function(){var ex=currentWorkout.exercises[' + exIdx + '];if(ex&&ex.sets[' + setIdx + '])ex.sets[' + setIdx + '].duration=Math.floor((ex.sets[' + setIdx + '].duration||0)/60)*60+(parseInt(this.value)||0);}).call(this)"> s';
            } else if (sm === 'bodyweight') {
                inputsHtml =
                    '<span class="bw-pill">BW</span>' +
                    '<input type="number" class="fast-input" value="' + (set.reps||'') + '" min="1" placeholder="reps"' +
                    ' onchange="updateSetReps(' + exIdx + ',' + setIdx + ',this.value)">' +
                    '<span class="set-unit">reps</span>' +
                    '<div class="quick-adj"><button onclick="adjustReps(' + exIdx + ',' + setIdx + ',-1)">-1</button><button onclick="adjustReps(' + exIdx + ',' + setIdx + ',1)">+1</button></div>';
            } else {
                inputsHtml =
                    '<input type="number" class="fast-input fast-weight" value="' + (set.weight||'') + '" min="0" step="2.5" placeholder="lbs"' +
                    ' onchange="updateSetWeight(' + exIdx + ',' + setIdx + ',this.value)">' +
                    '<span class="set-unit">×</span>' +
                    '<input type="number" class="fast-input fast-reps" value="' + (set.reps||'') + '" min="1" placeholder="reps"' +
                    ' onchange="updateSetReps(' + exIdx + ',' + setIdx + ',this.value)">' +
                    '<div class="quick-adj">' +
                        '<button onclick="adjustWeight(' + exIdx + ',' + setIdx + ',-5)">-5</button>' +
                        '<button onclick="adjustWeight(' + exIdx + ',' + setIdx + ',5)">+5</button>' +
                        '<button onclick="adjustReps(' + exIdx + ',' + setIdx + ',-1)">-1r</button>' +
                        '<button onclick="adjustReps(' + exIdx + ',' + setIdx + ',1)">+1r</button>' +
                    '</div>';
            }

            // Rest display after this set
            var restHtml = '';
            var isThisRest = restIsRunning && restForExIdx === exIdx && restForSetIdx === setIdx;

            if (!workoutIsLive && set.completed) {
                // Past workout: manual rest input
                var rt = set.restTaken || 0;
                restHtml =
                    '<div class="rest-row past-rest-row">' +
                        '<span class="rest-label-small">Rest after:</span>' +
                        '<input type="number" class="rest-manual-input" value="' + Math.floor(rt/60) + '" min="0" placeholder="0"' +
                        ' onchange="(function(el){var ex=currentWorkout.exercises[' + exIdx + '];if(ex&&ex.sets[' + setIdx + '])ex.sets[' + setIdx + '].restTaken=(parseInt(el.value)||0)*60+((ex.sets[' + setIdx + '].restTaken||0)%60);}).call(this,this)"> min ' +
                        '<input type="number" class="rest-manual-input" value="' + (rt%60) + '" min="0" max="59" placeholder="0"' +
                        ' onchange="(function(el){var ex=currentWorkout.exercises[' + exIdx + '];if(ex&&ex.sets[' + setIdx + '])ex.sets[' + setIdx + '].restTaken=Math.floor((ex.sets[' + setIdx + '].restTaken||0)/60)*60+(parseInt(el.value)||0);}).call(this,this)"> sec' +
                    '</div>';
            } else if (isThisRest) {
                // Live rest timer running for this set
                restHtml =
                    '<div class="rest-row rest-running-row">' +
                        '<span class="rest-running-label">⏱ <span id="restInline_' + exIdx + '_' + setIdx + '" class="rest-count">' + formatRestTime(restCountSeconds) + '</span></span>' +
                        '<button class="stop-rest-btn" onclick="stopRestSave()">■ Stop Rest</button>' +
                    '</div>';
            } else if (set.completed && set.restTaken) {
                // Saved rest time
                restHtml = '<div class="rest-row rest-saved-row"><span class="rest-saved-label">Rest: ' + formatRestTime(set.restTaken) + '</span></div>';
            }

            return '<div class="active-set-row' + done + '">' +
                '<span class="set-num-label">Set ' + (setIdx+1) + '</span>' +
                '<div class="set-row-inputs">' + inputsHtml + '</div>' +
                '<button class="complete-btn' + doneCls + '" onclick="completeSet(' + exIdx + ',' + setIdx + ')">' + doneIcon + '</button>' +
                '<button class="remove-set-x" onclick="removeSetFromExercise(' + exIdx + ',' + setIdx + ')">&#x2715;</button>' +
                '</div>' +
                restHtml;
        }).join('');

        card.innerHTML =
            '<div class="active-ex-header">' +
                '<div class="active-ex-name">' + exercise.exercise + '</div>' +
                '<span class="active-ex-muscle">' + (exercise.muscleGroup||'') + '</span>' +
                '<button class="remove-ex-x" onclick="removeExerciseCard(' + exIdx + ')">&#x2715;</button>' +
            '</div>' +
            lastHtml +
            preRestHtml +
            '<div class="active-sets-list">' + setRows + '</div>' +
            '<button class="add-set-btn-fast" onclick="addSetToExercise(' + exIdx + ')">+ Set</button>';

        container.appendChild(card);
    });
};

var updateCurrentWorkoutDisplay = function() { renderActiveWorkout(); };

// ============================================================
// INLINE EXERCISE SEARCH — appended to script.js
// Wraps the existing renderActiveWorkout rather than rewriting it.
// Adds a search bar at the bottom of the exercise card list.
// ============================================================

// Add an exercise inline without going through the Add Exercise form
function addExerciseInline(exerciseName) {
    if (!exerciseName) return;

    var exType = getExerciseType(exerciseName);
    var mode   = exType === 'timed'       ? 'timed'
               : exType === 'bodyweight'  ? 'bodyweight'
               : 'weighted';

    // Pre-fill from last time this exercise was logged
    var defSet;
    var lastEx = (typeof getLastWorkoutForExercise === 'function')
        ? getLastWorkoutForExercise(exerciseName) : null;

    if (lastEx && lastEx.sets && lastEx.sets.length > 0) {
        defSet = Object.assign({}, lastEx.sets[lastEx.sets.length - 1], { completed: false });
    } else {
        if (mode === 'timed')      defSet = { duration: 60, mode: 'timed',      completed: false };
        else if (mode === 'bodyweight') defSet = { reps: 10, mode: 'bodyweight', completed: false };
        else                       defSet = { weight: 0,   reps: 10, mode: 'weighted', completed: false };
    }

    currentWorkout.exercises.push({
        exercise:    exerciseName,
        muscleGroup: EXERCISE_TO_MUSCLE[exerciseName] || '',
        sets:        [defSet]
    });

    renderActiveWorkout();

    // Clear search, keep focus so user can type the next exercise
    setTimeout(function() {
        var s = document.getElementById('inlineExerciseSearch');
        if (s) { s.value = ''; s.focus(); }
        var cards = document.querySelectorAll('.active-exercise-card');
        if (cards.length > 0) {
            cards[cards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 60);
}

// Wire up the inline search dropdown (called after each render)
function setupInlineExerciseSearch() {
    var search   = document.getElementById('inlineExerciseSearch');
    var dropdown = document.getElementById('inlineExerciseDropdown');
    if (!search || !dropdown || search._wired) return;
    search._wired = true;

    // Populate exercise groups
    dropdown.innerHTML = '';
    Object.entries(EXERCISES_BY_MUSCLE).forEach(function(pair) {
        var muscle = pair[0], list = pair[1];
        var grp = document.createElement('div');
        grp.className = 'exercise-dropdown-group';
        grp.textContent = muscle;
        dropdown.appendChild(grp);
        list.forEach(function(exName) {
            var item = document.createElement('div');
            item.className = 'exercise-dropdown-item';
            item.textContent = exName;
            item.addEventListener('mousedown', function(e) {
                e.preventDefault();
                addExerciseInline(exName);
            });
            dropdown.appendChild(item);
        });
    });

    // Filter on input
    search.addEventListener('input', function() {
        var q = this.value.toLowerCase().trim();
        dropdown.classList.remove('hidden');
        dropdown.querySelectorAll('.exercise-dropdown-item').forEach(function(item) {
            item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
        dropdown.querySelectorAll('.exercise-dropdown-group').forEach(function(grp) {
            var el = grp.nextElementSibling, vis = false;
            while (el && !el.classList.contains('exercise-dropdown-group')) {
                if (el.style.display !== 'none') vis = true;
                el = el.nextElementSibling;
            }
            grp.style.display = vis ? '' : 'none';
        });
    });

    search.addEventListener('focus', function() { dropdown.classList.remove('hidden'); });
    search.addEventListener('blur',  function() {
        setTimeout(function() { dropdown.classList.add('hidden'); }, 200);
    });
}

// Wrap the existing renderActiveWorkout to append the inline search bar.
// Using the wrap pattern so we don't rewrite the existing function.
(function() {
    var prev = renderActiveWorkout;
    renderActiveWorkout = function() {
        prev();

        var container = document.getElementById('currentExercisesList');
        if (!container) return;

        // Only add the search section once per render
        if (!document.getElementById('inlineExerciseSearch')) {
            var section = document.createElement('div');
            section.className = 'inline-add-exercise';
            section.innerHTML =
                '<div class="exercise-search-wrapper">' +
                    '<input type="text" id="inlineExerciseSearch"' +
                    ' class="exercise-search-input inline-ex-search"' +
                    ' placeholder="+ Add exercise..." autocomplete="off">' +
                    '<div id="inlineExerciseDropdown" class="exercise-dropdown hidden"></div>' +
                '</div>';
            container.appendChild(section);
        }

        requestAnimationFrame(function() { setupInlineExerciseSearch(); });
    };

    updateCurrentWorkoutDisplay = function() { renderActiveWorkout(); };
})();

// Final override of startNewWorkout:
// "Create New" goes directly to the card view (skips the add-exercise form).
var startNewWorkout = function() {
    var name = workoutNameInput ? workoutNameInput.value.trim() : '';
    var date = workoutDateInput ? workoutDateInput.value : '';
    if (!name) { alert('Please enter a workout name'); return; }
    if (!date) { alert('Please select a date');        return; }

    // Past workout validation
    if (typeof workoutIsLive !== 'undefined' && !workoutIsLive) {
        var sEl = document.getElementById('workoutStartTimeInput');
        var eEl = document.getElementById('workoutEndTimeInput');
        var sv  = sEl ? sEl.value : '';
        var ev  = eEl ? eEl.value : '';
        if (!sv) { alert('Please enter a start time'); return; }
        if (!ev) { alert('Please enter an end time');  return; }
        var sd = new Date(date + 'T' + sv), ed = new Date(date + 'T' + ev);
        if (ed <= sd)        { alert('End time must be after start time'); return; }
        if (ed > new Date()) { alert('End time cannot be in the future');  return; }
    }

    currentWorkout = { id: crypto.randomUUID(), name: name, date: date, exercises: [] };

    // Timing setup
    if (typeof workoutIsLive === 'undefined' || workoutIsLive) {
        if (typeof workoutLiveStartTimestamp !== 'undefined') {
            workoutLiveStartTimestamp = Date.now();
            currentWorkout.workoutStartTime = new Date(workoutLiveStartTimestamp).toISOString();
        }
        if (typeof startWorkoutDurationTimer === 'function') startWorkoutDurationTimer();
    } else {
        var sEl2 = document.getElementById('workoutStartTimeInput');
        var eEl2 = document.getElementById('workoutEndTimeInput');
        if (sEl2 && eEl2) {
            var si = new Date(date + 'T' + sEl2.value).toISOString();
            var ei = new Date(date + 'T' + eEl2.value).toISOString();
            currentWorkout.workoutStartTime = si;
            currentWorkout.workoutEndTime   = ei;
            currentWorkout.workoutDuration  = Math.round((new Date(ei) - new Date(si)) / 1000);
        }
    }

    document.getElementById('workoutSetupForm').classList.add('hidden');

    if (typeof pendingTemplate !== 'undefined' && pendingTemplate) {
        // Template queued — use existing pre-fill flow
        templateQueue   = pendingTemplate;
        pendingTemplate = null;
        showAddExerciseForm();
        prefillNextTemplateExercise();
    } else {
        // Create New — skip the add-exercise form, show card view directly
        if (addExerciseForm)       addExerciseForm.classList.add('hidden');
        if (currentWorkoutDisplay) currentWorkoutDisplay.classList.remove('hidden');
        renderActiveWorkout();
        if (createWorkoutSection) createWorkoutSection.scrollIntoView({ behavior: 'smooth' });
    }
};

// Override addExerciseInline: Create New workout starts with blank values.
// Templates still pre-fill (they use their own loadFromTemplateObj path).
var addExerciseInline = function(exerciseName) {
    if (!exerciseName) return;

    var exType = getExerciseType(exerciseName);
    var mode   = exType === 'timed'      ? 'timed'
               : exType === 'bodyweight' ? 'bodyweight'
               : 'weighted';

    // Always blank — user fills in their own values for a fresh workout
    var defSet;
    if (mode === 'timed')           defSet = { duration: undefined, mode: 'timed',      completed: false };
    else if (mode === 'bodyweight') defSet = { reps:     undefined, mode: 'bodyweight', completed: false };
    else                            defSet = { weight:   undefined, reps: undefined, mode: 'weighted', completed: false };

    currentWorkout.exercises.push({
        exercise:    exerciseName,
        muscleGroup: EXERCISE_TO_MUSCLE[exerciseName] || '',
        sets:        [defSet]
    });

    renderActiveWorkout();

    setTimeout(function() {
        var s = document.getElementById('inlineExerciseSearch');
        if (s) { s.value = ''; s.focus(); }
        var cards = document.querySelectorAll('.active-exercise-card');
        if (cards.length > 0) cards[cards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);
};

// Move inline exercise search to the TOP of the exercise list
// and re-wire it every render (element is recreated each time).
(function() {
    var prevRAW = renderActiveWorkout;

    renderActiveWorkout = function() {
        prevRAW();

        var container = document.getElementById('currentExercisesList');
        if (!container) return;

        // Build the search section fresh each render
        var section = document.createElement('div');
        section.className = 'inline-add-exercise inline-add-top';
        section.innerHTML =
            '<div class="exercise-search-wrapper">' +
                '<input type="text" id="inlineExerciseSearch"' +
                    ' class="exercise-search-input inline-ex-search"' +
                    ' placeholder="+ Search and add exercise..."' +
                    ' autocomplete="off">' +
                '<div id="inlineExerciseDropdown" class="exercise-dropdown hidden"></div>' +
            '</div>';

        // Insert at the TOP so it is always visible
        container.insertBefore(section, container.firstChild);

        // Wire events — always fresh because element is new each render
        wireInlineSearch();
    };

    updateCurrentWorkoutDisplay = function() { renderActiveWorkout(); };
})();

function wireInlineSearch() {
    var search   = document.getElementById('inlineExerciseSearch');
    var dropdown = document.getElementById('inlineExerciseDropdown');
    if (!search || !dropdown) return;

    // Populate groups
    dropdown.innerHTML = '';
    Object.entries(EXERCISES_BY_MUSCLE).forEach(function(pair) {
        var muscle = pair[0], list = pair[1];
        var grp = document.createElement('div');
        grp.className = 'exercise-dropdown-group';
        grp.textContent = muscle;
        dropdown.appendChild(grp);
        list.forEach(function(exName) {
            var item = document.createElement('div');
            item.className = 'exercise-dropdown-item';
            item.textContent = exName;
            item.addEventListener('mousedown', function(e) {
                e.preventDefault();
                addExerciseInline(exName);
            });
            dropdown.appendChild(item);
        });
    });

    // Filter while typing
    search.addEventListener('input', function() {
        var q = this.value.toLowerCase().trim();
        dropdown.classList.remove('hidden');
        dropdown.querySelectorAll('.exercise-dropdown-item').forEach(function(item) {
            item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
        dropdown.querySelectorAll('.exercise-dropdown-group').forEach(function(grp) {
            var el = grp.nextElementSibling, vis = false;
            while (el && !el.classList.contains('exercise-dropdown-group')) {
                if (el.style.display !== 'none') vis = true;
                el = el.nextElementSibling;
            }
            grp.style.display = vis ? '' : 'none';
        });
    });

    search.addEventListener('focus', function() { dropdown.classList.remove('hidden'); });
    search.addEventListener('blur',  function() {
        setTimeout(function() { dropdown.classList.add('hidden'); }, 200);
    });
}

// ============================================================
// INLINE SEARCH REPOSITIONING
// - No exercises yet: search at the very top (find first exercise)
// - Exercises exist: search appears below the "+ Set" button of
//   the last exercise card only
// Removes all previous search placements (top + bottom) before
// adding the correct one.
// ============================================================

(function() {
    var prevRender = renderActiveWorkout;

    renderActiveWorkout = function() {
        prevRender(); // run existing render (exercises + old search placements)

        var container = document.getElementById('currentExercisesList');
        if (!container) return;

        // Remove every existing inline-add-exercise section (top AND bottom)
        container.querySelectorAll('.inline-add-exercise').forEach(function(el) {
            el.remove();
        });

        var hasExercises = currentWorkout.exercises && currentWorkout.exercises.length > 0;
        var section = buildInlineSearchSection();

        if (!hasExercises) {
            // No exercises yet — search goes at the very top
            section.classList.add('inline-add-top');
            container.insertBefore(section, container.firstChild);
        } else {
            // Exercises exist — search goes inside the LAST exercise card,
            // directly below its "+ Set" button
            var cards = container.querySelectorAll('.active-exercise-card');
            if (cards.length > 0) {
                var lastCard = cards[cards.length - 1];
                section.classList.add('inline-add-after-set');
                lastCard.appendChild(section);
            }
        }

        // Wire events on the freshly created element
        wireInlineSearch();
    };

    updateCurrentWorkoutDisplay = function() { renderActiveWorkout(); };
})();

function buildInlineSearchSection() {
    var div = document.createElement('div');
    div.className = 'inline-add-exercise';
    div.innerHTML =
        '<div class="exercise-search-wrapper">' +
            '<input type="text" id="inlineExerciseSearch"' +
                ' class="exercise-search-input inline-ex-search"' +
                ' placeholder="+ Add exercise..."' +
                ' autocomplete="off">' +
            '<div id="inlineExerciseDropdown"' +
                ' class="exercise-dropdown hidden"></div>' +
        '</div>';
    return div;
}

// ============================================================
// FIX 1: After adding an exercise inline, scroll to it and
//         focus the first weight input so user can type immediately.
// ============================================================

var addExerciseInline = function(exerciseName) {
    if (!exerciseName) return;

    var exType = getExerciseType(exerciseName);
    var mode   = exType === 'timed'      ? 'timed'
               : exType === 'bodyweight' ? 'bodyweight'
               : 'weighted';

    // Blank set — user fills in their own values
    var defSet;
    if (mode === 'timed')           defSet = { duration: undefined, mode: 'timed',      completed: false };
    else if (mode === 'bodyweight') defSet = { reps:     undefined, mode: 'bodyweight', completed: false };
    else                            defSet = { weight:   undefined, reps: undefined, mode: 'weighted', completed: false };

    currentWorkout.exercises.push({
        exercise:    exerciseName,
        muscleGroup: EXERCISE_TO_MUSCLE[exerciseName] || '',
        sets:        [defSet]
    });

    renderActiveWorkout();

    // Scroll to the new card and focus the first input (weight for Set 1)
    setTimeout(function() {
        // Clear search bar
        var searchEl = document.getElementById('inlineExerciseSearch');
        if (searchEl) searchEl.value = '';

        // Find the last exercise card
        var cards = document.querySelectorAll('.active-exercise-card');
        if (!cards.length) return;
        var lastCard = cards[cards.length - 1];

        // Scroll card into view
        lastCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Focus the first weight / reps input so user can start typing
        setTimeout(function() {
            var firstInput = lastCard.querySelector('.fast-weight') ||
                             lastCard.querySelector('.fast-reps')   ||
                             lastCard.querySelector('.fast-input');
            if (firstInput) {
                firstInput.focus();
                firstInput.select();
            }
        }, 300);
    }, 80);
};

// ============================================================
// FIX 2: Templates → new card UI with pre-filled values.
// Re-implementing startWorkoutFromTemplateNow cleanly.
// ============================================================

function startWorkoutFromTemplateNow(workoutName, exercises) {
    var today = new Date().toISOString().split('T')[0];
    var now   = Date.now();

    // Create workout immediately with exercises pre-loaded
    currentWorkout = {
        id:               crypto.randomUUID(),
        name:             workoutName,
        date:             today,
        workoutStartTime: new Date(now).toISOString(),
        exercises:        (exercises || []).map(function(ex) {
            return {
                exercise:    ex.exercise,
                muscleGroup: ex.muscleGroup || EXERCISE_TO_MUSCLE[ex.exercise] || '',
                sets: (ex.sets || []).map(function(s) {
                    return Object.assign({}, s, { completed: false });
                })
            };
        })
    };

    // Always start as a live workout
    workoutIsLive             = true;
    workoutLiveStartTimestamp = now;
    templateQueue             = [];
    pendingTemplate           = null;

    // Keep name/date inputs in sync for cancel/reset
    if (workoutNameInput) workoutNameInput.value = workoutName;
    if (workoutDateInput) workoutDateInput.value  = today;

    // Show the workout section, skip the setup and add-exercise forms
    if (createWorkoutSection) createWorkoutSection.classList.remove('hidden');
    var sf = document.getElementById('workoutSetupForm');
    if (sf) sf.classList.add('hidden');
    if (addExerciseForm)       addExerciseForm.classList.add('hidden');

    // Start the live duration timer if available
    if (typeof startWorkoutDurationTimer === 'function') startWorkoutDurationTimer();

    // Render all exercise cards in the new UI
    renderActiveWorkout();

    if (createWorkoutSection) createWorkoutSection.scrollIntoView({ behavior: 'smooth' });
}

// Override useWorkoutTemplate — "Use a Saved Template" modal
var useWorkoutTemplate = function(workoutName) {
    var template = workouts
        .filter(function(w){ return w.name === workoutName; })
        .sort(function(a, b){ return new Date(b.date) - new Date(a.date); })[0];
    if (!template) return;
    closeWorkoutLayoutModal();
    startWorkoutFromTemplateNow(workoutName, template.exercises);
};

// Override loadFromTemplateObj — Templates page "Start Workout" button
var loadFromTemplateObj = function(template) {
    if (typeof closeWorkoutLayoutModal === 'function') closeWorkoutLayoutModal();
    startWorkoutFromTemplateNow(template.templateName, template.exercises);
};

// Override startWorkoutFromId — History card "Start" button
var startWorkoutFromId = function(workoutId) {
    var workout = workouts.find(function(w){ return w.id === workoutId; });
    if (!workout) return;
    if (workoutDetailModal) workoutDetailModal.classList.add('hidden');
    if (typeof closeWorkoutLayoutModal === 'function') closeWorkoutLayoutModal();
    startWorkoutFromTemplateNow(workout.name, workout.exercises);
};

// Override loadFromPlannedWorkout — Calendar planned workouts
var loadFromPlannedWorkout = function(plan) {
    var exercises = [];
    if (plan.templateWorkoutId) {
        if (typeof loadTemplates === 'function') loadTemplates();
        if (typeof workoutTemplates !== 'undefined') {
            var tpl = workoutTemplates.find(function(t){ return t.templateId === plan.templateWorkoutId; });
            if (tpl) exercises = tpl.exercises;
        }
    }
    if (!exercises.length && plan.exercises && plan.exercises.length) {
        exercises = plan.exercises.map(function(ex) {
            return { exercise: ex, muscleGroup: EXERCISE_TO_MUSCLE[ex] || '', sets: [] };
        });
    }
    startWorkoutFromTemplateNow(plan.name, exercises);
};

// ============================================================
// REST TIMER CLEANUP
// 1. Toggle button at the top of the active workout screen
// 2. Remove the "Start Rest" pre-set button from exercise cards
// 3. Completing a set auto-starts rest only when toggle is ON
// ============================================================

// Override completeSet: only auto-start rest when restTimerEnabled
var completeSet = function(exIdx, setIdx) {
    var exercise = currentWorkout.exercises[exIdx];
    var sets     = exercise && exercise.sets;
    if (!sets || !sets[setIdx]) return;

    // Stop any running rest timer for a different set
    if (restIsRunning && (restForExIdx !== exIdx || restForSetIdx !== setIdx)) {
        stopRestSave();
    }

    sets[setIdx].completed = !sets[setIdx].completed;

    if (sets[setIdx].completed) {
        lastSetCompletedTime = Date.now();

        // Auto-start count-up rest ONLY if toggle is ON and workout is live
        if (workoutIsLive && restTimerEnabled && !restIsRunning) {
            startRestCountUp(exIdx, setIdx);
            return; // renderActiveWorkout called inside startRestCountUp
        }
    } else {
        if (restIsRunning && restForExIdx === exIdx && restForSetIdx === setIdx) {
            stopRestDiscard();
            return;
        }
        delete sets[setIdx].restTaken;
    }

    renderActiveWorkout();
};

// Simple toggle that updates the button appearance without rebuilding the old bar
var toggleRestTimer = function() {
    restTimerEnabled = !restTimerEnabled;
    localStorage.setItem('restTimerEnabled', String(restTimerEnabled));
    if (!restTimerEnabled) {
        if (typeof stopRestTimer === 'function') stopRestTimer();
        restIsRunning    = false;
        restCountSeconds = 0;
    }
    updateRestToggleButton();
};

function updateRestToggleButton() {
    var btn = document.getElementById('restToggleBtn');
    if (!btn) return;
    if (restTimerEnabled) {
        btn.textContent  = '⏱ Rest ON';
        btn.className    = 'rest-toggle-simple rest-toggle-on';
    } else {
        btn.textContent  = '⏱ Rest OFF';
        btn.className    = 'rest-toggle-simple rest-toggle-off';
    }
}

// Post-render wrapper:
// - Removes the "Start Rest" pre-set button from every exercise card
// - Adds/updates the toggle button in the live duration bar
(function() {
    var prevRender = renderActiveWorkout;

    renderActiveWorkout = function() {
        prevRender();

        // Remove every "Start Rest" / pre-set rest section
        document.querySelectorAll('.pre-set-rest').forEach(function(el) {
            el.remove();
        });

        // Add toggle to the live duration bar (only once per bar)
        var durBar = document.getElementById('liveDurationBar');
        if (durBar && !document.getElementById('restToggleBtn')) {
            var btn = document.createElement('button');
            btn.id        = 'restToggleBtn';
            btn.onclick   = toggleRestTimer;
            durBar.appendChild(btn);
        }
        updateRestToggleButton();
    };

    updateCurrentWorkoutDisplay = function() { renderActiveWorkout(); };
})();

// ============================================================
// TEMPLATES → SETUP FORM FIRST
// When a template / history card is selected, show the "Create a
// Workout" form with the name pre-filled so the user can change
// the date (or switch to Log Past Workout) before exercises load.
// ============================================================

// Show the setup form with the template name pre-filled.
// Stores exercises in pendingTemplate for after the form is submitted.
function startWorkoutFromTemplateNow(workoutName, exercises) {
    // Store exercises to load once the form is confirmed
    pendingTemplate = (exercises || []).map(function(ex) {
        return Object.assign({}, ex, {
            sets: (ex.sets || []).map(function(s) {
                return Object.assign({}, s, { completed: false });
            })
        });
    });

    templateQueue = [];

    // Pre-fill the setup form
    if (workoutNameInput) workoutNameInput.value = workoutName;
    setDefaultDate();

    // Reset to "Start Now" by default
    workoutIsLive = true;
    if (typeof selectWorkoutType === 'function') selectWorkoutType('live');

    // Show setup form, hide the exercise areas
    if (createWorkoutSection) createWorkoutSection.classList.remove('hidden');
    var sf = document.getElementById('workoutSetupForm');
    if (sf) sf.classList.remove('hidden');
    if (addExerciseForm)       addExerciseForm.classList.add('hidden');
    if (currentWorkoutDisplay) currentWorkoutDisplay.classList.add('hidden');

    // Remove the old live duration bar so it rebuilds on the next workout
    var oldBar = document.getElementById('liveDurationBar');
    if (oldBar) oldBar.remove();

    if (createWorkoutSection) createWorkoutSection.scrollIntoView({ behavior: 'smooth' });
}

// Override startNewWorkout: when pendingTemplate is set, load exercises
// directly into the card view instead of going through the old add-exercise form.
var startNewWorkout = function() {
    var name = workoutNameInput ? workoutNameInput.value.trim() : '';
    var date = workoutDateInput ? workoutDateInput.value : '';
    if (!name) { alert('Please enter a workout name'); return; }
    if (!date) { alert('Please select a date');        return; }

    // Past workout validation
    if (typeof workoutIsLive !== 'undefined' && !workoutIsLive) {
        var sEl = document.getElementById('workoutStartTimeInput');
        var eEl = document.getElementById('workoutEndTimeInput');
        var sv  = sEl ? sEl.value : '';
        var ev  = eEl ? eEl.value : '';
        if (!sv) { alert('Please enter a start time'); return; }
        if (!ev) { alert('Please enter an end time');  return; }
        var sd = new Date(date + 'T' + sv);
        var ed = new Date(date + 'T' + ev);
        if (ed <= sd)        { alert('End time must be after start time'); return; }
        if (ed > new Date()) { alert('End time cannot be in the future');  return; }
    }

    // Build workout object
    currentWorkout = { id: crypto.randomUUID(), name: name, date: date, exercises: [] };

    // Timing setup
    if (typeof workoutIsLive === 'undefined' || workoutIsLive) {
        if (typeof workoutLiveStartTimestamp !== 'undefined') {
            workoutLiveStartTimestamp = Date.now();
            currentWorkout.workoutStartTime = new Date(workoutLiveStartTimestamp).toISOString();
        }
        if (typeof startWorkoutDurationTimer === 'function') startWorkoutDurationTimer();
    } else {
        var sEl2 = document.getElementById('workoutStartTimeInput');
        var eEl2 = document.getElementById('workoutEndTimeInput');
        if (sEl2 && eEl2) {
            var si = new Date(date + 'T' + sEl2.value).toISOString();
            var ei = new Date(date + 'T' + eEl2.value).toISOString();
            currentWorkout.workoutStartTime = si;
            currentWorkout.workoutEndTime   = ei;
            currentWorkout.workoutDuration  = Math.round((new Date(ei) - new Date(si)) / 1000);
        }
    }

    document.getElementById('workoutSetupForm').classList.add('hidden');

    if (typeof pendingTemplate !== 'undefined' && pendingTemplate && pendingTemplate.length > 0) {
        // Load template exercises directly into currentWorkout (bypasses old one-by-one form)
        currentWorkout.exercises = pendingTemplate.map(function(ex) {
            return Object.assign({}, ex);
        });
        pendingTemplate = null;
        templateQueue   = [];
        if (addExerciseForm)       addExerciseForm.classList.add('hidden');
        if (currentWorkoutDisplay) currentWorkoutDisplay.classList.remove('hidden');
        renderActiveWorkout();
    } else {
        // Create New — blank card view with inline search
        pendingTemplate = null;
        templateQueue   = [];
        if (addExerciseForm)       addExerciseForm.classList.add('hidden');
        if (currentWorkoutDisplay) currentWorkoutDisplay.classList.remove('hidden');
        renderActiveWorkout();
    }

    if (createWorkoutSection) createWorkoutSection.scrollIntoView({ behavior: 'smooth' });
};

// Re-apply overrides so all entry points use the new flow
var useWorkoutTemplate = function(workoutName) {
    var template = workouts
        .filter(function(w){ return w.name === workoutName; })
        .sort(function(a, b){ return new Date(b.date) - new Date(a.date); })[0];
    if (!template) return;
    closeWorkoutLayoutModal();
    startWorkoutFromTemplateNow(workoutName, template.exercises);
};

var loadFromTemplateObj = function(template) {
    if (typeof closeWorkoutLayoutModal === 'function') closeWorkoutLayoutModal();
    startWorkoutFromTemplateNow(template.templateName, template.exercises);
};

var startWorkoutFromId = function(workoutId) {
    var workout = workouts.find(function(w){ return w.id === workoutId; });
    if (!workout) return;
    if (workoutDetailModal) workoutDetailModal.classList.add('hidden');
    if (typeof closeWorkoutLayoutModal === 'function') closeWorkoutLayoutModal();
    startWorkoutFromTemplateNow(workout.name, workout.exercises);
};

var loadFromPlannedWorkout = function(plan) {
    var exercises = [];
    if (plan.templateWorkoutId) {
        if (typeof loadTemplates === 'function') loadTemplates();
        if (typeof workoutTemplates !== 'undefined') {
            var tpl = workoutTemplates.find(function(t){ return t.templateId === plan.templateWorkoutId; });
            if (tpl) exercises = tpl.exercises;
        }
    }
    if (!exercises.length && plan.exercises && plan.exercises.length) {
        exercises = plan.exercises.map(function(ex) {
            return { exercise: ex, muscleGroup: EXERCISE_TO_MUSCLE[ex] || '', sets: [] };
        });
    }
    startWorkoutFromTemplateNow(plan.name, exercises);
};

// ============================================================
// PAST WORKOUT UX — Separate experience from live workouts
// - All sets start as completed (green) by default
// - No live workout timer
// - Static duration display (from start/end times if provided)
// - Rest inputs appear between every set automatically
// - Start/end time is now optional
// ============================================================

// Override startNewWorkout:
// - Start/end time optional for past workouts
// - Mark all template exercises as completed when logging past
var startNewWorkout = function() {
    var name = workoutNameInput ? workoutNameInput.value.trim() : '';
    var date = workoutDateInput ? workoutDateInput.value : '';
    if (!name) { alert('Please enter a workout name'); return; }
    if (!date) { alert('Please select a date');        return; }

    var si = null, ei = null;

    if (typeof workoutIsLive !== 'undefined' && !workoutIsLive) {
        var sEl = document.getElementById('workoutStartTimeInput');
        var eEl = document.getElementById('workoutEndTimeInput');
        var sv  = sEl ? sEl.value.trim() : '';
        var ev  = eEl ? eEl.value.trim() : '';

        // Only validate if at least one time is entered
        if (sv || ev) {
            if (!sv) { alert('Please enter a start time (or leave both blank)'); return; }
            if (!ev) { alert('Please enter an end time (or leave both blank)');  return; }
            var sd = new Date(date + 'T' + sv);
            var ed = new Date(date + 'T' + ev);
            if (ed <= sd)        { alert('End time must be after start time'); return; }
            if (ed > new Date()) { alert('End time cannot be in the future');  return; }
            si = new Date(date + 'T' + sv).toISOString();
            ei = new Date(date + 'T' + ev).toISOString();
        }
    }

    currentWorkout = { id: crypto.randomUUID(), name: name, date: date, exercises: [] };

    if (typeof workoutIsLive === 'undefined' || workoutIsLive) {
        // LIVE workout — start the timer
        if (typeof workoutLiveStartTimestamp !== 'undefined') {
            workoutLiveStartTimestamp = Date.now();
            currentWorkout.workoutStartTime = new Date(workoutLiveStartTimestamp).toISOString();
        }
        if (typeof startWorkoutDurationTimer === 'function') startWorkoutDurationTimer();
    } else {
        // PAST workout — use entered times (optional)
        if (si && ei) {
            currentWorkout.workoutStartTime = si;
            currentWorkout.workoutEndTime   = ei;
            currentWorkout.workoutDuration  = Math.round((new Date(ei) - new Date(si)) / 1000);
        }
    }

    document.getElementById('workoutSetupForm').classList.add('hidden');

    if (typeof pendingTemplate !== 'undefined' && pendingTemplate && pendingTemplate.length > 0) {
        // Template exercises — mark all as completed for past workouts
        currentWorkout.exercises = pendingTemplate.map(function(ex) {
            return Object.assign({}, ex, {
                sets: (ex.sets || []).map(function(s) {
                    var clean = Object.assign({}, s, { completed: !workoutIsLive });
                    return clean;
                })
            });
        });
        pendingTemplate = null;
        templateQueue   = [];
    }

    if (addExerciseForm)       addExerciseForm.classList.add('hidden');
    if (currentWorkoutDisplay) currentWorkoutDisplay.classList.remove('hidden');
    renderActiveWorkout();
    if (createWorkoutSection) createWorkoutSection.scrollIntoView({ behavior: 'smooth' });
};

// Override addExerciseInline:
// - Past workout: blank values but completed = true (green immediately)
// - Live workout: blank values, not completed
var addExerciseInline = function(exerciseName) {
    if (!exerciseName) return;

    var exType    = getExerciseType(exerciseName);
    var mode      = exType === 'timed'       ? 'timed'
                  : exType === 'bodyweight'  ? 'bodyweight'
                  : 'weighted';
    var isPast    = (typeof workoutIsLive !== 'undefined') && !workoutIsLive;

    var defSet;
    if (mode === 'timed')           defSet = { duration: undefined, mode: 'timed',      completed: isPast };
    else if (mode === 'bodyweight') defSet = { reps:     undefined, mode: 'bodyweight', completed: isPast };
    else                            defSet = { weight: undefined, reps: undefined, mode: 'weighted', completed: isPast };

    currentWorkout.exercises.push({
        exercise:    exerciseName,
        muscleGroup: EXERCISE_TO_MUSCLE[exerciseName] || '',
        sets:        [defSet]
    });

    renderActiveWorkout();

    setTimeout(function() {
        var searchEl = document.getElementById('inlineExerciseSearch');
        if (searchEl) searchEl.value = '';

        var cards = document.querySelectorAll('.active-exercise-card');
        if (!cards.length) return;
        var lastCard = cards[cards.length - 1];
        lastCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(function() {
            var firstInput = lastCard.querySelector('.fast-weight') ||
                             lastCard.querySelector('.fast-reps')   ||
                             lastCard.querySelector('.fast-input');
            if (firstInput) { firstInput.focus(); firstInput.select(); }
        }, 300);
    }, 80);
};

// Override addSetToExercise:
// Past workouts: duplicated set starts as completed
var addSetToExercise = function(exIdx) {
    var exercise = currentWorkout.exercises[exIdx];
    if (!exercise) return;
    var sets  = exercise.sets;
    var isPast = (typeof workoutIsLive !== 'undefined') && !workoutIsLive;
    var newSet;
    if (sets.length > 0) {
        newSet = Object.assign({}, sets[sets.length - 1], { completed: isPast });
    } else {
        var exType = getExerciseType(exercise.exercise);
        var mode   = exType === 'timed'      ? 'timed'
                   : exType === 'bodyweight' ? 'bodyweight'
                   : 'weighted';
        if (mode === 'timed')           newSet = { duration: undefined, mode: 'timed',      completed: isPast };
        else if (mode === 'bodyweight') newSet = { reps: undefined,     mode: 'bodyweight', completed: isPast };
        else                            newSet = { weight: undefined, reps: undefined, mode: 'weighted', completed: isPast };
    }
    exercise.sets.push(newSet);
    renderActiveWorkout();
};

// Post-render: for past workouts show a static info bar instead of live timer
(function() {
    var prevRender = renderActiveWorkout;
    renderActiveWorkout = function() {
        prevRender();

        var isPast = (typeof workoutIsLive !== 'undefined') && !workoutIsLive;
        if (!isPast) return; // nothing extra for live workouts

        // Remove live duration bar if it exists (shouldn't for past, but safety)
        var liveBar = document.getElementById('liveDurationBar');
        if (liveBar) liveBar.remove();

        // Add static past workout info bar if not already present
        var display = document.getElementById('currentWorkoutDisplay');
        if (!display || document.getElementById('pastWorkoutInfoBar')) return;

        var bar = document.createElement('div');
        bar.id        = 'pastWorkoutInfoBar';
        bar.className = 'live-duration-bar live-duration-past';

        var durText = '';
        if (currentWorkout.workoutDuration) {
            var h = Math.floor(currentWorkout.workoutDuration / 3600);
            var m = Math.floor((currentWorkout.workoutDuration % 3600) / 60);
            durText = (h > 0 ? h + ' hr ' : '') + m + ' min';
        }

        bar.innerHTML =
            '<span class="live-dur-label">📋 Past Workout</span>' +
            (durText ? '<span class="live-dur-time">' + durText + '</span>' : '');

        var h3 = display.querySelector('h3');
        if (h3) h3.after(bar); else display.prepend(bar);
    };
    updateCurrentWorkoutDisplay = function() { renderActiveWorkout(); };
})();

// Remove the "Past Workout" bar when the current workout is live
(function() {
    var prev = renderActiveWorkout;
    renderActiveWorkout = function() {
        prev();
        var isLive = (typeof workoutIsLive === 'undefined') || workoutIsLive;
        if (isLive) {
            var bar = document.getElementById('pastWorkoutInfoBar');
            if (bar) bar.remove();
        }
    };
    updateCurrentWorkoutDisplay = function() { renderActiveWorkout(); };
})();

// ============================================================
// WORKOUT COMPLETE SUMMARY MODAL
// Shows after saving: exercises, sets, rest times, PRs, duration
// ============================================================

function showWorkoutSummary(workout, prs) {
    var existing = document.getElementById('workoutSummaryModal');
    if (existing) existing.remove();

    // ── Calculations ─────────────────────────────────────────
    var totalSets   = 0;
    var totalVolume = 0;
    workout.exercises.forEach(function(ex) {
        totalSets += ex.sets.length;
        ex.sets.forEach(function(s) {
            if ((s.mode || 'weighted') === 'weighted' && s.weight && s.reps) {
                totalVolume += s.weight * s.reps;
            }
        });
    });

    // Duration
    var durText = '';
    if (workout.workoutDuration) {
        var h = Math.floor(workout.workoutDuration / 3600);
        var m = Math.floor((workout.workoutDuration % 3600) / 60);
        durText = h > 0 ? h + ' hr ' + m + ' min' : m + ' min';
    }

    // Date display
    var dateDisp = '';
    try {
        var d = new Date(workout.date + 'T12:00:00');
        dateDisp = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch(e) { dateDisp = workout.date; }

    // PR lookup for fast access
    var prExercises = {};
    (prs || []).forEach(function(pr) { prExercises[pr.exercise] = pr; });

    // ── Exercise cards ────────────────────────────────────────
    var exHtml = workout.exercises.map(function(ex) {
        var setRows = ex.sets.map(function(s, idx) {
            var sm = s.mode || 'weighted';
            var val = '';
            if (sm === 'timed') {
                var d2 = s.duration || 0;
                val = Math.floor(d2/60) + 'm ' + (d2%60) + 's';
            } else if (sm === 'bodyweight') {
                val = 'BW × ' + (s.reps || 0) + ' reps';
            } else {
                val = (s.weight || 0) + ' lbs × ' + (s.reps || 0) + ' reps';
            }

            // Set row — no rest inline
            var rowHtml = '<div class="sum-set-row">' +
                '<span class="sum-set-label">Set ' + (idx+1) + '</span>' +
                '<span class="sum-set-val">' + val + '</span>' +
            '</div>';

            // Rest appears as a separate row BELOW the set
            var restHtml = s.restTaken
                ? '<div class="sum-rest-row">⏱ Rest: ' + formatRestTime(s.restTaken) + '</div>'
                : '';

            return rowHtml + restHtml;
        }).join('');

        // PR badge — show actual weight × reps, not undefined
        var prBadge = '';
        if (prExercises[ex.exercise]) {
            var pr = prExercises[ex.exercise];
            var prVal;
            if (pr.weight && pr.reps) {
                // Weighted exercise
                prVal = pr.weight + ' lbs × ' + pr.reps + ' reps';
            } else if (pr.reps && !pr.weight) {
                // Bodyweight — reps is the metric
                prVal = pr.reps + ' reps';
            } else if (pr.est1RM) {
                // Fallback to estimated 1RM
                prVal = 'Est. 1RM: ' + pr.est1RM.toFixed(1) + ' lbs';
            } else {
                prVal = 'New record';
            }
            prBadge = '<div class="sum-pr-badge">🏆 New PR: ' + prVal + '</div>';
        }

        return '<div class="sum-exercise-card">' +
            '<div class="sum-ex-header">' +
                '<span class="sum-ex-name">' + ex.exercise + '</span>' +
                '<span class="sum-ex-muscle">' + (ex.muscleGroup || '') + '</span>' +
            '</div>' +
            setRows +
            prBadge +
        '</div>';
    }).join('');

    // ── Stats row ─────────────────────────────────────────────
    var statsHtml =
        '<div class="sum-stats">' +
            '<div class="sum-stat"><div class="sum-stat-val">' + workout.exercises.length + '</div><div class="sum-stat-label">Exercises</div></div>' +
            '<div class="sum-stat"><div class="sum-stat-val">' + totalSets + '</div><div class="sum-stat-label">Sets</div></div>' +
            (totalVolume > 0 ? '<div class="sum-stat"><div class="sum-stat-val">' + totalVolume.toLocaleString() + '</div><div class="sum-stat-label">lbs Volume</div></div>' : '') +
            (durText ? '<div class="sum-stat"><div class="sum-stat-val">' + durText + '</div><div class="sum-stat-label">Duration</div></div>' : '') +
            ((prs && prs.length) ? '<div class="sum-stat sum-stat-pr"><div class="sum-stat-val">' + prs.length + '</div><div class="sum-stat-label">New PRs 🏆</div></div>' : '') +
        '</div>';

    // ── Build modal ───────────────────────────────────────────
    var modal = document.createElement('div');
    modal.id        = 'workoutSummaryModal';
    modal.className = 'workout-summary-modal';

    modal.innerHTML =
        '<div class="sum-backdrop" onclick="closeWorkoutSummary()"></div>' +
        '<div class="sum-content">' +
            '<div class="sum-header">' +
                '<div class="sum-celebration">🎉</div>' +
                '<h2 class="sum-title">' + workout.name + '</h2>' +
                '<p class="sum-date">' + dateDisp + '</p>' +
            '</div>' +
            statsHtml +
            '<div class="sum-exercise-list">' + exHtml + '</div>' +
            '<button class="sum-close-btn" onclick="closeWorkoutSummary()">Done</button>' +
        '</div>';

    document.body.appendChild(modal);
    requestAnimationFrame(function() {
        requestAnimationFrame(function() {
            modal.classList.add('sum-visible');
        });
    });
}

function closeWorkoutSummary() {
    var modal = document.getElementById('workoutSummaryModal');
    if (!modal) return;
    modal.classList.remove('sum-visible');
    setTimeout(function() { if (modal.parentNode) modal.remove(); }, 350);
}

// Wrap saveCurrentWorkout to capture data BEFORE the form resets
(function() {
    var prevSave = saveCurrentWorkout;
    saveCurrentWorkout = function() {
        // Snapshot the workout and check PRs before save clears everything
        var snapshot = JSON.parse(JSON.stringify(currentWorkout));
        var prs = (typeof checkForNewPRs === 'function') ? checkForNewPRs(currentWorkout) : [];

        prevSave(); // runs the original save + resets form

        // Show summary after save
        showWorkoutSummary(snapshot, prs);
    };
})();
