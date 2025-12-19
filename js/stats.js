/* ==========================================================
   📊 ESTADÍSTICAS GLOBALES – Estilo Clásico (Réplica)
   ========================================================== */

function renderStats() {
  const app = document.getElementById("app");

  // 1. Cálculos Globales
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

  const porcentajeGlobal = totalRespondidas > 0 
    ? Math.round((totalCorrectas / totalRespondidas) * 100) 
    : 0;

  // 2. Lógica de Actividad Semanal
  const STATS_DAILY = JSON.parse(localStorage.getItem("mebank_stats_daily") || "{}");
  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    // Ajuste de zona horaria simple para evitar desfases de día
    const key = d.toISOString().split('T')[0]; 
    return { date: d, key: key, count: STATS_DAILY[key] || 0 };
  }).reverse(); // Para que quede: hoy abajo, hace 7 días arriba (o viceversa según gusto)

  const weekList = days.map(d => {
    const dd = String(d.date.getDate()).padStart(2, '0');
    const mm = String(d.date.getMonth() + 1).padStart(2, '0');
    
    // Color verde si hubo actividad, gris si no
    const colorCount = d.count > 0 ? "#16a34a" : "#94a3b8"; 
    const checkIcon = d.count > 0 ? "✅" : "⬜";

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin: 4px 0; font-size: 14px;">
        <span style="color:#64748b">➤ ${dd}/${mm}</span>
        <span>
            <b style="color:${colorCount}">${d.count} correctas</b> ${checkIcon}
        </span>
      </div>`;
  }).join("");

  // 3. HTML Principal (Estructura de Tarjetas Separadas)
  app.innerHTML = `
    <div class='card fade' style='text-align:center; max-width: 800px; margin: auto;'>
      
      <h3 style="margin-top:5px; margin-bottom: 20px;">📊 Estadísticas generales</h3>
      
      <div style="font-size: 16px; line-height: 1.8;">
        <p style="margin:0;"><b>Total de preguntas:</b> ${totalPreguntas}</p>
        <p style='color:#16a34a; margin:0;'>✔ Correctas: ${totalCorrectas}</p>
        <p style='color:#ef4444; margin:0;'>✖ Incorrectas: ${totalIncorrectas}</p>
        
        <div style="margin-top:10px; font-size: 18px;">
            <b>Precisión global:</b> ${porcentajeGlobal}%
        </div>
      </div>

      <hr style='margin:20px 0; border: 0; border-top: 1px solid #e2e8f0;'>

      <h4 style="margin-bottom:15px;">📆 Actividad semanal (solo correctas)</h4>
      <div style='text-align:left; max-width:300px; margin:auto;'>
        ${weekList}
      </div>

      <hr style='margin:20px 0; border: 0; border-top: 1px solid #e2e8f0;'>

      <div style='display:flex; justify-content:center; gap:10px;'>
        <button class='btn-small' style="background:#64748b; border-color:#64748b; color:white;" onclick='resetGlobalStats()'>
            Reiniciar global
        </button>
        <button class='btn-small' onclick='renderHome()'>Volver</button>
      </div>

    </div>

    <div class="card fade" style="max-width: 800px; margin: 20px auto; text-align: center;">
        <h3 style="margin-bottom:10px;">💡 Sugerencias de repaso</h3>
        <p style="font-size:14px; color:#64748b; margin-bottom:15px;">
          Basadas en tu actividad reciente y precisión por materia.
        </p>
        <div id="sugerencias-container">
            ${getSugerenciasHTML()}
        </div>
    </div>

    <div class="card fade" style="max-width: 800px; margin: 20px auto; text-align: center;">
      <h3 style="margin-bottom:5px;">📈 Estadísticas por materia</h3>
      <p style="font-size:13px; color:#64748b; margin-bottom:20px;">
        Tocá una materia para ver el detalle.
      </p>
      
      <ul id="matsList" style="list-style:none; padding:0; margin:0; text-align: left;">
        </ul>
    </div>
    
    <div style="text-align:center; margin: 30px 0; font-size:13px; color:#94a3b8;">
       Vos podés ❤️
    </div>
  `;

  // Renderizar la lista de materias al final
  renderMateriasList();
}

/* ==========================================================
   📋 Lista de Materias (Acordeón Simple)
   ========================================================== */
function renderMateriasList() {
  const container = document.getElementById("matsList");
  
  // Ordenar alfabéticamente (sin emojis)
  const sortedSubjects = [...BANK.subjects].sort((a, b) => {
    const cleanA = a.name.replace(/[^\p{L}\p{N} ]/gu, "").trim();
    const cleanB = b.name.replace(/[^\p{L}\p{N} ]/gu, "").trim();
    return cleanA.localeCompare(cleanB, "es", { sensitivity: "base" });
  });

  const listHTML = sortedSubjects.map(m => {
    const preguntas = BANK.questions.filter(q => q.materia === m.slug);
    const totalM = preguntas.length;
    
    // Si la materia no tiene preguntas, no la mostramos (opcional)
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

    // Colores simples
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
          
          <div style="display:flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap:10px;">
            
            <div style="font-size: 14px; line-height: 1.8; color: #475569;">
              <div>📦 Total preguntas: <b>${totalM}</b></div>
              <div style="color:#16a34a">✔ Correctas: <b>${ok}</b></div>
              <div style="color:#ef4444">✖ Incorrectas: <b>${bad}</b></div>
              <div style="color:#64748b">⚪ Sin responder: <b>${noresp}</b></div>
            </div>

            <div>
               <button class="btn-small" 
                       style="font-size:13px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius:6px;"
                       onclick="iniciarPracticaMateria('${m.slug}')">
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
   💡 Lógica de Sugerencias (Simple)
   ========================================================== */
function getSugerenciasHTML() {
  let suggestions = [];

  BANK.subjects.forEach(m => {
    const totalQ = BANK.questions.filter(q => q.materia === m.slug).length;
    if (totalQ === 0) return;

    const datos = PROG[m.slug] || {};
    let ok = 0, totalR = 0;
    Object.values(datos).forEach(p => {
      if (p.status === "ok" || p.status === "bad") {
        totalR++;
        if (p.status === "ok") ok++;
      }
    });

    if (totalR > 5) {
      const pct = Math.round((ok / totalR) * 100);
      if (pct < 60) {
        suggestions.push(`📚 Tu promedio es bajo en <b>${m.name}</b> (${pct}%).`);
      }
    } else if (totalR === 0) {
       suggestions.push(`💡 Aún no empezaste <b>${m.name}</b>.`);
    }
  });

  // Mostrar 3 aleatorias
  suggestions = suggestions.sort(() => 0.5 - Math.random()).slice(0, 3);

  if (suggestions.length === 0) {
      return `<div style="font-size:14px; color:#94a3b8; padding:10px;">Aún no hay datos suficientes para sugerencias.</div>`;
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

function resetGlobalStats() {
  if (confirm("¿Seguro que querés borrar TODAS las estadísticas y el progreso?")) {
    localStorage.removeItem("MEbank_Progreso_v3"); // O la key que uses
    localStorage.removeItem("mebank_stats_daily");
    location.reload();
  }
}

// Exponer globalmente
window.renderStats = renderStats;
