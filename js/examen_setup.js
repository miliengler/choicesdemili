/* ==========================================================
   🎯 MEbank 3.0 – Simulacro de Examen (Final)
   ========================================================== */

function renderCrearExamen() {
  const app = document.getElementById("app");

  // 1. CÁLCULO DE TOTALES
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

  // Generamos la lista de materias (Cajones individuales)
  const lista = materias.map(m => `
    <label class="materia-box" onclick="updateMaxPreguntas()">
      
      <div style="flex:1;">
        <div style="font-weight:700; font-size:16px; color:#1e293b; margin-bottom:4px;">${m.name}</div>
        <div style="font-size:12px; color:#64748b;">${m.total} preguntas disponibles</div>
      </div>

      <div style="display:flex; align-items:center; padding-left:15px; border-left:1px solid #f1f5f9;">
        <input type="checkbox" class="mk-mat normal-checkbox" value="${m.slug}" checked>
      </div>

    </label>
  `).join("");

  // Estilos CSS inyectados
  const styles = `
    <style>
      .materia-box {
        display: flex; justify-content: space-between; align-items: center;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 16px;
        margin-bottom: 12px;
        cursor: pointer;
        transition: transform 0.1s, box-shadow 0.2s;
      }
      .materia-box:hover {
        border-color: #cbd5e1;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        transform: translateY(-1px);
      }
      
      .normal-checkbox {
        width: 18px; height: 18px; cursor: pointer;
        accent-color: #3b82f6;
      }
      
      .ctrl-link {
         font-size: 14px; font-weight: 600; cursor: pointer; transition: color 0.2s;
      }
      .ctrl-active { color: #1e3a8a; }
      .ctrl-inactive { color: #cbd5e1; cursor: default; pointer-events: none; }
    </style>
  `;

  app.innerHTML = `
    ${styles}
    <div id="choice-shell" class="card fade" style="max-width:900px; margin:auto;">
      
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; gap:10px;">
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            <h2 style="margin:0;">🎯 Simulacro de Examen</h2>
            <button onclick="mostrarInfoExamen()" 
                    style="width:24px; height:24px; border-radius:50%; border:1px solid #cbd5e1; background:white; color:#64748b; font-size:14px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center;">
              ?
            </button>
          </div>
          <p style="color:#64748b; margin:0; font-size:14px;">
             Seleccioná las materias para armar tu simulacro personalizado.
          </p>
        </div>
        
        <button class="btn-small" onclick="renderHome()" style="white-space:nowrap; background:#fff; border:1px solid #e2e8f0; color:#475569;">
           ⬅ Volver
        </button>
      </div>

      <div id="global-controls" style="display:flex; justify-content:flex-end; align-items:center; margin-bottom:15px; padding-right:5px;">
         </div>

      <div style="margin-bottom:30px;">
        ${lista}
      </div>

      <div style="position:sticky; bottom:20px; background:white; padding:15px; border-radius:12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); border:1px solid #e2e8f0; display:flex; flex-wrap:wrap; gap:15px; justify-content:space-between; align-items:center; z-index:100;">
        
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="text-align:right;">
             <div style="font-size:11px; color:#64748b; font-weight:700; letter-spacing:0.5px;">CANTIDAD</div>
             <div id="mk-max-hint" style="font-size:11px; color:#94a3b8;">(Max: ${totalAll})</div>
          </div>
          <input id="mk-total" type="number" min="1" value="100" 
                 style="width:80px; padding:8px; border-radius:8px; border:1px solid #cbd5e1; font-size:18px; font-weight:bold; text-align:center; color:#334155;">
        </div>

        <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
          <input type="checkbox" id="mk-timer" checked style="width:18px; height:18px;">
          <span style="font-size:14px; color:#334155; font-weight:600;">Cronómetro</span>
        </label>

        <button class="btn-main" style="padding:10px 25px; font-size:1.1rem; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);" 
                onclick="startExamenPersonalizado()">
          ▶ Comenzar Simulacro
        </button>

      </div>

    </div>
  `;
  
  updateMaxPreguntas();
}

/* ==========================================================
   ⚙️ LÓGICA AUXILIAR
   ========================================================== */

function mostrarInfoExamen() {
    // Opción A: Profesional
    alert("ℹ️ MODO EXAMEN\n\nEste modo te permite simular las condiciones reales de evaluación. Seleccioná las materias que quieras integrar, definí la extensión del examen y entrená tu agilidad mental con preguntas aleatorias y cronómetro activo.");
}

function toggleGlobalSelection(state) {
    const checkboxes = document.querySelectorAll('.mk-mat');
    checkboxes.forEach(chk => chk.checked = state);
    updateMaxPreguntas();
}

function updateMaxPreguntas() {
  const allCheckboxes = Array.from(document.querySelectorAll(".mk-mat"));
  const checkedBoxes = allCheckboxes.filter(c => c.checked);
  
  const totalItems = allCheckboxes.length;
  const selectedCount = checkedBoxes.length;

  // Renderizar controles de texto
  const container = document.getElementById("global-controls");
  if (container) {
      const allSelected = selectedCount === totalItems;
      const noneSelected = selectedCount === 0;

      container.innerHTML = `
        <span class="ctrl-link ${allSelected ? 'ctrl-inactive' : 'ctrl-active'}" 
              onclick="toggleGlobalSelection(true)">Marcar todos</span>
        <span style="color:#e2e8f0; margin:0 8px;">|</span>
        <span class="ctrl-link ${noneSelected ? 'ctrl-inactive' : 'ctrl-active'}" 
              onclick="toggleGlobalSelection(false)">Desmarcar todos</span>
      `;
  }

  // Calcular disponibles
  const checksValues = checkedBoxes.map(c => c.value);
  const poolSize = BANK.questions.filter(q => {
      const mat = q.materia;
      if (Array.isArray(mat)) return mat.some(m => checksValues.includes(m));
      return checksValues.includes(mat);
  }).length;

  // Actualizar Inputs
  const input = document.getElementById("mk-total");
  const hint = document.getElementById("mk-max-hint");
  
  if (input) {
      input.max = poolSize;
      // Si el valor actual supera el máximo real, lo bajamos. 
      // Si es 100 (default) y hay menos de 100, se ajusta solo.
      if (parseInt(input.value) > poolSize) input.value = poolSize;
      if (poolSize === 0) input.value = 0;
  }
  
  if (hint) {
      hint.textContent = `(Max: ${poolSize})`;
  }
}

function startExamenPersonalizado() {
  const checks = Array.from(document.querySelectorAll(".mk-mat"))
    .filter(c => c.checked)
    .map(c => c.value);

  if (!checks.length) {
    alert("⚠ Seleccioná al menos una materia.");
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
    alert("No hay preguntas disponibles.");
    return;
  }

  pool = pool.sort(() => Math.random() - 0.5).slice(0, total);

  iniciarResolucion({
    modo: "personalizado",
    preguntas: pool,
    usarTimer,
    permitirRetroceso: true,
    mostrarNotas: true,
    titulo: "🎯 Simulacro Personalizado"
  });
}
