/**
 * Dati predefiniti per Hevy Gym Tracker
 * Include libreria esercizi bilingue (IT/EN), programmi divisi in settimane:
 *  - Blocco 1 (Sett 1–4): Programma da PDF
 *  - Blocco 2 (Sett 5–8): Blocco intensificazione con carichi e log reali
 *  - Storico reale precaricato con tutte le sessioni e note registrate
 */

const DATA_SCHEMA_VERSION = "2026-11-weekly-v1";

const DEFAULT_PROGRAMS = [
  {
    id: "prog_pdf_s1_s4",
    name: "Programma PDF (Sett 1–4)",
    shortName: "Sett 1–4 (Nuovo)",
    subtitle: "4 giorni/sett • Ramping, Accumulo & Tecniche Speciali",
    weeks: [1, 2, 3, 4]
  },
  {
    id: "prog_block2_s5_s8",
    name: "Blocco Precedente (Sett 5–8)",
    shortName: "Sett 5–8 (Log)",
    subtitle: "4 giorni/sett • Intensificazione + Carichi & Log Reali",
    weeks: [5, 6, 7, 8]
  }
];

const DEFAULT_EXERCISES = [
  // --- PETTO / CHEST ---
  { id: "panca-piana", name: "Panca Piana con Bilanciere (Barbell Bench Press)", nameIt: "Panca Piana con Bilanciere", nameEn: "Barbell Bench Press", category: "Petto", muscleGroup: "Petto", defaultRest: 150 },
  { id: "panca-piana-fermo-1", name: 'Panca Piana – Fermo 1"', nameIt: 'Panca Piana – Fermo 1"', nameEn: "Paused Bench Press 1s", category: "Petto", muscleGroup: "Petto", defaultRest: 180 },
  { id: "panca-piana-fermo-3", name: 'Panca Piana – Fermo 3"', nameIt: 'Panca Piana – Fermo 3"', nameEn: "Paused Bench Press 3s", category: "Petto", muscleGroup: "Petto", defaultRest: 180 },
  { id: "panca-inclinata-bil", name: "Panca Inclinata con Bilanciere (Incline Barbell Bench)", nameIt: "Panca Inclinata con Bilanciere", nameEn: "Incline Barbell Bench Press", category: "Petto", muscleGroup: "Petto", defaultRest: 90 },
  { id: "panca-declinata-bil", name: "Panca Declinata con Bilanciere (Decline Barbell Bench)", nameIt: "Panca Declinata con Bilanciere", nameEn: "Decline Barbell Bench Press", category: "Petto", muscleGroup: "Petto", defaultRest: 90 },
  { id: "panca-piana-manubri", name: "Panca Piana con Manubri (Dumbbell Bench Press)", nameIt: "Panca Piana con Manubri", nameEn: "Dumbbell Bench Press", category: "Petto", muscleGroup: "Petto", defaultRest: 90 },
  { id: "panca-inclinata", name: "Distensioni Manubri – Panca Inclinata 30°", nameIt: "Distensioni Manubri Panca Inclinata 30°", nameEn: "Incline Dumbbell Press 30°", category: "Petto", muscleGroup: "Petto", defaultRest: 120 },
  { id: "panca-declinata-man", name: "Panca Declinata con Manubri (Decline Dumbbell Press)", nameIt: "Panca Declinata con Manubri", nameEn: "Decline Dumbbell Press", category: "Petto", muscleGroup: "Petto", defaultRest: 90 },
  { id: "croci-manubri", name: "Croci con Manubri su Panca (Dumbbell Flyes)", nameIt: "Croci con Manubri", nameEn: "Dumbbell Chest Flyes", category: "Petto", muscleGroup: "Petto", defaultRest: 60 },
  { id: "croci-cavi", name: "Croci ai Cavi Medi", nameIt: "Croci ai Cavi Medi", nameEn: "Mid Cable Fly", category: "Petto", muscleGroup: "Petto", defaultRest: 60 },
  { id: "chest-press-panatta", name: "Chest Press Panatta Convergente", nameIt: "Chest Press Panatta Convergente", nameEn: "Converging Chest Press", category: "Petto", muscleGroup: "Petto", defaultRest: 90 },
  { id: "chest-press-inclinata", name: "Chest Press Inclinata Convergente", nameIt: "Chest Press Inclinata Convergente", nameEn: "Incline Converging Chest Press", category: "Petto", muscleGroup: "Petto", defaultRest: 90 },
  { id: "push-up", name: "Push Up / Flessioni (Push Ups)", nameIt: "Push Up / Flessioni", nameEn: "Push Ups", category: "Petto", muscleGroup: "Petto", defaultRest: 60 },
  { id: "dip-petto", name: "Dip alle Parallele per Petto (Chest Dips)", nameIt: "Dip alle Parallele per Petto", nameEn: "Chest Dips", category: "Petto", muscleGroup: "Petto", defaultRest: 90 },
  { id: "pullover-manubrio", name: "Pullover con Manubrio (Dumbbell Pullover)", nameIt: "Pullover con Manubrio", nameEn: "Dumbbell Pullover", category: "Petto", muscleGroup: "Petto", defaultRest: 60 },

  // --- SCHIENA & DORSO / BACK ---
  { id: "stacco-sumo", name: "Stacco Sumo", nameIt: "Stacco Sumo", nameEn: "Sumo Deadlift", category: "Dorso", muscleGroup: "Schiena", defaultRest: 180 },
  { id: "stacco-terra", name: "Stacco da Terra (Barbell Deadlift)", nameIt: "Stacco da Terra", nameEn: "Barbell Deadlift", category: "Dorso", muscleGroup: "Schiena", defaultRest: 150 },
  { id: "trazioni-sbarra", name: "Trazioni Corpo Libero", nameIt: "Trazioni Corpo Libero", nameEn: "Pull Ups", category: "Dorso", muscleGroup: "Schiena", defaultRest: 100 },
  { id: "seal-row", name: "Seal Row Manubri", nameIt: "Seal Row Manubri", nameEn: "Dumbbell Seal Row", category: "Dorso", muscleGroup: "Schiena", defaultRest: 100 },
  { id: "rematore-ez", name: "Rematore Bilanciere EZ Presa Larga Supinata", nameIt: "Rematore EZ Presa Larga Supinata", nameEn: "Wide Supinated EZ-Bar Row", category: "Dorso", muscleGroup: "Schiena", defaultRest: 100 },
  { id: "low-row", name: "Low Row", nameIt: "Low Row", nameEn: "Low Row Machine", category: "Dorso", muscleGroup: "Schiena", defaultRest: 90 },
  { id: "pulldown-vulken", name: "Pulldown con Vulken", nameIt: "Pulldown con Vulken", nameEn: "Vulken Cable Pulldown", category: "Dorso", muscleGroup: "Schiena", defaultRest: 90 },
  { id: "lat-machine-supinata", name: "Lat Machine – Presa Supinata", nameIt: "Lat Machine Presa Supinata", nameEn: "Supinated Lat Pulldown", category: "Dorso", muscleGroup: "Schiena", defaultRest: 120 },
  { id: "lat-machine", name: "Lat Machine Presa Larga (Wide Grip Lat Pulldown)", nameIt: "Lat Machine Presa Larga", nameEn: "Wide Grip Lat Pulldown", category: "Dorso", muscleGroup: "Schiena", defaultRest: 75 },
  { id: "lat-machine-neutra", name: "Lat Machine Presa Neutra (Close Grip Lat Pulldown)", nameIt: "Lat Machine Presa Neutra", nameEn: "Close Grip Lat Pulldown", category: "Dorso", muscleGroup: "Schiena", defaultRest: 60 },
  { id: "chin-up", name: "Chin Up Trazioni Supine (Chin Ups)", nameIt: "Chin Up Presa Supina", nameEn: "Chin Ups", category: "Dorso", muscleGroup: "Schiena", defaultRest: 90 },
  { id: "rematore-bilanciere-straps", name: "Rematore Bilanciere – Straps", nameIt: "Rematore Bilanciere con Straps", nameEn: "Barbell Row (Straps)", category: "Dorso", muscleGroup: "Schiena", defaultRest: 150 },
  { id: "rematore-manubrio", name: "Rematore con Manubrio Singolo (Single Arm Dumbbell Row)", nameIt: "Rematore con Manubrio", nameEn: "Dumbbell Row", category: "Dorso", muscleGroup: "Schiena", defaultRest: 75 },
  { id: "pulley-basso", name: "Pulley Basso al Cavo (Seated Cable Row)", nameIt: "Pulley Basso", nameEn: "Seated Cable Row", category: "Dorso", muscleGroup: "Schiena", defaultRest: 75 },
  { id: "rematore-tbar", name: "Rematore T-Bar (T-Bar Row)", nameIt: "Rematore T-Bar", nameEn: "T-Bar Row", category: "Dorso", muscleGroup: "Schiena", defaultRest: 90 },
  { id: "pulldown-braccia-tese", name: "Pull-down a Braccia Tese (Straight Arm Pulldown)", nameIt: "Pulldown a Braccia Tese", nameEn: "Straight Arm Pulldown", category: "Dorso", muscleGroup: "Schiena", defaultRest: 60 },
  { id: "hyperextension", name: "Hyperextension Estensioni Lombari (Back Extensions)", nameIt: "Hyperextension Lombari", nameEn: "Back Extensions", category: "Dorso", muscleGroup: "Schiena", defaultRest: 60 },
  { id: "shrug-bilanciere", name: "Scrollate con Bilanciere (Barbell Shrugs)", nameIt: "Scrollate con Bilanciere", nameEn: "Barbell Shrugs", category: "Dorso", muscleGroup: "Schiena", defaultRest: 60 },
  { id: "rematore-macchina", name: "Rematore alla Macchina (Machine Row)", nameIt: "Rematore alla Macchina", nameEn: "Machine Row", category: "Dorso", muscleGroup: "Schiena", defaultRest: 75 },

  // --- SPALLE / SHOULDERS ---
  { id: "alzate-laterali-presti", name: "Alzate Laterali Pesanti alla Presti", nameIt: "Alzate Laterali Pesanti alla Presti", nameEn: "Heavy Lateral Raises (Presti)", category: "Spalle", muscleGroup: "Spalle", defaultRest: 60 },
  { id: "alzate-laterali-machine", name: "Alzate Laterali Machine", nameIt: "Alzate Laterali Machine", nameEn: "Lateral Raise Machine", category: "Spalle", muscleGroup: "Spalle", defaultRest: 60 },
  { id: "alzate-laterali", name: "Alzate Laterali Manubri", nameIt: "Alzate Laterali Manubri", nameEn: "Dumbbell Lateral Raises", category: "Spalle", muscleGroup: "Spalle", defaultRest: 60 },
  { id: "alzate-laterali-cavi", name: "Alzate Laterali al Cavo", nameIt: "Alzate Laterali al Cavo", nameEn: "Cable Lateral Raises", category: "Spalle", muscleGroup: "Spalle", defaultRest: 60 },
  { id: "military-press", name: "Military Press / Overhead Press (Barbell OHP)", nameIt: "Military Press con Bilanciere", nameEn: "Barbell Overhead Press", category: "Spalle", muscleGroup: "Spalle", defaultRest: 90 },
  { id: "lento-avanti-manubri", name: "Lento Avanti con Manubri (Seated Dumbbell Press)", nameIt: "Lento Avanti con Manubri", nameEn: "Seated Dumbbell Shoulder Press", category: "Spalle", muscleGroup: "Spalle", defaultRest: 90 },
  { id: "arnold-press", name: "Arnold Press con Manubri (Arnold Press)", nameIt: "Arnold Press", nameEn: "Arnold Press", category: "Spalle", muscleGroup: "Spalle", defaultRest: 75 },
  { id: "alzate-frontali", name: "Alzate Frontali con Manubri (Front Dumbbell Raises)", nameIt: "Alzate Frontali con Manubri", nameEn: "Front Dumbbell Raises", category: "Spalle", muscleGroup: "Spalle", defaultRest: 60 },
  { id: "face-pull", name: "Face Pull al Cavo con Corda (Cable Face Pull)", nameIt: "Face Pull con Corda", nameEn: "Cable Face Pull", category: "Spalle", muscleGroup: "Spalle", defaultRest: 60 },
  { id: "rear-delt-fly", name: "Alzate a 90° Deltoidi Posteriori (Rear Delt Fly)", nameIt: "Alzate Posteriori a 90°", nameEn: "Rear Delt Dumbbell Fly", category: "Spalle", muscleGroup: "Spalle", defaultRest: 60 },
  { id: "reverse-pec-deck", name: "Reverse Pec Deck Macchina (Machine Rear Delt)", nameIt: "Reverse Pec Deck", nameEn: "Reverse Pec Deck Fly", category: "Spalle", muscleGroup: "Spalle", defaultRest: 60 },
  { id: "shoulder-press-macchina", name: "Shoulder Press alla Macchina (Machine Shoulder Press)", nameIt: "Shoulder Press Macchina", nameEn: "Machine Shoulder Press", category: "Spalle", muscleGroup: "Spalle", defaultRest: 75 },
  { id: "tirate-al-mento", name: "Tirate al Mento con Bilanciere (Upright Row)", nameIt: "Tirate al Mento", nameEn: "Barbell Upright Row", category: "Spalle", muscleGroup: "Spalle", defaultRest: 75 },

  // --- GAMBE / LEGS & GLUTES ---
  { id: "squat-low-bar", name: "Squat Low Bar", nameIt: "Squat Low Bar", nameEn: "Low Bar Back Squat", category: "Gambe", muscleGroup: "Gambe", defaultRest: 180 },
  { id: "squat", name: "Squat con Bilanciere (Barbell Back Squat)", nameIt: "Squat con Bilanciere", nameEn: "Barbell Back Squat", category: "Gambe", muscleGroup: "Gambe", defaultRest: 150 },
  { id: "front-squat", name: "Front Squat con Bilanciere (Front Squat)", nameIt: "Front Squat con Bilanciere", nameEn: "Front Squat", category: "Gambe", muscleGroup: "Gambe", defaultRest: 120 },
  { id: "hack-squat", name: "Hack Squat", nameIt: "Hack Squat", nameEn: "Hack Squat Machine", category: "Gambe", muscleGroup: "Gambe", defaultRest: 120 },
  { id: "leg-press-orizzontale", name: "Leg Press Orizzontale – Pacco Pesi", nameIt: "Leg Press Orizzontale", nameEn: "Horizontal Leg Press", category: "Gambe", muscleGroup: "Gambe", defaultRest: 180 },
  { id: "leg-press", name: "Leg Press 45° (45° Leg Press Machine)", nameIt: "Leg Press 45°", nameEn: "45° Leg Press", category: "Gambe", muscleGroup: "Gambe", defaultRest: 90 },
  { id: "leg-extension", name: "Leg Extension – Muscle Round Stevenson", nameIt: "Leg Extension Muscle Round", nameEn: "Leg Extension (Muscle Round)", category: "Gambe", muscleGroup: "Gambe", defaultRest: 15 },
  { id: "leg-curl-seduto", name: "Leg Curl Seduto", nameIt: "Leg Curl Seduto", nameEn: "Seated Leg Curl", category: "Gambe", muscleGroup: "Gambe", defaultRest: 75 },
  { id: "leg-curl", name: "Leg Curl Sdraiato (Lying Leg Curl)", nameIt: "Leg Curl Sdraiato", nameEn: "Lying Leg Curl", category: "Gambe", muscleGroup: "Gambe", defaultRest: 60 },
  { id: "stacco-rumeno", name: "Stacco Rumeno con Bilanciere (Romanian Deadlift / RDL)", nameIt: "Stacco Rumeno RDL", nameEn: "Romanian Deadlift", category: "Gambe", muscleGroup: "Gambe", defaultRest: 90 },
  { id: "hip-thrust", name: "Hip Thrust con Bilanciere (Barbell Hip Thrust)", nameIt: "Hip Thrust con Bilanciere", nameEn: "Barbell Hip Thrust", category: "Gambe", muscleGroup: "Gambe", defaultRest: 90 },
  { id: "affondi-manubri", name: "Affondi Camminati con Manubri (Walking Lunges)", nameIt: "Affondi con Manubri", nameEn: "Dumbbell Lunges", category: "Gambe", muscleGroup: "Gambe", defaultRest: 75 },
  { id: "bulgarian-split-squat", name: "Split Squat Bulgaro (Bulgarian Split Squat)", nameIt: "Squat Bulgaro", nameEn: "Bulgarian Split Squat", category: "Gambe", muscleGroup: "Gambe", defaultRest: 75 },
  { id: "calf-raise", name: "Calf Raise", nameIt: "Calf Raise", nameEn: "Calf Raise", category: "Polpacci", muscleGroup: "Gambe", defaultRest: 60 },
  { id: "bicipiti-polpaccio", name: "Bicipiti del Polpaccio (Tibiale)", nameIt: "Bicipiti del Polpaccio", nameEn: "Tibialis / Soleus Raise", category: "Polpacci", muscleGroup: "Gambe", defaultRest: 45 },

  // --- BICIPITI / BICEPS ---
  { id: "strict-curl-cheating", name: "Strict Curl Cheating", nameIt: "Strict Curl Cheating", nameEn: "Strict / Cheat Barbell Curl", category: "Bicipiti", muscleGroup: "Bicipiti", defaultRest: 90 },
  { id: "curl-panca-inclinata", name: "Curl su Panca Inclinata", nameIt: "Curl su Panca Inclinata", nameEn: "Incline Dumbbell Curl", category: "Bicipiti", muscleGroup: "Bicipiti", defaultRest: 60 },
  { id: "curl-cavo-sst", name: "Curl al Cavo Basso – SST", nameIt: "Curl al Cavo Basso SST", nameEn: "Low Cable Curl (SST)", category: "Bicipiti", muscleGroup: "Bicipiti", defaultRest: 20 },
  { id: "curl-bilanciere", name: "Curl con Bilanciere Dritto (Barbell Bicep Curl)", nameIt: "Curl con Bilanciere Dritto", nameEn: "Barbell Curl", category: "Bicipiti", muscleGroup: "Bicipiti", defaultRest: 60 },
  { id: "curl-bilanciere-ez", name: "Curl con Bilanciere EZ (EZ-Bar Bicep Curl)", nameIt: "Curl Bilanciere EZ", nameEn: "EZ-Bar Bicep Curl", category: "Bicipiti", muscleGroup: "Bicipiti", defaultRest: 60 },
  { id: "curl-manubri", name: "Curl Manubri Alternato (Alternating Dumbbell Curl)", nameIt: "Curl Manubri Alternato", nameEn: "Dumbbell Bicep Curl", category: "Bicipiti", muscleGroup: "Bicipiti", defaultRest: 60 },
  { id: "hammer-curl", name: "Curl a Martello con Manubri (Dumbbell Hammer Curl)", nameIt: "Hammer Curl a Martello", nameEn: "Dumbbell Hammer Curl", category: "Bicipiti", muscleGroup: "Bicipiti", defaultRest: 60 },
  { id: "preacher-curl", name: "Curl alla Panca Scott (Preacher Curl)", nameIt: "Curl Panca Scott", nameEn: "Preacher Curl", category: "Bicipiti", muscleGroup: "Bicipiti", defaultRest: 60 },
  { id: "avambracci", name: "Avambracci (Wrist Curl)", nameIt: "Avambracci", nameEn: "Forearm Wrist Curl", category: "Bicipiti", muscleGroup: "Bicipiti", defaultRest: 45 },

  // --- TRICIPITI / TRICEPS ---
  { id: "french-press", name: "French Press EZ", nameIt: "French Press Bilanciere EZ", nameEn: "EZ-Bar French Press", category: "Tricipiti", muscleGroup: "Tricipiti", defaultRest: 90 },
  { id: "pushdown-asta", name: 'Pushdown Asta – Due Fermi da 1"', nameIt: 'Pushdown Asta Due Fermi 1"', nameEn: "Paused Bar Pushdown", category: "Tricipiti", muscleGroup: "Tricipiti", defaultRest: 60 },
  { id: "pushdown-corda", name: "Pushdown Corda", nameIt: "Pushdown con Corda", nameEn: "Rope Tricep Pushdown", category: "Tricipiti", muscleGroup: "Tricipiti", defaultRest: 90 },
  { id: "overhead-tricep-ext", name: "Estensioni Sopra la Testa con Manubrio (Overhead Tricep Extension)", nameIt: "Estensioni Sopra la Testa Manubrio", nameEn: "Overhead Dumbbell Tricep Extension", category: "Tricipiti", muscleGroup: "Tricipiti", defaultRest: 60 },
  { id: "panca-stretta", name: "Panca Piana Presa Stretta (Close-Grip Bench Press)", nameIt: "Panca Presa Stretta", nameEn: "Close Grip Bench Press", category: "Tricipiti", muscleGroup: "Tricipiti", defaultRest: 90 },
  { id: "dip", name: "Dip alle Parallele per Tricipiti (Triceps Dips)", nameIt: "Dip alle Parallele Tricipiti", nameEn: "Tricep Dips", category: "Tricipiti", muscleGroup: "Tricipiti", defaultRest: 90 },

  // --- ADDOME & CORE / ABS ---
  { id: "addome-crunch", name: "Addome – Crunch Lat con Vulken / Panca", nameIt: "Addome Crunch (Vulken / Panca)", nameEn: "Cable / Weighted Crunch", category: "Core", muscleGroup: "Addome", defaultRest: 60 },
  { id: "crunch", name: "Crunch a Terra (Floor Crunch)", nameIt: "Crunch a Terra", nameEn: "Floor Crunch", category: "Core", muscleGroup: "Addome", defaultRest: 45 },
  { id: "plank", name: "Plank Addominale (Standard Plank)", nameIt: "Plank Addominale", nameEn: "Front Plank", category: "Core", muscleGroup: "Addome", defaultRest: 60 },
  { id: "hanging-leg-raise", name: "Alzate Gambe alla Sbarra (Hanging Leg Raise)", nameIt: "Alzate Gambe alla Sbarra", nameEn: "Hanging Leg Raise", category: "Core", muscleGroup: "Addome", defaultRest: 60 },
  { id: "ab-wheel", name: "Ruota Addominale (Ab Wheel Rollout)", nameIt: "Ruota Addominale Rollout", nameEn: "Ab Wheel Rollout", category: "Core", muscleGroup: "Addome", defaultRest: 60 }
];

/**
 * Riconosce automaticamente il gruppo muscolare principale dal nome dell'esercizio.
 * Ordine di precedenza curato per evitare falsi positivi (es. Leg Curl, French Press, Curl su Panca, Crunch alla Lat).
 */
function detectMuscleGroup(exerciseName = "") {
  if (!exerciseName) return "Petto";
  const str = exerciseName.toLowerCase().trim();

  // 1. Corrispondenza esatta nella libreria
  const exact = DEFAULT_EXERCISES.find(e =>
    e.name.toLowerCase() === str ||
    (e.nameIt && e.nameIt.toLowerCase() === str) ||
    (e.nameEn && e.nameEn.toLowerCase() === str)
  );
  if (exact && exact.muscleGroup) return exact.muscleGroup;

  // 2. Casi specifici composti (prima delle parole generiche come "panca", "press", "curl", "lat")
  if (/crunch|addom|plank|core|abs|twist|ruota|rollout|dead\s?bug|leg\s?raise/i.test(str)) return "Addome";
  if (/leg\s?curl|leg\s?ext|leg\s?press|pressa\s?orizz|squat|hack|polpacc|calf|glute|thrust|affond|lunge|bulgar|stacco\s?rumen|femor|quadricip|tibial/i.test(str)) return "Gambe";
  if (/push[\s-]?down|french\s?press|skull|tricip|tricep|kickback|tate\s?press|panca.*stretta|dip.*tricip/i.test(str)) return "Tricipiti";
  if (/bicipit|bicep|strict\s?curl|curl|scott|martello|hammer|spider|avambracc|wrist/i.test(str)) return "Bicipiti";
  if (/alzat|lateral|spall|shoulder|military|overhead|arnold|rear\s?delt|face\s?pull|pec\s?deck|mento|upright|presti/i.test(str)) return "Spalle";
  if (/stacco|deadlift|trazion|pull[\s-]?up|chin[\s-]?up|lat\s?machine|pull[\s-]?down|vulken|seal\s?row|low\s?row|row|remator|pulley|dorso|schiena|back|hyper|shrug|scrollat/i.test(str)) return "Schiena";
  if (/petto|chest|panca|bench|croci|fly|distension|flessioni|push\s?up|spinte|dip|pullover/i.test(str)) return "Petto";

  return "Petto";
}

// Helper per costruire rapidamente serie uniformi o miste
function makeSets(count, weight, reps, tag = "") {
  return Array.from({ length: count }, () => ({
    weight: Number(weight) || 0,
    reps: Number(reps) || 0,
    ...(tag ? { tag } : {})
  }));
}

/**
 * Genera le 16 schede del Blocco 1 (Sett 1–4, Programma PDF)
 */
function buildBlock1Routines() {
  const updatedAt = "2026-11-24T12:00:00.000Z";
  const routines = [];

  const weeks = [1, 2, 3, 4];
  weeks.forEach(w => {
    const idx = w - 1; // 0..3

    // --- GIORNO 1 – PULL / STACCO ---
    const sumoReps = [6, 5, 4, 3][idx];
    const sumoRpe = ["@7", "@8", "@8", "@9"][idx];
    const lowRowReps = [10, 9, 8, 7][idx];
    const lowRowRir = ["2 RIR", "2 RIR", "1 RIR", "1 RIR"][idx];
    const scRamp = [6, 5, 5, 4][idx];
    const scRpe = ["@8", "@8", "@8.5", "@8.5"][idx];
    const scBackReps = [5, 5, 4, 4][idx];
    const incCurlReps = [10, 9, 8, 7][idx];
    const incCurlRir = ["2 RIR", "2 RIR", "1 RIR", "1 RIR"][idx];

    routines.push({
      id: `b1_w${w}_d1`,
      programId: "prog_pdf_s1_s4",
      programName: "Programma PDF (Sett 1–4)",
      week: w,
      dayNumber: 1,
      name: "Giorno 1 – Pull / Stacco",
      description: `Settimana ${w} • Stacco Sumo Ramp${sumoReps} ${sumoRpe}, Trazioni, SS Schiena, Bicipiti`,
      updatedAt,
      exercises: [
        {
          id: `b1_w${w}_d1_e1`,
          name: "Stacco Sumo",
          muscleGroup: "Schiena",
          restSeconds: 180,
          notes: `Sett ${w}: Ramp${sumoReps} ${sumoRpe}. Ps. il volume è nel ramping, fai salti piccoli di carico.`,
          sets: [
            { weight: 100, reps: sumoReps, tag: `Ramp ${sumoReps}` },
            { weight: 115, reps: sumoReps, tag: `Ramp ${sumoReps}` },
            { weight: 125, reps: sumoReps, tag: `Ramp ${sumoReps}` },
            { weight: 135, reps: sumoReps, tag: `Top ${sumoRpe}` }
          ]
        },
        {
          id: `b1_w${w}_d1_e2`,
          name: "Trazioni Corpo Libero",
          muscleGroup: "Schiena",
          restSeconds: 100,
          notes: `Sett 1–4: 6×6 fermo 1". Rest: 100".`,
          sets: makeSets(6, 0, 6, 'Fermo 1"')
        },
        {
          id: `b1_w${w}_d1_e3a`,
          name: "Seal Row Manubri",
          muscleGroup: "Schiena",
          superset: "SS Schiena (A)",
          restSeconds: 15,
          notes: `SUPER SERIE – SCHIENA (4 serie, A). Iso 1" in contrazione • ×10–12 rep. Subito dopo passa a Rematore EZ.`,
          sets: makeSets(4, 24, 12, '10-12 Iso1"')
        },
        {
          id: `b1_w${w}_d1_e3b`,
          name: "Rematore Bilanciere EZ Presa Larga Supinata",
          muscleGroup: "Schiena",
          superset: "SS Schiena (B)",
          restSeconds: 100,
          notes: `SUPER SERIE – SCHIENA (4 serie, B). Touch & Go • 15 kg × lato × MAX REP. Rest 100" a fine superserie.`,
          sets: makeSets(4, 15, 15, "15kg/lato MAX")
        },
        {
          id: `b1_w${w}_d1_e4`,
          name: "Low Row",
          muscleGroup: "Schiena",
          restSeconds: 90,
          notes: `Sett ${w}: 3×${lowRowReps} @${lowRowRir}.`,
          sets: makeSets(3, 60, lowRowReps, `@${lowRowRir}`)
        },
        {
          id: `b1_w${w}_d1_e5`,
          name: "Pulldown con Vulken",
          muscleGroup: "Schiena",
          restSeconds: 90,
          notes: `Sett 1–4: 3×45" (ogni serie dura 45 secondi; il campo REPS indica i secondi).`,
          sets: makeSets(3, 35, 45, '45 sec')
        },
        {
          id: `b1_w${w}_d1_e6`,
          name: "Strict Curl Cheating",
          muscleGroup: "Bicipiti",
          restSeconds: 90,
          notes: `Sett ${w}: Ramp${scRamp} ${scRpe} + 3×${scBackReps}.`,
          sets: [
            { weight: 20, reps: scRamp, tag: `Ramp ${scRpe}` },
            { weight: 20, reps: scBackReps, tag: "Working" },
            { weight: 20, reps: scBackReps, tag: "Working" },
            { weight: 20, reps: scBackReps, tag: "Working" }
          ]
        },
        {
          id: `b1_w${w}_d1_e7`,
          name: "Curl su Panca Inclinata",
          muscleGroup: "Bicipiti",
          restSeconds: 60,
          notes: `Sett ${w}: 3×${incCurlReps} @${incCurlRir}.`,
          sets: makeSets(3, 14, incCurlReps, `@${incCurlRir}`)
        }
      ]
    });

    // --- GIORNO 2 – PUSH ---
    const benchSets = [5, 5, 5, 5][idx];
    const benchReps = [6, 6, 5, 5][idx];
    const benchKg = [90, 92.5, 95, 97.5][idx];
    const incDbReps = [7, 8, 6, 7][idx];
    const incDbKg = [32, 32, 34, 34][idx];
    const cpRamp = [10, 9, 8, 7][idx];
    const cpRpe = ["RPE8", "RPE8", "RPE8", "RPE9"][idx];
    const cpBack = [8, 7, 6, 5][idx];
    const flyReps = [12, 11, 10, 9][idx];
    const flyRir = ["RIR2", "RIR2", "RIR1", "RIR1"][idx];
    const latReps = [15, 14, 13, 12][idx];
    const latRir = ["RIR2", "RIR2", "RIR1", "RIR1"][idx];
    const fpRamp = [10, 9, 8, 7][idx];
    const fpBack = [8, 7, 6, 5][idx];
    const pdReps = [12, 11, 10, 9][idx];

    routines.push({
      id: `b1_w${w}_d2`,
      programId: "prog_pdf_s1_s4",
      programName: "Programma PDF (Sett 1–4)",
      week: w,
      dayNumber: 2,
      name: "Giorno 2 – Push",
      description: `Settimana ${w} • Panca Fermo 1" ${benchSets}×${benchReps} @ ${benchKg}kg, Inclinata ${incDbKg}kg, Spalle & Tricipiti`,
      updatedAt,
      exercises: [
        {
          id: `b1_w${w}_d2_e1`,
          name: 'Panca Piana – Fermo 1"',
          muscleGroup: "Petto",
          restSeconds: 180,
          notes: `Sett ${w}: ${benchSets}×${benchReps} – ${benchKg} kg. Fermo 1" al petto.`,
          sets: makeSets(benchSets, benchKg, benchReps, 'Fermo 1"')
        },
        {
          id: `b1_w${w}_d2_e2`,
          name: "Distensioni Manubri – Panca Inclinata 30°",
          muscleGroup: "Petto",
          restSeconds: 120,
          notes: `Sett ${w}: 4×${incDbReps} – ${incDbKg} kg per manubrio.`,
          sets: makeSets(4, incDbKg, incDbReps, "30° Manubri")
        },
        {
          id: `b1_w${w}_d2_e3`,
          name: "Chest Press Panatta Convergente",
          muscleGroup: "Petto",
          restSeconds: 90,
          notes: `Sett ${w}: Ramp${cpRamp} ${cpRpe} + 2×${cpBack} stesso carico.`,
          sets: [
            { weight: 70, reps: cpRamp, tag: `Ramp ${cpRpe}` },
            { weight: 70, reps: cpBack, tag: "Stesso carico" },
            { weight: 70, reps: cpBack, tag: "Stesso carico" }
          ]
        },
        {
          id: `b1_w${w}_d2_e4`,
          name: "Croci ai Cavi Medi",
          muscleGroup: "Petto",
          restSeconds: 60,
          notes: `Sett ${w}: 3×${flyReps} ${flyRir}.`,
          sets: makeSets(3, 15, flyReps, flyRir)
        },
        {
          id: `b1_w${w}_d2_e5`,
          name: "Alzate Laterali Pesanti alla Presti",
          muscleGroup: "Spalle",
          restSeconds: 60,
          notes: `Sett ${w}: 4×${latReps} ${latRir}.`,
          sets: makeSets(4, 12, latReps, latRir)
        },
        {
          id: `b1_w${w}_d2_e6`,
          name: "French Press EZ",
          muscleGroup: "Tricipiti",
          restSeconds: 90,
          notes: `Sett ${w}: Ramp${fpRamp} RPE8 + 2×${fpBack}.`,
          sets: [
            { weight: 15, reps: fpRamp, tag: "Ramp RPE8" },
            { weight: 15, reps: fpBack, tag: "Working" },
            { weight: 15, reps: fpBack, tag: "Working" }
          ]
        },
        {
          id: `b1_w${w}_d2_e7`,
          name: 'Pushdown Asta – Due Fermi da 1"',
          muscleGroup: "Tricipiti",
          restSeconds: 60,
          notes: `Fermo 1" in massimo allungamento + 1" in massima contrazione. Sett ${w}: 3×${pdReps}.`,
          sets: makeSets(3, 30, pdReps, '2 Fermi 1"')
        }
      ]
    });

    // --- GIORNO 3 – LOWER ---
    const sqSets = [6, 5, 4, 5][idx];
    const sqReps = [8, 8, 8, 7][idx];
    const sqKg = [80, 85, 90, 95][idx];
    const hackRamp = [10, 9, 8, 7][idx];
    const hackBack = [9, 8, 7, 6][idx];
    const lcReps = [12, 11, 10, 9][idx];
    const lcRir = ["RIR2", "RIR2", "RIR1", "RIR1"][idx];

    routines.push({
      id: `b1_w${w}_d3`,
      programId: "prog_pdf_s1_s4",
      programName: "Programma PDF (Sett 1–4)",
      week: w,
      dayNumber: 3,
      name: "Giorno 3 – Lower",
      description: `Settimana ${w} • Squat Low Bar ${sqSets}×${sqReps} @ ${sqKg}kg, Hack Squat, Pressa TUT 5-0-5, Muscle Round`,
      updatedAt,
      exercises: [
        {
          id: `b1_w${w}_d3_e1`,
          name: "Squat Low Bar",
          muscleGroup: "Gambe",
          restSeconds: 180,
          notes: `Sett ${w}: ${sqSets}×${sqReps} – ${sqKg} kg.`,
          sets: makeSets(sqSets, sqKg, sqReps, "Low Bar")
        },
        {
          id: `b1_w${w}_d3_e2`,
          name: "Hack Squat",
          muscleGroup: "Gambe",
          restSeconds: 120,
          notes: `Sett ${w}: Ramp${hackRamp} RPE8 + 2×${hackBack} stesso carico.`,
          sets: [
            { weight: 35, reps: hackRamp, tag: "Ramp RPE8" },
            { weight: 35, reps: hackBack, tag: "Stesso carico" },
            { weight: 35, reps: hackBack, tag: "Stesso carico" }
          ]
        },
        {
          id: `b1_w${w}_d3_e3`,
          name: "Leg Press Orizzontale – Pacco Pesi",
          muscleGroup: "Gambe",
          restSeconds: 180,
          notes: `Sett 1–4: 2×6 – TUT 5-0-5. Ogni serie dura circa 1 minuto. Senza scarpe e senza ginocchiere.`,
          sets: makeSets(2, 80, 6, "TUT 5-0-5")
        },
        {
          id: `b1_w${w}_d3_e4`,
          name: "Leg Curl Seduto",
          muscleGroup: "Gambe",
          restSeconds: 75,
          notes: `Il RIR è riferito alla prima serie. Sett ${w}: 4×${lcReps} – ${lcRir}.`,
          sets: makeSets(4, 45, lcReps, lcRir)
        },
        {
          id: `b1_w${w}_d3_e5`,
          name: "Leg Extension – Muscle Round Stevenson",
          muscleGroup: "Gambe",
          restSeconds: 15,
          notes: `Sett 1–4:\n1ª serie: 10 rep @9.\n2ª serie – Muscle Round: stesso carico della 1ª serie, 6×4 rep con Rest 15" tra ogni mini-set.`,
          sets: [
            { weight: 50, reps: 10, tag: "1ª Serie @9" },
            { weight: 50, reps: 4, tag: 'MR 1/6 (15")' },
            { weight: 50, reps: 4, tag: 'MR 2/6 (15")' },
            { weight: 50, reps: 4, tag: 'MR 3/6 (15")' },
            { weight: 50, reps: 4, tag: 'MR 4/6 (15")' },
            { weight: 50, reps: 4, tag: 'MR 5/6 (15")' },
            { weight: 50, reps: 4, tag: 'MR 6/6' }
          ]
        },
        {
          id: `b1_w${w}_d3_e6`,
          name: "Calf Raise",
          muscleGroup: "Gambe",
          restSeconds: 60,
          notes: `Sett 1–4: 4×15/14/13/12. Fermo in massimo allungamento + massima contrazione.`,
          sets: [
            { weight: 30, reps: 15, tag: "Fermo max" },
            { weight: 30, reps: 14, tag: "Fermo max" },
            { weight: 30, reps: 13, tag: "Fermo max" },
            { weight: 30, reps: 12, tag: "Fermo max" }
          ]
        },
        {
          id: `b1_w${w}_d3_e7`,
          name: "Addome – Crunch Lat con Vulken / Panca",
          muscleGroup: "Addome",
          restSeconds: 60,
          notes: `Sett 1–4: 3×12.\nOpzione A: Crunch alla Lat Machine con Vulken (Iso 1" in massima contrazione).\nIn alternativa: Panca addominali con sovraccarico 3×12.`,
          sets: makeSets(3, 25, 12, 'Iso 1"')
        }
      ]
    });

    // --- GIORNO 4 – UPPER ---
    const b3Kg = [90, 92.5, 95, 97.5][idx];
    const latPir = [
      [8, 10, 12],
      [7, 9, 11],
      [6, 8, 10],
      [5, 7, 9]
    ][idx];
    const incCpReps = [10, 9, 8, 7][idx];
    const incCpRir = ["RIR2", "RIR2", "RIR1", "RIR1"][idx];
    const rowRamp = [8, 7, 6, 5][idx];
    const rowBack = [11, 10, 9, 8][idx];
    const pdRopeReps = [15, 14, 13, 12][idx];

    routines.push({
      id: `b1_w${w}_d4`,
      programId: "prog_pdf_s1_s4",
      programName: "Programma PDF (Sett 1–4)",
      week: w,
      dayNumber: 4,
      name: "Giorno 4 – Upper",
      description: `Settimana ${w} • Panca Fermo 3" 3×3 @ ${b3Kg}kg, Lat Piramidale, Rematore Straps, SST Bicipiti`,
      updatedAt,
      exercises: [
        {
          id: `b1_w${w}_d4_e1`,
          name: 'Panca Piana – Fermo 3"',
          muscleGroup: "Petto",
          restSeconds: 180,
          notes: `Sett ${w}: 3×3 – ${b3Kg} kg. Progressione: +1,25 kg per lato a settimana.`,
          sets: makeSets(3, b3Kg, 3, 'Fermo 3"')
        },
        {
          id: `b1_w${w}_d4_e2`,
          name: "Lat Machine – Presa Supinata",
          muscleGroup: "Schiena",
          restSeconds: 120,
          notes: `Piramidale Inverso Sett ${w}: ${latPir.join(" / ")} rep.\n1ª serie: carico per completare rep a RPE9. 2ª serie: -10%. 3ª serie: ulteriore -10%.`,
          sets: [
            { weight: 90, reps: latPir[0], tag: "RPE9" },
            { weight: 80, reps: latPir[1], tag: "-10%" },
            { weight: 70, reps: latPir[2], tag: "-10%" }
          ]
        },
        {
          id: `b1_w${w}_d4_e3`,
          name: "Chest Press Inclinata Convergente",
          muscleGroup: "Petto",
          restSeconds: 90,
          notes: `Il RIR è riferito alla prima serie. Sett ${w}: 3×${incCpReps} ${incCpRir}.`,
          sets: makeSets(3, 60, incCpReps, incCpRir)
        },
        {
          id: `b1_w${w}_d4_e4`,
          name: "Rematore Bilanciere – Straps",
          muscleGroup: "Schiena",
          restSeconds: 150,
          notes: `Sett ${w}: Ramp${rowRamp} RPE8 + 2×${rowBack} back-off (-20 kg rispetto alla Ramp).`,
          sets: [
            { weight: 85, reps: rowRamp, tag: "Ramp RPE8" },
            { weight: 65, reps: rowBack, tag: "Back-off -20kg" },
            { weight: 65, reps: rowBack, tag: "Back-off -20kg" }
          ]
        },
        {
          id: `b1_w${w}_d4_e5a`,
          name: "Alzate Laterali Machine",
          muscleGroup: "Spalle",
          superset: "SS Alzate (A)",
          restSeconds: 15,
          notes: `SUPER SERIE – ALZATE LATERALI (A). Sett 1–4: 3×12–15 Machine + subito MAX rep con manubri da 10 kg.`,
          sets: makeSets(3, 25, 15, "12-15 rep")
        },
        {
          id: `b1_w${w}_d4_e5b`,
          name: "Alzate Laterali Manubri",
          muscleGroup: "Spalle",
          superset: "SS Alzate (B)",
          restSeconds: 90,
          notes: `SUPER SERIE – ALZATE LATERALI (B). 10 kg × MAX rep subito dopo Machine.`,
          sets: makeSets(3, 10, 15, "10kg MAX")
        },
        {
          id: `b1_w${w}_d4_e6`,
          name: "Curl al Cavo Basso – SST",
          muscleGroup: "Bicipiti",
          restSeconds: 20,
          notes: `Sett 1–4: 1 SST (Sarcoplasma Stimulating Training):\n1) 8 rep con vero 8RM -> Rest 20"\n2) Scarica 20% -> MAX rep TUT 1"-4" -> Rest 20"\n3) Scarica altro 20% -> MAX rep TUT 4"-1" -> Rest 20"\n4) Isometria a cedimento -> Rest 20"\n5) Serie finale a cedimento`,
          sets: [
            { weight: 50, reps: 8, tag: "1) 8RM" },
            { weight: 40, reps: 8, tag: '2) -20% 1"-4"' },
            { weight: 32, reps: 8, tag: '3) -20% 4"-1"' },
            { weight: 32, reps: 30, tag: "4) Iso cedim." },
            { weight: 32, reps: 10, tag: "5) Finale MAX" }
          ]
        },
        {
          id: `b1_w${w}_d4_e7`,
          name: "Pushdown Corda",
          muscleGroup: "Tricipiti",
          restSeconds: 75,
          notes: `Sett ${w}: 3×${pdRopeReps}.`,
          sets: makeSets(3, 45, pdRopeReps)
        }
      ]
    });
  });

  return routines;
}

/**
 * Genera le 16 schede del Blocco 2 (Sett 5–8) con tutti i carichi e le note personali dell'utente
 */
function buildBlock2Routines() {
  const updatedAt = "2026-11-24T12:00:00.000Z";
  const routines = [];

  const weeks = [5, 6, 7, 8];
  weeks.forEach(w => {
    const idx = w - 5; // 0..3

    // --- GIORNO 1: Stacco sumo / Schiena / Bicipiti ---
    const sumoTopKg = [132.5, 140, 147.5, 155][idx];
    const sumoTopReps = [5, 4, 3, 2][idx];
    const sumoBackKg = [120, 125, 132.5, 140][idx];
    const sumoLogNotes = [
      "LOG: fatto! (132.5kg×5 + 2×5 back-off -10%)",
      "LOG: fatto, ho avuto mal di schiena 3 giorni (140kg×4 + back-off)",
      "LOG: fatto 147.5kg×3 poi 132.5kg × 5, 5",
      "LOG: fatto con 160kg × 2 e 170kg × 2!"
    ][idx];
    const sumoSets = w === 8
      ? [
          { weight: 160, reps: 2, tag: "Fatto 160×2" },
          { weight: 170, reps: 2, tag: "PR 170×2" }
        ]
      : [
          { weight: sumoTopKg, reps: sumoTopReps, tag: "Top Set" },
          { weight: sumoBackKg, reps: 5, tag: "Back-off -10%" },
          { weight: sumoBackKg, reps: 5, tag: "Back-off -10%" }
        ];

    const lowRowReps = [10, 9, 8, 7][idx];
    const lowRowLog = [
      "",
      " | LOG Sett 6: 71.25kg×4, 50kg×10, 50kg×6",
      " | LOG Sett 7: Bibione 70kg",
      ""
    ][idx];
    const lowRowSets = w === 6
      ? [
          { weight: 71.25, reps: 4, tag: "Log 71.25×4" },
          { weight: 50, reps: 10, tag: "Log 50×10" },
          { weight: 50, reps: 6, tag: "Log 50×6" }
        ]
      : w === 7
        ? makeSets(2, 70, 8, "Bibione 70kg")
        : makeSets(2, 60, lowRowReps, "RIR1");

    const curlIncReps = [8, 7, 6, 5][idx];
    const curlIncSets = w === 6
      ? [{ weight: 12.5, reps: 8, tag: "Log 12.5×8" }, { weight: 12.5, reps: 7, tag: "RIR1" }]
      : makeSets(2, 17.5, curlIncReps, "RIR1");

    routines.push({
      id: `b2_w${w}_d1`,
      programId: "prog_block2_s5_s8",
      programName: "Blocco Precedente (Sett 5–8)",
      week: w,
      dayNumber: 1,
      name: "Giorno 1 – Stacco Sumo / Schiena / Bicipiti",
      description: `Settimana ${w} • Stacco Sumo 1×${sumoTopReps} (${sumoTopKg}kg) • ${sumoLogNotes}`,
      updatedAt,
      exercises: [
        {
          id: `b2_w${w}_d1_e1`,
          name: "Stacco Sumo",
          muscleGroup: "Schiena",
          restSeconds: 180,
          notes: `Sett ${w}: 1×${sumoTopReps} – ${sumoTopKg} kg + 2×5 back-off -10%.\nPretensionamento lungo prima di OGNI rep; ricostruire setup e incastro.\n${sumoLogNotes}`,
          sets: sumoSets
        },
        {
          id: `b2_w${w}_d1_e2`,
          name: "Trazioni Corpo Libero",
          muscleGroup: "Schiena",
          restSeconds: 110,
          notes: `Sett 5–8: 5×7 – fermo 1" in alto, rec. 110". (Nota: Sett 1 non fatte)`,
          sets: makeSets(5, 0, 7, 'Fermo 1"')
        },
        {
          id: `b2_w${w}_d1_e3a`,
          name: "Seal Row Manubri",
          muscleGroup: "Schiena",
          superset: "SS Schiena (A)",
          restSeconds: 15,
          notes: `⚠ NOTA PERSONALE: non lo farò.\nProgramma Sett 5–8: 3 superserie Seal Row 7–9 rep (ISO 1" max contrazione) + Rematore EZ MAX rep.`,
          sets: makeSets(3, 24, 8, 'ISO 1" (skip)')
        },
        {
          id: `b2_w${w}_d1_e3b`,
          name: "Rematore Bilanciere EZ Presa Larga Supinata",
          muscleGroup: "Schiena",
          superset: "SS Schiena (B)",
          restSeconds: 120,
          notes: `⚠ NOTA PERSONALE: non lo farò.\n15 kg/lato presa larga supinata, touch & go, rec. 120" a fine superserie.`,
          sets: makeSets(3, 15, 12, "15kg/lato (skip)")
        },
        {
          id: `b2_w${w}_d1_e4`,
          name: "Low Row",
          muscleGroup: "Schiena",
          restSeconds: 90,
          notes: `Sett ${w}: 2×${lowRowReps} – RIR1${lowRowLog}`,
          sets: lowRowSets
        },
        {
          id: `b2_w${w}_d1_e5`,
          name: "Pulldown con Vulken",
          muscleGroup: "Schiena",
          restSeconds: 90,
          notes: `Sett 5–8: 3×35" – 35 kg iniziali. Aumentare di 5 kg SOLO quando si completano tutte e 3 le serie da 35".\nLOG Lat Machine: Sett 2 70kg 7-7-7 (aumenta) | Sett 3 Bibione 75kg 7-7-7.`,
          sets: makeSets(3, 35, 35, "35 sec")
        },
        {
          id: `b2_w${w}_d1_e6`,
          name: "Strict Curl Cheating",
          muscleGroup: "Bicipiti",
          restSeconds: 90,
          notes: `Sett 5–8: 2 serie a cedimento (20 kg) + 1×MAX back-off (10 kg/lato, obiettivo 20 rep).\nLOG: Sett 2: 20kg 4-4 + 10kg×10 | Sett 3: 20kg 5-5 + 10kg×13 | Sett 4: 20kg 6-6 (solo questo, no schiena).`,
          sets: [
            { weight: 20, reps: 6, tag: "Cedimento" },
            { weight: 20, reps: 6, tag: "Cedimento" },
            { weight: 10, reps: 15, tag: "Back-off MAX" }
          ]
        },
        {
          id: `b2_w${w}_d1_e7`,
          name: "Curl su Panca Inclinata",
          muscleGroup: "Bicipiti",
          restSeconds: 60,
          notes: `Sett ${w}: 2×${curlIncReps} – RIR1 (solo alla 1ª serie, rif. 17,5 kg/manubrio).${w === 6 ? " LOG Sett 6: 12.5kg×8 | Avambracci: 18kg×13." : " Extra: Avambracci 18kg×13."}`,
          sets: curlIncSets
        }
      ]
    });

    // --- GIORNO 2: Petto / Spalle / Tricipiti ---
    const b1Kg = [95, 97.5, 100, 102.5][idx];
    const b1Reps = [5, 5, 4, 4][idx];
    const b1Log = [
      "LOG: fatto!",
      "LOG: fatto!",
      "LOG: 4-4-4 basta per il braccio",
      "Target Sett 8: 4×4 – 102.5 kg"
    ][idx];
    const b1Sets = w === 7 ? makeSets(3, 100, 4, "Stop braccio") : makeSets(4, b1Kg, b1Reps, 'Fermo 1"');

    const incSetsCount = [5, 4, 3, 2][idx];
    const incReps = [5, 6, 7, 8][idx];
    const incLog = w <= 6 ? " | LOG: fatto!" : "";

    const cpReps = [8, 7, 6, 5][idx];
    const cpRpe = ["@8", "@8", "@8.5", "@9"][idx];
    const cpKg = w === 6 ? 70 : w === 7 ? 60 : 70;
    const cpLog = w === 6 ? " | LOG: 70kg×6 (tieni 70kg)" : w === 7 ? " | LOG: Bibione 60kg" : "";

    const latReps = [12, 11, 10, 9][idx];
    const latRir = ["RIR2", "RIR2", "RIR1", "RIR1"][idx];

    const fpReps = [8, 7, 6, 5][idx];
    const fpKg = [13.75, 15, 15, 15][idx];
    const fpLog = w === 5 ? " | LOG: 13.75 kg/lato" : w === 6 ? " | LOG: 15 kg/lato" : "";

    routines.push({
      id: `b2_w${w}_d2`,
      programId: "prog_block2_s5_s8",
      programName: "Blocco Precedente (Sett 5–8)",
      week: w,
      dayNumber: 2,
      name: "Giorno 2 – Petto / Spalle / Tricipiti",
      description: `Settimana ${w} • Panca 4×${b1Reps} (${b1Kg}kg) • ${b1Log}`,
      updatedAt,
      exercises: [
        {
          id: `b2_w${w}_d2_e1`,
          name: 'Panca Piana – Fermo 1"',
          muscleGroup: "Petto",
          restSeconds: 180,
          notes: `Sett ${w}: 4×${b1Reps} – ${b1Kg} kg. Fermo 1" al petto, rec. 180".\n${b1Log}`,
          sets: b1Sets
        },
        {
          id: `b2_w${w}_d2_e2`,
          name: "Distensioni Manubri – Panca Inclinata 30°",
          muscleGroup: "Petto",
          restSeconds: 120,
          notes: `Sett ${w}: ${incSetsCount}×${incReps} – 30 kg/manubrio${incLog}`,
          sets: makeSets(incSetsCount, 30, incReps, "30kg/man")
        },
        {
          id: `b2_w${w}_d2_e3`,
          name: "Chest Press Panatta Convergente",
          muscleGroup: "Petto",
          restSeconds: 90,
          notes: `Sett ${w}: 1×${cpReps} ${cpRpe}${cpLog}`,
          sets: [{ weight: cpKg, reps: w === 6 ? 6 : cpReps, tag: cpRpe }]
        },
        {
          id: `b2_w${w}_d2_e4`,
          name: "Alzate Laterali Pesanti alla Presti",
          muscleGroup: "Spalle",
          restSeconds: 60,
          notes: `Sett ${w}: 3×${latReps} – ${latRir} + Myo-Reps ultima.\nLOG Cavo: 10kg × 10, 10kg × 13, 11.5kg.`,
          sets: [
            { weight: 10, reps: latReps, tag: latRir },
            { weight: 10, reps: latReps, tag: latRir },
            { weight: 11.5, reps: latReps, tag: "+ Myo-Reps" }
          ]
        },
        {
          id: `b2_w${w}_d2_e5`,
          name: "French Press EZ",
          muscleGroup: "Tricipiti",
          restSeconds: 90,
          notes: `Sett ${w}: 1×${fpReps} @8.5. Nessun Ramping, nessun back-off. Carico autoregolato.${fpLog}`,
          sets: [{ weight: fpKg, reps: fpReps, tag: "@8.5 (kg/lato)" }]
        }
      ]
    });

    // --- GIORNO 3: Gambe / Polpacci / Addome ---
    const sqSets = [4, 3, 4, 3][idx];
    const sqReps = [7, 7, 6, 6][idx];
    const sqKg = [92.5, 97.5, 100, 102.5][idx];
    const sqLog = [
      "LOG: 92.5kg × 7, 7",
      "Target Sett 6: 3×7 – 97.5 kg",
      "LOG: 100kg × 6, 6 (continuare)",
      "LOG: fatto! (3×6 – 102.5 kg)"
    ][idx];
    const hackKg = [35, 40, 45, 50][idx];
    const hackReps = [8, 7, 6, 5][idx];
    const lcReps = [10, 9, 8, 7][idx];
    const lcRir = ["RIR2", "RIR2", "RIR1", "RIR1"][idx];

    routines.push({
      id: `b2_w${w}_d3`,
      programId: "prog_block2_s5_s8",
      programName: "Blocco Precedente (Sett 5–8)",
      week: w,
      dayNumber: 3,
      name: "Giorno 3 – Gambe / Polpacci / Addome",
      description: `Settimana ${w} • Squat Low Bar ${sqSets}×${sqReps} (${sqKg}kg) • ${sqLog}`,
      updatedAt,
      exercises: [
        {
          id: `b2_w${w}_d3_e1`,
          name: "Squat Low Bar",
          muscleGroup: "Gambe",
          restSeconds: 180,
          notes: `Sett ${w}: ${sqSets}×${sqReps} – ${sqKg} kg. Rec. 180"; mantenere tecnica e profondità costanti.\n${sqLog}`,
          sets: makeSets(sqSets, sqKg, sqReps, "Low Bar")
        },
        {
          id: `b2_w${w}_d3_e2`,
          name: "Hack Squat",
          muscleGroup: "Gambe",
          restSeconds: 120,
          notes: `Sett ${w}: 2×${hackReps} – ${hackKg} kg/lato. Carichi prestabiliti, senza Ramping e senza back-off.${w === 5 ? " LOG: fatto!" : ""}`,
          sets: makeSets(2, hackKg, hackReps, `${hackKg}kg/lato`)
        },
        {
          id: `b2_w${w}_d3_e3`,
          name: "Leg Curl Seduto",
          muscleGroup: "Gambe",
          restSeconds: 75,
          notes: `Sett ${w}: 3×${lcReps} – ${lcRir} (solo alla 1ª serie).${w === 5 ? " LOG Sett 5: 45kg × 10, 10, 10." : ""}`,
          sets: makeSets(3, 45, lcReps, lcRir)
        },
        {
          id: `b2_w${w}_d3_e4`,
          name: "Leg Press Orizzontale – Pacco Pesi",
          muscleGroup: "Gambe",
          restSeconds: 180,
          notes: `Sett 5–8: 2×5 – TUT 525 (5" eccentrica, 2" fermo max allungamento, 5" concentrica = 60"/serie). Senza scarpe/ginocchiere. Rec. 180".`,
          sets: makeSets(2, 80, 5, "TUT 5-2-5")
        },
        {
          id: `b2_w${w}_d3_e5`,
          name: "Leg Extension – Muscle Round Stevenson",
          muscleGroup: "Gambe",
          restSeconds: 15,
          notes: `Sett 5–8: 1×10 @9 + 1 Muscle Round 6×4 con lo STESSO carico e 15" di recupero fra i cluster.`,
          sets: [
            { weight: 50, reps: 10, tag: "1×10 @9" },
            { weight: 50, reps: 4, tag: 'MR 1/6 (15")' },
            { weight: 50, reps: 4, tag: 'MR 2/6 (15")' },
            { weight: 50, reps: 4, tag: 'MR 3/6 (15")' },
            { weight: 50, reps: 4, tag: 'MR 4/6 (15")' },
            { weight: 50, reps: 4, tag: 'MR 5/6 (15")' },
            { weight: 50, reps: 4, tag: 'MR 6/6' }
          ]
        },
        {
          id: `b2_w${w}_d3_e6`,
          name: "Calf Raise",
          muscleGroup: "Gambe",
          restSeconds: 60,
          notes: `Sett 5–8: 4 serie da 12/11/10/9 rep; controllare intero ROM.\nLOG: 20kg×20, 30kg×12, 30kg×12 | Bicipiti del polpaccio: 5kg × 12, 12.`,
          sets: [
            { weight: 20, reps: 12, tag: "ROM pieno" },
            { weight: 30, reps: 11, tag: "ROM pieno" },
            { weight: 30, reps: 10, tag: "ROM pieno" },
            { weight: 30, reps: 9, tag: "ROM pieno" }
          ]
        },
        {
          id: `b2_w${w}_d3_e7`,
          name: "Addome – Crunch Lat con Vulken / Panca",
          muscleGroup: "Addome",
          restSeconds: 60,
          notes: `Sett 5–8: 3×12 – ISO 1" in max contrazione (crunch alla lat con Vulken o panca declinata zavorrato). Aumentare carico se chiuse tutte.`,
          sets: makeSets(3, 25, 12, 'ISO 1"')
        }
      ]
    });

    // --- GIORNO 4: Panca / Dorso / Petto / Braccia ---
    const b3Kg = [100, 102.5, 105, 107.5][idx];
    const b3Log = [
      'LOG: fatto easy senza fermo 3" (non lo sapevo)',
      "LOG: fatto!",
      "LOG: fatto!",
      "Target Sett 8: 3×2 – 107.5 kg"
    ][idx];
    const latRepsArr = [
      [8, 10, 12],
      [9, 11, 13],
      [10, 12, 14],
      [11, 13, 15]
    ][idx];
    const latSets = w === 5
      ? [
          { weight: 100, reps: 7, tag: "Log 100×7" },
          { weight: 80, reps: 10, tag: "Log 80×10" },
          { weight: 65, reps: 12, tag: "Log 65×12" }
        ]
      : w === 6
        ? [
            { weight: 90, reps: 9, tag: "Bibione 90×9" },
            { weight: 75, reps: 7, tag: "Bibione 75×7" },
            { weight: 65, reps: 6, tag: "Bibione 65×6" }
          ]
        : [
            { weight: 100, reps: latRepsArr[0], tag: "100kg" },
            { weight: 80, reps: latRepsArr[1], tag: "80kg" },
            { weight: 65, reps: latRepsArr[2], tag: "65kg" }
          ];

    const rowTopKg = [85, 87.5, 90, 92.5][idx];
    const rowTopReps = [8, 7, 6, 5][idx];
    const rowBackKg = [75, 77.5, 80, 82.5][idx];
    const rowBackReps = [10, 9, 8, 7][idx];

    const pdKg = [70, 75, 80, 85][idx];
    const pdReps = [12, 11, 10, 9][idx];

    routines.push({
      id: `b2_w${w}_d4`,
      programId: "prog_block2_s5_s8",
      programName: "Blocco Precedente (Sett 5–8)",
      week: w,
      dayNumber: 4,
      name: "Giorno 4 – Panca / Dorso / Petto / Braccia",
      description: `Settimana ${w} • Panca Fermo 3" 3×2 (${b3Kg}kg) • ${b3Log}`,
      updatedAt,
      exercises: [
        {
          id: `b2_w${w}_d4_e1`,
          name: 'Panca Piana – Fermo 3"',
          muscleGroup: "Petto",
          restSeconds: 180,
          notes: `Sett ${w}: 3×2 – ${b3Kg} kg. Fermo 3" al petto a ogni rep. Rec. 180".\n${b3Log}`,
          sets: makeSets(3, b3Kg, 2, 'Fermo 3"')
        },
        {
          id: `b2_w${w}_d4_e2`,
          name: "Lat Machine – Presa Supinata",
          muscleGroup: "Schiena",
          restSeconds: 120,
          notes: `Piramidale Inverso Sett ${w}: 100kg×${latRepsArr[0]} / 80kg×${latRepsArr[1]} / 65kg×${latRepsArr[2]}. Carichi fissi, rec. 120".${w === 5 ? "\nLOG Sett 5: 100kg×7, 80kg×10, 65kg×12." : w === 6 ? "\nLOG Bibione: 90kg×9, 75kg×7, 65kg×6." : ""}`,
          sets: latSets
        },
        {
          id: `b2_w${w}_d4_e3`,
          name: "Chest Press Inclinata Convergente",
          muscleGroup: "Petto",
          restSeconds: 30,
          notes: `FST-7 Sett 5–8: 7×8–12 – 60 kg (rec. 30" TRA LE SERIE). Eccentrica controllata, max contrazione.\nLOG Sett 5: 60kg × 8, 8, 7 + 50kg × 6 | LOG Bibione: 40kg × 7×8.`,
          sets: w === 5
            ? [
                { weight: 60, reps: 8, tag: "FST-7" },
                { weight: 60, reps: 8, tag: "FST-7" },
                { weight: 60, reps: 7, tag: "FST-7" },
                { weight: 50, reps: 6, tag: "Drop 50kg" }
              ]
            : w === 6
              ? makeSets(7, 40, 8, "Bibione FST-7")
              : makeSets(7, 60, 10, 'FST-7 30"')
        },
        {
          id: `b2_w${w}_d4_e4`,
          name: "Rematore Bilanciere – Straps",
          muscleGroup: "Schiena",
          restSeconds: 150,
          notes: `Sett ${w}: 1×${rowTopReps} (${rowTopKg}kg) + 2×${rowBackReps} (${rowBackKg}kg). Straps obbligatori, back-off -10 kg, rec. 150".\n⚠ LOG: impossibile per gomiti.`,
          sets: [
            { weight: rowTopKg, reps: rowTopReps, tag: "Top Set" },
            { weight: rowBackKg, reps: rowBackReps, tag: "Back-off -10kg" },
            { weight: rowBackKg, reps: rowBackReps, tag: "Back-off -10kg" }
          ]
        },
        {
          id: `b2_w${w}_d4_e5`,
          name: "Curl al Cavo Basso – SST",
          muscleGroup: "Bicipiti",
          restSeconds: 20,
          notes: `Sett 5–8: 1 protocollo SST (8RM iniziale 65 kg).\n1) 8RM cedimento (65kg) -> rec 20"\n2) -20% carico, MAX rep TUT 1" conc/4" ecc -> rec 20"\n3) -20% carico, MAX rep TUT 4" conc/1" ecc -> rec 20"\n4) Isometria 30" max contrazione -> rec 20"\n5) Serie finale MAX rep a cedimento.\n⚠ LOG: Sett 1 impossibile per gomiti.`,
          sets: [
            { weight: 65, reps: 8, tag: "1) 8RM 65kg" },
            { weight: 52, reps: 8, tag: '2) -20% 1"-4"' },
            { weight: 40, reps: 8, tag: '3) -20% 4"-1"' },
            { weight: 40, reps: 30, tag: '4) Iso 30"' },
            { weight: 40, reps: 10, tag: "5) Finale MAX" }
          ]
        },
        {
          id: `b2_w${w}_d4_e6`,
          name: "Pushdown Corda",
          muscleGroup: "Tricipiti",
          restSeconds: 90,
          notes: `Sett ${w}: 3×${pdReps} – ${pdKg} kg. Rec. 90"; mantenere gomiti stabili.${w === 5 ? "\n⚠ LOG Sett 5: impossibile gomiti." : ""}`,
          sets: makeSets(3, pdKg, pdReps)
        }
      ]
    });
  });

  return routines;
}

const DEFAULT_ROUTINES = [
  ...buildBlock1Routines(),
  ...buildBlock2Routines()
];

/**
 * Genera lo storico reale precaricato con tutte le sessioni e i carichi effettivamente svolti dall'utente
 * (Sett 5–8 + log extra di Lat Machine e Strict Curl)
 */
function generateDefaultHistory() {
  function calcVol(exercises) {
    let total = 0;
    exercises.forEach(ex => {
      (ex.sets || []).forEach(s => {
        if (s.completed) total += (Number(s.weight) || 0) * (Number(s.reps) || 0);
      });
    });
    return Math.round(total * 10) / 10;
  }

  function buildSession({ id, routineId, routineName, week, dayNumber, date, durationMinutes, exercises }) {
    return {
      id,
      routineId,
      routineName,
      week,
      dayNumber,
      date,
      durationMinutes,
      totalVolumeKg: calcVol(exercises),
      exercises
    };
  }

  return [
    // --- LOG EXTRA SETT 2–4 (Lat Machine & Strict Curl) ---
    buildSession({
      id: "hist_real_s2_pull",
      routineId: "b1_w2_d1",
      routineName: "Sett 2 • Giorno 1 – Pull (Log Lat + Strict Curl)",
      week: 2,
      dayNumber: 1,
      date: "2026-10-12T18:00:00.000Z",
      durationMinutes: 55,
      exercises: [
        {
          name: "Lat Machine – Presa Supinata",
          notes: "Sett 2: 70kg 7-7-7 (aumenta)",
          sets: [
            { setNumber: 1, weight: 70, reps: 7, completed: true },
            { setNumber: 2, weight: 70, reps: 7, completed: true },
            { setNumber: 3, weight: 70, reps: 7, completed: true }
          ]
        },
        {
          name: "Strict Curl Cheating",
          notes: "Sett 2: 20kg 4-4 + back-off 10kg/lato × 10",
          sets: [
            { setNumber: 1, weight: 20, reps: 4, completed: true },
            { setNumber: 2, weight: 20, reps: 4, completed: true },
            { setNumber: 3, weight: 10, reps: 10, completed: true }
          ]
        }
      ]
    }),
    buildSession({
      id: "hist_real_s3_pull",
      routineId: "b1_w3_d1",
      routineName: "Sett 3 • Giorno 1 – Pull (Bibione)",
      week: 3,
      dayNumber: 1,
      date: "2026-10-19T18:00:00.000Z",
      durationMinutes: 55,
      exercises: [
        {
          name: "Lat Machine – Presa Supinata",
          notes: "Sett 3 Bibione: 75kg 7-7-7",
          sets: [
            { setNumber: 1, weight: 75, reps: 7, completed: true },
            { setNumber: 2, weight: 75, reps: 7, completed: true },
            { setNumber: 3, weight: 75, reps: 7, completed: true }
          ]
        },
        {
          name: "Strict Curl Cheating",
          notes: "Sett 3: 20kg 5-5 + back-off 10kg/lato × 13",
          sets: [
            { setNumber: 1, weight: 20, reps: 5, completed: true },
            { setNumber: 2, weight: 20, reps: 5, completed: true },
            { setNumber: 3, weight: 10, reps: 13, completed: true }
          ]
        }
      ]
    }),
    buildSession({
      id: "hist_real_s4_pull",
      routineId: "b1_w4_d1",
      routineName: "Sett 4 • Giorno 1 – Strict Curl (solo braccia)",
      week: 4,
      dayNumber: 1,
      date: "2026-10-26T18:00:00.000Z",
      durationMinutes: 30,
      exercises: [
        {
          name: "Strict Curl Cheating",
          notes: "Sett 4: 20kg 6-6 (ho fatto solo questo, non ho fatto schiena)",
          sets: [
            { setNumber: 1, weight: 20, reps: 6, completed: true },
            { setNumber: 2, weight: 20, reps: 6, completed: true }
          ]
        }
      ]
    }),

    // --- SETTIMANA 5 ---
    buildSession({
      id: "hist_real_s5_d1",
      routineId: "b2_w5_d1",
      routineName: "Sett 5 • Giorno 1 – Stacco Sumo / Schiena / Bicipiti",
      week: 5,
      dayNumber: 1,
      date: "2026-10-28T18:00:00.000Z",
      durationMinutes: 70,
      exercises: [
        {
          name: "Stacco Sumo",
          notes: "Fatto! 1×5 132.5 kg + 2×5 back-off -10% (120 kg)",
          sets: [
            { setNumber: 1, weight: 132.5, reps: 5, completed: true },
            { setNumber: 2, weight: 120, reps: 5, completed: true },
            { setNumber: 3, weight: 120, reps: 5, completed: true }
          ]
        }
      ]
    }),
    buildSession({
      id: "hist_real_s5_d2",
      routineId: "b2_w5_d2",
      routineName: "Sett 5 • Giorno 2 – Petto / Spalle / Tricipiti",
      week: 5,
      dayNumber: 2,
      date: "2026-10-29T18:00:00.000Z",
      durationMinutes: 68,
      exercises: [
        {
          name: 'Panca Piana – Fermo 1"',
          notes: "Fatto! 4×5 – 95 kg",
          sets: [
            { setNumber: 1, weight: 95, reps: 5, completed: true },
            { setNumber: 2, weight: 95, reps: 5, completed: true },
            { setNumber: 3, weight: 95, reps: 5, completed: true },
            { setNumber: 4, weight: 95, reps: 5, completed: true }
          ]
        },
        {
          name: "Distensioni Manubri – Panca Inclinata 30°",
          notes: "Fatto! 5×5 – 30 kg/manubrio",
          sets: [
            { setNumber: 1, weight: 30, reps: 5, completed: true },
            { setNumber: 2, weight: 30, reps: 5, completed: true },
            { setNumber: 3, weight: 30, reps: 5, completed: true },
            { setNumber: 4, weight: 30, reps: 5, completed: true },
            { setNumber: 5, weight: 30, reps: 5, completed: true }
          ]
        },
        {
          name: "Alzate Laterali al Cavo",
          notes: "Alzate laterali cavo: 10kg×10, 10kg×13, 11.5kg",
          sets: [
            { setNumber: 1, weight: 10, reps: 10, completed: true },
            { setNumber: 2, weight: 10, reps: 13, completed: true },
            { setNumber: 3, weight: 11.5, reps: 10, completed: true }
          ]
        },
        {
          name: "French Press EZ",
          notes: "1×8 @8.5 – 13.75 kg per lato",
          sets: [
            { setNumber: 1, weight: 13.75, reps: 8, completed: true }
          ]
        }
      ]
    }),
    buildSession({
      id: "hist_real_s5_d3",
      routineId: "b2_w5_d3",
      routineName: "Sett 5 • Giorno 3 – Gambe / Polpacci / Addome",
      week: 5,
      dayNumber: 3,
      date: "2026-10-31T18:00:00.000Z",
      durationMinutes: 72,
      exercises: [
        {
          name: "Squat Low Bar",
          notes: "Sett 5: 92.5 kg × 7, 7",
          sets: [
            { setNumber: 1, weight: 92.5, reps: 7, completed: true },
            { setNumber: 2, weight: 92.5, reps: 7, completed: true }
          ]
        },
        {
          name: "Hack Squat",
          notes: "Fatto! 2×8 – 35 kg/lato",
          sets: [
            { setNumber: 1, weight: 35, reps: 8, completed: true },
            { setNumber: 2, weight: 35, reps: 8, completed: true }
          ]
        },
        {
          name: "Leg Curl Seduto",
          notes: "3×10 RIR2 – 45 kg (10-10-10)",
          sets: [
            { setNumber: 1, weight: 45, reps: 10, completed: true },
            { setNumber: 2, weight: 45, reps: 10, completed: true },
            { setNumber: 3, weight: 45, reps: 10, completed: true }
          ]
        },
        {
          name: "Calf Raise",
          notes: "20kg×20, 30kg×12, 30kg×12",
          sets: [
            { setNumber: 1, weight: 20, reps: 20, completed: true },
            { setNumber: 2, weight: 30, reps: 12, completed: true },
            { setNumber: 3, weight: 30, reps: 12, completed: true }
          ]
        },
        {
          name: "Bicipiti del Polpaccio (Tibiale)",
          notes: "5kg × 12, 12",
          sets: [
            { setNumber: 1, weight: 5, reps: 12, completed: true },
            { setNumber: 2, weight: 5, reps: 12, completed: true }
          ]
        }
      ]
    }),
    buildSession({
      id: "hist_real_s5_d4",
      routineId: "b2_w5_d4",
      routineName: "Sett 5 • Giorno 4 – Panca / Dorso / Petto / Braccia",
      week: 5,
      dayNumber: 4,
      date: "2026-11-02T18:00:00.000Z",
      durationMinutes: 65,
      exercises: [
        {
          name: 'Panca Piana – Fermo 3"',
          notes: 'Fatto easy 3×2 – 100 kg senza fermo 3" (non lo sapevo)',
          sets: [
            { setNumber: 1, weight: 100, reps: 2, completed: true },
            { setNumber: 2, weight: 100, reps: 2, completed: true },
            { setNumber: 3, weight: 100, reps: 2, completed: true }
          ]
        },
        {
          name: "Lat Machine – Presa Supinata",
          notes: "100kg×7, 80kg×10, 65kg×12",
          sets: [
            { setNumber: 1, weight: 100, reps: 7, completed: true },
            { setNumber: 2, weight: 80, reps: 10, completed: true },
            { setNumber: 3, weight: 65, reps: 12, completed: true }
          ]
        },
        {
          name: "Chest Press Inclinata Convergente",
          notes: "FST-7 Sett 5: 60kg × 8, 8, 7 + 50kg × 6",
          sets: [
            { setNumber: 1, weight: 60, reps: 8, completed: true },
            { setNumber: 2, weight: 60, reps: 8, completed: true },
            { setNumber: 3, weight: 60, reps: 7, completed: true },
            { setNumber: 4, weight: 50, reps: 6, completed: true }
          ]
        },
        {
          name: "Rematore Bilanciere – Straps",
          notes: "⚠ Saltato: impossibile per gomiti",
          sets: []
        },
        {
          name: "Pushdown Corda",
          notes: "⚠ Saltato: impossibile per gomiti (70 kg)",
          sets: []
        }
      ]
    }),

    // --- SETTIMANA 6 ---
    buildSession({
      id: "hist_real_s6_d1",
      routineId: "b2_w6_d1",
      routineName: "Sett 6 • Giorno 1 – Stacco Sumo / Schiena / Bicipiti",
      week: 6,
      dayNumber: 1,
      date: "2026-11-04T18:00:00.000Z",
      durationMinutes: 68,
      exercises: [
        {
          name: "Stacco Sumo",
          notes: "Fatto 1×4 140 kg + 2×5 back-off -10% (125 kg). Ho avuto mal di schiena 3 giorni.",
          sets: [
            { setNumber: 1, weight: 140, reps: 4, completed: true },
            { setNumber: 2, weight: 125, reps: 5, completed: true },
            { setNumber: 3, weight: 125, reps: 5, completed: true }
          ]
        },
        {
          name: "Low Row",
          notes: "Sett 6: 71.25kg×4, 50kg×10, 50kg×6",
          sets: [
            { setNumber: 1, weight: 71.25, reps: 4, completed: true },
            { setNumber: 2, weight: 50, reps: 10, completed: true },
            { setNumber: 3, weight: 50, reps: 6, completed: true }
          ]
        },
        {
          name: "Curl su Panca Inclinata",
          notes: "Sett 6: 12.5kg × 8",
          sets: [
            { setNumber: 1, weight: 12.5, reps: 8, completed: true }
          ]
        },
        {
          name: "Avambracci (Wrist Curl)",
          notes: "Avambracci 18kg × 13",
          sets: [
            { setNumber: 1, weight: 18, reps: 13, completed: true }
          ]
        }
      ]
    }),
    buildSession({
      id: "hist_real_s6_d2",
      routineId: "b2_w6_d2",
      routineName: "Sett 6 • Giorno 2 – Petto / Spalle / Tricipiti",
      week: 6,
      dayNumber: 2,
      date: "2026-11-06T18:00:00.000Z",
      durationMinutes: 66,
      exercises: [
        {
          name: 'Panca Piana – Fermo 1"',
          notes: "Fatto! 4×5 – 97.5 kg",
          sets: [
            { setNumber: 1, weight: 97.5, reps: 5, completed: true },
            { setNumber: 2, weight: 97.5, reps: 5, completed: true },
            { setNumber: 3, weight: 97.5, reps: 5, completed: true },
            { setNumber: 4, weight: 97.5, reps: 5, completed: true }
          ]
        },
        {
          name: "Distensioni Manubri – Panca Inclinata 30°",
          notes: "Fatto! 4×6 – 30 kg/manubrio",
          sets: [
            { setNumber: 1, weight: 30, reps: 6, completed: true },
            { setNumber: 2, weight: 30, reps: 6, completed: true },
            { setNumber: 3, weight: 30, reps: 6, completed: true },
            { setNumber: 4, weight: 30, reps: 6, completed: true }
          ]
        },
        {
          name: "Chest Press Panatta Convergente",
          notes: "70 kg × 6 (tieni 70 kg)",
          sets: [
            { setNumber: 1, weight: 70, reps: 6, completed: true }
          ]
        },
        {
          name: "French Press EZ",
          notes: "1×7 @8.5 – 15 kg/lato",
          sets: [
            { setNumber: 1, weight: 15, reps: 7, completed: true }
          ]
        }
      ]
    }),
    buildSession({
      id: "hist_real_s6_d4",
      routineId: "b2_w6_d4",
      routineName: "Sett 6 • Giorno 4 – Upper (Bibione)",
      week: 6,
      dayNumber: 4,
      date: "2026-11-09T18:00:00.000Z",
      durationMinutes: 62,
      exercises: [
        {
          name: 'Panca Piana – Fermo 3"',
          notes: "Fatto! 3×2 – 102.5 kg",
          sets: [
            { setNumber: 1, weight: 102.5, reps: 2, completed: true },
            { setNumber: 2, weight: 102.5, reps: 2, completed: true },
            { setNumber: 3, weight: 102.5, reps: 2, completed: true }
          ]
        },
        {
          name: "Lat Machine – Presa Supinata",
          notes: "A Bibione: 90kg×9, 75kg×7, 65kg×6",
          sets: [
            { setNumber: 1, weight: 90, reps: 9, completed: true },
            { setNumber: 2, weight: 75, reps: 7, completed: true },
            { setNumber: 3, weight: 65, reps: 6, completed: true }
          ]
        },
        {
          name: "Chest Press Inclinata Convergente",
          notes: "FST-7 Bibione: 40kg × 8-8-8-8-8-8-8",
          sets: [
            { setNumber: 1, weight: 40, reps: 8, completed: true },
            { setNumber: 2, weight: 40, reps: 8, completed: true },
            { setNumber: 3, weight: 40, reps: 8, completed: true },
            { setNumber: 4, weight: 40, reps: 8, completed: true },
            { setNumber: 5, weight: 40, reps: 8, completed: true },
            { setNumber: 6, weight: 40, reps: 8, completed: true },
            { setNumber: 7, weight: 40, reps: 8, completed: true }
          ]
        }
      ]
    }),

    // --- SETTIMANA 7 ---
    buildSession({
      id: "hist_real_s7_d1",
      routineId: "b2_w7_d1",
      routineName: "Sett 7 • Giorno 1 – Stacco Sumo / Schiena (Bibione)",
      week: 7,
      dayNumber: 1,
      date: "2026-11-12T18:00:00.000Z",
      durationMinutes: 64,
      exercises: [
        {
          name: "Stacco Sumo",
          notes: "Fatto 147.5kg×3 poi 132.5kg × 5, 5",
          sets: [
            { setNumber: 1, weight: 147.5, reps: 3, completed: true },
            { setNumber: 2, weight: 132.5, reps: 5, completed: true },
            { setNumber: 3, weight: 132.5, reps: 5, completed: true }
          ]
        },
        {
          name: "Low Row",
          notes: "Bibione: 70 kg (2×8)",
          sets: [
            { setNumber: 1, weight: 70, reps: 8, completed: true },
            { setNumber: 2, weight: 70, reps: 8, completed: true }
          ]
        }
      ]
    }),
    buildSession({
      id: "hist_real_s7_d2",
      routineId: "b2_w7_d2",
      routineName: "Sett 7 • Giorno 2 – Petto / Spalle / Tricipiti",
      week: 7,
      dayNumber: 2,
      date: "2026-11-14T18:00:00.000Z",
      durationMinutes: 58,
      exercises: [
        {
          name: 'Panca Piana – Fermo 1"',
          notes: "100 kg: 4-4-4 (basta per il braccio)",
          sets: [
            { setNumber: 1, weight: 100, reps: 4, completed: true },
            { setNumber: 2, weight: 100, reps: 4, completed: true },
            { setNumber: 3, weight: 100, reps: 4, completed: true }
          ]
        },
        {
          name: "Chest Press Panatta Convergente",
          notes: "Bibione: 60 kg (1×6 @8.5)",
          sets: [
            { setNumber: 1, weight: 60, reps: 6, completed: true }
          ]
        }
      ]
    }),
    buildSession({
      id: "hist_real_s7_d3",
      routineId: "b2_w7_d3",
      routineName: "Sett 7 • Giorno 3 – Gambe",
      week: 7,
      dayNumber: 3,
      date: "2026-11-16T18:00:00.000Z",
      durationMinutes: 60,
      exercises: [
        {
          name: "Squat Low Bar",
          notes: "100 kg × 6, 6 (continuare)",
          sets: [
            { setNumber: 1, weight: 100, reps: 6, completed: true },
            { setNumber: 2, weight: 100, reps: 6, completed: true }
          ]
        }
      ]
    }),
    buildSession({
      id: "hist_real_s7_d4",
      routineId: "b2_w7_d4",
      routineName: "Sett 7 • Giorno 4 – Upper",
      week: 7,
      dayNumber: 4,
      date: "2026-11-18T18:00:00.000Z",
      durationMinutes: 55,
      exercises: [
        {
          name: 'Panca Piana – Fermo 3"',
          notes: "Fatto! 3×2 – 105 kg",
          sets: [
            { setNumber: 1, weight: 105, reps: 2, completed: true },
            { setNumber: 2, weight: 105, reps: 2, completed: true },
            { setNumber: 3, weight: 105, reps: 2, completed: true }
          ]
        }
      ]
    }),

    // --- SETTIMANA 8 ---
    buildSession({
      id: "hist_real_s8_d1",
      routineId: "b2_w8_d1",
      routineName: "Sett 8 • Giorno 1 – Stacco Sumo (PR 170 kg!)",
      week: 8,
      dayNumber: 1,
      date: "2026-11-20T18:00:00.000Z",
      durationMinutes: 65,
      exercises: [
        {
          name: "Stacco Sumo",
          notes: "Fatto con 160 kg × 2 e 170 kg × 2!",
          sets: [
            { setNumber: 1, weight: 160, reps: 2, completed: true },
            { setNumber: 2, weight: 170, reps: 2, completed: true }
          ]
        }
      ]
    }),
    buildSession({
      id: "hist_real_s8_d3",
      routineId: "b2_w8_d3",
      routineName: "Sett 8 • Giorno 3 – Squat Low Bar (102.5 kg)",
      week: 8,
      dayNumber: 3,
      date: "2026-11-22T18:00:00.000Z",
      durationMinutes: 65,
      exercises: [
        {
          name: "Squat Low Bar",
          notes: "Fatto! 3×6 – 102.5 kg",
          sets: [
            { setNumber: 1, weight: 102.5, reps: 6, completed: true },
            { setNumber: 2, weight: 102.5, reps: 6, completed: true },
            { setNumber: 3, weight: 102.5, reps: 6, completed: true }
          ]
        }
      ]
    })
  ];
}

// Alias di retrocompatibilità per eventuali riferimenti esterni
function generateMockHistory() {
  return generateDefaultHistory();
}
