/* ==========================================================
   🌐 MEbank 3.0 — Banco Central (Compatible)
   ========================================================== */

/* --- 1. HERRAMIENTAS DE LIMPIEZA (Globales) --- */

// Para Stats y Resolver (Nueva)
window.cleanSlug = function(text) {
    if (!text) return "";
    return String(text).toLowerCase().replace(/[^a-z0-9]/g, "");
};

// Para Choice y Home (Vieja - La que faltaba)
window.normalize = function(s) {
  return s ? String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase() : "";
};

/* --- 2. PROGRESO --- */
const STORAGE_KEY_PROG = "MEbank_PROG_v3";

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_PROG)) || {}; }
  catch { return {}; }
}

window.saveProgress = function() {
  try { localStorage.setItem(STORAGE_KEY_PROG, JSON.stringify(PROG)); }
  catch (e) { console.warn("No se pudo guardar PROG", e); }
};

let PROG = loadProgress();

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

/* --- 4. CARGA DE DATOS --- */
async function loadAllBanks() {
  console.time("⏱ Tiempo de carga");
  const appMsg = document.querySelector("#app div"); 
  if(appMsg) appMsg.textContent = "🚀 Buscando preguntas...";

  const urls = [];

  // A) Materias
  const FILES_PER_SUBJECT = 25; 
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
  console.log(`✅ Carga finalizada: ${successFiles} archivos. ${BANK.questions.length} preguntas.`);

  if(appMsg) appMsg.textContent = "✔ Banco listo.";
  
  if(typeof renderHome === "function") renderHome();
}

/* --- 5. PROCESADOR --- */
function processQuestion(q, type, examMeta) {
    if(!q.id) q.id = `gen_${Math.random().toString(36).slice(2)}`;
    else q.id = String(q.id).trim();
    
    // Normalización de materia
    if (!Array.isArray(q.materia)) {
        q.materia = [q.materia || "otras"];
    }
    // Usamos cleanSlug aquí para estandarizar todo lo que entra
    q.materia = q.materia.map(m => window.cleanSlug(m));

    // Submateria
    if(!q.submateria) q.submateria = "General";
    if(Array.isArray(q.submateria)) q.submateria = q.submateria[0];

    // Meta
    q.tipo = type;
    if (type === "examen" && examMeta) {
        q.examen = examMeta.id;
        q.anio = examMeta.anio;
        q.oficial = true;
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

/* --- 7. APIS DE BÚSQUEDA --- */
function getQuestionsByMateria(slugConfig, subtemasFilter) {
    // Usamos cleanSlug para asegurar coincidencia
    const slugObjetivo = window.cleanSlug(slugConfig);

    return BANK.questions.filter(q => {
        const materiasQ = Array.isArray(q.materia) ? q.materia : [q.materia];
        // Buscamos coincidencia flexible
        const esDeLaMateria = materiasQ.some(m => window.cleanSlug(m) === slugObjetivo);
        
        if (!esDeLaMateria) return false;

        if (!subtemasFilter || subtemasFilter.length === 0) return true;
        
        const qSub = window.normalize(q.submateria); // Aquí mantenemos normalize por compatibilidad
        return subtemasFilter.some(s => window.normalize(s) === qSub);
    });
}

function getQuestionsByExamen(id) {
    return BANK.questions.filter(q => q.examen === id);
}

function getQuestionById(id) {
    return BANK.questions.find(q => q.id === id);
}
