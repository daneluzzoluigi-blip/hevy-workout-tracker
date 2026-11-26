/**
 * ReportManager - Motore di confronto Programmato vs Eseguito & Esportazione PDF pulita
 * Genera:
 *  1) Riepilogo KPI (Sessioni, Chiusi, Superati, Parziali, Saltati)
 *  2) Tabella evidenziata "Cosa NON ho chiuso / Parziali / Saltati"
 *  3) Dettaglio completo ordinato per Calendario di Allenamento (Settimana → Giorno)
 *  4) Esportazione PDF A4 vettoriale (jsPDF + AutoTable) + condivisione nativa iPhone
 */

const ReportManager = {
  currentFilter: "all", // "all" | "1-4" | "5-8" | "5" | "6" | "7" | "8" ...

  /**
   * Restituisce i target ORIGINALI prescritti dall'allenatore (non sovrascritti dai log)
   * per confrontare in modo esatto ciò che è stato chiuso vs ciò che non è stato chiuso.
   */
  getOriginalProgrammedExercise(week, dayNumber, exerciseName, routineId) {
    // 1. Casi in cui buildBlock2Routines precompilava i log parziali: usiamo il target prescritto esatto
    const w = Number(week) || 0;
    const d = Number(dayNumber) || 0;
    const norm = Store.normalizeExerciseName(exerciseName);

    if (w >= 5 && w <= 8) {
      const idx = w - 5;
      if (d === 1 && norm.includes("stacco sumo")) {
        const topKg = [132.5, 140, 147.5, 155][idx];
        const topRep = [5, 4, 3, 2][idx];
        const backKg = [120, 125, 132.5, 140][idx];
        return {
          label: `1×${topRep} ${topKg}kg + 2×5 ${backKg}kg`,
          sets: [
            { weight: topKg, reps: topRep },
            { weight: backKg, reps: 5 },
            { weight: backKg, reps: 5 }
          ]
        };
      }
      if (d === 1 && norm.includes("low row")) {
        const rep = [10, 9, 8, 7][idx];
        return {
          label: `2×${rep} (RIR1)`,
          sets: [{ weight: 0, reps: rep }, { weight: 0, reps: rep }]
        };
      }
      if (d === 1 && norm.includes("curl su panca")) {
        const rep = [8, 7, 6, 5][idx];
        return {
          label: `2×${rep} (RIR1)`,
          sets: [{ weight: 0, reps: rep }, { weight: 0, reps: rep }]
        };
      }
      if (d === 2 && norm.includes("panca piana") && norm.includes("fermo 1")) {
        const kg = [95, 97.5, 100, 102.5][idx];
        const rep = [5, 5, 4, 4][idx];
        return {
          label: `4×${rep} @ ${kg}kg`,
          sets: Array.from({ length: 4 }, () => ({ weight: kg, reps: rep }))
        };
      }
      if (d === 2 && norm.includes("chest press panatta")) {
        const rep = [8, 7, 6, 5][idx];
        return {
          label: `1×${rep}`,
          sets: [{ weight: 0, reps: rep }]
        };
      }
      if (d === 3 && norm.includes("squat low bar")) {
        const setsN = [4, 3, 4, 3][idx];
        const rep = [7, 7, 6, 6][idx];
        const kg = [92.5, 97.5, 100, 102.5][idx];
        return {
          label: `${setsN}×${rep} @ ${kg}kg`,
          sets: Array.from({ length: setsN }, () => ({ weight: kg, reps: rep }))
        };
      }
      if (d === 4 && norm.includes("lat machine")) {
        const repsArr = [[8, 10, 12], [9, 11, 13], [10, 12, 14], [11, 13, 15]][idx];
        return {
          label: `100×${repsArr[0]} / 80×${repsArr[1]} / 65×${repsArr[2]}`,
          sets: [
            { weight: 100, reps: repsArr[0] },
            { weight: 80, reps: repsArr[1] },
            { weight: 65, reps: repsArr[2] }
          ]
        };
      }
      if (d === 4 && norm.includes("chest press inclinata")) {
        return {
          label: `7×8–12 @ 60kg (FST-7)`,
          sets: Array.from({ length: 7 }, () => ({ weight: 60, reps: 8 }))
        };
      }
    }

    // 2. Altrimenti cerca nella routine predefinita originale (DEFAULT_ROUTINES)
    let templateRoutine = null;
    if (typeof DEFAULT_ROUTINES !== "undefined") {
      if (routineId) {
        templateRoutine = DEFAULT_ROUTINES.find(r => r.id === routineId);
      }
      if (!templateRoutine && w > 0 && d > 0) {
        templateRoutine = DEFAULT_ROUTINES.find(r => Number(r.week) === w && Number(r.dayNumber) === d);
      }
    }
    if (!templateRoutine && routineId) {
      templateRoutine = Store.getRoutineById(routineId);
    }

    if (!templateRoutine || !templateRoutine.exercises) return null;
    const foundEx = templateRoutine.exercises.find(e => Store.isExerciseNameMatch(e.name, exerciseName));
    if (!foundEx || !foundEx.sets || foundEx.sets.length === 0) return null;

    return {
      label: this.formatTargetSets(foundEx.sets),
      sets: foundEx.sets.map(s => ({ weight: Number(s.weight) || 0, reps: Number(s.reps) || 0 }))
    };
  },

  formatTargetSets(sets) {
    if (!sets || sets.length === 0) return "-";
    const first = sets[0];
    const sameW = sets.every(s => Number(s.weight) === Number(first.weight));
    const sameR = sets.every(s => Number(s.reps) === Number(first.reps));
    if (sameW && sameR) {
      return Number(first.weight) > 0
        ? `${sets.length}×${first.reps} @ ${first.weight}kg`
        : `${sets.length}×${first.reps}`;
    }
    return sets.map(s => (Number(s.weight) > 0 ? `${s.weight}kg×${s.reps}` : `${s.reps}rep`)).join(" / ");
  },

  formatActualSets(sets) {
    const done = (sets || []).filter(s => s.completed);
    if (done.length === 0) return "Nessuna serie";
    const first = done[0];
    const sameW = done.every(s => Number(s.weight) === Number(first.weight));
    const sameR = done.every(s => Number(s.reps) === Number(first.reps));
    if (sameW && sameR && done.length > 1) {
      return Number(first.weight) > 0
        ? `${done.length}×${first.reps} @ ${first.weight}kg`
        : `${done.length}×${first.reps}`;
    }
    return done.map(s => (Number(s.weight) > 0 ? `${s.weight}×${s.reps}` : `${s.reps}rep`)).join(", ");
  },

  /**
   * Confronta le serie eseguite con il target programmato.
   * Restituisce: { status: "closed"|"exceeded"|"partial"|"missed"|"free", statusLabel, diffText }
   */
  evaluateExercise(target, actualSets, notes = "") {
    const doneSets = (actualSets || []).filter(s => s.completed);
    const lowerNote = (notes || "").toLowerCase();

    // 0 serie completate => Saltato / Non chiuso
    if (doneSets.length === 0) {
      const tCount = target && target.sets ? target.sets.length : 0;
      return {
        status: "missed",
        statusLabel: "SALTATO",
        diffText: tCount > 0 ? `0/${tCount} serie eseguite` : "Non eseguito"
      };
    }

    // Nessun target predefinito (es. esercizio extra / sessione libera)
    if (!target || !target.sets || target.sets.length === 0) {
      return {
        status: "free",
        statusLabel: "EXTRA",
        diffText: `${doneSets.length} serie registrate`
      };
    }

    const tSets = target.sets;
    const issues = [];
    const positives = [];

    // 1. Controlla numero di serie completate
    if (doneSets.length < tSets.length) {
      const missingSets = tSets.length - doneSets.length;
      issues.push(`${doneSets.length}/${tSets.length} serie (-${missingSets} ${missingSets === 1 ? "serie" : "serie"})`);
    } else if (doneSets.length > tSets.length) {
      positives.push(`+${doneSets.length - tSets.length} serie extra`);
    }

    // 2. Controlla rep e carico serie per serie
    const pairs = Math.min(doneSets.length, tSets.length);
    let hasWeightExceeded = false;
    let hasRepExceeded = false;

    for (let i = 0; i < pairs; i++) {
      const t = tSets[i];
      const a = doneSets[i];
      const tW = Number(t.weight) || 0;
      const aW = Number(a.weight) || 0;
      const tR = Number(t.reps) || 0;
      const aR = Number(a.reps) || 0;

      // Controllo carico (solo se il programma fissava un peso > 0)
      if (tW > 0 && aW > 0) {
        if (aW < tW) {
          const diffW = Math.round((tW - aW) * 100) / 100;
          issues.push(`S${i + 1}: -${diffW}kg (${aW}/${tW}kg)`);
        } else if (aW > tW) {
          const diffW = Math.round((aW - tW) * 100) / 100;
          hasWeightExceeded = true;
          positives.push(`S${i + 1}: +${diffW}kg (${aW}kg)`);
        }
      }

      // Controllo ripetizioni (solo se il carico non è stato aumentato sopra target)
      if (tR > 0 && aR < tR && !(tW > 0 && aW > tW)) {
        issues.push(`S${i + 1}: ${aR}/${tR} rep (-${tR - aR})`);
      } else if (tR > 0 && aR > tR) {
        hasRepExceeded = true;
        positives.push(`S${i + 1}: +${aR - tR} rep`);
      }
    }

    // Controlla eventuali segnalazioni esplicite di stop/dolore nelle note
    const hasPainWarning = /basta per|impossibile|mal di schiena|dolor|senza fermo/.test(lowerNote);

    if (issues.length > 0) {
      // Caso speciale: carico superato ma meno serie (es. Stacco Sumo 160x2 / 170x2 senza back-off)
      if (hasWeightExceeded) {
        return {
          status: "partial",
          statusLabel: "PR / PARZIALE",
          diffText: [...positives.slice(0, 2), ...issues.slice(0, 2)].join(" • ")
        };
      }
      return {
        status: "partial",
        statusLabel: "NON CHIUSO",
        diffText: issues.slice(0, 3).join(" • ")
      };
    }

    if (hasWeightExceeded || hasRepExceeded || positives.length > 0) {
      return {
        status: "exceeded",
        statusLabel: "SUPERATO",
        diffText: positives.slice(0, 3).join(" • ")
      };
    }

    return {
      status: "closed",
      statusLabel: hasPainWarning ? "CHIUSO (NOTA)" : "CHIUSO",
      diffText: "Target completato"
    };
  },

  /**
   * Costruisce i dati strutturati completi per preview e PDF
   */
  buildReportData(filter = "all") {
    const allHistory = Store.getHistory();
    const ordered = ChartsManager.sortByTrainingCalendar(allHistory);

    const filteredSessions = ordered.filter(session => {
      const slot = ChartsManager.extractTrainingSlot(session);
      if (filter === "all") return true;
      if (filter === "1-4") return slot.week >= 1 && slot.week <= 4;
      if (filter === "5-8") return slot.week >= 5 && slot.week <= 8;
      return String(slot.week) === String(filter);
    });

    const stats = {
      totalSessions: filteredSessions.length,
      totalSetsCompleted: 0,
      totalVolumeKg: 0,
      closedCount: 0,
      exceededCount: 0,
      partialCount: 0,
      missedCount: 0,
      freeCount: 0
    };

    const issuesSummary = [];
    const sessionReports = [];

    filteredSessions.forEach(session => {
      const slot = ChartsManager.extractTrainingSlot(session);
      const slotLabel = slot.week > 0
        ? (slot.day > 0 ? `Sett ${slot.week} • Giorno ${slot.day}` : `Sett ${slot.week}`)
        : "Sessione Libera";

      const rows = [];
      let sessionVol = 0;
      let sessionSets = 0;

      (session.exercises || []).forEach(ex => {
        const target = this.getOriginalProgrammedExercise(slot.week, slot.day, ex.name, session.routineId);
        const evaluation = this.evaluateExercise(target, ex.sets, ex.notes);
        const doneSets = (ex.sets || []).filter(s => s.completed);

        doneSets.forEach(s => {
          sessionSets++;
          sessionVol += (Number(s.weight) || 0) * (Number(s.reps) || 0);
        });

        if (evaluation.status === "closed") stats.closedCount++;
        else if (evaluation.status === "exceeded") stats.exceededCount++;
        else if (evaluation.status === "partial") stats.partialCount++;
        else if (evaluation.status === "missed") stats.missedCount++;
        else stats.freeCount++;

        const row = {
          slotLabel,
          week: slot.week,
          day: slot.day,
          exerciseName: ex.name,
          programmed: target ? target.label : "Libero / Extra",
          actual: this.formatActualSets(ex.sets),
          status: evaluation.status,
          statusLabel: evaluation.statusLabel,
          diffText: evaluation.diffText,
          notes: (ex.notes || "").trim()
        };

        rows.push(row);

        // Inserisci nel box critico in cima se NON CHIUSO, PARZIALE, SALTATO o nota infortunio/dolore
        const hasPainNote = /mal di schiena|gomiti|braccio|dolor|non lo farò|senza fermo/i.test(row.notes);
        if (evaluation.status === "partial" || evaluation.status === "missed" || hasPainNote) {
          issuesSummary.push(row);
        }
      });

      stats.totalSetsCompleted += sessionSets;
      stats.totalVolumeKg += Math.round(sessionVol);

      sessionReports.push({
        id: session.id,
        slotLabel,
        week: slot.week,
        day: slot.day,
        title: session.routineName || slotLabel,
        durationMinutes: session.durationMinutes || 0,
        volumeKg: Math.round(sessionVol || session.totalVolumeKg || 0),
        setsCount: sessionSets,
        rows
      });
    });

    const filterLabels = {
      all: "Tutte le Settimane",
      "1-4": "Blocco 1 (Sett 1–4)",
      "5-8": "Blocco 2 (Sett 5–8)"
    };

    return {
      generatedAt: new Date(),
      filter,
      filterLabel: filterLabels[filter] || `Settimana ${filter}`,
      stats,
      issuesSummary,
      sessions: sessionReports
    };
  },

  openModal() {
    this.currentFilter = "all";
    const modal = document.getElementById("modal-results-report");
    if (!modal) return;
    this.renderPreview();
    modal.classList.add("open");
  },

  setFilter(filterVal) {
    this.currentFilter = filterVal;
    this.renderPreview();
  },

  renderPreview() {
    const filterWrap = document.getElementById("report-filter-chips");
    const previewContainer = document.getElementById("report-preview-content");
    if (!previewContainer) return;

    const allHistory = Store.getHistory();
    const availableWeeks = Array.from(
      new Set(allHistory.map(s => ChartsManager.extractTrainingSlot(s).week).filter(w => w > 0))
    ).sort((a, b) => a - b);

    if (filterWrap) {
      const chips = [
        { val: "all", label: "Tutte" },
        { val: "1-4", label: "Sett 1–4" },
        { val: "5-8", label: "Sett 5–8" },
        ...availableWeeks.map(w => ({ val: String(w), label: `Sett ${w}` }))
      ];
      filterWrap.innerHTML = chips.map(c => `
        <button type="button" class="filter-chip ${this.currentFilter === c.val ? 'active' : ''}" onclick="ReportManager.setFilter('${c.val}')">
          ${c.label}
        </button>
      `).join("");
    }

    const report = this.buildReportData(this.currentFilter);
    const { stats, issuesSummary, sessions } = report;

    if (sessions.length === 0) {
      previewContainer.innerHTML = `
        <div class="card text-center" style="padding: 28px 16px;">
          <p style="color: var(--text-secondary);">Nessun allenamento registrato per questo filtro.</p>
        </div>
      `;
      return;
    }

    const closedTotal = stats.closedCount + stats.exceededCount;
    const notClosedTotal = stats.partialCount + stats.missedCount;

    const badgeClass = (status) => {
      if (status === "closed") return "rep-badge-closed";
      if (status === "exceeded") return "rep-badge-exceeded";
      if (status === "partial") return "rep-badge-partial";
      if (status === "missed") return "rep-badge-missed";
      return "rep-badge-free";
    };

    const issuesHtml = issuesSummary.length > 0
      ? `
        <div class="report-issues-box">
          <div class="report-block-title" style="color: #fbbf24;">⚠️ Punti di attenzione (Non chiusi / Parziali / Note)</div>
          ${issuesSummary.map(item => `
            <div class="report-issue-row">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px;">
                <strong style="font-size: 0.82rem; color: var(--text-primary);">${App.escapeHtml(item.slotLabel)} — ${App.escapeHtml(item.exerciseName)}</strong>
                <span class="rep-badge ${badgeClass(item.status)}">${App.escapeHtml(item.statusLabel)}</span>
              </div>
              <div style="font-size: 0.74rem; color: var(--text-secondary); margin-top: 2px;">
                Target: <span style="font-family: var(--font-mono);">${App.escapeHtml(item.programmed)}</span> → Fatto: <span style="font-family: var(--font-mono); color: var(--text-primary);">${App.escapeHtml(item.actual)}</span>
              </div>
              <div style="font-size: 0.73rem; color: #fbbf24; margin-top: 2px;">
                ${App.escapeHtml(item.diffText)}${item.notes ? ` • ${App.escapeHtml(item.notes)}` : ""}
              </div>
            </div>
          `).join("")}
        </div>
      `
      : `<div class="card" style="border-color: rgba(16,185,129,0.35); color: #34d399; font-size: 0.82rem; padding: 10px 12px;">✓ Tutti gli esercizi in questo periodo sono stati chiusi senza criticità!</div>`;

    const sessionsHtml = sessions.map(sess => `
      <div class="report-session-card">
        <div class="report-session-head">
          <div>
            <span class="routine-week-badge">${App.escapeHtml(sess.slotLabel)}</span>
            <div style="font-weight: 700; font-size: 0.9rem; margin-top: 4px;">${App.escapeHtml(sess.title)}</div>
          </div>
          <div style="text-align: right; font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-secondary);">
            <div>${sess.volumeKg.toLocaleString("it-IT")} kg</div>
            <div>${sess.setsCount} serie</div>
          </div>
        </div>
        <div class="report-ex-list">
          ${sess.rows.map(r => `
            <div class="report-ex-row">
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px;">
                <strong style="font-size: 0.82rem;">${App.escapeHtml(r.exerciseName)}</strong>
                <span class="rep-badge ${badgeClass(r.status)}">${App.escapeHtml(r.statusLabel)}</span>
              </div>
              <div class="report-ex-grid">
                <div><span class="rep-lbl">Target:</span> ${App.escapeHtml(r.programmed)}</div>
                <div><span class="rep-lbl">Fatto:</span> <strong>${App.escapeHtml(r.actual)}</strong></div>
              </div>
              ${r.status !== "closed" || r.notes ? `
                <div class="report-ex-diff">
                  ${r.diffText && r.diffText !== "Target completato" ? `<span style="color: ${r.status === 'exceeded' ? '#60a5fa' : '#fbbf24'}; font-weight: 600;">${App.escapeHtml(r.diffText)}</span>` : ""}
                  ${r.notes ? `<span style="color: var(--text-secondary);">${r.diffText && r.diffText !== "Target completato" ? " • " : ""}${App.escapeHtml(r.notes)}</span>` : ""}
                </div>
              ` : ""}
            </div>
          `).join("")}
        </div>
      </div>
    `).join("");

    previewContainer.innerHTML = `
      <div class="report-kpi-grid">
        <div class="stat-box">
          <div class="stat-box-val">${stats.totalSessions}</div>
          <div class="stat-box-lbl">Sessioni</div>
        </div>
        <div class="stat-box">
          <div class="stat-box-val" style="color: #34d399;">${closedTotal}</div>
          <div class="stat-box-lbl">Chiusi / PR</div>
        </div>
        <div class="stat-box">
          <div class="stat-box-val" style="color: #fbbf24;">${notClosedTotal}</div>
          <div class="stat-box-lbl">Non Chiusi</div>
        </div>
        <div class="stat-box">
          <div class="stat-box-val">${(stats.totalVolumeKg / 1000).toFixed(1)}t</div>
          <div class="stat-box-lbl">Volume Tot</div>
        </div>
      </div>

      ${issuesHtml}

      <div class="report-block-title" style="margin-top: 14px;">📋 Dettaglio Completo (Settimana → Giorno)</div>
      ${sessionsHtml}
    `;
  },

  /**
   * Pulisce eventuali emoji o caratteri non supportati dal font PDF standard Helvetica
   */
  cleanPdfText(str) {
    if (!str) return "";
    return String(str)
      .replace(/→/g, "->")
      .replace(/[–—]/g, "-")
      .replace(/•/g, "-")
      .replace(/×/g, "x")
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .replace(/[^\x20-\x7E\xA0-\xFF]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  },

  /**
   * Genera il documento PDF A4 pulito e ordinato tramite jsPDF + AutoTable
   */
  buildPdfDocument(report) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      return null;
    }
    const clean = (s) => this.cleanPdfText(s);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 12;

    // 1. Intestazione elegante
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("REPORT RISULTATI ALLENAMENTO", margin, 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    const dateStr = report.generatedAt.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
    doc.text(clean(`Atleta: Luigi  |  Periodo: ${report.filterLabel}  |  Generato il ${dateStr}`), margin, 19);
    doc.text("Ordinato per Calendario di Allenamento (Settimana -> Giorno)", margin, 24);

    // 2. 4 Box KPI puliti
    const kpiY = 33;
    const boxGap = 4;
    const boxW = (pageW - margin * 2 - boxGap * 3) / 4;
    const closedTotal = report.stats.closedCount + report.stats.exceededCount;
    const notClosedTotal = report.stats.partialCount + report.stats.missedCount;

    const kpis = [
      { label: "SESSIONI", value: String(report.stats.totalSessions), color: [30, 41, 59] },
      { label: "CHIUSI / SUPERATI", value: String(closedTotal), color: [5, 150, 105] },
      { label: "NON CHIUSI / SALTATI", value: String(notClosedTotal), color: [217, 119, 6] },
      { label: "VOLUME TOTALE", value: `${report.stats.totalVolumeKg.toLocaleString("it-IT")} kg`, color: [37, 99, 235] }
    ];

    kpis.forEach((k, idx) => {
      const x = margin + idx * (boxW + boxGap);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, kpiY, boxW, 16, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(k.color[0], k.color[1], k.color[2]);
      doc.text(clean(k.value), x + boxW / 2, kpiY + 7.5, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(clean(k.label), x + boxW / 2, kpiY + 13, { align: "center" });
    });

    let cursorY = kpiY + 22;

    // 3. Sezione Evidenza: NON CHIUSI / PARZIALI / NOTE CRITICHE
    if (report.issuesSummary.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(180, 83, 9);
      doc.text("1. PUNTI DI ATTENZIONE (NON CHIUSI, PARZIALI E NOTE)", margin, cursorY);
      cursorY += 3;

      doc.autoTable({
        startY: cursorY,
        margin: { left: margin, right: margin },
        head: [["Sett / Giorno", "Esercizio", "Programmato", "Eseguito", "Esito & Dettaglio"]],
        body: report.issuesSummary.map(item => [
          clean(item.slotLabel),
          clean(item.exerciseName),
          clean(item.programmed),
          clean(item.actual),
          clean(`${item.statusLabel}: ${item.diffText}${item.notes ? " | " + item.notes : ""}`)
        ]),
        theme: "grid",
        styles: { fontSize: 7.8, cellPadding: 2.2, textColor: [30, 41, 59], lineColor: [226, 232, 240] },
        headStyles: { fillColor: [254, 243, 199], textColor: [146, 64, 14], fontStyle: "bold" },
        columnStyles: {
          0: { cellWidth: 26, fontStyle: "bold" },
          1: { cellWidth: 36, fontStyle: "bold" },
          2: { cellWidth: 28 },
          3: { cellWidth: 32 },
          4: { cellWidth: "auto" }
        },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 4) {
            const val = String(data.cell.raw || "");
            if (val.startsWith("SALTATO")) data.cell.styles.textColor = [185, 28, 28];
            else if (val.startsWith("NON CHIUSO") || val.startsWith("PR / PARZIALE")) data.cell.styles.textColor = [180, 83, 9];
          }
        }
      });

      cursorY = doc.lastAutoTable.finalY + 8;
    }

    // 4. Sezione Dettaglio Completo per Settimana -> Giorno
    if (cursorY > 255) {
      doc.addPage();
      cursorY = 16;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("2. DETTAGLIO COMPLETO PER SETTIMANA E GIORNO", margin, cursorY);
    cursorY += 4;

    report.sessions.forEach((sess) => {
      if (cursorY > 250) {
        doc.addPage();
        cursorY = 16;
      }

      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, cursorY, pageW - margin * 2, 7.5, 1.5, 1.5, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.8);
      doc.setTextColor(15, 23, 42);
      doc.text(clean(sess.title), margin + 2.5, cursorY + 5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(clean(`${sess.setsCount} serie  |  Volume: ${sess.volumeKg.toLocaleString("it-IT")} kg`), pageW - margin - 2.5, cursorY + 5, { align: "right" });

      cursorY += 8.5;

      doc.autoTable({
        startY: cursorY,
        margin: { left: margin, right: margin },
        head: [["Esercizio", "Programmato", "Eseguito", "Esito", "Scostamento / Note"]],
        body: sess.rows.map(r => [
          clean(r.exerciseName),
          clean(r.programmed),
          clean(r.actual),
          clean(r.statusLabel),
          clean([r.diffText !== "Target completato" ? r.diffText : "", r.notes].filter(Boolean).join(" | ") || "-")
        ]),
        theme: "striped",
        styles: { fontSize: 7.8, cellPadding: 2, textColor: [30, 41, 59], lineColor: [226, 232, 240] },
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 40, fontStyle: "bold" },
          1: { cellWidth: 32 },
          2: { cellWidth: 34 },
          3: { cellWidth: 23, fontStyle: "bold", halign: "center" },
          4: { cellWidth: "auto" }
        },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 3) {
            const label = String(data.cell.raw || "");
            if (label.startsWith("CHIUSO")) {
              data.cell.styles.textColor = [5, 150, 105];
              data.cell.styles.fillColor = [236, 253, 245];
            } else if (label === "SUPERATO") {
              data.cell.styles.textColor = [29, 78, 216];
              data.cell.styles.fillColor = [239, 246, 255];
            } else if (label.includes("NON CHIUSO") || label.includes("PARZIALE")) {
              data.cell.styles.textColor = [180, 83, 9];
              data.cell.styles.fillColor = [255, 251, 235];
            } else if (label === "SALTATO") {
              data.cell.styles.textColor = [185, 28, 28];
              data.cell.styles.fillColor = [254, 242, 242];
            }
          }
        }
      });

      cursorY = doc.lastAutoTable.finalY + 5;
    });

    // 5. Numeri di pagina nel footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text("HevyTrack - Report Allenamento Luigi", margin, 291);
      doc.text(`Pagina ${p} di ${totalPages}`, pageW - margin, 291, { align: "right" });
    }

    return doc;
  },

  async downloadPdf(shareIfSupported = false) {
    const report = this.buildReportData(this.currentFilter);
    if (report.sessions.length === 0) {
      App.showToast("Nessuna sessione da esportare per questo filtro.");
      return;
    }

    const doc = this.buildPdfDocument(report);
    if (!doc) {
      App.showToast("Libreria PDF non caricata: apro la stampa del foglio.");
      window.print();
      return;
    }

    const dateTag = report.generatedAt.toISOString().slice(0, 10);
    const filterTag = this.currentFilter === "all" ? "completo" : `sett_${this.currentFilter}`;
    const filename = `Risultati_Allenamento_${filterTag}_${dateTag}.pdf`;

    // Se richiesto "Condividi" su iPhone (WhatsApp, File, ecc.)
    if (shareIfSupported && navigator.share && navigator.canShare) {
      try {
        const blob = doc.output("blob");
        const file = new File([blob], filename, { type: "application/pdf" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Report Risultati Allenamento",
            text: `Report allenamento (${report.filterLabel})`,
            files: [file]
          });
          App.showToast("PDF condiviso!");
          return;
        }
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }

    // Download diretto del PDF (compatibile Desktop + Safari iOS)
    doc.save(filename);
    App.showToast(`📄 PDF scaricato: ${filename}`);
  }
};
