/* ==========================================================
   🧬 Procesador de Pregunta (Con "Embudo" a Otras)
   ========================================================== */
function processQuestion(q, type, examMeta) {
    q.id = normalizeId(q.id);

    // 1. Normalizar Materia (Array o String)
    if (Array.isArray(q.materia)) {
        q.materia = q.materia.map(m => normalize(m));
    } else {
        // Normalizamos y si no existe en la lista, va a "otras"
        let mat = normalize(q.materia || "otras");
        if (!BANK.subjects.some(s => s.slug === mat)) mat = "otras";
        q.materia = mat;
    }

    // 2. Normalizar Submateria (EL EMBUDO MÁGICO 🌪️)
    
    // Tomamos la materia principal para buscar la lista de subtemas válida
    const mainMateria = Array.isArray(q.materia) ? q.materia[0] : q.materia;
    const listaOficial = SUBTEMAS[mainMateria] || [];
    
    // Obtenemos el texto que viene en el JSON (si es array tomamos el primero)
    let subRaw = Array.isArray(q.submateria) ? q.submateria[0] : q.submateria;
    
    // Si viene vacío o null, forzamos texto vacío para que caiga en el else
    if (!subRaw) subRaw = "";

    // ⚠️ AQUÍ ESTÁ LA MAGIA:
    // Si el subtema del JSON está EXACTAMENTE en la lista oficial -> Lo dejamos.
    // Si NO está (ej: dice "Arritmias" y la lista quiere "Trastornos del ritmo") -> Lo mandamos al "Otras".
    if (listaOficial.includes(subRaw)) {
        q.submateria = subRaw;
    } else {
        // Agarramos el último de la lista (que siempre es "Otras preguntas de...")
        // Si la lista está vacía, ponemos "General"
        q.submateria = listaOficial.length > 0 
            ? listaOficial[listaOficial.length - 1] 
            : "General";
    }

    // 3. Opciones y Correcta
    q.opciones = getOpcionesArray(q);
    q.correcta = getCorrectIndex(q);

    // 4. Metadatos del Examen
    q.tipo = type;
    if (type === "examen" && examMeta) {
        q.examen = examMeta.id;
        q.anio = examMeta.anio;
    } else {
        q.examen = null;
    }
}
