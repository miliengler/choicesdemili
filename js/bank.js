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
   🔤 Normalizador (robusto)
   - saca tildes
   - saca emojis
   - deja solo letras/números
   ========================================================== */

function normalize(s) {
  return s
    ? String(s)
        .normalize("NFD")
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

// Cargar subtemas base (texto UI)
SUBJECTS.forEach(s => {
  BANK.subsubjects[s.slug] = SUBTEMAS[s.slug] || [("Otras preguntas de " + s.name)];
});

/* ==========================================================
   🔄 Intentar cargar BANK guardado
   ========================================================== */

try {
  const savedBank = localStorage.getItem("MEbank_BANK_v1");
  if (savedBank) {
    const parsed = JSON.parse(savedBank);
    BANK.questions = parsed.questions || [];
    BANK.loaded = parsed.loaded || false;
    console.log("📦 Banco restaurado desde localStorage:", BANK.questions.length, "preguntas");
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

    // tus bancos por materia: slug1..slug4 (si no existen, fetch falla ok)
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

    for (const q of data) {
      normalizeQuestion(q, tipo, exam);

      // si no trae id, generamos uno (evita "undefined" y colisiones raras)
      if (!q.id) q.id = `${tipo}_${Math.random().toString(36).slice(2, 10)}`;

      if (!ids.has(q.id)) {
        ids.add(q.id);
        BANK.questions.push(q);
      }
    }

    console.log("📘", ruta, "+", data.length);
  } catch (e) {
    console.warn("⚠ No se pudo cargar", ruta);
  }
}

/* ==========================================================
   🧩 Submateria → “encajar” en un subtema oficial
   (esto arregla el: "materia X preguntas" pero subtemas 0)
   ========================================================== */

function canonicalizeSubmateria(mSlug, rawSub) {
  const list = BANK.subsubjects[mSlug] || [];
  if (!list.length) return "otras";

  const normalizedList = list.map(t => normalize(t));
  const subNorm = normalize(rawSub);

  // 1) match exacto contra los subtemas oficiales
  const idxExact = normalizedList.indexOf(subNorm);
  if (idxExact !== -1) return normalizedList[idxExact];

  // 2) match por "contiene" (útil cuando submateria viene tipo "Cardiología – X")
  //    ej: "hipertension" debería caer en "Hipertensión arterial y factores de riesgo"
  for (let i = 0; i < list.length; i++) {
    const tNorm = normalizedList[i];
    if (!tNorm) continue;

    // si alguno de los dos contiene al otro, lo damos por match
    if (subNorm.includes(tNorm) || tNorm.includes(subNorm)) {
      return tNorm;
    }
  }

  // 3) fallback: último subtema suele ser "Otras preguntas de ..."
  const fallback = normalizedList[normalizedList.length - 1] || "otras";
  return fallback || "otras";
}

/* ==========================================================
   🧬 Normalizar pregunta (versión tolerante PRO, sin duplicados)
   ========================================================== */

function normalizeQuestion(q, tipo, exam) {
  if (!q || typeof q !== "object") return;

  /* ----- materia ----- */
  // aceptar: "Cardiología", ["🫀 Cardiología"], "cardiologia"
  if (Array.isArray(q.materia)) q.materia = q.materia[0] || "otras";
  if (!q.materia) q.materia = "otras";

  // slug final
  q.materia = normalize(q.materia);

  // si la materia no existe en SUBJECTS, mandala a "otras"
  const existeMateria = (BANK.subjects || []).some(s => s.slug === q.materia);
  if (!existeMateria) q.materia = "otras";

  // asegurar subsubjects de esa materia
  if (!BANK.subsubjects[q.materia]) {
    BANK.subsubjects[q.materia] = ["Otras preguntas de " + q.materia];
  }

  /* ----- submateria ----- */
  if (Array.isArray(q.submateria)) q.submateria = q.submateria[0] || "";
  if (!q.submateria) q.submateria = "";

  // IMPORTANTÍSIMO: encajar submateria a lista oficial
  q.submateria = canonicalizeSubmateria(q.materia, q.submateria);

  /* ----- opciones ----- */
  q.opciones = getOpcionesArray(q);

  /* ----- correcta ----- */
  const idx = getCorrectIndex(q);
  q.correcta = idx; // índice 0–3
  q.correctaLetra = idx >= 0 ? (["a","b","c","d","e"][idx] || null) : null;

  /* ----- extras ----- */
  if (!Array.isArray(q.imagenes)) q.imagenes = [];
  if (q.explicacion === undefined || q.explicacion === "") q.explicacion = null;

  /* ----- tipo / metadatos ----- */
  q.tipo = tipo;

  if (tipo === "examen" && exam) {
    q.examen  = exam.id;
    q.anio    = exam.anio;
    q.oficial = (exam.grupo === "Examen Único");
  } else {
    q.examen  = null;
    q.anio    = null;
    q.oficial = false;
  }
}

/* ==========================================================
   🔧 Conversión universal de opciones (única)
   ========================================================== */

function getOpcionesArray(q) {
  // 1) ya es array
  if (Array.isArray(q.opciones)) return q.opciones.slice();

  // 2) objeto tipo {a: "...", b:"...", c:"...", d:"..."}
  if (q.opciones && typeof q.opciones === "object") {
    const letras = ["a","b","c","d","e"];
    const arr = letras.map(l => q.opciones[l]).filter(v => v != null && v !== "");
    if (arr.length) return arr;
  }

  // 3) forma antigua opcion_a / opcion_b ...
  const keys = ["opcion_a","opcion_b","opcion_c","opcion_d","opcion_e"];
  const arr2 = keys.map(k => q[k]).filter(v => v != null && v !== "");
  if (arr2.length) return arr2;

  return [];
}

/* ==========================================================
   ✅ Convertir "correcta" a índice (única)
   ========================================================== */

function getCorrectIndex(q) {
  // si ya viene numérico válido
  if (typeof q.correcta === "number") {
    if (Number.isFinite(q.correcta) && q.correcta >= 0) return q.correcta;
    return -1;
  }

  // si viene letra
  if (typeof q.correcta === "string") {
    const clean = q.correcta.trim().toLowerCase();
    const map = { a:0, b:1, c:2, d:3, e:4 };
    if (map[clean] != null) return map[clean];
  }

  return -1;
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
  renderHome();
}

/* ==========================================================
   🔄 Recarga manual + guardado permanente
   ========================================================== */

async function recargarBancos() {
  const ok = confirm("¿Cargar / recargar TODOS los bancos ahora?");
  if (!ok) return;

  await loadAllBanks();
  localStorage.setItem("MEbank_BANK_v1", JSON.stringify(BANK));

  alert("✔ Bancos cargados");
  renderHome();
}
