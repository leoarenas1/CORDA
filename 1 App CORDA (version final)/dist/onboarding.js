// CORDA · Entrada fácil: importar jugadores (pegando desde Excel o con un CSV) e invitarlos por WhatsApp con su código de acceso.
function onbNorm(s){return String(s||'').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ')}
function onbParse(text){
  const lines=String(text||'').split(/\r?\n/).map(l=>l.trim()).filter(Boolean),out=[];
  lines.forEach((line,i)=>{
    const cells=line.split(/\t|;|,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(c=>c.replace(/^"|"$/g,'').trim());
    const name=cells[0]||'';
    if(i===0&&/^(nombre|name|jugador|alumno)/i.test(name))return;
    if(name.length<2||/^[\d\s+().-]+$/.test(name))return;
    const phone=cells.slice(1).find(c=>/^[+\d\s().-]{8,}$/.test(c)&&/^\d{10,15}$/.test(c.replace(/\D/g,'')))||'';
    out.push({name:name.slice(0,80),phone});
  });
  return out;
}
function onbSplit(rows){
  const academy=actor().academy,have=new Set((state.directory||[]).filter(m=>m.academy===academy&&m.role==='Jugador').map(m=>onbNorm(m.name)));
  const seen=new Set(),fresh=[],dup=[];
  for(const r of rows){const k=onbNorm(r.name);if(have.has(k)||seen.has(k))dup.push(r);else{seen.add(k);fresh.push(r)}}
  return {fresh,dup};
}
function onbCard(members){
  const invited=members.filter(m=>m.invitedAt).length;
  return `<section class="card onb-card"><div><small class="eyebrow">Entrada fácil</small><h2>Suma a toda tu academia en minutos</h2><p class="hint">Pega tu lista desde Excel y manda a cada familia su código por WhatsApp.${members.length?` · ${invited} de ${members.length} invitados`:''}</p></div><div class="onb-actions"><button type="button" class="btn lime" id="onb-import">Importar lista</button><button type="button" class="btn light" id="onb-invite">${typeof WA_ICON!=='undefined'?WA_ICON:''}<span>Invitar por WhatsApp</span></button></div></section>`;
}
function onbImport(){
  modal('Importar jugadores',`<p class="full hint">En Excel o Google Sheets, selecciona las filas con <b>nombre</b> y <b>WhatsApp</b> (una columna al lado de la otra), cópialas y pégalas aquí. También puedes subir un archivo CSV. Para menores, escribe el WhatsApp de mamá, papá o tutor.</p>
    <label class="full">Lista<textarea name="list" id="onb-list" rows="8" placeholder="Mateo Ruiz	33 1234 5678&#10;Sofía Pérez	33 8765 4321"></textarea></label>
    <label class="full onb-file">…o sube un archivo CSV<input type="file" id="onb-file" accept=".csv,.txt,text/csv,text/plain"></label>
    <p class="full onb-preview" id="onb-preview" aria-live="polite">Pega tu lista para ver cuántos jugadores se agregarán.</p>`,
    data=>{
      const {fresh}=onbSplit(onbParse(data.list));
      if(!fresh.length){toast('No encontré jugadores nuevos en la lista.');return false}
      const academy=actor().academy,ids=[];
      for(const r of fresh){const id=newMemberId();ids.push(id);state.directory.push({id,role:'Jugador',name:r.name,academy,phone:r.phone,email:'',bio:'',photo:''})}
      setTimeout(()=>onbInvite(ids),120);
    },'Importar');
  const box=$('#onb-list'),prev=$('#onb-preview'),update=()=>{
    const rows=onbParse(box.value);
    if(!rows.length){prev.textContent='Pega tu lista para ver cuántos jugadores se agregarán.';return}
    const {fresh,dup}=onbSplit(rows),withPhone=fresh.filter(r=>r.phone).length;
    prev.textContent=`${fresh.length} ${fresh.length===1?'jugador nuevo':'jugadores nuevos'} · ${withPhone} con WhatsApp${dup.length?` · ${dup.length} repetidos (se omiten)`:''}`;
  };
  box.oninput=update;
  $('#onb-file').onchange=async e=>{
    const f=e.target.files[0];if(!f)return;
    if(f.size>512*1024){toast('El archivo es muy grande. Usa uno de menos de 500 KB.');return}
    box.value=await f.text();update();
  };
}
function onbInvite(ids){
  const academy=actor().academy;
  let members=academyPlayers(academy);
  if(ids)members=members.filter(m=>ids.includes(m.id));
  const all=academyPlayers(academy);
  const row=m=>{
    const phone=phoneDigits(m.phone);
    return `<li class="onb-row" data-onb-member="${esc(m.id)}"><div class="onb-who">${avatar(m)}<div><b>${esc(m.name)}</b><small>${phone?'+'+esc(phone):'Sin WhatsApp'}${m.invitedAt?' · Invitado '+esc(dateLabel(m.invitedAt,{day:'numeric',month:'short'})):''}</small></div></div>
      <div class="onb-row-actions">${phone?`<label class="onb-minor"><input type="checkbox" data-onb-minor> Menor de edad</label><button type="button" class="btn small ${m.invitedAt?'light':'lime'}" data-onb-send="${esc(m.id)}">${m.invitedAt?'Reenviar':'Invitar'}</button>`:`<button type="button" class="btn small light" data-onb-phone="${esc(m.id)}">Añadir WhatsApp</button>`}</div></li>`;
  };
  modal(ids?'Jugadores agregados':'Invitar por WhatsApp',`<p class="full hint">${ids?`Se agregaron ${members.length} jugadores. `:''}Cada invitación crea un código de un solo uso (vence en 30 días) y abre tu WhatsApp con el mensaje listo. Si es menor de edad, marca la casilla y el mensaje incluye también el código del tutor.</p>
    <ul class="full onb-list">${(ids?members:all).map(row).join('')||'<li class="hint">Aún no hay jugadores. Usa «Importar lista».</li>'}</ul>`,null);
  const dlg=$('#modal');
  dlg.classList.add('onb-modal');
  if(!dlg._onbBound){
    dlg._onbBound=true;
    dlg.addEventListener('close',()=>{if(!dlg.open)dlg.classList.remove('onb-modal')});
    dlg.addEventListener('click',e=>{
      const send=e.target.closest('[data-onb-send]'),phone=e.target.closest('[data-onb-phone]');
      if(send){const li=send.closest('li');onbSend(send.dataset.onbSend,!!li.querySelector('[data-onb-minor]')?.checked,send)}
      if(phone){dlg.close();editMember(phone.dataset.onbPhone,'Jugador')}
    });
  }
}
async function onbSend(id,minor,btn){
  const m=(state.directory||[]).find(x=>x.id===id),phone=m?phoneDigits(m.phone):'';
  if(!m||!phone){toast('Añade primero el WhatsApp.');return}
  if(typeof cloud==='undefined'||!cloud){toast('Inicia sesión con tu cuenta de coach para crear códigos.');return}
  const w=window.open('about:blank','_blank');   // se abre antes de esperar al servidor para que el navegador no lo bloquee
  btn.disabled=true;
  try{
    const {data:s}=await cloud.auth.getSession();
    if(!s?.session){if(w)w.close();toast('Inicia sesión con tu cuenta de coach para crear códigos.');btn.disabled=false;return}
    const p=await cloud.rpc('create_access_code',{p_role:'Jugador',p_label:m.name,p_ref:'',p_child:''});
    if(p.error)throw p.error;
    let tutorCode='';
    if(minor){const t=await cloud.rpc('create_access_code',{p_role:'Tutor',p_label:'Tutor de '+m.name,p_ref:'',p_child:m.id});if(t.error)throw t.error;tutorCode=t.data}
    const first=String(m.name||'').trim().split(/\s+/)[0],coach=String(actor()?.name||'').trim().split(/\s+/)[0],url=location.origin+location.pathname;
    const lines=[`Hola${minor?', familia de '+first:' '+first}. ${coach?'Soy '+coach+', de ':'Te escribimos de '}${actor().academy}.`,
      'Te invitamos a CORDA, la app de la academia para entrenamientos, avisos y mensualidades.',
      `Entra a ${url} y crea tu cuenta con ${tutorCode?'estos códigos de un solo uso':'este código de un solo uso'} (vencen en 30 días):`,
      `• Jugador (${first}): ${p.data}`,tutorCode?`• Tutor (mamá, papá o tutor): ${tutorCode}`:'',
      'Elige tu perfil, escribe el código y listo.'].filter(Boolean);
    const link='https://wa.me/'+phone+'?text='+encodeURIComponent(lines.join('\n'));
    m.invitedAt=localDay();save();
    if(w){w.location.href=link}else{window.open(link,'_blank','noopener,noreferrer')}
    toast('Invitación lista');
    btn.textContent='Reenviar';btn.classList.remove('lime');btn.classList.add('light');btn.disabled=false;
  }catch(err){
    if(w)w.close();
    toast((err&&err.message)||'No se pudo crear el código. Revisa tu conexión.');btn.disabled=false;
  }
}
function bindOnboarding(){
  if(role!=='Coach')return;
  if($('#onb-import'))$('#onb-import').onclick=onbImport;
  if($('#onb-invite'))$('#onb-invite').onclick=()=>onbInvite();
}
