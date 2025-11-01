/* ========== CONFIG BÁSICA ========== */
const app = document.getElementById("app");
const THEME_KEY = "mebank_theme";

/* --- Tema claro/oscuro --- */
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

/* --- Materias disponibles --- */
const MATERIAS = [
  { slug: "obstetricia", name: "🤰 Obstetricia" }
  // 🔹 después agregamos más materias (ginecología, pediatría, etc.)
];

/* ========== HOME ========== */
function renderHome(){
  app.innerHTML = `
    <div style="text-align:center;animation:fadeIn .5s;display:flex;flex-direction:column;align-items:center;gap:10px;">
      <button class="btn-main" onclick="renderSubjects()">🧩 Choice por materia</button>
      <button class="btn-main" onclick="alert('📄 Próximamente')">📄 Exámenes anteriores</button>
      <button class="btn-main" style="background:#1e40af;border-color:#1e40af;" onclick="alert('🧠 Modo examen en desarrollo')">🧠 Modo Examen – Creá el tuyo</button>
      <button class="btn-main" style="background:#1e40af;border-color:#1e40af;" onclick="alert('📊 Estadísticas próximamente')">📊 Estadísticas generales</button>
      <button class="btn-main" onclick="alert('📔 Mis notas próximamente')">📔 Mis notas</button>
    </div>
  `;
}

/* ========== LISTA DE MATERIAS ========== */
function renderSubjects(){
  const list = MATERIAS.map(m => `
    <button class="btn-main" onclick="loadMateria('${m.slug}')">${m.name}</button>
  `).join("");

  app.innerHTML = `
    <div class="card" style="text-align:center">
      <button class="btn-small" style="margin-bottom:10px" onclick="renderHome()">⬅️ Volver</button>
      <p class="small">Seleccioná una materia para cargar sus preguntas (bajo demanda).</p>
      ${list}
    </div>
  `;
}

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

    renderMateria(slug, preguntas);
  }catch(err){
    console.error(err);
    app.innerHTML = `<div class="card">Error al cargar <b>${slug}</b>.<br><span class="small">${String(err.message||err)}</span><br><br><button class="btn-main" onclick="renderSubjects()">Volver</button></div>`;
  }
}

/* ========== MUESTRA PRIMERA PREGUNTA ========== */
function renderMateria(slug, preguntas){
  const primera = preguntas[0];
  app.innerHTML = `
    <div class="card">
      <button class="btn-main" style="max-width:200px;background:#64748b;border-color:#64748b" onclick="renderSubjects()">⬅️ Materias</button>
      <h3 style="margin-top:10px">${slug.toUpperCase()}</h3>
      <p class="small">${preguntas.length} preguntas cargadas desde <code>bancos/${slug}.json</code></p>

      <hr style="margin:12px 0">

      <div><b>Ejemplo (1° pregunta):</b></div>
      <div style="margin-top:8px;font-size:18px">${primera.enunciado}</div>
      <div style="margin-top:10px;display:grid;gap:8px">
        ${primera.opciones.map((op,i)=>`
          <label style="border:1px solid var(--line);border-radius:12px;padding:12px;display:block">
            ${String.fromCharCode(97+i)}) ${op}
          </label>`).join("")}
      </div>
    </div>
  `;
}

/* ========== INICIO ========== */
document.addEventListener("DOMContentLoaded", renderHome);
