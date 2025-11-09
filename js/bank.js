/* ==========================================================
   💾 BANCO DE PREGUNTAS – Persistencia, carga y actualización
   ========================================================== */

const LS_BANK = "mebank_bank_v6_full";
const LS_PROGRESS = "mebank_prog_v6_full";

let BANK = JSON.parse(localStorage.getItem(LS_BANK) || "null") || {
  subjects: [
    { slug: "neumonologia", name: "🫁 Neumonología" },
    { slug: "psiquiatria", name: "💭 Psiquiatría" },
    { slug: "cardiologia", name: "🫀 Cardiología" },
    { slug: "nutricion", name: "🍏 Nutrición" },
    { slug: "urologia", name: "🚽 Urología" },
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
    { slug: "oftalmologia", name: "👁️ Oftalmología" },
    { slug: "otorrinolaringologia", name: "👂 Otorrinolaringología" },
    { slug: "neurocirugia", name: "🧠 Neurocirugía" },
    { slug: "toxicologia", name: "☠️ Toxicología" },
    { slug: "saludpublica", name: "🏥 Salud Pública" },
    { slug: "medicinalegal", name: "⚖️ Medicina Legal" },
    { slug: "imagenes", name: "🩻 Diagnóstico por Imágenes" },
    { slug: "otras", name: "📚 Otras" }
  ],
  questions: []
};

let PROG = JSON.parse(localStorage.getItem(LS_PROGRESS) || "{}");

/* ==========================================================
   💾 Guardado local
   ========================================================== */
function saveAll() {
  localStorage.setItem(LS_BANK, JSON.stringify(BANK));
  localStorage.setItem(LS_PROGRESS, JSON.stringify(PROG));
}

/* ==========================================================
   📘 Materias derivadas del banco
   ========================================================== */
function subjectsFromBank() {
  const normalize = str =>
    str ? str.normalize("NFD").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase().trim() : "";

  const known = new Map((BANK.subjects || []).map(s => [normalize(s.slug), s]));

  (BANK.questions || []).forEach(q => {
    if (q && q.materia) {
      const slug = normalize(q.materia);
      if (!known.has(slug)) known.set(slug, { slug, name: q.materia });
    }
  });

  return Array.from(known.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "es", { sensitivity: "base" })
  );
}

/* ==========================================================
   🌐 Carga automática de bancos
   ========================================================== */
async function loadAllBanks() {
  const materias = BANK.subjects.map(s => s.slug);
  const existingIds = new Set(BANK.questions.map(q => q.id));
  let totalNuevas = 0;

  const loader = showLoader("⏳ Cargando bancos...");

  const normalizarMateria = (nombre) => {
    if (!nombre) return "";
    const limpio = nombre.normalize("NFD").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase().trim();
    const match = BANK.subjects.find(s => limpio === s.slug);
    return match ? match.slug : limpio;
  };

  for (const materia of materias) {
    for (let i = 1; i <= 4; i++) {
      // 🔧 ruta corregida: sin "../"
      const ruta = `bancos/${materia}/${materia}${i}.json`;
      try {
        const resp = await fetch(ruta);
        if (!resp.ok) continue;
        const data = await resp.json();

        // normaliza campo materia antes de guardar
        data.forEach(q => {
          if (q.materia) q.materia = normalizarMateria(q.materia);
        });

        const nuevas = data.filter(q => !existingIds.has(q.id));
        if (nuevas.length > 0) {
          nuevas.forEach(q => existingIds.add(q.id));
          BANK.questions.push(...nuevas);
          totalNuevas += nuevas.length;
          console.log(`📘 ${ruta} (${nuevas.length} nuevas preguntas)`);
        }
      } catch (err) {
        console.warn(`⚠️ No se pudo cargar ${ruta}`, err);
      }
    }
  }

  hideLoader(loader, totalNuevas);
  if (totalNuevas > 0) saveAll();
}

/* ==========================================================
   💬 Indicadores visuales
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
   ⚙️ Carga inicial automática
   ========================================================== */
window.addEventListener("DOMContentLoaded", async () => {
  if (!(BANK.questions && BANK.questions.length)) {
    await loadAllBanks();
    if (!BANK.questions.length) {
      console.warn("⚠️ No se cargaron preguntas. Verificá rutas o permisos de CORS.");
    }
  }
});

/* ==========================================================
   ♻️ Forzar recarga completa
   ========================================================== */
async function forceReloadBank() {
  if (!confirm("⚠️ Esto borrará el banco local y lo recargará completo. ¿Continuar?")) return;

  localStorage.removeItem(LS_BANK);
  localStorage.removeItem(LS_PROGRESS);

  BANK = { subjects: [...BANK.subjects], questions: [] };
  PROG = {};

  alert("♻️ Banco borrado. Ahora se recargará completo...");

  await loadAllBanks();
  saveAll();

  alert(`✅ Banco recargado con ${BANK.questions.length} preguntas`);
  renderHome();
}
