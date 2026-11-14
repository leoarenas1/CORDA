// Estado físico del jugador, dentro de «Mi estado» (antes «Análisis del coach»).
// Tres cosas que un jugador de competencia necesita y el coach necesita ver:
//   1. Chequeo diario de 30 segundos (sueño, energía, ánimo, dolor muscular, estrés y molestias): state.checkins[jugador].wellness['AAAA-MM-DD'].
//   2. Esfuerzo de cada sesión (1 a 10) en la encuesta de después del entrenamiento (progress-hub.js): carga = esfuerzo × minutos.
//   3. Motivo cuando el jugador no fue al entrenamiento (enfermedad, lesión, escuela, viaje…).
// Las alertas son orientativas: ayudan al coach a preguntar y ajustar la carga; no son un diagnóstico médico.
// En Supabase cada chequeo es un item «wellness» del jugador (supabase/13_estado_fisico.sql).
const WELL_AREAS=['Hombro','Codo o antebrazo','Muñeca o mano','Espalda baja','Espalda alta o cuello','Cadera o ingle','Muslo','Rodilla','Pantorrilla o tobillo','Pie','Otra zona'];
const ABSENCE_REASONS=['Enfermedad','Lesión','Escuela o trabajo','Viaje o torneo','Otra razón'];
const WELL_EXAMPLE_SCORES=[74,68,81,57,62,79,76];

const wellRecords=id=>checkinStore(id).wellness??={};
const wellPeek=id=>peekCheckins(id).wellness||{};
const wellDays=(n,end=localDay())=>Array.from({length:n},(_,i)=>dateAfter(end,i-(n-1)));
const wellNum=(n,digits=1)=>Number(n).toFixed(digits).replace('.',coverLanguage==='en'?'.':',');

// Preparación 0–100: promedio de sueño, energía, ánimo, dolor muscular (al revés) y estrés (al revés).
function readiness(w){
  const part=(v,inverse)=>{const n=(Number(v)-1)/4;return inverse?1-n:n};
  const parts=[part(w?.sleepQ),part(w?.energy),part(w?.mood),part(w?.soreness,true),part(w?.stress,true)].filter(Number.isFinite);
  return parts.length===5?Math.round(parts.reduce((a,b)=>a+b,0)/5*100):null;
}
const wellClass=score=>score===null?'none':score>=70?'ok':score>=50?'mid':'low';

// ---------- Carga de entrenamiento ----------
function wellDayLoad(id,day){
  const c=peekCheckins(id).player?.[day];
  if(!c||c.attended===false||!Number.isFinite(c.rpe))return null;
  const minutes=(state.sessions||[]).filter(s=>s.date===day&&!s.cancelled).reduce((sum,s)=>sum+(Number(s.duration)||0),0)||60;
  return c.rpe*minutes;
}
const wellSumLoad=(id,days)=>days.reduce((sum,d)=>sum+(wellDayLoad(id,d)||0),0);
function wellLoad(id){
  const today=localDay(),recent=wellDays(7,today),before=wellDays(28,dateAfter(today,-7));
  const withData=[...recent,...before].filter(d=>wellDayLoad(id,d)!==null).length;
  const acute=wellSumLoad(id,recent),chronic=wellSumLoad(id,before)/4;
  return {acute,chronic,ratio:withData>=10&&chronic>0?acute/chronic:null,any:withData>0};
}

// ---------- Molestias activas y alertas ----------
function wellPains(id){
  const records=wellPeek(id),latest={};
  for(const day of wellDays(7)){for(const p of records[day]?.pain||[])latest[p.area]={...p,day}}
  return Object.values(latest).filter(p=>p.level>0).sort((a,b)=>b.level-a.level);
}
function wellnessAlerts(id,self=false){
  const records=wellPeek(id),alerts=[];
  for(const p of wellPains(id)){
    if(p.level>=6&&wellDays(3).includes(p.day))alerts.push({sev:'high',text:'Molestia '+p.level+'/10 · '+p.area});
  }
  const recent=wellDays(3).map(d=>readiness(records[d]||{})).filter(s=>s!==null);
  if(recent.length>=2&&recent.slice(-2).every(s=>s<=45))alerts.push({sev:'high',text:'Preparación baja varios días'});
  const sleeps=wellDays(3).map(d=>records[d]?.sleepH).filter(Number.isFinite);
  if(sleeps.length>=2&&sleeps.reduce((a,b)=>a+b,0)/sleeps.length<6)alerts.push({sev:'mid',text:(self?'Duermes poco':'Duerme poco')+': menos de 6 h'});
  const load=wellLoad(id);
  if(load.ratio!==null&&load.ratio>1.5)alerts.push({sev:'mid',text:'Carga +'+Math.round((load.ratio-1)*100)+' % vs. '+(self?'tu':'su')+' promedio'});
  return alerts.sort((a,b)=>(a.sev==='high'?0:1)-(b.sev==='high'?0:1));
}

// ---------- Semáforo del jugador (lista de jugadores del coach) ----------
// Rojo = atender hoy · Amarillo = vigilar · Verde = bien · Gris = sin datos.
// Se toma el chequeo más reciente de los últimos 3 días, las alertas ya calculadas y las molestias activas.
function playerStatus(id){
  const records=wellPeek(id),days=wellDays(3);
  let day=null,score=null;
  for(let i=days.length-1;i>=0;i--){const s=readiness(records[days[i]]||{});if(s!==null){day=days[i];score=s;break}}
  const ago=day===null||day===localDay()?'':day===dateAfter(localDay(),-1)?' · ayer':' · hace 2 días';
  const alerts=wellnessAlerts(id),pains=wellPains(id);
  const high=alerts.find(x=>x.sev==='high'),mid=alerts.find(x=>x.sev==='mid');
  if(high)return {level:'red',reason:high.text,score};
  if(score!==null&&score<50)return {level:'red',reason:'Preparación baja · '+score+ago,score};
  if(mid)return {level:'yellow',reason:mid.text,score};
  if(pains.length&&pains[0].level>=3)return {level:'yellow',reason:'Molestia '+pains[0].level+'/10 · '+pains[0].area,score};
  if(score!==null&&score<70)return {level:'yellow',reason:'Preparación '+score+ago,score};
  if(score===null)return {level:'none',reason:'Sin chequeos en 3 días',score};
  return {level:'green',reason:'Preparación '+score+ago,score};
}

// ---------- Datos de ejemplo (mientras el jugador no ha hecho ningún chequeo) ----------
function wellExample(){
  const records={},today=localDay(),clamp=v=>Math.max(1,Math.min(5,Math.round(v)));
  for(let i=0;i<200;i++){
    if(i%9===4)continue;
    const base=76-Math.min(40,i*0.2)+10*Math.sin(i/4);
    records[dateAfter(today,-i)]={sleepH:+(5.2+base/45).toFixed(1),sleepQ:clamp(1+4*(base-8)/100),energy:clamp(1+4*base/100),mood:clamp(1+4*(base+4)/100),
      soreness:clamp(5-4*(base+6)/100),stress:clamp(5-4*(base-10)/100),pain:i%23===3?[{area:'Hombro',level:3}]:[]};
  }
  return records;
}

// ---------- Cómo se ha sentido: gráfica diaria, semanal y mensual + qué falla y qué va bien ----------
// Cada factor va de 0 (peor) a 100 (mejor). Músculos y estrés se invierten: 100 = sin dolor muscular y sin estrés.
const WELL_FACTORS=[['sleepQ','Sueño',false],['energy','Energía',false],['mood','Ánimo',false],['soreness','Músculos',true],['stress','Estrés',true]];
const WELL_PERIODS={day:'Últimos 14 días',week:'Últimas 8 semanas',month:'Últimos 6 meses'};
let wellPeriod='week',wellPick=null,wellArgs=null;
const factorValue=(w,key,inverse)=>{const n=(Number(w[key])-1)/4;return Math.round((inverse?1-n:n)*100)};
function wellWindow(period,today=localDay()){
  if(period==='day')return wellDays(14,today);
  if(period==='week'){const monday=mondayOf(today);return Array.from({length:8},(_,i)=>dateAfter(monday,(i-7)*7))}
  const first=new Date(today+'T12:00:00');first.setDate(1);
  return Array.from({length:6},(_,i)=>{const d=new Date(first);d.setMonth(first.getMonth()-(5-i));return localDay(d).slice(0,7)});
}
function wellAgg(list){
  const full=list.filter(w=>readiness(w)!==null),hours=list.map(w=>w.sleepH).filter(Number.isFinite);
  if(!full.length)return {n:0,score:null,factors:null,sleepH:hours.length?hours.reduce((a,b)=>a+b,0)/hours.length:null,pain:list.filter(w=>(w.pain||[]).some(p=>p.level>0)).length};
  const factors=Object.fromEntries(WELL_FACTORS.map(([key,,inverse])=>[key,Math.round(full.reduce((s,w)=>s+factorValue(w,key,inverse),0)/full.length)]));
  return {n:full.length,score:Math.round(full.reduce((s,w)=>s+readiness(w),0)/full.length),factors,
    sleepH:hours.length?hours.reduce((a,b)=>a+b,0)/hours.length:null,pain:list.filter(w=>(w.pain||[]).some(p=>p.level>0)).length};
}
function wellBuckets(records,period){
  const keys=wellWindow(period),groups=Object.fromEntries(keys.map(k=>[k,[]])),pooled=[];
  for(const [day,w] of Object.entries(records)){const k=bucketKey(day,period);if(groups[k]){groups[k].push(w);pooled.push(w)}}
  return {buckets:keys.map(k=>({key:k,...wellAgg(groups[k])})),pooled:wellAgg(pooled)};
}
const wellLabel=(key,period)=>period==='month'?dateLabel(key+'-01',{month:'short',year:'2-digit'}):dateLabel(key,{day:'numeric',month:'short'});
function wellChart(buckets,period,pick){
  const W=320,H=150,left=26,right=6,top=14,bottom=24,n=buckets.length,slot=(W-left-right)/n,bar=Math.min(26,slot*0.62);
  const y=v=>top+(H-top-bottom)*(1-v/100);
  const grid=[0,50,100].map(v=>`<line x1="${left}" x2="${W-right}" y1="${y(v)}" y2="${y(v)}" class="chart-grid"/><text x="${left-4}" y="${y(v)+3}" text-anchor="end">${v}</text>`).join('');
  const step=n>10?2:1;
  const cols=buckets.map((b,i)=>{
    const x=left+slot*i+(slot-bar)/2,cx=x+bar/2,has=b.score!==null;
    return `<g class="well-col ${pick===b.key?'is-picked':''}" ${has?`data-well-pick="${b.key}" role="button" tabindex="0" aria-label="${esc(wellLabel(b.key,period))}: ${b.score}"`:''}>
      <rect class="well-hit" x="${left+slot*i}" y="${top}" width="${slot}" height="${H-top-bottom}"/>
      ${has?`<rect class="well-bar ${wellClass(b.score)}" x="${x}" y="${y(b.score)}" width="${bar}" height="${y(0)-y(b.score)}" rx="3"/><text x="${cx}" y="${y(b.score)-3}" text-anchor="middle" class="well-val">${b.score}</text>`:`<rect class="well-bar none" x="${x}" y="${y(0)-3}" width="${bar}" height="3" rx="1.5"/>`}
      ${i%step===(n-1)%step?`<text x="${cx}" y="${H-8}" text-anchor="middle">${wellLabel(b.key,period)}</text>`:''}</g>`}).join('');
  return `<svg class="well-chartsvg" role="img" viewBox="0 0 ${W} ${H}" aria-label="Cómo te has sentido, ${WELL_PERIODS[period].toLowerCase()}">${grid}${cols}</svg>`;
}
function wellnessTrend(id,self,name){
  if(planLocked())return lockCard('Gráfica de cómo se siente','La evolución de cada jugador por día, semana y mes, a partir de su chequeo diario.');
  wellArgs=[id,self,name];
  const real=wellPeek(id),example=!Object.keys(real).length,records=example?wellExample():real;
  const {buckets,pooled}=wellBuckets(records,wellPeriod);
  const picked=wellPick?buckets.find(b=>b.key===wellPick&&b.n):null,view=picked||pooled;
  const first=esc(String(name||'').split(' ')[0]);
  const periods=[['day','Diario'],['week','Semanal'],['month','Mensual']].map(([k,label])=>`<button type="button" data-well-period="${k}" aria-pressed="${k===wellPeriod}">${label}</button>`).join('');
  const rows=view.factors?WELL_FACTORS.map(([key,label])=>{const v=view.factors[key];return `<div class="well-factor"><span>${label}</span><div class="well-meter"><i class="${wellClass(v)}" style="width:${v}%"></i></div><b>${v}</b></div>`}).join(''):'';
  const entries=view.factors?WELL_FACTORS.map(([key,label])=>[label,view.factors[key]]):[];
  const bad=entries.filter(([,v])=>v<50).sort((a,b)=>a[1]-b[1]).slice(0,2),good=entries.filter(([,v])=>v>=70).sort((a,b)=>b[1]-a[1]).slice(0,2);
  const summary=view.factors?`<p class="well-summary">${bad.length?`<b>Falla:</b> ${bad.map(([l,v])=>esc(l)+' '+v).join(' · ')}`:'<b>Nada en rojo</b> en este periodo.'}</p>${good.length?`<p class="well-summary"><b>Va bien:</b> ${good.map(([l,v])=>esc(l)+' '+v).join(' · ')}</p>`:''}`:'<p class="hint">Todavía no hay chequeos en este periodo.</p>';
  const title=picked?bucketLongWell(picked.key,wellPeriod):'Todo el periodo';
  return `<section class="card well-trend" id="well-trend"><div class="sectiontitle"><div><small class="eyebrow">${self?'Cómo te has sentido':'Cómo se ha sentido '+first}${example?' · Datos de ejemplo':''}</small><h2>Preparación diaria, semanal y mensual</h2></div></div>
    <div class="well-periods" role="group" aria-label="Periodo">${periods}</div>
    <p class="hint">${WELL_PERIODS[wellPeriod]}. Toca una barra para ver el detalle de ese día, semana o mes.</p>
    <div class="well-chart">${wellChart(buckets,wellPeriod,picked?picked.key:null)}</div>
    <div class="well-detail"><div class="well-detail-head"><h3>${title}</h3>${picked?'<button type="button" class="link" data-well-all>Ver todo el periodo</button>':''}</div>
      ${view.factors?`<p class="hint"><b>Preparación ${view.score}</b>${view.n>1?' · '+view.n+' chequeos':''}${view.sleepH!==null?' · Sueño '+wellNum(view.sleepH)+' h':''}${view.pain?' · '+view.pain+(view.pain===1?' día con molestia':' días con molestia'):''}</p>`:''}
      ${rows}${summary}
      <p class="hint">Cada barra va de 0 (peor) a 100 (mejor). En Músculos y Estrés, 100 significa sin dolor muscular y sin estrés.</p></div></section>`;
}
function bucketLongWell(key,period){
  if(period==='day')return dateLabel(key,{weekday:'long',day:'numeric',month:'long'});
  if(period==='week')return 'Semana del '+dateLabel(key,{day:'numeric',month:'long'});
  return dateLabel(key+'-01',{month:'long',year:'numeric'});
}
function redrawWellTrend(){
  const el=$('#well-trend');
  if(el&&wellArgs)el.outerHTML=wellnessTrend(...wellArgs);
}

// ---------- Panel ----------
function wellnessPanel(id,name,self){
  const real=wellPeek(id),example=!Object.keys(real).length,records=example?wellExample():real;
  const today=localDay(),days=wellDays(7);
  const scores=days.map(d=>records[d]?readiness(records[d]):null),known=scores.filter(s=>s!==null);
  const avg=known.length?Math.round(known.reduce((a,b)=>a+b,0)/known.length):null;
  const sleeps=days.map(d=>records[d]?.sleepH).filter(Number.isFinite),sleepAvg=sleeps.length?sleeps.reduce((a,b)=>a+b,0)/sleeps.length:null;
  const load=example?{acute:1840,chronic:1640,ratio:1.12,any:true}:wellLoad(id);
  const alerts=example?[]:wellnessAlerts(id,self),pains=example?[{area:'Hombro',level:3,day:today}]:wellPains(id);
  const first=esc(String(name||'').split(' ')[0]||'');
  const doneToday=!example&&real[today]&&readiness(real[today])!==null;
  const absences={};
  if(!example)for(const d of wellDays(30)){const c=peekCheckins(id).player?.[d];if(c?.attended===false&&c.reason)absences[c.reason]=(absences[c.reason]||0)+1}
  const trend=load.ratio===null?(load.any?'Faltan más días para comparar':'Se calcula con el esfuerzo de tus sesiones'):(load.ratio>=1?'+':'')+Math.round((load.ratio-1)*100)+' % vs. el promedio de 4 semanas';
  return `<section class="card wellness" id="wellness-panel"><div class="sectiontitle"><div><small class="eyebrow">Estado físico${example?' · Datos de ejemplo':''}</small><h2>${self?'¿Cómo amaneces?':'Estado físico de '+first}</h2></div>
    ${self&&role==='Jugador'?`<button class="btn lime small" data-open-wellness>${doneToday?'Editar chequeo de hoy':'Chequeo de hoy · 30 s'}</button>`:''}</div>
    ${alerts.length?`<ul class="well-alerts">${alerts.map(a=>`<li class="well-alert sev-${a.sev}">⚠ ${esc(a.text)}</li>`).join('')}</ul>`:''}
    <div class="well-metrics">
      <div><small>Preparación · 7 días</small><b>${avg===null?'—':avg}</b></div>
      <div><small>Sueño · promedio</small><b>${sleepAvg===null?'—':wellNum(sleepAvg)+' h'}</b></div>
      <div><small>Carga de la semana</small><b>${load.any?Math.round(load.acute)+' UA':'—'}</b><span class="hint">${trend}</span></div>
    </div>
    ${pains.length?`<div class="well-pains"><small class="eyebrow">Molestias activas</small><ul>${pains.map(p=>`<li><b>${esc(p.area)}</b> · ${p.level}/10${self&&role==='Jugador'&&!example?` <button type="button" class="link" data-pain-clear="${esc(p.area)}">Ya no me duele</button>`:''}</li>`).join('')}</ul></div>`:''}
    ${Object.keys(absences).length?`<p class="hint well-absences"><b>Ausencias · 30 días:</b> ${Object.entries(absences).map(([r,n])=>esc(r)+' '+n).join(' · ')}</p>`:''}
    ${self&&role==='Jugador'?'<button type="button" class="link" data-report-pain>Reportar una molestia</button>':''}
    <p class="hint">UA = esfuerzo (1 a 10) × minutos. Son datos orientativos para platicar con tu coach, no un diagnóstico médico.</p></section>`;
}
// Cuando ya hiciste el chequeo de hoy: solo queda un anillo chico con tu preparación y la racha, junto a tu foto de perfil.
function wellnessMini(){
  if(role!=='Jugador'||entry!=='app'||!state.profile?.memberId)return '';
  const rec=wellPeek(state.profile.memberId),done=rec[localDay()],score=done?readiness(done):null;
  if(score===null)return '';
  let streak=0;
  for(let i=0;i<400;i++){const d=dateAfter(localDay(),-i),r=rec[d];if(r&&readiness(r)!==null)streak++;else break}
  const cls=wellClass(score),title=cls==='ok'?'Listo para entrenar':cls==='mid'?'Ve con calma hoy':'Hoy toca cuidarte';
  return `<button type="button" class="well-mini" data-open-wellness title="${title} · toca para editar tu chequeo de hoy" aria-label="Chequeo de hoy: ${score} de 100. ${title}. Toca para editarlo."><span class="well-ring is-${cls}" style="--score:${score}"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="ring-bg" cx="50" cy="50" r="44"/><circle class="ring-fg" cx="50" cy="50" r="44" pathLength="100"/></svg><span><b data-count>${score}</b></span></span>${streak>1?`<span class="well-streak"><i class="flame">🔥</i> ${streak}</span>`:''}</button>`;
}
function wellnessBanner(){
  if(role!=='Jugador'||entry!=='app'||!state.profile?.memberId)return '';
  const done=wellPeek(state.profile.memberId)[localDay()];
  if(done&&readiness(done)!==null)return '';
  return `<section class="card quick-card is-morning wellness-banner"><div class="quick-icon" aria-hidden="true"><svg viewBox="0 0 64 64"><g class="sun-rays">${Array.from({length:8},(_,k)=>`<line x1="32" y1="4" x2="32" y2="11" transform="rotate(${k*45} 32 32)"/>`).join('')}</g><circle class="sun-core" cx="32" cy="32" r="14"/></svg></div>
    <div class="quick-text"><small class="eyebrow">Chequeo diario · 30 segundos</small><h2>¿Cómo amaneces hoy?</h2><div class="quick-steps"><span>😴 Sueño</span><span>⚡ Energía</span><span>🙂 Ánimo</span><span>💪 Músculos</span><span>🧘 Estrés</span></div></div>
    <button class="btn lime quick-cta" data-open-wellness>Empezar <span aria-hidden="true">→</span></button></section>`;
}
// Etiqueta corta para la lista de jugadores del coach.
function wellnessBadge(id){
  const records=wellPeek(id);
  if(!Object.keys(records).length)return '';
  const alerts=wellnessAlerts(id);
  if(alerts.length)return `<p class="well-badge sev-${alerts[0].sev}">⚠ ${esc(alerts[0].text)}${alerts.length>1?` <small>+${alerts.length-1}</small>`:''}</p>`;
  const score=records[localDay()]?readiness(records[localDay()]):null;
  return score===null?'<p class="well-badge none">Sin chequeo hoy</p>':`<p class="well-badge ${wellClass(score)}">Preparación hoy · ${score}</p>`;
}

// ---------- Formularios ----------
function wellScale(name,legend,low,high,old){
  const boxes=[1,2,3,4,5].map(v=>`<label class="mood-option"><input type="radio" name="${name}" value="${v}" required ${Number(old)===v?'checked':''}><span>${v}</span></label>`).join('');
  return `<fieldset class="full mood-scale well-scale"><legend>${legend}</legend>${boxes}<small class="hub-range-scale well-ends"><span>1 · ${low}</span><span>5 · ${high}</span></small></fieldset>`;
}
function painFields(old){
  const level=old.level??3;
  return `<div class="full formgrid well-pain-fields" ${old.area?'':'hidden'}>
    <label class="full hub-range">Intensidad<span class="hub-range-value"><output id="well-pain-out">${level} / 10</output></span><input type="range" name="painLevel" min="1" max="10" step="1" value="${level}"><small class="hub-range-scale"><span>1 · Molestia leve</span><span>10 · Dolor máximo</span></small></label>
    <label class="full">¿Qué sientes? <span class="optional">(opcional)</span><textarea name="note" maxlength="300">${esc(old.note||'')}</textarea></label></div>`;
}
function bindPainFields(){
  const form=$('#modalform'),area=form.elements.area,box=form.querySelector('.well-pain-fields'),level=form.elements.painLevel,out=$('#well-pain-out');
  const sync=()=>{const on=!!area.value;box.hidden=!on;box.querySelectorAll('input,textarea').forEach(i=>i.disabled=!on)};
  area.onchange=sync;sync();
  if(level)level.oninput=()=>out.textContent=level.value+' / 10';
}
function openWellness(){
  if(role!=='Jugador'||!state.profile?.memberId)return;
  const id=state.profile.memberId,today=localDay(),old=wellRecords(id)[today]||{},pain=(old.pain||[]).find(p=>p.level>0)||{};
  modal('Chequeo de hoy',
    `<p class="full hint">Toma 30 segundos. Tu coach ve tus respuestas para ajustar la carga de entrenamiento. No hay respuestas buenas ni malas: responde con sinceridad.</p>
    <label class="full">Horas que dormiste<input name="sleepH" type="number" min="0" max="14" step="0.5" inputmode="decimal" required value="${old.sleepH??''}"></label>
    ${wellScale('sleepQ','Calidad del sueño','Muy mala','Excelente',old.sleepQ)}
    ${wellScale('energy','Energía','Sin energía','Con mucha energía',old.energy)}
    ${wellScale('mood','Ánimo','Bajo','Excelente',old.mood)}
    ${wellScale('soreness','Dolor muscular','Nada','Mucho',old.soreness)}
    ${wellScale('stress','Estrés (escuela, trabajo o competencia)','Nada','Mucho',old.stress)}
    <label class="full">¿Te duele o te molesta algo? <span class="optional">(opcional)</span><select name="area"><option value="">No, me siento bien</option>${WELL_AREAS.map(a=>`<option ${pain.area===a?'selected':''}>${a}</option>`).join('')}</select></label>
    ${painFields({...pain,note:old.note})}`,
    data=>{
      const hours=Number(data.sleepH);
      if(!(hours>=0&&hours<=14)){toast('Escribe entre 0 y 14 horas de sueño.');return false}
      wellRecords(id)[today]={sleepH:hours,sleepQ:Number(data.sleepQ),energy:Number(data.energy),mood:Number(data.mood),soreness:Number(data.soreness),stress:Number(data.stress),
        pain:data.area?[{area:data.area,level:Number(data.painLevel)||1}]:[],note:data.area?String(data.note||'').trim():'',at:Date.now()};
    },'Guardar chequeo');
  bindPainFields();
}
function openPainReport(){
  if(role!=='Jugador'||!state.profile?.memberId)return;
  const id=state.profile.memberId,today=localDay();
  modal('Reportar una molestia',
    `<p class="full hint">Avísale a tu coach al momento. Si ya hiciste tu chequeo de hoy, se agrega ahí.</p>
    <label class="full">¿Dónde?<select name="area" required>${WELL_AREAS.map(a=>`<option>${a}</option>`).join('')}</select></label>
    ${painFields({})}`,
    data=>{
      const record=wellRecords(id)[today]??={};
      record.pain=(record.pain||[]).filter(p=>p.area!==data.area).concat({area:data.area,level:Number(data.painLevel)||1});
      if(String(data.note||'').trim())record.note=String(data.note).trim();
      record.at=Date.now();
    },'Enviar a mi coach');
  const form=$('#modalform'),level=form.elements.painLevel,out=$('#well-pain-out');
  form.querySelector('.well-pain-fields').hidden=false;
  if(level)level.oninput=()=>out.textContent=level.value+' / 10';
}
document.addEventListener('click',event=>{
  const t=event.target;
  const period=t.closest?.('[data-well-period]');
  if(period){wellPeriod=period.dataset.wellPeriod;wellPick=null;redrawWellTrend();return}
  const pick=t.closest?.('[data-well-pick]');
  if(pick){wellPick=wellPick===pick.dataset.wellPick?null:pick.dataset.wellPick;redrawWellTrend();return}
  if(t.closest?.('[data-well-all]')){wellPick=null;redrawWellTrend();return}
  if(t.closest?.('[data-open-wellness]')){openWellness();return}
  if(t.closest?.('[data-report-pain]')){openPainReport();return}
  const clear=t.closest?.('[data-pain-clear]');
  if(clear&&role==='Jugador'&&state.profile?.memberId){
    const record=wellRecords(state.profile.memberId)[localDay()]??={};
    record.pain=(record.pain||[]).filter(p=>p.area!==clear.dataset.painClear).concat({area:clear.dataset.painClear,level:0});
    record.at=Date.now();
    save();render();toast('Listo. Se lo avisamos a tu coach.');
  }
});


// ---------- Seguimiento del coach (tarjeta corta al final de «Mi estado») ----------
// Lo último que anotó el coach, en dos ideas cortas: lo que mejoró y el siguiente ajuste.
// Fuentes: evaluación diaria del coach, «Evaluar jugador» y evaluación mensual. Sin nada, se muestra el mismo ejemplo que Inicio.
function coachLatest(id){
  const list=[],athlete=state.athletes?.[id],today=localDay();
  for(const [day,c] of Object.entries(peekCheckins(id).coach||{})){
    if(c.attended!==false&&(c.good||c.missing))list.push({date:day,label:dateLabel(day,{day:'numeric',month:'long'}),good:c.good||'',focus:c.missing||'',by:c.by||'',video:c.video||''});
  }
  for(const [day,r] of Object.entries(athlete?.reviews||{})){
    if(r&&(r.good||r.focus))list.push({date:day,label:dateLabel(day,{day:'numeric',month:'long'}),good:r.good||'',focus:r.focus||'',by:'',video:r.video||''});
  }
  for(const [month,r] of Object.entries(athlete?.profile?.monthlyReviews||{})){
    if(r&&(r.good||r.focus)){const date=month+'-28'>today?today:month+'-28';list.push({date,label:dateLabel(month+'-01',{month:'long',year:'numeric'}),good:r.good||'',focus:r.focus||'',by:'',video:r.video||''})}
  }
  return list.sort((a,b)=>b.date.localeCompare(a.date))[0]||null;
}
// Primera idea del texto (máximo ~70 caracteres): la primera oración si cabe; si no, la primera frase corta; si no, se corta en una palabra.
function shortNote(text,max=70){
  const clean=String(text||'').replace(/\s+/g,' ').trim();
  if(clean.length<=max)return clean.replace(/[.,;:]$/,'');
  const sentence=clean.match(/^.{12,}?[.!?](\s|$)/);
  if(sentence&&sentence[0].trim().length<=max)return sentence[0].trim().replace(/[.]$/,'');
  const clause=clean.match(/^.{12,}?[,;:](\s|$)/);
  if(clause&&clause[0].trim().length<=max)return clause[0].trim().replace(/[,;:]$/,'');
  return clean.slice(0,max).replace(/\s+\S*$/,'')+'…';
}
// ---------- Videos que ayudan con el siguiente ajuste ----------
// 1) Si el coach eligió un video al evaluar, se muestra ese. 2) Si no, la app busca palabras del ajuste (saque, revés, volea…)
// y enlaza a esa categoría de la biblioteca de videos. Al tocar, lleva a la biblioteca ya filtrada.
const FOLLOW_KEYWORDS=[
  ['Tenis','Saque',['saque','servicio','servir','ace']],
  ['Tenis','Derecha',['derecha','drive','forehand']],
  ['Tenis','Revés',['reves','backhand']],
  ['Tenis','Volea y red',['volea','en la red','a la red','aproximacion','remate','smash']],
  ['Tenis','Devolución',['devolucion','resto','restar']],
  ['Tenis','Táctica',['tactica','patron','estrategia','direccion','profundidad','bola corta']],
  ['Tenis','Mental',['mental','concentracion','nervios','presion','confianza','actitud']],
  ['Tenis','Partidos',['partido','competencia','torneo','marcador']],
  ['Físico','Fuerza',['fuerza','pesas','potencia']],
  ['Físico','Pliometría',['pliometria','salto','saltos','explosiv']],
  ['Físico','Agilidad',['agilidad','desplazamiento','pies','footwork','primer paso','velocidad']],
  ['Físico','Cardio',['cardio','resistencia','aguante','fondo fisico']],
  ['Físico','Core',['core','abdomen','abdominal','estabilidad']],
  ['Físico','Movilidad',['movilidad','flexibilidad','estiramiento']],
  ['Físico','Prevención de lesiones',['lesion','prevencion','hombro','rodilla','espalda']]
];
// Palabras que indican el subtema dentro de cada tema (se compara sin acentos ni mayúsculas).
const FOLLOW_SUBTOPICS={
  Saque:{'Lanzamiento de bola':['lanzamiento','lanzar','toss'],'Posición y pies':['posicion','pies','stance','postura'],'Golpe en punto alto':['punto alto','contacto','impacto','golpe alto'],'Primer saque':['primer saque','primer servicio'],'Segundo saque y efecto':['segundo saque','efecto','liftado','kick','slice'],'Colocación y dirección':['colocacion','direccion','esquina','a la t']},
  Derecha:{'Agarre':['agarre','grip'],'Preparación':['preparacion','preparar','giro'],'Impacto':['impacto','contacto'],'Terminación':['terminacion','acompanamiento'],'Cruzada y paralela':['cruzada','paralela','direccion'],'Defensa':['defensa','defender']},
  'Revés':{'Agarre':['agarre','grip'],'Preparación':['preparacion','preparar','giro'],'Impacto':['impacto','contacto'],'Terminación':['terminacion','acompanamiento'],'Slice':['slice','cortado'],'Defensa':['defensa','defender']},
  'Volea y red':{'Volea de derecha':['volea de derecha','volea derecha'],'Volea de revés':['volea de reves','volea reves'],'Aproximación':['aproximacion','subir a la red'],'Remate (smash)':['remate','smash'],'Posición en la red':['posicion en la red','posicion en red']},
  'Devolución':{'Posición de espera':['posicion de espera','espera'],'Primer saque del rival':['primer saque','saque fuerte','saque rapido'],'Segundo saque del rival':['segundo saque'],'Colocación':['colocacion','direccion','profundidad']},
  'Táctica':{'Patrones de juego':['patron','patrones'],'Juego de fondo':['fondo','consistencia'],'Juego en la red':['en la red','a la red','volea'],'Dobles':['dobles'],'Jugar según el rival':['rival','oponente','adversario']},
  Mental:{'Concentración':['concentracion','enfoque'],'Manejo de la presión':['presion','nervios','puntos importantes'],'Rutinas entre puntos':['rutina','entre puntos'],'Confianza':['confianza','seguridad']},
  Partidos:{'Calentamiento previo':['calentamiento'],'Análisis del rival':['rival','analisis'],'Revisión de un partido':['revision','resumen','partido']},
  Fuerza:{'Tren inferior':['piernas','sentadilla','tren inferior'],'Tren superior':['hombros','pecho','brazos','tren superior'],'Potencia':['potencia','explosiv']},
  'Pliometría':{'Saltos verticales':['vertical','salto'],'Saltos laterales':['lateral'],'Cajón':['cajon']},
  Agilidad:{'Escalera':['escalera'],'Conos':['conos','cono'],'Primer paso (split step)':['primer paso','split step','split'],'Desplazamiento lateral':['lateral','desplazamiento']},
  Cardio:{'Intervalos':['intervalo'],'Resistencia':['resistencia','aguante'],'Recuperación':['recuperacion']},
  Core:{'Plancha':['plancha'],'Rotación':['rotacion','giro'],'Estabilidad':['estabilidad']},
  Movilidad:{'Cadera':['cadera'],'Hombro':['hombro'],'Columna':['columna','espalda'],'Calentamiento dinámico':['calentamiento','dinamico']},
  'Prevención de lesiones':{'Hombro':['hombro'],'Rodilla':['rodilla'],'Muñeca y codo':['muneca','codo'],'Espalda':['espalda','lumbar']}
};
const followNorm=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
function followSuggestions(text){
  const t=followNorm(text),found=[];
  for(const [area,category,words] of FOLLOW_KEYWORDS){
    let first=-1;
    for(const word of words){
      const at=t.search(new RegExp('(^|[^a-z])'+word+(word.length<=4?'([^a-z]|$)':'')));
      if(at>=0&&(first<0||at<first))first=at;
    }
    if(first>=0)found.push({area,category,at:first,sub:followSub(category,t)});
  }
  return found.sort((a,b)=>a.at-b.at).slice(0,2);
}
function followSub(category,normalized){
  let best='',bestAt=-1;
  for(const [name,words] of Object.entries(FOLLOW_SUBTOPICS[category]||{})){
    for(const word of words){
      const at=normalized.search(new RegExp('(^|[^a-z])'+word+(word.length<=4?'([^a-z]|$)':'')));
      if(at>=0&&(bestAt<0||at<bestAt)){best=name;bestAt=at}
    }
  }
  return best;
}
const followCount=(area,category,sub='')=>(state.videos||[]).filter(v=>videoArea(v)===area&&v.category===category&&(!sub||v.subtopic===sub)).length;
function goVideoLibrary(area,category,sub=''){
  videoFilters[area]=category;videoSubFilters[area]=sub;
  page=area==='Físico'?'gym':'training';
  render();window.scrollTo(0,0);
  setTimeout(()=>document.querySelector('.video-library')?.scrollIntoView({behavior:'smooth',block:'start'}),80);
}
// Campo para el coach en los formularios de evaluación: elegir un video de la biblioteca (opcional).
function videoPickField(current=''){
  const videos=state.videos||[];
  if(!videos.length)return '';
  return `<label class="full">Video recomendado <span class="optional">(opcional)</span><select name="video"><option value="">Sin video: la app sugiere por palabra clave</option>${videos.map(v=>`<option value="${esc(videoKey(v))}" ${videoKey(v)===current?'selected':''}>${esc(v.title)}${v.category?' · '+esc(v.category):''}</option>`).join('')}</select></label>`;
}
function followLinks(item,example){
  const chosen=item.video?(state.videos||[]).find(v=>videoKey(v)===item.video):null;
  if(chosen)return `<div class="follow-links"><button type="button" class="follow-video" data-follow-video="${esc(videoKey(chosen))}">▶ Ver video: ${esc(chosen.title)}</button></div>`;
  const chips=followSuggestions(item.focus).map(s=>({...s,sub:s.sub&&(example||followCount(s.area,s.category,s.sub)>0)?s.sub:''})).filter(s=>example||followCount(s.area,s.category,s.sub)>0);
  return chips.length?`<div class="follow-links">${chips.map(s=>{const n=followCount(s.area,s.category,s.sub);return `<button type="button" class="follow-video" data-follow-cat="${esc(s.category)}" data-follow-sub="${esc(s.sub)}" data-follow-area="${s.area}"><span>▶ Videos de ${s.category}${n?' ('+n+')':''}</span>${s.sub?`<span class="follow-sub">${esc(s.sub)}</span>`:''}</button>`}).join('')}</div>`:'';
}
function coachFollowCard(id){
  if(planLocked())return lockCard('Tarjeta de seguimiento','El último avance de cada jugador y su balance del mes, con la mirada de su coach.');
  const note=coachLatest(id),example=!note,item=note||{label:'',good:exampleAssessment.good,focus:exampleAssessment.focus,by:'',video:''};
  return `<section class="card coach-follow"><small class="eyebrow">Seguimiento del coach${example?' · Ejemplo':item.label?' · '+esc(item.label):''}</small>
    <div class="follow-grid">
      <div class="follow-box is-good"><span class="follow-icon" aria-hidden="true">✓</span><b>Mejoraste</b><p>${esc(shortNote(item.good))||'—'}</p></div>
      <div class="follow-box is-next"><span class="follow-icon" aria-hidden="true">→</span><b>Siguiente ajuste</b><p>${esc(shortNote(item.focus))||'—'}</p>${followLinks(item,example)}</div>
    </div>${item.by?`<small class="muted follow-by">${esc(item.by)}</small>`:''}</section>`;
}
document.addEventListener('click',event=>{
  const t=event.target;
  const video=t.closest?.('[data-follow-video]');
  if(video){playVideo(video.dataset.followVideo);return}
  const cat=t.closest?.('[data-follow-cat]');
  if(cat)goVideoLibrary(cat.dataset.followArea,cat.dataset.followCat,cat.dataset.followSub||'');
});
