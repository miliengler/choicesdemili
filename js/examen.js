/* ==========================================================
   🧠 MODO EXAMEN – CREÁ EL TUYO
   Con cronómetro opcional (timer.js)
   ========================================================== */

/* ---------- Render del configurador ---------- */
function renderExamenSetup(){
  const subs = subjectsFromBank().sort((a,b)=>
    a.name.replace(/[^\p{L}\p{N} ]/gu,'').localeCompare(
      b.name.replace(/[^\p{L}\p{N} ]/gu,''),'es',{sensitivity:'base'}
    )
  );

  const counts = subs.map(s=>{
    const total = (BANK.questions||[]).filter(q=>q.materia===s.slug).length;
    return {...s,total};
  });
  const totalAll = counts.reduce((a,b)=>a+b.total,0);

  const checks = counts.map(s=>`
    <label class="chk-mat" style="display:block;margin:4px 0;">
      <input type="checkbox" class="mat-check" value="${s.slug}" data-count="${s.total}" ${s.total?'checked':''}>
      ${s.name} <span style="color:var(--muted)">(${s.total})</span>
    </label>`).join("");

  app.innerHTML = `
    <div class="card" style="max-width:700px;margin:auto;">
      <h2>🧠 Modo Examen – Creá el tuyo</h2>
      <p>Tenés <b>${totalAll}</b> preguntas disponibles en total.</p>

      <div id="matList">${checks || "<p class='small'>No hay materias cargadas.</p>"}</div>

      <div style="margin-top:10px;">
        <label for="numPreg" class="small">Número de preguntas:</label>
        <input id="numPreg" type="number" min="1" value="${totalAll}" max="${totalAll}" style="width:90px;margin-left:6px;">
      </div>

      <label style="display:flex;align-items:center;gap:8px;margin-top:14px;">
        <input type="checkbox" id="chkTimer">
        <span>⏱️ Activar cronómetro</span>
      </label>

      <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
        <button class="btn-main" onclick="startExamen()">🎯 Comenzar examen</button>
        <button class="btn-small" onclick="renderHome()">⬅️ Volver al inicio</button>
      </div>
    </div>
  `;

  document.querySelectorAll('.mat-check').forEach(chk=>{
    chk.addEventListener('change', updateExamenCount);
  });
}

/* ---------- Actualiza contador de preguntas ---------- */
function updateExamenCount(){
  const chks = Array.from(document.querySelectorAll('.mat-check'));
  const total = chks.filter(c=>c.checked)
                    .reduce((a,c)=>a+parseInt(c.dataset.count||0),0);
  const numInput=document.getElementById('numPreg');
  if(numInput && !numInput._manual){
    numInput.value=Math.max(1,total||1);
    numInput.max=Math.max(1,total||1);
  }
}
document.addEventListener('input',e=>{
  if(e.target && e.target.id==='numPreg') e.target._manual=true;
});

/* ---------- Inicia el examen ---------- */
function startExamen(){
  const chks = Array.from(document.querySelectorAll('.mat-check'));
  const selected = chks.filter(c=>c.checked).map(c=>c.value);
  const numEl = document.getElementById('numPreg');
  const num = Math.max(1, parseInt(numEl?.value||'1',10));
  const useTimer = document.getElementById('chkTimer')?.checked; // ✅ NUEVO

  let pool = (BANK.questions||[]).filter(q=> selected.includes(q.materia));
  if(pool.length===0){
    alert("Seleccioná al menos una materia con preguntas."); 
    return;
  }
  pool.sort(()=>Math.random()-0.5);
  const chosen = pool.slice(0, Math.min(num, pool.length));

  CURRENT = { list: chosen, i: 0, materia: 'general', modo: 'examen', session: {} };

  renderExamenPregunta();

  // ✅ Si se activó el cronómetro
  if(useTimer) initTimer("app");
}

/* ---------- Render de una pregunta en modo examen ---------- */
function renderExamenPregunta(){
  const q = CURRENT.list[CURRENT.i];
  if(!q){
    renderExamenFin();
    return;
  }

  const opts = q.opciones.map((t,i)=>`
    <label class="option" onclick='answerExamen(${i})'>
      <input type='radio' name='opt'> ${String.fromCharCode(97+i)}) ${t}
    </label>`).join('');

  app.innerHTML = `
    <div class="card fade">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <b>Pregunta ${CURRENT.i+1}/${CURRENT.list.length}</b>
        <span class="small">${q.materia?.toUpperCase()||""}</span>
      </div>
      <div style="margin-top:8px;font-size:18px">${q.enunciado}</div>
      <div class="options">${opts}</div>
      <div class="nav-row">
        <button class="btn-small" onclick="prevExamen()" ${CURRENT.i===0?"disabled":""}>⬅️ Anterior</button>
        <button class="btn-small" onclick="nextExamen()" ${CURRENT.i===CURRENT.list.length-1?"disabled":""}>Siguiente ➡️</button>
        <button class="btn-small" style="background:#64748b;border-color:#64748b" onclick="stopTimer(); if(confirm('¿Salir del examen?')) renderHome()">🏠 Salir</button>
      </div>
    </div>
  `;
}

/* ---------- Registro de respuestas ---------- */
function answerExamen(i){
  const q = CURRENT.list[CURRENT.i];
  const slug = "general";
  PROG[slug]=PROG[slug]||{};
  if(PROG[slug][q.id]) return;
  PROG[slug][q.id]={chosen:i,status:(i===q.correcta?'ok':'bad')};
  saveAll();
  nextExamen();
}

/* ---------- Navegación ---------- */
function nextExamen(){
  if(CURRENT.i < CURRENT.list.length-1){
    CURRENT.i++;
    renderExamenPregunta();
  } else {
    renderExamenFin();
  }
}
function prevExamen(){
  if(CURRENT.i>0){
    CURRENT.i--;
    renderExamenPregunta();
  }
}

/* ---------- Fin del examen ---------- */
function renderExamenFin(){
  stopTimer(); // ✅ Detiene el cronómetro al terminar
  const prog = PROG.general||{};
  const answered = CURRENT.list.filter(q=>prog[q.id]);
  const ok = answered.filter(q=>prog[q.id]?.status==='ok').length;
  const bad = answered.filter(q=>prog[q.id]?.status==='bad').length;
  const porc = answered.length ? Math.round((ok/answered.length)*100) : 0;

  app.innerHTML = `
    <div class="card fade" style="text-align:center;">
      <h2>🎯 Examen finalizado</h2>
      <p>Respondiste ${answered.length} de ${CURRENT.list.length} preguntas.</p>
      <p style="color:#16a34a;">✔ Correctas: ${ok}</p>
      <p style="color:#ef4444;">✖ Incorrectas: ${bad}</p>
      <p><b>Precisión:</b> ${porc}%</p>
      <div style="margin-top:16px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        <button class="btn-main" onclick="renderExamenSetup()">🧠 Nuevo examen</button>
        <button class="btn-small" onclick="renderHome()">🏠 Volver al inicio</button>
      </div>
    </div>
  `;
}
