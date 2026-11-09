// Private lesson fees belong to the coach; they do not contribute to an academy monthly balance.
let privateWeek='';
function weekOf(date){
  return dateAfter(date,-((new Date(date+'T12:00:00').getDay()+6)%7));
}
function coachLedger(){
  const coach=actor();
  state.privateLessons??=[];
  let book=state.privateLessons.find(b=>b.coachId===coach.memberId);
  if(!book){book={coachId:coach.memberId,students:[]};state.privateLessons.push(book)}
  return book;
}
function mxn(amount){
  return Number(amount).toLocaleString('es-MX',{style:'currency',currency:'MXN'});
}
function privateRow(student,week){
  return student.weeks[week]||{amount:student.rate,paid:false,files:[]};
}
function weekLabel(week){
  const opts={day:'numeric',month:'short',year:'numeric'};
  return dateLabel(week,opts)+' – '+dateLabel(dateAfter(week,6),opts);
}
function weeklyPage(){
  const book=coachLedger();
  privateWeek||=weekOf(localDay());
  const students=book.students.filter(s=>s.start<=privateWeek);
  const paid=students.filter(s=>privateRow(s,privateWeek).paid);
  const sum=list=>list.reduce((total,s)=>total+Number(privateRow(s,privateWeek).amount),0);
  return heading('Pagos privados','Control semanal de tus clases particulares · MXN','<button class="btn lime" id="private-add">+ Añadir jugador</button>')+
    `<section class="card"><div class="private-week"><button class="link" data-private-shift="-7" aria-label="Semana anterior">← Anterior</button><div><small class="eyebrow">Semana de clases</small><h2>${weekLabel(privateWeek)}</h2><button class="link" id="private-today">Semana actual</button></div><button class="link" data-private-shift="7" aria-label="Semana siguiente">Siguiente →</button></div>
    <div class="private-totals"><div><small>Cobrado</small><b>${mxn(sum(paid))}</b></div><div><small>Pendiente</small><b>${mxn(sum(students)-sum(paid))}</b></div><div><small>Jugadores al corriente</small><b>${paid.length} de ${students.length}</b></div></div></section>
    ${coachPrivateInbox(privateWeek)}<div class="private-list">${students.map(s=>{
      const row=privateRow(s,privateWeek);
      return `<section class="card"><div class="row"><div><small class="eyebrow">${s.academyPlayer?'Jugador de la academia':'Jugador externo'}</small><h2>${esc(s.name)}</h2></div><span class="badge ${row.paid?'':'clay'}">${row.paid?'✓ Pagado':'Pendiente'}</span></div><h3>${mxn(row.amount)}</h3><button class="btn small" data-private-edit="${esc(s.id)}">Registrar o editar pago</button><label class="private-file">Adjuntar comprobante<input type="file" data-private-file="${esc(s.id)}" accept="image/jpeg,image/png,application/pdf"></label>
      ${row.files.length?row.files.map(f=>`<div class="private-receipt"><b>${esc(f.name)}</b><div><button class="link" data-private-view="${f.id}">Ver</button><button class="link" data-private-download="${f.id}">Descargar ↓</button></div></div>`).join(''):'<small>Sin comprobantes esta semana.</small>'}</section>`;
    }).join('')||'<section class="card"><h2>Sin jugadores para esta semana</h2><p class="hint">Añade a quienes toman clases particulares contigo, aunque entrenen fuera de la academia.</p></section>'}</div>`;
}
function receiptStorage(mode,operation){
  return new Promise((resolve,reject)=>{
    const opening=indexedDB.open('corda-private-receipts',1);
    opening.onerror=()=>reject(opening.error);
    opening.onupgradeneeded=()=>opening.result.createObjectStore('files');
    opening.onsuccess=()=>{
      const db=opening.result,tx=db.transaction('files',mode),request=operation(tx.objectStore('files'));
      tx.oncomplete=()=>{db.close();resolve(request.result)};
      tx.onabort=()=>{db.close();reject(tx.error||Error('Error de almacenamiento'))};
    };
  });
}
function savePrivateRow(student,week,row){
  const old=student.weeks[week];student.weeks[week]=row;
  if(save())return true;
  if(old)student.weeks[week]=old;else delete student.weeks[week];
  return false;
}
function bindPrivatePayments(){
  if(role!=='Coach'||page!=='private-payments')return;
  const book=coachLedger(),week=privateWeek;
  document.querySelectorAll('[data-private-shift]').forEach(b=>b.onclick=()=>{privateWeek=dateAfter(week,Number(b.dataset.privateShift));render()});
  $('#private-today').onclick=()=>{privateWeek=weekOf(localDay());render()};
  $('#private-add').onclick=()=>{
    const members=academyPlayers(actor().academy);
    modal('Añadir jugador particular',`<label class="full">Jugador<select name="member"><option value="">Externo a la academia</option>${members.map(m=>`<option value="${esc(m.id)}">${esc(m.name)}</option>`).join('')}</select></label><label class="full" id="private-name">Nombre del jugador externo<input name="name" required maxlength="100"></label><label class="full">Cuota semanal (MXN)<input type="number" min="0" max="999999" step="0.01" required name="rate"></label><p class="full hint">Se incorpora desde la semana seleccionada.</p>`,data=>{
      const member=members.find(m=>m.id===data.member),name=member?.name||data.name.trim();
      if(!name){toast('Escribe el nombre del jugador.');return false}
      if(book.students.some(s=>member?s.academyPlayer===member.id:!s.academyPlayer&&s.name.toLocaleLowerCase()===name.toLocaleLowerCase())){toast('Este jugador ya está en tus pagos privados.');return false}
      const student={id:newMemberId(),name,academyPlayer:member?.id||'',rate:Number(data.rate),start:week,weeks:{}};
      book.students.push(student);if(!save()){book.students.pop();return false}
    });
    const form=$('#modalform');form.elements.member.onchange=()=>{const external=!form.elements.member.value;$('#private-name').hidden=!external;form.elements.name.required=external};
  };
  document.querySelectorAll('[data-private-edit]').forEach(b=>b.onclick=()=>{
    const s=book.students.find(s=>s.id===b.dataset.privateEdit),row=privateRow(s,week);
    modal('Pago de '+esc(s.name),`<p class="full">${weekLabel(week)}</p><label>Importe de esta semana (MXN)<input name="amount" type="number" required min="0" max="999999" step="0.01" value="${row.amount}"></label>`+select('Estado','status',['Pendiente','Pagado'],row.paid?'Pagado':'Pendiente'),d=>savePrivateRow(s,week,{...privateRow(s,week),amount:Number(d.amount),paid:d.status==='Pagado'}));
  });
  document.querySelectorAll('[data-private-file]').forEach(input=>input.onchange=async()=>{
    const f=input.files[0],student=book.students.find(s=>s.id===input.dataset.privateFile);
    if(!f)return;
    if(!['image/jpeg','image/png','application/pdf'].includes(f.type)||f.size>5*1024*1024){toast('Elige un JPG, PNG o PDF de hasta 5 MB.');input.value='';return}
    const id=newMemberId();input.disabled=true;
    try{
      await receiptStorage('readwrite',store=>store.put(f,id));
      const row=privateRow(student,week);
      if(!savePrivateRow(student,week,{...row,files:[...row.files,{id,name:f.name}]})){await receiptStorage('readwrite',store=>store.delete(id));return}
      render();toast('Comprobante guardado en la semana seleccionada.');
    }catch{toast('No se pudo guardar el comprobante en este navegador.')}finally{input.disabled=false}
  });
  document.querySelectorAll('[data-private-view],[data-private-download]').forEach(b=>b.onclick=async()=>{
    try{
      const file=await receiptStorage('readonly',store=>store.get(b.dataset.privateView||b.dataset.privateDownload));
      if(!file)throw Error();
      const url=URL.createObjectURL(file);
      if(b.dataset.privateDownload){const a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);return}
      modal('Comprobante',`<div class="full"><p>${esc(file.name)} · ${weekLabel(week)}</p>${file.type==='application/pdf'?`<object class="private-preview" data="${url}" type="application/pdf">Usa Descargar para abrir el PDF.</object>`:`<img class="private-preview" src="${url}" alt="Comprobante de pago privado">`}<a class="btn light small" href="${url}" download="${esc(file.name)}">Descargar comprobante</a></div>`);
      $('#modal').addEventListener('close',()=>URL.revokeObjectURL(url),{once:true});
    }catch{toast('No se pudo abrir el comprobante en este navegador.')}
  });
}

// ---------- Clases particulares: el jugador le manda su comprobante a SU coach ----------
// No cuenta para la mensualidad de la academia. Solo lo ven el jugador, su tutor y el coach elegido
// (reglas en supabase/07_clases_particulares.sql). Se guarda en state.privateSent[jugador].
function privateSent(playerId){
  state.privateSent??={};
  return state.privateSent[playerId]??=[];
}
function academyCoaches(){
  return (state.directory||[]).filter(m=>m.role==='Coach'&&m.academy===state.profile.academy);
}
function privateStatusBadge(item){
  return `<span class="badge ${item.status==='Pagado'?'':'clay'}">${item.status==='Pagado'?'✓ Confirmado':'En revisión'}</span>`;
}
function privateReceiptLink(item){
  if(item.receipt?.path)return `<button type="button" class="link" data-receipt="${esc(item.receipt.path)}">Ver comprobante ↗</button>`;
  return item.receipt?.data?`<a class="link" href="${esc(item.receipt.data)}" download="${esc(item.receipt.name)}">Ver comprobante ↗</a>`:'';
}
function playerPrivateCard(){
  if(role==='Coach'||!state.profile?.memberId)return '';
  const list=privateSent(state.profile.memberId).slice().sort((a,b)=>b.at-a.at);
  return `<section class="card private-lessons" id="private-lessons"><small class="eyebrow">Clases particulares</small><h2>Pagos a tu coach</h2>
    <p class="hint">¿Tomas clases particulares y le pagas directo a tu coach? Sube aquí el comprobante. Solo lo verá ese coach; no cuenta para la mensualidad de la academia.</p>
    ${role==='Jugador'?'<button class="btn lime" id="private-send">Subir comprobante de clase particular</button>':''}
    ${list.length?`<div class="private-sent">${list.map(item=>`<div class="private-receipt"><div><b>${esc(item.coachName)}</b><small>${esc(weekLabel(item.week))}${item.amount?' · '+mxn(item.amount):''}</small></div><div>${privateStatusBadge(item)}${privateReceiptLink(item)}</div></div>`).join('')}</div>`:''}
  </section>`;
}
function openPrivateSend(){
  const coaches=academyCoaches();
  if(!coaches.length){toast('Todavía no hay coaches registrados en tu academia.');return}
  modal('Comprobante de clase particular',`<label class="full">¿A qué coach le pagaste?<select name="coach" required><option value="">Elige a tu coach</option>${coaches.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select></label>
    <label>Fecha de la clase<input type="date" name="date" required value="${localDay()}"></label>
    <label>Importe pagado (MXN, opcional)<input type="number" name="amount" min="0" max="999999" step="0.01"></label>
    <label class="full">Comprobante<input type="file" name="file" required accept="image/jpeg,image/png,application/pdf"></label>
    <p class="full hint">JPG, PNG o PDF · hasta 3 MB. Solo lo verá el coach que elijas.</p>`,data=>{
    const coach=coaches.find(c=>c.id===data.coach),file=data.file;
    if(!coach){toast('Elige a tu coach.');return false}
    if(!(file instanceof File)||!file.size){toast('Adjunta el comprobante.');return false}
    if(!['image/jpeg','image/png','application/pdf'].includes(file.type)||file.size>3*1024*1024){toast('Elige un JPG, PNG o PDF de hasta 3 MB.');return false}
    const button=$('#modalform .formactions .btn');if(button)button.disabled=true;
    readFile(file).then(url=>{
      privateSent(state.profile.memberId).push({id:newMemberId(),coachId:coach.id,coachName:coach.name,week:weekOf(data.date||localDay()),date:data.date,amount:data.amount?Number(data.amount):'',receipt:{name:file.name,data:url},status:'En revisión',at:Date.now()});
      if(!save())return;
      $('#modal').close();render();toast('Comprobante enviado a '+coach.name+'.');
    }).catch(()=>{toast('No se pudo leer el comprobante.');if(button)button.disabled=false});
    return false;
  },'Enviar al coach');
}
// Lo que los jugadores le mandaron a este coach.
function coachPrivateInbox(week){
  const me=actor()?.memberId,rows=[];
  for(const [playerId,list] of Object.entries(state.privateSent||{}))
    for(const item of list)if(item.coachId===me&&(item.status!=='Pagado'||item.week===week))rows.push({playerId,item});
  if(!rows.length)return '';
  rows.sort((a,b)=>b.item.at-a.item.at);
  const name=id=>(state.directory||[]).find(m=>m.id===id)?.name||'Jugador';
  return `<section class="card private-inbox"><small class="eyebrow">Enviados por tus jugadores</small><h2>Comprobantes de clases particulares</h2>
    ${rows.map(({playerId,item})=>`<div class="private-receipt"><div><b>${esc(name(playerId))}</b><small>${esc(weekLabel(item.week))}${item.amount?' · '+mxn(item.amount):''}</small></div><div>${privateStatusBadge(item)}${privateReceiptLink(item)}${item.status!=='Pagado'?`<button class="btn small" data-private-confirm="${esc(playerId)}|${esc(item.id)}">Confirmar pago</button>`:''}</div></div>`).join('')}</section>`;
}
document.addEventListener('click',event=>{
  if(event.target.closest?.('#private-send')){openPrivateSend();return}
  const confirm=event.target.closest?.('[data-private-confirm]');
  if(!confirm||role!=='Coach')return;
  const [playerId,id]=confirm.dataset.privateConfirm.split('|'),item=privateSent(playerId).find(i=>i.id===id);
  if(!item)return;
  item.status='Pagado';
  // Si el jugador ya está en "Pagos privados", esa semana queda pagada.
  const student=coachLedger().students.find(s=>s.academyPlayer===playerId);
  if(student){const row=privateRow(student,item.week);student.weeks[item.week]={...row,amount:item.amount||row.amount,paid:true}}
  save();render();toast('Pago confirmado.');
});
