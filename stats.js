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
