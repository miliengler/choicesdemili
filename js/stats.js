/* ==========================================================
   📊 ESTADÍSTICAS GLOBALES – Estilo Clásico (Final)
   ========================================================== */

let STATS_ORDER = "az";
let statsSearchTerm = "";

function renderStats() {
  const app = document.getElementById("app");

  // --- 1. CÁLCULOS GLOBALES ---
  let totalPreguntas = 0;
  let totalRespondidas = 0;
  let totalCorrectas = 0;
  let totalIncorrectas = 0;

  BANK.subjects.forEach(m => {
    const preguntasMateria = BANK.questions.filter(q => q.materia === m.slug);
    totalPreguntas += preguntasMateria.length;

    const progresoMateria = PROG[m.slug] || {};
    Object.values(progresoMateria).forEach(p => {
      if (p.status === "ok" || p.status === "bad") {
        totalRespondidas++;
        if (p.status === "ok") totalCorrectas++;
        if (p.status === "bad") totalIncorrectas++;
      }
    });
  });

  const totalSinResponder = totalPreguntas - totalRespondidas;
  
  // Porcentaje de Progreso Total
  const porcentajeProgreso = totalPreguntas > 0 
    ? Math.round((totalCorrectas / totalPreguntas) * 100) 
    : 0;

  // --- 2. Lógica de Actividad Semanal ---
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
        <span>
            <b style="color:${colorCount}">${count} correctas</b> ${checkIcon}
        </span>
      </div>`;
  }).reverse().join("");

  // --- 3. RENDERIZADO PRINCIPAL ---
  app.innerHTML = `
    <div class='card fade' style='text-align:center; max-width: 800px; margin: auto;'>
      
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3 style="margin:0;">📊 Estadísticas generales</h3>
        <button class='btn-small' onclick='renderHome()' style="padding:5px 10px; font-size:12px;">Volver</button>
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
        <div style="font-size:11px; color:#94a3b8; margin-top:3px; text-align:center;">
           Preguntas aprendidas sobre el total (${totalPreguntas})
        </div>
      </div>

      <hr style='margin:20px 0; border: 0; border-top: 1px solid #e2e8f0;'>

      <h4 style="margin-bottom:15px; margin-top:0;">📆 Actividad semanal</h4>
      <div style='text-align:left; max-width:300px; margin:auto;'>
        ${weekList}
      </div>

      <div style="margin-top:15px; padding:10px; background:#eff6ff; border-radius:6px; font-size:13px; color:#1e40af; border:1px solid #dbeafe;">
        ${weeklyTotalCorrect > 0 
           ? `🎉 ¡Bien hecho! Esta semana sumaste <b>${weeklyTotalCorrect} correctas</b>. ¡Sigue así!` 
           : `💤 Esta semana viene tranquila. ¡Es un buen momento para hacer unas preguntas!`}
      </div>

      <hr style='margin:20px 0; border: 0; border-top: 1px solid #e2e8f0;'>

      <button class='btn-small' style="background:#fff; border-color:#cbd5e1; color:#64748b;" onclick='resetGlobalStats()'>
          🗑 Reiniciar todo el progreso
      </button>

    </div>

    <div class="card fade" style="max-width: 800px; margin: 20px auto; text-align: center;">
        <h3 style="margin-bottom:10px;">💡 Sugerencias de repaso</h3>
        <p style="font-size:14px; color:#64748b; margin-bottom:15px;">
          Basadas en tu precisión y frecuencia de práctica.
        </p>
        <div id="sugerencias-container">
            ${getSugerenciasHTML()}
        </div>
    </div>

    <div class="card fade" style="max-width: 800px; margin: 20px auto; text-align: center;">
      <h3 style="margin-bottom:5px;">📈 Estadísticas por materia</h3>
      
      <div style="display:flex; gap:10px; justify-content:center; margin: 15px 0 20px 0;">
         <input type="text" 
                placeholder="🔍 Buscar materia..." 
                value="${statsSearchTerm}"
                oninput="onSearchStats(this.value)"
                style="padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; max-width:160px;">
         
         <select onchange="onChangeStatsOrder(this.value)" 
                 style="padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; background:white;">
             <option value="az" ${STATS_ORDER === 'az' ? 'selected' : ''}>A-Z</option>
             <option value="progreso" ${STATS_ORDER === 'progreso' ? 'selected' : ''}>% Menor</option>
             <option value="progreso_desc" ${STATS_ORDER === 'progreso_desc' ? 'selected' : ''}>% Mayor</option>
         </select>
      </div>
      
      <ul id="matsList" style="list-style:none; padding:0; margin:0; text-align: left;">
          </ul>
    </div>
    
    <div style="text-align:center; margin: 30px 0; font-size:13px; color:#94a3b8;">
       Vos podés ❤️
    </div>
  `;

  renderMateriasList();
}

/* ==========================================================
   📋 Lista de Materias
   ========================================================== */
function renderMateriasList() {
  const container = document.getElementById("matsList");
  if (!container) return;
  
  let list = [...BANK.subjects];
  const term = normalize(statsSearchTerm);

  // Filtrar
  if (term) list = list.filter(m => normalize(m.name).includes(term));

  // Ordenar
  list.sort((a, b) => {
    const getPct = (slug) => {
        const total = BANK.questions.filter(q => q.materia === slug).length;
        if (total === 0) return 0;
        const p = PROG[slug] || {};
        let ok = 0, bad = 0;
        Object.values(p).forEach(x => { if(x.status==='ok') ok++; if(x.status==='bad') bad++; });
        return (ok+bad) > 0 ? (ok/(ok+bad))*100 : 0;
    };

    if (STATS_ORDER === 'az') {
        const cleanA = a.name.replace(/[^\p{L}\p{N} ]/gu, "").trim();
        const cleanB = b.name.replace(/[^\p{L}\p{N} ]/gu, "").trim();
        return cleanA.localeCompare(cleanB, "es", { sensitivity: "base" });
    } else if (STATS_ORDER === 'progreso') {
        return getPct(a.slug) - getPct(b.slug);
    } else {
        return getPct(b.slug) - getPct(a.slug);
    }
  });

  if (list.length === 0) {
      container.innerHTML = `<li style="text-align:center; padding:20px; color:#94a3b8;">No se encontraron materias.</li>`;
      return;
  }

  const listHTML = list.map(m => {
    const preguntas = BANK.questions.filter(q => q.materia === m.slug);
    const totalM = preguntas.length;
    
    if (totalM === 0) return ""; 

    const datos = PROG[m.slug] || {};
    let ok = 0, bad = 0;
    Object.values(datos).forEach(p => {
      if (p.status === "ok") ok++;
      if (p.status === "bad") bad++;
    });
    
    const resp = ok + bad;
    const pct = resp > 0 ? Math.round((ok / resp) * 100) : 0;
    const noresp = totalM - resp;
    const colorPct = pct >= 70 ? "#16a34a" : (pct >= 50 ? "#f59e0b" : "#ef4444");

    return `
      <li style="margin-bottom: 10px;">
        
        <div onclick="toggleStatsAcc('${m.slug}')"
             style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;
                    padding: 14px 16px; cursor: pointer; display: flex; justify-content: space-between;
                    align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          
          <div style="font-weight: 600; color: #1e293b; font-size:15px;">${m.name}</div>
          <div style="font-size: 14px; font-weight: bold; color: ${colorPct};">
            ${pct}%
          </div>
        </div>

        <div id="stat-${m.slug}" style="display:none; padding: 15px; background: #f8fafc; 
             border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; margin-top: -2px;">
          
          <div style="display:flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap:10px;">
            
            <div style="font-size: 14px; line-height: 1.8; color: #475569;">
              <div>📦 Total preguntas: <b>${totalM}</b></div>
              <div style="color:#16a34a">✔ Correctas: <b>${ok}</b></div>
              <div style="color:#ef4444">✖ Incorrectas: <b>${bad}</b></div>
              <div style="color:#64748b">⚪ Sin responder: <b>${noresp}</b></div>
            </div>

            <div style="display:flex; gap:8px;">
               <button class="btn-small" 
                       style="font-size:13px; padding: 8px 12px; background: white; color: #ef4444; border: 1px solid #ef4444; border-radius:6px;"
                       onclick="resetSubjectStats('${m.slug}', '${m.name}')"
                       title="Reiniciar estadísticas de esta materia">
                 🗑
               </button>

               <button class="btn-small" 
                       style="font-size:13px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius:6px;"
                       onclick="iniciarPracticaMateria('${m.slug}', 'normal')">
                 Ir a practicar
               </button>
            </div>

          </div>
        </div>
      </li>
    `;
  }).join("");

  container.innerHTML = listHTML;
}

/* ==========================================================
   💡 Lógica de Sugerencias (Inteligente)
   ========================================================== */
function getSugerenciasHTML() {
  let suggestions = [];
  const now = new Date();

  BANK.subjects.forEach(m => {
    const totalQ = BANK.questions.filter(q => q.materia === m.slug).length;
    if (totalQ === 0) return;

    const datos = PROG[m.slug] || {};
    let ok = 0, totalR = 0;
    let lastDate = null; // Para rastrear última práctica

    Object.values(datos).forEach(p => {
      if (p.status === "ok" || p.status === "bad") {
        totalR++;
        if (p.status === "ok") ok++;
        
        // Buscar fecha más reciente
        if (p.date) {
            const d = new Date(p.date);
            if (!lastDate || d > lastDate) lastDate = d;
        }
      }
    });

    // 1. Sugerencia por NOTA BAJA
    if (totalR > 5) {
      const pct = Math.round((ok / totalR) * 100);
      if (pct < 60) {
        suggestions.push(`📚 Tu promedio es bajo en <b>${m.name}</b> (${pct}%).`);
      }
    } 
    // 2. Sugerencia por MATERIA VIRGEN
    else if (totalR === 0) {
       suggestions.push(`💡 Aún no empezaste <b>${m.name}</b>.`);
    }

    // 3. Sugerencia por TIEMPO SIN PRACTICAR
    if (lastDate) {
        const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays > 7) {
             suggestions.push(`⏰ Hace ${diffDays} días no practicas <b>${m.name}</b>.`);
        }
    }
  });

  // Mezclar y mostrar 3
  suggestions = suggestions.sort(() => 0.5 - Math.random()).slice(0, 3);

  if (suggestions.length === 0) {
      return `<div style="font-size:14px; color:#94a3b8; padding:10px;">¡Todo viene genial! Seguí así.</div>`;
  }

  return `
    <ul style="list-style:none; padding:0; margin:0; text-align: left; display:inline-block;">
      ${suggestions.map(msg => `
        <li style="margin-bottom:8px; font-size:14px; color:#475569;">
          ${msg}
        </li>
      `).join("")}
    </ul>
  `;
}

/* ==========================================================
   🔧 Utilidades
   ========================================================== */
function toggleStatsAcc(slug) {
  const el = document.getElementById(`stat-${slug}`);
  if (el) {
    el.style.display = el.style.display === "none" ? "block" : "none";
  }
}

function onSearchStats(val) {
    statsSearchTerm = val;
    renderMateriasList();
}

function onChangeStatsOrder(val) {
    STATS_ORDER = val;
    renderMateriasList();
}

// Reset GLOBAL
function resetGlobalStats() {
  if (confirm("⚠️ ¿Seguro que querés borrar TODAS las estadísticas y el progreso? Esta acción no se puede deshacer.")) {
    localStorage.removeItem("MEbank_Progreso_v3");
    localStorage.removeItem("mebank_stats_daily");
    location.reload();
  }
}

// Reset MATERIA ESPECÍFICA (Nueva Función)
function resetSubjectStats(slug, name) {
    if (confirm(`¿Estás seguro que querés reiniciar SOLO el progreso de ${name}?`)) {
        // Borramos la key de esa materia en el objeto PROG
        if (PROG[slug]) {
            delete PROG[slug];
            // Guardamos el cambio en localStorage
            localStorage.setItem("MEbank_Progreso_v3", JSON.stringify(PROG));
            // Recargamos la vista
            renderStats();
        }
    }
}

window.renderStats = renderStats;
