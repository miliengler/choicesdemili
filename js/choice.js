/* ==========================================================
   📚 MEbank 3.0 – Práctica por materia (Con Buscador Pro)
   ========================================================== */

let CHOICE_ORDER = localStorage.getItem("MEbank_ChoiceOrder_v1") || "az";
let choiceOpenSlug = null; // Para abrir/cerrar manualmente
let choiceSearchTerm = ""; // Término de búsqueda actual

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
  
  // 1. Filtramos y Ordenamos según búsqueda
  const subjects = getFilteredSubjects();

  app.innerHTML = `
    <div class="card fade" style="max-width:900px;margin:auto;">
      
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
        <h2 style="margin:0;">📚 Práctica por materia</h2>
        <button class="btn-small" onclick="renderHome()" style="background:#f1f5f9; border:1px solid #cbd5e1;">
           ⬅ Volver al inicio
        </button>
      </div>

      <div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;">
        <input type="text" 
               placeholder="🔍 Buscar materia o tema (ej: vacunas)..." 
               value="${choiceSearchTerm}"
               oninput="onSearchChoice(this.value)"
               style="flex:1; padding:10px; border-radius:8px; border:1px solid #cbd5e1; font-size:15px;">
        
        <select id="choiceOrderSelect" 
                style="padding:10px; border-radius:8px; border:1px solid #cbd5e1; font-size:14px; background:white;" 
                onchange="onChangeChoiceOrder(this.value)">
            <option value="az" ${CHOICE_ORDER === "az" ? "selected" : ""}>A → Z</option>
            <option value="progreso" ${CHOICE_ORDER === "progreso" ? "selected" : ""}>Por progreso</option>
        </select>
      </div>

      <div style="margin-top:10px;">
        ${subjects.length > 0 
           ? subjects.map(m => renderMateriaRow(m)).join("") 
           : `<div style="text-align:center; color:#64748b; padding:20px;">No se encontraron materias ni temas.</div>`
        }
      </div>

    </div>
  `;
  
  // Auto-focus al buscador si hay texto (para no perder foco al escribir)
  if (choiceSearchTerm) {
      const input = document.querySelector("input[type='text']");
      if(input) {
          input.focus();
          // Truco para poner el cursor al final
          const val = input.value; input.value = ''; input.value = val; 
      }
  }
}

/* --- LÓGICA DE BÚSQUEDA --- */
function onSearchChoice(val) {
    choiceSearchTerm = val; // Guardamos lo que escribe
    renderChoice();         // Re-renderizamos instantáneamente
}

function getFilteredSubjects() {
  let list = [...BANK.subjects];
  const term = normalize(choiceSearchTerm);

  // FILTRO
  if (term) {
    list = list.filter(subj => {
        // 1. Coincide Nombre Materia?
        const matchName = normalize(subj.name).includes(term);
        
        // 2. Coincide algún Subtema?
        const subtemas = BANK.subsubjects[subj.slug] || [];
        const matchSub = subtemas.some(s => normalize(s).includes(term));

        return matchName || matchSub;
    });
  }

  // ORDEN
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
  
  // LÓGICA DE APERTURA AUTOMÁTICA (Opción B)
  // Si hay búsqueda y esta materia pasó el filtro, revisamos si es por subtema
  let forceOpen = false;
  if (term) {
      // Si el término está en un subtema, forzamos abrir
      const subtemas = BANK.subsubjects[m.slug] || [];
      if (subtemas.some(s => normalize(s).includes(term))) {
          forceOpen = true;
      }
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

      ${estaAbierta ? renderMateriaExpanded(m, term) : ""}
    </div>
  `;
}

function toggleMateriaChoice(slug) {
  // Si el usuario toca manualmente, alternamos. 
  // (Si hay búsqueda, esto permite cerrar una forzada si quiere)
  choiceOpenSlug = choiceOpenSlug === slug ? null : slug;
  renderChoice();
}

/* --- SUBTEMAS --- */
function renderMateriaExpanded(m, term) {
  const slug = m.slug;
  let subtemasTexto = BANK.subsubjects[slug] || [];

  // FILTRADO INTERNO DE SUBTEMAS
  // Si hay búsqueda, solo mostramos los subtemas que coinciden
  // (A menos que la coincidencia haya sido por el nombre de la materia, ahí mostramos todo)
  if (term) {
      const matchName = normalize(m.name).includes(term);
      if (!matchName) {
          // Si la materia NO coincide por nombre, filtramos sus hijos
          subtemasTexto = subtemasTexto.filter(s => normalize(s).includes(term));
      }
  }

  const items = subtemasTexto.map(nombreSub => {
    const subSlug = normalize(nombreSub);
    const count = contarPreguntasMateriaSub(slug, subSlug);
    
    // Resaltar texto si coincide
    let displayName = nombreSub;
    if (term && normalize(nombreSub).includes(term)) {
        displayName = `<b>${nombreSub}</b>`;
    }

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

  return `
    <div style="margin-top:10px; padding-top:8px; border-top:1px solid #e2e8f0;">
      <p style="font-size:13px; color:#64748b; margin-bottom:6px;">
         ${term ? 'Resultados de la búsqueda:' : 'Podés seleccionar uno o más subtemas.'}
      </p>
      
      <div style="max-height:300px; overflow:auto; margin-bottom:10px; padding-right:4px;">
         ${items.length ? items : '<div style="font-size:13px; color:#94a3b8;">Sin subtemas coincidentes.</div>'}
      </div>

      <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:8px;">
        <button class="btn-main" onclick="iniciarPracticaMateria('${slug}')">▶ Iniciar práctica</button>
      </div>
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
  let correctas = 0;
  Object.values(progMat).forEach(reg => {
    if (reg && reg.status === "ok") correctas++;
  });

  const percent = total ? Math.round(correctas / total * 100) : 0;
  return { total, correctas, percent };
}

function contarPreguntasMateriaSub(mSlug, subSlug) {
  return BANK.questions.filter(q => {
    const esMateria = Array.isArray(q.materia) ? q.materia.includes(mSlug) : q.materia === mSlug;
    return esMateria && q.submateria === subSlug;
  }).length;
}

function iniciarPracticaMateria(mSlug) {
  const checks = document.querySelectorAll(`input[name="subtema-${mSlug}"]:checked`);
  const seleccionados = Array.from(checks).map(ch => ch.value);

  // Si no seleccionó nada, pero filtró por subtemas, quizás podríamos seleccionar todo lo visible.
  // Pero por seguridad, mantenemos la lógica: si no selecciona nada, son TODOS los de la materia (o filtrados).
  // Para MEbank 3.0: Si no hay selección, mandamos null (que significa "Toda la materia").
  
  const preguntas = getQuestionsByMateria(mSlug, seleccionados.length ? seleccionados : null);

  if (!preguntas.length) {
    alert("No hay preguntas disponibles para esa combinación.");
    return;
  }

  iniciarResolucion({
    modo: "materia",
    preguntas,
    usarTimer: false,
    titulo: `Práctica – ${getMateriaNombre(mSlug)}`
  });
}

function getMateriaNombre(slug) {
  const mat = BANK.subjects.find(s => s.slug === slug);
  return mat ? mat.name : slug;
}
