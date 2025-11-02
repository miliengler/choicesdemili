/* ---------- Inicia el examen (versión segura) ---------- */
function startExamen() {
  try {
    const chks = Array.from(document.querySelectorAll(".mat-check"));
    const selected = chks.filter(c => c.checked).map(c => c.value);
    const numEl = document.getElementById("numPreg");
    const num = Math.max(1, parseInt(numEl?.value || "1", 10));
    const useTimer = document.getElementById("chkTimer")?.checked;

    // Normalizar coincidencias
    const selectedNorm = selected.map(s => normalize(s));
    let pool = (BANK.questions || []).filter(q =>
      selectedNorm.includes(normalize(q.materia))
    );

    if (pool.length === 0) {
      alert("Seleccioná al menos una materia con preguntas.");
      return;
    }

    pool.sort(() => Math.random() - 0.5);
    const chosen = pool.slice(0, Math.min(num, pool.length));

    window.CURRENT = {
      list: chosen,
      i: 0,
      materia: "general",
      modo: "examen",
      session: {}
    };

    console.log("✅ Examen iniciado con", chosen.length, "preguntas");

    // Render inicial
    if (typeof renderExamenPregunta === "function") {
      renderExamenPregunta();
    } else {
      console.error("❌ No se encuentra renderExamenPregunta");
      alert("Error: renderExamenPregunta no encontrada");
      return;
    }

    // Barra lateral si existe
    if (typeof initSidebar === "function") {
      initSidebar();
    } else {
      console.warn("⚠️ initSidebar no encontrada");
    }

    // Cronómetro opcional
    if (useTimer && typeof initTimer === "function") {
      initTimer("app");
    } else {
      console.log("⏱️ Cronómetro desactivado o initTimer no cargado");
      window.TIMER = window.TIMER || { elapsed: 0 };
    }
  } catch (err) {
    console.error("❌ Error en startExamen:", err);
    alert("Error al iniciar el examen. Revisá la consola.");
  }
}
