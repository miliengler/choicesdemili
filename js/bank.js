/* ==========================================================
   🌐 MEbank 3.0 — Banco TURBO (Con lógica Anti-Huérfanos.)
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

  // A) Materias
  const FILES_PER_SUBJECT = 15; 
  BANK.subjects.forEach(subj => {
    for (let i = 1; i <= FILES_PER_SUBJECT; i++) { 
      urls.push({ url: `bancos/${subj.slug}/${subj.slug}${i}.json`, type: "materia", meta: subj });
    }
  });

  // B) Exámenes
  if (typeof EXAMENES_META !== 'undefined') {
    EXAMENES_META.forEach(ex => urls.push({ url: ex.file, type: "examen", meta: ex }));
  }

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

/* --- 5. PROCESADOR --- */
function processQuestion(q, type, examMeta) {
    if(!q.id) q.id = normalizeId(null);
    else q.id = normalizeId(q.id);
    
    // 1. Materia (Normalización robusta)
    if (Array.isArray(q.materia)) {
        q.materia = q.materia.map(m => normalize(m));
    } else {
        let mat = normalize(q.materia || "otras");
        // Si la materia no existe en SUBJECTS, mandarla a 'otras'
        if (!BANK.subjects.some(s => s.slug === mat)) mat = "otras";
        q.materia = mat;
    }

    // 2. Submateria
    // Intentamos asignar una submateria válida basándonos en la PRIMERA materia de la lista
    const mainMateria = Array.isArray(q.materia) ? q.materia[0] : q.materia;
    const listaOficial = BANK.subsubjects[mainMateria] || [];
    
    let subRaw = Array.isArray(q.submateria) ? q.submateria[0] : (q.submateria || "");
    const subNorm = normalize(subRaw);
    
    const match = listaOficial.find(oficial => normalize(oficial) === subNorm);

    if (match) {
        q.submateria = normalize(match);
    } else {
        // Si no machea, asignamos al ÚLTIMO ítem de la lista (Catch-All)
        q.submateria = listaOficial.length > 0 ? normalize(listaOficial[listaOficial.length - 1]) : "general";
    }

    // 3. Metadatos
    q.tipo = type;
    if (type === "examen" && examMeta) {
        q.examen = examMeta.id;
        q.anio = examMeta.anio;
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

/* --- 7. APIS HÍBRIDAS (LOGICA MATEMÁTICA CORREGIDA) --- */
function getQuestionsByMateria(mSlug, selectedSubs) {
    // Lista oficial de subtemas normalizados para esta materia
    const officialSubs = (BANK.subsubjects[mSlug] || []).map(s => normalize(s));
    // Identificamos cuál es el "Catch-All" (el último de la lista)
    const catchAllSub = officialSubs.length > 0 ? officialSubs[officialSubs.length - 1] : "general";

    return BANK.questions.filter(q => {
        // 1. Chequear si es de la materia
        const esDeLaMateria = Array.isArray(q.materia) ? q.materia.includes(mSlug) : q.materia === mSlug;
        if (!esDeLaMateria) return false;

        // 2. Si no hay filtro de subtemas, devolver todo
        if (!selectedSubs || !selectedSubs.length) return true;

        // 3. Chequear subtema
        const qSub = q.submateria;
        
        // A) Coincidencia directa
        if (selectedSubs.includes(qSub)) return true;

        // B) Lógica de Huérfanos:
        // Si el usuario seleccionó el "Catch-All" (ej: "Otras preguntas..."),
        // debemos incluir también las preguntas cuyo subtema NO esté en la lista oficial de esta materia.
        // (Esto pasa cuando una pregunta es compartida entre materias y tiene el subtema de la otra).
        if (selectedSubs.includes(catchAllSub)) {
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
