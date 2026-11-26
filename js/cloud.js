/**
 * CloudSync - Sincronizzazione Cloud in Tempo Reale con Firebase Firestore
 * - Offline-first: salva sempre in localStorage, sincronizza appena online
 * - Smart Union Merge: unisce storico e schede tra iPhone, Mac e link Allenatore senza mai perdere allenamenti
 * - Real-time onSnapshot: aggiornamenti istantanei senza dover ricaricare la pagina
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDbTimyH0p74tGwi-MWmA2RQPeOMOj-Zq8",
  authDomain: "hevy-tracker-luigi.firebaseapp.com",
  projectId: "hevy-tracker-luigi",
  storageBucket: "hevy-tracker-luigi.firebasestorage.app",
  messagingSenderId: "306085115402",
  appId: "1:306085115402:web:bba3f4c570dcd28c0991f3"
};

const CloudSync = {
  db: null,
  initialized: false,
  deviceId: null,
  status: "connecting", // "connecting" | "synced" | "syncing" | "offline" | "error"
  lastSyncAt: null,
  unsubHistory: null,
  unsubRoutines: null,
  isApplyingRemote: false,
  pushHistoryTimer: null,
  pushRoutinesTimer: null,
  COLLECTION: "hevy_sync",
  DOC_HISTORY: "luigi_history",
  DOC_ROUTINES: "luigi_routines",

  getOrCreateDeviceId() {
    let id = localStorage.getItem("hevy_device_id_v1");
    if (!id) {
      id = "dev_" + Math.random().toString(36).slice(2, 10) + "_" + Date.now().toString(36);
      localStorage.setItem("hevy_device_id_v1", id);
    }
    return id;
  },

  init() {
    if (typeof IS_DEMO_MODE !== "undefined" && IS_DEMO_MODE) {
      this.initialized = false;
      this.updateStatusUI("demo");
      return;
    }

    this.deviceId = this.getOrCreateDeviceId();
    this.updateStatusUI("connecting");

    window.addEventListener("online", () => {
      this.updateStatusUI("syncing");
      this.syncNow(false);
    });
    window.addEventListener("offline", () => {
      this.updateStatusUI("offline");
    });

    if (typeof firebase === "undefined" || !firebase.firestore) {
      console.warn("Firebase SDK non caricato (modalità offline).");
      this.updateStatusUI("offline");
      return;
    }

    try {
      if (!firebase.apps || firebase.apps.length === 0) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      this.db = firebase.firestore();
      this.initialized = true;
      this.startRealtimeListeners();
    } catch (err) {
      console.error("Errore inizializzazione Firebase:", err);
      this.updateStatusUI("error");
    }
  },

  startRealtimeListeners() {
    if (!this.db) return;

    const histRef = this.db.collection(this.COLLECTION).doc(this.DOC_HISTORY);
    const routRef = this.db.collection(this.COLLECTION).doc(this.DOC_ROUTINES);

    // 1. Listener in tempo reale sullo Storico Allenamenti
    if (this.unsubHistory) this.unsubHistory();
    this.unsubHistory = histRef.onSnapshot(
      (doc) => {
        if (!doc.exists) {
          // Prima inizializzazione del cloud: carica i dati locali sul cloud
          this.pushHistoryNow();
          return;
        }
        const remote = doc.data() || {};
        this.handleRemoteHistory(remote);
      },
      (err) => {
        console.error("Firestore history listener error:", err);
        this.updateStatusUI(navigator.onLine ? "error" : "offline");
      }
    );

    // 2. Listener in tempo reale sulle Schede / Routine
    if (this.unsubRoutines) this.unsubRoutines();
    this.unsubRoutines = routRef.onSnapshot(
      (doc) => {
        if (!doc.exists) {
          this.pushRoutinesNow();
          return;
        }
        const remote = doc.data() || {};
        this.handleRemoteRoutines(remote);
      },
      (err) => {
        console.error("Firestore routines listener error:", err);
        this.updateStatusUI(navigator.onLine ? "error" : "offline");
      }
    );
  },

  /**
   * Smart Union Merge per lo Storico Allenamenti:
   * Preserva OGNI sessione presente sia in locale (es. allenamento di ieri su iPhone)
   * sia nel cloud, rispettando solo le cancellazioni esplicite.
   */
  handleRemoteHistory(remote) {
    const remoteHistory = Array.isArray(remote.history) ? remote.history : [];
    const remoteDeleted = Array.isArray(remote.deletedIds) ? remote.deletedIds : [];
    const localHistory = Store.getHistory();
    const localDeleted = Store.getDeletedHistoryIds();

    const deletedSet = new Set([...localDeleted, ...remoteDeleted]);
    const mergedMap = new Map();
    const remoteIds = new Set();

    // 1. Inserisci sessioni dal cloud
    remoteHistory.forEach(s => {
      if (!s || !s.id || deletedSet.has(s.id) || LEGACY_SAMPLE_HISTORY_IDS.has(s.id)) return;
      mergedMap.set(s.id, s);
      remoteIds.add(s.id);
    });

    // 2. Unisci eventuali sessioni locali mancanti dal cloud (es. allenamento fatto ieri su iPhone!)
    let localHasNewerOrExtra = false;
    localHistory.forEach(s => {
      if (!s || !s.id || deletedSet.has(s.id) || LEGACY_SAMPLE_HISTORY_IDS.has(s.id)) return;
      if (!mergedMap.has(s.id)) {
        mergedMap.set(s.id, s);
        localHasNewerOrExtra = true;
      } else {
        const existing = mergedMap.get(s.id);
        const localUpd = new Date(s.updatedAt || 0).getTime();
        const remoteUpd = new Date(existing.updatedAt || 0).getTime();
        if (localUpd > remoteUpd) {
          mergedMap.set(s.id, s);
          localHasNewerOrExtra = true;
        } else if (localUpd === remoteUpd) {
          const localSets = (s.exercises || []).reduce((acc, e) => acc + (e.sets ? e.sets.length : 0), 0);
          const remoteSets = (existing.exercises || []).reduce((acc, e) => acc + (e.sets ? e.sets.length : 0), 0);
          if (localSets > remoteSets) {
            mergedMap.set(s.id, s);
            localHasNewerOrExtra = true;
          }
        }
      }
    });

    const mergedList = Array.from(mergedMap.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
    const mergedDeleted = Array.from(deletedSet);

    // Controlla se la lista locale è cambiata rispetto a quella unita
    const localChanged = JSON.stringify(localHistory) !== JSON.stringify(mergedList)
      || localDeleted.length !== mergedDeleted.length;

    if (localChanged) {
      this.isApplyingRemote = true;
      Store.setHistory(mergedList, true);
      Store.setDeletedHistoryIds(mergedDeleted);
      this.isApplyingRemote = false;
      this.refreshAppViews();
    }

    // Se in locale c'erano sessioni o cancellazioni non ancora nel cloud, caricale subito!
    const remoteDeletedChanged = mergedDeleted.length > remoteDeleted.length;
    if (localHasNewerOrExtra || remoteDeletedChanged || mergedList.length > remoteHistory.length) {
      this.pushHistoryNow();
    } else {
      this.lastSyncAt = new Date();
      this.updateStatusUI("synced");
    }
  },

  /**
   * Smart Merge per le Routine:
   * A parità di ID vince la versione con updatedAt più recente (es. carichi aggiornati dopo allenamento su iPhone).
   */
  handleRemoteRoutines(remote) {
    const remoteRoutines = Array.isArray(remote.routines) ? remote.routines : [];
    const remoteDeleted = Array.isArray(remote.deletedIds) ? remote.deletedIds : [];
    const localRoutines = Store.getRoutines();
    const localDeleted = Store.getDeletedRoutineIds();

    const deletedSet = new Set([...localDeleted, ...remoteDeleted]);
    const mergedMap = new Map();

    remoteRoutines.forEach(r => {
      if (!r || !r.id || deletedSet.has(r.id) || LEGACY_SAMPLE_ROUTINE_IDS.has(r.id)) return;
      mergedMap.set(r.id, r);
    });

    let localHasNewerOrExtra = false;
    localRoutines.forEach(r => {
      if (!r || !r.id || deletedSet.has(r.id) || LEGACY_SAMPLE_ROUTINE_IDS.has(r.id)) return;
      const existing = mergedMap.get(r.id);
      if (!existing) {
        mergedMap.set(r.id, r);
        localHasNewerOrExtra = true;
      } else {
        const localTime = new Date(r.updatedAt || 0).getTime();
        const remoteTime = new Date(existing.updatedAt || 0).getTime();
        if (localTime > remoteTime) {
          mergedMap.set(r.id, r);
          localHasNewerOrExtra = true;
        }
      }
    });

    const mergedList = Array.from(mergedMap.values());
    const mergedDeleted = Array.from(deletedSet);

    const localChanged = JSON.stringify(localRoutines) !== JSON.stringify(mergedList)
      || localDeleted.length !== mergedDeleted.length;

    if (localChanged) {
      this.isApplyingRemote = true;
      Store.setRoutines(mergedList, true);
      Store.setDeletedRoutineIds(mergedDeleted);
      this.isApplyingRemote = false;
      this.refreshAppViews();
    }

    const remoteDeletedChanged = mergedDeleted.length > remoteDeleted.length;
    if (localHasNewerOrExtra || remoteDeletedChanged || mergedList.length > remoteRoutines.length) {
      this.pushRoutinesNow();
    } else {
      this.lastSyncAt = new Date();
      this.updateStatusUI("synced");
    }
  },

  schedulePushHistory() {
    if (!this.initialized || this.isApplyingRemote) return;
    if (this.pushHistoryTimer) clearTimeout(this.pushHistoryTimer);
    this.updateStatusUI("syncing");
    this.pushHistoryTimer = setTimeout(() => this.pushHistoryNow(), 300);
  },

  schedulePushRoutines() {
    if (!this.initialized || this.isApplyingRemote) return;
    if (this.pushRoutinesTimer) clearTimeout(this.pushRoutinesTimer);
    this.updateStatusUI("syncing");
    this.pushRoutinesTimer = setTimeout(() => this.pushRoutinesNow(), 300);
  },

  async pushHistoryNow() {
    if (!this.db) return false;
    this.updateStatusUI("syncing");
    try {
      const payload = {
        history: Store.getHistory(),
        deletedIds: Store.getDeletedHistoryIds(),
        updatedAt: new Date().toISOString(),
        deviceId: this.deviceId
      };
      await this.db.collection(this.COLLECTION).doc(this.DOC_HISTORY).set(payload);
      this.lastSyncAt = new Date();
      this.updateStatusUI("synced");
      return true;
    } catch (err) {
      console.error("Errore salvataggio storico su cloud:", err);
      this.updateStatusUI(navigator.onLine ? "error" : "offline");
      return false;
    }
  },

  async pushRoutinesNow() {
    if (!this.db) return false;
    this.updateStatusUI("syncing");
    try {
      const payload = {
        routines: Store.getRoutines(),
        deletedIds: Store.getDeletedRoutineIds(),
        updatedAt: new Date().toISOString(),
        deviceId: this.deviceId
      };
      await this.db.collection(this.COLLECTION).doc(this.DOC_ROUTINES).set(payload);
      this.lastSyncAt = new Date();
      this.updateStatusUI("synced");
      return true;
    } catch (err) {
      console.error("Errore salvataggio schede su cloud:", err);
      this.updateStatusUI(navigator.onLine ? "error" : "offline");
      return false;
    }
  },

  async syncNow(showUserToast = true) {
    if (typeof IS_DEMO_MODE !== "undefined" && IS_DEMO_MODE) {
      if (showUserToast && typeof App !== "undefined") {
        App.showToast("👀 Modalità Demo (sola lettura): esplora liberamente, nessuna modifica viene salvata.");
      }
      this.updateStatusUI("demo");
      return false;
    }

    if (!this.db) {
      if (showUserToast && typeof App !== "undefined") {
        App.showToast("Modalità offline: i dati sono salvati sul dispositivo.");
      }
      this.updateStatusUI("offline");
      return false;
    }

    this.updateStatusUI("syncing");
    try {
      const [histSnap, routSnap] = await Promise.all([
        this.db.collection(this.COLLECTION).doc(this.DOC_HISTORY).get(),
        this.db.collection(this.COLLECTION).doc(this.DOC_ROUTINES).get()
      ]);

      if (histSnap.exists) {
        this.handleRemoteHistory(histSnap.data() || {});
      } else {
        await this.pushHistoryNow();
      }

      if (routSnap.exists) {
        this.handleRemoteRoutines(routSnap.data() || {});
      } else {
        await this.pushRoutinesNow();
      }

      this.lastSyncAt = new Date();
      this.updateStatusUI("synced");
      if (showUserToast && typeof App !== "undefined") {
        App.showToast("☁️ Sincronizzato con il cloud!");
      }
      return true;
    } catch (err) {
      console.error("Errore sync manuale:", err);
      this.updateStatusUI(navigator.onLine ? "error" : "offline");
      if (showUserToast && typeof App !== "undefined") {
        App.showToast("Sync non riuscito: controlla la connessione.");
      }
      return false;
    }
  },

  refreshAppViews() {
    if (typeof App === "undefined") return;
    App.renderRoutines();
    App.renderHistoryList();
    if (typeof ChartsManager !== "undefined") {
      ChartsManager.populateSelectors();
      ChartsManager.renderCurrentCharts();
    }
  },

  updateStatusUI(state) {
    this.status = state;
    const pill = document.getElementById("cloud-sync-pill");
    const detailEl = document.getElementById("cloud-sync-status-detail");

    const map = {
      connecting: { text: "Sync...", cls: "syncing", desc: "Connessione a Firebase Cloud..." },
      syncing: { text: "Sync...", cls: "syncing", desc: "Sincronizzazione in corso..." },
      synced: { text: "Cloud Live", cls: "synced", desc: "Connesso in tempo reale" },
      offline: { text: "Offline", cls: "offline", desc: "Offline (salvato in locale, sincronizza al ritorno della rete)" },
      error: { text: "Sync err", cls: "error", desc: "Errore temporaneo di rete" },
      demo: { text: "Modalità Demo", cls: "demo", desc: "Modalità Demo (Sola Lettura) — Esplora tutte le funzioni, nessuna modifica verrà salvata" }
    };

    const info = map[state] || map.connecting;
    if (pill) {
      pill.className = `cloud-sync-pill ${info.cls}`;
      pill.innerHTML = `<span class="cloud-dot"></span><span>${info.text}</span>`;
    }
    if (detailEl) {
      const timeStr = this.lastSyncAt
        ? ` • Ultimo sync: ${this.lastSyncAt.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
        : "";
      detailEl.textContent = `${info.desc}${timeStr}`;
    }
  }
};
