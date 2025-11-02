/* ==========================================================
   📊 Barra lateral de progreso (modo examen)
   ========================================================== */

let sidebarPage = 0;
const PAGE_SIZE = 50;

/* ---------- Inicialización ---------- */
function initSidebar() {
  console.log("✅ initSidebar ejecutado");

  // eliminar si ya existe
  const old = document.getElementById("exam-sidebar");
  if (old) old.remove();

  const sidebar = document.createElement("div");
  sidebar.id = "exam-sidebar";
  sidebar.style = `
    position: fixed;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    width: 220px;
    max-height: 90vh;
    background: #ffffff;
    border: 1px solid var(--line);
    box-shadow: 0 4px 18px rgba(0,0,0,0.1);
    border-radius: 12px;
    padding: 12px;
    overflow-y: auto;
    z-index: 9999;
    transition: all 0.3s ease;
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

  // Botón flotante para volver a abrir
  const toggleBtn = document.getElementById("openSidebarBtn") || document.createElement("button");
  toggleBtn.id = "openSidebarBtn";
  toggleBtn.innerHTML = "📑";
  toggleBtn.title = "Mostrar barra lateral";
  toggleBtn.style = `
    position: fixed;
    top: 50%;
    right: 8px;
    transform: translateY(-50%);
    background: #1e40af;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 6px 8px;
    cursor: pointer;
    z-index: 10000;
    font-size: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    display: none;
  `;
  toggleBtn.onclick = showSidebar;
  if (!document.getElementById("openSidebarBtn")) document.body.appendChild(toggleBtn);

  document.getElementById("closeSidebar").onclick = hideSidebar;
  document.getElementById("prevPage").onclick = prevSidebarPage;
  document.getElementById("nextPage").onclick = nextSidebarPage;

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
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--soft);
      border-radius: 8px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    if (i === CURRENT.i) {
      btn.style.border = "2px solid var(--brand)";
      btn.style.background = "#e0e7ff";
    }
    btn.onclick = () => {
      CURRENT.i = i;
      renderExamenPregunta();
      renderSidebarPage();
    };
    grid.appendChild(btn);
  }

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
  if (!sidebar || !toggleBtn) return;
  sidebar.style.right = "-250px";
  toggleBtn.style.display = "block";
}

function showSidebar() {
  const sidebar = document.getElementById("exam-sidebar");
  const toggleBtn = document.getElementById("openSidebarBtn");
  if (!sidebar || !toggleBtn) return;
  sidebar.style.right = "20px";
  toggleBtn.style.display = "none";
}
