/* ==========================================================
   📚 MEbank 3.0 – Práctica por materia (versión PRO)
   ========================================================== */

/*
  Requisitos:
  - BANK.subjects, BANK.subsubjects, BANK.questions (desde bank.js)
  - PROG para progreso (desde bank.js)
  - iniciarResolucion(config) (desde resolver.js)
  - getQuestionsByMateria(materiaSlug, [subtemas]) (desde bank.js)
*/

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

      <div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:flex-start;">
        <div>
          <h2 style="margin-bottom:6px;">Práctica por materia</h2>
          <p style="color:#64748b;margin:0;">
            Elegí una materia y opcionalmente uno o más subtemas para comenzar tu práctica.
          </p>
        </div>

        <div style="text-align:right;min-width:200px;">
          <label style="font-size:13px;color:#64748b;display:block;margin-bottom:4px;">
            Ordenar materias
          </label>
          <select id="choiceOrderSelect"
                  style="padding:6px 10px;border-radius:8px;border:1px solid #cbd5e1;font-size:14px;"
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
   🧮 Ordenar materias
   ========================================================== */
function getOrderedSubjects() {
  const list = [...BANK.subjects];

  // Limpia emoji del principio del nombre (versión 100% Safari-compatible)
  function cleanName(name) {
    if (!name) return "";

    // 1) eliminar todos los caracteres emoji (unicode > 12000)
    const sinEmoji = name
      .split("")
      .filter(ch => ch.codePointAt(0) < 12000)
      .join("");

    // 2) sacar espacios sobrantes, normalizar, sacar tildes
    return sinEmoji
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  if (CHOICE_ORDER === "progreso") {
    return list.sort((a, b) => {
      const pa = getMateriaStats(a.slug).percent || 0;
      const pb = getMateriaStats(b.slug).percent || 0;
      return pb - pa;
    });
  }

  // Orden alfabético REAL sin emoji
  return list.sort((a, b) => {
    const A = cleanName(a.name);
    const B = cleanName(b.name);
    return A.localeCompare(B, "es", { sensitivity: "base" });
  });
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

  const percent = total ? Math.round((correctas / total) * 100) : 0;

  return { total, correctas, percent };
}

/* ==========================================================
   🎨 Render de cada materia (fila principal)
   ========================================================== */

function renderMateriaRow(m) {
  const stats = getMateriaStats(m.slug);
  const estaAbierta = choiceOpenSlug === m.slug;

  // “círculo” de progreso simple
  const circle = `
    <div style="
      width:32px;height:32px;border-radius:999px;
      border:3px solid ${stats.percent ? '#22c55e' : '#e2e8f0'};
      display:flex;align-items:center;justify-content:center;
      font-size:11px;color:#0f172a;">
      ${stats.percent || 0}%
    </div>
  `;

  return `
    <div class="materia-block" style="border:1px solid #e2e8f0;border-radius:12px;
                                      padding:10px 12px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;"
           onclick="toggleMateriaChoice('${m.slug}')">

        <div style="text-align:left;">
          <div style="font-size:15px;font-weight:600;">
            ${m.name}
          </div>
          <div style="font-size:12px;color:#64748b;margin-top:2px;">
            ${stats.total
              ? `✔ ${stats.correctas}/${stats.total} correctas`
              : `Sin preguntas respondidas aún`}
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:12px;">
          ${circle}
          <div style="font-size:18px;color:#64748b;">
            ${estaAbierta ? "▾" : "▸"}
          </div>
        </div>
      </div>

      ${estaAbierta ? renderMateriaExpanded(m, stats) : ""}
    </div>
  `;
}

function toggleMateriaChoice(slug) {
  if (choiceOpenSlug === slug) {
    choiceOpenSlug = null;
  } else {
    choiceOpenSlug = slug;
  }
  renderChoice();
}

/* ==========================================================
   📚 Zona expandida con subtemas
   ========================================================== */

function renderMateriaExpanded(m, stats) {
  const slug = m.slug;
  const subtemasTexto = BANK.subsubjects[slug] || [];

  const items = subtemasTexto.map(nombreSub => {
    const subSlug = normalize(nombreSub); // clave interna
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

  const totalTexto = stats.total
    ? `<b>${stats.total}</b> preguntas totales en esta materia.`
    : `Todavía no cargaste preguntas para esta materia.`;

  return `
    <div style="margin-top:10px;padding-top:10px;border-top:1px solid #e2e8f0;font-size:14px;">

      <p style="font-size:13px;color:#475569;margin-bottom:4px;">
        ${totalTexto}
      </p>

      <p style="font-size:13px;color:#64748b;margin-bottom:6px;">
        Podés seleccionar uno o más subtemas. Si no seleccionás ninguno, se usan todos.
      </p>

      <div style="max-height:230px;overflow:auto;margin-bottom:10px;padding-right:4px;">
        ${items || `<p style="color:#94a3b8;font-size:13px;">No hay subtemas configurados.</p>`}
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;margin-top:8px;">
        <button class="btn-main" onclick="iniciarPracticaMateria('${slug}')">
          ▶ Iniciar práctica
        </button>
        <button class="btn-small" onclick="reanudarMateria('${slug}')">
          🔄 Reanudar
        </button>
        <button class="btn-small" onclick="repasoMateria('${slug}')">
          ⭐ Repaso
        </button>
        <button class="btn-small" onclick="verNotasMateria('${slug}')">
          📔 Notas
        </button>
        <button class="btn-small" onclick="verStatsMateria('${slug}')">
          📊 Estadísticas
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
  // Obtener subtemas tildados
  const checks = document.querySelectorAll(`input[name="subtema-${mSlug}"]:checked`);
  const seleccionados = Array.from(checks).map(ch => ch.value);

  const preguntas = getQuestionsByMateria(
    mSlug,
    seleccionados.length ? seleccionados : null
  );

  if (!preguntas.length) {
    alert("No hay preguntas disponibles para esa combinación de materia / subtemas.");
    return;
  }

  iniciarResolucion({
    modo: "materia",
    preguntas,
    usarTimer: false,
    titulo: `Práctica – ${getMateriaNombre(mSlug)}`
  });
}

/* ==========================================================
   🔧 Helpers y stubs (para no romper nada)
   ========================================================== */

function getMateriaNombre(slug) {
  const mat = BANK.subjects.find(s => s.slug === slug);
  return mat ? mat.name : slug;
}

// Por ahora estos son “stubs” para que no explote nada.
// Después los conectamos con stats/notas/repaso reales.

function reanudarMateria(slug) {
  alert("La función 'Reanudar' para " + getMateriaNombre(slug) + " todavía no está implementada. La agregamos cuando definamos bien las sesiones 🙂");
}

function repasoMateria(slug) {
  alert("El modo 'Repaso' (solo incorrectas) para " + getMateriaNombre(slug) + " lo conectamos después de terminar la lógica de PROG.");
}

function verNotasMateria(slug) {
  // Si ya tenés renderNotasMain(), podríamos filtrar por materia más adelante
  alert("La vista de notas filtradas por materia se suma luego. Por ahora usá 'Mis notas' desde el menú principal.");
}

function verStatsMateria(slug) {
  alert("Las estadísticas por materia todavía no están conectadas. Cuando terminemos la pantalla Stats, las linkeamos desde acá.");
}
