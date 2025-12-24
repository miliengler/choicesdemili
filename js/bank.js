/* ==========================================================
   🌐 MEbank 3.0 — Banco TURBO (Con corrección "Otras")
   ========================================================== */

/* --- PROGRESO --- */
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

/* --- UTILIDADES --- */
function normalize(s) {
  // Normalización estándar para slugs (materias)
  return s ? String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\p{Emoji}\p{Extended_Pictographic}]/gu, "").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase() : "";
}

function normalizeId(id) {
  return id ? String(id).trim() : `gen_${Math.random().toString(36).slice(2)}`;
}

/* --- ESTRUCTURA --- */
let BANK = {
  subjects: typeof SUBJECTS !== 'undefined' ? SUBJECTS : [],
  subsubjects: {},
  questions: [],
  loaded: false
};

// Inicializar subtemas
if(typeof SUBJECTS !== 'undefined') {
    SUBJECTS.forEach(s => {
        BANK.subsubjects[s.slug] = (typeof SUBTEMAS !== 'undefined' && SUBTEMAS[s.slug]) 
          ? SUBTEMAS[s.slug] 
          : ["General"];
    });
}

/* --- CARGA TURBO --- */
async function loadAllBanks() {
  console.time("⏱ Tiempo de carga");
  const appMsg = document.querySelector("#app div"); 
  if(appMsg) appMsg.textContent = "🚀 Cargando banco completo...";

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

  // B) Exámenes
  if (typeof EXAMENES_META !== 'undefined') {
    EXAMENES_META.forEach(ex => {
      urls.push({
        url: ex.file,
        type: "examen",
        meta: ex
      });
    });
  }

  const results = await Promise.allSettled(
    urls.map(item => fetch(item.url).then(r => {
      if (!r.ok) throw new Error("404");
      return r.json().then(data => ({ data, type: item.type, meta: item.meta }));
    }))
  );

  let allQuestions = [];
  let successCount = 0;

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

  BANK.questions = dedupeQuestionsById(allQuestions);
  BANK.loaded = true;

  console.timeEnd("⏱ Tiempo de carga");
  console.log(`✅ Carga finalizada: ${successCount} archivos. ${BANK.questions.length} preguntas.`);

  if(appMsg) appMsg.textContent = "✔ Banco listo.";
  if(typeof renderHome === "function") renderHome();
}

/* --- PROCESADOR DE PREGUNTA (CON EL FIX DE "OTRAS") --- */
function processQuestion(q, type, examMeta) {
    q.id = normalizeId(q.id);
    
    // 1. Materia (Array o String)
    if (Array.isArray(q.materia)) {
        q.materia = q.materia.map(m => normalize(m));
    } else {
        let mat = normalize(q.materia || "otras");
        if (!BANK.subjects.some(s => s.slug === mat)) mat = "otras";
        q.materia = mat;
    }

    // 2. Submateria (Corrección automática)
    
    // Identificamos la materia principal para buscar su lista de temas
    const mainMateria = Array.isArray(q.materia) ? q.materia[0] : q.materia;
    const listaOficial = BANK.subsubjects[mainMateria] || [];
    
    // Tomamos lo que viene en el JSON
    let subRaw = Array.isArray(q.submateria) ? q.submateria[0] : q.submateria;
    
    // Si la lista oficial tiene temas...
    if (listaOficial.length > 0) {
        // Si el subtema del JSON existe exacto en la lista -> Lo dejamos
        if (listaOficial.includes(subRaw)) {
            q.submateria = subRaw;
        } else {
            // Si NO existe (o es null), lo mandamos al último de la lista (Otras)
            q.submateria = listaOficial[listaOficial.length - 1];
        }
    } else {
        q.submateria = "General";
    }

    // 3. Opciones y Correcta
    q.opciones = getOpcionesArray(q);
    q.correcta = getCorrectIndex(q);

    // 4. Metadatos
    q.tipo = type;
    if (type === "examen" && examMeta) {
        q.examen = examMeta.id;
        q.anio = examMeta.anio;
    } else {
        q.examen = null;
    }
}

/* --- HELPERS --- */
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

/* --- APIS DE ACCESO (Mantiene soporte array) --- */
function getQuestionsByMateria(slug, subs) {
    return BANK.questions.filter(q => {
        const esDeLaMateria = Array.isArray(q.materia) 
            ? q.materia.includes(slug) 
            : q.materia === slug;
        
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
