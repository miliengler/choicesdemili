/* ==========================================================
   🎯 MEbank 3.0 – Modo Examen (minimalista + cantidades)
   ========================================================== */

function renderCrearExamen() {

  const app = document.getElementById("app");

  // Materias con total disponible
  const materias = BANK.subjects.map(s => {
    const total = BANK.questions.filter(q => q.materia === s.slug).length;
    return { ...s, total };
  }).filter(m => m.total > 0);

  // Orden alfabético limpio (sin emojis)
  materias.sort((a, b) =>
    a.name.replace(/[^\p{L}\p{N} ]/gu, "")
      .localeCompare(b.name.replace(/[^\p{L}\p{N} ]/gu, ""), "es", { sensitivity: "base" })
  );

  const totalAll = materias.reduce((a, b) => a + b.total, 0);

  const lista = materias.map(m => `
    <label style="display:flex;justify-content:space-between;
                  align-items:center;padding:6px 0;border-bottom:1px solid #e5e7eb;">
      <span>
        <input type="checkbox" class="mk-mat" value="${m.slug}"
               data-count="${m.total}" checked style="margin-right:6px;">
        ${m.name}
      </span>
      <span style="color:#64748b;font-size:13px;">(${m.total})</span>
    </label>
  `).join("");

  app.innerHTML = `
    <div class="card fade" style="max-width:800px;margin:auto;">

      <h2 style="margin-bottom:6px;">🎯 Crear tu examen</h2>
      <p style="color:#64748b;margin-bottom:20px;">
        Seleccioná materias, elegí la cantidad de preguntas y comenzá tu examen.
      </p>

      <div style="margin-bottom:18px;">
        ${lista}
      </div>

      <!-- Configuración -->
      <div style="display:flex;justify-content:space-between;align-items:center;
                  flex-wrap:wrap;gap:16px;margin-top:14px;">

        <div>
          <label for="mk-total" style="font-size:14px;color:#64748b;">Número de preguntas</label><br>
          <input id="mk-total" type="number" min="1" value="${totalAll}" max="${totalAll}"
                 style="width:90px;padding:6px;border-radius:6px;border:1px solid #cbd5e1;">
        </div>

        <div style="display:flex;align-items:center;gap:8px;">
          <input type="checkbox" id="mk-timer">
          <label for="mk-timer" style="font-size:14px;">⏱ Activar cronómetro</label>
        </div>

      </div>

      <!-- Botones -->
      <div style="margin-top:24px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        <button class="btn-main" onclick="startExamenPersonalizado()">▶ Comenzar examen</button>
        <button class="btn-small" onclick="renderHome()">⬅ Volver</button>
      </div>
    </div>
  `;

  // Actualizar número al cambiar checks
  document.querySelectorAll(".mk-mat").forEach(chk => {
    chk.addEventListener("change", updateMaxPreguntas);
  });
}

/* ==========================================================
   🔢 Actualizar máximo de preguntas según selección
   ========================================================== */

function updateMaxPreguntas() {
  const checks = Array.from(document.querySelectorAll(".mk-mat"))
    .filter(c => c.checked);

  const total = checks.reduce((acc, c) => acc + Number(c.dataset.count || 0), 0);

  const input = document.getElementById("mk-total");
  if (!input) return;

  input.max = Math.max(1, total);
  if (Number(input.value) > total) input.value = total;
}

/* ==========================================================
   🚀 Iniciar examen personalizado (Con Insignias Activadas)
   ========================================================== */

function startExamenPersonalizado() {
  const checks = Array.from(document.querySelectorAll(".mk-mat"))
    .filter(c => c.checked)
    .map(c => c.value);

  if (!checks.length) {
    alert("Seleccioná al menos una materia.");
    return;
  }

  const totalInput = document.getElementById("mk-total");
  const total = parseInt(totalInput.value) || 10;
  const usarTimer = document.getElementById("mk-timer").checked;

  // 1. CONSTRUIR POOL (Soporte Arrays)
  let pool = BANK.questions.filter(q => {
      const mat = q.materia;
      if (Array.isArray(mat)) {
          return mat.some(m => checks.includes(m));
      }
      return checks.includes(mat);
  });

  if (!pool.length) {
    alert("No hay preguntas disponibles con esa selección.");
    return;
  }

  // 2. ALEATORIZAR Y CORTAR
  pool = pool.sort(() => Math.random() - 0.5).slice(0, total);

  // 3. INICIAR
  iniciarResolucion({
    modo: "personalizado", // 👈 CAMBIO CLAVE: Esto activa las insignias en Resolver.js
    preguntas: pool,
    usarTimer,
    permitirRetroceso: true,
    mostrarNotas: true,
    titulo: "🎯 Examen Personalizado"
  });
}

