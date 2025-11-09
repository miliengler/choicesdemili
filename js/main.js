/* ==========================================================
   🧩 MAIN.JS – NAVEGACIÓN PRINCIPAL Y HOME
   Versión unificada (main + ui) – estable y modular
   ========================================================== */

/* ---------- Inicio automático ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // se inicializa solo el contenedor global (renderHome ya se llama desde index.html)
  window.app = document.getElementById("app");
});

/* ==========================================================
   🏠 HOME – Pantalla principal
   ========================================================== */
function renderHome() {
  app.innerHTML = `
    <div class="home-menu fade" style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;">
      <button class="btn-main btn-blue" onclick="renderChoice()">🧩 Choice por materia</button>
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
  if (typeof renderChoicePorMateria === "function") {
    renderChoicePorMateria();
  } else {
    mostrarModuloFaltante("🧩 Choice por materia", "choice.js");
  }
}

// 📄 Exámenes anteriores
function renderExamenes() {
  if (typeof renderExamenesLista === "function") {
    renderExamenesLista();
  } else {
    mostrarModuloFaltante("📄 Exámenes anteriores", "examenes.js");
  }
}

// 🧠 Modo Examen – Creá el tuyo
function renderExamenSetup() {
  if (typeof renderExamenSetupMain === "function") {
    renderExamenSetupMain();
  } else {
    mostrarModuloFaltante("🧠 Modo Examen", "examen_setup.js");
  }
}

// 📊 Estadísticas generales
function renderStatsGlobal() {
  if (typeof renderStats === "function") {
    renderStats();
  } else {
    mostrarModuloFaltante("📊 Estadísticas generales", "stats.js");
  }
}

// 📔 Mis notas
function renderNotas() {
  if (typeof renderNotasMain === "function") {
    renderNotasMain();
  } else {
    mostrarModuloFaltante("📔 Mis notas", "notas.js");
  }
}

/* ==========================================================
   🔧 Función auxiliar para módulos no cargados
   ========================================================== */
function mostrarModuloFaltante(titulo, archivo) {
  console.warn(`⚠️ Módulo faltante: ${archivo}`);
  app.innerHTML = `
    <div class="card fade" style="text-align:center;">
      <h2>${titulo}</h2>
      <p>El módulo aún no está disponible o no se pudo cargar.</p>
      <p class="small">Verificá que el archivo <code>${archivo}</code> exista en la carpeta <code>js/</code>.</p>
      <button class="btn-small" onclick="renderHome()">⬅️ Volver</button>
    </div>
  `;
}

/* ==========================================================
   🔁 Recarga de bancos
   ========================================================== */
async function manualBankReload() {
  alert("⏳ Actualizando bancos...");
  await loadAllBanks(); // definida en bank.js
  alert("✅ Bancos actualizados correctamente");
}
