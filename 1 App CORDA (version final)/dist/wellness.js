// Estado físico del jugador, dentro de «Análisis del coach».
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

// ---------- Datos de ejemplo (mientras el jugador no ha hecho ningún chequeo) ----------
function wellExample(){
  const records={};
  wellDays(7).forEach((d,i)=>{const s=WELL_EXAMPLE_SCORES[i];records[d]={sleepH:+(5.5+s/40).toFixed(1),sleepQ:Math.round(1+s/25),energy:Math.round(1+s/25),mood:Math.round(1+s/25),soreness:s>70?2:3,stress:s>70?2:3,pain:i===6?[{area:'Hombro',level:3}]:[]}});
  return records;
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
  const strip=days.map((d,i)=>{const s=scores[i],r=records[d],cls=s===null?(r?.pain?.some(p=>p.level>0)?'pain':'none'):wellClass(s);
    return `<div class="well-day ${cls}" role="listitem"><small>${dateLabel(d,{weekday:'short'})}</small><b>${s===null?'—':s}</b></div>`}).join('');
  const trend=load.ratio===null?(load.any?'Faltan más días para comparar':'Se calcula con el esfuerzo de tus sesiones'):(load.ratio>=1?'+':'')+Math.round((load.ratio-1)*100)+' % vs. el promedio de 4 semanas';
  return `<section class="card wellness" id="wellness-panel"><div class="sectiontitle"><div><small class="eyebrow">Estado físico${example?' · Datos de ejemplo':''}</small><h2>${self?'¿Cómo amaneces?':'Estado físico de '+first}</h2></div>
    ${self&&role==='Jugador'?`<button class="btn lime small" data-open-wellness>${doneToday?'Editar chequeo de hoy':'Chequeo de hoy · 30 s'}</button>`:''}</div>
    ${alerts.length?`<ul class="well-alerts">${alerts.map(a=>`<li class="well-alert sev-${a.sev}">⚠ ${esc(a.text)}</li>`).join('')}</ul>`:''}
    <div class="well-strip" role="list" aria-label="Preparación de los últimos 7 días">${strip}</div>
    <p class="hint well-scale-note">Preparación de 0 a 100 por día: sueño, energía, ánimo, dolor muscular y estrés.</p>
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
function wellnessBanner(){
  if(role!=='Jugador'||entry!=='app'||!state.profile?.memberId)return '';
  const done=wellPeek(state.profile.memberId)[localDay()];
  if(done&&readiness(done)!==null)return '';
  return `<section class="card checkin-banner calendar-banner wellness-banner"><div><small class="eyebrow">Chequeo diario</small><h2>¿Cómo amaneces hoy?</h2><p class="hint">30 segundos: sueño, energía y si te duele algo. Tu coach lo ve y ajusta la carga.</p></div><div class="calendar-actions"><button class="btn lime" data-open-wellness>Hacer chequeo</button></div></section>`;
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
