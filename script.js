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

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => renderProgressChart(), 150);
        });

        // Chart animates on hover
        const chartContainer = document.querySelector('.progress-chart-container');
        if (chartContainer) {
            chartContainer.addEventListener('mouseenter', animateChartOnHover);
        }
    } else if (currentPage === 'statistics') {
        renderMuscleGroupProgress();
    } else if (currentPage === 'achievements') {
        renderPersonalRecords();
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
