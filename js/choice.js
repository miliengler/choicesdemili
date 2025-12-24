/* ==========================================================
   📚 MEbank 3.0 – Práctica por materia (Centro de Comando)
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
  
  // 1. Filtramos y Ordenamos
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
        
        <button class="btn-small" onclick="renderHome()" style="white-space:nowrap; background:#f1f5f9; border:1px solid #cbd5e1;">
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

/* --- LÓGICA INTERNA --- */
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

/* --- RENDER FILA --- */
function renderMateriaRow(m) {
  const stats = getMateriaStats(m.slug);
  const term = normalize(choiceSearchTerm);
  
  let forceOpen = false;
  if (term) {
      const subtemas = BANK.subsubjects[m.slug] || [];
      if (subtemas.some(s => normalize(s).includes(term))) forceOpen = true;
  }

  const estaAbierta = forceOpen || (choiceOpenSlug === m.slug);

  return `
    <div class="materia-block" style="border:1px solid ${forceOpen ? '#3b82f6' : '#e2e8f0'}; border-radius:10px; padding:14px; margin-bottom:12px; background:${forceOpen ? '#eff6ff' : 'white'};">
      
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

/* --- SUBTEMAS Y BOTONERA --- */
function renderMateriaExpanded(m, term, stats) {
  const slug = m.slug;
  let subtemasTexto = BANK.subsubjects[slug] || [];

  if (term) {
      const matchName = normalize(m.name).includes(term);
      if (!matchName) {
          subtemasTexto = subtemasTexto.filter(s => normalize(s).includes(term));
      }
  }

  // Lista de Checks
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

  // --- LÓGICA DE BOTONES (PANEL DE CONTROL) ---
  const hayRespondidas = (stats.ok + stats.bad) > 0;
  const faltanResponder = (stats.total - (stats.ok + stats.bad)) > 0;
  const hayErrores = stats.bad > 0;
  const materiaDominada = (stats.ok === stats.total) && (stats.total > 0);

  // Fila 1: Iniciar y Reanudar
  let fila1 = `
    <button class="btn-main" style="flex:1;" onclick="iniciarPracticaMateria('${slug}', 'normal')">
      ▶ Iniciar
    </button>
  `;
  if (hayRespondidas && faltanResponder) {
      fila1 += `
        <button class="btn-main" style="flex:1; background:#f59e0b; border-color:#f59e0b;" onclick="iniciarPracticaMateria('${slug}', 'reanudar')">
          ⏩ Reanudar
        </button>
      `;
  }

  // Fila 2: Aprender Errores
  let fila2 = "";
  if (hayErrores) {
      fila2 = `
        <button class="btn-main" style="width:100%; background:#ef4444; border-color:#ef4444;" onclick="iniciarPracticaMateria('${slug}', 'repaso')">
           🧠 Aprender mis ${stats.bad} errores
        </button>
      `;
  } else if (materiaDominada) {
      fila2 = `
        <div style="background:#dcfce7; color:#166534; padding:10px; border-radius:8px; text-align:center; border:1px solid #86efac; font-size:14px;">
           🏆 ¡Felicitaciones! Tenés el 100% de la materia correcta.
        </div>
      `;
  }

  // Fila 3: Herramientas
  let fila3 = `
    <div style="display:flex; gap:10px; margin-top:10px;">
       <button class="btn-small" style="flex:1;" onclick="alert('Funcionalidad de Estadísticas Específicas en desarrollo')">📊 Estadísticas</button>
       <button class="btn-small" style="flex:1;" onclick="alert('Funcionalidad de Notas Específicas en desarrollo')">📒 Notas</button>
    </div>
  `;
  // Nota: Dejé los alerts en Stats/Notas por ahora, después los conectamos a pantallas reales si querés.

  return `
    <div style="margin-top:10px; padding-top:8px; border-top:1px solid #e2e8f0;">
      <p style="font-size:13px; color:#64748b; margin-bottom:6px;">
         ${term ? 'Resultados de la búsqueda:' : 'Temas:'}
      </p>
      
      <div style="max-height:250px; overflow:auto; margin-bottom:15px; padding-right:4px;">
         ${items.length ? items : '<div style="font-size:13px; color:#94a3b8;">Sin coincidencias.</div>'}
      </div>

      <div style="display:flex; gap:10px; margin-bottom:10px;">
         ${fila1}
      </div>
      
      ${fila2 ? `<div style="margin-bottom:10px;">${fila2}</div>` : ""}
      
      ${fila3}

    </div>
  `;
}

/* --- STATS & UTILS --- */
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

/* --- LANZADORES DE PRÁCTICA --- */
function iniciarPracticaMateria(mSlug, modo) {
  // 1. Obtener Subtemas Seleccionados
  const checks = document.querySelectorAll(`input[name="subtema-${mSlug}"]:checked`);
  const seleccionados = Array.from(checks).map(ch => ch.value);
  
  // 2. Obtener Preguntas Base (Todas las de la materia/subtemas)
  let preguntas = getQuestionsByMateria(mSlug, seleccionados.length ? seleccionados : null);

  if (!preguntas.length) return alert("No hay preguntas disponibles con este filtro.");

  // 3. Filtrar según el MODO
  let titulo = `Práctica – ${getMateriaNombre(mSlug)}`;
  
  if (modo === "reanudar") {
      // Filtrar las que YA tienen respuesta (ok o bad)
      const progMat = PROG[mSlug] || {};
      preguntas = preguntas.filter(q => !progMat[q.id] || (progMat[q.id].status !== 'ok' && progMat[q.id].status !== 'bad'));
      titulo += " (Reanudado)";
      
      if (!preguntas.length) return alert("¡Ya respondiste todas las preguntas de esta selección!");
  } 
  else if (modo === "repaso") {
      // Filtrar SOLO las que están MAL
      const progMat = PROG[mSlug] || {};
      preguntas = preguntas.filter(q => progMat[q.id] && progMat[q.id].status === 'bad');
      titulo += " (Repaso de Errores)";

      if (!preguntas.length) return alert("¡Genial! No tenés errores registrados en esta selección.");
  }
  else {
      // Modo NORMAL: Se usa todo el array 'preguntas' tal cual viene.
      // Al iniciar, resolver.js empezará de la 0.
      // Si respondes una que ya estaba OK, se sobreescribe. (Lógica de reaprendizaje).
  }

  // 4. Iniciar
  iniciarResolucion({
    modo: "materia",
    preguntas,
    usarTimer: false,
    titulo: titulo
  });
}
