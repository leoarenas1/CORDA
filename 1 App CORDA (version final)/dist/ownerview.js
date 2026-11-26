// CORDA · Vista del dueño: cobranza, asistencia, jugadores en riesgo de irse y actividad del equipo.
// Solo la ve la cuenta de dueño de la academia (la misma que puede crear códigos de coach).
const OWN={owner:false,checked:false,checking:false};
async function ownerCheck(){
  if(OWN.checked||OWN.checking||role!=='Coach'||typeof cloud==='undefined'||!cloud)return;
  OWN.checking=true;
  try{
    const {data:s}=await cloud.auth.getSession();
    if(!s?.session){return}
    const r=await cloud.rpc('is_owner');
    OWN.checked=true;
    if(r.data===true&&!OWN.owner){OWN.owner=true;if(role==='Coach'&&page==='home'&&!$('#modal')?.open)render()}
  }catch{}
  finally{OWN.checking=false}
}
function ownerAttendance(members,days=14){
  const from=dateAfter(localDay(),-days);let went=0,total=0;
  for(const m of members){
    for(const [day,c] of Object.entries(peekCheckins(m.id).coach||{})){
      if(day<from||day>localDay())continue;
      total++;if(c.attended!==false)went++;
    }
  }
  return {pct:total?Math.round(went/total*100):null,went,total};
}
function ownerMonths(members,n=6){
  const cur=localDay().slice(0,7),out=[];
  for(let i=n-1;i>=0;i--){
    const key=shiftMonthKey(cur,-i);let paid=0,owed=0,paidN=0,owedN=0;
    for(const m of members){
      const r=collectRow(m,key);
      if(r.status==='Pagado'){paid+=r.amount;paidN++}
      else if(r.amount&&(r.status==='Pendiente'||r.status==='En revisión')){owed+=r.amount;owedN++}
    }
    out.push({key,paid,owed,paidN,owedN});
  }
  return out;
}
function ownerTeam(){
  const academy=actor().academy,week=dateAfter(localDay(),-7),map={};
  for(const m of (state.directory||[]).filter(x=>x.role==='Coach'&&x.academy===academy))map[m.name]={name:m.name,notes:0,last:''};
  for(const [id,store] of Object.entries(state.checkins||{})){
    if(!academyPlayers(academy).some(p=>p.id===id))continue;
    for(const [day,c] of Object.entries(store.coach||{})){
      const by=c.by||'Coach';
      const e=map[by]??={name:by,notes:0,last:''};
      if(day>=week)e.notes++;
      if(day>e.last)e.last=day;
    }
  }
  return Object.values(map).sort((a,b)=>b.notes-a.notes||a.name.localeCompare(b.name));
}
function ownerCsv(){
  const members=academyPlayers(actor().academy),key=feeMonth||localDay().slice(0,7);
  const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
  const lines=[['Jugador','Mes','Importe (MXN)','Estado','Último recordatorio'].map(q).join(',')];
  for(const m of members){const r=collectRow(m,key);lines.push([m.name,key,r.amount||'',r.status,r.row.remindedAt||''].map(q).join(','))}
  const blob=new Blob(['﻿'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download='cobranza-'+key+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);
}
function ownerPage(){
  if(!OWN.owner)return heading('Vista del dueño',esc(actor().academy))+'<section class="card"><h2>Solo para el dueño de la academia</h2><p class="hint">Esta pantalla la ve la cuenta de dueño. Si lo eres y no la ves, cierra sesión y vuelve a entrar.</p><button class="link" data-page="home">← Volver al panel</button></section>';
  const academy=actor().academy,members=academyPlayers(academy),cur=localDay().slice(0,7);
  const months=ownerMonths(members),now=months[months.length-1],expected=now.paid+now.owed,pct=expected?Math.round(now.paid/expected*100):null;
  const att=ownerAttendance(members),risk=coachAttention(members,8),team=ownerTeam();
  const max=Math.max(1,...months.map(m=>m.paid+m.owed));
  const bars=months.map(m=>`<div class="own-bar"><div class="own-bar-col" title="${esc(dateLabel(m.key+'-01',{month:'long',year:'numeric'}))}"><i class="own-paid" style="height:${Math.round(m.paid/max*100)}%"></i><i class="own-owed" style="height:${Math.round(m.owed/max*100)}%"></i></div><small>${esc(dateLabel(m.key+'-01',{month:'short'}))}</small><b>${m.paid?mxn(m.paid).replace('.00','').replace('$','$'):'—'}</b></div>`).join('');
  const kpi=(label,big,sub)=>`<section class="card own-kpi"><small class="eyebrow">${label}</small><div class="today-num"><b>${big}</b></div><p class="hint">${sub}</p></section>`;
  return `<button class="link" data-page="home">← Panel</button>`+heading('Vista del dueño',esc(academy)+' · '+members.length+' jugadores')+
    `<div class="own-kpis">${kpi('Cobrado · '+esc(dateLabel(cur+'-01',{month:'long'})),expected?mxn(now.paid).replace('.00',''):'—',expected?pct+' % de '+esc(mxn(expected).replace('.00',''))+' esperados':'Define los importes para ver el avance')}${kpi('Por cobrar',now.owed?mxn(now.owed).replace('.00',''):'$0',now.owedN?now.owedN+(now.owedN===1?' jugador pendiente':' jugadores pendientes'):'Todos al corriente')}${kpi('Asistencia · 14 días',att.pct===null?'—':att.pct+' %',att.total?att.went+' de '+att.total+' registros':'Aún sin asistencia registrada')}</div>`+
    `<section class="card"><div class="row"><h2>Cobranza · últimos 6 meses</h2><span class="own-legend"><i class="own-paid"></i> Cobrado <i class="own-owed"></i> Por cobrar</span></div><div class="own-bars">${bars}</div><div class="own-actions"><button class="btn lime" id="own-go-pay">Ver y recordar pagos</button><button class="btn light" id="own-csv">Descargar cobranza (CSV)</button></div></section>`+
    `<section class="card"><small class="eyebrow">Retención</small><h2>Jugadores en riesgo de irse</h2>${risk.length?`<ul class="attn-list">${risk.map(a=>`<li><button type="button" class="attn-row" data-attn="${esc(a.m.id)}"><span class="attn-who">${avatar(a.m)}<span><b>${esc(a.m.name)}</b><small>${a.reasons.map(esc).join(' · ')}</small></span></span><span class="attn-go" aria-hidden="true">→</span></button></li>`).join('')}</ul>`:'<p class="hint">Nadie con señales de alerta por ahora.</p>'}</section>`+
    `<section class="card"><small class="eyebrow">Equipo</small><h2>Uso de la app por coach</h2>${team.length?`<ul class="own-team">${team.map(t=>`<li><b>${esc(t.name)}</b><span>${t.notes} ${t.notes===1?'nota':'notas'} esta semana</span><small>${t.last?'Última actividad: '+esc(dateLabel(t.last,{day:'numeric',month:'short'})):'Sin actividad todavía'}</small></li>`).join('')}</ul>`:'<p class="hint">Cuando los coaches registren asistencia y notas, verás aquí su actividad.</p>'}</section>`;
}
function bindOwner(){
  if(role!=='Coach')return;
  if($('#own-csv'))$('#own-csv').onclick=ownerCsv;
  if($('#own-go-pay'))$('#own-go-pay').onclick=()=>{payTab='mensualidades';page='private-payments';render();window.scrollTo(0,0)};
  if($('#home-owner'))$('#home-owner').onclick=()=>{page='owner';render();window.scrollTo(0,0)};
  ownerCheck();
}
