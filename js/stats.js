/* ==========================================================
   📊 ESTADÍSTICAS GLOBALES – Diseño Dashboard (Final)
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
  const porcentajeProgreso = totalPreguntas > 0 
    ? Math.round((totalCorrectas / totalPreguntas) * 100) 
    : 0;

  // --- 2. ACTIVIDAD SEMANAL ---
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

  // --- 3. RENDERIZADO PRINCIPAL ---
  app.innerHTML = `
    <div class='card fade' style='text-align:center; max-width: 800px; margin: auto;'>
      
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3 style="margin:0; font-size:22px;">📊 Estadísticas generales</h3>
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
   📋 Lista de Materias (Con GRÁFICOS e INSIGHTS)
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

    // Stats básicas
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

    // Insights Inteligentes
    const insights = getSubjectInsights(m.slug, m.name, datos);

    // Gráfico de torta CSS (Conic Gradient)
    const pieStyle = getPieChartStyle(ok, bad, noresp, totalM);

    return `
      <li style="margin-bottom: 10px;">
        
        <div onclick="toggleStatsAcc('${m.slug}')"
             style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;
                    padding: 14px 16px; cursor: pointer; display: flex; justify-content: space-between;
                    align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          
          <div style="font-weight: 600; color: #1e293b; font-size:15px;">
            ${getEmojiForSubject(m.name)} ${m.name}
          </div>
          <div style="font-size: 14px; font-weight: bold; color: ${colorPct};">
            ${pct}%
          </div>
        </div>

        <div id="stat-${m.slug}" style="display:none; padding: 20px; background: #f8fafc; 
             border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; margin-top: -2px;">
          
          <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:20px;">
            
            <div style="font-size: 14px; line-height: 2; color: #475569; min-width:140px;">
              <div>📦 Total preguntas: <b>${totalM}</b></div>
              <div>✅ Correctas: <b style="color:#16a34a">${ok}</b></div>
              <div>❌ Incorrectas: <b style="color:#ef4444">${bad}</b></div>
              <div>⚪ Sin responder: <b style="color:#64748b">${noresp}</b></div>
            </div>

            <div style="width:70px; height:70px; border-radius:50%; ${pieStyle} border:3px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.1);"></div>

            <div style="display:flex; flex-direction:column; gap:8px; align-items:flex-end; flex:1; min-width:150px;">
               <button class="btn-small" 
                       style="width:100%; font-size:13px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius:6px;"
                       onclick="iniciarPracticaMateria('${m.slug}', 'normal')">
                 Ir a practicar
               </button>

               <button class="btn-small" 
                       style="width:100%; font-size:12px; padding: 6px 12px; background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; border-radius:6px; font-weight:600;"
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
   🧠 Lógica de Insights Inteligentes
   ========================================================== */
function getSubjectInsights(slug, name, datos) {
    let insights = [];
    const now = new Date();
    
    // 1. Calcular días sin practicar
    let lastDate = null;
    Object.values(datos).forEach(p => {
        if (p.date) {
            const d = new Date(p.date);
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

    // 2. Detectar Subtema más flojo
    const weakest = getWeakestSubtopic(slug, datos);
    if (weakest) {
        insights.push(`📉 Tu subtema más flojo es <b>${weakest.name}</b> (${weakest.pct}%).`);
    }

    if (insights.length === 0) return "";
    
    return insights.map(i => `<div style="margin-bottom:4px;">${i}</div>`).join("");
}

function getWeakestSubtopic(mSlug, progData) {
    // Agrupar preguntas por subtema
    const questions = BANK.questions.filter(q => {
        const esMateria = Array.isArray(q.materia) ? q.materia.includes(mSlug) : q.materia === mSlug;
        return esMateria && q.submateria; // Solo si tiene subtema
    });

    const groups = {};
    questions.forEach(q => {
        const sub = q.submateria;
        if (!groups[sub]) groups[sub] = { total: 0, ok: 0, answered: 0 };
        
        groups[sub].total++;
        if (progData[q.id]) {
            groups[sub].answered++;
            if (progData[q.id].status === 'ok') groups[sub].ok++;
        }
    });

    // Buscar el peor (mínimo 3 respuestas para que sea relevante)
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

/* ==========================================================
   🎨 Utilidades Gráficas
   ========================================================== */
function getPieChartStyle(ok, bad, none, total) {
    if (total === 0) return `background: #e2e8f0;`; // Gris si está vacía
    
    const degOk = (ok / total) * 360;
    const degBad = (bad / total) * 360;
    // const degNone = (none / total) * 360; // El resto

    // Conic Gradient: Verde -> Rojo -> Gris
    return `background: conic-gradient(
        #16a34a 0deg ${degOk}deg, 
        #ef4444 ${degOk}deg ${degOk + degBad}deg, 
        #e2e8f0 ${degOk + degBad}deg 360deg
    );`;
}

function getEmojiForSubject(name) {
    // Mapeo simple de emojis para decorar (Opcional, si no encuentra devuelve libro)
    const map = {
        'Cardiología': '🫀', 'Dermatología': '🧴', 'Endocrinología': '🧪',
        'Gastroenterología': '💩', 'Ginecología': '🌸', 'Hematología': '🩸',
        'Infectología': '🦠', 'Neumonología': '🫁', 'Neurología': '🧠',
        'Oftalmología': '👁️', 'Pediatría': '👶', 'Psiquiatría': '🧘',
        'Traumatología': '🦴', 'Urología': '🚽', 'Cirugía': '🔪'
    };
    // Buscar coincidencia parcial
    const key = Object.keys(map).find(k => name.includes(k));
    return key ? map[key] : '📘';
}

/* ==========================================================
   🔧 Utilidades Generales
   ========================================================== */
function toggleStatsAcc(slug) {
  const el = document.getElementById(`stat-${slug}`);
  if (el) el.style.display = el.style.display === "none" ? "block" : "none";
}

function onSearchStats(val) {
    statsSearchTerm = val;
    renderMateriasList();
}

function onChangeStatsOrder(val) {
    STATS_ORDER = val;
    renderMateriasList();
}

function resetGlobalStats() {
  if (confirm("⚠️ ¿Seguro que querés borrar TODAS las estadísticas?")) {
    localStorage.removeItem("MEbank_Progreso_v3");
    localStorage.removeItem("mebank_stats_daily");
    location.reload();
  }
}

function resetSubjectStats(slug, name) {
    if (confirm(`¿Estás seguro que querés borrar tu progreso de ${name}?`)) {
        if (PROG[slug]) {
            delete PROG[slug];
            localStorage.setItem("MEbank_Progreso_v3", JSON.stringify(PROG));
            renderStats();
        }
    }
}

window.renderStats = renderStats;
