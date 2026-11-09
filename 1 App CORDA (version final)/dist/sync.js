// Fase B: sincroniza los datos de la app con la tabla "items" de Supabase.
// La app sigue trabajando sobre "state" como siempre; este módulo:
//   1. al iniciar sesión baja los datos de la academia y del jugador y los pone en state,
//   2. después de cada guardado sube solo lo que cambió (y borra lo que se borró),
//   3. cada minuto (y al volver a la pestaña) baja lo nuevo de los demás.
// Quién puede ver o editar cada cosa lo deciden las reglas RLS de supabase/03_datos_compartidos.sql.
let syncCtx=null,syncedItems=new Map(),syncTimer=null,syncBusy=false,syncAgain=false,syncPoll=null,syncWarned=false;
const DEMO_MAX_ID=1e6; // ids chicos = datos de ejemplo de la app: no se suben
const PLAYER_KINDS=new Set(['checkin_player','competition','goal','fee_month','fee_code','private_receipt']);
const DELETABLE=new Set(['session','exercise','video','comment','post','meeting','office_hours','private_book','goal','competition','checkin_player','checkin_coach','review','monthly_review','fee_month','private_receipt']);
const isDemoItem=item=>typeof item?.id==='number'&&item.id<DEMO_MAX_ID;
const syncId=item=>String(item.id??(item._k??=newMemberId()));
const syncSlot=(member,kind,key)=>member+'|'+kind+'|'+key;

// ---------- Dónde vive cada dato en state ----------
function syncGroup(){
  const academy=syncCtx.academyName;
  let group=state.profile?.academy===academy?groupData():(state.academyGroups??=[]).find(g=>g.academy===academy);
  if(!group){group={academy,address:'',posts:[],messages:[]};state.academyGroups.push(group)}
  group.posts??=[];group.meetings??=[];group.officeHours??={};group.feePlayers??=[];
  return group;
}
function syncAthlete(id){
  personStore();
  return state.athletes[id]??={profile:{name:'',memberId:id,academy:syncCtx.academyName,level:'Por definir'},goals:[],reviews:{}};
}
function syncLedger(id){
  const group=syncGroup();
  let ledger=group.feePlayers.find(l=>l.id===id);
  if(!ledger){ledger={id,code:'',months:{}};group.feePlayers.push(ledger)}
  ledger.months??={};
  return ledger;
}
// Listas de la academia: [tipo, cómo leerla]
const ACADEMY_LISTS=[
  ['session',()=>state.sessions],['exercise',()=>state.exercises],['video',()=>state.videos],
  ['comment',()=>state.comments],['post',()=>syncGroup().posts],['meeting',()=>syncGroup().meetings]
];
// Datos de cada jugador guardados por fecha o mes: [tipo, cómo leer el objeto]
const PLAYER_MAPS=[
  ['checkin_player',id=>checkinStore(id).player],['checkin_coach',id=>checkinStore(id).coach],
  ['review',id=>syncAthlete(id).reviews??={}],['monthly_review',id=>syncAthlete(id).profile.monthlyReviews??={}],
  ['fee_month',id=>syncLedger(id).months]
];
function syncPlayers(){return syncCtx?.players||[]}

// ---------- Foto actual de state, como filas ----------
function collectItems(){
  const out=new Map(),put=(member_id,kind,key,data)=>{if(data!=null)out.set(syncSlot(member_id,kind,String(key)),{member_id,kind,key:String(key),data})};
  rememberPlayer();
  for(const [kind,get] of ACADEMY_LISTS)(get()||[]).forEach(item=>{if(!isDemoItem(item))put('',kind,syncId(item),item)});
  const group=syncGroup();
  Object.entries(group.officeHours).forEach(([host,rules])=>put('','office_hours',host,rules));
  put('','group_settings','main',{address:group.address||'',brand:group.brand||null,feeBank:group.feeBank||null});
  (state.directory||[]).filter(m=>m.academy===syncCtx.academyName&&m.id).forEach(m=>put('','member_card',m.id,{bio:m.bio||'',email:m.email||'',phone:m.phone||'',photo:m.photoRef||null}));
  (state.privateLessons||[]).forEach(book=>put('','private_book',book.coachId,book));
  for(const id of syncPlayers()){
    for(const [kind,get] of PLAYER_MAPS)Object.entries(get(id)).forEach(([key,value])=>put(id,kind,key,value));
    (syncAthlete(id).goals||[]).forEach(goal=>{if(!isDemoItem(goal))put(id,'goal',syncId(goal),goal)});
    const code=syncLedger(id).code;if(code)put(id,'fee_code','code',{code});
    privateSent(id).forEach(item=>put(id,'private_receipt',item.id,item));
  }
  if(syncCtx.role==='Jugador')(state.competition||[]).forEach(c=>put(syncCtx.memberId,'competition',syncId(c),c));
  return out;
}
function canWrite({member_id,kind,key}){
  const c=syncCtx;
  if(c.staff)return true;
  if(member_id)return c.role==='Jugador'&&member_id===c.memberId&&PLAYER_KINDS.has(kind);
  if(kind==='comment'||kind==='meeting')return true;
  return kind==='member_card'&&key===c.memberId;
}

// ---------- Subir cambios ----------
function scheduleSync(){
  if(!syncCtx)return;
  clearTimeout(syncTimer);
  syncTimer=setTimeout(()=>{syncTimer=null;pushItems()},700);
}
function syncReady(){
  return syncCtx&&cloud&&currentAccount&&currentAccount.memberId===syncCtx.memberId&&role===syncCtx.role&&(state.agendaAcademy||state.profile?.academy)===syncCtx.academyName;
}
async function pushItems(){
  if(!syncReady())return;
  if(syncBusy){syncAgain=true;return}
  syncBusy=true;
  try{
    try{await uploadMedia()}catch{} // si Storage falla, los datos se suben igual
    const now=collectItems(),upserts=[],deletes=new Map();
    for(const [slot,item] of now){
      if(!canWrite(item))continue;
      const json=JSON.stringify(item.data);
      if(syncedItems.get(slot)?.json!==json)upserts.push({slot,json,row:{academy_id:syncCtx.academyId,...item}});
    }
    for(const [slot,item] of syncedItems){
      if(now.has(slot)||!DELETABLE.has(item.kind)||!canWrite(item))continue;
      if(item.member_id&&!syncPlayers().includes(item.member_id))continue;
      const group=item.member_id+'|'+item.kind;
      if(!deletes.has(group))deletes.set(group,{member_id:item.member_id,kind:item.kind,keys:[],slots:[]});
      deletes.get(group).keys.push(item.key);deletes.get(group).slots.push(slot);
    }
    for(let i=0;i<upserts.length;i+=200){
      const chunk=upserts.slice(i,i+200);
      const {error}=await cloud.from('items').upsert(chunk.map(u=>u.row),{onConflict:'academy_id,member_id,kind,key'});
      if(error)throw error;
      chunk.forEach(u=>syncedItems.set(u.slot,{member_id:u.row.member_id,kind:u.row.kind,key:u.row.key,json:u.json}));
    }
    for(const d of deletes.values()){
      const {error}=await cloud.from('items').delete().eq('academy_id',syncCtx.academyId).eq('member_id',d.member_id).eq('kind',d.kind).in('key',d.keys);
      if(error)throw error;
      d.slots.forEach(slot=>syncedItems.delete(slot));
    }
    syncWarned=false;
  }catch(error){
    if(!syncWarned){syncWarned=true;toast(coverText('No se pudieron guardar tus cambios en la nube. Se reintentará solo.','Your changes could not be saved to the cloud. Retrying automatically.','Vos modifications n’ont pas pu être enregistrées dans le cloud. Nouvel essai automatique.'))}
    setTimeout(scheduleSync,15000);
  }finally{
    syncBusy=false;
    if(syncAgain){syncAgain=false;scheduleSync()}
  }
}

// ---------- Bajar datos ----------
async function fetchRows(){
  const rows=[];
  for(let from=0;;from+=1000){
    const {data,error}=await cloud.from('items').select('member_id,kind,key,data').eq('academy_id',syncCtx.academyId).order('updated_at').range(from,from+999);
    if(error)throw error;
    rows.push(...data);if(data.length<1000)return rows;
  }
}
// Reemplaza el contenido de una lista o un objeto sin cambiar su referencia (otras partes de la app la guardan).
function fillList(list,items){if(list)list.splice(0,list.length,...items)}
function fillMap(map,entries){if(!map)return;for(const key of Object.keys(map))delete map[key];Object.assign(map,entries)}
const byOrder=(a,b)=>(Number(a.at||a.id)||0)-(Number(b.at||b.id)||0);

// people: integrantes de la academia (solo nombre y rol, de academy_members()).
// profiles: perfiles completos que esta cuenta puede ver (el propio; todos si es coach; el hijo si es tutor).
// Correo, teléfono y descripción salen solo de la ficha que cada quien decide llenar (member_card).
function applyMembers(people,profiles){
  const academy=syncCtx.academyName,local=new Map((state.directory||[]).map(m=>[m.id,m]));
  const details=new Map(profiles.map(p=>[p.details?.memberId,p.details?.profile]).filter(([id])=>id));
  const members=[];
  for(const person of people){
    const id=person.member_id;if(!id)continue;
    const old=local.get(id)||{};
    members.push({...old,id,role:person.role,name:person.name||old.name||'',academy,photo:old.photo||'',bio:'',email:'',phone:''});
    const mine=syncCtx.role==='Jugador'&&id===syncCtx.memberId;
    if(person.role==='Jugador'&&!mine&&details.has(id)){
      // El perfil de otro jugador lo manda la nube; el propio lo manda este navegador.
      const {monthlyReviews,photo,...fields}=details.get(id)||{};
      Object.assign(syncAthlete(id).profile,fields,{name:person.name||fields.name||'',memberId:id,academy});
    }
  }
  state.directory=(state.directory||[]).filter(m=>m.academy!==academy).concat(members);
  if(syncCtx.staff)syncCtx.players=members.filter(m=>m.role==='Jugador').map(m=>m.id);
}
function applyRows(rows){
  rememberPlayer();
  const kinds=new Map();
  for(const row of rows){
    const group=row.member_id+'|'+row.kind;
    if(!kinds.has(group))kinds.set(group,[]);
    kinds.get(group).push(row);
  }
  const rowsOf=(member,kind)=>kinds.get(member+'|'+kind)||[];
  for(const [kind,get] of ACADEMY_LISTS){
    const list=get(),cloudItems=rowsOf('',kind).map(r=>r.data);
    if(!list)continue;
    // Si la academia aún no tiene nada de este tipo, se quedan los ejemplos de la app.
    fillList(list,cloudItems.length?cloudItems.sort(byOrder):list.filter(isDemoItem));
  }
  const group=syncGroup();
  fillMap(group.officeHours,Object.fromEntries(rowsOf('','office_hours').map(r=>[r.key,r.data])));
  const settings=rowsOf('','group_settings')[0]?.data;
  if(settings){group.address=settings.address||group.address;if(settings.brand)group.brand=settings.brand;if(settings.feeBank)group.feeBank=settings.feeBank}
  for(const r of rowsOf('','member_card')){
    const member=state.directory.find(m=>m.id===r.key&&m.academy===syncCtx.academyName);
    if(!member)continue;
    Object.assign(member,{bio:r.data.bio,email:r.data.email,phone:r.data.phone});
    member.photoRef=r.data.photo||null;
    if(!member.photoRef&&member.id!==actor()?.memberId){member.photo='';member.photoV=null}
  }
  if(syncCtx.staff){state.privateLessons??=[];fillList(state.privateLessons,rowsOf('','private_book').map(r=>r.data))}
  for(const id of syncPlayers()){
    for(const [kind,get] of PLAYER_MAPS)fillMap(get(id),Object.fromEntries(rowsOf(id,kind).map(r=>[r.key,r.data])));
    const goals=syncAthlete(id).goals,cloudGoals=rowsOf(id,'goal').map(r=>r.data);
    fillList(goals,cloudGoals.length?cloudGoals.sort(byOrder):goals.filter(isDemoItem));
    syncLedger(id).code=rowsOf(id,'fee_code')[0]?.data?.code||syncLedger(id).code||'';
    fillList(privateSent(id),rowsOf(id,'private_receipt').map(r=>r.data).sort((a,b)=>a.at-b.at));
  }
  if(syncCtx.role==='Jugador'&&state.competition)fillList(state.competition,rowsOf(syncCtx.memberId,'competition').map(r=>r.data).sort((a,b)=>String(a.date).localeCompare(String(b.date))));
  // Lo que acabamos de bajar ya está "sincronizado".
  syncedItems=new Map();
  for(const [slot,item] of collectItems())syncedItems.set(slot,{member_id:item.member_id,kind:item.kind,key:item.key,json:JSON.stringify(item.data)});
}
function safeToRender(){
  const focus=document.activeElement;
  return entry==='app'&&!$('#modal')?.open&&!(focus&&focus.matches?.('input,textarea,select'));
}
async function pullItems({first=false}={}){
  if(!syncReady()||syncBusy||syncTimer)return;
  syncBusy=true;
  try{
    const [{data:people,error},{data:profiles,error:problem},rows]=await Promise.all([
      cloud.rpc('academy_members'),
      cloud.from('profiles').select('details').eq('academy_id',syncCtx.academyId),
      fetchRows()
    ]);
    if(error||problem)throw error||problem;
    if(!syncReady())return;
    applyMembers(people||[],profiles||[]);
    let all=rows;
    // Primera vez en este navegador: lo que solo existe aquí se sube (no se pierde nada).
    if(first){
      const cloudSlots=new Set(rows.map(r=>syncSlot(r.member_id,r.kind,r.key)));
      const extra=[...collectItems()].filter(([slot,item])=>!cloudSlots.has(slot)&&canWrite(item)&&item.kind!=='group_settings'&&item.kind!=='member_card').map(([,item])=>({academy_id:syncCtx.academyId,...item}));
      for(let i=0;i<extra.length;i+=200){
        const {error:problem}=await cloud.from('items').upsert(extra.slice(i,i+200),{onConflict:'academy_id,member_id,kind,key'});
        if(problem)throw problem;
      }
      if(extra.length)all=rows.concat(extra);
      if(syncCtx.staff&&!rows.some(r=>r.kind==='group_settings')){
        const g=syncGroup();
        await cloud.from('items').upsert({academy_id:syncCtx.academyId,member_id:'',kind:'group_settings',key:'main',data:{address:g.address||'',brand:g.brand||null,feeBank:g.feeBank||null}},{onConflict:'academy_id,member_id,kind,key'});
      }
    }
    applyRows(all);
    try{if(!phoneDemo)localStorage.setItem('corda-v1',JSON.stringify(state))}catch{}
    if(safeToRender()){const y=window.scrollY;render();window.scrollTo(0,y)}
    fetchAvatars();
    if(first)scheduleSync(); // pasa a Storage las fotos y comprobantes que solo estaban en el navegador
  }catch{
    // Sin conexión: la app sigue con lo que hay en este navegador y reintenta en el siguiente ciclo.
  }finally{syncBusy=false}
}

// ---------- Arranque y fin ----------
async function startSync(user){
  stopSync();
  if(!cloud||!user)return;
  try{
    const {data:me,error}=await cloud.from('profiles').select('role,approved,academy_id,details,academies(name)').eq('id',user.id).maybeSingle();
    if(error||!me?.academy_id||!me.academies?.name)return;
    const memberId=me.details?.memberId;
    if(!memberId||currentAccount?.memberId!==memberId)return;
    if(me.role!=='Jugador'&&!me.approved){
      toast(coverText('Tu cuenta de '+me.role.toLowerCase()+' está pendiente de aprobación. Mientras, solo verás datos de ejemplo.','Your account is waiting for approval. Until then you will only see sample data.','Votre compte attend une validation. En attendant, seules des données d’exemple sont visibles.'));
      return;
    }
    const childId=me.details?.profile?.childId;
    syncCtx={userId:user.id,academyId:me.academy_id,academyName:me.academies.name,memberId,role:me.role,
      staff:me.role==='Coach',players:me.role==='Jugador'?[memberId]:me.role==='Tutor'&&childId?[childId]:[]};
    await pullItems({first:true});
    syncPoll=setInterval(()=>pullItems(),60000);
  }catch{}
}
function stopSync(){
  clearInterval(syncPoll);clearTimeout(syncTimer);
  syncPoll=null;syncTimer=null;syncCtx=null;syncedItems=new Map();syncAgain=false;
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')pullItems()});

// ---------- Fase C: fotos y comprobantes en Supabase Storage ----------
// Carpeta privada "media": <academia>/<integrante>/avatar.jpg y <academia>/<integrante>/receipts/…
// La foto se reduce a 320 px antes de subirla. Los comprobantes se abren con un enlace temporal.
const MEDIA_BUCKET='media';
function textHash(text){let h=5381;for(let i=0;i<text.length;i++)h=(Math.imul(h,33)^text.charCodeAt(i))>>>0;return h.toString(36)+':'+text.length}
const dataBlob=url=>fetch(url).then(r=>r.blob());
function blobData(blob){return new Promise((ok,fail)=>{const reader=new FileReader();reader.onload=()=>ok(reader.result);reader.onerror=fail;reader.readAsDataURL(blob)})}
async function smallAvatar(url){
  const bitmap=await createImageBitmap(await dataBlob(url)),scale=Math.min(1,320/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');
  canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
  canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
  return new Promise(ok=>canvas.toBlob(ok,'image/jpeg',.85));
}
const mediaRoot=id=>syncCtx.academyId+'/'+id;
async function uploadMedia(){
  const bucket=cloud.storage.from(MEDIA_BUCKET);
  for(const m of state.directory||[]){
    if(m.academy!==syncCtx.academyName||!m.id||!canWrite({member_id:'',kind:'member_card',key:m.id}))continue;
    if(!m.photo){if(m.photoRef){m.photoRef=null;m.photoHash=''}continue}
    if(!String(m.photo).startsWith('data:'))continue;
    const hash=textHash(m.photo);
    if(m.photoRef&&hash===m.photoHash)continue;
    const path=mediaRoot(m.id)+'/avatar.jpg';
    const {error}=await bucket.upload(path,await smallAvatar(m.photo),{upsert:true,contentType:'image/jpeg'});
    if(error)throw error;
    m.photoRef={path,v:Date.now()};m.photoHash=hash;m.photoV=m.photoRef.v;
  }
  for(const id of syncPlayers()){
    for(const [month,row] of Object.entries(syncLedger(id).months)){
      const receipt=row?.receipt;
      if(!String(receipt?.data||'').startsWith('data:')||!canWrite({member_id:id,kind:'fee_month',key:month}))continue;
      const blob=await dataBlob(receipt.data),ext={'image/png':'png','application/pdf':'pdf'}[blob.type]||'jpg';
      const path=mediaRoot(id)+'/receipts/'+month+'-'+newMemberId().slice(0,8)+'.'+ext;
      const {error}=await bucket.upload(path,blob,{contentType:blob.type||'image/jpeg'});
      if(error)throw error;
      row.receipt={name:receipt.name,path,type:blob.type};
    }
    for(const item of privateSent(id)){
      const receipt=item.receipt;
      if(!String(receipt?.data||'').startsWith('data:')||!canWrite({member_id:id,kind:'private_receipt',key:item.id}))continue;
      const blob=await dataBlob(receipt.data),ext={'image/png':'png','application/pdf':'pdf'}[blob.type]||'jpg';
      const path=mediaRoot(id)+'/private/'+item.coachId+'/'+item.id+'.'+ext;
      const {error}=await bucket.upload(path,blob,{upsert:true,contentType:blob.type||'image/jpeg'});
      if(error)throw error;
      item.receipt={name:receipt.name,path,type:blob.type};
    }
  }
}
async function fetchAvatars(){
  if(!syncCtx)return;
  let changed=false;
  const me=actor()?.memberId;
  for(const m of state.directory||[]){
    const ref=m.photoRef;
    if(!ref?.path||m.photoV===ref.v)continue;
    if(m.id===me&&m.photo){m.photoV=ref.v;continue} // la foto propia ya está en este navegador
    try{
      const {data,error}=await cloud.storage.from(MEDIA_BUCKET).download(ref.path);
      if(error||!data)continue;
      m.photo=await blobData(data);m.photoV=ref.v;m.photoHash=textHash(m.photo);changed=true;
      if(m.id===me){if(actor())actor().photo=m.photo}
      else if(state.athletes?.[m.id])state.athletes[m.id].profile.photo=m.photo;
    }catch{}
  }
  if(!changed)return;
  try{if(!phoneDemo)localStorage.setItem('corda-v1',JSON.stringify(state))}catch{}
  if(safeToRender()){const y=window.scrollY;render();window.scrollTo(0,y)}
}
// "Ver comprobante": enlace temporal de 2 minutos al archivo privado.
document.addEventListener('click',async event=>{
  const button=event.target.closest?.('[data-receipt]');
  if(!button||!cloud)return;
  event.preventDefault();
  const tab=window.open('','_blank');
  const {data,error}=await cloud.storage.from(MEDIA_BUCKET).createSignedUrl(button.dataset.receipt,120);
  if(error||!data?.signedUrl){tab?.close();toast(coverText('No se pudo abrir el comprobante.','The receipt could not be opened.','Impossible d’ouvrir le justificatif.'));return}
  if(tab)tab.location=data.signedUrl;else location.assign(data.signedUrl);
});
