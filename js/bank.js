/* ---------- Persistencia ---------- */
const LS_BANK = "mebank_bank_v6_full",
      LS_PROGRESS = "mebank_prog_v6_full";

let BANK = JSON.parse(localStorage.getItem(LS_BANK) || "null") || {
  subjects: [
    {slug:"neumonologia", name:"🫁 Neumonología"},
    {slug:"psiquiatria", name:"🧠💭 Psiquiatría"},
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
  questions: [] // se cargan automáticamente desde /bancos/
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
  const known = new Map((BANK.subjects || []).map(s => [s.slug, s]));
  (BANK.questions || []).forEach(q => {
    if (q && q.materia && !known.has(q.materia)) {
      known.set(q.materia, {
        slug: q.materia,
        name: q.materia[0].toUpperCase() + q.materia.slice(1)
      });
    }
  });
  return Array.from(known.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/* ---------- Carga automática de bancos ---------- */
(async function loadAllBanks() {
  const materias = BANK.subjects.map(s => s.slug);
  const existingIds = new Set(BANK.questions.map(q => q.id));
  let totalNuevas = 0;

  for (const materia of materias) {
    for (let i = 1; i <= 4; i++) {
      const ruta = `../bancos/${materia}/${materia}${i}.json`;
      try {
        const resp = await fetch(ruta);
        if (!resp.ok) continue;
        const data = await resp.json();
        const nuevas = data.filter(q => !existingIds.has(q.id));
        if (nuevas.length > 0) {
          nuevas.forEach(q => existingIds.add(q.id));
          BANK.questions.push(...nuevas);
          totalNuevas += nuevas.length;
          console.log(`📘 Cargado ${ruta} (${nuevas.length} nuevas en ${materia})`);
        }
      } catch (err) {
        // No mostrar error si el archivo no existe
      }
    }
  }

  if (totalNuevas > 0) {
    saveAll();
    console.log(`✅ Bancos actualizados (${totalNuevas} preguntas nuevas en total)`);
  } else {
    console.log("ℹ️ No se encontraron nuevos bancos o ya estaban cargados.");
  }
})();
