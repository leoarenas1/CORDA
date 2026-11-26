// CORDA · Panel del coach: notas de hoy, mensualidades por cobrar y quién necesita atención.
function coachAttention(members){
  const today=localDay(),cur=today.slice(0,7),prev=shiftMonthKey(cur,-1),day=Number(today.slice(8,10)),out=[];
  for(const m of members){
    const reasons=[];let sev=0;
    const st=typeof playerStatus==='function'?playerStatus(m.id):{level:'none'};
    if(st.level==='red'){reasons.push(st.reason);sev+=3}else if(st.level==='yellow'){reasons.push(st.reason);sev+=1}
    for(const key of [prev,cur]){
      const r=collectRow(m,key);
      if(r.status==='Pendiente'&&r.amount&&(key===prev||day>=10)){reasons.push('Mensualidad de '+dateLabel(key+'-01',{month:'long'})+' pendiente');sev+=1;break}
    }
    if(reasons.length)out.push({m,reasons,sev});
  }
  return out.sort((a,b)=>b.sev-a.sev||a.m.name.localeCompare(b.m.name)).slice(0,5);
}
function coachTodayCards(){
  const members=academyPlayers(actor().academy),today=localDay(),cur=today.slice(0,7);
  if(!members.length)return '';
  const doneN=members.filter(m=>quickDone(m.id,today)).length,pct=Math.round(doneN/members.length*100);
  const rows=members.map(m=>collectRow(m,cur));
  const pend=rows.filter(r=>r.status==='Pendiente'),rev=rows.filter(r=>r.status==='En revisión');
  const owe=pend.reduce((t,r)=>t+r.amount,0);
  const notes=`<section class="card today-card"><small class="eyebrow">Notas de hoy</small><div class="today-num"><b>${doneN}</b><span>de ${members.length} jugadores</span></div><span class="fam-bar" aria-hidden="true"><i style="width:${pct}%"></i></span><button class="btn lime" id="home-quick">${doneN<members.length?'Nota rápida':'Repasar notas'}</button></section>`;
  const clear=!pend.length&&!rev.length;
  const money=`<section class="card today-card"><small class="eyebrow">Mensualidades · ${esc(dateLabel(cur+'-01',{month:'long'}))}</small>${clear?'<div class="today-num"><b>✓</b><span>Todos al corriente</span></div>':`<div class="today-num"><b>${owe?mxn(owe).replace('.00',''):pend.length}</b><span>${owe?'por cobrar':'pendientes'}</span></div><p class="hint">${pend.length?pend.length+(pend.length===1?' jugador pendiente':' jugadores pendientes'):''}${pend.length&&rev.length?' · ':''}${rev.length?rev.length+' por confirmar':''}</p>`}<button class="btn" id="home-collect">${clear?'Ver pagos':'Ver y recordar'}</button></section>`;
  const attn=coachAttention(members);
  const attnCard=attn.length?`<section class="card attn-card"><small class="eyebrow">Necesitan tu atención</small><h2>${attn.length} ${attn.length===1?'jugador':'jugadores'}</h2><ul class="attn-list">${attn.map(a=>`<li><button type="button" class="attn-row" data-attn="${esc(a.m.id)}"><span class="attn-who">${avatar(a.m)}<span><b>${esc(a.m.name)}</b><small>${a.reasons.map(esc).join(' · ')}</small></span></span><span class="attn-go" aria-hidden="true">→</span></button></li>`).join('')}</ul></section>`:'';
  return `<div class="today-grid">${notes}${money}</div>${attnCard}`;
}
function bindCoachPanel(){
  if(role!=='Coach')return;
  if($('#home-quick'))$('#home-quick').onclick=()=>quickNote();
  if($('#home-collect'))$('#home-collect').onclick=()=>{payTab='mensualidades';page='private-payments';render();window.scrollTo(0,0)};
  document.querySelectorAll('[data-attn]').forEach(b=>b.onclick=()=>{rosterDetail=b.dataset.attn;page='goals';render();window.scrollTo(0,0)});
}
