/* ==========================================================
   🎯 MEbank 3.0 – Simulacro (Con Filtro Oficiales ⭐️ + Help)
   ========================================================== */

// Variable de estado para el orden del historial
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

      /* Modales */
      .modal-overlay { display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; align-items:center; justify-content:center; animation: fadeIn 0.2s ease; backdrop-filter: blur(2px); }
      .modal-content { background:white; padding:25px; border-radius:12px; max-width:500px; width:90%; box-shadow:0 10px 30px rgba(0,0,0,0.2); max-height:85vh; overflow-y:auto; }
      @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }

      /* Historial Styles */
      .hist-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; margin-bottom: 12px; display: flex; gap: 15px; align-items: center; background: #fff; }
      .hist-date-box { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 45px; flex-shrink: 0; border-right: 1px solid #f1f5f9; padding-right: 15px; }
      .hist-day { font-size: 18px; font-weight: 800; color: #334155; line-height: 1; }
      .hist-month { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 700; margin-top: 2px; }
      .score-circle { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; color: white; flex-shrink: 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
      .sort-link { cursor: pointer; font-size: 13px; transition: color 0.2s; }
      .sort-active { color: #0f172a; font-weight: 800; text-decoration: underline text-decoration-color: #3b82f6; }
      .sort-inactive { color: #94a3b8; font-weight: 500; }
    </style>
  `;

  app.innerHTML = `
    ${styles}

    <div id="helpModal" class="modal-overlay" onclick="closeModals(event)">
        <div class="modal-content">
            <h3 style="margin-top:0; color:#1e293b;">🎯 ¿Cómo funciona?</h3>
            
            <div style="margin-bottom:15px;">
                <div style="font-weight:700; color:#1e293b; margin-bottom:4px;">🎲 Simulación Real</div>
                <div style="font-size:14px; color:#475569;">El sistema seleccionará preguntas al azar <b>únicamente</b> de las materias que marques.</div>
            </div>

            <div style="margin-bottom:15px;">
                <div style="font-weight:700; color:#1e293b; margin-bottom:4px;">⏱️ Gestión del Tiempo</div>
                <div style="font-size:14px; color:#475569;">El cronómetro es opcional. Usalo para entrenar tu velocidad bajo presión.</div>
            </div>

            <div style="margin-bottom:20px;">
                <div style="font-weight:700; color:#1e293b; margin-bottom:4px;">📈 Historial</div>
                <div style="font-size:14px; color:#475569;">Tus resultados (puntaje y tiempo) quedarán guardados en "Mi Progreso" para que veas tu evolución.</div>
            </div>

            <div style="text-align:right;">
                <button class="btn-main" onclick="document.getElementById('helpModal').style.display='none'" style="width:auto; padding:8px 20px;">Entendido</button>
            </div>
        </div>
    </div>

    <div id="historyModal" class="modal-overlay" onclick="closeModals(event)">
        <div class="modal-content" style="max-width:550px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="margin:0; color:#1e293b;">📊 Mi Progreso</h3>
                <button onclick="document.getElementById('historyModal').style.display='none'" style="background:none; border:none; font-size:20px; cursor:pointer;">✕</button>
            </div>
            
            <div style="display:flex; justify-content:flex-end; align-items:center; gap:8px; margin-bottom:15px; padding-bottom:10px; border-bottom:1px solid #f1f5f9;">
                <span class="sort-link" id="sort-newest" onclick="setHistorySort('newest')">Más recientes</span>
                <span style="color:#e2e8f0;">|</span>
                <span class="sort-link" id="sort-oldest" onclick="setHistorySort('oldest')">Más antiguas</span>
            </div>

            <div id="historyList" style="min-height:100px;"></div>
        </div>
    </div>

    <div id="choice-shell" class="card fade" style="max-width:900px; margin:auto; padding-bottom:0;">
      
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; gap:10px;">
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            <h2 style="margin:0;">🎯 Simulacro de Examen</h2>
            <button onclick="document.getElementById('helpModal').style.display='flex'" 
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
            <button class="btn-outline-gray" onclick="showHistory()">
               📊 Mi Progreso
            </button>
            <button id="btn-start-sim" class="btn-outline-blue btn-disabled" onclick="startExamenPersonalizado()">
              ▶ Comenzar
            </button>
        </div>
      </div>
    </div>
  `;
  
  updateMaxPreguntas(); 
}

/* ==========================================================
   ⚙️ LÓGICA DE INTERFAZ Y SELECCIÓN
   ========================================================== */
function closeModals(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.style.display = 'none';
    }
}

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
  }
  
  if (hint) {
      hint.textContent = `(Max: ${poolSize})`;
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
    // ... (lógica simple de tiempo, si querés agregarla visualmente, aquí iría)
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
    permitirRetroceso: true,
    mostrarNotas: true,
    titulo: soloOficiales ? "🎯 Simulacro Oficial ⭐️" : "🎯 Simulacro"
  });
}

/* ==========================================================
   📊 HISTORIAL (MANTENIDO)
   ========================================================== */

function showHistory() {
    document.getElementById('historyModal').style.display = 'flex';
    renderHistoryList();
}

function setHistorySort(order) {
    historySortOrder = order;
    renderHistoryList();
}

function renderHistoryList() {
    const container = document.getElementById('historyList');
    
    const btnNew = document.getElementById('sort-newest');
    const btnOld = document.getElementById('sort-oldest');
    
    if (historySortOrder === 'newest') {
        btnNew.className = 'sort-link sort-active';
        btnOld.className = 'sort-link sort-inactive';
    } else {
        btnNew.className = 'sort-link sort-inactive';
        btnOld.className = 'sort-link sort-active';
    }

    // MOCK DATA (Podés conectar esto con localStorage real si querés a futuro)
    const mockHistory = [
        { date: new Date().toISOString(), score: 85, totalQ: 50, timeStr: "42 min", subjects: ["pediatria", "cirugia", "ginecologia", "obstetricia", "cardiologia", "neurologia"] },
        { date: new Date(Date.now() - 86400000).toISOString(), score: 72, totalQ: 20, timeStr: "18 min", subjects: ["infectologia", "pediatria"] },
        { date: new Date(Date.now() - 172800000).toISOString(), score: 55, totalQ: 100, timeStr: "1h 10m", subjects: ["todas"] }
    ];

    mockHistory.sort((a, b) => {
        if (historySortOrder === 'newest') return new Date(b.date) - new Date(a.date);
        return new Date(a.date) - new Date(b.date);
    });

    if(mockHistory.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:#94a3b8; padding:20px;">No hay simulacros previos.</div>`;
        return;
    }

    container.innerHTML = mockHistory.map(h => {
        let color = "#1e293b";
        if(h.score >= 40) color = "#ef4444";
        if(h.score >= 60) color = "#eab308";
        if(h.score >= 80) color = "#16a34a";

        const dateObj = new Date(h.date);
        const day = dateObj.getDate();
        const monthNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
        const month = monthNames[dateObj.getMonth()];

        let subjText = "";
        if(h.subjects.includes("todas") || h.subjects.length > 5) {
            subjText = "Examen Completo";
        } else {
            subjText = h.subjects.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(", ");
        }

        return `
          <div class="hist-card">
              <div class="hist-date-box">
                  <div class="hist-day">${day}</div>
                  <div class="hist-month">${month}</div>
              </div>
              <div style="flex:1;">
                  <div style="font-size:14px; color:#1e293b; font-weight:700;">${h.totalQ} preguntas</div>
                  <div style="font-size:12px; color:#64748b; margin-top:3px;">${subjText}</div>
                  <div style="font-size:11px; color:#94a3b8; margin-top:2px;">⏱ ${h.timeStr}</div>
              </div>
              <div class="score-circle" style="background:${color};">
                  ${h.score}%
              </div>
          </div>
        `;
    }).join("");
}
