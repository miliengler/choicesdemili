/* ---------- Persistencia ---------- */
const LS_BANK="mebank_bank_v6_2", LS_PROGRESS="mebank_prog_v6_2";

let BANK = JSON.parse(localStorage.getItem(LS_BANK)||"null") || {
  subjects: [
    {slug:"pediatria", name:"🧸 Pediatría"},
    {slug:"obstetricia", name:"🤰 Obstetricia"},
    {slug:"infectologia", name:"🦠 Infectología"}
  ],
  questions:[
    // 👇 ejemplos; después importaremos miles por JSON
    {id:"PE-001",materia:"pediatria",subtema:"Bronquiolitis",
      enunciado:"Lactante con bronquiolitis leve. Conducta inicial:",
      opciones:["Broncodilatador","Corticoides","Oxígeno según SatO2","Antibióticos"],
      correcta:2,explicacion:"Soporte: O2 si SatO2 baja; no corticoides de rutina."},

    {id:"OB-001",materia:"obstetricia",subtema:"Controles prenatales",
      enunciado:"Gestante 12 semanas: ¿qué NO es del primer control?",
      opciones:["Grupo y factor Rh","Glucemia","VDRL","Urocultivo a las 28 semanas"],
      correcta:3,explicacion:"El urocultivo de 28s no corresponde al primer control."}
  ]
};

const PROG = JSON.parse(localStorage.getItem(LS_PROGRESS)||"{}"); // {materia:{qid:{chosen,status}, _lastIndex:number}}

function saveAll(){
  localStorage.setItem(LS_BANK, JSON.stringify(BANK));
  localStorage.setItem(LS_PROGRESS, JSON.stringify(PROG));
}

/* ---------- DOM raíz de la app ---------- */
const app = document.getElementById("app");

/* ---------- Utilidades ---------- */
function subjectsFromBank(){
  const known = new Map((BANK.subjects||[]).map(s=>[s.slug,s]));
  (BANK.questions||[]).forEach(q=>{
    if(q && q.materia && !known.has(q.materia)){
      known.set(q.materia,{slug:q.materia,name:q.materia[0].toUpperCase()+q.materia.slice(1)});
    }
  });
  return Array.from(known.values()).sort((a,b)=>a.name.localeCompare(b.name));
}
