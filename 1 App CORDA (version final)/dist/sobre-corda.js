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
