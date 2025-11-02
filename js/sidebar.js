/* ==========================================================
   📊 Barra lateral de progreso (modo examen)
   ========================================================== */

let sidebarPage = 0;
const PAGE_SIZE = 50;

/* ---------- Inicialización ---------- */
function initSidebar() {
  if (document.getElementById("exam-sidebar")) return;

  const sidebar = document.createElement("div");
  sidebar.id = "exam-sidebar";
  sidebar.style = `
    position: fixed;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    width: 200px;
    max-height: 90vh;
    background: #ffffff;
    border-left: 2px solid var(--line);
    box-shadow: -2px 0 10px rgba(0,0,0,0.08);
    border-radius: 12px 0 0 12px;
    padding: 12px;
    overflow-y: auto;
    z-index: 60;
    transition: right 0.3s ease;
  `;

  sidebar.innerHTML = `
    <div id="sidebar-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <b style="font-size:14px;">Preguntas</b>
      <button id="closeSidebar" style="border:none;background:none;font-size:16px;cursor:pointer;color:var(--muted)">✖</button>
    </div>
    <div id="sidebar-grid" style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;"></div>
    <div id="sidebar-pagination" style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
      <button id="prevPage" class="btn-mini" disabled>⬅️</button>
      <span id="pageInfo" style="font-size:13px;color:var(--muted)">1</span>
      <button id="nextPage" class="btn-mini">➡️</button>
    </div>
  `;

  document.body.appendChild(sidebar);

  // 🔹 Botón para volver a abrir
  const toggleBtn = document.createElement("button");
  toggleBtn.id = "openSidebarBtn";
  toggleBtn.innerHTML = "📑";
  toggleBtn.title = "Mostrar barra lateral";
  toggleBtn.style = `
    position: fixed;
    top: 50%;
    right: 6px;
    transform: translateY(-50%);
    background: #1e40af;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 6px 8px;
    cursor: pointer;
    z-index: 61;
    font-size: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    display: none;
  `;
  toggleBtn.onclick = showSidebar;
  document.body.appendChild(toggleBtn);

  document.getElementById("closeSidebar").onclick = hideSidebar;
  document.getElementById("prevPage").onclick = prevSidebarPage;
  document.getElementById("nextPage").onclick = nextSidebarPage;

  // 🔹 Añadir margen al contenido principal
  document.getElementById("app")?.classList.add("with-sidebar");

  renderSidebarPage();
}

/* ---------- Render de página ---------- */
function renderSidebarPage() {
  const total = CURRENT?.list?.length || 0;
  const start = sidebarPage * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const grid = document.getElementById("sidebar-grid");
  if (!grid) return;

  grid.innerHTML = "";

  for (let i = start; i < end; i++) {
    const btn = document.createElement("div");
    btn.textContent = i + 1;
    btn.className = "sidebar-cell";
    btn.style = `
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--soft);
      border-radius: 8px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s ease;
    `;

    // 🔹 Estado de respuesta (color)
    const q = CURRENT.list[i];
    const prog = PROG.general?.[q.id];
    if (prog?.status === "ok") btn.style.background = "#dcfce7";     // verde claro
    else if (prog?.status === "bad") btn.style.background = "#fee2e2"; // rojo claro
    else if (prog) btn.style.background = "#e2e8f0"; // gris si respondió sin estado

    // 🔹 Clip de nota (placeholder)
    if (prog?.note) {
      const clip = document.createElement("span");
      clip.textContent = "📎";
      clip.style.fontSize = "11px";
      clip.style.marginLeft = "2px";
      btn.appendChild(clip);
    }

    // 🔹 Borde de pregunta activa
    if (i === CURRENT.i) btn.style.border = "2px solid #1e3a8a";

    // 🔹 Hover suave
    btn.onmouseenter = () => (btn.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)");
    btn.onmouseleave = () => (btn.style.boxShadow = "none");

    // 🔹 Click → cambiar pregunta
    btn.onclick = () => {
      CURRENT.i = i;
      renderExamenPregunta();
      renderSidebarPage();
    };

    grid.appendChild(btn);
  }

  // Actualizar paginación
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");
  const totalPages = Math.ceil(total / PAGE_SIZE);

  prevBtn.disabled = sidebarPage === 0;
  nextBtn.disabled = sidebarPage >= totalPages - 1;
  pageInfo.textContent = `${sidebarPage + 1}/${totalPages}`;
}

/* ---------- Navegación entre páginas ---------- */
function nextSidebarPage() {
  const total = CURRENT?.list?.length || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (sidebarPage < totalPages - 1) {
    sidebarPage++;
    renderSidebarPage();
  }
}

function prevSidebarPage() {
  if (sidebarPage > 0) {
    sidebarPage--;
    renderSidebarPage();
  }
}

/* ---------- Mostrar / ocultar ---------- */
function hideSidebar() {
  const sidebar = document.getElementById("exam-sidebar");
  const toggleBtn = document.getElementById("openSidebarBtn");
  const app = document.getElementById("app");
  if (!sidebar || !toggleBtn) return;
  sidebar.style.right = "-210px";
  toggleBtn.style.display = "block";
  app?.classList.remove("with-sidebar");
  app?.classList.add("fullwidth");
}

function showSidebar() {
  const sidebar = document.getElementById("exam-sidebar");
  const toggleBtn = document.getElementById("openSidebarBtn");
  const app = document.getElementById("app");
  if (!sidebar || !toggleBtn) return;
  sidebar.style.right = "0";
  toggleBtn.style.display = "none";
  app?.classList.add("with-sidebar");
  app?.classList.remove("fullwidth");
}
