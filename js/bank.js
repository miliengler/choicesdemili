/* ==========================================================
   🏦 BANK.JS – Gestión de Datos (Versión Turbo + Híbrida)
   ========================================================== */

/* 1. DEFINICIÓN DE MATERIAS */
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

/* 2. DEFINICIÓN DE SUBTEMAS */
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

/* 3. OBJETO PRINCIPAL DEL BANCO */
let BANK = {
  questions: [],
  subjects: SUBJECTS,
  subsubjects: SUBTEMAS,
  loaded: false
};

/* 4. UTILS INTERNOS */
function normalizeId(id) {
  return id ? String(id).trim() : `gen_${Math.random().toString(36).slice(2)}`;
}

// ⚠️ PROCESADOR HÍBRIDO (Soporta Array y String)
function processQuestion(q) {
    q.id = normalizeId(q.id);

    // Si materia es array, lo dejamos array. Si es string, lo dejamos string.
    // Pero nos aseguramos de que los valores sean lowercase (slugs).
    if (Array.isArray(q.materia)) {
        q.materia = q.materia.map(m => m.toLowerCase().trim());
    } else if (typeof q.materia === "string") {
        q.materia = q.materia.toLowerCase().trim();
    } else {
        q.materia = "otras";
    }

    // Normalizar subtemas (solo string por ahora en tu estructura, pero prevenimos)
    if (Array.isArray(q.submateria)) q.submateria = q.submateria[0]; 
}

/* 5. CARGA EN PARALELO (TURBO) */
async function loadAllBanks() {
  const appMsg = document.querySelector("#app div"); 
  if(appMsg) appMsg.textContent = "🚀 Cargando banco...";

  // 📝 LISTA DE ARCHIVOS REALES (Agregá acá tus archivos nuevos)
  const files = [
    // Obstetricia
    "bancos/obstetricia/obstetricia12.json",
    "bancos/obstetricia/obstetricia13.json",
    
    // Exámenes
    "bancos/examenes/examen_unico_2025.json",
    "bancos/examenes/examen_unico_2024.json",
    "bancos/examenes/examen_unico_2023.json"
  ];

  // Disparamos todas las peticiones a la vez
  const promises = files.map(url => fetch(url).then(res => {
      if (!res.ok) throw new Error(`404: ${url}`);
      return res.json();
  }).catch(err => {
      console.warn(`⚠️ No se pudo cargar ${url}`, err);
      return []; // Si falla uno, devolvemos array vacío para no romper todo
  }));

  try {
    const results = await Promise.all(promises);
    
    // Aplanamos y procesamos
    const allQuestions = results.flat();
    
    allQuestions.forEach(q => processQuestion(q));

    // Deduplicar por ID (por si cargás dos veces lo mismo)
    const map = new Map();
    allQuestions.forEach(q => map.set(q.id, q));
    
    BANK.questions = Array.from(map.values());
    BANK.loaded = true;

    console.log(`✅ Carga finalizada: ${BANK.questions.length} preguntas.`);
    if(window.renderHome) window.renderHome();

  } catch (err) {
    console.error("❌ Error fatal cargando:", err);
    document.getElementById("app").innerHTML = `<div style="text-align:center;padding:20px;color:red;">Error de carga. Revisá la consola.</div>`;
  }
}

/* 6. APIs PARA LA APP (Adaptadas a Híbrido) */
function getQuestionsByMateria(slug, subs) {
    return BANK.questions.filter(q => {
        // 1. Chequeo Híbrido de Materia
        const esMateria = Array.isArray(q.materia) 
            ? q.materia.includes(slug) 
            : q.materia === slug;
        
        if (!esMateria) return false;

        // 2. Chequeo de Subtemas
        if (subs && subs.length) {
            return subs.includes(q.submateria);
        }
        return true;
    });
}

function getQuestionsByExamen(id) {
    return BANK.questions.filter(q => q.examen === id);
}

/* 7. INIT */
function initApp() {
  loadAllBanks();
}
