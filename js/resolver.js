/* ==========================================================
   🎯 MEbank – Motor universal de resolución (v2)
   ========================================================== */

let CURRENT = {
  list: [],
  i: 0,
  modo: "",
  session: {},
  config: {}
};

/* ==========================================================
   🚀 Iniciar una resolución
   ========================================================== */
function iniciarResolucion(config) {
  if (!config || !config.preguntas || !config.preguntas.length) {
    alert("⚠ No hay preguntas para resolver.");
    return;
  }

  CURRENT = {
    modo: config.modo || "general",
    list: config.preguntas,
    i: 0,
    session: {},
    config
  };

  // Cronómetro
  if (config.usarTimer) initTimer();

  // Sidebar
  initSidebar();

  renderPregunta();
}

/* ==========================================================
   🧩 Renderizar una pregunta
   ========================================================== */
function renderPregunta() {
  const q = CURRENT.list[CURRENT.i];
  if (!q) return renderFin();

  const app = document.getElementById("app");

  const opcionesHTML = q.opciones.map((op, idx) => `
    <label class="option" onclick="answer(${idx})">
      <input type="radio" name="opt">
      ${String.fromCharCode(97 + idx)}) ${op}
    </label>
  `).join("");

  app.innerHTML = `
    <div class="q-layout fade">
      <div class="q-card">
        <div class="q-top">
          <b>${CURRENT.config.titulo || "Resolución"}</b>
          <span class="small">
            ${CURRENT.i + 1}/${CURRENT.list.length} · 
            ${q.materia?.toUpperCase() || ""}
          </span>
        </div>

        <div class="enunciado">${q.enunciado}</div>
        <div class="options">${opcionesHTML}</div>

        <div class="nav-row">
          <button class="btn-small" onclick="prev()" 
            ${CURRENT.i === 0 ? "disabled" : ""}>⬅ Anterior</button>

          <button class="btn-small" onclick="next()" 
            ${CURRENT.i === CURRENT.list.length - 1 ? "disabled" : ""}>
            Siguiente ➡
          </button>

          <button class="btn-small" onclick="salir()">🏠 Salir</button>
        </div>
      </div>
    </div>
  `;

  renderSidebarPage();
}

/* ==========================================================
   🧠 Registrar respuesta
   ========================================================== */
function answer(idx) {
  const q = CURRENT.list[CURRENT.i];
  const correcta = idx === q.correcta;

  CURRENT.session[q.id] = correcta ? "ok" : "bad";

  const opts = document.querySelectorAll(".option");

  opts.forEach((opt, i) => {
    if (i === q.correcta) opt.classList.add("correct");
    else if (i === idx) opt.classList.add("wrong");
    opt.style.pointerEvents = "none";
  });

  setTimeout(() => next(), 600);
}

/* ==========================================================
   ⏭ Navegación
   ========================================================== */
function next() {
  if (CURRENT.i < CURRENT.list.length - 1) {
    CURRENT.i++;
    renderPregunta();
  } else renderFin();
}

function prev() {
  if (CURRENT.i > 0) {
    CURRENT.i--;
    renderPregunta();
  }
}

function salir() {
  stopTimer();
  if (confirm("¿Salir de la resolución?")) renderHome();
}

/* ==========================================================
   🏁 Fin
   ========================================================== */
function renderFin() {
  stopTimer();

  const total = CURRENT.list.length;
  const correctas = Object.values(CURRENT.session).filter(v => v === "ok").length;
  const incorrectas = Object.values(CURRENT.session).filter(v => v === "bad").length;

  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="card fade" style="text-align:center;">
      <h2>${CURRENT.config.titulo || "Finalizado"}</h2>
      <p>Total: <b>${total}</b></p>
      <p style="color:#16a34a;">✔ Correctas: ${correctas}</p>
      <p style="color:#ef4444;">✖ Incorrectas: ${incorrectas}</p>
      <p><b>Precisión:</b> ${Math.round(correctas / total * 100)}%</p>

      <div style="margin-top:20px;">
        <button class="btn-main" onclick="renderHome()">🏠 Volver</button>
      </div>
    </div>
  `;
}

/* ==========================================================
   🕒 Timer (versión simple)
   ========================================================== */
let TIMER = {
  interval: null,
  start: 0,
  elapsed: 0,
  running: false
};

function initTimer() {
  TIMER.start = Date.now();
  TIMER.running = true;

  const timerEl = document.createElement("div");
  timerEl.id = "exam-timer";
  timerEl.className = "exam-timer";
  timerEl.textContent = "⏱ 00:00";
  document.body.append(timerEl);

  TIMER.interval = setInterval(() => {
    TIMER.elapsed = Date.now() - TIMER.start;
    document.getElementById("exam-timer").textContent =
      "⏱ " + formatTimer(TIMER.elapsed);
  }, 1000);
}

function stopTimer() {
  clearInterval(TIMER.interval);
  TIMER.running = false;

  const el = document.getElementById("exam-timer");
  if (el) el.remove();
}

function formatTimer(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(m).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;
}

/* ==========================================================
   📋 Sidebar
   ========================================================== */
let sidebarPage = 0;
const PAGE_SIZE = 50;

function initSidebar() {
  if (document.getElementById("exam-sidebar")) return;

  const sb = document.createElement("div");
  sb.id = "exam-sidebar";
  sb.className = "exam-sidebar";

  sb.innerHTML = `
    <div class="sb-header">
      <b>Índice</b>
      <button onclick="hideSidebar()">✖</button>
    </div>

    <div id="sb-progress" class="sb-progress"></div>
    <div id="sb-grid" class="sb-grid"></div>

    <div class="sb-pages">
      <button onclick="prevSidebarPage()">⬅</button>
      <span id="sb-pageinfo"></span>
      <button onclick="nextSidebarPage()">➡</button>
    </div>
  `;

  document.body.append(sb);

  const btn = document.createElement("button");
  btn.id = "sb-openbtn";
  btn.textContent = "📋";
  btn.onclick = showSidebar;
  document.body.append(btn);
}

function showSidebar() {
  document.getElementById("exam-sidebar").style.right = "0";
  document.getElementById("sb-openbtn").style.display = "none";
}

function hideSidebar() {
  document.getElementById("exam-sidebar").style.right = "-240px";
  document.getElementById("sb-openbtn").style.display = "block";
}

function renderSidebarPage() {
  const total = CURRENT.list.length;
  const start = sidebarPage * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);

  const grid = document.getElementById("sb-grid");
  if (!grid) return;

  grid.innerHTML = "";

  for (let i = start; i < end; i++) {
    const cell = document.createElement("div");
    cell.className = "sb-cell";
    cell.textContent = i + 1;

    const res = CURRENT.session[CURRENT.list[i].id];

    if (i === CURRENT.i) cell.classList.add("active");
    else if (res === "ok") cell.classList.add("ok");
    else if (res === "bad") cell.classList.add("bad");

    cell.onclick = () => {
      CURRENT.i = i;
      renderPregunta();
    };

    grid.append(cell);
  }

  // progreso
  const respondidas = Object.keys(CURRENT.session).length;
  const p = Math.round(respondidas / total * 100);
  document.getElementById("sb-progress").textContent =
    `Progreso: ${respondidas}/${total} (${p}%)`;

  // paginación
  const pages = Math.ceil(total / PAGE_SIZE);
  document.getElementById("sb-pageinfo").textContent =
    `${sidebarPage + 1}/${pages}`;
}

function nextSidebarPage() {
  const totalPages = Math.ceil(CURRENT.list.length / PAGE_SIZE);
  if (sidebarPage < totalPages - 1) {
    sidebarPage++;
    renderSidebarPage();
  }
}

function prevSidebarPage() {
  if (sidebarPage > 0) {
    sidebarPage--;
    renderSidebarPage();
  }
}
