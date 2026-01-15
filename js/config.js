
/* ==========================================================
   📚 MEbank 3.0 – Configuración central
   ========================================================== */

/* ----------------------------------------------------------
   📘 Materias oficiales
   ---------------------------------------------------------- */

const SUBJECTS = [
  { slug: "neumonologia",       name: "🫁 Neumonología" },
  { slug: "psiquiatria",        name: "💭 Psiquiatría" },
  { slug: "cardiologia",        name: "🫀 Cardiología" },
  { slug: "nutricion",          name: "🍏 Nutrición" },
  { slug: "urologia",           name: "🚽 Nefrología" }, 
  { slug: "urologia_cx",        name: "🍆 Urología" },
  { slug: "urgencias",          name: "🚑 Urgencias" },
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
  { slug: "aps",                name: "🏥 Atención Primaria de la Salud" },
  { slug: "otras",              name: "📚 Otras" }
];

/* ----------------------------------------------------------
   🧩 Subtemas por materia
   ---------------------------------------------------------- */

const SUBTEMAS = {
  aps: [
     "Atención Primaria de la Salud"
 ],
  urgencias: [
    "Síndromes torácicos",
    "Síndromes abdominales",
    "Paciente politraumatizado",
    "Patología renal y urológica urgente",
    "Otras preguntas de urgencias"
  ],

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
    "Adulto mayor",
    "Control de salud",
    "Otrs preguntas de medicina familiar"
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

  neurocirugia: [
    "Neurocirugía"
  ],

  nutricion: [
    "Diabetes mellitus",
    "Nutrición y obesidad",
    "Metabolismo lipídico",
    "Metabolismo calcio – PTH",
    "Hipoglucemias",
    "Otras preguntas de nutrición"
  ],

  obstetricia: [
    "Fisiología de la gestación",
    "Hemorragias del embarazo",
    "Screening gestacional",
    "Complicaciones maternas en el embarazo",
    "Amenazas de parto prematuro",
    "Rotura prematura de membranas",
    "Enfermedad hemolítica fetal",
    "Infecciones congénitas y perinatales",
    "Patología materna y gestación",
    "Embarazo múltiple",
    "Parto",
    "Embarazo prolongado e inducción",
    "Puerperio",
    "Lactancia",
    "Otras preguntas de obstetricia"
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
    "Conceptos de Oncología",
    "Otras preguntas de oncología"
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
    "Cuidados Paliativos",
    "Inmunologia",
    "Otras"
  ],

  pediatria: [
    "Neonatología",
    "Cardiopatías congénitas",
    "Desarrollo y nutrición",
    "Maltrato y abuso sexual",
    "Vacunación infantil",
    "Trastornos de la infancia y la adolescencia",
    "Síndromes asociados a anomalías cromosómicas",
    "Síndrome de muerte súbita del lactante",
    "Patología nefrourológica infantil",
    "Patología infecciosa infantil",
    "Patología del aparato respiratorio",
    "Patología del aparato digestivo",
    "Hematología infantil",
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
    "Glomerulonefritis primarias",
    "Nefropatías intersticiales",
    "Tubulopatías",
    "Riesgo cardiovascular y enfermedad renal",
    "Infecciones del tracto urinario",
    "Riñón y enfermedades sistémicas"
  ],


  urologia_cx: [
    "Próstata",
    "Cáncer de riñón y otros tumores renales",
    "Patología testicular",
    "Urgencias urológicas y traumatismos",
    "Urología funcional e incontinencia",
    "Infecciones del tracto urinario",
    "Urolitiasis",
    "Cáncer de urotelio",
    "Trasplante renal",
    "Andrología, disfunción eréctil y cáncer de pene"
  ]
};

/* ----------------------------------------------------------
   🧪 Exámenes anteriores (meta)
   ---------------------------------------------------------- */
const EXAMENES_META = [
  // ... (Aquí dejá todo lo que ya tenías de exámenes) ...
  ...[
    2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025
  ].map(y => ({
    id: `examen_unico_${y}`,
    grupo: "Examen Único",
    anio: y,
    file: `bancos/anteriores/examenunico/examen_unico_${y}.json`,
  })),

  /* ---------- CABA ---------- */
  ...[
    2010,2011,2012,2013,2014,2015,2016,2017,2018
  ].map(y => ({
    id: `caba_${y}`,
    grupo: "CABA",
    anio: y,
    file: `bancos/anteriores/caba/caba_${y}.json`,
  })),

  /* ---------- Provincia BA ---------- */
  ...[
    2010,2011,2012,2013,2014,2015,2016
  ].map(y => ({
    id: `pciaba_${y}`,
    grupo: "Provincia BA",
    anio: y,
    file: `bancos/anteriores/pcia_ba/pciaba_${y}.json`,
  })),

  /* ---------- UBA ---------- */
  ...[
    2016,2017
  ].map(y => ({
    id: `uba_${y}`,
    grupo: "UBA",
    anio: y,
    file: `bancos/anteriores/uba/uba_${y}.json`,
  })),

  /* ---------- Privados ---------- */
  ...[2021,2022,2023,2024].map(y => ({ id: `austral_${y}`, grupo: "Austral", anio: y, file: `bancos/anteriores/privados/austral/austral_${y}.json` })),
  { id: "austral_2021_simulacro", grupo: "Austral", anio: "Simulacro 2021", file: "bancos/anteriores/privados/austral/austral_2021_simulacro.json" },
  
  ...[2015,2021].map(y => ({ id: `britanico_${y}`, grupo: "Británico", anio: y, file: `bancos/anteriores/privados/britanico/britanico_${y}.json` })),
  { id: "britanico_2021_simulacro", grupo: "Británico", anio: "Simulacro 2021", file: "bancos/anteriores/privados/britanico/britanico_2021_simulacro.json" },

  { id: "cemic_2015", grupo: "CEMIC", anio: 2015, file: "bancos/anteriores/privados/cemic/cemic_2015.json" },
  { id: "favaloro_2015", grupo: "Favaloro", anio: 2015, file: "bancos/anteriores/privados/favaloro/favaloro_2015.json" },
  { id: "fleni_2015", grupo: "FLENI", anio: 2015, file: "bancos/anteriores/privados/fleni/fleni_2015.json" },
  { id: "italiano_2015", grupo: "Italiano", anio: 2015, file: "bancos/anteriores/privados/italiano/italiano_2015.json" },
];
