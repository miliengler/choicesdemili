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

/* --- 5. PROCESADOR (Versión Definitiva Anti-Pérdidas) --- */
function processQuestion(q, type, meta) {
    if(!q.id) q.id = normalizeId(null);
    else q.id = normalizeId(q.id);
    
    // 1. MATERIA: Array seguro
    let rawMatArray = Array.isArray(q.materia) ? q.materia : [q.materia || "otras"];
    let validMatArray = rawMatArray.map(m => m.trim().toLowerCase()).filter(m => m !== "");
    if (validMatArray.length === 0) validMatArray.push("otras");
    q.materia = [...new Set(validMatArray)];

    // 2. SUBMATERIA: Limpieza básica
    let rawSubArray = Array.isArray(q.submateria) ? q.submateria : [q.submateria || ""];
    let cleanSubs = rawSubArray.filter(s => s && typeof s === 'string' && s.trim() !== "");
    if (cleanSubs.length === 0) cleanSubs.push("general");
    
    // 3. INYECCIÓN DE CATEGORÍA "CATCH-ALL" (Magia Anti-pérdidas)
    let subtemasFinales = [...cleanSubs];
    const normQSubs = cleanSubs.map(s => normalize(s));

    // Nos aseguramos de acceder a las listas oficiales
    const subsubjectsMap = (typeof BANK !== 'undefined' && BANK.subsubjects) ? BANK.subsubjects : (typeof SUBTEMAS !== 'undefined' ? SUBTEMAS : {});

    // Revisamos cada materia a la que pertenece esta pregunta
    q.materia.forEach(mSlug => {
        const officialSubs = subsubjectsMap[mSlug] || [];
        if (officialSubs.length > 0) {
            const normOfficial = officialSubs.map(s => normalize(s));
            // ¿Tiene algún subtema que coincida con la lista oficial de esta materia?
            const hasMatch = normQSubs.some(qs => normOfficial.includes(qs));
            
            if (!hasMatch) {
                // Si no tiene NINGÚN subtema oficial, la pregunta estaba "huérfana".
                // Le inyectamos el último subtema oficial (ej: "Otras preguntas..." o "Atención Primaria")
                const catchAll = officialSubs[officialSubs.length - 1];
                if (!subtemasFinales.includes(catchAll)) {
                    subtemasFinales.push(catchAll);
                }
            }
        }
    });

    q.submateria = subtemasFinales;

    // 4. Metadatos
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
        // 1. Chequear si es de la materia (ahora q.materia es siempre array)
        if (!q.materia.includes(mSlug)) return false;

        // 2. Si no hay filtro de subtemas, devolver todo
        if (!normSelected.length) return true;

        // 3. Chequear subtemas (ahora q.submateria es siempre array)
        const normQSubs = q.submateria.map(s => normalize(s));
        
        // A) Coincidencia directa
        const hasDirectMatch = normQSubs.some(qs => normSelected.includes(qs));
        if (hasDirectMatch) return true;

        // B) Lógica de Huérfanos:
        if (normSelected.includes(catchAllSub)) {
            const isOrphan = !normQSubs.some(qs => officialSubs.includes(qs));
            if (isOrphan) return true;
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
