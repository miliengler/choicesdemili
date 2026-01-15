/* ==========================================================
   🏠 MEbank 3.0 – Pantalla Home, Arranque y Selección (FIXED)
   ========================================================== */

// 🌙 1. LÓGICA DE MODO OSCURO
document.addEventListener("DOMContentLoaded", () => {
    const isDark = localStorage.getItem("mebank_darkmode") === "true";
    if (isDark) document.body.classList.add("dark-mode");
});

window.toggleDarkMode = function() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("mebank_darkmode", isDark);
    const btn = document.getElementById("btn-dark-mode");
    if(btn) btn.textContent = isDark ? "☀️" : "🌙";
};

// 🛠️ HELPER: Limpiador de Slugs (Para que "urologia_cx" coincida con "urologiacx")
function cleanSlug(text) {
    if (!text) return "";
    return text.toLowerCase().replace(/[^a-z0-9]/g, ""); // Borra guiones, espacios y símbolos
}

// ✅ ARRANQUE DE LA APP
async function initApp() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div style="text-align:center;margin-top:100px;">
      <div style="font-size:40px;margin-bottom:20px;">🚀</div>
      <p style="color:var(--text-muted);">Iniciando MEbank...</p>
    </div>
  `;

  if (typeof loadAllBanks === 'function') {
      await loadAllBanks();
  } else {
      alert("Error crítico: No se encuentra el módulo Bank.js");
  }
}

// ✅ RENDERIZA EL MENÚ PRINCIPAL
function renderHome() {
  const app = document.getElementById("app");

  const cargado = (typeof BANK !== 'undefined' && BANK.loaded);
  const preguntas = cargado ? BANK.questions.length : 0;
  const daily = JSON.parse(localStorage.getItem("mebank_stats_daily") || "{}");
  const hoy = new Date().toISOString().split('T')[0];
  const hechasHoy = daily[hoy] || 0;
  const isDark = document.body.classList.contains("dark-mode");
  const icon = isDark ? "☀️" : "🌙";

  app.innerHTML = `
    <div class="card fade" style="max-width:520px; margin:auto; text-align:center; position:relative;">
      
      <button id="btn-dark-mode" onclick="toggleDarkMode()" 
              style="position:absolute; top:20px; right:20px; background:none; border:none; font-size:24px; cursor:pointer; z-index:10; padding:0;">
          ${icon}
      </button>

      <h1 style="margin-bottom:6px;">MEbank</h1>
      <p style="color:var(--text-muted); margin-bottom:25px;">
        Banco de Preguntas para Residencias
      </p>

      ${hechasHoy > 0 
        ? `<div class="daily-banner" style="margin-bottom:20px; padding:8px; background:var(--bg-subtle); color:#166534; border:1px solid #bbf7d0; border-radius:8px; font-size:14px;">
             🔥 Hoy respondiste <b>${hechasHoy}</b> preguntas correctamente.
           </div>`
        : ''
      }

      <div class="menu-buttons">
        <button class="btn-main menu-btn" onclick="goChoice()">📚 Práctica por tema</button>
        <button class="btn-main menu-btn" onclick="goExamenes()">📝 Exámenes anteriores</button>
        <button class="btn-main menu-btn" onclick="goCrearExamen()">🎯 Simulacro de examen</button>
        <button class="btn-main menu-btn" onclick="goStats()">📊 Estadísticas</button>
        <button class="btn-main menu-btn" onclick="goNotas()">📚 Mi Repaso</button>
      </div>

      <div style="margin-top:25px; font-size:13px; color:var(--text-muted);">
        ${cargado ? `✔ Sistema listo (${preguntas} preguntas)` : `⚠ Error de carga`}
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
function goNotas() { if(checkLoaded()) renderRepasoMain(); }

async function recargarBancoDesdeHome() {
  if(!confirm("¿Recargar base de datos?")) return;
  document.getElementById("app").innerHTML = "<div style='text-align:center;margin-top:50px;'>Recargando...</div>";
  await loadAllBanks();
}

/* ==========================================================
   📚 SELECCIÓN DE MATERIA (Agregada y Corregida)
   ========================================================== */
function renderChoice() {
  const app = document.getElementById("app");
  
  // Usamos el helper cleanSlug para comparar
  // Comparamos el slug del config (ej: urologia_cx) con lo que hay en el banco (ej: urologia-cx)
  const cards = SUBJECTS.map(subj => {
    const cantidad = BANK.questions.filter(q => {
        const materiasQ = Array.isArray(q.materia) ? q.materia : [q.materia];
        // Aquí está la magia:
        return materiasQ.some(m => cleanSlug(m) === cleanSlug(subj.slug));
    }).length;

    return `
      <div class="choice-card" onclick="startMateria('${subj.slug}')">
        <div class="choice-title">${subj.name}</div>
        <div class="choice-count">${cantidad} preguntas</div>
      </div>
    `;
  }).join("");

  app.innerHTML = `
    <div class="fade">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding:0 10px;">
        <h2 style="margin:0;">📚 Por Materia</h2>
        <button class="btn-small" onclick="renderHome()">🏠 Volver</button>
      </div>
      <div class="choice-grid">
        ${cards}
      </div>
    </div>
    <style>
      .choice-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 15px; padding-bottom: 40px; }
      .choice-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 15px; text-align: center; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
      .choice-card:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-color: #cbd5e1; }
      .choice-title { font-weight: 700; font-size: 15px; color: var(--text-main); margin-bottom: 5px; }
      .choice-count { font-size: 12px; color: var(--text-muted); }
    </style>
  `;
}

// Función auxiliar para iniciar la materia seleccionada
window.startMateria = function(slug) {
    // Filtramos usando la misma lógica flexible
    const preguntas = BANK.questions.filter(q => {
        const materiasQ = Array.isArray(q.materia) ? q.materia : [q.materia];
        return materiasQ.some(m => cleanSlug(m) === cleanSlug(slug));
    });

    if (preguntas.length === 0) {
        alert("No hay preguntas disponibles para esta materia.");
        return;
    }

    // Mezclar (Shuffle)
    preguntas.sort(() => Math.random() - 0.5);

    // Buscar título bonito
    const subjObj = SUBJECTS.find(s => s.slug === slug);
    const titulo = subjObj ? subjObj.name : slug;

    // Iniciar
    iniciarResolucion({
        preguntas: preguntas,
        modo: "materia",
        titulo: titulo,
        usarTimer: false,
        correccionFinal: false
    });
};
