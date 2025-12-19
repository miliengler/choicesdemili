/* ==========================================================
   📚 MEbank 3.0 – Práctica por materia
   ========================================================== */

let CHOICE_ORDER = localStorage.getItem("MEbank_ChoiceOrder_v1") || "az";
let choiceOpenSlug = null;

/* ==========================================================
   🔵 CÍRCULO DE PROGRESO ANIMADO (SVG)
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
      <!-- Círculo base gris -->
      <circle
        cx="${cx}"
        cy="${cy}"
        r="${radius}"
        stroke="#e2e8f0"
        stroke-width="${stroke}"
        fill="none"
      ></circle>

      <!-- Progreso (arranca en 12 hs) -->
      <circle
        cx="${cx}"
        cy="${cy}"
        r="${radius}"
        stroke="${percent === 0 ? '#cbd5e1' : '#16a34a'}"
        stroke-width="${stroke}"
        fill="none"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${offset}"
        stroke-linecap="round"
        transform="rotate(-90 ${cx} ${cy})"
        style="transition: stroke-dashoffset 0.6s ease;"
      ></circle>

      <!-- Porcentaje en el centro -->
      <text
        x="50%"
        y="55%"
        text-anchor="middle"
        font-size="12"
        fill="#334155"
        font-weight="600"
      >
        ${percent}%
      </text>
    </svg>
  `;
}

/* ==========================================================
   🎯 Render principal
   ========================================================== */
function renderChoice() {
  const app = document.getElementById("app");
  const subjects = getOrderedSubjects();

  app.innerHTML = `
    <div class="card fade" style="max-width:900px;margin:auto;">

      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;">
        <div>
          <h2 style="margin-bottom:6px;">Práctica por materia</h2>
          <p style="color:#64748b;margin:0;">
            Elegí una materia y opcionalmente uno o más subtemas para comenzar tu práctica.
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
   🧮 Ordenar materias (Mejorado: Sin Emojis)
   ========================================================== */
function getOrderedSubjects() {
  const list = [...BANK.subjects];

  if (CHOICE_ORDER === "progreso") {
    return list.sort((a, b) => {
      const pa = getMateriaStats(a.slug).percent || 0;
      const pb = getMateriaStats(b.slug).percent || 0;
      return pb - pa;
    });
  }

  // Orden Alfabético A-Z (Ignorando emojis y símbolos)
  return list.sort((a, b) => {
    // Esta expresión regular borra todo lo que NO sea letra o número
    const cleanA = a.name.replace(/[^\p{L}\p{N}]/gu, "").trim();
    const cleanB = b.name.replace(/[^\p{L}\p{N}]/gu, "").trim();
    
    return cleanA.localeCompare(cleanB, "es", { sensitivity: "base" });
  });
}



/* ==========================================================
   🧠 Stats por materia
   ========================================================== */
function getMateriaStats(slug) {
  const total = BANK.questions.filter(q => q.materia === slug).length;

  const progMat = PROG[slug] || {};
  let correctas = 0;

  Object.values(progMat).forEach(reg => {
    if (reg && reg.status === "ok") correctas++;
  });

  const percent = total ? Math.round(correctas / total * 100) : 0;

  return { total, correctas, percent };
}

/* ==========================================================
   🎨 Render cada materia — CON CÍRCULO SVG
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
  renderChoice();
}

/* ==========================================================
   📚 Subtemas
   ========================================================== */
function renderMateriaExpanded(m) {
  const slug = m.slug;
  const subtemasTexto = BANK.subsubjects[slug] || [];

  const items = subtemasTexto.map(nombreSub => {
    const subSlug = normalize(nombreSub);
    const count = contarPreguntasMateriaSub(slug, subSlug);
    return `
      <label style="display:flex;justify-content:space-between;align-items:center;
                    padding:6px 0;font-size:14px;border-bottom:1px dashed #e2e8f0;">
        <span>
          <input type="checkbox" 
                 name="subtema-${slug}" 
                 value="${subSlug}" 
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
        Podés seleccionar uno o más subtemas. Si no elegís ninguno, se usan todos.
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

function contarPreguntasMateriaSub(mSlug, subSlug) {
  return BANK.questions.filter(q =>
    q.materia === mSlug && q.submateria === subSlug
  ).length;
}

/* ==========================================================
   🚀 Iniciar práctica
   ========================================================== */
function iniciarPracticaMateria(mSlug) {
  const checks = document.querySelectorAll(`input[name="subtema-${mSlug}"]:checked`);
  const seleccionados = Array.from(checks).map(ch => ch.value);

  const preguntas = getQuestionsByMateria(
    mSlug,
    seleccionados.length ? seleccionados : null
  );

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
