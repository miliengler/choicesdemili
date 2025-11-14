/* ==========================================================
   💾 MEbank – BANCO DE PREGUNTAS (versión estable)
   Estructura soportada (exacta a tu GitHub):
   - bancos/{materia}/{materia}1.json ... {materia}20.json
   - bancos/anteriores/examenunico/examen_unico_YYYY.json
   - bancos/anteriores/caba/caba_YYYY.json
   - bancos/anteriores/pcia_ba/pciaba_YYYY.json
   - bancos/anteriores/uba/uba_YYYY.json
   - bancos/anteriores/privados/{inst}/{inst}_YYYY.json
   - bancos/otras/otras1.json ...
   ========================================================== */

const LS_BANK = "mebank_bank_v8";
const LS_PROGRESS = "mebank_progress_v8";

/* -------- Normalizador simple -------- */
function normalize(str){
  return str
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .toLowerCase()
    .trim() || "";
}

/* -------- Inicialización -------- */
let BANK = JSON.parse(localStorage.getItem(LS_BANK) || "null") || {
  subjects: [
    { slug:"cardiologia",name:"🫀 Cardiología"},
    { slug:"cirugiageneral",name:"🔪 Cirugía General"},
    { slug:"dermatologia",name:"🧴 Dermatología"},
    { slug:"endocrinologia",name:"🧪 Endocrinología"},
    { slug:"gastroenterologia",name:"💩 Gastroenterología"},
    { slug:"ginecologia",name:"🌸 Ginecología"},
    { slug:"hematologia",name:"🩸 Hematología"},
    { slug:"imagenes",name:"🩻 Diagnóstico por Imágenes"},
    { slug:"infectologia",name:"🦠 Infectología"},
    { slug:"medicinafamiliar",name:"👨‍👩‍👧‍👦 Medicina Familiar"},
    { slug:"medicinalegal",name:"⚖️ Medicina Legal"},
    { slug:"neurologia",name:"🧠 Neurología"},
    { slug:"neurocirugia",name:"🧠 Neurocirugía"},
    { slug:"neumonologia",name:"🫁 Neumonología"},
    { slug:"nutricion",name:"🍏 Nutrición"},
    { slug:"oftalmologia",name:"👁️ Oftalmología"},
    { slug:"oncologia",name:"🎗️ Oncología"},
    { slug:"obstetricia",name:"🤰 Obstetricia"},
    { slug:"otorrinolaringologia",name:"👂 ORL"},
    { slug:"otras",name:"📚 Otras"},
    { slug:"pediatria",name:"🧸 Pediatría"},
    { slug:"psiquiatria",name:"💭 Psiquiatría"},
    { slug:"reumatologia",name:"💪 Reumatología"},
    { slug:"saludpublica",name:"🏥 Salud Pública"},
    { slug:"toxicologia",name:"☠️ Toxicología"},
    { slug:"traumatologia",name:"🦴 Traumatología"},
    { slug:"urologia",name:"🚽 Urología"},
  ],
  questions: [],
  index: {}
};

let PROG = JSON.parse(localStorage.getItem(LS_PROGRESS) || "{}");

function saveAll(){
  localStorage.setItem(LS_BANK, JSON.stringify(BANK));
  localStorage.setItem(LS_PROGRESS, JSON.stringify(PROG));
}

/* ==========================================================
   CARGA GENERAL
   ========================================================== */
async function loadAllBanks(){
  BANK.questions = [];
  BANK.index = {};

  const existing = new Set();

  const pushQ = q => {
    if(existing.has(q.id)) return;
    existing.add(q.id);

    if(!BANK.index[q.materia]) BANK.index[q.materia] = {};
    if(!BANK.index[q.materia][q.submateria]) BANK.index[q.materia][q.submateria] = [];

    BANK.index[q.materia][q.submateria].push(q);
    BANK.questions.push(q);
  };

  /* ---------- 1) BANCOS POR MATERIA ---------- */
  for(const s of BANK.subjects){
    for(let i=1;i<=20;i++){
      const ruta = `bancos/${s.slug}/${s.slug}${i}.json`;
      try{
        const r = await fetch(ruta);
        if(!r.ok) break;
        const data = await r.json();

        data.forEach(q=>{
          q.tipo = q.tipo || "banco";
          q.materia = s.slug;
          q.submateria = normalize(q.submateria || "otras_" + s.slug);
          pushQ(q);
        });

      }catch{}
    }
  }

  /* ---------- 2) EXÁMENES OFICIALES ---------- */
  const examSources = [
    { folder:"examenunico", prefix:"examen_unico_", years:[2025,2024,2023,2022,2021,2020,2019,2018,2017,2016,2015,2014,2013]},
    { folder:"caba",        prefix:"caba_",         years:[2018,2017,2016,2015,2014,2013,2012,2011,2010]},
    { folder:"pcia_ba",     prefix:"pciaba_",       years:[2016,2015,2014,2013,2012,2011,2010]},
    { folder:"uba",         prefix:"uba_",          years:[2017,2016]},
  ];

  for(const ex of examSources){
    for(const y of ex.years){
      const ruta = `bancos/anteriores/${ex.folder}/${ex.prefix}${y}.json`;
      try{
        const r = await fetch(ruta);
        if(!r.ok) continue;
        const data = await r.json();

        data.forEach(q=>{
          q.tipo = "examen";
          q.examen = ex.folder;
          q.anio = y;
          q.materia = normalize(q.materia);
          q.submateria = normalize(q.submateria || "otras_"+q.materia);
          pushQ(q);
        });

      }catch{}
    }
  }

  /* ---------- 3) PRIVADOS ---------- */
  const privados = ["austral","italiano","fleni","favaloro","cemic","britanico"];

  for(const inst of privados){
    for(let y=2010;y<=2025;y++){
      const ruta = `bancos/anteriores/privados/${inst}/${inst}_${y}.json`;
      try{
        const r = await fetch(ruta);
        if(!r.ok) continue;
        const data = await r.json();

        data.forEach(q=>{
          q.tipo = "privado";
          q.institucion = inst;
          q.anio = y;
          q.materia = normalize(q.materia);
          q.submateria = normalize(q.submateria||"otras_"+q.materia);
          pushQ(q);
        });
      }catch{}
    }
  }

  /* ---------- 4) OTRAS ---------- */
  for(let i=1;i<=20;i++){
    const ruta = `bancos/otras/otras${i}.json`;
    try{
      const r = await fetch(ruta);
      if(!r.ok) break;
      const data = await r.json();
      data.forEach(q=>{
        q.materia = "otras";
        q.submateria = normalize(q.submateria || "otras");
        pushQ(q);
      });
    }catch{}
  }

  saveAll();
}

/* -------- Inicializador -------- */
window.addEventListener("DOMContentLoaded", async ()=>{
  if(BANK.questions.length === 0){
    await loadAllBanks();
  }
});
