// Local email + password accounts for the prototype.
// Accounts live only in this browser (localStorage). Passwords are never stored:
// only a salted PBKDF2-SHA256 hash. This keeps casual eyes out, but it is not a
// substitute for a real server-side login.
const ACCOUNTS_KEY='corda-accounts',SESSION_KEY='corda-session',PBKDF2_ROUNDS=310000;
let pendingAccount=null,currentAccount=null;

function loadAccounts(){
  try{return JSON.parse(localStorage.getItem(ACCOUNTS_KEY))||[]}catch{return []}
}
function storeAccounts(list){
  try{localStorage.setItem(ACCOUNTS_KEY,JSON.stringify(list));return true}catch{toast(coverText('No se pudo guardar tu cuenta en este navegador.','Your account could not be saved in this browser.','Impossible d’enregistrer votre compte dans ce navigateur.'));return false}
}
function normalEmail(email){return String(email||'').trim().toLowerCase()}
function findAccount(email){return loadAccounts().find(a=>a.email===normalEmail(email))}
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

// Session: "Recordarme" keeps it in localStorage (survives closing the browser);
// otherwise sessionStorage (ends when the tab or window is closed).
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

// Sign-in screen: email + password.
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
    error.hidden=true;submit.disabled=true;
    try{
      const account=findAccount(d.email);
      const check=account?await hashPassword(d.password,account.salt,account.rounds):await hashPassword(d.password);
      if(!account||!sameHash(check.hash,account.hash)){
        error.textContent=t('Correo o contraseña incorrectos.','Incorrect email or password.','E-mail ou mot de passe incorrect.');error.hidden=false;return;
      }
      if(!openAccount(account)){
        error.textContent=t('No encontramos los datos de este perfil en este navegador.','This profile’s data is not in this browser.','Les données de ce profil ne sont pas dans ce navigateur.');error.hidden=false;return;
      }
      rememberSession(account.email,!!d.remember);
    }catch{
      error.textContent=t('Este navegador no permitió verificar la contraseña.','This browser could not verify the password.','Ce navigateur n’a pas pu vérifier le mot de passe.');error.hidden=false;
    }finally{if(document.contains(submit))submit.disabled=false}
  };
}

// Registration: create the login first, then continue to the usual profile setup.
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
  form.onsubmit=async e=>{
    e.preventDefault();
    const d=Object.fromEntries(new FormData(form)),error=$('#auth-error'),submit=$('#register-submit');
    const fail=text=>{error.textContent=text;error.hidden=false};
    error.hidden=true;
    const email=normalEmail(d.email);
    if(findAccount(email))return fail(t('Ya existe una cuenta con este correo. Inicia sesión.','An account with this email already exists. Sign in instead.','Un compte existe déjà avec cet e-mail. Connectez-vous.'));
    if(d.password.length<8)return fail(t('La contraseña debe tener al menos 8 caracteres.','The password must have at least 8 characters.','Le mot de passe doit contenir au moins 8 caractères.'));
    if(d.password!==d.confirm)return fail(t('Las contraseñas no coinciden.','The passwords do not match.','Les mots de passe ne correspondent pas.'));
    submit.disabled=true;
    try{
      pendingAccount={email,role:selectedRole,remember:!!d.remember,...await hashPassword(d.password)};
      chooseRole(selectedRole,mode);
    }catch{fail(t('Este navegador no permitió proteger la contraseña.','This browser could not protect the password.','Ce navigateur n’a pas pu protéger le mot de passe.'))}
    finally{if(document.contains(submit))submit.disabled=false}
  };
}

// Called once a profile is ready (end of onboarding or adult setup).
function linkPendingAccount(){
  if(!pendingAccount)return;
  const profile=role==='Jugador'?state.profile:actor();
  if(!profile?.memberId||role!==pendingAccount.role)return;
  const {remember,...account}=pendingAccount;
  account.memberId=profile.memberId;account.created=Date.now();
  if(role!=='Jugador')account.profile={...profile};
  const list=loadAccounts().filter(a=>a.email!==account.email);
  list.push(account);
  if(storeAccounts(list)){currentAccount=account;rememberSession(account.email,remember)}
  pendingAccount=null;
}
// Keep a staff account's copy of its profile current after "Editar datos".
function syncCurrentAccount(){
  if(!currentAccount||role==='Jugador'||role!==currentAccount.role)return;
  const profile=actor();if(!profile||profile.memberId!==currentAccount.memberId)return;
  const list=loadAccounts(),stored=list.find(a=>a.email===currentAccount.email);
  if(!stored)return;
  stored.profile={...profile};currentAccount=stored;storeAccounts(list);
}

// Load the profile that belongs to an account. Returns false if it is missing.
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
function restoreSession(){
  const email=sessionEmail();if(!email)return false;
  const account=findAccount(email);
  if(!account||!openAccount(account)){forgetSession();return false}
  return true;
}
function signOut(){
  rememberPlayer();save();forgetSession();
  currentAccount=null;pendingAccount=null;role='Jugador';page='home';rosterDetail='';entry='welcome';
  render();window.scrollTo(0,0);
  toast(coverText('Sesión cerrada.','Signed out.','Déconnecté.'));
}
