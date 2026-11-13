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
// Fecha de nacimiento: tres listas grandes (día, mes, año) en vez del calendario del navegador.
// El valor final viaja en un campo oculto «birthDate» (AAAA-MM-DD), igual que antes.
function birthDaysIn(month, year) { return month ? new Date(year || 2000, month, 0).getDate() : 31; }
function birthAgeNote(iso) {
  if (!iso || typeof ageFrom !== 'function') return '';
  const age = ageFrom(iso);
  return age >= 0 && age < 120 ? coverText('Tienes ' + age + ' años.', 'You are ' + age + ' years old.', 'Vous avez ' + age + ' ans.') : '';
}
function birthInput(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  const y = m ? +m[1] : 0, mo = m ? +m[2] : 0, d = m ? +m[3] : 0;
  const lang = ({es:'es-MX',en:'en-US',fr:'fr-FR'})[coverLanguage] || 'es-MX';
  const top = new Date().getFullYear();
  const days = Array.from({length: birthDaysIn(mo, y)}, (_, i) => i + 1);
  const months = Array.from({length: 12}, (_, i) => { const n = new Date(2000, i, 1).toLocaleDateString(lang, {month:'long'}); return n.charAt(0).toUpperCase() + n.slice(1); });
  const years = Array.from({length: top - 1920 + 1}, (_, i) => top - i);
  const opts = (list, selected, label, val = x => x) => '<option value="">' + label + '</option>' + list.map((x, i) => '<option value="' + val(x, i) + '"' + (val(x, i) === selected ? ' selected' : '') + '>' + x + '</option>').join('');
  return '<div class="birth-wrap" data-birth role="group" aria-label="Fecha de nacimiento">'
    + '<span class="birth-title">Fecha de nacimiento</span>'
    + '<input type="hidden" name="birthDate" value="' + esc(m ? value : '') + '">'
    + '<div class="birth-picker">'
    + '<label><span>Día</span><select data-birth-d required>' + opts(days, d, 'Día') + '</select></label>'
    + '<label><span>Mes</span><select data-birth-m required>' + opts(months, mo, 'Mes', (_, i) => i + 1) + '</select></label>'
    + '<label><span>Año</span><select data-birth-y required autocomplete="bday-year">' + opts(years, y, 'Año') + '</select></label>'
    + '</div><p class="birth-age" aria-live="polite">' + esc(birthAgeNote(m ? value : '')) + '</p></div>';
}
function birthSync(box) {
  const ds = box.querySelector('[data-birth-d]'), ms = box.querySelector('[data-birth-m]'), ys = box.querySelector('[data-birth-y]');
  const hid = box.querySelector('input[name="birthDate"]'), note = box.querySelector('.birth-age');
  const y = +ys.value, mo = +ms.value, max = birthDaysIn(mo, y);
  if (ds.options.length - 1 !== max) {
    const keep = Math.min(+ds.value || 0, max);
    ds.innerHTML = '<option value="">' + (coverText('Día', 'Day', 'Jour')) + '</option>' + Array.from({length: max}, (_, i) => '<option value="' + (i + 1) + '"' + (i + 1 === keep ? ' selected' : '') + '>' + (i + 1) + '</option>').join('');
  }
  const d = +ds.value;
  let iso = '';
  if (y && mo && d) iso = y + '-' + String(mo).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  const future = iso && iso > localDay();
  ys.setCustomValidity(future ? coverText('La fecha no puede ser futura.', 'The date cannot be in the future.', 'La date ne peut pas être dans le futur.') : '');
  hid.value = future ? '' : iso;
  note.textContent = future ? '' : birthAgeNote(iso);
}
document.addEventListener('change', e => { const box = e.target.closest?.('[data-birth]'); if (box) birthSync(box); });
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
  refreshDemoWeek(today);
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
// Clases particulares: sesiones que solo les tocan a ciertos jugadores.
function sessionPrivateNote(s){
  if(!s.players?.length)return '';
  if(role==='Jugador')return 'Clase particular · solo para ti';
  const names=s.players.map(id=>(state.directory||[]).find(m=>m.id===id)?.name||'Jugador');
  return 'Clase particular · '+(role==='Tutor'?'para '+names[0]:names.join(', '));
}
function sessionPlayerPicker(){
  const members=typeof academyPlayers==='function'&&actor()?academyPlayers(actor().academy):[];
  if(!members.length)return '';
  return '<fieldset class="full session-for"><legend>Clase particular <span class="optional">(opcional)</span></legend><p class="hint">Marca a quién le toca. Solo esos jugadores y sus tutores verán la sesión. Si no marcas a nadie, es para todo el grupo.</p><div class="session-for-list">'+members.map(m=>'<label class="check-row"><input type="checkbox" name="pl_'+esc(m.id)+'" value="1"> <span>'+esc(m.name)+'</span></label>').join('')+'</div></fieldset>';
}
function sessionSummary(s) {
  const status=sessionStatus(s);
  const tone=s.cancelled?'is-cancelled':s.done||status==='Terminada'?'is-done':status==='En curso'?'is-live':'is-planned';
  return '<article class="agenda-event"><div class="event-clock"><b>'+esc(s.time)+'</b><small>'+esc(s.duration)+' min</small></div><div><span class="badge '+(s.type==='Físico'?'clay':'')+'">'+esc(s.type)+'</span><h3 class="event-title">'+sessionTitle(s)+'<span class="status-chip '+tone+'">'+esc(status)+'</span></h3>'+(s.players?.length?'<p class="private-note">'+esc(sessionPrivateNote(s))+'</p>':'')+'<p>'+esc(s.place)+' · '+esc(sessionCoach(s))+'</p><button class="link" data-session="'+s.id+'">'+(s.done?'Ver resumen':'Ver indicaciones')+' ↗</button></div></article>';
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
  if(!c)return '<section class="card"><h2>Próximo torneo</h2><p class="hint">Elige tu siguiente torneo para empezar la cuenta regresiva.</p><button class="btn small" id="competition">Añadir torneo</button></section>';
  const days=Math.round((Date.parse(c.date)-Date.parse(today))/86400000);
  const start=c.start||today;
  const phases=[['Preparación',start],['Afinar el juego',dateAfter(c.date,-7)<start?start:dateAfter(c.date,-7)],['Últimos ajustes',dateAfter(c.date,-2)<start?start:dateAfter(c.date,-2)],['Día del torneo',c.date]];
  const current=phases.reduce((result,[,date],i)=>date<=today?i:result,0);
  return '<section class="card tournament"><div class="row"><small class="eyebrow">Próximo torneo'+(demo?' · Ejemplo':'')+'</small><button id="competition" class="link">Añadir torneo +</button></div><h2>'+esc(c.name)+'</h2><p>'+esc(c.place)+' · '+dateLabel(c.date,{day:'numeric',month:'long'})+tournamentDetails(c)+'</p><div class="countdown">'+(days?days+' <small>días para competir</small>':'Hoy compites')+'</div><ol class="tourney-road">'+phases.map(([name,date],i)=>'<li class="'+(i<=current?'reached ':'')+(i===current?'current':'')+'"><i></i><b>'+name+'</b><small>'+dateLabel(date,{day:'numeric',month:'short'})+'</small></li>').join('')+'</ol></section>';
}
let agendaDate=localDay();
// Asistencia por jugador y sesión: 'going' (confirmó que va), 'attended' (fue), 'absent' (no fue).
// El jugador responde por sí mismo; el tutor puede responder por su jugador a cargo. El coach lo ve en la sesión.
function attendanceMine(){
  if(typeof syncCtx==='undefined'||!syncCtx||syncCtx.staff)return '';
  return (syncCtx.players||[])[0]||'';
}
function attendanceMap(id){return id&&syncCtx?(syncAthlete(id).attendance??={}):null}
function attendanceOf(session){const m=attendanceMap(attendanceMine());return m?m[String(session.id)]||null:null}
function setAttendance(session,status){
  const m=attendanceMap(attendanceMine());if(!m)return false;
  if(status)m[String(session.id)]={status,by:role==='Tutor'?'Tutor':'Jugador',name:actor()?.name||'',at:Date.now()};
  else delete m[String(session.id)];
  return true;
}
// Al contestar «¿Fuiste hoy?» se marcan las sesiones de hoy que ya empezaron.
function markAttendanceFromSurvey(went){
  const now=Date.now();
  sessionsFor(localDay()).filter(s=>!s.cancelled&&new Date(s.date+'T'+s.time).getTime()<=now).forEach(s=>setAttendance(s,went?'attended':'absent'));
}
function sessionAttendance(s){
  if(role!=='Coach'||typeof syncCtx==='undefined'||!syncCtx)return '';
  const ids=s.players?.length?s.players:(syncCtx.players||[]);
  const name=id=>(state.directory||[]).find(m=>m.id===id)?.name||'Jugador';
  const groups={going:[],attended:[],absent:[]},none=[];
  ids.forEach(id=>{const a=(syncAthlete(id).attendance||{})[String(s.id)];if(a&&groups[a.status])groups[a.status].push(name(id)+(a.by==='Tutor'?' (por su tutor)':''));else none.push(name(id))});
  const line=(label,list)=>list.length?'<p><b>'+label+' ('+list.length+'):</b> '+list.map(esc).join(', ')+'</p>':'';
  return '<hr class="divider"><h3>Asistencia</h3>'+line('Confirmaron que van',groups.going)+line('Asistieron',groups.attended)+line('No asistieron',groups.absent)+'<p class="hint">Sin respuesta: '+none.length+'</p>';
}
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
  const att=attendanceOf(session),st=attendanceMine()?(att?att.status:''):(session.confirmed?'going':'');
  const live=new Date(session.date+'T'+session.time)<=new Date();
  const day=live?'Sesión en curso':dateLabel(session.date,{weekday:'long',day:'numeric',month:'long'});
  return `<section class="next-card next-photo"><img class="activity-photo" src="assets/${sessionPhoto(session)}" alt="" onerror="this.hidden=true"><small>${esc(day)}</small><h3>${esc(session.type)} · ${esc(session.title)}</h3>
  <p class="next-meta">${esc(session.time)} · ${esc(session.place)} · ${esc(sessionCoach(session))}</p>${session.players?.length?`<p class="private-note">${esc(sessionPrivateNote(session))}</p>`:''}<p>Lleva: ${esc(sessionGear(session))}</p>
  <div class="next-actions"><button class="next-confirm" data-confirm-session="${session.id}" aria-pressed="${st==='going'||st==='attended'}">${st==='attended'?'Asististe ✓':st==='absent'?'No asististe':st==='going'?'Asistencia confirmada':'Confirmar asistencia'}</button><button class="link" data-session="${session.id}">Ver sesión ↗</button></div>${att&&att.status==='going'&&att.name?`<p class="confirm-by">Confirmada por ${esc(att.name)}</p>`:''}</section>`;
}
function playerHome(){
  const today=localDay(),sessions=sessionsFor(agendaDate);
  const competing=state.profile.level!=='Club social'&&state.competition.some(c=>c.date>=today);
  const notice=groupData().posts.at(-1);
  const notices=`<section class="card"><small class="eyebrow">Mi academia</small><h2>Avisos del equipo</h2><p class="hint">${esc(notice?.title||'Aviso de entrenamiento.')}</p>${rainNotice()}<button class="link" data-page="team">Abrir tablón ↗</button></section>`;
  const payment=`<section class="card"><small class="eyebrow">Mensualidad · ${dateLabel(today,{month:'long'})}</small><h2>${esc(feeStatus(feeLedger(),today.slice(0,7)))}</h2><button data-page="payments" class="link">Ver mensualidad ↗</button></section>`;
  const side=role==='Tutor'?payment:competing?tournamentCard():notices;
  return heading(role==='Coach'?'Plan de entrenamiento':role==='Tutor'?'Agenda del jugador':'Mi entrenamiento',dateLabel(today,{weekday:'long',day:'numeric',month:'long'})+' · '+esc(state.profile.academy),`<div class="heading-actions">${role==='Coach'?'<button id="newsession" class="btn">+ Crear sesión</button>':''}${headingAvatar()}</div>`)+
    guardianBanner()+calendarBanner()+(role==='Jugador'?wellnessBanner()+checkinBanner():'')+'<div class="portal-grid">'+nextSessionCard()+side+'</div><div class="flow-week"><section class="agenda-main"><div class="row"><h2>Esta semana</h2><button class="link" data-page="calendar">Mi plan ↗</button></div>'+calendarStrip(agendaDate)+'<h3>'+dateLabel(agendaDate,{weekday:'long',day:'numeric'})+'</h3>'+(sessions.map(sessionSummary).join('')||'<p class="hint">Sin sesiones para este día.</p>')+'</section>'+monthlyReviewCard()+'</div>'+
    '<div class="flow-week">'+(role==='Tutor'?notices:competing?payment+notices:payment)+meetingCard()+'</div>'+playerBanner();
}
function planTabs(){
  return '<nav class="plan-tabs" aria-label="Secciones de mi plan">'+[['calendar','Semana'],['training','Tenis'],['gym','Físico']].map(([id,title])=>'<button aria-pressed="'+(id===page)+'" data-page="'+id+'">'+title+'</button>').join('')+'</nav>';
}
function progressPage(){
  return heading('Mi estado',esc(state.profile.name)+' · '+esc(state.profile.academy))+wellnessPanel(state.profile.memberId,state.profile.name,true)+wellnessTrend(state.profile.memberId,true,state.profile.name)+coachFollowCard(state.profile.memberId);
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
    if(attendanceMine()){
      const cur=attendanceOf(session);
      if(cur&&cur.status!=='going'){toast('La asistencia de esta sesión ya quedó registrada.');return}
      setAttendance(session,cur?null:'going');save();render();
      toast(cur?'Confirmación retirada.':'Asistencia confirmada · '+session.time+' · '+session.place+'.');return;
    }
    session.confirmed=!session.confirmed;save();render();
    toast(session.confirmed?'Asistencia confirmada · '+session.time+' · '+session.place+'.':'Confirmación retirada.');
  });
  bindMeetingCard();
}
// Torneos de los jugadores que sigue este coach (cada coach elige los suyos, para no llenarse de avisos).
let coachTourAll=false;
function coachMyPlayers(){
  const me=state.profile.memberId,ids=(state.coachPlayers||{})[me]||[];
  return (state.directory||[]).filter(m=>m.academy===state.profile.academy&&m.role==='Jugador'&&ids.includes(m.id));
}
function coachTournaments(){
  const mine=coachMyPlayers(),today=localDay();
  const head='<div class="sectiontitle"><h2>Torneos de mis jugadores</h2><button class="link" id="coach-players">'+(mine.length?'Mis jugadores ('+mine.length+')':'Elegir mis jugadores')+'</button></div>';
  if(!mine.length)return '<section class="card plan-competitions">'+head+'<p class="hint">Elige los jugadores que sigues y aquí verás solo sus torneos, del más cercano al más lejano.</p></section>';
  const groups=new Map();
  for(const m of mine)for(const c of (state.playerTournaments||{})[m.id]||[]){
    if(String(c.date)<today)continue;
    const key=[c.name,c.date,c.place].map(x=>String(x||'').trim().toLowerCase()).join('|');
    if(!groups.has(key))groups.set(key,{...c,names:[],members:[]});
    groups.get(key).names.push(m.name);groups.get(key).members.push(m);
  }
  const list=[...groups.values()].sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  if(!list.length)return '<section class="card plan-competitions">'+head+'<p class="hint">Tus jugadores no tienen torneos próximos.</p></section>';
  const shown=coachTourAll?list:list.slice(0,5);
  const rows=shown.map((c,i)=>{
    const days=Math.round((Date.parse(c.date)-Date.parse(today))/864e5),when=days===0?'hoy':days===1?'mañana':'en '+days+' días';
    const fade=days<=7?1:Math.max(.35,1-(days-7)/60);
    const who=c.members.map(m=>'<span class="who-chip"><span class="who-photo">'+avatar(m)+'</span>'+esc(m.name)+'</span>').join('');
    return '<li class="comp-item'+(i===0?' is-next':'')+'" style="--fade:'+fade.toFixed(2)+'"><small class="eyebrow">'+(i===0?'Lo más cercano · ':'')+when+'</small><div class="comp-row"><div class="comp-main"><div class="comp-head"><h3>'+esc(c.name)+'</h3></div><p class="comp-who"><span class="who-label">'+(c.names.length>1?'Van':'Va')+'</span>'+who+'</p><p>'+dateLabel(c.date,{day:'numeric',month:'long',year:'numeric'})+tournamentDetails(c)+'</p></div><div class="comp-place" title="Sede del torneo"><small>Sede</small><b>'+esc(c.place)+'</b></div></div></li>';
  }).join('');
  return '<section class="card plan-competitions">'+head+'<ol class="comp-list">'+rows+'</ol>'+(list.length>5?'<button class="link" id="coach-tour-more">'+(coachTourAll?'Ver menos':'Ver todos ('+list.length+')')+'</button>':'')+'</section>';
}
function openCoachPlayers(){
  const members=(state.directory||[]).filter(m=>m.academy===state.profile.academy&&m.role==='Jugador').sort((a,b)=>a.name.localeCompare(b.name));
  const mine=(state.coachPlayers||{})[state.profile.memberId]||[];
  if(!members.length){toast('Todavía no hay jugadores registrados.');return}
  modal('Mis jugadores','<fieldset class="full session-for"><p class="hint">Marca los jugadores que tú sigues. Solo verás los torneos de ellos. Cada coach elige los suyos.</p><div class="session-for-list">'+members.map(m=>'<label class="check-row"><input type="checkbox" name="cp_'+esc(m.id)+'" value="1"'+(mine.includes(m.id)?' checked':'')+'> <span>'+esc(m.name)+'</span></label>').join('')+'</div></fieldset>',
    d=>{(state.coachPlayers??={})[state.profile.memberId]=Object.keys(d).filter(k=>k.startsWith('cp_')).map(k=>k.slice(3))},'Guardar');
}
document.addEventListener('click',event=>{
  if(event.target.closest?.('#coach-players'))openCoachPlayers();
  if(event.target.closest?.('#coach-tour-more')){coachTourAll=!coachTourAll;render()}
});
function calendarPage() {
  const events=sessionsFor(agendaDate);
  const tournaments=[...state.competition].sort((a,b)=>String(a.date).localeCompare(String(b.date))),upcoming=tournaments.filter(c=>String(c.date)>=localDay());
  return heading('Mi plan',dateLabel(agendaDate,{month:'long',year:'numeric'}),'<div class="heading-actions">'+calendarButton()+(role==='Coach'?'<button class="btn lime" id="newsession">+ Crear sesión</button>':'')+'</div>')+
    '<section class="agenda-main"><div class="row"><button class="link" data-agenda-date="'+dateAfter(agendaDate,-7)+'">← Semana anterior</button><button class="link" data-agenda-date="'+localDay()+'">Hoy</button><button class="link" data-agenda-date="'+dateAfter(agendaDate,7)+'">Semana siguiente →</button></div>'+calendarStrip(agendaDate)+'<h2>'+dateLabel(agendaDate,{weekday:'long',day:'numeric',month:'long'})+'</h2>'+(events.map(sessionSummary).join('')||'<p class="empty">Sin sesiones para este día.</p>')+'</section>'+
    (role==='Coach'?coachTournaments():'<section class="card plan-competitions"><div class="sectiontitle"><h2>Torneos</h2><button class="link" id="competition">+ Añadir torneo</button></div>'+(upcoming.length?'<ol class="comp-list">'+upcoming.map((c,i)=>{const days=Math.round((Date.parse(c.date)-Date.parse(localDay()))/864e5),when=days===0?'hoy':days===1?'mañana':'en '+days+' días';return '<li class="comp-item'+(i===0?' is-next':'')+'" style="--fade:'+Math.max(.45,1-i*.2)+'">'+(i===0?'<small class="eyebrow">Próximo torneo · '+when+'</small>':'')+'<div class="comp-head"><h3>'+esc(c.name)+'</h3><button class="link comp-edit" data-tournament="'+esc(tournamentKey(c))+'">Editar</button></div><p>'+esc(c.place)+' · '+dateLabel(c.date,{day:'numeric',month:'long',year:'numeric'})+tournamentDetails(c)+'</p></li>'}).join('')+'</ol>':'<p class="hint">'+(tournaments.length?'No tienes torneos próximos. ':'')+'Añade un torneo para seguir tu preparación.</p>')+'</section>');
}

// Foto de perfil de quien inició sesión, a la derecha del título de Inicio. Lleva a «Perfil».
function headingAvatar(){
  const me=actor()||state.profile;
  return `<button type="button" class="heading-avatar" data-page="profile" aria-label="Mi perfil" title="Mi perfil">${avatar(me)}<svg class="avatar-ring" viewBox="-80 -80 160 160" aria-hidden="true" focusable="false"><defs><path id="ring-arc" d="M -69 0 A 69 69 0 0 1 69 0"/></defs><text><textPath href="#ring-arc" startOffset="50%" text-anchor="middle">Mi perfil</textPath></text></svg></button>`;
}

// ---------- Torneos: añadir, editar y quitar ----------
const TOURNAMENT_MODES=['Singles','Dobles','Singles y dobles'];
const TOURNAMENT_SURFACES=['Arcilla','Dura (concreto)','Pasto','Sintética'];
const tournamentKey=c=>String(c.id??(c._k??=newMemberId()));
function tournamentDetails(c){
  const extra=[c.mode,c.surface].filter(Boolean).map(esc).join(' · ');
  return extra?' · '+extra:'';
}
function openTournament(key){
  const existing=key?state.competition.find(c=>tournamentKey(c)===key):null;
  const t=existing||{};
  const choice=(label,name,options,value)=>`<label>${label}<select name="${name}"><option value="">Sin definir</option>${options.map(o=>`<option ${o===value?'selected':''}>${esc(o)}</option>`).join('')}</select></label>`;
  modal(existing?'Editar torneo':'Nuevo torneo',
    field('Nombre del torneo','name',t.name||'')+field('Fecha','date',t.date||dateAfter(localDay(),14),'date')+field('Sede','place',t.place||'')+
    choice('Modalidad','mode',TOURNAMENT_MODES,t.mode)+choice('Superficie','surface',TOURNAMENT_SURFACES,t.surface)+
    (existing?'<p class="full"><button type="button" class="link danger" id="tournament-remove">Quitar este torneo</button></p>':''),
    d=>{
      if(!existing&&d.date<localDay()){toast('Elige hoy o una fecha futura.');return false}
      const data={name:d.name.trim(),date:d.date,place:d.place.trim(),mode:d.mode,surface:d.surface};
      if(!data.name||!data.place){toast('Escribe el nombre y la sede.');return false}
      if(existing)Object.assign(existing,data);
      else state.competition.push({...data,start:localDay(),_k:newMemberId()});
    },existing?'Guardar cambios':'Añadir torneo');
  const remove=$('#tournament-remove');
  if(remove)remove.onclick=()=>{
    // Pide una segunda confirmación antes de quitarlo.
    if(!remove.dataset.sure){remove.dataset.sure='1';remove.textContent='¿Seguro? Toca otra vez para quitarlo';return}
    state.competition.splice(state.competition.indexOf(existing),1);
    save();$('#modal').close();render();toast('Torneo quitado.');
  };
}
document.addEventListener('click',event=>{
  const edit=event.target.closest?.('[data-tournament]');
  if(edit)openTournament(edit.dataset.tournament);
});

// Pestaña Tenis: sesiones de esta semana en adelante, en orden de fecha y hora.
function tennisSessions(){
  const today=localDay(),monday=dateAfter(today,-((new Date(today+'T12:00:00').getDay()+6)%7));
  return state.sessions.filter(s=>s.type==='Tenis'&&String(s.date)>=monday).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
}
