/* ==========================================================
   🎯 MEbank 3.0 – Simulacro (Pro + Historial Rediseñado)
   ========================================================== */

// Variable de estado para el orden del historial
let historySortOrder = 'newest'; // 'newest' | 'oldest'

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

  // Generamos la lista (SIN CHECKED por defecto)
  const lista = materias.map(m => `
    <label class="materia-box" onclick="updateMaxPreguntas()">
      
      <div style="flex:1;">
        <div style="font-weight:700; font-size:16px; color:#1e293b; margin-bottom:4px;">${m.name}</div>
        <div style="font-size:12px; color:#64748b;">${m.total} preguntas disponibles</div>
      </div>

      <div style="display:flex; align-items:center; padding-left:15px; border-left:1px solid #f1f5f9;">
        <input type="checkbox" class="mk-mat normal-checkbox" value="${m.slug}">
      </div>

    </label>
  `).join("");

  // --- ESTILOS CSS ---
  const styles = `
    <style>
      .materia-box {
        display: flex; justify-content: space-between; align-items: center;
        background: white; border: 1px solid #e2e8f0; border-radius: 10px;
        padding: 16px; margin-bottom: 12px; cursor: pointer;
        transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative; -webkit-tap-highlight-color: transparent; 
      }
      @media (hover: hover) {
        .materia-box:hover { border-color: #cbd5e1; }
      }
      .box-selected {
        transform: scale(1.02); border-color: #3b82f6 !important;
        box-shadow: 0 8px 20px rgba(59, 130, 246, 0.15);
        z-index: 10; background-color: #fff;
      }
      .normal-checkbox { width: 18px; height: 18px; cursor: pointer; accent-color: #3b82f6; }
      
      .ctrl-link { font-size: 14px; font-weight: 600; cursor: pointer; transition: color 0.2s; }
      .ctrl-active { color: #1e3a8a; }
      .ctrl-inactive { color: #cbd5e1; cursor: default; pointer-events: none; }
      
      .btn-outline-blue {
        background: white; border: 1px solid #3b82f6; color: #1d4ed8;
        font-weight: 700; padding: 10px 20px; border-radius: 8px; cursor: pointer;
        font-size: 1rem; transition: all 0.2s; box-shadow: 0 2px 5px rgba(59, 130, 246, 0.1);
      }
      .btn-outline-blue:hover {
        background: #eff6ff; transform: translateY(-1px); box-shadow: 0 4px 8px rgba(59, 130, 246, 0.2);
      }
      .btn-disabled {
         background: #f1f5f9; border: 1px solid #cbd5e1; color: #94a3b8; 
         cursor: not-allowed; box-shadow: none; transform: none !important;
      }

      .btn-outline-gray {
        background: white; border: 1px solid #cbd5e1; color: #475569;
        font-weight: 600; padding: 10px 15px; border-radius: 8px; cursor: pointer;
        font-size: 0.95rem; transition: background 0.2s;
      }
      .btn-outline-gray:hover { background: #f1f5f9; color: #1e293b; }

      /* MODALES */
      .modal-overlay {
        display:none; position:fixed; top:0; left:0; width:100%; height:100%;
        background:rgba(0,0,0,0.5); z-index:9999; align-items:center; justify-content:center;
        animation: fadeIn 0.2s ease; backdrop-filter: blur(2px);
      }
      .modal-content {
        background:white; padding:25px; border-radius:12px; max-width:500px; width:90%;
        box-shadow:0 10px 30px rgba(0,0,0,0.2); max-height:85vh; overflow-y:auto;
      }
      @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }

      /* HISTORIAL CARD REDISEÑADA */
      .hist-card {
        border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; margin-bottom: 12px;
        display: flex; gap: 15px; align-items: center; background: #fff;
      }
      .hist-date-box {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        width: 45px; flex-shrink: 0; border-right: 1px solid #f1f5f9; padding-right: 15px;
      }
      .hist-day { font-size: 18px; font-weight: 800; color: #334155; line-height: 1; }
      .hist-month { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 700; margin-top: 2px; }
      
      .score-circle {
        width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
        font-weight: 800; font-size: 12px; color: white; flex-shrink: 0; 
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      }
      
      .sort-link { cursor: pointer; font-size: 13px; transition: color 0.2s; }
      .sort-active { color: #0f172a; font-weight: 800; text-decoration: underline text-decoration-color: #3b82f6; }
      .sort-inactive { color: #94a3b8; font-weight: 500; }
      .sort-inactive:hover { color: #64748b; }
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

            <div id="historyList" style="min-height:100px;">
                </div>
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

      <div id="global-controls" style="display:flex; justify-content:flex-end; align-items:center; margin-bottom:15px; padding-right:5px;">
         </div>

      <div style="margin-bottom:20px;">
        ${lista}
      </div>

      <div style="position:sticky; bottom:20px; 
                  background:rgba(248, 250, 252, 0.95); backdrop-filter: blur(5px);
                  padding:15px; border-radius:12px; 
                  box-shadow: 0 4px 25px rgba(0,0,0,0.1); border:1px solid #cbd5e1; 
                  display:flex; flex-wrap:wrap; gap:15px; justify-content:space-between; align-items:center; z-index:100;">
        
        <div style="display:flex; align-items:center; gap:15px;">
           <div style="display:flex; align-items:center; gap:8px;">
              <div style="text-align:right;">
                 <div style="font-size:10px; color:#64748b; font-weight:700; letter-spacing:0.5px;">CANTIDAD</div>
                 <div id="mk-max-hint" style="font-size:10px; color:#94a3b8;">(Max: 0)</div>
              </div>
              <input id="mk-total" type="number" min="1" value="100" oninput="calculateTimeEstimate()"
                     style="width:70px; padding:8px; border-radius:8px; border:1px solid #cbd5e1; font-size:16px; font-weight:bold; text-align:center; color:#334155;">
           </div>

           <div id="time-estimate" style="font-size:11px; color:#64748b; font-style:italic; display:none;">
              ~1h 40m
           </div>

           <label style="display:flex; align-items:center; gap:6px; cursor:pointer; padding-left:10px; border-left:1px solid #cbd5e1;">
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
  const allCheckboxes = [];
  const checkedBoxes = [];
  
  labels.forEach(lbl => {
      const chk = lbl.querySelector("input");
      allCheckboxes.push(chk);
      
      if (chk.checked) {
          lbl.classList.add("box-selected");
          checkedBoxes.push(chk);
      } else {
          lbl.classList.remove("box-selected");
      }
  });

  const totalItems = allCheckboxes.length;
  const selectedCount = checkedBoxes.length;

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

  const checksValues = checkedBoxes.map(c => c.value);
  const poolSize = BANK.questions.filter(q => {
      const mat = q.materia;
      if (Array.isArray(mat)) return mat.some(m => checksValues.includes(m));
      return checksValues.includes(mat);
  }).length;

  const input = document.getElementById("mk-total");
  const hint = document.getElementById("mk-max-hint");
  const btnStart = document.getElementById("btn-start-sim");
  
  if (input) {
      input.max = poolSize;
      if (parseInt(input.value) > poolSize) input.value = poolSize;
      if (poolSize === 0) input.value = 0;
  }
  
  if (hint) hint.textContent = `(Max: ${poolSize})`;

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
    const label = document.getElementById("time-estimate");
    if(!input || !label) return;

    const val = parseInt(input.value) || 0;
    if(val === 0) {
        label.style.display = "none";
        return;
    }
    const hours = Math.floor(val / 60);
    const mins = val % 60;
    let txt = "~";
    if(hours > 0) txt += `${hours}h `;
    txt += `${mins}m`;
    label.textContent = txt;
    label.style.display = "block";
}

/* ==========================================================
   📊 HISTORIAL (REDISENADO)
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
    
    // Actualizar estado visual de los botones
    const btnNew = document.getElementById('sort-newest');
    const btnOld = document.getElementById('sort-oldest');
    
    if (historySortOrder === 'newest') {
        btnNew.className = 'sort-link sort-active';
        btnOld.className = 'sort-link sort-inactive';
    } else {
        btnNew.className = 'sort-link sort-inactive';
        btnOld.className = 'sort-link sort-active';
    }

    // MOCK DATA 
    const mockHistory = [
        { 
            date: new Date().toISOString(), 
            score: 85, totalQ: 50, timeStr: "42 min", 
            subjects: ["pediatria", "cirugia", "ginecologia", "obstetricia", "cardiologia", "neurologia"] 
        },
        { 
            date: new Date(Date.now() - 86400000).toISOString(), 
            score: 72, totalQ: 20, timeStr: "18 min", 
            subjects: ["infectologia", "pediatria"] 
        },
        { 
            date: new Date(Date.now() - 172800000).toISOString(), 
            score: 55, totalQ: 100, timeStr: "1h 10m", 
            subjects: ["todas"] 
        },
        { 
            date: new Date(Date.now() - 300000000).toISOString(), 
            score: 30, totalQ: 10, timeStr: "5 min", 
            subjects: ["psiquiatria"] 
        }
    ];

    // Ordenar
    mockHistory.sort((a, b) => {
        if (historySortOrder === 'newest') return new Date(b.date) - new Date(a.date);
        return new Date(a.date) - new Date(b.date);
    });

    if(mockHistory.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:#94a3b8; padding:20px;">No hay simulacros previos.</div>`;
        return;
    }

    container.innerHTML = mockHistory.map(h => {
        // Colores
        let color = "#1e293b"; // Negro (<40)
        if(h.score >= 40) color = "#ef4444"; // Rojo (<60)
        if(h.score >= 60) color = "#eab308"; // Amarillo (<80)
        if(h.score >= 80) color = "#16a34a"; // Verde (>=80)

        const dateObj = new Date(h.date);
        const day = dateObj.getDate();
        const monthNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
        const month = monthNames[dateObj.getMonth()];

        // Materias
        let subjText = "";
        if(h.subjects.includes("todas") || h.subjects.length > BANK.subjects.length - 2) {
            subjText = "Examen Completo";
        } else if(h.subjects.length <= 3) {
            subjText = h.subjects.map(s => capitalize(s)).join(", ");
        } else {
            const firstTwo = h.subjects.slice(0, 2).map(s => capitalize(s)).join(", ");
            subjText = `${firstTwo} +${h.subjects.length - 2} más`;
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

function capitalize(str) {
    if(!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ==========================================================
   🚀 START
   ========================================================== */
function startExamenPersonalizado() {
  const btn = document.getElementById("btn-start-sim");
  if(btn && btn.disabled) {
      alert("Seleccioná al menos una materia para comenzar.");
      return;
  }

  const checks = Array.from(document.querySelectorAll(".mk-mat"))
    .filter(c => c.checked)
    .map(c => c.value);

  const totalInput = document.getElementById("mk-total");
  const total = parseInt(totalInput.value) || 10;
  const usarTimer = document.getElementById("mk-timer").checked;

  let pool = BANK.questions.filter(q => {
      const mat = q.materia;
      if (Array.isArray(mat)) return mat.some(m => checks.includes(m));
      return checks.includes(mat);
  });

  if (!pool.length) return alert("Error: No hay preguntas.");

  pool = pool.sort(() => Math.random() - 0.5).slice(0, total);

  iniciarResolucion({
    modo: "personalizado",
    preguntas: pool,
    usarTimer,
    permitirRetroceso: true,
    mostrarNotas: true,
    titulo: "🎯 Simulacro"
  });
}
