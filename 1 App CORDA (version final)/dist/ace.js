// Ace · asistente de CORDA.
// Asistente guiado que corre solo en el navegador: entiende preguntas frecuentes
// por palabras clave, usa los datos de la cuenta abierta (próxima sesión, qué
// llevar) y ofrece botones que llevan a la sección correcta. No envía nada a
// ningún servidor ni guarda la conversación. Para conectarlo a una IA real, hace
// falta un servidor que guarde la clave: nunca pongas una clave de API aquí.
(function(){
const BALL='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M5.6 5.6c3.4 3 3.4 9.8 0 12.8"/><path d="M18.4 5.6c-3.4 3-3.4 9.8 0 12.8"/></svg>';
const CLOSE='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
const SEND='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
const CONTACT='Escríbenos a <a href="mailto:corda.tenis@gmail.com">corda.tenis@gmail.com</a> o por <a href="https://wa.me/523318621604" target="_blank" rel="noopener noreferrer">WhatsApp</a>.';

const inApp=()=>entry==='app'&&!!state.profile;
const isPlayerSide=()=>inApp()&&role!=='Coach';
function go(target){
  return ()=>{
    if(!inApp()){signInScreen();close();return}
    page=target;render();window.scrollTo(0,0);close();
  };
}
const toSignIn=()=>{signInScreen();close()};
const toRegister=()=>{pickRole('register');close()};
const toAbout=()=>{openSobreCorda('mision',entry);close()};

// Cada intención: palabras clave (sin acentos) y una respuesta.
// La respuesta es texto o una función que devuelve {text, actions}.
const INTENTS=[
  {keys:['hola','buenas','buen dia','que tal','hey'],answer:()=>({text:`Hola${inApp()&&state.profile.firstName?', '+esc(state.profile.firstName):''}. ¿En qué te ayudo?`,actions:[]})},
  {keys:['olvide mi contrasena','olvide','recuperar','no recuerdo','restablecer','perdi mi contrasena'],answer:()=>({text:'En la pantalla de inicio de sesión toca «¿Olvidaste tu contraseña?» y sigue el enlace que te llega al correo. Si no llega, revisa spam o escríbenos. '+CONTACT,actions:inApp()?[]:[['Iniciar sesión',toSignIn]]})},
  {keys:['iniciar sesion','entrar','login','acceder','contrasena','correo y contrasena'],answer:()=>inApp()?{text:'Ya iniciaste sesión. Para salir, usa «Cerrar sesión» al final de cualquier pantalla.'}:{text:'Toca «Iniciar sesión» y escribe tu correo y contraseña. Si marcas «Recordarme», no tendrás que escribirla otra vez en esta computadora.',actions:[['Iniciar sesión',toSignIn]]}},
  {keys:['registr','crear cuenta','cuenta nueva','darme de alta','inscrib'],answer:()=>inApp()?{text:'Ya tienes una cuenta abierta. Si quieres otra, cierra sesión y elige «Registrarme».'}:{text:'Elige «Registrarme», escoge tu perfil y crea tu acceso con correo, contraseña y el código de acceso que te da tu academia (si entrenas por tu cuenta, el jugador puede dejarlo vacío). Después son unos pasos cortos para completar tu perfil.',actions:[['Registrarme',toRegister]]}},
  {keys:['que perfil','jugador o','tutor','papa','mama','familia','padre','madre','coach o'],answer:()=>({text:'Elige <b>Jugador</b> si entrenas, <b>Coach</b> si planeas sesiones y das seguimiento, y <b>Tutor</b> si acompañas a un jugador menor de edad.'})},
  {keys:['confirmar','asistencia','voy a ir','confirmo'],answer:()=>isPlayerSide()?{text:'En Inicio, en la tarjeta de tu próxima sesión, toca «Confirmar asistencia». Puedes deshacerlo con el mismo botón.',actions:[['Ir a Inicio',go('home')]]}:{text:'Cuando inicies sesión, la tarjeta de tu próxima sesión tiene el botón «Confirmar asistencia».'}},
  {keys:['llevar','llevo','material','raqueta','que necesito'],answer:()=>{
    const s=isPlayerSide()&&nearestSession();
    return s?{text:`Para ${esc(s.title)} (${esc(s.time)}): ${esc(sessionGear(s))}.`,actions:[['Ver la sesión',()=>{close();openSession(s.id)}]]}:{text:'Cada sesión indica qué llevar. Lo ves al abrir la sesión desde tu plan.'};
  }},
  {keys:['proxima sesion','entreno','entrenamiento','sesion','horario','a que hora','agenda','hoy','manana','plan'],answer:()=>{
    if(!isPlayerSide())return inApp()?{text:'Tu plan de la academia está en «Plan de la academia».',actions:[['Abrir el plan',go('calendar')]]}:{text:'Inicia sesión para ver tu próxima sesión, el horario y qué llevar.',actions:[['Iniciar sesión',toSignIn]]};
    const s=nearestSession();
    if(!s)return {text:'No tienes sesiones próximas. Revisa tu plan para ver otras fechas.',actions:[['Abrir mi plan',go('calendar')]]};
    return {text:`Tu próxima sesión: <b>${esc(dateLabel(s.date,{weekday:'long',day:'numeric',month:'long'}))}</b> · ${esc(s.time)} · ${esc(s.place)} · ${esc(sessionCoach(s))}.`,actions:[['Ver la sesión',()=>{close();openSession(s.id)}],['Abrir mi plan',go('calendar')]]};
  }},
  {keys:['pago','pagar','mensualidad','comprobante','transferencia','clabe','cuota','colegiatura','matricula'],answer:()=>({text:'Abre «Mensualidad», elige el mes y transfiere con tu matrícula como concepto. Luego sube el comprobante a ese mes. Verás una palomita cuando la academia lo confirme.',actions:inApp()&&role!=='Coach'?[['Ir a Mensualidad',go('payments')]]:inApp()?[]:[['Iniciar sesión',toSignIn]]})},
  {keys:['objetivo','meta','progreso','avance','mejorar','evaluacion','feedback','grafica','porcentaje'],answer:()=>({text:'En «Análisis del coach» ves qué tan cerca vas de tu meta (la que escribiste al registrarte es el 100 %). Hay tres gráficas: cómo te sientes, cómo te ve tu coach y la comparación. Elige el periodo: diario, semanal, mensual, trimestral o anual.',actions:inApp()?[['Ir a Análisis del coach',go('goals')]]:[]})},
  {keys:['encuesta','como me fue','como me senti','notificacion','aviso diario'],answer:()=>({text:'Después de cada entrenamiento, al abrir CORDA te llega la pregunta «¿Cómo te fue hoy?». Tu respuesta calcula tu porcentaje del día. Tu coach responde lo mismo sobre ti.',actions:isPlayerSide()?[['Responder ahora',()=>{close();openPlayerCheckin()}]]:[]})},
  {keys:['torneo','competencia','competir','partido'],answer:()=>({text:'En Inicio o en tu plan, toca «Añadir torneo». CORDA arma la cuenta regresiva y las etapas de preparación.',actions:isPlayerSide()?[['Abrir mi plan',go('calendar')]]:[]})},
  {keys:['agendar una cita','agendar cita','cita con','cita','junta','reunion','hablar con mi coach','director'],answer:()=>({text:'En Inicio, la tarjeta «Citas con la academia» te deja elegir con quién reunirte y ver los horarios libres.',actions:inApp()?[['Ir a Inicio',go('home')]]:[]})},
  {keys:['idioma','ingles','english','frances','francais','language'],answer:()=>({text:'Cambia el idioma con el selector de arriba a la derecha: español, English o français.'})},
  {keys:['datos','privacidad','se guarda','seguro','seguridad'],answer:()=>({text:'Tus datos se guardan en tu cuenta CORDA y cada persona ve solo lo que su rol permite. Tu contraseña se guarda cifrada. Puedes leer el Aviso de privacidad y los Términos en «Privacidad y términos», al final de la página.'})},
  {keys:['que es corda','sobre corda','mision','vision','valores','quienes son','fundador'],answer:()=>({text:'CORDA conecta el plan de tu academia con las indicaciones de tu coach, para que cada entrenamiento tenga dirección.',actions:[['Conocer misión y valores',toAbout]]})},
  {keys:['hablar con el equipo','contacto','soporte','ayuda humana','persona','equipo de corda','whatsapp','correo','telefono','instagram'],answer:()=>({text:CONTACT})},
  {keys:['gracias','grac','perfecto','listo','ok','adios','bye'],answer:()=>({text:'Con gusto. Aquí estoy si necesitas algo más.'})}
];
const normalize=text=>String(text).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9ñ ]/g,' ').replace(/\s+/g,' ').trim();
function reply(question){
  const q=' '+normalize(question)+' ';
  let best=null,score=0;
  for(const intent of INTENTS){
    const hits=intent.keys.filter(k=>q.includes(' '+k)).reduce((sum,k)=>sum+k.length,0);
    if(hits>score){best=intent;score=hits}
  }
  if(!best)return {text:'Todavía no sé responder eso. '+CONTACT,actions:[]};
  const out=best.answer();
  return {text:out.text,actions:out.actions||[]};
}
function suggestions(){
  return inApp()
    ? (role==='Coach'?['Abrir el plan','Agendar una cita','Hablar con el equipo']:['Mi próxima sesión','Qué llevo hoy','Cómo pago la mensualidad','Hablar con el equipo'])
    : ['Qué es CORDA','Cómo me registro','Olvidé mi contraseña','Hablar con el equipo'];
}

// ---------- Interfaz ----------
const root=document.createElement('div');
root.className='ace';
root.innerHTML=`<button type="button" class="ace-launcher" aria-expanded="false" aria-controls="ace-panel" aria-label="Abrir Ace, el asistente de CORDA" title="Ace · Asistente">${BALL}</button>
<section class="ace-panel" id="ace-panel" role="dialog" aria-label="Ace, asistente de CORDA" hidden>
  <header class="ace-head"><span class="ace-avatar">${BALL}</span><span><b>Ace</b><small>Asistente de CORDA</small></span><button type="button" class="ace-close" aria-label="Cerrar Ace">${CLOSE}</button></header>
  <div class="ace-log" aria-live="polite"></div>
  <div class="ace-chips"></div>
  <form class="ace-form"><label class="ace-sr" for="ace-input">Escribe tu pregunta</label><input id="ace-input" autocomplete="off" maxlength="300" placeholder="Escribe tu pregunta"><button class="ace-send" aria-label="Enviar">${SEND}</button></form>
</section>`;
document.body.appendChild(root);
const launcher=root.querySelector('.ace-launcher'),panel=root.querySelector('.ace-panel'),log=root.querySelector('.ace-log'),chips=root.querySelector('.ace-chips'),form=root.querySelector('.ace-form'),input=root.querySelector('#ace-input');
let started=false;

function add(who,html,actions=[]){
  const item=document.createElement('div');
  item.className='ace-msg ace-msg--'+who;
  item.innerHTML=`<p>${html}</p>`;
  if(actions.length){
    const row=document.createElement('div');row.className='ace-actions';
    actions.forEach(([label,run])=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=run;row.appendChild(b)});
    item.appendChild(row);
  }
  log.appendChild(item);log.scrollTop=log.scrollHeight;
}
function showChips(){
  chips.innerHTML='';
  suggestions().forEach(text=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=()=>ask(text);chips.appendChild(b)});
}
function ask(text){
  const question=text.trim();if(!question)return;
  add('user',esc(question));
  const answer=reply(question);
  setTimeout(()=>add('ace',answer.text,answer.actions),250);
}
function open(){
  panel.hidden=false;launcher.setAttribute('aria-expanded','true');root.classList.add('is-open');
  if(!started){add('ace','Hola, soy Ace. Te ayudo a moverte por CORDA. ¿Qué necesitas?');started=true}
  showChips();input.focus();
}
function close(){
  if(panel.hidden)return;
  panel.hidden=true;launcher.setAttribute('aria-expanded','false');root.classList.remove('is-open');launcher.focus({preventScroll:true});
}
launcher.onclick=()=>panel.hidden?open():close();
root.querySelector('.ace-close').onclick=close;
panel.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
form.onsubmit=e=>{e.preventDefault();ask(input.value);input.value=''};
window.aceAsk=ask; // útil para pruebas desde la consola
})();
