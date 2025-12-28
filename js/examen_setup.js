/* ==========================================================
   🎯 MEbank 3.0 – Configuración de Examen (Diseño Renovado)
   ========================================================== */

function renderCrearExamen() {
  const app = document.getElementById("app");

  // 1. CÁLCULO DE TOTALES (Lógica de Arrays)
  const materias = BANK.subjects.map(s => {
    const total = BANK.questions.filter(q => {
        if (Array.isArray(q.materia)) return q.materia.includes(s.slug);
        return q.materia === s.slug;
    }).length;
    return { ...s, total };
  }).filter(m => m.total > 0);

  // Orden alfabético
  materias.sort((a, b) =>
    a.name.replace(/[^\p{L}\p{N} ]/gu, "")
      .localeCompare(b.name.replace(/[^\p{L}\p{N} ]/gu, ""), "es", { sensitivity: "base" })
  );

  const totalAll = BANK.questions.length; 

  // Generamos la lista de materias con estilo más limpio
  const lista = materias.map(m => `
    <label class="mat-row">
      <div style="display:flex; align-items:center; gap:10px;">
        <input type="checkbox" class="mk-mat" value="${m.slug}"
               onchange="updateMaxPreguntas()" checked>
        <span class="mat-name">${m.name}</span>
      </div>
      <span class="mat-badge">${m.total}</span>
    </label>
  `).join("");

  // Estilos CSS inyectados para esta pantalla (para no tocar el style.css global por ahora)
  const styles = `
    <style>
      .mat-row {
        display: flex; justify-content: space-between; align-items: center;
        padding: 12px 10px;
        border-bottom: 1px solid #f1f5f9;
        cursor: pointer;
        transition: background 0.2s;
      }
      .mat-row:hover { background: #f8fafc; }
      .mat-name { font-weight: 500; color: #334155; }
      .mat-badge { 
        background: #e2e8f0; color: #64748b; 
        font-size: 12px; padding: 2px 8px; border-radius: 10px; font-weight: 600;
      }
      .btn-icon-head {
        background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b;
      }
      .btn-icon-head:hover { color: #334155; transform: scale(1.1); }
      .config-box {
        background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px;
        margin-top: 20px; display: flex; flex-wrap: wrap; gap: 20px; justify-content: space-around; align-items: center;
      }
    </style>
  `;

  app.innerHTML = `
    ${styles}
    <div class="card fade" style="max-width:800px; margin:20px auto; padding:25px; position:relative;">
      
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:15px; border-bottom:2px solid #f1f5f9;">
          <div style="display:flex; align-items:center; gap:8px;">
            <h2 style="margin:0; font-size:1.5rem; color:#1e293b;">🛠 Crear Examen</h2>
            <button class="btn-icon-head" onclick="mostrarInfoExamen()" title="Información">
              <span style="font-size:18px; border:2px solid #cbd5e1; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-weight:bold;">?</span>
            </button>
          </div>
          <button class="btn-small" onclick="renderHome()" style="background:#fff; border:1px solid #cbd5e1; color:#475569;">
            ✖ Volver
          </button>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding:0 10px;">
         <span style="font-size:0.9rem; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px;">Materias Disponibles</span>
         <label style="font-size:14px; color:#3b82f6; cursor:pointer; font-weight:600; display:flex; align-items:center; gap:6px;">
            <input type="checkbox" id="chk-all" checked onchange="toggleSelectAll(this)">
            Seleccionar todas
         </label>
      </div>

      <div style="max-height: 400px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
        ${lista}
      </div>

      <div class="config-box">
        <div style="flex:1; min-width:200px;">
          <label for="mk-total" style="font-size:14px; color:#64748b; font-weight:600; display:block; margin-bottom:5px;">Cantidad de preguntas</label>
          <div style="display:flex; align-items:center; gap:10px;">
             <input id="mk-total" type="number" min="1" value="50" 
                 style="width:100px; padding:8px; border-radius:6px; border:1px solid #cbd5e1; font-size:16px; font-weight:bold; text-align:center;">
             <span id="mk-max-hint" style="font-size:13px; color:#94a3b8;">(Máx: ${totalAll})</span>
          </div>
        </div>

        <div style="flex:1; min-width:200px; display:flex; align-items:center; gap:10px;">
          <input type="checkbox" id="mk-timer" checked style="width:20px; height:20px;">
          <label for="mk-timer" style="font-size:15px; color:#334155; font-weight:500; cursor:pointer;">⏱ Activar cronómetro</label>
        </div>
      </div>

      <div style="margin-top:25px; text-align:center;">
        <button class="btn-main" style="width:100%; max-width:400px; padding:12px; font-size:1.1rem; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);" onclick="startExamenPersonalizado()">
          ▶ COMENZAR SIMULACRO
        </button>
      </div>

    </div>
  `;
  
  updateMaxPreguntas();
}

/* ==========================================================
   ⚙️ FUNCIONES AUXILIARES
   ========================================================== */

// 1. Marcar / Desmarcar todas
function toggleSelectAll(source) {
    const checkboxes = document.querySelectorAll('.mk-mat');
    checkboxes.forEach(chk => chk.checked = source.checked);
    updateMaxPreguntas();
}

// 2. Mostrar Info (Alerta simple y limpia)
function mostrarInfoExamen() {
    alert(
      "🎯 MODO CREADOR DE EXAMEN\n\n" +
      "• Aquí puedes diseñar tu propia práctica.\n" +
      "• Selecciona las materias que quieras repasar.\n" +
      "• El sistema mezclará preguntas al azar de esas materias.\n" +
      "• Define cuántas preguntas quieres responder.\n\n" +
      "¡Ideal para hacer simulacros cortos de temas específicos!"
    );
}

// 3. Actualizar máximo (Lógica Arrays)
function updateMaxPreguntas() {
  const checks = Array.from(document.querySelectorAll(".mk-mat"))
    .filter(c => c.checked)
    .map(c => c.value);

  // Controlar el checkbox "Seleccionar todas" visualmente
  const allCheckboxes = document.querySelectorAll(".mk-mat");
  const chkAll = document.getElementById("chk-all");
  if(chkAll) {
      if(checks.length === 0) chkAll.checked = false;
      else if(checks.length === allCheckboxes.length) chkAll.checked = true;
      else chkAll.indeterminate = true; // Estado "guion" si hay selección parcial
  }

  const poolSize = BANK.questions.filter(q => {
      const mat = q.materia;
      if (Array.isArray(mat)) return mat.some(m => checks.includes(m));
      return checks.includes(mat);
  }).length;

  const input = document.getElementById("mk-total");
  const hint = document.getElementById("mk-max-hint");
  
  if (input) {
      input.max = poolSize;
      if (parseInt(input.value) > poolSize) input.value = poolSize;
      if (poolSize === 0) input.value = 0;
  }
  
  if (hint) {
      hint.textContent = `(Máx disponible: ${poolSize})`;
  }
}

// 4. Iniciar (Con Insignias)
function startExamenPersonalizado() {
  const checks = Array.from(document.querySelectorAll(".mk-mat"))
    .filter(c => c.checked)
    .map(c => c.value);

  if (!checks.length) {
    alert("⚠ Seleccioná al menos una materia para empezar.");
    return;
  }

  const totalInput = document.getElementById("mk-total");
  const total = parseInt(totalInput.value) || 10;
  const usarTimer = document.getElementById("mk-timer").checked;

  let pool = BANK.questions.filter(q => {
      const mat = q.materia;
      if (Array.isArray(mat)) return mat.some(m => checks.includes(m));
      return checks.includes(mat);
  });

  if (!pool.length) {
    alert("No hay preguntas disponibles con esa selección.");
    return;
  }

  pool = pool.sort(() => Math.random() - 0.5).slice(0, total);

  iniciarResolucion({
    modo: "personalizado",
    preguntas: pool,
    usarTimer,
    permitirRetroceso: true,
    mostrarNotas: true,
    titulo: "🎯 Examen Personalizado"
  });
}
