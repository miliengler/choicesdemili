/* ==========================================================
   📚 MEbank 3.0 – Práctica por materia
   ========================================================== */

/* ----------------------------------------------------------
   🔥 Entrada principal de la pantalla
   ---------------------------------------------------------- */
function renderChoiceMaterias() {
  const app = document.getElementById("app");

  // Orden por defecto: AZ
  const materiasOrdenadas = [...SUBJECTS].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  app.innerHTML = `
    <div class="card fade" style="max-width:800px;margin:auto;">

      <h2 style="margin-bottom:6px;">📚 Práctica por materia</h2>
      <p style="color:#64748b;margin-bottom:25px;">
        Elegí una materia para comenzar tu práctica
      </p>

      <!-- Selector de orden -->
      <div style="text-align:right;margin-bottom:12px;">
        <select id="ordenMaterias" class="input" style="padding:6px 10px;">
          <option value="az">Orden A–Z</option>
          <option value="prog">Orden por progreso</option>
        </select>
      </div>

      <div id="listaMaterias"></div>

      <div style="text-align:center;margin-top:25px;">
        <button class="btn-small" onclick="renderHome()">⬅ Volver</button>
      </div>

    </div>
  `;

  document.getElementById("ordenMaterias").onchange = renderListaMaterias;

  renderListaMaterias();
}

/* ----------------------------------------------------------
   📌 Render dinámico de la lista de materias (con expansión)
   ---------------------------------------------------------- */
function renderListaMaterias() {
  const cont = document.getElementById("listaMaterias");
  const orden = document.getElementById("ordenMaterias").value;

  let mats = [...SUBJECTS].filter(m => m.slug !== "otras");

  if (orden === "az") {
    mats.sort((a, b) => a.name.localeCompare(b.name));
  } else if (orden === "prog") {
    mats.sort((a, b) => progresoMateria(b.slug) - progresoMateria(a.slug));
  }

  cont.innerHTML = mats
    .map(m => renderMateriaItem(m))
    .join("");

  // Activar evento de expandir materia
  document.querySelectorAll(".materia-item").forEach(el => {
    el.onclick = () => {
      const id = el.dataset.slug;
      toggleMateriaExpand(id);
    };
  });
}

/* ----------------------------------------------------------
   📊 Calcular progreso por materia
   ---------------------------------------------------------- */
function progresoMateria(slug) {
  const matNorm = normalize(slug);

  const preguntas = BANK.questions.filter(q => q.materia === matNorm);
  if (!preguntas.length) return 0;

  let correctas = 0;
  preguntas.forEach(q => {
    const datos = PROG[matNorm]?.[q.id];
    if (datos && datos.status === "ok") correctas++;
  });

  return Math.round((correctas / preguntas.length) * 100);
}

/* ----------------------------------------------------------
   🔹 Render de una materia (sin expandir)
   ---------------------------------------------------------- */
function renderMateriaItem(mat) {
  const slug = mat.slug;
  const prog = progresoMateria(slug);

  return `
    <div class="materia-container">
      <div class="materia-item" data-slug="${slug}">
        
        <div>
          <b>${mat.name}</b>
        </div>

        <div class="progress-circle" style="background:
          conic-gradient(#16a34a ${prog * 3.6}deg, #e5e7eb ${prog * 3.6}deg 360deg)">
          <span>${prog}%</span>
        </div>

      </div>

      <div id="expand-${slug}" class="materia-expand" style="display:none;">
        ${renderMateriaExpand(slug)}
      </div>
    </div>
  `;
}

/* ----------------------------------------------------------
   🔽 Expandir / contraer materia
   ---------------------------------------------------------- */
function toggleMateriaExpand(slug) {
  const box = document.getElementById("expand-" + slug);
  const visible = box.style.display === "block";
  box.style.display = visible ? "none" : "block";
}

/* ----------------------------------------------------------
   📍 Contenido al expandir materia
   ---------------------------------------------------------- */
function renderMateriaExpand(slug) {
  const preguntas = getQuestionsByMateria(slug);
  const total = preguntas.length;

  const subtemas = BANK.subsubjects[slug] || [];

  return `
    <div class="subcard">

      <p style="color:#64748b;margin-bottom:10px;">
        ${total} preguntas cargadas
      </p>

      <!-- Subtemas -->
      <div class="subtema-list">
        ${subtemas
          .map(st => renderSubtemaCheck(slug, st))
          .join("")}
      </div>

      <!-- Empezar desde -->
      <div style="margin-top:18px;text-align:left;">
        <label style="font-size:14px;color:#475569;">Comenzar desde:</label>
        <input id="start-${slug}" type="number" min="1" max="${total}"
               class="input"
               style="width:120px;margin-left:10px;padding:5px;"
               placeholder="1">
      </div>

      <!-- Botones -->
      <div style="margin-top:18px;display:flex;flex-wrap:wrap;gap:10px;">

        <button class="btn-main" onclick="iniciarPracticaMateria('${slug}')">
          ▶ Practicar
        </button>

        <button class="btn-main" onclick="iniciarRepasoMateria('${slug}')">
          🔁 Repaso
        </button>

        <button class="btn-main" onclick="verNotasMateria('${slug}')">
          📝 Notas
        </button>

        <button class="btn-main" onclick="verStatsMateria('${slug}')">
          📊 Estadísticas
        </button>

        ${existeProgresoMateria(slug)
          ? `<button class="btn-main" onclick="reanudarMateria('${slug}')">⏳ Reanudar</button>`
          : ""}
      </div>

    </div>
  `;
}

/* ----------------------------------------------------------
   🔢 Render checkbox de cada subtema
   ---------------------------------------------------------- */
function renderSubtemaCheck(slug, label) {
  const norm = normalize(label);
  const preguntas = BANK.questions.filter(q =>
    q.materia === normalize(slug) && q.submateria === norm
  );

  return `
    <label class="subtema-item">
      <input type="checkbox" class="subtema-check" data-mat="${slug}" data-sub="${norm}">
      ${label} <span style="color:#64748b;">(${preguntas.length})</span>
    </label>
  `;
}

/* ----------------------------------------------------------
   🔍 Obtener lista de subtemas seleccionados
   ---------------------------------------------------------- */
function getSubtemasSeleccionados(slug) {
  return [...document.querySelectorAll(`.subtema-check[data-mat="${slug}"]:checked`)]
    .map(el => el.dataset.sub);
}

/* ----------------------------------------------------------
   🔁 Ver si hay progreso previo en una materia
   ---------------------------------------------------------- */
function existeProgresoMateria(slug) {
  const mat = normalize(slug);
  return PROG[mat] && Object.keys(PROG[mat]).length > 0;
}

/* ----------------------------------------------------------
   ▶ Iniciar práctica
   ---------------------------------------------------------- */
function iniciarPracticaMateria(slug) {
  const subtemas = getSubtemasSeleccionados(slug);
  let preguntas = getQuestionsByMateria(slug, subtemas);

  const start = Number(document.getElementById(`start-${slug}`).value) || 1;
  preguntas = preguntas.slice(start - 1);

  if (!preguntas.length) return alert("No hay preguntas para practicar.");

  iniciarResolucion({
    modo: "practica",
    preguntas,
    usarTimer: false,
    titulo: `Práctica – ${slug.toUpperCase()}`
  });
}

/* ----------------------------------------------------------
   🔁 Repaso (solo las incorrectas)
   ---------------------------------------------------------- */
function iniciarRepasoMateria(slug) {
  const mat = normalize(slug);

  const preguntas = BANK.questions.filter(q => {
    const prog = PROG[mat]?.[q.id];
    return q.materia === mat && prog && prog.status === "bad";
  });

  if (!preguntas.length) return alert("No tenés preguntas para repasar.");

  iniciarResolucion({
    modo: "repaso",
    preguntas,
    usarTimer: false,
    titulo: `Repaso – ${slug.toUpperCase()}`
  });
}

/* ----------------------------------------------------------
   📝 Notas por materia
   ---------------------------------------------------------- */
function verNotasMateria(slug) {
  renderNotasMain(slug);
}

/* ----------------------------------------------------------
   📊 Stats por materia
   ---------------------------------------------------------- */
function verStatsMateria(slug) {
  renderStatsMateria(slug);
}

/* ----------------------------------------------------------
   ⏳ Reanudar materia
   ---------------------------------------------------------- */
function reanudarMateria(slug) {
  const mat = normalize(slug);

  const preguntas = BANK.questions.filter(q => q.materia === mat);

  if (!preguntas.length) return alert("No hay preguntas en esta materia.");

  iniciarResolucion({
    modo: "reanudar",
    preguntas,
    usarTimer: false,
    titulo: `Reanudar – ${slug.toUpperCase()}`
  });
}
