/* ==========================================================
   📄 EXÁMENES ANTERIORES – Lista y resolución con motor universal
   ========================================================== */

function renderExamenesLista() {
  const cont = document.getElementById("app");
  cont.innerHTML = `
    <div class="choice-container fade">
      <div class="choice-header-global">
        <span>📄</span>
        <h2>Exámenes anteriores</h2>
      </div>
      <p class="choice-subtitle">Seleccioná un examen para practicar con el formato oficial.</p>
      <div id="examenes-list"></div>
      <div style="text-align:center;margin-top:20px;">
        <button class="btn-small" onclick="renderHome()">⬅️ Volver</button>
      </div>
    </div>
  `;

  const lista = document.getElementById("examenes-list");

  // 🔹 Si agregás más años, solo añadilos acá:
  const examenes = [
    { nombre: "Examen Único 2025", archivo: "bancos/anteriores/examenunico2025.json" },
    { nombre: "Examen Único 2024", archivo: "bancos/anteriores/examenunico2024.json" },
    { nombre: "Examen Único 2023", archivo: "bancos/anteriores/examenunico2023.json" },
    { nombre: "Examen Único 2022", archivo: "bancos/anteriores/examenunico2022.json" },
    { nombre: "Examen Único 2021", archivo: "bancos/anteriores/examenunico2021.json" },
    { nombre: "Examen Único 2020", archivo: "bancos/anteriores/examenunico2020.json" },
    { nombre: "Examen Único 2019", archivo: "bancos/anteriores/examenunico2019.json" }
  ];

  examenes.forEach(ex => {
    const div = document.createElement("div");
    div.className = "choice-item";
    div.innerHTML = `
      <div class="choice-top">
        <span class="choice-title">${ex.nombre}</span>
      </div>
      <div class="choice-buttons" style="margin-top:6px;">
        <button class="btn-practica" onclick="cargarExamenAnterior('${ex.nombre}','${ex.archivo}')">Practicar</button>
      </div>
    `;
    lista.appendChild(div);
  });
}

/* ==========================================================
   ▶️ Cargar examen y lanzar el motor de resolución
   ========================================================== */
async function cargarExamenAnterior(nombre, rutaArchivo) {
  try {
    const res = await fetch(rutaArchivo);
    const preguntas = await res.json();

    if (!preguntas?.length) {
      alert("⚠️ No se encontraron preguntas en este examen.");
      return;
    }

    iniciarResolucion({
      modo: "anteriores",
      preguntas: preguntas,
      usarTimer: true,
      mostrarNotas: true,
      permitirRetroceso: true,
      titulo: nombre
    });
  } catch (err) {
    console.error("Error al cargar el examen:", err);
    alert("❌ No se pudo cargar el examen. Verificá la ruta: " + rutaArchivo);
  }
}

/* ---------- Exponer ---------- */
window.renderExamenesLista = renderExamenesLista;
