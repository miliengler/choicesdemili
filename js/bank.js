/* ==========================================================
   🌐 MEbank – Banco transversal de preguntas (v2)
   ========================================================== */
/* ==========================================================
   🔐 MEbank Storage Seguro para iPad / Safari
   SOLO guarda progreso (PROG), NO guarda BANK.
========================================================== */

const STORAGE_KEY = "MEbank_PROG_v2";

/* Cargar progreso */
function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/* Guardar progreso (compactado) */
function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(PROG));
  } catch (err) {
    console.warn("⚠ No se pudo guardar progreso (storage lleno)");
  }
}

/* Objeto global de progreso */
let PROG = loadProgress();
/* ---------- Claves de storage ---------- */
const LS_BANK = "mebank_bank_v2";
const LS_PROG = "mebank_progress_v2";

/* ---------- Estado principal ---------- */
let BANK = JSON.parse(localStorage.getItem(LS_BANK) || "null") || {
  subjects: [],
  subsubjects: {},   // subtemas por materia
  questions: []
};

let PROG = JSON.parse(localStorage.getItem(LS_PROG) || "{}");

/* ==========================================================
   ✨ Normalizador universal
   ========================================================== */
function normalize(str) {
  return str
    ? str.normalize("NFD")
        .replace(/[\p{Emoji}\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "")
        .replace(/[^\p{L}\p{N}]/gu, "")
        .toLowerCase()
    : "";
}

/* ==========================================================
   🧠 Materias oficiales (tu lista)
   ========================================================== */
BANK.subjects = [
  { slug: "pediatria", name: "🧸 Pediatría" },
  { slug: "obstetricia", name: "🤰 Obstetricia" },
  { slug: "ginecologia", name: "🌸 Ginecología" },
  { slug: "medicinainterna", name: "🫀 Medicina Interna" },
  { slug: "saludpublica", name: "🏥 Salud Pública" },
  { slug: "psiquiatria", name: "💭 Psiquiatría" },
  { slug: "cardiologia", name: "❤️ Cardiología" },
  { slug: "cirugiageneral", name: "🔪 Cirugía General" },
  { slug: "otras", name: "📚 Otras" }
];

/* ==========================================================
   🧩 Submaterias base (todas arrancan con "otras")
   ========================================================== */
BANK.subsubjects = {};
BANK.subjects.forEach(s => {
  BANK.subsubjects[s.slug] = ["otras"];
});

/* ==========================================================
   🔁 Guardar todo
   ========================================================== */
function saveBank() {
  localStorage.setItem(LS_PROG, JSON.stringify(PROG));
}

/* ==========================================================
   🌐 Carga completa del banco
   ========================================================== */
async function loadAllBanks() {
  console.log("⏳ Cargando banco transversal…");

  const existingIds = new Set(BANK.questions.map(q => q.id));

  /* ---------- 1) Bancos por materia ---------- */
  const materias = BANK.subjects.map(s => s.slug);

  for (const mat of materias) {
    for (let i = 1; i <= 4; i++) {
      await cargarArchivoJSON(`bancos/${mat}/${mat}${i}.json`, existingIds, "materia");
    }
  }

  /* ---------- 2) Exámenes anteriores + privados ---------- */
  const examFolders = [
    "bancos/anteriores/",
    "bancos/privados/austral/",
    "bancos/privados/italiano/",
    "bancos/privados/britanico/"
  ];

  for (const folder of examFolders) {
    await cargarCarpeta(folder, existingIds);
  }

  saveBank();
  console.log(`✅ Banco cargado: ${BANK.questions.length} preguntas totales`);
}

/* ==========================================================
   📁 Cargar carpeta entera (lista JSONs dentro)
   ========================================================== */
async function cargarCarpeta(folder, existingIds) {
  try {
    const res = await fetch(folder);
    if (!res.ok) return;

    const html = await res.text();
    const matches = html.match(/href="([^"]+\.json)"/g);
    if (!matches) return;

    for (const m of matches) {
      const file = m.match(/href="([^"]+)"/)[1];
      await cargarArchivoJSON(folder + file, existingIds, "examen");
    }
  } catch (err) {
    console.warn(`⚠ No se pudo leer carpeta ${folder}`, err);
  }
}

/* ==========================================================
   📘 Cargar archivo JSON individual
   ========================================================== */
async function cargarArchivoJSON(ruta, existingIds, tipo) {
  try {
    const resp = await fetch(ruta);
    if (!resp.ok) return;

    const data = await resp.json();
    if (!Array.isArray(data)) return;

    data.forEach(q => normalizarPregunta(q, tipo, ruta));

    const nuevas = data.filter(q => !existingIds.has(q.id));
    nuevas.forEach(q => {
      existingIds.add(q.id);
      BANK.questions.push(q);
    });

    if (nuevas.length)
      console.log(`📘 ${ruta}: ${nuevas.length} nuevas`);

  } catch (err) {
    console.warn(`⚠ Error leyendo ${ruta}`, err);
  }
}

/* ==========================================================
   🧬 Normalizador de cada pregunta
   ========================================================== */
function normalizarPregunta(q, tipo, ruta) {

  /* --- Tipo --- */
  q.tipo = tipo === "examen" ? "examen" : "materia";

  /* --- Materia --- */
  if (!q.materia) q.materia = "otras";
  q.materia = normalize(q.materia);

  /* --- Submateria --- */
  if (!q.submateria) q.submateria = "otras";
  else q.submateria = normalize(q.submateria);

  /* Añadir submateria automáticamente */
  if (!BANK.subsubjects[q.materia])
    BANK.subsubjects[q.materia] = ["otras"];

  if (!BANK.subsubjects[q.materia].includes(q.submateria))
    BANK.subsubjects[q.materia].push(q.submateria);

  /* --- Datos de examen (si corresponden) --- */
  if (tipo === "examen") {
    const match = ruta.match(/(\d{4})/);
    q.anio = match ? Number(match[1]) : null;

    if (ruta.includes("anteriores"))
      q.examen = `examen_unico_${q.anio}`;
    else if (ruta.includes("austral"))
      q.examen = `austral_${q.anio}`;
    else if (ruta.includes("italiano"))
      q.examen = `italiano_${q.anio}`;
    else if (ruta.includes("britanico"))
      q.examen = `britanico_${q.anio}`;
    else
      q.examen = null;

    q.oficial = ruta.includes("anteriores");
  }

  return q;
}

/* ==========================================================
   ♻ Recarga completa del banco
   ========================================================== */
async function forceReloadBank() {
  if (!confirm("¿Recargar todo el banco?")) return;

  localStorage.removeItem(LS_BANK);
  localStorage.removeItem(LS_PROG);

  BANK = {
    subjects: BANK.subjects,
    subsubjects: {},
    questions: []
  };

  BANK.subjects.forEach(s => {
    BANK.subsubjects[s.slug] = ["otras"];
  });

  PROG = {};

  await loadAllBanks();
  saveBank();
}
