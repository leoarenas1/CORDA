// CORDA · Inicio familiar (tutor): mensualidad con monto y botón de pago, último mensaje del coach, WhatsApp al coach y qué datos ve la familia.
function tutorCoachFor(childId){
  const map=state.coachPlayers||{},academy=actor()?.academy;
  const coaches=(state.directory||[]).filter(m=>m.role==='Coach'&&m.academy===academy);
  const id=Object.keys(map).find(c=>(map[c]||[]).includes(childId));
  return coaches.find(c=>c.id===id)||coaches.find(c=>phoneDigits(c.phone))||coaches[0]||null;
}
const tutorClean=s=>String(s||'').replace(/^(Mejoró|Siguiente ajuste):\s*/i,'').trim();
function tutorWhen(date){
  const today=localDay();
  return date===today?'Hoy':date===dateAfter(today,-1)?'Ayer':dateLabel(date,{day:'numeric',month:'long'});
}
function tutorMoneyCard(){
  const cur=localDay().slice(0,7),ledger=feeLedger(),row=ledger.months[cur]||{},status=feeStatus(ledger,cur);
  const pay=safePayLink(bankSettings().payLink),open=status!=='Pagado'&&status!=='En revisión';
  const month=dateLabel(cur+'-01',{month:'long'});
  return `<section class="card money-card"><small class="eyebrow">Mensualidad · ${esc(month)}</small>
    <div class="money-row"><h2>${status==='Pagado'?'✓ ':''}${esc(status)}</h2>${row.amount?`<b class="money-amount">${esc(mxn(row.amount).replace('.00',''))}</b>`:''}</div>
    ${status==='En revisión'?'<p class="hint">Tu academia está revisando tu comprobante.</p>':''}
    ${open&&pay?`<a class="btn lime money-pay" href="${esc(pay)}" target="_blank" rel="noopener noreferrer">Pagar en línea ↗</a>`:''}
    <button class="link" data-page="payments">${open?'Cómo pagar y subir comprobante':'Ver pagos'} ↗</button></section>`;
}
function tutorCoachCard(member){
  const note=coachLatest(member.id),coach=tutorCoachFor(member.id),phone=coach?phoneDigits(coach.phone):'';
  const childFirst=String(member.name||'').trim().split(/\s+/)[0]||'mi hijo(a)';
  const coachFirst=String(coach?.name||'').trim().split(/\s+/)[0];
  if(!note&&!phone)return '';
  const by=note?.by||coach?.name||'Tu coach';
  const text='Hola'+(coachFirst?' '+coachFirst:'')+', soy familiar de '+childFirst+'. ';
  const wa=phone?`<a class="btn light quick-wa coach-wa" href="https://wa.me/${phone}?text=${encodeURIComponent(text)}" target="_blank" rel="noopener noreferrer">${typeof WA_ICON!=='undefined'?WA_ICON:''}<span>Escribirle a ${esc(coachFirst||'tu coach')}</span></a>`:'';
  return `<section class="card coach-says"><small class="eyebrow">Mensaje de tu coach${note?' · '+esc(tutorWhen(note.date)):''}</small>
    ${note?`<div class="says-by">${coach?avatar(coach):''}<b>${esc(by)}</b></div>
    ${note.good?`<p class="fam-line is-good"><span>✓</span><span><b>Lo que mejoró</b><br>${esc(tutorClean(note.good))}</span></p>`:''}
    ${note.focus?`<p class="fam-line is-next"><span>➜</span><span><b>Siguiente ajuste</b><br>${esc(tutorClean(note.focus))}</span></p>`:''}`:'<p class="hint">Cuando tu coach escriba una nota, la verás aquí.</p>'}
    ${wa}</section>`;
}
function tutorPrivacyLine(member){
  const first=esc(String(member.name||'').trim().split(/\s+/)[0]||'tu jugador');
  return `<details class="card fam-privacy"><summary>Qué ve tu familia de ${first}</summary>
    <p>Asistencia, preparación y cómo se siente, molestias, objetivos, torneos, las notas del coach y la mensualidad. Lo ven su coach, su academia y los tutores vinculados con el código de la academia.</p>
    <button type="button" class="link" data-legal="privacy">Leer el aviso de privacidad</button></details>`;
}
