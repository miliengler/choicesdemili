/* ==========================================================
   💾 BANCO DE PREGUNTAS – Persistencia, carga y actualización
   Versión FULL con SUBTEMAS + INDEX transversal
   ========================================================== */
window.addEventListener("error", function(e) {
  alert(
    "🔥 ERROR EN LA APP\n\n" +
    "Mensaje: " + e.message + "\n" +
    "Archivo: " + (e.filename || "desconocido") + "\n" +
    "Línea: " + (e.lineno || "?") + "\n" +
    "Columna: " + (e.colno || "?")
  );
});
const LS_BANK = "mebank_bank_v7_full";
const LS_PROGRESS = "mebank_prog_v7_full";

/* ==========================================================
   ✨ Normalizador universal de textos
   (quita emojis, tildes, mayúsculas, símbolos)
   ========================================================== */
function normalizeString(str) {
  return str
    ? str
        .normalize("NFD")
        .replace(/[\p{Emoji_Presentation}\p{Emoji}\p{Extended_Pictographic}]/gu, "")
        .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]/g, "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "")
        .trim()
    : "";
}

/* ==========================================================
   📚 SUBTEMAS POR MATERIA — ORDENADOS ALFABÉTICAMENTE
   ========================================================== */

const SUBTEMAS = {
  cardiologia: [
    "Cardiología básica",
    "Hipertensión arterial y factores de riesgo",
    "Insuficiencia cardíaca",
    "Cardiopatía isquémica",
    "Trastornos del ritmo",
    "Síncope",
    "Valvulopatías",
    "Miocardiopatías",
    "Pericardio",
    "Aorta",
    "Enfermedad arterial periférica",
    "Venas y linfáticos",
    "Otras preguntas de cardiología"
  ],

  cirugiageneral: [
    "Evaluación prequirúrgica",
    "Quemaduras",
    "Cirugía mínimamente invasiva",
    "Glándulas salivales y masas cervicales",
    "Patología de pared abdominal",
    "Trasplante y procuración",
    "Otras preguntas de cirugía general"
  ],

  dermatologia: [
    "Generalidades",
    "Infecciosas",
    "Dermatología y sistémicas",
    "Oncología cutánea",
    "Eritemato-descamativas",
    "Ampollosas autoinmunes",
    "Glandulares / Urticaria / Angioedema",
    "Genodermatosis y facomatosis",
    "Otras preguntas de dermatología"
  ],

  endocrinologia: [
    "Hipotálamo / Hipófisis",
    "Tiroides",
    "Suprarrenales",
    "Urgencias endocrinas",
    "Desarrollo sexual",
    "Otras preguntas de endocrinología"
  ],

  gastroenterologia: [
    "Esófago",
    "Estómago",
    "Intestino delgado",
    "Hígado",
    "Vía biliar",
    "Páncreas",
    "Colon",
    "Cáncer colorrectal",
    "Otras preguntas de gastroenterología"
  ],

  ginecologia: [
    "Alteraciones menstruales",
    "Sangrado uterino anormal",
    "Climaterio y menopausia",
    "Síndrome de ovario poliquístico",
    "Infertilidad / Esterilidad / Reproducción asistida",
    "Anticoncepción",
    "Endometriosis",
    "Infecciones del tracto genital inferior",
    "EPI",
    "Prolapso e IU",
    "Patología benigna de mama",
    "Cáncer de mama",
    "Patología cervical benigna y preinvasora",
    "Cáncer de cuello uterino",
    "Patología benigna uterina",
    "Cáncer de endometrio",
    "Cáncer de ovario",
    "Vulva / Vagina / Cáncer de vulva",
    "Tumores benignos de ovario",
    "Otras preguntas de ginecología"
  ],

  hematologia: [
    "Anemias carenciales",
    "Anemias hemolíticas",
    "Otras anemias",
    "Insuficiencias medulares",
    "Leucemias agudas",
    "Mieloproliferativas crónicas",
    "Linfoproliferativas crónicas",
    "Linfomas",
    "Gamapatías monoclonales",
    "Trasplante hematopoyético",
    "Coagulación",
    "Terapia transfusional",
    "Otras preguntas de hematología"
  ],

  imagenes: [
    "Radiografía",
    "Tomografía",
    "Resonancia magnética",
    "Ecografía",
    "Otras preguntas de diagnóstico por imágenes"
  ],

  infectologia: [
    "Bacterias",
    "Antibacterianos",
    "Sepsis y nosocomiales",
    "Endocarditis",
    "SNC y meningitis",
    "TRS",
    "TRI – Neumonías",
    "Tuberculosis",
    "ITS",
    "Virus respiratorios / Influenza",
    "Virus no HIV",
    "HIV",
    "Hongos",
    "Inmunodeprimidos no HIV",
    "Tropicales",
    "Tracto digestivo",
    "Rickettsias / Bartonella / Coxiella / Leptospira",
    "Brucella / Nocardia / Actinomicosis",
    "Virus varios",
    "COVID-19",
    "Otras preguntas de infectología"
  ],

  medicinafamiliar: [
    "Atención primaria",
    "Promoción y prevención",
    "Abordaje integral",
    "Crónicos y multimorbilidad",
    "Otras preguntas de medicina familiar"
  ],

  medicinalegal: [
    "Sistema de salud",
    "Vigilancia epidemiológica",
    "Análisis de situación de salud",
    "Normativa nacional y jurisdiccional",
    "APS – Atención primaria de la salud",
    "Salud sexual y reproductiva"
  ],

  neurologia: [
    "ECV",
    "Convulsiones y epilepsia",
    "Desmielinizantes",
    "Trastornos del movimiento",
    "Cefaleas",
    "Metabólicas",
    "Encefalitis viral",
    "Neuropatías",
    "Placa motora",
    "Miopatías",
    "SNP",
    "Otras preguntas de neurología"
  ],

  neurocirugia: [
    "Neurocirugía"
  ],

  neumonologia: [
    "Anatomía y malformaciones",
    "Semiología",
    "Asma",
    "EPOC",
    "Neumonía",
    "Bronquiectasias",
    "Fibrosis quística",
    "NPS y cáncer de pulmón",
    "Tromboembolia de pulmón",
    "Pleura, mediastino y diafragma",
    "Enfermedades intersticiales",
    "Ventilación y ventilación mecánica",
    "Otras preguntas de neumonología"
  ],

  nutricion: [
    "Diabetes mellitus",
    "Nutrición y obesidad",
    "Metabolismo lipídico",
    "Metabolismo calcio – PTH",
    "Hipoglucemias",
    "Otras preguntas de nutrición"
  ],

  oftalmologia: [
    "Introducción",
    "Conjuntiva",
    "Retina",
    "Neurooftalmología",
    "Uveítis",
    "Glaucoma",
    "Órbita",
    "Córnea y esclera",
    "Cristalino",
    "Párpados y vía lagrimal",
    "Refracción",
    "Estrabismo",
    "Toxicidad ocular",
    "Otras preguntas de oftalmología"
  ],

  oncologia: [
    "Introducción",
    "Oncología de órganos",
    "Hemato-oncología",
    "Tratamientos",
    "Cuidados paliativos",
    "Otras preguntas de oncología"
  ],

  obstetricia: [
    "Fisiología de la gestación",
    "Hemorragias del embarazo",
    "Screening gestacional",
    "Complicaciones maternas",
    "Amenaza de parto prematuro",
    "RPM",
    "EHRN e isoinmunización Rh",
    "Infecciones congénitas",
    "Patología materna y gestación",
    "Embarazo múltiple",
    "Parto",
    "Embarazo prolongado e inducción",
    "Puerperio",
    "Lactancia",
    "Otras preguntas de obstetricia"
  ],

  otorrinolaringologia: [
    "Oído",
    "Faringe",
    "Laringe",
    "Nariz",
    "Patología maxilofacial",
    "Otras preguntas de ORL"
  ],

  otras: [
    "Fármacos",
    "Otras"
  ],

  pediatria: [
    "Neonatología",
    "Cardiopatías congénitas",
    "Desarrollo y nutrición",
    "Maltrato y abuso sexual",
    "Vacunación infantil",
    "Trastornos de la infancia y adolescencia",
    "Síndromes y anomalías cromosómicas",
    "Muerte súbita del lactante",
    "Patología nefro-urológica",
    "Patología infecciosa",
    "Patología respiratoria",
    "Patología digestiva",
    "Púrpuras y anemias",
    "Intoxicaciones",
    "Oncohematología infantil",
    "Otras preguntas de pediatría"
  ],

  psiquiatria: [
    "Trastornos neuróticos y de la personalidad",
    "Trastornos del estado de ánimo",
    "Trastornos psicóticos",
    "Trastornos relacionados con sustancias",
    "Trastornos de la conducta alimentaria",
    "Otras preguntas de psiquiatría"
  ],

  reumatologia: [
    "Cristales",
    "Vasculitis",
    "Artritis reumatoide",
    "Espondiloartropatías",
    "LES y SAF",
    "Metabólica ósea",
    "Artritis infecciosa",
    "AIJ",
    "Artrosis",
    "Otras artropatías",
    "Otras enfermedades reumatológicas",
    "Amiloidosis",
    "Otras preguntas de reumatología"
  ],

  saludpublica: [
    "Introducción a la epidemiología",
    "Introducción a la estadística",
    "Estadística descriptiva",
    "Estadística inferencial",
    "Medidas epidemiológicas de frecuencia",
    "Análisis de asociación",
    "Tipos de estudios epidemiológicos",
    "Validez y fiabilidad",
    "Evaluación de pruebas diagnósticas",
    "Medicina basada en la evidencia",
    "Datos de nuestro país",
    "Otras preguntas de salud pública"
  ],

  toxicologia: [
    "Toxicología"
  ],

  traumatologia: [
    "Fracturas",
    "Miembro superior",
    "Miembro inferior",
    "Tumores músculo-esqueléticos",
    "Columna vertebral",
    "Otras preguntas de traumatología"
  ],

  urologia: [
    "Fisiología renal",
    "Síndromes clínicos",
    "Fracaso renal agudo",
    "Insuficiencia renal crónica",
    "Glomerulonefritis primaria",
    "Nefritis intersticial",
    "Tubulopatías",
    "Riesgo cardiovascular y riñón",
    "Infecciones urinarias",
    "Riñón y enfermedades sistémicas",
    "Otras preguntas de urología"
  ]
};

/* ==========================================================
   🧩 Normalizador de submaterias
   (evita mezclar “otras” entre materias)
   ========================================================== */
function normalizarSubmateria(materia, submateria) {
  const s = normalizeString(submateria);
  const m = normalizeString(materia);
  if (["otras", "miscelaneas", "varias", "otros"].includes(s)) {
    return `otras_${m}`;
  }
  return s || "sinclasificar";
}

/* ==========================================================
   🧠 Banco base
   ========================================================== */
let BANK = JSON.parse(localStorage.getItem(LS_BANK) || "null") || {
  subjects: [
    { slug: "cardiologia",          name: "🫀 Cardiología" },
    { slug: "cirugiageneral",       name: "🔪 Cirugía General" },
    { slug: "dermatologia",         name: "🧴 Dermatología" },
    { slug: "endocrinologia",       name: "🧪 Endocrinología" },
    { slug: "gastroenterologia",    name: "💩 Gastroenterología" },
    { slug: "ginecologia",          name: "🌸 Ginecología" },
    { slug: "hematologia",          name: "🩸 Hematología" },
    { slug: "imagenes",             name: "🩻 Diagnóstico por Imágenes" },
    { slug: "infectologia",         name: "🦠 Infectología" },
    { slug: "medicinafamiliar",     name: "👨‍👩‍👧‍👦 Medicina Familiar" },
    { slug: "medicinalegal",        name: "⚖️ Medicina Legal" },
    { slug: "neurologia",           name: "🧠 Neurología" },
    { slug: "neurocirugia",         name: "🧠 Neurocirugía" },
    { slug: "neumonologia",         name: "🫁 Neumonología" },
    { slug: "nutricion",            name: "🍏 Nutrición" },
    { slug: "oftalmologia",         name: "👁️ Oftalmología" },
    { slug: "oncologia",            name: "🎗️ Oncología" },
    { slug: "obstetricia",          name: "🤰 Obstetricia" },
    { slug: "otorrinolaringologia", name: "👂 Otorrinolaringología" },
    { slug: "otras",                name: "📚 Otras" },
    { slug: "pediatria",            name: "🧸 Pediatría" },
    { slug: "psiquiatria",          name: "💭 Psiquiatría" },
    { slug: "reumatologia",         name: "💪 Reumatología" },
    { slug: "saludpublica",         name: "🏥 Salud Pública" },
    { slug: "toxicologia",          name: "☠️ Toxicología" },
    { slug: "traumatologia",        name: "🦴 Traumatología" },
    { slug: "urologia",             name: "🚽 Urología" }
  ],
  questions: [],
  index: {}
};

let PROG = JSON.parse(localStorage.getItem(LS_PROGRESS) || "{}");

/* ==========================================================
   💾 Guardado
   ========================================================== */
function saveAll() {
  localStorage.setItem(LS_BANK, JSON.stringify(BANK));
  localStorage.setItem(LS_PROGRESS, JSON.stringify(PROG));
}

/* ==========================================================
   📘 Materias derivadas
   ========================================================== */
function subjectsFromBank() {
  return [...BANK.subjects].sort((a, b) =>
    normalizeString(a.name).localeCompare(normalizeString(b.name), "es", {
      sensitivity: "base"
    })
  );
}

/* ==========================================================
   💬 Loader visual pequeñito
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
  if (!el) return;
  el.textContent = total > 0
    ? `✅ ${total} nuevas preguntas cargadas`
    : "✅ Bancos actualizados (sin cambios)";
  setTimeout(() => el.remove(), 2500);
}

/* ==========================================================
   🌐 Carga total bancos + exámenes anteriores
   ========================================================== */
async function loadAllBanks() {
  const loader = showLoader("⏳ Cargando bancos...");
  const existingIds = new Set(BANK.questions.map(q => q.id));
  let totalNuevas = 0;

  BANK.index = {};

  const normalizarMateria = (nombre) => {
    if (!nombre) return "";
    const limpio = normalizeString(nombre);
    const match = BANK.subjects.find(s => normalizeString(s.slug) === limpio);
    return match ? match.slug : limpio;
  };

  try {
    /* ---------- 1️⃣ Bancos por materia ---------- */
    for (const s of BANK.subjects) {
      const materia = s.slug;

      // soporte hasta 20 archivos por materia: materia1.json ... materia20.json
      for (let i = 1; i <= 20; i++) {
        const ruta = `bancos/${materia}/${materia}${i}.json`;
        try {
          const resp = await fetch(ruta);
          if (!resp.ok) break; // si no existe este, asumimos que no hay más

          const data = await resp.json();

          data.forEach(q => {
            q.tipo = q.tipo || "banco";
            q.materia = normalizarMateria(q.materia || materia);
            q.submateria = normalizarSubmateria(q.materia, q.submateria);

            if (!BANK.index[q.materia]) BANK.index[q.materia] = {};
            if (!BANK.index[q.materia][q.submateria])
              BANK.index[q.materia][q.submateria] = [];

            BANK.index[q.materia][q.submateria].push(q);
          });

          const nuevas = data.filter(q => !existingIds.has(q.id));
          nuevas.forEach(q => existingIds.add(q.id));
          BANK.questions.push(...nuevas);
          totalNuevas += nuevas.length;

          console.log(`📘 Cargado banco: ${ruta} (${nuevas.length} nuevas)`);
        } catch (err) {
          console.warn(`⚠️ Error leyendo ${ruta}`, err);
          break;
        }
      }
    }

    /* ---------- 2️⃣ Exámenes anteriores (oficiales públicos) ---------- */
    const EXAM_SOURCES = [
      {
        key: "examenunico",
        base: "bancos/anteriores/examenunico",
        prefix: "examen_unico_",
        years: [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013]
      },
      {
        key: "uba",
        base: "bancos/anteriores/uba",
        prefix: "uba_",
        years: [2017, 2016]
      },
      {
        key: "caba",
        base: "bancos/anteriores/caba",
        prefix: "caba_",
        years: [2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010]
      },
      {
        key: "pcia_ba",
        base: "bancos/anteriores/pcia_ba",
        prefix: "pciba_",
        years: [2016, 2015, 2014, 2013, 2012, 2011, 2010]
      }
    ];

    for (const src of EXAM_SOURCES) {
      for (const year of src.years) {
        const ruta = `${src.base}/${src.prefix}${year}.json`;
        try {
          const resp = await fetch(ruta);
          if (!resp.ok) {
            // si no existe, seguimos con el siguiente año
            continue;
          }

          const data = await resp.json();

          data.forEach(q => {
            q.tipo = q.tipo || "examen";
            q.categoria_examen = src.key; // examenunico / uba / caba / pcia_ba
            q.materia = normalizarMateria(q.materia);
            q.submateria = normalizarSubmateria(q.materia, q.submateria);

            if (!BANK.index[q.materia]) BANK.index[q.materia] = {};
            if (!BANK.index[q.materia][q.submateria])
              BANK.index[q.materia][q.submateria] = [];

            BANK.index[q.materia][q.submateria].push(q);
          });

          const nuevas = data.filter(q => !existingIds.has(q.id));
          nuevas.forEach(q => existingIds.add(q.id));
          BANK.questions.push(...nuevas);
          totalNuevas += nuevas.length;

          console.log(`📄 Cargado examen: ${ruta} (${nuevas.length} nuevas)`);
        } catch (err) {
          console.warn(`⚠️ Error leyendo examen ${ruta}`, err);
        }
      }
    }

    /* ---------- 3️⃣ Exámenes anteriores privados ---------- */
    const PRIVADOS_INSTITUCIONES = [
      "austral",
      "italiano",
      "fleni",
      "favaloro",
      "cemic",
      "britanico"
    ];

    for (const inst of PRIVADOS_INSTITUCIONES) {
      for (let year = 2010; year <= 2025; year++) {
        const ruta = `bancos/anteriores/privados/${inst}/${inst}_${year}.json`;
        try {
          const resp = await fetch(ruta);
          if (!resp.ok) continue;

          const data = await resp.json();

          data.forEach(q => {
            q.tipo = q.tipo || "examen_privado";
            q.categoria_examen = "privado";
            q.institucion = inst;
            q.materia = normalizarMateria(q.materia);
            q.submateria = normalizarSubmateria(q.materia, q.submateria);

            if (!BANK.index[q.materia]) BANK.index[q.materia] = {};
            if (!BANK.index[q.materia][q.submateria])
              BANK.index[q.materia][q.submateria] = [];

            BANK.index[q.materia][q.submateria].push(q);
          });

          const nuevas = data.filter(q => !existingIds.has(q.id));
          nuevas.forEach(q => existingIds.add(q.id));
          BANK.questions.push(...nuevas);
          totalNuevas += nuevas.length;

          console.log(`🏥 Cargado examen privado: ${ruta} (${nuevas.length} nuevas)`);
        } catch (err) {
          console.warn(`⚠️ Error leyendo examen privado ${ruta}`, err);
        }
      }
    }

    if (totalNuevas > 0) {
      saveAll();
    }
  } finally {
    hideLoader(loader, totalNuevas);
  }
}

/* ==========================================================
   ⚙️ Carga inicial
   ========================================================== */
window.addEventListener("DOMContentLoaded", async () => {
  try {
    if (!BANK.questions.length) {
      await loadAllBanks();
      console.log(`✅ Banco inicial cargado: ${BANK.questions.length} preguntas`);
    }
  } catch (err) {
    console.error("❌ Error en loadAllBanks:", err);
    alert("❌ Error al cargar bancos.\nRevisá la consola o recargá la página.");
  }
});

/* ==========================================================
   ♻️ Recarga completa
   ========================================================== */
async function forceReloadBank() {
  if (!confirm("¿Recargar bancos? Se borrarán los datos locales.")) return;

  localStorage.removeItem(LS_BANK);
  localStorage.removeItem(LS_PROGRESS);

  BANK.questions = [];
  BANK.index = {};
  PROG = {};

  await loadAllBanks();
  saveAll();

  alert(`Banco recargado: ${BANK.questions.length} preguntas`);
}
