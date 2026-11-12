// Aviso de privacidad, Términos y condiciones y Consentimiento de madre, padre o tutor.
// BORRADOR de trabajo basado en lo que la app hace hoy. Antes de abrir CORDA al público debe revisarlo
// una persona abogada en México (LFPDPPP vigente desde el 21 de marzo de 2025) y completarse lo marcado "por completar".
// Si la app cambia (nuevos datos, nuevos proveedores, pagos), hay que actualizar este texto y subir LEGAL.version.
//
// Qué se guarda de la aceptación: state.consent = {version, at, role, minor?, guardian?}
//   · se sube al perfil de Supabase (profiles.details.consent) como constancia;
//   · si la versión cambia, la app vuelve a pedir la aceptación (consentGate).
const LEGAL={
  version:'2026-11-09b',
  fecha:'9 de noviembre de 2026',
  responsable:'Leonardo Dominic Arenas Valencia, fundador de CORDA',
  domicilio:'Calle Durero 5260, Eucalipto Vallarta, C.P. 45020, Zapopan, Jalisco',
  correo:'info@cordatenis.com',       // el mismo que ya aparece en el pie de la app
  whatsapp:'33 1862 1604'
};
const legalPending=text=>`<mark class="legal-todo">${text}</mark>`;

const LEGAL_DOCS={
  privacy:{
    tab:'Aviso de privacidad',
    html:()=>`<h2>Aviso de privacidad integral</h2>
<p class="legal-meta">Versión ${LEGAL.version} · Actualizado el ${LEGAL.fecha}</p>
<p>En CORDA cuidamos tus datos y los de tu familia. Este aviso explica qué datos recibimos, para qué los usamos, quién los ve y cómo puedes controlarlos. Está escrito en lenguaje sencillo a propósito.</p>

<h3>1. Quién es el responsable</h3>
<p><b>${LEGAL.responsable}</b> («CORDA») es responsable del tratamiento de tus datos personales. Domicilio: ${LEGAL.domicilio||legalPending('por completar')}. Contacto para privacidad: <a href="mailto:${LEGAL.correo}">${LEGAL.correo}</a> o WhatsApp ${LEGAL.whatsapp}.</p>

<h3>2. Qué datos recabamos</h3>
<ul>
<li><b>Cuenta:</b> correo electrónico, contraseña (se guarda cifrada; nadie en CORDA puede leerla) y tu rol: jugador, coach o tutor.</li>
<li><b>Perfil deportivo:</b> nombre, fecha de nacimiento, academia, etapa o nivel, UTR/WTN, estilo de juego, mano dominante, raqueta, disponibilidad, preferencias, tu meta personal y una foto de perfil (la foto es opcional). Si eres menor de 18 años, también el correo de tu madre, padre o tutor, para invitarle a autorizarte.</li>
<li><b>Entrenamiento:</b> sesiones y asistencia, comentarios y evaluaciones del coach, ejercicios, videos que marcas como vistos, torneos (nombre, fecha, modalidad, superficie y resultado) y reuniones.</li>
<li><b>Bienestar (dato sensible):</b> en las encuestas diarias y en el chequeo de estado físico puedes registrar tu energía, tu ánimo, cuántas horas dormiste, tu dolor muscular, tu estrés, el esfuerzo de cada sesión, el motivo si faltas y las molestias o lesiones que quieras avisar. Responderlas es voluntario. Estos datos se refieren a tu estado físico y emocional, por eso los tratamos con cuidado y solo con tu consentimiento expreso.</li>
<li><b>Pagos:</b> los comprobantes de transferencia que decidas subir (imagen o PDF) de mensualidades o clases particulares. Pueden mostrar el nombre del titular y datos de una cuenta bancaria, así que sube solo el comprobante. CORDA <b>no cobra ni procesa pagos</b> y no guarda números de tarjeta.</li>
<li><b>Contacto opcional:</b> si lo quieres, puedes añadir un correo de contacto, un teléfono y una descripción para que tu academia te encuentre. Es tu decisión y puedes quitarlos cuando quieras.</li>
<li><b>Datos técnicos:</b> tu navegador guarda en tu dispositivo tus preferencias y la sesión iniciada. No usamos publicidad ni rastreadores de terceros.</li>
</ul>
<p>No pedimos datos financieros, de salud clínica ni documentos oficiales. Si algún dato no se necesita para lo que haces en CORDA, no te lo pedimos.</p>

<h3>3. Para qué usamos tus datos</h3>
<p><b>Finalidades necesarias</b> (sin ellas CORDA no funciona):</p>
<ul>
<li>Crear y mantener tu cuenta e identificarte al iniciar sesión.</li>
<li>Armar y dar seguimiento a tu plan de entrenamiento, tu progreso y tus torneos.</li>
<li>Permitir que tu coach, tu academia y, si eres menor, tu tutor, vean la información que les corresponde.</li>
<li>Registrar mensualidades y comprobantes de pago entre tú y tu academia o tu coach.</li>
<li>Enviarte avisos del servicio (confirmación de correo, recuperar contraseña) y generar tu archivo de calendario.</li>
<li>Mantener la seguridad de la plataforma y atender tus solicitudes.</li>
</ul>
<p><b>Finalidades adicionales:</b> ninguna por ahora. No usamos tus datos para publicidad ni los vendemos. Si algún día lo hiciéramos, te lo avisaríamos y te pediríamos permiso aparte.</p>

<h3>4. Quién puede ver tus datos</h3>
<ul>
<li><b>Tu coach y tu academia:</b> los coaches aprobados de tu academia ven el perfil, el plan, las evaluaciones y las encuestas de sus jugadores.</li>
<li><b>Tu tutor:</b> si eres menor, la madre, padre o tutor vinculado ve lo de su jugador.</li>
<li><b>Otras personas de tu academia</b> (sección Mi academia): tu nombre, tu rol y tu foto de perfil. Tu correo, teléfono y descripción solo aparecen si tú decides añadirlos. Tu meta, tu fecha de nacimiento, tus encuestas y tus pagos no se muestran.</li>
<li><b>Comprobantes de clases particulares:</b> solo los ve el coach al que se los envías.</li>
<li><b>Nadie más.</b> No vendemos ni cedemos tus datos a terceros con fines comerciales.</li>
</ul>

<h3>5. Proveedores que nos ayudan a operar</h3>
<p>Para dar el servicio usamos proveedores tecnológicos que tratan datos por nuestra cuenta y bajo medidas de seguridad:</p>
<ul>
<li><b>Supabase:</b> base de datos, autenticación y almacenamiento de fotos y comprobantes. Sus servidores pueden estar fuera de México.</li>
<li><b>GitHub Pages:</b> aloja el sitio web de la app.</li>
<li><b>Google Fonts:</b> carga las tipografías; Google puede recibir tu dirección IP.</li>
<li><b>YouTube (modo privacidad mejorada):</b> reproduce los videos que tu coach comparte; YouTube puede recibir tu dirección IP al ver un video.</li>
</ul>
<p>Cuando el servicio se presta con proveedores fuera de México, tus datos pueden transferirse al extranjero. Es necesario para que la app funcione y, al aceptar este aviso, consientes esa transferencia. El archivo de calendario (.ics) se genera en tu dispositivo; lo que hagas con él en Apple Calendar o Google Calendar depende de sus propias políticas.</p>

<h3>6. Tus derechos (ARCO) y cómo ejercerlos</h3>
<p>Tienes derecho a <b>acceder</b> a tus datos, <b>rectificarlos</b>, <b>cancelarlos</b> u <b>oponerte</b> a su uso, y a <b>revocar tu consentimiento</b> o limitar el uso de tus datos. Mucho de esto puedes hacerlo tú en la app (editar tu perfil, quitar tu foto). Para lo demás, escribe a <a href="mailto:${LEGAL.correo}">${LEGAL.correo}</a> con tu nombre, el correo de tu cuenta, qué quieres hacer y, si lo haces por un menor, tu relación con él o ella. Respondemos en un máximo de 20 días hábiles.</p>
<p>Si revocas tu consentimiento o pides cancelar tus datos, podemos cerrar tu cuenta, porque CORDA no funciona sin ellos.</p>

<h3>7. Cuánto tiempo los conservamos</h3>
<p>Mientras tu cuenta esté activa. Cuando se cancele, bloqueamos tus datos y después los eliminamos o los dejamos sin posibilidad de identificarte, salvo que una ley nos obligue a guardarlos más tiempo.</p>

<h3>8. Cómo los protegemos</h3>
<p>La conexión usa HTTPS. Cada persona solo accede a lo que su rol permite y esas reglas se aplican en la base de datos, no solo en la pantalla. Las fotos y comprobantes se guardan en un espacio privado y se abren con enlaces que caducan en pocos minutos. Ningún sistema es infalible; si ocurre una vulneración que afecte tus derechos, te lo informaremos.</p>

<h3>9. Menores de edad</h3>
<p>Los jugadores menores de 18 años usan CORDA con la autorización de su madre, padre o tutor legal. Al registrarse, el menor escribe el correo de su tutor; el tutor crea su cuenta de Tutor con ese correo, acepta y desde ahí ve el avance del menor, lo administra y ejerce sus derechos ARCO. Mientras el tutor acepta, el menor puede seguir usando la app. CORDA solo usa ese correo para vincular al tutor con el menor. Ver el <b>Consentimiento de madre, padre o tutor</b>. Si crees que un menor se registró sin autorización, avísanos y eliminaremos su cuenta.</p>

<h3>10. Cambios a este aviso</h3>
<p>Si cambiamos este aviso, publicaremos la nueva versión en la app con su fecha y te pediremos aceptarla otra vez cuando el cambio sea importante.</p>

<h3>11. Autoridad</h3>
<p>Si consideras que se vulneró tu derecho a la protección de datos personales, puedes acudir a la Secretaría Anticorrupción y Buen Gobierno, autoridad en la materia.</p>`
  },

  terms:{
    tab:'Términos y condiciones',
    html:()=>`<h2>Términos y condiciones de uso</h2>
<p class="legal-meta">Versión ${LEGAL.version} · Actualizado el ${LEGAL.fecha}</p>
<p>Al crear una cuenta o usar CORDA aceptas estos términos. Si no estás de acuerdo, por favor no uses la app.</p>

<h3>1. Qué es CORDA</h3>
<p>CORDA es una plataforma para academias de tenis que reúne el plan de entrenamiento, el seguimiento, los videos, los torneos y las mensualidades de jugadores, coaches y familias. Hoy está en <b>etapa piloto</b>: puede cambiar, tener errores o no estar disponible por momentos.</p>

<h3>2. Quién puede usarla</h3>
<ul>
<li>Personas de 18 años o más.</li>
<li>Menores de 18 años, solo con autorización de su madre, padre o tutor legal (ver el Consentimiento de tutor).</li>
<li>Los coaches y tutores quedan pendientes hasta que el administrador de CORDA apruebe su cuenta.</li>
</ul>

<h3>3. Tu cuenta</h3>
<p>Das datos verdaderos y los mantienes al día. Eres responsable de tu contraseña y de lo que se haga con tu cuenta; no la compartas. Avísanos si crees que alguien entró sin permiso. Cada persona usa solo su propia cuenta y no se hace pasar por otra.</p>

<h3>4. Uso respetuoso</h3>
<p>No uses CORDA para acosar, discriminar o publicar contenido ilegal, ofensivo o que no te pertenezca. No intentes entrar a datos de otras personas, saturar el servicio ni copiar la plataforma. Podemos retirar contenido o suspender cuentas que incumplan estas reglas.</p>

<h3>5. Tu contenido</h3>
<p>Lo que subes (fotos, comprobantes, comentarios, enlaces a videos) sigue siendo tuyo. Nos autorizas a guardarlo y mostrarlo a quien corresponda dentro de CORDA solo para prestar el servicio. Tú confirmas que tienes derecho a subirlo. Los coaches que comparten videos de YouTube son responsables de que sean apropiados para los jugadores.</p>

<h3>6. Entrenamiento y salud</h3>
<p>Los planes, ejercicios y recomendaciones de CORDA son orientación deportiva que da tu coach o tu academia; <b>no sustituyen la opinión de un médico</b>. Antes de hacer ejercicio físico exigente, consulta a un profesional de la salud, y detente si sientes dolor o malestar. La supervisión en la cancha y en el gimnasio es responsabilidad de la academia y de sus coaches.</p>

<h3>7. Pagos</h3>
<p>CORDA <b>no cobra, no procesa pagos ni intermedia dinero</b>. Las mensualidades y las clases particulares se pagan por transferencia directamente a la academia o al coach. CORDA solo guarda los comprobantes y el estado del pago para que las partes lo consulten. Cualquier aclaración sobre cobros se resuelve entre tú y la academia o el coach.</p>

<h3>8. Disponibilidad y cambios</h3>
<p>Procuramos que CORDA funcione siempre, pero no garantizamos que no habrá interrupciones, errores o pérdida de información. Haz una copia de lo importante (por ejemplo con «Exportar mis datos»). Podemos modificar funciones o terminar el servicio avisándote con anticipación razonable.</p>

<h3>9. Propiedad intelectual</h3>
<p>La marca CORDA, el diseño y el software son de su titular. Se te permite usar la app para tu entrenamiento, pero no copiarla, venderla ni usarla para crear otro servicio.</p>

<h3>10. Suspensión y cancelación</h3>
<p>Puedes dejar de usar CORDA y pedir que cerremos tu cuenta cuando quieras (ver el Aviso de privacidad). Podemos suspender o cerrar cuentas que incumplan estos términos o pongan en riesgo a otras personas.</p>

<h3>11. Límite de responsabilidad</h3>
<p>En la medida que permita la ley, CORDA no responde por daños indirectos, por lesiones durante el entrenamiento, por acuerdos entre jugadores, familias, coaches y academias, ni por contenido de terceros como YouTube. Nada en estos términos limita derechos que la ley no permita limitar.</p>

<h3>12. Cambios a estos términos</h3>
<p>Podemos actualizarlos. Publicaremos la nueva versión con su fecha y, si el cambio es importante, te pediremos aceptarla otra vez. Si sigues usando CORDA después de un cambio, lo aceptas.</p>

<h3>13. Ley aplicable y contacto</h3>
<p>Estos términos se rigen por las leyes de México. Para cualquier conflicto, las partes se someten a los tribunales competentes de Guadalajara, Jalisco, renunciando a cualquier otro fuero que pudiera corresponderles. Dudas: <a href="mailto:${LEGAL.correo}">${LEGAL.correo}</a>.</p>`
  },

  guardian:{
    tab:'Consentimiento de tutor',
    html:()=>`<h2>Consentimiento de madre, padre o tutor</h2>
<p class="legal-meta">Versión ${LEGAL.version} · Actualizado el ${LEGAL.fecha}</p>
<p>Este consentimiento aplica cuando el jugador tiene <b>menos de 18 años</b>. Al aceptarlo declaras lo siguiente.</p>
<ol>
<li>Soy la madre, el padre o la persona que ejerce la patria potestad o tutela legal del jugador menor de edad, y tengo facultad para autorizar este tratamiento de sus datos.</li>
<li>Leí el <b>Aviso de privacidad</b> y los <b>Términos y condiciones</b> de CORDA y los acepto en nombre del menor.</li>
<li>Autorizo que el menor tenga una cuenta de CORDA y que se traten sus datos personales (nombre, fecha de nacimiento, perfil deportivo, foto opcional, entrenamientos, evaluaciones, torneos y comprobantes de pago) para las finalidades del Aviso de privacidad.</li>
<li>Autorizo de forma <b>expresa</b> que se traten los datos de <b>bienestar</b> que el menor decida registrar en las encuestas y en el chequeo de estado físico (energía, ánimo, sueño, dolor, molestias o lesiones y observaciones), y entiendo que son datos sensibles y que responderlas es voluntario.</li>
<li>Entiendo que los coaches aprobados de su academia podrán ver y registrar información de su entrenamiento, y que las demás personas de su academia ven su nombre, rol y foto de perfil, pero no su meta, sus encuestas ni sus pagos.</li>
<li>Puedo crear mi cuenta de Tutor para ver el avance del menor, y puedo ejercer en su nombre los derechos de acceso, rectificación, cancelación y oposición, o retirar este consentimiento, escribiendo a <a href="mailto:${LEGAL.correo}">${LEGAL.correo}</a>. Si lo retiro, la cuenta del menor se cerrará.</li>
<li>Me comprometo a acompañar y supervisar el uso de CORDA por parte del menor, y a no subir información de otras personas sin su permiso.</li>
</ol>
<p>Cuando un jugador menor se registra por su cuenta, CORDA le pide declarar que su madre, padre o tutor lo autoriza y el correo de esa persona. El tutor confirma esa autorización creando su cuenta de Tutor con ese correo y aceptando al menor. Si no podemos confirmar la autorización, podemos cerrar la cuenta del menor.</p>`
  }
};

// ---------- Lector de documentos (ventana, funciona en cualquier pantalla) ----------
function openLegal(doc='privacy'){
  if(!LEGAL_DOCS[doc])doc='privacy';
  let dialog=document.getElementById('legal-dialog');
  if(!dialog){dialog=document.createElement('dialog');dialog.id='legal-dialog';document.body.appendChild(dialog)}
  dialog.innerHTML=`<div class="row"><nav class="legal-tabs" aria-label="Documentos legales">${Object.entries(LEGAL_DOCS).map(([id,d])=>`<button type="button" data-legal="${id}" aria-pressed="${id===doc}">${d.tab}</button>`).join('')}</nav><button type="button" id="legal-close" aria-label="Cerrar">✕</button></div>
    <article class="legal-text" tabindex="-1">${LEGAL_DOCS[doc].html()}</article>
    <div class="formactions"><button type="button" class="btn lime" id="legal-done">Entendido</button></div>`;
  if(!dialog.open)dialog.showModal();
  dialog.querySelector('.legal-text').scrollTop=0;
  dialog.querySelector('#legal-close').onclick=dialog.querySelector('#legal-done').onclick=()=>dialog.close();
}
const legalLinks=()=>`<p class="hint legal-links"><button type="button" class="link" data-legal="privacy">Aviso de privacidad</button> · <button type="button" class="link" data-legal="terms">Términos y condiciones</button></p>`;
document.addEventListener('click',event=>{
  const opener=event.target.closest?.('[data-legal]');
  if(!opener)return;
  event.preventDefault();
  openLegal(opener.dataset.legal);
});

// ---------- Aceptación al registrarse ----------
// Casillas del registro. role: 'Jugador' | 'Coach' | 'Tutor'.
function consentFields(role){
  const link=(doc,text)=>`<button type="button" class="link" data-legal="${doc}">${text}</button>`;
  return `<fieldset class="consent-box"><legend>Antes de continuar</legend>
    ${role==='Jugador'?`<div class="consent-age" role="radiogroup" aria-label="Edad"><label class="consent-row"><input type="radio" name="age" value="adult" required> <span>Tengo 18 años o más.</span></label>
    <label class="consent-row"><input type="radio" name="age" value="minor" required> <span>Soy menor de 18 años y mi madre, padre o tutor legal me autoriza a usar CORDA. ${link('guardian','Leer el consentimiento')}</span></label>
    <label class="consent-tutor" hidden>Correo de tu madre, padre o tutor<input type="email" name="tutorEmail" maxlength="180" autocomplete="off"><small>Tu tutor debe crear su cuenta de Tutor con este correo para autorizarte. Mientras tanto puedes seguir usando CORDA.</small></label></div>`:''}
    <label class="consent-row"><input type="checkbox" name="terms" required> <span>Leí y acepto el ${link('privacy','Aviso de privacidad')} y los ${link('terms','Términos y condiciones')}, y autorizo de forma expresa el tratamiento de los datos de bienestar que yo decida registrar.</span></label>
    ${role==='Tutor'?`<label class="consent-row"><input type="checkbox" name="guardian" required> <span>Soy madre, padre o tutor legal del jugador menor de edad y doy mi ${link('guardian','consentimiento para el tratamiento de sus datos')}.</span></label>`:''}
  </fieldset>`;
}
// Muestra el campo del correo del tutor solo cuando el jugador dice que es menor.
function bindConsent(root){
  const box=root.querySelector('.consent-tutor');
  if(!box)return;
  const sync=()=>{const minor=root.querySelector('[name=age]:checked')?.value==='minor';box.hidden=!minor;box.querySelector('input').required=minor};
  root.querySelectorAll('[name=age]').forEach(radio=>radio.onchange=sync);sync();
}
// Lee las casillas del registro. Devuelve el registro de aceptación (con tutorEmail si es menor) o {error} si falta algo.
function readConsent(role,data,ownEmail=''){
  const missing={error:'Marca las casillas para continuar.'};
  if(!data.terms)return missing;
  if(role==='Tutor'&&!data.guardian)return missing;
  if(role==='Jugador'&&!['adult','minor'].includes(data.age))return missing;
  const consent={version:LEGAL.version,at:new Date().toISOString(),role};
  if(role==='Jugador'){
    consent.minor=data.age==='minor';
    if(consent.minor){
      const email=cleanEmail(data.tutorEmail);
      if(!EMAIL_RE.test(email))return {error:'Escribe un correo válido para tu tutor.'};
      if(ownEmail&&email===cleanEmail(ownEmail))return {error:'Escribe el correo de tu tutor, no el tuyo.'};
      consent.tutorEmail=email;
    }
  }
  if(role==='Tutor')consent.guardian=true;
  return consent;
}

// ---------- Aceptación pendiente para cuentas que ya existían o cuando cambia la versión ----------
function consentGate(){
  if(typeof phoneDemo!=='undefined'&&phoneDemo)return;
  if(typeof currentAccount==='undefined'||!currentAccount)return;
  if(state.consent?.version===LEGAL.version||document.getElementById('consent-gate'))return;
  const gateRole=role==='Coach'||role==='Tutor'?role:'Jugador';
  const dialog=document.createElement('dialog');
  dialog.id='consent-gate';dialog.className='consent-gate';
  dialog.innerHTML=`<small class="eyebrow">CORDA · ${state.consent?'Actualizamos nuestros avisos':'Un último paso'}</small><h2>${state.consent?'Revisa los cambios':'Tu privacidad primero'}</h2>
    <p>Para seguir usando CORDA necesitamos que leas y aceptes cómo cuidamos tus datos, sobre todo si hay menores de edad.</p>
    <form id="consent-form">${consentFields(gateRole)}
      <p class="auth-error" id="consent-error" role="alert" hidden>Marca las casillas para continuar.</p>
      <div class="formactions"><button type="button" class="link" id="consent-signout">Cerrar sesión</button><button class="btn lime">Aceptar y continuar</button></div></form>`;
  document.body.appendChild(dialog);
  dialog.addEventListener('cancel',e=>e.preventDefault());
  bindConsent(dialog);
  dialog.querySelector('#consent-signout').onclick=()=>{dialog.close();dialog.remove();if(typeof signOut==='function')signOut()};
  dialog.querySelector('#consent-form').onsubmit=e=>{
    e.preventDefault();
    const result=readConsent(gateRole,Object.fromEntries(new FormData(e.target)),currentAccount?.email);
    if(result.error){const msg=dialog.querySelector('#consent-error');msg.textContent=result.error;msg.hidden=false;return}
    const {tutorEmail,...consent}=result;
    state.consent=consent;
    if(tutorEmail&&role==='Jugador'&&state.profile)state.profile.tutorEmail=tutorEmail;
    dialog.close();dialog.remove();
    save();
  };
  dialog.showModal();
}
