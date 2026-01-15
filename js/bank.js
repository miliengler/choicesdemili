/* ==========================================================
   🌐 MEbank 3.0 — Banco Central (Harmonizado)
   ========================================================== */

/* --- 1. HERRAMIENTA DE LIMPIEZA GLOBAL (La clave de todo) --- */
window.cleanSlug = function(text) {
    if (!text) return "";
    // Convierte a minúsculas y borra todo lo que no sea letra o número.
    // Ejemplo: "Urologia_Cx" -> "urologiacx"
    // Ejemplo: "Urologia-CX" -> "urologiacx"
    return String(text).toLowerCase().replace(/[^a-z0-9]/g, "");
};

/* --- 2. PROGRESO --- */
const STORAGE_KEY_PROG = "MEbank_PROG_v3";

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_PROG)) || {}; }
  catch { return {}; }
}

window.saveProgress = function() { // Hacemos global la función
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

// Cargar subtemas desde la config
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

  // A) Materias (Busca archivos genéricos banco/materia/materia1.json)
  const FILES_PER_SUBJECT = 25; 
  BANK.subjects.forEach(subj => {
    for (let i = 1; i <= FILES_PER_SUBJECT; i++) { 
      urls.push({ url: `bancos/${subj.slug}/${subj.slug}${i}.json`, type: "materia", meta: subj });
    }
  });

  // B) Exámenes (Definidos en config.js)
  if (typeof EXAMENES_META !== 'undefined') {
    EXAMENES_META.forEach(ex => urls.push({ url: ex.file, type: "examen", meta: ex }));
  }

  // C) Fetch Simultáneo
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
  
  // Renderizar Home si existe la función
  if(typeof renderHome === "function") renderHome();
}

/* --- 5. PROCESADOR DE PREGUNTAS --- */
function processQuestion(q, type, examMeta) {
    if(!q.id) q.id = `gen_${Math.random().toString(36).slice(2)}`;
    else q.id = String(q.id).trim();
    
    // Normalización de materia (Array o String)
    if (!Array.isArray(q.materia)) {
        q.materia = [q.materia || "otras"];
    }
    // Aseguramos minúsculas básicas, pero cleanSlug hará el trabajo pesado al comparar
    q.materia = q.materia.map(m => String(m).toLowerCase());

    // Submateria
    if(!q.submateria) q.submateria = "General";
    if(Array.isArray(q.submateria)) q.submateria = q.submateria[0];

    // Metadatos de examen
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

/* --- 7. APIS DE BÚSQUEDA (Con lógica cleanSlug) --- */
function getQuestionsByMateria(slugConfig, subtemasFilter) {
    const slugObjetivo = window.cleanSlug(slugConfig);

    return BANK.questions.filter(q => {
        // 1. Chequear si la pregunta pertenece a la materia (Flexible)
        const materiasQ = Array.isArray(q.materia) ? q.materia : [q.materia];
        const esDeLaMateria = materiasQ.some(m => window.cleanSlug(m) === slugObjetivo);
        
        if (!esDeLaMateria) return false;

        // 2. Filtro de subtemas (si aplica)
        if (!subtemasFilter || subtemasFilter.length === 0) return true;
        
        // Normalización simple para subtemas
        const qSub = window.cleanSlug(q.submateria);
        return subtemasFilter.some(s => window.cleanSlug(s) === qSub);
    });
}

function getQuestionsByExamen(id) {
    return BANK.questions.filter(q => q.examen === id);
}

function getQuestionById(id) {
    return BANK.questions.find(q => q.id === id);
}
