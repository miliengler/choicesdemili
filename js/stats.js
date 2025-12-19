/* ==========================================================
   📊 ESTADÍSTICAS GLOBALES – Estilo Clásico
   ========================================================== */

function renderStats() {
  const app = document.getElementById("app");

  // 1. Cálculos Globales
  let totalPreguntas = 0;
  let totalRespondidas = 0;
  let totalCorrectas = 0;
  let totalIncorrectas = 0;

  BANK.subjects.forEach(m => {
    // Total de preguntas en el banco
    const preguntasMateria = BANK.questions.filter(q => q.materia === m.slug);
    totalPreguntas += preguntasMateria.length;

    // Progreso del usuario
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

  // 2. HTML Principal (Estilo Clásico)
  app.innerHTML = `
    <div class='card fade' style='text-align:center; max-width: 800px; margin: auto;'>
      
      <h3 style="margin-top:0;">📊 Estadísticas generales</h3>
      
      <div style="font-size: 15px; margin-top: 15px; line-height: 1.8;">
        <p style="margin:0;"><b>Total de preguntas:</b> ${totalPreguntas}</p>
        <p style='color:#16a34a; margin:0;'>✔ Correctas: ${totalCorrectas}</p>
        <p style='color:#ef4444; margin:0;'>✖ Incorrectas: ${totalIncorrectas}</p>
        <p style="margin:0;">⚪ Sin responder: ${totalPreguntas - totalRespondidas}</p>
        
        <div style="margin-top:10px; font-size: 18px;">
            <b>Precisión global:</b> <span style="color:${getColor(porcentajeGlobal)}">${porcentajeGlobal}%</span>
        </div>
      </div>

      <hr style='margin:18px 0; border: 0; border-top: 1px solid #e2e8f0;'>

      <div id="sugerencias-container">
        ${getSugerenciasHTML()}
      </div>

      <hr style='margin:18px 0; border: 0; border-top: 1px solid #e2e8f0;'>

      <h4 style="margin-bottom:15px;">📈 Estadísticas por materia</h4>
      <p style="font-size:13px; color:#64748b; margin-top:-10px; margin-bottom:15px;">
        Tocá una materia para ver el detalle.
      </p>
      
      <ul id="matsList" style="list-style:none; padding:0; margin:0; text-align: left;">
        </ul>

      <div style='margin-top:30px;'>
        <button class='btn-small' onclick='renderHome()'>⬅ Volver</button>
      </div>

    </div>
  `;

  // 3. Renderizar la lista de materias
  renderMateriasList();
}

/* ==========================================================
   📋 Lista de Materias (Acordeón Clásico)
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
    // Cálculos por materia
    const totalM = BANK.questions.filter(q => q.materia === m.slug).length;
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

    return `
      <li style="margin-bottom: 8px;">
        
        <div onclick="toggleStatsAcc('${m.slug}')"
             style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;
                    padding: 12px 16px; cursor: pointer; display: flex; justify-content: space-between;
                    align-items: center; transition: background 0.2s;">
          
          <div style="font-weight: 600; color: #334155;">${m.name}</div>
          <div style="font-size: 13px; font-weight: bold; color: ${getColor(pct)};">
            ${pct}%
          </div>
        </div>

        <div id="stat-${m.slug}" style="display:none; padding: 15px; background: #f8fafc; 
             border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; margin-top: -4px;">
          
          <div style="display:flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap:10px;">
            
            <div style="font-size: 13px; line-height: 1.6; color: #475569;">
              <div>📦 Total: <b>${totalM}</b></div>
              <div style="color:#16a34a">✔ Correctas: <b>${ok}</b></div>
              <div style="color:#ef4444">✖ Incorrectas: <b>${bad}</b></div>
              <div style="color:#94a3b8">⚪ Sin hacer: <b>${noresp}</b></div>
            </div>

            <div>
               <button class="btn-small" 
                       style="font-size:12px; padding: 6px 12px; background: #3b82f6; color: white; border: none;"
                       onclick="iniciarPracticaMateria('${m.slug}')">
                 Practicar ▶
               </button>
            </div>

          </div>
          
          <div style="margin-top:10px; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
             <div style="width: ${pct}%; height: 100%; background: ${getColor(pct)};"></div>
          </div>

        </div>
      </li>
    `;
  }).join("");

  container.innerHTML = listHTML;
}

/* ==========================================================
   💡 Lógica de Sugerencias
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
        suggestions.push({
          msg: `📚 Tu promedio es bajo en <b>${m.name}</b> (${pct}%).`,
          slug: m.slug
        });
      }
    } else if (totalR === 0) {
       suggestions.push({
          msg: `💡 Aún no empezaste <b>${m.name}</b>.`,
          slug: m.slug
       });
    }
  });

  // Mostrar máximo 2 sugerencias aleatorias para no saturar
  suggestions = suggestions.sort(() => 0.5 - Math.random()).slice(0, 2);

  if (suggestions.length === 0) return "";

  return `
    <div style="text-align: left; background: #fff7ed; border: 1px solid #ffedd5; padding: 12px; border-radius: 8px;">
      <h4 style="margin: 0 0 8px 0; color: #c2410c; font-size: 14px;">💡 Sugerencias:</h4>
      <ul style="margin:0; padding-left: 20px; font-size: 13px; color: #9a3412;">
        ${suggestions.map(s => `
          <li style="margin-bottom:4px;">
            ${s.msg} 
            <a href="#" onclick="iniciarPracticaMateria('${s.slug}')" style="color:#ea580c; font-weight:bold; text-decoration:none;">[Ir]</a>
          </li>
        `).join("")}
      </ul>
    </div>
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

function getColor(pct) {
  if (pct >= 70) return "#16a34a"; // Verde
  if (pct >= 50) return "#f59e0b"; // Naranja
  return "#ef4444"; // Rojo
}

// Exponer globalmente
window.renderStats = renderStats;
