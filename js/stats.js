/* ==========================================================
   📊 MEbank 3.0 – Estadísticas Inteligentes
   ========================================================== */

function renderStats() {
  const app = document.getElementById("app");

  // Calcular totales globales
  let totalPreguntas = 0;
  let totalRespondidas = 0;
  let totalCorrectas = 0;

  // Recorrer todas las materias
  BANK.subjects.forEach(m => {
    const preguntasMateria = BANK.questions.filter(q => q.materia === m.slug);
    totalPreguntas += preguntasMateria.length;

    const progresoMateria = PROG[m.slug] || {};
    Object.values(progresoMateria).forEach(p => {
      if (p.status === "ok" || p.status === "bad") {
        totalRespondidas++;
        if (p.status === "ok") totalCorrectas++;
      }
    });
  });

  const totalIncorrectas = totalRespondidas - totalCorrectas;
  const precision = totalRespondidas > 0 ? Math.round((totalCorrectas / totalRespondidas) * 100) : 0;
  const avance = totalPreguntas > 0 ? Math.round((totalRespondidas / totalPreguntas) * 100) : 0;

  /* ---------- HTML Principal ---------- */
  app.innerHTML = `
    <div class="card fade" style="max-width:800px;margin:auto;">
      
      <h2 style="text-align:center;margin-bottom:20px;">📊 Tu Rendimiento</h2>

      <div style="display:flex;justify-content:space-around;flex-wrap:wrap;gap:15px;text-align:center;margin-bottom:30px;">
        
        <div style="flex:1;min-width:120px;padding:15px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
          <div style="font-size:24px;font-weight:bold;color:#2563eb;">${avance}%</div>
          <div style="font-size:13px;color:#64748b;">Avance del Banco</div>
          <div style="font-size:11px;color:#94a3b8;">${totalRespondidas} / ${totalPreguntas}</div>
        </div>

        <div style="flex:1;min-width:120px;padding:15px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
          <div style="font-size:24px;font-weight:bold;color:#16a34a;">${precision}%</div>
          <div style="font-size:13px;color:#64748b;">Precisión Global</div>
          <div style="font-size:11px;color:#94a3b8;">${totalCorrectas} ✅  / ${totalIncorrectas} ❌</div>
        </div>

      </div>

      ${renderSugerencias()}

      <hr style="margin:25px 0;border:0;border-top:1px dashed #cbd5e1;">

      <h3 style="margin-bottom:15px;">📈 Detalle por Materia</h3>
      <div id="stats-materias-list">
        ${renderMateriasList()}
      </div>

      <div style="margin-top:30px;text-align:center;">
        <button class="btn-small" onclick="renderHome()">⬅ Volver al inicio</button>
      </div>

    </div>
  `;
}

/* ==========================================================
   💡 Sugerencias de Repaso (Lógica)
   ========================================================== */
function renderSugerencias() {
  let suggestions = [];

  BANK.subjects.forEach(m => {
    const preguntas = BANK.questions.filter(q => q.materia === m.slug);
    if (preguntas.length === 0) return;

    const progreso = PROG[m.slug] || {};
    let ok = 0, total = 0;
    
    Object.values(progreso).forEach(p => {
      if (p.status === "ok" || p.status === "bad") {
        total++;
        if (p.status === "ok") ok++;
      }
    });

    if (total > 5) { // Solo analizar si respondió al menos 5 preguntas
      const pct = Math.round((ok / total) * 100);
      if (pct < 60) {
        suggestions.push({
          type: "low_score",
          materia: m.name,
          slug: m.slug,
          val: pct,
          msg: `Tu rendimiento en <b>${m.name}</b> es bajo (${pct}%). ¡A repasar!`
        });
      }
    } else if (total === 0) {
       suggestions.push({
          type: "no_activity",
          materia: m.name,
          slug: m.slug,
          val: 0,
          msg: `Aún no empezaste con <b>${m.name}</b>.`
       });
    }
  });

  // Priorizar: primero bajo rendimiento, luego las no tocadas
  suggestions.sort((a, b) => {
    if (a.type === "low_score" && b.type !== "low_score") return -1;
    if (a.type !== "low_score" && b.type === "low_score") return 1;
    return 0;
  });

  // Tomar top 3
  const top = suggestions.slice(0, 3);

  if (top.length === 0) return "";

  return `
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:15px;margin-bottom:20px;">
      <div style="font-weight:bold;color:#c2410c;margin-bottom:10px;">💡 Sugerencias para hoy:</div>
      <ul style="margin:0;padding-left:20px;font-size:14px;color:#431407;">
        ${top.map(s => `
          <li style="margin-bottom:6px;">
            ${s.msg} 
            <a href="#" onclick="iniciarPracticaMateria('${s.slug}')" style="color:#ea580c;text-decoration:none;font-weight:600;margin-left:5px;">▶ Practicar</a>
          </li>
        `).join("")}
      </ul>
    </div>
  `;
}

/* ==========================================================
   📋 Lista de Materias (Acordeón)
   ========================================================== */
function renderMateriasList() {
  // Ordenar alfabéticamente (limpiando emojis)
  const sorted = [...BANK.subjects].sort((a, b) => {
    const cleanA = a.name.replace(/[^\p{L}\p{N} ]/gu, "").trim();
    const cleanB = b.name.replace(/[^\p{L}\p{N} ]/gu, "").trim();
    return cleanA.localeCompare(cleanB, "es", { sensitivity: "base" });
  });

  return sorted.map(m => {
    const preguntas = BANK.questions.filter(q => q.materia === m.slug);
    const totalQ = preguntas.length;
    if (totalQ === 0) return ""; // No mostrar vacías

    const progreso = PROG[m.slug] || {};
    let ok = 0, bad = 0;
    Object.values(progreso).forEach(p => {
      if (p.status === "ok") ok++;
      if (p.status === "bad") bad++;
    });
    
    const respondidas = ok + bad;
    const pct = respondidas > 0 ? Math.round((ok / respondidas) * 100) : 0;
    const avance = Math.round((respondidas / totalQ) * 100);

    // Barra de color según precisión
    let colorBarra = "#cbd5e1"; // Gris
    if (respondidas > 0) {
      if (pct >= 70) colorBarra = "#22c55e"; // Verde
      else if (pct >= 50) colorBarra = "#f59e0b"; // Naranja
      else colorBarra = "#ef4444"; // Rojo
    }

    return `
      <div style="border:1px solid #e2e8f0;border-radius:10px;margin-bottom:10px;overflow:hidden;">
        
        <div onclick="toggleStatDetails('${m.slug}')"
             style="padding:12px 15px;background:#fff;cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
          
          <div style="flex:1;">
            <div style="font-weight:600;font-size:15px;">${m.name}</div>
            <div style="font-size:12px;color:#64748b;margin-top:2px;">
              ${respondidas}/${totalQ} respondidas (${avance}%)
            </div>
          </div>

          <div style="text-align:right;">
            <span style="font-weight:bold;font-size:16px;color:${colorBarra};">${pct}%</span>
            <div style="font-size:10px;color:#94a3b8;">Precisión</div>
          </div>

        </div>

        <div style="height:4px;width:100%;background:#f1f5f9;">
          <div style="height:100%;width:${avance}%;background:${colorBarra};transition:width 0.5s;"></div>
        </div>

        <div id="stat-det-${m.slug}" style="display:none;background:#f8fafc;padding:12px 15px;border-top:1px solid #e2e8f0;font-size:13px;">
          <div style="display:flex;gap:15px;margin-bottom:10px;">
            <div style="color:#16a34a;">✔ Correctas: <b>${ok}</b></div>
            <div style="color:#ef4444;">✖ Incorrectas: <b>${bad}</b></div>
            <div style="color:#64748b;">⚪ Restantes: <b>${totalQ - respondidas}</b></div>
          </div>
          
          <button class="btn-small" onclick="iniciarPracticaMateria('${m.slug}')">
            ▶ Practicar esta materia
          </button>
        </div>

      </div>
    `;
  }).join("");
}

/* ==========================================================
   🎮 Utilidades UI
   ========================================================== */
function toggleStatDetails(slug) {
  const el = document.getElementById(`stat-det-${slug}`);
  if (el) {
    el.style.display = el.style.display === "none" ? "block" : "none";
  }
}

// Necesitamos acceder a la función de iniciar práctica de Choice.js
// Como 'iniciarPracticaMateria' está en choice.js, la llamamos directo.
// Si no estuviera cargada, daría error, pero en tu index.html choice.js carga antes.
