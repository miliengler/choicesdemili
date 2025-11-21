/* ==========================================================
   🏠 MEbank 3.0 – Pantalla Home
   ========================================================== */

function renderHome() {
  const app = document.getElementById("app");

  const cargado = BANK.loaded;
  const preguntas = BANK.questions.length;

  app.innerHTML = `
    <div class="card fade" style="max-width:520px;margin:auto;text-align:center;">
      
      <h2 style="margin-bottom:6px;">MEbank</h2>
      <p style="color:#64748b;margin-bottom:25px;">
        Banco de Preguntas para Residencias Médicas
      </p>

      <div class="menu-buttons">

        <button class="btn-main menu-btn" onclick="goChoice()">
          📚 Práctica por tema
        </button>

        <button class="btn-main menu-btn" onclick="goExamenes()">
          📝 Exámenes anteriores
        </button>

        <button class="btn-main menu-btn" onclick="goCrearExamen()">
          🎯 Crear tu examen
        </button>

        <button class="btn-main menu-btn" onclick="goStats()">
          📊 Estadísticas
        </button>

        <button class="btn-main menu-btn" onclick="goNotas()">
          📔 Mis notas
        </button>
      </div>

      <div style="margin-top:30px;font-size:14px;color:#64748b;">
        ${cargado
          ? `✔ Banco cargado (${preguntas} preguntas)`
          : `⚠ Aún no cargaste los bancos`}
      </div>

      <div style="margin-top:12px;">
        <button class="btn-small" onclick="recargarBancoDesdeHome()">
          🔄 ${cargado ? "Recargar bancos" : "Cargar bancos"}
        </button>
      </div>

    </div>
  `;
}

/* ==========================================================
   🔀 Navegación universal
   ========================================================== */

function goChoice() {
  if (!BANK.loaded) return alert("Primero cargá los bancos.");
  renderChoice();
}

function goExamenes() {
  if (!BANK.loaded) return alert("Primero cargá los bancos.");
  renderExamenesMain();
}

function goCrearExamen() {
  if (!BANK.loaded) return alert("Primero cargá los bancos.");
  renderCrearExamen();   // ✅ AHORA SÍ: nombre correcto
}

function goStats() {
  if (!BANK.loaded) return alert("Primero cargá los bancos.");
  renderStats();
}

function goNotas() {
  if (!BANK.loaded) return alert("Primero cargá los bancos.");
  renderNotasMain();
}

/* ==========================================================
   🔄 Cargar / recargar bancos
   ========================================================== */

async function recargarBancoDesdeHome() {
  const ok = confirm("¿Querés cargar o recargar TODOS los bancos ahora?");
  if (!ok) return;

  await loadAllBanks();

  alert("✔ Bancos cargados correctamente");
  renderHome();
}
