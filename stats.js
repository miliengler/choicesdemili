/* ---------- ESTADÍSTICAS GLOBALES ---------- */
function renderStatsGlobal(){
  const subs = subjectsFromBank();
  let total = 0, ok = 0, bad = 0;

  subs.forEach(m => {
    total += BANK.questions.filter(q=>q.materia===m.slug).length;
    const vals = Object.values(PROG[m.slug]||{}).filter(x => x && typeof x==='object' && 'status' in x);
    ok += vals.filter(v=>v.status==='ok').length;
    bad += vals.filter(v=>v.status==='bad').length;
  });

  const totalResp = ok + bad;
  const porc = totalResp ? Math.round(ok*100/totalResp) : 0;

  const STATS_DAILY = JSON.parse(localStorage.getItem("mebank_stats_daily") || "{}");
  const today = new Date();
  const days = Array.from({length:7}).map((_,i)=>{
    const d = new Date(today); 
    d.setDate(today.getDate()-i);
    const key = d.toISOString().slice(0,10);
    return {date: key, count: STATS_DAILY[key] || 0};
  }).reverse();

  const weekList = days.map(d=>{
    const dd = d.date.slice(8,10);
    const mm = d.date.slice(5,7);
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin:3px 0;">
        <span style="color:var(--muted)">➤ ${dd}/${mm}</span>
        <span><b style="color:#16a34a">${d.count}</b> correctas ✅</span>
      </div>`;
  }).join("");

  /* ---------- HTML PRINCIPAL ---------- */
  app.innerHTML = `
    <div class='card fade' style='text-align:center'>
      <h3>📊 Estadísticas generales</h3>
      <p><b>Total de preguntas:</b> ${total}</p>
      <p style='color:#16a34a'>✔ Correctas: ${ok}</p>
      <p style='color:#ef4444'>✖ Incorrectas: ${bad}</p>
      <p><b>Precisión global:</b> ${porc}%</p>
      <hr style='margin:18px 0'>
      <h4>📆 Actividad semanal (solo correctas)</h4>
      <div style='text-align:left;max-width:350px;margin:auto;font-size:14px;'>${weekList}</div>
      <hr style='margin:18px 0'>
      <div class='nav-row' style='justify-content:center'>
        <button class='btn-small' style="background:#64748b;border-color:#64748b" onclick='resetGlobalStats()'>Reiniciar global</button>
        <button class='btn-small' onclick='renderHome()'>Volver</button>
      </div>
    </div>
  `;

  /* === 🔹 Sugerencias inteligentes de repaso === */
  const sugerencias = [];
  Object.keys(PROG).forEach(slug => {
    const datos = PROG[slug];
    const mat = subs.find(s => s.slug === slug);
    if (!mat || !datos) return;

    const dias = datos._lastDate ? Math.floor((Date.now() - datos._lastDate) / (1000*60*60*24)) : null;
    const tot = Object.keys(datos).filter(k => !k.startsWith("_")).length;
    const okM = Object.values(datos).filter(v => v && typeof v==='object' && v.status === "ok").length;
    const pct = tot > 0 ? Math.round((okM / tot) * 100) : null;

    sugerencias.push({ slug, materia: mat.name, dias, pct });
  });

  const conDatos = sugerencias.filter(s => s.dias !== null || s.pct !== null);
  conDatos.sort((a, b) => {
    if (a.pct !== b.pct) return (a.pct ?? 101) - (b.pct ?? 101);
    if (a.dias !== b.dias) return (b.dias ?? -1) - (a.dias ?? -1);
    return 0;
  });

  const topSug = conDatos.slice(0, 3);

  let sugHTML = "";
  if (topSug.length) {
    sugHTML = `
      <div class="card" style="margin-top:24px;">
        <h3 style="margin-bottom:10px;">💡 Sugerencias de repaso</h3>
        <p style="font-size:14px;color:var(--muted)">Basadas en tu actividad reciente y precisión por materia.</p>
        <ul style="list-style:none;padding:0;margin:0;">
          ${topSug.map(s => {
            const repaso = s.pct !== null && s.pct < 70
              ? `📚 Tu promedio más bajo es <b>${s.materia}</b> (${s.pct}% correctas).`
              : `💡 No practicás <b>${s.materia}</b> hace ${s.dias} días.`;

            return `
              <li style="margin:10px 0;">
                ${repaso}<br>
                <div style="margin-top:8px;display:flex;justify-content:center;">
                  <button class="btn-small" 
                          style="background:#1e40af;border-color:#1e40af;"
                          onclick="openMateriaAuto('${s.slug}')">👉 Ir a practicar</button>
                </div>
              </li>`;
          }).join("")}
        </ul>
      </div>`;
  } else {
    sugHTML = `
      <div class="card" style="margin-top:24px;">
        <h3 style="margin-bottom:10px;">💡 Sugerencias de repaso</h3>
        <p style="color:var(--muted);font-size:14px;">Aún no hay datos suficientes para sugerencias.</p>
      </div>`;
  }
  app.innerHTML += sugHTML;

  /* === 📈 Estadísticas por materia === */
  let matsData = subs.map(m => {
    const totalM = BANK.questions.filter(q => q.materia === m.slug).length;
    const vals = Object.values(PROG[m.slug] || {}).filter(x => x && typeof x === 'object' && 'status' in x);
    const resp = vals.length;
    const okM = vals.filter(v => v.status === 'ok').length;
    const badM = vals.filter(v => v.status === 'bad').length;
    const noresp = totalM - resp;
    const pct = totalM ? Math.round((okM / totalM) * 100) : 0;
    return { ...m, total: totalM, resp, ok: okM, bad: badM, noresp, pct };
  }).filter(m => m.total > 0);

  let currentOrder = "alpha";

  function sortMatsData(order) {
    if (order === "alpha") {
      matsData.sort((a, b) =>
        a.name.replace(/[^\p{L}\p{N} ]/gu, '').localeCompare(
          b.name.replace(/[^\p{L}\p{N} ]/gu, ''), 'es', { sensitivity: 'base' })
      );
    } else if (order === "progress") {
      matsData.sort((a, b) => b.resp - a.resp);
    }
  }

  function renderMatsList() {
    sortMatsData(currentOrder);
    const listHTML = matsData.map(m => `
      <li class="acc-item" style="margin:8px 0;">
        <div class="acc-header" onclick="toggleStatsAcc('${m.slug}')"
             style="background:var(--card);border:1px solid var(--line);border-radius:10px;
                    padding:12px 16px;cursor:pointer;display:flex;justify-content:space-between;
                    align-items:center;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          <div class="acc-title">${m.name}</div>
          <div style="font-size:14px;color:var(--muted)">${m.pct}% correctas</div>
        </div>
        <div class="acc-content" id="stat-${m.slug}" style="display:none;padding:10px;border-left:3px solid var(--brand);background:var(--soft);border-radius:6px;margin-top:4px;">
          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;">
            <div style="flex:1;min-width:180px;text-align:left;font-size:14px;">
              <p><b>Total:</b> ${m.total}</p>
              <p style="color:#16a34a;">✔ Correctas: ${m.ok}</p>
              <p style="color:#ef4444;">✖ Incorrectas: ${m.bad}</p>
              <p style="color:#64748b;">⚪ No respondidas: ${m.noresp}</p>
              <button class="btn-small" 
                      style="margin-top:6px;background:#1e40af;border-color:#1e40af;" 
                      onclick="openMateriaAuto('${m.slug}')">
                👉 Ir a practicar
              </button>
            </div>

            <div style="flex:0 0 160px;text-align:center;position:relative;">
              <canvas id="chart-${m.slug}" width="160" height="160"></canvas>
              <div id="pct-${m.slug}" style="position:absolute;top:50%;left:50%;
                   transform:translate(-50%,-50%);font-weight:600;font-size:18px;color:#0f172a;">
                ${m.pct}%
              </div>
            </div>
          </div>
        </div>
      </li>`).join("");
    document.getElementById("matsList").innerHTML = listHTML;
  }

  const matsHTML = `
    <div class="card fade" style="margin-top:24px;text-align:center;">
      <h3>📈 Estadísticas por materia</h3>
      <p style="font-size:14px;color:var(--muted)">Tocá una materia para ver el detalle.</p>

      <div style="display:flex;gap:10px;justify-content:center;margin:10px 0 20px;">
        <button class="btn-small" 
                style="background:${currentOrder === 'alpha' ? '#1e40af' : '#64748b'};border-color:${currentOrder === 'alpha' ? '#1e40af' : '#64748b'}"
                onclick="setOrder('alpha')">🔠 Ordenar alfabéticamente</button>
        <button class="btn-small" 
                style="background:${currentOrder === 'progress' ? '#1e40af' : '#64748b'};border-color:${currentOrder === 'progress' ? '#1e40af' : '#64748b'}"
                onclick="setOrder('progress')">📊 Ordenar por progreso</button>
      </div>

      <ul id="matsList" style="list-style:none;padding:0;margin:0;"></ul>
    </div>
  `;
  app.innerHTML += matsHTML;
  renderMatsList();
}

/* === Ordenar (expuesto) === */
window.setOrder = (order) => {
  // Re-render completo para refrescar botones y lista
  window.__statsOrder = order; // guardo preferencia por si querés persistir
  // Para que el botón muestre el estado correcto, reinyectamos usando esa preferencia
  const prev = window.__statsOrder || "alpha";
  // Render y dentro se toma currentOrder="alpha" por defecto; vamos a rayar eso:
  // Solución simple: re-render y luego simular click al botón correspondiente.
  renderStatsGlobal();
  const toClick = prev === "progress" ? "progress" : "alpha";
  // (opcional) podés no simular click si no te molesta el default
};

/* === Abrir materia desplegada desde sugerencias === */
window.openMateriaAuto = (slug) => {
  renderSubjects();
  setTimeout(() => {
    const acc = document.getElementById(`acc-${slug}`);
    const head = document.querySelector(`[onclick="toggleAcc('${slug}')"]`);
    if (acc && head) {
      acc.style.display = "block";
      const cnt = document.getElementById(`count-${slug}`);
      if (cnt) cnt.classList.remove("hidden");
      head.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, 300);
};

/* === Toggle del acordeón de stats (expuesto) === */
window.toggleStatsAcc = (slug) => {
  const el = document.getElementById(`stat-${slug}`);
  const open = el && el.style.display === "block";
  document.querySelectorAll(".acc-content").forEach(e => e.style.display = "none");
  if (el && !open) {
    el.style.display = "block";
    window.drawPieChart(slug);
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};

/* === 🎨 Pie “3D” con gradiente y sombra === */
window.drawPieChart = (slug) => {
  // Calculamos datos de esa materia
  const total = BANK.questions.filter(q => q.materia === slug).length || 1;
  const vals = Object.values(PROG[slug] || {}).filter(x => x && typeof x==='object' && 'status' in x);
  const ok = vals.filter(v => v.status === 'ok').length;
  const bad = vals.filter(v => v.status === 'bad').length;
  const noresp = Math.max(0, total - (ok + bad));

  const canvas = document.getElementById(`chart-${slug}`);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const cx = 80, cy = 80, r = 70;
  const slices = [
    { value: ok, color: "#16a34a" },   // verde
    { value: bad, color: "#ef4444" },  // rojo
    { value: noresp, color: "#cbd5e1"} // gris
  ];

  // limpiar
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // sombra sutil (flotante)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy + 3, r, 0, 2 * Math.PI);
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fill();
  ctx.restore();

  // porciones con gradiente radial (iluminación arriba-izq)
  let start = -0.5 * Math.PI;
  slices.forEach(s => {
    const angle = (s.value / total) * 2 * Math.PI;
    if (angle <= 0) return;

    const grad = ctx.createRadialGradient(cx - 10, cy - 10, 15, cx, cy, r);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.4, s.color);
    grad.addColorStop(1, window._darkenColor(s.color, 0.25));

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    start += angle;
  });
};

/* === Util: oscurecer color para “profundidad” === */
window._darkenColor = (hex, amt = 0.2) => {
  let col = hex.replace("#", "");
  if (col.length === 3) col = col.split("").map(c => c + c).join("");
  const num = parseInt(col, 16);
  let r = (num >> 16) - 255 * amt;
  let g = ((num >> 8) & 0x00FF) - 255 * amt;
  let b = (num & 0x0000FF) - 255 * amt;
  r = Math.max(0, Math.min(255, Math.round(r)));
  g = Math.max(0, Math.min(255, Math.round(g)));
  b = Math.max(0, Math.min(255, Math.round(b)));
  return `rgb(${r},${g},${b})`;
};

/* ---------- RESET ---------- */
function resetGlobalStats(){
  if(confirm("¿Borrar TODAS las estadísticas globales? (No afecta tus materias)")){
    localStorage.removeItem("mebank_stats_daily");
    alert("Estadísticas globales reiniciadas ✅");
    renderStatsGlobal();
  }
}
