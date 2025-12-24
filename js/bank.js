/* ==========================================================
   🌐 MEbank 3.0 — Banco TURBO (Optimizado)
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

  // A) Materias - Intentamos cargar hasta 15 archivos por materia. 
  // (Los 404 son esperables y se ignorarán).
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

  // C) Fetch en paralelo
  const promises = urls.map(item => 
    fetch(item.url)
      .then(r => {
        if (!r.ok) throw new Error("404"); // Ignoramos archivos que no existen
        return r.json();
      })
      .then(data => ({ status: "ok", data, type: item.type, meta: item.meta }))
      .catch(() => ({ status: "fail" })) // Capturamos el error para no romper Promise.all
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
    
    // 1. Materia
    if (Array.isArray(q.materia)) {
        q.materia = q.materia.map(m => normalize(m));
    } else {
        let mat = normalize(q.materia || "otras");
        // Validación extra: si la materia no está en la lista oficial, marcar como 'otras'
        if (!BANK.subjects.some(s => s.slug === mat)) {
            // Un intento de "fuzzy match" básico o dejar como otras
            mat = "otras"; 
        }
        q.materia = mat;
    }

    // 2. Submateria
    const mainMateria = Array.isArray(q.materia) ? q.materia[0] : q.materia;
    const listaOficial = BANK.subsubjects[mainMateria] || [];
    let subRaw = Array.isArray(q.submateria) ? q.submateria[0] : (q.submateria || "");
    const subNorm = normalize(subRaw);
    const match = listaOficial.find(oficial => normalize(oficial) === subNorm);

    if (match) {
        q.submateria = normalize(match);
    } else {
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

/* --- 7. APIS HÍBRIDAS --- */
function getQuestionsByMateria(slug, subs) {
    return BANK.questions.filter(q => {
        const esDeLaMateria = Array.isArray(q.materia) ? q.materia.includes(slug) : q.materia === slug;
        if (!esDeLaMateria) return false;
        if (subs && subs.length) return subs.includes(q.submateria);
        return true;
    });
}

function getQuestionsByExamen(id) {
    return BANK.questions.filter(q => q.examen === id);
}

function getQuestionById(id) {
    return BANK.questions.find(q => q.id === id);
}
