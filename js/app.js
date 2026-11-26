/**
 * Hevy Gym Tracker - Applicazione Principale
 * Gestisce programmi divisi in settimane, esecuzione allenamento, routine editor,
 * superserie, note multiriga, catalogo esercizi con anatomia SVG e badge PR.
 */

const App = {
  currentView: "view-routines",
  activeWorkout: null,
  workoutTimerInterval: null,
  activeExercisePickerContext: null,
  pickerMuscleFilter: "Tutti",
  finishSummaryData: null,
  currentEditorExercises: [],
  currentHistoryEditorSession: null,
  selectedProgramId: "prog_pdf_s1_s4",
  selectedWeek: 1,
  expandedRoutineIds: new Set(),
  expandedBackoffIdx: new Set(),
  historyWeekFilter: "all",

  QUICK_TAGS: [
    { label: "Stanchezza", short: "Stanchezza", emoji: "😴", type: "fatigue" },
    { label: "Fuori programma", short: "Fuori prog.", emoji: "⚡", type: "info" },
    { label: "Dolore gomiti", short: "Gomiti", emoji: "🤕", type: "pain" },
    { label: "Mal di schiena", short: "Schiena", emoji: "🤕", type: "pain" },
    { label: "Fastidio braccio", short: "Braccio", emoji: "🤕", type: "pain" },
    { label: "Fastidio spalla", short: "Spalla", emoji: "🤕", type: "pain" },
    { label: "Fastidio ginocchio", short: "Ginocchio", emoji: "🤕", type: "pain" },
    { label: "Altra palestra", short: "Trasferta", emoji: "📍", type: "info" }
  ],

  init() {
    Store.init();
    RestTimer.init();

    if (typeof IS_DEMO_MODE !== "undefined" && IS_DEMO_MODE) {
      document.body.classList.add("demo-mode");
      const banner = document.getElementById("demo-mode-banner");
      if (banner) banner.style.display = "flex";
    }

    const uiState = Store.getUiState();
    this.selectedProgramId = uiState.programId || "prog_pdf_s1_s4";
    this.selectedWeek = uiState.week !== undefined ? uiState.week : 1;

    this.bindNavigation();
    this.bindModals();
    this.bindSettings();
    this.bindExercisePickerFilters();
    this.renderRoutines();

    // Controlla se c'è un allenamento già attivo salvato in LocalStorage
    const savedActive = Store.getActiveWorkout();
    if (savedActive) {
      this.activeWorkout = savedActive;
      this.resumeActiveWorkout();
    }

    // Inizializza i grafici
    ChartsManager.init();

    // Avvia sincronizzazione Cloud Firebase in tempo reale
    if (typeof CloudSync !== "undefined") {
      CloudSync.init();
    }

    const exSelect = document.getElementById("chart-exercise-select");
    const metricSelect = document.getElementById("chart-metric-select");
    const rtSelect = document.getElementById("chart-routine-select");

    if (exSelect) {
      exSelect.addEventListener("change", () => {
        ChartsManager.renderExerciseChart(exSelect.value, metricSelect ? metricSelect.value : "both");
      });
    }
    if (metricSelect) {
      metricSelect.addEventListener("change", () => {
        ChartsManager.renderExerciseChart(exSelect ? exSelect.value : "", metricSelect.value);
      });
    }
    if (rtSelect) {
      rtSelect.addEventListener("change", () => {
        ChartsManager.renderRoutineChart(rtSelect.value);
      });
    }

    // Tab switcher in statistiche (Grafici vs Storico)
    const tabCharts = document.getElementById("tab-btn-charts");
    const tabHistory = document.getElementById("tab-btn-history");
    const panelCharts = document.getElementById("stats-panel-charts");
    const panelHistory = document.getElementById("stats-panel-history");

    if (tabCharts && tabHistory && panelCharts && panelHistory) {
      tabCharts.addEventListener("click", () => {
        tabCharts.className = "btn btn-primary btn-sm flex-1";
        tabHistory.className = "btn btn-secondary btn-sm flex-1";
        panelCharts.style.display = "block";
        panelHistory.style.display = "none";
        ChartsManager.renderCurrentCharts();
      });

      tabHistory.addEventListener("click", () => {
        tabHistory.className = "btn btn-primary btn-sm flex-1";
        tabCharts.className = "btn btn-secondary btn-sm flex-1";
        panelCharts.style.display = "none";
        panelHistory.style.display = "block";
        this.renderHistoryList();
      });
    }
  },

  // ================= 1. NAVIGAZIONE =================
  bindNavigation() {
    document.querySelectorAll(".nav-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetView = btn.getAttribute("data-view");
        this.switchView(targetView);
      });
    });

    const btnQuick = document.getElementById("btn-start-quick-workout");
    if (btnQuick) btnQuick.addEventListener("click", () => this.startQuickWorkout());

    const btnGoToRoutines = document.getElementById("btn-goto-routines");
    if (btnGoToRoutines) btnGoToRoutines.addEventListener("click", () => this.switchView("view-routines"));
  },

  switchView(viewId) {
    this.currentView = viewId;

    document.querySelectorAll(".nav-item").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-view") === viewId);
    });

    document.querySelectorAll(".view-section").forEach(sec => {
      sec.classList.toggle("active", sec.id === viewId);
    });

    if (viewId === "view-routines") {
      this.renderRoutines();
    } else if (viewId === "view-active") {
      this.renderActiveWorkout();
    } else if (viewId === "view-stats") {
      ChartsManager.populateSelectors();
      ChartsManager.renderCurrentCharts();
      this.renderHistoryList();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  updateActiveNavBadge() {
    const dot = document.getElementById("nav-active-dot");
    if (dot) dot.style.display = this.activeWorkout ? "block" : "none";
  },

  // ================= 2. PROGRAMMI, SETTIMANE & ROUTINE =================
  selectProgram(programId) {
    this.selectedProgramId = programId;
    if (programId === "prog_pdf_s1_s4") {
      if (![1, 2, 3, 4, "all"].includes(this.selectedWeek)) this.selectedWeek = 1;
    } else if (programId === "prog_block2_s5_s8") {
      if (![5, 6, 7, 8, "all"].includes(this.selectedWeek)) this.selectedWeek = 5;
    } else {
      this.selectedWeek = "all";
    }
    Store.setUiState({ programId: this.selectedProgramId, week: this.selectedWeek });
    this.renderRoutines();
  },

  selectWeek(weekVal) {
    this.selectedWeek = weekVal === "all" ? "all" : Number(weekVal);
    Store.setUiState({ programId: this.selectedProgramId, week: this.selectedWeek });
    this.renderRoutines();
  },

  toggleRoutineExpand(routineId) {
    if (this.expandedRoutineIds.has(routineId)) {
      this.expandedRoutineIds.delete(routineId);
    } else {
      this.expandedRoutineIds.add(routineId);
    }
    this.renderRoutines();
  },

  renderProgramAndWeekSelectors(allRoutines, completedRoutineIds) {
    const progBar = document.getElementById("program-selector-bar");
    const weekBar = document.getElementById("week-selector-bar");
    const subtitleEl = document.getElementById("routines-subtitle");

    if (progBar) {
      const b1Count = allRoutines.filter(r => r.programId === "prog_pdf_s1_s4").length;
      const b2Count = allRoutines.filter(r => r.programId === "prog_block2_s5_s8").length;
      const totalCount = allRoutines.length;

      progBar.innerHTML = `
        <button type="button" class="program-tab-btn ${this.selectedProgramId === 'prog_pdf_s1_s4' ? 'active' : ''}" onclick="App.selectProgram('prog_pdf_s1_s4')">
          <span>Sett 1–4</span>
          <span class="prog-sub">PDF • ${b1Count} schede</span>
        </button>
        <button type="button" class="program-tab-btn ${this.selectedProgramId === 'prog_block2_s5_s8' ? 'active' : ''}" onclick="App.selectProgram('prog_block2_s5_s8')">
          <span>Sett 5–8</span>
          <span class="prog-sub">Log • ${b2Count} schede</span>
        </button>
        <button type="button" class="program-tab-btn ${this.selectedProgramId === 'all' ? 'active' : ''}" onclick="App.selectProgram('all')">
          <span>Tutte</span>
          <span class="prog-sub">${totalCount} schede</span>
        </button>
      `;
    }

    if (subtitleEl) {
      if (this.selectedProgramId === "prog_pdf_s1_s4") {
        subtitleEl.textContent = "Programma PDF • Ramping, Accumulo & Tecniche Speciali";
      } else if (this.selectedProgramId === "prog_block2_s5_s8") {
        subtitleEl.textContent = "Blocco Precedente • Carichi, Log reali & Note";
      } else {
        subtitleEl.textContent = "Tutte le settimane e schede personalizzate";
      }
    }

    if (weekBar) {
      let weeksToShow = [];
      if (this.selectedProgramId === "prog_pdf_s1_s4") {
        weeksToShow = [1, 2, 3, 4];
      } else if (this.selectedProgramId === "prog_block2_s5_s8") {
        weeksToShow = [5, 6, 7, 8];
      } else {
        const weekSet = new Set();
        allRoutines.forEach(r => { if (r.week) weekSet.add(Number(r.week)); });
        weeksToShow = Array.from(weekSet).sort((a, b) => a - b);
      }

      const pillsHtml = weeksToShow.map(w => {
        const weekRoutines = allRoutines.filter(r =>
          Number(r.week) === w &&
          (this.selectedProgramId === "all" || r.programId === this.selectedProgramId)
        );
        const doneCount = weekRoutines.filter(r => completedRoutineIds.has(r.id)).length;
        const isActive = this.selectedWeek === w;
        return `
          <button type="button" class="week-pill ${isActive ? 'active' : ''}" onclick="App.selectWeek(${w})">
            <span>Sett ${w}</span>
            ${doneCount > 0 ? `<span class="week-pill-dot" title="${doneCount} sessioni loggate"></span>` : ""}
          </button>
        `;
      }).join("");

      const allPill = `
        <button type="button" class="week-pill ${this.selectedWeek === 'all' ? 'active' : ''}" onclick="App.selectWeek('all')">
          Tutte
        </button>
      `;

      weekBar.innerHTML = pillsHtml + allPill;
    }
  },

  formatExerciseSummary(ex) {
    const sets = ex.sets || [];
    const setsCount = sets.length;
    if (setsCount === 0) return "0 serie";
    const first = sets[0];
    const allSameWeight = sets.every(s => Number(s.weight) === Number(first.weight));
    const allSameReps = sets.every(s => Number(s.reps) === Number(first.reps));

    if (allSameWeight && allSameReps) {
      const wStr = Number(first.weight) > 0 ? ` · ${first.weight}kg` : "";
      const tagStr = first.tag && first.tag.includes("sec") ? ` (${first.tag})` : "";
      return `${setsCount}×${first.reps}${wStr}${tagStr}`;
    }
    const maxW = Math.max(...sets.map(s => Number(s.weight) || 0));
    const wStr = maxW > 0 ? ` · max ${maxW}kg` : "";
    return `${setsCount} serie${wStr}`;
  },

  renderRoutines() {
    const container = document.getElementById("routines-list-container");
    if (!container) return;

    const allRoutines = Store.getRoutines();
    const completedIds = Store.getCompletedRoutineIds();

    this.renderProgramAndWeekSelectors(allRoutines, completedIds);

    const filtered = allRoutines
      .filter(r => {
        if (this.selectedProgramId !== "all" && r.programId !== this.selectedProgramId) {
          return false;
        }
        if (this.selectedWeek !== "all" && Number(r.week) !== Number(this.selectedWeek)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const wa = Number(a.week) || 99;
        const wb = Number(b.week) || 99;
        if (wa !== wb) return wa - wb;
        return (Number(a.dayNumber) || 99) - (Number(b.dayNumber) || 99);
      });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="card text-center" style="padding: 30px 16px;">
          <p style="color: var(--text-secondary); margin-bottom: 12px;">Nessuna scheda trovata per questa settimana.</p>
          <button class="btn btn-primary btn-sm" onclick="App.openRoutineEditor()">Crea una nuova scheda</button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(r => {
      const exercises = r.exercises || [];
      const exerciseCount = exercises.length;
      const isExpanded = this.expandedRoutineIds.has(r.id);
      const completedSession = r.week ? Store.getCompletedSessionForRoutine(r) : null;
      const isLogged = !!completedSession || completedIds.has(r.id);
      const isWeeklyCompleted = !!(r.week && completedSession);
      const listToRender = isExpanded ? exercises : exercises.slice(0, 4);

      const previewExercises = listToRender.map(ex => {
        const mGroup = ex.muscleGroup || detectMuscleGroup(ex.name);
        const summary = this.formatExerciseSummary(ex);
        const ssBadge = ex.superset ? `<span class="superset-badge">🔗 ${this.escapeHtml(ex.superset)}</span>` : "";

        if (isExpanded) {
          const setsDetail = (ex.sets || []).map(s => {
            const w = Number(s.weight) > 0 ? `${s.weight}kg×` : "";
            const t = s.tag ? ` [${s.tag}]` : "";
            return `${w}${s.reps}${t}`;
          }).join(" • ");

          return `
            <div class="preview-item-expanded">
              <div class="preview-item" style="margin: 0;">
                <div style="display: flex; align-items: center; gap: 6px; min-width: 0; flex: 1; flex-wrap: wrap;">
                  <span class="anatomy-thumb-btn" style="cursor: pointer;" onclick="event.stopPropagation(); Anatomy.openModal('${this.escapeHtml(ex.name)}', '${mGroup}')" title="Visualizza anatomia">
                    ${Anatomy.getSvg(mGroup, 24, 30, ex.name)}
                  </span>
                  <strong style="color: var(--text-primary); font-size: 0.83rem;">${this.escapeHtml(ex.name)}</strong>
                  ${ssBadge}
                </div>
                <span class="preview-sets" style="margin-left: 6px; white-space: nowrap;">${summary}</span>
              </div>
              <div class="preview-note-line" style="font-family: var(--font-mono); color: #93c5fd; font-size: 0.71rem;">${this.escapeHtml(setsDetail)} • Rec ${ex.restSeconds || 90}"</div>
              ${ex.notes ? `<div class="preview-note-line">${this.escapeHtml(ex.notes)}</div>` : ""}
            </div>
          `;
        }

        return `
          <div class="preview-item">
            <div style="display: flex; align-items: center; gap: 6px; min-width: 0; flex: 1;">
              <span class="anatomy-thumb-btn" style="cursor: pointer;" onclick="event.stopPropagation(); Anatomy.openModal('${this.escapeHtml(ex.name)}', '${mGroup}')" title="Visualizza anatomia">
                ${Anatomy.getSvg(mGroup, 24, 30, ex.name)}
              </span>
              <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${this.escapeHtml(ex.name)}</span>
              ${ssBadge}
            </div>
            <span class="preview-sets" style="margin-left: 6px; white-space: nowrap;">${summary}</span>
          </div>
        `;
      }).join("");

      const weekBadge = r.week
        ? `<span class="routine-week-badge">Sett ${r.week}${r.dayNumber ? ` • Giorno ${r.dayNumber}` : ""}</span>`
        : `<span class="routine-week-badge">Scheda Personale</span>`;
      const doneBadge = isWeeklyCompleted
        ? `<span class="routine-done-badge">✓ Completato${completedSession.totalVolumeKg ? ` · ${Math.round(completedSession.totalVolumeKg).toLocaleString("it-IT")} kg` : ""}</span>`
        : (isLogged ? `<span class="routine-done-badge">✓ Loggato</span>` : "");

      const isDemo = typeof IS_DEMO_MODE !== "undefined" && IS_DEMO_MODE;
      const actionsHtml = isWeeklyCompleted
        ? (isDemo
            ? `<div class="routine-completed-pill">✓ Allenamento già completato</div>`
            : `<button class="btn btn-secondary btn-edit-completed" onclick="App.openHistoryEditor('${completedSession.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Modifica Risultati Salvati
              </button>`)
        : `<button class="btn btn-primary" onclick="App.startWorkoutFromRoutine('${r.id}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Avvia Allenamento
          </button>`;

      return `
        <div class="routine-card ${isWeeklyCompleted ? 'is-completed' : ''}" data-id="${r.id}">
          <div class="routine-header">
            <div style="min-width: 0; flex: 1;">
              <div class="routine-badges-row">${weekBadge}${doneBadge}</div>
              <h2 class="routine-title">${this.escapeHtml(r.name)}</h2>
              <div class="routine-meta">${exerciseCount} esercizi</div>
            </div>
            <div style="display: flex; gap: 2px; flex-shrink: 0;">
              <button class="icon-btn" onclick="App.duplicateRoutine('${r.id}')" title="Duplica Scheda">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
              <button class="icon-btn" onclick="App.openRoutineEditor('${r.id}')" title="Modifica Scheda">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="icon-btn" onclick="App.deleteRoutine('${r.id}')" title="Elimina Scheda" style="color: var(--accent-red);">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
          ${r.description ? `<p class="routine-desc">${this.escapeHtml(r.description)}</p>` : ""}
          <div class="routine-exercise-preview">
            ${previewExercises}
            <button type="button" class="btn-toggle-expand" onclick="App.toggleRoutineExpand('${r.id}')">
              ${isExpanded ? "▲ Riduci dettagli" : `▼ Mostra tutti i ${exerciseCount} esercizi e note`}
            </button>
          </div>
          <div class="routine-actions">
            ${actionsHtml}
          </div>
        </div>
      `;
    }).join("");
  },

  openRoutineEditor(routineId = null) {
    if (typeof IS_DEMO_MODE !== "undefined" && IS_DEMO_MODE) {
      this.showToast("🔒 Modalità Demo (sola lettura): modifica schede disabilitata.");
      return;
    }
    const modal = document.getElementById("modal-routine-editor");
    const titleEl = document.getElementById("routine-editor-title");
    const idEl = document.getElementById("edit-routine-id");
    const nameEl = document.getElementById("edit-routine-name");
    const descEl = document.getElementById("edit-routine-desc");
    const progEl = document.getElementById("edit-routine-program");
    const weekEl = document.getElementById("edit-routine-week");

    if (routineId) {
      const routine = Store.getRoutineById(routineId);
      if (!routine) return;
      titleEl.textContent = "Modifica Scheda";
      idEl.value = routine.id;
      nameEl.value = routine.name;
      descEl.value = routine.description || "";
      if (progEl) progEl.value = routine.programId || "custom";
      if (weekEl) weekEl.value = routine.week ? String(routine.week) : "";
      this.currentEditorExercises = JSON.parse(JSON.stringify(routine.exercises || []));
    } else {
      titleEl.textContent = "Nuova Scheda";
      idEl.value = "";
      nameEl.value = "";
      descEl.value = "";
      if (progEl) progEl.value = this.selectedProgramId !== "all" ? this.selectedProgramId : "prog_pdf_s1_s4";
      if (weekEl) weekEl.value = this.selectedWeek !== "all" ? String(this.selectedWeek) : "1";
      this.currentEditorExercises = [];
    }

    this.renderEditorExercises();
    modal.classList.add("open");
  },

  renderEditorExercises() {
    const container = document.getElementById("editor-exercises-list");
    if (!container) return;

    if (!this.currentEditorExercises || this.currentEditorExercises.length === 0) {
      container.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 16px;">Nessun esercizio aggiunto. Clicca "+ Aggiungi Esercizio".</p>`;
      return;
    }

    container.innerHTML = this.currentEditorExercises.map((ex, exIdx) => {
      const mGroup = ex.muscleGroup || detectMuscleGroup(ex.name);
      const setsHtml = (ex.sets || []).map((s, sIdx) => `
        <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); width: 22px;">S${sIdx + 1}</span>
          <input type="number" class="input-stepper" style="height: 32px; width: 64px;" value="${s.weight}" step="0.25" placeholder="kg" onchange="App.updateEditorSet(${exIdx}, ${sIdx}, 'weight', this.value)">
          <span style="font-size: 0.75rem; color: var(--text-muted);">×</span>
          <input type="number" class="input-stepper" style="height: 32px; width: 52px;" value="${s.reps}" step="1" placeholder="rep" onchange="App.updateEditorSet(${exIdx}, ${sIdx}, 'reps', this.value)">
          <input type="text" class="form-input" style="height: 32px; padding: 4px 6px; font-size: 0.75rem; flex: 1;" value="${this.escapeHtml(s.tag || '')}" placeholder="tag (RIR/RPE)" onchange="App.updateEditorSet(${exIdx}, ${sIdx}, 'tag', this.value)">
          <button type="button" class="icon-btn" style="width: 28px; height: 28px; color: var(--accent-red);" onclick="App.removeEditorSet(${exIdx}, ${sIdx})">✕</button>
        </div>
      `).join("");

      return `
        <div class="card" style="margin-bottom: 12px; padding: 12px; background-color: var(--bg-card);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1;">
              <button type="button" class="anatomy-thumb-btn" onclick="Anatomy.openModal('${this.escapeHtml(ex.name)}', '${mGroup}')" title="Visualizza muscoli bersaglio">
                ${Anatomy.getSvg(mGroup, 30, 36, ex.name)}
              </button>
              <div style="min-width: 0;">
                <strong style="font-size: 0.92rem; display: block;">${this.escapeHtml(ex.name)}</strong>
                <div style="font-size: 0.72rem; color: var(--accent-blue); font-weight: 600;">${mGroup}</div>
              </div>
            </div>
            <div style="display: flex; gap: 2px; flex-shrink: 0;">
              <button type="button" class="icon-btn" style="width: 30px; height: 30px;" onclick="App.moveEditorExercise(${exIdx}, -1)" title="Sposta su">↑</button>
              <button type="button" class="icon-btn" style="width: 30px; height: 30px;" onclick="App.moveEditorExercise(${exIdx}, 1)" title="Sposta giù">↓</button>
              <button type="button" class="icon-btn" style="width: 30px; height: 30px; color: var(--accent-red);" onclick="App.removeEditorExercise(${exIdx})" title="Rimuovi">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 8px; margin-bottom: 8px;">
            <div>
              <label class="form-label" style="font-size: 0.72rem;">Recupero (secondi)</label>
              <input type="number" class="form-input" style="padding: 6px 8px; font-size: 0.85rem;" value="${ex.restSeconds || 90}" step="5" min="10" onchange="App.updateEditorExerciseRest(${exIdx}, this.value)">
            </div>
            <div>
              <label class="form-label" style="font-size: 0.72rem;">Superserie (opzionale)</label>
              <input type="text" class="form-input" style="padding: 6px 8px; font-size: 0.85rem;" value="${this.escapeHtml(ex.superset || '')}" placeholder="es. SS Schiena (A)" onchange="App.updateEditorExerciseSuperset(${exIdx}, this.value)">
            </div>
          </div>

          <div style="margin-bottom: 10px;">
            <label class="form-label" style="font-size: 0.72rem;">Note esecuzione / progressione</label>
            <textarea class="form-textarea" rows="2" style="padding: 6px 8px; font-size: 0.8rem;" placeholder="Note tecniche, RIR, TUT, fermo..." onchange="App.updateEditorExerciseNotes(${exIdx}, this.value)">${this.escapeHtml(ex.notes || '')}</textarea>
          </div>

          <label class="form-label" style="font-size: 0.72rem; margin-bottom: 4px;">Serie Programmate</label>
          ${setsHtml}

          <button type="button" class="btn-add-set" onclick="App.addEditorSet(${exIdx})">
            + Aggiungi Serie
          </button>
        </div>
      `;
    }).join("");
  },

  moveEditorExercise(exIdx, delta) {
    const newIdx = exIdx + delta;
    if (newIdx < 0 || newIdx >= this.currentEditorExercises.length) return;
    const [moved] = this.currentEditorExercises.splice(exIdx, 1);
    this.currentEditorExercises.splice(newIdx, 0, moved);
    this.renderEditorExercises();
  },

  updateEditorExerciseRest(exIdx, val) {
    if (this.currentEditorExercises[exIdx]) {
      this.currentEditorExercises[exIdx].restSeconds = Math.max(10, parseInt(val, 10) || 90);
    }
  },

  updateEditorExerciseSuperset(exIdx, val) {
    if (this.currentEditorExercises[exIdx]) {
      this.currentEditorExercises[exIdx].superset = val.trim();
    }
  },

  updateEditorExerciseNotes(exIdx, val) {
    if (this.currentEditorExercises[exIdx]) {
      this.currentEditorExercises[exIdx].notes = val;
    }
  },

  updateEditorSet(exIdx, sIdx, field, val) {
    if (this.currentEditorExercises[exIdx] && this.currentEditorExercises[exIdx].sets[sIdx]) {
      if (field === "tag") {
        this.currentEditorExercises[exIdx].sets[sIdx].tag = val.trim();
      } else {
        this.currentEditorExercises[exIdx].sets[sIdx][field] = Number(val) || 0;
      }
    }
  },

  addEditorSet(exIdx) {
    if (this.currentEditorExercises[exIdx]) {
      const sets = this.currentEditorExercises[exIdx].sets;
      const last = sets[sets.length - 1] || { weight: 50, reps: 10 };
      sets.push({ weight: last.weight, reps: last.reps, ...(last.tag ? { tag: last.tag } : {}) });
      this.renderEditorExercises();
    }
  },

  removeEditorSet(exIdx, sIdx) {
    if (this.currentEditorExercises[exIdx]) {
      this.currentEditorExercises[exIdx].sets.splice(sIdx, 1);
      this.renderEditorExercises();
    }
  },

  removeEditorExercise(exIdx) {
    this.currentEditorExercises.splice(exIdx, 1);
    this.renderEditorExercises();
  },

  saveRoutineFromEditor() {
    const id = document.getElementById("edit-routine-id").value;
    const name = document.getElementById("edit-routine-name").value.trim();
    const desc = document.getElementById("edit-routine-desc").value.trim();
    const progEl = document.getElementById("edit-routine-program");
    const weekEl = document.getElementById("edit-routine-week");

    if (!name) {
      this.showToast("Inserisci un nome per la scheda.");
      return;
    }

    const existing = id ? Store.getRoutineById(id) : null;
    const programId = progEl ? progEl.value : "custom";
    const weekVal = weekEl && weekEl.value ? parseInt(weekEl.value, 10) : null;

    const routine = {
      id: id || "routine_" + Date.now(),
      programId,
      week: weekVal,
      dayNumber: existing ? existing.dayNumber : null,
      name,
      description: desc,
      updatedAt: new Date().toISOString(),
      exercises: this.currentEditorExercises || []
    };

    Store.saveRoutine(routine);
    this.closeModal("modal-routine-editor");
    this.renderRoutines();
    ChartsManager.populateSelectors();
    this.showToast(`Scheda "${name}" salvata con successo!`);
  },

  duplicateRoutine(id) {
    if (typeof IS_DEMO_MODE !== "undefined" && IS_DEMO_MODE) {
      this.showToast("🔒 Modalità Demo (sola lettura).");
      return;
    }
    const copy = Store.duplicateRoutine(id);
    if (copy) {
      this.renderRoutines();
      ChartsManager.populateSelectors();
      this.showToast(`Scheda duplicata: ${copy.name}`);
    }
  },

  deleteRoutine(id) {
    if (typeof IS_DEMO_MODE !== "undefined" && IS_DEMO_MODE) {
      this.showToast("🔒 Modalità Demo (sola lettura).");
      return;
    }
    const routine = Store.getRoutineById(id);
    if (!routine) return;
    if (confirm(`Sei sicuro di voler eliminare la scheda "${routine.name}"?`)) {
      Store.deleteRoutine(id);
      this.renderRoutines();
      ChartsManager.populateSelectors();
      this.showToast(`Scheda eliminata.`);
    }
  },

  // ================= 3. ESECUZIONE ALLENAMENTO ATTIVO =================
  startWorkoutFromRoutine(routineId) {
    const routine = Store.getRoutineById(routineId);
    if (!routine) return;

    // Gli allenamenti di una settimana specifica si fanno una volta sola: se già fatti, apri modifica risultati
    if (routine.week) {
      const existingSession = Store.getCompletedSessionForRoutine(routine);
      if (existingSession) {
        if (typeof IS_DEMO_MODE !== "undefined" && IS_DEMO_MODE) {
          this.showToast("✓ Allenamento già completato (Modalità Demo in sola lettura).");
          return;
        }
        this.openHistoryEditor(existingSession.id);
        this.showToast("✓ Già completato! Puoi modificare qui carichi, rep o note.");
        return;
      }
    }

    if (this.activeWorkout) {
      if (!confirm("C'è già un allenamento in corso. Vuoi abbandonarlo per avviare questo?")) {
        this.switchView("view-active");
        return;
      }
    }

    const displayName = routine.week ? `Sett ${routine.week} • ${routine.name}` : routine.name;

    this.activeWorkout = {
      id: "workout_" + Date.now(),
      routineId: routine.id,
      routineName: displayName,
      week: routine.week || null,
      dayNumber: routine.dayNumber || null,
      startTime: Date.now(),
      exercises: (routine.exercises || []).map(ex => ({
        name: ex.name,
        muscleGroup: ex.muscleGroup || detectMuscleGroup(ex.name),
        superset: ex.superset || "",
        notes: ex.notes || "",
        quickTags: [],
        restSeconds: ex.restSeconds || 90,
        sets: (ex.sets || []).map((s, idx) => ({
          setNumber: idx + 1,
          weight: s.weight,
          reps: s.reps,
          tag: s.tag || "",
          completed: false
        }))
      }))
    };

    Store.saveActiveWorkout(this.activeWorkout);
    this.startWorkoutTimer();
    this.updateActiveNavBadge();
    this.switchView("view-active");
    this.showToast(`Iniziato: ${displayName}`);
  },

  startQuickWorkout() {
    this.activeWorkout = {
      id: "workout_" + Date.now(),
      routineId: null,
      routineName: "Sessione Libera",
      week: null,
      dayNumber: null,
      startTime: Date.now(),
      exercises: []
    };
    Store.saveActiveWorkout(this.activeWorkout);
    this.startWorkoutTimer();
    this.updateActiveNavBadge();
    this.switchView("view-active");
    this.openExercisePicker("active_workout");
  },

  resumeActiveWorkout() {
    this.startWorkoutTimer();
    this.updateActiveNavBadge();
    if (this.currentView === "view-active") {
      this.renderActiveWorkout();
    }
  },

  startWorkoutTimer() {
    if (this.workoutTimerInterval) clearInterval(this.workoutTimerInterval);
    this.updateElapsedDisplay();
    this.workoutTimerInterval = setInterval(() => this.updateElapsedDisplay(), 1000);
  },

  updateElapsedDisplay() {
    if (!this.activeWorkout || !this.activeWorkout.startTime) return;
    const diffSec = Math.floor((Date.now() - this.activeWorkout.startTime) / 1000);
    const hrs = Math.floor(diffSec / 3600);
    const mins = Math.floor((diffSec % 3600) / 60);
    const secs = diffSec % 60;

    const formatted = hrs > 0
      ? `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`
      : `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

    const timerEl = document.getElementById("active-elapsed-time");
    if (timerEl) timerEl.textContent = formatted;
  },

  generatePRBadgesHtml(exerciseName, sets = [], exIdx = null) {
    const prs = Store.checkExercisePRs(exerciseName, sets);
    let badges = [];

    if (prs.isMaxWeightPR) {
      badges.push(`
        <span class="pr-badge pr-badge-weight" onclick="App.showPRToast('weight', '${this.escapeHtml(exerciseName)}', ${prs.currentMaxWeight}, ${prs.prevMaxWeight})" title="Record Carico Max: ${prs.currentMaxWeight} kg (Precedente: ${prs.prevMaxWeight} kg)">
          💪 <span class="pr-badge-text">PR ${prs.currentMaxWeight}kg</span>
        </span>
      `);
    }

    if (prs.isMaxVolumePR) {
      badges.push(`
        <span class="pr-badge pr-badge-volume" onclick="App.showPRToast('volume', '${this.escapeHtml(exerciseName)}', ${prs.currentMaxVolume}, ${prs.prevMaxVolume})" title="Record Miglior Serie: ${prs.currentMaxVolume} kg (Precedente: ${prs.prevMaxVolume} kg)">
          🏅 <span class="pr-badge-text">Record ${prs.currentMaxVolume}kg</span>
        </span>
      `);
    }

    const idAttr = exIdx !== null ? `id="pr-badges-wrap-${exIdx}"` : "";
    return `<div class="pr-badges-wrap" ${idAttr}>${badges.join("")}</div>`;
  },

  showPRToast(type, exerciseName, current, prev) {
    if (type === "weight") {
      this.showToast(`💪 RECORD CARICO MAX su ${exerciseName}: ${current} kg! (Precedente: ${prev} kg)`);
    } else {
      this.showToast(`🏅 RECORD MIGLIOR SERIE su ${exerciseName}: ${current} kg! (Precedente: ${prev} kg)`);
    }
  },

  renderActiveWorkout() {
    const emptyState = document.getElementById("active-empty-state");
    const container = document.getElementById("active-workout-container");
    const nameEl = document.getElementById("active-routine-name");
    const statsEl = document.getElementById("active-summary-stats");
    const listEl = document.getElementById("active-exercises-list");

    if (!this.activeWorkout) {
      if (emptyState) emptyState.style.display = "block";
      if (container) container.style.display = "none";
      return;
    }

    if (emptyState) emptyState.style.display = "none";
    if (container) container.style.display = "block";

    if (nameEl) nameEl.textContent = this.activeWorkout.routineName || "Allenamento";

    let totalCompletedSets = 0;
    let totalAllSets = 0;
    let totalVolume = 0;

    (this.activeWorkout.exercises || []).forEach(ex => {
      (ex.sets || []).forEach(s => {
        totalAllSets++;
        if (s.completed) {
          totalCompletedSets++;
          totalVolume += (Number(s.weight) || 0) * (Number(s.reps) || 0);
        }
      });
    });

    if (statsEl) {
      statsEl.textContent = `${totalCompletedSets}/${totalAllSets} serie • ${Math.round(totalVolume).toLocaleString("it-IT")} kg`;
    }

    if (!listEl) return;
    if (this.activeWorkout.exercises.length === 0) {
      listEl.innerHTML = `
        <div class="card text-center" style="padding: 24px;">
          <p style="color: var(--text-secondary); margin-bottom: 10px;">Nessun esercizio aggiunto a questo allenamento.</p>
          <button class="btn btn-primary btn-sm" onclick="App.openExercisePicker('active_workout')">+ Aggiungi Esercizio</button>
        </div>
      `;
      return;
    }

    listEl.innerHTML = this.activeWorkout.exercises.map((ex, exIdx) => {
      const lastSessionInfo = Store.getLastSessionForExercise(ex.name);
      const lastSetsText = (lastSessionInfo && lastSessionInfo.exercise && lastSessionInfo.exercise.sets)
        ? lastSessionInfo.exercise.sets.filter(s => s.completed)
        : [];

      const suggestion = Store.getProgressiveOverloadSuggestion(ex.name, ex.sets);
      const mGroup = ex.muscleGroup || detectMuscleGroup(ex.name);
      const prBadgesHtml = this.generatePRBadgesHtml(ex.name, ex.sets, exIdx);
      const isSuperset = !!ex.superset;

      const setsRows = (ex.sets || []).map((s, sIdx) => {
        const prevSet = lastSetsText[sIdx];
        const prevLabel = prevSet ? `${prevSet.weight}kg × ${prevSet.reps}` : (s.tag ? s.tag : "-");
        const tagHtml = s.tag && prevSet ? `<span class="set-tag-pill">${this.escapeHtml(s.tag)}</span>` : "";

        return `
          <div class="set-row ${s.completed ? 'completed' : ''}" id="row-${exIdx}-${sIdx}">
            <div class="set-num-col">
              <div class="set-num-badge">${s.setNumber || sIdx + 1}</div>
            </div>
            <div class="set-prev-info" title="${prevSet ? 'Ultima sessione' : 'Target serie'}">
              <div>${this.escapeHtml(prevLabel)}</div>
              ${tagHtml}
            </div>
            <div>
              <input type="number" inputmode="decimal" class="input-stepper" 
                value="${s.weight}" step="0.25" 
                onchange="App.handleSetInputChange(${exIdx}, ${sIdx}, 'weight', this.value)"
                aria-label="Carico kg">
            </div>
            <div>
              <input type="number" inputmode="numeric" class="input-stepper" 
                value="${s.reps}" step="1" 
                onchange="App.handleSetInputChange(${exIdx}, ${sIdx}, 'reps', this.value)"
                aria-label="Ripetizioni">
            </div>
            <div>
              <button type="button" class="btn-set-check" 
                onclick="App.toggleSetCompletion(${exIdx}, ${sIdx})" 
                aria-label="Segna serie completata">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
            </div>
          </div>
        `;
      }).join("");

      const noteRows = Math.min(6, Math.max(2, (ex.notes || "").split("\n").length));
      const activeQuickTags = Array.isArray(ex.quickTags) ? ex.quickTags : [];
      const topWeight = this.getExerciseTopWeight(ex);
      const isBackoffOpen = this.expandedBackoffIdx.has(exIdx);
      const quickTagsHtml = this.QUICK_TAGS.map(t => {
        const isSelected = activeQuickTags.includes(t.label);
        return `
          <button type="button" class="quick-tag-chip tag-${t.type} ${isSelected ? 'active' : ''}"
            onclick="App.toggleQuickTag(${exIdx}, '${t.label}')">
            <span>${t.emoji}</span><span>${t.short}</span>
          </button>
        `;
      }).join("");

      const backoff10 = this.roundToPlate(topWeight * 0.9);
      const backoff20kg = Math.max(0, Math.round((topWeight - 20) * 4) / 4);
      const backoffPiram2 = this.roundToPlate(backoff10 * 0.9);
      const backoffSst1 = this.roundToPlate(topWeight * 0.8);
      const backoffSst2 = this.roundToPlate(backoffSst1 * 0.8);
      const platesTop = this.formatPlatesPerSide(topWeight);
      const platesBack10 = this.formatPlatesPerSide(backoff10);

      const backoffPanelHtml = isBackoffOpen ? `
        <div class="backoff-calc-panel">
          <div class="backoff-calc-head">
            <span>🧮 Calcolatore Back-off (Top Set: <strong>${topWeight} kg</strong>)</span>
            <button type="button" class="backoff-close-btn" onclick="App.toggleBackoffCalc(${exIdx})">✕</button>
          </div>
          ${topWeight > 0 ? `
            <div class="backoff-btns-grid">
              <button type="button" class="backoff-action-btn" onclick="App.applyBackoff(${exIdx}, 'pct10')">
                <strong>-10%</strong>
                <span>${backoff10} kg (S2–S${(ex.sets || []).length})</span>
              </button>
              <button type="button" class="backoff-action-btn" onclick="App.applyBackoff(${exIdx}, 'piram10')">
                <strong>-10% Piram.</strong>
                <span>${backoff10} → ${backoffPiram2} kg</span>
              </button>
              <button type="button" class="backoff-action-btn" onclick="App.applyBackoff(${exIdx}, 'minus20')">
                <strong>-20 kg</strong>
                <span>${backoff20kg} kg (S2–S${(ex.sets || []).length})</span>
              </button>
              <button type="button" class="backoff-action-btn" onclick="App.applyBackoff(${exIdx}, 'sst20')">
                <strong>-20% SST</strong>
                <span>${backoffSst1} → ${backoffSst2} kg</span>
              </button>
            </div>
            <div class="plates-preview-box">
              <div><strong>Dischi/lato (bil. 20kg):</strong></div>
              <div>Top ${topWeight}kg: <span>${platesTop}</span></div>
              ${backoff10 > 0 ? `<div>Back-off -10% (${backoff10}kg): <span>${platesBack10}</span></div>` : ""}
            </div>
          ` : `<div style="font-size: 0.76rem; color: var(--text-muted);">Inserisci prima il peso nella Serie 1 (Top Set) per calcolare il back-off.</div>`}
        </div>
      ` : "";

      return `
        <div class="exercise-box ${isSuperset ? 'is-superset' : ''}" data-exercise-index="${exIdx}">
          <div class="exercise-header">
            <div class="exercise-main-header">
              <button type="button" class="anatomy-thumb-btn" onclick="Anatomy.openModal('${this.escapeHtml(ex.name)}', '${mGroup}')" title="Tocca per ingrandire l'illustrazione anatomica">
                ${Anatomy.getSvg(mGroup, 38, 46, ex.name)}
              </button>
              
              <div class="exercise-header-details">
                <div class="exercise-title-line">
                  <h3 class="exercise-title">${this.escapeHtml(ex.name)}</h3>
                  <button class="icon-btn" style="color: var(--text-muted); width: 32px; height: 32px;" onclick="App.removeExerciseFromActive(${exIdx})" title="Rimuovi Esercizio">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
                
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 2px;">
                  <span class="exercise-category-pill">${mGroup}</span>
                  ${isSuperset ? `<span class="superset-badge">🔗 ${this.escapeHtml(ex.superset)}</span>` : ""}
                  <span style="font-size: 0.75rem; color: var(--text-muted);">
                    Rec: <strong style="color: var(--accent-blue); cursor: pointer;" onclick="App.editExerciseRest(${exIdx})">${ex.restSeconds || 90}s</strong>
                  </span>
                  <button type="button" class="backoff-toggle-pill ${isBackoffOpen ? 'active' : ''}" onclick="App.toggleBackoffCalc(${exIdx})">
                    🧮 Back-off
                  </button>
                </div>

                <div id="pr-slot-${exIdx}">${prBadgesHtml}</div>
              </div>
            </div>
          </div>

          ${backoffPanelHtml}

          <!-- Tag Rapidi Dolore & Stanchezza -->
          <div class="quick-tags-scroll" aria-label="Tag rapidi dolore e stanchezza">
            ${quickTagsHtml}
          </div>

          <textarea class="exercise-notes-textarea" rows="${noteRows}"
            placeholder="Aggiungi note (es. sensazioni, dolori, RPE, Bibione...)"
            onchange="App.updateActiveExerciseNotes(${exIdx}, this.value)">${this.escapeHtml(ex.notes || '')}</textarea>

          ${suggestion ? `
            <div class="exercise-suggestion-banner" onclick="App.applyOverloadSuggestion(${exIdx}, '${suggestion.type}', ${suggestion.value})">
              <span class="badge-progression">⚡ ${suggestion.text}</span>
              <span style="font-size: 0.72rem; color: var(--text-secondary); margin-left: 6px;">Tocca per applicare</span>
            </div>
          ` : ""}

          <div class="sets-grid-header">
            <div>SET</div>
            <div style="text-align: left; padding-left: 4px;">PREC / TARGET</div>
            <div>KG</div>
            <div>REPS</div>
            <div>✓</div>
          </div>

          ${setsRows}

          <button type="button" class="btn-add-set" onclick="App.addSetToActiveExercise(${exIdx})">
            + Aggiungi Serie
          </button>
        </div>
      `;
    }).join("");
  },

  handleSetInputChange(exIdx, sIdx, field, val) {
    if (!this.activeWorkout || !this.activeWorkout.exercises[exIdx]) return;
    const ex = this.activeWorkout.exercises[exIdx];
    const set = ex.sets[sIdx];
    if (set) {
      set[field] = Number(val) || 0;
      Store.saveActiveWorkout(this.activeWorkout);
      this.updateActiveHeaderStats();
      this.updateExercisePRsRealtime(exIdx);
      if (field === "weight" && this.expandedBackoffIdx.has(exIdx)) {
        this.renderActiveWorkout();
      }
    }
  },

  // --- CALCOLATORE BACK-OFF & DISCHI BILANCIERE + TAG RAPIDI ---
  getExerciseTopWeight(ex) {
    if (!ex || !ex.sets || ex.sets.length === 0) return 0;
    const s1 = Number(ex.sets[0].weight) || 0;
    if (s1 > 0) return s1;
    return Math.max(...ex.sets.map(s => Number(s.weight) || 0));
  },

  roundToPlate(kg, step = 2.5) {
    if (!kg || kg <= 0) return 0;
    return Math.max(0, Math.round(kg / step) * step);
  },

  formatPlatesPerSide(totalKg, barKg = 20) {
    const w = Number(totalKg) || 0;
    if (w <= barKg) return w > 0 ? `Solo bilanciere / manubri (${w} kg)` : "-";
    let perSide = Math.round(((w - barKg) / 2) * 100) / 100;
    const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const used = [];
    for (const p of plates) {
      while (perSide >= p - 0.001) {
        used.push(p);
        perSide = Math.round((perSide - p) * 100) / 100;
      }
    }
    if (used.length === 0) return `${((w - barKg) / 2).toFixed(2)} kg/lato`;
    const remStr = perSide > 0.01 ? ` (+${perSide}kg)` : "";
    return `${used.join(" + ")} kg/lato${remStr}`;
  },

  toggleBackoffCalc(exIdx) {
    if (this.expandedBackoffIdx.has(exIdx)) {
      this.expandedBackoffIdx.delete(exIdx);
    } else {
      this.expandedBackoffIdx.add(exIdx);
    }
    this.renderActiveWorkout();
  },

  applyBackoff(exIdx, mode) {
    if (!this.activeWorkout || !this.activeWorkout.exercises[exIdx]) return;
    const ex = this.activeWorkout.exercises[exIdx];
    const sets = ex.sets || [];
    if (sets.length < 2) {
      this.showToast("Aggiungi almeno 2 serie per applicare il back-off.");
      return;
    }

    const topW = this.getExerciseTopWeight(ex);
    if (topW <= 0) {
      this.showToast("Inserisci prima il carico nella Serie 1 (Top Set).");
      return;
    }

    let msg = "";
    if (mode === "pct10") {
      const target = this.roundToPlate(topW * 0.9);
      for (let i = 1; i < sets.length; i++) {
        if (!sets[i].completed) sets[i].weight = target;
      }
      msg = `⚡ Back-off -10% applicato: ${target} kg alle serie 2–${sets.length}`;
    } else if (mode === "piram10") {
      let cur = topW;
      const applied = [];
      for (let i = 1; i < sets.length; i++) {
        cur = this.roundToPlate(cur * 0.9);
        if (!sets[i].completed) sets[i].weight = cur;
        applied.push(`${cur}kg`);
      }
      msg = `⚡ Piramidale -10% applicato: ${applied.join(" → ")}`;
    } else if (mode === "minus20") {
      const target = Math.max(0, Math.round((topW - 20) * 4) / 4);
      for (let i = 1; i < sets.length; i++) {
        if (!sets[i].completed) sets[i].weight = target;
      }
      msg = `⚡ Back-off -20 kg applicato: ${target} kg alle serie 2–${sets.length}`;
    } else if (mode === "sst20") {
      const drop1 = this.roundToPlate(topW * 0.8);
      const drop2 = this.roundToPlate(drop1 * 0.8);
      for (let i = 1; i < sets.length; i++) {
        if (!sets[i].completed) sets[i].weight = i === 1 ? drop1 : drop2;
      }
      msg = `⚡ SST -20% applicato: S2 ${drop1} kg → S3+ ${drop2} kg`;
    }

    Store.saveActiveWorkout(this.activeWorkout);
    this.renderActiveWorkout();
    this.showToast(msg);
  },

  toggleQuickTag(exIdx, tagLabel) {
    if (!this.activeWorkout || !this.activeWorkout.exercises[exIdx]) return;
    const ex = this.activeWorkout.exercises[exIdx];
    ex.quickTags = Array.isArray(ex.quickTags) ? ex.quickTags : [];
    const idx = ex.quickTags.indexOf(tagLabel);
    if (idx >= 0) {
      ex.quickTags.splice(idx, 1);
    } else {
      ex.quickTags.push(tagLabel);
      if ("vibrate" in navigator) navigator.vibrate(15);
    }
    Store.saveActiveWorkout(this.activeWorkout);
    this.renderActiveWorkout();
  },

  updateExercisePRsRealtime(exIdx) {
    if (!this.activeWorkout || !this.activeWorkout.exercises[exIdx]) return;
    const ex = this.activeWorkout.exercises[exIdx];
    const slotEl = document.getElementById(`pr-slot-${exIdx}`);
    if (slotEl) {
      const prevBadgesCount = slotEl.querySelectorAll(".pr-badge").length;
      slotEl.innerHTML = this.generatePRBadgesHtml(ex.name, ex.sets, exIdx);
      const newBadgesCount = slotEl.querySelectorAll(".pr-badge").length;
      if (newBadgesCount > prevBadgesCount) {
        if ("vibrate" in navigator) navigator.vibrate([40, 60, 80]);
        this.showToast(`🔥 Nuovo Record Personale su ${ex.name}!`);
      }
    }
  },

  updateActiveExerciseNotes(exIdx, val) {
    if (this.activeWorkout && this.activeWorkout.exercises[exIdx]) {
      this.activeWorkout.exercises[exIdx].notes = val;
      Store.saveActiveWorkout(this.activeWorkout);
    }
  },

  editExerciseRest(exIdx) {
    const ex = this.activeWorkout.exercises[exIdx];
    if (!ex) return;
    const current = ex.restSeconds || 90;
    const res = prompt("Imposta tempo di recupero in secondi:", current);
    if (res !== null) {
      const parsed = Math.max(10, parseInt(res, 10) || 90);
      ex.restSeconds = parsed;
      Store.saveActiveWorkout(this.activeWorkout);
      this.renderActiveWorkout();
    }
  },

  toggleSetCompletion(exIdx, sIdx) {
    if (!this.activeWorkout || !this.activeWorkout.exercises[exIdx]) return;
    const ex = this.activeWorkout.exercises[exIdx];
    const set = ex.sets[sIdx];
    if (!set) return;

    set.completed = !set.completed;
    Store.saveActiveWorkout(this.activeWorkout);

    if ("vibrate" in navigator) navigator.vibrate(20);

    if (set.completed) {
      const restSec = ex.restSeconds || 90;
      RestTimer.start(restSec, ex.name);
      this.showToast(`Serie completata! Recupero: ${restSec}s`);
    }

    const rowEl = document.getElementById(`row-${exIdx}-${sIdx}`);
    if (rowEl) rowEl.classList.toggle("completed", set.completed);
    this.updateActiveHeaderStats();
    this.updateExercisePRsRealtime(exIdx);
  },

  updateActiveHeaderStats() {
    let totalCompleted = 0;
    let totalSets = 0;
    let totalVolume = 0;

    (this.activeWorkout.exercises || []).forEach(ex => {
      (ex.sets || []).forEach(s => {
        totalSets++;
        if (s.completed) {
          totalCompleted++;
          totalVolume += (Number(s.weight) || 0) * (Number(s.reps) || 0);
        }
      });
    });

    const statsEl = document.getElementById("active-summary-stats");
    if (statsEl) {
      statsEl.textContent = `${totalCompleted}/${totalSets} serie • ${Math.round(totalVolume).toLocaleString("it-IT")} kg`;
    }
  },

  applyOverloadSuggestion(exIdx, type, val) {
    if (!this.activeWorkout || !this.activeWorkout.exercises[exIdx]) return;
    const ex = this.activeWorkout.exercises[exIdx];
    if (!ex.sets) return;

    if (type === "weight") {
      ex.sets.forEach(s => { s.weight = (Number(s.weight) || 0) + val; });
      this.showToast(`Incrementato carico di +${val} kg su tutte le serie!`);
    } else {
      ex.sets.forEach(s => { s.reps = (Number(s.reps) || 0) + val; });
      this.showToast(`Aggiunta +${val} rep a ogni serie!`);
    }

    Store.saveActiveWorkout(this.activeWorkout);
    this.renderActiveWorkout();
  },

  addSetToActiveExercise(exIdx) {
    if (!this.activeWorkout || !this.activeWorkout.exercises[exIdx]) return;
    const sets = this.activeWorkout.exercises[exIdx].sets;
    const last = sets[sets.length - 1] || { weight: 50, reps: 10 };
    sets.push({
      setNumber: sets.length + 1,
      weight: last.weight,
      reps: last.reps,
      tag: last.tag || "",
      completed: false
    });
    Store.saveActiveWorkout(this.activeWorkout);
    this.renderActiveWorkout();
  },

  removeExerciseFromActive(exIdx) {
    if (!this.activeWorkout) return;
    const ex = this.activeWorkout.exercises[exIdx];
    if (confirm(`Rimuovere "${ex.name}" da questo allenamento?`)) {
      this.activeWorkout.exercises.splice(exIdx, 1);
      Store.saveActiveWorkout(this.activeWorkout);
      this.renderActiveWorkout();
    }
  },

  cancelActiveWorkout() {
    if (!this.activeWorkout) return;
    if (confirm("Sei sicuro di voler annullare e cancellare questo allenamento in corso?")) {
      if (this.workoutTimerInterval) clearInterval(this.workoutTimerInterval);
      RestTimer.stop();
      Store.clearActiveWorkout();
      this.activeWorkout = null;
      this.updateActiveNavBadge();
      this.renderActiveWorkout();
      this.showToast("Allenamento annullato.");
    }
  },

  finishActiveWorkout() {
    if (!this.activeWorkout) return;

    if (typeof IS_DEMO_MODE !== "undefined" && IS_DEMO_MODE) {
      this.showToast("🔒 Modalità Demo: nessun dato salvato. Nella versione completa si sincronizza live su Cloud e PDF!");
      return;
    }

    let completedSetsCount = 0;
    let totalVolume = 0;
    const exercisesData = [];

    (this.activeWorkout.exercises || []).forEach(ex => {
      const completedSets = (ex.sets || []).filter(s => s.completed);
      if (completedSets.length > 0) {
        completedSetsCount += completedSets.length;
        completedSets.forEach(s => {
          totalVolume += (Number(s.weight) || 0) * (Number(s.reps) || 0);
        });
      }
      exercisesData.push({
        name: ex.name,
        notes: ex.notes || "",
        quickTags: Array.isArray(ex.quickTags) ? [...ex.quickTags] : [],
        sets: (ex.sets || []).map(s => ({
          setNumber: s.setNumber,
          weight: Number(s.weight) || 0,
          reps: Number(s.reps) || 0,
          tag: s.tag || "",
          completed: !!s.completed
        }))
      });
    });

    if (completedSetsCount === 0) {
      if (!confirm("Non hai completato nessuna serie con la spunta. Vuoi terminare comunque?")) {
        return;
      }
    }

    const durationMin = Math.max(1, Math.round((Date.now() - this.activeWorkout.startTime) / 60000));

    const newPRs = [];
    exercisesData.forEach(ex => {
      const prs = Store.checkExercisePRs(ex.name, ex.sets);
      if (prs.isMaxWeightPR) {
        newPRs.push(`💪 ${ex.name}: Nuovo record di carico ${prs.currentMaxWeight} kg (prec: ${prs.prevMaxWeight} kg)!`);
      }
      if (prs.isMaxVolumePR) {
        newPRs.push(`🏅 ${ex.name}: Nuovo record serie ${prs.currentMaxVolume} kg (prec: ${prs.prevMaxVolume} kg)!`);
      }
    });

    const finishedSession = {
      id: this.activeWorkout.id,
      routineId: this.activeWorkout.routineId,
      routineName: this.activeWorkout.routineName || "Allenamento",
      week: this.activeWorkout.week || null,
      dayNumber: this.activeWorkout.dayNumber || null,
      date: new Date().toISOString(),
      durationMinutes: durationMin,
      totalVolumeKg: Math.round(totalVolume * 10) / 10,
      exercises: exercisesData
    };

    this.finishSummaryData = finishedSession;

    const nameEl = document.getElementById("summary-workout-name");
    const durEl = document.getElementById("summary-duration");
    const volEl = document.getElementById("summary-volume");
    const setsEl = document.getElementById("summary-sets");
    const prsEl = document.getElementById("summary-prs-container");

    if (nameEl) nameEl.textContent = finishedSession.routineName;
    if (durEl) durEl.textContent = `${durationMin} min`;
    if (volEl) volEl.textContent = `${Math.round(totalVolume).toLocaleString("it-IT")} kg`;
    if (setsEl) setsEl.textContent = completedSetsCount;

    if (prsEl) {
      prsEl.innerHTML = newPRs.length > 0
        ? newPRs.map(pr => `
            <div class="badge-progression" style="display: block; margin-bottom: 6px; padding: 8px 12px; font-size: 0.85rem; text-align: left;">
              ${this.escapeHtml(pr)}
            </div>
          `).join("")
        : "";
    }

    const modal = document.getElementById("modal-workout-summary");
    if (modal) modal.classList.add("open");
  },

  confirmSaveAndCloseSummary() {
    if (!this.finishSummaryData) return;

    const chkUpdate = document.getElementById("chk-update-routine-loads");
    const shouldUpdate = chkUpdate ? chkUpdate.checked : true;

    Store.saveWorkoutSession(this.finishSummaryData, shouldUpdate);

    if (this.workoutTimerInterval) clearInterval(this.workoutTimerInterval);
    RestTimer.stop();
    Store.clearActiveWorkout();
    this.activeWorkout = null;
    this.finishSummaryData = null;

    this.closeModal("modal-workout-summary");
    this.updateActiveNavBadge();

    ChartsManager.populateSelectors();
    ChartsManager.renderCurrentCharts();
    this.renderHistoryList();
    this.switchView("view-stats");

    this.showToast("Ottimo lavoro! Allenamento registrato nello storico.");
  },

  // ================= 4. SELETTORE ESERCIZI =================
  bindExercisePickerFilters() {
    const filterContainer = document.getElementById("picker-muscle-filter");
    if (!filterContainer) return;

    filterContainer.querySelectorAll(".filter-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        filterContainer.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        this.pickerMuscleFilter = chip.getAttribute("data-group") || "Tutti";
        const searchInput = document.getElementById("search-exercise-input");
        this.renderPickerExercises(searchInput ? searchInput.value : "");
      });
    });
  },

  openExercisePicker(context = "editor") {
    this.activeExercisePickerContext = context;
    const modal = document.getElementById("modal-exercise-picker");
    const searchInput = document.getElementById("search-exercise-input");
    const customInput = document.getElementById("custom-exercise-name");

    if (searchInput) searchInput.value = "";
    if (customInput) customInput.value = "";

    this.pickerMuscleFilter = "Tutti";
    const filterContainer = document.getElementById("picker-muscle-filter");
    if (filterContainer) {
      filterContainer.querySelectorAll(".filter-chip").forEach(c => {
        c.classList.toggle("active", c.getAttribute("data-group") === "Tutti");
      });
    }

    this.renderPickerExercises("");
    modal.classList.add("open");

    if (searchInput) {
      searchInput.oninput = (e) => this.renderPickerExercises(e.target.value);
    }
  },

  renderPickerExercises(query = "") {
    const listEl = document.getElementById("picker-exercises-list");
    const subtitleEl = document.getElementById("picker-subtitle");
    if (!listEl) return;

    const q = query.trim().toLowerCase();
    const groupFilter = this.pickerMuscleFilter;

    const filtered = DEFAULT_EXERCISES.filter(ex => {
      if (groupFilter !== "Tutti" && ex.muscleGroup !== groupFilter) return false;
      if (!q) return true;
      return (
        ex.name.toLowerCase().includes(q) ||
        (ex.nameIt && ex.nameIt.toLowerCase().includes(q)) ||
        (ex.nameEn && ex.nameEn.toLowerCase().includes(q)) ||
        (ex.category && ex.category.toLowerCase().includes(q)) ||
        (ex.muscleGroup && ex.muscleGroup.toLowerCase().includes(q))
      );
    });

    if (subtitleEl) {
      subtitleEl.textContent = `${filtered.length} esercizi trovati ${groupFilter !== 'Tutti' ? 'in ' + groupFilter : ''}`;
    }

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div style="padding: 24px 16px; color: var(--text-muted); text-align: center;">
          <p style="margin-bottom: 8px;">Nessun esercizio trovato per "${this.escapeHtml(query)}".</p>
          <p style="font-size: 0.8rem;">Puoi crearlo subito usando il campo personalizzato sopra!</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map(ex => {
      const mGroup = ex.muscleGroup || detectMuscleGroup(ex.name);
      return `
        <div class="card" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; margin-bottom: 8px; cursor: pointer;" onclick="App.selectExerciseFromPicker('${this.escapeHtml(ex.name)}', ${ex.defaultRest}, '${mGroup}')">
          <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
            <button type="button" class="anatomy-thumb-btn" onclick="event.stopPropagation(); Anatomy.openModal('${this.escapeHtml(ex.name)}', '${mGroup}')" title="Visualizza anatomia">
              ${Anatomy.getSvg(mGroup, 34, 40, ex.name)}
            </button>
            <div style="min-width: 0; flex: 1;">
              <div style="font-weight: 700; font-size: 0.92rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${this.escapeHtml(ex.nameIt || ex.name)}
              </div>
              <div class="picker-item-sub">
                ${ex.nameEn ? `<span style="color: var(--text-secondary);">${this.escapeHtml(ex.nameEn)}</span> • ` : ''}
                <span style="color: var(--accent-blue); font-weight: 600;">${mGroup}</span> • ${ex.defaultRest}s
              </div>
            </div>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" style="margin-left: 8px;">+ Scegli</button>
        </div>
      `;
    }).join("");
  },

  selectExerciseFromPicker(name, defaultRest = 90, muscleGroup = null) {
    const mGroup = muscleGroup || detectMuscleGroup(name);
    if (this.activeExercisePickerContext === "editor") {
      this.currentEditorExercises = this.currentEditorExercises || [];
      this.currentEditorExercises.push({
        id: "ex_" + Date.now(),
        name,
        muscleGroup: mGroup,
        superset: "",
        notes: "",
        restSeconds: defaultRest,
        sets: [
          { weight: 50, reps: 8 },
          { weight: 50, reps: 8 },
          { weight: 50, reps: 8 }
        ]
      });
      this.renderEditorExercises();
    } else if (this.activeExercisePickerContext === "active_workout") {
      if (this.activeWorkout) {
        this.activeWorkout.exercises.push({
          name,
          muscleGroup: mGroup,
          superset: "",
          notes: "",
          restSeconds: defaultRest,
          sets: [
            { setNumber: 1, weight: 50, reps: 8, completed: false },
            { setNumber: 2, weight: 50, reps: 8, completed: false },
            { setNumber: 3, weight: 50, reps: 8, completed: false }
          ]
        });
        Store.saveActiveWorkout(this.activeWorkout);
        this.renderActiveWorkout();
      }
    } else if (this.activeExercisePickerContext === "history_editor") {
      if (this.currentHistoryEditorSession) {
        this.currentHistoryEditorSession.exercises = this.currentHistoryEditorSession.exercises || [];
        this.currentHistoryEditorSession.exercises.push({
          name,
          notes: "",
          quickTags: [],
          sets: [
            { setNumber: 1, weight: 50, reps: 8, completed: true },
            { setNumber: 2, weight: 50, reps: 8, completed: true },
            { setNumber: 3, weight: 50, reps: 8, completed: true }
          ]
        });
        this.renderHistoryEditorExercises();
      }
    }

    this.closeModal("modal-exercise-picker");
    this.showToast(`Aggiunto: ${name}`);
  },

  addCustomExercise() {
    const input = document.getElementById("custom-exercise-name");
    const name = input ? input.value.trim() : "";
    if (!name) {
      this.showToast("Inserisci il nome del nuovo esercizio.");
      return;
    }
    const detected = detectMuscleGroup(name);
    this.selectExerciseFromPicker(name, 90, detected);
    this.showToast(`Esercizio aggiunto! Gruppo muscolare: ${detected}`);
  },

  // ================= 5. STORICO SESSIONI =================
  setHistoryWeekFilter(filterVal) {
    this.historyWeekFilter = filterVal;
    this.renderHistoryList();
  },

  renderHistoryList() {
    const container = document.getElementById("history-cards-container");
    const filterEl = document.getElementById("history-week-filter");
    if (!container) return;

    const allHistory = Store.getHistory();

    if (filterEl) {
      const filters = [
        { val: "all", label: `Tutte (${allHistory.length})` },
        { val: "8", label: "Sett 8" },
        { val: "7", label: "Sett 7" },
        { val: "6", label: "Sett 6" },
        { val: "5", label: "Sett 5" },
        { val: "1-4", label: "Sett 1–4" }
      ];
      filterEl.innerHTML = filters.map(f => `
        <button type="button" class="filter-chip ${this.historyWeekFilter === f.val ? 'active' : ''}" onclick="App.setHistoryWeekFilter('${f.val}')">
          ${f.label}
        </button>
      `).join("");
    }

    const history = allHistory.filter(item => {
      if (this.historyWeekFilter === "all") return true;
      if (this.historyWeekFilter === "1-4") return item.week >= 1 && item.week <= 4;
      return String(item.week) === this.historyWeekFilter;
    });

    if (history.length === 0) {
      container.innerHTML = `
        <div class="card text-center" style="padding: 30px 16px;">
          <p style="color: var(--text-secondary);">Nessun allenamento registrato per questo filtro.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = history.map(item => {
      const d = new Date(item.date);
      const formattedDate = d.toLocaleDateString("it-IT", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      });

      const exercisesSummary = (item.exercises || []).map(ex => {
        const completedSets = (ex.sets || []).filter(s => s.completed);
        const setStrings = completedSets.map(s => `${s.weight}kg × ${s.reps}`).join(", ");
        const mGroup = detectMuscleGroup(ex.name);
        const qTags = Array.isArray(ex.quickTags) ? ex.quickTags : [];
        const qTagsHtml = qTags.length > 0
          ? `<div class="history-qtags-row">${qTags.map(lbl => {
              const meta = this.QUICK_TAGS.find(t => t.label === lbl) || { emoji: "🏷️", type: "info" };
              return `<span class="history-qtag tag-${meta.type}">${meta.emoji} ${this.escapeHtml(lbl)}</span>`;
            }).join("")}</div>`
          : "";

        const prs = Store.checkExercisePRs(ex.name, ex.sets, item.id);
        const prBadges = [];
        if (prs.isMaxWeightPR) prBadges.push(`<span class="pr-badge pr-badge-weight" style="font-size: 0.65rem; padding: 1px 6px;">💪 PR ${prs.currentMaxWeight}kg</span>`);
        if (prs.isMaxVolumePR) prBadges.push(`<span class="pr-badge pr-badge-volume" style="font-size: 0.65rem; padding: 1px 6px;">🏅 Record ${prs.currentMaxVolume}kg</span>`);

        return `
          <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; font-size: 0.82rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">
            <div style="display: flex; align-items: flex-start; gap: 8px; min-width: 0; flex: 1;">
              <button type="button" class="anatomy-thumb-btn" onclick="Anatomy.openModal('${this.escapeHtml(ex.name)}', '${mGroup}')" title="Visualizza anatomia">
                ${Anatomy.getSvg(mGroup, 24, 30, ex.name)}
              </button>
              <div style="min-width: 0; flex: 1;">
                <strong>${this.escapeHtml(ex.name)}</strong>
                <div style="color: var(--text-secondary); font-family: var(--font-mono); font-size: 0.75rem;">${setStrings || 'Nessuna serie eseguita'}</div>
                ${qTagsHtml}
                ${ex.notes ? `<div class="history-ex-note">${this.escapeHtml(ex.notes)}</div>` : ""}
              </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 3px; margin-left: 6px;">
              ${prBadges.join("")}
            </div>
          </div>
        `;
      }).join("");

      return `
        <div class="history-item-card">
          <div class="history-item-header">
            <div>
              ${item.week ? `<div class="routine-badges-row"><span class="routine-week-badge">Sett ${item.week}${item.dayNumber ? ` • Giorno ${item.dayNumber}` : ""}</span></div>` : ""}
              <h3 class="history-item-title">${this.escapeHtml(item.routineName || "Allenamento")}</h3>
              <div class="history-item-date">${formattedDate}</div>
            </div>
            <div style="display: flex; gap: 2px; flex-shrink: 0;">
              <button class="icon-btn" onclick="App.openHistoryEditor('${item.id}')" title="Modifica sessione">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="icon-btn" style="color: var(--accent-red);" onclick="App.deleteHistoryItem('${item.id}')" title="Elimina dallo storico">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
              </button>
            </div>
          </div>
          <div class="history-metrics-row">
            <div>Volume: <span>${Math.round(item.totalVolumeKg || 0).toLocaleString("it-IT")} kg</span></div>
            <div>Durata: <span>${item.durationMinutes || 0} min</span></div>
            <div>Esercizi: <span>${(item.exercises || []).length}</span></div>
          </div>
          <div style="background-color: var(--bg-surface); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            ${exercisesSummary}
          </div>
        </div>
      `;
    }).join("");
  },

  deleteHistoryItem(id) {
    if (typeof IS_DEMO_MODE !== "undefined" && IS_DEMO_MODE) {
      this.showToast("🔒 Modalità Demo (sola lettura).");
      return;
    }
    if (confirm("Eliminare questa sessione dallo storico?")) {
      Store.deleteHistorySession(id);
      this.renderHistoryList();
      this.renderRoutines();
      ChartsManager.populateSelectors();
      ChartsManager.renderCurrentCharts();
      this.showToast("Sessione eliminata e sincronizzata.");
    }
  },

  // --- EDITOR SESSIONI GIÀ SALVATE (STORICO) ---
  openHistoryEditor(sessionId) {
    if (typeof IS_DEMO_MODE !== "undefined" && IS_DEMO_MODE) {
      this.showToast("🔒 Modalità Demo (sola lettura): modifica storico disabilitata.");
      return;
    }
    const history = Store.getHistory();
    const session = history.find(h => h.id === sessionId);
    if (!session) return;

    this.currentHistoryEditorSession = JSON.parse(JSON.stringify(session));
    const slot = ChartsManager.extractTrainingSlot(session);

    const idEl = document.getElementById("edit-hist-id");
    const nameEl = document.getElementById("edit-hist-name");
    const weekEl = document.getElementById("edit-hist-week");
    const dayEl = document.getElementById("edit-hist-day");
    const durEl = document.getElementById("edit-hist-duration");

    if (idEl) idEl.value = session.id;
    if (nameEl) nameEl.value = session.routineName || "";
    if (weekEl) weekEl.value = slot.week > 0 ? String(slot.week) : "";
    if (dayEl) dayEl.value = slot.day > 0 ? String(slot.day) : "";
    if (durEl) durEl.value = session.durationMinutes || 60;

    this.renderHistoryEditorExercises();
    const modal = document.getElementById("modal-history-editor");
    if (modal) modal.classList.add("open");
  },

  renderHistoryEditorExercises() {
    const container = document.getElementById("editor-history-exercises-list");
    if (!container || !this.currentHistoryEditorSession) return;

    const exercises = this.currentHistoryEditorSession.exercises || [];
    if (exercises.length === 0) {
      container.innerHTML = `<p style="font-size: 0.84rem; color: var(--text-muted); text-align: center; padding: 14px;">Nessun esercizio in questa sessione. Clicca "+ Aggiungi Esercizio".</p>`;
      return;
    }

    container.innerHTML = exercises.map((ex, exIdx) => {
      const mGroup = detectMuscleGroup(ex.name);
      const qTags = Array.isArray(ex.quickTags) ? ex.quickTags : [];
      const quickTagsHtml = this.QUICK_TAGS.map(t => {
        const isSelected = qTags.includes(t.label);
        return `
          <button type="button" class="quick-tag-chip tag-${t.type} ${isSelected ? 'active' : ''}"
            onclick="App.toggleHistoryEditorQuickTag(${exIdx}, '${t.label}')">
            <span>${t.emoji}</span><span>${t.short}</span>
          </button>
        `;
      }).join("");

      const setsHtml = (ex.sets || []).map((s, sIdx) => `
        <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 0.76rem; font-weight: 700; color: var(--text-muted); width: 22px;">S${sIdx + 1}</span>
          <input type="number" inputmode="decimal" class="input-stepper" style="height: 32px; width: 68px;" value="${s.weight}" step="0.25" onchange="App.updateHistoryEditorSet(${exIdx}, ${sIdx}, 'weight', this.value)">
          <span style="font-size: 0.74rem; color: var(--text-muted);">kg ×</span>
          <input type="number" inputmode="numeric" class="input-stepper" style="height: 32px; width: 54px;" value="${s.reps}" step="1" onchange="App.updateHistoryEditorSet(${exIdx}, ${sIdx}, 'reps', this.value)">
          <label style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; color: var(--text-secondary); cursor: pointer; margin-left: auto;">
            <input type="checkbox" ${s.completed ? 'checked' : ''} onchange="App.updateHistoryEditorSet(${exIdx}, ${sIdx}, 'completed', this.checked)" style="width: 17px; height: 17px;">
            <span>✓</span>
          </label>
          <button type="button" class="icon-btn" style="width: 28px; height: 28px; color: var(--accent-red);" onclick="App.removeHistoryEditorSet(${exIdx}, ${sIdx})">✕</button>
        </div>
      `).join("");

      return `
        <div class="card" style="margin-bottom: 10px; padding: 12px; background-color: var(--bg-card);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1;">
              ${Anatomy.getSvg(mGroup, 26, 32, ex.name)}
              <div style="min-width: 0;">
                <strong style="font-size: 0.9rem; display: block;">${this.escapeHtml(ex.name)}</strong>
                <span style="font-size: 0.7rem; color: var(--accent-blue); font-weight: 600;">${mGroup}</span>
              </div>
            </div>
            <button type="button" class="icon-btn" style="width: 30px; height: 30px; color: var(--accent-red);" onclick="App.removeHistoryEditorExercise(${exIdx})" title="Rimuovi esercizio">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
            </button>
          </div>

          <div class="quick-tags-scroll" style="padding-bottom: 6px;">
            ${quickTagsHtml}
          </div>

          <textarea class="form-textarea" rows="2" style="padding: 6px 8px; font-size: 0.8rem; margin-bottom: 8px;" placeholder="Note sulla serie, dolore, stanchezza..." onchange="App.updateHistoryEditorNotes(${exIdx}, this.value)">${this.escapeHtml(ex.notes || '')}</textarea>

          ${setsHtml}

          <button type="button" class="btn-add-set" onclick="App.addHistoryEditorSet(${exIdx})">
            + Aggiungi Serie
          </button>
        </div>
      `;
    }).join("");
  },

  toggleHistoryEditorQuickTag(exIdx, tagLabel) {
    const ex = this.currentHistoryEditorSession && this.currentHistoryEditorSession.exercises[exIdx];
    if (!ex) return;
    ex.quickTags = Array.isArray(ex.quickTags) ? ex.quickTags : [];
    const idx = ex.quickTags.indexOf(tagLabel);
    if (idx >= 0) ex.quickTags.splice(idx, 1);
    else ex.quickTags.push(tagLabel);
    this.renderHistoryEditorExercises();
  },

  updateHistoryEditorNotes(exIdx, val) {
    const ex = this.currentHistoryEditorSession && this.currentHistoryEditorSession.exercises[exIdx];
    if (ex) ex.notes = val;
  },

  updateHistoryEditorSet(exIdx, sIdx, field, val) {
    const ex = this.currentHistoryEditorSession && this.currentHistoryEditorSession.exercises[exIdx];
    if (ex && ex.sets && ex.sets[sIdx]) {
      ex.sets[sIdx][field] = field === "completed" ? !!val : (Number(val) || 0);
    }
  },

  addHistoryEditorSet(exIdx) {
    const ex = this.currentHistoryEditorSession && this.currentHistoryEditorSession.exercises[exIdx];
    if (!ex) return;
    ex.sets = ex.sets || [];
    const last = ex.sets[ex.sets.length - 1] || { weight: 50, reps: 8 };
    ex.sets.push({
      setNumber: ex.sets.length + 1,
      weight: last.weight,
      reps: last.reps,
      completed: true
    });
    this.renderHistoryEditorExercises();
  },

  removeHistoryEditorSet(exIdx, sIdx) {
    const ex = this.currentHistoryEditorSession && this.currentHistoryEditorSession.exercises[exIdx];
    if (!ex || !ex.sets) return;
    ex.sets.splice(sIdx, 1);
    ex.sets.forEach((s, i) => { s.setNumber = i + 1; });
    this.renderHistoryEditorExercises();
  },

  removeHistoryEditorExercise(exIdx) {
    if (!this.currentHistoryEditorSession || !this.currentHistoryEditorSession.exercises) return;
    this.currentHistoryEditorSession.exercises.splice(exIdx, 1);
    this.renderHistoryEditorExercises();
  },

  saveHistoryFromEditor() {
    if (!this.currentHistoryEditorSession) return;

    const nameVal = (document.getElementById("edit-hist-name")?.value || "").trim();
    const weekStr = document.getElementById("edit-hist-week")?.value || "";
    const dayStr = document.getElementById("edit-hist-day")?.value || "";
    const durVal = Math.max(1, parseInt(document.getElementById("edit-hist-duration")?.value, 10) || 60);

    const sess = this.currentHistoryEditorSession;
    sess.routineName = nameVal || sess.routineName || "Allenamento";
    sess.week = weekStr ? parseInt(weekStr, 10) : null;
    sess.dayNumber = dayStr ? parseInt(dayStr, 10) : null;
    sess.durationMinutes = durVal;

    // Ricalcola routineId se settimana/giorno corrispondono a una scheda del programma
    if (sess.week && sess.dayNumber) {
      const matched = Store.getRoutines().find(r => Number(r.week) === sess.week && Number(r.dayNumber) === sess.dayNumber);
      if (matched) sess.routineId = matched.id;
    }

    // Ricalcola volume totale dalle serie completate
    let totalVol = 0;
    (sess.exercises || []).forEach(ex => {
      (ex.sets || []).forEach((s, i) => {
        s.setNumber = i + 1;
        if (s.completed) totalVol += (Number(s.weight) || 0) * (Number(s.reps) || 0);
      });
    });
    sess.totalVolumeKg = Math.round(totalVol * 10) / 10;

    Store.updateHistorySession(sess);
    this.currentHistoryEditorSession = null;
    this.closeModal("modal-history-editor");

    this.renderHistoryList();
    this.renderRoutines();
    ChartsManager.populateSelectors();
    ChartsManager.renderCurrentCharts();
    this.showToast("✓ Sessione modificata e sincronizzata sul cloud!");
  },

  // ================= 6. MODALI, IMPOSTAZIONI & BACKUP =================
  bindModals() {
    document.querySelectorAll(".close-modal-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const modal = btn.closest(".modal-overlay");
        if (modal) modal.classList.remove("open");
      });
    });

    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.classList.remove("open");
      });
    });

    const btnCreateRoutine = document.getElementById("btn-create-routine");
    if (btnCreateRoutine) btnCreateRoutine.addEventListener("click", () => this.openRoutineEditor());

    const btnSaveRoutine = document.getElementById("btn-save-routine");
    if (btnSaveRoutine) btnSaveRoutine.addEventListener("click", () => this.saveRoutineFromEditor());

    const btnEditorAddEx = document.getElementById("btn-editor-add-exercise");
    if (btnEditorAddEx) btnEditorAddEx.addEventListener("click", () => this.openExercisePicker("editor"));

    const btnActiveAddEx = document.getElementById("btn-add-exercise-to-active");
    if (btnActiveAddEx) btnActiveAddEx.addEventListener("click", () => this.openExercisePicker("active_workout"));

    const btnAddCustom = document.getElementById("btn-add-custom-exercise");
    if (btnAddCustom) btnAddCustom.addEventListener("click", () => this.addCustomExercise());

    const btnFinish = document.getElementById("btn-finish-workout");
    if (btnFinish) btnFinish.addEventListener("click", () => this.finishActiveWorkout());

    const btnCancel = document.getElementById("btn-cancel-workout");
    if (btnCancel) btnCancel.addEventListener("click", () => this.cancelActiveWorkout());

    const btnConfirmSummary = document.getElementById("btn-confirm-save-summary");
    if (btnConfirmSummary) btnConfirmSummary.addEventListener("click", () => this.confirmSaveAndCloseSummary());

    const btnOpenReport = document.getElementById("btn-open-results-report");
    if (btnOpenReport) {
      btnOpenReport.addEventListener("click", () => {
        if (typeof ReportManager !== "undefined") ReportManager.openModal();
      });
    }

    const btnDownloadPdf = document.getElementById("btn-download-pdf");
    if (btnDownloadPdf) {
      btnDownloadPdf.addEventListener("click", () => {
        if (typeof ReportManager !== "undefined") ReportManager.downloadPdf(false);
      });
    }

    const btnSharePdf = document.getElementById("btn-share-pdf");
    if (btnSharePdf) {
      btnSharePdf.addEventListener("click", () => {
        if (typeof ReportManager !== "undefined") ReportManager.downloadPdf(true);
      });
    }

    const btnSaveHistEdit = document.getElementById("btn-save-history-edit");
    if (btnSaveHistEdit) btnSaveHistEdit.addEventListener("click", () => this.saveHistoryFromEditor());

    const btnHistAddEx = document.getElementById("btn-hist-editor-add-exercise");
    if (btnHistAddEx) btnHistAddEx.addEventListener("click", () => this.openExercisePicker("history_editor"));
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("open");
  },

  bindSettings() {
    const cloudPill = document.getElementById("cloud-sync-pill");
    if (cloudPill) {
      cloudPill.addEventListener("click", () => {
        if (typeof CloudSync !== "undefined") CloudSync.syncNow(true);
      });
    }

    const btnSyncNow = document.getElementById("btn-sync-now");
    if (btnSyncNow) {
      btnSyncNow.addEventListener("click", () => {
        if (typeof CloudSync !== "undefined") CloudSync.syncNow(true);
      });
    }

    const btnOpenSettings = document.getElementById("btn-open-settings");
    if (btnOpenSettings) {
      btnOpenSettings.addEventListener("click", () => {
        const settings = Store.getSettings();
        const chkSound = document.getElementById("setting-sound");
        const chkVibe = document.getElementById("setting-vibe");
        if (chkSound) chkSound.checked = !!settings.soundEnabled;
        if (chkVibe) chkVibe.checked = !!settings.vibrationEnabled;
        document.getElementById("modal-settings").classList.add("open");
      });
    }

    const chkSound = document.getElementById("setting-sound");
    if (chkSound) {
      chkSound.addEventListener("change", () => {
        const s = Store.getSettings();
        s.soundEnabled = chkSound.checked;
        Store.setSettings(s);
      });
    }

    const chkVibe = document.getElementById("setting-vibe");
    if (chkVibe) {
      chkVibe.addEventListener("change", () => {
        const s = Store.getSettings();
        s.vibrationEnabled = chkVibe.checked;
        Store.setSettings(s);
      });
    }

    const btnExport = document.getElementById("btn-export-backup");
    if (btnExport) {
      btnExport.addEventListener("click", () => {
        const jsonStr = Store.exportBackup();
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const dateStr = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `hevy_backup_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast("Backup JSON scaricato con successo!");
      });
    }

    const inputImport = document.getElementById("input-import-backup");
    if (inputImport) {
      inputImport.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const res = Store.importBackup(event.target.result);
          if (res.success) {
            this.renderRoutines();
            ChartsManager.populateSelectors();
            ChartsManager.renderCurrentCharts();
            this.renderHistoryList();
            this.closeModal("modal-settings");
            this.showToast(`Import completato: ${res.countRoutines} schede, ${res.countHistory} sessioni!`);
          } else {
            alert("Errore nell'importazione: " + res.error);
          }
        };
        reader.readAsText(file);
      });
    }

    const btnReset = document.getElementById("btn-reset-sample-data");
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        if (confirm("Vuoi ripristinare il programma completo (Sett 1–4 + Sett 5–8 + Storico reale precaricato)?")) {
          Store.resetToDefaults();
          this.selectedProgramId = "prog_pdf_s1_s4";
          this.selectedWeek = 1;
          this.renderRoutines();
          ChartsManager.populateSelectors();
          ChartsManager.renderCurrentCharts();
          this.renderHistoryList();
          this.closeModal("modal-settings");
          this.showToast("Programma completo (Sett 1–8) ripristinato!");
        }
      });
    }
  },

  showToast(message) {
    const toast = document.getElementById("app-toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  },

  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
