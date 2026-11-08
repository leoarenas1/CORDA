// Cuentas reales con Supabase Auth (fase A).
// - El correo y la contraseña los guarda y verifica Supabase. La app nunca guarda la contraseña.
// - El perfil (nombre, rol, academia y una copia de los datos del perfil) vive en la tabla profiles.
// - Los entrenamientos, encuestas, etc. siguen en este navegador hasta la fase B.
// - "corda-accounts" queda como caché local: correo → rol y memberId, para abrir rápido el perfil.
//   Las cuentas antiguas (contraseña con PBKDF2 en este navegador) se pasan solas a Supabase la
//   próxima vez que su dueño inicia sesión.
const ACCOUNTS_KEY='corda-accounts',SESSION_KEY='corda-session',REMEMBER_KEY='corda-remember',PBKDF2_ROUNDS=310000;
let pendingAccount=null,currentAccount=null;

// ---------- Cliente de Supabase ----------
// "Recordarme" decide si la sesión de Supabase sobrevive al cerrar el navegador (localStorage)
// o se borra al cerrar la pestaña (sessionStorage).
const keepSignedIn=()=>{try{return localStorage.getItem(REMEMBER_KEY)!=='0'}catch{return true}};
function setRemember(remember){try{localStorage.setItem(REMEMBER_KEY,remember?'1':'0')}catch{}}
const cloudStorage={
  getItem:key=>{try{return localStorage.getItem(key)??sessionStorage.getItem(key)}catch{return null}},
  setItem:(key,value)=>{try{const keep=keepSignedIn();(keep?localStorage:sessionStorage).setItem(key,value);(keep?sessionStorage:localStorage).removeItem(key)}catch{}},
  removeItem:key=>{try{localStorage.removeItem(key);sessionStorage.removeItem(key)}catch{}}
};
const cloud=(()=>{
  try{
    if(!window.supabase?.createClient||typeof CORDA_SUPABASE==='undefined')return null;
    return supabase.createClient(CORDA_SUPABASE.url,CORDA_SUPABASE.key,{auth:{storage:cloudStorage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  }catch{return null}
})();
function cloudError(error){
  const t=coverText,code=error?.code||'',message=String(error?.message||'');
  if(code==='invalid_credentials'||/invalid login/i.test(message))return t('Correo o contraseña incorrectos.','Incorrect email or password.','E-mail ou mot de passe incorrect.');
  if(code==='email_not_confirmed'||/not confirmed/i.test(message))return t('Primero confirma tu correo: abre el enlace que te enviamos.','Confirm your email first: open the link we sent you.','Confirmez d’abord votre e-mail : ouvrez le lien envoyé.');
  if(/rate limit|too many/i.test(code+message)||error?.status===429)return t('Demasiados intentos. Espera unos minutos y vuelve a probar.','Too many attempts. Wait a few minutes and try again.','Trop de tentatives. Attendez quelques minutes.');
  if(code==='weak_password'||/password should/i.test(message))return t('Esa contraseña es muy débil. Usa una más larga o con números y símbolos.','That password is too weak. Use a longer one with numbers and symbols.','Mot de passe trop faible. Utilisez-en un plus long.');
  if(!error?.status||/fetch|network/i.test(message))return t('No hay conexión con el servidor. Revisa tu internet.','Could not reach the server. Check your connection.','Impossible de joindre le serveur. Vérifiez votre connexion.');
  return t('No se pudo completar. Intenta de nuevo.','Something went wrong. Try again.','Une erreur est survenue. Réessayez.');
}
const offlineMessage=()=>coverText('No se pudo cargar el sistema de cuentas. Recarga la página.','The account system did not load. Reload the page.','Le système de comptes n’a pas chargé. Rechargez la page.');

// ---------- Caché local de cuentas ----------
function loadAccounts(){
  try{return JSON.parse(localStorage.getItem(ACCOUNTS_KEY))||[]}catch{return []}
}
function storeAccounts(list){
  try{localStorage.setItem(ACCOUNTS_KEY,JSON.stringify(list));return true}catch{toast(coverText('No se pudo guardar tu cuenta en este navegador.','Your account could not be saved in this browser.','Impossible d’enregistrer votre compte dans ce navigateur.'));return false}
}
function normalEmail(email){return String(email||'').trim().toLowerCase()}
function findAccount(email){return loadAccounts().find(a=>a.email===normalEmail(email))}
function cacheAccount(account){
  const list=loadAccounts().filter(a=>a.email!==account.email);
  list.push(account);return storeAccounts(list);
}

// Solo para verificar cuentas antiguas guardadas en este navegador antes de Supabase.
function bytesToHex(bytes){return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')}
function hexToBytes(hex){return new Uint8Array(hex.match(/../g).map(h=>parseInt(h,16)))}
async function hashPassword(password,saltHex,rounds=PBKDF2_ROUNDS){
  const salt=saltHex?hexToBytes(saltHex):crypto.getRandomValues(new Uint8Array(16));
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:rounds},key,256);
  return {salt:bytesToHex(salt),hash:bytesToHex(new Uint8Array(bits)),rounds};
}
function sameHash(a,b){
  if(a.length!==b.length)return false;
  let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);
  return diff===0;
}

// Qué perfil local está abierto: localStorage si eligió "Recordarme", si no sessionStorage.
function rememberSession(email,remember){
  try{
    localStorage.removeItem(SESSION_KEY);sessionStorage.removeItem(SESSION_KEY);
    (remember?localStorage:sessionStorage).setItem(SESSION_KEY,email);
  }catch{}
}
function sessionEmail(){
  try{return localStorage.getItem(SESSION_KEY)||sessionStorage.getItem(SESSION_KEY)}catch{return null}
}
function forgetSession(){
  try{localStorage.removeItem(SESSION_KEY);sessionStorage.removeItem(SESSION_KEY)}catch{}
}

// ---------- Piezas de formulario ----------
function passwordInput(name,label,autocomplete){
  return `<label>${label}<span class="password-field"><input name="${name}" type="password" required minlength="8" maxlength="128" autocomplete="${autocomplete}"><button type="button" class="password-toggle" aria-label="${coverText('Mostrar contraseña','Show password','Afficher le mot de passe')}">${coverText('Ver','Show','Voir')}</button></span></label>`;
}
function rememberInput(checked=true){
  return `<label class="remember-me"><input type="checkbox" name="remember" ${checked?'checked':''}> ${coverText('Recordarme en esta computadora','Keep me signed in on this computer','Rester connecté sur cet ordinateur')}</label>`;
}
function bindPasswordToggles(){
  document.querySelectorAll('.password-toggle').forEach(button=>button.onclick=()=>{
    const input=button.previousElementSibling,show=input.type==='password';
    input.type=show?'text':'password';
    button.textContent=show?coverText('Ocultar','Hide','Masquer'):coverText('Ver','Show','Voir');
    button.setAttribute('aria-label',show?coverText('Ocultar contraseña','Hide password','Masquer le mot de passe'):coverText('Mostrar contraseña','Show password','Afficher le mot de passe'));
  });
}
const accessLink=(id,text)=>`<button type="button" class="access-back" id="${id}">${text}</button>`;

// ---------- Inicio de sesión ----------
function signInScreen(prefill=''){
  entry='access';pendingAccount=null;
  const t=coverText;
  const legacy=!loadAccounts().length&&(state.lastRole||Object.keys(state.athletes||{}).length);
  accessScene('access-screen',`${coverSelector()}<section class="access-panel"><small class="eyebrow">CORDA</small><h1>${t('Inicia sesión','Sign in','Connexion')}</h1><p>${t('Entra con el correo y la contraseña de tu cuenta.','Use your account email and password.','Utilisez l’e-mail et le mot de passe de votre compte.')}</p>
  <form id="signin-form" class="auth-form" method="post" action="#">
    <label>${t('Correo electrónico','Email','E-mail')}<input name="email" type="email" required maxlength="180" autocomplete="username" value="${esc(prefill)}"></label>
    ${passwordInput('password',t('Contraseña','Password','Mot de passe'),'current-password')}
    ${rememberInput()}
    <p class="auth-error" id="auth-error" role="alert" hidden></p>
    <div class="formactions">${accessLink('auth-home','← '+t('Inicio','Home','Accueil'))}<button class="btn lime" id="signin-submit">${t('Entrar','Sign in','Se connecter')}</button></div>
  </form>
  <p>${t('¿Aún no tienes cuenta?','No account yet?','Pas encore de compte ?')} ${accessLink('auth-register',t('Regístrate','Register','Inscrivez-vous'))}</p>
  ${legacy?`<p class="hint">${t('¿Ya usabas CORDA antes de las cuentas?','Used CORDA before accounts?','Vous utilisiez CORDA avant les comptes ?')} ${accessLink('auth-legacy',t('Entra a tu perfil y crea tu acceso','Open your profile and create your login','Ouvrez votre profil et créez votre accès'))}</p>`:''}
  </section>`);
  bindCoverLanguage(()=>signInScreen($('#signin-form [name=email]')?.value||prefill));
  bindPasswordToggles();
  $('#auth-home').onclick=()=>{entry='welcome';render()};
  $('#auth-register').onclick=()=>pickRole('register');
  if($('#auth-legacy'))$('#auth-legacy').onclick=()=>pickRole('signin');
  const form=$('#signin-form');
  form.onsubmit=async e=>{
    e.preventDefault();
    const d=Object.fromEntries(new FormData(form)),error=$('#auth-error'),submit=$('#signin-submit');
    const fail=text=>{if(document.contains(error)){error.textContent=text;error.hidden=false}};
    const email=normalEmail(d.email),remember=!!d.remember;
    error.hidden=true;submit.disabled=true;
    try{
      if(!cloud)return fail(offlineMessage());
      setRemember(remember);
      const {data,error:problem}=await cloud.auth.signInWithPassword({email,password:d.password});
      if(problem){
        // ¿Es una cuenta antigua de este navegador? Se abre y se pasa a Supabase.
        if(problem.code==='invalid_credentials'||/invalid login/i.test(problem.message||'')){
          const old=findAccount(email);
          if(old?.hash&&sameHash((await hashPassword(d.password,old.salt,old.rounds)).hash,old.hash)){
            if(!openAccount(old))return fail(t('No encontramos los datos de este perfil en este navegador.','This profile’s data is not in this browser.','Les données de ce profil ne sont pas dans ce navigateur.'));
            rememberSession(email,remember);
            cloudSignUp(email,d.password,remember,true);
            return;
          }
        }
        return fail(cloudError(problem));
      }
      if(!await openCloudAccount(data.user,remember))fail(t('Tu cuenta existe, pero no encontramos su perfil. Escríbenos para revisarlo.','Your account exists but its profile is missing. Contact us.','Votre compte existe mais son profil est introuvable. Contactez-nous.'));
    }catch(problem){fail(cloudError(problem))}
    finally{if(document.contains(submit))submit.disabled=false}
  };
}

// ---------- Registro ----------
// Primero el correo y la contraseña; luego el registro de perfil de siempre.
// La cuenta se crea en Supabase al terminar el perfil (linkPendingAccount).
function createAccessScreen(selectedRole,mode='register'){
  entry='access';
  const t=coverText;
  const roleName={Jugador:t('Jugador','Player','Joueur'),Coach:'Coach',Tutor:t('Tutor','Guardian','Parent')}[selectedRole];
  accessScene('access-screen',`${coverSelector()}<section class="access-panel"><small class="eyebrow">CORDA · ${esc(roleName)}</small><h1>${t('Crea tu acceso','Create your login','Créez votre accès')}</h1><p>${t('Con este correo y contraseña volverás a entrar a tu perfil.','You will use this email and password to sign back in.','Vous utiliserez cet e-mail et ce mot de passe pour revenir.')}</p>
  <form id="register-form" class="auth-form" method="post" action="#">
    <label>${t('Correo electrónico','Email','E-mail')}<input name="email" type="email" required maxlength="180" autocomplete="username"></label>
    ${passwordInput('password',t('Contraseña (mínimo 8 caracteres)','Password (at least 8 characters)','Mot de passe (8 caractères minimum)'),'new-password')}
    ${passwordInput('confirm',t('Repite la contraseña','Repeat the password','Répétez le mot de passe'),'new-password')}
    ${rememberInput()}
    <p class="auth-error" id="auth-error" role="alert" hidden></p>
    <div class="formactions">${accessLink('auth-roles','← '+t('Perfiles','Profiles','Profils'))}<button class="btn lime" id="register-submit">${t('Continuar','Continue','Continuer')}</button></div>
  </form>
  <p>${t('¿Ya tienes cuenta?','Already have an account?','Vous avez déjà un compte ?')} ${accessLink('auth-signin',t('Inicia sesión','Sign in','Connectez-vous'))}</p></section>`);
  bindCoverLanguage(()=>createAccessScreen(selectedRole,mode));
  bindPasswordToggles();
  $('#auth-roles').onclick=()=>pickRole(mode);
  $('#auth-signin').onclick=()=>signInScreen();
  const form=$('#register-form');
  form.onsubmit=e=>{
    e.preventDefault();
    const d=Object.fromEntries(new FormData(form)),error=$('#auth-error');
    const fail=text=>{error.textContent=text;error.hidden=false};
    error.hidden=true;
    const email=normalEmail(d.email);
    if(!cloud)return fail(offlineMessage());
    if(findAccount(email))return fail(t('Ya existe una cuenta con este correo. Inicia sesión.','An account with this email already exists. Sign in instead.','Un compte existe déjà avec cet e-mail. Connectez-vous.'));
    if(d.password.length<8)return fail(t('La contraseña debe tener al menos 8 caracteres.','The password must have at least 8 characters.','Le mot de passe doit contenir au moins 8 caractères.'));
    if(d.password!==d.confirm)return fail(t('Las contraseñas no coinciden.','The passwords do not match.','Les mots de passe ne correspondent pas.'));
    // La contraseña solo vive en memoria hasta crear la cuenta en Supabase; nunca se guarda.
    pendingAccount={email,role:selectedRole,remember:!!d.remember,password:d.password};
    chooseRole(selectedRole,mode);
  };
}

// Lo que se guarda del perfil en Supabase.
function cloudSnapshot(){
  const p=role==='Jugador'?state.profile:actor();
  if(!p?.memberId)return null;
  // Sin foto (llega en la fase C) ni evaluaciones mensuales (viven en items, las escribe el coach).
  const {photo,monthlyReviews,...profile}=p;
  return {name:String(p.name||'').trim(),academy:String(p.academy||'').trim(),details:{memberId:p.memberId,profile}};
}

// Se llama cuando el perfil ya está listo (fin del registro de jugador o de coach/tutor).
function linkPendingAccount(){
  if(!pendingAccount)return;
  const profile=role==='Jugador'?state.profile:actor();
  if(!profile?.memberId||role!==pendingAccount.role)return;
  const {remember,password,cloudUser,...account}=pendingAccount;
  account.memberId=profile.memberId;account.created=Date.now();
  if(role!=='Jugador')account.profile={...profile};
  pendingAccount=null;
  if(cacheAccount(account)){currentAccount=account;rememberSession(account.email,remember)}
  if(cloudUser){pushProfile();cloud?.auth.getUser().then(({data})=>startSync(data.user)).catch(()=>{})}
  else if(password)cloudSignUp(account.email,password,remember);
}

async function cloudSignUp(email,password,remember,migrating=false){
  if(!cloud)return;
  const t=coverText,snapshot=cloudSnapshot();
  setRemember(remember);
  const {data,error}=await cloud.auth.signUp({email,password,options:{
    emailRedirectTo:location.origin+location.pathname,
    data:{name:snapshot?.name||'',role,academy:snapshot?.academy||'',details:snapshot?.details||{}}
  }});
  if(error){toast(cloudError(error));return}
  // Con "Confirm email", Supabase no avisa si el correo ya existía: lo delata identities vacío.
  if(data.user&&!data.user.identities?.length){
    if(!migrating)toast(t('Ese correo ya tenía una cuenta. Cierra sesión y entra con ella.','That email already had an account. Sign out and sign in with it.','Cet e-mail avait déjà un compte. Déconnectez-vous et connectez-vous avec.'));
    return;
  }
  if(migrating){const old=findAccount(email);if(old){delete old.hash;delete old.salt;delete old.rounds;cacheAccount(old)}}
  if(data.session){pushProfile();startSync(data.user);return}
  modal(t('Confirma tu correo','Confirm your email','Confirmez votre e-mail'),
    `<p class="full">${t('Te enviamos un enlace a','We sent a link to','Nous avons envoyé un lien à')} <b>${esc(email)}</b>. ${t('Ábrelo para activar tu cuenta y poder entrar desde cualquier dispositivo.','Open it to activate your account and sign in from any device.','Ouvrez-le pour activer votre compte sur tous vos appareils.')}</p><p class="full muted">${t('Mientras tanto, ya puedes usar CORDA en este navegador. Si no lo ves, revisa tu carpeta de spam.','Meanwhile you can keep using CORDA in this browser. Check your spam folder if you do not see it.','En attendant, vous pouvez utiliser CORDA dans ce navigateur. Vérifiez vos spams.')}</p>`);
}

// Abre la cuenta de Supabase: lee su perfil y abre (o rehace) los datos en este navegador.
async function openCloudAccount(user,remember){
  const {data:row,error}=await cloud.from('profiles').select('role,name,details,academies(name)').eq('id',user.id).maybeSingle();
  if(error)throw error;
  if(!row)return false;
  const email=normalEmail(user.email),details=row.details||{},cached=findAccount(email);
  const account={email,role:row.role,memberId:details.memberId||cached?.memberId,created:cached?.created||Date.now()};
  if(row.role!=='Jugador'&&(details.profile||cached?.profile))account.profile={...cached?.profile,...details.profile};
  // En un navegador nuevo, el perfil del jugador se rehace con la copia de Supabase.
  if(row.role==='Jugador'&&account.memberId&&details.profile&&!state.athletes?.[account.memberId]){
    personStore();
    state.athletes[account.memberId]={profile:{...details.profile,memberId:account.memberId},goals:seed().goals,reviews:{}};
  }
  if(account.memberId&&cacheAccount(account)&&openAccount(account)){
    rememberSession(email,remember);
    startSync(user);
    return true;
  }
  // Cuenta sin perfil terminado: se completa ahora y se guarda en Supabase al final.
  pendingAccount={email,role:row.role,remember,cloudUser:true};
  const academy=row.academies?.name||'';
  rememberPlayer();role=row.role;page='home';rosterDetail='';
  if(row.role==='Jugador'){
    const [firstName,...rest]=String(row.name||'').split(' ');
    draft={firstName,lastName:rest.join(' '),name:row.name||'',academy};step=0;entry='register';onboarding();
  }else adultSetup({name:row.name||'',academy});
  return true;
}

// Mantiene al día el nombre y la copia del perfil en Supabase (después de cada guardado).
let lastPushed='';
function pushProfile(){
  if(!cloud||!currentAccount||typeof phoneDemo!=='undefined'&&phoneDemo)return;
  if(role!==currentAccount.role)return;
  const snapshot=cloudSnapshot();
  if(!snapshot||snapshot.details.memberId!==currentAccount.memberId)return;
  const body={name:snapshot.name,details:snapshot.details},json=JSON.stringify(body);
  if(json===lastPushed)return;
  clearTimeout(pushProfile.timer);
  pushProfile.timer=setTimeout(async()=>{
    try{
      const {data}=await cloud.auth.getSession(),user=data.session?.user;
      if(!user||normalEmail(user.email)!==currentAccount?.email)return;
      const {error}=await cloud.from('profiles').update(body).eq('id',user.id);
      if(!error)lastPushed=json;
    }catch{}
  },800);
}

// Mantiene al día la copia local del perfil de coach/tutor después de "Editar datos".
function syncCurrentAccount(){
  if(!currentAccount||role==='Jugador'||role!==currentAccount.role)return;
  const profile=actor();if(!profile||profile.memberId!==currentAccount.memberId)return;
  const list=loadAccounts(),stored=list.find(a=>a.email===currentAccount.email);
  if(!stored)return;
  stored.profile={...profile};currentAccount=stored;storeAccounts(list);
  pushProfile();
}

// Abre el perfil local de una cuenta. Devuelve false si falta.
function openAccount(account){
  rememberPlayer();
  role=account.role;page='home';rosterDetail='';currentAccount=account;pendingAccount=null;
  if(role==='Jugador'){
    const saved=state.athletes?.[account.memberId];
    if(!saved){currentAccount=null;role='Jugador';return false}
    state.lastPlayerId=account.memberId;
    switchAgenda(saved.profile.academy);useAthlete({id:account.memberId});finishAccess();
    return true;
  }
  const profile=account.profile||state.accessProfiles?.[role];
  if(!profile){currentAccount=null;role='Jugador';return false}
  enterAdult({...profile});
  return true;
}

// Al cargar: abre al momento el perfil local recordado y después revisa la sesión de Supabase
// (por ejemplo, si la persona llega desde el enlace de confirmación del correo).
function restoreSession(){
  checkCloudSession();
  const email=sessionEmail();if(!email)return false;
  const account=findAccount(email);
  if(!account||!openAccount(account)){forgetSession();return false}
  return true;
}
async function checkCloudSession(){
  if(!cloud||typeof phoneDemo!=='undefined'&&phoneDemo)return;
  try{
    const confirming=/access_token|type=signup|[?&]code=/.test(location.hash+location.search);
    const {data}=await cloud.auth.getSession(),user=data.session?.user;
    if(!user)return;
    if(!currentAccount&&['welcome','access'].includes(entry)){
      if(await openCloudAccount(user,keepSignedIn())&&confirming)toast(coverText('Tu correo quedó confirmado. ¡Bienvenido!','Your email is confirmed. Welcome!','Votre e-mail est confirmé. Bienvenue !'));
    }else if(currentAccount&&normalEmail(user.email)===currentAccount.email){
      if(confirming)toast(coverText('Tu correo quedó confirmado.','Your email is confirmed.','Votre e-mail est confirmé.'));
      pushProfile();
      startSync(user);
    }
    if(confirming)history.replaceState(null,'',location.pathname);
  }catch{}
}

function signOut(){
  rememberPlayer();save();forgetSession();
  stopSync();
  cloud?.auth.signOut({scope:'local'}).catch(()=>{});
  clearTimeout(pushProfile.timer);lastPushed='';
  currentAccount=null;pendingAccount=null;role='Jugador';page='home';rosterDetail='';entry='welcome';
  render();window.scrollTo(0,0);
  toast(coverText('Sesión cerrada.','Signed out.','Déconnecté.'));
}
