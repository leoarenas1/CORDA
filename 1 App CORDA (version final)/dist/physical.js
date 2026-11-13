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
// ---------- Plan del año: fases de la preparación física ----------
// Estructura de la periodización que usa la ITF para tenis: preparación general, preparación específica,
// competencia y transición. La preparación se reparte en tres fases y el año tiene dos ciclos (doble periodización).
// Es un plan base: el coach lo ajusta mes por mes a su calendario de torneos.
// vol = cuánto trabajo (0 a 100) · int = qué tan fuerte (0 a 100). Con eso se dibujan las dos curvas del año.
const SEASON_PHASES={
  f1:{short:'Fase I',abbr:'I',name:'Iniciación de fuerza',what:'Aprender a moverte bien, con poco peso.',vol:55,int:25},
  f2:{short:'Fase II',abbr:'II',name:'Fuerza y resistencia',what:'Más fuerza y aguante para sostener los partidos.',vol:90,int:50},
  f3:{short:'Fase III',abbr:'III',name:'Potencia y velocidad',what:'Explosividad: saltos, arranques y velocidad.',vol:60,int:90},
  comp:{short:'Competencia',abbr:'Comp',name:'Mantener y competir',what:'Mantener tu mejor nivel y cuidarte en los torneos.',vol:30,int:72},
  trans:{short:'Transición',abbr:'Desc',name:'Descanso activo',what:'Descansar y recuperar para empezar de nuevo.',vol:8,int:6}
};
const SEASON_MONTHS=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DEFAULT_SEASON=['f1','f2','f3','comp','comp','comp','trans','f1','f2','f3','comp','trans'];
function seasonMonths(){
  const g=typeof groupData==='function'?groupData():null,m=g?.season?.months;
  return Array.isArray(m)&&m.length===12&&m.every(k=>SEASON_PHASES[k])?m:DEFAULT_SEASON;
}
// A quién se le dibuja la burbuja: el jugador, o el jugador a cargo del tutor. El coach ve solo «Hoy».
function seasonSubject(){
  if(role==='Jugador')return state.profile;
  if(role==='Tutor'){const id=actor()?.childId;return (typeof academyPlayers==='function'?academyPlayers(actor().academy):[]).find(m=>m.id===id)||null}
  return null;
}
// Curva suave (Catmull-Rom) que pasa por el centro de cada mes. Devuelve puntos [x 0-100, y 0-100] (y hacia abajo).
function seasonCurve(values){
  const pts=[[0,values[0]],...values.map((v,i)=>[(i+.5)/12*100,v]),[100,values[11]]],out=[];
  const y=v=>94-v*.8;
  for(let s=0;s<pts.length-1;s++){
    const p0=pts[Math.max(0,s-1)],p1=pts[s],p2=pts[s+1],p3=pts[Math.min(pts.length-1,s+2)];
    for(let t=0;t<(s===pts.length-2?1.0001:1);t+=.1){
      const t2=t*t,t3=t2*t,f=(a,b,c,d)=>.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3);
      out.push([f(p0[0],p1[0],p2[0],p3[0]),y(Math.max(0,Math.min(100,f(p0[1],p1[1],p2[1],p3[1]))))]);
    }
  }
  return out;
}
function seasonNowCard(sel){
  const months=seasonMonths(),today=new Date(localDay()+'T12:00:00'),mi=today.getMonth(),cur=months[mi];
  const key=sel||cur,ph=SEASON_PHASES[key],isNow=key===cur;
  let more='';
  if(isNow){
    for(let k=1;k<=12;k++){const idx=(mi+k)%12;if(months[idx]!==cur){
      const start=new Date(today.getFullYear()+(idx<mi?1:0),idx,1,12),days=Math.max(1,Math.round((start-today)/864e5));
      more=`<span class="season-next">Sigue ${esc(SEASON_PHASES[months[idx]].short)} · en ${days} ${days===1?'día':'días'}</span>`;break}}
  }else{
    const spans=[];months.forEach((k,i)=>{if(k!==key)return;const l=spans[spans.length-1];if(l&&l.to===i-1)l.to=i;else spans.push({from:i,to:i})});
    more=`<span class="season-next">${spans.map(s=>s.from===s.to?SEASON_MONTHS[s.from].slice(0,3):SEASON_MONTHS[s.from].slice(0,3)+'–'+SEASON_MONTHS[s.to].slice(0,3)).join(' · ')}</span>`;
  }
  return `<span class="season-swatch is-${key}"></span><div><small class="eyebrow">${isNow?(seasonSubject()?'Estás en':'Este mes'):'Fase'}</small><h3>${esc(ph.short)} · ${esc(ph.name)}</h3><p>${esc(ph.what)}</p>${more}</div>${isNow?'':'<button type="button" class="link" data-season-today>Volver a hoy</button>'}`;
}
function seasonTimeline(){
  const months=seasonMonths(),today=new Date(localDay()+'T12:00:00'),mi=today.getMonth();
  const dim=new Date(today.getFullYear(),mi+1,0).getDate(),xNow=(mi+(today.getDate()-1)/dim)/12*100;
  const vol=seasonCurve(months.map(k=>SEASON_PHASES[k].vol)),inten=seasonCurve(months.map(k=>SEASON_PHASES[k].int));
  const line=pts=>pts.map(([x,y],i)=>(i?'L':'M')+x.toFixed(2)+' '+y.toFixed(2)).join(' ');
  const area=pts=>line(pts)+` L 100 100 L 0 100 Z`;
  // Trayecto de la burbuja: sigue la curva de intensidad desde enero hasta hoy (avanza poco a poco).
  const upto=inten.filter(([x])=>x<=xNow);const ride=upto.length?upto:[inten[0]];
  const last=ride[ride.length-1],pos=[xNow,last[1]];
  const stops=ride.length>26?ride.filter((_,i)=>i%Math.ceil(ride.length/26)===0):ride;stops.push(pos);
  const kf=stops.map(([x,y],i)=>{const u=i/(stops.length-1||1),t=(1-Math.pow(1-u,2))*100;return `${t.toFixed(1)}%{left:${x.toFixed(2)}%;top:${y.toFixed(2)}%}`}).join('');
  const runs=[];months.forEach((k,i)=>{const l=runs[runs.length-1];if(l&&l.key===k)l.len++;else runs.push({key:k,len:1,from:i})});
  const bands=runs.map(r=>`<rect class="is-${r.key}" x="${(r.from/12*100).toFixed(2)}" width="${(r.len/12*100).toFixed(2)}" y="0" height="100"/>`).join('');
  const pills=runs.map(r=>`<button type="button" class="season-pill is-${r.key}" style="flex:${r.len}" data-season-phase="${r.key}" title="${esc(SEASON_PHASES[r.key].short+' · '+SEASON_PHASES[r.key].name)}"><b class="lg">${esc(r.len>1?SEASON_PHASES[r.key].short:SEASON_PHASES[r.key].short)}</b><b class="sm">${esc(SEASON_PHASES[r.key].abbr)}</b></button>`).join('');
  const names=SEASON_MONTHS.map((m,i)=>`<span class="${i===mi?'is-now':''}">${m.slice(0,3)}</span>`).join('');
  const subject=seasonSubject();
  const bubble=`<div class="season-bubble ${subject?'has-photo':'is-today'}" style="left:${pos[0].toFixed(2)}%;top:${pos[1].toFixed(2)}%">${subject?avatar(subject):'<span>Hoy</span>'}<i class="season-pulse"></i></div>`;
  return `<section class="card season-plan"><style>@keyframes season-ride{${kf}}</style>
    <div class="sectiontitle"><div><small class="eyebrow">Preparación física · ${today.getFullYear()}</small><h2>${subject?'Tu año, fase por fase':'El año, fase por fase'}</h2></div>${role==='Coach'?'<div class="season-tools"><button class="btn small" id="season-edit">Editar fases</button></div>':''}</div>
    <div class="season-pills" role="group" aria-label="Fases del año">${pills}</div>
    <div class="season-chart" role="img" aria-label="Volumen e intensidad del entrenamiento físico durante el año. Ahora: ${esc(SEASON_PHASES[months[mi]].short+', '+SEASON_PHASES[months[mi]].name)}">
      <svg class="season-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <g class="season-bands">${bands}</g>
        <g class="season-grid">${Array.from({length:11},(_,i)=>`<line x1="${(i+1)/12*100}" x2="${(i+1)/12*100}" y1="0" y2="100"/>`).join('')}</g>
        <g class="season-curves"><path class="season-area" d="${area(vol)}"/><path class="season-vol" d="${line(vol)}"/><path class="season-int" d="${line(inten)}"/></g>
        <line class="season-today" x1="${xNow.toFixed(2)}" x2="${xNow.toFixed(2)}" y1="0" y2="100"/>
      </svg>
      ${bubble}
    </div>
    <div class="season-months">${names}</div>
    <div class="season-key-row"><span><i class="k-int"></i>Intensidad</span><span><i class="k-vol"></i>Volumen</span><small>Toca una fase para verla</small></div>
    <div class="season-now" id="season-now">${seasonNowCard()}</div></section>`;
}
document.addEventListener('click',event=>{
  const pick=event.target.closest?.('[data-season-phase]'),back=event.target.closest?.('[data-season-today]');
  if(!pick&&!back)return;
  const box=document.getElementById('season-now');if(!box)return;
  box.innerHTML=seasonNowCard(pick?pick.dataset.seasonPhase:'');
  document.querySelectorAll('.season-pill').forEach(b=>b.classList.toggle('is-picked',!!pick&&b===pick));
});
function openSeasonEdit(){
  if(role!=='Coach')return;
  const months=seasonMonths();
  modal('Fases del año',`<p class="full hint">Elige qué fase toca cada mes. Se actualiza para todos los jugadores y tutores de la academia.</p>`+SEASON_MONTHS.map((m,i)=>`<label>${m}<select name="m${i}">${Object.entries(SEASON_PHASES).map(([k,v])=>`<option value="${k}" ${months[i]===k?'selected':''}>${esc(v.short+' · '+v.name)}</option>`).join('')}</select></label>`).join('')+'<p class="full"><button type="button" class="link" id="season-reset">Volver al plan base</button></p>',d=>{
    const group=groupData(),old=group.season;
    group.season={months:SEASON_MONTHS.map((_,i)=>d['m'+i])};
    if(!save()){group.season=old;return false}
  },'Guardar fases');
  const reset=$('#season-reset');
  if(reset)reset.onclick=()=>{SEASON_MONTHS.forEach((_,i)=>{const s=document.querySelector('[name="m'+i+'"]');if(s)s.value=DEFAULT_SEASON[i]})};
}
function seasonExercises(){
  const real=state.exercises||[];
  const groups=EXERCISE_TYPES.concat('Otros').map(type=>[type,real.filter(e=>(EXERCISE_TYPES.includes(e.category)?e.category:'Otros')===type)]).filter(([,items])=>items.length);
  const exercises=real.length?`<section class="card season-exercises"><div class="sectiontitle"><div><small class="eyebrow">Ejercicios de la temporada</small><h2>Ejercicios asignados</h2></div>${role==='Coach'?'<button class="btn small" id="exercise-add">+ Añadir ejercicio</button>':''}</div>
    <div class="exercise-groups">${groups.map(([type,items])=>`<div class="exercise-group"><span class="badge clay">${esc(type)}</span>${items.map(e=>exerciseRow(e,false)).join('')}</div>`).join('')}</div></section>`
    :(role==='Coach'?'<p class="season-add"><button class="link" id="exercise-add">+ Añadir un ejercicio de la temporada</button></p>':'');
  return seasonTimeline()+exercises;
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
  if(event.target.closest?.('#season-edit')){openSeasonEdit();return}
  const edit=event.target.closest?.('[data-exercise-edit]');
  if(edit)openExerciseForm(edit.dataset.exerciseEdit);
});
