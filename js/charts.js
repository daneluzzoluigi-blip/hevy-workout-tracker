/**
 * Charts - Grafici interattivi con Chart.js per Carico Massimo, 1RM Epley e Volume Routine
 */

const ChartsManager = {
  exerciseChartInstance: null,
  routineChartInstance: null,

  formatShortDate(isoString) {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
    } catch (e) {
      return isoString;
    }
  },

  init() {
    this.populateSelectors();
    this.renderCurrentCharts();
  },

  populateSelectors() {
    const history = Store.getHistory();
    const routines = Store.getRoutines();

    // 1. Elenco esercizi unici (prima quelli presenti nello storico con dati reali)
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

    // 2. Elenco filtri per grafico volume (Tutte + per Giorno 1–4 + eventuali schede personalizzate)
    const routineSelect = document.getElementById("chart-routine-select");
    if (routineSelect) {
      const currentRoutine = routineSelect.value;
      routineSelect.innerHTML = `
        <option value="all">Tutte le Sessioni</option>
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
   * Grafico Esercizio: Carico Massimo (kg) e 1RM stimato (Epley) nel tempo
   */
  renderExerciseChart(exerciseName, metric = "both") {
    const history = Store.getHistory();
    const chronological = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = [];
    const maxWeights = [];
    const oneRMs = [];

    let allTimeMaxWeight = 0;
    let allTimeMax1RM = 0;

    chronological.forEach(session => {
      if (!session.exercises) return;
      const ex = session.exercises.find(e => Store.isExerciseNameMatch(e.name, exerciseName));
      if (ex && ex.sets) {
        const validSets = ex.sets.filter(s => s.completed && Number(s.weight) > 0);
        if (validSets.length > 0) {
          const maxW = Math.max(...validSets.map(s => Number(s.weight)));
          let sessionMax1RM = 0;
          validSets.forEach(s => {
            const epley = Store.calculate1RM(s.weight, s.reps);
            if (epley > sessionMax1RM) sessionMax1RM = epley;
          });

          if (maxW > allTimeMaxWeight) allTimeMaxWeight = maxW;
          if (sessionMax1RM > allTimeMax1RM) allTimeMax1RM = sessionMax1RM;

          const wkTag = session.week ? `S${session.week} · ` : "";
          labels.push(`${wkTag}${this.formatShortDate(session.date)}`);
          maxWeights.push(maxW);
          oneRMs.push(sessionMax1RM);
        }
      }
    });

    const prEl = document.getElementById("ex-stat-pr");
    const rmEl = document.getElementById("ex-stat-1rm");
    const countEl = document.getElementById("ex-stat-count");
    const badgeEl = document.getElementById("ex-stat-progression");

    if (prEl) prEl.textContent = allTimeMaxWeight > 0 ? `${allTimeMaxWeight} kg` : "-";
    if (rmEl) rmEl.textContent = allTimeMax1RM > 0 ? `${allTimeMax1RM} kg` : "-";
    if (countEl) countEl.textContent = labels.length;

    if (badgeEl) {
      const suggestion = Store.getProgressiveOverloadSuggestion(exerciseName);
      if (suggestion) {
        badgeEl.innerHTML = `<span class="badge-progression">⚡ ${suggestion.text}</span>`;
      } else {
        badgeEl.innerHTML = `<span class="badge-neutral">In attesa di dati</span>`;
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
                label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y} kg`
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
   * Grafico Routine: Volume totale sollevato per sessione
   */
  renderRoutineChart(routineFilter = "all") {
    const history = Store.getHistory();
    const chronological = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = [];
    const volumes = [];
    let totalVolumeSum = 0;
    let maxVolume = 0;

    chronological.forEach(session => {
      if (routineFilter !== "all") {
        if (routineFilter.startsWith("day:")) {
          const targetDay = parseInt(routineFilter.split(":")[1], 10);
          const sessionDay = session.dayNumber || (() => {
            const m = (session.routineName || "").match(/giorno\s*(\d)/i);
            return m ? parseInt(m[1], 10) : null;
          })();
          if (sessionDay !== targetDay) return;
        } else if (session.routineId !== routineFilter) {
          return;
        }
      }

      const vol = session.totalVolumeKg || Store.calculateVolume(
        (session.exercises || []).flatMap(e => e.sets || [])
      );
      if (vol <= 0) return;

      const wkTag = session.week ? `S${session.week} ` : "";
      const dayTag = session.dayNumber ? `G${session.dayNumber} · ` : "";
      labels.push(`${wkTag}${dayTag}${this.formatShortDate(session.date)}`);
      volumes.push(vol);
      totalVolumeSum += vol;
      if (vol > maxVolume) maxVolume = vol;
    });

    const volMaxEl = document.getElementById("routine-stat-maxvol");
    const volAvgEl = document.getElementById("routine-stat-avgvol");
    const volCountEl = document.getElementById("routine-stat-count");

    if (volMaxEl) volMaxEl.textContent = maxVolume > 0 ? `${maxVolume.toLocaleString("it-IT")} kg` : "-";
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
                label: ctx => ` Volume: ${ctx.parsed.y.toLocaleString("it-IT")} kg`
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
