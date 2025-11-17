/* ==========================================================
   🌐 MEbank 3.0 – Banco transversal inteligente (AutoHash PRO)
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
   🔤 Normalizador
   ========================================================== */

function normalize(str) {
  return str
    ? str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")                           
        .replace(/[\p{Emoji}\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "")
        .replace(/[^\p{L}\p{N}]/gu, "")                           
        .toLowerCase()
    : "";
}

/* ==========================================================
   🧱 BANK – estructura en memoria
   ========================================================== */

let BANK = {
  subjects: SUBJECTS,
  subsubjects: {},
  questions: [],
  loaded: false
};

/* Inicializar subtemas */
SUBJECTS.forEach(s => {
  if (SUBTEMAS[s.slug]) {
    BANK.subsubjects[s.slug] = SUBTEMAS[s.slug].slice();
  } else {
    BANK.subsubjects[s.slug] = [ "Otras preguntas de " + s.name ];
  }
});

/* ==========================================================
   🔍 AUTOHASH PREMIUM — detectar cambios automáticamente
   ========================================================== */

const BANK_HASH_KEY = "MEbank_Hash_v3";

/* ---- Obtener tamaño del archivo sin descargarlo ---- */
async function getFileSize(ruta) {
  try {
    const resp = await fetch(ruta, { method: "HEAD" });
    if (!resp.ok) return null;
    const size = resp.headers.get("content-length");
    return size ? Number(size) : 0;
  } catch {
    return null;
  }
}

/* ---- Generar hash del banco entero ---- */
async function calcularHashBanco() {
  let partes = [];

  // Materias
  for (const subj of SUBJECTS) {
    const slug = subj.slug;
    for (let i = 1; i <= 4; i++) {
      const ruta = `bancos/${slug}/${slug}${i}.json`;
      const size = await getFileSize(ruta);
      if (size !== null) partes.push(ruta + ":" + size);
    }
  }

  // Exámenes anteriores
  for (const exam of EXAMENES_META) {
    const size = await getFileSize(exam.file);
    if (size !== null) partes.push(exam.file + ":" + size);
  }

  partes.sort();
  return partes.join("|");
}

/* ---- Comparar hash actual con hash guardado ---- */
async function bankNeedsReload() {
  const stored = localStorage.getItem(BANK_HASH_KEY);
  const current = await calcularHashBanco();

  if (stored === current) {
    console.log("🔒 Banco actualizado – no se recarga.");
    return false;
  }

  console.log("🔄 Cambios detectados – recarga necesaria.");
  localStorage.setItem(BANK_HASH_KEY, current);
  return true;
}

/* ==========================================================
   🌟 CARGA COMPLETA DEL BANCO
   ========================================================== */

async function loadAllBanks() {
  console.log("⏳ Cargando bancos…");

  BANK.questions = [];
  const existingIds = new Set();

  await loadBanksMaterias(existingIds);
  await loadBanksExamenes(existingIds);

  BANK.loaded = true;

  console.log(`✅ Banco cargado: ${BANK.questions.length} preguntas totales`);
}

/* ========== 1) Materias ========== */

async function loadBanksMaterias(existingIds) {
  for (const subj of SUBJECTS) {
    const slug = subj.slug;
    for (let i = 1; i <= 4; i++) {
      const ruta = `bancos/${slug}/${slug}${i}.json`;
      await cargarArchivoIfExists(ruta, existingIds, "materia");
    }
  }
}

/* ========== 2) Exámenes anteriores ========== */

async function loadBanksExamenes(existingIds) {
  for (const exam of EXAMENES_META) {
    await cargarArchivoIfExists(exam.file, existingIds, "examen", exam);
  }
}

/* ==========================================================
   📄 Cargar archivo JSON si existe
   ========================================================== */

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
    console.warn(`⚠ No se pudo cargar ${ruta}`, err);
    return false;
  }
}

/* ==========================================================
   🧬 Normalizar preguntas
   ========================================================== */

function normalizarPregunta(q, tipo, examMeta) {

  if (!q.materia) q.materia = "otras";
  q.materia = normalize(q.materia);

  if (!q.submateria) q.submateria = "otras";
  q.submateria = normalize(q.submateria);

  if (!BANK.subsubjects[q.materia]) {
    BANK.subsubjects[q.materia] = [ "Otras preguntas" ];
  }

  if (!Array.isArray(q.opciones)) q.opciones = [];
  if (!q.explicacion) q.explicacion = null;
  if (!q.imagenes) q.imagenes = [];

  q.tipo = tipo;

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
   📌 Utilidades
   ========================================================== */

function getQuestionsByMateria(slug, subtemas = null) {
  const mat = normalize(slug);

  return BANK.questions.filter(q => {
    if (q.materia !== mat) return false;
    if (subtemas && subtemas.length)
      return subtemas.includes(q.submateria);
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
   🚀 Inicialización automática
   ========================================================== */

async function initApp() {
  const necesita = await bankNeedsReload();

  if (necesita) {
    alert("🔄 Se detectaron cambios en los bancos. Cargando nuevos bancos…");
    await loadAllBanks();
  } else {
    BANK.loaded = true;
  }

  renderHome();
}

/* ==========================================================
   🔄 Recarga manual
   ========================================================== */

async function recargarBancos() {
  if (!confirm("¿Querés recargar TODOS los bancos?")) return;

  BANK.loaded = false;
  BANK.questions = [];

  await loadAllBanks();

  alert("✔ Bancos recargados correctamente");

  renderHome();
}
