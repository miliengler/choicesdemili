/* ==========================================================
   🌐 MEbank 3.0 — Banco TURBO (Versión Multimateria Real)
   ========================================================== */

/* --- 1. PROGRESO --- */
const STORAGE_KEY_PROG = "MEbank_PROG_v3";

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_PROG)) || {}; }
  catch { return {}; }
}

function saveProgress() {
  try { localStorage.setItem(STORAGE_KEY_PROG, JSON.stringify(PROG)); }
  catch (e) { console.warn("No se pudo guardar PROG", e); }
}

let PROG = loadProgress();

/* --- 2. UTILIDADES --- */
function normalize(s) {
  return s ? String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase() : "";
}

function normalizeId(id) {
  return id ? String(id).trim() : `gen_${Math.random().toString(36).slice(2)}`;
}

/* --- 3. ESTRUCTURA --- */
let BANK = {
  subjects: typeof SUBJECTS !== 'undefined' ? SUBJECTS : [],
  subsubjects: {},
  questions: [],
  loaded: false
};

if(typeof SUBJECTS !== 'undefined') {
    SUBJECTS.forEach(s => {
        BANK.subsubjects[s.slug] = (typeof SUBTEMAS !== 'undefined' && SUBTEMAS[s.slug]) 
          ? SUBTEMAS[s.slug] 
          : ["General"];
    });
}

/* --- 4. CARGA TURBO --- */
async function loadAllBanks() {
  console.time("⏱ Tiempo de carga");
  const appMsg = document.querySelector("#app div"); 
  if(appMsg) appMsg.textContent = "🚀 Buscando preguntas...";

  const urls = [];

  // A) Materias - Busca hasta 3 archivos por carpeta (ej: otras1.json, otras2.json)
  const FILES_PER_SUBJECT = 3; 
  BANK.subjects.forEach(subj => {
    for (let i = 1; i <= FILES_PER_SUBJECT; i++) { 
      urls.push({ url: `bancos/${subj.slug}/${subj.slug}${i}.json`, type: "materia", meta: subj });
    }
  });

  // C) Fetch
  const promises = urls.map(item => 
    fetch(item.url)
      .then(r => {
        if (!r.ok) throw new Error("404");
        return r.json();
      })
      .then(data => ({ status: "ok", data, type: item.type, meta: item.meta }))
      .catch(() => ({ status: "fail" }))
  );

  const results = await Promise.all(promises);

  let allQuestions = [];
  let successFiles = 0;

  results.forEach(res => {
    if (res.status === "ok" && Array.isArray(res.data)) {
      successFiles++;
      res.data.forEach(q => {
          processQuestion(q, res.type, res.meta);
          allQuestions.push(q);
      });
    }
  });

  BANK.questions = dedupeQuestionsById(allQuestions);
  BANK.loaded = true;

  console.timeEnd("⏱ Tiempo de carga");
  console.log(`✅ Carga finalizada: ${successFiles} archivos leídos. ${BANK.questions.length} preguntas totales.`);

  if(appMsg) appMsg.textContent = "✔ Banco listo.";
  if(typeof renderHome === "function") renderHome();
}

/* --- 5. PROCESADOR (Lógica Multimateria) --- */
function processQuestion(q, type, meta) {
    if(!q.id) q.id = normalizeId(null);
    else q.id = normalizeId(q.id);
    
    // 1. MATERIAS: Procesa todas las materias del array
    let rawMaterias = Array.isArray(q.materia) ? q.materia : [q.materia || "otras"];
    q.materia = rawMaterias.map(m => {
        let matNorm = normalize(m);
        const found = BANK.subjects.find(s => normalize(s.slug) === matNorm);
        return found ? found.slug : "otras";
    });

    // 2. SUBMATERIAS: Normaliza y guarda todas las submaterias para permitir búsqueda múltiple
    let rawSubmaterias = Array.isArray(q.submateria) ? q.submateria : [q.submateria || ""];
    q.submateria = rawSubmaterias.map(sub => normalize(sub));

    // 3. Metadatos
    q.tipo = type;
    if (type === "examen" && meta) {
        q.examen = meta.id;
        q.anio = meta.anio;
    } else {
        q.examen = null;
    }
}

/* --- 6. HELPERS --- */
function dedupeQuestionsById(list) {
  const map = new Map();
  list.forEach(q => {
      if(!q.id) return;
      if(!map.has(q.id)) map.set(q.id, q);
  });
  return Array.from(map.values());
}

/* --- 7. FILTRADO (Búsqueda en Arrays) --- */
function getQuestionsByMateria(mSlug, selectedSubs) {
    const normSelected = (selectedSubs || []).map(s => normalize(s));
    const officialSubs = (BANK.subsubjects[mSlug] || []).map(s => normalize(s));
    const catchAllSub = officialSubs.length > 0 ? officialSubs[officialSubs.length - 1] : "general";

    return BANK.questions.filter(q => {
        const esDeLaMateria = Array.isArray(q.materia) ? q.materia.includes(mSlug) : q.materia === mSlug;
        if (!esDeLaMateria) return false;

        if (!normSelected.length) return true;

        // Limpiamos el subtema de la pregunta para garantizar que coincida
        const qSub = normalize(q.submateria);
        
        if (normSelected.includes(qSub)) return true;

        if (normSelected.includes(catchAllSub)) {
            const esHuerfano = !officialSubs.includes(qSub);
            if (esHuerfano) return true;
        }

        return false;
    });
}
function getQuestionsByExamen(id) {
    return BANK.questions.filter(q => q.examen === id);
}

function getQuestionById(id) {
    return BANK.questions.find(q => q.id === id);
}
