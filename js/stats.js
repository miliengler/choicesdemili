/* ==========================================================
   📊 ESTADÍSTICAS GLOBALES – (Tu Diseño Original + Fix de Conteo)
   ========================================================== */

let STATS_ORDER = "az";
let statsSearchTerm = "";
let statsViewMode = "weekly"; // 'weekly' | 'monthly'

// Estado del calendario (Mes actual por defecto)
let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth(); // 0-11

// --- 🛠️ Helper Local para igualar nombres (ej: "urologia_cx" == "urologiacx") ---
function cleanStr(str) {
    if (!str) return "";
    return String(str).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function renderStats() {
  const app = document.getElementById("app");

  // --- 1. CÁLCULOS GLOBALES (Mejorados para encontrar todo) ---
  let totalPreguntas = BANK.questions.length; 
  let totalRespondidas = 0;
  let totalCorrectas = 0;
  let totalIncorrectas = 0;

  BANK.questions.forEach(q => {
      // 1. Buscamos a qué materia pertenece realmente esta pregunta
      // (Comparando de forma flexible con tu configuración)
      let matKey = "otras";
      const materiasQ = Array.isArray(q.materia) ? q.materia : [q.materia];
      
      // Intentamos matchear con alguna materia oficial de tu lista
      if (typeof BANK.subjects !== 'undefined') {
          for (let mRaw of materiasQ) {
              const match = BANK.subjects.find(s => cleanStr(s.slug) === cleanStr(mRaw));
              if (match) {
                  matKey = match.slug; // Usamos el ID oficial (ej: urologia_cx)
                  break;
              }
          }
      } else {
          matKey = cleanStr(materiasQ[0]);
      }

      // 2. Buscamos el progreso usando esa clave oficial
      const prog = (PROG[matKey] && PROG[matKey][q.id]) ? PROG[matKey][q.id] : null;
      
      if (prog && (prog.status === "ok" || prog.status === "bad")) {
          totalRespondidas++;
          if (prog.status === "ok") totalCorrectas++;
          if (prog.status === "bad") totalIncorrectas++;
      }
  });

  const totalSinResponder = totalPreguntas - totalRespondidas;
  // Progreso total (Learned %)
  const porcentajeProgreso = totalPreguntas > 0 
    ? Math.round((totalCorrectas / totalPreguntas) * 100) 
    : 0;

  // --- 2. GENERAR HTML DE ACTIVIDAD (Switch) ---
  let activityHTML = "";
  
  if (statsViewMode === "weekly") {
      // VISTA SEMANAL
      const STATS_DAILY = JSON.parse(localStorage.getItem("mebank_stats_daily") || "{}");
      const today = new Date();
      let weeklyTotalCorrect = 0;

      const weekList = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toISOString().split('T')[0]; 
        const count = STATS_DAILY[key] || 0;
        if(i < 7) weeklyTotalCorrect += count;

        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const colorCount = count > 0 ? "#16a34a" : "#94a3b8"; 
        const checkIcon = count > 0 ? "✅" : "⬜";

        return `
          <div style="display:flex; justify-content:space-between; align-items:center; margin: 4px 0; font-size: 14px;">
            <span style="color:#64748b">➤ ${dd}/${mm}</span>
            <span><b style="color:${colorCount}">${count} correctas</b> ${checkIcon}</span>
          </div>`;
      }).reverse().join("");

      activityHTML = `
          <div style='text-align:left; max-width:300px; margin:auto;'>
            ${weekList}
          </div>
          <div style="margin-top:15px; padding:10px; background:#eff6ff; border-radius:6px; font-size:13px; color:#1e40af; border:1px solid #dbeafe;">
            ${weeklyTotalCorrect > 0 
               ? `🎉 Esta semana sumaste <b>${weeklyTotalCorrect} correctas</b>.` 
               : `💤 Semana tranquila. ¡A practicar!`}
          </div>
      `;
  } else {
      // VISTA MENSUAL
      activityHTML = renderCalendarHTML();
  }

  // --- 3. RENDERIZADO PRINCIPAL ---
  app.innerHTML = `
    <div class='card fade' style='text-align:center; max-width: 800px; margin: auto;'>
      
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3 style="margin:0; font-size:22px;">📊 Estadísticas</h3>
        <button class="btn-small" onclick="renderHome()" style="white-space:nowrap; background:#fff; border:1px solid #e2e8f0; color:#475569; padding: 8px 16px; font-size: 14px;">
           ⬅ Volver
        </button>
      </div>
      
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap:10px; margin-bottom:20px;">
        <div style="border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
            <div style="font-size:20px; font-weight:bold; color:#16a34a;">${totalCorrectas}</div>
            <div style="font-size:11px; color:#64748b; text-transform:uppercase;">Correctas</div>
        </div>
        <div style="border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
            <div style="font-size:20px; font-weight:bold; color:#ef4444;">${totalIncorrectas}</div>
            <div style="font-size:11px; color:#64748b; text-transform:uppercase;">Incorrectas</div>
        </div>
        <div style="border:1px solid #e2e8f0; border-radius:8px; padding:10px; background:#f8fafc;">
            <div style="font-size:20px; font-weight:bold; color:#94a3b8;">${totalSinResponder}</div>
            <div style="font-size:11px; color:#64748b; text-transform:uppercase;">Sin Responder</div>
        </div>
      </div>

      <div style="margin-bottom:10px; text-align:left;">
        <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
            <span style="color:#334155; font-weight:600;">Progreso total</span>
            <span style="color:#16a34a; font-weight:bold;">${porcentajeProgreso}%</span>
        </div>
        <div style="height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden; border:1px solid #e2e8f0;">
            <div style="width:${porcentajeProgreso}%; background:#16a34a; height:100%;"></div>
        </div>
      </div>

      <hr style='margin:20px 0; border: 0; border-top: 1px solid #e2e8f0;'>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
          <h4 style="margin:0;">📆 Actividad</h4>
          <div style="display:flex; background:#f1f5f9; padding:2px; border-radius:8px;">
              <button onclick="toggleStatsView('weekly')" 
                      style="border:none; background:${statsViewMode==='weekly'?'white':'transparent'}; padding:4px 12px; font-size:12px; border-radius:6px; box-shadow:${statsViewMode==='weekly'?'0 1px 3px rgba(0,0,0,0.1)':'none'}; color:${statsViewMode==='weekly'?'#0f172a':'#64748b'};">
                  Semanal
              </button>
              <button onclick="toggleStatsView('monthly')" 
                      style="border:none; background:${statsViewMode==='monthly'?'white':'transparent'}; padding:4px 12px; font-size:12px; border-radius:6px; box-shadow:${statsViewMode==='monthly'?'0 1px 3px rgba(0,0,0,0.1)':'none'}; color:${statsViewMode==='monthly'?'#0f172a':'#64748b'};">
                  Mensual
              </button>
          </div>
      </div>

      ${activityHTML}

      <hr style='margin:20px 0; border: 0; border-top: 1px solid #e2e8f0;'>

      <button class='btn-small' style="background:#fff; border-color:#cbd5e1; color:#64748b;" onclick='resetGlobalStats()'>
          🗑 Reiniciar todo el progreso
      </button>

    </div>

    <div class="card fade" style="max-width: 800px; margin: 20px auto; text-align: center;">
      <h3 style="margin-bottom:5px;">📈 Estadísticas por materia</h3>
      
      <div style="display:flex; gap:10px; justify-content:center; margin: 15px 0 20px 0;">
         <input type="text" placeholder="🔍 Buscar materia..." value="${statsSearchTerm}" oninput="onSearchStats(this.value)"
                style="padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; max-width:160px;">
         <select onchange="onChangeStatsOrder(this.value)" style="padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; background:white;">
             <option value="az" ${STATS_ORDER === 'az' ? 'selected' : ''}>A-Z</option>
             <option value="progreso" ${STATS_ORDER === 'progreso' ? 'selected' : ''}>% Menor</option>
             <option value="progreso_desc" ${STATS_ORDER === 'progreso_desc' ? 'selected' : ''}>% Mayor</option>
         </select>
      </div>
      <ul id="matsList" style="list-style:none; padding:0; margin:0; text-align: left;"></ul>
    </div>
  `;

  renderMateriasList();
}

/* ==========================================================
   📅 LÓGICA DE CALENDARIO
   ========================================================== */
function toggleStatsView(mode) {
    statsViewMode = mode;
    renderStats();
}

function changeMonth(delta) {
    calMonth += delta;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderStats();
}

function renderCalendarHTML() {
    const STATS_DAILY = JSON.parse(localStorage.getItem("mebank_stats_daily") || "{}");
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    // Calcular días
    const firstDay = new Date(calYear, calMonth, 1).getDay(); // 0=Dom
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    
    // Ajustar para que Lunes sea el primer día
    let startOffset = firstDay === 0 ? 6 : firstDay - 1;

    let gridHTML = "";
    
    // Celdas vacías
    for (let i = 0; i < startOffset; i++) {
        gridHTML += `<div style="height:40px;"></div>`;
    }

    // Días
    for (let day = 1; day <= daysInMonth; day++) {
        const key = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const count = STATS_DAILY[key] || 0;
        
        let bg = "#f1f5f9"; 
        let color = "#64748b";
        let weight = "400";
        
        if (count > 0) {
            color = "#064e3b"; 
            weight = "700";
            if (count <= 10) bg = "#bbf7d0";       
            else if (count <= 40) bg = "#4ade80";  
            else bg = "#16a34a";                   
            if (count > 40) color = "white";
        }

        gridHTML += `
            <div style="height:40px; background:${bg}; border-radius:6px; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:12px; color:${color}; font-weight:${weight}; position:relative;" title="${count} correctas">
                <span>${day}</span>
                ${count > 0 ? `<span style="font-size:9px; opacity:0.8;">${count}</span>` : ''}
            </div>
        `;
    }

    // ACLARACIÓN AGREGADA AL FINAL
    return `
        <div style="background:white; border:1px solid #e2e8f0; border-radius:10px; padding:15px; max-width:400px; margin:auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <button onclick="changeMonth(-1)" style="padding:4px 10px; border-radius:6px;">◀</button>
                <div style="font-weight:700; color:#1e293b;">${monthNames[calMonth]} ${calYear}</div>
                <button onclick="changeMonth(1)" style="padding:4px 10px; border-radius:6px;">▶</button>
            </div>
            
            <div style="display:grid; grid-template-columns: repeat(7, 1fr); gap:4px; margin-bottom:6px; text-align:center; font-size:10px; color:#94a3b8; font-weight:700;">
                <div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div><div>D</div>
            </div>

            <div style="display:grid; grid-template-columns: repeat(7, 1fr); gap:4px;">
                ${gridHTML}
            </div>

            <div style="display:flex; flex-direction:column; gap:8px; align-items:center; margin-top:15px; border-top:1px dashed #e2e8f0; padding-top:10px;">
                <div style="display:flex; gap:10px; justify-content:center; font-size:10px; color:#64748b;">
                    <div style="display:flex; align-items:center; gap:4px;"><div style="width:8px; height:8px; background:#bbf7d0; border-radius:2px;"></div> 1-10</div>
                    <div style="display:flex; align-items:center; gap:4px;"><div style="width:8px; height:8px; background:#4ade80; border-radius:2px;"></div> 11-40</div>
                    <div style="display:flex; align-items:center; gap:4px;"><div style="width:8px; height:8px; background:#16a34a; border-radius:2px;"></div> +40</div>
                </div>
                <div style="font-size:11px; font-weight:600; color:#64748b;">
                   (Los números indican respuestas correctas)
                </div>
            </div>
        </div>
    `;
}

/* ==========================================================
   📋 LISTA DE MATERIAS (FIXED: Usa cleanStr para contar)
   ========================================================== */
function renderMateriasList() {
  const container = document.getElementById("matsList");
  if (!container) return;
  
  let list = [...BANK.subjects];
  // 3. Normalizamos el término de búsqueda
  const term = cleanStr(statsSearchTerm);

  if (term) list = list.filter(m => cleanStr(m.name).includes(term));

  // 4. FIX CONTADOR POR MATERIA (Flexible)
  const countMateria = (slugObj) => {
      const slugLimpio = cleanStr(slugObj);
      return BANK.questions.filter(q => {
          const misMaterias = Array.isArray(q.materia) ? q.materia : [q.materia];
          return misMaterias.some(m => cleanStr(m) === slugLimpio);
      }).length;
  };

  list.sort((a, b) => {
    // Ordenar también por Progreso Real (Learned)
    const getLearnedPct = (slug) => {
        const total = countMateria(slug);
        if (total === 0) return 0;
        const p = PROG[slug] || {};
        let ok = 0;
        Object.values(p).forEach(x => { if(x.status==='ok') ok++; });
        return Math.round((ok / total) * 100);
    };

    if (STATS_ORDER === 'az') {
        const cleanA = a.name.replace(/[^\p{L}\p{N} ]/gu, "").trim();
        const cleanB = b.name.replace(/[^\p{L}\p{N} ]/gu, "").trim();
        return cleanA.localeCompare(cleanB, "es", { sensitivity: "base" });
    } else if (STATS_ORDER === 'progreso') {
        return getLearnedPct(a.slug) - getLearnedPct(b.slug);
    } else {
        return getLearnedPct(b.slug) - getLearnedPct(a.slug);
    }
  });

  if (list.length === 0) {
      container.innerHTML = `<li style="text-align:center; padding:20px; color:#94a3b8;">No se encontraron materias.</li>`;
      return;
  }

  const listHTML = list.map(m => {
    const totalM = countMateria(m.slug);
    if (totalM === 0) return ""; 

    const datos = PROG[m.slug] || {};
    let ok = 0, bad = 0;
    Object.values(datos).forEach(p => {
      if (p.status === "ok") ok++;
      if (p.status === "bad") bad++;
    });
    
    const pctLearned = Math.round((ok / totalM) * 100);
    const noresp = totalM - (ok + bad);
    
    // Color basado en cuánto completaste de la materia
    let colorPct = "#64748b"; // Gris si es bajo
    if(pctLearned >= 20) colorPct = "#eab308";
    if(pctLearned >= 50) colorPct = "#16a34a";
    if(pctLearned >= 80) colorPct = "#15803d";

    const insights = getSubjectInsights(m.slug, m.name, datos);
    const pieStyle = getPieChartStyle(ok, bad, noresp, totalM); 

    const btnBase = "width:100%; min-width:110px; font-size:12px; padding: 6px 10px; border-radius:6px; font-weight:600; cursor:pointer; color:#334155; white-space:nowrap;";

    return `
      <li style="margin-bottom: 10px;">
        <div onclick="toggleStatsAcc('${m.slug}')"
             style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;
                    padding: 14px 16px; cursor: pointer; display: flex; justify-content: space-between;
                    align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          
          <div style="font-weight: 600; color: #1e293b; font-size:15px;">
            ${m.name}
          </div>
          <div style="font-size: 14px; font-weight: bold; color: ${colorPct};">
            ${pctLearned}%
          </div>
        </div>

        <div id="stat-${m.slug}" style="display:none; padding: 20px; background: #f8fafc; 
             border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; margin-top: -2px;">
          
          <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:20px;">
            
            <div style="font-size: 14px; line-height: 2; color: #475569; min-width:130px;">
              <div>📦 Total preguntas: <b>${totalM}</b></div>
              <div>✅ Correctas: <b style="color:#16a34a">${ok}</b></div>
              <div>❌ Incorrectas: <b style="color:#ef4444">${bad}</b></div>
              <div>⚪ Sin responder: <b style="color:#64748b">${noresp}</b></div>
            </div>

            <div style="width:100px; height:100px; border-radius:50%; ${pieStyle} border:4px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.05);"></div>

            <div style="display:flex; flex-direction:column; gap:8px; align-items:flex-end; flex:1; max-width: 150px;">
               <button style="${btnBase} background: #eff6ff; border: 1px solid #93c5fd;"
                       onclick="goToPracticeFromStats('${m.slug}')">
                 ▶ Ir a practicar
               </button>
               <button style="${btnBase} background: #fefce8; border: 1px solid #fde047;"
                       onclick="checkAndGoToNotes('${m.slug}', '${m.name}')">
                 📝 Mis notas
               </button>
               <button style="${btnBase} background: #fef2f2; border: 1px solid #fca5a5;"
                       onclick="resetSubjectStats('${m.slug}', '${m.name}')">
                 🗑 Reiniciar materia
               </button>
            </div>
          </div>

          ${insights ? `
            <div style="margin-top:15px; padding-top:15px; border-top:1px dashed #cbd5e1; font-size:13px; color:#475569;">
               ${insights}
            </div>
          ` : ''}

        </div>
      </li>
    `;
  }).join("");

  container.innerHTML = listHTML;
}

/* ==========================================================
   🧠 Lógica Inteligente (Insights)
   ========================================================== */
function getSubjectInsights(slug, name, datos) {
    let insights = [];
    const now = new Date();
    
    let lastDate = null;
    Object.values(datos).forEach(p => {
        const ts = p.fecha || p.date; 
        if (ts) {
            const d = new Date(ts);
            if (!lastDate || d > lastDate) lastDate = d;
        }
    });

    if (lastDate) {
        const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays > 14) {
             insights.push(`🕰️ Hace <b>${diffDays} días</b> no practicás esta materia.`);
        }
    } else {
        insights.push(`💡 Todavía no empezaste a practicar esta materia.`);
    }

    const weakest = getWeakestSubtopic(slug, datos);
    if (weakest) {
        // Usamos una limpieza simple para mostrar el nombre
        const prettyName = weakest.name.charAt(0).toUpperCase() + weakest.name.slice(1);
        insights.push(`📉 Tu subtema más flojo es <b>${prettyName}</b> (${weakest.pct}%).`);
    }

    if (insights.length === 0) return "";
    return insights.map(i => `<div style="margin-bottom:4px;">${i}</div>`).join("");
}

function getWeakestSubtopic(mSlug, progData) {
    const slugLimpio = cleanStr(mSlug);
    
    const questions = BANK.questions.filter(q => {
        const misMaterias = Array.isArray(q.materia) ? q.materia : [q.materia];
        return misMaterias.some(m => cleanStr(m) === slugLimpio);
    });

    const groups = {};
    questions.forEach(q => {
        const sub = q.submateria || "General";
        if (!groups[sub]) groups[sub] = { total: 0, ok: 0, answered: 0 };
        groups[sub].total++;
        if (progData[q.id]) {
            groups[sub].answered++;
            if (progData[q.id].status === 'ok') groups[sub].ok++;
        }
    });

    let worst = null;
    let minPct = 101;

    Object.keys(groups).forEach(subName => {
        const g = groups[subName];
        if (g.answered >= 3) {
            const pct = Math.round((g.ok / g.answered) * 100);
            if (pct < minPct) {
                minPct = pct;
                worst = { name: subName, pct: pct };
            }
        }
    });
    return worst;
}

function getPieChartStyle(ok, bad, none, total) {
    if (total === 0) return `background: #e2e8f0;`; 
    
    const degOk = (ok / total) * 360;
    const degBad = (bad / total) * 360;

    return `background: conic-gradient(
        #16a34a 0deg ${degOk}deg, 
        #ef4444 ${degOk}deg ${degOk + degBad}deg, 
        #e2e8f0 ${degOk + degBad}deg 360deg
    );`;
}

function toggleStatsAcc(slug) {
  const el = document.getElementById(`stat-${slug}`);
  if (el) el.style.display = el.style.display === "none" ? "block" : "none";
}

function onSearchStats(val) { statsSearchTerm = val; renderMateriasList(); }
function onChangeStatsOrder(val) { STATS_ORDER = val; renderMateriasList(); }

function goToPracticeFromStats(slug) {
    if (window.renderChoice) {
        renderChoice();
        setTimeout(() => {
            if(typeof window.startMateria === 'function') {
                window.startMateria(slug);
            }
        }, 50);
    } else {
        alert("Redirigiendo...");
        if(typeof goChoice === 'function') goChoice();
    }
}

function checkAndGoToNotes(slug, name) {
    const savedNotes = JSON.parse(localStorage.getItem("mebank_notes") || "{}");
    const idsConNotas = Object.keys(savedNotes);
    const preguntasMateria = BANK.questions.filter(q => {
        const misMaterias = Array.isArray(q.materia) ? q.materia : [q.materia];
        return misMaterias.some(m => cleanStr(m) === cleanStr(slug));
    });
    const hasNotes = preguntasMateria.some(q => idsConNotas.includes(q.id));
    
    if(hasNotes) {
        if(window.renderNotasMain) renderNotasMain(); 
    } else {
        alert(`Todavía no tenés notas de ${name}!`);
    }
}

function resetGlobalStats() {
  if (confirm("⚠️ ¿Seguro que querés borrar TODAS las estadísticas?")) {
    localStorage.removeItem("MEbank_PROG_v3");
    localStorage.removeItem("mebank_stats_daily");
    location.reload();
  }
}

function resetSubjectStats(slug, name) {
    if (confirm(`¿Estás seguro que querés borrar tu progreso de ${name}?`)) {
        if (PROG[slug]) {
            delete PROG[slug];
            if(window.saveProgress) window.saveProgress();
            renderStats();
        }
    }
}

window.renderStats = renderStats;
