const roleNames=['Jugador','Coach','Tutor'];
const roleDescriptions={Jugador:'Entrenamientos, objetivos y evolución.',Coach:'Planifica sesiones y acompaña a tus jugadores.',Tutor:'Consulta la agenda y el avance de tu jugador.'};
let rosterDetail='';
function personStore(){
  state.athletes??={};state.accessProfiles??={};return state.athletes;
}
function rememberPlayer(){
  personStore();
  const p=state.profile;
  if(!p||p.staff||!p.memberId)return;
  state.athletes[p.memberId]={profile:p,goals:state.goals,reviews:state.reviews};
}
function actor(){
  return role==='Jugador'?state.profile:state.accessProfiles?.[role];
}
function academyPlayers(academy){
  return (state.directory||[]).filter(m=>m.role==='Jugador'&&m.academy===academy);
}
function athleteFor(member){
  const store=personStore();
  if(!store[member.id])store[member.id]={profile:{name:member.name,memberId:member.id,academy:member.academy,photo:member.photo||'',goal:member.bio||'',level:'Por definir'},goals:[],reviews:{}};
  return store[member.id];
}
function useAthlete(member){
  const a=athleteFor(member);
  state.profile=a.profile;state.reviews=a.reviews;state.goals=a.goals;
}

/* Versión de la demo: 'conecta' bloquea con candado lo que es de CORDA Progreso. Cambia a 'progreso' para abrirlo todo. */
const PLAN_DEMO='conecta';
const planLocked=()=>PLAN_DEMO==='conecta';
function lockCard(title,text){
  return `<section class="card lockcard"><div class="lockicon" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></div><div class="lockbody"><small class="eyebrow">Incluido en CORDA Progreso</small><h2>${title}</h2><p class="hint">${text}</p><a class="btn lime small" href="https://www.cordatenis.com/#demo" target="_blank" rel="noopener">Contrata CORDA Progreso</a></div></section>`;
}
function roleNav(){
  const labels=role==='Coach'?['Panel','Plan','Jugadores','Academia','Pagos']:role==='Tutor'?['Inicio','Agenda','Avances','Academia','Mensualidad']:['Inicio','Plan','Estado','Academia','Mensualidad'];
  return [['home','home'],['calendar','calendar'],['goals','target'],['team','user'],[role==='Coach'?'private-payments':'payments','wallet']].map(([id,i],n)=>[id,i,labels[n]]);
}
function pickRole(mode){
  entry='access';
  const last=state.lastRole||'Jugador';
  const t=coverText;
  const labels={Jugador:'Player',Coach:'Coach',Tutor:'Guardian'};
  const descriptions={Jugador:'Training, goals and progress.',Coach:'Plan sessions and support your players.',Tutor:'View your player’s schedule and progress.'};
  accessScene('access-screen',`${coverSelector()}<section class="access-panel"><small class="eyebrow">CORDA · ${t('Acceso local','Local demo','Démo locale')}</small><h1>${t('¿Cómo vas a entrar?','Choose your role','Choisissez votre profil')}</h1><p>${t('Elige el perfil que usarás en la academia.','Choose your academy profile.','Choisissez le profil que vous utiliserez à l’académie.')}</p><div class="access-roles">${roleNames.map(r=>`<button data-enter-role="${r}"><strong>${t(r,labels[r],{Jugador:'Joueur',Coach:'Coach',Tutor:'Parent'}[r])}</strong><small>${t(roleDescriptions[r],descriptions[r],{Jugador:'Entraînements, objectifs et progression.',Coach:'Planifiez les séances et accompagnez vos joueurs.',Tutor:'Consultez le programme et les progrès de votre joueur.'}[r])}</small>${state.lastRole&&r===last?`<small>${t('Último perfil utilizado','Last profile used','Dernier profil utilisé')}</small>`:''}</button>`).join('')}</div><button class="access-back">← ${t('Inicio','Home','Accueil')}</button></section>`);
  bindCoverLanguage(()=>pickRole(mode));
  $('.access-back').onclick=()=>{if(mode==='register'){pendingAccount=null;entry='welcome';render();window.scrollTo(0,0)}else signInScreen()};
  document.querySelectorAll('[data-enter-role]').forEach(button=>button.onclick=()=>createAccessScreen(button.dataset.enterRole,mode==='register'?'register':'signin'));
}
function chooseRole(selected,mode){
  rememberPlayer();
  role=selected;page='home';rosterDetail='';
  if(role==='Jugador'){
    const saved=state.athletes?.[state.lastPlayerId];
    if(mode==='signin'&&saved){switchAgenda(saved.profile.academy);useAthlete({id:state.lastPlayerId});finishAccess();return}
    draft={};step=0;entry='register';onboarding();return;
  }
  const existing=state.accessProfiles?.[role];
  if(mode==='signin'&&existing&&(role==='Coach'||academyPlayers(existing.academy).some(m=>m.id===existing.childId))){
    enterAdult(existing);return;
  }
  adultSetup(existing);
}
function finishAccess(){
  state.lastRole=role;entry='app';prepareCommunity();linkPendingAccount();syncCurrentAccount();save();render();window.scrollTo(0,0);
}
function enterAdult(account){
  personStore();switchAgenda(account.academy);state.accessProfiles[role]=account;
  if(role==='Tutor'){
    const child=academyPlayers(account.academy).find(m=>m.id===account.childId);
    if(!child){adultSetup(account);return}
    useAthlete(child);
  }else{state.profile=account;state.goals=[];state.reviews={}}
  finishAccess();
}
// Tutor recién registrado: todavía no hay jugador vinculado.
function tutorWaiting(){
  accessScene('access-screen',`<section class="access-panel"><small class="eyebrow">Perfil de Tutor</small><h1>Cuenta creada</h1><p>Revisa tu correo y confirma tu cuenta. Después inicia sesión: ahí verás la invitación de tu jugador para aceptarla y administrar su perfil.</p><p class="hint">Tu academia te dio el código de acceso, así que tu cuenta ya está aprobada. Para ver a tu jugador, él debe haber escrito tu correo como correo de su tutor, o tu código debe venir ligado a él.</p><div class="formactions"><button class="btn lime" id="tutor-signin">Ir a iniciar sesión</button></div></section>`);
  $('#tutor-signin').onclick=()=>{currentAccount=null;signInScreen()};
}
function adultSetup(existing){
  const academy=existing?.academy||pendingAccount?.codeInfo?.academy||pendingAccount?.lockAcademy||state.profile?.academy||'';
  accessScene('access-screen',`<section class="access-panel"><small class="eyebrow">Perfil de ${role}</small><h1>${role==='Coach'?'Tu espacio de coach':currentAccount?'Vincula a tu jugador':'Tu espacio familiar'}</h1><form id="adult-form">${field('Tu nombre','name',existing?.name||pendingAccount?.codeInfo?.label||'')}${academySelect('academy',academy)}<div id="linked-player"></div><div class="formactions"><button type="button" class="access-back">← Perfiles</button><button class="btn lime">${role==='Tutor'?(currentAccount?'Aceptar y entrar':'Crear mi cuenta'):'Entrar al portal'}</button></div></form></section>`);
  const form=$('#adult-form');
  // Tutor: el menor lo nombra con su correo; aquí se ven las invitaciones y se acepta (necesita sesión iniciada).
  let invites=[];
  async function children(){
    if(role!=='Tutor')return;
    const box=$('#linked-player');
    if(!currentAccount){
      box.innerHTML=pendingAccount?.codeInfo?.child_member
        ?'<p class="hint">Tu academia ya te ligó a tu jugador con tu código. Cuando confirmes tu correo y entres, aquí verás su invitación para aceptarla.</p>'
        :'<p class="hint">Cuando confirmes tu correo y entres, aquí verás la invitación del jugador que escribió tu correo como correo de su tutor, para aceptarla.</p>';
      return;
    }
    box.innerHTML='<p class="hint">Buscando invitaciones…</p>';
    invites=await guardianInvites();
    box.innerHTML=invites.length
      ?`<label>Jugador que te nombró como tutor<select name="child" required>${invites.length>1?'<option value="">Selecciona un jugador</option>':''}${invites.map(i=>`<option value="${esc(i.member_id)}" ${existing?.childId===i.member_id?'selected':''}>${esc(i.name)}</option>`).join('')}</select></label><p class="hint">Al aceptar, confirmas que eres su madre, padre o tutor legal y podrás administrar su perfil.</p>`
      :`<p class="hint">Todavía no hay ningún jugador que te haya nombrado como tutor con tu correo (<b>${esc(currentAccount.email||'')}</b>). Pídele que escriba ese correo en su perfil de CORDA y vuelve a entrar.</p>`;
  }
  form.elements.academy.oninput=children;children();$('.access-back').onclick=()=>currentAccount?(entry='app',render()):pickRole(pendingAccount?'register':'signin');
  form.onsubmit=e=>{
    e.preventDefault();const d=Object.fromEntries(new FormData(form));
    const account={name:d.name.trim(),academy:d.academy.trim(),memberId:existing?.memberId||newMemberId(),staff:role,role};
    if(!account.name||!account.academy){toast('Escribe tu nombre y academia.');return}
    if(role==='Tutor'){
      if(!currentAccount){
        // Registro: la cuenta se crea ya; el jugador se vincula al entrar con el correo confirmado.
        account.childId='';
        state.accessProfiles[role]=account;linkPendingAccount();save();tutorWaiting();return;
      }
      const invite=invites.find(i=>i.member_id===d.child);
      if(!invite&&existing?.childId){enterAdult({...account,childId:existing.childId});return}
      if(!invite){toast('Todavía no hay una invitación que aceptar.');return}
      account.childId=invite.member_id;
      if(!academyPlayers(account.academy).some(m=>m.id===invite.member_id))state.directory.push({name:invite.name,academy:account.academy,id:invite.member_id,role:'Jugador'});
      enterAdult(account);saveGuardianLink();return;
    }
    enterAdult(account);
  };
}
function latestPlayerNote(record){
  const monthly=Object.entries(record.profile.monthlyReviews||{}).sort(([a],[b])=>b.localeCompare(a))[0];
  const daily=Object.entries(record.reviews||{}).sort(([a],[b])=>b.localeCompare(a))[0];
  if(daily&&(!monthly||daily[0].slice(0,7)>=monthly[0]))return daily[1];
  return monthly?.[1]||{good:record.profile.baseline?.strengths,focus:record.profile.baseline?.priority};
}
function playerList(){
  const members=academyPlayers(actor().academy);
  return heading('Mis jugadores',esc(actor().academy)+' · '+members.length+' jugadores','<button class="btn light" id="access-codes">Códigos de acceso</button><button class="btn lime" id="roster-add">+ Jugador</button>')+
    (members.length?(()=>{
      // Primero quien necesita atención: rojo, amarillo, sin datos y al final los que van bien.
      const order={red:0,yellow:1,none:2,green:3};
      const list=members.map(m=>({m,st:typeof playerStatus==='function'?playerStatus(m.id):{level:'none',reason:'Sin chequeos',score:null}}))
        .sort((a,b)=>order[a.st.level]-order[b.st.level]||a.m.name.localeCompare(b.m.name));
      const sym={red:'!',yellow:'!',green:'✓',none:''};
      return `<div class="status-legend" aria-label="Significado de los colores"><span class="lg-red">Corregir aspectos</span><span class="lg-yellow">Con detalles a pulir</span><span class="lg-green">Buen camino</span><span class="lg-none">Falta de datos</span></div><ul class="player-circles">${list.map(({m,st})=>{
        const parts=String(m.name||'').trim().split(/\s+/),first=parts.shift()||'',rest=parts.join(' ');
        return `<li><button type="button" class="player-circle ring-${st.level}" data-athlete="${esc(m.id)}" aria-label="Ver seguimiento de ${esc(m.name)}. ${esc(st.reason)}"><span class="pc-photo">${avatar(m)}${sym[st.level]?`<i class="pc-badge badge-${st.level}">${sym[st.level]}</i>`:''}</span><b>${esc(first)}</b><span class="pc-last">${esc(rest)}</span><small class="pc-reason reason-${st.level}">${esc(st.reason)}</small><span class="pc-go">Ver seguimiento ↗</span></button></li>`;
      }).join('')}</ul>`;
    })():'<section class="card"><h2>Tu primer jugador</h2><p class="hint">Añade un jugador para registrar su punto de partida y seguir sus objetivos.</p></section>');
}
// Guía para familias: consejos por momento (sueño según la Academia Americana de Medicina del Sueño; nutrición y rutina según SDA, ITF/WTA/ATP y USTA).
function famGuide(age){
  const sleep=age&&age<=12?'9 a 12 h (6 a 12 años)':'8 a 10 h (13 a 18 años)';
  return [
    {icon:'🎾',title:'Antes de entrenar',sub:'Comida, agua y mochila',items:[
      'Una comida con carbohidratos (arroz, pasta, pan, avena, fruta) unas 3 a 4 horas antes; si queda poco tiempo, un snack ligero.',
      'Que lleve agua y la tome desde antes de empezar: los niños y adolescentes se sobrecalientan y se deshidratan más rápido que los adultos.',
      'Dejen la mochila lista la noche anterior (raqueta, ropa extra, toalla, agua) para llegar con tiempo a calentar y sin prisas.']},
    {icon:'🏆',title:'Antes de un partido',sub:'Rutina conocida, cero sorpresas',items:[
      'Nada nuevo el día del torneo: ni comidas, ni bebidas, ni suplementos que no haya probado en entrenamientos.',
      'Una rutina siempre igual (comer, calentar, descansar) ayuda a bajar los nervios; los coaches la repiten partido tras partido.',
      'Limita la cafeína (refrescos de cola, bebidas energéticas) antes y después de jugar.',
      'Un mensaje corto y sin indicaciones técnicas: «disfruta, me encanta verte jugar».']},
    {icon:'🍌',title:'Entre partidos',sub:'Pequeñas cargas de energía',items:[
      'Snacks pequeños y conocidos (plátano, fruta, un sándwich ligero) y agua a sorbos frecuentes, sin esperar a tener sed.',
      'Busquen sombra y un lugar tranquilo para descansar; evita revisar con él cada punto del partido anterior.',
      'Desde la grada, aplaude los buenos puntos de ambos y evita dar indicaciones: en la cancha decide el jugador.']},
    {icon:'🔄',title:'Después de entrenar o jugar',sub:'Recuperar y escuchar',items:[
      'Pronto después, una comida con proteína y carbohidratos (pollo con arroz, huevo con pan, yogur con fruta) más agua para recuperarse.',
      'En el camino a casa, primero escucha y deja que sea tu jugador quien decida de qué hablar. El análisis del partido, mejor otro día (muchos expertos sugieren esperar unas 24 horas).',
      'Después de un mal partido, valora el esfuerzo y la actitud antes que el marcador.']},
    {icon:'😴',title:'Dormir y descansar',sub:'La mitad del entrenamiento',items:[
      `Para su edad se recomiendan ${sleep} de sueño al día, según la Academia Americana de Medicina del Sueño.`,
      'Mantén el mismo horario también en fin de semana, y que la víspera de un torneo sea una noche tranquila.',
      'Dormir poco se nota en la atención, el ánimo y el rendimiento: si hay varios días seguidos de poco sueño, díselo al coach.']},
    {icon:'💬',title:'Cómo hablar con tu jugador',sub:'Preguntas que abren la plática',items:[
      'Mejor «¿qué fue lo que más disfrutaste hoy?» o «¿qué quieres mejorar?» que «¿por qué fallaste esa bola?».',
      'Reconoce lo que sí depende de él (esfuerzo, actitud, constancia) más que el resultado.',
      'Deja los consejos técnicos al coach: tu papel es ser la persona que lo apoya pase lo que pase.']}
  ];
}
// Avances para el tutor: el diario de los entrenamientos, su mes y cómo apoyarlo en casa (sin repetir lo de Inicio).
const FAM_MOOD=['','😞','😕','😐','🙂','😄'];
function familyProgress(record){
  const id=record.profile.memberId,first=esc(String(record.profile.name||'').trim().split(/\s+/)[0]||'Tu jugador'),today=localDay();
  const pc=peekCheckins(id).player||{},cc=peekCheckins(id).coach||{},rv=record.reviews||{};
  const dayName=d=>{const s=dateLabel(d,{weekday:'long',day:'numeric',month:'short'});return s.charAt(0).toUpperCase()+s.slice(1)};
  const entries=wellDays(10).slice().reverse().filter(d=>pc[d]||cc[d]||rv[d]).slice(0,5);
  const diary=entries.length?entries.map((d,k)=>{
    const p=pc[d]||{},c=cc[d]||{},v=rv[d]||{},went=p.attended===false?false:(p.attended===true||c.attended===true);
    const pips=p.rpe?Array.from({length:10},(_,n)=>`<i class="${n<p.rpe?'on':''}"></i>`).join(''):'';
    const said=p.good||p.missing,saw=c.good||v.good||c.missing||v.focus;
    return `<details class="diary-day" ${k===0?'open':''}><summary><span class="diary-date">${esc(dayName(d))}</span><span class="diary-chips"><span class="chip ${went?'is-ok':'is-no'}">${went?'✓ Asistió':'✗ No asistió'}</span>${p.rpe?`<span class="chip">Esfuerzo ${p.rpe}/10</span>`:''}${p.mood?`<span class="chip">${FAM_MOOD[p.mood]||''} ${esc((MOODS.find(m=>m[0]===Number(p.mood))||[0,''])[1])}</span>`:''}</span></summary>
      ${went===false&&p.reason?`<p class="diary-quote">Motivo: ${esc(p.reason)}</p>`:''}
      ${pips?`<div class="diary-effort" aria-label="Esfuerzo ${p.rpe} de 10">${pips}</div>`:''}
      ${said?`<blockquote class="diary-quote is-player"><b>${first} dijo</b>${p.good?`<p>👍 ${esc(p.good)}</p>`:''}${p.missing?`<p>🔧 ${esc(p.missing)}</p>`:''}</blockquote>`:''}
      ${saw?`<blockquote class="diary-quote is-coach"><b>${esc(c.by||'El coach')} vio</b>${(c.good||v.good)?`<p>✓ ${esc(c.good||v.good)}</p>`:''}${(c.missing||v.focus)?`<p>➜ ${esc(c.missing||v.focus)}</p>`:''}</blockquote>`:''}</details>`;
  }).join(''):`<p class="hint">Aquí aparecerá el diario de cada entrenamiento: cómo se sintió ${first} y qué vio su coach.</p>`;
  // Su mes: evaluación mensual más reciente
  const mrs=Object.entries(record.profile.monthlyReviews||{}).sort(([a],[b])=>b.localeCompare(a))[0];
  const month=mrs?`<section class="card fam-month"><small class="eyebrow">Su mes · ${esc(mrs[0])}</small><div class="fam-month-row"><span class="well-ring is-${mrs[1].score>=70?'ok':mrs[1].score>=50?'mid':'low'}" style="--score:${Number(mrs[1].score)||0}"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="ring-bg" cx="50" cy="50" r="44"/><circle class="ring-fg" cx="50" cy="50" r="44" pathLength="100"/></svg><span><b data-count>${Number(mrs[1].score)||0}</b></span></span><div><h3>Preparado para su objetivo</h3><p>${esc(mrs[1].goal||'')}</p></div></div><p class="hint">${esc(mrs[1].good||'')}</p></section>`:'';
  // Cómo apoyarlo en casa (consejos según lo que pasa esta semana)
  const wr=wellPeek(id),sl=wellDays(4).map(d=>wr[d]?.sleepH).filter(Number.isFinite),sleepAvg=sl.length?sl.reduce((a,b)=>a+b,0)/sl.length:null;
  const pains=wellPains(id),next=((state.playerTournaments||{})[id]||[]).filter(c=>String(c.date)>=today).sort((a,b)=>String(a.date).localeCompare(String(b.date)))[0];
  const nd=next?Math.round((Date.parse(next.date)-Date.parse(today))/864e5):null;
  const focus=(latestPlayerNote(record).focus||'').replace(/[.!]+$/,'');
  const age=(typeof ageFrom==='function'&&record.profile.birthDate)?ageFrom(record.profile.birthDate):null;
  const tips=[];
  if(sleepAvg!==null)tips.push(sleepAvg<7?['😴','Ayúdale a descansar',`Ha dormido ${wellNum(sleepAvg)} h en promedio estos días. Para su edad se recomiendan ${age&&age<=12?'entre 9 y 12':'entre 8 y 10'} h: acostarse un poco antes ayuda mucho.`]:['😴','Va bien con el sueño',`Promedia ${wellNum(sleepAvg)} h. Ayúdale a mantener su horario también en fin de semana.`]);
  if(pains.length&&pains[0].level>=3)tips.push(['🩹','Cuidemos su '+pains[0].area.toLowerCase(),`Reporta ${pains[0].level}/10. Evita sumar partidos o entrenamientos extra esta semana y avisa al coach si aumenta.`]);
  if(next)tips.push(['🏆',nd<=1?'Su torneo es '+(nd===0?'hoy':'mañana'):`Su torneo es en ${nd} días`,`${esc(next.name)}${next.place?' · '+esc(next.place):''}. Cuida el descanso, una comida ligera antes de jugar y que lleve su raqueta, ropa y agua listas.`]);
  if(focus)tips.push(['💬','Para platicar en casa',`Pregúntale cómo va con «${esc(focus)}». Escuchar cómo lo vive vale más que corregirlo.`]);
  const tipsHtml=tips.length?tips.map(t=>`<article class="tip-card"><span class="tip-icon">${t[0]}</span><div><h3>${t[1]}</h3><p>${t[2]}</p></div></article>`).join(''):'<p class="hint">Cuando haya más chequeos, aquí verás consejos para esta semana.</p>';
  return `<div class="flow-week fam-progress"><section class="card"><small class="eyebrow">Diario de entrenamientos</small><h2>Sus últimos días</h2><div class="diary">${diary}</div></section><div class="fam-side">${month}<section class="card"><small class="eyebrow">Para ti</small><h2>Cómo apoyarlo en casa</h2><div class="tips">${tipsHtml}</div></section></div></div>`;
}
function famGuideCard(record){
  const age=(typeof ageFrom==='function'&&record.profile.birthDate)?ageFrom(record.profile.birthDate):null;
  const guide=famGuide(age).map((g,k)=>`<details class="guide-item"><summary><span class="tip-icon">${g.icon}</span><span class="guide-name"><b>${g.title}</b><small>${g.sub}</small></span></summary><ul>${g.items.map(i=>`<li>${i}</li>`).join('')}</ul></details>`).join('');
  const sources=`<p class="hint guide-src">Basado en: <a href="https://www.eurekalert.org/news-releases/685231" target="_blank" rel="noopener">Academia Americana de Medicina del Sueño</a> · <a href="https://doi.org/10.1123/ijsnem.2025-0001" target="_blank" rel="noopener">Declaración de expertos ITF/WTA/ATP sobre nutrición en tenis (2025)</a> · <a href="https://www.sportsdietitians.com.au/" target="_blank" rel="noopener">Sports Dietitians Australia</a> · <a href="https://www.usta.com/en/home/stay-current/texas/ask-a-coach-preparing-for-high-performance-junior-tennis-tournaments.html" target="_blank" rel="noopener">USTA, entrevista a un coach</a>. Son sugerencias generales, no consejos médicos; ante molestias o dudas de alimentación, consulta a un profesional.</p>`;
  return `<section class="card fam-guide"><small class="eyebrow">Para familias</small><h2>Tips y artículos</h2><p class="hint">Qué hacer antes de entrenar, antes de un partido, al comer, al dormir y al platicar. Toca cada momento.</p><div class="guide">${guide}</div>${sources}</section>`;
}
function athleteDetail(record,name){
  const note=latestPlayerNote(record);
  const history=Object.entries(record.reviews||{}).sort(([a],[b])=>b.localeCompare(a));
  const months=Object.entries(record.profile.monthlyReviews||{}).sort(([a],[b])=>b.localeCompare(a));
  // Fondo personalizado: la foto del jugador, oscurecida como los demás fondos de la app.
  const mem=(state.directory||[]).find(m=>m.id===record.profile.memberId),photo=(mem&&mem.photo)||record.profile.photo||'';
  const backdrop=photo?'<div class="academy-backdrop athlete-backdrop" aria-hidden="true"><img class="club-background" src="'+esc(photo)+'" alt=""></div>':'';
  return backdrop+heading(esc(name),'Seguimiento individual · '+esc(record.profile.academy))+wellnessPanel(record.profile.memberId,name,false)+
    `${role==='Tutor'?familyProgress(record):`<div class="flow-week"><section class="card coach-month"><small class="eyebrow">Última observación</small><div class="monthly-gain"><b>✓ Lo que mejoró</b><p>${esc(note.good||'Pendiente de evaluación.')}</p></div><div><b>Siguiente ajuste</b><p>${esc(note.focus||'Pendiente de evaluación.')}</p></div></section>
    <section class="card"><small class="eyebrow">Punto de partida</small><h2>Objetivo del jugador</h2><p>${esc(record.profile.goal||'Aún sin definir.')}</p><h3>Fortalezas iniciales</h3><p>${esc(record.profile.baseline?.strengths||'Pendiente de evaluación.')}</p><h3>Primer aspecto a mejorar</h3><p>${esc(record.profile.baseline?.priority||'Pendiente de evaluación.')}</p>
    ${record.goals.map(g=>`<div class="goal"><h3>${esc(g.title)}</h3><p>${esc(g.detail)}</p><small>${esc(g.progress)} %</small><div class="progress"><i style="width:${Number(g.progress)||0}%"></i></div>${role==='Coach'?`<button class="link" data-student-goal="${g.id}">Actualizar avance</button>`:''}</div>`).join('')}${role==='Coach'?'<button class="link" id="student-goal-add">+ Objetivo</button><button class="link" data-page="student-fees">Revisar mensualidad ↗</button>':''}</section></div>`}
    <div class="trend-gap">${wellnessTrend(record.profile.memberId,false,name)}</div>
    ${role==='Tutor'?famGuideCard(record):`<section class="card"><div class="sectiontitle"><h2>Evaluaciones</h2>${role==='Coach'?'<button class="btn small" id="student-review">Evaluar jugador</button>':''}</div>
    ${[...history,...months].sort(([a],[b])=>b.localeCompare(a)).map(([date,n])=>`<article class="progress-entry"><small>${esc(date)}</small><h3>${esc(n.good)}</h3><p>${esc(n.focus)}</p></article>`).join('')||'<p class="hint">Las observaciones de este jugador aparecerán aquí.</p>'}</section>`}`;
}
function staffProgress(){
  const member=academyPlayers(actor().academy).find(m=>m.id===rosterDetail);
  if(!member)return playerList();
  return '<button class="link" id="all-players">← Mis jugadores</button>'+athleteDetail(athleteFor(member),member.name);
}
// Tarjeta «Mis jugadores» del panel del coach: cada jugador con su foto, su nombre, cómo viene y la última nota del coach.
function coachRosterCard(members){
  const rows=members.slice(0,5).map(m=>{
    const record=athleteFor(m),note=latestPlayerNote(record)||{};
    const reviewed=Object.keys(record.reviews||{}).length||Object.keys(record.profile?.monthlyReviews||{}).length;
    const trend=reviewed&&note.good?['is-up','↗ Mejorando']:note.good?['is-start','Punto de partida']:['is-none','Por evaluar'];
    const goal=(record.goals||[])[0];
    return `<li><button type="button" class="roster-row" data-athlete="${esc(m.id)}">${avatar(m)}<span class="roster-body"><span class="roster-top"><b>${esc(m.name)}</b><span class="trend-chip ${trend[0]}">${trend[1]}</span></span>${wellnessBadge(m.id)}<span class="roster-note">${esc(note.good||'Aún sin evaluación. Abre la ficha para escribir la primera.')}</span>${goal?`<span class="roster-goal"><small>Objetivo · ${esc(goal.title)}</small><span class="roster-bar"><span class="roster-fill" style="width:${Math.max(0,Math.min(100,Number(goal.progress)||0))}%"></span></span></span>`:''}</span></button></li>`;
  }).join('');
  return `<section class="card roster-card"><small class="eyebrow">Seguimiento</small><h2>Mis jugadores · ${members.length}</h2>${members.length?`<ul class="roster-list">${rows}</ul>`:'<p class="hint">Todavía no hay jugadores. Crea un código de acceso para invitar al primero.</p>'}<button class="btn small" data-page="goals">Revisar jugadores</button></section>`;
}
// Resumen de la semana de los pagos privados del coach (clases particulares). Solo lee: no crea nada.
function coachPaymentsCard(){
  const me=actor()?.memberId,week=typeof weekOf==='function'?weekOf(localDay()):localDay();
  const book=(state.privateLessons||[]).find(b=>b.coachId===me)||{students:[]};
  const students=book.students.filter(s=>s.start<=week),row=s=>s.weeks?.[week]||{amount:s.rate,paid:false};
  const paid=students.filter(s=>row(s).paid),sum=list=>list.reduce((t,s)=>t+Number(row(s).amount||0),0);
  let toConfirm=0;for(const list of Object.values(state.privateSent||{}))for(const item of list)if(item.coachId===me&&item.status!=='Pagado')toConfirm++;
  const money=n=>typeof mxn==='function'?mxn(n):'$'+n;
  return `<section class="card coach-payments"><small class="eyebrow">Pagos privados · esta semana</small><h2>Clases particulares</h2>
    ${students.length?`<div class="private-totals"><div><small>Cobrado</small><b>${money(sum(paid))}</b></div><div><small>Pendiente</small><b>${money(sum(students)-sum(paid))}</b></div><div><small>Al corriente</small><b>${paid.length} de ${students.length}</b></div></div>`
      :'<p class="hint">Aquí verás lo que cobras por tus clases particulares. Añade a quienes toman clases contigo.</p>'}
    ${toConfirm?`<p class="coach-payments-alert"><strong>${toConfirm}</strong> ${toConfirm===1?'comprobante por confirmar':'comprobantes por confirmar'}</p>`:''}
    <button class="btn small" data-page="private-payments">${students.length?'Ver pagos privados':'Añadir jugadores'}</button></section>`;
}
function coachHome(){
  const academy=actor().academy,members=academyPlayers(academy),today=localDay();
  return '<div class="heading"><div><h1>Panel del coach</h1><p class="muted">'+esc(academy)+'</p><button class="btn lime heading-cta" id="newsession">+ Crear sesión</button></div><div class="heading-actions">'+headingAvatar()+'</div></div>'+calendarBanner()+
    `<div class="flow-week"><section class="agenda-main"><small class="eyebrow">Plan de hoy</small><h2>Entrenamientos del grupo</h2>${sessionsFor(today).map(sessionSummary).join('')||'<p class="hint">No hay sesiones programadas para hoy.</p>'}<button class="link" data-page="calendar">Ver plan de la academia ↗</button></section>${coachRosterCard(members)}</div>`+coachCheckinCard()+`<div class="flow-week coach-pair">${meetingCard()}${coachPaymentsCard()}</div>`;
}
// Tarjeta de seguimiento para el tutor: cómo va su jugador al entrenar y al competir.
let famTab='avance';
const FAM_LEVEL={green:'Buen camino',yellow:'Casi, con detalles',red:'Necesita tu apoyo',none:'Falta de datos'};
function familyFollowCard(member){
  const id=member.id,today=localDay(),first=esc(String(member.name||'').trim().split(/\s+/)[0]||'tu jugador');
  const record=athleteFor(member),note=latestPlayerNote(record);
  const st=typeof playerStatus==='function'?playerStatus(id):{level:'none',reason:'',score:null};
  // Asistencia de los últimos 14 días (según la encuesta que contesta el jugador)
  const pc=(typeof peekCheckins==='function'?peekCheckins(id).player:null)||{};let went=0,missed=0;
  for(const d of (typeof wellDays==='function'?wellDays(14):[])){const c=pc[d];if(!c)continue;if(c.attended===false)missed++;else went++}
  const total=went+missed,pct=total?Math.round(went/total*100):null;
  // Racha de chequeos diarios
  const wr=typeof wellPeek==='function'?wellPeek(id):{};let streak=0;
  for(let i=0;i<400;i++){const r=wr[dateAfter(today,-i)];if(r&&readiness(r)!==null)streak++;else if(i===0)continue;else break}
  const pains=typeof wellPains==='function'?wellPains(id):[];
  const comps=((state.playerTournaments||{})[id]||[]).filter(c=>String(c.date)>=today).sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(0,3);
  const goals=(record.goals||[]).slice(0,3);
  const days=d=>{const n=Math.round((Date.parse(d)-Date.parse(today))/864e5);return n===0?'hoy':n===1?'mañana':'en '+n+' días'};
  const score=st.score,cls=typeof wellClass==='function'?wellClass(score):'none';
  const tabs=[['avance','Último avance'],['metas','Objetivos'],['torneos','Torneos']];
  return `<section class="card fam-card" data-fam>
    <div class="fam-head"><div>${avatar(member)}</div><div><small class="eyebrow">Seguimiento de ${esc(member.name)}</small><h2>Cómo va ${first}</h2></div><span class="fam-level is-${st.level}">${FAM_LEVEL[st.level]||FAM_LEVEL.none}</span></div>
    ${pains.length?`<p class="fam-alert">🩹 Molestia: <b>${esc(pains[0].area)} ${pains[0].level}/10</b>. Tu coach la ve en su panel.</p>`:''}
    <div class="fam-stats">
      <div class="fam-stat"><small>Asistencia · 14 días</small><b>${pct===null?'—':`<span data-count>${pct}</span>%`}</b><span class="fam-bar"><i style="width:${pct||0}%"></i></span><em>${total?`Fue a ${went} de ${total} entrenamientos`:'Aún sin entrenamientos registrados'}</em></div>
      <div class="fam-stat"><small>Preparación · último chequeo</small><span class="well-ring is-${cls}" style="--score:${score===null?0:score}"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="ring-bg" cx="50" cy="50" r="44"/><circle class="ring-fg" cx="50" cy="50" r="44" pathLength="100"/></svg><span>${score===null?'<b>—</b>':`<b data-count>${score}</b>`}</span></span><em>${esc(st.reason||'Sin chequeos recientes')}</em></div>
      <div class="fam-stat"><small>Racha de chequeos</small><b><i class="flame">🔥</i> <span data-count>${streak}</span></b><em>${streak===1?'día seguido':'días seguidos'} cuidándose</em></div>
    </div>
    <div class="fam-tabs" role="tablist">${tabs.map(([k,l])=>`<button type="button" role="tab" data-fam-tab="${k}" aria-selected="${famTab===k}">${l}</button>`).join('')}</div>
    <div class="fam-panel" data-fam-panel="avance" ${famTab==='avance'?'':'hidden'}>
      <p class="fam-line is-good"><span>✓</span><span><b>Lo que mejoró</b><br>${esc(note.good||'Aún no hay evaluación del coach.')}</span></p>
      <p class="fam-line is-next"><span>➜</span><span><b>Siguiente paso</b><br>${esc(note.focus||'Pendiente de evaluación.')}</span></p>
    </div>
    <div class="fam-panel" data-fam-panel="metas" ${famTab==='metas'?'':'hidden'}>
      ${goals.length?goals.map(g=>`<div class="fam-goal"><div><b>${esc(g.title)}</b><small>${esc(Number(g.progress)||0)} %</small></div><span class="fam-bar"><i style="width:${Math.max(0,Math.min(100,Number(g.progress)||0))}%"></i></span></div>`).join(''):'<p class="hint">Todavía no hay objetivos.</p>'}
    </div>
    <div class="fam-panel" data-fam-panel="torneos" ${famTab==='torneos'?'':'hidden'}>
      ${comps.length?comps.map(c=>`<div class="fam-comp"><span class="fam-when">${days(c.date)}</span><div><b>${esc(c.name)}</b><small>${esc(c.place||'')}${c.mode?' · '+esc(c.mode):''}</small></div>${typeof impBadge==='function'?impBadge(c.priority):''}</div>`).join(''):`<p class="hint">${first} no tiene torneos próximos.</p>`}
    </div>
    <div class="fam-links"><button class="link" data-page="goals">Ver avances ↗</button><button class="link" data-page="calendar">Ver plan y torneos ↗</button></div></section>`;
}
document.addEventListener('click',event=>{
  const b=event.target.closest?.('[data-fam-tab]');if(!b)return;
  const box=b.closest('[data-fam]');if(!box)return;
  famTab=b.dataset.famTab;
  box.querySelectorAll('[data-fam-tab]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));
  box.querySelectorAll('[data-fam-panel]').forEach(p=>{p.hidden=p.dataset.famPanel!==famTab});
});
function familyHome(){
  const member=academyPlayers(actor().academy).find(m=>m.id===actor().childId);
  const note=latestPlayerNote(athleteFor(member));
  return heading('Inicio familiar',esc(member.name)+' · '+esc(member.academy),'<div class="heading-actions">'+headingAvatar()+'</div>')+calendarBanner()+
    '<div class="portal-grid">'+nextSessionCard()+'<section class="card"><small class="eyebrow">Mensualidad</small><h2>'+esc(feeStatus(feeLedger(),localDay().slice(0,7)))+'</h2><button class="link" data-page="payments">Ver pagos ↗</button></section></div>'+
    '<div class="flow-week">'+familyFollowCard(member)+meetingCard()+'</div>'+rainNotice();
}
function adultProfile(){
  const a=actor();
  return heading('Mi perfil',role)+`<section class="card"><h2>${esc(a.name)}</h2><p>${esc(a.academy)}</p>${photoEditor()}${role==='Tutor'?'<p>Jugador vinculado · '+esc(state.profile.name)+'</p>':''}${role==='Coach'?'<button class="btn light small" data-page="private-payments">Pagos privados ↗</button> '+(planLocked()?lockCard('Respaldo descargable','Los datos de tu academia en un archivo, cuando los necesites.'):'<button class="btn light small" id="backup-download">Descargar respaldo de la academia</button><p class="hint" id="backup-stamp">'+backupStamp()+'</p>'):''}<button class="link" id="account-setup">Editar datos</button><hr class="divider"><div class="account-links"><button class="link" id="profile-signout">Cerrar sesión</button><button class="link danger-link" id="delete-account">Borrar mi cuenta</button></div></section>`;
}
function bindRoleActions(){
  bindPrivatePayments();
  bindStudentTrend();
  if($('#account-setup'))$('#account-setup').onclick=()=>adultSetup(actor());
  document.querySelectorAll('[data-athlete]').forEach(b=>b.onclick=()=>{rosterDetail=b.dataset.athlete;page='goals';render();window.scrollTo(0,0)});
  if($('#all-players'))$('#all-players').onclick=()=>{rosterDetail='';render()};
  if($('#roster-add'))$('#roster-add').onclick=()=>editMember(null,'Jugador');
  if(role==='Coach'&&rosterDetail){
    const member=academyPlayers(actor().academy).find(m=>m.id===rosterDetail);
    if(member){
      const record=athleteFor(member);
      if($('#student-goal-add'))$('#student-goal-add').onclick=()=>modal('Objetivo de '+esc(member.name),field('Objetivo','title')+field('Cómo medir el avance','detail'),data=>record.goals.push({...data,id:Date.now(),progress:0}));
      document.querySelectorAll('[data-student-goal]').forEach(button=>button.onclick=()=>{
        const goal=record.goals.find(g=>String(g.id)===button.dataset.studentGoal);
        modal('Avance de '+esc(member.name),'<label>Progreso (%)<input required type="number" min="0" max="100" name="value" value="'+esc(goal.progress)+'"></label>',data=>{goal.progress=Number(data.value)});
      });
    }
  }
  if($('#student-review'))$('#student-review').onclick=()=>{
    const member=academyPlayers(actor().academy).find(m=>m.id===rosterDetail);
    if(!member)return;
    const record=athleteFor(member),today=localDay(),old=record.reviews[today]||{};
    const month=today.slice(0,7);
    const monthly=record.profile.monthlyReviews||{};
    modal('Evaluar a '+esc(member.name),'<label>Mes evaluado<input required type="month" name="month" max="'+month+'" value="'+month+'"></label><label>Preparación para el objetivo (%)<input required type="number" min="0" max="100" step="1" name="score"></label><label class="full">Objetivo evaluado<textarea name="goal" maxlength="400" required></textarea></label><label class="full">Qué hizo bien<textarea name="good" maxlength="600" required></textarea></label><label class="full">Qué trabajar después<textarea name="focus" maxlength="600" required></textarea></label>'+videoPickField(''),data=>{
      const score=Number(data.score);
      if(!Number.isInteger(score)||score<0||score>100||data.month>month)return false;
      record.profile.monthlyReviews??={};
      record.profile.monthlyReviews[data.month]={score,goal:data.goal,good:data.good,focus:data.focus,video:data.video||''};
      if(data.month===month){
        record.profile.goal=data.goal;
        record.profile.baseline??={date:today,strengths:data.good,priority:data.focus};
        record.reviews[today]={...old,good:data.good,focus:data.focus,video:data.video||''};
      }
    });
    const inputs=$('#modalform').elements;
    function loadMonth(){
      const item=monthly[inputs.month.value]||{};
      inputs.score.value=item.score??'';
      inputs.goal.value=item.goal??record.profile.goal??'';
      inputs.good.value=item.good??(inputs.month.value===month?old.good||'':'');
      inputs.focus.value=item.focus??(inputs.month.value===month?old.focus||'':'');
      if(inputs.video)inputs.video.value=item.video??(inputs.month.value===month?old.video||'':'');
    }
    inputs.month.onchange=loadMonth;loadMonth();
  };
}
function switchAgenda(academy){
  const current=state.agendaAcademy||state.profile?.academy;
  state.agendaAcademy=academy;
  if(!current||current===academy)return;
  state.agendaArchives??=[];
  const keys=['sessions','competition','comments','exercises','videos','rainExample','weekStart','exampleTournament'];
  const previous={academy:current};
  for(const key of keys)previous[key]=state[key];
  state.agendaArchives=state.agendaArchives.filter(g=>g.academy!==current);
  state.agendaArchives.push(previous);
  const next=state.agendaArchives.find(g=>g.academy===academy)||seed();
  for(const key of keys)state[key]=next[key];
  initAgenda();agendaDate=localDay();
}
function studentTrend(record,name,selectedMonth){
  const series=Object.entries(record.profile.monthlyReviews||{}).filter(([month,r])=>/^\d{4}-(0[1-9]|1[0-2])$/.test(month)&&Number.isFinite(r.score)).sort(([a],[b])=>a.localeCompare(b));
  const chosen=series.find(([month])=>month===selectedMonth)||series.at(-1);
  const ordinal=m=>Number(m.slice(0,4))*12+Number(m.slice(5));
  const x=m=>series.length<2?320:45+540*(ordinal(m)-ordinal(series[0][0]))/(ordinal(series.at(-1)[0])-ordinal(series[0][0]));
  const y=n=>156-n*1.35;
  const grid=[0,25,50,75,100].map(n=>`<line x1="45" x2="585" y1="${y(n)}" y2="${y(n)}" class="chart-grid"/><text x="35" y="${y(n)+3}" text-anchor="end">${n}%</text>`).join('');
  return `<section class="card annual-example" id="student-trend"><small class="eyebrow">Seguimiento individual · ${esc(name)}</small><h2>Evolución mensual</h2><p class="hint">Preparación para el objetivo según las evaluaciones del coach.</p><svg class="annual-chart" role="img" aria-label="Gráfica de preparación de ${esc(name)}" viewBox="0 0 620 175">${grid}<polyline class="chart-line" points="${series.map(([m,r])=>x(m)+','+y(r.score)).join(' ')}"/>${series.map(([m,r])=>`<g class="chart-point" data-period="${m}"><circle cx="${x(m)}" cy="${y(r.score)}" r="14" class="chart-hit"/><circle cx="${x(m)}" cy="${y(r.score)}" r="${m===chosen[0]?6:4}" class="chart-dot${m===chosen[0]?' selected':''}"/></g>`).join('')}</svg>
  ${chosen?`<div class="chart-months">${series.map(([m,r])=>`<button data-period="${m}" aria-pressed="${chosen[0]===m}"><small>${esc(dateLabel(m+'-01',{month:'short',year:'2-digit'}))}</small><b>${r.score} %</b></button>`).join('')}</div><div class="month-observation" aria-live="polite"><b>${esc(dateLabel(chosen[0]+'-01',{month:'long',year:'numeric'}))} · ${chosen[1].score} %</b><p>Objetivo · ${esc(chosen[1].goal||record.profile.goal)}</p><b>Lo que mejoró</b><p>${esc(chosen[1].good)}</p><b>Siguiente ajuste</b><p>${esc(chosen[1].focus)}</p></div>`:'<p class="hint">Todavía no hay porcentajes registrados para este jugador. La primera evaluación mensual añadirá el primer punto.</p>'}
  ${role==='Coach'?'<button class="btn small" id="trend-assess">Evaluar un mes</button>':''}</section>`;
}
function bindStudentTrend(){
  const panel=$('#student-trend');if(!panel)return;
  panel.onclick=e=>{
    if(e.target.closest('#trend-assess')){$('#student-review')?.click();return}
    const control=e.target.closest('[data-period]');if(!control)return;
    const id=role==='Coach'?rosterDetail:actor().childId;
    const member=academyPlayers(actor().academy).find(m=>m.id===id);if(!member)return;
    panel.outerHTML=studentTrend(athleteFor(member),member.name,control.dataset.period);
    bindStudentTrend();
    $('#student-trend button[data-period="'+control.dataset.period+'"]')?.focus({preventScroll:true});
  };
}
