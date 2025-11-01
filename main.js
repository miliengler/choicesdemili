/* ===== Config básica ===== */
const app = document.getElementById("app");
const THEME_KEY = "mebank_theme";

/* Tema */
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

/* Materias disponibles (podemos sumar más luego) */
const MATERIAS = [
  { slug: "obstetricia", name: "🤰 Obstetricia" }
  // después agregamos gineco, pediatría, etc.
];

/* Home */
function renderHome(){
  app.innerHTML = `
    <div class="card" style="text-align:center">
      <p class="small">Elegí una materia para cargar sus preguntas (se cargan a demanda, livianito).</p>
      ${MATERIAS.map(m => `<button class="btn-main" onclick="loadMateria('${m.slug}')">${m.name}</button>`).join("")}
    </div>
  `;
}

/* Cargar JSON de la materia bajo demanda */
async function loadMateria(slug){
  try{
    app.innerHTML = `<div class="card">Cargando ${slug}…</div>`;
    const res = await fetch(`bancos/${slug}.json?ts=${Date.now()}`);
    if(!res.ok) throw new Error(`No se pudo cargar bancos/${slug}.json`);
    const preguntas = await res.json();

    if(!Array.isArray(preguntas) || preguntas.length===0){
      app.innerHTML = `<div class="card">No hay preguntas en <b>${slug}</b> todavía.<br><br><button class="btn-main" onclick="renderHome()">Volver</button></div>`;
      return;
    }

    renderMateria(slug, preguntas);
  }catch(err){
    console.error(err);
    app.innerHTML = `<div class="card">Error al cargar <b>${slug}</b>.<br><span class="small">${String(err.message||err)}</span><br><br><button class="btn-main" onclick="renderHome()">Volver</button></div>`;
  }
}

/* Render simple de lista + primera pregunta (MVP) */
function renderMateria(slug, preguntas){
  const primera = preguntas[0];
  app.innerHTML = `
    <div class="card">
      <button class="btn-main" style="max-width:200px;background:#64748b;border-color:#64748b" onclick="renderHome()">⬅️ Inicio</button>
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

/* Inicio */
document.addEventListener("DOMContentLoaded", renderHome);
