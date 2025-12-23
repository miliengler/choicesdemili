/* ==========================================================
   📚 MEbank 3.0 – Práctica por materia (Versión Híbrida)
   ========================================================== */

let CHOICE_ORDER = localStorage.getItem("MEbank_ChoiceOrder_v1") || "az";
let choiceOpenSlug = null;

/* ==========================================================
   🎯 Render principal
   ========================================================== */
function renderChoiceMode() {
  const app = document.getElementById("app");
  const subjects = getOrderedSubjects();

  app.innerHTML = `
    <div class="card fade" style="max-width:900px;margin:auto;">

      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;">
        <div>
          <h2 style="margin-bottom:6px;">Práctica por materia</h2>
          <p style="color:#64748b;margin:0;">
            Elegí una materia y opcionalmente uno o más subtemas.
          </p>
        </div>

        <div style="text-align:right;">
          <label style="font-size:13px;color:#64748b;display:block;margin-bottom:4px;">
            Ordenar materias
          </label>

          <select id="choiceOrderSelect"
                  style="padding:6px 10px;border-radius:8px;border:1px solid #cbd5e1;
                         font-size:14px;min-width:160px;text-align:center;"
                  onchange="onChangeChoiceOrder(this.value)">
            <option value="az" ${CHOICE_ORDER === "az" ? "selected" : ""}>A → Z</option>
            <option value="progreso" ${CHOICE_ORDER === "progreso" ? "selected" : ""}>Por progreso</option>
          </select>
        </div>
      </div>

      <div style="margin-top:20px;">
        ${subjects.map(renderMateriaRow).join("")}
      </div>

      <div style="margin-top:24px;text-align:center;">
        <button class="btn-small" onclick="renderHome()">⬅ Volver al inicio</button>
      </div>

    </div>
  `;
}

/* ==========================================================
   🧮 Ordenamiento
   ========================================================== */
function getOrderedSubjects() {
  // Aseguramos que BANK.subjects exista
  const list = (typeof BANK !== 'undefined' && BANK.subjects) ? [...BANK.subjects] : [];

  if (CHOICE_ORDER === "progreso") {
    return list.sort((a, b) => {
      const pa = getMateriaStats(a.slug).percent || 0;
      const pb = getMateriaStats(b.slug).percent || 0;
      return pb - pa;
    });
  }

  // Orden A-Z (Ignorando emojis)
  return list.sort((a, b) => {
    const cleanA = a.name.replace(/[^\p{L}\p{N} ]/gu, "").trim();
    const cleanB = b.name.replace(/[^\p{L}\p{N} ]/gu, "").trim();
    return cleanA.localeCompare(cleanB, "es", { sensitivity: "base" });
  });
}

function onChangeChoiceOrder(value) {
  CHOICE_ORDER = value;
  localStorage.setItem("MEbank_ChoiceOrder_v1", value);
  renderChoiceMode();
}

/* ==========================================================
   🧠 Stats por materia (Soporte Multi-Materia)
   ========================================================== */
function getMateriaStats(slug) {
  // Contamos preguntas que pertenezcan a esta materia (String o Array)
  const total = (BANK.questions || []).filter(q => {
      if (Array.isArray(q.materia)) return q.materia.includes(slug);
      return q.materia === slug;
  }).length;

  const progMat = (typeof PROG !== 'undefined' && PROG[slug]) ? PROG[slug] : {};
  let correctas = 0;

  Object.values(progMat).forEach(reg => {
    if (reg && reg.status === "ok") correctas++;
  });

  const percent = total ? Math.round(correctas / total * 100) : 0;
  return { total, correctas, percent };
}

/* ==========================================================
   🎨 Render Fila Materia
   ========================================================== */
function renderMateriaRow(m) {
  const stats = getMateriaStats(m.slug);
  const estaAbierta = choiceOpenSlug === m.slug;

  return `
    <div class="materia-block" 
         style="border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin-bottom:12px;">

      <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;"
           onclick="toggleMateriaChoice('${m.slug}')">

        <div>
          <b>${m.name}</b>
          <div style="font-size:12px;color:#64748b;">
            ${stats.total} preguntas disponibles
          </div>
        </div>

        <div style="width:42px;height:42px;">
          ${renderProgressCircle(stats.percent)}
        </div>
      </div>

      ${estaAbierta ? renderMateriaExpanded(m) : ""}
    </div>
  `;
}

function toggleMateriaChoice(slug) {
  choiceOpenSlug = choiceOpenSlug === slug ? null : slug;
  renderChoiceMode();
}

/* ==========================================================
   📚 Subtemas (Filtrado Híbrido)
   ========================================================== */
function renderMateriaExpanded(m) {
  const slug = m.slug;
  const subtemasTexto = (typeof BANK !== 'undefined' && BANK.subsubjects[slug]) ? BANK.subsubjects[slug] : [];

  const items = subtemasTexto.map(nombreSub => {
    // Normalizamos slug del subtema si es necesario, aunque acá usamos el texto directo
    const count = contarPreguntasMateriaSub(slug, nombreSub); 
    
    // Normalizamos el valor para el checkbox
    // Usamos el nombre real como value para que coincida con el JSON
    return `
      <label style="display:flex;justify-content:space-between;align-items:center;
                    padding:6px 0;font-size:14px;border-bottom:1px dashed #e2e8f0;">
        <span>
          <input type="checkbox" 
                 name="subtema-${slug}" 
                 value="${nombreSub}" 
                 style="margin-right:6px;">
          ${nombreSub}
        </span>
        <span style="color:#64748b;font-size:12px;">(${count})</span>
      </label>
    `;
  }).join("");

  return `
    <div style="margin-top:10px;padding-top:8px;border-top:1px solid #e2e8f0;">
      <p style="font-size:13px;color:#64748b;margin-bottom:6px;">
        Seleccioná subtemas (o dejá vacío para todos).
      </p>

      <div style="max-height:220px;overflow:auto;margin-bottom:10px;padding-right:4px;">
        ${items}
      </div>

      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:8px;">
        <button class="btn-main" onclick="iniciarPracticaMateria('${slug}')">
          ▶ Iniciar práctica
        </button>
      </div>
    </div>
  `;
}

// ⚠️ LÓGICA CORE: Contar preguntas híbridas
function contarPreguntasMateriaSub(mSlug, subNombre) {
  return (BANK.questions || []).filter(q => {
    // 1. Chequeo de Materia
    const matOk = Array.isArray(q.materia) 
        ? q.materia.includes(mSlug) 
        : q.materia === mSlug;
    
    if (!matOk) return false;

    // 2. Chequeo de Submateria (puede ser string o array)
    if (!q.submateria) return false;
    
    if (Array.isArray(q.submateria)) {
        return q.submateria.includes(subNombre);
    }
    return q.submateria === subNombre;
  }).length;
}

/* ==========================================================
   🚀 Iniciar práctica
   ========================================================== */
function iniciarPracticaMateria(mSlug) {
  const checks = document.querySelectorAll(`input[name="subtema-${mSlug}"]:checked`);
  const subtemasSeleccionados = Array.from(checks).map(ch => ch.value);

  // Filtramos las preguntas
  const preguntas = (BANK.questions || []).filter(q => {
    // 1. Materia
    const matOk = Array.isArray(q.materia) 
        ? q.materia.includes(mSlug) 
        : q.materia === mSlug;
    
    if (!matOk) return false;

    // 2. Submateria (Si no eligió nada, pasan todas)
    if (subtemasSeleccionados.length === 0) return true;

    // Si eligió subtemas, la pregunta debe tener AL MENOS UNO de ellos
    if (Array.isArray(q.submateria)) {
        return q.submateria.some(s => subtemasSeleccionados.includes(s));
    }
    return subtemasSeleccionados.includes(q.submateria);
  });

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
  if (typeof BANK !== 'undefined' && BANK.subjects) {
      const mat = BANK.subjects.find(s => s.slug === slug);
      return mat ? mat.name : slug;
  }
  return slug;
}

/* ==========================================================
   🔵 CÍRCULO DE PROGRESO (SVG)
   ========================================================== */
function renderProgressCircle(percent) {
  const size = 42;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${cx}" cy="${cy}" r="${radius}" stroke="#e2e8f0" stroke-width="${stroke}" fill="none"></circle>
      <circle cx="${cx}" cy="${cy}" r="${radius}" stroke="${percent === 0 ? '#cbd5e1' : '#16a34a'}" 
              stroke-width="${stroke}" fill="none" stroke-dasharray="${circumference}" 
              stroke-dashoffset="${offset}" stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})" 
              style="transition: stroke-dashoffset 0.6s ease;"></circle>
      <text x="50%" y="55%" text-anchor="middle" font-size="12" fill="#334155" font-weight="600">${percent}%</text>
    </svg>
  `;
}
