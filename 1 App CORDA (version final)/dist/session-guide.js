// A single dated scenario for the pilot. User-created sessions are never modified.
function prepareRainExample(today){
  if(state.rainExample)return;
  // Con la semana de ejemplo, el aviso de lluvia solo aparece un día con sesiones (no en domingo).
  if(state.sessions.some(s=>s.demo)&&!state.sessions.some(s=>s.demo&&s.date===today))return;
  function demoSession(templateId,exampleId,defaults){
    const original=state.sessions.find(s=>s.demo&&s.date===today&&s.type===defaults.type&&!s.done)||state.sessions.find(s=>s.id===templateId&&s.date===today&&!s.done);
    if(original)return original;
    const added={...defaults,id:exampleId,date:today,day:(new Date(today+'T12:00:00').getDay()+6)%7,done:false};
    state.sessions.push(added);return added;
  }
  const morning=demoSession(1,-101,{title:'Consistencia y profundidad',type:'Tenis',duration:90,time:'07:00',place:'Cancha 3',goal:'Ganar consistencia desde el fondo',notes:'Peloteo cruzado con profundidad.'});
  const gym=demoSession(2,-102,{title:'Fuerza y estabilidad',type:'Físico',duration:60,time:'16:00',place:'Gimnasio',goal:'Preparación física',notes:'Trabajo de estabilidad con el preparador físico.'});
  morning.cancelled=true;
  if(gym.id===-102){
    gym.coach='Coach Alex (ejemplo)';
    gym.gear='Tenis de entrenamiento, tapete y botella de agua';
    gym.summary='Estabilidad del tronco e isometría';
  }
  state.rainExample={date:today,morningId:morning.id,gymId:gym.id};
}
function rainNotice(){
  const example=state.rainExample;
  if(!example)return '';
  const gym=state.sessions.find(s=>s.id===example.gymId);
  if(!gym)return '';
  const morning=state.sessions.find(s=>s.id===example.morningId);
  const when=example.date===localDay()?'Hoy':dateLabel(example.date,{day:'numeric',month:'long'});
  return `<article class="rain-note"><small>AVISO DE EJEMPLO · ${esc(when)}</small><h3>Cambio por lluvia</h3><p>Se cancela el entrenamiento de tenis de la mañana${morning?' de las '+esc(morning.time):''}. Solo habrá preparación física en el gimnasio.</p><b>${esc(gym.time)} · ${esc(gym.place)}</b><p>${esc(state.profile.academy)} · ${esc(gym.coach)}</p><button class="link" data-session="${gym.id}">Ver sesión de gimnasio ↗</button></article>`;
}
function sessionCoach(s){
  return s.coach||(s.demo||[1,2,3,4,-101,-102].includes(s.id)?'Coach Alex (ejemplo)':'Por confirmar');
}
function sessionSteps(s){
  if(s.guide)return s.guide.split(/\n/).map(t=>t.trim()).filter(Boolean);
  if(s.id===2||s.id===-102)return ['Prepara tu espacio y coloca el tapete en el gimnasio.','El coach muestra la posición de estabilidad para este bloque.','Completa el bloque indicado y comenta cómo te sentiste.'];
  if(s.id===1||s.id===-101)return ['Los jugadores se colocan en diagonal, detrás de la línea de fondo.','Pelotea cruzado buscando que la pelota bote con profundidad.','Recupera tu posición para preparar el siguiente golpe.'];
  return [s.summary||s.title,s.notes||s.goal].filter(Boolean);
}
// Recuadro del video de la explicación. Para ponerlo, guarda el archivo en
// assets/videos/ y escribe su ruta en el campo "video" de la sesión,
// por ejemplo video:'assets/videos/segundo-saque.mp4'.
function sessionVideo(s){
  if(s.video)return `<div class="guide-video"><video controls playsinline preload="metadata" src="${esc(s.video)}"></video></div>`;
  return '<div class="guide-video is-empty" role="img" aria-label="Video de la explicación, próximamente"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M10 8.5v7l6-3.5z"/></svg><span>Video de la explicación</span><small>Próximamente</small></div>';
}
function sessionGuide(s){
  const steps=sessionSteps(s);
  const gear=s.gear|| (s.type==='Físico'?'Tenis de entrenamiento y botella de agua':'Raqueta, tenis de cancha y botella de agua');
  return `<aside class="coach-pinned"><small>INDICACIÓN DEL COACH</small><h3>Qué llevar</h3><p>${esc(gear)}</p></aside>
  <section class="mini-guide" aria-label="Guía rápida de la actividad"><div class="row"><b>Explicación del ejercicio</b><button type="button" class="link" id="guide-toggle">Pausar</button></div>
  <div class="guide-frames">${steps.map((step,i)=>`<div class="guide-frame" ${i?'hidden':''}><small>PASO ${i+1} DE ${steps.length}</small><p>${esc(step)}</p></div>`).join('')}</div><div class="guide-controls"><button type="button" id="guide-prev" aria-label="Paso anterior">←</button><span>Guía en bucle</span><button type="button" id="guide-next" aria-label="Paso siguiente">→</button></div>${sessionVideo(s)}</section>`;
}
function startSessionGuide(dialog){
  const frames=Array.from(dialog.querySelectorAll('.guide-frame'));
  const toggle=dialog.querySelector('#guide-toggle');
  if(!frames.length||!toggle)return;
  let index=0,timer=null;
  function move(by){frames[index].hidden=true;index=(index+by+frames.length)%frames.length;frames[index].hidden=false}
  function pause(){clearInterval(timer);timer=null;toggle.textContent='Reproducir'}
  function play(){pause();timer=setInterval(()=>move(1),3700);toggle.textContent='Pausar'}
  toggle.onclick=()=>timer?pause():play();
  dialog.querySelector('#guide-next').onclick=()=>{pause();move(1)};
  dialog.querySelector('#guide-prev').onclick=()=>{pause();move(-1)};
  if(frames.length>1&&!matchMedia('(prefers-reduced-motion: reduce)').matches)play();else pause();
  dialog.addEventListener('close',pause,{once:true});
}

// ---------- Semana de ejemplo (lunes a sábado) ----------
// Mientras la academia no tenga su propio plan, el jugador y el coach ven esta semana de muestra,
// siempre en la semana actual y la siguiente. En cuanto el coach crea su primera sesión real, los ejemplos desaparecen.
// Ids 201-224: chicos a propósito, así nunca se suben a Supabase (ver isDemoItem en sync.js).
const DEMO_WEEK=[
  {day:0,time:'07:00',type:'Tenis',duration:90,place:'Cancha 3',title:'Consistencia desde el fondo',summary:'Peloteo cruzado con profundidad',goal:'Ganar consistencia desde el fondo',guide:'Calentamiento: minitenis 10 min.\nPeloteo cruzado de drive buscando que bote pasando la línea de saque.\nCambio a revés cruzado: 15 pelotas seguidas sin error.\nPuntos desde el fondo: solo cuentan si la pelota bota profundo.',notes:'Objetivo: 15 pelotas en juego con profundidad. Plan de ejemplo para revisar con tu coach.'},
  {day:0,time:'17:00',type:'Físico',duration:60,place:'Gimnasio',title:'Fuerza: sentadilla y press',summary:'Fuerza de piernas y tren superior',goal:'Preparación física',gear:'Tenis de entrenamiento y botella de agua',guide:'Movilidad de cadera y hombros 10 min.\nSentadilla goblet: 4 series de 8.\nPress de pecho con mancuernas: 3 series de 10.\nRemo con mancuerna: 3 series de 10 por lado.',notes:'Cargas definidas por el preparador físico.'},
  {day:1,time:'07:00',type:'Tenis',duration:90,place:'Cancha 2',title:'Saque y primera pelota',summary:'Segundo saque con efecto y ataque',goal:'Construir un segundo saque confiable',guide:'Rutina de saque: 20 primeros saques a la T.\nSegundo saque con efecto liftado: 7 de cada 10 dentro.\nSaque + primer golpe: ataca la pelota corta al lado abierto.',notes:'Cuenta tus segundos saques dentro y anótalo en la encuesta.'},
  {day:1,time:'17:00',type:'Físico',duration:45,place:'Pista',title:'Agilidad y desplazamientos con conos',summary:'Footwork y cambios de dirección',goal:'Preparación física',gear:'Tenis de entrenamiento y botella de agua',guide:'Escalera de coordinación: 6 patrones.\nDesplazamiento lateral entre conos: 6 × 20 s.\nReacción a la señal del coach: 8 salidas cortas.',notes:'Pasos cortos y rápidos, siempre de puntas.'},
  {day:2,time:'07:00',type:'Tenis',duration:75,place:'Cancha 1',title:'Red y voleas',summary:'Subir a la red y cerrar el punto',goal:'Ganar consistencia desde el fondo',guide:'Voleas de control con el coach: 5 min por lado.\nAproximación con pelota corta y volea.\nPuntos: quien sube a la red y gana el punto suma doble.',notes:'Plan de ejemplo para revisar con tu coach.'},
  {day:2,time:'17:00',type:'Físico',duration:40,place:'Pista',title:'Cardio por intervalos',summary:'Resistencia para partidos largos',goal:'Preparación física',gear:'Tenis de entrenamiento y botella de agua',guide:'Trote suave 8 min.\nIntervalos: 8 × (30 s rápido + 60 s suave).\nVuelta a la calma y estiramiento 8 min.',notes:'Mantén una intensidad que te deje hablar en las pausas.'},
  {day:3,time:'07:00',type:'Tenis',duration:90,place:'Cancha 3',title:'Devolución de saque',summary:'Restar profundo y al centro',goal:'Ganar consistencia desde el fondo',guide:'Restos de primer saque: bloquea y manda al centro.\nRestos de segundo saque: ataca al revés del rival.\nJuegos de resto: el sacador empieza 30-0.',notes:'Plan de ejemplo para revisar con tu coach.'},
  {day:3,time:'17:00',type:'Físico',duration:45,place:'Gimnasio',title:'Pliometría y saltos',summary:'Potencia explosiva de piernas',goal:'Preparación física',gear:'Tenis de entrenamiento y botella de agua',guide:'Activación: saltos a la cuerda 3 min.\nSaltos al cajón: 4 series de 5.\nSaltos laterales sobre la línea: 3 × 20 s.\nZancadas con salto: 3 series de 6 por pierna.',notes:'Calidad antes que cantidad: aterriza suave.'},
  {day:4,time:'07:00',type:'Tenis',duration:90,place:'Cancha 1',title:'Patrones de partido',summary:'Construir el punto con intención',goal:'Ganar consistencia desde el fondo',guide:'Patrón 1: cruzado, cruzado y paralelo.\nPatrón 2: saque abierto y golpe al lado contrario.\nPuntos condicionados con revisión del coach.',notes:'Elige un patrón y úsalo en el partido del sábado.'},
  {day:4,time:'17:00',type:'Físico',duration:45,place:'Gimnasio',title:'Core e isometría',summary:'Estabilidad del tronco',goal:'Preparación física',gear:'Tenis de entrenamiento, tapete y botella de agua',guide:'Plancha frontal: 4 × 40 s.\nPlancha lateral: 3 × 30 s por lado.\nPallof press con liga: 3 series de 10 por lado.',notes:'Respira y mantén la espalda neutra.'},
  {day:5,time:'09:00',type:'Tenis',duration:120,place:'Cancha central',title:'Partidos de práctica',summary:'Sets completos con marcador',goal:'Ganar consistencia desde el fondo',guide:'Calentamiento como en torneo: 15 min.\nDos sets con marcador real.\nAl terminar, anota qué funcionó y qué faltó.',notes:'Prueba el patrón que entrenaste el viernes.'},
  {day:5,time:'12:00',type:'Físico',duration:40,place:'Gimnasio',title:'Movilidad y recuperación',summary:'Estiramientos y descarga',goal:'Preparación física',gear:'Tapete y botella de agua',guide:'Rodillo de espuma en piernas y espalda 10 min.\nMovilidad de cadera, hombros y tobillos.\nEstiramientos suaves 15 min.',notes:'Sesión ligera para cerrar la semana.'}
];
function refreshDemoWeek(today){
  const monday=dateAfter(today,-((new Date(today+'T12:00:00').getDay()+6)%7));
  const real=state.sessions.some(s=>!(typeof s.id==='number'&&s.id<1e6));
  if(real)return; // la academia ya tiene su plan: no se mezclan ejemplos
  if(state.demoWeek===monday+'#2'&&state.sessions.some(s=>s.demo))return; // '#2' = versión de dos semanas
  // Semana actual y la siguiente: así el domingo también se ve lo que viene.
  const weeks=[monday,dateAfter(monday,7)];
  state.sessions.splice(0,state.sessions.length,...weeks.flatMap((start,w)=>DEMO_WEEK.map((session,i)=>({...session,id:201+w*DEMO_WEEK.length+i,date:dateAfter(start,session.day),coach:'Coach Alex (ejemplo)',demo:true,done:false}))));
  state.demoWeek=monday+'#2';
  delete state.rainExample;
}
