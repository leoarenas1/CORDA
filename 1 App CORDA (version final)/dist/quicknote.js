// CORDA · Nota rápida del coach (≈20 segundos): una pregunta a la vez, con toques y, si quiere, dictado por voz.
// Se guarda como la evaluación del día del jugador (la misma que ve en «Seguimiento del coach»).
const WA_ICON='<span class="wa-ico" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></span>';
const QUICK_TAGS=['Derecha','Revés','Saque','Volea','Movimiento','Táctica','Actitud','Físico'];
const QUICK_MOODS=[['great','Muy bien','Trabajó muy bien hoy.'],['ok','Va bien','Va por buen camino.'],['fix','A corregir','Hay detalles importantes por corregir.']];
function quickHasNote(record,day){
  const r=record?.reviews?.[day];
  return !!(r&&(r.quick||r.good||r.focus));
}
function quickPending(day){
  return academyPlayers(actor().academy).filter(m=>!quickHasNote(state.athletes?.[m.id],day));
}
function quickText(prefix,tags){
  return tags.length?prefix+' '+tags.map((t,i)=>i?t.toLowerCase():t).join(', ')+'.':'';
}
function quickNote(memberId){
  const members=academyPlayers(actor().academy),today=localDay();
  if(!members.length){toast('Añade primero a tus jugadores.');return}
  const member=members.find(m=>m.id===memberId)||quickPending(today)[0]||members[0];
  const record=athleteFor(member),old=record.reviews?.[today]||{};
  const done=members.filter(m=>quickHasNote(state.athletes?.[m.id],today)).length;
  const next=members.find(m=>m.id!==member.id&&!quickHasNote(state.athletes?.[m.id],today));
  const first=String(member.name||'').trim().split(/\s+/)[0]||'tu jugador';
  const phone=phoneDigits(member.phone);
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const S={mood:'',good:new Set(),focus:new Set(),extra:'',i:0};
  const STEPS=['mood','good','focus','extra'];
  const head=`<div class="quick-head">${avatar(member)}<div class="quick-head-text"><b>${esc(member.name)}</b><small>${done} de ${members.length} con nota hoy</small></div><select id="quick-member" aria-label="Cambiar de jugador">${members.map(m=>`<option value="${esc(m.id)}"${m.id===member.id?' selected':''}>${esc(m.name)}${quickHasNote(state.athletes?.[m.id],today)?' ✓':''}</option>`).join('')}</select></div>
    <div class="quick-dots" aria-hidden="true">${STEPS.map(()=>'<i></i>').join('')}</div><div id="quick-stage" class="quick-stage" aria-live="polite"></div>`;
  modal('Nota rápida',head,null);
  const m=$('#modal');
  m.classList.add('quick-modal');
  if(!m._quickBound){m._quickBound=true;m.addEventListener('close',()=>{if(!m.open)m.classList.remove('quick-modal')})}
  const stage=$('#quick-stage'),dots=[...m.querySelectorAll('.quick-dots i')];
  const chips=set=>`<div class="quick-chips">${QUICK_TAGS.map((t,n)=>`<button type="button" class="quick-chip" style="--n:${n}" data-quick-tag="${t}" aria-pressed="${set.has(t)}">${t}</button>`).join('')}</div>`;
  const summary=()=>{
    const mood=QUICK_MOODS.find(x=>x[0]===S.mood),parts=[mood?mood[1]:'',S.good.size?'Mejoró: '+[...S.good].join(', '):'',S.focus.size?'Ajuste: '+[...S.focus].join(', '):''].filter(Boolean);
    return parts.length?`<p class="quick-summary">${esc(parts.join(' · '))}</p>`:'';
  };
  const nav=(back,mid,main)=>`<div class="quick-nav">${back?'<button type="button" class="link" data-q="back">← Atrás</button>':'<span></span>'}${mid||''}${main||''}</div>`;
  const html={
    mood:()=>`<h3 class="quick-q">¿Cómo trabajó ${esc(first)} hoy?</h3><div class="quick-moods">${QUICK_MOODS.map(([id,t],n)=>`<button type="button" class="quick-mood mood-${id}" style="--n:${n}" data-quick-mood="${id}" aria-pressed="${S.mood===id}">${t}</button>`).join('')}</div><p class="muted quick-tip">Toca una opción para continuar.</p>`,
    good:()=>`<h3 class="quick-q">¿Qué mejoró?</h3>${chips(S.good)}${nav(true,'<button type="button" class="link" data-q="skip">Omitir</button>','<button type="button" class="btn lime" data-q="next">Siguiente →</button>')}`,
    focus:()=>`<h3 class="quick-q">¿Qué ajustamos después?</h3>${chips(S.focus)}${nav(true,'<button type="button" class="link" data-q="skip">Omitir</button>','<button type="button" class="btn lime" data-q="next">Siguiente →</button>')}`,
    extra:()=>`<h3 class="quick-q">¿Algo más para ${esc(first)}?</h3>${summary()}<label class="quick-extra"><span class="visually-hidden">Nota</span><textarea id="quick-extra" maxlength="400" rows="3" placeholder="Una frase corta (opcional)…">${esc(S.extra)}</textarea></label>${SR?'<div class="quick-dictate"><button type="button" class="btn light small" id="quick-dictate">🎤 Dictar</button> <small class="muted" id="quick-dictate-state"></small></div>':''}${nav(true,'','<button type="button" class="btn lime" data-q="save">Guardar nota</button>')}${phone?'<button type="button" class="btn light quick-next quick-wa" data-q="save-wa">'+WA_ICON+'<span>Guardar y enviar a la familia</span></button>':'<button type="button" class="quick-addphone" data-q="add-phone">'+WA_ICON+'<span>Añadir a la familia</span></button>'}${next?'<button type="button" class="btn light quick-next" data-q="save-next">Guardar y pasar a '+esc(next.name.split(' ')[0])+' →</button>':''}`
  };
  function view(i,dir=1){
    S.i=i;
    dots.forEach((d,n)=>d.className=n<i?'is-done':n===i?'is-now':'');
    const el=document.createElement('div');
    el.className='quick-step '+(dir<0?'from-left':'from-right');
    el.innerHTML=html[STEPS[i]]();
    stage.replaceChildren(el);
    const f=el.querySelector('button');if(f&&i>0)f.focus({preventScroll:true});
  }
  function save(){
    const mood=QUICK_MOODS.find(x=>x[0]===S.mood),goodTags=[...S.good],focusTags=[...S.focus];
    const extra=($('#quick-extra')?.value||S.extra||'').trim();
    if(!mood&&!goodTags.length&&!focusTags.length&&!extra){toast('Elige cómo trabajó o escribe una nota.');view(0,-1);return false}
    const good=[goodTags.length?quickText('Mejoró:',goodTags):(mood&&mood[0]!=='fix'?mood[2]:''),extra].filter(Boolean).join(' ');
    const focus=focusTags.length?quickText('Siguiente ajuste:',focusTags):(mood&&mood[0]==='fix'?mood[2]:'');
    S.last={mood,goodTags,focusTags,extra};
    record.reviews??={};
    record.reviews[today]={...old,good:good||old.good||'',focus:focus||old.focus||'',mood:mood?mood[0]:(old.mood||''),quick:true,by:actor()?.name||''};
    return true;
  }
  const FAMILY={great:'Trabajó muy bien hoy.',ok:'Va por buen camino.',fix:'Hay detalles por afinar.'};
  function familyText(){
    const l=S.last||{},coach=String(actor()?.name||'').trim().split(/\s+/)[0];
    return [`Hola, familia de ${first}. Les comparto cómo trabajó hoy en ${state.profile.academy}:`,
      l.mood?FAMILY[l.mood[0]]:'',
      l.goodTags?.length?quickText('Mejoró:',l.goodTags):'',
      l.extra||'',
      l.focusTags?.length?quickText('Siguiente ajuste:',l.focusTags):'',
      coach?'Cualquier duda, con gusto. — '+coach:'Cualquier duda, con gusto.'].filter(Boolean).join('\n');
  }
  function finish(goNext,whatsapp){
    if(!save())return;
    if(whatsapp&&phone)window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(familyText()),'_blank','noopener,noreferrer');
    saveState();
    stage.innerHTML=`<div class="quick-done"><svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="23"/><path d="M15 27l8 8 15-17"/></svg><b>Nota guardada</b><small>${esc(first)}</small></div>`;
    dots.forEach(d=>d.className='is-done');
    setTimeout(()=>{
      if(goNext&&next){quickNote(next.id)}
      else{m.close();render();toast('Nota guardada')}
    },820);
  }
  stage.addEventListener('click',e=>{
    const t=e.target.closest('button');if(!t)return;
    if(t.dataset.quickMood){
      S.mood=t.dataset.quickMood;
      stage.querySelectorAll('[data-quick-mood]').forEach(b=>b.setAttribute('aria-pressed',String(b===t)));
      setTimeout(()=>view(1,1),260);return;
    }
    if(t.dataset.quickTag){
      const set=S.i===1?S.good:S.focus,tag=t.dataset.quickTag;
      if(set.has(tag))set.delete(tag);else set.add(tag);
      t.setAttribute('aria-pressed',String(set.has(tag)));return;
    }
    const q=t.dataset.q;
    if(q==='back')view(Math.max(0,S.i-1),-1);
    else if(q==='next'||q==='skip')view(S.i+1,1);
    else if(q==='save')finish(false);
    else if(q==='save-next')finish(true);
    else if(q==='save-wa')finish(true,true);
    else if(q==='add-phone')editMember(member.id,'Jugador');
  });
  stage.addEventListener('input',e=>{if(e.target.id==='quick-extra')S.extra=e.target.value});
  $('#quick-member').onchange=e=>quickNote(e.target.value);
  stage.addEventListener('click',e=>{
    if(!SR||e.target.id!=='quick-dictate')return;
    const btn=e.target,st=$('#quick-dictate-state'),box=$('#quick-extra');
    if(m._rec){m._rec.stop();return}
    const rec=new SR();m._rec=rec;rec.lang='es-MX';rec.interimResults=false;rec.continuous=false;
    rec.onresult=ev=>{const t=[...ev.results].map(r=>r[0].transcript).join(' ').trim();if(t){box.value=((box.value?box.value+' ':'')+t).slice(0,400);S.extra=box.value}};
    rec.onerror=()=>{st.textContent='No se pudo escuchar. Revisa el permiso del micrófono.'};
    rec.onend=()=>{m._rec=null;btn.textContent='🎤 Dictar';if(!st.textContent.startsWith('No'))st.textContent=''};
    try{rec.start();btn.textContent='■ Detener';st.textContent='Escuchando… (usa el servicio de voz de tu navegador)'}catch{m._rec=null}
  });
  view(0,1);
}
// Guarda el estado de la app (el mismo guardado que usa «modal»)
function saveState(){try{if(typeof save==='function')save()}catch{}}
function bindQuickNotes(){
  if(role!=='Coach')return;
  if($('#quick-notes'))$('#quick-notes').onclick=()=>quickNote();
  if($('#student-quick'))$('#student-quick').onclick=()=>quickNote(rosterDetail);
}
