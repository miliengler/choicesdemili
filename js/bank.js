/* ---------- Persistencia ---------- */
const LS_BANK = "mebank_bank_v6_2", 
      LS_PROGRESS = "mebank_prog_v6_2";

let BANK = JSON.parse(localStorage.getItem(LS_BANK) || "null") || {
  subjects: [
    { slug: "pediatria", name: "🧸 Pediatría" },
    { slug: "obstetricia", name: "🤰 Obstetricia" },
    { slug: "infectologia", name: "🦠 Infectología" }
  ],
  questions: [
    // 👇 ejemplos iniciales; luego se agregan los JSON externos
    {
      id: "PE-001",
      materia: "pediatria",
      subtema: "Bronquiolitis",
      enunciado: "Lactante con bronquiolitis leve. Conducta inicial:",
      opciones: ["Broncodilatador", "Corticoides", "Oxígeno según SatO2", "Antibióticos"],
      correcta: 2,
      explicacion: "Soporte: O2 si SatO2 baja; no corticoides de rutina."
    },
    {
      id: "OB-001",
      materia: "obstetricia",
      subtema: "Controles prenatales",
      enunciado: "Gestante 12 semanas: ¿qué NO es del primer control?",
      opciones: ["Grupo y factor Rh", "Glucemia", "VDRL", "Urocultivo a las 28 semanas"],
      correcta: 3,
      explicacion: "El urocultivo de 28s no corresponde al primer control."
    }
  ]
};

const PROG = JSON.parse(localStorage.getItem(LS_PROGRESS) || "{}"); 
// estructura: {materia:{qid:{chosen,status}, _lastIndex:number}}

function saveAll() {
  localStorage.setItem(LS_BANK, JSON.stringify(BANK));
  localStorage.setItem(LS_PROGRESS, JSON.stringify(PROG));
}

/* ---------- DOM raíz de la app ---------- */
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

/* ---------- Importar banco externo (Pediatría) ---------- */
(async function loadExternalBanks() {
  try {
    // Importa el JSON desde la carpeta bancos/pediatria
    const resp = await fetch("../bancos/pediatria/pediatria1.json");
    if (!resp.ok) throw new Error("No se pudo cargar pediatria1.json");
    const data = await resp.json();

    // Mezcla con las preguntas ya existentes, evitando duplicadas
    const existingIds = new Set(BANK.questions.map(q => q.id));
    const nuevas = data.filter(q => !existingIds.has(q.id));

    BANK.questions.push(...nuevas);
    console.log(`✅ Banco Pediatría cargado (${nuevas.length} preguntas nuevas)`);

    // Guarda y refresca materias visibles
    saveAll();
  } catch (err) {
    console.error("Error cargando banco de Pediatría:", err);
  }
})();
