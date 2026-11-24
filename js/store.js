/**
 * Store - Gestione LocalStorage, Migrazione Automatica, Calcoli 1RM,
 * Sovraccarico Progressivo, Programmi Settimanali e Backup JSON
 */

const STORAGE_KEYS = {
  ROUTINES: "hevy_routines_v1",
  HISTORY: "hevy_history_v1",
  ACTIVE_WORKOUT: "hevy_active_workout_v1",
  SETTINGS: "hevy_settings_v1",
  DATA_VERSION: "hevy_data_version_v1",
  UI_STATE: "hevy_ui_state_v1"
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
  init() {
    const currentVersion = localStorage.getItem(STORAGE_KEYS.DATA_VERSION);
    const hasRoutines = !!localStorage.getItem(STORAGE_KEYS.ROUTINES);
    const hasHistory = !!localStorage.getItem(STORAGE_KEYS.HISTORY);

    if (!hasRoutines && !hasHistory) {
      this.setRoutines(DEFAULT_ROUTINES);
      this.setHistory(generateDefaultHistory());
      localStorage.setItem(STORAGE_KEYS.DATA_VERSION, DATA_SCHEMA_VERSION);
    } else if (currentVersion !== DATA_SCHEMA_VERSION) {
      // Migrazione automatica sicura: sostituisce i vecchi dati demo preservando eventuali schede/sessioni personalizzate
      const existingRoutines = this.getRoutines().filter(r => !LEGACY_SAMPLE_ROUTINE_IDS.has(r.id));
      const defaultRoutineIds = new Set(DEFAULT_ROUTINES.map(r => r.id));
      const customRoutines = existingRoutines.filter(r => !defaultRoutineIds.has(r.id));
      this.setRoutines([...DEFAULT_ROUTINES, ...customRoutines]);

      const existingHistory = this.getHistory().filter(h => !LEGACY_SAMPLE_HISTORY_IDS.has(h.id));
      const defaultHistory = generateDefaultHistory();
      const defaultHistIds = new Set(defaultHistory.map(h => h.id));
      const customHistory = existingHistory.filter(h => !defaultHistIds.has(h.id));
      this.setHistory([...customHistory, ...defaultHistory]);

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

  // --- UI STATE (Programma e Settimana selezionati) ---
  getUiState() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.UI_STATE);
      return data ? JSON.parse(data) : { programId: "prog_pdf_s1_s4", week: 1 };
    } catch (e) {
      return { programId: "prog_pdf_s1_s4", week: 1 };
    }
  },

  setUiState(state) {
    localStorage.setItem(STORAGE_KEYS.UI_STATE, JSON.stringify(state));
  },

  // --- ROUTINES ---
  getRoutines() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROUTINES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Errore lettura routine:", e);
      return [];
    }
  },

  setRoutines(routines) {
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
  },

  getRoutineById(id) {
    const list = this.getRoutines();
    return list.find(r => r.id === id) || null;
  },

  saveRoutine(routine) {
    const list = this.getRoutines();
    const index = list.findIndex(r => r.id === routine.id);
    routine.updatedAt = new Date().toISOString();
    if (index >= 0) {
      list[index] = routine;
    } else {
      list.push(routine);
    }
    this.setRoutines(list);
    return routine;
  },

  duplicateRoutine(id) {
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
    const list = this.getRoutines().filter(r => r.id !== id);
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
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      const list = data ? JSON.parse(data) : [];
      return list.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (e) {
      console.error("Errore lettura storico:", e);
      return [];
    }
  },

  setHistory(history) {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  },

  saveWorkoutSession(session, updateRoutineDefaults = true) {
    const history = this.getHistory();
    history.unshift(session);
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

  // --- SOVRACCARICO PROGRESSIVO (PROGRESSIVE OVERLOAD) ---
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
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveActiveWorkout(workout) {
    if (!workout) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(workout));
    }
  },

  clearActiveWorkout() {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
  },

  // --- IMPOSTAZIONI ---
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : { soundEnabled: true, vibrationEnabled: true, defaultTimerIncrement: 15 };
    } catch (e) {
      return { soundEnabled: true, vibrationEnabled: true, defaultTimerIncrement: 15 };
    }
  },

  setSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // --- BACKUP & RESTORE JSON ---
  exportBackup() {
    const backup = {
      app: "HevyGymTracker",
      version: "2.0.0",
      dataVersion: DATA_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      routines: this.getRoutines(),
      history: this.getHistory(),
      settings: this.getSettings()
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !Array.isArray(data.routines) || !Array.isArray(data.history)) {
        throw new Error("Formato del file di backup non valido.");
      }
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
    this.setRoutines(DEFAULT_ROUTINES);
    this.setHistory(generateDefaultHistory());
    this.clearActiveWorkout();
    this.setUiState({ programId: "prog_pdf_s1_s4", week: 1 });
    localStorage.setItem(STORAGE_KEYS.DATA_VERSION, DATA_SCHEMA_VERSION);
  }
};
