/* ==========================================================
   🌐 MEbank 3.0 — Banco TURBO (Stable + Embudo "Otras")
   ========================================================== */

/* ----------------------------------------------------------
   1. CONFIGURACIÓN (Tus listas oficiales)
   ---------------------------------------------------------- */

const SUBJECTS = [
  { slug: "neumonologia",       name: "🫁 Neumonología" },
  { slug: "psiquiatria",        name: "💭 Psiquiatría" },
  { slug: "cardiologia",        name: "🫀 Cardiología" },
  { slug: "nutricion",          name: "🍏 Nutrición" },
  { slug: "urologia",           name: "🚽 Urología" },
  { slug: "gastroenterologia",  name: "💩 Gastroenterología" },
  { slug: "dermatologia",       name: "🧴 Dermatología" },
  { slug: "infectologia",       name: "🦠 Infectología" },
  { slug: "reumatologia",       name: "💪 Reumatología" },
  { slug: "hematologia",        name: "🩸 Hematología" },
  { slug: "neurologia",         name: "🧠 Neurología" },
  { slug: "endocrinologia",     name: "🧪 Endocrinología" },
  { slug: "pediatria",          name: "🧸 Pediatría" },
  { slug: "oncologia",          name: "🎗️ Oncología" },
  { slug: "medicinafamiliar",   name: "👨‍👩‍👧‍👦 Medicina Familiar" },
  { slug: "ginecologia",        name: "🌸 Ginecología" },
  { slug: "obstetricia",        name: "🤰 Obstetricia" },
  { slug: "cirugiageneral",     name: "🔪 Cirugía General" },
  { slug: "traumatologia",      name: "🦴 Traumatología" },
  { slug: "oftalmologia",       name: "👁️ Oftalmología" },
  { slug: "otorrinolaringologia", name: "👂 Otorrinolaringología" },
  { slug: "neurocirugia",       name: "🧠 Neurocirugía" },
  { slug: "toxicologia",        name: "☠️ Toxicología" },
  { slug: "medicinalegal",      name: "⚖️ Medicina Legal" },
  { slug: "saludpublica",       name: "🏥 Salud Pública" },
  { slug: "imagenes",           name: "🩻 Diagnóstico por Imágenes" },
  { slug: "otras",              name: "📚 Otras" }
];

const SUBTEMAS = {
  cardiologia: [
    "Cardiología básica", "Hipertensión arterial y factores de riesgo", "Insuficiencia cardíaca",
    "Cardiopatía isquémica", "Trastornos del ritmo", "Síncope", "Valvulopatías", "Miocardiopatías",
    "Pericardio", "Aorta", "Enfermedad arterial periférica", "Venas y linfáticos", "Otras preguntas de cardiología"
  ],
  cirugiageneral: [
    "Evaluación prequirúrgica", "Quemaduras", "Cirugía mínimamente invasiva", "Glándulas salivales y masas cervicales",
    "Patología de pared abdominal", "Trasplante y procuración", "Otras preguntas de cirugía general"
  ],
  dermatologia: [
    "Generalidades", "Infecciosas", "Dermatología y sistémicas", "Oncología cutánea", "Eritemato-descamativas",
    "Ampollosas autoinmunes", "Glandulares / Urticaria / Angioedema", "Genodermatosis y facomatosis", "Otras preguntas de dermatología"
  ],
  endocrinologia: [
    "Hipotálamo / Hipófisis", "Tiroides", "Suprarrenales", "Urgencias endocrinas", "Desarrollo sexual", "Otras preguntas de endocrinología"
  ],
  gastroenterologia: [
    "Esófago", "Estómago", "Intestino delgado", "Hígado", "Vía biliar", "Páncreas", "Colon", "Cáncer colorrectal", "Otras preguntas de gastroenterología"
  ],
  ginecologia: [
    "Alteraciones menstruales", "Sangrado uterino anormal", "Climaterio y menopausia", "Síndrome de ovario poliquístico",
    "Infertilidad / Esterilidad / Reproducción asistida", "Anticoncepción", "Endometriosis", "Infecciones del tracto genital inferior",
    "EPI", "Prolapso e IU", "Patología benigna de mama", "Cáncer de mama", "Patología cervical benigna y preinvasora",
    "Cáncer de cuello uterino", "Patología benigna uterina", "Cáncer de endometrio", "Cáncer de ovario",
    "Vulva / Vagina / Cáncer de vulva", "Tumores benignos de ovario", "Otras preguntas de ginecología"
  ],
  hematologia: [
    "Anemias carenciales", "Anemias hemolíticas", "Otras anemias", "Insuficiencias medulares", "Leucemias agudas",
    "Mieloproliferativas crónicas", "Linfoproliferativas crónicas", "Linfomas", "Gamapatías monoclonales",
    "Trasplante hematopoyético", "Coagulación", "Terapia transfusional", "Otras preguntas de hematología"
  ],
  imagenes: [
    "Radiografía", "Tomografía", "Resonancia magnética", "Ecografía", "Otras preguntas de diagnóstico por imágenes"
  ],
  infectologia: [
    "Bacterias", "Antibacterianos", "Sepsis y nosocomiales", "Endocarditis", "SNC y meningitis", "TRS", "TRI – Neumonías",
    "Tuberculosis", "ITS", "Virus respiratorios / Influenza", "Virus no HIV", "HIV", "Hongos", "Inmunodeprimidos no HIV",
    "Tropicales", "Tracto digestivo", "Rickettsias / Bartonella / Coxiella / Leptospira", "Brucella / Nocardia / Actinomicosis",
    "Virus varios", "COVID-19", "Otras preguntas de infectología"
  ],
  medicinalegal: [
    "Sistema de salud", "Vigilancia epidemiológica", "Análisis de situación de salud", "Normativa nacional y jurisdiccional",
    "APS – Atención primaria de la salud", "Salud sexual y reproductiva"
  ],
  neurologia: [
    "ECV", "Convulsiones y epilepsia", "Desmielinizantes", "Trastornos del movimiento", "Cefaleas", "Metabólicas",
    "Encefalitis viral", "Neuropatías", "Placa motora", "Miopatías", "SNP", "Otras preguntas de neurología"
  ],
  neumonologia: [
    "Anatomía y malformaciones", "Semiología", "Asma", "EPOC", "Neumonía", "Bronquiectasias", "Fibrosis quística",
    "NPS y cáncer de pulmón", "Tromboembolia de pulmón", "Pleura, mediastino y diafragma", "Enfermedades intersticiales",
    "Ventilación y ventilación mecánica", "Otras preguntas de neumonología"
  ],
  neurocirugia: ["Neurocirugía"],
  nutricion: [
    "Diabetes mellitus", "Nutrición y obesidad", "Metabolismo lipídico", "Metabolismo calcio – PTH", "Hipoglucemias", "Otras preguntas de nutrición"
  ],
  obstetricia: [
    "Fisiología de la gestación", "Hemorragias del embarazo", "Screening gestacional", "Complicaciones maternas en el embarazo",
    "Amenazas de parto prematuro", "Rotura prematura de membranas", "Enfermedad hemolítica fetal", "Infecciones congénitas y perinatales",
    "Patología materna y gestación", "Embarazo múltiple", "Parto", "Embarazo prolongado e inducción", "Puerperio", "Lactancia",
    "Otras preguntas de obstetricia"
  ],
  oftalmologia: [
    "Introducción", "Conjuntiva", "Retina", "Neurooftalmología", "Uveítis", "Glaucoma", "Órbita", "Córnea y esclera",
    "Cristalino", "Párpados y vía lagrimal", "Refracción", "Estrabismo", "Toxicidad ocular", "Otras preguntas de oftalmología"
  ],
  oncologia: ["Oncología"],
  otorrinolaringologia: [
    "Oído", "Faringe", "Laringe", "Nariz", "Patología maxilofacial", "Otras preguntas de ORL"
  ],
  otras: ["Fármacos", "Otras"],
  pediatria: [
    "Neonatología", "Cardiopatías congénitas", "Desarrollo y nutrición", "Maltrato y abuso sexual", "Vacunación infantil",
    "Trastornos de la infancia y la adolescencia", "Síndromes asociados a anomalías cromosómicas", "Síndrome de muerte súbita del lactante",
    "Patología nefrourológica infantil", "Patología infecciosa infantil", "Patología del aparato respiratorio",
    "Patología del aparato digestivo", "Hematología infantil", "Intoxicaciones", "Oncohematología infantil", "Otras preguntas de pediatría"
  ],
  psiquiatria: [
    "Trastornos neuróticos y de la personalidad", "Trastornos del estado de ánimo", "Trastornos psicóticos",
    "Trastornos relacionados con sustancias", "Trastornos de la conducta alimentaria", "Otras preguntas de psiquiatría"
  ],
  reumatologia: [
    "Cristales", "Vasculitis", "Artritis reumatoide", "Espondiloartropatías", "LES y SAF", "Metabólica ósea",
    "Artritis infecciosa", "AIJ", "Artrosis", "Otras artropatías", "Otras enfermedades reumatológicas", "Amiloidosis",
    "Otras preguntas de reumatología"
  ],
  saludpublica: [
    "Introducción a la epidemiología", "Introducción a la estadística", "Estadística descriptiva", "Estadística inferencial",
    "Medidas epidemiológicas de frecuencia", "Análisis de asociación", "Tipos de estudios epidemiológicos", "Validez y fiabilidad",
    "Evaluación de pruebas diagnósticas", "Medicina basada en la evidencia", "Datos de nuestro país", "Otras preguntas de salud pública"
  ],
  toxicologia: ["Toxicología"],
  traumatologia: [
    "Fracturas", "Miembro superior", "Miembro inferior", "Tumores músculo-esqueléticos", "Columna vertebral", "Otras preguntas de traumatología"
  ],
  urologia: [
    "Fisiología renal", "Síndromes clínicos", "Fracaso renal agudo", "Insuficiencia renal crónica", "Glomerulonefritis primaria",
    "Nefritis intersticial", "Tubulopatías", "Riesgo cardiovascular y riñón", "Infecciones urinarias", "Riñón y enfermedades sistémicas",
    "Otras preguntas de urología"
  ],
  medicinafamiliar: ["General"]
};

// META DATA EXÁMENES
const EXAMENES_META = [
  ...[2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025].map(y => ({
    id: `examen_unico_${y}`, grupo: "Examen Único", anio: y, file: `bancos/examenes/examen_unico_${y}.json`,
  }))
];

/* ----------------------------------------------------------
   2. PROGRESO Y UTILS
   ---------------------------------------------------------- */
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

function normalize(s) {
  return s ? String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\p{Emoji}\p{Extended_Pictographic}]/gu, "").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase() : "";
}

function normalizeId(id) {
  return id ? String(id).trim() : `gen_${Math.random().toString(36).slice(2)}`;
}

/* ----------------------------------------------------------
   3. ESTRUCTURA PRINCIPAL
   ---------------------------------------------------------- */
let BANK = {
  subjects: SUBJECTS,
  subsubjects: SUBTEMAS,
  questions: [],
  loaded: false
};

/* ----------------------------------------------------------
   4. CARGA TURBO
   ---------------------------------------------------------- */
async function loadAllBanks() {
  console.time("⏱ Tiempo de carga");
  const appMsg = document.querySelector("#app div"); 
  if(appMsg) appMsg.textContent = "🚀 Cargando banco completo...";

  const urls = [];

  // A) Materias 
  BANK.subjects.forEach(subj => {
    for (let i = 1; i <= 20; i++) { 
      urls.push({
        url: `bancos/${subj.slug}/${subj.slug}${i}.json`,
        type: "materia",
        meta: subj
      });
    }
  });

  // B) Exámenes
  EXAMENES_META.forEach(ex => {
      urls.push({
        url: ex.file,
        type: "examen",
        meta: ex
      });
  });

  const results = await Promise.allSettled(
    urls.map(item => fetch(item.url).then(r => {
      if (!r.ok) throw new Error("404");
      return r.json().then(data => ({ data, type: item.type, meta: item.meta }));
    }))
  );

  let allQuestions = [];
  let successCount = 0;

  results.forEach(res => {
    if (res.status === "fulfilled") {
      const { data, type, meta } = res.value;
      if (Array.isArray(data)) {
        successCount++;
        data.forEach(q => {
            processQuestion(q, type, meta);
            allQuestions.push(q);
        });
      }
    }
  });

  BANK.questions = dedupeQuestionsById(allQuestions);
  BANK.loaded = true;

  console.timeEnd("⏱ Tiempo de carga");
  console.log(`✅ Carga finalizada: ${successCount} archivos. ${BANK.questions.length} preguntas.`);

  if(appMsg) appMsg.textContent = "✔ Banco listo.";
  if(typeof renderHome === "function") renderHome();
}

/* ----------------------------------------------------------
   5. PROCESADOR DE PREGUNTA (CON EL EMBUDO "OTRAS")
   ---------------------------------------------------------- */
function processQuestion(q, type, examMeta) {
    q.id = normalizeId(q.id);
    
    // 1. Materia (Array o String)
    if (Array.isArray(q.materia)) {
        q.materia = q.materia.map(m => normalize(m));
    } else {
        let mat = normalize(q.materia || "otras");
        if (!BANK.subjects.some(s => s.slug === mat)) mat = "otras";
        q.materia = mat;
    }

    // 2. Submateria (El Embudo Mágico)
    // Definimos la materia principal para buscar la lista válida
    const mainMateria = Array.isArray(q.materia) ? q.materia[0] : q.materia;
    const listaOficial = BANK.subsubjects[mainMateria] || [];

    // Obtenemos el subtema crudo del JSON
    let subRaw = Array.isArray(q.submateria) ? q.submateria[0] : q.submateria;
    if (!subRaw) subRaw = "";

    // Si está en la lista oficial (exacto), se queda.
    if (listaOficial.includes(subRaw)) {
        q.submateria = subRaw;
    } else {
        // Si NO está en la lista (ej: dice "Infarto"), lo mandamos al ÚLTIMO ítem de la lista.
        // El último ítem en tu config siempre es "Otras preguntas de..."
        if (listaOficial.length > 0) {
            q.submateria = listaOficial[listaOficial.length - 1]; 
        } else {
            q.submateria = "General"; // Fallback
        }
    }

    // 3. Opciones y Correcta
    q.opciones = getOpcionesArray(q);
    q.correcta = getCorrectIndex(q);

    // 4. Metadatos
    q.tipo = type;
    if (type === "examen" && examMeta) {
        q.examen = examMeta.id;
        q.anio = examMeta.anio;
    } else {
        q.examen = null;
    }
}

/* ----------------------------------------------------------
   6. HELPERS & APIS
   ---------------------------------------------------------- */
function dedupeQuestionsById(list) {
  const map = new Map();
  list.forEach(q => {
      if(!q.id) return;
      if(!map.has(q.id)) map.set(q.id, q);
  });
  return Array.from(map.values());
}

function getOpcionesArray(q) {
  if (Array.isArray(q.opciones)) return q.opciones;
  if (q.opciones && typeof q.opciones === 'object') {
      return ["a","b","c","d","e"].map(k => q.opciones[k]).filter(v=>v);
  }
  return [];
}

function getCorrectIndex(q) {
  if (typeof q.correcta === 'number') return q.correcta;
  if (typeof q.correcta === 'string') {
      const map = {a:0, b:1, c:2, d:3, e:4};
      return map[q.correcta.trim().toLowerCase()] ?? -1;
  }
  return -1;
}

// APIs Híbridas
function getQuestionsByMateria(slug, subs) {
    return BANK.questions.filter(q => {
        const esDeLaMateria = Array.isArray(q.materia) 
            ? q.materia.includes(slug) 
            : q.materia === slug;
        
        if (!esDeLaMateria) return false;

        // Como ya pasamos por el embudo, la comparación es exacta
        if (subs && subs.length) return subs.includes(q.submateria);
        return true;
    });
}

function getQuestionsByExamen(id) {
    return BANK.questions.filter(q => q.examen === id);
}

function getQuestionById(id) {
    return BANK.questions.find(q => q.id === id);
}
