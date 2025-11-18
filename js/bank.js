/* ==========================================================
   🌐 MEbank 3.0 — Banco simple y estable (modo botón)
   ========================================================== */

const STORAGE_KEY_PROG = "MEbank_PROG_v3";

function loadProgress(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_PROG)) || {}; }
  catch { return {}; }
}

function saveProgress(){
  try { localStorage.setItem(STORAGE_KEY_PROG, JSON.stringify(PROG)); }
  catch(e){ console.warn("No se pudo guardar PROG", e); }
}

let PROG = loadProgress();

/* ---------------- Normalizar ---------------- */
function normalize(s){
  return s ? s.normalize("NFD")
              .replace(/[\u0300-\u036f]/g,"")
              .replace(/[\p{Emoji}\p{Extended_Pictographic}]/gu,"")
              .replace(/[^\p{L}\p{N}]/gu,"")
              .toLowerCase()
           : "";
}

/* ---------------- BANK ---------------- */
let BANK = {
  subjects: SUBJECTS,
  subsubjects: {},
  questions: [],
  loaded: false
};

SUBJECTS.forEach(s=>{
  BANK.subsubjects[s.slug] = SUBTEMAS[s.slug] || [ "Otras preguntas de "+s.name ];
});

/* ==========================================================
   📦 CARGAR BANCOS (solo manual)
   ========================================================== */

async function loadAllBanks(){
  console.log("⏳ Cargando bancos…");
  BANK.questions = [];

  const ids = new Set();

  await loadFromMaterias(ids);
  await loadFromExamenes(ids);

  BANK.loaded = true;

  console.log("✔ Banco cargado:", BANK.questions.length, "preguntas");
}

/* ----- materias ----- */
async function loadFromMaterias(ids){
  for (const subj of SUBJECTS){
    const slug = subj.slug;
    for (let i=1; i<=4; i++){
      const ruta = `bancos/${slug}/${slug}${i}.json`;
      await loadFileIfExists(ruta, "materia", ids);
    }
  }
}

/* ----- exámenes ----- */
async function loadFromExamenes(ids){
  for(const exam of EXAMENES_META){
    await loadFileIfExists(exam.file, "examen", ids, exam);
  }
}

/* ----- cargar archivo ----- */
async function loadFileIfExists(ruta, tipo, ids, exam=null){
  try{
    const r = await fetch(ruta);
    if(!r.ok) return;
    const data = await r.json();
    if(!Array.isArray(data)) return;

    data.forEach(q=>{
      normalizeQuestion(q, tipo, exam);
      if(!ids.has(q.id)){
        ids.add(q.id);
        BANK.questions.push(q);
      }
    });

    console.log("📘",ruta,"+",data.length);
  }catch(e){
    console.warn("No se pudo cargar",ruta);
  }
}

/* ----- normalizar pregunta ----- */
function normalizeQuestion(q, tipo, exam){
  q.materia = normalize(q.materia || "otras");
  q.submateria = normalize(q.submateria || "otras");

  if(!BANK.subsubjects[q.materia])
    BANK.subsubjects[q.materia] = [ "Otras preguntas" ];

  if(!Array.isArray(q.opciones)) q.opciones = [];
  if(!q.explicacion) q.explicacion = null;
  if(!q.imagenes) q.imagenes = [];

  q.tipo = tipo;

  if(tipo==="examen" && exam){
    q.examen = exam.id;
    q.anio = exam.anio;
    q.oficial = exam.grupo==="Examen Único";
  }else{
    q.examen = null;
    q.anio = null;
    q.oficial = false;
  }
}

/* ==========================================================
   🔧 API para las pantallas
   ========================================================== */

function getQuestionsByMateria(slug,subs=null){
  const mat = normalize(slug);
  return BANK.questions.filter(q=>{
    if(q.materia!==mat) return false;
    if(subs && subs.length) return subs.includes(q.submateria);
    return true;
  });
}

function getQuestionsByExamen(id){
  return BANK.questions.filter(q=>q.examen===id);
}

function getQuestionById(id){
  return BANK.questions.find(q=>q.id===id)||null;
}

/* ==========================================================
   🚀 INIT APP
   ========================================================== */

function initApp(){
  // No cargamos bancos automáticamente
  renderHome();
}

/* ==========================================================
   🔄 Recarga manual
   ========================================================== */

async function recargarBancos(){
  if(!confirm("¿Cargar / Recargar TODOS los bancos ahora?")) return;
  await loadAllBanks();
  alert("✔ Bancos cargados");
  renderHome();
}
