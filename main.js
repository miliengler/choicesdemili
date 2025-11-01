/* ========== CONFIG BÁSICA ========== */
const app = document.getElementById("app");

/* ---------- Cargar bancos externos ---------- */
async function loadExternalBanks() {
  const materias = [
    "obstetricia",
    "ginecologia",
    "pediatria",
    "medicinainterna",
    "cirugiageneral",
    "saludpublica"
  ];

  window.BANK = { questions: [], subjects: [] };

  for (const mat of materias) {
    try {
      const res = await fetch(`bancos/${mat}.json`);
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data)) {
        console.log(`✅ Cargado banco: ${mat} (${data.length} preguntas)`);
        BANK.questions.push(...data);
        BANK.subjects.push({ slug: mat, name: mat[0].toUpperCase() + mat.slice(1) });
      }
    } catch (err) {
      console.warn(`⚠️ No se pudo cargar ${mat}.json`, err);
    }
  }

  console.log("📚 Total de preguntas cargadas:", BANK.questions.length);
}

/* ---------- Tema claro/oscuro ---------- */
const THEME_KEY = "mebank_theme";
(function initTheme(){
  const saved = localStorage.getItem(THEME_KEY) || "light";
  document.body.setAttribute("data-theme", saved);
  const btn = document.getElementById("themeBtn");
  if(btn){
    btn.textContent = saved==="dark" ? "☀️" : "🌙";
    btn.onclick = ()=>{
      const cur = document.body.getAttribute("data-theme")==="dark" ? "light":"dark";
      document.body.setAttribute("data-theme", cur);
      localStorage.setItem(THEME_KEY, cur);
      btn.textContent = cur==="dark" ? "☀️" : "🌙";
    };
  }
})();

/* ========== HOME ========== */
function renderHome(){
  app.innerHTML = `
    <div style="text-align:center;animation:fadeIn .5s;display:flex;flex-direction:column;align-items:center;gap:10px;">
      <button class="btn-main" onclick="renderSubjects()">🧩 Choice por materia</button>
    </div>
  `;
}

/* ========== LISTA DE MATERIAS ========== */
function renderSubjects(){
  if(!BANK || BANK.subjects.length === 0){
    app.innerHTML = `<div class="card">⚠️ No se cargaron bancos.<br><br><button class="btn-main" onclick="renderHome()">Volver</button></div>`;
    return;
  }

  const list = BANK.subjects.map(m => `
    <button class="btn-main" onclick="loadMateria('${m.slug}')">${m.name}</button>
  `).join("");

  app.innerHTML = `
    <div class="card" style="text-align:center">
      <button class="btn-small" style="margin-bottom:10px" onclick="renderHome()">⬅️ Volver</button>
      <p class="small">Seleccioná una materia para ver sus preguntas.</p>
      ${list}
    </div>
  `;
}

/* ========== VARIABLES DE SESIÓN ========== */
let CURRENT = {
  materia: "",
  preguntas: [],
  index: 0
};

/* ========== CARGA JSON DE MATERIA ========== */
async function loadMateria(slug){
  try{
    app.innerHTML = `<div class="card">Cargando ${slug}…</div>`;
    const res = await fetch(`bancos/${slug}.json?ts=${Date.now()}`);
    if(!res.ok) throw new Error(`No se pudo cargar bancos/${slug}.json`);
    const preguntas = await res.json();

    if(!Array.isArray(preguntas) || preguntas.length===0){
      app.innerHTML = `<div class="card">No hay preguntas en <b>${slug}</b> todavía.<br><br><button class="btn-main" onclick="renderSubjects()">Volver</button></div>`;
      return;
    }

    CURRENT = { materia: slug, preguntas, index: 0 };
    renderPregunta();
  }catch(err){
    console.error(err);
    app.innerHTML = `<div class="card">Error al cargar <b>${slug}</b>.<br><span class="small">${String(err.message||err)}</span><br><br><button class="btn-main" onclick="renderSubjects()">Volver</button></div>`;
  }
}

/* ========== RENDER DE UNA PREGUNTA ========== */
function renderPregunta(){
  const q = CURRENT.preguntas[CURRENT.index];
  if(!q){
    app.innerHTML = `<div class="card">No hay pregunta.<br><button class="btn-main" onclick="renderSubjects()">Volver</button></div>`;
    return;
  }

  const num = CURRENT.index + 1;
  const total = CURRENT.preguntas.length;

  app.innerHTML = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <b>${CURRENT.materia.toUpperCase()}</b>
        <span class="small">${num}/${total}</span>
      </div>

      <div style="margin-top:8px;font-size:18px">${q.enunciado}</div>
      <div style="margin-top:10px;display:grid;gap:8px">
        ${q.opciones.map((op,i)=>`
          <label style="border:1px solid var(--line);border-radius:12px;padding:12px;display:block;cursor:pointer">
            ${String.fromCharCode(97+i)}) ${op}
          </label>`).join("")}
      </div>

      <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
        <button class="btn-small" ${CURRENT.index===0?"disabled":""} onclick="prevPregunta()">⬅️ Anterior</button>
        <button class="btn-small" ${CURRENT.index===total-1?"disabled":""} onclick="nextPregunta()">Siguiente ➡️</button>
        <button class="btn-small" style="background:#64748b;border-color:#64748b" onclick="renderSubjects()">🏠 Volver</button>
      </div>
    </div>
  `;
}

/* ========== NAVEGACIÓN ========== */
function nextPregunta(){
  if(CURRENT.index < CURRENT.preguntas.length-1){
    CURRENT.index++;
    renderPregunta();
  }
}
function prevPregunta(){
  if(CURRENT.index > 0){
    CURRENT.index--;
    renderPregunta();
  }
}

/* ========== INICIO ========== */
document.addEventListener("DOMContentLoaded", async () => {
  await loadExternalBanks(); // carga los JSON desde /bancos/
  renderHome();
});
