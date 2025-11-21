/* ==========================================================
   🌐 MEbank 3.0 — Banco simple y estable (modo botón)
   ========================================================== */

/* ==========================================================
   🔐 PROGRESO (único guardado)
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
   🔤 Normalizador
   ========================================================== */

function normalize(s) {
  return s ? s.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[\p{Emoji}\p{Extended_Pictographic}]/gu, "")
            .replace(/[^\p{L}\p{N}]/gu, "")
            .toLowerCase()
           : "";
}

/* ==========================================================
   🧱 BANK — estructura base
   ========================================================== */

let BANK = {
  subjects: SUBJECTS,
  subsubjects: {},
  questions: [],
  loaded: false
};

// Cargar subtemas base
SUBJECTS.forEach(s => {
  BANK.subsubjects[s.slug] = SUBTEMAS[s.slug] || [ "Otras preguntas de " + s.name ];
});

/* ==========================================================
   🔄 Intentar cargar BANK guardado
   ========================================================== */

try {
  const savedBank = localStorage.getItem("MEbank_BANK_v1");

  if (savedBank) {
    const parsed = JSON.parse(savedBank);

    // Fusionar banco guardado en BANK actual
    BANK.questions  = parsed.questions || [];
    BANK.loaded     = parsed.loaded || false;

    console.log("📦 Banco restaurado desde localStorage:",
      BANK.questions.length, "preguntas");
  }
} catch (e) {
  console.warn("⚠ Error cargando BANK guardado", e);
}

/* ==========================================================
   📦 CARGAR BANCOS (solo manual)
   ========================================================== */

async function loadAllBanks() {
  console.log("⏳ Cargando bancos…");

  BANK.questions = [];
  const ids = new Set();

  await loadFromMaterias(ids);
  await loadFromExamenes(ids);

  BANK.loaded = true;

  console.log("✔ Banco cargado:", BANK.questions.length, "preguntas");
}

/* ==========================================================
   🟦 1) Cargar materias
   ========================================================== */

async function loadFromMaterias(ids) {
  for (const subj of SUBJECTS) {
    const slug = subj.slug;

    for (let i = 1; i <= 4; i++) {
      const ruta = `bancos/${slug}/${slug}${i}.json`;
      await loadFileIfExists(ruta, "materia", ids);
    }
  }
}

/* ==========================================================
   🟩 2) Cargar exámenes
   ========================================================== */

async function loadFromExamenes(ids) {
  for (const exam of EXAMENES_META) {
    await loadFileIfExists(exam.file, "examen", ids, exam);
  }
}

/* ==========================================================
   📄 Cargar archivo JSON si existe
   ========================================================== */

async function loadFileIfExists(ruta, tipo, ids, exam = null) {
  try {
    const resp = await fetch(ruta);
    if (!resp.ok) return;

    const data = await resp.json();
    if (!Array.isArray(data)) return;

    data.forEach(q => {
      normalizeQuestion(q, tipo, exam);
      if (!ids.has(q.id)) {
        ids.add(q.id);
        BANK.questions.push(q);
      }
    });

    console.log("📘", ruta, "+", data.length);

  } catch (e) {
    console.warn("⚠ No se pudo cargar", ruta);
  }
}

/* ==========================================================
   🧬 Normalizar pregunta
   ========================================================== */

function normalizeQuestion(q, tipo, exam) {
  q.materia    = normalize(q.materia || "otras");
  q.submateria = normalize(q.submateria || "otras");

  if (!BANK.subsubjects[q.materia])
    BANK.subsubjects[q.materia] = [ "Otras preguntas" ];

  if (!Array.isArray(q.opciones)) q.opciones = [];
  if (!q.explicacion) q.explicacion = null;
  if (!q.imagenes) q.imagenes = [];

  q.tipo = tipo;

  if (tipo === "examen" && exam) {
    q.examen  = exam.id;
    q.anio    = exam.anio;
    q.oficial = exam.grupo === "Examen Único";
  } else {
    q.examen  = null;
    q.anio    = null;
    q.oficial = false;
  }
}

/* ==========================================================
   🔧 API para pantallas
   ========================================================== */

function getQuestionsByMateria(slug, subs = null) {
  const mat = normalize(slug);

  return BANK.questions.filter(q => {
    if (q.materia !== mat) return false;
    if (subs && subs.length) return subs.includes(q.submateria);
    return true;
  });
}

function getQuestionsByExamen(id) {
  return BANK.questions.filter(q => q.examen === id);
}

function getQuestionById(id) {
  return BANK.questions.find(q => q.id === id) || null;
}

/* ==========================================================
   🚀 initApp — no carga bancos sola
   ========================================================== */

function initApp() {
  renderHome(); // Se carga banco guardado si existe
}

/* ==========================================================
   🔄 Recarga manual + guardado permanente
   ========================================================== */

async function recargarBancos() {
  const ok = confirm("¿Cargar / recargar TODOS los bancos ahora?");
  if (!ok) return;

  await loadAllBanks();

  // 🟢 Guardar el banco cargado
  localStorage.setItem("MEbank_BANK_v1", JSON.stringify(BANK));

  alert("✔ Bancos cargados");

  renderHome();
}
