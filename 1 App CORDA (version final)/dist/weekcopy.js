// CORDA · Duplicar semana: el coach copia las sesiones de una semana a otra en un paso.
function weekCopyKey(s){return s.date+'|'+s.time+'|'+String(s.title||'').trim().toLowerCase()}
function weekCopyPlan(from,to){
  const shift=Math.round((new Date(to+'T12:00:00')-new Date(from+'T12:00:00'))/86400000);
  const src=[...Array(7)].flatMap((_,i)=>sessionsFor(dateAfter(from,i))).filter(s=>!s.cancelled);
  const have=new Set(state.sessions.map(weekCopyKey)),add=[],skip=[];
  for(const s of src){
    const date=dateAfter(s.date,shift),copy={...s,date,day:(new Date(date+'T12:00:00').getDay()+6)%7,id:Date.now()+add.length+Math.floor(Math.random()*1000),done:false};
    for(const k of ['cancelled','cancelReason','movedFrom','rainMoved'])delete copy[k];
    if(have.has(weekCopyKey(copy)))skip.push(copy);else add.push(copy);
  }
  return {src,add,skip};
}
function weekCopyOpen(){
  const from=weekOf(agendaDate),label=d=>dateLabel(d,{day:'numeric',month:'long'});
  const count=weekCopyPlan(from,from).src.length;
  if(!count){toast('Esta semana aún no tiene sesiones para duplicar.');return}
  const opts=[1,2,3,4].map(n=>{const d=dateAfter(from,7*n);return `<option value="${d}">Semana del ${esc(label(d))}${n===1?' (la próxima)':''}</option>`}).join('');
  modal('Duplicar semana',`<p class="full hint">Se copian las <b>${count}</b> sesiones de la semana del <b>${esc(label(from))}</b> con el mismo día, hora, cancha y plan. Las canceladas no se copian, y las que ya existan no se repiten. Después puedes editar cada sesión.</p>
    <label class="full">Copiar a<select name="to" id="wc-to">${opts}</select></label>
    <p class="full onb-preview" id="wc-prev" aria-live="polite"></p>`,
    data=>{
      const {add}=weekCopyPlan(from,data.to);
      if(!add.length){toast('Esa semana ya tiene todas estas sesiones.');return false}
      state.sessions.push(...add);agendaDate=data.to;
      toast(add.length+(add.length===1?' sesión copiada':' sesiones copiadas'));
    },'Duplicar');
  const sel=$('#wc-to'),prev=$('#wc-prev'),upd=()=>{const {add,skip}=weekCopyPlan(from,sel.value);prev.textContent=add.length+(add.length===1?' sesión nueva':' sesiones nuevas')+(skip.length?' · '+skip.length+' ya existían (se omiten)':'')};
  sel.onchange=upd;upd();
}
function bindWeekCopy(){
  if(role!=='Coach')return;
  if($('#dupweek'))$('#dupweek').onclick=weekCopyOpen;
}
