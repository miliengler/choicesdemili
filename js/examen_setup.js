/* ==========================================================
   🎯 MEbank 3.0 – Crear tu examen (modo minimalista)
   ========================================================== */

function renderCrearExamen() {
  const app = document.getElementById("app");
  const subjects = BANK.subjects;

  app.innerHTML = `
    <div class="card fade" style="max-width:900px;margin:auto;">

      <h2 style="margin-bottom:6px;">🎯 Crear tu examen</h2>
      <p style="color:#64748b;margin-bottom:25px;">
        Elegí las materias y la cantidad de preguntas para armar un examen personalizado.
      </p>

      <!-- Lista de materias -->
      <div style="margin-top:10px;">
        ${subjects.map(renderRowCrearExamen).join("")}
      </div>

      <!-- Timer -->
      <div style="margin-top:20px;">
        <label style="font-size:14px;">
          <input type="checkbox" id="crearExamenTimer" style="margin-right:6px;">
          Usar timer
        </label>
      </div>

      <!-- Botón principal -->
      <div style="margin-top:25px;text-align:center;">
        <button class="btn-main" onclick="crearExamenFinal()">
          ▶ Crear examen
        </button>
      </div>

      <div style="margin-top:20px;text-align:center;">
        <button class="btn-small" onclick="renderHome()">⬅ Volver</button>
      </div>

    </div>
  `;
}

/* ==========================================================
   📌 Fila de una materia
   ========================================================== */

function renderRowCrearExamen(m) {
  const total = BANK.questions.filter(q => q.materia === m.slug).length;

  return `
    <div class="materia-block" 
         style="border:1px solid #e2e8f0;border-radius:10px;
                padding:12px;margin-bottom:10px;">

      <div style="display:flex;justify-content:space-between;align-items:center;">
        
        <div>
          <b>${m.name}</b>
          <div style="font-size:12px;color:#64748b;">
            ${total} preguntas disponibles
          </div>
        </div>

        <input type="number"
               min="0"
               max="${total}"
               placeholder="0"
               class="crear-input-num"
               id="ce-${m.slug}"
               style="width:70px;padding:6px 8px;border-radius:8px;
                      border:1px solid #cbd5e1;text-align:center;">
      </div>

    </div>
  `;
}

/* ==========================================================
   🧠 Crear examen final
   ========================================================== */

function crearExamenFinal() {
  let finalList = [];

  BANK.subjects.forEach(m => {
    const input = document.getElementById(`ce-${m.slug}`);
    if (!input) return;

    const cant = Number(input.value);
    if (!cant || cant <= 0) return;

    const pool = BANK.questions.filter(q => q.materia === m.slug);

    // seleccionar cantidad aleatoria
    const elegidas = shuffle(pool).slice(0, cant);
    finalList.push(...elegidas);
  });

  if (!finalList.length) {
    alert("Elegí al menos una materia y una cantidad de preguntas.");
    return;
  }

  const usarTimer = document.getElementById("crearExamenTimer").checked;

  iniciarResolucion({
    modo: "custom",
    preguntas: shuffle(finalList),
    usarTimer,
    titulo: "Examen Personalizado"
  });
}

/* ==========================================================
   🔀 Shuffle simple
   ========================================================== */

function shuffle(arr) {
  return arr
    .map(a => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map(a => a.value);
}
