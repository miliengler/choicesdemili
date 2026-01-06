/* ==========================================================
   🎯 MEbank 3.0 – Simulacro (Con Filtro Oficiales ⭐️)
   ========================================================== */

let historySortOrder = 'newest';

function renderCrearExamen() {
  const app = document.getElementById("app");

  // 1. CÁLCULO DE TOTALES (Sin filtrar, solo para mostrar disponibles)
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

  const lista = materias.map(m => `
    <label class="materia-box" onclick="updateMaxPreguntas()">
      <div style="flex:1;">
        <div style="font-weight:700; font-size:16px; color:#1e293b; margin-bottom:4px;">${m.name}</div>
        <div style="font-size:12px; color:#64748b;">${m.total} preguntas totales</div>
      </div>
      <div style="display:flex; align-items:center; padding-left:15px; border-left:1px solid #f1f5f9;">
        <input type="checkbox" class="mk-mat normal-checkbox" value="${m.slug}">
      </div>
    </label>
  `).join("");

  const styles = `
    <style>
      .materia-box { display: flex; justify-content: space-between; align-items: center; background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s; position: relative; }
      .box-selected { border-color: #3b82f6 !important; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1); background-color: #eff6ff; }
      .normal-checkbox { width: 18px; height: 18px; cursor: pointer; accent-color: #3b82f6; }
      .ctrl-link { font-size: 14px; font-weight: 600; cursor: pointer; transition: color 0.2s; }
      .ctrl-active { color: #1e3a8a; }
      .ctrl-inactive { color: #cbd5e1; cursor: default; pointer-events: none; }
      
      .btn-outline-blue { background: white; border: 1px solid #3b82f6; color: #1d4ed8; font-weight: 700; padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 5px rgba(59, 130, 246, 0.1); }
      .btn-outline-blue:hover { background: #eff6ff; transform: translateY(-1px); }
      .btn-disabled { background: #f1f5f9; border: 1px solid #cbd5e1; color: #94a3b8; cursor: not-allowed; box-shadow: none; transform: none !important; }
      .btn-outline-gray { background: white; border: 1px solid #cbd5e1; color: #475569; font-weight: 600; padding: 10px 15px; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
      
      /* Switch Oficiales */
      .toggle-switch { position: relative; display: inline-block; width: 34px; height: 20px; margin-right: 8px; }
      .toggle-switch input { opacity: 0; width: 0; height: 0; }
      .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 20px; }
      .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
      input:checked + .slider { background-color: #16a34a; }
      input:checked + .slider:before { transform: translateX(14px); }
    </style>
  `;

  app.innerHTML = `
    ${styles}
    <div id="choice-shell" class="card fade" style="max-width:900px; margin:auto; padding-bottom:0;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; gap:10px;">
        <div style="flex:1;">
          <h2 style="margin:0;">🎯 Simulacro de Examen</h2>
          <p style="color:#64748b; margin:0; font-size:14px;">Seleccioná las materias.</p>
        </div>
        <button class="btn-small" onclick="renderHome()">⬅ Volver</button>
      </div>

      <div id="global-controls" style="display:flex; justify-content:flex-end; align-items:center; margin-bottom:15px; padding-right:5px;"></div>

      <div style="margin-bottom:20px;">${lista}</div>

      <div style="position:sticky; bottom:20px; background:rgba(255, 255, 255, 0.95); backdrop-filter: blur(5px);
                  padding:15px; border-radius:12px; box-shadow: 0 4px 25px rgba(0,0,0,0.15); border:1px solid #cbd5e1; 
                  display:flex; flex-wrap:wrap; gap:15px; justify-content:space-between; align-items:center; z-index:100;">
        
        <div style="display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
           <div style="display:flex; align-items:center; gap:8px;">
              <div style="text-align:right;">
                 <div style="font-size:10px; color:#64748b; font-weight:700; letter-spacing:0.5px;">CANTIDAD</div>
                 <div id="mk-max-hint" style="font-size:10px; color:#94a3b8;">(Max: 0)</div>
              </div>
              <input id="mk-total" type="number" min="1" value="100" oninput="calculateTimeEstimate()"
                     style="width:70px; padding:8px; border-radius:8px; border:1px solid #cbd5e1; font-size:16px; font-weight:bold; text-align:center; color:#334155;">
           </div>

           <div style="display:flex; align-items:center; border-left:1px solid #e2e8f0; padding-left:15px;">
               <label class="toggle-switch">
                  <input type="checkbox" id="mk-oficiales" onchange="updateMaxPreguntas()">
                  <span class="slider"></span>
               </label>
               <div style="font-size:13px; font-weight:600; color:#166534; cursor:pointer;" onclick="document.getElementById('mk-oficiales').click()">
                  Solo Oficiales ⭐️
               </div>
           </div>

           <label style="display:flex; align-items:center; gap:6px; cursor:pointer; padding-left:10px; border-left:1px solid #e2e8f0;">
              <input type="checkbox" id="mk-timer" checked style="width:16px; height:16px;">
              <span style="font-size:13px; color:#334155; font-weight:600;">Reloj</span>
           </label>
        </div>

        <div style="display:flex; gap:10px;">
            <button id="btn-start-sim" class="btn-outline-blue btn-disabled" onclick="startExamenPersonalizado()">▶ Comenzar</button>
        </div>
      </div>
    </div>
  `;
  
  updateMaxPreguntas(); 
}

/* ==========================================================
   ⚙️ LÓGICA DE INTERFAZ Y SELECCIÓN
   ========================================================== */
function toggleGlobalSelection(state) {
    const checkboxes = document.querySelectorAll('.mk-mat');
    checkboxes.forEach(chk => chk.checked = state);
    updateMaxPreguntas();
}

function updateMaxPreguntas() {
  const labels = document.querySelectorAll(".materia-box");
  const checkedBoxes = [];
  
  // 1. Ver cuáles están seleccionados
  labels.forEach(lbl => {
      const chk = lbl.querySelector("input");
      if (chk.checked) {
          lbl.classList.add("box-selected");
          checkedBoxes.push(chk);
      } else {
          lbl.classList.remove("box-selected");
      }
  });

  // 2. Render de controles Marcar/Desmarcar
  const totalItems = labels.length;
  const selectedCount = checkedBoxes.length;
  const container = document.getElementById("global-controls");
  if (container) {
      container.innerHTML = `
        <span class="ctrl-link ${selectedCount === totalItems ? 'ctrl-inactive' : 'ctrl-active'}" onclick="toggleGlobalSelection(true)">Marcar todos</span>
        <span style="color:#e2e8f0; margin:0 8px;">|</span>
        <span class="ctrl-link ${selectedCount === 0 ? 'ctrl-inactive' : 'ctrl-active'}" onclick="toggleGlobalSelection(false)">Desmarcar todos</span>
      `;
  }

  // 3. CALCULAR POOL DISPONIBLE (CON FILTRO)
  const soloOficiales = document.getElementById("mk-oficiales").checked;
  const checksValues = checkedBoxes.map(c => c.value);
  
  const poolSize = BANK.questions.filter(q => {
      const mat = Array.isArray(q.materia) ? q.materia : [q.materia];
      const matchMateria = mat.some(m => checksValues.includes(m));
      
      if (!matchMateria) return false;
      
      // FILTRO OFICIAL
      if (soloOficiales && q.oficial !== true) return false;
      
      return true;
  }).length;

  // 4. Actualizar Inputs
  const input = document.getElementById("mk-total");
  const hint = document.getElementById("mk-max-hint");
  const btnStart = document.getElementById("btn-start-sim");
  
  if (input) {
      input.max = poolSize;
      if (parseInt(input.value) > poolSize) input.value = poolSize;
      if (poolSize === 0) input.value = 0;
      
      // Si el usuario quiere más de lo que hay, ajustamos
      // Pero si quiere menos, lo respetamos.
  }
  
  if (hint) {
      hint.textContent = `(Max: ${poolSize})`;
      // Cambiar color si es oficial para feedback visual
      hint.style.color = soloOficiales ? "#16a34a" : "#94a3b8";
  }

  if (btnStart) {
      if (selectedCount === 0 || poolSize === 0) {
          btnStart.classList.add("btn-disabled");
          btnStart.disabled = true;
      } else {
          btnStart.classList.remove("btn-disabled");
          btnStart.disabled = false;
      }
  }
  calculateTimeEstimate();
}

function calculateTimeEstimate() {
    const input = document.getElementById("mk-total");
    if(!input) return;
    const val = parseInt(input.value) || 0;
    // ... (lógica de tiempo igual)
}

function startExamenPersonalizado() {
  const checks = Array.from(document.querySelectorAll(".mk-mat"))
    .filter(c => c.checked)
    .map(c => c.value);

  const totalInput = document.getElementById("mk-total");
  const total = parseInt(totalInput.value) || 10;
  const usarTimer = document.getElementById("mk-timer").checked;
  const soloOficiales = document.getElementById("mk-oficiales").checked;

  let pool = BANK.questions.filter(q => {
      const mat = Array.isArray(q.materia) ? q.materia : [q.materia];
      const matchMateria = mat.some(m => checks.includes(m));
      
      if (!matchMateria) return false;
      if (soloOficiales && q.oficial !== true) return false;

      return true;
  });

  if (!pool.length) return alert("Error: No hay preguntas con esta configuración.");

  pool = pool.sort(() => Math.random() - 0.5).slice(0, total);

  iniciarResolucion({
    modo: "personalizado",
    preguntas: pool,
    usarTimer,
    titulo: soloOficiales ? "🎯 Simulacro Oficial ⭐️" : "🎯 Simulacro"
  });
}
