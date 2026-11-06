const meetingDays=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
function meetingHosts(){
  const registered=state.directory.filter(m=>m.academy===state.profile.academy&&['Coach','Director'].includes(m.role))
    .sort((a,b)=>(a.role==='Director'?0:1)-(b.role==='Director'?0:1)||a.name.localeCompare(b.name));
  if(registered.length)return registered;
  return [
    {id:'demo-director',name:'Andrea Flores',role:'Director',demo:true},
    {id:'demo-tenis',name:'Alex Rivera',role:'Coach',demo:true},
    {id:'demo-competencia',name:'Mar López',role:'Coach',demo:true}
  ];
}
function demoOfficeHours(host){
  const rules={};
  if(host.demo)for(const day of [1,2,3,4,5]){
    rules[day]={from:host.role==='Director'?'09:00':'10:00',to:host.role==='Director'?'12:00':'13:00'};
  }
  return rules;
}
function meetingBook(){
  const group=groupData();
  group.officeHours??={};group.meetings??=[];
  return group;
}
function clockMinutes(clock){return Number(clock.slice(0,2))*60+Number(clock.slice(3))}
function clockLabel(minutes){return [Math.floor(minutes/60),minutes%60].map(n=>String(n).padStart(2,'0')).join(':')}
function meetingSlots(date,hosts,group,now=new Date()){
  const day=new Date(date+'T12:00:00').getDay();
  const slots=[];
  for(let start=0;start<1440;start+=30){
    const time=clockLabel(start);
    if(new Date(date+'T'+time)<=now)continue;
    const statuses=hosts.map(host=>{
      const rule=(group.officeHours[host.id]??demoOfficeHours(host))[day];
      const busy=group.meetings.some(m=>m.date===date&&m.time===time&&(m.hosts.includes(host.id)||m.playerId===state.profile.memberId));
      return busy?'Ocupado':rule&&start>=clockMinutes(rule.from)&&start+30<=clockMinutes(rule.to)?'Disponible':'Sin atención';
    });
    if(statuses.some(s=>s!=='Sin atención'))slots.push({time,statuses,free:statuses.every(s=>s==='Disponible')});
  }
  return slots;
}
function meetingCard(){
  const group=meetingBook(),now=new Date();
  const upcoming=group.meetings.filter(m=>(role==='Coach'||m.playerId===state.profile.memberId)&&new Date(m.date+'T'+m.time)>=now)
    .sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  return `<section class="card meeting-card"><small class="eyebrow">Comunicación</small><h2>Citas con la academia</h2><p class="hint">Reúnete con tu coach, el director o ambos para revisar tu entrenamiento.</p>
  <button class="btn small" id="meet-start">Agendar cita con…</button>${role==='Coach'?'<button class="link" id="meet-hours">Horarios de atención</button>':''}
  ${upcoming.map(m=>`<div class="meeting-receipt"><small>${m.demo?'Cita de ejemplo':'Cita agendada'} · Presencial · ${esc(m.requesterRole)}</small><b>${dateLabel(m.date,{day:'numeric',month:'short'})} · ${esc(m.time)}</b><p>${esc(m.names.join(' y '))} · ${esc(m.requester)}</p><small>${esc(m.venue||group.academy)}</small></div>`).join('')}</section>`;
}
function meetingDialog(title,body){
  const dialog=$('#modal');
  dialog.innerHTML=`<div class="row"><h2>${title}</h2><button id="meet-close" aria-label="Cerrar">✕</button></div>${body}`;
  if(!dialog.open)dialog.showModal();
  $('#meet-close').onclick=()=>dialog.close();
  return dialog;
}
function officeHoursDialog(selectedId){
  const hosts=meetingHosts();
  const host=hosts.find(h=>h.id===selectedId)||hosts[0],group=meetingBook(),rules=group.officeHours[host.id]??demoOfficeHours(host);
  const options=Array.from({length:48},(_,i)=>clockLabel(30*i));
  const times=value=>options.map(t=>`<option ${value===t?'selected':''}>${t}</option>`).join('');
  meetingDialog('Horarios de atención',`<label class="meeting-person">Responsable<select id="office-owner">${hosts.map(h=>`<option value="${esc(h.id)}" ${h.id===host.id?'selected':''}>${esc(h.name)} · ${esc(h.role)}</option>`).join('')}</select></label>
  <p class="hint">Marca los días de juntas y la franja de atención semanal. Cada cita dura 30 minutos.</p><form id="office-form">${[1,2,3,4,5,6,0].map(d=>`<div class="office-row"><label><input type="checkbox" name="day-${d}" ${rules[d]?'checked':''}> ${meetingDays[d]}</label><select name="from-${d}" aria-label="Inicio ${meetingDays[d]}">${times(rules[d]?.from||'09:00')}</select><span>a</span><select name="to-${d}" aria-label="Fin ${meetingDays[d]}">${times(rules[d]?.to||'11:00')}</select></div>`).join('')}<button class="btn lime">Guardar horarios</button></form>`);
  $('#office-owner').onchange=e=>officeHoursDialog(e.target.value);
  $('#office-form').onsubmit=e=>{
    e.preventDefault();const data=new FormData(e.target),next={};
    for(let day=0;day<7;day++)if(data.has('day-'+day)){
      const from=data.get('from-'+day),to=data.get('to-'+day);
      if(from>=to){toast('Revisa el horario del '+meetingDays[day].toLowerCase()+'.');return}
      next[day]={from,to};
    }
    group.officeHours[host.id]=next;
    if(!save()){group.officeHours[host.id]=rules;return}
    $('#modal').close();render();toast('Horarios de atención guardados');
  };
}
function openMeetings(){
  const hosts=meetingHosts();
  const group=meetingBook(),chosen=new Set();
  let date=localDay(),weekStart=dateAfter(date,-((new Date(date+'T12:00:00').getDay()+6)%7)),slot='';
  function people(){
    meetingDialog('Agendar cita con…',`<p class="hint">Junta presencial · Paso 1 de 2. Selecciona los círculos de quienes quieres que asistan.<br>${hosts[0].demo?'Participantes y horarios de ejemplo para probar la reserva.':esc(state.profile.academy)}</p><div class="meet-people">${hosts.map(h=>`<button data-host="${esc(h.id)}" aria-pressed="${chosen.has(h.id)}"><i class="meet-circle" aria-hidden="true"></i>${avatar(h)}<span><strong>${esc(h.name)}</strong><small>${esc(h.role)}</small></span></button>`).join('')}</div><button id="meet-calendar" class="btn" ${chosen.size?'':'disabled'}>Ver calendario</button>`);
    document.querySelectorAll('[data-host]').forEach(b=>b.onclick=()=>{
      if(chosen.has(b.dataset.host))chosen.delete(b.dataset.host);else chosen.add(b.dataset.host);
      b.setAttribute('aria-pressed',String(chosen.has(b.dataset.host)));$('#meet-calendar').disabled=!chosen.size;
    });
    $('#meet-calendar').onclick=()=>{
      const selected=hosts.filter(h=>chosen.has(h.id));
      const today=localDay();
      date=today;
      for(let offset=0;offset<28;offset++){
        const candidate=dateAfter(today,offset);
        if(meetingSlots(candidate,selected,group).some(s=>s.free)){date=candidate;break}
      }
      weekStart=dateAfter(date,-((new Date(date+'T12:00:00').getDay()+6)%7));slot='';calendar();
    };
  }
  function calendar(){
    const selected=hosts.filter(h=>chosen.has(h.id)),today=localDay(),slots=meetingSlots(date,selected,group);
    const days=Array.from({length:7},(_,i)=>dateAfter(weekStart,i));
    const buttons=days.map(d=>{
      const rows=meetingSlots(d,selected,group);
      const label=d<today?'Pasado':rows.some(s=>s.free)?'Libre':rows.some(s=>s.statuses.includes('Ocupado'))?'Ocupado':'Sin horario';
      return `<button data-meet-day="${d}" aria-pressed="${d===date}" ${d<today?'disabled':''}><small>${dateLabel(d,{weekday:'short'})}</small><b>${Number(d.slice(8))}</b><small>${label}</small></button>`;
    }).join('');
    meetingDialog('Calendario de citas',`<p class="hint">${esc(selected.map(h=>h.name).join(' + '))} · 30 min · Hora local<br>Junta presencial en ${esc(group.academy)}${group.address?' · '+esc(group.address):''}.</p><div class="row"><button id="meet-prev" class="link" ${weekStart<=today?'disabled':''}>← Anterior</button><b>${dateLabel(weekStart,{month:'long',year:'numeric'})}</b><button id="meet-next" class="link">Siguiente →</button></div><div class="meet-week">${buttons}</div><h3>${dateLabel(date,{weekday:'long',day:'numeric',month:'long'})}</h3>
    <div class="meet-slots">${slots.map(s=>`<button data-meet-time="${s.time}" ${s.free?'':'disabled'} aria-pressed="${slot===s.time}"><b>${s.time}</b><small>${esc(selected.map((h,i)=>h.name+' · '+s.statuses[i]).join(' / '))}</small></button>`).join('')||'<p class="hint">No hay horarios de atención para esta fecha. Revisa otro día o semana.</p>'}</div>
    <div class="formactions"><button id="meet-back" class="link">← Integrantes</button><button class="btn lime" id="meet-confirm" ${slots.some(s=>s.free&&s.time===slot)?'':'disabled'}>Confirmar cita</button></div>`);
    $('#meet-back').onclick=people;
    for(const [id,offset] of [['meet-prev',-7],['meet-next',7]])$('#'+id).onclick=()=>{weekStart=dateAfter(weekStart,offset);date=weekStart<today?today:weekStart;slot='';calendar()};
    document.querySelectorAll('[data-meet-day]').forEach(b=>b.onclick=()=>{date=b.dataset.meetDay;slot='';calendar()});
    document.querySelectorAll('[data-meet-time]').forEach(b=>b.onclick=()=>{slot=b.dataset.meetTime;calendar()});
    $('#meet-confirm').onclick=()=>{
      if(!meetingSlots(date,selected,group).some(s=>s.free&&s.time===slot)){slot='';calendar();toast('Ese horario ya no está disponible.');return}
      group.meetings.push({id:newMemberId(),date,time:slot,hosts:[...chosen],names:selected.map(h=>h.name),playerId:state.profile.memberId,requester:actor().name,requesterRole:role,demo:selected.some(h=>h.demo),venue:group.academy});
      if(!save()){group.meetings.pop();return}
      $('#modal').close();render();toast('Cita agendada · '+slot);
    };
  }
  people();
}
function bindMeetingCard(){
  if($('#meet-start'))$('#meet-start').onclick=openMeetings;
  if($('#meet-hours'))$('#meet-hours').onclick=()=>officeHoursDialog();
}
