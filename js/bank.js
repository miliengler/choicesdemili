/* ==========================================================
   🌐 MEbank 3.0 – Banco transversal de preguntas
   ========================================================== */

/* ==========================================================
   🔐 PROGRESO (único guardado en localStorage)
   ========================================================== */

const STORAGE_KEY_PROG = "MEbank_PROG_v3";

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROG);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY_PROG, JSON.stringify(PROG));
  } catch (err) {
    console.warn("⚠ No se pudo guardar PROG (storage lleno)", err);
  }
}

let PROG = loadProgress();

/* ==========================================================
   🔤 Normalizador (para claves internas)
   ========================================================== */

function normalize(str) {
  return str
    ? str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")                           // Quitar tildes
        .replace(/[\p{Emoji}\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "")
        .replace(/[^\p{L}\p{N}]/gu, "")                           // Solo letras / números
        .toLowerCase()
    : "";
}

/* ==========================================================
   🧱 BANK – estructura en memoria
   ========================================================== */

let BANK = {
  subjects: SUBJECTS,      // listas definidas en config.js
  subsubjects: {},         // materiaSlug → lista de subtemas
  questions: [],           // TODAS las preguntas cargadas
  loaded: false            // indica si ya se cargó el banco
};

/* Inicializar submaterias desde SUBTEMAS */
SUBJECTS.forEach(s => {
  if (SUBTEMAS[s.slug]) {
    BANK.subsubjects[s.slug] = SUBTEMAS[s.slug].slice();
  } else {
    BANK.subsubjects[s.slug] = [ "Otras preguntas de " + s.name ];
  }
});

/* ==========================================================
   🌟 Cargar banco (solo cuando el usuario quiere)
   - loadAllBanks(): carga TODO según config.js
   - NO se ejecuta automáticamente al iniciar la app
   ========================================================== */

async function loadAllBanks() {
  console.log("⏳ Cargando bancos…");

  BANK.questions = [];
  const existingIds = new Set();

  // 1) Cargar bancos de materias (carpeta bancos/<materia>/*.json)
  await loadBanksMaterias(existingIds);

  // 2) Cargar bancos de exámenes (según EXAMENES_META)
  await loadBanksExamenes(existingIds);

  BANK.loaded = true;

  console.log(`✅ Banco cargado: ${BANK.questions.length} preguntas totales`);
}

/* ----------------------------------------------------------
   🟦 1) Cargar bancos de materias
   ---------------------------------------------------------- */

async function loadBanksMaterias(existingIds) {
  for (const subj of SUBJECTS) {
    const slug = subj.slug;

    // Ruta: bancos/<materia>/<materia>.json  (todas las que existan)
    // Como no sabemos si hay 1, 2, 3 o 4 archivos, probamos del 1 al 4.
    for (let i = 1; i <= 4; i++) {
      const ruta = `bancos/${slug}/${slug}${i}.json`;
      await cargarArchivoIfExists(ruta, existingIds, "materia");
    }
  }
}

/* ----------------------------------------------------------
   🟩 2) Cargar bancos de exámenes anteriores
   ---------------------------------------------------------- */

async function loadBanksExamenes(existingIds) {
  for (const exam of EXAMENES_META) {
    await cargarArchivoIfExists(exam.file, existingIds, "examen", exam);
  }
}

/* ----------------------------------------------------------
   📄 Cargar archivo JSON si existe
   ---------------------------------------------------------- */

async function cargarArchivoIfExists(ruta, existingIds, tipo, examMeta = null) {
  try {
    const resp = await fetch(ruta);
    if (!resp.ok) return false;

    const data = await resp.json();
    if (!Array.isArray(data)) return false;

    for (const q of data) {
      normalizarPregunta(q, tipo, examMeta);

      if (!existingIds.has(q.id)) {
        existingIds.add(q.id);
        BANK.questions.push(q);
      }
    }

    console.log(`📘 Cargado: ${ruta} (${data.length} preguntas)`);

    return true;

  } catch (err) {
    console.warn(`⚠ No se pudo cargar ${ruta}:`, err);
    return false;
  }
}

/* ==========================================================
   🧬 Normalizar preguntas
   ========================================================== */

function normalizarPregunta(q, tipo, examMeta) {

  // ----------- Materia -----------
  if (!q.materia) q.materia = "otras";
  q.materia = normalize(q.materia);

  // ----------- Submateria -----------
  if (!q.submateria) q.submateria = "otras";
  q.submateria = normalize(q.submateria);

  // Asegurar que existe en BANK.subsubjects
  if (!BANK.subsubjects[q.materia]) {
    BANK.subsubjects[q.materia] = [ "Otras preguntas" ];
  }

  // ----------- Formato de opciones -----------
  if (!Array.isArray(q.opciones)) q.opciones = [];

  // ----------- Explicación e imágenes opcionales -----------
  if (!q.explicacion) q.explicacion = null;
  if (!q.imagenes) q.imagenes = [];

  // ----------- Tipo examen vs materia -----------
  q.tipo = tipo;

  // Si viene de examen, integrar EXAMENES_META
  if (tipo === "examen" && examMeta) {
    q.examen = examMeta.id;
    q.anio = examMeta.anio;
    q.oficial = examMeta.grupo === "Examen Único";
  } else {
    q.examen = null;
    q.anio = null;
    q.oficial = false;
  }

  return q;
}

/* ==========================================================
   📌 UTILIDADES PARA LA APP
   ========================================================== */

function getQuestionsByMateria(slug, subtemasElegidos = null) {
  const mat = normalize(slug);

  return BANK.questions.filter(q => {
    if (q.materia !== mat) return false;

    if (subtemasElegidos && subtemasElegidos.length > 0) {
      return subtemasElegidos.includes(q.submateria);
    }

    return true;
  });
}

function getQuestionsByExamen(examenId) {
  return BANK.questions.filter(q => q.examen === examenId);
}

function getQuestionById(id) {
  return BANK.questions.find(q => q.id === id) || null;
}

/* ==========================================================
   🌟 Inicialización de MEbank 3.0
   ========================================================== */

function initApp() {
  // Cargar directamente Home sin cargar bancos (NO molestamos al usuario)
  renderHome();
}

/* ==========================================================
   🔄 Recarga manual de bancos (botón en stats o config)
   ========================================================== */

async function recargarBancos() {
  if (!confirm("¿Querés recargar TODOS los bancos?")) return;

  BANK.loaded = false;
  BANK.questions = [];

  await loadAllBanks();

  alert("Bancos recargados correctamente ✔");

  if (typeof renderHome === "function") renderHome();
}
