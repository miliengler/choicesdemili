/* ==========================================================
   🏠 MEbank 3.0 – Pantalla Home y Arranque (Con Dark Mode)
   ========================================================== */

// 🌙 1. LÓGICA DE MODO OSCURO (Se ejecuta al cargar)
document.addEventListener("DOMContentLoaded", () => {
    // Recuperar preferencia guardada
    const isDark = localStorage.getItem("mebank_darkmode") === "true";
    if (isDark) {
        document.body.classList.add("dark-mode");
    }
});

// Función global para el botón
window.toggleDarkMode = function() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    
    // Guardar preferencia
    localStorage.setItem("mebank_darkmode", isDark);
    
    // Actualizar ícono visualmente
    const btn = document.getElementById("btn-dark-mode");
    if(btn) btn.textContent = isDark ? "☀️" : "🌙";
};

// ✅ ESTA FUNCIÓN ARRANCA LA APP
async function initApp() {
  const app = document.getElementById("app");
  
  // 1. Pantalla de carga
  app.innerHTML = `
    <div style="text-align:center;margin-top:100px;">
      <div style="font-size:40px;margin-bottom:20px;">🚀</div>
      <p style="color:#64748b;">Iniciando MEbank...</p>
    </div>
  `;

  // 2. Disparar carga de bancos
  if (typeof loadAllBanks === 'function') {
      await loadAllBanks();
  } else {
      alert("Error crítico: No se encuentra el módulo Bank.js");
  }
}

// ✅ RENDERIZA EL MENÚ PRINCIPAL
function renderHome() {
  const app = document.getElementById("app");

  // Datos básicos
  const cargado = (typeof BANK !== 'undefined' && BANK.loaded);
  const preguntas = cargado ? BANK.questions.length : 0;

  // Estadísticas rápidas para saludo
  const daily = JSON.parse(localStorage.getItem("mebank_stats_daily") || "{}");
  const hoy = new Date().toISOString().split('T')[0];
  const hechasHoy = daily[hoy] || 0;

  // 🌙 Detectar estado actual para el ícono
  const isDark = document.body.classList.contains("dark-mode");
  const icon = isDark ? "☀️" : "🌙";

  app.innerHTML = `
    <div class="card fade" style="max-width:520px; margin:auto; text-align:center; position:relative;">
      
      <button id="btn-dark-mode" onclick="toggleDarkMode()" 
              style="position:absolute; top:20px; right:20px; background:none; border:none; font-size:24px; cursor:pointer; z-index:10; padding:0;">
          ${icon}
      </button>

      <h1 style="margin-bottom:6px;">MEbank</h1>
      <p style="color:#64748b; margin-bottom:25px;">
        Banco de Preguntas para Residencias
      </p>

      ${hechasHoy > 0 
        ? `<div class="daily-banner" style="margin-bottom:20px; padding:8px; background:#f0fdf4; color:#166534; border-radius:8px; font-size:14px;">
             🔥 Hoy respondiste <b>${hechasHoy}</b> preguntas correctamente.
           </div>`
        : ''
      }

      <div class="menu-buttons">
        <button class="btn-main menu-btn" onclick="goChoice()">📚 Práctica por materia</button>
        <button class="btn-main menu-btn" onclick="goExamenes()">📝 Exámenes anteriores</button>
        <button class="btn-main menu-btn" onclick="goCrearExamen()">🎯 Simulacro de examen</button>
        <button class="btn-main menu-btn" onclick="goStats()">📊 Estadísticas</button>
        <button class="btn-main menu-btn" onclick="goNotas()">📔 Mis notas</button>
      </div>

      <div style="margin-top:25px; font-size:13px; color:#94a3b8;">
        ${cargado
          ? `✔ Sistema listo (${preguntas} preguntas)`
          : `⚠ Error de carga`}
      </div>

      <div style="margin-top:10px;">
        <button class="btn-small btn-ghost" onclick="recargarBancoDesdeHome()">
          🔄 Recargar todo
        </button>
      </div>
    </div>
  `;
}

/* ==========================================================
   🔀 Navegación
   ========================================================== */
function checkLoaded() {
  if (!BANK.loaded) {
    alert("Esperá a que carguen las preguntas...");
    return false;
  }
  return true;
}

function goChoice() { if(checkLoaded()) renderChoice(); }
function goExamenes() { if(checkLoaded()) renderExamenesMain(); }
function goCrearExamen() { if(checkLoaded()) renderCrearExamen(); }
function goStats() { if(checkLoaded()) renderStats(); }
function goNotas() { if(checkLoaded()) renderNotasMain(); }

async function recargarBancoDesdeHome() {
  if(!confirm("¿Recargar base de datos?")) return;
  document.getElementById("app").innerHTML = "<div style='text-align:center;margin-top:50px;'>Recargando...</div>";
  await loadAllBanks();
}
