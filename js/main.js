/* ==========================================================
   🧩 MAIN.JS – NAVEGACIÓN PRINCIPAL Y HOME
   Versión unificada (main + ui) – estable y modular
   ========================================================== */

/* ---------- Inicio automático ---------- */
document.addEventListener("DOMContentLoaded", () => {
  window.app = document.getElementById("app");
  renderHome();
});

/* ==========================================================
   🏠 HOME – Pantalla principal
   ========================================================== */
function renderHome() {
  app.innerHTML = `
    <div class="home-menu fade" style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;">
      <button class="btn-main btn-blue" onclick="renderChoicePorMateria()">🧩 Choice por materia</button>
      <button class="btn-main btn-blue" onclick="renderExamenes()">📄 Exámenes anteriores</button>
      <button class="btn-main btn-blue" onclick="renderExamenSetup()">🧠 Modo Examen – Creá el tuyo</button>
      <button class="btn-main btn-blue" onclick="renderStatsGlobal()">📊 Estadísticas generales</button>
      <button class="btn-main btn-blue" onclick="renderNotas()">📔 Mis notas</button>
      <hr class="divider">
      <button class="btn-small btn-grey" onclick="manualBankReload()">🔄 Actualizar bancos</button>
      <button class="btn-small btn-grey" onclick="forceReloadBank()">♻️ Recarga completa</button>
    </div>
  `;
}

/* ==========================================================
   🔹 PLACEHOLDERS DE NAVEGACIÓN
   (cada uno se reemplazará por su propio módulo)
   ========================================================== */

// 🧩 Choice por materia
function renderChoice() {
  if (typeof renderSubjects === "function") {
    renderSubjects();
  } else {
    app.innerHTML = `
      <div class="card fade" style="text-align:center;">
        <h2>🧩 Choice por materia</h2>
        <p>Este módulo aún no está cargado.</p>
        <p class="small">Cuando carguemos <code>choice.js</code>, este botón te llevará allí.</p>
        <button class="btn-small" onclick="renderHome()">⬅️ Volver</button>
      </div>`;
  }
}

// 📄 Exámenes anteriores
function renderExamenes() {
  if (typeof renderExamenesLista === "function") {
    renderExamenesLista();
  } else {
    app.innerHTML = `
      <div class="card fade" style="text-align:center;">
        <h2>📄 Exámenes anteriores</h2>
        <p>Este módulo aún no está disponible.</p>
        <p class="small">Cuando se cargue <code>examenes.js</code>, este botón te llevará allí.</p>
        <button class="btn-small" onclick="renderHome()">⬅️ Volver</button>
      </div>`;
  }
}

// 📊 Estadísticas generales
function renderStatsGlobal() {
  if (typeof renderStats === "function") {
    renderStats();
  } else {
    app.innerHTML = `
      <div class="card fade" style="text-align:center;">
        <h2>📊 Estadísticas generales</h2>
        <p>No se pudo cargar el módulo <b>stats.js</b>.</p>
        <p class="small">Verificá que el archivo exista en la carpeta raíz.</p>
        <button class="btn-small" onclick="renderHome()">⬅️ Volver</button>
      </div>`;
  }
}

// 📔 Mis notas
function renderNotas() {
  if (typeof renderNotasMain === "function") {
    renderNotasMain();
  } else {
    app.innerHTML = `
      <div class="card fade" style="text-align:center;">
        <h2>📔 Mis notas</h2>
        <p>El módulo de notas se encuentra en desarrollo.</p>
        <p class="small">Cuando carguemos <code>notas.js</code>, este botón te llevará allí.</p>
        <button class="btn-small" onclick="renderHome()">⬅️ Volver</button>
      </div>`;
  }
}

/* ==========================================================
   🔁 Recarga de bancos
   ========================================================== */
async function manualBankReload() {
  alert("⏳ Actualizando bancos...");
  await loadAllBanks(); // definida en bank.js
  alert("✅ Bancos actualizados correctamente");
}
