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
    [t('¿Cómo puede mi academia probar CORDA?','How can my academy try CORDA?',"Comment mon académie peut-elle essayer CORDA ?"),t('Escríbenos a info@cordatenis.com con el nombre de tu academia y cómo organizan sus entrenamientos.','Email info@cordatenis.com with your academy’s name and how you currently organize training.',"Écrivez à info@cordatenis.com en indiquant le nom de votre académie et comment vous organisez vos entraînements.")]
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
