// A single dated scenario for the pilot. User-created sessions are never modified.
function prepareRainExample(today){
  if(state.rainExample)return;
  function demoSession(templateId,exampleId,defaults){
    const original=state.sessions.find(s=>s.id===templateId&&s.date===today&&!s.done);
    if(original)return original;
    const added={...defaults,id:exampleId,date:today,day:(new Date(today+'T12:00:00').getDay()+6)%7,done:false};
    state.sessions.push(added);return added;
  }
  const morning=demoSession(1,-101,{title:'Consistencia y profundidad',type:'Tenis',duration:90,time:'07:00',place:'Cancha 3',goal:'Ganar consistencia desde el fondo',notes:'Peloteo cruzado con profundidad.'});
  const gym=demoSession(2,-102,{title:'Fuerza y estabilidad',type:'Físico',duration:60,time:'16:00',place:'Gimnasio',goal:'Preparación física',notes:'Trabajo de estabilidad con el preparador físico.'});
  morning.cancelled=true;
  gym.coach='Coach Alex (ejemplo)';
  gym.gear='Tenis de entrenamiento, tapete y botella de agua';
  gym.summary='Estabilidad del tronco e isometría';
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
  return s.coach||([1,2,3,4,-101,-102].includes(s.id)?'Coach Alex (ejemplo)':'Por confirmar');
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
