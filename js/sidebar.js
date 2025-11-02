/* =======================================================
   📚 BARRA LATERAL DE PREGUNTAS (MEbank Choice)
   ======================================================= */

const QUESTIONS_PER_PAGE = 50;
let currentSidebarPage = 0;
let sidebarOpen = false;

/* ---------- Inicialización ---------- */
function initSidebar() {
  // Evitar duplicados
  if (document.getElementById("sidebar")) return;

  const sb = document.createElement("div");
  sb.id = "sidebar";
  sb.innerHTML = `
    <div id="sidebar-toggle" onclick="toggleSidebar()">
      <span id="sidebar-icon">📋</span>
    </div>
    <div id="sidebar-content">
      <h4>Preguntas</h4>
      <div id="sidebar-list"></div>
      <div id="sidebar-pagination">
        <button id="prevPageBtn" class="sb-page-btn" onclick="changeSidebarPage(-1)">⟨</button>
        <span id="pageIndicator"></span>
        <button id="nextPageBtn" class="sb-page-btn" onclick="changeSidebarPage(1)">⟩</button>
      </div>
    </div>
  `;
  document.body.appendChild(sb);
  renderSidebar();
}

/* ---------- Render principal ---------- */
function renderSidebar() {
  const total = BANK.questions.length;
  const start = currentSidebarPage * QUESTIONS_PER_PAGE;
  const end = Math.min(start + QUESTIONS_PER_PAGE, total);

  let html = "";
  for (let i = start; i < end; i++) {
    const n = i + 1;
    html += `<button class="sidebar-q" data-q="${n}" onclick="goToQuestion(${n})">${n}</button>`;
  }

  const list = document.getElementById("sidebar-list");
  if (list) list.innerHTML = html;

  const indicator = document.getElementById("pageIndicator");
  if (indicator)
    indicator.textContent = `Página ${currentSidebarPage + 1} de ${Math.ceil(total / QUESTIONS_PER_PAGE)}`;

  updateSidebarStatus();
}

/* ---------- Cambiar página ---------- */
function changeSidebarPage(dir) {
  const totalPages = Math.ceil(BANK.questions.length / QUESTIONS_PER_PAGE);
  currentSidebarPage = Math.max(0, Math.min(currentSidebarPage + dir, totalPages - 1));
  renderSidebar();
}

/* ---------- Toggle lateral ---------- */
function toggleSidebar(force) {
  sidebarOpen = force !== undefined ? force : !sidebarOpen;
  const sb = document.getElementById("sidebar");
  if (!sb) return;

  if (sidebarOpen) {
    sb.style.transform = "translateX(0)";
    document.getElementById("sidebar-icon").textContent = "❮";
  } else {
    sb.style.transform = "translateX(100%)";
    document.getElementById("sidebar-icon").textContent = "📋";
  }
}

/* ---------- Colorear estado ---------- */
function updateSidebarStatus() {
  document.querySelectorAll(".sidebar-q").forEach(btn => {
    const n = parseInt(btn.dataset.q);
    const data = PROG[currentMateria]?.[n];

    btn.classList.remove("ok", "bad", "none", "note");
    if (!data) btn.classList.add("none");
    else if (data.status === "ok") btn.classList.add("ok");
    else if (data.status === "bad") btn.classList.add("bad");
    if (data?.note) btn.classList.add("note");
  });
}

/* ---------- Estilos ---------- */
const style = document.createElement("style");
style.textContent = `
#sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 250px;
  height: 100%;
  background: var(--card);
  border-left: 1px solid var(--line);
  box-shadow: -4px 0 10px rgba(0,0,0,0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  display:flex;
  flex-direction:column;
}

#sidebar-toggle {
  position: absolute;
  top: 50%;
  left: -32px;
  transform: translateY(-50%);
  background: var(--card);
  border: 1px solid var(--line);
  border-right:none;
  border-radius: 10px 0 0 10px;
  box-shadow: -2px 0 6px rgba(0,0,0,0.05);
  padding: 6px 8px;
  cursor: pointer;
}

#sidebar-content {
  flex:1;
  overflow-y:auto;
  padding: 16px;
  text-align:center;
}

#sidebar-list {
  display:flex;
  flex-wrap:wrap;
  justify-content:center;
  gap:6px;
  margin-top:8px;
}

.sidebar-q {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--soft);
  cursor:pointer;
  font-size:14px;
  transition: all 0.2s;
}
.sidebar-q:hover {
  background: var(--brand);
  color:#fff;
}
.sidebar-q.ok {
  background:#dcfce7;
  border-color:#16a34a;
  color:#166534;
}
.sidebar-q.bad {
  background:#fee2e2;
  border-color:#dc2626;
  color:#7f1d1d;
}
.sidebar-q.none {
  background:#f8fafc;
  color:#475569;
}
.sidebar-q.note::after {
  content:"📎";
  font-size:11px;
  position:relative;
  top:-3px;
  left:2px;
}

#sidebar-pagination {
  margin-top:10px;
  display:flex;
  justify-content:center;
  align-items:center;
  gap:10px;
}
.sb-page-btn {
  background:var(--soft);
  border:none;
  border-radius:6px;
  padding:4px 8px;
  cursor:pointer;
}
.sb-page-btn:hover {
  background:var(--brand);
  color:#fff;
}
`;
document.head.appendChild(style);
