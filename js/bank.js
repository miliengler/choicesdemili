/* ==========================================================
   🌐 MEbank 3.0 — Banco TURBO (Carga paralela)
   ========================================================== */

/* ==========================================================
   🔐 PROGRESO (Esto SÍ se guarda en localStorage)
   ========================================================== */
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

/* ==========================================================
   🔤 Utilidades (Normalizar y Deduplicar)
   ========================================================== */
function normalize(s) {
  return s ? String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\p{Emoji}\p{Extended_Pictographic}]/gu, "").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase() : "";
}

function normalizeId(id) {
  return id ? String(id).trim() : `gen_${Math.random().toString(36).slice(2)}`;
}

/* ==========================================================
   🧱 BANK — Estructura
   ========================================================== */
let BANK = {
  subjects: typeof SUBJECTS !== 'undefined' ? SUBJECTS : [], // Lo toma de config.js
  subsubjects: {},
  questions: [],
  loaded: false
};

// Inicializar subtemas vacíos
if(typeof SUBJECTS !== 'undefined') {
    SUBJECTS.forEach(s => {
        BANK.subsubjects[s.slug] = (typeof SUBTEMAS !== 'undefined' && SUBTEMAS[s.slug]) 
          ? SUBTEMAS[s.slug] 
          : ["General"];
    });
}

/* ==========================================================
   ⚡ CARGA TURBO (La magia ocurre aquí)
   ========================================================== */

async function loadAllBanks() {
  console.time("⏱ Tiempo de carga");
  const appMsg = document.querySelector("#app div"); 
  if(appMsg) appMsg.textContent = "🚀 Cargando banco completo...";

  // 1. Recopilar TODAS las URLs que necesitamos
  const urls = [];

  // A) Materias 
  BANK.subjects.forEach(subj => {
    for (let i = 1; i <= 20; i++) { 
      urls.push({
        url: `bancos/${subj.slug}/${subj.slug}${i}.json`,
        type: "materia",
        meta: subj
      });
    }
  });


  // B) Exámenes Anteriores (desde EXAMENES_META en config.js)
  if (typeof EXAMENES_META !== 'undefined') {
    EXAMENES_META.forEach(ex => {
      urls.push({
        url: ex.file,
        type: "examen",
        meta: ex
      });
    });
  }

  // 2. Disparar TODAS las peticiones en paralelo
  // Promise.allSettled espera a que todas terminen (bien o mal)
  const results = await Promise.allSettled(
    urls.map(item => fetch(item.url).then(r => {
      if (!r.ok) throw new Error("404");
      return r.json().then(data => ({ data, type: item.type, meta: item.meta }));
    }))
  );

  // 3. Procesar resultados
  let allQuestions = [];
  let successCount = 0;

  results.forEach(res => {
    if (res.status === "fulfilled") {
      const { data, type, meta } = res.value;
      if (Array.isArray(data)) {
        successCount++;
        // Normalizamos cada pregunta del archivo
        data.forEach(q => {
            // Ajustes rápidos antes de insertar
            processQuestion(q, type, meta);
            allQuestions.push(q);
        });
      }
    }
  });

  // 4. Deduplicar y Guardar en Memoria RAM
  BANK.questions = dedupeQuestionsById(allQuestions);
  BANK.loaded = true;

  console.timeEnd("⏱ Tiempo de carga");
  console.log(`✅ Carga finalizada: ${successCount} archivos leídos. ${BANK.questions.length} preguntas totales.`);

  // Aviso visual
  if(appMsg) appMsg.textContent = "✔ Banco listo.";
  
  // Renderizar Home automáticamente si existe la función
  if(typeof renderHome === "function") renderHome();
}

/* ==========================================================
   🧬 Procesador de Pregunta Individual
   ========================================================== */
function processQuestion(q, type, examMeta) {
    // ID
    q.id = normalizeId(q.id);
    
    // Materia
    if (Array.isArray(q.materia)) q.materia = q.materia[0];
    q.materia = normalize(q.materia || "otras");
    // Fallback si la materia no está en config
    if (!BANK.subjects.some(s => s.slug === q.materia)) q.materia = "otras";

    // Submateria (Simplificada)
    if (Array.isArray(q.submateria)) q.submateria = q.submateria[0];
    q.submateria = normalize(q.submateria || "");

    // Opciones y Correcta
    q.opciones = getOpcionesArray(q);
    q.correcta = getCorrectIndex(q);

    // Metadatos Examen
    q.tipo = type;
    if (type === "examen" && examMeta) {
        q.examen = examMeta.id;
        q.anio = examMeta.anio;
    } else {
        q.examen = null;
    }
}

/* ==========================================================
   🔧 Helpers de Limpieza
   ========================================================== */
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
  // Soporte para número (0-4) o letra ("a"-"e")
  if (typeof q.correcta === 'number') return q.correcta;
  if (typeof q.correcta === 'string') {
      const map = {a:0, b:1, c:2, d:3, e:4};
      return map[q.correcta.trim().toLowerCase()] ?? -1;
  }
  return -1;
}



/* ==========================================================
   🔌 APIs para las otras pantallas
   ========================================================== */
function getQuestionsByMateria(slug, subs) {
    return BANK.questions.filter(q => {
        if (q.materia !== slug) return false;
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
