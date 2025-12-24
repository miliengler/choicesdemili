/* ==========================================================
   🌐 MEbank 3.0 — Banco TURBO (Lógica Pura)
   (Lee los datos desde config.js)
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
  return s ? String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\p{Emoji}\p{Extended_Pictographic}]/gu, "").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase() : "";
}

function normalizeId(id) {
  return id ? String(id).trim() : `gen_${Math.random().toString(36).slice(2)}`;
}

/* --- 3. ESTRUCTURA PRINCIPAL --- */
// Tomamos los datos GLOBALES definidos en config.js
let BANK = {
  subjects: typeof SUBJECTS !== 'undefined' ? SUBJECTS : [],
  subsubjects: {}, // Se llenará dinámicamente
  questions: [],
  loaded: false
};

// Inicializar subtemas en el objeto BANK leyendo de la variable global SUBTEMAS
if(typeof SUBJECTS !== 'undefined' && typeof SUBTEMAS !== 'undefined') {
    SUBJECTS.forEach(s => {
        // Si existe la lista en SUBTEMAS, la usamos. Si no, fallback a "General".
        BANK.subsubjects[s.slug] = SUBTEMAS[s.slug] ? SUBTEMAS[s.slug] : ["General"];
    });
}

/* --- 4. CARGA TURBO --- */
async function loadAllBanks() {
  console.time("⏱ Tiempo de carga");
  const appMsg = document.querySelector("#app div"); 
  if(appMsg) appMsg.textContent = "🚀 Cargando banco completo...";

  const urls = [];

  // A) Materias (Generadas desde SUBJECTS de config.js)
  if (BANK.subjects) {
      BANK.subjects.forEach(subj => {
        for (let i = 1; i <= 20; i++) { 
          urls.push({
            url: `bancos/${subj.slug}/${subj.slug}${i}.json`,
            type: "materia",
            meta: subj
          });
        }
      });
  }

  // B) Exámenes (Generados desde EXAMENES_META de config.js)
  if (typeof EXAMENES_META !== 'undefined') {
    EXAMENES_META.forEach(ex => {
      urls.push({
        url: ex.file,
        type: "examen",
        meta: ex
      });
    });
  }

  // Disparamos carga paralela
  const results = await Promise.allSettled(
    urls.map(item => fetch(item.url).then(r => {
      if (!r.ok) throw new Error("404");
      return r.json().then(data => ({ data, type: item.type, meta: item.meta }));
    }))
  );

  let allQuestions = [];
  let successCount = 0;

  // Procesamos resultados
  results.forEach(res => {
    if (res.status === "fulfilled") {
      const { data, type, meta } = res.value;
      if (Array.isArray(data)) {
        successCount++;
        data.forEach(q => {
            processQuestion(q, type, meta);
            allQuestions.push(q);
        });
      }
    }
  });

  // Guardamos
  BANK.questions = dedupeQuestionsById(allQuestions);
  BANK.loaded = true;

  console.timeEnd("⏱ Tiempo de carga");
  console.log(`✅ Carga finalizada: ${successCount} archivos. ${BANK.questions.length} preguntas.`);

  if(appMsg) appMsg.textContent = "✔ Banco listo.";
  if(typeof renderHome === "function") renderHome();
}

/* --- 5. PROCESADOR DE PREGUNTA (CON EMBUDO "OTRAS") --- */
function processQuestion(q, type, examMeta) {
    q.id = normalizeId(q.id);
    
    // 1. Materia (Array o String -> Array Normalizado)
    if (Array.isArray(q.materia)) {
        q.materia = q.materia.map(m => normalize(m));
    } else {
        let mat = normalize(q.materia || "otras");
        // Chequeamos contra BANK.subjects (que viene de config)
        if (!BANK.subjects.some(s => s.slug === mat)) mat = "otras";
        q.materia = mat;
    }

    // 2. SUBMATERIA (Lógica del Embudo usando SUBTEMAS global)
    
    // a. Determinamos materia principal
    const mainMateria = Array.isArray(q.materia) ? q.materia[0] : q.materia;
    
    // b. Buscamos la lista oficial en la variable global SUBTEMAS (de config.js)
    const listaOficial = (typeof SUBTEMAS !== 'undefined' && SUBTEMAS[mainMateria]) 
        ? SUBTEMAS[mainMateria] 
        : [];

    // c. Obtenemos lo que dice el JSON
    let subRaw = Array.isArray(q.submateria) ? q.submateria[0] : q.submateria;
    if (!subRaw) subRaw = "";

    // d. Comparación
    if (listaOficial.length > 0) {
        // Si el subtema está EXACTO en la lista oficial -> Lo dejamos
        if (listaOficial.includes(subRaw)) {
            q.submateria = subRaw;
        } else {
            // Si NO está (ej: "Infarto"), lo mandamos al ÚLTIMO ítem ("Otras preguntas de...")
            q.submateria = listaOficial[listaOficial.length - 1]; 
        }
    } else {
        // Si la materia no tiene subtemas definidos en config, va a General
        q.submateria = "General";
    }

    // 3. Opciones y Correcta
    q.opciones = getOpcionesArray(q);
    q.correcta = getCorrectIndex(q);

    // 4. Metadatos Examen
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

function getOpcionesArray(q) {
  if (Array.isArray(q.opciones)) return q.opciones;
  if (q.opciones && typeof q.opciones === 'object') {
      return ["a","b","c","d","e"].map(k => q.opciones[k]).filter(v=>v);
  }
  return [];
}

function getCorrectIndex(q) {
  if (typeof q.correcta === 'number') return q.correcta;
  if (typeof q.correcta === 'string') {
      const map = {a:0, b:1, c:2, d:3, e:4};
      return map[q.correcta.trim().toLowerCase()] ?? -1;
  }
  return -1;
}

/* --- 7. APIS PARA LA APP (Híbridas) --- */
function getQuestionsByMateria(slug, subs) {
    return BANK.questions.filter(q => {
        // Chequeo híbrido de materia
        const esDeLaMateria = Array.isArray(q.materia) 
            ? q.materia.includes(slug) 
            : q.materia === slug;
        
        if (!esDeLaMateria) return false;

        // Chequeo de subtemas
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
