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
function roleNav(){
  const labels=role==='Coach'?['Panel del coach','Plan de la academia','Mis jugadores','Mi academia','Citas']:role==='Tutor'?['Inicio familiar','Agenda','Avances','Mi academia','Mensualidad']:['Inicio','Mi plan','Análisis del coach','Mi academia','Mensualidad'];
  return [['home','home'],['calendar','calendar'],['goals','target'],['team','user'],[role==='Coach'?'appointments':'payments',role==='Coach'?'calendar':'wallet']].map(([id,i],n)=>[id,i,labels[n]]).concat(role==='Coach'?[['private-payments','wallet','Pagos privados']]:[]).concat([['profile','profile','Mi perfil']]);
}
function pickRole(mode){
  entry='access';
  const last=state.lastRole||'Jugador';
  const t=coverText;
  const labels={Jugador:'Player',Coach:'Coach',Tutor:'Guardian'};
  const descriptions={Jugador:'Training, goals and progress.',Coach:'Plan sessions and support your players.',Tutor:'View your player’s schedule and progress.'};
  accessScene('access-screen',`${coverSelector()}<section class="access-panel"><small class="eyebrow">CORDA · ${t('Acceso local','Local demo','Démo locale')}</small><h1>${t('¿Cómo vas a entrar?','Choose your role','Choisissez votre profil')}</h1><p>${t('Elige el perfil que usarás en la academia.','Choose your academy profile.','Choisissez le profil que vous utiliserez à l’académie.')}</p><div class="access-roles">${roleNames.map(r=>`<button data-enter-role="${r}"><strong>${t(r,labels[r],{Jugador:'Joueur',Coach:'Coach',Tutor:'Parent'}[r])}</strong><small>${t(roleDescriptions[r],descriptions[r],{Jugador:'Entraînements, objectifs et progression.',Coach:'Planifiez les séances et accompagnez vos joueurs.',Tutor:'Consultez le programme et les progrès de votre joueur.'}[r])}</small>${state.lastRole&&r===last?`<small>${t('Último perfil utilizado','Last profile used','Dernier profil utilisé')}</small>`:''}</button>`).join('')}</div><button class="access-back">← ${t('Inicio','Home','Accueil')}</button></section>`);
  bindCoverLanguage(()=>pickRole(mode));
  $('.access-back').onclick=()=>mode==='register'?pickRole('register'):signInScreen();
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
    (members.length?`<div class="athlete-list">${members.map(m=>{
      const record=athleteFor(m),note=latestPlayerNote(record);
      return `<article class="card"><div class="row">${avatar(m)}<h2><button class="athlete-name" data-athlete="${esc(m.id)}">${esc(m.name)}</button></h2></div><small>Fortaleza observada</small><p>${esc(note.good||'Por evaluar')}</p><small>Siguiente ajuste</small><p>${esc(note.focus||'Por evaluar')}</p><button class="link" data-athlete="${esc(m.id)}">Ver seguimiento ↗</button></article>`;
    }).join('')}</div>`:'<section class="card"><h2>Tu primer jugador</h2><p class="hint">Añade un jugador para registrar su punto de partida y seguir sus objetivos.</p></section>');
}
function athleteDetail(record,name){
  const note=latestPlayerNote(record);
  const history=Object.entries(record.reviews||{}).sort(([a],[b])=>b.localeCompare(a));
  const months=Object.entries(record.profile.monthlyReviews||{}).sort(([a],[b])=>b.localeCompare(a));
  return heading(esc(name),'Seguimiento individual · '+esc(record.profile.academy))+progressHub(record.profile.memberId,record.profile.goal,name)+
    `<div class="flow-week"><section class="card coach-month"><small class="eyebrow">Última observación</small><div class="monthly-gain"><b>✓ Lo que mejoró</b><p>${esc(note.good||'Pendiente de evaluación.')}</p></div><div><b>Siguiente ajuste</b><p>${esc(note.focus||'Pendiente de evaluación.')}</p></div></section>
    <section class="card"><small class="eyebrow">Punto de partida</small><h2>Objetivo del jugador</h2><p>${esc(record.profile.goal||'Aún sin definir.')}</p><h3>Fortalezas iniciales</h3><p>${esc(record.profile.baseline?.strengths||'Pendiente de evaluación.')}</p><h3>Primer aspecto a mejorar</h3><p>${esc(record.profile.baseline?.priority||'Pendiente de evaluación.')}</p>
    ${record.goals.map(g=>`<div class="goal"><h3>${esc(g.title)}</h3><p>${esc(g.detail)}</p><small>${esc(g.progress)} %</small><div class="progress"><i style="width:${Number(g.progress)||0}%"></i></div>${role==='Coach'?`<button class="link" data-student-goal="${g.id}">Actualizar avance</button>`:''}</div>`).join('')}${role==='Coach'?'<button class="link" id="student-goal-add">+ Objetivo</button><button class="link" data-page="student-fees">Revisar mensualidad ↗</button>':''}</section></div>
    <section class="card"><div class="sectiontitle"><h2>Evaluaciones</h2>${role==='Coach'?'<button class="btn small" id="student-review">Evaluar jugador</button>':''}</div>
    ${[...history,...months].sort(([a],[b])=>b.localeCompare(a)).map(([date,n])=>`<article class="progress-entry"><small>${esc(date)}</small><h3>${esc(n.good)}</h3><p>${esc(n.focus)}</p></article>`).join('')||'<p class="hint">Las observaciones de este jugador aparecerán aquí.</p>'}</section>`;
}
function staffProgress(){
  const member=academyPlayers(actor().academy).find(m=>m.id===rosterDetail);
  if(!member)return playerList();
  return '<button class="link" id="all-players">← Mis jugadores</button>'+athleteDetail(athleteFor(member),member.name);
}
function coachHome(){
  const academy=actor().academy,members=academyPlayers(academy),today=localDay();
  return heading('Panel del coach',esc(academy),'<button class="btn lime" id="newsession">+ Crear sesión</button>')+calendarBanner()+
    `<div class="flow-week"><section class="agenda-main"><small class="eyebrow">Plan de hoy</small><h2>Entrenamientos del grupo</h2>${sessionsFor(today).map(sessionSummary).join('')||'<p class="hint">No hay sesiones programadas para hoy.</p>'}<button class="link" data-page="calendar">Ver plan de la academia ↗</button></section><section class="card"><small class="eyebrow">Seguimiento</small><h2>Mis jugadores · ${members.length}</h2><p class="hint">Abre una ficha para revisar el objetivo y escribir una corrección individual.</p><button class="btn small" data-page="goals">Revisar jugadores</button></section></div>`+coachCheckinCard()+meetingCard();
}
function familyHome(){
  const member=academyPlayers(actor().academy).find(m=>m.id===actor().childId);
  const note=latestPlayerNote(athleteFor(member));
  return heading('Inicio familiar',esc(member.name)+' · '+esc(member.academy))+calendarBanner()+
    '<div class="portal-grid">'+nextSessionCard()+'<section class="card"><small class="eyebrow">Mensualidad</small><h2>'+esc(feeStatus(feeLedger(),localDay().slice(0,7)))+'</h2><button class="link" data-page="payments">Ver pagos ↗</button></section></div>'+
    '<div class="flow-week"><section class="card"><small class="eyebrow">Seguimiento de '+esc(member.name)+'</small><h2>Último avance</h2><p>'+esc(note.good||'Aún no hay evaluación del coach.')+'</p><p>'+esc(note.focus||'')+'</p><button class="link" data-page="goals">Ver avances ↗</button></section>'+meetingCard()+'</div>'+rainNotice();
}
function adultProfile(){
  const a=actor();
  return heading('Mi perfil',role)+`<section class="card"><h2>${esc(a.name)}</h2><p>${esc(a.academy)}</p>${role==='Tutor'?'<p>Jugador vinculado · '+esc(state.profile.name)+'</p>':''}${role==='Coach'?'<button class="btn light small" data-page="private-payments">Pagos privados ↗</button> <button class="btn light small" id="backup-download">Descargar respaldo de la academia</button><p class="hint" id="backup-stamp">'+backupStamp()+'</p>':''}<button class="link" id="account-setup">Editar datos</button></section>`;
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
    modal('Evaluar a '+esc(member.name),'<label>Mes evaluado<input required type="month" name="month" max="'+month+'" value="'+month+'"></label><label>Preparación para el objetivo (%)<input required type="number" min="0" max="100" step="1" name="score"></label><label class="full">Objetivo evaluado<textarea name="goal" maxlength="400" required></textarea></label><label class="full">Qué hizo bien<textarea name="good" maxlength="600" required></textarea></label><label class="full">Qué trabajar después<textarea name="focus" maxlength="600" required></textarea></label>',data=>{
      const score=Number(data.score);
      if(!Number.isInteger(score)||score<0||score>100||data.month>month)return false;
      record.profile.monthlyReviews??={};
      record.profile.monthlyReviews[data.month]={score,goal:data.goal,good:data.good,focus:data.focus};
      if(data.month===month){
        record.profile.goal=data.goal;
        record.profile.baseline??={date:today,strengths:data.good,priority:data.focus};
        record.reviews[today]={...old,good:data.good,focus:data.focus};
      }
    });
    const inputs=$('#modalform').elements;
    function loadMonth(){
      const item=monthly[inputs.month.value]||{};
      inputs.score.value=item.score??'';
      inputs.goal.value=item.goal??record.profile.goal??'';
      inputs.good.value=item.good??(inputs.month.value===month?old.good||'':'');
      inputs.focus.value=item.focus??(inputs.month.value===month?old.focus||'':'');
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
