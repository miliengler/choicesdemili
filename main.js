/* ---------- Persistencia ---------- */
const LS_BANK="mebank_bank_v6_2", LS_PROGRESS="mebank_prog_v6_2", LS_THEME="mebank_theme", LS_ADMIN="mebank_admin_hash_v6_2";

let BANK = JSON.parse(localStorage.getItem(LS_BANK)||"null") || {
  subjects: [
  {slug:"neumonologia", name:`${String.fromCodePoint(0x1FAC1)} Neumonología`},
  {slug:"psiquiatria", name:`${String.fromCodePoint(0x1F9D0)} Psiquiatría`},
  {slug:"cardiologia", name:`${String.fromCodePoint(0x1FAC0)} Cardiología`},
  {slug:"nutricion", name:`${String.fromCodePoint(0x1F34F)} Nutrición`},
  {slug:"nefrologia", name:`${String.fromCodePoint(0x1FAD8)} Nefrología`},
  {slug:"gastroenterologia", name:`${String.fromCodePoint(0x1F4A9)} Gastroenterología`},
  {slug:"dermatologia", name:`${String.fromCodePoint(0x1F9F4)} Dermatología`},
  {slug:"infectologia", name:`${String.fromCodePoint(0x1F9A0)} Infectología`},
  {slug:"reumatologia", name:`${String.fromCodePoint(0x1F4AA)} Reumatología`},
  {slug:"hematologia", name:`${String.fromCodePoint(0x1FA78)} Hematología`},
  {slug:"neurologia", name:`${String.fromCodePoint(0x1F9E0)} Neurología`},
  {slug:"endocrinologia", name:`${String.fromCodePoint(0x1F9EA)} Endocrinología`},
  {slug:"pediatria", name:`${String.fromCodePoint(0x1F9F8)} Pediatría`},
  {slug:"oncologia", name:`${String.fromCodePoint(0x1F397)} Oncología`},
  {slug:"medicinafamiliar", name:`${String.fromCodePoint(0x1F46A)} Medicina Familiar`},
  {slug:"ginecologia", name:`${String.fromCodePoint(0x1F33A)} Ginecología`},
  {slug:"obstetricia", name:`${String.fromCodePoint(0x1F930)} Obstetricia`},
  {slug:"cirugiageneral", name:`${String.fromCodePoint(0x1F52A)} Cirugía General`},
  {slug:"traumatologia", name:`${String.fromCodePoint(0x1F9B4)} Traumatología`},
  {slug:"urologia", name:`${String.fromCodePoint(0x1F6BD)} Urología`},
  {slug:"oftalmologia", name:`${String.fromCodePoint(0x1F441)} Oftalmología`},
  {slug:"otorrinolaringologia", name:`${String.fromCodePoint(0x1F442)} Otorrinolaringología`},
  {slug:"neurocirugia", name:`${String.fromCodePoint(0x1F9E0)} Neurocirugía`},
  {slug:"toxicologia", name:`${String.fromCodePoint(0x2620)} Toxicología`},
  {slug:"saludpublica", name:`${String.fromCodePoint(0x1F3E5)} Salud Pública`},
  {slug:"medicinalegal", name:`${String.fromCodePoint(0x2696)} Medicina Legal`},
  {slug:"imagenes", name:`${String.fromCodePoint(0x1FA7B)} Diagnóstico por Imágenes`},
  {slug:"otras", name:`${String.fromCodePoint(0x1F4DA)} Otras`}
  ],
  questions:[
    {id:"OB-001",materia:"obstetricia",subtema:"Controles prenatales",enunciado:"Gestante 12 semanas, ¿qué estudio no corresponde al primer control?",opciones:["Grupo y factor Rh","Glucemia","VDRL","Urocultivo 28 sem"],correcta:3,explicacion:"El urocultivo a las 28 semanas no es del primer control."},
    {id:"PE-001",materia:"pediatria",subtema:"Bronquiolitis",enunciado:"Lactante con bronquiolitis leve, manejo:",opciones:["Broncodilatador","Corticoides","Oxígeno según SatO2","Antibióticos"],correcta:2,explicacion:"Soporte con oxígeno si SatO2 baja."},
    {id:"IN-001",materia:"infectologia",subtema:"Faringitis",enunciado:"Test rápido positivo para estreptococo. Conducta:",opciones:["Macrólido empírico","Amoxicilina 10 días","Ceftriaxona IM","No tratar"],correcta:1,explicacion:"Penicilina/Amoxi 10 días es primera línea."}
  ]
};
const PROG=JSON.parse(localStorage.getItem(LS_PROGRESS)||"{}");
function saveAll(){ localStorage.setItem(LS_BANK,JSON.stringify(BANK)); localStorage.setItem(LS_PROGRESS,JSON.stringify(PROG)); }

/* ---------- Tema ---------- */
(function initTheme(){
  const saved = localStorage.getItem(LS_THEME) || "light";
  document.body.setAttribute("data-theme", saved);
  document.getElementById("themeBtn").textContent = saved==="dark" ? "☀️" : "🌙";
})();
document.getElementById("themeBtn").onclick = ()=>{
  const cur = document.body.getAttribute("data-theme")==="dark" ? "light":"dark";
  document.body.setAttribute("data-theme", cur);
  localStorage.setItem(LS_THEME, cur);
  document.getElementById("themeBtn").textContent = cur==="dark" ? "☀️" : "🌙";
};

/* ---------- Admin por URL (?admin=1) ---------- */
const adminActive = new URLSearchParams(location.search).get('admin') === '1';
let gear, btnImport, owWrap, overwrite, fileInput;
function setupAdminControls(){
  if(!adminActive) return;
  const panel = document.createElement('div');
  panel.className = 'card';
  panel.style = 'position:fixed; right:16px; top:76px; z-index:40; width:280px';
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
      <b>Modo admin</b>
      <button id="admGear" class="btn-small" title="PIN">⚙️</button>
    </div>
    <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap; align-items:center">
      <button id="btnImport" class="btn-small">Importar</button>
      <label id="owWrap" class="btn-small" style="display:none"><input type="checkbox" id="overwrite"> Sobrescribir</label>
      <input id="fileInput" type="file" accept="application/json" class="hidden"/>
    </div>`;
  document.body.appendChild(panel);
  gear = document.getElementById('admGear');
  btnImport = document.getElementById('btnImport');
  owWrap = document.getElementById('owWrap');
  overwrite = document.getElementById('overwrite');
  fileInput = document.getElementById('fileInput');
  hookAdmin();
}
setupAdminControls();

async function sha256Hex(str){
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

/* ---------- Utilidades ---------- */
function subjectsFromBank(){
  const known = new Map((BANK.subjects||[]).map(s=>[s.slug,s]));
  (BANK.questions||[]).forEach(q=>{
    if(q && q.materia && !known.has(q.materia)){
      known.set(q.materia,{slug:q.materia,name:q.materia[0].toUpperCase()+q.materia.slice(1)});
    }
  });
  return Array.from(known.values()).sort((a,b)=>a.name.localeCompare(b.name));
}
const app=document.getElementById("app");

/* ---------- HOME ---------- */
function renderHome(){
  clearExamTimer();
  app.innerHTML = `
    <div style="text-align:center;animation:fadeIn .5s;display:flex;flex-direction:column;align-items:center;gap:10px;">
      <button class="btn-main" onclick="renderSubjects()">${String.fromCodePoint(0x1F9E9)} Choice por materia</button>
      <button class="btn-main" onclick="renderOld()">${String.fromCodePoint(0x1F4C4)} Exámenes anteriores</button>
      <button class="btn-main" style="background:#1e40af;border-color:#1e40af;" onclick="renderExamenGeneralSetup()">${String.fromCodePoint(0x1F9E0)} Modo Examen – Creá el tuyo</button>
      <button class="btn-main" style="background:#1e40af;border-color:#1e40af;" onclick="renderStatsGlobal()">${String.fromCodePoint(0x1F4CA)} Estadísticas generales</button>
      <button class="btn-main" onclick="renderNotesList()">${String.fromCodePoint(0x1F4D4)} Mis notas</button>
      <button class="btn-main" style="background:#64748b;border-color:#64748b;" onclick="resetBanco()">🧹 Reset banco (temporal)</button>
    </div>`;
}

function resetBanco(){
  if(confirm("¿Querés borrar el banco actual y recargar las materias nuevas?")){
    localStorage.removeItem(LS_BANK);
    localStorage.removeItem(LS_PROGRESS);
    location.reload();
  }
}
window.addEventListener("DOMContentLoaded", () => renderHome());
