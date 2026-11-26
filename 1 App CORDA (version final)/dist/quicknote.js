// CORDA · Nota rápida del coach (≈20 segundos): una pregunta a la vez, con toques y, si quiere, dictado por voz.
// Se guarda como la evaluación del día del jugador (la misma que ve en «Seguimiento del coach»).
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
    extra:()=>`<h3 class="quick-q">¿Algo más para ${esc(first)}?</h3>${summary()}<label class="quick-extra"><span class="visually-hidden">Nota</span><textarea id="quick-extra" maxlength="400" rows="3" placeholder="Una frase corta (opcional)…">${esc(S.extra)}</textarea></label>${SR?'<div class="quick-dictate"><button type="button" class="btn light small" id="quick-dictate">🎤 Dictar</button> <small class="muted" id="quick-dictate-state"></small></div>':''}${nav(true,'','<button type="button" class="btn lime" data-q="save">Guardar nota</button>')}${next?'<button type="button" class="btn light quick-next" data-q="save-next">Guardar y pasar a '+esc(next.name.split(' ')[0])+' →</button>':''}`
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
    record.reviews??={};
    record.reviews[today]={...old,good:good||old.good||'',focus:focus||old.focus||'',mood:mood?mood[0]:(old.mood||''),quick:true,by:actor()?.name||''};
    return true;
  }
  function finish(goNext){
    if(!save())return;
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
