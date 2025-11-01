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
    const d = new Date(today); d.setDate(today.getDate()-i);
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
}

function resetGlobalStats(){
  if(confirm("¿Borrar TODAS las estadísticas globales? (No afecta tus materias)")){
    localStorage.removeItem("mebank_stats_daily");
    alert("Estadísticas globales reiniciadas ✅");
    renderStatsGlobal();
  }
}
/* === 🔹 Sugerencias inteligentes de repaso === */
const sugerencias = [];

// Buscar materias con datos de progreso
Object.keys(PROG).forEach(slug => {
  const datos = PROG[slug];
  const mat = subjectsFromBank().find(s => s.slug === slug);
  if (!mat || !datos) return;

  // Calcular fecha del último intento
  const dias = datos._lastDate ? Math.floor((Date.now() - datos._lastDate) / (1000 * 60 * 60 * 24)) : null;

  // Calcular porcentaje de aciertos
  const tot = Object.keys(datos).filter(k => !k.startsWith("_")).length;
  const ok = Object.values(datos).filter(v => v.status === "ok").length;
  const pct = tot > 0 ? Math.round((ok / tot) * 100) : null;

  sugerencias.push({ slug, materia: mat.name, dias, pct });
});

// Filtrar y ordenar
const conDatos = sugerencias.filter(s => s.dias !== null || s.pct !== null);
conDatos.sort((a, b) => {
  if (a.pct !== b.pct) return a.pct - b.pct;
  if (a.dias !== b.dias) return b.dias - a.dias;
  return 0;
});

// Hasta 3 sugerencias
const topSug = conDatos.slice(0, 3);

let sugHTML = "";
if (topSug.length) {
  sugHTML = `
    <div class="card" style="margin-top:24px;">
      <h3 style="margin-bottom:10px;">💡 Sugerencias de repaso</h3>
      <ul style="list-style:none;padding:0;margin:0;">
        ${topSug.map(s => {
          const repaso = s.pct !== null && s.pct < 70
            ? `📚 Tu promedio más bajo es <b>${s.materia}</b> (${s.pct}% correctas).`
            : `💡 No practicás <b>${s.materia}</b> hace ${s.dias} días.`;

          return `
            <li style="margin:10px 0;">
              ${repaso}<br>
              <div style="margin-top:4px;display:flex;gap:6px;flex-wrap:wrap;">
                <button class="btn-small" onclick="startPractica('${s.slug}')">▶️ Practicar ahora</button>
                <button class="btn-small" style="background:#1e40af;border-color:#1e40af;" onclick="openMateria('${s.slug}')">🧩 Ver materia</button>
              </div>
            </li>`;
        }).join("")}
      </ul>
    </div>`;
}

app.innerHTML += sugHTML;
