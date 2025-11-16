/* ==========================================================
   📔 MEbank – Notas (v2.1 SAFE)
   ========================================================== */

/*
  Estructura de PROG:

  PROG[materia][id] = {
     status: "ok" / "bad",
     nota: "texto",
     fecha: timestamp
  }
*/


/* ----------------------------------------------------------
   🔥 Render principal de notas
---------------------------------------------------------- */
function renderNotasMain() {
  const app = document.getElementById("app");

  const notas = recolectarNotas();

  app.innerHTML = `
    <div class="card fade" style="max-width:800px;margin:auto;">
      <h2 style="text-align:center;">📔 Mis notas</h2>

      <input id="notesSearch" 
             placeholder="Buscar en notas..." 
             style="width:100%;padding:10px;border:1px solid #e2e8f0;
             border-radius:8px;font-size:15px;margin-bottom:14px;">

      <div id="notesList">
        ${renderListaNotas(notas)}
      </div>

      <div style="text-align:center;margin-top:20px;">
        <button class="btn-small" onclick="renderHome()">⬅ Volver</button>
      </div>
    </div>
  `;

  document.getElementById("notesSearch").oninput = (e) => {
    filtrarNotas(e.target.value);
  };

  activarAutoGuardadoNotas();
}

/* ==========================================================
   🧠 Recolectar todas las notas guardadas
========================================================== */
function recolectarNotas() {
  let result = [];

  BANK.subjects.forEach(mat => {
    const slug = mat.slug;
    const prog = PROG[slug] || {};

    Object.keys(prog).forEach(id => {
      if (id.startsWith("_")) return;

      const data = prog[id];
      if (!data.nota || !data.nota.trim()) return;

      const preg = BANK.questions.find(q => q.id === id);
      if (!preg) return;

      result.push({
        materia: mat,
        pregunta: preg,
        nota: data.nota.trim()
      });
    });
  });

  return result;
}

/* ==========================================================
   🎨 Render de la lista de notas
========================================================== */
function renderListaNotas(notas) {
  if (!notas.length) {
    return `<p style="text-align:center;color:#64748b;">No tenés notas guardadas.</p>`;
  }

  return notas
    .map(n => `
      <div class="note-item fade"
           style="border:1px solid #e2e8f0;padding:12px 14px;border-radius:10px;
                  margin-bottom:12px;">

        <div style="display:flex;justify-content:space-between;">
          <b>${n.materia.name}</b>
          <button class="btn-small" onclick="openPreguntaDesdeNotas('${n.pregunta.id}')">
            Ir a pregunta
          </button>
        </div>

        <p style="margin:6px 0;color:#0f172a;">
          ${n.pregunta.enunciado}
        </p>

        <textarea class="note-edit" 
                  data-id="${n.pregunta.id}" 
                  data-mat="${n.materia.slug}"
                  style="width:100%;border:1px solid #cbd5e1;border-radius:8px;
                         padding:8px;font-size:14px;min-height:60px;">${n.nota}</textarea>

      </div>
    `)
    .join("");
}

/* ==========================================================
   🔍 Búsqueda en tiempo real
========================================================== */
function filtrarNotas(query) {
  query = query.toLowerCase();

  const notas = recolectarNotas().filter(n =>
    n.nota.toLowerCase().includes(query) ||
    n.pregunta.enunciado.toLowerCase().includes(query) ||
    n.materia.slug.includes(query)
  );

  document.getElementById("notesList").innerHTML = renderListaNotas(notas);

  activarAutoGuardadoNotas();
}

/* ==========================================================
   ✏ Auto-guardado con PROG seguro
========================================================== */
function activarAutoGuardadoNotas() {
  document.querySelectorAll(".note-edit").forEach(textarea => {
    textarea.oninput = (e) => {
      const id = e.target.dataset.id;
      const mat = e.target.dataset.mat;
      const texto = e.target.value;

      if (!PROG[mat]) PROG[mat] = {};
      if (!PROG[mat][id]) PROG[mat][id] = { status: null };

      PROG[mat][id].nota = texto;
      PROG[mat][id].fecha = Date.now();

      saveProgress();   // 🔥 FIX: YA NO SAVE BANK
    };
  });
}

/* ==========================================================
   🎯 Ir a pregunta desde notas
========================================================== */
function openPreguntaDesdeNotas(id) {
  const preg = BANK.questions.find(q => q.id === id);
  if (!preg) return alert("Pregunta no encontrada.");

  iniciarResolucion({
    modo: "nota",
    preguntas: [preg],
    usarTimer: false,
    permitirRetroceso: false,
    mostrarNotas: true,
    titulo: `📔 Nota – ${preg.materia.toUpperCase()}`
  });
}

/* ==========================================================
   Inicialización
========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => activarAutoGuardadoNotas(), 500);
});
