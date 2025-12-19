/* ==========================================================
   📋 MEbank 3.0 – Sidebar de resolución (Paginado Fijo)
   ========================================================== */

// Configuración
const SIDEBAR_PAGE_SIZE = 50; // Cantidad de cuadraditos por página

let SIDEBAR = {
  preguntas: [],
  currentPage: 0,
  activeIndex: 0
};

/* ----------------------------------------------------------
   🔧 Inicializar sidebar
   ---------------------------------------------------------- */
function initSidebar(preguntas) {
  SIDEBAR.preguntas = preguntas || [];
  SIDEBAR.currentPage = 0;
  SIDEBAR.activeIndex = 0;

  // Si ya existe el div, lo borramos para crearlo limpio
  const existing = document.getElementById("exam-sidebar");
  if (existing) existing.remove();
  const existingBtn = document.getElementById("sb-openbtn");
  if (existingBtn) existingBtn.remove();

  // Crear contenedor
  const sb = document.createElement("div");
  sb.id = "exam-sidebar";
  sb.className = "exam-sidebar";
  
  // Estilos inline básicos para garantizar visibilidad
  sb.style.position = "fixed";
  sb.style.top = "70px";
  sb.style.right = "-280px"; // Oculto por defecto
  sb.style.width = "260px";
  sb.style.bottom = "20px";
  sb.style.backgroundColor = "#ffffff";
  sb.style.boxShadow = "-2px 0 10px rgba(0,0,0,0.1)";
  sb.style.zIndex = "9999";
  sb.style.transition = "right 0.3s ease";
  sb.style.display = "flex";
  sb.style.flexDirection = "column";
  sb.style.padding = "10px";
  sb.style.borderLeft = "1px solid #e2e8f0";

  // HTML Interno
  sb.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <span style="font-weight:bold;font-size:15px;">Índice</span>
      <button onclick="window.hideSidebar()" class="btn-small" style="padding:4px 8px;">✖</button>
    </div>

    <div id="sb-stats" style="font-size:12px;color:#64748b;margin-bottom:10px;text-align:center;">
      Cargando...
    </div>

    <div id="sb-grid" style="flex:1;overflow-y:auto;display:grid;grid-template-columns:repeat(5, 1fr);gap:6px;align-content:start;">
      </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding-top:10px;border-top:1px solid #e2e8f0;">
      <button onclick="window.sbPrev()" class="btn-small" style="font-size:16px;padding:2px 10px;">◀</button>
      <span id="sb-pagelabel" style="font-size:13px;font-weight:600;color:#334155;">Pág 1</span>
      <button onclick="window.sbNext()" class="btn-small" style="font-size:16px;padding:2px 10px;">▶</button>
    </div>
  `;

  document.body.appendChild(sb);

  // Botón flotante para abrir
  const btn = document.createElement("button");
  btn.id = "sb-openbtn";
  btn.innerHTML = "📋";
  btn.style.position = "fixed";
  btn.style.right = "20px";
  btn.style.bottom = "80px";
  btn.style.zIndex = "9998";
  btn.style.width = "50px";
  btn.style.height = "50px";
  btn.style.borderRadius = "25px";
  btn.style.border = "none";
  btn.style.background = "#2563eb";
  btn.style.color = "white";
  btn.style.fontSize = "24px";
  btn.style.boxShadow = "0 4px 12px rgba(37,99,235,0.4)";
  btn.style.cursor = "pointer";
  btn.onclick = window.showSidebar;

  document.body.appendChild(btn);

  // Render inicial
  renderGrid();
  
  // Abrir sidebar automáticamente si es desktop
  if (window.innerWidth > 1000) window.showSidebar();
}

/* ----------------------------------------------------------
   🎨 Renderizar la grilla (Lógica Central)
   ---------------------------------------------------------- */
function renderGrid() {
  const grid = document.getElementById("sb-grid");
  const label = document.getElementById("sb-pagelabel");
  const stats = document.getElementById("sb-stats");
  
  if (!grid || !label) return;

  grid.innerHTML = "";

  const total = SIDEBAR.preguntas.length;
  const totalPages = Math.ceil(total / SIDEBAR_PAGE_SIZE);
  
  // Validar límites de página
  if (SIDEBAR.currentPage < 0) SIDEBAR.currentPage = 0;
  if (SIDEBAR.currentPage >= totalPages) SIDEBAR.currentPage = totalPages - 1;
  if (total === 0) SIDEBAR.currentPage = 0;

  // Texto del paginador
  label.innerText = `Pág ${SIDEBAR.currentPage + 1} de ${totalPages || 1}`;

  // Calcular rango
  const start = SIDEBAR.currentPage * SIDEBAR_PAGE_SIZE;
  const end = Math.min(start + SIDEBAR_PAGE_SIZE, total);

  // Estadísticas rápidas
  const totalRespondidas = Object.values(PROG || {}).reduce((acc, m) => acc + Object.keys(m).length, 0); 
  // (Nota: el conteo totalRespondidas es global, para simplificar)
  stats.innerText = `Mostrando ${start + 1} - ${end} de ${total}`;

  // Generar cuadraditos
  for (let i = start; i < end; i++) {
    const q = SIDEBAR.preguntas[i];
    const el = document.createElement("div");
    
    // Estilos base
    el.style.textAlign = "center";
    el.style.padding = "6px 0";
    el.style.fontSize = "12px";
    el.style.borderRadius = "6px";
    el.style.cursor = "pointer";
    el.style.border = "1px solid #e2e8f0";
    el.style.backgroundColor = "#f8fafc";
    el.innerText = i + 1;

    // Estado: Respondida
    const mat = q.materia;
    const estado = PROG[mat]?.[q.id]?.status;

    if (estado === "ok") {
      el.style.backgroundColor = "#dcfce7"; // Verde
      el.style.color = "#166534";
      el.style.borderColor = "#86efac";
    } else if (estado === "bad") {
      el.style.backgroundColor = "#fee2e2"; // Rojo
      el.style.color = "#991b1b";
      el.style.borderColor = "#fca5a5";
    }

    // Estado: Activa (La pregunta que estás viendo)
    if (i === SIDEBAR.activeIndex) {
      el.style.backgroundColor = "#2563eb"; // Azul fuerte
      el.style.color = "#ffffff";
      el.style.borderColor = "#1e40af";
      el.style.fontWeight = "bold";
    }

    // Click: Ir a esa pregunta
    el.onclick = () => {
      if (typeof CURRENT !== "undefined") {
        CURRENT.i = i; // Actualizar índice global
        renderPregunta(); // Re-renderizar pantalla principal
      }
    };

    grid.appendChild(el);
  }
}

/* ----------------------------------------------------------
   🔄 Conexión con el Motor de Resolución
   ---------------------------------------------------------- */
// Esta función la llama resolver.js cada vez que cambias de pregunta
window.renderSidebarPage = function(indexActual) {
  SIDEBAR.activeIndex = indexActual;
  
  // Opcional: Si querés que el sidebar cambie de página solo al avanzar:
  // SIDEBAR.currentPage = Math.floor(indexActual / SIDEBAR_PAGE_SIZE);
  
  // PERO, para que los botones manuales funcionen libremente, 
  // solo actualizamos el grid sin forzar el cambio de página, 
  // salvo que la pregunta activa quede muy lejos.
  
  const pageOfActive = Math.floor(indexActual / SIDEBAR_PAGE_SIZE);
  // Solo forzamos el salto de página si es la primera carga
  if (!document.getElementById("exam-sidebar")) {
      SIDEBAR.currentPage = pageOfActive;
  }
  
  renderGrid();
};

/* ----------------------------------------------------------
   🎮 Controles (Globales)
   ---------------------------------------------------------- */
window.sbNext = function() {
  const total = SIDEBAR.preguntas.length;
  const totalPages = Math.ceil(total / SIDEBAR_PAGE_SIZE);
  
  if (SIDEBAR.currentPage < totalPages - 1) {
    SIDEBAR.currentPage++;
    renderGrid();
  }
};

window.sbPrev = function() {
  if (SIDEBAR.currentPage > 0) {
    SIDEBAR.currentPage--;
    renderGrid();
  }
};

window.showSidebar = function() {
  const sb = document.getElementById("exam-sidebar");
  const btn = document.getElementById("sb-openbtn");
  if (sb) sb.style.right = "0";
  if (btn) btn.style.display = "none";
};

window.hideSidebar = function() {
  const sb = document.getElementById("exam-sidebar");
  const btn = document.getElementById("sb-openbtn");
  if (sb) sb.style.right = "-280px";
  if (btn) btn.style.display = "block";
};
