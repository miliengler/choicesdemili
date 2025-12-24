/* ==========================================================
   📚 MEbank 3.0 – Práctica por materia (Layout Horizontal)
   ========================================================== */

let CHOICE_ORDER = localStorage.getItem("MEbank_ChoiceOrder_v1") || "az";
let choiceOpenSlug = null; 
let choiceSearchTerm = ""; 

/* --- CÍRCULO DE PROGRESO --- */
function renderProgressCircle(percent) {
  const size = 42, stroke = 4, radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const cx = size / 2, cy = size / 2;

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${cx}" cy="${cy}" r="${radius}" stroke="#e2e8f0" stroke-width="${stroke}" fill="none"></circle>
      <circle cx="${cx}" cy="${cy}" r="${radius}" stroke="${percent === 0 ? '#cbd5e1' : '#16a34a'}"
        stroke-width="${stroke}" fill="none" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
        stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})" style="transition: stroke-dashoffset 0.6s ease;"></circle>
      <text x="50%" y="55%" text-anchor="middle" font-size="12" fill="#334155" font-weight="600">${percent}%</text>
    </svg>
  `;
}

/* --- RENDER PRINCIPAL --- */
function renderChoice() {
  const app = document.getElementById("app");
  const subjects = getFilteredSubjects();

  app.innerHTML = `
    <div class="card fade" style="max-width:900px;margin:auto;">
      
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; gap:10px;">
        <div>
          <h2 style="margin:0 0 6px 0;">📚 Práctica por materia</h2>
          <p style="color:#64748b; margin:0; font-size:14px;">
             Podés seleccionar uno o más subtemas. Si no seleccionás ninguno, se usan todos.
          </p>
        </div>
        
        <button class="btn-small" onclick="renderHome()" style="white-space:nowrap; background:#fff; border:1px solid #e2e8f0; color:#475569;">
           ⬅ Volver
        </button>
      </div>

      <div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;">
        <input type="text" 
               placeholder="🔍 Buscar materia o tema..." 
               value="${choiceSearchTerm}"
               oninput="onSearchChoice(this.value)"
               style="flex:1; padding:10px; border-radius:8px; border:1px solid #cbd5e1; font-size:15px;">
        
        <select id="choiceOrderSelect" 
                style="padding:10px; border-radius:8px; border:1px solid #cbd5e1; font-size:14px; background:white; cursor:pointer;" 
                onchange="onChangeChoiceOrder(this.value)">
            <option value="az" ${CHOICE_ORDER === "az" ? "selected" : ""}>A → Z</option>
            <option value="progreso" ${CHOICE_ORDER === "progreso" ? "selected" : ""}>Por progreso</option>
        </select>
      </div>

      <div style="margin-top:10px;">
        ${subjects.length > 0 
           ? subjects.map(m => renderMateriaRow(m)).join("") 
           : `<div style="text-align:center; color:#64748b; padding:30px;">No se encontraron resultados.</div>`
        }
      </div>

    </div>
  `;
  
  if (choiceSearchTerm) {
      const input = document.querySelector("input[type='text']");
      if(input) {
          input.focus();
          const val = input.value; input.value = ''; input.value = val; 
      }
  }
}

/* --- LÓGICA --- */
function onChangeChoiceOrder(val) {
  CHOICE_ORDER = val;
  localStorage.setItem("MEbank_ChoiceOrder_v1", val);
  renderChoice();
}

function onSearchChoice(val) {
    choiceSearchTerm = val; 
    renderChoice();         
}

function getFilteredSubjects() {
  let list = [...BANK.subjects];
  const term = normalize(choiceSearchTerm);

  if (term) {
    list = list.filter(subj => {
        const matchName = normalize(subj.name).includes(term);
        const subtemas = BANK.subsubjects[subj.slug] || [];
        const matchSub = subtemas.some(s => normalize(s).includes(term));
        return matchName || matchSub;
    });
  }

  if (CHOICE_ORDER === "progreso") {
    return list.sort((a, b) => {
      const pa = getMateriaStats(a.slug).percent || 0;
      const pb = getMateriaStats(b.slug).percent || 0;
      return pb - pa;
    });
  }
  return list.sort((a, b) => {
    const cleanA = a.name.replace(/[^\p{L}\p{N} ]/gu, "").trim();
    const cleanB = b.name.replace(/[^\p{L}\p{N} ]/gu, "").trim();
    return cleanA.localeCompare(cleanB, "es", { sensitivity: "base" });
  });
}

/* --- FILA MATERIA --- */
function renderMateriaRow(m) {
  const stats = getMateriaStats(m.slug);
  const term = normalize(choiceSearchTerm);
  
  let forceOpen = false;
  if (term) {
      const subtemas = BANK.subsubjects[m.slug] || [];
      if (subtemas.some(s => normalize(s).includes(term))) forceOpen = true;
  }

  const estaAbierta = forceOpen || (choiceOpenSlug === m.slug);
  const bg = estaAbierta ? '#f8fafc' : 'white';
  const border = estaAbierta ? '#cbd5e1' : '#e2e8f0';

  return `
    <div class="materia-block" style="border:1px solid ${border}; border-radius:10px; padding:14px; margin-bottom:12px; background:${bg}; transition: all 0.2s ease;">
      
      <div style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="toggleMateriaChoice('${m.slug}')">
        <div>
          <b>${m.name}</b>
          <div style="font-size:12px; color:#64748b;">${stats.total} preguntas disponibles</div>
        </div>
        <div style="width:42px;height:42px;">${renderProgressCircle(stats.percent)}</div>
      </div>

      ${estaAbierta ? renderMateriaExpanded(m, term, stats) : ""}
    </div>
  `;
}

function toggleMateriaChoice(slug) {
  choiceOpenSlug = choiceOpenSlug === slug ? null : slug;
  renderChoice();
}

/* --- PANEL EXPANDIDO (Layout corregido) --- */
function renderMateriaExpanded(m, term, stats) {
  const slug = m.slug;
  let subtemasTexto = BANK.subsubjects[slug] || [];

  if (term) {
      const matchName = normalize(m.name).includes(term);
      if (!matchName) {
          subtemasTexto = subtemasTexto.filter(s => normalize(s).includes(term));
      }
  }

  const items = subtemasTexto.map(nombreSub => {
    const subSlug = normalize(nombreSub);
    const count = contarPreguntasMateriaSub(slug, subSlug);
    let displayName = nombreSub;
    if (term && normalize(nombreSub).includes(term)) displayName = `<b>${nombreSub}</b>`;

    return `
      <label style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; font-size:14px; border-bottom:1px dashed #e2e8f0; cursor:pointer;">
        <span>
          <input type="checkbox" name="subtema-${slug}" value="${subSlug}" style="margin-right:8px;">
          ${displayName}
        </span>
        <span style="color:#64748b; font-size:12px;">(${count})</span>
      </label>
    `;
  }).join("");

  // --- LOGICA DE BOTONES (UNA SOLA LÍNEA) ---
  const hayRespondidas = (stats.ok + stats.bad) > 0;
  const faltanResponder = (stats.total - (stats.ok + stats.bad)) > 0;
  const hayErrores = stats.bad > 0;

  // Botón Base: Iniciar
  let botonesHTML = `
    <button class="btn-small" style="flex:1; background:white; border:1px solid #3b82f6; color:#1d4ed8; font-weight:600;" 
            onclick="iniciarPracticaMateria('${slug}', 'normal')">
      ▶ Iniciar
    </button>
  `;

  // Botón: Reanudar
  if (hayRespondidas && faltanResponder) {
      botonesHTML += `
        <button class="btn-small" style="flex:1; background:white; border:1px solid #f59e0b; color:#b45309; font-weight:600;" 
                onclick="iniciarPracticaMateria('${slug}', 'reanudar')">
          ⏩ Reanudar
        </button>
      `;
  }

  // Botón: Aprender
  if (hayErrores) {
      botonesHTML += `
        <button class="btn-small" style="flex:1; background:white; border:1px solid #ef4444; color:#b91c1c; font-weight:600;" 
                onclick="iniciarPracticaMateria('${slug}', 'repaso')">
           🧠 Aprender (${stats.bad})
        </button>
      `;
  }

  // Fila Tools
  let filaTools = `
    <div style="display:flex; gap:10px; margin-top:10px;">
       <button class="btn-small" style="flex:1; background:#f8fafc; border-color:#e2e8f0; color:#64748b;" onclick="alert('Próximamente: Estadísticas detalladas')">📊 Estadísticas</button>
       <button class="btn-small" style="flex:1; background:#f8fafc; border-color:#e2e8f0; color:#64748b;" onclick="alert('Próximamente: Notas de materia')">📒 Notas</button>
    </div>
  `;

  return `
    <div style="margin-top:10px; padding-top:8px; border-top:1px solid #e2e8f0;">
      <p style="font-size:13px; color:#64748b; margin-bottom:6px;">
         ${term ? 'Resultados:' : 'Temas:'}
      </p>
      
      <div style="max-height:250px; overflow:auto; margin-bottom:15px; padding-right:4px;">
         ${items.length ? items : '<div style="font-size:13px; color:#94a3b8;">Sin coincidencias.</div>'}
      </div>

      <div style="display:flex; gap:8px; margin-bottom:10px;">
         ${botonesHTML}
      </div>
      
      ${filaTools}

    </div>
  `;
}

/* --- UTILS --- */
function getMateriaStats(slug) {
  const total = BANK.questions.filter(q => {
      if (Array.isArray(q.materia)) return q.materia.includes(slug);
      return q.materia === slug;
  }).length;

  const progMat = PROG[slug] || {};
  let ok = 0, bad = 0;
  Object.values(progMat).forEach(reg => {
    if (reg) {
        if (reg.status === "ok") ok++;
        if (reg.status === "bad") bad++;
    }
  });

  const percent = total ? Math.round(ok / total * 100) : 0;
  return { total, ok, bad, percent };
}

function contarPreguntasMateriaSub(mSlug, subSlug) {
  return BANK.questions.filter(q => {
    const esMateria = Array.isArray(q.materia) ? q.materia.includes(mSlug) : q.materia === mSlug;
    return esMateria && q.submateria === subSlug;
  }).length;
}

function getMateriaNombre(slug) {
  const mat = BANK.subjects.find(s => s.slug === slug);
  return mat ? mat.name : slug;
}

function iniciarPracticaMateria(mSlug, modo) {
  const checks = document.querySelectorAll(`input[name="subtema-${mSlug}"]:checked`);
  const seleccionados = Array.from(checks).map(ch => ch.value);
  let preguntas = getQuestionsByMateria(mSlug, seleccionados.length ? seleccionados : null);

  if (!preguntas.length) return alert("No hay preguntas disponibles con este filtro.");

  let titulo = `Práctica – ${getMateriaNombre(mSlug)}`;
  
  if (modo === "reanudar") {
      const progMat = PROG[mSlug] || {};
      preguntas = preguntas.filter(q => !progMat[q.id] || (progMat[q.id].status !== 'ok' && progMat[q.id].status !== 'bad'));
      titulo += " (Reanudado)";
      if (!preguntas.length) return alert("¡Ya respondiste todo!");
  } 
  else if (modo === "repaso") {
      const progMat = PROG[mSlug] || {};
      preguntas = preguntas.filter(q => progMat[q.id] && progMat[q.id].status === 'bad');
      titulo += " (Repaso de Errores)";
      if (!preguntas.length) return alert("¡No tenés errores registrados!");
  }

  iniciarResolucion({
    modo: "materia",
    preguntas,
    usarTimer: false,
    titulo: titulo
  });
}
