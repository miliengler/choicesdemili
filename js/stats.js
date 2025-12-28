/* ==========================================================
   📊 MEbank 3.0 – Estadísticas (Dominio + Tema a Reforzar)
   ========================================================== */

function renderStats() {
  const app = document.getElementById("app");
  
  // 1. CÁLCULO GLOBAL
  let totalOkGlobal = 0;
  let totalBadGlobal = 0;
  let totalPreguntasGlobal = BANK.questions.length;

  BANK.questions.forEach(q => {
      const status = getQuestionStatus(q); 
      if (status === 'ok') totalOkGlobal++;
      if (status === 'bad') totalBadGlobal++;
  });

  const totalRespondidas = totalOkGlobal + totalBadGlobal;
  const percentGlobal = totalPreguntasGlobal > 0 
      ? Math.round((totalOkGlobal / totalPreguntasGlobal) * 100) 
      : 0;

  // 2. CÁLCULO POR MATERIA + DETECCIÓN DE "TEMA A REFORZAR"
  const statsPorMateria = BANK.subjects.map(s => {
      // Filtramos preguntas de la materia (soporte arrays)
      const preguntasDeLaMateria = BANK.questions.filter(q => {
          if (Array.isArray(q.materia)) return q.materia.includes(s.slug);
          return q.materia === s.slug;
      });

      const totalMateria = preguntasDeLaMateria.length;
      let okMateria = 0;
      let badMateria = 0;
      
      // Objeto para rastrear subtemas: { "farmaco": { ok: 2, total: 5 } }
      const subtemasStats = {}; 

      preguntasDeLaMateria.forEach(q => {
          const st = getQuestionStatus(q);
          if (st === 'ok') okMateria++;
          if (st === 'bad') badMateria++;

          // Agrupamos por subtema si existe
          if (q.submateria) {
              const subSlug = q.submateria; 
              if (!subtemasStats[subSlug]) subtemasStats[subSlug] = { ok: 0, total: 0 };
              subtemasStats[subSlug].total++;
              if (st === 'ok') subtemasStats[subSlug].ok++;
          }
      });

      const percent = totalMateria > 0 
          ? Math.round((okMateria / totalMateria) * 100) 
          : 0;

      // --- LÓGICA: ENCONTRAR TEMA A REFORZAR ---
      // Buscamos el subtema con MENOR porcentaje de aciertos
      let weakTopicName = null;
      let minPercent = 101; // Empezamos alto para que cualquier % real sea menor

      Object.keys(subtemasStats).forEach(subSlug => {
          const sData = subtemasStats[subSlug];
          
          // Condición: Haber respondido al menos 1 pregunta de ese tema
          // (Para no marcar temas que ni siquiera leíste todavía)
          if (sData.total > 0 && (sData.ok < sData.total)) { 
              const p = Math.round((sData.ok / sData.total) * 100);
              
              // Nos quedamos con el más bajo
              if (p < minPercent) {
                  minPercent = p;
                  weakTopicName = getBestSubtopicName(s.slug, subSlug);
              }
          }
      });

      // Si tiene todo perfecto (100%) o no respondió nada, no mostramos aviso
      if (minPercent === 101) weakTopicName = null;

      return {
          name: s.name,
          slug: s.slug,
          total: totalMateria,
          ok: okMateria,
          percent: percent,
          weakTopic: weakTopicName
      };
  }).filter(m => m.total > 0);

  // Orden alfabético
  statsPorMateria.sort((a, b) => a.name.localeCompare(b.name));


  // 3. GENERAR HTML
  const rows = statsPorMateria.map(m => `
    <div class="stat-row">
      <div class="stat-info">
         <div class="stat-header">
            <div class="stat-name">${m.name}</div>
            <div class="stat-percent-text">${m.percent}%</div>
         </div>
         
         <div class="stat-bar-bg">
            <div class="stat-bar-fill" style="width: ${m.percent}%;"></div>
         </div>

         <div class="stat-footer">
            <span>${m.ok} aprendidas / ${m.total} totales</span>
            
            ${m.weakTopic ? `<span class="insight-badge">⚠️ Tema a reforzar: <b>${m.weakTopic}</b></span>` : ''}
         </div>
      </div>
    </div>
  `).join("");

  const styles = `
    <style>
      .stat-card {
         background: white; border-radius: 12px; padding: 20px;
         box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
         border: 1px solid #e2e8f0; margin-bottom: 20px;
      }
      .stat-row { padding: 15px 0; border-bottom: 1px solid #f1f5f9; }
      .stat-row:last-child { border-bottom: none; }
      
      .stat-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
      .stat-name { font-weight: 700; color: #334155; font-size: 15px; }
      .stat-percent-text { font-weight: 800; color: #3b82f6; font-size: 14px; }

      .stat-bar-bg {
         width: 100%; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; margin-bottom: 8px;
      }
      .stat-bar-fill {
         height: 100%; background: #3b82f6; border-radius: 4px; transition: width 0.5s ease;
      }

      .stat-footer { 
         display: flex; justify-content: space-between; align-items: center; 
         font-size: 12px; color: #94a3b8; flex-wrap: wrap; gap: 8px; 
      }
      
      .insight-badge {
         background: #fff1f2; color: #be123c; 
         padding: 3px 8px; border-radius: 6px; 
         font-size: 11px; border: 1px solid #fda4af;
      }

      .pie-chart {
         width: 120px; height: 120px; border-radius: 50%;
         background: conic-gradient(#16a34a 0% ${percentGlobal}%, #f1f5f9 ${percentGlobal}% 100%);
         display: flex; align-items: center; justify-content: center;
         margin: 0 auto 15px auto; position: relative;
      }
      .pie-chart::after {
         content: ""; position: absolute; width: 90px; height: 90px; background: white; border-radius: 50%;
      }
      .pie-text { position: absolute; z-index: 1; text-align: center; }
      .pie-big { font-size: 26px; font-weight: 800; color: #0f172a; }
      .pie-small { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; }

      .kpi-box { flex: 1; background: #f8fafc; border-radius: 8px; padding: 10px; text-align: center; border: 1px solid #e2e8f0; }
      .kpi-num { font-size: 18px; font-weight: 700; color: #334155; }
      .kpi-label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; margin-top: 2px; }
    </style>
  `;

  app.innerHTML = `
    ${styles}
    <div class="fade" style="max-width:800px; margin:auto; padding-bottom:40px;">
      
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h2 style="margin:0; font-size:24px; color:#0f172a;">📊 Mis Estadísticas</h2>
        <button class="btn-small" onclick="renderHome()">⬅ Volver</button>
      </div>

      <div class="stat-card">
         <h3 style="margin-top:0; color:#1e3a8a; font-size:15px; margin-bottom:15px; text-align:center; text-transform:uppercase; letter-spacing:0.5px;">Dominio Global</h3>
         
         <div class="pie-chart">
            <div class="pie-text">
               <div class="pie-big">${percentGlobal}%</div>
               <div class="pie-small">Completado</div>
            </div>
         </div>

         <div style="display:flex; gap:10px; margin-top:20px;">
            <div class="kpi-box">
               <div class="kpi-num" style="color:#16a34a;">${totalOkGlobal}</div>
               <div class="kpi-label">Aprendidas</div>
            </div>
            <div class="kpi-box">
               <div class="kpi-num" style="color:#ef4444;">${totalBadGlobal}</div>
               <div class="kpi-label">Errores</div>
            </div>
            <div class="kpi-box">
               <div class="kpi-num" style="color:#64748b;">${totalPreguntasGlobal - totalRespondidas}</div>
               <div class="kpi-label">Pendientes</div>
            </div>
         </div>
      </div>

      <h3 style="margin:25px 0 10px 0; color:#334155; font-size:16px;">Detalle por Materia</h3>
      <div class="stat-card" style="padding: 0 20px;">
         ${rows}
      </div>

    </div>
  `;
}

/* ==========================================================
   🛠 HELPERS
   ========================================================== */

function getQuestionStatus(q) {
    if (typeof PROG === 'undefined') return null;
    const matPrincipal = Array.isArray(q.materia) ? q.materia[0] : (q.materia || "otras");
    if (PROG[matPrincipal] && PROG[matPrincipal][q.id]) {
        return PROG[matPrincipal][q.id].status;
    }
    return null;
}

// ✨ FUNCIÓN PARA LIMPIAR NOMBRES DE SUBTEMAS
function getBestSubtopicName(materiaSlug, subSlug) {
    if (!subSlug) return "";

    // 1. Intentar buscar en la lista oficial del banco
    if (BANK.subsubjects && BANK.subsubjects[materiaSlug]) {
        const list = BANK.subsubjects[materiaSlug];
        // Normalizamos ambos para comparar sin importar mayúsculas o espacios
        const normalizedSub = subSlug.toLowerCase().replace(/[^a-z0-9]/g, "");
        
        const match = list.find(nombreOficial => {
            const normalizedOficial = nombreOficial.toLowerCase().replace(/[^a-z0-9]/g, "");
            return normalizedOficial === normalizedSub; 
        });
        
        if (match) return match; // Devolvemos el nombre bonito "Psicofármacos"
    }

    // 2. Fallback: Limpieza manual si no se encontró
    // Reemplaza guiones y pone mayúscula inicial
    let clean = subSlug.replace(/[_-]/g, " "); 
    return clean.charAt(0).toUpperCase() + clean.slice(1);
}
