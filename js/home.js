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

        <!-- 1. Práctica por materia -->
        <button class="btn-main menu-btn" onclick="goChoiceMaterias()">
          📚 Práctica por materia
        </button>

        <!-- 2. Exámenes anteriores -->
        <button class="btn-main menu-btn" onclick="goExamenes()">
          📝 Exámenes anteriores
        </button>

        <!-- 3. Crear tu examen -->
        <button class="btn-main menu-btn" onclick="goCrearExamen()">
          🎯 Crear tu examen
        </button>

        <!-- 4. Estadísticas -->
        <button class="btn-main menu-btn" onclick="goStats()">
          📊 Estadísticas
        </button>

        <!-- 5. Notas -->
        <button class="btn-main menu-btn" onclick="goNotas()">
          📔 Mis notas
        </button>
      </div>

      <!-- Estado del banco -->
      <div style="margin-top:30px;font-size:14px;color:#64748b;">
        ${cargado
          ? `✔ Banco cargado (${preguntas} preguntas)`
          : `⚠ Aún no cargaste los bancos`}
      </div>

      <!-- Botón discreto para recargar bancos -->
      <div style="margin-top:12px;">
        <button class="btn-small" onclick="recargarBancoDesdeHome()">
          🔄 ${cargado ? "Recargar bancos" : "Cargar bancos"}
        </button>
      </div>

    </div>
  `;
}

/* ==========================================================
   🌐 Navegación simple
   (estas funciones solo redirigen a las otras pantallas)
   ========================================================== */

function goChoiceMaterias() {
  if (!BANK.loaded) return alert("Primero cargá los bancos.");
  renderChoiceMaterias();
}

function goExamenes() {
  if (!BANK.loaded) return alert("Primero cargá los bancos.");
  renderExamenesMain();
}

function goCrearExamen() {
  if (!BANK.loaded) return alert("Primero cargá los bancos.");
  renderCrearExamen();
}

function goStats() {
  if (!BANK.loaded) return alert("Primero cargá los bancos.");
  renderStatsMain();
}

function goNotas() {
  if (!BANK.loaded) return alert("Primero cargá los bancos.");
  renderNotasMain();
}

/* ==========================================================
   🔄 Recarga manual desde Home
   ========================================================== */

async function recargarBancoDesdeHome() {
  const confirmacion = confirm(
    "¿Querés cargar o recargar TODOS los bancos ahora?"
  );
  if (!confirmacion) return;

  await loadAllBanks();

  alert("✔ Bancos cargados correctamente");

  renderHome();
}
