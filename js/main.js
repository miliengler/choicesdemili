/* ==========================================================
   🧩 MAIN.JS – INICIALIZACIÓN Y UTILIDADES GLOBALES
   ========================================================== */

/* ---------- INICIO AUTOMÁTICO ---------- */
document.addEventListener("DOMContentLoaded", () => {
  window.app = document.getElementById("app");
  renderHome(); // la versión del ui.js
});

/* ==========================================================
   🔁 FUNCIONES GLOBALES / UTILITARIAS
   ========================================================== */

/**
 * 🔄 Recarga manual de bancos de preguntas
 * Se usa desde el botón del Home
 */
async function manualBankReload() {
  alert("⏳ Actualizando bancos...");
  try {
    await loadAllBanks(); // definida en bank.js
    alert("✅ Bancos actualizados correctamente");
  } catch (err) {
    console.error("Error al recargar bancos:", err);
    alert("❌ Error al actualizar los bancos. Revisá la consola.");
  }
}

/* ==========================================================
   🕒 (Opcional) Función de estadísticas globales futuras
   ========================================================== */
function renderStatsGlobal() {
  alert("📊 Próximamente: estadísticas globales");
}

/* ==========================================================
   🧭 Helpers globales (si necesitás alguno compartido)
   ========================================================== */

/** Normaliza strings para comparaciones sin tildes ni mayúsculas */
const normalize = str =>
  str ? str.normalize("NFD").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase().trim() : "";
