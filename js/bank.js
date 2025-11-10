/* ==========================================================
   💾 BANK.JS – Carga global de bancos de preguntas
   Carga todas las materias y los exámenes anteriores (2016–2025)
   ========================================================== */

window.BANK = { questions: [] };

/**
 * Carga todos los bancos disponibles (materias + exámenes anteriores)
 * y los almacena en BANK.questions
 */
async function loadAllBanks() {
  window.BANK.questions = [];

  // ==========================================================
  // 🧩 1️⃣ Materias oficiales del sistema MEbank
  // ==========================================================
  const materias = [
    "neumonologia",
    "psiquiatria",
    "cardiologia",
    "nutricion",
    "urologia",
    "gastroenterologia",
    "dermatologia",
    "infectologia",
    "reumatologia",
    "hematologia",
    "neurologia",
    "endocrinologia",
    "pediatria",
    "oncologia",
    "medicinafamiliar",
    "ginecologia",
    "obstetricia",
    "cirugiageneral",
    "traumatologia",
    "oftalmologia",
    "otorrinolaringologia",
    "neurocirugia",
    "toxicologia",
    "saludpublica",
    "medicinalegal",
    "imagenes",
    "otras"
  ];

  // Cargar los bancos por materia (p. ej. bancos/pediatria/pediatria1.json)
  for (const m of materias) {
    try {
      // puede haber varios archivos (pediatria1.json, pediatria2.json, etc.)
      let subindex = 1;
      let cargados = 0;
      while (true) {
        const path = `bancos/${m}/${m}${subindex}.json`;
        const resp = await fetch(path);
        if (!resp.ok) break;
        const data = await resp.json();
        if (Array.isArray(data) && data.length) {
          BANK.questions.push(...data);
          cargados += data.length;
        }
        subindex++;
      }
      if (cargados) console.log(`📘 ${m}: ${cargados} preguntas cargadas`);
    } catch (err) {
      console.warn(`⚠️ No se pudo cargar banco de ${m}:`, err);
    }
  }

  // ==========================================================
  // 📄 2️⃣ Exámenes anteriores (2016–2025)
  // ==========================================================
  const examenes = [
    "examenunico2025",
    "examenunico2024",
    "examenunico2023",
    "examenunico2022",
    "examenunico2021",
    "examenunico2020",
    "examenunico2019",
    "examenunico2018",
    "examenunico2017",
    "examenunico2016"
  ];

  for (const ex of examenes) {
    try {
      const resp = await fetch(`bancos/anteriores/${ex}.json`);
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data)) {
          BANK.questions.push(...data);
          console.log(`🧾 ${ex}: ${data.length} preguntas cargadas`);
        }
      }
    } catch (err) {
      console.warn(`⚠️ No se pudo cargar ${ex}:`, err);
    }
  }

  // ==========================================================
  // ✅ Resultado final
  // ==========================================================
  console.log(`✅ Total global: ${BANK.questions.length} preguntas cargadas`);
  return BANK;
}

/* ==========================================================
   ♻️ Funciones auxiliares de recarga
   ========================================================== */

async function forceReloadBank() {
  localStorage.clear();
  alert("♻️ Recargando bancos completos...");
  await loadAllBanks();
  alert(`✅ Bancos recargados: ${BANK.questions.length} preguntas`);
}

/* ==========================================================
   🧠 Acceso auxiliar
   ========================================================== */

// Devuelve lista única de materias según BANK.questions
function subjectsFromBank() {
  if (!BANK.questions?.length) return [];
  const map = {};
  for (const q of BANK.questions) {
    if (q.materia && !map[q.materia]) {
      map[q.materia] = true;
    }
  }
  return Object.keys(map).map(slug => ({
    slug,
    name: slug.charAt(0).toUpperCase() + slug.slice(1)
  }));
}

// Exportar al ámbito global
window.loadAllBanks = loadAllBanks;
window.forceReloadBank = forceReloadBank;
window.subjectsFromBank = subjectsFromBank;
