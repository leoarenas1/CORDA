const pathways = [
  ['Club social', 'Juego por gusto y disfruto los partidos del club.'],
  ['Circuito competitivo', 'Entreno para ligas, torneos y partidos oficiales.'],
  ['Junior de proyección', 'Compito en categorías juveniles y preparo mi salto al siguiente nivel.'],
  ['Ruta profesional', 'Mi calendario gira alrededor del circuito profesional.']
];
const identities = [
  ['Atacante de fondo','Busco dominar el punto con mi derecha o mi revés.'],
  ['Contragolpeador','Defiendo, recupero terreno y aprovecho la oportunidad.'],
  ['Constructor de puntos','Cambio alturas y direcciones hasta abrir espacio.'],
  ['Jugador de red','Subo a la red para cerrar con una volea.'],
  ['Todoterreno','Adapto mi plan a la superficie y al rival.'],
  ['Por descubrir','Quiero definir mi estilo con mi coach.']
];
function localDay(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-');
}
function dateAfter(date, days) {
  const result = new Date(date+'T12:00:00'); result.setDate(result.getDate()+days); return localDay(result);
}
function dateLabel(date, options) {
  return new Date(date+'T12:00:00').toLocaleDateString(({es:'es-MX',en:'en-US',fr:'fr-FR'})[coverLanguage],options);
}
function birthInput(value) {
  return '<label>Fecha de nacimiento<input type="date" name="birthDate" required autocomplete="bday" min="1900-01-01" max="'+localDay()+'" value="'+esc(value||'')+'"></label>';
}
function utrInput(value) {
  return '<label class="utr-field">UTR individual <span class="optional">(opcional)</span><input name="utr" inputmode="decimal" type="number" min="1" max="16.5" step="0.01" value="'+esc(value??'')+'" placeholder="Ej. 3.00" aria-describedby="utr-tip"></label><small id="utr-tip">De 1.00 a 16.50. Puedes dejarlo en blanco.</small>';
}
function activeOptions(options, value) {
  const names=options.map(([name])=>name);
  return value && !names.includes(value) ? [value,...names] : names;
}
function initAgenda() {
  const today=localDay();
  state.weekStart ??= dateAfter(today,-((new Date(today+'T12:00:00').getDay()+6)%7));
  state.chat ??= [];
  state.reviews ??= {};
  state.sessions.forEach(s=>{
    s.date ??= dateAfter(state.weekStart,s.day);
    if(s.id===2 && s.title==='Fuerza y estabilidad') {
      s.summary ??= 'Estabilidad del tronco e isometría';
    }
  });
  prepareRainExample(today);
  state.exampleTournament ??= {name:'Copa de preparación',place:'Sede de muestra',date:dateAfter(today,21),start:today};

}
function sessionsFor(date) {
  return state.sessions.filter(s=>s.date===date).sort((a,b)=>a.time.localeCompare(b.time));
}
function sessionTimes(session){
  const start=new Date(session.date+'T'+session.time).getTime();
  return {start,end:start+Number(session.duration)*60000};
}
function sessionStatus(session,now=Date.now()){
  if(session.cancelled)return session.cancelReason||'Cancelada por lluvia';
  if(session.done)return 'Completada';
  const {start,end}=sessionTimes(session);
  if(now>=end)return 'Terminada';
  return now>=start?'En curso':'Programada';
}
function sessionTitle(session){
  const closed=session.cancelled||session.done||Date.now()>=sessionTimes(session).end;
  return closed?'<s class="past-session">'+esc(session.title)+'</s>':esc(session.title);
}
// Foto de fondo de la tarjeta de la próxima sesión, según lo que se entrena.
// Primero busca en el título; si no encuentra nada, en el resumen y las notas.
// Las categorías más específicas van antes que "fuerza", que es la general.
const SESSION_PHOTOS=[
  ['sesiones/pliometria.jpg',/pliom|pilom|salto|multisalto|box jump|explosiv/],
  ['sesiones/isometria.jpg',/isom[eé]tr|estabilidad|plancha|core|tronco|abdom/],
  ['sesiones/movilidad.jpg',/movilidad|estira|flexibilidad|elasticidad|yoga|recuperaci|calentamiento/],
  ['sesiones/agilidad.jpg',/agilidad|escalera|velocidad|coordinaci|desplazamiento|footwork|reacci|conos/],
  ['sesiones/cardio.jpg',/cardio|resistencia|carrera|correr|sprint|aer[oó]bic|intervalo/],
  ['sesiones/fuerza.jpg',/fuerza|pesa|mancuerna|sentadilla|press|potencia|gimnasio|gym/]
];
function sessionPhoto(session){
  if(session.type!=='Físico')return 'tennis-close-poster.jpg';
  const sources=[session.title,[session.summary,session.guide,session.notes].filter(Boolean).join(' ')];
  for(const text of sources){
    const words=String(text||'').toLowerCase();
    const hit=SESSION_PHOTOS.find(([,pattern])=>pattern.test(words));
    if(hit)return hit[0];
  }
  return 'sesiones/fuerza.jpg';
}
let clockTimer;
function scheduleAgendaClock(){
  clearTimeout(clockTimer);
  if(entry!=='app'||!['home','calendar','training','gym'].includes(page))return;
  const now=Date.now();
  const transitions=state.sessions.filter(s=>!s.done&&!s.cancelled).flatMap(s=>Object.values(sessionTimes(s))).filter(time=>time>now);
  if(!transitions.length)return;
  clockTimer=setTimeout(()=>{
    if(entry==='app'&&['home','calendar','training','gym'].includes(page))render();
  },Math.min(Math.min(...transitions)-now+20,2147483600));
}
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&typeof render==='function'&&typeof state!=='undefined'&&entry==='app'&&['home','calendar','training','gym'].includes(page))render();
});
function sessionSummary(s) {
  return '<article class="agenda-event"><div class="event-clock"><b>'+esc(s.time)+'</b><small>'+esc(s.duration)+' min</small></div><div><span class="badge '+(s.type==='Físico'?'clay':'')+'">'+esc(s.type)+'</span><h3>'+sessionTitle(s)+'</h3><small>'+esc(sessionStatus(s))+'</small><p>'+esc(state.profile.academy)+' · '+esc(s.place)+' · '+esc(sessionCoach(s))+'</p><p><strong>'+(s.type==='Físico'?'Enfoque físico':'Drills')+'</strong> · '+esc(s.summary||s.notes.split('. ')[0])+'</p><button class="link" data-session="'+s.id+'">'+(s.done?'Ver resumen':'Ver indicaciones')+' ↗</button></div></article>';
}
function calendarStrip(date) {
  const monday=dateAfter(date,-((new Date(date+'T12:00:00').getDay()+6)%7));
  return '<div class="days-strip">'+Array.from({length:7},(_,i)=>{
    const d=dateAfter(monday,i);return '<button class="'+(d===date?'chosen':'')+'" data-agenda-date="'+d+'" aria-pressed="'+(d===date)+'"><small>'+dateLabel(d,{weekday:'short'})+'</small><b>'+Number(d.slice(8))+'</b><i class="'+(sessionsFor(d).length?'booked':'')+'"></i></button>';
  }).join('')+'</div>';
}
function tournamentCard() {
  const today=localDay();
  const listed=state.competition.filter(c=>c.date>=today).sort((a,b)=>a.date.localeCompare(b.date));
  const demo=!state.competition.length;
  const c=listed[0]||(demo&&state.exampleTournament.date>=today?state.exampleTournament:null);
  if(!c)return '<section class="card"><h2>Próximo torneo</h2><p class="hint">Elige tu siguiente competencia para empezar la cuenta regresiva.</p><button class="btn small" id="competition">Añadir torneo</button></section>';
  const days=Math.round((Date.parse(c.date)-Date.parse(today))/86400000);
  const start=c.start||today;
  const phases=[['Preparación',start],['Afinar el juego',dateAfter(c.date,-7)<start?start:dateAfter(c.date,-7)],['Últimos ajustes',dateAfter(c.date,-2)<start?start:dateAfter(c.date,-2)],['Competencia',c.date]];
  const current=phases.reduce((result,[,date],i)=>date<=today?i:result,0);
  return '<section class="card tournament"><div class="row"><small class="eyebrow">Próximo torneo'+(demo?' · Ejemplo':'')+'</small><button id="competition" class="link">Añadir torneo +</button></div><h2>'+esc(c.name)+'</h2><p>'+esc(c.place)+' · '+dateLabel(c.date,{day:'numeric',month:'long'})+'</p><div class="countdown">'+(days?days+' <small>días para competir</small>':'Hoy compites')+'</div><ol class="tourney-road">'+phases.map(([name,date],i)=>'<li class="'+(i<=current?'reached ':'')+(i===current?'current':'')+'"><i></i><b>'+name+'</b><small>'+dateLabel(date,{day:'numeric',month:'short'})+'</small></li>').join('')+'</ol></section>';
}
let agendaDate=localDay();
function nearestSession(now = new Date()){
  return state.sessions.filter(s=>{
    const start=new Date(s.date+'T'+s.time);
    return !s.cancelled && !s.done && start.getTime()+Number(s.duration)*60000>now.getTime();
  }).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))[0];
}
function sessionGear(session){
  return session.gear||(session.type==='Físico'?'Tenis de entrenamiento y botella de agua':'Raqueta, tenis de cancha y botella de agua');
}
// Tarjeta de próxima sesión: día, tipo, "hora · cancha · coach", qué llevar y un CTA.
function nextSessionCard(){
  const session=nearestSession();
  if(!session)return '<section class="next-card"><small>Mi agenda</small><h3>Sin próximas sesiones</h3><p>Revisa tu plan para ver otras fechas.</p><div class="next-actions"><button class="next-confirm" data-page="calendar">Abrir mi plan</button></div></section>';
  const live=new Date(session.date+'T'+session.time)<=new Date();
  const day=live?'Sesión en curso':dateLabel(session.date,{weekday:'long',day:'numeric',month:'long'});
  return `<section class="next-card next-photo"><img class="activity-photo" src="assets/${sessionPhoto(session)}" alt="" onerror="this.hidden=true"><small>${esc(day)}</small><h3>${esc(session.type)} · ${esc(session.title)}</h3>
  <p class="next-meta">${esc(session.time)} · ${esc(session.place)} · ${esc(sessionCoach(session))}</p><p>Lleva: ${esc(sessionGear(session))}</p>
  <div class="next-actions"><button class="next-confirm" data-confirm-session="${session.id}" aria-pressed="${!!session.confirmed}">${session.confirmed?'Asistencia confirmada':'Confirmar asistencia'}</button><button class="link" data-session="${session.id}">Ver sesión ↗</button></div></section>`;
}
function playerHome(){
  const today=localDay(),sessions=sessionsFor(agendaDate);
  const competing=state.profile.level!=='Club social'&&state.competition.some(c=>c.date>=today);
  const notice=groupData().posts.at(-1);
  const notices=`<section class="card"><small class="eyebrow">Mi academia</small><h2>Avisos del equipo</h2><p class="hint">${esc(notice?.title||'Aviso de entrenamiento.')}</p>${rainNotice()}<button class="link" data-page="team">Abrir tablón ↗</button></section>`;
  const payment=`<section class="card"><small class="eyebrow">Mensualidad · ${dateLabel(today,{month:'long'})}</small><h2>${esc(feeStatus(feeLedger(),today.slice(0,7)))}</h2><button data-page="payments" class="link">Ver mensualidad ↗</button></section>`;
  const side=role==='Tutor'?payment:competing?tournamentCard():notices;
  return heading(role==='Coach'?'Plan de entrenamiento':role==='Tutor'?'Agenda del jugador':'Mi entrenamiento',dateLabel(today,{weekday:'long',day:'numeric',month:'long'})+' · '+esc(state.profile.academy),role==='Coach'?'<button id="newsession" class="btn">+ Crear sesión</button>':'')+
    (role==='Jugador'?checkinBanner():'')+'<div class="portal-grid">'+nextSessionCard()+side+'</div><div class="flow-week"><section class="agenda-main"><div class="row"><h2>Esta semana</h2><button class="link" data-page="calendar">Mi plan ↗</button></div>'+calendarStrip(agendaDate)+'<h3>'+dateLabel(agendaDate,{weekday:'long',day:'numeric'})+'</h3>'+(sessions.map(sessionSummary).join('')||'<p class="hint">Sin sesiones para este día.</p>')+'</section>'+monthlyReviewCard()+'</div>'+
    '<div class="flow-week">'+(role==='Tutor'?notices:competing?payment+notices:payment)+meetingCard()+'</div>'+playerBanner();
}
function planTabs(){
  return '<nav class="plan-tabs" aria-label="Secciones de mi plan">'+[['calendar','Semana'],['training','Tenis'],['gym','Físico']].map(([id,title])=>'<button aria-pressed="'+(id===page)+'" data-page="'+id+'">'+title+'</button>').join('')+'</nav>';
}
function progressPage(){
  return heading('Mi progreso',esc(state.profile.name)+' · '+esc(state.profile.academy))+progressHub(state.profile.memberId,state.profile.goal);
}
function bindPortal() {
  bindAnnual();
  bindProgressHub();
  setTimeout(maybePromptCheckin,0);
  scheduleAgendaClock();
  document.querySelectorAll('[data-agenda-date]').forEach(button=>button.onclick=()=>{agendaDate=button.dataset.agendaDate;render()});
  const baselineButton=$('#baseline-edit');
  if(baselineButton)baselineButton.onclick=()=>{
    const base=state.profile.baseline||{};
    modal('Evaluación inicial','<label class="full">Fortalezas<textarea required name="strengths" maxlength="600">'+esc(base.strengths)+'</textarea></label><label class="full">Primer aspecto a mejorar<textarea required name="priority" maxlength="600">'+esc(base.priority)+'</textarea></label>',data=>{state.profile.baseline={...data,date:base.date||localDay()}});
  };
  const reviewButton=$('#review-today'),today=localDay();
  if(reviewButton)reviewButton.onclick=()=>{
    const r=state.reviews[today]||{};
    const options=sessionsFor(today).map(s=>'<option value="'+s.id+'" '+(String(s.id)===String(r.sessionId)?'selected':'')+'>'+esc(s.time+' · '+s.title)+'</option>').join('');
    modal('Evaluación de hoy','<label class="full">Entrenamiento<select name="sessionId"><option value="">Revisión del día</option>'+options+'</select></label><label class="full">Lo que salió bien<textarea name="good" required maxlength="600">'+esc(r.good)+'</textarea></label><label class="full">Qué trabajar en la próxima sesión<textarea name="focus" required maxlength="600">'+esc(r.focus)+'</textarea></label>',data=>{state.reviews[today]=data});
  };
  document.querySelectorAll('[data-confirm-session]').forEach(button=>button.onclick=()=>{
    const session=state.sessions.find(s=>String(s.id)===button.dataset.confirmSession);if(!session)return;
    session.confirmed=!session.confirmed;save();render();
    toast(session.confirmed?'Asistencia confirmada · '+session.time+' · '+session.place+'.':'Confirmación retirada.');
  });
  bindMeetingCard();
}
function calendarPage() {
  const events=sessionsFor(agendaDate);
  const tournaments=[...state.competition].sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  return heading('Mi plan',dateLabel(agendaDate,{month:'long',year:'numeric'}),role==='Coach'?'<button class="btn lime" id="newsession">+ Crear sesión</button>':'')+
    '<section class="card plan-competitions"><div class="sectiontitle"><h2>Competencias</h2><button class="link" id="competition">+ Añadir torneo</button></div>'+(tournaments.map(c=>'<div class="session"><div><h3>'+esc(c.name)+'</h3><p>'+esc(c.place)+' · '+dateLabel(c.date,{day:'numeric',month:'long',year:'numeric'})+'</p></div></div>').join('')||'<p class="hint">Añade un torneo para seguir tu preparación.</p>')+'</section>'+
    '<section class="agenda-main"><div class="row"><button class="link" data-agenda-date="'+dateAfter(agendaDate,-7)+'">← Semana anterior</button><button class="link" data-agenda-date="'+localDay()+'">Hoy</button><button class="link" data-agenda-date="'+dateAfter(agendaDate,7)+'">Semana siguiente →</button></div>'+calendarStrip(agendaDate)+'<h2>'+dateLabel(agendaDate,{weekday:'long',day:'numeric',month:'long'})+'</h2>'+(events.map(sessionSummary).join('')||'<p class="empty">Sin sesiones para este día.</p>')+'</section>';
}
