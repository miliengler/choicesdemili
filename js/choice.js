/* ==========================================================
   📚 MEbank 3.0 – Práctica por materia (Textos Finales)
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

/* ==========================================================
   🏗️ RENDER ESTRUCTURA (Zero Flicker)
   ========================================================== */
function renderChoice() {
  const app = document.getElementById("app");
  
  if (document.getElementById("choice-shell")) {
      renderChoiceList(); 
      return;
  }

  app.innerHTML = `
    <div id="infoModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; align-items:center; justify-content:center; animation:fadeIn 0.2s ease;">
        <div style="background:white; padding:25px; border-radius:12px; max-width:500px; width:90%; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
            
            <h3 style="margin-top:0; color:#1e293b;">💡 Modos de práctica</h3>
            <p style="color:#64748b; font-size:14px; margin-bottom:20px;">Elegí la opción que mejor se adapte a tu estudio:</p>
            
            <div style="margin-bottom:15px;">
                <div style="font-weight:700; color:#1e293b; margin-bottom:4px;">▶ Iniciar práctica</div>
                <div style="font-size:14px; color:#475569;">Comienza una sesión con <b>todas</b> las preguntas seleccionadas (respondidas previamente o no). Ideal para repaso general.</div>
            </div>

            <div style="margin-bottom:15px;">
                <div style="font-weight:700; color:#1e293b; margin-bottom:4px;">⏩ Resolver pendientes</div>
                <div style="font-size:14px; color:#475569;">Selecciona únicamente las preguntas que <b>aún no respondiste</b>. Ideal para avanzar con material nuevo.</div>
            </div>

            <div style="margin-bottom:20px;">
                <div style="font-weight:700; color:#1e293b; margin-bottom:4px;">🧠 Repasar incorrectas</div>
                <div style="font-size:14px; color:#475569;">Genera una práctica exclusiva con las preguntas registradas como <b>Incorrectas</b>. Ideal para corregir errores y fijar conceptos.</div>
            </div>

            <div style="text-align:right;">
                <button class="btn-main" onclick="toggleInfoModal()" style="width:auto; padding:8px 20px;">Entendido</button>
            </div>
        </div>
    </div>

    <div id="choice-shell" class="card fade" style="max-width:900px;margin:auto;">
      
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; gap:10px;">
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            <h2 style="margin:0;">📚 Práctica por materia</h2>
            <button onclick="toggleInfoModal()" 
                    style="width:24px; height:24px; border-radius:50%; border:1px solid #cbd5e1; background:white; color:#64748b; font-size:14px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center;">
              ?
            </button>
          </div>
          <p style="color:#64748b; margin:0; font-size:14px;">
             Elegí una materia y opcionalmente uno o más subtemas.
          </p>
        </div>
        
        <button class="btn-small" onclick="renderHome()" style="white-space:nowrap; background:#fff; border:1px solid #e2e8f0; color:#475569;">
           ⬅ Volver
        </button>
      </div>

      <div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;">
        <input type="text" 
               id="choiceSearchInput"
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

      <div id="choiceListContainer" style="margin-top:10px; min-height:200px;">
         </div>

    </div>
  `;

  const input = document.getElementById("choiceSearchInput");
  if(choiceSearchTerm && input) {
      input.focus();
      const val = input.value; input.value = ''; input.value = val; 
  }

  renderChoiceList();
}

/* ==========================================================
   🔄 RENDER LISTA
   ========================================================== */
function renderChoiceList() {
    const container = document.getElementById("choiceListContainer");
    if(!container) return; 

    const subjects = getFilteredSubjects();

    if (subjects.length > 0) {
        container.innerHTML = subjects.map(m => renderMateriaRow(m)).join("");
    } else {
        container.innerHTML = `<div style="text-align:center; color:#64748b; padding:30px;">No se encontraron resultados.</div>`;
    }
}

/* --- EVENTOS --- */
function toggleInfoModal() {
    const el = document.getElementById("infoModal");
    if(el) el.style.display = (el.style.display === "none") ? "flex" : "none";
}

function onChangeChoiceOrder(val) {
  CHOICE_ORDER = val;
  localStorage.setItem("MEbank_ChoiceOrder_v1", val);
  renderChoiceList(); 
}

function onSearchChoice(val) {
    choiceSearchTerm = val; 
    renderChoiceList(); 
}

function toggleMateriaChoice(slug) {
  choiceOpenSlug = choiceOpenSlug === slug ? null : slug;
  renderChoiceList(); 
}

/* --- ACTUALIZACIÓN DE BOTONES (Reactividad) --- */
function updateActionButtons(slug) {
    const checks = document.querySelectorAll(`input[name="subtema-${slug}"]:checked`);
    const seleccionados = Array.from(checks).map(ch => ch.value);
    const scope = seleccionados.length ? seleccionados : null;
    const questions = getQuestionsByMateria(slug, scope);

    let ok = 0, bad = 0;
    const total = questions.length;
    const progMat = PROG[slug] || {};
    
    questions.forEach(q => {
        const r = progMat[q.id];
        if(r) {
            if(r.status === 'ok') ok++;
            if(r.status === 'bad') bad++;
        }
    });

    const html = getButtonsHTML(slug, { total, ok, bad });
    const container = document.getElementById(`actions-${slug}`);
    if(container) container.innerHTML = html;
}

/* --- GENERADOR DE BOTONES --- */
function getButtonsHTML(slug, stats) {
    const hayRespondidas = (stats.ok + stats.bad) > 0;
    const faltanResponder = (stats.total - (stats.ok + stats.bad)) > 0;
    const hayErrores = stats.bad > 0;
    const pendientes = stats.total - (stats.ok + stats.bad);

    const commonStyle = "flex:1; background:white; border:1px solid #3b82f6; color:#1d4ed8; font-weight:600;";

    let html = `
      <button class="btn-small" style="${commonStyle}" onclick="iniciarPracticaMateria('${slug}', 'normal')">
        ▶ Iniciar práctica
      </button>
    `;

    if (hayRespondidas && faltanResponder) {
        html += `
          <button class="btn-small" style="${commonStyle}" onclick="iniciarPracticaMateria('${slug}', 'reanudar')">
            ⏩ Resolver pendientes (${pendientes})
          </button>
        `;
    }

    if (hayErrores) {
        html += `
          <button class="btn-small" style="${commonStyle}" onclick="iniciarPracticaMateria('${slug}', 'repaso')">
             🧠 Repasar incorrectas (${stats.bad})
          </button>
        `;
    }
    return html;
}

/* --- FILTRADO --- */
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
  const bg = estaAbierta ? '#f8fafc' : 'white';
  const border = estaAbierta ? '#cbd5e1' : '#e2e8f0';

  return `
    <div class="materia-block fade" style="border:1px solid ${border}; border-radius:10px; padding:14px; margin-bottom:12px; background:${bg}; transition: background 0.2s ease;">
      
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

/* --- RENDER EXPANDIDO --- */
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
          <input type="checkbox" name="subtema-${slug}" value="${subSlug}" onchange="updateActionButtons('${slug}')" style="margin-right:8px;">
          ${displayName}
        </span>
        <span style="color:#64748b; font-size:12px;">(${count})</span>
      </label>
    `;
  }).join("");

  // TOOLS
  const cleanName = m.name.replace(/[^\p{L}\p{N}\s]/gu, "").trim();
  let filaTools = `
    <div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
       <button class="btn-small" style="flex:1; background:#f8fafc; border-color:#e2e8f0; color:#64748b;" 
               onclick="alert('Próximamente: Estadísticas de ${cleanName}')">
           📊 Ver estadísticas de ${cleanName}
       </button>
       <button class="btn-small" style="flex:1; background:#f8fafc; border-color:#e2e8f0; color:#64748b;" 
               onclick="alert('Próximamente: Notas de ${cleanName}')">
           📒 Mis notas de ${cleanName}
       </button>
    </div>
  `;

  return `
    <div style="margin-top:10px; padding-top:8px; border-top:1px solid #e2e8f0;">
      <p style="font-size:13px; color:#64748b; margin-bottom:6px;">
         ${term ? 'Resultados de la búsqueda:' : 'Podés seleccionar uno o más subtemas. Si no seleccionás ninguno, se usan todos.'}
      </p>
      
      <div style="max-height:250px; overflow:auto; margin-bottom:15px; padding-right:4px;">
         ${items.length ? items : '<div style="font-size:13px; color:#94a3b8;">Sin coincidencias.</div>'}
      </div>

      <div id="actions-${slug}" style="display:flex; gap:8px; margin-bottom:10px; flex-wrap:wrap;">
         ${getButtonsHTML(slug, stats)}
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
      titulo += " (Pendientes)";
      if (!preguntas.length) return alert("¡Excelente! No hay preguntas pendientes con esta selección.");
  } 
  else if (modo === "repaso") {
      const progMat = PROG[mSlug] || {};
      preguntas = preguntas.filter(q => progMat[q.id] && progMat[q.id].status === 'bad');
      titulo += " (Repaso de Incorrectas)";
      if (!preguntas.length) return alert("¡Bien hecho! No tenés respuestas incorrectas registradas.");
  }

  iniciarResolucion({
    modo: "materia",
    preguntas,
    usarTimer: false,
    titulo: titulo
  });
}
