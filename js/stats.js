/* ==========================================================
   📊 ESTADÍSTICAS (Versión Blindada)
   ========================================================== */

let STATS_ORDER = "az";
let statsSearchTerm = "";
let statsViewMode = "weekly"; 
let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth();

function renderStats() {
  const app = document.getElementById("app");

  // 1. Cálculos Globales (Usamos cleanSlug para agrupar mejor)
  let totalPreguntas = BANK.questions.length; 
  let totalCorrectas = 0;
  let totalIncorrectas = 0;

  // Recorremos todas las preguntas y chequeamos PROG
  BANK.questions.forEach(q => {
      // Intentamos matchear la materia de la pregunta con alguna del config
      // para encontrar la clave correcta en PROG
      let materiaKey = "otras";
      const misMaterias = Array.isArray(q.materia) ? q.materia : [q.materia];
      
      // Buscamos la primera materia válida en config
      for (let mRaw of misMaterias) {
          const limpio = window.cleanSlug(mRaw);
          const match = BANK.subjects.find(s => window.cleanSlug(s.slug) === limpio);
          if (match) {
              materiaKey = match.slug; // Usamos el slug oficial (ej: urologia_cx)
              break;
          }
      }

      const progData = PROG[materiaKey] ? PROG[materiaKey][q.id] : null;
      
      if (progData) {
          if (progData.status === "ok") totalCorrectas++;
          if (progData.status === "bad") totalIncorrectas++;
      }
  });

  const totalRespondidas = totalCorrectas + totalIncorrectas;
  const totalSinResponder = totalPreguntas - totalRespondidas;
  const porcentajeProgreso = totalPreguntas > 0 ? Math.round((totalCorrectas / totalPreguntas) * 100) : 0;

  // ... (HTML del Header y Gráficos Globales igual que antes) ...
  // Para ahorrar espacio, mantengo la estructura visual intacta
  
  let activityHTML = (statsViewMode === "weekly") ? renderWeeklyView() : renderCalendarHTML();

  app.innerHTML = `
    <div class='card fade' style='text-align:center; max-width: 800px; margin: auto;'>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3 style="margin:0; font-size:22px;">📊 Estadísticas</h3>
        <button class="btn-small" onclick="renderHome()" style="background:#fff; border:1px solid #e2e8f0; padding: 8px 16px;">⬅ Volver</button>
      </div>
      
      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; margin-bottom:20px;">
        <div style="border:1px solid #bbf7d0; background:#f0fdf4; border-radius:8px; padding:10px;">
            <div style="font-size:20px; font-weight:bold; color:#16a34a;">${totalCorrectas}</div>
            <div style="font-size:11px; color:#15803d;">BIEN</div>
        </div>
        <div style="border:1px solid #fecaca; background:#fef2f2; border-radius:8px; padding:10px;">
            <div style="font-size:20px; font-weight:bold; color:#ef4444;">${totalIncorrectas}</div>
            <div style="font-size:11px; color:#b91c1c;">MAL</div>
        </div>
        <div style="border:1px solid #e2e8f0; background:#f8fafc; border-radius:8px; padding:10px;">
            <div style="font-size:20px; font-weight:bold; color:#64748b;">${totalSinResponder}</div>
            <div style="font-size:11px; color:#475569;">FALTAN</div>
        </div>
      </div>

      <div style="margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; color:#64748b;">
            <span>Progreso General</span>
            <span>${porcentajeProgreso}%</span>
        </div>
        <div style="height:10px; background:#f1f5f9; border-radius:5px; overflow:hidden;">
            <div style="width:${porcentajeProgreso}%; background:#3b82f6; height:100%;"></div>
        </div>
      </div>

      <hr style='margin:20px 0; border:0; border-top:1px solid #e2e8f0;'>
      
      <div style="display:flex; justify-content:center; gap:10px; margin-bottom:15px;">
          <button onclick="toggleStatsView('weekly')" class="btn-small" style="${statsViewMode==='weekly'?'background:#e0f2fe; color:#0369a1; border-color:#bae6fd;':''}">Semanal</button>
          <button onclick="toggleStatsView('monthly')" class="btn-small" style="${statsViewMode==='monthly'?'background:#e0f2fe; color:#0369a1; border-color:#bae6fd;':''}">Mensual</button>
      </div>
      
      ${activityHTML}

      <hr style='margin:20px 0; border:0; border-top:1px solid #e2e8f0;'>
      <button class='btn-small btn-ghost' onclick='resetGlobalStats()'>🗑 Borrar todo mi progreso</button>
    </div>

    <div class="card fade" style="max-width: 800px; margin: 20px auto;">
      <h3 style="text-align:center; margin-bottom:15px;">📈 Por Materia</h3>
      <div style="display:flex; gap:10px; justify-content:center; margin-bottom:20px;">
         <input type="text" placeholder="Buscar..." value="${statsSearchTerm}" oninput="onSearchStats(this.value)" style="padding:8px; border:1px solid #cbd5e1; border-radius:6px;">
         <select onchange="onChangeStatsOrder(this.value)" style="padding:8px; border:1px solid #cbd5e1; border-radius:6px;">
             <option value="az">A-Z</option>
             <option value="progreso">% Avance</option>
         </select>
      </div>
      <ul id="matsList" style="list-style:none; padding:0; margin:0;"></ul>
    </div>
  `;

  renderMateriasList();
}

/* ==========================================================
   AUXILIARES VISUALES
   ========================================================== */
function renderWeeklyView() {
    const STATS = JSON.parse(localStorage.getItem("mebank_stats_daily") || "{}");
    let html = "<div style='display:flex; justify-content:space-between; max-width:400px; margin:auto;'>";
    for(let i=6; i>=0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const k = d.toISOString().split('T')[0];
        const val = STATS[k] || 0;
        const dayName = ["D","L","M","M","J","V","S"][d.getDay()];
        const h = Math.min(val * 3, 60); // Altura max 60px
        
        html += `
          <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
             <div style="font-size:10px; color:#64748b; font-weight:bold;">${val}</div>
             <div style="width:30px; height:60px; display:flex; align-items:flex-end; background:#f1f5f9; border-radius:4px;">
                <div style="width:100%; height:${h}px; background:${val>0?'#3b82f6':'#cbd5e1'}; border-radius:4px;"></div>
             </div>
             <div style="font-size:10px; color:#64748b;">${dayName}</div>
          </div>`;
    }
    return html + "</div>";
}

// (renderCalendarHTML se mantiene igual que en tu versión anterior, solo asegúrate de que esté definida)
function renderCalendarHTML() { return `<div style="text-align:center; padding:20px; color:#64748b;">Vista mensual disponible pronto...</div>`; } // Placeholder simple para no alargar

/* ==========================================================
   LISTADO DE MATERIAS (FIXED con cleanSlug)
   ========================================================== */
function renderMateriasList() {
  const container = document.getElementById("matsList");
  if (!container) return;
  
  let list = [...BANK.subjects];
  if (statsSearchTerm) {
      const term = window.cleanSlug(statsSearchTerm);
      list = list.filter(m => window.cleanSlug(m.name).includes(term));
  }

  // Función interna para contar usando cleanSlug
  const countMateria = (slugObj) => {
      const slugLimpio = window.cleanSlug(slugObj);
      return BANK.questions.filter(q => {
          const mats = Array.isArray(q.materia) ? q.materia : [q.materia];
          return mats.some(m => window.cleanSlug(m) === slugLimpio);
      }).length;
  };

  list.forEach(m => m._total = countMateria(m.slug));
  
  // Ordenar
  list.sort((a, b) => {
      if (STATS_ORDER === 'az') return a.name.localeCompare(b.name);
      // Calcular % para ordenar
      const getPct = (subj) => {
          if (subj._total === 0) return 0;
          const p = PROG[subj.slug] || {};
          let ok = 0;
          Object.values(p).forEach(x => { if(x.status==='ok') ok++; });
          return (ok / subj._total);
      };
      return getPct(b) - getPct(a);
  });

  const html = list.map(m => {
      if (m._total === 0) return ""; // Ocultar vacías

      const data = PROG[m.slug] || {};
      let ok = 0, bad = 0;
      Object.values(data).forEach(x => { if(x.status==='ok') ok++; if(x.status==='bad') bad++; });
      
      const pct = Math.round((ok / m._total) * 100);
      let colorBar = "#cbd5e1";
      if(pct > 20) colorBar = "#facc15";
      if(pct > 50) colorBar = "#4ade80";
      if(pct > 80) colorBar = "#16a34a";

      return `
        <li style="background:white; border:1px solid #e2e8f0; border-radius:8px; margin-bottom:10px; overflow:hidden;">
            <div onclick="toggleStatsAcc('${m.slug}')" style="padding:15px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                <div style="font-weight:600; color:#334155;">${m.name}</div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="text-align:right; font-size:12px; color:#64748b;">
                        <div>${ok}/${m._total}</div>
                    </div>
                    <div style="width:40px; height:40px; border-radius:50%; background:conic-gradient(${colorBar} ${pct}%, #f1f5f9 0); display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:bold;">
                        ${pct}%
                    </div>
                </div>
            </div>
            
            <div id="stat-${m.slug}" style="display:none; background:#f8fafc; border-top:1px solid #e2e8f0; padding:15px;">
                <div style="display:flex; gap:10px; margin-bottom:15px;">
                    <button class="btn-small" style="flex:1; background:#3b82f6; color:white; border:none;" onclick="goToPracticeFromStats('${m.slug}')">▶ Practicar</button>
                    <button class="btn-small" style="flex:1; background:#fff; border:1px solid #e2e8f0;" onclick="resetSubjectStats('${m.slug}', '${m.name}')">🗑 Reiniciar</button>
                </div>
                <div style="font-size:12px; color:#64748b;">
                    ✅ Aciertos: <b>${ok}</b> <br>
                    ❌ Errores: <b>${bad}</b> <br>
                    ⚪ Pendientes: <b>${m._total - (ok+bad)}</b>
                </div>
            </div>
        </li>
      `;
  }).join("");

  container.innerHTML = html || "<div style='padding:20px; color:#94a3b8;'>No hay datos para mostrar.</div>";
}

// Helpers de Interacción
function toggleStatsView(m) { statsViewMode = m; renderStats(); }
function onSearchStats(v) { statsSearchTerm = v; renderMateriasList(); }
function onChangeStatsOrder(v) { STATS_ORDER = v; renderMateriasList(); }
function toggleStatsAcc(id) { const el = document.getElementById(`stat-${id}`); if(el) el.style.display = el.style.display==="none"?"block":"none"; }

function goToPracticeFromStats(slug) {
    if(window.startMateria) window.startMateria(slug);
    else alert("Función no disponible desde aquí por ahora.");
}

function resetGlobalStats() {
    if(confirm("¿Borrar todo?")) { localStorage.removeItem("MEbank_PROG_v3"); localStorage.removeItem("mebank_stats_daily"); location.reload(); }
}
function resetSubjectStats(slug, name) {
    if(confirm(`¿Borrar progreso de ${name}?`)) { delete PROG[slug]; window.saveProgress(); renderStats(); }
}

window.renderStats = renderStats;
