/* ==========================================================
   🏠 MEbank – Pantalla principal (HOME v2)
   ========================================================== */

function renderHome() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="home-menu fade" 
         style="text-align:center;display:flex;flex-direction:column;
                align-items:center;gap:12px;margin-top:40px;">

      <button class="btn-main btn-blue" onclick="renderChoice()">
        🧩 Practice por materia
      </button>

      <button class="btn-main btn-blue" onclick="renderExamenes()">
        📄 Exámenes anteriores
      </button>

      <button class="btn-main btn-blue" onclick="renderExamenSetup()">
        🧠 Crear tu examen
      </button>

      <button class="btn-main btn-blue" onclick="renderStatsGlobal()">
        📊 Estadísticas
      </button>

      <button class="btn-main btn-blue" onclick="renderNotasMain()">
        📔 Mis notas
      </button>

      <hr class="divider">

      <button class="btn-small btn-grey" onclick="manualBankReload()">
        🔄 Actualizar bancos
      </button>

      <button class="btn-small btn-grey" onclick="forceReloadBank()">
        ♻ Recarga completa
      </button>
    </div>
  `;
}

/* ==========================================================
   📝 Placeholder para notas (hasta implementar)
   ========================================================== */
function renderNotasMain() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="card fade" style="max-width:700px;margin:auto;text-align:center;">
      <h2>📔 Notas</h2>
      <p style="color:#64748b;font-size:14px;">Sección en desarrollo</p>
      <button class="btn-small" onclick="renderHome()">⬅ Volver</button>
    </div>
  `;
}
