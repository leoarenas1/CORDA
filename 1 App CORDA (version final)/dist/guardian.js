// Jugadores menores de 18 años y su tutor.
// 1. El menor escribe el correo de su madre, padre o tutor (profile.tutorEmail) y puede seguir usando CORDA.
// 2. En Inicio ve un aviso con botones para mandar la invitación por WhatsApp o correo (CORDA todavía no manda correos solo).
// 3. El tutor crea su cuenta de Tutor con ESE correo. Al entrar ve la invitación (rpc guardian_invites) y la acepta:
//    así se vincula a su jugador y lo administra desde su interfaz de tutor.
// 4. En Supabase, my_child() solo deja ver los datos del menor si el correo del tutor coincide con el que escribió el menor
//    (supabase/09_tutor_autorizado.sql). El aviso del menor se quita cuando el tutor está vinculado y aprobado (rpc my_guardian).
const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const cleanEmail=value=>String(value||'').trim().toLowerCase();

function ageFrom(birthDate){
  const born=new Date(birthDate+'T12:00:00');
  if(isNaN(born))return null;
  const now=new Date();
  let age=now.getFullYear()-born.getFullYear();
  if(now.getMonth()<born.getMonth()||(now.getMonth()===born.getMonth()&&now.getDate()<born.getDate()))age--;
  return age;
}
// Menor de edad: por fecha de nacimiento; si no la hay, por lo que declaró al registrarse.
function isMinor(profile=state.profile){
  const age=profile?.birthDate?ageFrom(profile.birthDate):null;
  return age===null?!!state.consent?.minor:age<18;
}

// Menores de 18: los pagos (mensualidad y clases particulares) los hace el tutor; el jugador no ve la pestaña.
function minorPlayer(){return role==='Jugador'&&isMinor()}

// ---------- Estado del tutor (se pregunta a Supabase) ----------
// 'none' = aún sin cuenta · 'registered' = creó cuenta pero no lo ha vinculado · 'linked' = vinculado, falta la aprobación del administrador · 'active' = listo
let guardianInfo={state:'unknown',at:0};
async function refreshGuardian(){
  if(!cloud||role!=='Jugador'||!state.profile?.tutorEmail||Date.now()-guardianInfo.at<60000)return;
  guardianInfo.at=Date.now();
  try{
    const {data,error}=await cloud.rpc('my_guardian');
    const next=error?'unknown':String(data||'none');
    if(next!==guardianInfo.state){guardianInfo.state=next;if(page==='home'&&entry==='app'&&!$('#modal')?.open)render()}
  }catch{}
}

// ---------- Invitación ----------
function inviteTexts(){
  const first=String(state.profile?.name||'').split(' ')[0]||'tu jugador';
  const url=location.origin+location.pathname,email=state.profile.tutorEmail;
  const text=`Hola, soy ${first}. Me registré en CORDA, la app de mi academia de tenis. Entra a ${url}, elige «Tutor» y crea tu cuenta con este correo (${email}). Necesitas un código de acceso: pídelo en la academia. Así podrás ver mi avance y administrar mi cuenta.`;
  return {text,wa:'https://wa.me/?text='+encodeURIComponent(text),
    mail:'mailto:'+encodeURIComponent(email)+'?subject='+encodeURIComponent('Invitación a CORDA como tutor')+'&body='+encodeURIComponent(text)};
}
function guardianBanner(){
  if(role!=='Jugador'||entry!=='app'||(typeof phoneDemo!=='undefined'&&phoneDemo)||!isMinor())return '';
  const email=state.profile.tutorEmail;
  if(email)refreshGuardian();
  if(guardianInfo.state==='active')return '';
  const t=coverText;
  if(!email){
    return `<section class="card checkin-banner calendar-banner guardian-banner"><div><small class="eyebrow">${t('Tu tutor','Your guardian','Votre tuteur')}</small><h2>${t('Agrega el correo de tu madre, padre o tutor','Add your parent or guardian’s email','Ajoutez l’e-mail de votre parent ou tuteur')}</h2><p class="hint">${t('Como eres menor de 18 años, tu tutor debe crear su cuenta en CORDA para autorizarte y administrar tu perfil. Puedes seguir usando la app mientras tanto.','Because you are under 18, your guardian must create a CORDA account to authorize you and manage your profile. You can keep using the app meanwhile.','Comme vous avez moins de 18 ans, votre tuteur doit créer un compte CORDA pour vous autoriser. Vous pouvez continuer à utiliser l’app.')}</p></div>
      <div class="calendar-actions"><button class="btn lime" data-guardian-email>${t('Agregar correo','Add email','Ajouter l’e-mail')}</button></div></section>`;
  }
  const invite=inviteTexts(),status={
    none:t('Esperando a tu tutor. Mándale la invitación y pídele a tu coach un código de acceso para él: tiene que crear su cuenta de Tutor con este correo.','Waiting for your guardian. Send the invitation and ask your coach for an access code for them: they must create a Guardian account with this email.','En attente de votre tuteur. Envoyez l’invitation et demandez à votre coach un code d’accès pour lui.'),
    unknown:t('Esperando a tu tutor. Mándale la invitación y pídele a tu coach un código de acceso para él: tiene que crear su cuenta de Tutor con este correo.','Waiting for your guardian. Send the invitation and ask your coach for an access code for them: they must create a Guardian account with this email.','En attente de votre tuteur. Envoyez l’invitation et demandez à votre coach un code d’accès pour lui.'),
    registered:t('Tu tutor ya creó su cuenta. Falta que entre y te acepte como su jugador.','Your guardian created an account. They still need to sign in and accept you.','Votre tuteur a créé son compte. Il doit se connecter et vous accepter.'),
    linked:t('Tu tutor ya te aceptó. Falta que el administrador de CORDA apruebe su cuenta.','Your guardian accepted you. CORDA’s administrator still has to approve their account.','Votre tuteur vous a accepté. L’administrateur de CORDA doit encore valider son compte.')
  }[guardianInfo.state]||'';
  return `<section class="card checkin-banner calendar-banner guardian-banner"><div><small class="eyebrow">${t('Tu tutor','Your guardian','Votre tuteur')}</small><h2>${t('Autorización pendiente','Authorization pending','Autorisation en attente')}</h2><p class="hint">${status}</p><p class="hint"><b>${esc(email)}</b></p></div>
    <div class="calendar-actions"><a class="btn lime" href="${invite.wa}" target="_blank" rel="noopener noreferrer">${t('Enviar por WhatsApp','Send by WhatsApp','Envoyer par WhatsApp')}</a>
    <a class="btn light" href="${invite.mail}">${t('Enviar por correo','Send by email','Envoyer par e-mail')}</a>
    <button class="link" data-guardian-email>${t('Cambiar correo','Change email','Changer l’e-mail')}</button></div></section>`;
}
function openGuardianEmail(){
  modal('Correo de tu tutor',
    field('Correo de tu madre, padre o tutor','tutorEmail',state.profile?.tutorEmail||'','email')+
    '<p class="full hint">Solo se usa para que tu tutor pueda ver tu avance y administrar tu perfil. Debe crear su cuenta de Tutor con este mismo correo.</p>',
    d=>{
      const email=cleanEmail(d.tutorEmail);
      if(!EMAIL_RE.test(email)){toast('Escribe un correo válido.');return false}
      if(currentAccount?.email&&email===cleanEmail(currentAccount.email)){toast('Escribe el correo de tu tutor, no el tuyo.');return false}
      state.profile.tutorEmail=email;guardianInfo={state:'unknown',at:0};
    },'Guardar');
}
document.addEventListener('click',event=>{if(event.target.closest?.('[data-guardian-email]'))openGuardianEmail()});

// ---------- Lado del tutor: invitaciones recibidas ----------
async function guardianInvites(){
  if(!cloud)return [];
  try{
    const {data:session}=await cloud.auth.getSession();
    if(!session.session)return [];
    const {data,error}=await cloud.rpc('guardian_invites');
    return error||!Array.isArray(data)?[]:data;
  }catch{return []}
}
// Guarda en Supabase que este tutor ya eligió a su jugador y reinicia la sincronización con ese jugador.
async function saveGuardianLink(){
  try{
    const {data}=await cloud.auth.getUser(),snapshot=cloudSnapshot();
    if(!data.user||!snapshot)return false;
    const {error}=await cloud.from('profiles').update({name:snapshot.name,details:snapshot.details}).eq('id',data.user.id);
    if(error)return false;
    startSync(data.user);
    return true;
  }catch{return false}
}
