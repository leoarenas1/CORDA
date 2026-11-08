# CORDA · Código fuente

Exportación: 4 de noviembre de 2026.

Versión local: `fc7c04709b6ec84fe85a14aaf14c9bc450b8f0f7`.

Corregido el 4 de noviembre de 2026: tres errores en `dist/app.js`, `dist/community.js` y `dist/dashboard-language.js` (volver al registro ya no borra objetivos ni revisiones; los tutores aparecen en el directorio; las traducciones no cambian el texto escrito por los usuarios).

Inicio de sesión añadido el 4 de noviembre de 2026: nuevo archivo `dist/auth.js` (cuentas con correo y contraseña guardadas solo en este navegador, con la contraseña protegida por hash PBKDF2; opción «Recordarme» y botón «Cerrar sesión»), y cambios en `dist/app.js`, `dist/roles.js`, `dist/index.html` y `dist/style.css`.

Rediseño y sección añadidos el 4 de noviembre de 2026: tokens del brand book en `dist/styles/tokens.css` (tema «cancha» por defecto y «arena»), `dist/style.css` reescrito usando solo esos tokens, tarjeta de próxima sesión con «Confirmar asistencia», sección «Sobre CORDA» (misión, visión y valores) en `dist/sobre-corda.js` y `dist/styles/sobre-corda.css`, y video de fondo en la portada.

Portada, reseñas y asistente añadidos el 4 de noviembre de 2026: la portada ya no tiene botón de pausa (el video corre en bucle), suma accesos directos a Instagram, correo y WhatsApp, pie alineado y una flecha animada hacia la misión; sección de reseñas de ejemplo con desplazamiento automático en `dist/resenas.js`; y Ace, el asistente guiado de CORDA, en `dist/ace.js` y `dist/styles/ace.css`.

Progreso y sesiones actualizados el 4 de noviembre de 2026: «Mi progreso» ahora tiene una encuesta diaria del jugador, la evaluación diaria del coach (con pregunta de asistencia) y tres gráficas (cómo se siente el jugador, cómo lo ve el coach y la comparación) con periodo diario, semanal, mensual, trimestral o anual; el 100 % es la meta escrita al registrarse y los torneos añadidos aparecen solos en las gráficas (`dist/progress-hub.js`). En la ventana de cada sesión se quitaron el enlace a la biblioteca, el estado por horario y el botón «Completar sesión»; la guía se llama «Explicación del ejercicio» e incluye un recuadro para el video.

Ajustes del 4 de noviembre de 2026 (segunda ronda): el recuadro del video quedó debajo de los pasos de «Explicación del ejercicio»; la encuesta del jugador también pregunta si fue al entrenamiento y, si no fue, omite las demás preguntas; y los archivos de `dist/index.html` y `dist/movil.html` llevan una marca de versión (`?v=…`) para que el navegador siempre cargue la versión más reciente.

> **Ajustes del 5 de noviembre de 2026.** Meta guiada en el registro (paso 7), fotos de fondo según el tipo de entrenamiento físico (`dist/assets/sesiones/`), «Mi progreso» simplificado (solo resumen y tres gráficas), «Competencias» arriba en «Mi plan», «Mi perfil» en el menú principal y versión de caché `?v=20261105i`.

> **Ajustes del 6 de noviembre de 2026.** Colores 60-30-10 (fondo verde, tarjetas arena, lima solo en la acción principal), «Mi perfil» y «Cerrar sesión» centrados al final, torneos próximos destacados en «Competencias», periodos de «Mi progreso» que se abren según los días con datos, resumen de progreso sin puntos faltantes ni próximo torneo, «Mi academia» con video de fondo en toda la página, equipo sin tarjetas y sin botones de pausa en videos en bucle. Versión de caché `?v=20261106p`.

> **Fase A de Supabase (8 nov 2026):** registro e inicio de sesión con cuentas reales. `dist/vendor/supabase-2.119.0.js` es la librería oficial @supabase/supabase-js 2.119.0 (no se copia aquí; se descarga de https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/dist/umd/supabase.js). El SQL está en la carpeta `supabase/`.

> **Fase B de Supabase (8 nov 2026):** `dist/sync.js` sincroniza plan, encuestas, evaluaciones, metas, torneos, mensualidades, anuncios y citas con la tabla `items` (SQL en `supabase/03_datos_compartidos.sql`).

> **Recuperar contraseña y lista de academias (8 nov 2026):** «¿Olvidaste tu contraseña?» manda un enlace por correo; la academia se elige de la lista de Supabase (`supabase/04_academias_publicas.sql`).

> **Privacidad de perfiles (8 nov 2026):** en «Mi academia» solo se ven nombre, rol y lo que cada quien escriba en su ficha; las metas ya no se muestran (`supabase/05_privacidad_perfiles.sql`).

## Cómo usar este documento

Contiene el código completo de los archivos de texto de la aplicación, separado por ruta. Para reconstruirla, copia cada bloque en un archivo con la ruta indicada y sirve la carpeta `dist` con un servidor web estático. Por ejemplo: `python3 -m http.server 8000 --directory dist`.

Es un prototipo con almacenamiento local en el navegador; este código no incluye autenticación real ni una base de datos compartida. Los archivos de imagen y video se enumeran al final, pero no se incrustan en este Markdown: deben copiarse a las rutas correspondientes para conservar los fondos y fotografías.

## Índice

- `dist/ace.js`
- `dist/annual-progress.js`
- `dist/app.js`
- `dist/auth.js`
- `dist/community.js`
- `dist/dashboard-language.js`
- `dist/index.html`
- `dist/meetings.js`
- `dist/monthly-fees.js`
- `dist/movil.html`
- `dist/portada.js`
- `dist/portal.js`
- `dist/private-payments.js`
- `dist/progress-hub.js`
- `dist/resenas.js`
- `dist/roles.js`
- `dist/session-guide.js`
- `dist/sobre-corda.js`
- `dist/style.css`
- `dist/styles/ace.css`
- `dist/styles/sobre-corda.css`
- `dist/styles/tokens.css`
- `dist/supabase-config.js`
- `dist/sync.js`
- `ASSET_CREDITS.md`
- `.openai/hosting.json`

## Archivo: `dist/ace.js`

````javascript
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
  {keys:['olvide mi contrasena','olvide','recuperar','no recuerdo','restablecer','perdi mi contrasena'],answer:()=>({text:'Por ahora tu cuenta vive solo en este navegador, así que no hay correo de recuperación. '+CONTACT})},
  {keys:['iniciar sesion','entrar','login','acceder','contrasena','correo y contrasena'],answer:()=>inApp()?{text:'Ya iniciaste sesión. Para salir, usa «Cerrar sesión» al final de cualquier pantalla.'}:{text:'Toca «Iniciar sesión» y escribe tu correo y contraseña. Si marcas «Recordarme», no tendrás que escribirla otra vez en esta computadora.',actions:[['Iniciar sesión',toSignIn]]}},
  {keys:['registr','crear cuenta','cuenta nueva','darme de alta','inscrib'],answer:()=>inApp()?{text:'Ya tienes una cuenta abierta. Si quieres otra, cierra sesión y elige «Registrarme».'}:{text:'Elige «Registrarme», escoge tu perfil y crea tu acceso con correo y contraseña. Después son 8 pasos cortos.',actions:[['Registrarme',toRegister]]}},
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
  {keys:['objetivo','meta','progreso','avance','mejorar','evaluacion','feedback','grafica','porcentaje'],answer:()=>({text:'En «Mi progreso» ves qué tan cerca vas de tu meta (la que escribiste al registrarte es el 100 %). Hay tres gráficas: cómo te sientes, cómo te ve tu coach y la comparación. Elige el periodo: diario, semanal, mensual, trimestral o anual.',actions:inApp()?[['Ir a Mi progreso',go('goals')]]:[]})},
  {keys:['encuesta','como me fue','como me senti','notificacion','aviso diario'],answer:()=>({text:'Después de cada entrenamiento, al abrir CORDA te llega la pregunta «¿Cómo te fue hoy?». Tu respuesta calcula tu porcentaje del día. Tu coach responde lo mismo sobre ti.',actions:isPlayerSide()?[['Responder ahora',()=>{close();openPlayerCheckin()}]]:[]})},
  {keys:['torneo','competencia','competir','partido'],answer:()=>({text:'En Inicio o en tu plan, toca «Añadir torneo». CORDA arma la cuenta regresiva y las etapas de preparación.',actions:isPlayerSide()?[['Abrir mi plan',go('calendar')]]:[]})},
  {keys:['agendar una cita','agendar cita','cita con','cita','junta','reunion','hablar con mi coach','director'],answer:()=>({text:'En Inicio, la tarjeta «Citas con la academia» te deja elegir con quién reunirte y ver los horarios libres.',actions:inApp()?[['Ir a Inicio',go('home')]]:[]})},
  {keys:['idioma','ingles','english','frances','francais','language'],answer:()=>({text:'Cambia el idioma con el selector de arriba a la derecha: español, English o français.'})},
  {keys:['datos','privacidad','se guarda','seguro','seguridad'],answer:()=>({text:'En este prototipo, tus datos se guardan solo en este navegador. Tu contraseña se guarda protegida, nunca en texto. Aún no se sincroniza entre dispositivos.'})},
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
````

## Archivo: `dist/annual-progress.js`

````javascript
// Tarjeta "Tu balance del mes" del inicio. La gráfica de progreso vive en progress-hub.js.
const exampleAssessment={good:'Tu segundo saque entra con más regularidad, incluso cuando juegas con el marcador en contra.',focus:'Dale más efecto al segundo saque para ganar margen sobre la red. En la próxima sesión, practica al cuerpo empezando en 30–40 y registra cuántos saques entran profundos.'};
function monthlyReviewCard(){
  const key=localDay().slice(0,7),assessment=state.profile.monthlyReviews?.[key];
  const note=assessment||exampleAssessment;
  const last=Object.entries(state.reviews).sort(([a],[b])=>b.localeCompare(a))[0];
  return `<section class="card coach-month"><small class="eyebrow">Seguimiento del coach</small><h2>Tu balance del mes</h2><small class="review-period">${assessment?dateLabel(key+'-01',{month:'long',year:'numeric'}):'Ejemplo · Leonardo · Octubre 2026'}</small><div class="monthly-gain"><b><span class="gain-check" aria-hidden="true">✓</span>Lo que mejoraste</b><p>${esc(note.good)}</p></div><div><b>Tu siguiente ajuste</b><p>${esc(note.focus)}</p></div>
  ${last?`<p class="hint">Última corrección · ${dateLabel(last[0],{day:'numeric',month:'short'})}<br>${esc(last[1].focus)}</p>`:''}
  <button data-page="goals" class="link">Ver mi progreso ↗</button>${role==='Coach'?'<button class="link" id="edit-month">Evaluar este mes</button><button class="link" id="review-today">Evaluar hoy</button>':''}</section>`;
}
function bindAnnual(){
  const edit=document.querySelector('#edit-month');
  if(edit)edit.onclick=()=>{
    const key=localDay().slice(0,7),previous=state.profile.monthlyReviews?.[key]||{};
    modal('Balance de este mes','<label class="full">Lo que mejoró<textarea required maxlength="600" name="good">'+esc(previous.good)+'</textarea></label><label class="full">Siguiente ajuste<textarea required maxlength="600" name="focus">'+esc(previous.focus)+'</textarea></label>',data=>{
      state.profile.monthlyReviews??={};state.profile.monthlyReviews[key]={...previous,...data};
    });
  };
}
````

## Archivo: `dist/app.js`

````javascript
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={home:'M3 10 12 3l9 7v10H3Z M9 20v-7h6v7',calendar:'M4 5h16v16H4Z M4 10h16 M8 3v4 M16 3v4',target:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10 M12 11v2',gym:'M3 8v8 M6 5v14 M6 12h12 M18 5v14 M21 8v8',user:'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M4 21v-3a8 6 0 0 1 16 0v3',profile:'M3 5h18v14H3Z M9 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4 M5.5 16.5a3.5 3 0 0 1 7 0 M15 10h4 M15 14h3',wallet:'M3 6h18v15H3Z M3 6V3h15 M16 11h5v5h-5Z',arrow:'M5 12h14 M13 6l6 6-6 6',play:'M8 4l13 8-13 8Z',check:'M5 12l4 4L20 5',tennis:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M6 5c7 3 7 11 12 14 M3 12c7-4 11-4 17-6'};
const icon=n=>`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[n]||paths.target}"/></svg>`;
const seed=()=>({profile:null,goals:[{id:1,title:'Ganar consistencia desde el fondo',detail:'Mantener 15 pelotas en juego con profundidad.',progress:40},{id:2,title:'Construir un segundo saque confiable',detail:'Objetivo: 7 de cada 10 saques dentro.',progress:25}],sessions:[{id:1,day:0,time:'07:00',type:'Tenis',title:'Consistencia y profundidad',duration:'90',place:'Cancha 3',goal:'Ganar consistencia desde el fondo',notes:'Activación · peloteo cruzado · puntos con intención. Plan de ejemplo para revisar con tu coach.',done:false},{id:2,day:0,time:'16:00',type:'Físico',title:'Fuerza y estabilidad',duration:'60',place:'Gimnasio',goal:'Preparación física',notes:'Sesión de ejemplo. El preparador físico debe ajustar y aprobar los ejercicios.',done:false},{id:3,day:2,time:'07:00',type:'Tenis',title:'Saque + primera pelota',duration:'90',place:'Cancha 2',goal:'Construir un segundo saque confiable',notes:'Trabajo técnico de saque y construcción del primer golpe.',done:false},{id:4,day:4,time:'08:00',type:'Tenis',title:'Patrones de partido',duration:'90',place:'Cancha 1',goal:'Ganar consistencia desde el fondo',notes:'Puntos condicionados y revisión con el coach.',done:false}],exercises:[],comments:[],videos:[],payment:'Pendiente',receipt:null,coachNote:'Esta semana trabajamos la profundidad antes de buscar velocidad. Cada sesión tiene una intención.',competition:[]});
const phoneDemo=new URLSearchParams(location.search).get('vista')==='jugador-movil';
let state;try{state=phoneDemo?seed():JSON.parse(localStorage.getItem('corda-v1'))||seed()}catch{state=seed()}let page='home',role='Jugador',step=0,draft={},selectedDay=0,entry='welcome';
const save=()=>{try{rememberPlayer();if(phoneDemo)return true;localStorage.setItem('corda-v1',JSON.stringify(state));pushProfile();scheduleSync();return true}catch{toast('No se pudo guardar: libera espacio en el navegador.');return false}};
function toast(t){$('#toast').textContent=t;$('#toast').style.display='block';setTimeout(()=>$('#toast').style.display='none',3200)}
function avatar(p=state.profile){return p?.photo?`<img class="avatar" alt="Foto de perfil" src="${p.photo}">`:`<span class="avatar">${esc((p?.name||'Tú').slice(0,2).toUpperCase())}</span>`}
const field=(label,name,value='',type='text',required=true)=>`<label>${label}<input name="${name}" type="${type}" value="${esc(value)}" ${required?'required':''} maxlength="180"></label>`;
const select=(label,name,options,value)=>`<label>${label}<select name="${name}">${options.map(o=>`<option ${o===value?'selected':''}>${esc(o)}</option>`).join('')}</select></label>`;
function render(){document.documentElement.lang='es';if(entry==='welcome'){welcome();return}if(entry==='access'){signInScreen();return}if(entry==='about'){sobreCorda();return}if(entry==='register'||!state.profile){onboarding();return}prepareCommunity();const nav=roleNav();const parent=['training','gym'].includes(page)?'calendar':page;$('#app').innerHTML=`<div class="shell"><aside class="sidebar" data-theme="cancha"><div class="brand">CORDA<span>.</span></div><div class="workspace"><small class="eyebrow">Tu academia</small><strong>${esc(state.profile.academy)}</strong><span class="badge">High Performance · Demo</span></div><nav class="nav">${nav.map(([id,i,t])=>`<button data-page="${id}" class="${parent===id?'active':''}">${icon(i)}${t}</button>`).join('')}</nav><div class="sidebarfooter"><div class="demo">CUENTA EN LA NUBE<br>Tu acceso ya es real. Tus entrenamientos, por ahora, se guardan en este navegador.</div><p class="hint">Tu juego, con dirección.</p></div></aside><div><header class="topbar"><span class="muted">Academia / <strong>${nav.find(n=>n[0]===parent)?.[2]||'Mi perfil'}</strong></span><span class="brand mobilebrand">CORDA<span>.</span></span><div class="row portal-tools">${coverSelector()}</div></header><main class="main">${content()}${contactFooter(coverLanguage)}<div class="account-links"><button class="link account-link" data-page="profile">${coverText('Mi perfil','My profile','Mon profil')}</button><button class="link account-link" id="signout">${coverText('Cerrar sesión','Sign out','Se déconnecter')}</button></div></main></div></div>`;translateDashboard();bindCoverLanguage(render);bind();}
function heading(title,sub,action=''){return `<div class="heading"><div><h1>${title}</h1><p class="muted">${sub}</p></div>${action}</div>`}
function session(s){return `<div class="session"><div class="time">${esc(s.time)}<small>${esc(s.duration)} min</small></div><div class="sessioninfo"><span class="badge ${s.type==='Físico'?'clay':''}">${esc(s.type)}</span><h3>${sessionTitle(s)}</h3><p>${esc(s.place)} · ${esc(sessionStatus(s))}</p></div><button class="btn light small" data-session="${s.id}">${s.done?'Ver resumen':'Ver sesión'} ${icon('arrow')}</button></div>`}
function goal(g){return `<div class="goal"><div class="row"><span class="badge gray">Objetivo técnico</span><small>${g.progress}%</small></div><h3>${esc(g.title)}</h3><p>${esc(g.detail)}</p><div class="progress"><i style="width:${g.progress}%"></i></div>${role==='Coach'?`<button class="link" data-progress="${g.id}">Actualizar avance</button>`:''}</div>`}
function content(){const p=state.profile;
if(role==='Coach'&&page==='student-fees'&&academyPlayers(actor().academy).some(m=>m.id===rosterDetail))return '<button class="link" data-page="goals">← Ficha del jugador</button>'+feePage();
if(role==='Coach'&&page==='private-payments')return weeklyPage();
if(role==='Coach'&&page==='appointments')return heading('Citas','Disponibilidad y juntas de la academia')+meetingCard();
if(role!=='Jugador'&&page==='profile')return adultProfile();
if(role==='Coach'&&page==='goals')return staffProgress();
if(role==='Tutor'&&page==='goals')return athleteDetail(athleteFor(academyPlayers(actor().academy).find(m=>m.id===actor().childId)),state.profile.name);
if(page==='home')return role==='Coach'?coachHome():role==='Tutor'?familyHome():playerHome();if(page==='team')return teamPage();
if(page==='calendar')return planTabs()+calendarPage();
if(page==='goals')return progressPage();
if(page==='training')return planTabs()+heading('Dentro de la cancha.','Cada sesión, conectada con lo que quieres mejorar.',role==='Coach'?'<button class="btn lime" id="newsession">+ Crear sesión</button>':'')+`<section class="card">${state.sessions.filter(s=>s.type==='Tenis').map(session).join('')}</section><section class="card"><div class="sectiontitle"><h2>Biblioteca de video</h2><button class="link" id="newvideo">+ Añadir enlace</button></div>${state.videos.map(v=>`<div class="session">${icon('play')}<div><h3>${esc(v.title)}</h3><a href="${esc(v.url)}" target="_blank" rel="noopener noreferrer">Abrir video ↗</a></div></div>`).join('')||'<p class="muted">Añade un video de tu técnica o una referencia del coach. Los enlaces se abrirán en una nueva pestaña.</p>'}</section>`;
if(page==='gym')return planTabs()+heading('La base de tu juego.','Preparación física planificada por tu coach.',role==='Coach'?'<button class="btn lime" id="exercise">+ Añadir ejercicio</button>':'')+`<div class="columns"><section class="card"><div class="sectiontitle"><h2>Mi rutina</h2><span class="badge clay">Preparación física</span></div>${state.exercises.length?state.exercises.map((e,i)=>`<div class="exercise"><span class="number">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(e.title)}</h3><p class="muted">${esc(e.sets)} · ${esc(e.notes)}</p></div><button class="check ${e.done?'done':''}" data-exercise="${e.id}" aria-label="${e.done?'Desmarcar':'Completar'} ${esc(e.title)}">${e.done?'✓':''}</button></div>`).join(''):'<div class="empty">Tu rutina empieza con tu preparador físico.<br>Cambia a la vista Coach para añadir ejercicios.</div>'}</section><section class="card"><span class="eyebrow">Plan antes que improvisación</span><h2>Un espacio para tu preparación.</h2><p class="muted">Series, repeticiones, indicaciones y seguimiento. La rutina debe ser definida y revisada por el responsable de preparación física.</p></section></div>`;
if(page==='payments')return feePage();
if(page==='profile')return heading('Tu juego tiene identidad.','Información que ayuda a tu coach a conocerte mejor.','<button class="btn light" id="editprofile">Editar perfil</button>')+`<div class="columns"><section class="card"><div class="profileheader">${avatar()}<div><span class="badge">Jugador · High Performance</span><h2>${esc(p.name)}</h2><p class="muted">${esc(p.academy)}</p></div></div><div class="formgrid">${[['Estilo de juego',p.style],['Mano dominante',p.hand],['Raqueta',p.racket||'Por añadir'],['Fecha de nacimiento',p.birthDate?dateLabel(p.birthDate,{day:'numeric',month:'long',year:'numeric'}):p.birthMonth||'Por añadir'],['UTR individual',p.utr||'Sin indicar'],['Nivel',p.level],['Disponibilidad',p.availability]].map(([k,v])=>`<div><small>${k}</small><h3>${esc(v)}</h3></div>`).join('')}</div><hr class="divider"><small>OBJETIVO PERSONAL</small><p>${esc(p.goal)}</p><hr class="divider"><small>PREFERENCIAS</small><p>${esc(p.preferences||'Sin preferencias añadidas.')}</p></section><section class="card"><h2>Tu espacio de prueba</h2><p class="hint">Puedes recorrer las vistas Jugador y Coach desde arriba. Son vistas de demostración, no roles con permisos reales.</p><p class="hint">Tus datos solo viven en este navegador. Para el piloto entre dispositivos hará falta conectar cuentas, permisos y almacenamiento compartido.</p><button class="btn light" id="export">Exportar mis datos</button><hr class="divider"><button class="link" id="restart">Volver al registro inicial</button></section></div>`;return '';}
function onboarding(){
 const first=draft.firstName??(draft.name||'').split(' ')[0]??'';
 const last=draft.lastName??(draft.name||'').split(' ').slice(1).join(' ');
 const choices=(name,options,value)=>`<div class="choice-grid">${options.map(([v,desc])=>`<label class="choice"><input type="radio" name="${name}" value="${esc(v)}" ${value===v?'checked':''} required><span><strong>${esc(v)}</strong><small>${desc}</small></span></label>`).join('')}</div>`;
 const pages=[
 {title:'Empecemos por ti.',desc:'Cada jugador tiene su propia historia.',body:`<div class="formgrid">${field('Nombre','firstName',first)}${field('Apellido','lastName',last)}</div>`},
 {title:'¿Cuándo cumples años?',desc:'Elige día, mes y año de nacimiento.',body:birthInput(draft.birthDate)},
 {title:'¿En qué etapa juegas?',desc:'Elige el camino que mejor describe tu tenis hoy.',body:choices('level',pathways,draft.level)+utrInput(draft.utr)},
 {title:`¿Dónde juegas${first?', '+esc(first):''}?`,desc:'Tu academia será el punto de encuentro con tu coach.',body:`${academySelect('academy',draft.academy,{independent:true,label:'Tu academia'})}<p class="wizard-helper">Si tu academia no aparece, elige «Entreno de forma independiente» y escríbenos para darla de alta.</p>`},
 {title:'¿Cómo construyes un punto?',desc:'Elige la frase que más se parece a ti en la cancha.',body:choices('style',identities,draft.style)},
 {title:'Tu compañera de cancha.',desc:'Cuéntanos con qué juegas.',body:`<label>Tu raqueta <span class="optional">(opcional)</span><input name="racket" value="${esc(draft.racket||'')}" maxlength="120" placeholder="Ej. HEAD Speed MP" autocomplete="off"></label><label class="utr-field">Mano dominante</label>${choices('hand',[['Diestro','Mano derecha'],['Zurdo','Mano izquierda'],['Ambidiestro','Ambas manos']],draft.hand||'Diestro')}`},
 {title:'¿Cuál es tu próximo paso?',desc:'Escribe una meta concreta. Será tu 100 % en «Mi progreso».',body:`<div class="goal-tips"><b>Una buena meta dice tres cosas:</b><ul><li><span>Qué</span> quieres lograr</li><li><span>Cuánto</span>: un número que se pueda medir</li><li><span>Para cuándo</span>: una fecha o un torneo</li></ul></div><label>Quiero…<textarea name="goal" required maxlength="400" placeholder="Ej. Meter 7 de cada 10 segundos saques en partido antes de marzo.">${esc(draft.goal||'')}</textarea></label><p class="wizard-helper">Tu coach y tú medirán tu avance contra esta meta en las gráficas. Podrás cambiarla después en «Mi perfil».</p>`},
 {title:'Ponle cara a tu juego.',desc:'Una foto para que tu coach te reconozca. Tú decides.',body:`<div class="wizard-photo"><div id="photo-preview">${avatar({...draft,name:first})}</div><label class="photo-picker">${draft.photo?'Cambiar foto':'Elegir una foto'}<input id="photo" type="file" accept="image/png,image/jpeg"></label><small>JPG o PNG · Máximo 2 MB</small>${draft.photo?'<button type="button" id="removephoto" class="link">Quitar foto</button>':''}</div>`}
 ];
 if(!$('#wizard-panel')){
   accessScene('wizard','<header class="wizard-top"><button type="button" id="wizard-home" class="brand" aria-label="Volver al inicio">CORDA<span>.</span></button></header><section id="wizard-panel" class="wizard-panel"></section><footer class="wizard-foot">TU PERFIL SE GUARDA EN TU CUENTA CORDA</footer>');
 $('#wizard-home').onclick=()=>{capture();entry='welcome';render()};
 }
 const current=pages[step];$('#wizard-panel').innerHTML=`<div class="wizard-progress" aria-label="Paso ${step+1} de ${pages.length}">${pages.map((_,i)=>`<i class="${i<=step?'active':''}"></i>`).join('')}</div><p class="wizard-count">${String(step+1).padStart(2,'0')} / 08 <span>${['TU NOMBRE','TU CUMPLEAÑOS','TU ETAPA','TU ACADEMIA','TU ESTILO','TU RAQUETA','TU OBJETIVO','TU FOTO'][step]}</span></p><h1 tabindex="-1" id="step-title">${current.title}</h1><p class="wizard-description">${current.desc}</p><form id="onboard">${current.body}<div class="formactions"><button type="button" id="back" class="link">${step?'← Atrás':'← Inicio'}</button><button class="btn lime" id="wizard-next">${step===pages.length-1?(draft.photo?'Entrar a mi academia':'Omitir foto y entrar'):'Continuar'} ${icon('arrow')}</button></div></form>`;
 function capture(){const form=$('#onboard');if(form){Object.assign(draft,Object.fromEntries(new FormData(form)));draft.name=[draft.firstName||first,draft.lastName||last].filter(Boolean).join(' ').trim()}}
 $('#onboard').onsubmit=e=>{e.preventDefault();capture();if(step<pages.length-1){step++;onboarding();$('#step-title').focus({preventScroll:true});window.scrollTo(0,0)}else{if(draft.utr)draft.utr=Number(draft.utr).toFixed(2);switchAgenda(draft.academy);if(!draft.memberId){state.goals=seed().goals;state.reviews={}}state.profile={level:'Por definir',availability:'Por definir',preferences:'',...draft};entry='app';prepareCommunity();state.lastPlayerId=state.profile.memberId;state.lastRole='Jugador';linkPendingAccount();save();render();window.scrollTo(0,0);toast(`Bienvenido a tu academia, ${draft.firstName||first}.`)}};
 $('#back').onclick=()=>{capture();if(step){step--;onboarding()}else{entry='welcome';render()}};
 if($('#photo'))$('#photo').onchange=async e=>{const f=e.target.files[0];if(!f)return;$('#wizard-next').disabled=true;try{draft.photo=await readImage(f);onboarding()}catch(er){toast(er.message);$('#wizard-next').disabled=false}};
 if($('#removephoto'))$('#removephoto').onclick=()=>{delete draft.photo;onboarding()};
}
async function readImage(f){if(!['image/png','image/jpeg'].includes(f.type)||f.size>2*1024*1024)throw Error('Elige una imagen JPG o PNG de menos de 2 MB.');return await readFile(f)}
function readFile(f){return new Promise((resolve,reject)=>{let reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('No se pudo leer el archivo'));reader.readAsDataURL(f)})}
function modal(title,body,submit,button='Guardar'){const m=$('#modal');m.innerHTML=`<div class="row"><h2>${title}</h2><button id="close" aria-label="Cerrar">✕</button></div><form id="modalform"><div class="formgrid">${body}</div>${submit?`<div class="formactions"><button type="button" id="cancel" class="link">Cancelar</button><button class="btn lime">${button}</button></div>`:''}</form>`;m.showModal();$('#close').onclick=()=>m.close();if($('#cancel'))$('#cancel').onclick=()=>m.close();$('#modalform').onsubmit=e=>{e.preventDefault();if(submit){if(submit(Object.fromEntries(new FormData(e.target)))===false)return;save();m.close();render();toast('Cambios guardados')}}}
function bind(){bindRoleActions();bindPortal();bindCommunity();document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{page=b.dataset.page;render();window.scrollTo(0,0)});document.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{selectedDay=+b.dataset.day;render()});document.querySelectorAll('[data-session]').forEach(b=>b.onclick=()=>openSession(+b.dataset.session));document.querySelectorAll('[data-progress]').forEach(b=>b.onclick=()=>{const g=state.goals.find(g=>g.id===+b.dataset.progress);modal('Actualizar avance',field('Avance evaluado (0–100)','progress',g.progress,'number'),d=>{let n=Number(d.progress);if(n<0||n>100){toast('El avance debe estar entre 0 y 100.');return false}g.progress=n})});document.querySelectorAll('[data-exercise]').forEach(b=>b.onclick=()=>{let e=state.exercises.find(e=>e.id===+b.dataset.exercise);e.done=!e.done;save();render()});
const on=(id,fn)=>{if($(id))$(id).onclick=fn};on('#signout',signOut);on('#newgoal',()=>modal('Un nuevo objetivo',field('Objetivo','title')+'<label class="full">¿Cómo sabrás que lo lograste?<textarea name="detail" required maxlength="400"></textarea></label>',d=>state.goals.push({...d,id:Date.now(),progress:0})));on('#newsession',()=>modal('Planificar una sesión',field('Nombre de la sesión','title')+select('Disciplina','type',['Tenis','Físico'])+field('Fecha','date',agendaDate,'date')+field('Hora','time','07:00','time')+field('Duración en minutos','duration','60','number')+field('Cancha o gimnasio','place','Cancha 1')+field('Coach responsable','coach')+field('Material recomendado','gear','','text',false)+'<label class="full">Guía rápida (un paso por línea)<textarea name="guide" maxlength="750"></textarea></label>'+field('Drills o enfoque físico','summary','','text')+select('Objetivo relacionado','goal',state.goals.map(g=>g.title).concat('Preparación física'))+'<label class="full">Plan detallado · ejercicios, series, duración o carga indicada por el coach<textarea name="notes" required maxlength="1200"></textarea></label>',d=>{if(+d.duration<=0||+d.duration>600){toast('Elige una duración entre 1 y 600 minutos.');return false}state.sessions.push({...d,day:(new Date(d.date+'T12:00:00').getDay()+6)%7,id:Date.now(),done:false})}));on('#exercise',()=>modal('Añadir ejercicio',field('Ejercicio','title')+field('Series y repeticiones','sets','')+'<label class="full">Indicaciones del preparador<textarea name="notes" maxlength="500" required></textarea></label>',d=>state.exercises.push({...d,id:Date.now(),done:false})));on('#competition',()=>modal('Próxima competencia',field('Torneo','name')+field('Fecha','date',dateAfter(localDay(),14),'date')+field('Sede','place'),d=>{if(d.date<localDay()){toast('Elige hoy o una fecha futura.');return false}state.competition.push({...d,start:localDay()})}));on('#newvideo',()=>modal('Añadir video',field('Título del video','title')+field('Enlace HTTPS','url','','url'),d=>{try{const u=new URL(d.url);if(u.protocol!=='https:')throw Error();state.videos.push(d)}catch{toast('Introduce un enlace HTTPS válido.');return false}}));on('#editnote',()=>modal('Nota del coach',`<label class="full">Mensaje<textarea name="note" maxlength="500" required>${esc(state.coachNote)}</textarea></label>`,d=>state.coachNote=d.note));on('#editprofile',()=>modal('Editar mi perfil',field('Nombre','firstName',state.profile.firstName||state.profile.name.split(' ')[0])+field('Apellido','lastName',state.profile.lastName||state.profile.name.split(' ').slice(1).join(' '),'text',false)+academySelect('academy',state.profile.academy,{independent:true})+select('Estilo','style',activeOptions(identities,state.profile.style),state.profile.style)+select('Mano dominante','hand',['Diestro','Zurdo','Ambidiestro'],state.profile.hand)+select('Etapa','level',activeOptions(pathways,state.profile.level),state.profile.level)+utrInput(state.profile.utr)+field('Raqueta','racket',state.profile.racket||'','text',false)+select('Disponibilidad','availability',['Mañanas','Tardes','Mañanas y tardes','Fines de semana'],state.profile.availability)+`<label class="full">Objetivo<textarea name="goal" maxlength="400" required>${esc(state.profile.goal)}</textarea></label><label class="full">Preferencias<textarea name="preferences" maxlength="400">${esc(state.profile.preferences)}</textarea></label>`,d=>Object.assign(state.profile,{...d,name:[d.firstName,d.lastName].filter(Boolean).join(' '),utr:d.utr?Number(d.utr).toFixed(2):''})));on('#export',()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));a.download='corda-mi-perfil.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)});on('#restart',()=>{modal('Volver al registro','<p class="full muted">Recrearás tu perfil. Tus sesiones y objetivos se conservarán en este navegador.</p>',()=>{draft={...state.profile};entry='register';step=0},'Volver al registro')});bindFees();}

function openSession(id){const s=state.sessions.find(s=>s.id===id);modal(esc(s.title),`<div class="full"><span class="badge">${esc(s.type)} · ${esc(s.duration)} MIN</span><p>${esc(s.time)} · ${esc(s.place)} · ${esc(state.profile.academy)}<br>Con ${esc(sessionCoach(s))}</p><hr class="divider"><small>OBJETIVO DE LA SESIÓN</small><h3>${esc(s.goal)}</h3><p>${esc(s.notes)}</p>${s.cancelled?`<p class="hint">${esc(sessionStatus(s))}</p>`:''}<hr class="divider"><h3>Conversación de la sesión</h3>${sessionGuide(s)}<p class="hint">Mensajes locales de demostración. No se envían a otras personas.</p>${state.comments.filter(c=>c.session===id).map(c=>`<div class="note"><small>${esc(c.role)}</small><p>${esc(c.text)}</p></div>`).join('')}<label class="utr-field">Añadir comentario<textarea name="text" required maxlength="600" placeholder="¿Cómo te sentiste en la sesión?"></textarea></label></div>`,d=>state.comments.push({session:id,role,text:d.text}),'Guardar comentario');startSessionGuide($('#modal'));}
initAgenda();
if(phoneDemo){
  state.profile={name:'Leonardo',firstName:'Leonardo',academy:'Academia de demostración',level:'Circuito competitivo',goal:'Ganar profundidad con el segundo saque.'};
  const start=new Date(Date.now()+45*60000);
  const gym=state.sessions.find(s=>s.id===state.rainExample.gymId);
  if(gym){gym.date=localDay(start);gym.day=(start.getDay()+6)%7;gym.time=String(start.getHours()).padStart(2,'0')+':'+String(start.getMinutes()).padStart(2,'0')}
  entry='app';
}
prepareCommunity();
if(!state.lastPlayerId&&state.profile&&!state.profile.staff&&!state.lastRole)state.lastPlayerId=state.profile.memberId;
save();
selectedDay=(new Date().getDay()+6)%7;
if(phoneDemo||!restoreSession())render();

function accessScene(layout,content,footer=''){
  document.documentElement.lang='es';
  let frame=$('#access-frame');
  if(!frame){
    $('#app').innerHTML='<main id="access-frame"><video id="welcome-film" class="welcome-film" muted loop playsinline preload="auto" poster="assets/tennis-close-poster.jpg" aria-hidden="true"><source src="assets/tennis-close.mp4" type="video/mp4"></video><div class="welcome-shade"></div><div id="access-content"></div></main><div id="access-footer"></div>';
    frame=$('#access-frame');
    // El video de fondo corre siempre en bucle, sin controles. Quien pidió
    // "reducir movimiento" en su sistema ve solo la imagen fija.
    const film=$('#welcome-film');
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches)film.play().catch(()=>{});
  }
  frame.className='welcome welcome-video '+layout;
  $('#access-content').innerHTML=content;
  $('#access-footer').innerHTML=footer;
}
function welcome(){
 pendingAccount=null;
 accessScene('',`${welcomeSocial()}${coverSelector()}<section class="welcome-core" aria-label="${coverText('Bienvenido a CORDA','Welcome to CORDA',"Bienvenue sur CORDA")}"><h1 class="welcome-logo">CORDA<span>.</span></h1><p class="welcome-slogan">${coverText('Tu juego, con dirección.','Your game, with direction.',"Votre jeu, avec un cap.")}</p><div class="welcome-actions"><button class="btn lime" id="signin">${coverText('Iniciar sesión','Sign in',"Se connecter")}</button><button class="btn light" id="signup">${coverText('Registrarme','Sign up',"S’inscrire")}</button></div><p class="welcome-personal">${coverText('Tu academia. Tu coach. Tu próximo paso.','Your academy. Your coach. Your next step.',"Votre académie. Votre coach. Votre prochaine étape.")}</p></section><button type="button" class="welcome-scroll" id="welcome-scroll" aria-label="${coverText('Baja para conocer nuestra misión y el mensaje del fundador','Scroll down to our mission and the founder’s message','Descendez pour découvrir notre mission et le mot du fondateur')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg></button><footer class="welcome-footer"><span class="welcome-footer__item">${coverText('Guadalajara, México','Guadalajara, Mexico',"Guadalajara, Mexique")}</span><span class="welcome-links"><button type="button" class="welcome-footer__item" data-open-about>${coverText('Sobre CORDA','About CORDA',"À propos")}</button><a class="welcome-footer__item" href="#contacto">${coverText('Contacto','Contact',"Contact")}</a></span></footer>`,coverSections()+contactFooter(coverLanguage));
 bindCoverLanguage(welcome);
 $('#welcome-scroll').onclick=()=>$('.cover-mission')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 $('#signup').onclick=()=>pickRole('register');
 $('#signin').onclick=()=>signInScreen();
 document.querySelectorAll('[data-open-about]').forEach(button=>button.onclick=()=>openSobreCorda('mision','welcome'));
}
````

## Archivo: `dist/auth.js`

````javascript
// Cuentas reales con Supabase Auth (fase A).
// - El correo y la contraseña los guarda y verifica Supabase. La app nunca guarda la contraseña.
// - El perfil (nombre, rol, academia y una copia de los datos del perfil) vive en la tabla profiles.
// - Los entrenamientos, encuestas, etc. siguen en este navegador hasta la fase B.
// - "corda-accounts" queda como caché local: correo → rol y memberId, para abrir rápido el perfil.
//   Las cuentas antiguas (contraseña con PBKDF2 en este navegador) se pasan solas a Supabase la
//   próxima vez que su dueño inicia sesión.
const ACCOUNTS_KEY='corda-accounts',SESSION_KEY='corda-session',REMEMBER_KEY='corda-remember',PBKDF2_ROUNDS=310000;
let pendingAccount=null,currentAccount=null;
// ¿Llegó desde el enlace de "Olvidé mi contraseña"? Se lee antes de que Supabase limpie la URL.
const recoveryLink=/type=recovery/.test(location.hash+location.search);

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
cloud?.auth.onAuthStateChange(event=>{if(event==='PASSWORD_RECOVERY')setTimeout(newPasswordScreen,0)});

// Academias dadas de alta en Supabase (se eligen de una lista para que el nombre coincida siempre).
const INDEPENDENT_ACADEMY='Entreno de forma independiente';
let academyList=['Mouratoglou Tennis Center Guadalajara'];
(async()=>{
  try{const {data,error}=await cloud.from('academies').select('name').order('name');if(!error&&data?.length)academyList=data.map(a=>a.name)}catch{}
})();
function academySelect(name,value,{independent=false,label='Academia'}={}){
  const options=[...academyList];
  if(independent)options.push(INDEPENDENT_ACADEMY);
  if(value&&!options.includes(value))options.push(value);
  return `<label>${label}<select name="${name}" required><option value="">Elige tu academia</option>${options.map(o=>`<option ${o===value?'selected':''}>${esc(o)}</option>`).join('')}</select></label>`;
}
function cloudError(error){
  const t=coverText,code=error?.code||'',message=String(error?.message||'');
  if(code==='invalid_credentials'||/invalid login/i.test(message))return t('Correo o contraseña incorrectos.','Incorrect email or password.','E-mail ou mot de passe incorrect.');
  if(code==='email_not_confirmed'||/not confirmed/i.test(message))return t('Primero confirma tu correo: abre el enlace que te enviamos.','Confirm your email first: open the link we sent you.','Confirmez d’abord votre e-mail : ouvrez le lien envoyé.');
  if(/rate limit|too many/i.test(code+message)||error?.status===429)return t('Demasiados intentos. Espera unos minutos y vuelve a probar.','Too many attempts. Wait a few minutes and try again.','Trop de tentatives. Attendez quelques minutes.');
  if(code==='same_password')return t('Esa ya es tu contraseña. Elige una diferente.','That is already your password. Choose a different one.','C’est déjà votre mot de passe. Choisissez-en un autre.');
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
  <p>${accessLink('auth-forgot',t('¿Olvidaste tu contraseña?','Forgot your password?','Mot de passe oublié ?'))}</p>
  <p>${t('¿Aún no tienes cuenta?','No account yet?','Pas encore de compte ?')} ${accessLink('auth-register',t('Regístrate','Register','Inscrivez-vous'))}</p>
  ${legacy?`<p class="hint">${t('¿Ya usabas CORDA antes de las cuentas?','Used CORDA before accounts?','Vous utilisiez CORDA avant les comptes ?')} ${accessLink('auth-legacy',t('Entra a tu perfil y crea tu acceso','Open your profile and create your login','Ouvrez votre profil et créez votre accès'))}</p>`:''}
  </section>`);
  bindCoverLanguage(()=>signInScreen($('#signin-form [name=email]')?.value||prefill));
  bindPasswordToggles();
  $('#auth-home').onclick=()=>{entry='welcome';render()};
  $('#auth-register').onclick=()=>pickRole('register');
  $('#auth-forgot').onclick=()=>forgotScreen($('#signin-form [name=email]').value);
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

// ---------- Olvidé mi contraseña ----------
// Supabase manda un enlace al correo; al abrirlo, la app pide la contraseña nueva.
function forgotScreen(prefill=''){
  entry='access';pendingAccount=null;
  const t=coverText;
  accessScene('access-screen',`${coverSelector()}<section class="access-panel"><small class="eyebrow">CORDA</small><h1>${t('Recupera tu acceso','Reset your password','Réinitialisez votre mot de passe')}</h1><p>${t('Escribe el correo de tu cuenta y te mandaremos un enlace para crear una contraseña nueva.','Enter your account email and we will send you a link to create a new password.','Saisissez votre e-mail et nous vous enverrons un lien pour créer un nouveau mot de passe.')}</p>
  <form id="forgot-form" class="auth-form" method="post" action="#">
    <label>${t('Correo electrónico','Email','E-mail')}<input name="email" type="email" required maxlength="180" autocomplete="username" value="${esc(prefill)}"></label>
    <p class="auth-error" id="auth-error" role="alert" hidden></p>
    <div class="formactions">${accessLink('auth-back','← '+t('Iniciar sesión','Sign in','Connexion'))}<button class="btn lime" id="forgot-submit">${t('Enviar enlace','Send link','Envoyer le lien')}</button></div>
  </form></section>`);
  bindCoverLanguage(()=>forgotScreen($('#forgot-form [name=email]')?.value||prefill));
  $('#auth-back').onclick=()=>signInScreen($('#forgot-form [name=email]').value);
  const form=$('#forgot-form');
  form.onsubmit=async e=>{
    e.preventDefault();
    const email=normalEmail(form.elements.email.value),error=$('#auth-error'),submit=$('#forgot-submit');
    const fail=text=>{if(document.contains(error)){error.textContent=text;error.hidden=false}};
    error.hidden=true;
    if(!cloud)return fail(offlineMessage());
    submit.disabled=true;
    try{
      const {error:problem}=await cloud.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
      if(problem)return fail(cloudError(problem));
      // No decimos si el correo existe: así nadie puede averiguar quién tiene cuenta.
      $('.access-panel').innerHTML=`<small class="eyebrow">CORDA</small><h1>${t('Revisa tu correo','Check your email','Vérifiez votre e-mail')}</h1><p>${t('Si hay una cuenta con','If there is an account for','Si un compte existe pour')} <b>${esc(email)}</b>, ${t('te llegará un enlace para crear tu contraseña nueva. Si no lo ves en unos minutos, revisa tu carpeta de spam.','you will get a link to create a new password. Check your spam folder if it does not arrive in a few minutes.','vous recevrez un lien pour créer un nouveau mot de passe. Vérifiez vos spams.')}</p><div class="formactions">${accessLink('auth-back','← '+t('Iniciar sesión','Sign in','Connexion'))}</div>`;
      $('#auth-back').onclick=()=>signInScreen(email);
    }catch(problem){fail(cloudError(problem))}
    finally{if(document.contains(submit))submit.disabled=false}
  };
}
function newPasswordScreen(){
  entry='access';pendingAccount=null;
  const t=coverText;
  accessScene('access-screen',`${coverSelector()}<section class="access-panel"><small class="eyebrow">CORDA</small><h1>${t('Crea tu contraseña nueva','Create a new password','Créez un nouveau mot de passe')}</h1><p>${t('Después entrarás directo a tu perfil.','You will then go straight to your profile.','Vous accéderez ensuite directement à votre profil.')}</p>
  <form id="newpass-form" class="auth-form" method="post" action="#">
    ${passwordInput('password',t('Contraseña nueva (mínimo 8 caracteres)','New password (at least 8 characters)','Nouveau mot de passe (8 caractères minimum)'),'new-password')}
    ${passwordInput('confirm',t('Repite la contraseña','Repeat the password','Répétez le mot de passe'),'new-password')}
    <p class="auth-error" id="auth-error" role="alert" hidden></p>
    <div class="formactions"><span></span><button class="btn lime" id="newpass-submit">${t('Guardar y entrar','Save and sign in','Enregistrer et entrer')}</button></div>
  </form></section>`);
  bindCoverLanguage(newPasswordScreen);
  bindPasswordToggles();
  const form=$('#newpass-form');
  form.onsubmit=async e=>{
    e.preventDefault();
    const d=Object.fromEntries(new FormData(form)),error=$('#auth-error'),submit=$('#newpass-submit');
    const fail=text=>{if(document.contains(error)){error.textContent=text;error.hidden=false}};
    error.hidden=true;
    if(d.password.length<8)return fail(t('La contraseña debe tener al menos 8 caracteres.','The password must have at least 8 characters.','Le mot de passe doit contenir au moins 8 caractères.'));
    if(d.password!==d.confirm)return fail(t('Las contraseñas no coinciden.','The passwords do not match.','Les mots de passe ne correspondent pas.'));
    submit.disabled=true;
    try{
      const {data,error:problem}=await cloud.auth.updateUser({password:d.password});
      if(problem)return fail(problem.status===401||/session/i.test(problem.message||'')?t('El enlace ya caducó. Pide uno nuevo desde «¿Olvidaste tu contraseña?».','The link has expired. Request a new one from “Forgot your password?”.','Le lien a expiré. Demandez-en un nouveau.'):cloudError(problem));
      history.replaceState(null,'',location.pathname);
      if(!await openCloudAccount(data.user,keepSignedIn())){entry='welcome';render()}
      toast(t('Listo: tu contraseña quedó actualizada.','Done: your password was updated.','C’est fait : votre mot de passe a été mis à jour.'));
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
  if(recoveryLink)return false;
  const email=sessionEmail();if(!email)return false;
  const account=findAccount(email);
  if(!account||!openAccount(account)){forgetSession();return false}
  return true;
}
async function checkCloudSession(){
  if(!cloud||typeof phoneDemo!=='undefined'&&phoneDemo||recoveryLink)return;
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
````

## Archivo: `dist/community.js`

````javascript
function newMemberId(){return Array.from(crypto.getRandomValues(new Uint32Array(4)),part=>part.toString(16).padStart(8,"0")).join("")}
function contactFooter(language="es") {
  const t=(es,en,fr)=>language==="en"?en:language==="fr"?fr:es;
  return `<footer class="contact-footer" id="contacto"><div class="footer-brand">CORDA<span>.</span><small>${t('Guadalajara, México','Guadalajara, Mexico',"Guadalajara, Mexique")}</small></div>
  <div><details><summary>${t('Quiénes somos','About us',"Qui sommes-nous ?")}</summary><p>${t('CORDA es una plataforma para academias de tenis que conecta el trabajo del coach con los objetivos de cada jugador. El plan de cancha, la preparación física y las observaciones del coach se reúnen en un solo lugar para que el jugador pueda consultar sus avances y saber qué trabajar en su próxima sesión.','CORDA helps tennis academies connect each coach’s work with each player’s goals. Court sessions, fitness training and coach feedback come together so players can track their progress and prepare for their next session.',"CORDA aide les académies de tennis à relier le travail du coach aux objectifs de chaque joueur. Entraînements, préparation physique et retours du coach sont réunis pour suivre les progrès et préparer la prochaine séance.")}</p></details>
  <details><summary>${t('Fundador','Founder',"Fondateur")}</summary><p><strong>${t('Leonardo Arenas · Fundador de CORDA y tenista','Leonardo Arenas · CORDA founder and tennis player',"Leonardo Arenas · Fondateur de CORDA et joueur de tennis")}</strong></p><p>${t('Mi experiencia como jugador me llevó a crear CORDA. Quería que las indicaciones del coach tuvieran continuidad entre sesiones y que cada jugador pudiera entender cómo su entrenamiento diario lo acerca a sus objetivos.','My experience as a player led me to create CORDA. I wanted coaching feedback to carry over between sessions and players to see how daily training brings them closer to their goals.',"Mon expérience de joueur m’a amené à créer CORDA pour que les conseils du coach restent utiles entre les séances et que chaque joueur sache comment son entraînement le rapproche de ses objectifs.")}</p></details></div>
  <div class="contact-info"><b>${t('Contáctanos','Contact us',"Contact")}</b><a class="contact-channel" href="https://www.instagram.com/corda.tenis/" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"/></svg>@corda.tenis</a><a class="contact-channel" href="mailto:corda.tenis@gmail.com"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></svg>corda.tenis@gmail.com</a><a href="tel:+523318621604">+52 33 1862 1604</a>
  <div><a href="https://wa.me/523318621604" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a> · <a href="mailto:corda.tenis@gmail.com?subject=Sugerencia%20para%20CORDA">${t('Sugerir una mejora ↗','Suggest an improvement ↗',"Suggérer une amélioration ↗")}</a></div></div></footer>`;
}
// Accesos directos de la portada: cada botón abre su canal.
function welcomeSocial(){
  const t=coverText;
  const links=[
    ['https://www.instagram.com/corda.tenis/',t('Instagram de CORDA (@corda.tenis)','CORDA on Instagram (@corda.tenis)','CORDA sur Instagram (@corda.tenis)'),'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',true],
    ['mailto:corda.tenis@gmail.com',t('Escríbenos a corda.tenis@gmail.com','Email corda.tenis@gmail.com','Écrivez à corda.tenis@gmail.com'),'<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',false],
    ['https://wa.me/523318621604',t('WhatsApp de CORDA','CORDA on WhatsApp','CORDA sur WhatsApp'),'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',true]
  ];
  return `<nav class="welcome-social" aria-label="${t('Contacto directo','Direct contact','Contact direct')}">${links.map(([href,label,icon,external])=>`<a href="${href}" aria-label="${label}" title="${label}"${external?' target="_blank" rel="noopener noreferrer"':''}><svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg></a>`).join('')}</nav>`;
}
function playerBanner(){
  return `<section class="player-banner"><video muted loop playsinline preload="metadata" poster="assets/tennis-close-poster.jpg" aria-hidden="true"><source src="assets/tennis-close.mp4" type="video/mp4"></video><div class="banner-copy"><small>MI ACADEMIA</small><h2>${esc(state.profile.academy)}</h2><button data-page="team">Ver mi academia ↗</button></div></section>`;
}
function prepareCommunity(){
  state.directory ??= [];
  const profile=state.profile;
  if(!profile)return;
  directoryEntry(profile);
  // A tutor views the app through the child's profile, so list the tutor's own account too.
  const account=actor();
  if(account&&account!==profile)directoryEntry(account);
}
function directoryEntry(profile){
  const id=profile.memberId??=newMemberId();
  let member=state.directory.find(item=>item.id===id);
  if(!member){member={id,role:profile.staff||'Jugador'};state.directory.push(member)}
  // La meta del jugador es privada: la descripción de la ficha solo la escribe cada quien en «Editar ficha».
  if(member.bio===profile.goal)member.bio='';
  Object.assign(member,{name:profile.name,academy:profile.academy,photo:profile.photo||'',bio:member.bio??''});
}
function phoneDigits(phone){
  const digits=String(phone||'').replace(/\D/g,'');
  return digits.length===10?'52'+digits:digits;
}
function teamPage(){
  prepareCommunity();
  const members=state.directory.filter(member=>member.academy===state.profile.academy);
  const memberCard=member=>{
    const phone=phoneDigits(member.phone);
    const self=member.id===actor()?.memberId;
    return `<article class="card directory-card club-person"><div class="person-photo">${avatar(member)}</div><span class="badge">${esc(member.role)}</span><h2>${esc(member.name)}${self?' <small>· Tú</small>':''}</h2>
      <p class="bio">${esc(member.bio||'Sin descripción todavía.')}</p>
      <div class="person-contact">${member.email?`<a href="mailto:${esc(member.email)}">${esc(member.email)}</a>`:'<small>Correo sin añadir</small>'}
      ${phone?`<a href="tel:+${phone}">${esc(member.phone)}</a><a class="btn small" href="https://wa.me/${phone}" target="_blank" rel="noopener noreferrer">WhatsApp privado ↗</a>`:'<small>Teléfono sin añadir</small>'}</div>
      ${self||role==='Coach'?`<button class="link member-edit" data-member="${esc(member.id)}">Editar ficha</button>`:''}</article>`;
  };
  const sections=[
    ['Coaches',members.filter(m=>m.role==='Coach')],
    ['Jugadores',members.filter(m=>m.role==='Jugador')],
    ['Personal y tutores',members.filter(m=>!['Jugador','Coach'].includes(m.role))]
  ];
  const directory=sections.filter(([,people],i)=>i<2||people.length).map(([title,people])=>
    `<section class="roster-section"><h2>${title} <small>${people.length}</small></h2>${people.length?`<div class="directory-grid">${people.map(memberCard).join('')}</div>`:`<p class="hint">Aún no hay integrantes en esta sección.</p>`}</section>`
  ).join('');
  return clubCover(groupData())+academyBoard()+
    '<section id="academic-roster"><div class="sectiontitle"><h2>Nuestro equipo</h2>'+(role==='Coach'?'<button class="btn lime" id="add-member">+ Añadir integrante</button>':'')+'</div>'+directory+'</section>'+academyLocation();
}
function editMember(id,defaultRole='Coach'){
  const existing=state.directory.find(member=>member.id===id);
  const member=existing||{role:defaultRole};
  const self=existing?.id===actor()?.memberId;
  let photo=member.photo||'';
  const body=(self?'':field('Nombre','name',member.name)+select('Rol','role',['Coach','Jugador','Preparador físico','Director','Tutor'],member.role))+
    field('Correo de contacto (opcional)','email',member.email,'email',false)+field('Teléfono con lada (opcional)','phone',member.phone,'tel',false)+
    `<label class="full">Descripción<textarea name="bio" maxlength="400">${esc(member.bio||'')}</textarea></label><label class="full">Foto (opcional)<input id="directory-photo" type="file" accept="image/jpeg,image/png"></label><p class="full hint">Añade solo los datos que quieras mostrar en el directorio de tu academia.</p>`;
  modal(self?'Mi ficha de equipo':existing?'Editar integrante':'Nuevo integrante',body,values=>{
    const digits=phoneDigits(values.phone);
    if(values.phone.trim()&&(!/^[+\d\s().-]+$/.test(values.phone)||!/^\d{10,15}$/.test(digits))){toast('Revisa el teléfono e incluye la lada del país.');return false}
    const record={...member,...values,photo,id:existing?.id||newMemberId(),academy:state.profile.academy};
    if(self){record.name=actor().name;actor().photo=photo}
    if(existing)Object.assign(existing,record);else state.directory.push(record);
  });
  const picker=$('#directory-photo');
  picker.onchange=async()=>{
    if(!picker.files[0])return;
    const submit=$('#modalform .formactions .btn');submit.disabled=true;
    try{
      const source=await readImage(picker.files[0]);
      const img=new Image();img.src=source;await img.decode();
      const canvas=document.createElement('canvas');canvas.width=canvas.height=160;
      const side=Math.min(img.width,img.height);
      canvas.getContext('2d').drawImage(img,(img.width-side)/2,(img.height-side)/2,side,side,0,0,160,160);
      photo=canvas.toDataURL('image/jpeg',0.84);
    }catch(error){toast(error.message||'No se pudo leer la foto.');picker.value=''}
    finally{submit.disabled=false}
  };
}
function bindCommunity(){
  bindAcademy();
  document.querySelectorAll('[data-member]').forEach(b=>b.onclick=()=>editMember(b.dataset.member));
  if($('#add-member'))$('#add-member').onclick=()=>editMember(null);
  // Videos en bucle de fondo: se reproducen solos, sin botón (con "reducir movimiento" se queda la foto).
  const video=$('.player-banner video');
  if(video&&!matchMedia('(prefers-reduced-motion: reduce)').matches)video.play().catch(()=>{});
}
function groupData(){
  const academy=state.profile.academy;
  state.academyGroups??=[];
  let group=state.academyGroups.find(group=>group.academy===academy);
  if(!group){
    const known=/mouratoglou/i.test(academy)&&/(guadalajara|gdl)/i.test(academy);
    group={academy,address:known?'Ecónomos 6600, La Estancia, 45030 Zapopan, Jalisco, México':'',posts:[],messages:[]};
    state.academyGroups.push(group);
  }
  return group;
}
function datedPost(item){
  const time=new Date(item.at).toLocaleString('es-MX',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
  return `<article class="group-post"><small>${esc(item.author)} · ${esc(time)}</small>${item.title?`<h3>${esc(item.title)}</h3>`:''}<p>${esc(item.text)}</p></article>`;
}
function academyBoard(){
  const group=groupData();
  return `<section class="card" id="academic-board"><small class="eyebrow">Tablón de la academia</small><h2>Anuncios</h2>
  ${rainNotice()}<div class="group-feed">${group.posts.length?group.posts.slice().reverse().map(datedPost).join(''):'<p class="hint">Aquí aparecerán los avisos del coach, como cambios de cancha o de horario.</p>'}</div>
  ${role==='Coach'?'<button class="btn small" id="post-notice">Publicar anuncio</button>':''}</section>
   `;
}
function academyLocation(){
  const group=groupData(),q=encodeURIComponent(group.address);
  return `<section class="card" id="academic-map"><div class="row"><div><small class="eyebrow">Dónde entrenamos</small><h2>Ubicación de la academia</h2></div>${role==='Coach'?'<button id="edit-location" class="link">Editar sede</button>':''}</div>
  ${group.address?`<p>${esc(group.address)}</p><iframe title="Mapa de ${esc(group.academy)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${q}&amp;z=16&amp;output=embed"></iframe><a class="link" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&amp;query=${q}">Abrir en Google Maps ↗</a>`:'<p class="hint">La academia aún no ha añadido su sede. El coach puede indicar la dirección para mostrar el mapa.</p>'}</section>`;
}
function bindAcademy(){
  if(page!=='team')return;
  const group=groupData();
  if($('#club-edit'))$('#club-edit').onclick=()=>editClub(group);
  const film=$('.academy-backdrop video');
  if(film){
    film.onerror=()=>{film.hidden=true};
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches)film.play().catch(()=>{});
  }
  if($('#post-notice'))$('#post-notice').onclick=()=>modal('Anuncio para la academia',field('Título','title')+'<label class="full">Cancelar sesión por lluvia (opcional)<select name="cancelId"><option value="">Solo publicar aviso</option>'+state.sessions.filter(s=>!s.cancelled&&!s.done&&s.date>=localDay()).map(s=>'<option value="'+s.id+'">'+esc(s.date+' · '+s.time+' · '+s.title)+'</option>').join('')+'</select></label><label class="full">Aviso<textarea name="text" required maxlength="1000"></textarea></label>',data=>{
    if(!data.text.trim()||!data.title.trim()){toast('Escribe un título y un aviso.');return false}
    const cancelled=state.sessions.find(s=>String(s.id)===data.cancelId);
    if(cancelled){cancelled.cancelled=true;cancelled.cancelReason='Cancelada por lluvia';data.text+=' · '+cancelled.date+' · '+cancelled.time+' · '+cancelled.title+' (cancelada)'}
    group.posts.push({...data,author:'Coach',at:Date.now()});
  },'Publicar anuncio');
  if($('#edit-location'))$('#edit-location').onclick=()=>modal('Ubicación de la academia',field('Calle, número, ciudad y país','address',group.address),data=>{
    if(!data.address.trim()){toast('Escribe la dirección de la sede.');return false}
    group.address=data.address.trim();
  });
}
function groupInvite(value){
  if(!value)return '';
  const url=new URL(value);
  if(url.origin!=='https://chat.whatsapp.com'||url.username||url.password||!/^\/[A-Za-z0-9_-]+\/?$/.test(url.pathname))throw Error('Usa la invitación de chat.whatsapp.com del grupo.');
  return url.href;
}
function clubCover(group){
  const brand=group.brand||{};
  const poster=brand.cover||'assets/tennis-close-poster.jpg';
  const film=brand.video||(brand.cover?'':'assets/tennis-close.mp4');
  // El video (o la foto) de la academia queda de fondo en toda la página de Mi academia.
  return `<div class="academy-backdrop" aria-hidden="true"><img class="club-background" src="${esc(poster)}" alt="" onerror="this.hidden=true">${film?`<video class="club-background" muted loop playsinline preload="metadata" poster="${esc(poster)}" src="${esc(film)}"></video>`:''}</div>
  <section class="club-cover">
  <div class="club-identity">${brand.logo?`<img class="club-mark" alt="Logo de la academia" src="${esc(brand.logo)}">`:''}<small class="eyebrow">Mi academia</small><h1>${esc(group.academy)}</h1>
  <div class="club-actions">${brand.invite?`<a class="btn lime" href="${esc(brand.invite)}" target="_blank" rel="noopener noreferrer">Grupo de WhatsApp ↗</a>`:''}
  ${role==='Coach'?'<button id="club-edit" class="btn light small">Personalizar academia</button>':''}</div></div><a class="club-scroll" href="#academic-board" aria-label="Ver anuncios" title="Ver anuncios"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg></a></section>`;
}
function editClub(group){
  const old=group.brand||{};
  const input=(name,label,value)=>`<label class="full">${label}<input type="url" name="${name}" placeholder="https://…" value="${esc(value||'')}"></label>`;
  modal('Personalizar academia',input('logo','Logo · enlace a la imagen',old.logo)+input('cover','Foto de portada · enlace a la imagen',old.cover)+input('video','Video de portada · enlace directo al video (opcional)',old.video)+input('invite','Invitación al grupo de WhatsApp',old.invite),data=>{
    try{
      const brand={};
      for(const key of ['logo','cover','video']){
        const value=data[key].trim();if(value&&new URL(value).protocol!=='https:')throw Error('Usa enlaces HTTPS para la portada.');
        brand[key]=value;
      }
      brand.invite=groupInvite(data.invite.trim());
      group.brand=brand;if(!save()){group.brand=old;return false}
    }catch(error){toast(error.message);return false}
  });
}
````

## Archivo: `dist/dashboard-language.js`

````javascript
// Localize interface copy only; preserve member-entered names, notes and records.
const dashboardLabels=new Map(`Inicio|Home|Accueil
Mi plan|My plan|Mon programme
Mi progreso|My progress|Ma progression
Mi academia|My academy|Mon académie
Mensualidad|Monthly fees|Mensualité
Tu academia|Your academy|Votre académie
Academia|Academy|Académie
Panel del coach|Coach dashboard|Tableau du coach
Plan de la academia|Academy plan|Programme du club
Mis jugadores|My players|Mes joueurs
Citas|Meetings|Rendez-vous
Pagos privados|Private lesson payments|Paiements privés
Inicio familiar|Family dashboard|Espace famille
Agenda|Schedule|Calendrier
Avances|Progress|Progrès
Jugador|Player|Joueur
Tutor|Guardian|Parent
Cambiar|Switch|Changer
Mi perfil|My profile|Mon profil
Mi entrenamiento|My training|Mon entraînement
PRÓXIMA SESIÓN|NEXT SESSION|PROCHAINE SÉANCE
SESIÓN EN CURSO|SESSION IN PROGRESS|SÉANCE EN COURS
Sesión en curso|Session in progress|Séance en cours
Mi agenda|My schedule|Mon agenda
Confirmar asistencia|Confirm attendance|Confirmer ma présence
Asistencia confirmada|Attendance confirmed|Présence confirmée
Sin próximas sesiones|No upcoming sessions|Aucune séance à venir
Abrir mi plan|Open my plan|Ouvrir mon programme
Revisa tu plan para ver otras fechas.|Check your plan for other dates.|Consultez votre programme pour d’autres dates.
Físico|Fitness|Préparation physique
Tenis|Tennis|Tennis
Fuerza y estabilidad|Strength and stability|Force et stabilité
Gimnasio|Gym|Salle de sport
Foco|Focus|Priorité
Preparación física|Fitness training|Préparation physique
Ver sesión ↗|View session ↗|Voir la séance ↗
MI ACADEMIA|MY ACADEMY|MON ACADÉMIE
Avisos del equipo|Team notices|Annonces de l’équipe
Aviso de entrenamiento.|Training update.|Information sur l’entraînement.
AVISO DE EJEMPLO|SAMPLE NOTICE|EXEMPLE D’ANNONCE
Hoy|Today|Aujourd’hui
Cambio por lluvia|Rain update|Changement dû à la pluie
Ver sesión de gimnasio ↗|View gym session ↗|Voir la séance en salle ↗
Abrir tablón ↗|Open noticeboard ↗|Voir les annonces ↗
Esta semana|This week|Cette semaine
Mi plan ↗|My plan ↗|Mon programme ↗
Consistencia y profundidad|Consistency and depth|Régularité et profondeur
Cancelada por lluvia|Cancelled due to rain|Annulée pour cause de pluie
Programada|Scheduled|Programmée
En curso|In progress|En cours
Terminada|Session ended|Séance terminée
Completada|Completed|Terminée
Enfoque físico|Fitness focus|Objectif physique
Drills|Drills|Exercices
Ver indicaciones ↗|View instructions ↗|Voir les consignes ↗
Ver resumen ↗|View summary ↗|Voir le résumé ↗
Seguimiento del coach|Coach feedback|Suivi du coach
Tu balance del mes|Your monthly review|Votre bilan du mois
Ejemplo|Example|Exemple
Octubre 2026|October 2026|Octobre 2026
Lo que mejoraste|What you improved|Vos progrès
Tu siguiente ajuste|Your next adjustment|Votre prochain axe de travail
Ver mi progreso ↗|View my progress ↗|Voir ma progression ↗
Pendiente|Pending|En attente
Ver mensualidad ↗|View monthly fees ↗|Voir la mensualité ↗
Comunicación|Communication|Communication
Citas con la academia|Academy meetings|Rendez-vous avec l’académie
Reúnete con tu coach, el director o ambos para revisar tu entrenamiento.|Meet your coach, the director or both to discuss your training.|Rencontrez votre coach, le directeur ou les deux pour faire le point sur votre entraînement.
Agendar cita con…|Book a meeting with…|Prendre rendez-vous avec…
Ver mi academia ↗|View my academy ↗|Voir mon académie ↗
Pausar video|Pause video|Mettre la vidéo en pause
Reproducir video|Play video|Lire la vidéo
Academia de demostración|Demo academy|Académie de démonstration
Coach Alex (ejemplo)|Coach Alex (example)|Coach Alex (exemple)
CUENTA EN LA NUBE|CLOUD ACCOUNT|COMPTE DANS LE CLOUD
Tu acceso ya es real. Tus entrenamientos, por ahora, se guardan en este navegador.|Your login is real. Your training data is saved in this browser for now.|Votre accès est réel. Vos entraînements restent pour l’instant dans ce navigateur.
Tu juego, con dirección.|Your game, with direction.|Votre jeu, avec un cap.
MI AGENDA|MY SCHEDULE|MON CALENDRIER
Sin próximas sesiones|No upcoming sessions|Aucune séance à venir
Consulta tu plan para revisar otras fechas.|Check your plan for other dates.|Consultez votre programme pour voir les autres dates.
Abrir mi plan ↗|Open my plan ↗|Ouvrir mon programme ↗
Sin sesiones para este día.|No sessions on this day.|Aucune séance ce jour-là.
Plan de hoy|Today’s plan|Programme du jour
Entrenamientos del grupo|Group training|Entraînements du groupe
No hay sesiones programadas para hoy.|No sessions scheduled today.|Aucune séance prévue aujourd’hui.
Ver plan de la academia ↗|View academy plan ↗|Voir le programme du club ↗
Seguimiento|Player development|Suivi
Abre una ficha para revisar el objetivo y escribir una corrección individual.|Open a player profile to review their goal and give feedback.|Ouvrez une fiche pour consulter l’objectif du joueur et lui donner un conseil.
Revisar jugadores|Review players|Voir les joueurs
+ Crear sesión|+ Create session|+ Créer une séance
Horarios de atención|Meeting hours|Disponibilités
Ver pagos ↗|View payments ↗|Voir les paiements ↗
Último avance|Latest progress|Dernier progrès
Aún no hay evaluación del coach.|No coach assessment yet.|Aucune évaluation du coach pour le moment.
Ver avances ↗|View progress ↗|Voir les progrès ↗
Tu segundo saque entra con más regularidad, incluso cuando juegas con el marcador en contra.|Your second serve is more consistent, even when you are behind in the score.|Votre seconde balle est plus régulière, même lorsque vous êtes mené au score.
Dale más efecto al segundo saque para ganar margen sobre la red. En la próxima sesión, practica al cuerpo empezando en 30–40 y registra cuántos saques entran profundos.|Add spin to your second serve for more net clearance. Next session, start at 30–40, serve at the body and count how many serves land deep.|Ajoutez de l’effet à votre seconde balle pour passer plus haut au-dessus du filet. À la prochaine séance, commencez à 30–40, servez au corps et comptez les services qui retombent en profondeur.
Estabilidad del tronco e isometría|Core stability and isometric exercises|Stabilité du tronc et exercices isométriques
Peloteo cruzado con profundidad.|Deep cross-court rallies.|Échanges croisés en profondeur.
Semana|Week|Semaine
Semana anterior|Previous week|Semaine précédente
Semana siguiente|Next week|Semaine suivante
Próximo torneo|Next tournament|Prochain tournoi
Preparación|Preparation|Préparation
Afinar el juego|Fine-tune your game|Affiner le jeu
Últimos ajustes|Final adjustments|Derniers ajustements
Competencia|Competition|Compétition
Añadir torneo +|Add tournament +|Ajouter un tournoi +
días para competir|days until competition|jours avant la compétition
Cambiar perfil|Switch profile|Changer de profil
Abrir mi perfil|Open my profile|Ouvrir mon profil`.split('\n').map(row=>{const [es,en,fr]=row.split('|');return [es,[en,fr]]}));
// Free text typed by members. Fields picked from fixed option lists are left out
// on purpose: those values are interface copy and should still be translated.
function memberTexts(){
  const texts=new Set();
  const add=(item,...keys)=>{for(const key of keys){const v=item?.[key];if(typeof v==='string'&&v.trim())texts.add(v.trim())}};
  const demoSessions=[1,2,3,4,-101,-102];
  const archives=[state,...(state.agendaArchives||[])];
  for(const agenda of archives){
    (agenda.sessions||[]).forEach(s=>{if(!demoSessions.includes(s.id))add(s,'title','place','summary','notes','coach','gear','guide')});
    (agenda.competition||[]).forEach(c=>add(c,'name','place'));
    (agenda.comments||[]).forEach(c=>add(c,'text'));
    (agenda.videos||[]).forEach(v=>add(v,'title'));
    (agenda.exercises||[]).forEach(e=>add(e,'title','sets','notes'));
  }
  const profiles=[state.profile,...Object.values(state.accessProfiles||{})];
  const records=[{goals:state.goals,reviews:state.reviews},...Object.values(state.athletes||{})];
  records.forEach(r=>{
    if(r.profile)profiles.push(r.profile);
    (r.goals||[]).forEach(g=>add(g,'title','detail'));
    Object.values(r.reviews||{}).forEach(n=>add(n,'good','focus'));
  });
  profiles.forEach(p=>{
    add(p,'name','firstName','lastName','academy','goal','racket','preferences');
    add(p?.baseline,'strengths','priority');
    Object.values(p?.monthlyReviews||{}).forEach(n=>add(n,'good','focus','goal'));
  });
  (state.directory||[]).forEach(m=>add(m,'name','academy','bio','email','phone'));
  (state.academyGroups||[]).forEach(g=>{add(g,'academy','address');(g.posts||[]).forEach(p=>add(p,'title','text'))});
  (state.privateLessons||[]).forEach(b=>(b.students||[]).forEach(s=>add(s,'name')));
  add(state,'coachNote');
  return texts;
}
function dashboardText(text,mine=new Set()){
  if(coverLanguage==='es'||mine.has(text.trim()))return text;
  const index=coverLanguage==='fr'?1:0;
  function label(part){
    const clean=part.trim();
    if(mine.has(clean))return part;
    const value=dashboardLabels.get(clean)?.[index];
    if(value)return part.replace(clean,value);
    const rain=clean.match(/^Se cancela el entrenamiento de tenis de la mañana(?: de las (\d\d:\d\d))?\. Solo habrá preparación física en el gimnasio\.$/);
    if(rain)return index?`L’entraînement de tennis du matin${rain[1]?' de '+rain[1]:''} est annulé. Seule la préparation physique en salle est maintenue.`:`Morning tennis${rain[1]?' at '+rain[1]:''} is cancelled. Only fitness training in the gym will take place.`;
    if(clean.startsWith('Seguimiento de '))return (index?'Suivi de ':'Progress for ')+clean.slice(15);
    return part.replace(/Cancha (\d+)/g,index?'Court $1':'Court $1');
  }
  const exact=dashboardLabels.get(text.trim());
  return exact?text.replace(text.trim(),exact[index]):text.split(/( · | \/ )/).map(label).join('');
}
function translateDashboard(){
  if(coverLanguage==='es')return;
  const shell=document.querySelector('.shell');
  const mine=memberTexts();
  const walk=document.createTreeWalker(shell,NodeFilter.SHOW_TEXT);
  while(walk.nextNode()){
    const node=walk.currentNode;
    if(node.parentElement.closest('select,textarea,footer,svg'))continue;
    const next=dashboardText(node.data,mine);
    if(next!==node.data)node.data=next;
  }
  shell.querySelectorAll('[aria-label]').forEach(el=>{
    const original=el.getAttribute('aria-label');
    const next=dashboardText(original,mine);if(next!==original)el.setAttribute('aria-label',next);
  });
}
````

## Archivo: `dist/index.html`

````html
<!doctype html><html lang="es" data-theme="cancha"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0F3B2C"><title>CORDA · Tu juego, con dirección</title><link rel="stylesheet" href="styles/tokens.css?v=20261108d"><link rel="stylesheet" href="style.css?v=20261108d"><link rel="stylesheet" href="styles/sobre-corda.css?v=20261108d"><link rel="stylesheet" href="styles/ace.css?v=20261108d"></head><body><div id="app"></div><dialog id="modal" data-theme="arena"></dialog><div id="toast" role="status"></div><script src="dashboard-language.js?v=20261108d"></script><script src="resenas.js?v=20261108d"></script><script src="portada.js?v=20261108d"></script><script src="community.js?v=20261108d"></script><script src="session-guide.js?v=20261108d"></script><script src="annual-progress.js?v=20261108d"></script><script src="progress-hub.js?v=20261108d"></script><script src="meetings.js?v=20261108d"></script><script src="monthly-fees.js?v=20261108d"></script><script src="portal.js?v=20261108d"></script><script src="private-payments.js?v=20261108d"></script><script src="roles.js?v=20261108d"></script><script src="vendor/supabase-2.119.0.js"></script><script src="supabase-config.js?v=20261108d"></script><script src="auth.js?v=20261108d"></script><script src="sync.js?v=20261108d"></script><script src="sobre-corda.js?v=20261108d"></script><script src="app.js?v=20261108d"></script><script src="ace.js?v=20261108d"></script></body></html>
````

## Archivo: `dist/meetings.js`

````javascript
const meetingDays=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
function meetingHosts(){
  const registered=state.directory.filter(m=>m.academy===state.profile.academy&&['Coach','Director'].includes(m.role))
    .sort((a,b)=>(a.role==='Director'?0:1)-(b.role==='Director'?0:1)||a.name.localeCompare(b.name));
  if(registered.length)return registered;
  return [
    {id:'demo-director',name:'Andrea Flores',role:'Director',demo:true},
    {id:'demo-tenis',name:'Alex Rivera',role:'Coach',demo:true},
    {id:'demo-competencia',name:'Mar López',role:'Coach',demo:true}
  ];
}
function demoOfficeHours(host){
  const rules={};
  if(host.demo)for(const day of [1,2,3,4,5]){
    rules[day]={from:host.role==='Director'?'09:00':'10:00',to:host.role==='Director'?'12:00':'13:00'};
  }
  return rules;
}
function meetingBook(){
  const group=groupData();
  group.officeHours??={};group.meetings??=[];
  return group;
}
function clockMinutes(clock){return Number(clock.slice(0,2))*60+Number(clock.slice(3))}
function clockLabel(minutes){return [Math.floor(minutes/60),minutes%60].map(n=>String(n).padStart(2,'0')).join(':')}
function meetingSlots(date,hosts,group,now=new Date()){
  const day=new Date(date+'T12:00:00').getDay();
  const slots=[];
  for(let start=0;start<1440;start+=30){
    const time=clockLabel(start);
    if(new Date(date+'T'+time)<=now)continue;
    const statuses=hosts.map(host=>{
      const rule=(group.officeHours[host.id]??demoOfficeHours(host))[day];
      const busy=group.meetings.some(m=>m.date===date&&m.time===time&&(m.hosts.includes(host.id)||m.playerId===state.profile.memberId));
      return busy?'Ocupado':rule&&start>=clockMinutes(rule.from)&&start+30<=clockMinutes(rule.to)?'Disponible':'Sin atención';
    });
    if(statuses.some(s=>s!=='Sin atención'))slots.push({time,statuses,free:statuses.every(s=>s==='Disponible')});
  }
  return slots;
}
function meetingCard(){
  const group=meetingBook(),now=new Date();
  const upcoming=group.meetings.filter(m=>(role==='Coach'||m.playerId===state.profile.memberId)&&new Date(m.date+'T'+m.time)>=now)
    .sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  return `<section class="card meeting-card"><small class="eyebrow">Comunicación</small><h2>Citas con la academia</h2><p class="hint">Reúnete con tu coach, el director o ambos para revisar tu entrenamiento.</p>
  <button class="btn small" id="meet-start">Agendar cita con…</button>${role==='Coach'?'<button class="link" id="meet-hours">Horarios de atención</button>':''}
  ${upcoming.map(m=>`<div class="meeting-receipt"><small>${m.demo?'Cita de ejemplo':'Cita agendada'} · Presencial · ${esc(m.requesterRole)}</small><b>${dateLabel(m.date,{day:'numeric',month:'short'})} · ${esc(m.time)}</b><p>${esc(m.names.join(' y '))} · ${esc(m.requester)}</p><small>${esc(m.venue||group.academy)}</small></div>`).join('')}</section>`;
}
function meetingDialog(title,body){
  const dialog=$('#modal');
  dialog.innerHTML=`<div class="row"><h2>${title}</h2><button id="meet-close" aria-label="Cerrar">✕</button></div>${body}`;
  if(!dialog.open)dialog.showModal();
  $('#meet-close').onclick=()=>dialog.close();
  return dialog;
}
function officeHoursDialog(selectedId){
  const hosts=meetingHosts();
  const host=hosts.find(h=>h.id===selectedId)||hosts[0],group=meetingBook(),rules=group.officeHours[host.id]??demoOfficeHours(host);
  const options=Array.from({length:48},(_,i)=>clockLabel(30*i));
  const times=value=>options.map(t=>`<option ${value===t?'selected':''}>${t}</option>`).join('');
  meetingDialog('Horarios de atención',`<label class="meeting-person">Responsable<select id="office-owner">${hosts.map(h=>`<option value="${esc(h.id)}" ${h.id===host.id?'selected':''}>${esc(h.name)} · ${esc(h.role)}</option>`).join('')}</select></label>
  <p class="hint">Marca los días de juntas y la franja de atención semanal. Cada cita dura 30 minutos.</p><form id="office-form">${[1,2,3,4,5,6,0].map(d=>`<div class="office-row"><label><input type="checkbox" name="day-${d}" ${rules[d]?'checked':''}> ${meetingDays[d]}</label><select name="from-${d}" aria-label="Inicio ${meetingDays[d]}">${times(rules[d]?.from||'09:00')}</select><span>a</span><select name="to-${d}" aria-label="Fin ${meetingDays[d]}">${times(rules[d]?.to||'11:00')}</select></div>`).join('')}<button class="btn lime">Guardar horarios</button></form>`);
  $('#office-owner').onchange=e=>officeHoursDialog(e.target.value);
  $('#office-form').onsubmit=e=>{
    e.preventDefault();const data=new FormData(e.target),next={};
    for(let day=0;day<7;day++)if(data.has('day-'+day)){
      const from=data.get('from-'+day),to=data.get('to-'+day);
      if(from>=to){toast('Revisa el horario del '+meetingDays[day].toLowerCase()+'.');return}
      next[day]={from,to};
    }
    group.officeHours[host.id]=next;
    if(!save()){group.officeHours[host.id]=rules;return}
    $('#modal').close();render();toast('Horarios de atención guardados');
  };
}
function openMeetings(){
  const hosts=meetingHosts();
  const group=meetingBook(),chosen=new Set();
  let date=localDay(),weekStart=dateAfter(date,-((new Date(date+'T12:00:00').getDay()+6)%7)),slot='';
  function people(){
    meetingDialog('Agendar cita con…',`<p class="hint">Junta presencial · Paso 1 de 2. Selecciona los círculos de quienes quieres que asistan.<br>${hosts[0].demo?'Participantes y horarios de ejemplo para probar la reserva.':esc(state.profile.academy)}</p><div class="meet-people">${hosts.map(h=>`<button data-host="${esc(h.id)}" aria-pressed="${chosen.has(h.id)}"><i class="meet-circle" aria-hidden="true"></i>${avatar(h)}<span><strong>${esc(h.name)}</strong><small>${esc(h.role)}</small></span></button>`).join('')}</div><button id="meet-calendar" class="btn" ${chosen.size?'':'disabled'}>Ver calendario</button>`);
    document.querySelectorAll('[data-host]').forEach(b=>b.onclick=()=>{
      if(chosen.has(b.dataset.host))chosen.delete(b.dataset.host);else chosen.add(b.dataset.host);
      b.setAttribute('aria-pressed',String(chosen.has(b.dataset.host)));$('#meet-calendar').disabled=!chosen.size;
    });
    $('#meet-calendar').onclick=()=>{
      const selected=hosts.filter(h=>chosen.has(h.id));
      const today=localDay();
      date=today;
      for(let offset=0;offset<28;offset++){
        const candidate=dateAfter(today,offset);
        if(meetingSlots(candidate,selected,group).some(s=>s.free)){date=candidate;break}
      }
      weekStart=dateAfter(date,-((new Date(date+'T12:00:00').getDay()+6)%7));slot='';calendar();
    };
  }
  function calendar(){
    const selected=hosts.filter(h=>chosen.has(h.id)),today=localDay(),slots=meetingSlots(date,selected,group);
    const days=Array.from({length:7},(_,i)=>dateAfter(weekStart,i));
    const buttons=days.map(d=>{
      const rows=meetingSlots(d,selected,group);
      const label=d<today?'Pasado':rows.some(s=>s.free)?'Libre':rows.some(s=>s.statuses.includes('Ocupado'))?'Ocupado':'Sin horario';
      return `<button data-meet-day="${d}" aria-pressed="${d===date}" ${d<today?'disabled':''}><small>${dateLabel(d,{weekday:'short'})}</small><b>${Number(d.slice(8))}</b><small>${label}</small></button>`;
    }).join('');
    meetingDialog('Calendario de citas',`<p class="hint">${esc(selected.map(h=>h.name).join(' + '))} · 30 min · Hora local<br>Junta presencial en ${esc(group.academy)}${group.address?' · '+esc(group.address):''}.</p><div class="row"><button id="meet-prev" class="link" ${weekStart<=today?'disabled':''}>← Anterior</button><b>${dateLabel(weekStart,{month:'long',year:'numeric'})}</b><button id="meet-next" class="link">Siguiente →</button></div><div class="meet-week">${buttons}</div><h3>${dateLabel(date,{weekday:'long',day:'numeric',month:'long'})}</h3>
    <div class="meet-slots">${slots.map(s=>`<button data-meet-time="${s.time}" ${s.free?'':'disabled'} aria-pressed="${slot===s.time}"><b>${s.time}</b><small>${esc(selected.map((h,i)=>h.name+' · '+s.statuses[i]).join(' / '))}</small></button>`).join('')||'<p class="hint">No hay horarios de atención para esta fecha. Revisa otro día o semana.</p>'}</div>
    <div class="formactions"><button id="meet-back" class="link">← Integrantes</button><button class="btn lime" id="meet-confirm" ${slots.some(s=>s.free&&s.time===slot)?'':'disabled'}>Confirmar cita</button></div>`);
    $('#meet-back').onclick=people;
    for(const [id,offset] of [['meet-prev',-7],['meet-next',7]])$('#'+id).onclick=()=>{weekStart=dateAfter(weekStart,offset);date=weekStart<today?today:weekStart;slot='';calendar()};
    document.querySelectorAll('[data-meet-day]').forEach(b=>b.onclick=()=>{date=b.dataset.meetDay;slot='';calendar()});
    document.querySelectorAll('[data-meet-time]').forEach(b=>b.onclick=()=>{slot=b.dataset.meetTime;calendar()});
    $('#meet-confirm').onclick=()=>{
      if(!meetingSlots(date,selected,group).some(s=>s.free&&s.time===slot)){slot='';calendar();toast('Ese horario ya no está disponible.');return}
      group.meetings.push({id:newMemberId(),date,time:slot,hosts:[...chosen],names:selected.map(h=>h.name),playerId:state.profile.memberId,requester:actor().name,requesterRole:role,demo:selected.some(h=>h.demo),venue:group.academy});
      if(!save()){group.meetings.pop();return}
      $('#modal').close();render();toast('Cita agendada · '+slot);
    };
  }
  people();
}
function bindMeetingCard(){
  if($('#meet-start'))$('#meet-start').onclick=openMeetings;
  if($('#meet-hours'))$('#meet-hours').onclick=()=>officeHoursDialog();
}
````

## Archivo: `dist/monthly-fees.js`

````javascript
let feeMonth='';
function feeLedger(){
  const group=groupData();
  group.feePlayers??=[];
  const playerId=role==='Coach'&&page==='student-fees'?rosterDetail:state.profile.memberId;
  let ledger=group.feePlayers.find(item=>item.id===playerId);
  if(!ledger){
    ledger={id:playerId,code:'',months:{}};
    group.feePlayers.push(ledger);
    if(!state.legacyFeesImported){
      ledger.months={...state.billingHistory};
      if((state.receipt||state.payment==='Pagado'||state.payment==='En revisión')){
        ledger.months[state.billingMonth||localDay().slice(0,7)]={receipt:state.receipt,payment:state.payment};
      }
      delete state.billingHistory;delete state.receipt;delete state.payment;delete state.billingMonth;
      state.legacyFeesImported=true;
    }
  }
  return ledger;
}
function bankSettings(){
  const group=groupData();
  const known=/mouratoglou/i.test(group.academy)&&/guadalajara|gdl/i.test(group.academy);
  return group.feeBank||{bank:known?'Santander':'',holder:known?'GS SPORTS ACADEMY SA DE CV':'',account:'',clabe:''};
}
function feeStatus(ledger,key){
  return ledger.months[key]?.payment||(ledger.months[key]?.amount||key===localDay().slice(0,7)?'Pendiente':'Sin registro');
}
function feePage(){
  const current=localDay().slice(0,7),ledger=feeLedger(),bank=bankSettings();
  if(!feeMonth)feeMonth=current;
  const year=Number(feeMonth.slice(0,4)),row=ledger.months[feeMonth]||{},status=feeStatus(ledger,feeMonth);
  const months=Array.from({length:12},(_,i)=>{
    const key=year+'-'+String(i+1).padStart(2,'0'),value=feeStatus(ledger,key);
    const mark=value==='Pagado'?'✓':value==='En revisión'?'◷':'';
    return `<button data-fee-month="${key}" aria-pressed="${key===feeMonth}"><span class="fee-dot ${value==='Pagado'?'paid':value==='En revisión'?'review':''}" aria-hidden="true">${mark}</span><span><b>${dateLabel(key+'-01',{month:'long'})}</b><small>${value}</small></span></button>`;
  }).join('');
  return heading('Mensualidad','Consulta tu matrícula, adjunta el comprobante y revisa qué meses ya están pagados.')+
    `<section class="card"><div class="row"><h2>Mis pagos de ${year}</h2><div><button class="link" data-fee-year="${year-1}" aria-label="Año anterior">←</button><button class="link" data-fee-year="${year+1}" aria-label="Año siguiente">→</button></div></div><div class="fee-months">${months}</div></section>
    <div class="columns fee-detail"><section class="card"><small class="eyebrow">Mes seleccionado</small><h2>${dateLabel(feeMonth+'-01',{month:'long',year:'numeric'})}</h2><span class="badge">${status==='Pagado'?'✓ ':''}${status}</span><div class="metric">${row.amount?esc(Number(row.amount).toLocaleString('es-MX',{style:'currency',currency:'MXN'})):'Por definir'} <small>MXN</small></div>
    ${row.receipt?`<p class="hint">Comprobante · ${esc(row.receipt.name)}</p><a href="${esc(row.receipt.data)}" download="${esc(row.receipt.name)}">Descargar comprobante ↗</a>`:''}
    ${status!=='Pagado'?`<label class="fee-upload">Adjuntar comprobante a este mes<input type="file" id="fee-upload" accept="image/jpeg,image/png,application/pdf"><small>JPG, PNG o PDF · Hasta 1.5 MB</small></label>`:''}
    ${role==='Coach'&&row.receipt&&status==='En revisión'?'<button class="btn lime" id="fee-confirm">Confirmar pago recibido</button>':''}</section>
    <section class="card"><div class="row"><h2>Cómo pagar</h2>${role==='Coach'?'<button id="fee-config" class="link">Configurar</button>':''}</div>
    <ol class="fee-steps"><li>Selecciona el mes y revisa el importe indicado por tu academia.</li><li>Transfiere el importe en MXN a la cuenta indicada abajo. En el concepto o referencia escribe <strong>únicamente tu matrícula de 7 caracteres</strong>, incluidos los ceros iniciales. Un concepto distinto puede ocasionar el rechazo del pago.</li><li>Sube el comprobante al mes que pagaste. Cuando administración verifique el ingreso, verás una palomita verde junto a ese mes.</li></ol>
    <div class="fee-reference"><small>Tu matrícula personal</small><b>${esc(ledger.code||'Pendiente de asignar')}</b></div>
    <dl class="bank-info">${[['Banco',bank.bank],['Beneficiario',bank.holder],['Número de cuenta',bank.account],['CLABE',bank.clabe]].map(([k,v])=>`<dt>${k}</dt><dd>${esc(v||'Pendiente de configurar')}</dd>`).join('')}</dl>
    ${!ledger.code||!(bank.account||bank.clabe)?'<p class="hint">Solicita a administración los datos pendientes antes de transferir.</p>':''}</section></div>`;
}
function updateFeeRow(ledger,key,patch){
  const previous=ledger.months[key];
  ledger.months[key]={...previous,...patch};
  if(save())return true;
  if(previous)ledger.months[key]=previous;else delete ledger.months[key];
  return false;
}
function bindFees(){
  if(!['payments','student-fees'].includes(page))return;
  const ledger=feeLedger(),key=feeMonth;
  document.querySelectorAll('[data-fee-month]').forEach(b=>b.onclick=()=>{feeMonth=b.dataset.feeMonth;render()});
  document.querySelectorAll('[data-fee-year]').forEach(b=>b.onclick=()=>{feeMonth=b.dataset.feeYear+key.slice(4);render()});
  const upload=$('#fee-upload');
  if(upload)upload.onchange=async()=>{
    const f=upload.files[0];if(!f)return;
    if(f.size>1.5*1024*1024||!['image/jpeg','image/png','application/pdf'].includes(f.type)){toast('Elige un JPG, PNG o PDF menor de 1.5 MB.');upload.value='';return}
    upload.disabled=true;
    try{
      const receipt={name:f.name,data:await readFile(f)};
      if(ledger.months[key]?.payment==='Pagado')return;
      if(updateFeeRow(ledger,key,{payment:'En revisión',receipt})){render();toast('Comprobante recibido para '+dateLabel(key+'-01',{month:'long',year:'numeric'}))}
    }catch{toast('No se pudo leer el comprobante.')}finally{upload.disabled=false}
  };
  if($('#fee-confirm'))$('#fee-confirm').onclick=()=>{
    if(role==='Coach'&&ledger.months[key]?.receipt&&updateFeeRow(ledger,key,{payment:'Pagado'})){render();toast('Pago confirmado')}
  };
  if($('#fee-config'))$('#fee-config').onclick=()=>{
    const bank=bankSettings(),group=groupData();
    const inputs=[['Matrícula del jugador (7 caracteres)','code',ledger.code],['Importe de este mes (MXN)','amount',ledger.months[key]?.amount],['Banco','bank',bank.bank],['Beneficiario','holder',bank.holder],['Número de cuenta','account',bank.account],['CLABE (18 dígitos)','clabe',bank.clabe]];
    modal('Datos de mensualidad',inputs.map(([label,name,v])=>field(label,name,v||'','text',false)).join(''),data=>{
      const code=data.code.trim(),amount=data.amount.trim(),clabe=data.clabe.trim();
      if(code&&!/^[a-z0-9]{7}$/i.test(code)){toast('La matrícula debe tener siete letras o números.');return false}
      if(amount&&(!/^\d+(\.\d{1,2})?$/.test(amount)||Number(amount)<=0)){toast('Revisa el importe en MXN.');return false}
      if(clabe&&!/^\d{18}$/.test(clabe)){toast('La CLABE debe tener 18 dígitos.');return false}
      const oldCode=ledger.code,oldBank=group.feeBank;
      ledger.code=code;group.feeBank={bank:data.bank.trim(),holder:data.holder.trim(),account:data.account.trim(),clabe};
      if(!updateFeeRow(ledger,key,{amount})){ledger.code=oldCode;group.feeBank=oldBank;return false}
    });
  };
}
````

## Archivo: `dist/movil.html`

````html
<!doctype html><html lang="es" data-theme="cancha"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CORDA · Vista móvil</title><link rel="stylesheet" href="styles/tokens.css?v=20261108d"><style>
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap");
*{box-sizing:border-box}body{margin:0;background:var(--surface);color:var(--ink);font-family:var(--font-sans);font-size:var(--body-size);line-height:var(--body-line)}
.preview{max-width:960px;margin:0 auto;padding:var(--space-8) var(--space-4);display:flex;gap:var(--space-12);align-items:flex-start;justify-content:center}
.intro{max-width:288px;padding-top:var(--space-12)}
.wordmark{font-family:var(--font-display);font-size:var(--h2-size);line-height:var(--h2-line);font-weight:700;letter-spacing:var(--logo-tracking)}.wordmark span{color:var(--logo-dot)}
h1{font-family:var(--font-display);font-size:var(--h1-size);line-height:var(--h1-line);font-weight:var(--h1-weight);letter-spacing:var(--h1-tracking);margin:var(--space-6) 0 var(--space-3)}
p{margin:0 0 var(--space-4)}
.sizes{display:flex;flex-wrap:wrap;gap:var(--space-2)}
button,a{font:inherit}
button{min-height:48px;padding:0 var(--space-4);background:transparent;color:var(--ink);border:1px solid var(--line);border-radius:var(--radius-md);font-size:var(--label-size);font-weight:var(--label-weight);cursor:pointer}
button[aria-pressed=true]{background:var(--verde-medio);border-color:var(--verde-medio)}
:where(a,button):focus-visible{outline:2px solid var(--focus-ring);outline-offset:2px}
.device{background:var(--verde-noche);border:1px solid var(--line);border-radius:var(--radius-lg);padding:var(--space-2);width:406px;max-width:100%;flex:none}
.device iframe{display:block;border:0;border-radius:var(--radius-md);width:100%;height:min(844px,calc(100dvh - 72px));min-height:420px;background:var(--surface)}
.full{display:inline-block;margin-top:var(--space-4);color:var(--ink);font-size:var(--label-size);font-weight:var(--label-weight)}
.note{font-size:var(--caption-size);line-height:var(--caption-line);color:var(--ink-muted)}
@media(max-width:700px){.preview{display:block;padding:0}.intro{padding:var(--space-3) var(--space-4);max-width:none;display:flex;justify-content:space-between;align-items:center}.intro h1,.intro p,.sizes{display:none}.full{margin:0}.device{width:100%!important;padding:0;border:0;border-radius:0}.device iframe{border-radius:0;height:calc(100dvh - 48px);min-height:0}}
</style></head><body><main class="preview"><section class="intro"><div class="wordmark">CORDA<span>.</span></div><h1>Portal del jugador en móvil</h1><p>Prueba la agenda con el pulgar. Abre tu próxima sesión y revisa qué necesitas llevar.</p><div class="sizes" aria-label="Ancho de pantalla"><button data-width="360" aria-pressed="false">360 px</button><button data-width="390" aria-pressed="true">390 px</button><button data-width="430" aria-pressed="false">430 px</button></div><a class="full" href="./?vista=jugador-movil">Abrir a pantalla completa ↗</a><p class="note">Perfil de ejemplo. Los cambios de esta vista se reinician al recargar.</p></section><div class="device"><iframe title="Portal móvil interactivo de CORDA" src="./?vista=jugador-movil"></iframe></div></main><script>
document.querySelectorAll('[data-width]').forEach(button=>button.onclick=()=>{document.querySelector('.device').style.width=(Number(button.dataset.width)+16)+'px';document.querySelectorAll('[data-width]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)))});
</script></body></html>
````

## Archivo: `dist/portada.js`

````javascript
let coverLanguage='es';
try { const saved=localStorage.getItem('corda-cover-language');if(['en','fr'].includes(saved))coverLanguage=saved; } catch {}
const coverText=(es,en,fr)=>coverLanguage==='es'?es:coverLanguage==='fr'?fr:en;
function coverSections(){
  const t=coverText;
  const questions=[
    [t('¿A quién va dirigida CORDA?','Who is CORDA for?',"À qui s’adresse CORDA ?"),t('A academias de tenis. Los jugadores consultan su plan, los coaches organizan las sesiones y los tutores acompañan el progreso del jugador a su cargo.','Tennis academies. Players follow their plans, coaches organize sessions, and guardians follow the progress of the player in their care.',"Aux académies de tennis. Les joueurs consultent leur programme, les coachs organisent les séances et les parents suivent la progression de leur joueur.")],
    [t('¿Dónde veo mi próximo entrenamiento?','Where can I find my next session?',"Où trouver mon prochain entraînement ?"),t('En Inicio, toca «Ver sesión» para consultar la hora, el lugar, quién te entrena y qué necesitas llevar.','On the player dashboard, tap “Ver sesión” for the time, location, coach and equipment to bring.',"Depuis l’accueil, ouvrez la prochaine séance pour consulter l’heure, le lieu, le coach et le matériel à apporter.")],
    [t('¿Puedo probarla desde mi teléfono?','Can I try it on my phone?',"Puis-je essayer CORDA sur mon téléphone ?"),t('Sí. Abre la demo del jugador desde tu navegador. Puedes explorar el calendario y las observaciones del coach sin registrarte.','Yes. Open the player demo in your browser to explore the calendar and coach feedback without registering.',"Oui. Ouvrez la démo dans votre navigateur pour explorer le calendrier et les observations du coach sans vous inscrire.")],
    [t('¿Qué se guarda en el prototipo?','What does the prototype save?',"Que conserve le prototype ?"),t('Los perfiles de prueba guardan sus cambios en el navegador que usas. La demo rápida se reinicia al recargar. Por ahora, los cambios de un coach no se sincronizan con otros teléfonos.','Test profiles save changes in the browser you use. The quick demo resets when you reload. Coach updates do not yet sync across devices.',"Les profils de test enregistrent les changements dans ce navigateur. La démo rapide se réinitialise au rechargement. Les modifications du coach ne sont pas encore synchronisées entre appareils.")],
    [t('¿Cómo puede mi academia probar CORDA?','How can my academy try CORDA?',"Comment mon académie peut-elle essayer CORDA ?"),t('Escríbenos a corda.tenis@gmail.com con el nombre de tu academia y cómo organizan sus entrenamientos.','Email corda.tenis@gmail.com with your academy’s name and how you currently organize training.',"Écrivez à corda.tenis@gmail.com en indiquant le nom de votre académie et comment vous organisez vos entraînements.")]
  ];
  return `<section class="cover-mission" aria-labelledby="mission-title"><small class="eyebrow">CORDA · Guadalajara</small><h2 id="mission-title">${t('Nuestra misión','Our mission',"Notre mission")}</h2><p>${t('Que cada jugador llegue a la cancha con un objetivo claro y salga sabiendo qué trabajar después. En CORDA conectamos el plan de la academia con las indicaciones del coach para dar continuidad a cada entrenamiento.','We want every player to step onto the court with a clear goal and leave knowing what to work on next. CORDA connects each academy’s training plan with coach feedback so every session builds on the last.',"Que chaque joueur entre sur le court avec un objectif clair et sache quoi travailler après sa séance. CORDA relie le programme de l’académie aux conseils du coach pour donner une continuité à chaque entraînement.")}</p><p><button type="button" class="btn" data-open-about>${t('Conoce nuestra misión, visión y valores','Our mission, vision and values','Notre mission, notre vision et nos valeurs')}</button></p></section>
  ${reviewsSection()}
  <section class="founder-story" id="fundador" aria-labelledby="founder-title">
    <div class="founder-frame"><span class="brand" aria-hidden="true">CORDA<span>.</span></span><small>${t('Video del fundador · Próximamente','Founder video · Coming soon','Vidéo du fondateur · À venir')}</small></div>
    <div class="founder-copy"><h2 id="founder-title">${t('Del fundador','From the founder','Le mot du fondateur')}</h2>
    <p>${t('Como tenista, siempre he valorado las conversaciones con mi coach sobre qué quiero lograr y cómo prepararme para ello. De esas conversaciones nació la idea de crear CORDA, un espacio donde cada jugador y su coach puedan definir sus objetivos juntos.','As a tennis player, I have always valued the conversations with my coach about what I want to achieve and how to prepare for it. Those conversations inspired CORDA, a place where players and coaches can set goals together.','En tant que joueur de tennis, j’ai toujours apprécié les échanges avec mon coach sur mes ambitions et la manière de m’y préparer. De ces échanges est née CORDA, un espace où chaque joueur peut définir ses objectifs avec son coach.')}</p>
    <p>${t('Creé CORDA para que ambos puedan vincular el trabajo en cancha y la preparación física con esos objetivos, reconocer los avances y decidir qué trabajar en la siguiente sesión.','I created CORDA so they can connect time on court and physical training to those goals, recognize progress and decide what to work on in their next session.','J’ai créé CORDA pour leur permettre de relier le travail sur le court et la préparation physique à ces objectifs, de reconnaître les progrès et de choisir ensemble le prochain point à travailler.')}</p>
    <strong>Leonardo Arenas</strong><small>${t('Fundador de CORDA y tenista','CORDA founder and tennis player','Fondateur de CORDA et joueur de tennis')}</small></div>
  </section>
  <section class="cover-faq" id="preguntas" aria-labelledby="faq-title"><h2 id="faq-title">${t('Preguntas frecuentes','Frequently asked questions',"Questions fréquentes")}</h2>${questions.map(([q,a],i)=>`<details><summary>${q}</summary><p>${a}${i===2?` <a href="./?vista=jugador-movil">${t('Abrir demo','Open demo',"Ouvrir la démo")} ↗</a>`:''}</p></details>`).join('')}</section>`;
}
function coverSelector(){
 return `<label class="cover-language"><span aria-hidden="true">◎</span><select id="cover-language" aria-label="Idioma / Language / Langue"><option value="es" ${coverLanguage==='es'?'selected':''}>Español</option><option value="en" ${coverLanguage==='en'?'selected':''}>English</option><option value="fr" ${coverLanguage==='fr'?'selected':''}>Français</option></select></label>`;
}
function bindCoverLanguage(refresh){
 document.documentElement.lang=coverLanguage;
 const film=document.querySelector('#welcome-film');if(film?.onplay)film.onplay();
 document.querySelector('#cover-language').onchange=e=>{
   coverLanguage=e.target.value;
   try{localStorage.setItem('corda-cover-language',coverLanguage)}catch{}
   refresh();document.querySelector('#cover-language')?.focus();
 };
}
````

## Archivo: `dist/portal.js`

````javascript
const pathways = [
  ['Club social', 'Juego por gusto y disfruto los partidos del club.'],
  ['Circuito competitivo', 'Entreno para ligas, torneos y partidos oficiales.'],
  ['Junior de proyección', 'Compito en categorías juveniles y preparo mi salto al siguiente nivel.'],
  ['Ruta profesional', 'Mi calendario gira alrededor del circuito profesional.']
];
const identities = [
  ['Atacante de fondo','Busco dominar el punto con mi derecha o mi revés.'],
  ['Contragolpeador','Defiendo, recupero terreno y aprovecho la oportunidad.'],
  ['Constructor de puntos','Cambio alturas y direcciones hasta abrir espacio.'],
  ['Jugador de red','Subo a la red para cerrar con una volea.'],
  ['Todoterreno','Adapto mi plan a la superficie y al rival.'],
  ['Por descubrir','Quiero definir mi estilo con mi coach.']
];
function localDay(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-');
}
function dateAfter(date, days) {
  const result = new Date(date+'T12:00:00'); result.setDate(result.getDate()+days); return localDay(result);
}
function dateLabel(date, options) {
  return new Date(date+'T12:00:00').toLocaleDateString(({es:'es-MX',en:'en-US',fr:'fr-FR'})[coverLanguage],options);
}
function birthInput(value) {
  return '<label>Fecha de nacimiento<input type="date" name="birthDate" required autocomplete="bday" min="1900-01-01" max="'+localDay()+'" value="'+esc(value||'')+'"></label>';
}
function utrInput(value) {
  return '<label class="utr-field">UTR individual <span class="optional">(opcional)</span><input name="utr" inputmode="decimal" type="number" min="1" max="16.5" step="0.01" value="'+esc(value??'')+'" placeholder="Ej. 3.00" aria-describedby="utr-tip"></label><small id="utr-tip">De 1.00 a 16.50. Puedes dejarlo en blanco.</small>';
}
function activeOptions(options, value) {
  const names=options.map(([name])=>name);
  return value && !names.includes(value) ? [value,...names] : names;
}
function initAgenda() {
  const today=localDay();
  state.weekStart ??= dateAfter(today,-((new Date(today+'T12:00:00').getDay()+6)%7));
  state.chat ??= [];
  state.reviews ??= {};
  state.sessions.forEach(s=>{
    s.date ??= dateAfter(state.weekStart,s.day);
    if(s.id===2 && s.title==='Fuerza y estabilidad') {
      s.summary ??= 'Estabilidad del tronco e isometría';
    }
  });
  prepareRainExample(today);
  state.exampleTournament ??= {name:'Copa de preparación',place:'Sede de muestra',date:dateAfter(today,21),start:today};

}
function sessionsFor(date) {
  return state.sessions.filter(s=>s.date===date).sort((a,b)=>a.time.localeCompare(b.time));
}
function sessionTimes(session){
  const start=new Date(session.date+'T'+session.time).getTime();
  return {start,end:start+Number(session.duration)*60000};
}
function sessionStatus(session,now=Date.now()){
  if(session.cancelled)return session.cancelReason||'Cancelada por lluvia';
  if(session.done)return 'Completada';
  const {start,end}=sessionTimes(session);
  if(now>=end)return 'Terminada';
  return now>=start?'En curso':'Programada';
}
function sessionTitle(session){
  const closed=session.cancelled||session.done||Date.now()>=sessionTimes(session).end;
  return closed?'<s class="past-session">'+esc(session.title)+'</s>':esc(session.title);
}
// Foto de fondo de la tarjeta de la próxima sesión, según lo que se entrena.
// Primero busca en el título; si no encuentra nada, en el resumen y las notas.
// Las categorías más específicas van antes que "fuerza", que es la general.
const SESSION_PHOTOS=[
  ['sesiones/pliometria.jpg',/pliom|pilom|salto|multisalto|box jump|explosiv/],
  ['sesiones/isometria.jpg',/isom[eé]tr|estabilidad|plancha|core|tronco|abdom/],
  ['sesiones/movilidad.jpg',/movilidad|estira|flexibilidad|elasticidad|yoga|recuperaci|calentamiento/],
  ['sesiones/agilidad.jpg',/agilidad|escalera|velocidad|coordinaci|desplazamiento|footwork|reacci|conos/],
  ['sesiones/cardio.jpg',/cardio|resistencia|carrera|correr|sprint|aer[oó]bic|intervalo/],
  ['sesiones/fuerza.jpg',/fuerza|pesa|mancuerna|sentadilla|press|potencia|gimnasio|gym/]
];
function sessionPhoto(session){
  if(session.type!=='Físico')return 'tennis-close-poster.jpg';
  const sources=[session.title,[session.summary,session.guide,session.notes].filter(Boolean).join(' ')];
  for(const text of sources){
    const words=String(text||'').toLowerCase();
    const hit=SESSION_PHOTOS.find(([,pattern])=>pattern.test(words));
    if(hit)return hit[0];
  }
  return 'sesiones/fuerza.jpg';
}
let clockTimer;
function scheduleAgendaClock(){
  clearTimeout(clockTimer);
  if(entry!=='app'||!['home','calendar','training','gym'].includes(page))return;
  const now=Date.now();
  const transitions=state.sessions.filter(s=>!s.done&&!s.cancelled).flatMap(s=>Object.values(sessionTimes(s))).filter(time=>time>now);
  if(!transitions.length)return;
  clockTimer=setTimeout(()=>{
    if(entry==='app'&&['home','calendar','training','gym'].includes(page))render();
  },Math.min(Math.min(...transitions)-now+20,2147483600));
}
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&typeof render==='function'&&typeof state!=='undefined'&&entry==='app'&&['home','calendar','training','gym'].includes(page))render();
});
function sessionSummary(s) {
  return '<article class="agenda-event"><div class="event-clock"><b>'+esc(s.time)+'</b><small>'+esc(s.duration)+' min</small></div><div><span class="badge '+(s.type==='Físico'?'clay':'')+'">'+esc(s.type)+'</span><h3>'+sessionTitle(s)+'</h3><small>'+esc(sessionStatus(s))+'</small><p>'+esc(state.profile.academy)+' · '+esc(s.place)+' · '+esc(sessionCoach(s))+'</p><p><strong>'+(s.type==='Físico'?'Enfoque físico':'Drills')+'</strong> · '+esc(s.summary||s.notes.split('. ')[0])+'</p><button class="link" data-session="'+s.id+'">'+(s.done?'Ver resumen':'Ver indicaciones')+' ↗</button></div></article>';
}
function calendarStrip(date) {
  const monday=dateAfter(date,-((new Date(date+'T12:00:00').getDay()+6)%7));
  return '<div class="days-strip">'+Array.from({length:7},(_,i)=>{
    const d=dateAfter(monday,i);return '<button class="'+(d===date?'chosen':'')+'" data-agenda-date="'+d+'" aria-pressed="'+(d===date)+'"><small>'+dateLabel(d,{weekday:'short'})+'</small><b>'+Number(d.slice(8))+'</b><i class="'+(sessionsFor(d).length?'booked':'')+'"></i></button>';
  }).join('')+'</div>';
}
function tournamentCard() {
  const today=localDay();
  const listed=state.competition.filter(c=>c.date>=today).sort((a,b)=>a.date.localeCompare(b.date));
  const demo=!state.competition.length;
  const c=listed[0]||(demo&&state.exampleTournament.date>=today?state.exampleTournament:null);
  if(!c)return '<section class="card"><h2>Próximo torneo</h2><p class="hint">Elige tu siguiente competencia para empezar la cuenta regresiva.</p><button class="btn small" id="competition">Añadir torneo</button></section>';
  const days=Math.round((Date.parse(c.date)-Date.parse(today))/86400000);
  const start=c.start||today;
  const phases=[['Preparación',start],['Afinar el juego',dateAfter(c.date,-7)<start?start:dateAfter(c.date,-7)],['Últimos ajustes',dateAfter(c.date,-2)<start?start:dateAfter(c.date,-2)],['Competencia',c.date]];
  const current=phases.reduce((result,[,date],i)=>date<=today?i:result,0);
  return '<section class="card tournament"><div class="row"><small class="eyebrow">Próximo torneo'+(demo?' · Ejemplo':'')+'</small><button id="competition" class="link">Añadir torneo +</button></div><h2>'+esc(c.name)+'</h2><p>'+esc(c.place)+' · '+dateLabel(c.date,{day:'numeric',month:'long'})+'</p><div class="countdown">'+(days?days+' <small>días para competir</small>':'Hoy compites')+'</div><ol class="tourney-road">'+phases.map(([name,date],i)=>'<li class="'+(i<=current?'reached ':'')+(i===current?'current':'')+'"><i></i><b>'+name+'</b><small>'+dateLabel(date,{day:'numeric',month:'short'})+'</small></li>').join('')+'</ol></section>';
}
let agendaDate=localDay();
function nearestSession(now = new Date()){
  return state.sessions.filter(s=>{
    const start=new Date(s.date+'T'+s.time);
    return !s.cancelled && !s.done && start.getTime()+Number(s.duration)*60000>now.getTime();
  }).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))[0];
}
function sessionGear(session){
  return session.gear||(session.type==='Físico'?'Tenis de entrenamiento y botella de agua':'Raqueta, tenis de cancha y botella de agua');
}
// Tarjeta de próxima sesión: día, tipo, "hora · cancha · coach", qué llevar y un CTA.
function nextSessionCard(){
  const session=nearestSession();
  if(!session)return '<section class="next-card"><small>Mi agenda</small><h3>Sin próximas sesiones</h3><p>Revisa tu plan para ver otras fechas.</p><div class="next-actions"><button class="next-confirm" data-page="calendar">Abrir mi plan</button></div></section>';
  const live=new Date(session.date+'T'+session.time)<=new Date();
  const day=live?'Sesión en curso':dateLabel(session.date,{weekday:'long',day:'numeric',month:'long'});
  return `<section class="next-card next-photo"><img class="activity-photo" src="assets/${sessionPhoto(session)}" alt="" onerror="this.hidden=true"><small>${esc(day)}</small><h3>${esc(session.type)} · ${esc(session.title)}</h3>
  <p class="next-meta">${esc(session.time)} · ${esc(session.place)} · ${esc(sessionCoach(session))}</p><p>Lleva: ${esc(sessionGear(session))}</p>
  <div class="next-actions"><button class="next-confirm" data-confirm-session="${session.id}" aria-pressed="${!!session.confirmed}">${session.confirmed?'Asistencia confirmada':'Confirmar asistencia'}</button><button class="link" data-session="${session.id}">Ver sesión ↗</button></div></section>`;
}
function playerHome(){
  const today=localDay(),sessions=sessionsFor(agendaDate);
  const competing=state.profile.level!=='Club social'&&state.competition.some(c=>c.date>=today);
  const notice=groupData().posts.at(-1);
  const notices=`<section class="card"><small class="eyebrow">Mi academia</small><h2>Avisos del equipo</h2><p class="hint">${esc(notice?.title||'Aviso de entrenamiento.')}</p>${rainNotice()}<button class="link" data-page="team">Abrir tablón ↗</button></section>`;
  const payment=`<section class="card"><small class="eyebrow">Mensualidad · ${dateLabel(today,{month:'long'})}</small><h2>${esc(feeStatus(feeLedger(),today.slice(0,7)))}</h2><button data-page="payments" class="link">Ver mensualidad ↗</button></section>`;
  const side=role==='Tutor'?payment:competing?tournamentCard():notices;
  return heading(role==='Coach'?'Plan de entrenamiento':role==='Tutor'?'Agenda del jugador':'Mi entrenamiento',dateLabel(today,{weekday:'long',day:'numeric',month:'long'})+' · '+esc(state.profile.academy),role==='Coach'?'<button id="newsession" class="btn">+ Crear sesión</button>':'')+
    (role==='Jugador'?checkinBanner():'')+'<div class="portal-grid">'+nextSessionCard()+side+'</div><div class="flow-week"><section class="agenda-main"><div class="row"><h2>Esta semana</h2><button class="link" data-page="calendar">Mi plan ↗</button></div>'+calendarStrip(agendaDate)+'<h3>'+dateLabel(agendaDate,{weekday:'long',day:'numeric'})+'</h3>'+(sessions.map(sessionSummary).join('')||'<p class="hint">Sin sesiones para este día.</p>')+'</section>'+monthlyReviewCard()+'</div>'+
    '<div class="flow-week">'+(role==='Tutor'?notices:competing?payment+notices:payment)+meetingCard()+'</div>'+playerBanner();
}
function planTabs(){
  return '<nav class="plan-tabs" aria-label="Secciones de mi plan">'+[['calendar','Semana'],['training','Tenis'],['gym','Físico']].map(([id,title])=>'<button aria-pressed="'+(id===page)+'" data-page="'+id+'">'+title+'</button>').join('')+'</nav>';
}
function progressPage(){
  return heading('Mi progreso',esc(state.profile.name)+' · '+esc(state.profile.academy))+progressHub(state.profile.memberId,state.profile.goal);
}
function bindPortal() {
  bindAnnual();
  bindProgressHub();
  setTimeout(maybePromptCheckin,0);
  scheduleAgendaClock();
  document.querySelectorAll('[data-agenda-date]').forEach(button=>button.onclick=()=>{agendaDate=button.dataset.agendaDate;render()});
  const baselineButton=$('#baseline-edit');
  if(baselineButton)baselineButton.onclick=()=>{
    const base=state.profile.baseline||{};
    modal('Evaluación inicial','<label class="full">Fortalezas<textarea required name="strengths" maxlength="600">'+esc(base.strengths)+'</textarea></label><label class="full">Primer aspecto a mejorar<textarea required name="priority" maxlength="600">'+esc(base.priority)+'</textarea></label>',data=>{state.profile.baseline={...data,date:base.date||localDay()}});
  };
  const reviewButton=$('#review-today'),today=localDay();
  if(reviewButton)reviewButton.onclick=()=>{
    const r=state.reviews[today]||{};
    const options=sessionsFor(today).map(s=>'<option value="'+s.id+'" '+(String(s.id)===String(r.sessionId)?'selected':'')+'>'+esc(s.time+' · '+s.title)+'</option>').join('');
    modal('Evaluación de hoy','<label class="full">Entrenamiento<select name="sessionId"><option value="">Revisión del día</option>'+options+'</select></label><label class="full">Lo que salió bien<textarea name="good" required maxlength="600">'+esc(r.good)+'</textarea></label><label class="full">Qué trabajar en la próxima sesión<textarea name="focus" required maxlength="600">'+esc(r.focus)+'</textarea></label>',data=>{state.reviews[today]=data});
  };
  document.querySelectorAll('[data-confirm-session]').forEach(button=>button.onclick=()=>{
    const session=state.sessions.find(s=>String(s.id)===button.dataset.confirmSession);if(!session)return;
    session.confirmed=!session.confirmed;save();render();
    toast(session.confirmed?'Asistencia confirmada · '+session.time+' · '+session.place+'.':'Confirmación retirada.');
  });
  bindMeetingCard();
}
function calendarPage() {
  const events=sessionsFor(agendaDate);
  const tournaments=[...state.competition].sort((a,b)=>String(a.date).localeCompare(String(b.date))),upcoming=tournaments.filter(c=>String(c.date)>=localDay());
  return heading('Mi plan',dateLabel(agendaDate,{month:'long',year:'numeric'}),role==='Coach'?'<button class="btn lime" id="newsession">+ Crear sesión</button>':'')+
    '<section class="card plan-competitions"><div class="sectiontitle"><h2>Competencias</h2><button class="link" id="competition">+ Añadir torneo</button></div>'+(upcoming.length?'<ol class="comp-list">'+upcoming.map((c,i)=>{const days=Math.round((Date.parse(c.date)-Date.parse(localDay()))/864e5),when=days===0?'hoy':days===1?'mañana':'en '+days+' días';return '<li class="comp-item'+(i===0?' is-next':'')+'" style="--fade:'+Math.max(.45,1-i*.2)+'">'+(i===0?'<small class="eyebrow">Próximo torneo · '+when+'</small>':'')+'<h3>'+esc(c.name)+'</h3><p>'+esc(c.place)+' · '+dateLabel(c.date,{day:'numeric',month:'long',year:'numeric'})+'</p></li>'}).join('')+'</ol>':'<p class="hint">'+(tournaments.length?'No tienes torneos próximos. ':'')+'Añade un torneo para seguir tu preparación.</p>')+'</section>'+
    '<section class="agenda-main"><div class="row"><button class="link" data-agenda-date="'+dateAfter(agendaDate,-7)+'">← Semana anterior</button><button class="link" data-agenda-date="'+localDay()+'">Hoy</button><button class="link" data-agenda-date="'+dateAfter(agendaDate,7)+'">Semana siguiente →</button></div>'+calendarStrip(agendaDate)+'<h2>'+dateLabel(agendaDate,{weekday:'long',day:'numeric',month:'long'})+'</h2>'+(events.map(sessionSummary).join('')||'<p class="empty">Sin sesiones para este día.</p>')+'</section>';
}
````

## Archivo: `dist/private-payments.js`

````javascript
// Private lesson fees belong to the coach; they do not contribute to an academy monthly balance.
let privateWeek='';
function weekOf(date){
  return dateAfter(date,-((new Date(date+'T12:00:00').getDay()+6)%7));
}
function coachLedger(){
  const coach=actor();
  state.privateLessons??=[];
  let book=state.privateLessons.find(b=>b.coachId===coach.memberId);
  if(!book){book={coachId:coach.memberId,students:[]};state.privateLessons.push(book)}
  return book;
}
function mxn(amount){
  return Number(amount).toLocaleString('es-MX',{style:'currency',currency:'MXN'});
}
function privateRow(student,week){
  return student.weeks[week]||{amount:student.rate,paid:false,files:[]};
}
function weekLabel(week){
  const opts={day:'numeric',month:'short',year:'numeric'};
  return dateLabel(week,opts)+' – '+dateLabel(dateAfter(week,6),opts);
}
function weeklyPage(){
  const book=coachLedger();
  privateWeek||=weekOf(localDay());
  const students=book.students.filter(s=>s.start<=privateWeek);
  const paid=students.filter(s=>privateRow(s,privateWeek).paid);
  const sum=list=>list.reduce((total,s)=>total+Number(privateRow(s,privateWeek).amount),0);
  return heading('Pagos privados','Control semanal de tus clases particulares · MXN','<button class="btn lime" id="private-add">+ Añadir jugador</button>')+
    `<section class="card"><div class="private-week"><button class="link" data-private-shift="-7" aria-label="Semana anterior">← Anterior</button><div><small class="eyebrow">Semana de clases</small><h2>${weekLabel(privateWeek)}</h2><button class="link" id="private-today">Semana actual</button></div><button class="link" data-private-shift="7" aria-label="Semana siguiente">Siguiente →</button></div>
    <div class="private-totals"><div><small>Cobrado</small><b>${mxn(sum(paid))}</b></div><div><small>Pendiente</small><b>${mxn(sum(students)-sum(paid))}</b></div><div><small>Jugadores al corriente</small><b>${paid.length} de ${students.length}</b></div></div></section>
    <div class="private-list">${students.map(s=>{
      const row=privateRow(s,privateWeek);
      return `<section class="card"><div class="row"><div><small class="eyebrow">${s.academyPlayer?'Jugador de la academia':'Jugador externo'}</small><h2>${esc(s.name)}</h2></div><span class="badge ${row.paid?'':'clay'}">${row.paid?'✓ Pagado':'Pendiente'}</span></div><h3>${mxn(row.amount)}</h3><button class="btn small" data-private-edit="${esc(s.id)}">Registrar o editar pago</button><label class="private-file">Adjuntar comprobante<input type="file" data-private-file="${esc(s.id)}" accept="image/jpeg,image/png,application/pdf"></label>
      ${row.files.length?row.files.map(f=>`<div class="private-receipt"><b>${esc(f.name)}</b><div><button class="link" data-private-view="${f.id}">Ver</button><button class="link" data-private-download="${f.id}">Descargar ↓</button></div></div>`).join(''):'<small>Sin comprobantes esta semana.</small>'}</section>`;
    }).join('')||'<section class="card"><h2>Sin jugadores para esta semana</h2><p class="hint">Añade a quienes toman clases particulares contigo, aunque entrenen fuera de la academia.</p></section>'}</div>`;
}
function receiptStorage(mode,operation){
  return new Promise((resolve,reject)=>{
    const opening=indexedDB.open('corda-private-receipts',1);
    opening.onerror=()=>reject(opening.error);
    opening.onupgradeneeded=()=>opening.result.createObjectStore('files');
    opening.onsuccess=()=>{
      const db=opening.result,tx=db.transaction('files',mode),request=operation(tx.objectStore('files'));
      tx.oncomplete=()=>{db.close();resolve(request.result)};
      tx.onabort=()=>{db.close();reject(tx.error||Error('Error de almacenamiento'))};
    };
  });
}
function savePrivateRow(student,week,row){
  const old=student.weeks[week];student.weeks[week]=row;
  if(save())return true;
  if(old)student.weeks[week]=old;else delete student.weeks[week];
  return false;
}
function bindPrivatePayments(){
  if(role!=='Coach'||page!=='private-payments')return;
  const book=coachLedger(),week=privateWeek;
  document.querySelectorAll('[data-private-shift]').forEach(b=>b.onclick=()=>{privateWeek=dateAfter(week,Number(b.dataset.privateShift));render()});
  $('#private-today').onclick=()=>{privateWeek=weekOf(localDay());render()};
  $('#private-add').onclick=()=>{
    const members=academyPlayers(actor().academy);
    modal('Añadir jugador particular',`<label class="full">Jugador<select name="member"><option value="">Externo a la academia</option>${members.map(m=>`<option value="${esc(m.id)}">${esc(m.name)}</option>`).join('')}</select></label><label class="full" id="private-name">Nombre del jugador externo<input name="name" required maxlength="100"></label><label class="full">Cuota semanal (MXN)<input type="number" min="0" max="999999" step="0.01" required name="rate"></label><p class="full hint">Se incorpora desde la semana seleccionada.</p>`,data=>{
      const member=members.find(m=>m.id===data.member),name=member?.name||data.name.trim();
      if(!name){toast('Escribe el nombre del jugador.');return false}
      if(book.students.some(s=>member?s.academyPlayer===member.id:!s.academyPlayer&&s.name.toLocaleLowerCase()===name.toLocaleLowerCase())){toast('Este jugador ya está en tus pagos privados.');return false}
      const student={id:newMemberId(),name,academyPlayer:member?.id||'',rate:Number(data.rate),start:week,weeks:{}};
      book.students.push(student);if(!save()){book.students.pop();return false}
    });
    const form=$('#modalform');form.elements.member.onchange=()=>{const external=!form.elements.member.value;$('#private-name').hidden=!external;form.elements.name.required=external};
  };
  document.querySelectorAll('[data-private-edit]').forEach(b=>b.onclick=()=>{
    const s=book.students.find(s=>s.id===b.dataset.privateEdit),row=privateRow(s,week);
    modal('Pago de '+esc(s.name),`<p class="full">${weekLabel(week)}</p><label>Importe de esta semana (MXN)<input name="amount" type="number" required min="0" max="999999" step="0.01" value="${row.amount}"></label>`+select('Estado','status',['Pendiente','Pagado'],row.paid?'Pagado':'Pendiente'),d=>savePrivateRow(s,week,{...privateRow(s,week),amount:Number(d.amount),paid:d.status==='Pagado'}));
  });
  document.querySelectorAll('[data-private-file]').forEach(input=>input.onchange=async()=>{
    const f=input.files[0],student=book.students.find(s=>s.id===input.dataset.privateFile);
    if(!f)return;
    if(!['image/jpeg','image/png','application/pdf'].includes(f.type)||f.size>5*1024*1024){toast('Elige un JPG, PNG o PDF de hasta 5 MB.');input.value='';return}
    const id=newMemberId();input.disabled=true;
    try{
      await receiptStorage('readwrite',store=>store.put(f,id));
      const row=privateRow(student,week);
      if(!savePrivateRow(student,week,{...row,files:[...row.files,{id,name:f.name}]})){await receiptStorage('readwrite',store=>store.delete(id));return}
      render();toast('Comprobante guardado en la semana seleccionada.');
    }catch{toast('No se pudo guardar el comprobante en este navegador.')}finally{input.disabled=false}
  });
  document.querySelectorAll('[data-private-view],[data-private-download]').forEach(b=>b.onclick=async()=>{
    try{
      const file=await receiptStorage('readonly',store=>store.get(b.dataset.privateView||b.dataset.privateDownload));
      if(!file)throw Error();
      const url=URL.createObjectURL(file);
      if(b.dataset.privateDownload){const a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);return}
      modal('Comprobante',`<div class="full"><p>${esc(file.name)} · ${weekLabel(week)}</p>${file.type==='application/pdf'?`<object class="private-preview" data="${url}" type="application/pdf">Usa Descargar para abrir el PDF.</object>`:`<img class="private-preview" src="${url}" alt="Comprobante de pago privado">`}<a class="btn light small" href="${url}" download="${esc(file.name)}">Descargar comprobante</a></div>`);
      $('#modal').addEventListener('close',()=>URL.revokeObjectURL(url),{once:true});
    }catch{toast('No se pudo abrir el comprobante en este navegador.')}
  });
}
````

## Archivo: `dist/progress-hub.js`

````javascript
// Mi progreso: encuesta diaria del jugador, evaluación diaria del coach y tres gráficas.
// El 100 % es la meta que el jugador escribió al registrarse (state.profile.goal).
// Datos: state.checkins[memberId] = {player:{'AAAA-MM-DD':{score,mood,good,missing}}, coach:{...:{score,good,missing,by}}}
// La "notificación" es un aviso dentro de la app al abrirla después del entrenamiento.
// Para avisos con la app cerrada (push) hace falta un servidor; este prototipo no tiene.
const HUB_PERIODS={
  // need = días de datos reales que hacen falta para abrir ese periodo
  day:{label:'Diario',unit:'por día',need:1},
  week:{label:'Semanal',unit:'por semana',need:7},
  month:{label:'Mensual',unit:'por mes',need:30},
  quarter:{label:'Trimestral',unit:'por trimestre',need:90},
  year:{label:'Anual',unit:'por año',need:365}
};
const MOODS=[[1,'Sin energía'],[2,'Con cansancio'],[3,'Normal'],[4,'Bien'],[5,'Excelente']];
let hubPeriod='week',hubPick=null,hubArgs=null,hubKeys=[];

const peekCheckins=id=>state.checkins?.[id]||{player:{},coach:{}};
function checkinStore(id){
  state.checkins??={};
  const store=state.checkins[id]??={};
  store.player??={};store.coach??={};
  return store;
}

// ---------- Periodos ----------
const mondayOf=day=>dateAfter(day,-((new Date(day+'T12:00:00').getDay()+6)%7));
function bucketKey(day,period){
  if(period==='day')return day;
  if(period==='week')return mondayOf(day);
  if(period==='month')return day.slice(0,7);
  if(period==='quarter')return day.slice(0,4)+'-T'+(Math.floor((Number(day.slice(5,7))-1)/3)+1);
  return day.slice(0,4);
}
function windowStart(period,today){
  const d=new Date(today+'T12:00:00');d.setDate(1);
  if(period==='day')return dateAfter(today,-13);
  if(period==='week')return dateAfter(mondayOf(today),-49);
  if(period==='month'){d.setMonth(d.getMonth()-11);return localDay(d)}
  if(period==='quarter'){d.setMonth(Math.floor(d.getMonth()/3)*3-15);return localDay(d)}
  return (d.getFullYear()-4)+'-01-01';
}
function bucketLabel(key,period){
  if(period==='day')return dateLabel(key,{day:'numeric',month:'short'});
  if(period==='week')return 'Sem. '+dateLabel(key,{day:'numeric',month:'short'});
  if(period==='month')return dateLabel(key+'-01',{month:'short',year:'2-digit'});
  if(period==='quarter')return key.slice(5)+' · '+key.slice(0,4);
  return key;
}
function bucketLong(key,period){
  if(period==='day')return dateLabel(key,{weekday:'long',day:'numeric',month:'long'});
  if(period==='week')return 'Semana del '+dateLabel(key,{day:'numeric',month:'long'});
  if(period==='month')return dateLabel(key+'-01',{month:'long',year:'numeric'});
  if(period==='quarter')return 'Trimestre '+key.slice(6)+' de '+key.slice(0,4);
  return 'Año '+key;
}

// ---------- Datos ----------
// Ejemplo para presentar el prototipo mientras el jugador no tiene respuestas propias.
let exampleCache=null;
function exampleCheckins(){
  const today=localDay();
  if(exampleCache?.today===today)return exampleCache;
  let seed=11;const rnd=()=>(seed=(seed*9301+49297)%233280)/233280;
  const near5=n=>Math.max(5,Math.min(100,Math.round(n/5)*5));
  const pGood=['Me sentí suelto con la derecha.','Saqué con más confianza.','Aguanté los peloteos largos.','Me concentré mejor entre puntos.','Llegué bien parado a las bolas abiertas.'];
  const pMissing=['Me faltó profundidad con el revés.','Me cansé en la última media hora.','El segundo saque se me quedó corto.','Me costó la calma con el marcador en contra.','Llegué tarde a las bolas cortas.'];
  const cGood=['Mejor colocación de pies antes de golpear.','Rutina entre puntos más constante.','Más altura sobre la red en el segundo saque.','Buena recuperación al centro tras el revés.','Eligió mejor cuándo acelerar.'];
  const cMissing=['Falta profundidad con el marcador en contra.','Debe preparar antes el revés.','Más efecto en el segundo saque.','Sostener la intensidad hasta el final.','Atacar más las bolas cortas.'];
  const player={},coach={},total=420;
  for(let i=total;i>=1;i--){
    const day=dateAfter(today,-i),weekday=new Date(day+'T12:00:00').getDay();
    if(![1,2,4,5,6].includes(weekday))continue;
    const t=(total-i)/total,base=26+58*t-5*Math.sin(t*10);
    const pick=list=>list[Math.floor(rnd()*list.length)];
    player[day]={score:near5(base+6+(rnd()-.5)*18),mood:Math.max(1,Math.min(5,Math.round(2.4+2*t+(rnd()-.5)*2))),good:pick(pGood),missing:pick(pMissing)};
    coach[day]={score:near5(base+(rnd()-.5)*8),good:pick(cGood),missing:pick(cMissing),by:'Coach de ejemplo'};
  }
  return exampleCache={today,player,coach};
}
function hubTournaments(example){
  const today=localDay(),list=(state.competition||[]).map(c=>({...c}));
  if(example){
    list.push({name:'Copa de invierno',place:'Ejemplo',date:dateAfter(today,-250)},{name:'Abierto de verano',place:'Ejemplo',date:dateAfter(today,-130)},{name:'Torneo de otoño',place:'Ejemplo',date:dateAfter(today,-12)});
    if(!list.some(c=>c.date>today)&&state.exampleTournament)list.push({...state.exampleTournament});
  }
  return list.sort((a,b)=>a.date.localeCompare(b.date));
}
// Días desde la primera encuesta o evaluación real (con los datos de ejemplo, todo abierto).
function hubSpan(data,today){
  if(data.example)return Infinity;
  const first=[...Object.keys(data.player),...Object.keys(data.coach)].sort()[0];
  return first?Math.round((Date.parse(today)-Date.parse(first))/864e5)+1:0;
}
function hubData(id){
  const store=peekCheckins(id);
  if(Object.keys(store.player||{}).length||Object.keys(store.coach||{}).length)return {example:false,player:store.player||{},coach:store.coach||{},tournaments:hubTournaments(false)};
  return {example:true,...exampleCheckins(),tournaments:hubTournaments(true)};
}
// Agrupa respuestas diarias en el periodo elegido: el porcentaje es el promedio.
function hubSeries(entries,period,start,today){
  const groups={};
  for(const [day,e] of Object.entries(entries)){
    if(day<start||day>today||!Number.isFinite(Number(e.score)))continue;
    (groups[bucketKey(day,period)]??=[]).push({day,...e,score:Number(e.score)});
  }
  return Object.fromEntries(Object.entries(groups).map(([key,list])=>{
    list.sort((a,b)=>a.day.localeCompare(b.day));
    return [key,{value:Math.round(list.reduce((sum,e)=>sum+e.score,0)/list.length),count:list.length,list}];
  }));
}
const pts=n=>n+(n===1?' punto':' puntos');
const lastNote=(series,field)=>Object.keys(series).sort().reverse().flatMap(k=>[...series[k].list].reverse()).find(e=>e[field])?.[field]||'';

// ---------- Interfaz ----------
function hubChart(keys,pick,lines,tKeys,label){
  const n=keys.length,x=i=>n===1?335:44+i*583/(n-1),y=v=>160-v*1.38;
  const grid=[0,25,50,75,100].map(v=>`<line x1="44" x2="627" y1="${y(v)}" y2="${y(v)}" class="chart-grid${v===100?' chart-goal':''}"/><text x="35" y="${y(v)+4}" text-anchor="end">${v===100?'Meta':v+'%'}</text>`).join('');
  const every=Math.ceil(n/6);
  const ticks=keys.map((k,i)=>(i%every===0||i===n-1)&&!(i!==n-1&&n-1-i<every)?`<text x="${x(i)}" y="186" text-anchor="${n>1&&i===n-1?'end':n>1&&i===0?'start':'middle'}">${esc(bucketLabel(k,hubPeriod))}</text>`:'').join('');
  const marks=keys.map((k,i)=>tKeys[k]?`<g class="chart-tourney"><line x1="${x(i)}" x2="${x(i)}" y1="${y(100)-6}" y2="${y(0)}"/><circle cx="${x(i)}" cy="${y(100)-8}" r="5"/><title>${esc(tKeys[k].map(t=>t.name).join(', '))}</title></g>`:'').join('');
  const guide=keys.includes(pick)?`<line class="chart-guide" x1="${x(keys.indexOf(pick))}" x2="${x(keys.indexOf(pick))}" y1="${y(100)}" y2="${y(0)}"/>`:'';
  const series=lines.map(line=>{
    const pts=keys.map((k,i)=>line.map[k]?[i,line.map[k].value,k]:null).filter(Boolean);
    return `${pts.length>1?`<polyline class="chart-line ${line.cls}" points="${pts.map(([i,v])=>x(i)+','+y(v)).join(' ')}"/>`:''}${pts.map(([i,v,k])=>`<g class="chart-point" data-bucket="${k}"><circle cx="${x(i)}" cy="${y(v)}" r="14" class="chart-hit"/><circle cx="${x(i)}" cy="${y(v)}" r="${k===pick?6:3.5}" class="chart-dot ${line.cls}${k===pick?' selected':''}"/></g>`).join('')}`;
  }).join('');
  return `<svg class="annual-chart hub-svg" viewBox="0 0 650 195" role="img" aria-label="${esc(label)}">${grid}${marks}${guide}${series}${ticks}</svg>`;
}
function progressHub(id,goal,name){
  hubArgs=[id,goal,name];
  const self=!name,today=localDay(),data=hubData(id),span=hubSpan(data,today);
  const open=k=>HUB_PERIODS[k].need<=span;
  if(!open(hubPeriod))hubPeriod=Object.keys(HUB_PERIODS).filter(open).at(-1)||'day';
  const period=HUB_PERIODS[hubPeriod],start=windowStart(hubPeriod,today);
  const nextOpen=Object.entries(HUB_PERIODS).find(([k])=>!open(k));
  const player=hubSeries(data.player,hubPeriod,start,today),coach=hubSeries(data.coach,hubPeriod,start,today);
  const tKeys={};data.tournaments.filter(t=>t.date>=start&&t.date<=today).forEach(t=>(tKeys[bucketKey(t.date,hubPeriod)]??=[]).push(t));
  const keys=[...new Set([...Object.keys(player),...Object.keys(coach),...Object.keys(tKeys)])].sort();
  const pick=keys.includes(hubPick)?hubPick:keys.at(-1);
  hubKeys=keys;hubPick=pick||null;
  const both=k=>[player[k]?.value,coach[k]?.value].filter(Number.isFinite);
  const combined=k=>{const v=both(k);return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length):null};
  const scored=keys.filter(k=>combined(k)!==null),current=scored.length?combined(scored.at(-1)):null,previous=scored.length>1?combined(scored.at(-2)):null;
  const shared=keys.filter(k=>player[k]&&coach[k]);
  const gap=shared.length?Math.round(shared.reduce((s,k)=>s+player[k].value-coach[k].value,0)/shared.length):null;
  const you=self?'Tú':esc(name.split(' ')[0]);
  const delta=current!==null&&previous!==null?current-previous:null;
  const trend=delta===null?'':delta>0?`<li><span class="hub-up" aria-hidden="true">▲</span> Subió ${pts(delta)} respecto al periodo anterior.</li>`:delta<0?`<li><span class="hub-down" aria-hidden="true">▼</span> Bajó ${pts(-delta)} respecto al periodo anterior.</li>`:'<li>Igual que el periodo anterior.</li>';
  const agreement=gap===null?'Cuando haya respuestas de ambos en el mismo periodo, aquí verás si coinciden.':Math.abs(gap)<=7?`Van en sintonía: ${self?'tu sensación y la de tu coach':'jugador y coach'} difieren ${pts(Math.abs(gap))} en promedio.`:gap>0?`${self?'Te ves '+pts(gap)+' más arriba que tu coach':'La sensación del jugador está '+pts(gap)+' arriba del coach'}. Vale la pena platicarlo.`:self?`Tu coach te ve ${pts(-gap)} más arriba de lo que tú te sientes. Vas mejor de lo que crees.`:`La evaluación del coach está ${pts(-gap)} arriba de la sensación del jugador.`;
  const today_=peekCheckins(id);
  const cta=self&&role==='Jugador'?(today_.player?.[today]?'<button class="link" data-open-checkin>Editar mi respuesta de hoy</button>':'<button class="btn lime" data-open-checkin>Cómo me fue hoy</button>'):role==='Coach'?`<button class="btn" data-coach-checkin="${esc(id)}">${today_.coach?.[today]?'Editar evaluación de hoy':'Evaluar hoy'}</button>`:'';
  const options=Object.entries(HUB_PERIODS).map(([k,p])=>`<option value="${k}" ${k===hubPeriod?'selected':''} ${open(k)?'':'disabled'}>${p.label}${open(k)?'':' · en '+(p.need-span)+(p.need-span===1?' día':' días')}</option>`).join('');
  const unlockNote=nextOpen?`<p class="hint hub-unlock">${span===1?'Llevas 1 día':'Llevas '+span+' días'} de datos. La vista ${nextOpen[1].label.toLowerCase()} se abre en ${nextOpen[1].need-span===1?'1 día':(nextOpen[1].need-span)+' días'}. Mientras, responde tu encuesta cada día.</p>`:'';
  const lineP={cls:'is-player',map:player},lineC={cls:'is-coach',map:coach};
  const empty=msg=>`<p class="hint hub-empty">${msg}</p>`;
  const detail=pick?`<div class="month-observation hub-detail" aria-live="polite"><div class="hub-step"><button type="button" class="link" data-hub-step="-1" ${keys.indexOf(pick)<1?'disabled':''} aria-label="Periodo anterior">‹</button><b>${esc(bucketLong(pick,hubPeriod))}</b><button type="button" class="link" data-hub-step="1" ${keys.indexOf(pick)>=keys.length-1?'disabled':''} aria-label="Periodo siguiente">›</button></div>
    <p><span class="hub-key is-player"></span>${you}: <b class="hub-inline">${player[pick]?player[pick].value+' %':'sin respuesta'}</b>${player[pick]?.count>1?` · ${player[pick].count} encuestas`:''}${player[pick]?.list.at(-1).mood?` · ánimo: ${MOODS[player[pick].list.at(-1).mood-1][1].toLowerCase()}`:''}</p>
    <p><span class="hub-key is-coach"></span>Coach: <b class="hub-inline">${coach[pick]?coach[pick].value+' %':'sin evaluación'}</b>${coach[pick]?.count>1?` · ${coach[pick].count} evaluaciones`:''}</p>
    ${player[pick]?.list.at(-1).missing?`<p class="hint">${you} · lo que faltó: ${esc(player[pick].list.at(-1).missing)}</p>`:''}${coach[pick]?.list.at(-1).missing?`<p class="hint">Coach · lo que falta: ${esc(coach[pick].list.at(-1).missing)}</p>`:''}
    ${tKeys[pick]?tKeys[pick].map(t=>`<p class="hub-tourney"><span aria-hidden="true">◉</span> Torneo: ${esc(t.name)} · ${esc(dateLabel(t.date,{day:'numeric',month:'long'}))}</p>`).join(''):''}</div>`:'';
  return `<div id="progress-hub" class="progress-hub">
  <section class="card hub-summary">
    <div class="hub-top"><div><small class="eyebrow">${data.example?'Datos de ejemplo':'Camino a tu meta'}</small><h2>${self?'¿Cómo voy?':'¿Cómo va '+esc(name.split(' ')[0])+'?'}</h2></div>
    <label class="chart-range"><span>Periodo</span><select id="hub-period" aria-label="Periodo de las gráficas">${options}</select></label></div>${unlockNote}
    <div class="hub-goal"><small>${self?'Tu meta':'Su meta'} = 100 %</small><p>${esc(goal||'Aún sin meta. Escríbela en tu perfil.')}</p></div>
    ${data.example?'<p class="hint">Así se verá tu progreso. En cuanto respondas tu primera encuesta, las gráficas usarán tus datos reales.</p>':''}
    <div class="hub-now"><span class="annual-score">${current===null?'—':current+' %'}<small>${current===null?'sin datos en este periodo':'de '+(self?'tu':'su')+' meta · '+esc(bucketLong(scored.at(-1),hubPeriod))}</small></span>
    <ul class="hub-facts">${trend}</ul></div>
    <p class="hub-agree">${agreement}</p>
    ${cta}
  </section>
  <section class="card hub-chart"><small class="eyebrow">Gráfica 1 · Encuesta diaria</small><h3>${self?'Cómo me siento':'Cómo se siente '+esc(name.split(' ')[0])}</h3><p class="hint">${self?'Tu respuesta después de cada entrenamiento':'Su respuesta después de cada entrenamiento'}, ${period.unit}.</p>
    ${Object.keys(player).length?hubChart(keys,pick,[lineP],tKeys,'Sensación del jugador, '+period.unit):empty(self?'Aún no hay encuestas en este periodo. Al terminar tu entrenamiento te llegará la pregunta.':'Aún no hay encuestas del jugador en este periodo.')}</section>
  <section class="card hub-chart"><small class="eyebrow">Gráfica 2 · Evaluación del coach</small><h3>${self?'Cómo me ve mi coach':'Evaluación del coach'}</h3><p class="hint">Lo que el coach anota después de cada entrenamiento, ${period.unit}.</p>
    ${Object.keys(coach).length?hubChart(keys,pick,[lineC],tKeys,'Evaluación del coach, '+period.unit):empty('Aún no hay evaluaciones del coach en este periodo.')}</section>
  <section class="card hub-chart"><small class="eyebrow">Gráfica 3 · Comparación</small><h3>${self?'Yo y mi coach':'Jugador y coach'}</h3>
    <p class="hub-legend"><span><i class="hub-key is-player"></i>${self?'Cómo me siento':'Jugador'}</span><span><i class="hub-key is-coach"></i>Coach</span><span><i class="hub-key is-tourney"></i>Torneo</span></p>
    ${keys.length?hubChart(keys,pick,[lineC,lineP],tKeys,'Comparación entre jugador y coach, '+period.unit):empty('Sin datos en este periodo. Prueba con un periodo más largo.')}
    <p class="hint">Toca un punto para ver el detalle.</p>${detail}</section>
  </div>`;
}
function redrawHub(focus){
  const hub=$('#progress-hub');if(!hub||!hubArgs)return;
  hub.outerHTML=progressHub(...hubArgs);bindProgressHub();
  if(focus)document.querySelector(focus)?.focus({preventScroll:true});
}
function bindProgressHub(){
  const hub=$('#progress-hub');
  if(hub){
    $('#hub-period').onchange=e=>{hubPeriod=e.target.value;hubPick=null;redrawHub('#hub-period')};
    hub.onclick=e=>{
      const point=e.target.closest('[data-bucket]'),step=e.target.closest('[data-hub-step]');
      if(point){hubPick=point.dataset.bucket;redrawHub();return}
      if(step&&!step.disabled){
        const next=hubKeys[hubKeys.indexOf(hubPick)+Number(step.dataset.hubStep)];
        if(next){hubPick=next;redrawHub('[data-hub-step="'+step.dataset.hubStep+'"]')}
      }
    };
  }
  document.querySelectorAll('[data-open-checkin]').forEach(b=>b.onclick=()=>openPlayerCheckin());
  document.querySelectorAll('[data-coach-checkin]').forEach(b=>b.onclick=()=>{
    const member=academyPlayers(actor().academy).find(m=>m.id===b.dataset.coachCheckin);
    if(member)openCoachCheckin(member,[]);
  });
}

// ---------- Encuestas ----------
function scoreField(question,value){
  return `<label class="full hub-range">${question}<span class="hub-range-value"><output id="hub-score-out">${value} %</output></span><input type="range" name="score" min="0" max="100" step="5" value="${value}" aria-describedby="hub-score-help"><small id="hub-score-help" class="hub-range-scale"><span>0 · Empezando</span><span>100 · Meta lograda</span></small></label>`;
}
function attendanceField(question,yes,no,old){
  const current=old.attended===false?'no':old.at?'yes':'';
  return `<fieldset class="full mood-scale"><legend>${question}</legend>${[['yes',yes],['no',no]].map(([v,label])=>`<label class="mood-option"><input type="radio" name="attended" value="${v}" required ${current===v?'checked':''}><span>${label}</span></label>`).join('')}</fieldset>`;
}
// Si no asistió, se ocultan (y se desactivan) las demás preguntas.
function bindAttendance(){
  const form=$('#modalform'),rest=form.querySelector('.attend-rest');
  const sync=()=>{const absent=form.querySelector('[name="attended"][value="no"]').checked;rest.hidden=absent;rest.querySelectorAll('input,textarea').forEach(i=>i.disabled=absent)};
  form.querySelectorAll('[name="attended"]').forEach(r=>r.onchange=sync);sync();
}
function bindScoreField(){
  const input=$('#modalform [name="score"]'),out=$('#hub-score-out');
  if(input)input.oninput=()=>out.textContent=input.value+' %';
}
function lastScore(entries){const last=Object.keys(entries).sort().reverse().find(k=>Number.isFinite(entries[k].score));return last?entries[last].score:50}
function openPlayerCheckin(fromNotice=false){
  const id=state.profile.memberId,store=checkinStore(id),today=localDay(),old=store.player[today]||{};
  const mood=MOODS.map(([v,label])=>`<label class="mood-option"><input type="radio" name="mood" value="${v}" required ${Number(old.mood)===v?'checked':''}><span>${label}</span></label>`).join('');
  modal(fromNotice?'¿Cómo te fue hoy?':'Encuesta de hoy',
    `${fromNotice?'<p class="full hub-notice"><small class="eyebrow">Notificación · después de tu entrenamiento</small>Responde en 20 segundos. Con esto se calcula tu porcentaje del día.</p>':''}
    ${attendanceField('¿Fuiste hoy al entrenamiento?','Sí fui','No fui',old)}
    <div class="full formgrid attend-rest">
    <p class="full hint">Tu meta: «${esc(state.profile.goal||'sin definir')}». 100 % = la lograste.</p>
    ${scoreField('¿Qué tan cerca te sentiste hoy de tu meta?',old.score??lastScore(store.player))}
    <fieldset class="full mood-scale"><legend>¿Cómo te sentiste en el entrenamiento?</legend>${mood}</fieldset>
    <label class="full">¿Qué te salió bien? <span class="optional">(opcional)</span><textarea name="good" maxlength="300">${esc(old.good)}</textarea></label>
    <label class="full">¿Qué te faltó? <span class="optional">(opcional)</span><textarea name="missing" maxlength="300">${esc(old.missing)}</textarea></label></div>`,
    data=>{store.player[today]=data.attended==='no'?{attended:false,at:Date.now()}:{attended:true,score:Number(data.score),mood:Number(data.mood),good:data.good.trim(),missing:data.missing.trim(),at:Date.now()};hubPick=null},
    'Enviar');
  bindScoreField();bindAttendance();
}
function openCoachCheckin(member,queue){
  const store=checkinStore(member.id),today=localDay(),old=store.coach[today]||{};
  const record=athleteFor(member);
  modal('Evaluación de hoy · '+esc(member.name),
    `${queue.length?`<p class="full hint">Después: ${queue.map(m=>esc(m.name.split(' ')[0])).join(', ')}.</p>`:''}
    ${attendanceField('¿Asistió hoy al entrenamiento?','Sí asistió','No asistió',old)}
    <div class="full formgrid attend-rest">
    <p class="full hint">Su meta: «${esc(record.profile.goal||'sin definir')}». 100 % = la logró.</p>
    ${scoreField('Hoy, ¿qué tan cerca estuvo de su meta?',old.score??lastScore(store.coach))}
    <label class="full">¿Qué mejoró hoy? <span class="optional">(opcional)</span><textarea name="good" maxlength="300">${esc(old.good)}</textarea></label>
    <label class="full">¿Qué le falta? <span class="optional">(opcional)</span><textarea name="missing" maxlength="300">${esc(old.missing)}</textarea></label></div>`,
    data=>{
      // Si no asistió, solo se guarda la falta: no cuenta para la gráfica.
      store.coach[today]=data.attended==='no'?{attended:false,by:actor()?.name||'Coach',at:Date.now()}:{attended:true,score:Number(data.score),good:data.good.trim(),missing:data.missing.trim(),by:actor()?.name||'Coach',at:Date.now()};hubPick=null;
      if(queue.length)setTimeout(()=>openCoachCheckin(queue[0],queue.slice(1)),0);
    },
    queue.length?'Guardar y seguir':'Guardar');
  bindScoreField();
  bindAttendance();
}

// ---------- Avisos del día ----------
// El aviso llega al terminar la última sesión del día.
function trainedToday(){
  const now=Date.now(),list=sessionsFor(localDay()).filter(s=>!s.cancelled);
  return list.length>0&&list.every(s=>sessionTimes(s).end<=now);
}
function playerCheckinDue(){
  return role==='Jugador'&&!!state.profile?.memberId&&trainedToday()&&!peekCheckins(state.profile.memberId).player?.[localDay()]&&peekCheckins(state.profile.memberId).coach?.[localDay()]?.attended!==false;
}
function coachPending(){
  if(role!=='Coach'||!actor()||!trainedToday())return [];
  return academyPlayers(actor().academy).filter(m=>!peekCheckins(m.id).coach?.[localDay()]);
}
function checkinBanner(){
  if(!playerCheckinDue())return '';
  return '<section class="card checkin-banner"><div><small class="eyebrow">Notificación</small><h2>¿Cómo te fue hoy?</h2><p class="hint">Tu entrenamiento terminó. Cuéntanos cómo te sentiste para calcular tu avance del día.</p></div><button class="btn" data-open-checkin>Responder</button></section>';
}
function coachCheckinCard(){
  const pending=coachPending();
  if(!pending.length)return '';
  return `<section class="card checkin-banner"><div><small class="eyebrow">Notificación</small><h2>Evaluaciones de hoy · ${pending.length}</h2><p class="hint">Cuéntanos cómo viste a cada jugador en el entrenamiento de hoy.</p><div class="checkin-people">${pending.map(m=>`<button class="link" data-coach-checkin="${esc(m.id)}">${esc(m.name)}</button>`).join('')}</div></div><button class="btn" id="coach-checkin-all">Evaluar a todos</button></section>`;
}
function maybePromptCheckin(){
  if(entry!=='app'||phoneDemo||$('#modal')?.open)return;
  const today=localDay();
  state.checkinPrompts??={};
  const all=$('#coach-checkin-all');
  if(all)all.onclick=()=>{const p=coachPending();if(p.length)openCoachCheckin(p[0],p.slice(1))};
  if(playerCheckinDue()){
    const key='p:'+state.profile.memberId;
    if(state.checkinPrompts[key]===today)return;
    state.checkinPrompts[key]=today;save();openPlayerCheckin(true);return;
  }
  const pending=coachPending();
  if(pending.length){
    const key='c:'+(actor().memberId||'coach');
    if(state.checkinPrompts[key]===today)return;
    state.checkinPrompts[key]=today;save();
    openCoachCheckin(pending[0],pending.slice(1));
  }
}
````

## Archivo: `dist/resenas.js`

````javascript
// Reseñas de la portada.
// IMPORTANTE: estas reseñas son EJEMPLOS inventados para el prototipo y se
// muestran rotuladas como tales. Antes de publicar, cámbialas por reseñas reales
// (con permiso de cada persona) y pon EXAMPLE_REVIEWS en false.
// "foto": ruta a la imagen de la persona (p. ej. 'assets/resenas/ana.jpg').
// Si está vacía, se muestran sus iniciales.
const EXAMPLE_REVIEWS=true;
const REVIEWS=[
  {nombre:'Valeria M.',rol:'Jugadora junior',foto:'',estrellas:5,texto:'Antes de cada entrenamiento ya sé qué vamos a trabajar. Mi segundo saque mejoró porque por fin sigo el mismo plan toda la semana.'},
  {nombre:'Diego R.',rol:'Coach de alto rendimiento',foto:'',estrellas:5,texto:'Dejo la corrección del día en dos minutos y el jugador llega a la siguiente sesión sabiendo qué ajustar. Me ahorra explicaciones repetidas.'},
  {nombre:'Laura G.',rol:'Mamá de jugador',foto:'',estrellas:5,texto:'Veo la agenda de mi hijo, sus avances y la mensualidad en un solo lugar. Ya no tengo que preguntar por WhatsApp a qué hora entrena.'},
  {nombre:'Santiago P.',rol:'Jugador de circuito',foto:'',estrellas:5,texto:'La cuenta regresiva al torneo me ordena la semana. Llegué al último torneo sabiendo exactamente qué había preparado.'},
  {nombre:'Mariana T.',rol:'Preparadora física',foto:'',estrellas:5,texto:'La rutina física queda conectada con el objetivo de cancha. Los jugadores entienden por qué hacen cada ejercicio.'},
  {nombre:'Andrés L.',rol:'Director de academia',foto:'',estrellas:5,texto:'Coaches, familias y jugadores ven la misma información. Las juntas de seguimiento ahora son más cortas y más claras.'}
];
function reviewInitials(name){
  return name.split(/\s+/).map(part=>part[0]||'').join('').slice(0,2).toUpperCase();
}
function reviewStars(count){
  const star='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>';
  return `<span class="review-stars" role="img" aria-label="${count} de 5 estrellas">${star.repeat(count)}</span>`;
}
function reviewCard(review,hidden){
  // Las iniciales quedan debajo; si hay foto, la cubre. Si la foto falla, se ven las iniciales.
  const photo=`<span class="avatar review-avatar" aria-hidden="true">${esc(reviewInitials(review.nombre))}${review.foto?`<img src="${esc(review.foto)}" alt="" onerror="this.remove()">`:''}</span>`;
  return `<figure class="review-card"${hidden?' aria-hidden="true"':''}>${reviewStars(review.estrellas)}<blockquote>${esc(review.texto)}</blockquote><figcaption>${photo}<span><b>${esc(review.nombre)}</b><small>${esc(review.rol)}</small></span></figcaption></figure>`;
}
function reviewsSection(){
  const t=coverText;
  const cards=REVIEWS.map(r=>reviewCard(r,false)).join('');
  // La fila se repite una vez (oculta a lectores de pantalla) para que el movimiento sea continuo.
  const loop=REVIEWS.map(r=>reviewCard(r,true)).join('');
  return `<section class="cover-reviews" aria-labelledby="reviews-title">
    <div class="cover-reviews__head"><small class="eyebrow">${EXAMPLE_REVIEWS?t('Reseñas de ejemplo','Sample reviews','Avis d’exemple'):t('Reseñas','Reviews','Avis')}</small>
    <h2 id="reviews-title">${t('Lo que dicen de CORDA','What people say about CORDA','Ce que l’on dit de CORDA')}</h2>
    ${EXAMPLE_REVIEWS?`<p class="hint">${t('Textos ilustrativos del prototipo. Aún no son opiniones de usuarios reales.','Illustrative prototype copy. These are not real user reviews yet.','Textes d’illustration du prototype. Ce ne sont pas encore de vrais avis.')}</p>`:''}</div>
    <div class="reviews-viewport"><div class="reviews-track">${cards}${loop}</div></div>
  </section>`;
}
````

## Archivo: `dist/roles.js`

````javascript
const roleNames=['Jugador','Coach','Tutor'];
const roleDescriptions={Jugador:'Entrenamientos, objetivos y evolución.',Coach:'Planifica sesiones y acompaña a tus jugadores.',Tutor:'Consulta la agenda y el avance de tu jugador.'};
let rosterDetail='';
function personStore(){
  state.athletes??={};state.accessProfiles??={};return state.athletes;
}
function rememberPlayer(){
  personStore();
  const p=state.profile;
  if(!p||p.staff||!p.memberId)return;
  state.athletes[p.memberId]={profile:p,goals:state.goals,reviews:state.reviews};
}
function actor(){
  return role==='Jugador'?state.profile:state.accessProfiles?.[role];
}
function academyPlayers(academy){
  return (state.directory||[]).filter(m=>m.role==='Jugador'&&m.academy===academy);
}
function athleteFor(member){
  const store=personStore();
  if(!store[member.id])store[member.id]={profile:{name:member.name,memberId:member.id,academy:member.academy,photo:member.photo||'',goal:member.bio||'',level:'Por definir'},goals:[],reviews:{}};
  return store[member.id];
}
function useAthlete(member){
  const a=athleteFor(member);
  state.profile=a.profile;state.reviews=a.reviews;state.goals=a.goals;
}
function roleNav(){
  const labels=role==='Coach'?['Panel del coach','Plan de la academia','Mis jugadores','Mi academia','Citas']:role==='Tutor'?['Inicio familiar','Agenda','Avances','Mi academia','Mensualidad']:['Inicio','Mi plan','Mi progreso','Mi academia','Mensualidad'];
  return [['home','home'],['calendar','calendar'],['goals','target'],['team','user'],[role==='Coach'?'appointments':'payments',role==='Coach'?'calendar':'wallet']].map(([id,i],n)=>[id,i,labels[n]]).concat(role==='Coach'?[['private-payments','wallet','Pagos privados']]:[]).concat([['profile','profile','Mi perfil']]);
}
function pickRole(mode){
  entry='access';
  const last=state.lastRole||'Jugador';
  const t=coverText;
  const labels={Jugador:'Player',Coach:'Coach',Tutor:'Guardian'};
  const descriptions={Jugador:'Training, goals and progress.',Coach:'Plan sessions and support your players.',Tutor:'View your player’s schedule and progress.'};
  accessScene('access-screen',`${coverSelector()}<section class="access-panel"><small class="eyebrow">CORDA · ${t('Acceso local','Local demo','Démo locale')}</small><h1>${t('¿Cómo vas a entrar?','Choose your role','Choisissez votre profil')}</h1><p>${t('Elige el perfil que usarás en la academia.','Choose your academy profile.','Choisissez le profil que vous utiliserez à l’académie.')}</p><div class="access-roles">${roleNames.map(r=>`<button data-enter-role="${r}"><strong>${t(r,labels[r],{Jugador:'Joueur',Coach:'Coach',Tutor:'Parent'}[r])}</strong><small>${t(roleDescriptions[r],descriptions[r],{Jugador:'Entraînements, objectifs et progression.',Coach:'Planifiez les séances et accompagnez vos joueurs.',Tutor:'Consultez le programme et les progrès de votre joueur.'}[r])}</small>${state.lastRole&&r===last?`<small>${t('Último perfil utilizado','Last profile used','Dernier profil utilisé')}</small>`:''}</button>`).join('')}</div><button class="access-back">← ${t('Inicio','Home','Accueil')}</button></section>`);
  bindCoverLanguage(()=>pickRole(mode));
  $('.access-back').onclick=()=>mode==='register'?pickRole('register'):signInScreen();
  document.querySelectorAll('[data-enter-role]').forEach(button=>button.onclick=()=>createAccessScreen(button.dataset.enterRole,mode==='register'?'register':'signin'));
}
function chooseRole(selected,mode){
  rememberPlayer();
  role=selected;page='home';rosterDetail='';
  if(role==='Jugador'){
    const saved=state.athletes?.[state.lastPlayerId];
    if(mode==='signin'&&saved){switchAgenda(saved.profile.academy);useAthlete({id:state.lastPlayerId});finishAccess();return}
    draft={};step=0;entry='register';onboarding();return;
  }
  const existing=state.accessProfiles?.[role];
  if(mode==='signin'&&existing&&(role==='Coach'||academyPlayers(existing.academy).some(m=>m.id===existing.childId))){
    enterAdult(existing);return;
  }
  adultSetup(existing);
}
function finishAccess(){
  state.lastRole=role;entry='app';prepareCommunity();linkPendingAccount();syncCurrentAccount();save();render();window.scrollTo(0,0);
}
function enterAdult(account){
  personStore();switchAgenda(account.academy);state.accessProfiles[role]=account;
  if(role==='Tutor'){
    const child=academyPlayers(account.academy).find(m=>m.id===account.childId);
    if(!child){adultSetup(account);return}
    useAthlete(child);
  }else{state.profile=account;state.goals=[];state.reviews={}}
  finishAccess();
}
function adultSetup(existing){
  const academy=existing?.academy||state.profile?.academy||'Mouratoglou Tennis Center Guadalajara';
  accessScene('access-screen',`<section class="access-panel"><small class="eyebrow">Perfil de ${role}</small><h1>${role==='Coach'?'Tu espacio de coach':'Tu espacio familiar'}</h1><form id="adult-form">${field('Tu nombre','name',existing?.name||'')}${academySelect('academy',academy)}<div id="linked-player"></div><div class="formactions"><button type="button" class="access-back">← Perfiles</button><button class="btn lime">Entrar al portal</button></div></form></section>`);
  const form=$('#adult-form');
  function children(){
    if(role!=='Tutor')return;
    const players=academyPlayers(form.elements.academy.value.trim());
    $('#linked-player').innerHTML=`<label>Jugador a tu cargo<select name="child" required><option value="">Selecciona un jugador</option>${players.map(m=>`<option value="${esc(m.id)}" ${existing?.childId===m.id?'selected':''}>${esc(m.name)}</option>`).join('')}<option value="new-player">Agregar un jugador nuevo</option></select></label><div id="new-player-field"></div><small>Vínculo local de demostración.</small>`;
    function sync(){
      $('#new-player-field').innerHTML=form.elements.child.value==='new-player'
        ? '<label>Nombre del nuevo jugador<input name="childName" maxlength="180" required></label>' : '';
    }
    form.elements.child.onchange=sync;sync();
  }
  form.elements.academy.oninput=children;children();$('.access-back').onclick=()=>currentAccount?(entry='app',render()):pickRole(pendingAccount?'register':'signin');
  form.onsubmit=e=>{
    e.preventDefault();const d=Object.fromEntries(new FormData(form));
    const account={name:d.name.trim(),academy:d.academy.trim(),memberId:existing?.memberId||newMemberId(),staff:role,role};
    if(!account.name||!account.academy){toast('Escribe tu nombre y academia.');return}
    if(role==='Tutor'){
      let child=academyPlayers(account.academy).find(m=>m.id===d.child);
      if(!child&&d.child!=='new-player'){toast('Selecciona un jugador de esta academia.');return}
      if(!child){if(!d.childName?.trim()){toast('Escribe el nombre del jugador.');return}
        child={name:d.childName.trim(),academy:account.academy,id:newMemberId(),role:'Jugador'};state.directory.push(child)}
      account.childId=child.id;
    }
    enterAdult(account);
  };
}
function latestPlayerNote(record){
  const monthly=Object.entries(record.profile.monthlyReviews||{}).sort(([a],[b])=>b.localeCompare(a))[0];
  const daily=Object.entries(record.reviews||{}).sort(([a],[b])=>b.localeCompare(a))[0];
  if(daily&&(!monthly||daily[0].slice(0,7)>=monthly[0]))return daily[1];
  return monthly?.[1]||{good:record.profile.baseline?.strengths,focus:record.profile.baseline?.priority};
}
function playerList(){
  const members=academyPlayers(actor().academy);
  return heading('Mis jugadores',esc(actor().academy)+' · '+members.length+' jugadores','<button class="btn lime" id="roster-add">+ Jugador</button>')+
    (members.length?`<div class="athlete-list">${members.map(m=>{
      const record=athleteFor(m),note=latestPlayerNote(record);
      return `<article class="card"><div class="row">${avatar(m)}<h2><button class="athlete-name" data-athlete="${esc(m.id)}">${esc(m.name)}</button></h2></div><small>Fortaleza observada</small><p>${esc(note.good||'Por evaluar')}</p><small>Siguiente ajuste</small><p>${esc(note.focus||'Por evaluar')}</p><button class="link" data-athlete="${esc(m.id)}">Ver seguimiento ↗</button></article>`;
    }).join('')}</div>`:'<section class="card"><h2>Tu primer jugador</h2><p class="hint">Añade un jugador para registrar su punto de partida y seguir sus objetivos.</p></section>');
}
function athleteDetail(record,name){
  const note=latestPlayerNote(record);
  const history=Object.entries(record.reviews||{}).sort(([a],[b])=>b.localeCompare(a));
  const months=Object.entries(record.profile.monthlyReviews||{}).sort(([a],[b])=>b.localeCompare(a));
  return heading(esc(name),'Seguimiento individual · '+esc(record.profile.academy))+progressHub(record.profile.memberId,record.profile.goal,name)+
    `<div class="flow-week"><section class="card coach-month"><small class="eyebrow">Última observación</small><div class="monthly-gain"><b>✓ Lo que mejoró</b><p>${esc(note.good||'Pendiente de evaluación.')}</p></div><div><b>Siguiente ajuste</b><p>${esc(note.focus||'Pendiente de evaluación.')}</p></div></section>
    <section class="card"><small class="eyebrow">Punto de partida</small><h2>Objetivo del jugador</h2><p>${esc(record.profile.goal||'Aún sin definir.')}</p><h3>Fortalezas iniciales</h3><p>${esc(record.profile.baseline?.strengths||'Pendiente de evaluación.')}</p><h3>Primer aspecto a mejorar</h3><p>${esc(record.profile.baseline?.priority||'Pendiente de evaluación.')}</p>
    ${record.goals.map(g=>`<div class="goal"><h3>${esc(g.title)}</h3><p>${esc(g.detail)}</p><small>${esc(g.progress)} %</small><div class="progress"><i style="width:${Number(g.progress)||0}%"></i></div>${role==='Coach'?`<button class="link" data-student-goal="${g.id}">Actualizar avance</button>`:''}</div>`).join('')}${role==='Coach'?'<button class="link" id="student-goal-add">+ Objetivo</button><button class="link" data-page="student-fees">Revisar mensualidad ↗</button>':''}</section></div>
    <section class="card"><div class="sectiontitle"><h2>Evaluaciones</h2>${role==='Coach'?'<button class="btn small" id="student-review">Evaluar jugador</button>':''}</div>
    ${[...history,...months].sort(([a],[b])=>b.localeCompare(a)).map(([date,n])=>`<article class="progress-entry"><small>${esc(date)}</small><h3>${esc(n.good)}</h3><p>${esc(n.focus)}</p></article>`).join('')||'<p class="hint">Las observaciones de este jugador aparecerán aquí.</p>'}</section>`;
}
function staffProgress(){
  const member=academyPlayers(actor().academy).find(m=>m.id===rosterDetail);
  if(!member)return playerList();
  return '<button class="link" id="all-players">← Mis jugadores</button>'+athleteDetail(athleteFor(member),member.name);
}
function coachHome(){
  const academy=actor().academy,members=academyPlayers(academy),today=localDay();
  return heading('Panel del coach',esc(academy),'<button class="btn lime" id="newsession">+ Crear sesión</button>')+
    `<div class="flow-week"><section class="agenda-main"><small class="eyebrow">Plan de hoy</small><h2>Entrenamientos del grupo</h2>${sessionsFor(today).map(sessionSummary).join('')||'<p class="hint">No hay sesiones programadas para hoy.</p>'}<button class="link" data-page="calendar">Ver plan de la academia ↗</button></section><section class="card"><small class="eyebrow">Seguimiento</small><h2>Mis jugadores · ${members.length}</h2><p class="hint">Abre una ficha para revisar el objetivo y escribir una corrección individual.</p><button class="btn small" data-page="goals">Revisar jugadores</button></section></div>`+coachCheckinCard()+meetingCard();
}
function familyHome(){
  const member=academyPlayers(actor().academy).find(m=>m.id===actor().childId);
  const note=latestPlayerNote(athleteFor(member));
  return heading('Inicio familiar',esc(member.name)+' · '+esc(member.academy))+
    '<div class="portal-grid">'+nextSessionCard()+'<section class="card"><small class="eyebrow">Mensualidad</small><h2>'+esc(feeStatus(feeLedger(),localDay().slice(0,7)))+'</h2><button class="link" data-page="payments">Ver pagos ↗</button></section></div>'+
    '<div class="flow-week"><section class="card"><small class="eyebrow">Seguimiento de '+esc(member.name)+'</small><h2>Último avance</h2><p>'+esc(note.good||'Aún no hay evaluación del coach.')+'</p><p>'+esc(note.focus||'')+'</p><button class="link" data-page="goals">Ver avances ↗</button></section>'+meetingCard()+'</div>'+rainNotice();
}
function adultProfile(){
  const a=actor();
  return heading('Mi perfil',role)+`<section class="card"><h2>${esc(a.name)}</h2><p>${esc(a.academy)}</p>${role==='Tutor'?'<p>Jugador vinculado · '+esc(state.profile.name)+'</p>':''}${role==='Coach'?'<button class="btn light small" data-page="private-payments">Pagos privados ↗</button>':''}<button class="link" id="account-setup">Editar datos</button></section>`;
}
function bindRoleActions(){
  bindPrivatePayments();
  bindStudentTrend();
  if($('#account-setup'))$('#account-setup').onclick=()=>adultSetup(actor());
  document.querySelectorAll('[data-athlete]').forEach(b=>b.onclick=()=>{rosterDetail=b.dataset.athlete;page='goals';render();window.scrollTo(0,0)});
  if($('#all-players'))$('#all-players').onclick=()=>{rosterDetail='';render()};
  if($('#roster-add'))$('#roster-add').onclick=()=>editMember(null,'Jugador');
  if(role==='Coach'&&rosterDetail){
    const member=academyPlayers(actor().academy).find(m=>m.id===rosterDetail);
    if(member){
      const record=athleteFor(member);
      if($('#student-goal-add'))$('#student-goal-add').onclick=()=>modal('Objetivo de '+esc(member.name),field('Objetivo','title')+field('Cómo medir el avance','detail'),data=>record.goals.push({...data,id:Date.now(),progress:0}));
      document.querySelectorAll('[data-student-goal]').forEach(button=>button.onclick=()=>{
        const goal=record.goals.find(g=>String(g.id)===button.dataset.studentGoal);
        modal('Avance de '+esc(member.name),'<label>Progreso (%)<input required type="number" min="0" max="100" name="value" value="'+esc(goal.progress)+'"></label>',data=>{goal.progress=Number(data.value)});
      });
    }
  }
  if($('#student-review'))$('#student-review').onclick=()=>{
    const member=academyPlayers(actor().academy).find(m=>m.id===rosterDetail);
    if(!member)return;
    const record=athleteFor(member),today=localDay(),old=record.reviews[today]||{};
    const month=today.slice(0,7);
    const monthly=record.profile.monthlyReviews||{};
    modal('Evaluar a '+esc(member.name),'<label>Mes evaluado<input required type="month" name="month" max="'+month+'" value="'+month+'"></label><label>Preparación para el objetivo (%)<input required type="number" min="0" max="100" step="1" name="score"></label><label class="full">Objetivo evaluado<textarea name="goal" maxlength="400" required></textarea></label><label class="full">Qué hizo bien<textarea name="good" maxlength="600" required></textarea></label><label class="full">Qué trabajar después<textarea name="focus" maxlength="600" required></textarea></label>',data=>{
      const score=Number(data.score);
      if(!Number.isInteger(score)||score<0||score>100||data.month>month)return false;
      record.profile.monthlyReviews??={};
      record.profile.monthlyReviews[data.month]={score,goal:data.goal,good:data.good,focus:data.focus};
      if(data.month===month){
        record.profile.goal=data.goal;
        record.profile.baseline??={date:today,strengths:data.good,priority:data.focus};
        record.reviews[today]={...old,good:data.good,focus:data.focus};
      }
    });
    const inputs=$('#modalform').elements;
    function loadMonth(){
      const item=monthly[inputs.month.value]||{};
      inputs.score.value=item.score??'';
      inputs.goal.value=item.goal??record.profile.goal??'';
      inputs.good.value=item.good??(inputs.month.value===month?old.good||'':'');
      inputs.focus.value=item.focus??(inputs.month.value===month?old.focus||'':'');
    }
    inputs.month.onchange=loadMonth;loadMonth();
  };
}
function switchAgenda(academy){
  const current=state.agendaAcademy||state.profile?.academy;
  state.agendaAcademy=academy;
  if(!current||current===academy)return;
  state.agendaArchives??=[];
  const keys=['sessions','competition','comments','exercises','videos','rainExample','weekStart','exampleTournament'];
  const previous={academy:current};
  for(const key of keys)previous[key]=state[key];
  state.agendaArchives=state.agendaArchives.filter(g=>g.academy!==current);
  state.agendaArchives.push(previous);
  const next=state.agendaArchives.find(g=>g.academy===academy)||seed();
  for(const key of keys)state[key]=next[key];
  initAgenda();agendaDate=localDay();
}
function studentTrend(record,name,selectedMonth){
  const series=Object.entries(record.profile.monthlyReviews||{}).filter(([month,r])=>/^\d{4}-(0[1-9]|1[0-2])$/.test(month)&&Number.isFinite(r.score)).sort(([a],[b])=>a.localeCompare(b));
  const chosen=series.find(([month])=>month===selectedMonth)||series.at(-1);
  const ordinal=m=>Number(m.slice(0,4))*12+Number(m.slice(5));
  const x=m=>series.length<2?320:45+540*(ordinal(m)-ordinal(series[0][0]))/(ordinal(series.at(-1)[0])-ordinal(series[0][0]));
  const y=n=>156-n*1.35;
  const grid=[0,25,50,75,100].map(n=>`<line x1="45" x2="585" y1="${y(n)}" y2="${y(n)}" class="chart-grid"/><text x="35" y="${y(n)+3}" text-anchor="end">${n}%</text>`).join('');
  return `<section class="card annual-example" id="student-trend"><small class="eyebrow">Seguimiento individual · ${esc(name)}</small><h2>Evolución mensual</h2><p class="hint">Preparación para el objetivo según las evaluaciones del coach.</p><svg class="annual-chart" role="img" aria-label="Gráfica de preparación de ${esc(name)}" viewBox="0 0 620 175">${grid}<polyline class="chart-line" points="${series.map(([m,r])=>x(m)+','+y(r.score)).join(' ')}"/>${series.map(([m,r])=>`<g class="chart-point" data-period="${m}"><circle cx="${x(m)}" cy="${y(r.score)}" r="14" class="chart-hit"/><circle cx="${x(m)}" cy="${y(r.score)}" r="${m===chosen[0]?6:4}" class="chart-dot${m===chosen[0]?' selected':''}"/></g>`).join('')}</svg>
  ${chosen?`<div class="chart-months">${series.map(([m,r])=>`<button data-period="${m}" aria-pressed="${chosen[0]===m}"><small>${esc(dateLabel(m+'-01',{month:'short',year:'2-digit'}))}</small><b>${r.score} %</b></button>`).join('')}</div><div class="month-observation" aria-live="polite"><b>${esc(dateLabel(chosen[0]+'-01',{month:'long',year:'numeric'}))} · ${chosen[1].score} %</b><p>Objetivo · ${esc(chosen[1].goal||record.profile.goal)}</p><b>Lo que mejoró</b><p>${esc(chosen[1].good)}</p><b>Siguiente ajuste</b><p>${esc(chosen[1].focus)}</p></div>`:'<p class="hint">Todavía no hay porcentajes registrados para este jugador. La primera evaluación mensual añadirá el primer punto.</p>'}
  ${role==='Coach'?'<button class="btn small" id="trend-assess">Evaluar un mes</button>':''}</section>`;
}
function bindStudentTrend(){
  const panel=$('#student-trend');if(!panel)return;
  panel.onclick=e=>{
    if(e.target.closest('#trend-assess')){$('#student-review')?.click();return}
    const control=e.target.closest('[data-period]');if(!control)return;
    const id=role==='Coach'?rosterDetail:actor().childId;
    const member=academyPlayers(actor().academy).find(m=>m.id===id);if(!member)return;
    panel.outerHTML=studentTrend(athleteFor(member),member.name,control.dataset.period);
    bindStudentTrend();
    $('#student-trend button[data-period="'+control.dataset.period+'"]')?.focus({preventScroll:true});
  };
}
````

## Archivo: `dist/session-guide.js`

````javascript
// A single dated scenario for the pilot. User-created sessions are never modified.
function prepareRainExample(today){
  if(state.rainExample)return;
  function demoSession(templateId,exampleId,defaults){
    const original=state.sessions.find(s=>s.id===templateId&&s.date===today&&!s.done);
    if(original)return original;
    const added={...defaults,id:exampleId,date:today,day:(new Date(today+'T12:00:00').getDay()+6)%7,done:false};
    state.sessions.push(added);return added;
  }
  const morning=demoSession(1,-101,{title:'Consistencia y profundidad',type:'Tenis',duration:90,time:'07:00',place:'Cancha 3',goal:'Ganar consistencia desde el fondo',notes:'Peloteo cruzado con profundidad.'});
  const gym=demoSession(2,-102,{title:'Fuerza y estabilidad',type:'Físico',duration:60,time:'16:00',place:'Gimnasio',goal:'Preparación física',notes:'Trabajo de estabilidad con el preparador físico.'});
  morning.cancelled=true;
  gym.coach='Coach Alex (ejemplo)';
  gym.gear='Tenis de entrenamiento, tapete y botella de agua';
  gym.summary='Estabilidad del tronco e isometría';
  state.rainExample={date:today,morningId:morning.id,gymId:gym.id};
}
function rainNotice(){
  const example=state.rainExample;
  if(!example)return '';
  const gym=state.sessions.find(s=>s.id===example.gymId);
  if(!gym)return '';
  const morning=state.sessions.find(s=>s.id===example.morningId);
  const when=example.date===localDay()?'Hoy':dateLabel(example.date,{day:'numeric',month:'long'});
  return `<article class="rain-note"><small>AVISO DE EJEMPLO · ${esc(when)}</small><h3>Cambio por lluvia</h3><p>Se cancela el entrenamiento de tenis de la mañana${morning?' de las '+esc(morning.time):''}. Solo habrá preparación física en el gimnasio.</p><b>${esc(gym.time)} · ${esc(gym.place)}</b><p>${esc(state.profile.academy)} · ${esc(gym.coach)}</p><button class="link" data-session="${gym.id}">Ver sesión de gimnasio ↗</button></article>`;
}
function sessionCoach(s){
  return s.coach||([1,2,3,4,-101,-102].includes(s.id)?'Coach Alex (ejemplo)':'Por confirmar');
}
function sessionSteps(s){
  if(s.guide)return s.guide.split(/\n/).map(t=>t.trim()).filter(Boolean);
  if(s.id===2||s.id===-102)return ['Prepara tu espacio y coloca el tapete en el gimnasio.','El coach muestra la posición de estabilidad para este bloque.','Completa el bloque indicado y comenta cómo te sentiste.'];
  if(s.id===1||s.id===-101)return ['Los jugadores se colocan en diagonal, detrás de la línea de fondo.','Pelotea cruzado buscando que la pelota bote con profundidad.','Recupera tu posición para preparar el siguiente golpe.'];
  return [s.summary||s.title,s.notes||s.goal].filter(Boolean);
}
// Recuadro del video de la explicación. Para ponerlo, guarda el archivo en
// assets/videos/ y escribe su ruta en el campo "video" de la sesión,
// por ejemplo video:'assets/videos/segundo-saque.mp4'.
function sessionVideo(s){
  if(s.video)return `<div class="guide-video"><video controls playsinline preload="metadata" src="${esc(s.video)}"></video></div>`;
  return '<div class="guide-video is-empty" role="img" aria-label="Video de la explicación, próximamente"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M10 8.5v7l6-3.5z"/></svg><span>Video de la explicación</span><small>Próximamente</small></div>';
}
function sessionGuide(s){
  const steps=sessionSteps(s);
  const gear=s.gear|| (s.type==='Físico'?'Tenis de entrenamiento y botella de agua':'Raqueta, tenis de cancha y botella de agua');
  return `<aside class="coach-pinned"><small>INDICACIÓN DEL COACH</small><h3>Qué llevar</h3><p>${esc(gear)}</p></aside>
  <section class="mini-guide" aria-label="Guía rápida de la actividad"><div class="row"><b>Explicación del ejercicio</b><button type="button" class="link" id="guide-toggle">Pausar</button></div>
  <div class="guide-frames">${steps.map((step,i)=>`<div class="guide-frame" ${i?'hidden':''}><small>PASO ${i+1} DE ${steps.length}</small><p>${esc(step)}</p></div>`).join('')}</div><div class="guide-controls"><button type="button" id="guide-prev" aria-label="Paso anterior">←</button><span>Guía en bucle</span><button type="button" id="guide-next" aria-label="Paso siguiente">→</button></div>${sessionVideo(s)}</section>`;
}
function startSessionGuide(dialog){
  const frames=Array.from(dialog.querySelectorAll('.guide-frame'));
  const toggle=dialog.querySelector('#guide-toggle');
  if(!frames.length||!toggle)return;
  let index=0,timer=null;
  function move(by){frames[index].hidden=true;index=(index+by+frames.length)%frames.length;frames[index].hidden=false}
  function pause(){clearInterval(timer);timer=null;toggle.textContent='Reproducir'}
  function play(){pause();timer=setInterval(()=>move(1),3700);toggle.textContent='Pausar'}
  toggle.onclick=()=>timer?pause():play();
  dialog.querySelector('#guide-next').onclick=()=>{pause();move(1)};
  dialog.querySelector('#guide-prev').onclick=()=>{pause();move(-1)};
  if(frames.length>1&&!matchMedia('(prefers-reduced-motion: reduce)').matches)play();else pause();
  dialog.addEventListener('close',pause,{once:true});
}
````

## Archivo: `dist/sobre-corda.js`

````javascript
// Sección "Sobre CORDA": Misión · Visión · Valores.
// Versión en JavaScript simple de SobreCorda.jsx (la app no usa React).
const SC_TABS=[['mision','Misión'],['vision','Visión'],['valores','Valores']];
const SC_PILARES=[
  ['target','Qué sigue','Tu próxima sesión, tu objetivo y tu próximo torneo, siempre a la vista.'],
  ['message','Por qué','Feedback de tu coach que explica cada ajuste.'],
  ['chart','Cómo vas','Tu progreso medido mes a mes, con datos reales.']
];
const SC_CAMINO=[
  ['lleno','Hoy','Piloto con coaches y jugadores de Mouratoglou Guadalajara.'],
  ['medio','Siguiente','Academias de alto rendimiento en todo México.'],
  ['vacio','La meta','Ser la referencia del tenis competitivo en Latinoamérica.']
];
const SC_VALORES=[
  ['01','Mentor','Dirección','Siempre hay un siguiente paso.','Cada pantalla te dice qué sigue: tu próxima sesión, tu próximo torneo, tu próxima meta.'],
  ['02','Mentor','Precisión','Medimos para mejorar.','Decidimos con datos: asistencia, resultados, WTN y el feedback de tu coach.'],
  ['03','Héroe','Constancia','Cada sesión cuenta.','El alto rendimiento se construye semana a semana, y tu historial lo demuestra.'],
  ['04','Mentor + Héroe','Equipo','Nadie juega solo.','Jugador, coach, familia y academia empujan juntos hacia la misma meta.'],
  ['05','Héroe','Respeto por el juego','Competimos con integridad.','Honramos el tenis, a nuestros rivales y la forma de trabajar de cada academia.']
];
// Íconos de línea, trazo 1.75 (mismos trazos que el componente original).
const SC_ICONS={
  back:'<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  next:'<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/>',
  message:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/>',
  chart:'<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-6"/>'
};
const scIcon=(name,size=24)=>`<svg class="sc-icon" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">${SC_ICONS[name]||''}</svg>`;
const scHeader=(eyebrow,arquetipo)=>`<div class="sc-eyebrow-row"><span class="sc-eyebrow">${eyebrow}</span>${arquetipo?`<span class="sc-pill">${arquetipo}</span>`:''}</div>`;

let sobreTab='mision',sobreReturn='welcome';
function sobreCordaPanel(tab){
  if(tab==='vision')return `${scHeader('Nuestra visión','El Héroe')}
    <h1 class="sc-h1" tabindex="-1">Que cada jugador llegue <span class="sc-accent">listo</span> a su próximo torneo.</h1>
    <p class="sc-lead">Queremos impulsar a la próxima generación de tenistas de México y Latinoamérica a competir a su máximo nivel, con academias que trabajan como un solo equipo.</p>
    <section class="sc-camino" aria-labelledby="sc-camino-titulo"><h2 id="sc-camino-titulo" class="sc-eyebrow sc-eyebrow--dark">Hacia dónde vamos</h2>
    <ol class="sc-camino__lista">${SC_CAMINO.map(([punto,titulo,texto])=>`<li class="sc-camino__item"><span class="sc-camino__punto sc-camino__punto--${punto}" aria-hidden="true"></span><div><div class="sc-h3">${titulo}</div><div class="sc-small sc-small--dark">${texto}</div></div></li>`).join('')}</ol></section>
    <button type="button" class="sc-btn sc-btn--primary" data-sc-tab="valores">Ver nuestros valores ${scIcon('next',18)}</button>`;
  if(tab==='valores')return `${scHeader('Nuestros valores')}
    <h1 class="sc-h1" tabindex="-1">Cómo jugamos.</h1>
    <p class="sc-lead">Cinco principios que guían cada sesión, cada feedback y cada decisión en CORDA.</p>
    <ol class="sc-valores">${SC_VALORES.map(([n,arquetipo,nombre,frase,texto])=>`<li class="sc-valor"><div class="sc-valor__top"><span class="sc-valor__n">${n}</span><span class="sc-pill sc-pill--muted">${arquetipo}</span></div><h2 class="sc-h3">${nombre}</h2><p class="sc-valor__frase">${frase}</p><p class="sc-small">${texto}</p></li>`).join('')}</ol>
    <button type="button" class="sc-btn sc-btn--secondary" data-sc-tab="mision">Volver a la misión</button>
    <p class="sc-firma">CORDA<span class="sc-wordmark__dot">.</span> Tu juego, con dirección.</p>`;
  return `${scHeader('Nuestra misión','El Mentor')}
    <h1 class="sc-h1" tabindex="-1">Ponerle dirección a cada entrenamiento.</h1>
    <p class="sc-lead">Somos el mentor que acompaña a cada jugador. Convertimos el trabajo de jugadores, coaches, familias y academias en un plan claro.</p>
    <ul class="sc-pilares">${SC_PILARES.map(([icon,titulo,texto])=>`<li class="sc-pilar"><span class="sc-pilar__icon">${scIcon(icon)}</span><div><h2 class="sc-h3">${titulo}</h2><p class="sc-small">${texto}</p></div></li>`).join('')}</ul>
    <button type="button" class="sc-btn sc-btn--primary" data-sc-tab="vision">Ver nuestra visión ${scIcon('next',18)}</button>`;
}
// Abre la sección. "from" es la pantalla a la que vuelve el botón de regreso.
function openSobreCorda(tab='mision',from=entry){
  if(from!=='about')sobreReturn=from;
  sobreTab=tab;entry='about';sobreCorda();
}
function sobreCorda(){
  document.documentElement.lang='es';
  $('#app').innerHTML=`<div class="sc-page"><div class="sc-screen" data-theme="cancha">
    <header class="sc-header"><button type="button" class="sc-icon-btn" id="sc-back" aria-label="Volver">${scIcon('back',20)}</button><span class="sc-wordmark" aria-label="CORDA">CORDA<span class="sc-wordmark__dot">.</span></span><span class="sc-header__spacer" aria-hidden="true"></span></header>
    <nav class="sc-tabs" aria-label="Sobre CORDA">${SC_TABS.map(([id,label])=>`<button type="button" class="sc-tab${sobreTab===id?' is-active':''}" data-sc-tab="${id}"${sobreTab===id?' aria-current="page"':''}>${label}</button>`).join('')}</nav>
    <main class="sc-main sc-main--${sobreTab}">${sobreCordaPanel(sobreTab)}</main></div></div>`;
  $('#sc-back').onclick=()=>{entry=sobreReturn;render();window.scrollTo(0,0)};
  document.querySelectorAll('[data-sc-tab]').forEach(button=>button.onclick=()=>{
    sobreTab=button.dataset.scTab;sobreCorda();
    window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    $('.sc-h1')?.focus({preventScroll:true});
  });
}
````

## Archivo: `dist/style.css`

````css
/* CORDA · Estilos de componentes
   Solo usa var(--token) de styles/tokens.css. Los únicos px que quedan son
   medidas de maquetación que el brand book no cubre (anchos de columna,
   tamaños de avatar, alturas de mapa o gráfica, cortes responsivos). */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap');

/* ============ Base ============ */
*{box-sizing:border-box}
html{background:var(--surface)}
body{margin:0;background:var(--surface);color:var(--ink);font-family:var(--font-sans);font-size:var(--body-size);line-height:var(--body-line);font-weight:var(--body-weight)}
button,input,select,textarea{font:inherit;color:inherit}
button{cursor:pointer;border:0;background:none;padding:0}
h1,h2,h3,p{margin:0}
h1{font-family:var(--font-display);font-size:var(--h1-size);line-height:var(--h1-line);font-weight:var(--h1-weight);letter-spacing:var(--h1-tracking)}
h2{font-family:var(--font-display);font-size:var(--h2-size);line-height:var(--h2-line);font-weight:var(--h2-weight);letter-spacing:var(--h2-tracking)}
h3{font-family:var(--font-display);font-size:var(--h3-size);line-height:var(--h3-line);font-weight:var(--h3-weight)}
p{font-size:var(--body-size);line-height:var(--body-line)}
small{font-size:var(--small-size);line-height:var(--small-line);font-weight:var(--small-weight);color:var(--ink-muted)}
b,strong{font-weight:600}
a{color:var(--ink);text-underline-offset:4px}
.muted,.hint{color:var(--ink-muted)}
.hint{font-size:var(--small-size);line-height:var(--small-line);margin:var(--space-4) 0}
.eyebrow{display:block;font-family:var(--font-display);font-size:var(--eyebrow-size);line-height:var(--eyebrow-line);font-weight:var(--eyebrow-weight);letter-spacing:var(--eyebrow-tracking);text-transform:uppercase;color:var(--ink-muted)}
.metric{font-family:var(--font-display);font-size:var(--metric-size);line-height:var(--metric-line);font-weight:var(--metric-weight);letter-spacing:var(--metric-tracking);font-variant-numeric:tabular-nums;margin:var(--space-4) 0 var(--space-2)}
.metric small{font-family:var(--font-sans)}
.divider{margin:var(--space-6) 0;border:0;border-top:1px solid var(--line)}
.full{grid-column:1/-1}
.row{display:flex;justify-content:space-between;align-items:center;gap:var(--space-3)}
.empty{padding:var(--space-12) var(--space-4);color:var(--ink-muted)}
[hidden]{display:none!important}

/* Foco visible en todo elemento interactivo */
:where(a,button,input,select,textarea,summary,[tabindex]):focus-visible{outline:2px solid var(--focus-ring);outline-offset:2px}
:where(input,select,textarea):focus{outline:2px solid var(--focus-ring);outline-offset:2px}

/* ============ Logotipo ============ */
.brand,.welcome-logo,.footer-brand{font-family:var(--font-display);font-weight:700;letter-spacing:var(--logo-tracking);text-transform:uppercase;color:var(--ink);min-width:72px}
.brand{font-size:var(--h2-size);line-height:var(--h2-line)}
.brand span,.welcome-logo span,.footer-brand span{color:var(--logo-dot)}

/* ============ Íconos ============ */
.icon{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;flex:none}

/* ============ Botones ============ */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:var(--space-2);min-height:48px;padding:0 var(--space-6);border-radius:var(--radius-md);border:1px solid var(--line);background:transparent;color:var(--ink);font-family:var(--font-sans);font-size:var(--label-size);line-height:var(--label-line);font-weight:var(--label-weight);text-decoration:none}
.btn.lime{background:var(--lima);border-color:var(--lima);color:var(--on-lima)}
.btn:disabled{opacity:.5;cursor:default}
.link{display:inline-flex;align-items:center;gap:var(--space-1);color:var(--ink);font-size:var(--label-size);line-height:var(--label-line);font-weight:var(--label-weight);text-decoration:underline;text-underline-offset:4px;padding:var(--space-2) 0}
.link+.link{margin-left:var(--space-4)}

/* ============ Formularios ============ */
label{display:block;font-size:var(--label-size);line-height:var(--label-line);font-weight:var(--label-weight);color:var(--ink)}
input,select,textarea{display:block;width:100%;min-height:48px;margin-top:var(--space-2);padding:var(--space-3);background:var(--surface-deep);border:1px solid var(--line);border-radius:var(--radius-sm);color:var(--ink);font-family:var(--font-sans);font-size:var(--body-size);line-height:var(--body-line);font-weight:var(--body-weight)}
input::placeholder,textarea::placeholder{color:var(--ink-muted)}
textarea{min-height:96px;resize:vertical}
input[type=checkbox],input[type=radio]{width:auto;min-height:0;margin:0;accent-color:var(--lima)}
input[type=file]{padding:var(--space-2)}
.formgrid{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)}
.formactions{display:flex;justify-content:space-between;align-items:center;gap:var(--space-4);margin-top:var(--space-8)}
.optional{font-weight:400;color:var(--ink-muted)}
.utr-field{margin-top:var(--space-4)}
#utr-tip{display:block;margin-top:var(--space-2)}

/* ============ Badge / estado ============ */
.badge{display:inline-block;padding:var(--space-1) var(--space-3);border-radius:var(--radius-pill);border:1px solid var(--line);background:var(--surface-deep);color:var(--ink);font-size:var(--caption-size);line-height:var(--caption-line);font-weight:var(--caption-weight)}
.badge.clay{background:var(--arena);border-color:var(--arena);color:var(--on-lima)}
.badge.gray{color:var(--ink-muted)}

/* ============ Avatar ============ */
.avatar{width:40px;height:40px;border-radius:var(--radius-pill);background:var(--surface-deep);border:1px solid var(--line);color:var(--ink);display:inline-grid;place-items:center;font-family:var(--font-display);font-size:var(--label-size);font-weight:600;object-fit:cover;flex:none}

/* ============ Tarjetas ============ */
.card,.agenda-main{background:var(--surface-raised);border:1px solid var(--line);border-radius:var(--radius-md);padding:var(--space-6)}
.card h2{margin:var(--space-2) 0}
.sectiontitle{display:flex;justify-content:space-between;align-items:center;gap:var(--space-4);margin-bottom:var(--space-6)}
.heading{display:flex;align-items:flex-end;justify-content:space-between;gap:var(--space-4);margin-bottom:var(--space-8)}
.heading p{margin-top:var(--space-2)}
.columns,.portal-grid,.flow-week{display:grid;gap:var(--space-8);margin-bottom:var(--space-8)}
.columns{grid-template-columns:1.6fr 1fr}
.portal-grid{grid-template-columns:minmax(0,1.5fr) minmax(0,1fr)}
.flow-week{grid-template-columns:1.35fr 1fr}
.flow-week .card b,.progress-entry b{display:block;margin-top:var(--space-4)}

/* Bloque de nota (sin borde lateral de color) */
.note,.rain-note,.coach-pinned,.month-observation,.fee-reference,.coach-month>div{margin:var(--space-4) 0;padding:var(--space-4);background:var(--surface-deep);border:1px solid var(--line);border-radius:var(--radius-md)}
.note small,.rain-note small,.coach-pinned small,.guide-frame small{display:block;font-family:var(--font-display);font-size:var(--eyebrow-size);line-height:var(--eyebrow-line);font-weight:var(--eyebrow-weight);letter-spacing:var(--eyebrow-tracking);text-transform:uppercase;color:var(--ink-muted)}
.rain-note h3,.coach-pinned h3{margin:var(--space-2) 0}
.rain-note b{display:block;margin:var(--space-2) 0 var(--space-1)}

/* Feedback del coach: arena con texto on-lima */
.coach-month>div.monthly-gain,.coach-pinned{background:var(--arena);border-color:var(--arena);color:var(--on-lima)}
.coach-month .monthly-gain b{display:flex;align-items:center;gap:var(--space-2);margin:0 0 var(--space-2);color:var(--on-lima)}
.coach-month .monthly-gain p,.coach-pinned p,.coach-pinned h3{color:var(--on-lima)}
.coach-pinned small{color:var(--on-lima)}
.gain-check{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:var(--radius-pill);background:var(--on-lima);color:var(--lima);font-size:var(--caption-size)}
.card.coach-month>div b{margin-top:0}
.review-period{display:block;margin-top:var(--space-1)}

/* ============ Toast y modal (flotantes: única sombra permitida) ============ */
#toast{position:fixed;bottom:var(--space-8);left:50%;transform:translateX(-50%);z-index:100;display:none;padding:var(--space-3) var(--space-6);background:var(--surface-raised);border:1px solid var(--line);border-radius:var(--radius-md);color:var(--ink);font-size:var(--small-size);line-height:var(--small-line);box-shadow:var(--shadow-card)}
dialog{max-width:560px;width:calc(100% - var(--space-8));padding:var(--space-8);border:1px solid var(--line);border-radius:var(--radius-lg);background:var(--surface-raised);color:var(--ink);box-shadow:var(--shadow-card)}
dialog::backdrop{background:color-mix(in srgb,var(--verde-noche) 65%,transparent)}
dialog form{margin-top:var(--space-6)}
#close,#meet-close{width:48px;height:48px;border-radius:var(--radius-md);color:var(--ink)}

/* ============ Intro con video ============ */
.welcome{position:relative;min-height:100svh;display:flex;align-items:center;justify-content:center;padding:var(--space-20) var(--space-6) var(--space-20);background:var(--verde-noche);isolation:isolate;overflow:hidden}
.welcome-film{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:55% center;z-index:-3}
.welcome-shade{position:absolute;inset:0;background:color-mix(in srgb,var(--verde-noche) 65%,transparent);z-index:-2}
.welcome-core{width:100%;max-width:420px;text-align:center}
.welcome-logo{font-size:var(--display-size);line-height:var(--display-line);letter-spacing:var(--display-tracking)}
.welcome-slogan{margin-top:var(--space-4);font-size:var(--body-lg-size);line-height:var(--body-lg-line);color:var(--ink)}
.welcome-actions{display:grid;gap:var(--space-3);max-width:320px;margin:var(--space-12) auto 0}
.welcome-personal{margin-top:var(--space-6);font-size:var(--small-size);line-height:var(--small-line);color:var(--ink-muted)}
.welcome-footer{position:absolute;left:0;right:0;bottom:var(--space-4);display:flex;align-items:center;justify-content:space-between;padding:0 var(--space-8);font-family:var(--font-display);font-size:var(--eyebrow-size);line-height:var(--eyebrow-line);font-weight:var(--eyebrow-weight);letter-spacing:var(--eyebrow-tracking);text-transform:uppercase;color:var(--ink-muted)}
.club-play,.banner-play{min-height:48px;padding:0 var(--space-4);border:1px solid var(--line);border-radius:var(--radius-md);background:var(--verde-noche);color:var(--ink);font-size:var(--label-size);line-height:var(--label-line);font-weight:var(--label-weight)}
#access-content{display:contents}
.cover-language{position:absolute;z-index:4;top:var(--space-6);right:var(--space-6);display:flex;align-items:center;gap:var(--space-2);padding:0 var(--space-3);background:var(--verde-noche);border:1px solid var(--line);border-radius:var(--radius-md);color:var(--ink)}
.cover-language select{width:auto;min-height:44px;margin:0;padding:0 var(--space-2);border:0;background:transparent;font-size:var(--label-size);font-weight:var(--label-weight)}
.cover-language span{color:var(--ink-muted)}

/* Secciones de portada (alineadas a la izquierda) */
.cover-mission,.cover-faq{padding:var(--space-20) var(--space-6)}
.cover-mission>*,.cover-faq>*{max-width:720px;margin-inline:auto}
.cover-mission{background:var(--surface)}
.cover-mission h2,.cover-faq h2{margin:var(--space-2) auto var(--space-6)}
.cover-mission p{font-size:var(--body-lg-size);line-height:var(--body-lg-line)}
.cover-faq{background:var(--surface-deep)}
.cover-faq details{border-bottom:1px solid var(--line)}
.cover-faq summary{padding:var(--space-4) 0;cursor:pointer;font-weight:600}
.cover-faq details p{padding:0 0 var(--space-4);color:var(--ink-muted)}
.founder-story{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1fr);align-items:center;gap:var(--space-12);max-width:1150px;margin:auto;padding:var(--space-20) var(--space-6)}
.founder-frame{aspect-ratio:1;display:grid;place-content:center;justify-items:center;gap:var(--space-3);background:var(--surface-raised);border:1px solid var(--line);border-radius:var(--radius-lg)}
.founder-copy h2{margin:var(--space-2) 0 var(--space-4)}
.founder-copy p{margin-bottom:var(--space-4)}
.founder-copy strong,.founder-copy>small:last-child{display:block}

/* Pie de contacto */
.contact-footer{display:grid;grid-template-columns:.8fr 1fr 1.1fr;gap:var(--space-8);margin-top:var(--space-12);padding:var(--space-8) var(--space-6);background:var(--verde-noche);border-top:1px solid var(--line);border-radius:var(--radius-lg);color:var(--ink)}
#access-footer>.contact-footer{margin:0;border-radius:0;padding:var(--space-12) var(--space-6)}
.footer-brand{font-size:var(--h2-size);line-height:var(--h2-line)}
.footer-brand small{display:block;margin-top:var(--space-2);font-family:var(--font-sans);font-weight:400;letter-spacing:0;text-transform:none}
.contact-footer details{margin-bottom:var(--space-3)}
.contact-footer summary,.contact-info b{font-weight:600;cursor:pointer}
.contact-footer details p{margin-top:var(--space-2);color:var(--ink-muted)}
.contact-info{display:grid;align-content:start;gap:var(--space-2)}
.contact-info a{text-decoration:none}
.contact-info a:hover{text-decoration:underline}
.contact-channel{display:inline-flex;align-items:center;gap:var(--space-2)}
.contact-channel svg{width:20px;height:20px;stroke:currentColor;stroke-width:1.75;fill:none}

/* ============ Acceso y registro ============ */
.access-panel{position:relative;z-index:1;width:100%;max-width:480px}
.access-panel h1{margin:var(--space-3) 0}
.access-panel p{color:var(--ink-muted)}
.access-panel form label{margin-top:var(--space-4)}
.access-roles{display:grid;gap:var(--space-3);margin:var(--space-6) 0}
.access-roles button{display:grid;gap:var(--space-1);padding:var(--space-4);text-align:left;background:var(--surface-raised);border:1px solid var(--line);border-radius:var(--radius-md);color:var(--ink)}
.access-roles button strong{font-size:var(--label-size);line-height:var(--label-line)}
.access-roles button:hover{border-color:var(--verde-medio);background:var(--verde-medio)}
.access-back{min-height:48px;color:var(--ink);font-size:var(--label-size);line-height:var(--label-line);font-weight:var(--label-weight);text-decoration:underline;text-underline-offset:4px}
.access-panel .formactions .access-back{text-decoration:none}
.auth-form .password-field{display:flex;align-items:flex-end;gap:var(--space-2)}
.auth-form .password-field input{flex:1}
.password-toggle{min-height:48px;padding:0 var(--space-4);border:1px solid var(--line);border-radius:var(--radius-md);font-size:var(--label-size);font-weight:var(--label-weight)}
.auth-form .remember-me{display:flex;align-items:center;gap:var(--space-3);font-weight:400}
.auth-error{margin-top:var(--space-4);padding:var(--space-3);border:1px solid var(--danger);border-radius:var(--radius-sm);color:var(--danger);font-size:var(--small-size);line-height:var(--small-line)}

/* Registro paso a paso */
.wizard{align-items:center;padding:var(--space-20) var(--space-6)}
.wizard-top{position:absolute;top:var(--space-6);left:var(--space-6);right:var(--space-6);display:flex;justify-content:space-between;align-items:center}
.wizard-panel{position:relative;width:100%;max-width:460px}
.wizard-progress{display:flex;gap:var(--space-2);margin-bottom:var(--space-6)}
.wizard-progress i{flex:1;height:4px;border-radius:var(--radius-sm);background:var(--line)}
.wizard-progress i.active{background:var(--ink)}
.wizard-count{display:flex;justify-content:space-between;margin-bottom:var(--space-4);font-family:var(--font-display);font-size:var(--eyebrow-size);line-height:var(--eyebrow-line);font-weight:var(--eyebrow-weight);letter-spacing:var(--eyebrow-tracking);color:var(--ink)}
.wizard-count span{color:var(--ink-muted)}
.wizard-panel h1{outline:none}
.wizard-description{margin:var(--space-3) 0 var(--space-8);color:var(--ink-muted)}
.wizard-helper{margin-top:var(--space-4);font-size:var(--small-size);line-height:var(--small-line);color:var(--ink-muted)}
.wizard-foot{position:absolute;bottom:var(--space-6);left:var(--space-6);right:var(--space-6);text-align:center;font-size:var(--caption-size);line-height:var(--caption-line);font-weight:var(--caption-weight);color:var(--ink-muted)}
.choice-grid{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);margin-top:var(--space-3)}
.choice{position:relative;cursor:pointer}
.choice input{position:absolute;opacity:0;width:1px;height:1px}
.choice>span{display:block;height:100%;padding:var(--space-4);background:var(--surface-deep);border:1px solid var(--line);border-radius:var(--radius-md)}
.choice strong{display:block;font-size:var(--label-size);line-height:var(--label-line)}
.choice small{display:block;margin-top:var(--space-1);font-size:var(--caption-size);line-height:var(--caption-line);font-weight:400}
.choice input:checked+span{background:var(--verde-medio);border-color:var(--verde-medio)}
.choice input:checked+span small{color:var(--ink)}
.choice input:focus-visible+span{outline:2px solid var(--focus-ring);outline-offset:2px}
.wizard-photo{display:flex;flex-direction:column;align-items:flex-start;gap:var(--space-4)}
.wizard-photo .avatar{width:112px;height:112px;font-size:var(--h2-size)}
.photo-picker{display:inline-flex;align-items:center;min-height:48px;padding:0 var(--space-6);border:1px solid var(--line);border-radius:var(--radius-md);cursor:pointer}
.photo-picker input{position:absolute;width:1px;height:1px;opacity:0}
.photo-picker:focus-within{outline:2px solid var(--focus-ring);outline-offset:2px}

/* ============ App: marco ============ */
.shell{display:grid;grid-template-columns:240px 1fr;min-height:100vh;background:var(--surface)}
.shell>div{min-width:0}
.sidebar{position:sticky;top:0;height:100vh;display:flex;flex-direction:column;padding:var(--space-8) var(--space-4);background:var(--verde-noche);border-right:1px solid var(--line)}
.sidebar>.brand{padding:0 var(--space-3) var(--space-8)}
.workspace{padding:var(--space-4) var(--space-3);margin-bottom:var(--space-6);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.workspace strong{display:block;margin:var(--space-2) 0;font-size:var(--small-size);line-height:var(--small-line)}
.nav{display:grid;gap:var(--space-1)}
.nav button{display:flex;align-items:center;gap:var(--space-3);min-height:48px;padding:0 var(--space-3);border-radius:var(--radius-md);text-align:left;color:var(--ink-muted);font-size:var(--label-size);line-height:var(--label-line);font-weight:var(--label-weight)}
.nav button:hover{color:var(--ink)}
.nav button.active{background:var(--verde-medio);color:var(--ink)}
.sidebarfooter{margin-top:auto;padding-top:var(--space-6)}
.demo{padding:var(--space-3);border:1px solid var(--line);border-radius:var(--radius-md);font-size:var(--caption-size);line-height:var(--caption-line);font-weight:var(--caption-weight);color:var(--ink-muted)}
.topbar{display:flex;align-items:center;justify-content:space-between;gap:var(--space-4);padding:var(--space-4) var(--space-8);background:var(--surface);border-bottom:1px solid var(--line)}
.topbar>.muted{font-size:var(--small-size);line-height:var(--small-line)}
.topbar strong{color:var(--ink)}
.mobilebrand{display:none}
.portal-tools{display:flex;align-items:center;gap:var(--space-2)}
.portal-tools .cover-language{position:static}
.main{max-width:1440px;margin:auto;padding:var(--space-12) var(--space-8)}
.account-link{margin-top:var(--space-8)}

/* ============ Agenda y sesiones ============ */
.plan-tabs{display:flex;gap:var(--space-2);margin-bottom:var(--space-6)}
.plan-tabs button{min-height:48px;padding:0 var(--space-6);border:1px solid var(--line);border-radius:var(--radius-md);font-size:var(--label-size);font-weight:var(--label-weight);color:var(--ink)}
.plan-tabs button[aria-pressed=true]{background:var(--verde-medio);border-color:var(--verde-medio)}
.days-strip{display:flex;gap:var(--space-1);margin:var(--space-4) 0 var(--space-6)}
.days-strip button{flex:1;display:grid;justify-items:center;gap:var(--space-1);padding:var(--space-2) var(--space-1);border:1px solid var(--line);border-radius:var(--radius-md);background:var(--surface-deep);color:var(--ink)}
.days-strip button small{font-size:var(--caption-size);line-height:var(--caption-line)}
.days-strip b{font-family:var(--font-display);font-size:var(--h3-size);line-height:var(--h3-line);font-variant-numeric:tabular-nums}
.days-strip button.chosen{background:var(--verde-medio);border-color:var(--verde-medio)}
.days-strip button.chosen small{color:var(--ink)}
.days-strip i{width:4px;height:4px;border-radius:var(--radius-pill)}
.days-strip .booked{background:var(--ink-muted)}
.days-strip .chosen .booked{background:var(--ink)}
.agenda-event{display:flex;gap:var(--space-4);padding:var(--space-6) 0;border-bottom:1px solid var(--line)}
.agenda-event:last-child{border:0}
.agenda-event h3{margin:var(--space-2) 0}
.agenda-event h3+small{display:block;margin:var(--space-1) 0 var(--space-2)}
.agenda-event p{font-size:var(--small-size);line-height:var(--small-line);color:var(--ink-muted)}
.event-clock b{font-family:var(--font-display);font-size:var(--h3-size);line-height:var(--h3-line);font-weight:600;font-variant-numeric:tabular-nums}
.event-clock small{display:block;margin:var(--space-1) 0}
.past-session{color:var(--ink-muted);text-decoration-thickness:1px}
.session{display:flex;align-items:center;gap:var(--space-4);padding:var(--space-4) 0;border-bottom:1px solid var(--line)}
.session:last-child{border:0;padding-bottom:0}
.session h3{margin-top:var(--space-2)}
.session>div:not(.time){flex:1}
.time{width:64px;flex:none;font-family:var(--font-display);font-weight:600}
.time small{display:block;margin-top:var(--space-1);font-family:var(--font-sans)}
.sessioninfo{flex:1}
.sessioninfo p{margin-top:var(--space-2);font-size:var(--small-size);line-height:var(--small-line);color:var(--ink-muted)}
.session .btn{flex:none}

/* Tarjeta de próxima sesión */
.next-card{position:relative;isolation:isolate;overflow:hidden;padding:var(--space-6);background:var(--surface-raised);border:1px solid var(--line);border-radius:var(--radius-md)}
.next-card>small{display:block;font-family:var(--font-display);font-size:var(--eyebrow-size);line-height:var(--eyebrow-line);font-weight:var(--eyebrow-weight);letter-spacing:var(--eyebrow-tracking);text-transform:uppercase;color:var(--ink)}
.next-card h3{margin:var(--space-3) 0 var(--space-2)}
.next-card p{margin-top:var(--space-2)}
.next-card .next-meta{font-size:var(--small-size);line-height:var(--small-line)}
.next-actions{display:flex;align-items:center;flex-wrap:wrap;gap:var(--space-4);margin-top:var(--space-6)}
.next-confirm{display:inline-flex;align-items:center;min-height:48px;padding:0 var(--space-6);border:1px solid var(--lima);border-radius:var(--radius-md);background:var(--lima);color:var(--on-lima);font-size:var(--label-size);line-height:var(--label-line);font-weight:var(--label-weight)}
.next-confirm[aria-pressed=true]{background:transparent;border-color:var(--line);color:var(--ink)}
.session-when{display:flex;align-items:center;gap:var(--space-4);margin:var(--space-4) 0}
.session-when b{font-family:var(--font-display);font-size:var(--metric-size);line-height:var(--metric-line);font-weight:var(--metric-weight);letter-spacing:var(--metric-tracking);font-variant-numeric:tabular-nums}
.session-when span{font-size:var(--small-size);line-height:var(--small-line);color:var(--ink)}
.next-photo .activity-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 42%;z-index:-2}
.next-photo:before{content:'';position:absolute;inset:0;z-index:-1;background:color-mix(in srgb,var(--verde-noche) 65%,transparent)}

/* Torneo: tarjeta destacada en arena */
.tournament{align-self:start;background:var(--arena);border-color:var(--arena);color:var(--on-lima)}
.tournament .eyebrow,.tournament p,.tournament small,.tournament .link{color:var(--on-lima)}
.tournament h2{margin:var(--space-4) 0 var(--space-2)}
.countdown{margin:var(--space-6) 0;font-family:var(--font-display);font-size:var(--metric-size);line-height:var(--metric-line);font-weight:var(--metric-weight);letter-spacing:var(--metric-tracking);font-variant-numeric:tabular-nums}
.countdown small{font-family:var(--font-sans);letter-spacing:0}
.tourney-road{display:grid;grid-template-columns:repeat(4,1fr);list-style:none;padding:0;margin:var(--space-4) 0 0}
.tourney-road li{position:relative;display:grid;align-content:start;gap:var(--space-2);padding-right:var(--space-2)}
.tourney-road li:before{content:'';position:absolute;left:0;right:0;top:4px;border-top:1px solid var(--on-lima)}
.tourney-road li:last-child:before{display:none}
.tourney-road i{position:relative;width:10px;height:10px;border-radius:var(--radius-pill);background:var(--arena);border:1px solid var(--on-lima)}
.tourney-road b{font-size:var(--caption-size);line-height:var(--caption-line)}
.tourney-road small{font-size:var(--caption-size);line-height:var(--caption-line)}
.tourney-road .reached i{background:var(--on-lima)}
.tourney-road .current i{outline:2px solid var(--on-lima);outline-offset:2px}

/* Banner de la academia */
.player-banner{position:relative;isolation:isolate;overflow:hidden;display:flex;align-items:center;min-height:160px;margin-bottom:var(--space-8);background:var(--verde-noche);border:1px solid var(--line);border-radius:var(--radius-lg)}
.player-banner video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:52% 32%;z-index:-2}
.player-banner:before{content:'';position:absolute;inset:0;background:color-mix(in srgb,var(--verde-noche) 65%,transparent);z-index:-1}
.banner-copy{padding:var(--space-6)}
.banner-copy small{display:block;font-family:var(--font-display);font-size:var(--eyebrow-size);line-height:var(--eyebrow-line);font-weight:var(--eyebrow-weight);letter-spacing:var(--eyebrow-tracking);color:var(--ink)}
.banner-copy h2{margin:var(--space-2) 0}
.banner-copy button{min-height:48px;font-size:var(--label-size);font-weight:var(--label-weight);text-decoration:underline;text-underline-offset:4px}
.banner-play{position:absolute;right:var(--space-4);bottom:var(--space-4)}

/* Guía de la sesión */
.mini-guide{padding:var(--space-4);background:var(--surface-deep);border:1px solid var(--line);border-radius:var(--radius-md)}
.guide-frames{min-height:96px;padding:var(--space-4) 0 var(--space-1)}
.guide-frame p{margin-top:var(--space-2)}
.guide-controls{display:flex;align-items:center;justify-content:space-between;font-size:var(--caption-size);line-height:var(--caption-line);color:var(--ink-muted)}
.guide-controls button{min-width:48px;min-height:48px;border:1px solid var(--line);border-radius:var(--radius-md);color:var(--ink)}

/* ============ Progreso ============ */
.goal{padding:var(--space-4) 0;border-bottom:1px solid var(--line)}
.goal:last-child{border:0}
.goal h3{margin:var(--space-2) 0}
.goal p{font-size:var(--small-size);line-height:var(--small-line);color:var(--ink-muted)}
.progress{height:6px;margin:var(--space-3) 0 var(--space-2);overflow:hidden;border-radius:var(--radius-sm);background:var(--surface-deep)}
.progress i{display:block;height:100%;background:var(--lima)}
.progress-entry{padding:var(--space-4) 0;border-top:1px solid var(--line)}
.progress-entry h3{margin-top:var(--space-2)}
.annual-example{margin-bottom:var(--space-8)}
.annual-top{display:flex;justify-content:space-between;align-items:flex-start;gap:var(--space-4);margin-bottom:var(--space-6)}
.annual-top p,.next-target p{color:var(--ink-muted)}
.annual-score{font-family:var(--font-display);font-size:var(--metric-size);line-height:var(--metric-line);font-weight:var(--metric-weight);letter-spacing:var(--metric-tracking);color:var(--accent-text);white-space:nowrap;font-variant-numeric:tabular-nums}
.annual-score small{display:block;font-family:var(--font-sans);letter-spacing:0;font-size:var(--caption-size);line-height:var(--caption-line)}
.annual-chart{display:block;width:100%;height:auto;margin:var(--space-4) 0}
.annual-chart text{font-family:var(--font-sans);font-size:var(--caption-size);fill:var(--ink-muted)}
.chart-grid{stroke:var(--line)}
.chart-line{fill:none;stroke:var(--lima);stroke-width:2.5;stroke-linejoin:round}
.chart-area{display:none}
.chart-dot{fill:var(--verde-medio);stroke:var(--ink);stroke-width:1}
.chart-dot.selected{fill:var(--ink)}
.chart-milestone{fill:var(--lima);stroke:var(--on-lima);stroke-width:1.5}
.chart-hit{fill:transparent}
.chart-point{cursor:pointer}
.chart-range{display:inline-flex;align-items:center;gap:var(--space-2);margin:0 0 var(--space-2);padding:0 var(--space-3);min-height:48px;border:1px solid var(--line);border-radius:var(--radius-md);background:var(--surface-deep);color:var(--ink)}
.chart-range:hover,.chart-range:focus-within{border-color:var(--ink)}
.chart-range span{font-size:var(--caption-size);line-height:var(--caption-line);color:var(--ink-muted)}
.chart-range select{width:auto;min-height:46px;margin:0;padding:0 var(--space-2);border:0;background:transparent;color:var(--ink);font-size:var(--label-size);font-weight:var(--label-weight);cursor:pointer}
.chart-months{display:grid;grid-template-columns:repeat(auto-fit,minmax(48px,1fr));gap:var(--space-1)}
.chart-months button{min-height:48px;padding:var(--space-1);border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--surface-deep);color:var(--ink)}
.chart-months small,.chart-months b{display:block;font-size:var(--caption-size);line-height:var(--caption-line)}
.chart-months b{font-family:var(--font-display);font-variant-numeric:tabular-nums}
.chart-months button[aria-pressed=true]{background:var(--verde-medio);border-color:var(--verde-medio)}
.chart-months button[aria-pressed=true] small{color:var(--ink)}
.tournament-key span,.chart-months small span{color:var(--lima)}
.month-observation b{display:block;margin:var(--space-2) 0 var(--space-1)}
.tournament-note{margin-top:var(--space-4);padding-top:var(--space-4);border-top:1px solid var(--line)}
.tournament-note p{margin:0 0 var(--space-2)}
.next-target{padding-top:var(--space-4);border-top:1px solid var(--line)}
.next-target h3{margin:var(--space-2) 0}
.coach-month h2{margin:var(--space-2) 0}

/* Gimnasio */
.exercise{display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-3);padding:var(--space-4);background:var(--surface-deep);border:1px solid var(--line);border-radius:var(--radius-md)}
.exercise h3{margin-bottom:var(--space-1)}
.exercise>div{flex:1}
.exercise .number{font-family:var(--font-display);font-size:var(--h2-size);line-height:var(--h2-line);color:var(--ink-muted)}
.check{width:48px;height:48px;flex:none;display:grid;place-items:center;border:1px solid var(--line);border-radius:var(--radius-pill);color:var(--on-lima)}
.check.done{background:var(--lima);border-color:var(--lima)}

/* Perfil */
.profileheader{display:flex;align-items:center;gap:var(--space-6);margin-bottom:var(--space-6)}
.profileheader h2{margin-top:var(--space-2)}
.profileheader .avatar{width:80px;height:80px;font-size:var(--h2-size)}
.columns .formgrid h3{margin-top:var(--space-2)}

/* Jugadores (vista coach) */
.athlete-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr));gap:var(--space-8)}
.athlete-list .row{justify-content:flex-start}
.athlete-list small{display:block;margin:var(--space-4) 0 var(--space-1)}
.athlete-name{color:var(--ink);text-align:left;font:inherit}
.athlete-name:hover{text-decoration:underline;text-underline-offset:4px}

/* ============ Mi academia ============ */
.club-cover{position:relative;isolation:isolate;overflow:hidden;display:flex;align-items:flex-end;min-height:420px;margin-bottom:var(--space-12);background:var(--verde-noche);border-radius:var(--radius-lg);color:var(--ink)}
.club-background{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2}
.club-cover:after{content:'';position:absolute;inset:0;background:color-mix(in srgb,var(--verde-noche) 65%,transparent);z-index:-1}
.club-identity{width:100%;max-width:800px;padding:var(--space-8)}
.club-identity h1{margin:var(--space-3) 0 var(--space-6);overflow-wrap:anywhere}
.club-mark{max-width:160px;height:64px;margin-bottom:var(--space-4);object-fit:contain;object-position:left}
.club-actions{display:flex;align-items:center;gap:var(--space-4);flex-wrap:wrap}
.club-play{position:absolute;top:var(--space-4);right:var(--space-4)}
.club-scroll{position:absolute;right:var(--space-4);bottom:var(--space-4);min-height:48px;display:inline-flex;align-items:center;gap:var(--space-2);color:var(--ink);font-size:var(--label-size);font-weight:var(--label-weight)}
#academic-board,#academic-map,#academic-roster{margin-top:var(--space-12)}
#academic-board h2{margin:var(--space-2) 0 var(--space-4)}
.group-feed{overflow:auto}
.group-post{padding:var(--space-3) 0;border-bottom:1px solid var(--line);overflow-wrap:anywhere}
.group-post p{white-space:pre-wrap}
.group-post h3{margin:var(--space-2) 0}
.roster-section{margin:var(--space-8) 0}
.roster-section>h2{margin-bottom:var(--space-4)}
.directory-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(240px,100%),1fr));gap:var(--space-8)}
.directory-card h2{margin:var(--space-4) 0 var(--space-2)}
.club-person{display:flex;flex-direction:column;align-items:flex-start}
.club-person .person-photo .avatar{width:96px;height:96px;font-size:var(--h2-size)}
.club-person .badge{margin-top:var(--space-3)}
.bio,.person-contact{overflow-wrap:anywhere}
.club-person .bio{margin-bottom:var(--space-4);color:var(--ink-muted)}
.person-contact{display:grid;gap:var(--space-2);justify-items:start;width:100%;margin-top:auto;padding-top:var(--space-4);border-top:1px solid var(--line)}
.member-edit{margin-top:var(--space-3)}
#academic-map iframe{width:100%;height:260px;margin:var(--space-4) 0;border:1px solid var(--line);border-radius:var(--radius-lg);background:var(--surface-deep)}
.academy-columns>section,#academic-roster,#academic-map{scroll-margin-top:var(--space-4)}

/* ============ Citas ============ */
.meeting-card>.btn{margin-top:var(--space-2)}
.meeting-card>.link{margin-left:var(--space-4)}
.meeting-receipt{margin-top:var(--space-3);padding:var(--space-3) 0;border-top:1px solid var(--line)}
.meeting-receipt b,.meet-people small{display:block}
.meet-people{display:grid;gap:var(--space-2);margin:var(--space-4) 0}
.meet-people button,.meet-slots button,.meet-week button{border:1px solid var(--line);border-radius:var(--radius-md);background:var(--surface-deep);color:var(--ink)}
.meet-people button{display:flex;align-items:center;gap:var(--space-3);min-height:56px;padding:var(--space-2) var(--space-3);text-align:left}
.meet-people [aria-pressed=true],.meet-week [aria-pressed=true],.meet-slots [aria-pressed=true]{background:var(--verde-medio);border-color:var(--verde-medio)}
.meet-people .meet-circle{width:24px;height:24px;flex:none;display:grid;place-items:center;border:1px solid var(--ink-muted);border-radius:var(--radius-pill);font-size:var(--caption-size);color:var(--on-lima)}
.meet-people [aria-pressed=true] .meet-circle{background:var(--lima);border-color:var(--lima)}
.meet-people [aria-pressed=true] .meet-circle:after{content:'✓'}
.meet-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:var(--space-1);margin:var(--space-4) 0}
.meet-week button{padding:var(--space-2) var(--space-1)}
.meet-week b,.meet-week small{display:block}
.meet-week small{font-size:var(--caption-size);line-height:var(--caption-line)}
.meet-slots{display:grid;gap:var(--space-2);max-height:32vh;margin:var(--space-3) 0;overflow:auto}
.meet-slots button{display:flex;align-items:center;gap:var(--space-3);min-height:48px;padding:var(--space-2) var(--space-3);text-align:left}
.meet-slots button:disabled,.meet-week button:disabled{opacity:.5}
.office-row{display:grid;grid-template-columns:1fr 96px auto 96px;align-items:center;gap:var(--space-2);margin:var(--space-2) 0}
.office-row label{display:flex;align-items:center;gap:var(--space-2)}
.office-row select{margin:0}
.meeting-person,#office-form>.btn{margin-top:var(--space-4)}

/* ============ Mensualidad ============ */
.fee-months{display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-2);margin-top:var(--space-4)}
.fee-months button{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);text-align:left;border:1px solid var(--line);border-radius:var(--radius-md);background:var(--surface-deep);color:var(--ink)}
.fee-months button[aria-pressed=true]{background:var(--verde-medio);border-color:var(--verde-medio)}
.fee-months button[aria-pressed=true] small{color:var(--ink)}
.fee-months b,.fee-months small{display:block}
.fee-months b::first-letter,.fee-detail h2::first-letter{text-transform:uppercase}
.fee-dot{width:24px;height:24px;flex:none;display:grid;place-items:center;border:1px solid var(--ink-muted);border-radius:var(--radius-pill);font-size:var(--caption-size);color:var(--ink)}
.fee-dot.paid{background:var(--lima);border-color:var(--lima);color:var(--on-lima)}
.fee-dot.review{border-color:var(--arena);color:var(--arena)}
.fee-detail{margin-top:var(--space-8)}
.fee-detail h2{margin:var(--space-2) 0}
.fee-steps{padding-left:var(--space-6)}
.fee-steps li{margin-bottom:var(--space-3)}
.fee-reference b,.fee-reference small{display:block}
.fee-reference b{font-family:var(--font-display);font-size:var(--h3-size);line-height:var(--h3-line)}
.bank-info{display:grid;grid-template-columns:auto 1fr;gap:var(--space-2) var(--space-4);font-size:var(--small-size);line-height:var(--small-line)}
.bank-info dt{color:var(--ink-muted)}
.bank-info dd{margin:0;overflow-wrap:anywhere}
.fee-upload{margin:var(--space-4) 0}
.fee-upload small{display:block;margin:var(--space-2) 0}

/* Pagos privados */
.private-week,.private-totals,.private-receipt{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3)}
.private-totals{margin-top:var(--space-4);padding-top:var(--space-4);border-top:1px solid var(--line)}
.private-totals b,.private-totals small{display:block}
.private-totals b{font-family:var(--font-display);font-size:var(--h3-size);line-height:var(--h3-line);font-variant-numeric:tabular-nums}
.private-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr));gap:var(--space-8);margin-top:var(--space-8)}
.private-list h3,.private-file{margin:var(--space-4) 0}
.private-preview{display:block;width:100%;height:46vh;margin:var(--space-3) 0;object-fit:contain}
.private-receipt{flex-wrap:wrap;padding:var(--space-2) 0;border-top:1px solid var(--line);overflow-wrap:anywhere}

/* ============ Responsivo (móvil primero en márgenes y separaciones) ============ */
@media(max-width:1000px){
  .shell{grid-template-columns:200px 1fr}
  .columns,.portal-grid{grid-template-columns:1fr}
  .main{padding:var(--space-8) var(--space-6)}
}
@media(max-width:780px){
  .flow-week{grid-template-columns:1fr}
  .fee-months{grid-template-columns:repeat(3,1fr)}
  .contact-footer{grid-template-columns:1fr}
}
@media(max-width:680px){
  .shell{display:block}
  .sidebar{position:fixed;top:auto;bottom:0;z-index:20;width:100%;height:calc(72px + env(safe-area-inset-bottom));padding:var(--space-1) var(--space-1) env(safe-area-inset-bottom);border-right:0;border-top:1px solid var(--line)}
  .sidebar>.brand,.workspace,.sidebarfooter{display:none}
  .nav{display:flex;gap:0;overflow-x:auto}
  .nav button{flex:1 0 auto;flex-direction:column;justify-content:center;gap:var(--space-1);padding:0 var(--space-2);font-size:var(--caption-size);line-height:var(--caption-line);white-space:nowrap}
  .topbar{padding:var(--space-3) var(--space-4)}
  .topbar>.muted{display:none}
  .mobilebrand{display:block}
  .main{padding:var(--space-6) var(--space-4) calc(var(--space-20) + env(safe-area-inset-bottom))}
  .heading{align-items:flex-start;flex-direction:column}
  .formgrid,.choice-grid{grid-template-columns:1fr}
  .tourney-road{gap:var(--space-1)}
  .welcome-footer{padding:0 var(--space-4)}
  .welcome-social{top:var(--space-4);left:var(--space-4)}
  .welcome-scroll{bottom:var(--space-20)}
  .cover-language{top:var(--space-4);right:var(--space-4)}
  .cover-mission,.cover-faq,.founder-story{padding:var(--space-12) var(--space-4)}
  .founder-story{grid-template-columns:1fr;gap:var(--space-6)}
  .wizard{padding:var(--space-20) var(--space-4)}
  .wizard-top{top:var(--space-4);left:var(--space-4);right:var(--space-4)}
  .club-cover{min-height:360px}
  .club-identity{padding:var(--space-6)}
  .chart-months.is-dense{grid-template-columns:repeat(6,1fr)}
  .portal-tools .cover-language span{display:none}
  .directory-grid{grid-template-columns:1fr}
}
@media(max-width:520px){
  .fee-months{grid-template-columns:repeat(2,1fr)}
}

/* Pie de la portada: los tres textos con la misma caja y la misma línea base */
.welcome-links{display:flex;align-items:center;gap:var(--space-6)}
.welcome-footer__item{display:inline-flex;align-items:center;min-height:48px;padding:0;color:inherit;font:inherit;letter-spacing:inherit;text-transform:inherit;text-decoration:none}
a.welcome-footer__item:hover,button.welcome-footer__item:hover{color:var(--ink);text-decoration:underline;text-underline-offset:4px}

/* Accesos directos arriba a la izquierda */
.welcome-social{position:absolute;top:var(--space-6);left:var(--space-6);z-index:4;display:flex;gap:var(--space-2)}
.welcome-social a{width:48px;height:48px;display:grid;place-items:center;border:1px solid var(--line);border-radius:var(--radius-md);background:var(--verde-noche);color:var(--ink)}
.welcome-social a:hover{border-color:var(--ink)}
.welcome-social svg,.welcome-scroll svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}

/* Flecha que invita a bajar a la misión y al fundador */
.welcome-scroll{position:absolute;left:0;right:0;bottom:var(--space-20);margin:0 auto;width:48px;height:48px;display:grid;place-items:center;color:var(--ink);animation:welcome-bounce 1.8s ease-in-out infinite}
.welcome-scroll svg{width:24px;height:24px}
@keyframes welcome-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(var(--space-2))}}
@media(prefers-reduced-motion:reduce){.welcome-scroll{animation:none}}
.welcome-footer__item{white-space:nowrap}
@media(max-width:520px){
  .welcome-footer{flex-direction:column;align-items:flex-start;gap:0}
  .welcome-scroll{bottom:calc(var(--space-20) + var(--space-12))}
}
.cover-mission .btn{margin-top:var(--space-6)}

/* ============ Reseñas (portada) ============ */
.cover-reviews{padding:var(--space-20) 0;background:var(--surface-deep);overflow:hidden}
.cover-reviews__head{max-width:720px;margin:0 auto var(--space-8);padding:0 var(--space-6)}
.cover-reviews__head h2{margin:var(--space-2) 0 var(--space-3)}
.reviews-viewport{overflow:hidden}
.reviews-track{display:flex;gap:var(--space-6);width:max-content;padding:0 var(--space-6);animation:reviews-scroll 60s linear infinite}
/* Se detiene al pasar el mouse o al enfocar con teclado, para poder leer con calma */
.reviews-viewport:hover .reviews-track,.reviews-viewport:focus-within .reviews-track{animation-play-state:paused}
@keyframes reviews-scroll{from{transform:translateX(0)}to{transform:translateX(calc(-50% + var(--space-3)))}}
.review-card{flex:none;width:320px;margin:0;display:flex;flex-direction:column;gap:var(--space-4);padding:var(--space-6);background:var(--surface-raised);border:1px solid var(--line);border-radius:var(--radius-md)}
.review-stars{display:flex;gap:var(--space-1);color:var(--lima)}
.review-stars svg{width:20px;height:20px;fill:currentColor}
.review-card blockquote{flex:1;margin:0;font-size:var(--body-size);line-height:var(--body-line);color:var(--ink)}
.review-card figcaption{display:flex;align-items:center;gap:var(--space-3)}
.review-card figcaption b{display:block;font-size:var(--label-size);line-height:var(--label-line)}
.review-card figcaption small{display:block}
.review-avatar{position:relative;width:48px;height:48px;overflow:hidden}
.review-avatar img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
/* Sin movimiento si la persona lo pidió en su sistema: fila que se desliza a mano */
@media(prefers-reduced-motion:reduce){
  .reviews-viewport{overflow-x:auto}
  .reviews-track{animation:none}
  .review-card[aria-hidden="true"]{display:none}
}
@media(max-width:680px){
  .cover-reviews{padding:var(--space-12) 0}
  .cover-reviews__head{padding:0 var(--space-4)}
  .reviews-track{gap:var(--space-4);padding:0 var(--space-4)}
  .review-card{width:280px}
  @keyframes reviews-scroll{from{transform:translateX(0)}to{transform:translateX(calc(-50% + var(--space-2)))}}
}

/* ============ Mi progreso · encuestas y tres gráficas (progress-hub.js) ============ */
.progress-hub{display:grid;gap:var(--space-6);margin-bottom:var(--space-8)}
.progress-hub .card{margin:0}
.hub-top{display:flex;justify-content:space-between;align-items:flex-start;gap:var(--space-4);flex-wrap:wrap}
.hub-goal{margin:var(--space-4) 0;padding:var(--space-4);border:1px solid var(--line);border-radius:var(--radius-md);background:var(--surface-deep)}
.hub-goal small{display:block;font-size:var(--eyebrow-size);line-height:var(--eyebrow-line);letter-spacing:var(--eyebrow-tracking);font-weight:var(--eyebrow-weight);text-transform:uppercase;color:var(--accent-text)}
.hub-goal p{margin:var(--space-1) 0 0;font-size:var(--body-lg-size);line-height:var(--body-lg-line)}
.hub-now{display:flex;gap:var(--space-6);align-items:flex-start;flex-wrap:wrap;margin:var(--space-4) 0}
.hub-facts{margin:0;padding:0;list-style:none;display:grid;gap:var(--space-2);flex:1;min-width:220px}
.hub-up{color:var(--accent-text)}
.hub-down,.hub-tourney-dot,.hub-tourney span{color:var(--arena)}
.hub-notes{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)}
.hub-notes>div{padding:var(--space-4);border:1px solid var(--line);border-radius:var(--radius-md)}
.hub-notes p{margin:var(--space-1) 0 0}
.hub-label{display:block;font-size:var(--label-size);line-height:var(--label-line)}
.hub-agree{margin:var(--space-4) 0;color:var(--ink-muted)}
.hub-empty{margin:var(--space-6) 0}
.hub-svg text{font-size:var(--caption-size)}
.chart-goal{stroke:var(--accent-text);stroke-dasharray:4 4}
.chart-line.is-player{stroke:var(--lima)}
.chart-line.is-coach{stroke:var(--ink);stroke-dasharray:6 4}
.chart-dot.is-player{fill:var(--lima);stroke:var(--verde-noche)}
.chart-dot.is-coach{fill:var(--ink);stroke:var(--verde-noche)}
.chart-dot.selected{stroke:var(--ink);stroke-width:2}
.chart-guide{stroke:var(--ink-muted);stroke-width:1}
.chart-tourney line{stroke:var(--arena);stroke-dasharray:2 3}
.chart-tourney circle{fill:var(--arena)}
.hub-legend{display:flex;flex-wrap:wrap;gap:var(--space-4);margin:var(--space-2) 0 0;font-size:var(--small-size);line-height:var(--small-line)}
.hub-legend span{display:inline-flex;align-items:center;gap:var(--space-2)}
.hub-key{display:inline-block;width:16px;height:4px;margin-right:var(--space-2);vertical-align:middle;border-radius:var(--radius-pill)}
.hub-key.is-player{background:var(--lima)}
.hub-key.is-coach{background:var(--ink)}
.hub-key.is-tourney{width:10px;height:10px;background:var(--arena)}
.hub-step{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2)}
.hub-step .link{min-width:48px;min-height:48px;justify-content:center;font-size:var(--h3-size);text-decoration:none}
.hub-step .link:disabled{opacity:.35;cursor:default}
.hub-step b{margin:0;text-align:center}
.hub-step b::first-letter{text-transform:uppercase}
.hub-detail p{margin:var(--space-2) 0 0}
.hub-detail .hub-inline{display:inline;margin:0}
/* Encuesta */
.hub-notice{margin:0;padding:var(--space-4);border:1px solid var(--line);border-radius:var(--radius-md);background:var(--surface-deep)}
.hub-notice .eyebrow{display:block;margin-bottom:var(--space-1)}
.hub-range-value{display:block;margin-top:var(--space-2);font-family:var(--font-display);font-size:var(--metric-size);line-height:var(--metric-line);color:var(--accent-text)}
.hub-range input[type=range]{padding:0;min-height:48px;background:transparent;border:0;accent-color:var(--lima)}
.hub-range-scale{display:flex;justify-content:space-between;font-weight:400;font-size:var(--caption-size);line-height:var(--caption-line);color:var(--ink-muted)}
.mood-scale{margin:0;padding:0;border:0;display:flex;flex-wrap:wrap;gap:var(--space-2)}
.mood-scale legend{width:100%;margin-bottom:var(--space-2);font-size:var(--label-size);line-height:var(--label-line);font-weight:var(--label-weight)}
.mood-option{position:relative}
.mood-option input{position:absolute;opacity:0;width:1px;height:1px}
.mood-option span{display:inline-flex;align-items:center;min-height:48px;padding:0 var(--space-4);border:1px solid var(--line);border-radius:var(--radius-md);background:var(--surface-deep);cursor:pointer}
.mood-option input:checked+span{background:var(--verde-medio);border-color:var(--ink)}
.mood-option input:focus-visible+span{outline:2px solid var(--focus-ring);outline-offset:2px}
.checkin-banner{display:flex;justify-content:space-between;align-items:center;gap:var(--space-4);flex-wrap:wrap;margin-bottom:var(--space-6)}
.checkin-banner h2{margin:var(--space-1) 0}
.checkin-people{display:flex;flex-wrap:wrap;gap:var(--space-4)}
@media(max-width:680px){.hub-notes{grid-template-columns:1fr}}
/* Recuadro del video de la explicación (session-guide.js) */
.guide-video{margin-top:var(--space-4);aspect-ratio:16/9;border:1px solid var(--line);border-radius:var(--radius-md);overflow:hidden;background:var(--verde-noche)}
.guide-video video{display:block;width:100%;height:100%;object-fit:contain}
.guide-video.is-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--space-1);border-style:dashed;color:var(--ink-muted)}
.guide-video.is-empty svg{width:48px;height:48px;fill:none;stroke:var(--ink);stroke-width:1.5;stroke-linejoin:round}
.guide-video.is-empty span{font-size:var(--label-size);line-height:var(--label-line);font-weight:var(--label-weight);color:var(--ink)}
.guide-video.is-empty small{font-size:var(--caption-size);line-height:var(--caption-line)}
.attend-rest[hidden]{display:none}
/* Paso 7 del registro: guía y ejemplos de metas */
.goal-tips{margin-bottom:var(--space-6);padding:var(--space-4);border:1px solid var(--line);border-radius:var(--radius-md);background:var(--surface-deep)}
.goal-tips b{font-size:var(--label-size);line-height:var(--label-line)}
.goal-tips ul{margin:var(--space-2) 0 0;padding-left:var(--space-6);display:grid;gap:var(--space-1);font-size:var(--small-size);line-height:var(--small-line)}
.goal-tips li span{font-weight:var(--label-weight);color:var(--accent-text)}

/* Espacio entre Competencias y el calendario en Mi plan */
.plan-competitions{margin-bottom:var(--space-4)}

/* Barra inferior en celular: que quepan todas las secciones, incluida «Mi perfil» */
@media(max-width:680px){
  .nav button{flex:1 1 0;min-width:0;padding:0 2px;font-size:11px;line-height:13px;white-space:normal;text-align:center}
}

/* ---------- Opción B · 60 % verde, 30 % arena, 10 % lima ----------
   Fondo y barra lateral en verde CORDA; las tarjetas en arena con texto verde oscuro.
   Lima sigue siendo solo para la acción principal. */
.shell main :is(.card,.agenda-main){--surface:#E8DCC2;--surface-raised:#E8DCC2;--surface-deep:#F1E8D4;--ink:#0E2A20;--ink-muted:#4A5C52;--accent-text:#2E6B1F;--line:#C9B88F;--danger:#B42318;--focus-ring:#1E6B4F;--logo-dot:#1E6B4F;--shadow-card:0 8px 24px rgba(4,20,14,.25);background:var(--surface-raised);border-color:var(--surface-raised);color:var(--ink);color-scheme:light}
#modal[data-theme="arena"]{--surface-raised:#E8DCC2;--surface-deep:#F1E8D4;--line:#C9B88F}
/* Opciones elegidas sobre verde medio: texto marfil */
:is([data-theme="arena"],.shell main .card,.shell main .agenda-main) :is(.plan-tabs button[aria-pressed=true],.days-strip button.chosen,.chart-months button[aria-pressed=true],.meet-people [aria-pressed=true],.meet-week [aria-pressed=true],.meet-slots [aria-pressed=true],.fee-months button[aria-pressed=true],.choice input:checked+span,.mood-option input:checked+span){--ink:#F4EFE3;--ink-muted:#CFE0D6;color:var(--ink)}
/* Bloques con foto o video: oscuros, con texto claro */
.shell main :is(.next-photo,.player-banner,.club-cover,.guide-video),.shell :is(.contact-footer,.club-play,.banner-play){--surface:#0F3B2C;--surface-raised:#164A38;--ink:#F4EFE3;--ink-muted:#B4C4B8;--line:#2A5E4A;--accent-text:#C8F03C;--surface-deep:#0A2920;--logo-dot:#C8F03C;color:var(--ink);color-scheme:dark}
.shell main .card.next-photo{border-color:var(--line)}
/* Arena sobre arena no se lee: tono arena oscuro */
:is([data-theme="arena"],.shell main .card,.shell main .agenda-main) :is(.hub-down,.hub-tourney-dot,.hub-tourney span){color:#7A5C22}
:is([data-theme="arena"],.shell main .card,.shell main .agenda-main) .chart-tourney line{stroke:#7A5C22}
:is([data-theme="arena"],.shell main .card,.shell main .agenda-main) :is(.chart-tourney circle,.hub-key.is-tourney){fill:#7A5C22;background:#7A5C22}
:is([data-theme="arena"],.shell main .card,.shell main .agenda-main) .fee-dot.review{border-color:#7A5C22;color:#7A5C22}
/* Lima como línea o texto no se ve sobre arena: verde medio */
:is([data-theme="arena"],.shell main .card,.shell main .agenda-main) :is(.chart-line,.chart-line.is-player){stroke:var(--verde-medio)}
:is([data-theme="arena"],.shell main .card,.shell main .agenda-main) :is(.hub-key.is-player,.progress i){background:var(--verde-medio)}
:is([data-theme="arena"],.shell main .card,.shell main .agenda-main) .chart-dot.is-player{stroke:var(--verde-noche);stroke-width:1.5}
:is([data-theme="arena"],.shell main .card,.shell main .agenda-main) :is(.tournament-key span,.chart-months small span){color:var(--accent-text)}
:is([data-theme="arena"],.shell main .card,.shell main .agenda-main) .chart-months button[aria-pressed=true] small span{color:var(--lima)}
:is([data-theme="arena"],.shell main .card,.shell main .agenda-main) :is(.check.done,.fee-dot.paid){border-color:var(--verde-medio)}
:is([data-theme="arena"],.shell main .card,.shell main .agenda-main) :is(input[type=checkbox],input[type=radio],.hub-range input[type=range]){accent-color:var(--verde-medio)}
:is([data-theme="arena"],.shell main .card,.shell main .agenda-main) .btn.lime{border-color:#A9CF26}

/* Mi perfil y Cerrar sesión: centrados al final de la página */
.account-links{display:flex;justify-content:center;align-items:center;gap:var(--space-8);margin-top:var(--space-8);padding-bottom:var(--space-4)}
.account-links .account-link{margin:0}

/* Competencias en Mi plan: el torneo más cercano destacado, los siguientes se desvanecen */
.comp-list{list-style:none;margin:var(--space-4) 0 0;padding:0}
.comp-item{padding:var(--space-4) 0;border-top:1px solid var(--line);opacity:var(--fade,1)}
.comp-item:first-child{border-top:0;padding-top:0}
.comp-item h3{margin:0 0 var(--space-1);font-size:var(--body-size);line-height:var(--body-line);font-weight:500}
.comp-item p{margin:0;font-size:var(--small-size);line-height:var(--small-line);color:var(--ink-muted)}
.comp-item.is-next h3{font-size:var(--h3-size);line-height:var(--h3-line);font-weight:700}
.comp-item.is-next p{font-size:var(--body-size);line-height:var(--body-line);color:var(--ink)}
.comp-item.is-next .eyebrow{margin-bottom:var(--space-1);color:var(--accent-text)}

.hub-unlock{margin:var(--space-2) 0 0}
.hub-facts:empty{display:none}

/* Mi academia: flecha que rebota, centrada abajo de la portada (como en la bienvenida) */
.club-scroll{left:0;right:0;bottom:var(--space-3);width:48px;height:48px;margin:0 auto;padding:0;display:grid;place-items:center;gap:0;animation:welcome-bounce 1.8s ease-in-out infinite}
.club-scroll svg{width:24px;height:24px}
.club-identity{padding-bottom:calc(var(--space-12) + var(--space-4))}
@media(prefers-reduced-motion:reduce){.club-scroll{animation:none}}

/* ---------- Mi academia: video de fondo en toda la página y equipo sin tarjetas ---------- */
.main{position:relative;z-index:1}
.topbar{position:relative;z-index:2}
@media(min-width:681px){.shell>.sidebar{z-index:3}}
.academy-backdrop{position:fixed;inset:0;z-index:-1;overflow:hidden;background:var(--verde-noche);pointer-events:none}
.academy-backdrop .club-background{position:absolute;inset:0;z-index:0;width:100%;height:100%;object-fit:cover}
.academy-backdrop::after{content:'';position:absolute;inset:0;background:color-mix(in srgb,var(--verde-noche) 72%,transparent)}
.shell main .club-cover{background:transparent}
.shell main .club-cover::after{display:none}
/* Integrantes: solo foto redonda, nombre y descripción sobre el video */
.shell main .card.club-person{--ink:#F4EFE3;--ink-muted:#CFE0D6;--line:#2A5E4A;--surface-deep:#164A38;--accent-text:#C8F03C;background:transparent;border-color:transparent;box-shadow:none;padding:0;align-items:center;text-align:center;color:var(--ink)}
.club-person .badge{display:none}
.club-person .person-photo .avatar{width:128px;height:128px;border:2px solid var(--arena);font-size:var(--h2-size);object-fit:cover}
.club-person .bio{margin-bottom:var(--space-3)}
.club-person .person-contact{justify-items:center;border-top:0;padding-top:0}
.club-person .person-contact small{display:none}
.club-person .person-contact:not(:has(a)){display:none}
@media(max-width:680px){.club-person .person-photo .avatar{width:96px;height:96px}#academic-roster .directory-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-6)}}

/* Mi academia: nombre de la academia centrado en la portada */
.shell main .club-cover{align-items:center;justify-content:center;text-align:center}
.club-cover .club-identity{display:flex;flex-direction:column;align-items:center;margin:0 auto}
.club-cover .club-mark{object-position:center}
.club-cover .club-actions{justify-content:center}
/* Botones secundarios sobre el video: arena; lima solo para la acción principal */
.club-cover .club-actions .btn:not(.lime),.club-person .member-edit{min-height:40px;padding:0 var(--space-4);border:1px solid var(--arena);border-radius:var(--radius-md);background:var(--arena);color:var(--on-lima);text-decoration:none;font-weight:var(--label-weight)}
.club-cover .club-actions .btn:not(.lime):hover,.club-person .member-edit:hover{background:#E8D7B2;border-color:#E8D7B2}
````

## Archivo: `dist/styles/ace.css`

````css
/* Ace · asistente de CORDA. Solo tokens de styles/tokens.css. */
.ace{--ace-bottom:var(--space-6);--ace-right:var(--space-6);position:fixed;z-index:50;right:var(--ace-right);bottom:var(--ace-bottom);font-family:var(--font-sans);color:var(--ink)}
/* Portada y pantallas de acceso: por encima del pie */
body:has(#access-frame) .ace{--ace-bottom:var(--space-20)}
/* App en celular: por encima de la barra de navegación */
@media(max-width:680px){
  .ace{--ace-right:var(--space-4);--ace-bottom:var(--space-4)}
  body:has(.shell) .ace{--ace-bottom:calc(72px + env(safe-area-inset-bottom) + var(--space-4))}
}
@media(max-width:520px){
  body:has(#access-frame) .ace{--ace-bottom:calc(var(--space-20) + var(--space-12))}
}

.ace svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}

/* Botón flotante: avatar de Ace (pelota de tenis en línea) */
.ace-launcher{width:48px;height:48px;display:grid;place-items:center;border:1px solid var(--line);border-radius:var(--radius-pill);background:var(--verde-noche);color:var(--lima);box-shadow:var(--shadow-card);cursor:pointer}
.ace-launcher:hover{border-color:var(--lima)}
.ace.is-open .ace-launcher{border-color:var(--lima)}

/* Ventana del chat */
.ace-panel{position:absolute;right:0;bottom:calc(48px + var(--space-3));width:min(360px,calc(100vw - var(--space-8)));max-height:min(560px,calc(100vh - var(--ace-bottom) - 48px - var(--space-8)));display:flex;flex-direction:column;background:var(--surface-raised);border:1px solid var(--line);border-radius:var(--radius-lg);box-shadow:var(--shadow-card);overflow:hidden}
.ace-panel[hidden]{display:none}
.ace-head{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-4);border-bottom:1px solid var(--line)}
.ace-head>span:nth-child(2){flex:1}
.ace-head b{display:block;font-family:var(--font-display);font-size:var(--h3-size);line-height:var(--h3-line);font-weight:var(--h3-weight)}
.ace-head small{display:block;font-size:var(--caption-size);line-height:var(--caption-line);color:var(--ink-muted)}
.ace-avatar{width:40px;height:40px;flex:none;display:grid;place-items:center;border:1px solid var(--line);border-radius:var(--radius-pill);background:var(--verde-noche);color:var(--lima)}
.ace-close{width:48px;height:48px;display:grid;place-items:center;border-radius:var(--radius-md);color:var(--ink)}
.ace-close svg{width:20px;height:20px}

.ace-log{flex:1;min-height:120px;overflow-y:auto;display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4)}
.ace-msg{max-width:88%}
.ace-msg p{margin:0;padding:var(--space-3);border-radius:var(--radius-md);font-size:var(--small-size);line-height:var(--small-line)}
.ace-msg a{color:var(--ink)}
.ace-msg--ace p{background:var(--surface-deep);border:1px solid var(--line)}
.ace-msg--user{align-self:flex-end}
.ace-msg--user p{background:var(--verde-medio)}
.ace-actions{display:flex;flex-wrap:wrap;gap:var(--space-2);margin-top:var(--space-2)}

.ace-actions button,.ace-chips button{min-height:48px;padding:0 var(--space-4);border:1px solid var(--line);border-radius:var(--radius-md);background:transparent;color:var(--ink);font-size:var(--label-size);line-height:var(--label-line);font-weight:var(--label-weight);white-space:nowrap}
.ace-actions button:hover,.ace-chips button:hover{border-color:var(--ink)}
.ace-chips{display:flex;gap:var(--space-2);overflow-x:auto;padding:0 var(--space-4) var(--space-3)}
.ace-chips:empty{display:none}

.ace-form{display:flex;gap:var(--space-2);padding:var(--space-3) var(--space-4) var(--space-4);border-top:1px solid var(--line)}
.ace-form input{flex:1;margin:0}
.ace-send{width:48px;height:48px;flex:none;display:grid;place-items:center;border:1px solid var(--line);border-radius:var(--radius-md);color:var(--ink)}
.ace-send svg{width:20px;height:20px}
.ace-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
````

## Archivo: `dist/styles/sobre-corda.css`

````css
/* sobre-corda.css — Sección "Sobre CORDA" (Misión · Visión · Valores)
   Usa SOLO tokens de styles/tokens.css. */

.sc-page { min-height: 100vh; background: var(--surface); }
.sc-screen {
  min-height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  color: var(--ink);
  font-family: var(--font-sans);
}
.sc-icon { fill: none; stroke: currentColor; stroke-width: 1.75; stroke-linecap: round; stroke-linejoin: round; flex: none; }

/* ---------- Header ---------- */
.sc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-4) var(--space-2);
}
.sc-header__spacer { width: 48px; }
.sc-icon-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
}
.sc-wordmark {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--h3-size);
  line-height: var(--h3-line);
  letter-spacing: var(--logo-tracking);
  min-width: 72px;
}
.sc-wordmark__dot { color: var(--logo-dot); }

/* ---------- Tabs ---------- */
.sc-tabs {
  display: flex;
  gap: var(--space-6);
  padding: var(--space-2) var(--space-6) 0;
  border-bottom: 1px solid var(--line);
}
.sc-tab {
  min-height: 48px;
  margin-bottom: -1px;
  border-bottom: 2px solid transparent;
  font-size: var(--label-size);
  line-height: var(--label-line);
  font-weight: var(--label-weight);
  color: var(--ink-muted);
}
.sc-tab.is-active { color: var(--ink); border-bottom-color: var(--ink); }

/* ---------- Contenido ---------- */
.sc-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-8) var(--space-6) var(--space-6);
}
.sc-eyebrow-row { display: flex; align-items: center; gap: var(--space-2); }
.sc-eyebrow {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--eyebrow-size);
  line-height: var(--eyebrow-line);
  font-weight: var(--eyebrow-weight);
  letter-spacing: var(--eyebrow-tracking);
  text-transform: uppercase;
  color: var(--ink-muted);
}
.sc-eyebrow--dark { color: var(--on-lima); }
.sc-pill {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-pill);
  border: 1px solid var(--line);
  font-size: var(--caption-size);
  line-height: var(--caption-line);
  font-weight: var(--caption-weight);
  color: var(--ink);
}
.sc-pill--muted { color: var(--ink-muted); }
.sc-h1 {
  margin: 0;
  outline: none;
  font-family: var(--font-display);
  font-size: var(--h1-size);
  line-height: var(--h1-line);
  font-weight: var(--h1-weight);
  letter-spacing: var(--h1-tracking);
}
.sc-h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--h3-size);
  line-height: var(--h3-line);
  font-weight: var(--h3-weight);
}
.sc-lead {
  margin: 0;
  font-size: var(--body-lg-size);
  line-height: var(--body-lg-line);
  color: var(--ink-muted);
}
.sc-small {
  margin: var(--space-1) 0 0;
  font-size: var(--small-size);
  line-height: var(--small-line);
  color: var(--ink-muted);
}
.sc-small--dark { margin: 0; color: var(--on-lima); }
.sc-accent { color: var(--accent-text); }

/* Misión: pilares con líneas de cancha */
.sc-pilares {
  list-style: none;
  margin: var(--space-4) 0 0;
  padding: 0;
  border-bottom: 1px solid var(--line);
}
.sc-pilar {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4) 0;
  border-top: 1px solid var(--line);
}
.sc-pilar__icon { flex: none; color: var(--ink); }

/* Visión: tarjeta arena con el camino */
.sc-camino {
  margin-top: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  border-radius: var(--radius-md);
  background: var(--arena);
  color: var(--on-lima);
}
.sc-camino__lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.sc-camino__item { display: flex; gap: var(--space-4); align-items: flex-start; }
.sc-camino__punto {
  flex: none;
  width: 12px;
  height: 12px;
  margin-top: var(--space-2);
  border-radius: var(--radius-pill);
}
.sc-camino__punto--lleno { background: var(--verde-corda); }
.sc-camino__punto--medio { background: var(--verde-medio); }
.sc-camino__punto--vacio { border: 1px solid var(--verde-corda); }

/* Valores */
.sc-valores {
  list-style: none;
  margin: var(--space-4) 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.sc-valor {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-6);
  border-radius: var(--radius-md);
  background: var(--surface-raised);
  border: 1px solid var(--line);
}
.sc-valor__top { display: flex; align-items: center; justify-content: space-between; }
.sc-valor__n {
  font-family: var(--font-display);
  font-size: var(--label-size);
  line-height: var(--label-line);
  font-weight: var(--label-weight);
  color: var(--accent-text);
}
.sc-valor__frase { margin: 0; font-size: var(--body-size); line-height: var(--body-line); font-weight: 600; }
.sc-valor .sc-small { margin: 0; }

/* ---------- Botones ---------- */
.sc-btn {
  margin-top: auto;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 0 var(--space-6);
  border-radius: var(--radius-md);
  font-size: var(--label-size);
  line-height: var(--label-line);
  font-weight: var(--label-weight);
}
.sc-btn--primary { border: 1px solid var(--lima); background: var(--lima); color: var(--on-lima); }
.sc-btn--secondary { border: 1px solid var(--line); background: transparent; color: var(--ink); }

.sc-firma {
  margin: var(--space-2) 0 0;
  font-size: var(--caption-size);
  line-height: var(--caption-line);
  font-weight: var(--caption-weight);
  color: var(--ink-muted);
}

/* Misión y visión ocupan todo el alto en móvil */
.sc-main--mision,
.sc-main--vision { min-height: calc(100vh - 140px); }
````

## Archivo: `dist/styles/tokens.css`

````css
/* CORDA · Tokens de diseño
   Fuente única de colores, tipografía, espaciado, radios y sombras.
   Los componentes usan solo var(--token). No agregues valores fuera de este archivo. */

/* ---------- Colores de marca (iguales en ambos temas) ---------- */
:root {
  --verde-corda: #0F3B2C;  /* 60 %, fondo dominante */
  --verde-medio: #1E6B4F;  /* gráficas, selección, bloques secundarios */
  --verde-noche: #0A2920;  /* navegación, pie, overlay de video al 60–70 % */
  --arena:       #D9C49A;  /* 30 %, tarjetas destacadas, bloques editoriales */
  --lima:        #C8F03C;  /* 10 %, solo acción principal, logros, objetivos, punto del logo */
  --on-lima:     #0E2A20;  /* texto sobre lima, nunca blanco */
  --marfil:      #F4EFE3;  /* el "blanco" de la marca; #FFFFFF está prohibido como fondo */

  /* ---------- Tipografía ---------- */
  --font-display: "Space Grotesk", "Helvetica Neue", Arial, sans-serif; /* títulos, cifras, logo */
  --font-sans:    "DM Sans", "Helvetica Neue", Arial, sans-serif;       /* texto e interfaz */

  /* tamaño / interlineado / peso / tracking */
  --display-size: 64px;  --display-line: 64px;  --display-weight: 700;  --display-tracking: -0.03em;
  --h1-size: 40px;       --h1-line: 44px;       --h1-weight: 700;       --h1-tracking: -0.02em;
  --h2-size: 28px;       --h2-line: 32px;       --h2-weight: 600;       --h2-tracking: -0.01em;
  --h3-size: 20px;       --h3-line: 26px;       --h3-weight: 600;
  --metric-size: 48px;   --metric-line: 48px;   --metric-weight: 600;   --metric-tracking: -0.02em;
  --eyebrow-size: 12px;  --eyebrow-line: 16px;  --eyebrow-weight: 600;  --eyebrow-tracking: 0.14em;
  --body-lg-size: 18px;  --body-lg-line: 28px;  --body-lg-weight: 400;
  --body-size: 16px;     --body-line: 24px;     --body-weight: 400;
  --label-size: 14px;    --label-line: 20px;    --label-weight: 600;
  --small-size: 14px;    --small-line: 20px;    --small-weight: 400;
  --caption-size: 12px;  --caption-line: 16px;  --caption-weight: 500;
  --logo-tracking: -0.02em;

  /* ---------- Espaciado (base 4px) ---------- */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-20: 80px;

  /* ---------- Radios ---------- */
  --radius-sm: 6px;     /* inputs, badges */
  --radius-md: 12px;    /* botones, tarjetas */
  --radius-lg: 20px;    /* paneles, modales, video */
  --radius-pill: 999px; /* solo punto del logo, avatares y píldora de estado */
}

/* En móvil, display baja a 44/48 y h1 a 32/36. */
@media (max-width: 680px) {
  :root {
    --display-size: 44px; --display-line: 48px;
    --h1-size: 32px;      --h1-line: 36px;
  }
}

/* ---------- Tema "cancha" (default: app y landing) ---------- */
:root,
[data-theme="cancha"] {
  --surface:        #0F3B2C;
  --surface-raised: #164A38;
  --surface-deep:   #0A2920;
  --ink:            #F4EFE3;
  --ink-muted:      #B4C4B8;
  --accent-text:    #C8F03C; /* cifras de mejora */
  --line:           #2A5E4A; /* bordes 1px */
  --danger:         #FF9A8C;
  --focus-ring:     #C8F03C;
  --shadow-card:    0 8px 24px rgba(4,20,14,.35);
  --logo-dot:       var(--lima);
  color-scheme: dark;
}

/* ---------- Tema "arena" (documentos, propuestas e impresos) ---------- */
[data-theme="arena"] {
  --surface:        #F6F1E6;
  --surface-raised: #FFFDF8;
  --surface-deep:   #EAE0CB;
  --ink:            #0E2A20;
  --ink-muted:      #4A5C52;
  --accent-text:    #2E6B1F;
  --line:           #CDBF9F;
  --danger:         #B42318;
  --focus-ring:     #1E6B4F;
  --shadow-card:    0 8px 24px rgba(14,42,32,.10);
  --logo-dot:       var(--verde-medio); /* en arena, el punto del logo va en verde medio */
  color-scheme: light;
}
````

## Archivo: `dist/supabase-config.js`

````javascript
// Datos públicos del proyecto Supabase de CORDA.
// La publishable key está hecha para ir en el navegador: lo que protege los datos son las
// reglas RLS de supabase/01_cuentas.sql. NUNCA pongas aquí la secret / service_role key.
const CORDA_SUPABASE={
  url:'https://fdscfjykdazkqknguzim.supabase.co',
  key:'sb_publishable_zHXWINry3Wpr94G4R8kamg_cHytsYer'
};
````

## Archivo: `dist/sync.js`

````javascript
// Fase B: sincroniza los datos de la app con la tabla "items" de Supabase.
// La app sigue trabajando sobre "state" como siempre; este módulo:
//   1. al iniciar sesión baja los datos de la academia y del jugador y los pone en state,
//   2. después de cada guardado sube solo lo que cambió (y borra lo que se borró),
//   3. cada minuto (y al volver a la pestaña) baja lo nuevo de los demás.
// Quién puede ver o editar cada cosa lo deciden las reglas RLS de supabase/03_datos_compartidos.sql.
let syncCtx=null,syncedItems=new Map(),syncTimer=null,syncBusy=false,syncAgain=false,syncPoll=null,syncWarned=false;
const DEMO_MAX_ID=1e6; // ids chicos = datos de ejemplo de la app: no se suben
const PLAYER_KINDS=new Set(['checkin_player','competition','goal','fee_month','fee_code']);
const DELETABLE=new Set(['session','exercise','video','comment','post','meeting','office_hours','private_book','goal','competition','checkin_player','checkin_coach','review','monthly_review','fee_month']);
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
  (state.directory||[]).filter(m=>m.academy===syncCtx.academyName&&m.id).forEach(m=>put('','member_card',m.id,{bio:m.bio||'',email:m.email||'',phone:m.phone||''}));
  (state.privateLessons||[]).forEach(book=>put('','private_book',book.coachId,book));
  for(const id of syncPlayers()){
    for(const [kind,get] of PLAYER_MAPS)Object.entries(get(id)).forEach(([key,value])=>put(id,kind,key,value));
    (syncAthlete(id).goals||[]).forEach(goal=>{if(!isDemoItem(goal))put(id,'goal',syncId(goal),goal)});
    const code=syncLedger(id).code;if(code)put(id,'fee_code','code',{code});
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
    if(member)Object.assign(member,{bio:r.data.bio,email:r.data.email,phone:r.data.phone});
  }
  if(syncCtx.staff){state.privateLessons??=[];fillList(state.privateLessons,rowsOf('','private_book').map(r=>r.data))}
  for(const id of syncPlayers()){
    for(const [kind,get] of PLAYER_MAPS)fillMap(get(id),Object.fromEntries(rowsOf(id,kind).map(r=>[r.key,r.data])));
    const goals=syncAthlete(id).goals,cloudGoals=rowsOf(id,'goal').map(r=>r.data);
    fillList(goals,cloudGoals.length?cloudGoals.sort(byOrder):goals.filter(isDemoItem));
    syncLedger(id).code=rowsOf(id,'fee_code')[0]?.data?.code||syncLedger(id).code||'';
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
````

## Archivo: `ASSET_CREDITS.md`

````markdown
# Active welcome video
Man playing tennis — Mixkit, item 877.
Source: https://mixkit.co/free-stock-video/man-playing-tennis-877/
License: Mixkit Stock Video Free License https://mixkit.co/license/
Item page explicitly permits commercial or personal use; reviewed 2026-11-02.
Source: https://assets.mixkit.co/videos/877/877-720.mp4
Silent H.264 web copy; poster extracted at 1 second. No endorsement implied.

Session card photographs (dist/assets/sesiones/, Pexels JPEG at 1280 px, downloaded 2026-11-05):
- fuerza.jpg: Alesia Kozik, https://www.pexels.com/photo/man-lifting-dumbbells-7289245/
- pliometria.jpg: cottonbro studio, https://www.pexels.com/photo/woman-practicing-plyometrics-7675412/
- isometria.jpg: Li Sun, https://www.pexels.com/photo/man-doing-yoga-2294363/ (side plank)
- movilidad.jpg: Ivan S, https://www.pexels.com/photo/man-stretching-at-a-gym-4164461/
- agilidad.jpg: Chris K, https://www.pexels.com/photo/agility-ladder-and-marker-cones-on-a-football-field-13204961/
- cardio.jpg: Andrea Piacquadio, https://www.pexels.com/photo/fit-athlete-during-training-on-running-track-3756042/
All under https://www.pexels.com/license/ (free to use; attribution not required but kept here).
````

## Archivo: `.openai/hosting.json`

````json
{
  "project_id": "appgprj_6ae824f35f9081919d093ab04c140b77",
  "static": {
    "directory": "dist"
  }
}
````

## Recursos multimedia (no incluidos como bytes)

| Ruta | Tamaño (bytes) | SHA-256 |
|---|---:|---|
| `dist/assets/corda-plyo.webp` | 64044 | `630959a972c98e871a35e8d98a596c8bd968c2b7a524403309cff87761feae2e` |
| `dist/assets/corda-strength.webp` | 42824 | `e142073404c178feb17ddd6bb2bfa22d7aea06f87a70f0e937733455a73c8437` |
| `dist/assets/tennis-close-poster.jpg` | 67152 | `d8eaf205267ef66458141b975fc4ce8c17f026cda3d4892c2179f645a07f5486` |
| `dist/assets/tennis-close.mp4` | 4502040 | `487f730ea520088f6ac4802411353557d21df9fa99823dca71bb21682768ed53` |
| `dist/assets/tennis-poster.jpg` | 78214 | `68da7bd94d28fafc8443cb94a44263f1a0bacd07808630cd3f424a165eb48da7` |
| `dist/assets/tennis-rally-poster.jpg` | 62223 | `4a2f5eefc2fad6d38c23a8ca66eaf3d04192743f8cfef129431dc23de5176a04` |
| `dist/assets/tennis-rally.mp4` | 1988990 | `e997f76b05fbb059620d6a457aa136b1471042fedccc8d3a1df7a332710a014b` |
| `dist/assets/tennis.mp4` | 1792323 | `e3ebb2d5860ef0d288743581c36b38cb730521b230eeb7f5bd818d23983fcbe4` |
| `dist/assets/sesiones/agilidad.jpg` | 280671 | `cc72003eae6d240bb4b36963aa27a6bb3f273a090d66a61b0ccf01daf5143387` |
| `dist/assets/sesiones/cardio.jpg` | 130528 | `06a2df03fe3e454459187093f4c0d220bdb7e83b5d2e0c5f76e25f9fe3328488` |
| `dist/assets/sesiones/fuerza.jpg` | 245098 | `41245cc4c54e61c8e648968fc26813b98bdea97bd866b3cc3c7b343598172d27` |
| `dist/assets/sesiones/isometria.jpg` | 102151 | `d5c5ca4fab8b69243d6bf25f1c7a7985e59d71181aaf6b080423a13c06c9580d` |
| `dist/assets/sesiones/movilidad.jpg` | 238373 | `6872ae9bb48cd5eb60e2e0fe4a26f73b895ea763025d053b9c637424583bb9ce` |
| `dist/assets/sesiones/pliometria.jpg` | 335934 | `f96f934b9ac8879b5a57f4494f002866f7eb5eea8ffa774e86a358180268bb36` |
