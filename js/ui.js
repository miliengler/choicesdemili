/* ========== HOME ========== */
function renderHome(){
  app.innerHTML = `
    <div style="text-align:center;animation:fadeIn .5s;display:flex;flex-direction:column;align-items:center;gap:10px;">
      <button class="btn-main" onclick="renderSubjects()">🧩 Choice por materia</button>
      <button class="btn-main" onclick="alert('📄 Próximamente')">📄 Exámenes anteriores</button>
      <button class="btn-main" style="background:#1e40af;border-color:#1e40af;" onclick="alert('🧠 Modo examen en desarrollo')">🧠 Modo Examen – Creá el tuyo</button>
      <button class="btn-main" style="background:#1e40af;border-color:#1e40af;" onclick="alert('📊 Estadísticas próximamente')">📊 Estadísticas generales</button>
      <button class="btn-main" onclick="alert('📔 Mis notas próximamente')">📔 Mis notas</button>
    </div>
  `;
}

/* ========== LISTA DE MATERIAS (ESTILO ORIGINAL SIN NUMERACIÓN) ========== */
function renderSubjects(){
  const subs = subjectsFromBank().sort((a, b) => 
    a.name.replace(/[^\p{L}\p{N} ]/gu, '').localeCompare(
      b.name.replace(/[^\p{L}\p{N} ]/gu, ''), 'es', {sensitivity:'base'}
    )
  );

  const list = subs.map((s) => `
    <li class='acc-item' style="list-style:none;margin:8px 0;">
      <div class='acc-header' 
           style="background:var(--card);border:1px solid var(--line);border-radius:10px;
                  padding:12px 16px;cursor:pointer;display:flex;justify-content:space-between;
                  align-items:center;box-shadow:0 2px 8px rgba(0,0,0,0.04);"
           onclick='toggleAcc("${s.slug}")'>
        <div style="font-weight:500;">${s.name}</div>
        <div id='count-${s.slug}' class='hidden' 
             style="font-size:13px;color:var(--muted);">
          ${(BANK.questions||[]).filter(q=>q.materia===s.slug).length} preguntas
        </div>
      </div>

      <div class='acc-content' id='acc-${s.slug}' 
           style='display:none;padding-left:12px;margin-top:8px'>
        <div class='acc-actions' style="display:flex;gap:8px;flex-wrap:wrap;">
          <label class='small'>Desde # 
            <input type='number' id='start-${s.slug}' min='1' value='1'>
          </label>
          <button class='btn-small' onclick='startPractica("${s.slug}")'>Práctica</button>
          <button class='btn-small' onclick='startRepaso("${s.slug}")'>Repaso</button>
          <button class='btn-small' onclick='renderHome()'>Inicio</button>
        </div>
      </div>
    </li>
  `).join("");

  app.innerHTML = `
    <div class='card'>
      <button class='btn-small' onclick='renderHome()'>⬅️ Volver</button>
      <ul class='accordion' style="padding:0;margin-top:10px;">${list}</ul>
    </div>`;
}

/* ---------- Alternar acordeón ---------- */
window.toggleAcc = (slug)=>{
  const el = document.getElementById(`acc-${slug}`);
  const cnt = document.getElementById(`count-${slug}`);
  const open = el.style.display === "block";

  // cerrar todas
  document.querySelectorAll(".acc-content").forEach(e => e.style.display = "none");
  document.querySelectorAll("[id^='count-']").forEach(c => c.classList.add("hidden"));

  // abrir solo la elegida
  if (!open) {
    el.style.display = "block";
    if (cnt) cnt.classList.remove("hidden");
  }
};
function getStart(slug,total){
  const el = document.getElementById(`start-${slug}`);
  let v = parseInt((el && el.value) ? el.value : "1", 10);
  if(isNaN(v) || v<1) v = 1;
  if(v>total) v = total;
  return v;
}

/* ========== MOTOR DE PREGUNTAS ========== */
let CURRENT = { list:[], i:0, materia:"" };

function startPractica(slug){
  const listAll = (BANK.questions||[]).filter(q=>q.materia===slug).sort((a,b)=>a.id.localeCompare(b.id));
  if(!listAll.length){
    app.innerHTML = `<div class="card">No hay preguntas en <b>${slug}</b>.</div>`;
    return;
  }
  const start = getStart(slug, listAll.length);
  CURRENT = { list:listAll.slice(start-1), i:0, materia:slug };
  PROG[slug] = PROG[slug] || {};
  PROG[slug]._lastIndex = 0;
  saveAll();
  renderPregunta();
}

function startRepaso(slug){
  const listAll = (BANK.questions||[]).filter(q=>q.materia===slug).sort((a,b)=>a.id.localeCompare(b.id));
  const prog = PROG[slug]||{};
  const list = listAll.filter(q=> prog[q.id]?.status==='bad');
  if(!list.length){
    app.innerHTML = `<div class='card'>No tenés incorrectas para repasar en <b>${slug}</b>.<br><br><button class='btn-main' onclick='renderSubjects()'>Volver</button></div>`;
    return;
  }
  CURRENT = { list, i:0, materia:slug };
  renderPregunta();
}

function renderPregunta(){
  const q = CURRENT.list[CURRENT.i];
  if(!q){
    app.innerHTML = `<div class='card'>Sin preguntas.<br><button class='btn-main' onclick='renderHome()'>Volver</button></div>`;
    return;
  }
  const prog = PROG[CURRENT.materia]||{};
  const ans = prog[q.id]?.chosen;

  const opts = q.opciones.map((t,i)=>{
    let cls='';
    if(ans!=null){
      if(i===q.correcta) cls='correct';
      else if(i===ans) cls='wrong';
    }
    return `<label class='option ${cls}' onclick='answer(${i})'><input type='radio' name='opt'> ${String.fromCharCode(97+i)}) ${t}</label>`;
  }).join('');

  const exp = (ans!=null)? `<div class='explain'>${q.explicacion||''}</div>` : '';

  app.innerHTML = `
    <div class="q-layout">
      <div>
        <div class='card'>
          <div><b>${CURRENT.materia.toUpperCase()}</b> · ${CURRENT.i+1}/${CURRENT.list.length}</div>
          <div style='margin-top:8px;font-size:18px'>${q.enunciado}</div>
          <div class='options'>${opts}</div>
          ${exp}
          <div class='nav-row'>
            <button class='btn-small' onclick='prevQ()' ${CURRENT.i===0?'disabled':''}>Anterior</button>
            <button class='btn-small' onclick='nextQ()' ${CURRENT.i===CURRENT.list.length-1?'disabled':''}>Siguiente</button>
            <button class='btn-small' onclick='renderSubjects()'>Inicio</button>
          </div>
        </div>
      </div>
      <div class="sidebar">
        <div style="font-weight:600;margin-bottom:8px">Índice</div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">
          ${CURRENT.list.map((_,ix)=>`
            <button class="btn-small" style="font-size:12px;padding:6px;border-radius:8px;${ix===CURRENT.i?'background:#e0ecff;border-color:#1e40af':''}" onclick="jump(${ix})">${ix+1}</button>
          `).join('')}
        </div>
      </div>
    </div>`;
}

window.jump = (ix)=>{ CURRENT.i = ix; updateLastIndex(); renderPregunta(); };
function prevQ(){ if(CURRENT.i>0){ CURRENT.i--; updateLastIndex(); renderPregunta(); } }
function nextQ(){ if(CURRENT.i<CURRENT.list.length-1){ CURRENT.i++; updateLastIndex(); renderPregunta(); } }

function updateLastIndex(){
  if(CURRENT.materia){
    PROG[CURRENT.materia] = PROG[CURRENT.materia] || {};
    PROG[CURRENT.materia]._lastIndex = Math.max(PROG[CURRENT.materia]._lastIndex ?? 0, CURRENT.i);
    saveAll();
  }
}

function answer(i){
  const q = CURRENT.list[CURRENT.i];
  const slug = CURRENT.materia || 'general';
  PROG[slug] = PROG[slug] || {};
  if(PROG[slug][q.id]) return; // no cambiar respuesta
  PROG[slug][q.id] = { chosen:i, status:(i===q.correcta?'ok':'bad') };
  PROG[slug]._lastIndex = CURRENT.i;
  saveAll();
  renderPregunta();
}
