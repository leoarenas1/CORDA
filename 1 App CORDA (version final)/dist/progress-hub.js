// Mi progreso: encuesta diaria del jugador, evaluación diaria del coach y tres gráficas.
// El 100 % es la meta que el jugador escribió al registrarse (state.profile.goal).
// Datos: state.checkins[memberId] = {player:{'AAAA-MM-DD':{score,mood,good,missing}}, coach:{...:{score,good,missing,by}}}
// La "notificación" es un aviso dentro de la app al abrirla después del entrenamiento.
// Para avisos con la app cerrada (push) hace falta un servidor; este prototipo no tiene.
const HUB_PERIODS={
  day:{label:'Diario',unit:'por día'},
  week:{label:'Semanal',unit:'por semana'},
  month:{label:'Mensual',unit:'por mes'},
  quarter:{label:'Trimestral',unit:'por trimestre'},
  year:{label:'Anual',unit:'por año'}
};
const MOODS=[[1,'Sin energía'],[2,'Con cansancio'],[3,'Normal'],[4,'Bien'],[5,'Excelente']];
let hubPeriod='week',hubPick=null,hubArgs=null,hubKeys=[];

const peekCheckins=id=>state.checkins?.[id]||{player:{},coach:{}};
function checkinStore(id){
  state.checkins??={};
  const store=state.checkins[id]??={};
  store.player??={};store.coach??={};
  return store;
}

// ---------- Periodos ----------
const mondayOf=day=>dateAfter(day,-((new Date(day+'T12:00:00').getDay()+6)%7));
function bucketKey(day,period){
  if(period==='day')return day;
  if(period==='week')return mondayOf(day);
  if(period==='month')return day.slice(0,7);
  if(period==='quarter')return day.slice(0,4)+'-T'+(Math.floor((Number(day.slice(5,7))-1)/3)+1);
  return day.slice(0,4);
}
function windowStart(period,today){
  const d=new Date(today+'T12:00:00');d.setDate(1);
  if(period==='day')return dateAfter(today,-13);
  if(period==='week')return dateAfter(mondayOf(today),-49);
  if(period==='month'){d.setMonth(d.getMonth()-11);return localDay(d)}
  if(period==='quarter'){d.setMonth(Math.floor(d.getMonth()/3)*3-15);return localDay(d)}
  return (d.getFullYear()-4)+'-01-01';
}
function bucketLabel(key,period){
  if(period==='day')return dateLabel(key,{day:'numeric',month:'short'});
  if(period==='week')return 'Sem. '+dateLabel(key,{day:'numeric',month:'short'});
  if(period==='month')return dateLabel(key+'-01',{month:'short',year:'2-digit'});
  if(period==='quarter')return key.slice(5)+' · '+key.slice(0,4);
  return key;
}
function bucketLong(key,period){
  if(period==='day')return dateLabel(key,{weekday:'long',day:'numeric',month:'long'});
  if(period==='week')return 'Semana del '+dateLabel(key,{day:'numeric',month:'long'});
  if(period==='month')return dateLabel(key+'-01',{month:'long',year:'numeric'});
  if(period==='quarter')return 'Trimestre '+key.slice(6)+' de '+key.slice(0,4);
  return 'Año '+key;
}

// ---------- Datos ----------
// Ejemplo para presentar el prototipo mientras el jugador no tiene respuestas propias.
let exampleCache=null;
function exampleCheckins(){
  const today=localDay();
  if(exampleCache?.today===today)return exampleCache;
  let seed=11;const rnd=()=>(seed=(seed*9301+49297)%233280)/233280;
  const near5=n=>Math.max(5,Math.min(100,Math.round(n/5)*5));
  const pGood=['Me sentí suelto con la derecha.','Saqué con más confianza.','Aguanté los peloteos largos.','Me concentré mejor entre puntos.','Llegué bien parado a las bolas abiertas.'];
  const pMissing=['Me faltó profundidad con el revés.','Me cansé en la última media hora.','El segundo saque se me quedó corto.','Me costó la calma con el marcador en contra.','Llegué tarde a las bolas cortas.'];
  const cGood=['Mejor colocación de pies antes de golpear.','Rutina entre puntos más constante.','Más altura sobre la red en el segundo saque.','Buena recuperación al centro tras el revés.','Eligió mejor cuándo acelerar.'];
  const cMissing=['Falta profundidad con el marcador en contra.','Debe preparar antes el revés.','Más efecto en el segundo saque.','Sostener la intensidad hasta el final.','Atacar más las bolas cortas.'];
  const player={},coach={},total=420;
  for(let i=total;i>=1;i--){
    const day=dateAfter(today,-i),weekday=new Date(day+'T12:00:00').getDay();
    if(![1,2,4,5,6].includes(weekday))continue;
    const t=(total-i)/total,base=26+58*t-5*Math.sin(t*10);
    const pick=list=>list[Math.floor(rnd()*list.length)];
    player[day]={score:near5(base+6+(rnd()-.5)*18),mood:Math.max(1,Math.min(5,Math.round(2.4+2*t+(rnd()-.5)*2))),good:pick(pGood),missing:pick(pMissing)};
    coach[day]={score:near5(base+(rnd()-.5)*8),good:pick(cGood),missing:pick(cMissing),by:'Coach de ejemplo'};
  }
  return exampleCache={today,player,coach};
}
function hubTournaments(example){
  const today=localDay(),list=(state.competition||[]).map(c=>({...c}));
  if(example){
    list.push({name:'Copa de invierno',place:'Ejemplo',date:dateAfter(today,-250)},{name:'Abierto de verano',place:'Ejemplo',date:dateAfter(today,-130)},{name:'Torneo de otoño',place:'Ejemplo',date:dateAfter(today,-12)});
    if(!list.some(c=>c.date>today)&&state.exampleTournament)list.push({...state.exampleTournament});
  }
  return list.sort((a,b)=>a.date.localeCompare(b.date));
}
function hubData(id){
  const store=peekCheckins(id);
  if(Object.keys(store.player||{}).length||Object.keys(store.coach||{}).length)return {example:false,player:store.player||{},coach:store.coach||{},tournaments:hubTournaments(false)};
  return {example:true,...exampleCheckins(),tournaments:hubTournaments(true)};
}
// Agrupa respuestas diarias en el periodo elegido: el porcentaje es el promedio.
function hubSeries(entries,period,start,today){
  const groups={};
  for(const [day,e] of Object.entries(entries)){
    if(day<start||day>today||!Number.isFinite(Number(e.score)))continue;
    (groups[bucketKey(day,period)]??=[]).push({day,...e,score:Number(e.score)});
  }
  return Object.fromEntries(Object.entries(groups).map(([key,list])=>{
    list.sort((a,b)=>a.day.localeCompare(b.day));
    return [key,{value:Math.round(list.reduce((sum,e)=>sum+e.score,0)/list.length),count:list.length,list}];
  }));
}
const pts=n=>n+(n===1?' punto':' puntos');
const lastNote=(series,field)=>Object.keys(series).sort().reverse().flatMap(k=>[...series[k].list].reverse()).find(e=>e[field])?.[field]||'';

// ---------- Interfaz ----------
function hubChart(keys,pick,lines,tKeys,label){
  const n=keys.length,x=i=>n===1?335:44+i*583/(n-1),y=v=>160-v*1.38;
  const grid=[0,25,50,75,100].map(v=>`<line x1="44" x2="627" y1="${y(v)}" y2="${y(v)}" class="chart-grid${v===100?' chart-goal':''}"/><text x="35" y="${y(v)+4}" text-anchor="end">${v===100?'Meta':v+'%'}</text>`).join('');
  const every=Math.ceil(n/6);
  const ticks=keys.map((k,i)=>(i%every===0||i===n-1)&&!(i!==n-1&&n-1-i<every)?`<text x="${x(i)}" y="186" text-anchor="${n>1&&i===n-1?'end':n>1&&i===0?'start':'middle'}">${esc(bucketLabel(k,hubPeriod))}</text>`:'').join('');
  const marks=keys.map((k,i)=>tKeys[k]?`<g class="chart-tourney"><line x1="${x(i)}" x2="${x(i)}" y1="${y(100)-6}" y2="${y(0)}"/><circle cx="${x(i)}" cy="${y(100)-8}" r="5"/><title>${esc(tKeys[k].map(t=>t.name).join(', '))}</title></g>`:'').join('');
  const guide=keys.includes(pick)?`<line class="chart-guide" x1="${x(keys.indexOf(pick))}" x2="${x(keys.indexOf(pick))}" y1="${y(100)}" y2="${y(0)}"/>`:'';
  const series=lines.map(line=>{
    const pts=keys.map((k,i)=>line.map[k]?[i,line.map[k].value,k]:null).filter(Boolean);
    return `${pts.length>1?`<polyline class="chart-line ${line.cls}" points="${pts.map(([i,v])=>x(i)+','+y(v)).join(' ')}"/>`:''}${pts.map(([i,v,k])=>`<g class="chart-point" data-bucket="${k}"><circle cx="${x(i)}" cy="${y(v)}" r="14" class="chart-hit"/><circle cx="${x(i)}" cy="${y(v)}" r="${k===pick?6:3.5}" class="chart-dot ${line.cls}${k===pick?' selected':''}"/></g>`).join('')}`;
  }).join('');
  return `<svg class="annual-chart hub-svg" viewBox="0 0 650 195" role="img" aria-label="${esc(label)}">${grid}${marks}${guide}${series}${ticks}</svg>`;
}
function progressHub(id,goal,name){
  hubArgs=[id,goal,name];
  const self=!name,today=localDay(),period=HUB_PERIODS[hubPeriod],start=windowStart(hubPeriod,today);
  const data=hubData(id);
  const player=hubSeries(data.player,hubPeriod,start,today),coach=hubSeries(data.coach,hubPeriod,start,today);
  const tKeys={};data.tournaments.filter(t=>t.date>=start&&t.date<=today).forEach(t=>(tKeys[bucketKey(t.date,hubPeriod)]??=[]).push(t));
  const keys=[...new Set([...Object.keys(player),...Object.keys(coach),...Object.keys(tKeys)])].sort();
  const pick=keys.includes(hubPick)?hubPick:keys.at(-1);
  hubKeys=keys;hubPick=pick||null;
  const both=k=>[player[k]?.value,coach[k]?.value].filter(Number.isFinite);
  const combined=k=>{const v=both(k);return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length):null};
  const scored=keys.filter(k=>combined(k)!==null),current=scored.length?combined(scored.at(-1)):null,previous=scored.length>1?combined(scored.at(-2)):null;
  const shared=keys.filter(k=>player[k]&&coach[k]);
  const gap=shared.length?Math.round(shared.reduce((s,k)=>s+player[k].value-coach[k].value,0)/shared.length):null;
  const next=data.tournaments.find(t=>t.date>today);
  const you=self?'Tú':esc(name.split(' ')[0]);
  const delta=current!==null&&previous!==null?current-previous:null;
  const trend=delta===null?'':delta>0?`<li><span class="hub-up" aria-hidden="true">▲</span> Subió ${pts(delta)} respecto al periodo anterior.</li>`:delta<0?`<li><span class="hub-down" aria-hidden="true">▼</span> Bajó ${pts(-delta)} respecto al periodo anterior.</li>`:'<li>Igual que el periodo anterior.</li>';
  const agreement=gap===null?'Cuando haya respuestas de ambos en el mismo periodo, aquí verás si coinciden.':Math.abs(gap)<=7?`Van en sintonía: ${self?'tu sensación y la de tu coach':'jugador y coach'} difieren ${pts(Math.abs(gap))} en promedio.`:gap>0?`${self?'Te ves '+pts(gap)+' más arriba que tu coach':'La sensación del jugador está '+pts(gap)+' arriba del coach'}. Vale la pena platicarlo.`:self?`Tu coach te ve ${pts(-gap)} más arriba de lo que tú te sientes. Vas mejor de lo que crees.`:`La evaluación del coach está ${pts(-gap)} arriba de la sensación del jugador.`;
  const today_=peekCheckins(id);
  const cta=self&&role==='Jugador'?(today_.player?.[today]?'<button class="link" data-open-checkin>Editar mi respuesta de hoy</button>':'<button class="btn lime" data-open-checkin>Cómo me fue hoy</button>'):role==='Coach'?`<button class="btn" data-coach-checkin="${esc(id)}">${today_.coach?.[today]?'Editar evaluación de hoy':'Evaluar hoy'}</button>`:'';
  const options=Object.entries(HUB_PERIODS).map(([k,p])=>`<option value="${k}" ${k===hubPeriod?'selected':''}>${p.label}</option>`).join('');
  const lineP={cls:'is-player',map:player},lineC={cls:'is-coach',map:coach};
  const empty=msg=>`<p class="hint hub-empty">${msg}</p>`;
  const detail=pick?`<div class="month-observation hub-detail" aria-live="polite"><div class="hub-step"><button type="button" class="link" data-hub-step="-1" ${keys.indexOf(pick)<1?'disabled':''} aria-label="Periodo anterior">‹</button><b>${esc(bucketLong(pick,hubPeriod))}</b><button type="button" class="link" data-hub-step="1" ${keys.indexOf(pick)>=keys.length-1?'disabled':''} aria-label="Periodo siguiente">›</button></div>
    <p><span class="hub-key is-player"></span>${you}: <b class="hub-inline">${player[pick]?player[pick].value+' %':'sin respuesta'}</b>${player[pick]?.count>1?` · ${player[pick].count} encuestas`:''}${player[pick]?.list.at(-1).mood?` · ánimo: ${MOODS[player[pick].list.at(-1).mood-1][1].toLowerCase()}`:''}</p>
    <p><span class="hub-key is-coach"></span>Coach: <b class="hub-inline">${coach[pick]?coach[pick].value+' %':'sin evaluación'}</b>${coach[pick]?.count>1?` · ${coach[pick].count} evaluaciones`:''}</p>
    ${player[pick]?.list.at(-1).missing?`<p class="hint">${you} · lo que faltó: ${esc(player[pick].list.at(-1).missing)}</p>`:''}${coach[pick]?.list.at(-1).missing?`<p class="hint">Coach · lo que falta: ${esc(coach[pick].list.at(-1).missing)}</p>`:''}
    ${tKeys[pick]?tKeys[pick].map(t=>`<p class="hub-tourney"><span aria-hidden="true">◉</span> Torneo: ${esc(t.name)} · ${esc(dateLabel(t.date,{day:'numeric',month:'long'}))}</p>`).join(''):''}</div>`:'';
  return `<div id="progress-hub" class="progress-hub">
  <section class="card hub-summary">
    <div class="hub-top"><div><small class="eyebrow">${data.example?'Datos de ejemplo':'Camino a tu meta'}</small><h2>${self?'¿Cómo voy?':'¿Cómo va '+esc(name.split(' ')[0])+'?'}</h2></div>
    <label class="chart-range"><span>Periodo</span><select id="hub-period" aria-label="Periodo de las gráficas">${options}</select></label></div>
    <div class="hub-goal"><small>${self?'Tu meta':'Su meta'} = 100 %</small><p>${esc(goal||'Aún sin meta. Escríbela en tu perfil.')}</p></div>
    ${data.example?'<p class="hint">Así se verá tu progreso. En cuanto respondas tu primera encuesta, las gráficas usarán tus datos reales.</p>':''}
    <div class="hub-now"><span class="annual-score">${current===null?'—':current+' %'}<small>${current===null?'sin datos en este periodo':'de '+(self?'tu':'su')+' meta · '+esc(bucketLong(scored.at(-1),hubPeriod))}</small></span>
    <ul class="hub-facts">${trend}${current!==null?`<li>${current>=100?'Meta alcanzada en este periodo.':`${100-current===1?'Falta':'Faltan'} ${pts(100-current)} para llegar a la meta.`}</li>`:''}${next?`<li><span class="hub-tourney-dot" aria-hidden="true">◉</span> Próximo torneo: ${esc(next.name)} · en ${Math.round((Date.parse(next.date)-Date.parse(today))/86400000)} días</li>`:''}</ul></div>
    <p class="hub-agree">${agreement}</p>
    ${cta}
  </section>
  <section class="card hub-chart"><small class="eyebrow">Gráfica 1 · Encuesta diaria</small><h3>${self?'Cómo me siento':'Cómo se siente '+esc(name.split(' ')[0])}</h3><p class="hint">${self?'Tu respuesta después de cada entrenamiento':'Su respuesta después de cada entrenamiento'}, ${period.unit}.</p>
    ${Object.keys(player).length?hubChart(keys,pick,[lineP],tKeys,'Sensación del jugador, '+period.unit):empty(self?'Aún no hay encuestas en este periodo. Al terminar tu entrenamiento te llegará la pregunta.':'Aún no hay encuestas del jugador en este periodo.')}</section>
  <section class="card hub-chart"><small class="eyebrow">Gráfica 2 · Evaluación del coach</small><h3>${self?'Cómo me ve mi coach':'Evaluación del coach'}</h3><p class="hint">Lo que el coach anota después de cada entrenamiento, ${period.unit}.</p>
    ${Object.keys(coach).length?hubChart(keys,pick,[lineC],tKeys,'Evaluación del coach, '+period.unit):empty('Aún no hay evaluaciones del coach en este periodo.')}</section>
  <section class="card hub-chart"><small class="eyebrow">Gráfica 3 · Comparación</small><h3>${self?'Yo y mi coach':'Jugador y coach'}</h3>
    <p class="hub-legend"><span><i class="hub-key is-player"></i>${self?'Cómo me siento':'Jugador'}</span><span><i class="hub-key is-coach"></i>Coach</span><span><i class="hub-key is-tourney"></i>Torneo</span></p>
    ${keys.length?hubChart(keys,pick,[lineC,lineP],tKeys,'Comparación entre jugador y coach, '+period.unit):empty('Sin datos en este periodo. Prueba con un periodo más largo.')}
    <p class="hint">Toca un punto para ver el detalle.</p>${detail}</section>
  </div>`;
}
function redrawHub(focus){
  const hub=$('#progress-hub');if(!hub||!hubArgs)return;
  hub.outerHTML=progressHub(...hubArgs);bindProgressHub();
  if(focus)document.querySelector(focus)?.focus({preventScroll:true});
}
function bindProgressHub(){
  const hub=$('#progress-hub');
  if(hub){
    $('#hub-period').onchange=e=>{hubPeriod=e.target.value;hubPick=null;redrawHub('#hub-period')};
    hub.onclick=e=>{
      const point=e.target.closest('[data-bucket]'),step=e.target.closest('[data-hub-step]');
      if(point){hubPick=point.dataset.bucket;redrawHub();return}
      if(step&&!step.disabled){
        const next=hubKeys[hubKeys.indexOf(hubPick)+Number(step.dataset.hubStep)];
        if(next){hubPick=next;redrawHub('[data-hub-step="'+step.dataset.hubStep+'"]')}
      }
    };
  }
  document.querySelectorAll('[data-open-checkin]').forEach(b=>b.onclick=()=>openPlayerCheckin());
  document.querySelectorAll('[data-coach-checkin]').forEach(b=>b.onclick=()=>{
    const member=academyPlayers(actor().academy).find(m=>m.id===b.dataset.coachCheckin);
    if(member)openCoachCheckin(member,[]);
  });
}

// ---------- Encuestas ----------
function scoreField(question,value){
  return `<label class="full hub-range">${question}<span class="hub-range-value"><output id="hub-score-out">${value} %</output></span><input type="range" name="score" min="0" max="100" step="5" value="${value}" aria-describedby="hub-score-help"><small id="hub-score-help" class="hub-range-scale"><span>0 · Empezando</span><span>100 · Meta lograda</span></small></label>`;
}
function attendanceField(question,yes,no,old){
  const current=old.attended===false?'no':old.at?'yes':'';
  return `<fieldset class="full mood-scale"><legend>${question}</legend>${[['yes',yes],['no',no]].map(([v,label])=>`<label class="mood-option"><input type="radio" name="attended" value="${v}" required ${current===v?'checked':''}><span>${label}</span></label>`).join('')}</fieldset>`;
}
// Si no asistió, se ocultan (y se desactivan) las demás preguntas.
function bindAttendance(){
  const form=$('#modalform'),rest=form.querySelector('.attend-rest');
  const sync=()=>{const absent=form.querySelector('[name="attended"][value="no"]').checked;rest.hidden=absent;rest.querySelectorAll('input,textarea').forEach(i=>i.disabled=absent)};
  form.querySelectorAll('[name="attended"]').forEach(r=>r.onchange=sync);sync();
}
function bindScoreField(){
  const input=$('#modalform [name="score"]'),out=$('#hub-score-out');
  if(input)input.oninput=()=>out.textContent=input.value+' %';
}
function lastScore(entries){const last=Object.keys(entries).sort().reverse().find(k=>Number.isFinite(entries[k].score));return last?entries[last].score:50}
function openPlayerCheckin(fromNotice=false){
  const id=state.profile.memberId,store=checkinStore(id),today=localDay(),old=store.player[today]||{};
  const mood=MOODS.map(([v,label])=>`<label class="mood-option"><input type="radio" name="mood" value="${v}" required ${Number(old.mood)===v?'checked':''}><span>${label}</span></label>`).join('');
  modal(fromNotice?'¿Cómo te fue hoy?':'Encuesta de hoy',
    `${fromNotice?'<p class="full hub-notice"><small class="eyebrow">Notificación · después de tu entrenamiento</small>Responde en 20 segundos. Con esto se calcula tu porcentaje del día.</p>':''}
    ${attendanceField('¿Fuiste hoy al entrenamiento?','Sí fui','No fui',old)}
    <div class="full formgrid attend-rest">
    <p class="full hint">Tu meta: «${esc(state.profile.goal||'sin definir')}». 100 % = la lograste.</p>
    ${scoreField('¿Qué tan cerca te sentiste hoy de tu meta?',old.score??lastScore(store.player))}
    <fieldset class="full mood-scale"><legend>¿Cómo te sentiste en el entrenamiento?</legend>${mood}</fieldset>
    <label class="full">¿Qué te salió bien? <span class="optional">(opcional)</span><textarea name="good" maxlength="300">${esc(old.good)}</textarea></label>
    <label class="full">¿Qué te faltó? <span class="optional">(opcional)</span><textarea name="missing" maxlength="300">${esc(old.missing)}</textarea></label></div>`,
    data=>{store.player[today]=data.attended==='no'?{attended:false,at:Date.now()}:{attended:true,score:Number(data.score),mood:Number(data.mood),good:data.good.trim(),missing:data.missing.trim(),at:Date.now()};hubPick=null},
    'Enviar');
  bindScoreField();bindAttendance();
}
function openCoachCheckin(member,queue){
  const store=checkinStore(member.id),today=localDay(),old=store.coach[today]||{};
  const record=athleteFor(member);
  modal('Evaluación de hoy · '+esc(member.name),
    `${queue.length?`<p class="full hint">Después: ${queue.map(m=>esc(m.name.split(' ')[0])).join(', ')}.</p>`:''}
    ${attendanceField('¿Asistió hoy al entrenamiento?','Sí asistió','No asistió',old)}
    <div class="full formgrid attend-rest">
    <p class="full hint">Su meta: «${esc(record.profile.goal||'sin definir')}». 100 % = la logró.</p>
    ${scoreField('Hoy, ¿qué tan cerca estuvo de su meta?',old.score??lastScore(store.coach))}
    <label class="full">¿Qué mejoró hoy? <span class="optional">(opcional)</span><textarea name="good" maxlength="300">${esc(old.good)}</textarea></label>
    <label class="full">¿Qué le falta? <span class="optional">(opcional)</span><textarea name="missing" maxlength="300">${esc(old.missing)}</textarea></label></div>`,
    data=>{
      // Si no asistió, solo se guarda la falta: no cuenta para la gráfica.
      store.coach[today]=data.attended==='no'?{attended:false,by:actor()?.name||'Coach',at:Date.now()}:{attended:true,score:Number(data.score),good:data.good.trim(),missing:data.missing.trim(),by:actor()?.name||'Coach',at:Date.now()};hubPick=null;
      if(queue.length)setTimeout(()=>openCoachCheckin(queue[0],queue.slice(1)),0);
    },
    queue.length?'Guardar y seguir':'Guardar');
  bindScoreField();
  bindAttendance();
}

// ---------- Avisos del día ----------
// El aviso llega al terminar la última sesión del día.
function trainedToday(){
  const now=Date.now(),list=sessionsFor(localDay()).filter(s=>!s.cancelled);
  return list.length>0&&list.every(s=>sessionTimes(s).end<=now);
}
function playerCheckinDue(){
  return role==='Jugador'&&!!state.profile?.memberId&&trainedToday()&&!peekCheckins(state.profile.memberId).player?.[localDay()]&&peekCheckins(state.profile.memberId).coach?.[localDay()]?.attended!==false;
}
function coachPending(){
  if(role!=='Coach'||!actor()||!trainedToday())return [];
  return academyPlayers(actor().academy).filter(m=>!peekCheckins(m.id).coach?.[localDay()]);
}
function checkinBanner(){
  if(!playerCheckinDue())return '';
  return '<section class="card checkin-banner"><div><small class="eyebrow">Notificación</small><h2>¿Cómo te fue hoy?</h2><p class="hint">Tu entrenamiento terminó. Cuéntanos cómo te sentiste para calcular tu avance del día.</p></div><button class="btn" data-open-checkin>Responder</button></section>';
}
function coachCheckinCard(){
  const pending=coachPending();
  if(!pending.length)return '';
  return `<section class="card checkin-banner"><div><small class="eyebrow">Notificación</small><h2>Evaluaciones de hoy · ${pending.length}</h2><p class="hint">Cuéntanos cómo viste a cada jugador en el entrenamiento de hoy.</p><div class="checkin-people">${pending.map(m=>`<button class="link" data-coach-checkin="${esc(m.id)}">${esc(m.name)}</button>`).join('')}</div></div><button class="btn" id="coach-checkin-all">Evaluar a todos</button></section>`;
}
function maybePromptCheckin(){
  if(entry!=='app'||phoneDemo||$('#modal')?.open)return;
  const today=localDay();
  state.checkinPrompts??={};
  const all=$('#coach-checkin-all');
  if(all)all.onclick=()=>{const p=coachPending();if(p.length)openCoachCheckin(p[0],p.slice(1))};
  if(playerCheckinDue()){
    const key='p:'+state.profile.memberId;
    if(state.checkinPrompts[key]===today)return;
    state.checkinPrompts[key]=today;save();openPlayerCheckin(true);return;
  }
  const pending=coachPending();
  if(pending.length){
    const key='c:'+(actor().memberId||'coach');
    if(state.checkinPrompts[key]===today)return;
    state.checkinPrompts[key]=today;save();
    openCoachCheckin(pending[0],pending.slice(1));
  }
}
