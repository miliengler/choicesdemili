/* ---------- Persistencia ---------- */
const LS_BANK = "mebank_bank_v6_full",
      LS_PROGRESS = "mebank_prog_v6_full";

let BANK = JSON.parse(localStorage.getItem(LS_BANK) || "null") || {
  subjects: [
    {slug:"neumonologia", name:"🫁 Neumonología"},
    {slug:"psiquiatria", name:"💭 Psiquiatría"},
    {slug:"cardiologia", name:"🫀 Cardiología"},
    {slug:"nutricion", name:"🍏 Nutrición"},
    {slug:"nefrologia", name:"🫘 Nefrología"},
    {slug:"gastroenterologia", name:"💩 Gastroenterología"},
    {slug:"dermatologia", name:"🧴 Dermatología"},
    {slug:"infectologia", name:"🦠 Infectología"},
    {slug:"reumatologia", name:"💪 Reumatología"},
    {slug:"hematologia", name:"🩸 Hematología"},
    {slug:"neurologia", name:"🧠 Neurología"},
    {slug:"endocrinologia", name:"🧪 Endocrinología"},
    {slug:"pediatria", name:"🧸 Pediatría"},
    {slug:"oncologia", name:"🎗️ Oncología"},
    {slug:"medicinafamiliar", name:"👨‍👩‍👧‍👦 Medicina Familiar"},
    {slug:"ginecologia", name:"🌸 Ginecología"},
    {slug:"obstetricia", name:"🤰 Obstetricia"},
    {slug:"cirugiageneral", name:"🔪 Cirugía General"},
    {slug:"traumatologia", name:"🦴 Traumatología"},
    {slug:"urologia", name:"🚽 Urología"},
    {slug:"oftalmologia", name:"👁️ Oftalmología"},
    {slug:"otorrinolaringologia", name:"👂 Otorrinolaringología"},
    {slug:"neurocirugia", name:"🧠 Neurocirugía"},
    {slug:"toxicologia", name:"☠️ Toxicología"},
    {slug:"saludpublica", name:"🏥 Salud Pública"},
    {slug:"medicinalegal", name:"⚖️ Medicina Legal"},
    {slug:"imagenes", name:"🩻 Diagnóstico por Imágenes"},
    {slug:"otras", name:"📚 Otras"}
  ],
  questions: []
};

const PROG = JSON.parse(localStorage.getItem(LS_PROGRESS) || "{}");

/* ---------- Guardado ---------- */
function saveAll() {
  localStorage.setItem(LS_BANK, JSON.stringify(BANK));
  localStorage.setItem(LS_PROGRESS, JSON.stringify(PROG));
}

/* ---------- DOM raíz ---------- */
const app = document.getElementById("app");

/* ---------- Utilidades ---------- */
function subjectsFromBank() {
  // 🧹 Normalizador universal (quita emojis, tildes y deja minúsculas)
  const normalizeSlug = str =>
    str
      ? str.normalize("NFD").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase().trim()
      : "";

  const known = new Map((BANK.subjects || []).map(s => [normalizeSlug(s.slug), s]));

  (BANK.questions || []).forEach(q => {
    if (q && q.materia) {
      const slug = normalizeSlug(q.materia);
      if (!known.has(slug)) {
        known.set(slug, {
          slug: slug,
          name: q.materia
        });
      }
    }
  });

  return Array.from(known.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "es", { sensitivity: "base" })
  );
}

/* ---------- Carga automática de bancos (todas las materias) ---------- */
async function loadAllBanks() {
  // 🧩 Usa todos los slugs definidos en BANK.subjects
  const materias = BANK.subjects.map(s => s.slug);

  const existingIds = new Set(BANK.questions.map(q => q.id));
  let totalNuevas = 0;

  // 🔢 Indicador visual
  let loader = document.getElementById("bankLoader");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "bankLoader";
    loader.style = "position:fixed;bottom:10px;left:10px;background:#1e40af;color:white;padding:8px 12px;border-radius:6px;font-size:13px;z-index:9999;";
    loader.textContent = "⏳ Cargando bancos...";
    document.body.appendChild(loader);
  }

  const normalizeMateria = str =>
    str
      ? str.normalize("NFD").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase().trim()
      : "";

  for (const materia of materias) {
    for (let i = 1; i <= 4; i++) {
      const ruta = `../bancos/${materia}/${materia}${i}.json`;
      try {
        const resp = await fetch(ruta);
        if (!resp.ok) continue;
        const data = await resp.json();

        // 🔹 Normaliza materia de cada pregunta
        data.forEach(q => {
          if (q.materia) q.materia = normalizeMateria(q.materia);
        });

        const nuevas = data.filter(q => !existingIds.has(q.id));
        if (nuevas.length > 0) {
          nuevas.forEach(q => existingIds.add(q.id));
          BANK.questions.push(...nuevas);
          totalNuevas += nuevas.length;
          console.log(`📘 Cargado ${ruta} (${nuevas.length} nuevas en ${materia})`);
        }
      } catch (err) {
        console.warn(`⚠️ No se pudo cargar ${ruta}`);
      }
    }
  }

  loader.textContent = totalNuevas > 0
    ? `✅ ${totalNuevas} preguntas nuevas cargadas`
    : "ℹ️ No hay nuevas preguntas";
  setTimeout(() => loader.remove(), 2500);

  if (totalNuevas > 0) saveAll();
}

/* ---------- Botón temporal para recargar bancos ---------- */
function addUpdateButton() {
  const btn = document.createElement("button");
  btn.textContent = "🔄 Actualizar bancos manualmente";
  btn.style = `
    position:fixed;bottom:15px;right:15px;
    background:#1e40af;color:white;border:none;
    padding:10px 14px;border-radius:8px;
    font-size:14px;z-index:9999;cursor:pointer;
    box-shadow:0 2px 6px rgba(0,0,0,0.3);
  `;
  btn.onclick = async () => {
    btn.textContent = "⏳ Actualizando...";
    btn.disabled = true;
    await loadAllBanks();
    btn.textContent = "✅ Bancos actualizados";
    setTimeout(() => {
      btn.textContent = "🔄 Actualizar bancos manualmente";
      btn.disabled = false;
    }, 2000);
  };
  document.body.appendChild(btn);
}

// Esperar a que el DOM cargue y agregar botón
window.addEventListener("DOMContentLoaded", addUpdateButton);
