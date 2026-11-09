// Códigos de acceso (lado del coach).
// Nadie entra a una academia sin un código: un coach aprobado crea uno por persona (Jugador, Tutor o, solo el dueño, Coach),
// se lo manda por WhatsApp y la persona lo escribe al registrarse. El código es de un solo uso, vence a los 30 días y se puede revocar.
// La clave de la academia (por ejemplo LA01367) es solo una etiqueta para que el coach reconozca a la persona: no es secreta.
// En Supabase: tabla access_codes y funciones create_access_code / list_access_codes / revoke_access_code / is_owner (supabase/10_codigos_de_acceso.sql).
const accessUI={codes:[],owner:false,error:'',fresh:null,loading:false};

function accessInvite(c){
  const url=location.origin+location.pathname,first=String(c.label||'').split(' ')[0]||'';
  const text=`Hola${first?' '+first:''}, tu academia te invita a CORDA. Entra a ${url}, elige «${c.role}» y escribe este código de acceso al crear tu cuenta: ${c.code}. Es de un solo uso y vence en 30 días.`;
  return 'https://wa.me/?text='+encodeURIComponent(text);
}
async function loadAccessCodes(){
  accessUI.error='';accessUI.loading=true;
  try{
    const {data:session}=await cloud.auth.getSession();
    if(!session.session){accessUI.error='Inicia sesión con tu cuenta de coach para crear códigos.';return}
    const [list,owner]=await Promise.all([cloud.rpc('list_access_codes'),cloud.rpc('is_owner')]);
    if(list.error){accessUI.error='No se pudieron cargar los códigos. Revisa tu conexión y que tu cuenta de coach esté aprobada.';return}
    accessUI.codes=Array.isArray(list.data)?list.data:[];
    accessUI.owner=owner.data===true;
  }catch{accessUI.error='No hay conexión con el servidor. Revisa tu internet.'}
  finally{accessUI.loading=false}
}
function accessCodesHtml(){
  const players=academyPlayers(actor().academy);
  const roles=['Jugador','Tutor'].concat(accessUI.owner?['Coach']:[]);
  const fresh=accessUI.fresh?`<section class="access-fresh" aria-live="polite"><small class="eyebrow">Código nuevo</small><p class="access-code access-code-big">${esc(accessUI.fresh.code)}</p><p class="hint">${esc(accessUI.fresh.role)} · ${esc(accessUI.fresh.label)}. Mándaselo por un medio privado: lo puede usar una sola vez.</p><div class="access-actions"><a class="btn lime small" href="${accessInvite(accessUI.fresh)}" target="_blank" rel="noopener noreferrer">Enviar por WhatsApp</a><button type="button" class="btn light small" data-code-copy="${esc(accessUI.fresh.code)}">Copiar</button></div></section>`:'';
  const rows=accessUI.codes.map(c=>`<article class="access-row" data-status="${esc(c.status)}"><div><b class="access-code">${c.code?esc(c.code):'—'}</b> <span class="badge">${esc(c.role)}</span> <small class="muted">${esc(c.status)}</small><p class="hint">${esc(c.label)}${c.member_ref?' · '+esc(c.member_ref):''}${c.status==='usado'&&c.used_by_name?' · lo usó '+esc(c.used_by_name):''}</p></div>${c.status==='pendiente'?`<div class="access-actions"><a class="link" href="${accessInvite(c)}" target="_blank" rel="noopener noreferrer">WhatsApp</a><button type="button" class="link" data-code-copy="${esc(c.code)}">Copiar</button><button type="button" class="link danger" data-code-revoke="${esc(c.id)}">Revocar</button></div>`:''}</article>`).join('');
  return `<div class="row"><h2>Códigos de acceso</h2><button type="button" id="access-close" aria-label="Cerrar">✕</button></div>
    <p class="hint">Nadie entra a tu academia sin un código. Crea uno por persona: se usa una sola vez y vence en 30 días.</p>
    ${accessUI.error?`<p class="auth-error" role="alert">${esc(accessUI.error)}</p>`:''}
    ${fresh}
    ${accessUI.error&&!accessUI.codes.length?'':`<form id="access-form" class="formgrid">
      <label>Perfil<select name="role">${roles.map(r=>`<option>${r}</option>`).join('')}</select></label>
      ${field('Nombre de la persona','label','')}
      ${field('Clave de la academia (opcional)','ref','','text',false)}
      <label class="full" id="access-child" hidden>Jugador a su cargo<select name="child"><option value="">Sin ligar a un jugador</option>${players.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}</select></label>
      <div class="full formactions"><button class="btn lime" id="access-create">Crear código</button></div>
    </form>`}
    <section class="access-list"><h3>Códigos de tu academia</h3>${rows||'<p class="hint">'+(accessUI.loading?'Cargando…':'Todavía no has creado ningún código.')+'</p>'}</section>`;
}
function paintAccess(dialog){
  dialog.innerHTML=accessCodesHtml();
  dialog.querySelector('#access-close').onclick=()=>dialog.close();
  const form=dialog.querySelector('#access-form');
  if(!form)return;
  const toggle=()=>{dialog.querySelector('#access-child').hidden=form.elements.role.value!=='Tutor'};
  form.elements.role.onchange=toggle;toggle();
  form.onsubmit=async e=>{
    e.preventDefault();
    const d=Object.fromEntries(new FormData(form)),button=dialog.querySelector('#access-create');
    button.disabled=true;
    try{
      const {data,error}=await cloud.rpc('create_access_code',{p_role:d.role,p_label:d.label.trim(),p_ref:(d.ref||'').trim(),p_child:d.role==='Tutor'?(d.child||''):''});
      if(error){toast(error.message||'No se pudo crear el código.');button.disabled=false;return}
      accessUI.fresh={code:data,role:d.role,label:d.label.trim()};
      await loadAccessCodes();
    }catch{toast('No se pudo crear el código. Revisa tu conexión.')}
    paintAccess(dialog);
  };
}
async function openAccessCodes(){
  if(role!=='Coach')return;
  let dialog=document.getElementById('access-dialog');
  if(!dialog){dialog=document.createElement('dialog');dialog.id='access-dialog';document.body.appendChild(dialog)}
  accessUI.fresh=null;accessUI.codes=[];accessUI.loading=true;paintAccess(dialog);
  if(!dialog.open)dialog.showModal();
  await loadAccessCodes();paintAccess(dialog);
}
document.addEventListener('click',async event=>{
  const t=event.target;
  if(t.closest?.('#access-codes')){openAccessCodes();return}
  const copy=t.closest?.('[data-code-copy]');
  if(copy){
    try{await navigator.clipboard.writeText(copy.dataset.codeCopy);toast('Código copiado.')}catch{toast('No se pudo copiar. Selecciónalo y cópialo a mano.')}
    return;
  }
  const revoke=t.closest?.('[data-code-revoke]');
  if(revoke){
    if(!revoke.dataset.sure){revoke.dataset.sure='1';revoke.textContent='¿Seguro? Toca otra vez';return}
    const {error}=await cloud.rpc('revoke_access_code',{p_id:revoke.dataset.codeRevoke});
    if(error){toast(error.message||'No se pudo revocar.');return}
    await loadAccessCodes();
    const dialog=document.getElementById('access-dialog');
    if(dialog?.open)paintAccess(dialog);
    toast('Código revocado.');
  }
});
