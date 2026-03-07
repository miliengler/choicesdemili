/* ==========================================================
   📚 MEbank 3.0 – Práctica por materia (Con Modal Stats 📊 + Reset + Nombres Lindos)
   ========================================================== */

let CHOICE_ORDER = localStorage.getItem("MEbank_ChoiceOrder_v1") || "az";
let choiceOpenSlug = null; 
let choiceSearchTerm = ""; 
let choiceOnlyOfficial = false; 

/* --- CÍRCULO DE PROGRESO (Lista principal) --- */
function renderProgressCircle(percent) {
  const size = 42, stroke = 4, radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const cx = size / 2, cy = size / 2;
  const color = percent === 0 ? '#cbd5e1' : '#16a34a';

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${cx}" cy="${cy}" r="${radius}" stroke="#e2e8f0" stroke-width="${stroke}" fill="none"></circle>
      <circle cx="${cx}" cy="${cy}" r="${radius}" stroke="${color}"
        stroke-width="${stroke}" fill="none" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
        stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})" style="transition: stroke-dashoffset 0.6s ease;"></circle>
      <text x="50%" y="55%" text-anchor="middle" font-size="12" fill="#334155" font-weight="600">${percent}%</text>
    </svg>
  `;
}

/* ==========================================================
   🏗️ RENDER ESTRUCTURA
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
                <div style="font-size:14px; color:#475569;">Comienza una sesión con <b>todas</b> las preguntas seleccionadas.</div>
            </div>
            <div style="margin-bottom:15px;">
                <div style="font-weight:700; color:#1e293b; margin-bottom:4px;">⏩ Resolver pendientes</div>
                <div style="font-size:14px; color:#475569;">Selecciona únicamente las preguntas que <b>aún no respondiste</b>.</div>
            </div>
            <div style="margin-bottom:20px;">
                <div style="font-weight:700; color:#1e293b; margin-bottom:4px;">🧠 Repasar incorrectas</div>
                <div style="font-size:14px; color:#475569;">Genera una práctica con las preguntas registradas como <b>Incorrectas</b>.</div>
            </div>
            <div style="text-align:right;">
                <button class="btn-main" onclick="toggleInfoModal()" style="width:auto; padding:8px 20px;">Entendido</button>
            </div>
        </div>
    </div>

    <div id="statsModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; align-items:center; justify-content:center; animation:fadeIn 0.2s ease; backdrop-filter: blur(2px);">
        <div class="modal-content" style="background:white; padding:0; border-radius:12px; max-width:500px; width:90%; box-shadow:0 10px 30px rgba(0,0,0,0.2); overflow:hidden; display:flex; flex-direction:column; max-height:90vh;">
            
            <div style="padding:15px 20px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
                <h3 id="statsModalTitle" style="margin:0; font-size:18px; color:#1e293b;">Estadísticas</h3>
                <button onclick="document.getElementById('statsModal').style.display='none'" 
                        style="background:none; border:none; font-size:24px; cursor:pointer; color:#64748b; line-height:1;">
                    &times;
                </button>
            </div>

            <div id="statsModalBody" style="padding:20px; overflow-y:auto;">
                </div>

            <div style="padding:15px 20px; border-top:1px solid #e2e8f0; text-align:right; background:white;">
                <button class="btn-main" onclick="document.getElementById('statsModal').style.display='none'" style="width:auto; padding:8px 20px; font-size:14px;">Cerrar</button>
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

      <div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap; align-items:center;">
        
        <input type="text" 
               id="choiceSearchInput"
               placeholder="🔍 Buscar materia o tema..." 
               value="${choiceSearchTerm}"
               oninput="onSearchChoice(this.value)"
               style="flex:1; padding:10px; border-radius:8px; border:1px solid #cbd5e1; font-size:15px; min-width: 150px;">
        
        <label style="display:flex; align-items:center; gap:6px; background:#f0fdf4; border:1px solid #bbf7d0; padding:8px 12px; border-radius:8px; cursor:pointer; user-select:none;">
            <input type="checkbox" id="chkOficialesChoice" ${choiceOnlyOfficial ? "checked" : ""} onchange="toggleChoiceOfficial(this.checked)" style="accent-color:#16a34a;">
            <span style="font-size:13px; color:#166534; font-weight:600;">⭐️ Solo Oficiales</span>
        </label>

        <select id="choiceOrderSelect" 
                style="padding:10px; border-radius:8px; border:1px solid #cbd5e1; font-size:14px; background:white; cursor:pointer;" 
                onchange="onChangeChoiceOrder(this.value)">
            <option value="az" ${CHOICE_ORDER === "az" ? "selected" : ""}>A → Z</option>
            <option value="progreso" ${CHOICE_ORDER === "progreso" ? "selected" : ""}>Por progreso</option>
        </select>
      </div>

      <div id="choiceListContainer" style="margin-top:10px; min-height:200px;"></div>

    </div>
  `;

  const input = document.getElementById("choiceSearchInput");
  if(choiceSearchTerm && input) { input.focus(); input.value = ''; input.value = choiceSearchTerm; }

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
        container.innerHTML = `<div style="text-align:center; color:#64748b; padding:30px;">No se encontraron materias con ese criterio.</div>`;
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

function toggleChoiceOfficial(checked) {
    choiceOnlyOfficial = checked;
    renderChoiceList(); 
}

function toggleMateriaChoice(slug) {
  choiceOpenSlug = choiceOpenSlug === slug ? null : slug;
  renderChoiceList(); 
}

function toggleAllSubtemas(slug, state) {
    const checks = document.querySelectorAll(`input[name="subtema-${slug}"]`);
    checks.forEach(c => c.checked = state);
    updateInterfaceState(slug);
}

function updateInterfaceState(slug) {
    const allChecks = document.querySelectorAll(`input[name="subtema-${slug}"]`);
    const checkedChecks = document.querySelectorAll(`input[name="subtema-${slug}"]:checked`);
    
    const controlsContainer = document.getElementById(`controls-${slug}`);
    if (controlsContainer) {
        controlsContainer.innerHTML = getControlsHTML(slug, allChecks.length, checkedChecks.length);
    }

    const seleccionados = Array.from(checkedChecks).map(ch => ch.value);
    const scope = seleccionados.length ? seleccionados : null;
    let questions = getQuestionsByMateria(slug, scope);

    if (choiceOnlyOfficial) {
        questions = questions.filter(q => q.oficial === true);
    }

    let ok = 0, bad = 0;
    const progMat = PROG[slug] || {};
    questions.forEach(q => {
        const r = progMat[q.id];
        if(r) {
            if(r.status === 'ok') ok++;
            if(r.status === 'bad') bad++;
        }
    });

    const actionsContainer = document.getElementById(`actions-${slug}`);
    if (actionsContainer) {
        actionsContainer.innerHTML = getActionButtonsHTML(slug, { total: questions.length, ok, bad });
    }
}

/* --- HTML GENERATORS --- */
function getControlsHTML(slug, total, selected) {
    const noneSelected = selected === 0;
    const allSelected = selected === total;
    const styleActive = "color:#1e3a8a; font-weight:700; cursor:pointer;";
    const styleInactive = "color:#cbd5e1; cursor:default; pointer-events:none;";

    return `
        <span onclick="${!allSelected ? `toggleAllSubtemas('${slug}', true)` : ''}" style="${allSelected ? styleInactive : styleActive}">Marcar todos</span>
        <span style="color:#e2e8f0; margin:0 8px;">|</span>
        <span onclick="${!noneSelected ? `toggleAllSubtemas('${slug}', false)` : ''}" style="${noneSelected ? styleInactive : styleActive}">Desmarcar todos</span>
    `;
}

function getActionButtonsHTML(slug, stats) {
    const hayRespondidas = (stats.ok + stats.bad) > 0;
    const faltanResponder = (stats.total - (stats.ok + stats.bad)) > 0;
    const hayErrores = stats.bad > 0;
    const pendientes = stats.total - (stats.ok + stats.bad);

    const commonStyle = "flex:1; background:white; border:1px solid #3b82f6; color:#1d4ed8; font-weight:600;";

    if (stats.total === 0) {
        return `<div style="width:100%; text-align:center; color:#94a3b8; font-size:13px; padding:10px;">⚠️ No hay preguntas oficiales en esta selección.</div>`;
    }

    let html = `
      <button class="btn-small" style="${commonStyle}" onclick="iniciarPracticaMateria('${slug}', 'normal')">
        ▶ Iniciar práctica
      </button>
    `;

    if (hayRespondidas && faltanResponder) {
        html += `
          <button class="btn-small" style="${commonStyle}" onclick="iniciarPracticaMateria('${slug}', 'reanudar')">
            ⏩ Pendientes (${pendientes})
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

  if (choiceOnlyOfficial) {
      list = list.filter(subj => {
          const stats = getMateriaStats(subj.slug);
          return stats.total > 0;
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
          <div style="font-size:12px; color:#64748b;">
             ${stats.total} preguntas ${choiceOnlyOfficial ? '⭐️' : ''}
          </div>
        </div>
        <div style="width:42px;height:42px;">${renderProgressCircle(stats.percent)}</div>
      </div>
      ${estaAbierta ? renderMateriaExpanded(m, term, stats) : ""}
    </div>
  `;
}

function renderMateriaExpanded(m, term, stats) {
  const slug = m.slug;
  const fullSubtemas = BANK.subsubjects[slug] || [];
  const totalMateria = stats.total; 
  let sumaParcial = 0;
  const countsMap = {};

  fullSubtemas.forEach((nombreSub, index) => {
      const isLast = (index === fullSubtemas.length - 1);
      const subSlug = normalize(nombreSub);
      if (!isLast) {
          const c = contarPreguntasMateriaSubEstricto(slug, subSlug);
          countsMap[subSlug] = c;
          sumaParcial += c;
      } else {
          let resto = totalMateria - sumaParcial;
          if (resto < 0) resto = 0;
          countsMap[subSlug] = resto;
      }
  });

  let visibleSubtemas = fullSubtemas;
  if (term) {
      const matchName = normalize(m.name).includes(term);
      if (!matchName) {
          visibleSubtemas = fullSubtemas.filter(s => normalize(s).includes(term));
      }
  }

  const items = visibleSubtemas.map(nombreSub => {
    const subSlug = normalize(nombreSub);
    const count = countsMap[subSlug] || 0; 
    const isZero = count === 0;
    const styleLabel = isZero ? "color:#cbd5e1;" : "";
    let displayName = nombreSub;
    if (term && normalize(nombreSub).includes(term)) displayName = `<b>${nombreSub}</b>`;
    return `
      <label style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; font-size:14px; border-bottom:1px dashed #e2e8f0; cursor:${isZero ? 'default' : 'pointer'}; ${styleLabel}">
        <span>
          <input type="checkbox" name="subtema-${slug}" value="${subSlug}" ${isZero ? 'disabled' : ''} onchange="updateInterfaceState('${slug}')" style="margin-right:8px;">
          ${displayName}
        </span>
        <span style="font-size:12px;">(${count})</span>
      </label>
    `;
  }).join("");

  const cleanName = m.name.replace(/[^\p{L}\p{N}\s]/gu, "").trim();
  const controlsHTML = items.length ? getControlsHTML(slug, visibleSubtemas.length, 0) : '';

  let filaTools = `
    <div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap; padding-top:10px; border-top:1px dashed #e2e8f0;">
       <button class="btn-small" style="flex:1; background:#f8fafc; border:1px solid #e2e8f0; color:#64748b; font-size:12px;" 
               onclick="openStatsModal('${slug}')">
           📊 Ver estadísticas
       </button>
       <button class="btn-small" style="flex:1; background:#f8fafc; border:1px solid #e2e8f0; color:#64748b; font-size:12px;" 
               onclick="verNotasMateria('${slug}')">
           📒 Ver mis notas
       </button>
    </div>
  `;

  return `
    <div style="margin-top:10px; padding-top:8px; border-top:1px solid #e2e8f0;">
      <div id="controls-${slug}" style="display:flex; justify-content:center; align-items:center; margin-bottom:10px; font-size:13px;">
          ${controlsHTML}
      </div>
      <div style="max-height:250px; overflow:auto; margin-bottom:15px; padding-right:4px;">
         ${items.length ? items : '<div style="font-size:13px; color:#94a3b8;">Sin coincidencias.</div>'}
      </div>
      <div id="actions-${slug}" style="display:flex; gap:8px; margin-bottom:10px; flex-wrap:wrap;">
         ${getActionButtonsHTML(slug, stats)}
      </div>
      ${filaTools}
    </div>
  `;
}

/* --- UTILS --- */
function getMateriaStats(slug) {
  const total = BANK.questions.filter(q => {
      const esMat = Array.isArray(q.materia) ? q.materia.includes(slug) : q.materia === slug;
      if (!esMat) return false;
      if (choiceOnlyOfficial && q.oficial !== true) return false;
      return true;
  }).length;

  const progMat = PROG[slug] || {};
  let ok = 0, bad = 0;
  
  BANK.questions.forEach(q => {
      const esMat = Array.isArray(q.materia) ? q.materia.includes(slug) : q.materia === slug;
      if (!esMat) return;
      if (choiceOnlyOfficial && q.oficial !== true) return;
      const reg = progMat[q.id];
      if (reg) {
          if (reg.status === "ok") ok++;
          if (reg.status === "bad") bad++;
      }
  });

  const percent = total ? Math.round(ok / total * 100) : 0;
  return { total, ok, bad, percent };
}

function contarPreguntasMateriaSubEstricto(mSlug, subSlug) {
  const normSubSlug = normalize(subSlug);
  return BANK.questions.filter(q => {
    // Buscamos dentro del array de materias
    if (!q.materia.includes(mSlug)) return false;
    if (choiceOnlyOfficial && q.oficial !== true) return false;
    
    // Buscamos dentro del array de subtemas
    const normQSubs = q.submateria.map(s => normalize(s));
    return normQSubs.includes(normSubSlug);
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

  if (choiceOnlyOfficial) preguntas = preguntas.filter(q => q.oficial === true);
  if (!preguntas.length) return alert("No hay preguntas disponibles con este filtro.");

  let titulo = `${getMateriaNombre(mSlug)}`;
  if (choiceOnlyOfficial) titulo += " ⭐️";

  if (modo === "reanudar") {
      const progMat = PROG[mSlug] || {};
      preguntas = preguntas.filter(q => !progMat[q.id] || (progMat[q.id].status !== 'ok' && progMat[q.id].status !== 'bad'));
      titulo += " (Pendientes)";
  } 
  else if (modo === "repaso") {
      const progMat = PROG[mSlug] || {};
      preguntas = preguntas.filter(q => progMat[q.id] && progMat[q.id].status === 'bad');
      titulo += " (Repaso Incorrectas)";
  }

  if (!preguntas.length) return alert("¡Excelente! No hay preguntas para esa selección.");
  iniciarResolucion({ modo: "materia", preguntas, usarTimer: false, titulo: titulo });
}

/* ==========================================================
   📊 MODAL DE ESTADÍSTICAS (Actualizado con Barras)
   ========================================================== */

// Variable temporal para guardar el slug abierto en el modal
let currentModalSlug = null;
let currentSubtopicSort = "original"; // original | error | acierto

function openStatsModal(slug) {
    currentModalSlug = slug;
    currentSubtopicSort = "original"; // Resetear orden al abrir

    // 1. Calcular Stats Globales (Igual que antes)
    const questions = BANK.questions.filter(q => {
        return Array.isArray(q.materia) ? q.materia.includes(slug) : q.materia === slug;
    });

    const total = questions.length;
    const progMat = PROG[slug] || {};
    let ok = 0, bad = 0;
    
    Object.values(progMat).forEach(reg => {
        if(reg.status === 'ok') ok++;
        if(reg.status === 'bad') bad++;
    });

    const noResp = total - (ok + bad);
    
    // Gráfico de Torta Global
    let pieStyle = `background: #e2e8f0;`;
    if (total > 0) {
        const degOk = (ok / total) * 360;
        const degBad = (bad / total) * 360;
        pieStyle = `background: conic-gradient(
            #16a34a 0deg ${degOk}deg, 
            #ef4444 ${degOk}deg ${degOk + degBad}deg, 
            #e2e8f0 ${degOk + degBad}deg 360deg
        );`;
    }

    // HTML Cabecera (Resumen)
    let htmlHeader = `
        <div style="display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:20px; margin-bottom:20px;">
            <div style="width:120px; height:120px; border-radius:50%; ${pieStyle} border:4px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.1);"></div>
            <div style="font-size: 14px; line-height: 2; color: #475569; min-width:130px;">
              <div>📦 Total: <b>${total}</b></div>
              <div>✅ Correctas: <b style="color:#16a34a">${ok}</b></div>
              <div>❌ Incorrectas: <b style="color:#ef4444">${bad}</b></div>
              <div>⚪ Pendientes: <b style="color:#64748b">${noResp}</b></div>
            </div>
        </div>
    `;

    // HTML Cuerpo (Botón expandible para subtemas)
    let htmlBody = `
        <div style="border-top:1px dashed #e2e8f0; padding-top:15px; margin-bottom:15px;">
            <button class="btn-small" onclick="toggleSubtopicStats()" style="width:100%; background:#f8fafc; color:#334155; display:flex; justify-content:space-between; align-items:center;">
                <span>📊 Ver detalle por subtemas</span>
                <span id="subtopic-arrow">▼</span>
            </button>
            
            <div id="subtopic-container" style="display:none; margin-top:15px; animation:fadeIn 0.3s ease;">
                <div style="display:flex; justify-content:flex-end; margin-bottom:10px;">
                    <select onchange="updateSubtopicSort(this.value)" style="font-size:12px; padding:4px; border-radius:6px; border:1px solid #cbd5e1;">
                        <option value="original">Orden Original</option>
                        <option value="error">Más Errores Primero</option>
                        <option value="acierto">Mejor % Primero</option>
                    </select>
                </div>
                <div id="subtopic-bars-list"></div>
            </div>
        </div>
        
        <div style="margin-top:20px; text-align:center; border-top:1px dashed #e2e8f0; padding-top:15px;">
             <button class="btn-small" onclick="resetSubjectStatsFromModal('${slug}')" 
                     style="background:white; border:1px solid #fca5a5; color:#ef4444; width:100%;">
                🗑 Reiniciar progreso de esta materia
             </button>
        </div>
    `;

    // Inyectar y Abrir Modal
    const modal = document.getElementById("statsModal");
    const title = document.getElementById("statsModalTitle");
    const body = document.getElementById("statsModalBody");
    
    if(modal && title && body) {
        title.textContent = `Estadísticas: ${getMateriaNombre(slug)}`;
        body.innerHTML = htmlHeader + htmlBody;
        modal.style.display = "flex";
        
        // Pre-renderizamos la lista (aunque esté oculta) para que esté lista
        renderSubtopicBars();
    }
}

/* --- NUEVAS FUNCIONES PARA EL DESGLOSE --- */

function toggleSubtopicStats() {
    const container = document.getElementById("subtopic-container");
    const arrow = document.getElementById("subtopic-arrow");
    if (container.style.display === "none") {
        container.style.display = "block";
        arrow.textContent = "▲";
    } else {
        container.style.display = "none";
        arrow.textContent = "▼";
    }
}

function updateSubtopicSort(val) {
    currentSubtopicSort = val;
    renderSubtopicBars();
}
function renderSubtopicBars() {
    const slug = currentModalSlug;
    if (!slug) return;

    const subtemasOficiales = BANK.subsubjects[slug] || ["General"];
    const progMat = PROG[slug] || {};

    let data = subtemasOficiales.map(subName => {
        const subSlug = normalize(subName);
        
        const questions = BANK.questions.filter(q => {
            // Evaluamos la compatibilidad con multitema
            if (!q.materia.includes(slug)) return false;
            const normQSubs = q.submateria.map(s => normalize(s));
            return normQSubs.includes(subSlug);
        });

        let ok = 0, bad = 0;
        questions.forEach(q => {
            const p = progMat[q.id];
            if(p) {
                if(p.status === 'ok') ok++;
                if(p.status === 'bad') bad++;
            }
        });

        const total = questions.length;
        const respondidas = ok + bad;
        const pctOk = respondidas > 0 ? Math.round((ok/respondidas)*100) : 0;
        const pctBad = respondidas > 0 ? Math.round((bad/respondidas)*100) : 0;

        return { name: subName, total, ok, bad, respondidas, pctOk, pctBad };
    });

    data = data.filter(d => d.total > 0);

    if (currentSubtopicSort === "error") {
        data.sort((a, b) => b.pctBad - a.pctBad || b.bad - a.bad);
    } else if (currentSubtopicSort === "acierto") {
        data.sort((a, b) => b.pctOk - a.pctOk);
    } 

    const listEl = document.getElementById("subtopic-bars-list");
    if (!listEl) return;

    if (data.length === 0) {
        listEl.innerHTML = `<div style="text-align:center; color:#94a3b8; padding:10px;">No hay datos detallados.</div>`;
        return;
    }

    listEl.innerHTML = data.map(d => {
        const wOk = (d.total > 0) ? (d.ok / d.total) * 100 : 0;
        const wBad = (d.total > 0) ? (d.bad / d.total) * 100 : 0;
        
        return `
            <div style="margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px; color:#334155;">
                    <span style="font-weight:600;">${d.name}</span>
                    <span style="font-size:12px; color:#64748b;">${d.respondidas}/${d.total}</span>
                </div>
                <div style="height:8px; width:100%; background:#f1f5f9; border-radius:4px; overflow:hidden; display:flex;">
                    <div style="width:${wOk}%; background:#16a34a;" title="${d.ok} correctas"></div>
                    <div style="width:${wBad}%; background:#ef4444;" title="${d.bad} incorrectas"></div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:10px; color:#94a3b8; margin-top:2px;">
                    <span>${d.pctOk}% Acierto</span>
                    ${d.bad > 0 ? `<span style="color:#ef4444;">${d.bad} Errores</span>` : ''}
                </div>
            </div>
        `;
    }).join("");
}
/* ==========================================================
   🔗 VINCULACIÓN CON NOTAS (Validación Previa)
   ========================================================== */
function verNotasMateria(slug) {
    const savedNotes = JSON.parse(localStorage.getItem("mebank_notes") || "{}");
    const noteIds = Object.keys(savedNotes);
    
    const tieneNotas = BANK.questions.some(q => {
        if (!noteIds.includes(q.id)) return false;
        const esMateria = Array.isArray(q.materia) ? q.materia.includes(slug) : q.materia === slug;
        return esMateria;
    });

    if (!tieneNotas) {
        const nombreMateria = getMateriaNombre(slug);
        return alert(`Todavía no tenés notas de ${nombreMateria}.`);
    }

    if (typeof renderNotasMain !== 'function') return alert("Error: Módulo de Notas no cargado.");

    renderNotasMain();

    setTimeout(() => {
        if (typeof openGroups !== 'undefined') {
            openGroups[slug] = true; 
            if (typeof updateNotasList === 'function') updateNotasList(); 
        } else if (typeof toggleGroup === 'function') {
            toggleGroup(slug);
        }

        const content = document.getElementById(`content-${slug}`);
        if (content) {
            const header = content.previousElementSibling;
            if(header) header.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, 100);
}

/* ==========================================================
   🛠 HELPERS ADICIONALES
   ========================================================== */
function getPrettySubtopicName(materiaSlug, subSlug) {
    const originales = BANK.subsubjects[materiaSlug] || [];
    const match = originales.find(s => normalize(s) === subSlug);
    return match || subSlug;
}

function resetSubjectStatsFromModal(slug) {
    if (!confirm("⚠️ ¿Estás seguro? Se borrará todo el progreso de esta materia.")) return;

    if (PROG[slug]) {
        delete PROG[slug];
        if (typeof saveProgress === 'function') saveProgress();
    }

    document.getElementById('statsModal').style.display = 'none';
    renderChoiceList();
}
