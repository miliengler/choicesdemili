/* ==========================================================
   💾 CORE-BANK.JS – Banco de preguntas unificado (MEbank)
   ========================================================== */

const LS_BANK = "mebank_v7_unificado";
const LS_PROGRESS = "mebank_prog_v7_unificado";

/* ---------- Estado global ---------- */
let MEbank = JSON.parse(localStorage.getItem(LS_BANK) || "null") || {
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

/* ---------- Progreso ---------- */
let PROG = JSON.parse(localStorage.getItem(LS_PROGRESS) || "{}");

/* ---------- Normalizador universal ---------- */
function normalize(str) {
  return str ? str.normalize("NFD").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase().trim() : "";
}

/* ---------- Guardado ---------- */
function saveAll() {
  localStorage.setItem(LS_BANK, JSON.stringify(MEbank));
  localStorage.setItem(LS_PROGRESS, JSON.stringify(PROG));
}

/* ---------- Índices dinámicos ---------- */
function rebuildIndexes() {
  MEbank.byMateria = {};
  MEbank.byExamen = {};

  (MEbank.questions || []).forEach(q => {
    if (!q || !q.id) return;

    const mKey = normalize(q.materia);
    const eKey = normalize(q.examen || "oculto");

    if (!MEbank.byMateria[mKey]) MEbank.byMateria[mKey] = [];
    if (!MEbank.byExamen[eKey]) MEbank.byExamen[eKey] = [];

    MEbank.byMateria[mKey].push(q);
    MEbank.byExamen[eKey].push(q);
  });
}

/* ---------- Carga de bancos ---------- */
async function loadAllBanks() {
  const materias = MEbank.subjects.map(s => s.slug);
  const existingIds = new Set(MEbank.questions.map(q => q.id));
  let totalNuevas = 0;

  const loader = showLoader("⏳ Cargando bancos...");

  for (const materia of materias) {
    for (let i = 1; i <= 4; i++) {
      const ruta = `../bancos/${materia}/${materia}${i}.json`;
      try {
        const resp = await fetch(ruta);
        if (!resp.ok) continue;
        const data = await resp.json();

        data.forEach(q => {
          if (!q || !q.id) return;
          q.materia = normalize(q.materia || materia);
          q.examen = q.examen || "oculto"; // 📄 Si no tiene examen, no se muestra en “Exámenes anteriores”
        });

        const nuevas = data.filter(q => !existingIds.has(q.id));
        if (nuevas.length > 0) {
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

  rebuildIndexes();
  hideLoader(loader, totalNuevas);
  if (totalNuevas > 0) saveAll();
}

/* ---------- Indicadores visuales ---------- */
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

/* ---------- Carga inicial ---------- */
window.addEventListener("DOMContentLoaded", async () => {
  if (!(MEbank.questions && MEbank.questions.length)) {
    await loadAllBanks();
  } else {
    rebuildIndexes();
  }
});

/* ---------- 🔄 Recarga completa ---------- */
async function forceReloadBank() {
  if (!confirm("⚠️ Esto borrará el banco local y lo recargará completo. ¿Continuar?")) return;

  localStorage.removeItem(LS_BANK);
  localStorage.removeItem(LS_PROGRESS);

  MEbank = { subjects: MEbank.subjects, questions: [], byMateria: {}, byExamen: {} };
  PROG = {};

  alert("♻️ Banco borrado. Ahora se recargará completo...");

  await loadAllBanks();
  saveAll();

  alert(`✅ Banco recargado con ${MEbank.questions.length} preguntas`);
  renderHome();
}
/* ==========================================================
   🚀 ARRANQUE VISUAL AUTOMÁTICO
   ========================================================== */
window.addEventListener("load", () => {
  const appEl = document.getElementById("app");

  if (appEl) {
    window.app = appEl;

    if (typeof renderHome === "function") {
      renderHome();
      console.log("✅ Interfaz principal iniciada correctamente.");
    } else {
      console.warn("⚠️ renderHome no está definido todavía. Intentando de nuevo en 300 ms...");
      setTimeout(() => {
        if (typeof renderHome === "function") {
          renderHome();
          console.log("✅ Interfaz principal iniciada correctamente (reintento).");
        } else {
          console.error("❌ No se pudo iniciar la interfaz principal: renderHome no existe.");
        }
      }, 300);
    }
  } else {
    console.error("❌ No se encontró el elemento #app en el DOM.");
  }
});
