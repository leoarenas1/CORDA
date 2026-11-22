// CORDA · Avisos al teléfono (notificaciones push). Cliente: pide permiso, registra este teléfono y lo da de baja.
// El envío lo hace la función «enviar-avisos» de Supabase (ver supabase/functions/enviar-avisos).
// La llave pública (VAPID) puede ir aquí; la privada vive solo como secreto en Supabase.
const PUSH_PUBLIC_KEY='BJbZTrGjO7ZJULGfjylbSHBnMhmfLi9uta_zJjPAJWdy3znmaMW728r2ik4H9fTobWzsy8prULdM4R_N1MnQkIc';
const pushOK=()=>'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
const pushIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const pushStandalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const pushKeyBytes=b64=>{const p='='.repeat((4-b64.length%4)%4),raw=atob((b64+p).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(raw,c=>c.charCodeAt(0))};
const pushWait=(p,ms)=>Promise.race([p,new Promise(r=>setTimeout(()=>r(null),ms))]);
async function pushSub(){const reg=await pushWait(navigator.serviceWorker.ready,4000);return reg?reg.pushManager.getSubscription():null}
// 'na' no disponible · 'ios' falta abrir desde el ícono · 'denied' bloqueado · 'off' sin activar · 'on' activado
async function pushStatus(){
  if(!pushOK()||typeof cloud==='undefined'||!cloud||!syncCtx)return 'na';
  if(pushIOS()&&!pushStandalone())return 'ios';
  if(Notification.permission==='denied')return 'denied';
  const s=await pushSub().catch(()=>null);
  return Notification.permission==='granted'&&s?'on':'off';
}
async function pushSave(sub){
  const j=sub.toJSON(),{error}=await cloud.rpc('register_push',{p_endpoint:j.endpoint,p_p256dh:j.keys.p256dh,p_auth:j.keys.auth,p_ua:navigator.userAgent});
  if(error)throw error;
}
async function pushEnable(){
  if(await Notification.requestPermission()!=='granted')return false;
  const reg=await navigator.serviceWorker.ready;
  let sub=await reg.pushManager.getSubscription();
  if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:pushKeyBytes(PUSH_PUBLIC_KEY)});
  await pushSave(sub);
  return true;
}
async function pushDisable(){
  const s=await pushSub();if(!s)return;
  try{await cloud.rpc('unregister_push',{p_endpoint:s.endpoint})}catch{}
  await s.unsubscribe();
}
// Al iniciar sesión: si este teléfono ya tiene permiso, se registra para la cuenta que entró.
async function pushSync(){
  try{if(!pushOK()||!cloud||!syncCtx||Notification.permission!=='granted')return;const s=await pushSub();if(s)await pushSave(s)}catch{}
}
// Al cerrar sesión: este teléfono deja de recibir los avisos de esa cuenta (no se pide permiso otra vez al volver a entrar).
async function pushForget(){
  try{if(!pushOK()||Notification.permission!=='granted')return;const s=await pushSub();if(s&&cloud)await pushWait(cloud.rpc('unregister_push',{p_endpoint:s.endpoint}),1500)}catch{}
}
