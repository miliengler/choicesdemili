/* ==========================================================
   📚 SUBTEMAS POR MATERIA – VERSIÓN FINAL COMPLETA
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
    "Oncología"
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
