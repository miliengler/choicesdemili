/* ==========================================================
   📋 MEbank 3.0 – Sidebar de resolución (Fixed)
   ========================================================== */

// Estado Global
window.SB_STATE = {
  preguntas: [],
  page: 0,
  activeIndex: 0,
  pageSize: 50
};

/* ----------------------------------------------------------
   🔧 Inicializar sidebar
   ---------------------------------------------------------- */
function initSidebar(preguntas) {
  // Resetear estado
  window.SB_STATE.preguntas = preguntas || [];
  window.SB_STATE.page = 0;
  window.SB_STATE.activeIndex = 0;

  // Limpiar DOM previo
  const oldSb = document.getElementById("exam-sidebar");
  if (oldSb) oldSb.remove();
  const oldBtn = document.getElementById("sb-toggle-btn");
  if (oldBtn) oldBtn.remove();

  // 1. Crear el Sidebar
  const sb = document.createElement("div");
  sb.id = "exam-sidebar";
  
  // Estilos inline críticos
  Object.assign(sb.style, {
    position: "fixed",
    top: "70px",
    right: "-280px", // Oculto
    width: "260px",
    bottom: "20px",
    backgroundColor: "#fff",
    boxShadow: "-4px 0 15px rgba(0,0,0,0.1)",
    zIndex: "9999",
    transition: "right 0.3s ease",
    display: "flex",
    flexDirection: "column",
    padding: "12px",
    borderLeft: "1px solid #e2e8f0",
    borderRadius: "12px 0 0 12px"
  });

  // HTML Estático (Sin onlicks en los botones de página)
  sb.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <span style="font-weight:700;color:#1e293b;">Índice</span>
      <button id="sb-close" class="btn-small" style="padding:2px 8px;">✖</button>
    </div>

    <div id="sb-info" style="font-size:12px;color:#64748b;margin-bottom:8px;text-align:center;">
      Cargando...
    </div>

    <div id="sb-grid" style="flex:1;overflow-y:auto;display:grid;grid-template-columns:repeat(5, 1fr);gap:5px;align-content:start;padding-right:4px;">
      </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:10px;border-top:1px solid #e2e8f0;">
      <button id="sb-prev" class="btn-small" style="font-size:18px;line-height:1;padding:4px 12px;">◀</button>
      <span id="sb-pages-text" style="font-size:13px;font-weight:600;color:#334155;">1/1</span>
      <button id="sb-next" class="btn-small" style="font-size:18px;line-height:1;padding:4px 12px;">▶</button>
    </div>
  `;

  document.body.appendChild(sb);

  // 2. Crear Botón Flotante (Abrir)
  const toggleBtn = document.createElement("button");
  toggleBtn.id = "sb-toggle-btn";
  toggleBtn.innerText = "📋";
  Object.assign(toggleBtn.style, {
    position: "fixed",
    right: "20px",
    bottom: "80px",
    zIndex: "9998",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#fff",
    fontSize: "24px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    cursor: "pointer",
    display: window.innerWidth > 1000 ? "none" : "block" // Oculto en PC si el sidebar abre solo
  });
  
  document.body.appendChild(toggleBtn);

  // 3. ASIGNAR EVENTOS (La parte clave)
  document.getElementById("sb-prev").addEventListener("click", () => changePage(-1));
  document.getElementById("sb-next").addEventListener("click", () => changePage(1));
  document.getElementById("sb-close").addEventListener("click", closeSidebar);
  toggleBtn.addEventListener("click", openSidebar);

  // 4. Render inicial
  updateSidebarGrid();

  // Auto-abrir en escritorio
  if (window.innerWidth > 1000) openSidebar();
}

/* ----------------------------------------------------------
   📄 Lógica de Paginación
   ---------------------------------------------------------- */
function changePage(delta) {
  const s = window.SB_STATE;
  const totalPages = Math.ceil(s.preguntas.length / s.pageSize);
  
  const newPage = s.page + delta;

  if (newPage >= 0 && newPage < totalPages) {
    s.page = newPage;
    updateSidebarGrid();
  } else {
    console.log("Límite de página alcanzado");
  }
}

/* ----------------------------------------------------------
   🎨 Renderizar Grilla
   ---------------------------------------------------------- */
function updateSidebarGrid() {
  const s = window.SB_STATE;
  const grid = document.getElementById("sb-grid");
  const info = document.getElementById("sb-info");
  const pageText = document.getElementById("sb-pages-text");

  if (!grid) return;

  grid.innerHTML = ""; // Limpiar

  const total = s.preguntas.length;
  const totalPages = Math.ceil(total / s.pageSize);
  
  // Asegurar página válida
  if (s.page >= totalPages && totalPages > 0) s.page = totalPages - 1;

  const start = s.page * s.pageSize;
  const end = Math.min(start + s.pageSize, total);

  // Textos
  pageText.innerText = `${s.page + 1} / ${totalPages || 1}`;
  
  // Contar respondidas (global)
  let respondidas = 0;
  // (Cálculo simple visual)
  
  info.innerText = `Preguntas ${start + 1} a ${end}`;

  // Celdas
  for (let i = start; i < end; i++) {
    const q = s.preguntas[i];
    const cell = document.createElement("div");
    
    // Estilo base celda
    Object.assign(cell.style, {
      textAlign: "center",
      padding: "6px 0",
      fontSize: "12px",
      borderRadius: "6px",
      cursor: "pointer",
      border: "1px solid #e2e8f0",
      backgroundColor: "#f8fafc",
      color: "#334155"
    });
    
    cell.innerText = i + 1;

    // Estado (Color)
    // Asumimos que PROG es global (bank.js)
    if (typeof PROG !== 'undefined') {
      const st = PROG[q.materia]?.[q.id]?.status;
      if (st === "ok") {
        cell.style.backgroundColor = "#dcfce7";
        cell.style.color = "#166534";
        cell.style.borderColor = "#86efac";
      } else if (st === "bad") {
        cell.style.backgroundColor = "#fee2e2";
        cell.style.color = "#991b1b";
        cell.style.borderColor = "#fca5a5";
      }
    }

    // Activa
    if (i === s.activeIndex) {
      cell.style.backgroundColor = "#2563eb";
      cell.style.color = "#fff";
      cell.style.fontWeight = "bold";
      cell.style.borderColor = "#1d4ed8";
    }

    // Click
    cell.onclick = () => {
      if (typeof window.irAPregunta === 'function') {
         // Si existe función global en resolver.js
         window.irAPregunta(i);
      } else if (typeof CURRENT !== 'undefined') {
         // Fallback directo
         CURRENT.i = i;
         renderPregunta();
      }
    };

    grid.appendChild(cell);
  }
}

/* ----------------------------------------------------------
   🔄 Conexión Externa (llamada desde resolver.js)
   ---------------------------------------------------------- */
window.renderSidebarPage = function(index) {
  window.SB_STATE.activeIndex = index;
  // Opcional: Si querés que siga la página automáticamente, descomentá:
  // window.SB_STATE.page = Math.floor(index / window.SB_STATE.pageSize);
  updateSidebarGrid();
};

/* ----------------------------------------------------------
   👁 Abrir / Cerrar
   ---------------------------------------------------------- */
function openSidebar() {
  const sb = document.getElementById("exam-sidebar");
  const btn = document.getElementById("sb-toggle-btn");
  if (sb) sb.style.right = "0";
  if (btn) btn.style.display = "none";
}

function closeSidebar() {
  const sb = document.getElementById("exam-sidebar");
  const btn = document.getElementById("sb-toggle-btn");
  if (sb) sb.style.right = "-280px";
  if (btn) btn.style.display = "block";
}

// Exponer funciones globales por si acaso
window.showSidebar = openSidebar;
window.hideSidebar = closeSidebar;
