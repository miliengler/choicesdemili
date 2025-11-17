/* ==========================================================
   📋 MEbank 3.0 – Sidebar de resolución
   ========================================================== */

let SIDEBAR = {
  preguntas: [],
  page: 0,
};

const SIDEBAR_PAGE_SIZE = 40;

/* ----------------------------------------------------------
   🔧 Inicializar sidebar para una resolución nueva
   ---------------------------------------------------------- */
function initSidebar(preguntas) {
  SIDEBAR.preguntas = preguntas || [];
  SIDEBAR.page = 0;

  // Si ya existe, solo re-renderizamos
  if (document.getElementById("exam-sidebar")) {
    renderSidebarPage(0);
    return;
  }

  // Crear contenedor de sidebar
  const sb = document.createElement("div");
  sb.id = "exam-sidebar";
  sb.className = "exam-sidebar";
  sb.style.position = "fixed";
  sb.style.top = "60px";
  sb.style.right = "-260px";
  sb.style.width = "240px";
  sb.style.bottom = "20px";
  sb.style.background = "var(--sidebar-bg, #f8fafc)";
  sb.style.borderLeft = "1px solid #e2e8f0";
  sb.style.boxShadow = "0 4px 12px rgba(15,23,42,0.15)";
  sb.style.padding = "10px";
  sb.style.zIndex = "9999";
  sb.style.transition = "right 0.25s ease";

  sb.innerHTML = `
    <div class="sb-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
      <span style="font-weight:600;font-size:14px;">Índice</span>
      <button onclick="hideSidebar()" class="btn-small" style="padding:2px 6px;font-size:12px;">✖</button>
    </div>

    <div id="sb-progress" class="sb-progress" style="font-size:12px;color:#475569;margin-bottom:8px;">
      Progreso: 0/0 (0%)
    </div>

    <div id="sb-grid" class="sb-grid"
         style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;font-size:11px;">
    </div>

    <div class="sb-pages" style="display:flex;justify-content:center;align-items:center;margin-top:10px;gap:8px;">
      <button onclick="prevSidebarPage()" class="btn-small" style="padding:2px 6px;font-size:12px;">⬅</button>
      <span id="sb-pageinfo" style="font-size:12px;color:#475569;">1/1</span>
      <button onclick="nextSidebarPage()" class="btn-small" style="padding:2px 6px;font-size:12px;">➡</button>
    </div>
  `;

  document.body.appendChild(sb);

  // Botón flotante para abrir
  const btn = document.createElement("button");
  btn.id = "sb-openbtn";
  btn.textContent = "📋";
  btn.title = "Ver índice";
  btn.style.position = "fixed";
  btn.style.right = "16px";
  btn.style.bottom = "80px";
  btn.style.zIndex = "9998";
  btn.style.borderRadius = "999px";
  btn.style.border = "1px solid #cbd5e1";
  btn.style.background = "#ffffff";
  btn.style.boxShadow = "0 4px 10px rgba(15,23,42,0.2)";
  btn.style.padding = "8px 10px";
  btn.style.cursor = "pointer";
  btn.onclick = showSidebar;

  document.body.appendChild(btn);

  renderSidebarPage(0);
}

/* ----------------------------------------------------------
   👁 Mostrar / ocultar
   ---------------------------------------------------------- */
function showSidebar() {
  const sb = document.getElementById("exam-sidebar");
  const btn = document.getElementById("sb-openbtn");
  if (!sb || !btn) return;

  sb.style.right = "0";
  btn.style.display = "none";
}

function hideSidebar() {
  const sb = document.getElementById("exam-sidebar");
  const btn = document.getElementById("sb-openbtn");
  if (!sb || !btn) return;

  sb.style.right = "-260px";
  btn.style.display = "block";
}

/* ----------------------------------------------------------
   📄 Render de página del sidebar
   currentIndex: índice actual en CURRENT.preguntas
   ---------------------------------------------------------- */
function renderSidebarPage(currentIndex = 0) {
  const grid = document.getElementById("sb-grid");
  const progEl = document.getElementById("sb-progress");
  const pageInfo = document.getElementById("sb-pageinfo");
  if (!grid || !progEl || !pageInfo) return;

  const total = SIDEBAR.preguntas.length;
  if (!total) {
    grid.innerHTML = "";
    progEl.textContent = "Progreso: 0/0 (0%)";
    pageInfo.textContent = "1/1";
    return;
  }

  // Ajustar página si el índice actual está fuera de la visible
  const pageFromIndex = Math.floor(currentIndex / SIDEBAR_PAGE_SIZE);
  if (pageFromIndex !== SIDEBAR.page) {
    SIDEBAR.page = pageFromIndex;
  }

  const start = SIDEBAR.page * SIDEBAR_PAGE_SIZE;
  const end = Math.min(start + SIDEBAR_PAGE_SIZE, total);

  grid.innerHTML = "";

  let respondidas = 0;

  for (let i = start; i < end; i++) {
    const q = SIDEBAR.preguntas[i];
    const mat = q.materia;
    const res = PROG[mat]?.[q.id];
    if (res && (res.status === "ok" || res.status === "bad")) respondidas++;

    const cell = document.createElement("div");
    cell.className = "sb-cell";
    cell.textContent = i + 1;
    cell.style.borderRadius = "6px";
    cell.style.textAlign = "center";
    cell.style.padding = "4px 0";
    cell.style.cursor = "pointer";
    cell.style.border = "1px solid #e2e8f0";

    // Colores según estado
    if (i === currentIndex) {
      cell.style.background = "#0ea5e9";
      cell.style.color = "#ffffff";
      cell.style.fontWeight = "600";
    } else if (res?.status === "ok") {
      cell.style.background = "#dcfce7";
      cell.style.color = "#166534";
    } else if (res?.status === "bad") {
      cell.style.background = "#fee2e2";
      cell.style.color = "#b91c1c";
    } else {
      cell.style.background = "#f8fafc";
      cell.style.color = "#0f172a";
    }

    // Indicador de nota (●) si hay nota guardada
    if (res?.nota && res.nota.trim() !== "") {
      const dot = document.createElement("span");
      dot.textContent = " •";
      dot.style.color = "#6366f1";
      cell.appendChild(dot);
    }

    cell.onclick = () => {
      if (typeof CURRENT !== "undefined") {
        CURRENT.i = i;
        renderPregunta();
      }
    };

    grid.appendChild(cell);
  }

  const totalResueltas = Object.values(PROG || {}).reduce((acc, matObj) => {
    return acc + Object.keys(matObj || {}).length;
  }, 0);

  const p = Math.round((respondidas / total) * 100);
  progEl.textContent = `Progreso (página): ${respondidas}/${end - start} (${p}%)`;

  const pages = Math.ceil(total / SIDEBAR_PAGE_SIZE);
  pageInfo.textContent = `${SIDEBAR.page + 1}/${pages}`;
}

/* ----------------------------------------------------------
   ⏩ Paginación
   ---------------------------------------------------------- */
function nextSidebarPage() {
  const total = SIDEBAR.preguntas.length;
  const pages = Math.ceil(total / SIDEBAR_PAGE_SIZE);
  if (SIDEBAR.page < pages - 1) {
    SIDEBAR.page++;
    renderSidebarPage(SIDEBAR.page * SIDEBAR_PAGE_SIZE);
  }
}

function prevSidebarPage() {
  if (SIDEBAR.page > 0) {
    SIDEBAR.page--;
    renderSidebarPage(SIDEBAR.page * SIDEBAR_PAGE_SIZE);
  }
}
