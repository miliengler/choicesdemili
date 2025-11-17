/* ==========================================================
   🎯 MEbank 3.0 – Motor de resolución de preguntas
   ========================================================== */

let CURRENT = {
  preguntas: [],
  i: 0,
  modo: "",
  titulo: "",
  usarTimer: false,
  materiaActual: "",
};

/* ==========================================================
   🚀 Iniciar resolución
   config = {
      preguntas: [...],
      modo: "practica" | "repaso" | "examen" | ...,
      usarTimer: true/false,
      titulo: "string",
   }
   ========================================================== */

function iniciarResolucion(config) {

  CURRENT = {
    preguntas: config.preguntas,
    i: 0,
    modo: config.modo || "general",
    titulo: config.titulo || "Resolviendo",
    usarTimer: config.usarTimer || false,
    materiaActual: null,
  };

  // Extraer materia (si aplica)
  if (CURRENT.preguntas.length > 0) {
    CURRENT.materiaActual = CURRENT.preguntas[0].materia;
  }

  // Timer
  stopTimer();               // Limpia si había uno previo
  if (CURRENT.usarTimer) {
    initTimer();
  }

  // Sidebar
  initSidebar(CURRENT.preguntas);

  // Render
  renderPregunta();
}

/* ==========================================================
   🧩 Renderizar PREGUNTA
   ========================================================== */

function renderPregunta() {
  const app = document.getElementById("app");
  const q = CURRENT.preguntas[CURRENT.i];
  if (!q) return renderFin();

  // Materia (gris, arriba a la derecha)
  const materiaTxt = getMateriaName(q.materia);

  const opcionesHTML = q.opciones
    .map((op, idx) => `
      <label class="option" onclick="answer(${idx})">
        <input type="radio" name="opt">
        ${String.fromCharCode(97 + idx)}) ${op}
      </label>
    `)
    .join("");

  app.innerHTML = `
    <div class="q-layout fade">

      <div class="q-card">

        <div class="q-top">
          <b>${CURRENT.titulo}</b>
          <span class="q-materia">${materiaTxt}</span>
        </div>

        <div class="q-num">
          Pregunta ${CURRENT.i + 1} de ${CURRENT.preguntas.length}
        </div>

        <div class="enunciado">${q.enunciado}</div>

        <!-- Soporte imágenes -->
        <div class="q-imgs">
          ${q.imagenes && q.imagenes.length
            ? q.imagenes.map(img => `<img src="${img}" class="q-img">`).join("")
            : ""}
        </div>

        <div class="options">
          ${opcionesHTML}
        </div>

        <!-- Explicación si existe (solo después de responder) -->
        <div id="explicacion-box" class="explicacion-box" style="display:none;">
          <b>Explicación:</b>
          <p id="explicacion-text"></p>
        </div>

        <div class="nav-row">
          <button class="btn-small" onclick="prevPregunta()"
            ${CURRENT.i === 0 ? "disabled" : ""}>⬅ Anterior</button>
          
          <button class="btn-small" onclick="nextPregunta()"
            ${CURRENT.i === CURRENT.preguntas.length - 1 ? "disabled" : ""}>
            Siguiente ➡
          </button>

          <button class="btn-small" onclick="salirResolucion()">🏠 Salir</button>
        </div>

      </div>
    </div>
  `;

  renderSidebarPage(CURRENT.i);
}

/* ==========================================================
   📝 Resolver respuesta
   ========================================================== */

function answer(idx) {
  const q = CURRENT.preguntas[CURRENT.i];
  const correcta = q.correcta;

  const opts = document.querySelectorAll(".option");

  opts.forEach((opt, i) => {
    if (i === correcta) opt.classList.add("correct");
    if (i === idx && idx !== correcta) opt.classList.add("wrong");
    opt.style.pointerEvents = "none";
  });

  // Guardar progreso
  const mat = q.materia;
  if (!PROG[mat]) PROG[mat] = {};
  PROG[mat][q.id] = {
    status: idx === correcta ? "ok" : "bad",
    fecha: Date.now(),
    nota: PROG[mat][q.id]?.nota || null,
  };
  saveProgress();

  // Mostrar explicación si existe
  if (q.explicacion) {
    const box = document.getElementById("explicacion-box");
    const txt = document.getElementById("explicacion-text");
    box.style.display = "block";
    txt.textContent = q.explicacion;
  }

  // NO pasamos automáticamente de pregunta.
}

/* ==========================================================
   ⏭ Navegación
   ========================================================== */

function nextPregunta() {
  if (CURRENT.i < CURRENT.preguntas.length - 1) {
    CURRENT.i++;
    renderPregunta();
  }
}

function prevPregunta() {
  if (CURRENT.i > 0) {
    CURRENT.i--;
    renderPregunta();
  }
}

/* ==========================================================
   🏠 Salir
   ========================================================== */

function salirResolucion() {
  stopTimer();

  if (confirm("¿Salir de la resolución?")) {
    renderHome();
  }
}

/* ==========================================================
   🏁 Final
   ========================================================== */

function renderFin() {
  stopTimer();

  const tot = CURRENT.preguntas.length;
  let ok = 0, bad = 0;

  CURRENT.preguntas.forEach(q => {
    const r = PROG[q.materia]?.[q.id];
    if (r?.status === "ok") ok++;
    if (r?.status === "bad") bad++;
  });

  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="card fade" style="text-align:center;">
      <h2>${CURRENT.titulo}</h2>
      <p>Total: <b>${tot}</b></p>
      <p style="color:#16a34a;">✔ Correctas: ${ok}</p>
      <p style="color:#ef4444;">✖ Incorrectas: ${bad}</p>
      <p><b>Precisión:</b> ${Math.round((ok / tot) * 100)}%</p>

      <div style="margin-top:20px;">
        <button class="btn-main" onclick="renderHome()">🏠 Volver</button>
      </div>
    </div>
  `;
}

/* ==========================================================
   🔻 Helpers
   ========================================================== */

function getMateriaName(slug) {
  const m = SUBJECTS.find(x => x.slug === slug);
  return m ? m.name : "";
}
