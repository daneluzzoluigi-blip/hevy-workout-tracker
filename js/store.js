/**
 * Store - Gestione LocalStorage, Migrazione Automatica, Hook CloudSync,
 * Calcoli 1RM, Sovraccarico Progressivo, Programmi Settimanali e Backup JSON
 */

const IS_DEMO_MODE = (() => {
  try {
    if (typeof window === "undefined" || !window.location) return false;
    const params = new URLSearchParams(window.location.search);
    return params.get("demo") === "1" || params.get("mode") === "demo";
  } catch (e) {
    return false;
  }
})();

const STORAGE_KEYS = {
  ROUTINES: "hevy_routines_v1",
  HISTORY: "hevy_history_v1",
  ACTIVE_WORKOUT: "hevy_active_workout_v1",
  SETTINGS: "hevy_settings_v1",
  DATA_VERSION: "hevy_data_version_v1",
  UI_STATE: "hevy_ui_state_v1",
  DELETED_ROUTINES: "hevy_deleted_routines_v1",
  DELETED_HISTORY: "hevy_deleted_history_v1"
};

const LEGACY_SAMPLE_ROUTINE_IDS = new Set([
  "routine_fullbody_a",
  "routine_push",
  "routine_pull"
]);

const LEGACY_SAMPLE_HISTORY_IDS = new Set([
  "hist_1",
  "hist_2",
  "hist_3",
  "hist_4"
]);

const Store = {
  _demoState: null,

  init() {
    if (IS_DEMO_MODE) {
      this._demoState = {
        routines: JSON.parse(JSON.stringify(DEFAULT_ROUTINES)),
        history: JSON.parse(JSON.stringify(generateDefaultHistory())),
        activeWorkout: null,
        uiState: { programId: "prog_pdf_s1_s4", week: 1 },
        settings: {
          soundEnabled: true,
          vibrationEnabled: true,
          defaultTimerIncrement: 15,
          theme: "dark"
        }
      };
      return;
    }

    const currentVersion = localStorage.getItem(STORAGE_KEYS.DATA_VERSION);
    const hasRoutines = !!localStorage.getItem(STORAGE_KEYS.ROUTINES);
    const hasHistory = !!localStorage.getItem(STORAGE_KEYS.HISTORY);

    if (!hasRoutines && !hasHistory) {
      this.setRoutines(DEFAULT_ROUTINES, true);
      this.setHistory(generateDefaultHistory(), true);
      localStorage.setItem(STORAGE_KEYS.DATA_VERSION, DATA_SCHEMA_VERSION);
    } else if (currentVersion !== DATA_SCHEMA_VERSION) {
      // Migrazione sicura: sostituisce vecchi demo preservando schede e sessioni dell'utente (es. allenamento di ieri!)
      const existingRoutines = this.getRoutines().filter(r => !LEGACY_SAMPLE_ROUTINE_IDS.has(r.id));
      const defaultRoutineIds = new Set(DEFAULT_ROUTINES.map(r => r.id));
      const customRoutines = existingRoutines.filter(r => !defaultRoutineIds.has(r.id));
      this.setRoutines([...DEFAULT_ROUTINES, ...customRoutines], true);

      const existingHistory = this.getHistory().filter(h => !LEGACY_SAMPLE_HISTORY_IDS.has(h.id));
      const defaultHistory = generateDefaultHistory();
      const defaultHistIds = new Set(defaultHistory.map(h => h.id));
      const customHistory = existingHistory.filter(h => !defaultHistIds.has(h.id));
      this.setHistory([...customHistory, ...defaultHistory], true);

      localStorage.setItem(STORAGE_KEYS.DATA_VERSION, DATA_SCHEMA_VERSION);
    }

    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.setSettings({
        soundEnabled: true,
        vibrationEnabled: true,
        defaultTimerIncrement: 15,
        theme: "dark"
      });
    }
  },

  // --- DELETED IDS TRACKING (per sync cancellazioni) ---
  getDeletedRoutineIds() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DELETED_ROUTINES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  setDeletedRoutineIds(ids) {
    localStorage.setItem(STORAGE_KEYS.DELETED_ROUTINES, JSON.stringify(ids || []));
  },

  getDeletedHistoryIds() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DELETED_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  setDeletedHistoryIds(ids) {
    localStorage.setItem(STORAGE_KEYS.DELETED_HISTORY, JSON.stringify(ids || []));
  },

  // --- UI STATE ---
  getUiState() {
    if (IS_DEMO_MODE && this._demoState) return this._demoState.uiState;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.UI_STATE);
      return data ? JSON.parse(data) : { programId: "prog_pdf_s1_s4", week: 1 };
    } catch (e) {
      return { programId: "prog_pdf_s1_s4", week: 1 };
    }
  },

  setUiState(state) {
    if (IS_DEMO_MODE && this._demoState) {
      this._demoState.uiState = state;
      return;
    }
    localStorage.setItem(STORAGE_KEYS.UI_STATE, JSON.stringify(state));
  },

  // --- ROUTINES ---
  getRoutines() {
    if (IS_DEMO_MODE && this._demoState) return this._demoState.routines;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROUTINES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Errore lettura routine:", e);
      return [];
    }
  },

  setRoutines(routines, skipCloud = false) {
    if (IS_DEMO_MODE) return;
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
    if (!skipCloud && typeof CloudSync !== "undefined") {
      CloudSync.schedulePushRoutines();
    }
  },

  getRoutineById(id) {
    const list = this.getRoutines();
    return list.find(r => r.id === id) || null;
  },

  saveRoutine(routine) {
    if (IS_DEMO_MODE) return null;
    const list = this.getRoutines();
    const index = list.findIndex(r => r.id === routine.id);
    routine.updatedAt = new Date().toISOString();
    if (index >= 0) {
      list[index] = routine;
    } else {
      list.push(routine);
    }
    const del = this.getDeletedRoutineIds().filter(d => d !== routine.id);
    this.setDeletedRoutineIds(del);
    this.setRoutines(list);
    return routine;
  },

  duplicateRoutine(id) {
    if (IS_DEMO_MODE) return null;
    const orig = this.getRoutineById(id);
    if (!orig) return null;
    const copy = JSON.parse(JSON.stringify(orig));
    copy.id = "routine_" + Date.now();
    copy.name = `${orig.name} (Copia)`;
    copy.updatedAt = new Date().toISOString();
    const list = this.getRoutines();
    list.push(copy);
    this.setRoutines(list);
    return copy;
  },

  deleteRoutine(id) {
    if (IS_DEMO_MODE) return;
    const list = this.getRoutines().filter(r => r.id !== id);
    const del = Array.from(new Set([...this.getDeletedRoutineIds(), id]));
    this.setDeletedRoutineIds(del);
    this.setRoutines(list);
  },

  getCompletedRoutineIds() {
    const set = new Set();
    this.getHistory().forEach(h => {
      if (h.routineId) set.add(h.routineId);
    });
    return set;
  },

  // --- STORICO ALLENAMENTI ---
  getHistory() {
    if (IS_DEMO_MODE && this._demoState) {
      return [...this._demoState.history].sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      const list = data ? JSON.parse(data) : [];
      return list.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (e) {
      console.error("Errore lettura storico:", e);
      return [];
    }
  },

  setHistory(history, skipCloud = false) {
    if (IS_DEMO_MODE) return;
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    if (!skipCloud && typeof CloudSync !== "undefined") {
      CloudSync.schedulePushHistory();
    }
  },

  deleteHistorySession(id) {
    if (IS_DEMO_MODE) return;
    const history = this.getHistory().filter(h => h.id !== id);
    const del = Array.from(new Set([...this.getDeletedHistoryIds(), id]));
    this.setDeletedHistoryIds(del);
    this.setHistory(history);
  },

  updateHistorySession(updatedSession) {
    if (IS_DEMO_MODE) return null;
    const history = this.getHistory();
    const idx = history.findIndex(h => h.id === updatedSession.id);
    updatedSession.updatedAt = new Date().toISOString();
    if (idx >= 0) {
      history[idx] = updatedSession;
    } else {
      history.unshift(updatedSession);
    }
    this.setHistory(history);
    return updatedSession;
  },

  saveWorkoutSession(session, updateRoutineDefaults = true) {
    if (IS_DEMO_MODE) return;
    const history = this.getHistory();
    history.unshift(session);
    const del = this.getDeletedHistoryIds().filter(d => d !== session.id);
    this.setDeletedHistoryIds(del);
    this.setHistory(history);

    if (updateRoutineDefaults && session.routineId) {
      const routine = this.getRoutineById(session.routineId);
      if (routine && routine.exercises) {
        let changed = false;
        session.exercises.forEach(sessionEx => {
          const targetEx = routine.exercises.find(e => this.isExerciseNameMatch(e.name, sessionEx.name));
          if (targetEx && sessionEx.sets && sessionEx.sets.length > 0) {
            const completedSets = sessionEx.sets.filter(s => s.completed);
            if (completedSets.length > 0) {
              targetEx.sets = completedSets.map((s, idx) => {
                const origTag = (targetEx.sets && targetEx.sets[idx] && targetEx.sets[idx].tag) || s.tag || "";
                return {
                  weight: Number(s.weight) || 0,
                  reps: Number(s.reps) || 0,
                  ...(origTag ? { tag: origTag } : {})
                };
              });
              if (sessionEx.notes) {
                targetEx.notes = sessionEx.notes;
              }
              changed = true;
            }
          }
        });
        if (changed) {
          this.saveRoutine(routine);
        }
      }
    }
  },

  normalizeExerciseName(name) {
    if (!name) return "";
    return String(name)
      .toLowerCase()
      .replace(/\s*\([^)]*\)\s*/g, " ")
      .replace(/[–—-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  },

  isExerciseNameMatch(nameA, nameB) {
    if (!nameA || !nameB) return false;
    const rawA = nameA.toLowerCase().trim();
    const rawB = nameB.toLowerCase().trim();
    if (rawA === rawB) return true;
    const normA = this.normalizeExerciseName(rawA);
    const normB = this.normalizeExerciseName(rawB);
    return normA.length > 0 && normA === normB;
  },

  getLastSessionForExercise(exerciseName) {
    const history = this.getHistory();
    for (const session of history) {
      if (!session.exercises) continue;
      const found = session.exercises.find(e => this.isExerciseNameMatch(e.name, exerciseName));
      if (found && found.sets && found.sets.some(s => s.completed)) {
        return {
          date: session.date,
          sessionName: session.routineName || "Allenamento",
          exercise: found
        };
      }
    }
    return null;
  },

  // --- RECORD PERSONALI (PR) TRACKING ---
  getHistoricalRecordsForExercise(exerciseName, sessionIdExclude = null) {
    const history = this.getHistory();

    let maxWeight = 0;
    let maxSetVolume = 0;
    let hasCompletedSets = false;

    for (const session of history) {
      if (sessionIdExclude && session.id === sessionIdExclude) continue;
      if (!session.exercises) continue;

      const found = session.exercises.find(e => this.isExerciseNameMatch(e.name, exerciseName));
      if (found && found.sets) {
        for (const s of found.sets) {
          if (s.completed && Number(s.weight) > 0) {
            hasCompletedSets = true;
            const w = Number(s.weight);
            const reps = Number(s.reps) || 0;
            const vol = w * reps;

            if (w > maxWeight) maxWeight = w;
            if (vol > maxSetVolume) maxSetVolume = vol;
          }
        }
      }
    }

    return {
      allTimeMaxWeight: maxWeight,
      allTimeMaxSetVolume: maxSetVolume,
      hasHistory: hasCompletedSets
    };
  },

  checkExercisePRs(exerciseName, sets = [], sessionIdExclude = null) {
    const historical = this.getHistoricalRecordsForExercise(exerciseName, sessionIdExclude);

    let isMaxWeightPR = false;
    let currentMaxWeight = 0;
    let isMaxVolumePR = false;
    let currentMaxVolume = 0;

    for (const s of sets) {
      if (s.completed === false) continue;
      const w = Number(s.weight) || 0;
      const reps = Number(s.reps) || 0;
      const vol = w * reps;

      if (w > currentMaxWeight) currentMaxWeight = w;
      if (vol > currentMaxVolume) currentMaxVolume = vol;

      if (historical.allTimeMaxWeight > 0 && w > historical.allTimeMaxWeight) {
        isMaxWeightPR = true;
      }
      if (historical.allTimeMaxSetVolume > 0 && vol > historical.allTimeMaxSetVolume) {
        isMaxVolumePR = true;
      }
    }

    return {
      isMaxWeightPR,
      currentMaxWeight,
      prevMaxWeight: historical.allTimeMaxWeight,
      isMaxVolumePR,
      currentMaxVolume,
      prevMaxVolume: historical.allTimeMaxSetVolume,
      hasHistory: historical.hasHistory
    };
  },

  // --- SOVRACCARICO PROGRESSIVO ---
  getProgressiveOverloadSuggestion(exerciseName, currentSets = []) {
    const lastSession = this.getLastSessionForExercise(exerciseName);
    if (!lastSession || !lastSession.exercise || !lastSession.exercise.sets) {
      return null;
    }

    const pastSets = lastSession.exercise.sets.filter(s => s.completed);
    if (pastSets.length === 0) return null;

    const allCompleted = pastSets.every(s => s.completed && s.reps > 0 && s.weight !== undefined);
    if (!allCompleted) return null;

    const maxWeight = Math.max(...pastSets.map(s => Number(s.weight) || 0));
    const avgReps = pastSets.reduce((sum, s) => sum + (Number(s.reps) || 0), 0) / pastSets.length;

    if (maxWeight > 0) {
      const increment = maxWeight >= 60 ? 2.5 : 1.25;
      return {
        type: "weight",
        value: increment,
        text: `Consiglio: +${increment} kg`,
        detail: `Ultima sessione: ${pastSets.length} serie fino a ${maxWeight} kg.`,
        suggestedWeight: maxWeight + increment
      };
    } else {
      return {
        type: "reps",
        value: 1,
        text: `Consiglio: +1 rep`,
        detail: `Ottima costanza! Prova ad aggiungere una ripetizione a ogni serie.`,
        suggestedReps: Math.round(avgReps) + 1
      };
    }
  },

  // --- CALCOLO 1RM EPLEY & VOLUME ---
  calculate1RM(weight, reps) {
    const w = Number(weight) || 0;
    const r = Number(reps) || 0;
    if (w <= 0 || r <= 0) return 0;
    if (r === 1) return w;
    return Math.round(w * (1 + r / 30) * 10) / 10;
  },

  calculateVolume(sets = []) {
    return sets.reduce((sum, s) => {
      if (!s.completed && s.completed !== undefined) return sum;
      const w = Number(s.weight) || 0;
      const r = Number(s.reps) || 0;
      return sum + (w * r);
    }, 0);
  },

  // --- ACTIVE WORKOUT IN CORSO ---
  getActiveWorkout() {
    if (IS_DEMO_MODE && this._demoState) return this._demoState.activeWorkout;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveActiveWorkout(workout) {
    if (IS_DEMO_MODE && this._demoState) {
      this._demoState.activeWorkout = workout || null;
      return;
    }
    if (!workout) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(workout));
    }
  },

  clearActiveWorkout() {
    if (IS_DEMO_MODE && this._demoState) {
      this._demoState.activeWorkout = null;
      return;
    }
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
  },

  // --- IMPOSTAZIONI ---
  getSettings() {
    if (IS_DEMO_MODE && this._demoState) return this._demoState.settings;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : { soundEnabled: true, vibrationEnabled: true, defaultTimerIncrement: 15 };
    } catch (e) {
      return { soundEnabled: true, vibrationEnabled: true, defaultTimerIncrement: 15 };
    }
  },

  setSettings(settings) {
    if (IS_DEMO_MODE && this._demoState) {
      this._demoState.settings = settings;
      return;
    }
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // --- BACKUP & RESTORE JSON ---
  exportBackup() {
    const backup = {
      app: "HevyGymTracker",
      version: "2.1.0",
      dataVersion: DATA_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      routines: this.getRoutines(),
      history: this.getHistory(),
      settings: this.getSettings()
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString) {
    if (IS_DEMO_MODE) return { success: false, error: "Modalità Demo in sola lettura." };
    try {
      const data = JSON.parse(jsonString);
      if (!data || !Array.isArray(data.routines) || !Array.isArray(data.history)) {
        throw new Error("Formato del file di backup non valido.");
      }
      this.setDeletedRoutineIds([]);
      this.setDeletedHistoryIds([]);
      this.setRoutines(data.routines);
      this.setHistory(data.history);
      if (data.settings) this.setSettings(data.settings);
      localStorage.setItem(STORAGE_KEYS.DATA_VERSION, DATA_SCHEMA_VERSION);
      return { success: true, countRoutines: data.routines.length, countHistory: data.history.length };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  resetToDefaults() {
    if (IS_DEMO_MODE) return;
    this.setDeletedRoutineIds([]);
    this.setDeletedHistoryIds([]);
    this.setRoutines(DEFAULT_ROUTINES);
    this.setHistory(generateDefaultHistory());
    this.clearActiveWorkout();
    this.setUiState({ programId: "prog_pdf_s1_s4", week: 1 });
    localStorage.setItem(STORAGE_KEYS.DATA_VERSION, DATA_SCHEMA_VERSION);
  }
};
