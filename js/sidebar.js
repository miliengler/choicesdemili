/* ==========================================================
   📋 MEbank 3.0 – Sidebar (Versión "Nuclear" / Debug)
   ========================================================== */

// Configuración Global
const SB_SIZE = 50; // Preguntas por página

// Estado interno
let SB_DATA = [];
let SB_PAGE = 0;
let SB_ACTIVE_INDEX = 0;

/* ----------------------------------------------------------
   🔧 Inicializar (Se llama al abrir un examen)
   ---------------------------------------------------------- */
window.initSidebar = function(preguntas) {
  console.log("📋 Sidebar: Inicializando con " + (preguntas ? preguntas.length : 0) + " preguntas.");
  
  SB_DATA = preguntas || [];
  SB_PAGE = 0;
  SB_ACTIVE_INDEX = 0;

  // 1. Borrar sidebar viejo si existe
  const old = document.getElementById("exam-sidebar");
  if (old) old.remove();
  const oldBtn = document.getElementById("sb-open-btn");
  if (oldBtn) oldBtn.remove();

  // 2. Crear estructura HTML
  const sb = document.createElement("div");
  sb.id = "exam-sidebar";
  
  // Estilos "Hardcoded" para que no fallen por CSS externo
  sb.style.position = "fixed";
  sb.style.top = "60px";
  sb.style.right = "-280px"; // Empieza oculto
  sb.style.width = "260px";
  sb.style.bottom = "20px";
  sb.style.backgroundColor = "white";
  sb.style.borderLeft = "2px solid #ccc";
  sb.style.zIndex = "10000";
  sb.style.transition = "right 0.3s";
  sb.style.display = "flex";
  sb.style.flexDirection = "column";
  sb.style.padding = "10px";
  sb.style.boxShadow = "-5px 0 15px rgba(0,0,0,0.1)";

  sb.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
        <b style="font-size:16px;">Índice</b>
        <button onclick="window.toggleSidebar(false)" style="padding:2px 8px;cursor:pointer;">✖</button>
    </div>
    
    <div id="sb-status" style="text-align:center;font-size:12px;color:#666;margin-bottom:5px;">
       Cargando...
    </div>

    <div id="sb-cells" style="flex:1;overflow-y:auto;display:grid;grid-template-columns:repeat(5,1fr);gap:5px;align-content:start;">
    </div>

    <div style="display:flex;justify-content:space-between;margin-top:10px;padding-top:5px;border-top:1px solid #eee;">
        <button onclick="window.sbPrevPage()" style="padding:5px 15px;cursor:pointer;font-weight:bold;background:#f1f5f9;border:1px solid #ccc;border-radius:4px;">◀</button>
        <span id="sb-pagetext" style="font-size:14px;align-self:center;font-weight:bold;">1/1</span>
        <button onclick="window.sbNextPage()" style="padding:5px 15px;cursor:pointer;font-weight:bold;background:#f1f5f9;border:1px solid #ccc;border-radius:4px;">▶</button>
    </div>
  `;

  document.body.appendChild(sb);

  // 3. Botón Flotante para abrir
  const btn = document.createElement("button");
  btn.id = "sb-open-btn";
  btn.innerHTML = "📋";
  btn.style.position = "fixed";
  btn.style.right = "20px";
  btn.style.bottom = "80px";
  btn.style.zIndex = "9999";
  btn.style.width = "50px";
  btn.style.height = "50px";
  btn.style.borderRadius = "50%";
  btn.style.background = "#2563eb";
  btn.style.color = "white";
  btn.style.fontSize = "24px";
  btn.style.border = "none";
  btn.style.cursor = "pointer";
  btn.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
  btn.onclick = () => window.toggleSidebar(true);
  
  document.body.appendChild(btn);

  // 4. Dibujar primera vez
  window.sbRender();

  // Abrir si es pantalla grande
  if (window.innerWidth > 1000) window.toggleSidebar(true);
};

/* ----------------------------------------------------------
   🎨 Renderizado (Pinta los cuadraditos)
   ---------------------------------------------------------- */
window.sbRender = function() {
  const container = document.getElementById("sb-cells");
  const label = document.getElementById("sb-pagetext");
  const status = document.getElementById("sb-status");

  if (!container) return;

  container.innerHTML = ""; // Limpiar

  const total = SB_DATA.length;
  const totalPages = Math.ceil(total / SB_SIZE);

  // Asegurar página válida
  if (SB_PAGE >= totalPages) SB_PAGE = totalPages - 1;
  if (SB_PAGE < 0) SB_PAGE = 0;

  // Texto Paginador
  label.innerText = (SB_PAGE + 1) + " / " + (totalPages || 1);

  // Calcular inicio y fin
  const start = SB_PAGE * SB_SIZE;
  const end = Math.min(start + SB_SIZE, total);

  status.innerText = `Preguntas ${start + 1} - ${end}`;

  for (let i = start; i < end; i++) {
    const q = SB_DATA[i];
    const cell = document.createElement("div");
    
    // Estilos celda
    cell.innerText = i + 1;
    cell.style.textAlign = "center";
    cell.style.padding = "8px 0";
    cell.style.fontSize = "12px";
    cell.style.cursor = "pointer";
    cell.style.border = "1px solid #ddd";
    cell.style.borderRadius = "4px";
    cell.style.backgroundColor = "#f8fafc";

    // Colores según estado (Busca en PROG global)
    if (typeof PROG !== 'undefined' && PROG[q.materia] && PROG[q.materia][q.id]) {
        const st = PROG[q.materia][q.id].status;
        if (st === 'ok') {
            cell.style.backgroundColor = "#dcfce7"; // Verde
            cell.style.color = "green";
            cell.style.borderColor = "green";
        } else if (st === 'bad') {
            cell.style.backgroundColor = "#fee2e2"; // Rojo
            cell.style.color = "red";
            cell.style.borderColor = "red";
        }
    }

    // Estilo "Activo" (pregunta actual)
    if (i === SB_ACTIVE_INDEX) {
        cell.style.backgroundColor = "#2563eb"; // Azul
        cell.style.color = "white";
        cell.style.fontWeight = "bold";
    }

    // Click en celda
    cell.onclick = function() {
        if (window.irAPregunta) window.irAPregunta(i); // Función en resolver.js
        else if (CURRENT) { CURRENT.i = i; renderPregunta(); }
    };

    container.appendChild(cell);
  }
};

/* ----------------------------------------------------------
   🎮 Funciones de Botones (Globales)
   ---------------------------------------------------------- */
window.sbNextPage = function() {
  const totalPages = Math.ceil(SB_DATA.length / SB_SIZE);
  console.log("Click Next. Pág actual:", SB_PAGE, "Total págs:", totalPages);
  
  if (SB_PAGE < totalPages - 1) {
    SB_PAGE++;
    window.sbRender();
  } else {
    console.warn("No hay más páginas");
  }
};

window.sbPrevPage = function() {
  console.log("Click Prev. Pág actual:", SB_PAGE);
  if (SB_PAGE > 0) {
    SB_PAGE--;
    window.sbRender();
  }
};

window.toggleSidebar = function(show) {
  const sb = document.getElementById("exam-sidebar");
  const btn = document.getElementById("sb-open-btn");
  if (!sb) return;

  if (show) {
    sb.style.right = "0px";
    if (btn) btn.style.display = "none";
  } else {
    sb.style.right = "-280px";
    if (btn) btn.style.display = "block";
  }
};

// Sincronización externa (llamada por resolver.js al avanzar pregunta)
window.renderSidebarPage = function(idx) {
  SB_ACTIVE_INDEX = idx;
  // Solo cambiamos de página si es la primera carga o si quedó muy lejos
  // (Opcional: descomentar si querés que siga la página automáticamente)
  // SB_PAGE = Math.floor(idx / SB_SIZE);
  window.sbRender();
};
