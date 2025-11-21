/* ==========================================================
   📚 MEbank 3.0 – Práctica por materia
   ========================================================== */

let CHOICE_ORDER = localStorage.getItem("MEbank_ChoiceOrder_v1") || "az";
let choiceOpenSlug = null; // materia actualmente expandida

/* ==========================================================
   🎯 Render principal
   ========================================================== */
function renderChoice() {
  const app = document.getElementById("app");
  const subjects = getOrderedSubjects();

  app.innerHTML = `
    <div class="card fade" style="max-width:900px;margin:auto;">

      <!-- HEADER -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;">

        <div>
          <h2 style="margin-bottom:6px;">Práctica por materia</h2>
          <p style="color:#64748b;margin:0;">
            Elegí una materia y opcionalmente uno o más subtemas para comenzar tu práctica.
          </p>
        </div>

        <!-- Ordenar materias -->
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

      <!-- LISTA DE MATERIAS -->
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
   🧮 Ordenar materias
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

  return list.sort((a, b) =>
    a.name.localeCompare(b.name, "es", { sensitivity: "base" })
  );
}

function onChangeChoiceOrder(value) {
  CHOICE_ORDER = value;
  localStorage.setItem("MEbank_ChoiceOrder_v1", value);
  renderChoice();
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
   🎨 Render de cada materia (sin triángulo)
   ========================================================== */

function renderMateriaRow(m) {
  const stats = getMateriaStats(m.slug);
  const estaAbierta = choiceOpenSlug === m.slug;

  return `
    <div class="materia-block" 
         style="border:1px solid #e2e8f0;border-radius:10px;
                padding:14px;margin-bottom:12px;">

      <!-- CABECERA CLICKABLE -->
      <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;"
           onclick="toggleMateriaChoice('${m.slug}')">

        <div style="text-align:left;">
          <b>${m.name}</b>
          <div style="font-size:12px;color:#64748b;">
            ${stats.total} preguntas disponibles
          </div>
        </div>

        <!-- 🔵 Solo el círculo de progreso -->
        <div class="progress-circle">
          ${stats.percent}%
        </div>
      </div>

      ${estaAbierta ? renderMateriaExpanded(m) : ""}
    </div>
  `;
}

function toggleMateriaChoice(slug) {
  if (choiceOpenSlug === slug) choiceOpenSlug = null;
  else choiceOpenSlug = slug;
  renderChoice();
}

/* ==========================================================
   📚 Subtemas expandibles
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
        <span style="color:#64748b;font-size:12px;">
          (${count})
        </span>
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
