/* ==========================================================
   🧠 MODO EXAMEN – CREÁ EL TUYO
   Unificado con MEbank y layout moderno
   ========================================================== */

/* ---------- Normalizador local ---------- */
const normalize = str =>
  str ? str.normalize("NFD").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase().trim() : "";

/* ---------- Render del configurador ---------- */
function renderExamenSetup() {
  const subs = (MEbank.subjects || []).sort((a, b) =>
    a.name.replace(/[^\p{L}\p{N} ]/gu, "").localeCompare(
      b.name.replace(/[^\p{L}\p{N} ]/gu, ""), "es", { sensitivity: "base" }
    )
  );

  const resumen = (MEbank.questions || []).reduce((acc, q) => {
    const key = normalize(q.materia);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const counts = subs.map(s => {
    const key = normalize(s.slug);
    const total = resumen[key] || 0;
    return { ...s, total };
  });

  const totalAll = counts.reduce((a, b) => a + b.total, 0);

  const checks = counts.map(s => `
    <label class="chk-mat" style="display:block;margin:4px 0;">
      <input type="checkbox" class="mat-check" value="${s.slug}" data-count="${s.total}" ${s.total ? "checked" : ""}>
      ${s.name} <span style="color:var(--muted)">(${s.total})</span>
    </label>`).join("");

  app.innerHTML = `
    <div class="card" style="max-width:700px;margin:auto;">
      <h2>🧠 Modo Examen – Creá el tuyo</h2>
      <p>Tenés <b>${totalAll}</b> preguntas disponibles en total.</p>

      <div id="matList">${checks || "<p class='small'>No hay materias cargadas.</p>"}</div>

      <div style="margin-top:14px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:8px;">
          <label for="numPreg" class="small">Número de preguntas:</label>
          <input id="numPreg" type="number" min="1" value="${totalAll}" max="${totalAll}" style="width:80px;">
        </div>

        <div style="display:flex;align-items:center;gap:6px;">
          <input type="checkbox" id="chkTimer">
          <label for="chkTimer" style="font-size:14px;">⏱️ Activar cronómetro</label>
        </div>
      </div>

      <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
        <button class="btn-main" onclick="startExamen()">Comenzar examen</button>
        <button class="btn-small" onclick="renderHome()">Volver al inicio</button>
      </div>
    </div>
  `;

  document.querySelectorAll(".mat-check").forEach(chk => {
    chk.addEventListener("change", updateExamenCount);
  });
}

/* ---------- Actualiza contador ---------- */
function updateExamenCount() {
  const chks = Array.from(document.querySelectorAll(".mat-check"));
  const total = chks.filter(c => c.checked)
                    .reduce((a, c) => a + parseInt(c.dataset.count || 0), 0);
  const numInput = document.getElementById("numPreg");
  if (numInput && !numInput._manual) {
    numInput.value = Math.max(1, total || 1);
    numInput.max = Math.max(1, total || 1);
  }
}
document.addEventListener("input", e => {
  if (e.target && e.target.id === "numPreg") e.target._manual = true;
});

/* ---------- Inicia examen ---------- */
function startExamen() {
  const chks = Array.from(document.querySelectorAll(".mat-check"));
  const selected = chks.filter(c => c.checked).map(c => c.value);
  const numEl = document.getElementById("numPreg");
  const num = Math.max(1, parseInt(numEl?.value || "1", 10));
  const useTimer = document.getElementById("chkTimer")?.checked;

  const selectedNorm = selected.map(s => normalize(s));
  let pool = (MEbank.questions || []).filter(q => selectedNorm.includes(normalize(q.materia)));

  if (pool.length === 0) {
    alert("Seleccioná al menos una materia con preguntas.");
    return;
  }

  pool.sort(() => Math.random() - 0.5);
  const chosen = pool.slice(0, Math.min(num, pool.length));

  CURRENT = { list: chosen, i: 0, materia: "general", modo: "examen", session: {} };

  renderExamenPregunta();

  if (useTimer) initTimer("app");
  else TIMER.elapsed = 0;
}

/* ---------- Render de pregunta ---------- */
function renderExamenPregunta() {
  const q = CURRENT.list[CURRENT.i];
  if (!q) {
    renderExamenFin();
    return;
  }

  // 🕒 Cronómetro flotante eliminado (ahora usamos solo el minimalista de timer.js)
  // TODO: en fase visual, mover el cronómetro inferior a posición fija bajo el contenedor principal

  const opts = q.opciones.map((t, i) => `
    <label class="option" onclick="answerExamen(${i})">
      <input type="radio" name="opt"> ${String.fromCharCode(97 + i)}) ${t}
    </label>`).join("");

  app.innerHTML = `
    <div class="q-layout">
      <div class="q-card fade">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <b>Pregunta ${CURRENT.i + 1}/${CURRENT.list.length}</b>
          <span class="small">${q.materia?.toUpperCase() || ""}</span>
        </div>
        <div class="enunciado">${q.enunciado}</div>
        <div class="options">${opts}</div>
        <div class="nav-row">
          <button class="btn-small" onclick="prevExamen()" ${CURRENT.i === 0 ? "disabled" : ""}>Anterior</button>
          <button class="btn-small" onclick="nextExamen()" ${CURRENT.i === CURRENT.list.length - 1 ? "disabled" : ""}>Siguiente</button>
          <button class="btn-small btn-grey" onclick="stopTimer(); if(confirm('¿Salir del examen?')) renderHome()">Salir</button>
        </div>
      </div>
    </div>
  `;

  if (!document.getElementById("exam-sidebar")) {
    initSidebar();
  } else {
    renderSidebarPage();
  }
}

/* ---------- Respuesta ---------- */
function answerExamen(i) {
  const q = CURRENT.list[CURRENT.i];
  const slug = "general";
  PROG[slug] = PROG[slug] || {};

  if (PROG[slug][q.id]) return;

  const correcta = i === q.correcta;
  PROG[slug][q.id] = { chosen: i, status: correcta ? "ok" : "bad" };
  PROG[slug]._lastDate = Date.now();

  saveAll();

  const options = document.querySelectorAll(".option");
  options.forEach((opt, idx) => {
    if (idx === q.correcta) opt.classList.add("correct");
    else if (idx === i) opt.classList.add("wrong");
    opt.style.pointerEvents = "none";
  });

  // ⏸️ Autoavance desactivado: ahora el usuario debe avanzar manualmente
  // TODO: si se activa modo “examen cronometrado oficial”, podría volver a activarse
}

/* ---------- Navegación ---------- */
function nextExamen() {
  if (CURRENT.i < CURRENT.list.length - 1) {
    CURRENT.i++;
    renderExamenPregunta();
  } else renderExamenFin();
}

function prevExamen() {
  if (CURRENT.i > 0) {
    CURRENT.i--;
    renderExamenPregunta();
  }
}

/* ---------- Fin del examen ---------- */
function renderExamenFin() {
  stopTimer();

  const prog = PROG.general || {};
  const answered = CURRENT.list.filter(q => prog[q.id]);
  const ok = answered.filter(q => prog[q.id]?.status === "ok").length;
  const bad = answered.filter(q => prog[q.id]?.status === "bad").length;
  const porc = answered.length ? Math.round((ok / answered.length) * 100) : 0;
  const tiempo = TIMER.elapsed ? formatTime(TIMER.elapsed) : null;

  app.innerHTML = `
    <div class="card fade" style="text-align:center;">
      <h2>Examen finalizado</h2>
      <p>Respondiste ${answered.length} de ${CURRENT.list.length} preguntas.</p>
      <p style="color:#16a34a;">✔ Correctas: ${ok}</p>
      <p style="color:#ef4444;">✖ Incorrectas: ${bad}</p>
      <p><b>Precisión:</b> ${porc}%</p>
      ${tiempo ? `<p><b>Tiempo total:</b> ${tiempo}</p>` : ""}
      <div style="margin-top:16px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        <button class="btn-main" onclick="renderExamenSetup()">Nuevo examen</button>
        <button class="btn-small btn-grey" onclick="renderHome()">Volver al inicio</button>
      </div>
    </div>
  `;
}
window.renderExamenSetup = renderExamenSetup;
