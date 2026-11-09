// Pestaña Físico: sesiones de físico, ejercicios de la temporada y biblioteca de video de físico.
// Los ejercicios los define el coach o preparador físico (state.exercises, item "exercise" en Supabase).
// Mientras no haya ninguno, se muestran ejercicios de ejemplo (no se guardan ni se suben).
const EXERCISE_TYPES=['Fuerza','Pliometría','Agilidad','Cardio','Core','Movilidad','Prevención de lesiones'];
const DEMO_EXERCISES=[
  {category:'Fuerza',title:'Sentadilla goblet',sets:'4 × 8',notes:'Espalda neutra; baja hasta que la cadera pase la rodilla.'},
  {category:'Fuerza',title:'Peso muerto rumano con mancuernas',sets:'3 × 10',notes:'Cadera atrás, rodillas apenas flexionadas.'},
  {category:'Fuerza',title:'Remo con mancuerna',sets:'3 × 10 por lado',notes:'Codo pegado al cuerpo, sin girar el tronco.'},
  {category:'Pliometría',title:'Saltos al cajón',sets:'4 × 5',notes:'Aterriza suave y baja caminando.'},
  {category:'Pliometría',title:'Saltos laterales sobre la línea',sets:'3 × 20 s',notes:'Rápido y con poco contacto con el piso.'},
  {category:'Agilidad',title:'Escalera de coordinación',sets:'6 patrones × 2',notes:'Pasos cortos, siempre de puntas.'},
  {category:'Agilidad',title:'Desplazamiento lateral entre conos',sets:'6 × 20 s',notes:'Como en la línea de fondo: split step y empuje.'},
  {category:'Cardio',title:'Intervalos 30/60',sets:'8 rondas',notes:'30 s rápido + 60 s suave.'},
  {category:'Core',title:'Plancha frontal',sets:'4 × 40 s',notes:'Glúteos apretados, sin hundir la cadera.'},
  {category:'Core',title:'Pallof press con liga',sets:'3 × 10 por lado',notes:'Resiste el giro; el tronco no se mueve.'},
  {category:'Movilidad',title:'Movilidad de cadera 90/90',sets:'2 × 8 por lado',notes:'Lento y controlado.'},
  {category:'Prevención de lesiones',title:'Rotación externa de hombro con liga',sets:'3 × 15',notes:'Cuida el hombro del saque.'}
];

// Sesiones de físico de esta semana en adelante, en orden.
function physicalSessions(){
  const today=localDay(),monday=dateAfter(today,-((new Date(today+'T12:00:00').getDay()+6)%7));
  return state.sessions.filter(s=>s.type==='Físico'&&String(s.date)>=monday).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
}
function exerciseRow(e,demo){
  const link=e.video?`<a class="link" href="${esc(e.video)}" target="_blank" rel="noopener noreferrer">Ver video ↗</a>`:'';
  const actions=demo?'':role==='Coach'?`<button type="button" class="link" data-exercise-edit="${e.id}">Editar</button>`
    :`<button class="check ${e.done?'done':''}" data-exercise="${e.id}" aria-label="${e.done?'Desmarcar':'Completar'} ${esc(e.title)}">${e.done?'✓':''}</button>`;
  return `<div class="exercise"><div><h3>${esc(e.title)}</h3><p class="muted">${esc(e.sets||'')}${e.sets&&e.notes?' · ':''}${esc(e.notes||'')}</p>${link}</div>${actions}</div>`;
}
function seasonExercises(){
  const real=state.exercises||[],demo=!real.length,list=demo?DEMO_EXERCISES:real;
  const groups=EXERCISE_TYPES.concat('Otros').map(type=>[type,list.filter(e=>(EXERCISE_TYPES.includes(e.category)?e.category:'Otros')===type)]).filter(([,items])=>items.length);
  return `<section class="card season-exercises"><div class="sectiontitle"><div><small class="eyebrow">Plan de la temporada${demo?' · Ejemplo':''}</small><h2>Ejercicios de la temporada</h2></div>${role==='Coach'?'<button class="btn small" id="exercise-add">+ Añadir ejercicio</button>':''}</div>
    ${demo?`<p class="hint">${role==='Coach'?'Así se verán los ejercicios que asignes. Desaparecen en cuanto añades el primero.':'Ejemplo de cómo se verán los ejercicios que tu coach asigne para la temporada.'}</p>`:''}
    <div class="exercise-groups">${groups.map(([type,items])=>`<div class="exercise-group"><span class="badge clay">${esc(type)}</span>${items.map(e=>exerciseRow(e,demo)).join('')}</div>`).join('')}</div></section>`;
}
function openExerciseForm(id){
  if(role!=='Coach')return;
  const existing=id?state.exercises.find(e=>String(e.id)===String(id)):null,e=existing||{};
  modal(existing?'Editar ejercicio':'Añadir ejercicio',
    field('Ejercicio','title',e.title||'')+
    `<label>Tipo<select name="category">${EXERCISE_TYPES.map(t=>`<option ${t===e.category?'selected':''}>${t}</option>`).join('')}</select></label>`+
    field('Series y repeticiones','sets',e.sets||'','text',false)+
    `<label class="full">Indicaciones del preparador<textarea name="notes" maxlength="500" required>${esc(e.notes||'')}</textarea></label>`+
    field('Video de referencia (opcional)','video',e.video||'','url',false)+
    (existing?'<p class="full"><button type="button" class="link danger" id="exercise-remove">Quitar este ejercicio</button></p>':''),
    d=>{
      if(d.video){try{if(new URL(d.video).protocol!=='https:')throw Error()}catch{toast('El video debe ser un enlace HTTPS.');return false}}
      const data={title:d.title.trim(),category:d.category,sets:d.sets.trim(),notes:d.notes.trim(),video:d.video.trim()};
      if(!data.title){toast('Escribe el nombre del ejercicio.');return false}
      if(existing)Object.assign(existing,data);else state.exercises.push({...data,id:Date.now(),done:false});
    },existing?'Guardar cambios':'Añadir ejercicio');
  const remove=$('#exercise-remove');
  if(remove)remove.onclick=()=>{
    if(!remove.dataset.sure){remove.dataset.sure='1';remove.textContent='¿Seguro? Toca otra vez para quitarlo';return}
    state.exercises.splice(state.exercises.indexOf(existing),1);
    save();$('#modal').close();render();toast('Ejercicio quitado.');
  };
}
document.addEventListener('click',event=>{
  if(event.target.closest?.('#exercise-add')){openExerciseForm();return}
  const edit=event.target.closest?.('[data-exercise-edit]');
  if(edit)openExerciseForm(edit.dataset.exerciseEdit);
});
