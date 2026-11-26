/**
 * Charts - Grafici interattivi con Chart.js ordinati per Calendario di Allenamento
 * (Settimana → Giorno, es. S1 · G1 → S8 · G4) invece che per data solare.
 */

const ChartsManager = {
  exerciseChartInstance: null,
  routineChartInstance: null,

  /**
   * Estrae { week, day } da una sessione (da campi espliciti o dal nome routine)
   */
  extractTrainingSlot(session) {
    let week = Number(session.week) || 0;
    let day = Number(session.dayNumber) || 0;

    const name = session.routineName || "";
    if (!week) {
      const mW = name.match(/sett(?:imana)?\.?\s*(\d+)/i);
      if (mW) week = parseInt(mW[1], 10);
    }
    if (!day) {
      const mD = name.match(/giorno\s*(\d+)/i);
      if (mD) day = parseInt(mD[1], 10);
    }

    return { week, day };
  },

  /**
   * Ordina le sessioni secondo il calendario di allenamento:
   * Settimana crescente → Giorno crescente (sessioni libere senza settimana alla fine)
   */
  sortByTrainingCalendar(sessions) {
    return [...sessions].sort((a, b) => {
      const slotA = this.extractTrainingSlot(a);
      const slotB = this.extractTrainingSlot(b);

      const hasA = slotA.week > 0;
      const hasB = slotB.week > 0;
      if (hasA && !hasB) return -1;
      if (!hasA && hasB) return 1;

      if (slotA.week !== slotB.week) return slotA.week - slotB.week;
      if (slotA.day !== slotB.day) return slotA.day - slotB.day;

      return new Date(a.date || 0) - new Date(b.date || 0);
    });
  },

  /**
   * Formatta etichetta compatta per asse X e titolo esteso per tooltip
   */
  buildTrainingLabels(entries) {
    const slotCounts = new Map();
    entries.forEach(e => {
      const key = e.week > 0 ? `S${e.week}_G${e.day}` : "FREE";
      slotCounts.set(key, (slotCounts.get(key) || 0) + 1);
    });

    const seenCounts = new Map();
    let freeIndex = 0;

    return entries.map(e => {
      if (e.week > 0) {
        const key = `S${e.week}_G${e.day}`;
        const occ = (seenCounts.get(key) || 0) + 1;
        seenCounts.set(key, occ);
        const totalForSlot = slotCounts.get(key) || 1;
        const suffix = totalForSlot > 1 ? ` (#${occ})` : "";

        const shortLabel = e.day > 0
          ? `S${e.week} · G${e.day}${suffix}`
          : `Sett ${e.week}${suffix}`;
        const fullLabel = e.day > 0
          ? `Settimana ${e.week} • Giorno ${e.day}${suffix}`
          : `Settimana ${e.week}${suffix}`;
        return { shortLabel, fullLabel };
      } else {
        freeIndex++;
        return {
          shortLabel: `Libera #${freeIndex}`,
          fullLabel: e.routineName || `Sessione Libera #${freeIndex}`
        };
      }
    });
  },

  init() {
    this.populateSelectors();
    this.renderCurrentCharts();
  },

  populateSelectors() {
    const history = Store.getHistory();
    const routines = Store.getRoutines();

    const exerciseSelect = document.getElementById("chart-exercise-select");
    if (exerciseSelect) {
      const historyExSet = new Set();
      const routineExSet = new Set();

      history.forEach(session => {
        if (session.exercises) {
          session.exercises.forEach(ex => {
            if (ex.name && ex.sets && ex.sets.some(s => s.completed && Number(s.weight) > 0)) {
              historyExSet.add(ex.name);
            }
          });
        }
      });

      routines.forEach(r => {
        if (r.exercises) {
          r.exercises.forEach(ex => {
            if (ex.name && !historyExSet.has(ex.name)) {
              routineExSet.add(ex.name);
            }
          });
        }
      });

      const currentVal = exerciseSelect.value;
      exerciseSelect.innerHTML = "";

      const sortedHistoryEx = Array.from(historyExSet).sort();
      const sortedOtherEx = Array.from(routineExSet).sort();

      if (sortedHistoryEx.length > 0) {
        const grpHist = document.createElement("optgroup");
        grpHist.label = "Con dati nello Storico";
        sortedHistoryEx.forEach(name => {
          const opt = document.createElement("option");
          opt.value = name;
          opt.textContent = name;
          grpHist.appendChild(opt);
        });
        exerciseSelect.appendChild(grpHist);
      }

      if (sortedOtherEx.length > 0) {
        const grpOther = document.createElement("optgroup");
        grpOther.label = "Altri esercizi in scheda";
        sortedOtherEx.forEach(name => {
          const opt = document.createElement("option");
          opt.value = name;
          opt.textContent = name;
          grpOther.appendChild(opt);
        });
        exerciseSelect.appendChild(grpOther);
      }

      const allNames = [...sortedHistoryEx, ...sortedOtherEx];
      if (currentVal && allNames.includes(currentVal)) {
        exerciseSelect.value = currentVal;
      } else if (sortedHistoryEx.length > 0) {
        const defaultEx = sortedHistoryEx.find(e => e.toLowerCase().includes("stacco"))
          || sortedHistoryEx.find(e => e.toLowerCase().includes("panca"))
          || sortedHistoryEx[0];
        exerciseSelect.value = defaultEx;
      } else if (allNames.length > 0) {
        exerciseSelect.value = allNames[0];
      }
    }

    const routineSelect = document.getElementById("chart-routine-select");
    if (routineSelect) {
      const currentRoutine = routineSelect.value;
      routineSelect.innerHTML = `
        <option value="all">Tutte le Sessioni (Sett → Giorno)</option>
        <option value="day:1">Giorno 1 – Pull / Stacco</option>
        <option value="day:2">Giorno 2 – Push</option>
        <option value="day:3">Giorno 3 – Lower</option>
        <option value="day:4">Giorno 4 – Upper</option>
      `;

      const customRoutines = routines.filter(r => !r.dayNumber);
      customRoutines.forEach(r => {
        const opt = document.createElement("option");
        opt.value = r.id;
        opt.textContent = r.name;
        routineSelect.appendChild(opt);
      });

      const validValues = Array.from(routineSelect.options).map(o => o.value);
      if (currentRoutine && validValues.includes(currentRoutine)) {
        routineSelect.value = currentRoutine;
      } else {
        routineSelect.value = "all";
      }
    }
  },

  renderCurrentCharts() {
    const exerciseSelect = document.getElementById("chart-exercise-select");
    const routineSelect = document.getElementById("chart-routine-select");
    const metricSelect = document.getElementById("chart-metric-select");

    const exName = exerciseSelect ? exerciseSelect.value : "";
    const metric = metricSelect ? metricSelect.value : "both";
    const routineId = routineSelect ? routineSelect.value : "all";

    if (exName) {
      this.renderExerciseChart(exName, metric);
    }
    this.renderRoutineChart(routineId);
  },

  clearEmptyState(canvas) {
    if (!canvas || !canvas.parentElement) return;
    const existing = canvas.parentElement.querySelector(".chart-empty-msg");
    if (existing) existing.remove();
    canvas.style.display = "block";
  },

  /**
   * Riconosce i 3 fondamentali (Panca Piana, Stacco, Squat con bilanciere)
   * escludendo macchine/complementari (es. Hack Squat, Panca Inclinata Manubri, Curl su Panca).
   */
  isFundamentalLift(exerciseName = "") {
    const n = String(exerciseName).toLowerCase().trim();
    if (!n) return false;
    if (/panca\s*piana|barbell\s*bench/i.test(n)) return true;
    if (/stacco\s*(sumo|da\s*terra)|barbell\s*deadlift|sumo\s*deadlift/i.test(n)) return true;
    if (/squat/i.test(n) && !/hack|bulgar|goblet|split|front/i.test(n)) return true;
    return false;
  },

  /**
   * Determina se un esercizio fondamentale registrato in una sessione è "Fuori Programma"
   * e quindi da NON mostrare nei grafici di progressione.
   */
  isOffProgramFundamental(session, ex, isDuplicateSlot = false) {
    if (!ex || !this.isFundamentalLift(ex.name)) return false;

    const slot = this.extractTrainingSlot(session);
    const qTags = Array.isArray(ex.quickTags) ? ex.quickTags : [];
    const notesStr = (ex.notes || "").toLowerCase();

    // 1. Tag esplicito "Fuori programma" o nota testuale
    if (qTags.some(t => /fuori programma/i.test(t)) || /fuori programma/i.test(notesStr)) {
      return true;
    }

    // 2. Sessione libera (senza settimana) o sessione doppia/extra sullo stesso giorno già loggato
    if (slot.week === 0 || isDuplicateSlot) {
      return true;
    }

    // 3. Controlla contro la scheda originale di quel (Settimana, Giorno)
    if (typeof ReportManager !== "undefined" && ReportManager.getOriginalProgrammedExercise) {
      const target = ReportManager.getOriginalProgrammedExercise(slot.week, slot.day, ex.name, session.routineId);
      // Fondamentale fatto in un giorno in cui non era programmato
      if (!target || !target.sets || target.sets.length === 0) {
        return true;
      }
      // Test/massimale fuori protocollo: carico >= +20% rispetto al massimo programmato nella settimana
      const maxTargetW = Math.max(...target.sets.map(s => Number(s.weight) || 0));
      const validSets = (ex.sets || []).filter(s => s.completed && Number(s.weight) > 0);
      if (maxTargetW > 0 && validSets.length > 0) {
        const maxActualW = Math.max(...validSets.map(s => Number(s.weight)));
        if (maxActualW >= maxTargetW * 1.2) {
          return true;
        }
      }
    }

    return false;
  },

  /**
   * Grafico Esercizio: Carico Massimo (kg) e 1RM stimato (Epley) per Settimana & Giorno
   * Esclude automaticamente eventuali sessioni fuori programma sui fondamentali (Panca, Stacco, Squat).
   */
  renderExerciseChart(exerciseName, metric = "both") {
    const history = Store.getHistory();
    const ordered = this.sortByTrainingCalendar(history);

    const entries = [];
    const seenSlots = new Set();
    let excludedOffProgCount = 0;
    let allTimeMaxWeight = 0;
    let allTimeMax1RM = 0;

    ordered.forEach(session => {
      if (!session.exercises) return;
      const ex = session.exercises.find(e => Store.isExerciseNameMatch(e.name, exerciseName));
      if (ex && ex.sets) {
        const slot = this.extractTrainingSlot(session);
        const slotKey = slot.week > 0 ? `S${slot.week}_G${slot.day}` : null;
        const isDuplicateSlot = slotKey ? seenSlots.has(slotKey) : false;

        if (this.isOffProgramFundamental(session, ex, isDuplicateSlot)) {
          excludedOffProgCount++;
          return;
        }

        const validSets = ex.sets.filter(s => s.completed && Number(s.weight) > 0);
        if (validSets.length > 0) {
          if (slotKey) seenSlots.add(slotKey);
          const maxW = Math.max(...validSets.map(s => Number(s.weight)));
          let sessionMax1RM = 0;
          validSets.forEach(s => {
            const epley = Store.calculate1RM(s.weight, s.reps);
            if (epley > sessionMax1RM) sessionMax1RM = epley;
          });

          if (maxW > allTimeMaxWeight) allTimeMaxWeight = maxW;
          if (sessionMax1RM > allTimeMax1RM) allTimeMax1RM = sessionMax1RM;

          entries.push({
            week: slot.week,
            day: slot.day,
            routineName: session.routineName || "",
            maxWeight: maxW,
            oneRM: sessionMax1RM,
            setsSummary: validSets.map(s => `${s.weight}×${s.reps}`).join(", ")
          });
        }
      }
    });

    const builtLabels = this.buildTrainingLabels(entries);
    const labels = builtLabels.map(l => l.shortLabel);
    const fullTitles = builtLabels.map(l => l.fullLabel);
    const maxWeights = entries.map(e => e.maxWeight);
    const oneRMs = entries.map(e => e.oneRM);

    const prEl = document.getElementById("ex-stat-pr");
    const rmEl = document.getElementById("ex-stat-1rm");
    const countEl = document.getElementById("ex-stat-count");
    const badgeEl = document.getElementById("ex-stat-progression");

    if (prEl) prEl.textContent = allTimeMaxWeight > 0 ? `${allTimeMaxWeight} kg` : "-";
    if (rmEl) rmEl.textContent = allTimeMax1RM > 0 ? `${allTimeMax1RM} kg` : "-";
    if (countEl) countEl.textContent = labels.length;

    if (badgeEl) {
      const suggestion = Store.getProgressiveOverloadSuggestion(exerciseName);
      const offNote = excludedOffProgCount > 0
        ? `<span class="badge-neutral" style="margin-left: 4px; font-size: 0.66rem;" title="Sessioni fuori programma escluse dal grafico">${excludedOffProgCount} fuori prog. escl.</span>`
        : "";
      if (suggestion) {
        badgeEl.innerHTML = `<span class="badge-progression">⚡ ${suggestion.text}</span>${offNote}`;
      } else {
        badgeEl.innerHTML = `<span class="badge-neutral">In attesa di dati</span>${offNote}`;
      }
    }

    const canvas = document.getElementById("exerciseChart");
    if (!canvas) return;

    if (this.exerciseChartInstance) {
      this.exerciseChartInstance.destroy();
      this.exerciseChartInstance = null;
    }

    if (labels.length === 0) {
      this.renderEmptyState(canvas, "Nessun dato registrato per questo esercizio.");
      return;
    }

    this.clearEmptyState(canvas);

    const datasets = [];
    if (metric === "both" || metric === "maxWeight") {
      datasets.push({
        label: "Carico Max (kg)",
        data: maxWeights,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        borderWidth: 3,
        tension: 0.35,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#ffffff",
        pointRadius: 5,
        pointHoverRadius: 8,
        fill: metric === "maxWeight"
      });
    }

    if (metric === "both" || metric === "oneRM") {
      datasets.push({
        label: "1RM Stimato (Epley)",
        data: oneRMs,
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        borderWidth: 3,
        borderDash: metric === "both" ? [5, 4] : [],
        tension: 0.35,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#ffffff",
        pointRadius: 5,
        pointHoverRadius: 8,
        fill: metric === "oneRM"
      });
    }

    if (window.Chart) {
      this.exerciseChartInstance = new Chart(canvas, {
        type: "line",
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: {
              labels: {
                color: "#e4e4e7",
                font: { size: 12, family: "inherit" },
                usePointStyle: true,
                boxWidth: 8
              }
            },
            tooltip: {
              backgroundColor: "#18181b",
              titleColor: "#fafafa",
              bodyColor: "#a1a1aa",
              borderColor: "#27272a",
              borderWidth: 1,
              padding: 12,
              callbacks: {
                title: items => {
                  const idx = items && items[0] ? items[0].dataIndex : 0;
                  return fullTitles[idx] || "";
                },
                label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y} kg`,
                afterBody: items => {
                  const idx = items && items[0] ? items[0].dataIndex : 0;
                  const summary = entries[idx] && entries[idx].setsSummary;
                  return summary ? `\nSerie: ${summary}` : "";
                }
              }
            }
          },
          scales: {
            x: {
              grid: { color: "#27272a" },
              ticks: { color: "#a1a1aa", font: { size: 11 } }
            },
            y: {
              grid: { color: "#27272a" },
              ticks: {
                color: "#a1a1aa",
                callback: v => `${v} kg`,
                font: { size: 11 }
              }
            }
          }
        }
      });
    } else {
      this.renderSvgLineChart(canvas, labels, maxWeights, oneRMs);
    }
  },

  /**
   * Grafico Routine: Volume totale sollevato per Settimana & Giorno
   */
  renderRoutineChart(routineFilter = "all") {
    const history = Store.getHistory();
    const ordered = this.sortByTrainingCalendar(history);

    const entries = [];
    const seenVolSlots = new Set();
    let totalVolumeSum = 0;
    let maxVolume = 0;

    ordered.forEach(session => {
      const slot = this.extractTrainingSlot(session);

      if (routineFilter !== "all") {
        if (routineFilter.startsWith("day:")) {
          const targetDay = parseInt(routineFilter.split(":")[1], 10);
          if (slot.day !== targetDay) return;
        } else if (session.routineId !== routineFilter) {
          return;
        }
      }

      const slotKey = slot.week > 0 ? `S${slot.week}_G${slot.day}` : null;
      const isDuplicateSlot = slotKey ? seenVolSlots.has(slotKey) : false;

      // Calcola il volume escludendo eventuali fondamentali (Panca/Stacco/Squat) fatti fuori programma
      const eligibleSets = (session.exercises || []).flatMap(ex => {
        if (this.isOffProgramFundamental(session, ex, isDuplicateSlot)) return [];
        return ex.sets || [];
      });
      const vol = Store.calculateVolume(eligibleSets);
      if (vol <= 0) return;

      if (slotKey) seenVolSlots.add(slotKey);
      entries.push({
        week: slot.week,
        day: slot.day,
        routineName: session.routineName || "",
        volume: vol
      });
      totalVolumeSum += vol;
      if (vol > maxVolume) maxVolume = vol;
    });

    const builtLabels = this.buildTrainingLabels(entries);
    const labels = builtLabels.map(l => l.shortLabel);
    const fullTitles = builtLabels.map(l => l.fullLabel);
    const volumes = entries.map(e => e.volume);

    const volMaxEl = document.getElementById("routine-stat-maxvol");
    const volAvgEl = document.getElementById("routine-stat-avgvol");
    const volCountEl = document.getElementById("routine-stat-count");

    if (volMaxEl) volMaxEl.textContent = maxVolume > 0 ? `${Math.round(maxVolume).toLocaleString("it-IT")} kg` : "-";
    if (volAvgEl) {
      const avg = volumes.length > 0 ? Math.round(totalVolumeSum / volumes.length) : 0;
      volAvgEl.textContent = avg > 0 ? `${avg.toLocaleString("it-IT")} kg` : "-";
    }
    if (volCountEl) volCountEl.textContent = volumes.length;

    const canvas = document.getElementById("routineChart");
    if (!canvas) return;

    if (this.routineChartInstance) {
      this.routineChartInstance.destroy();
      this.routineChartInstance = null;
    }

    if (labels.length === 0) {
      this.renderEmptyState(canvas, "Nessun allenamento registrato per questo filtro.");
      return;
    }

    this.clearEmptyState(canvas);

    if (window.Chart) {
      this.routineChartInstance = new Chart(canvas, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Volume Totale (kg)",
              data: volumes,
              backgroundColor: "rgba(59, 130, 246, 0.75)",
              borderColor: "#3b82f6",
              borderWidth: 1.5,
              borderRadius: 6,
              hoverBackgroundColor: "#2563eb"
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: "#e4e4e7", font: { size: 12 }, boxWidth: 8 }
            },
            tooltip: {
              backgroundColor: "#18181b",
              titleColor: "#fafafa",
              bodyColor: "#a1a1aa",
              borderColor: "#27272a",
              borderWidth: 1,
              padding: 12,
              callbacks: {
                title: items => {
                  const idx = items && items[0] ? items[0].dataIndex : 0;
                  return fullTitles[idx] || "";
                },
                label: ctx => ` Volume: ${Math.round(ctx.parsed.y).toLocaleString("it-IT")} kg`
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: "#a1a1aa", font: { size: 10 } }
            },
            y: {
              grid: { color: "#27272a" },
              ticks: {
                color: "#a1a1aa",
                callback: v => `${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v} kg`,
                font: { size: 11 }
              }
            }
          }
        }
      });
    }
  },

  renderEmptyState(canvas, message) {
    const parent = canvas.parentElement;
    if (parent) {
      canvas.style.display = "none";
      const existing = parent.querySelector(".chart-empty-msg");
      if (existing) existing.remove();
      const div = document.createElement("div");
      div.className = "chart-empty-msg";
      div.textContent = message;
      parent.appendChild(div);
    }
  },

  renderSvgLineChart(canvas, labels, maxWeights, oneRMs) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width = canvas.parentElement.clientWidth;
    const h = canvas.height = canvas.parentElement.clientHeight || 240;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "12px sans-serif";
    ctx.fillText("Caricamento visualizzazione grafica...", 20, h / 2);
  }
};
