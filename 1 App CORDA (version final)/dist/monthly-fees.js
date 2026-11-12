let feeMonth='';
function feeLedger(){
  const group=groupData();
  group.feePlayers??=[];
  const playerId=role==='Coach'&&page==='student-fees'?rosterDetail:state.profile.memberId;
  let ledger=group.feePlayers.find(item=>item.id===playerId);
  if(!ledger){
    ledger={id:playerId,code:'',months:{}};
    group.feePlayers.push(ledger);
    if(!state.legacyFeesImported){
      ledger.months={...state.billingHistory};
      if((state.receipt||state.payment==='Pagado'||state.payment==='En revisión')){
        ledger.months[state.billingMonth||localDay().slice(0,7)]={receipt:state.receipt,payment:state.payment};
      }
      delete state.billingHistory;delete state.receipt;delete state.payment;delete state.billingMonth;
      state.legacyFeesImported=true;
    }
  }
  return ledger;
}
function bankSettings(){
  const group=groupData();
  const known=/mouratoglou/i.test(group.academy)&&/guadalajara|gdl/i.test(group.academy);
  return group.feeBank||{bank:known?'Santander':'',holder:known?'GS SPORTS ACADEMY SA DE CV':'',account:'',clabe:''};
}
function feeStatus(ledger,key){
  return ledger.months[key]?.payment||(ledger.months[key]?.amount||key===localDay().slice(0,7)?'Pendiente':'Sin registro');
}
function feePage(){
  const current=localDay().slice(0,7),ledger=feeLedger(),bank=bankSettings();
  if(!feeMonth)feeMonth=current;
  const year=Number(feeMonth.slice(0,4)),row=ledger.months[feeMonth]||{},status=feeStatus(ledger,feeMonth);
  const months=Array.from({length:12},(_,i)=>{
    const key=year+'-'+String(i+1).padStart(2,'0'),value=feeStatus(ledger,key);
    const mark=value==='Pagado'?'✓':value==='En revisión'?'◷':'';
    return `<button data-fee-month="${key}" aria-pressed="${key===feeMonth}"><span class="fee-dot ${value==='Pagado'?'paid':value==='En revisión'?'review':''}" aria-hidden="true">${mark}</span><span><b>${dateLabel(key+'-01',{month:'long'})}</b><small>${value}</small></span></button>`;
  }).join('');
  return heading('Pagos a la academia','Consulta tu matrícula, adjunta el comprobante y revisa qué meses ya están pagados.')+
    `<section class="card"><div class="row"><h2>Mis pagos de ${year}</h2><div><button class="link" data-fee-year="${year-1}" aria-label="Año anterior">←</button><button class="link" data-fee-year="${year+1}" aria-label="Año siguiente">→</button></div></div><div class="fee-months">${months}</div></section>
    <div class="columns fee-detail"><section class="card"><small class="eyebrow">Mes seleccionado</small><h2>${dateLabel(feeMonth+'-01',{month:'long',year:'numeric'})}</h2><span class="badge">${status==='Pagado'?'✓ ':''}${status}</span><div class="metric">${row.amount?esc(Number(row.amount).toLocaleString('es-MX',{style:'currency',currency:'MXN'})):'Por definir'} <small>MXN</small></div>
    ${row.receipt?`<p class="hint">Comprobante · ${esc(row.receipt.name)}</p>${row.receipt.path?`<button type="button" class="link" data-receipt="${esc(row.receipt.path)}">Ver comprobante ↗</button>`:`<a href="${esc(row.receipt.data)}" download="${esc(row.receipt.name)}">Descargar comprobante ↗</a>`}`:''}
    ${status!=='Pagado'?`<label class="fee-upload">Adjuntar comprobante a este mes<input type="file" id="fee-upload" accept="image/jpeg,image/png,application/pdf"><small>JPG, PNG o PDF · Hasta 1.5 MB</small></label>`:''}
    ${role==='Coach'&&row.receipt&&status==='En revisión'?'<button class="btn lime" id="fee-confirm">Confirmar pago recibido</button>':''}</section>
    <section class="card"><div class="row"><h2>Cómo pagar</h2>${role==='Coach'?'<button id="fee-config" class="link">Configurar</button>':''}</div>
    <ol class="fee-steps"><li>Selecciona el mes y revisa el importe indicado por tu academia.</li><li>Transfiere el importe en MXN a la cuenta indicada abajo. En el concepto o referencia escribe <strong>únicamente tu matrícula de 7 caracteres</strong>, incluidos los ceros iniciales. Un concepto distinto puede ocasionar el rechazo del pago.</li><li>Sube el comprobante al mes que pagaste. Cuando administración verifique el ingreso, verás una palomita verde junto a ese mes.</li></ol>
    <div class="fee-reference"><small>Tu matrícula personal</small><b>${esc(ledger.code||'Pendiente de asignar')}</b></div>
    <dl class="bank-info">${[['Banco',bank.bank],['Beneficiario',bank.holder],['Número de cuenta',bank.account],['CLABE',bank.clabe]].map(([k,v])=>`<dt>${k}</dt><dd>${esc(v||'Pendiente de configurar')}</dd>`).join('')}</dl>
    ${!ledger.code||!(bank.account||bank.clabe)?'<p class="hint">Solicita a administración los datos pendientes antes de transferir.</p>':''}</section></div>${playerPrivateCard()}`;
}
function updateFeeRow(ledger,key,patch){
  const previous=ledger.months[key];
  ledger.months[key]={...previous,...patch};
  if(save())return true;
  if(previous)ledger.months[key]=previous;else delete ledger.months[key];
  return false;
}
function bindFees(){
  if(!['payments','student-fees'].includes(page))return;
  const ledger=feeLedger(),key=feeMonth;
  document.querySelectorAll('[data-fee-month]').forEach(b=>b.onclick=()=>{feeMonth=b.dataset.feeMonth;render()});
  document.querySelectorAll('[data-fee-year]').forEach(b=>b.onclick=()=>{feeMonth=b.dataset.feeYear+key.slice(4);render()});
  const upload=$('#fee-upload');
  if(upload)upload.onchange=async()=>{
    const f=upload.files[0];if(!f)return;
    if(f.size>1.5*1024*1024||!['image/jpeg','image/png','application/pdf'].includes(f.type)){toast('Elige un JPG, PNG o PDF menor de 1.5 MB.');upload.value='';return}
    upload.disabled=true;
    try{
      const receipt={name:f.name,data:await readFile(f)};
      if(ledger.months[key]?.payment==='Pagado')return;
      if(updateFeeRow(ledger,key,{payment:'En revisión',receipt})){render();toast('Comprobante recibido para '+dateLabel(key+'-01',{month:'long',year:'numeric'}))}
    }catch{toast('No se pudo leer el comprobante.')}finally{upload.disabled=false}
  };
  if($('#fee-confirm'))$('#fee-confirm').onclick=()=>{
    if(role==='Coach'&&ledger.months[key]?.receipt&&updateFeeRow(ledger,key,{payment:'Pagado'})){render();toast('Pago confirmado')}
  };
  if($('#fee-config'))$('#fee-config').onclick=()=>{
    const bank=bankSettings(),group=groupData();
    const inputs=[['Matrícula del jugador (7 caracteres)','code',ledger.code],['Importe de este mes (MXN)','amount',ledger.months[key]?.amount],['Banco','bank',bank.bank],['Beneficiario','holder',bank.holder],['Número de cuenta','account',bank.account],['CLABE (18 dígitos)','clabe',bank.clabe]];
    modal('Datos de mensualidad',inputs.map(([label,name,v])=>field(label,name,v||'','text',false)).join(''),data=>{
      const code=data.code.trim(),amount=data.amount.trim(),clabe=data.clabe.trim();
      if(code&&!/^[a-z0-9]{7}$/i.test(code)){toast('La matrícula debe tener siete letras o números.');return false}
      if(amount&&(!/^\d+(\.\d{1,2})?$/.test(amount)||Number(amount)<=0)){toast('Revisa el importe en MXN.');return false}
      if(clabe&&!/^\d{18}$/.test(clabe)){toast('La CLABE debe tener 18 dígitos.');return false}
      const oldCode=ledger.code,oldBank=group.feeBank;
      ledger.code=code;group.feeBank={bank:data.bank.trim(),holder:data.holder.trim(),account:data.account.trim(),clabe};
      if(!updateFeeRow(ledger,key,{amount})){ledger.code=oldCode;group.feeBank=oldBank;return false}
    });
  };
}
