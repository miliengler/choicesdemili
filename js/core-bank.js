/* ==========================================================
   🧩 CORE-BANK.JS – Módulo unificado de banco, progreso y normalización
   ========================================================== */

const LS_BANK = "mebank_bank_v7";
const LS_PROGRESS = "mebank_prog_v7";

const HIDDEN_EXAMS = ["inmunomatrix", "general", "base", "practice", "test"];

let MEbank = {
  subjects: [
    { slug: "neumonologia", name: "🫁 Neumonología" },
    { slug: "psiquiatria", name: "💭 Psiquiatría" },
    { slug: "cardiologia", name: "🫀 Cardiología" },
    { slug: "nutricion", name: "🍏 Nutrición" },
    { slug: "nefrologia", name: "🫘 Nefrología" },
    { slug: "gastroenterologia", name: "💩 Gastroenterología" },
    { slug: "dermatologia", name: "🧴 Dermatología" },
    { slug: "infectologia", name: "🦠 Infectología" },
    { slug: "reumatologia", name: "💪 Reumatología" },
    { slug: "hematologia", name: "🩸 Hematología" },
    { slug: "neurologia", name: "🧠 Neurología" },
    { slug: "endocrinologia", name: "🧪 Endocrinología" },
    { slug: "pediatria", name: "🧸 Pediatría" },
    { slug: "oncologia", name: "🎗️ Oncología" },
    { slug: "medicinafamiliar", name: "👨‍👩‍👧‍👦 Medicina Familiar" },
    { slug: "ginecologia", name: "🌸 Ginecología" },
    { slug: "obstetricia", name: "🤰 Obstetricia" },
    { slug: "cirugiageneral", name: "🔪 Cirugía General" },
    { slug: "traumatologia", name: "🦴 Traumatología" },
    { slug: "urologia", name: "🚽 Urología" },
    { slug: "oftalmologia", name: "👁️ Oftalmología" },
    { slug: "otorrinolaringologia", name: "👂 Otorrinolaringología" },
    { slug: "neurocirugia", name: "🧠 Neurocirugía" },
    { slug: "toxicologia", name: "☠️ Toxicología" },
    { slug: "saludpublica", name: "🏥 Salud Pública" },
    { slug: "medicinalegal", name: "⚖️ Medicina Legal" },
    { slug: "imagenes", name: "🩻 Diagnóstico por Imágenes" },
    { slug: "otras", name: "📚 Otras" }
  ],
  questions: [],
  byMateria: {},
  byExamen: {}
};

/* ---------- Normalización general ---------- */
function normalizeString(str) {
  return str
    ? str.normalize("NFD").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase().trim()
    : "";
}

function normalizeMateria(name) {
  const limpio = normalizeString(name || "");
  if (!limpio) return "";
  const match = MEbank.subjects.find(s => normalizeString(s.slug) === limpio);
  return match ? match.slug : limpio;
}

/* ---------- Carga desde localStorage ---------- */
let PROG = JSON.parse(localStorage.getItem(LS_PROGRESS) || "{}");
let BANK_LOCAL = JSON.parse(localStorage.getItem(LS_BANK) || "null");

if (BANK_LOCAL && BANK_LOCAL.questions?.length) {
  MEbank.questions = BANK_LOCAL.questions;
}

/* ---------- Guardar ---------- */
function saveAll() {
  localStorage.setItem(LS_BANK, JSON.stringify(MEbank));
  localStorage.setItem(LS_PROGRESS, JSON.stringify(PROG));
}

/* ==========================================================
   🔹 CARGA AUTOMÁTICA DESDE /BANCOS/
   Incluye tanto bancos temáticos como exámenes oficiales
   ========================================================== */
async function loadAllBanks() {
  const existingIds = new Set(MEbank.questions.map(q => q.id));
  let totalNuevas = 0;
  const loader = showLoader("⏳ Cargando bancos...");

  // Materias + exámenes oficiales
  const sources = [
    ...MEbank.subjects.map(s => s.slug),
    "examen_unico_2025", "examen_unico_2024", "examen_unico_2023"
  ];

  for (const src of sources) {
    for (let i = 1; i <= 4; i++) {
      const ruta = `../bancos/${src}/${src}${i}.json`;
      try {
        const resp = await fetch(ruta);
        if (!resp.ok) continue;
        const data = await resp.json();

        const nuevas = data
          .filter(q => q?.id && !existingIds.has(q.id))
          .map(q => ({
            ...q,
            materia: normalizeMateria(q.materia),
            examen: q.examen || null,
            anio: q.anio || null
          }));

        if (nuevas.length) {
          nuevas.forEach(q => existingIds.add(q.id));
          MEbank.questions.push(...nuevas);
          totalNuevas += nuevas.length;
          console.log(`📘 ${ruta} (${nuevas.length} nuevas preguntas)`);
        }
      } catch {
        console.warn(`⚠️ No se pudo cargar ${ruta}`);
      }
    }
  }

  indexQuestions();
  hideLoader(loader, totalNuevas);
  if (totalNuevas > 0) saveAll();
}

/* ---------- Indexado por materia y examen ---------- */
function indexQuestions() {
  MEbank.byMateria = {};
  MEbank.byExamen = {};

  (MEbank.questions || []).forEach(q => {
    const mat = normalizeMateria(q.materia);
    if (!mat) return;

    // 📚 Por materia
    if (!MEbank.byMateria[mat]) MEbank.byMateria[mat] = [];
    MEbank.byMateria[mat].push(q);

    // 🧾 Por examen
    if (q.examen && !HIDDEN_EXAMS.includes(normalizeString(q.examen))) {
      const key = q.anio ? `${q.examen}_${q.anio}` : normalizeString(q.examen);
      if (!MEbank.byExamen[key]) MEbank.byExamen[key] = [];
      MEbank.byExamen[key].push(q);
    }
  });
}

/* ==========================================================
   🔄 RECARGA COMPLETA
   ========================================================== */
async function forceReloadBank() {
  if (!confirm("⚠️ Esto borrará el banco local y lo recargará completo. ¿Continuar?")) return;
  localStorage.removeItem(LS_BANK);
  localStorage.removeItem(LS_PROGRESS);
  MEbank.questions = [];
  PROG = {};
  alert("♻️ Banco borrado. Se recargará completo...");
  await loadAllBanks();
  saveAll();
  alert(`✅ Banco recargado con ${MEbank.questions.length} preguntas`);
  if (typeof renderHome === "function") renderHome();
}

/* ==========================================================
   💾 UTILIDADES VISUALES
   ========================================================== */
function showLoader(text) {
  const el = document.createElement("div");
  el.id = "bankLoader";
  el.style = `
    position:fixed;bottom:15px;left:15px;
    background:#1e40af;color:white;padding:8px 12px;
    border-radius:8px;font-size:13px;z-index:9999;
    box-shadow:0 2px 6px rgba(0,0,0,0.3);
  `;
  el.textContent = text;
  document.body.appendChild(el);
  return el;
}

function hideLoader(el, total) {
  el.textContent = total > 0
    ? `✅ ${total} nuevas preguntas cargadas`
    : "✅ Bancos actualizados (sin cambios)";
  setTimeout(() => el.remove(), 2500);
}

/* ==========================================================
   ⚙️ INICIALIZACIÓN
   ========================================================== */
window.addEventListener("DOMContentLoaded", async () => {
  if (!(MEbank.questions && MEbank.questions.length)) {
    await loadAllBanks();
  } else {
    indexQuestions();
  }
});
