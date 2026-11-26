// CORDA · Cobranza del coach: quién ya pagó el mes y recordatorio por WhatsApp.
// El recordatorio lo envía el propio coach desde su WhatsApp (se abre el chat con el mensaje ya escrito); CORDA no manda mensajes por su cuenta.
let payTab='mensualidades';
function payTabs(){
  return '<nav class="plan-tabs" aria-label="Tipo de pagos">'+[['mensualidades','Mensualidades'],['privadas','Clases privadas']].map(([id,t])=>`<button aria-pressed="${id===payTab}" data-pay-tab="${id}">${t}</button>`).join('')+'</nav>';
}
function shiftMonthKey(key,n){
  const d=new Date(Number(key.slice(0,4)),Number(key.slice(5,7))-1+n,1);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
}
function readFeeLedger(id){return (groupData().feePlayers||[]).find(l=>l.id===id)||null}
function ensureFeeLedger(id){
  const group=groupData();group.feePlayers??=[];
  let ledger=group.feePlayers.find(l=>l.id===id);
  if(!ledger){ledger={id,code:'',months:{}};group.feePlayers.push(ledger)}
  ledger.months??={};
  return ledger;
}
function collectRow(member,key){
  const ledger=readFeeLedger(member.id),row=ledger?.months?.[key]||{};
  const status=row.payment||(row.amount||key===localDay().slice(0,7)?'Pendiente':'Sin registro');
  return {member,ledger,row,status,amount:Number(row.amount)||0};
}
function remindAgo(date){
  if(!date)return '';
  const days=Math.round((new Date(localDay()+'T12:00:00')-new Date(date+'T12:00:00'))/86400000);
  return days<=0?'Recordado hoy':days===1?'Recordado ayer':'Recordado hace '+days+' días';
}
function remindText(r,key){
  const bank=bankSettings();
  const monthName=dateLabel(key+'-01',{month:'long',year:'numeric'});
  const first=String(r.member.name||'').trim().split(/\s+/)[0]||'tu jugador';
  const coach=String(actor()?.name||'').trim().split(/\s+/)[0];
  const lines=[`Hola, familia de ${first}. Te escribe ${coach?coach+', ':''}de ${state.profile.academy}.`,
    `Te recordamos la mensualidad de ${monthName}${r.amount?' ('+mxn(r.amount)+')':''}.`];
  if(r.ledger?.code)lines.push(`Al transferir, escribe solo la matrícula ${r.ledger.code} como concepto.`);
  if(bank.clabe)lines.push(`CLABE: ${bank.clabe}${bank.holder?' · '+bank.holder:''}.`);
  lines.push('Cuando pagues, sube el comprobante en CORDA: https://app.cordatenis.com','¡Gracias!');
  return lines.join('\n');
}
function collectionsPage(){
  const current=localDay().slice(0,7);
  if(!feeMonth)feeMonth=current;
  const key=feeMonth,players=academyPlayers(actor().academy);
  const rows=players.map(m=>collectRow(m,key));
  const paid=rows.filter(r=>r.status==='Pagado'),review=rows.filter(r=>r.status==='En revisión'),open=rows.filter(r=>!['Pagado','En revisión'].includes(r.status));
  const sum=list=>list.reduce((t,r)=>t+r.amount,0);
  const order={'Pendiente':0,'En revisión':1,'Sin registro':2,'Pagado':3};
  const sorted=[...rows].sort((a,b)=>order[a.status]-order[b.status]||a.member.name.localeCompare(b.member.name));
  const line=r=>{
    const phone=phoneDigits(r.member.phone),id=esc(r.member.id);
    const badge=r.status==='Pagado'?'<span class="badge">✓ Pagado</span>':r.status==='En revisión'?'<span class="badge gray">◷ En revisión</span>':r.status==='Pendiente'?'<span class="badge clay">Pendiente</span>':'<span class="badge gray">Sin registro</span>';
    const ago=remindAgo(r.row.remindedAt);
    const actions=r.status==='Pendiente'
      ?(phone?`<button class="btn small lime" data-remind="${id}">Recordar por WhatsApp ↗</button>`:`<button class="btn small light" data-add-phone="${id}">Añadir WhatsApp</button>`)+`<button class="link" data-copy-remind="${id}">Copiar mensaje</button>`
      :r.status==='En revisión'?`<button class="btn small" data-open-fees="${id}">Revisar comprobante</button>`:'';
    return `<li class="collect-row"><div class="collect-who">${avatar(r.member)}<div><b>${esc(r.member.name)}</b><small>${r.amount?mxn(r.amount):'Sin importe definido'}${ago&&r.status==='Pendiente'?' · '+ago:''}</small></div></div><div class="collect-state">${badge}</div><div class="collect-actions">${actions}<button class="link" data-open-fees="${id}">Ver pagos</button></div></li>`;
  };
  return heading('Pagos','Mensualidades de tu academia · MXN')+payTabs()+
    `<section class="card"><div class="private-week"><button class="link" data-collect-shift="-1" aria-label="Mes anterior">← Anterior</button><div><small class="eyebrow">Mensualidad de</small><h2 class="month-name">${dateLabel(key+'-01',{month:'long',year:'numeric'})}</h2>${key!==current?'<button class="link" id="collect-today">Mes actual</button>':''}</div><button class="link" data-collect-shift="1" aria-label="Mes siguiente">Siguiente →</button></div>
    <div class="private-totals"><div><small>Cobrado</small><b>${mxn(sum(paid))}</b></div><div><small>Por cobrar</small><b>${mxn(sum(open)+sum(review))}</b></div><div><small>Al corriente</small><b>${paid.length} de ${rows.length}</b></div></div></section>`+
    (rows.length?`<section class="card"><div class="row"><h2>Jugadores</h2>${open.length?`<span class="badge clay">${open.length} por cobrar</span>`:'<span class="badge">Todos al corriente</span>'}</div><ul class="collect-list">${sorted.map(line).join('')}</ul><p class="hint">El recordatorio se abre en tu WhatsApp con el mensaje ya escrito; tú decides si lo envías. Para jugadores menores, guarda el WhatsApp de su tutor en la ficha.</p></section>`
      :'<section class="card"><h2>Aún no hay jugadores</h2><p class="hint">Añade jugadores en la pestaña «Jugadores» para llevar sus mensualidades.</p></section>');
}
function bindCollections(){
  document.querySelectorAll('[data-pay-tab]').forEach(b=>b.onclick=()=>{payTab=b.dataset.payTab;render();window.scrollTo(0,0)});
  if(role!=='Coach'||page!=='private-payments'||payTab!=='mensualidades')return;
  document.querySelectorAll('[data-collect-shift]').forEach(b=>b.onclick=()=>{feeMonth=shiftMonthKey(feeMonth||localDay().slice(0,7),Number(b.dataset.collectShift));render()});
  if($('#collect-today'))$('#collect-today').onclick=()=>{feeMonth=localDay().slice(0,7);render()};
  const find=id=>academyPlayers(actor().academy).find(m=>m.id===id);
  document.querySelectorAll('[data-open-fees]').forEach(b=>b.onclick=()=>{rosterDetail=b.dataset.openFees;page='student-fees';render();window.scrollTo(0,0)});
  document.querySelectorAll('[data-add-phone]').forEach(b=>b.onclick=()=>editMember(b.dataset.addPhone,'Jugador'));
  document.querySelectorAll('[data-copy-remind]').forEach(b=>b.onclick=()=>{
    const m=find(b.dataset.copyRemind);if(!m)return;
    const text=remindText(collectRow(m,feeMonth),feeMonth);
    (navigator.clipboard?navigator.clipboard.writeText(text):Promise.reject()).then(()=>toast('Mensaje copiado'),()=>toast('No se pudo copiar. Usa «Recordar por WhatsApp».'));
  });
  document.querySelectorAll('[data-remind]').forEach(b=>b.onclick=()=>{
    const m=find(b.dataset.remind);if(!m)return;
    const phone=phoneDigits(m.phone);if(!phone){toast('Añade primero el WhatsApp en la ficha.');return}
    const key=feeMonth,text=remindText(collectRow(m,key),key);
    window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(text),'_blank','noopener,noreferrer');
    if(updateFeeRow(ensureFeeLedger(m.id),key,{remindedAt:localDay()}))render();
  });
}
