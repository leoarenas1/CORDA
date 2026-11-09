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

// ---------- Saludo del día (recuadro de abajo a la izquierda) ----------
// Usa el nombre de quien inició sesión y cambia de frase cada día. «Bienvenid@» sirve para
// cualquier persona sin suponer su género.
const DAILY_LINES={
  Jugador:{
    es:['¡A romperla hoy!','Cada pelota cuenta. ¡A seguir mejorando!','Hoy es un buen día para subir de nivel.','Un entrenamiento más cerca de tu meta.','Constancia hoy, resultados mañana.','Juega con intención. ¡Tú puedes!','Lo que entrenas hoy se nota en el próximo torneo.'],
    en:['Go crush it today!','Every ball counts. Keep improving!','Today is a good day to level up.','One more session closer to your goal.','Consistency today, results tomorrow.','Play with intention. You’ve got this!','What you train today shows in your next tournament.'],
    fr:['À fond aujourd’hui !','Chaque balle compte. Continue de progresser !','Aujourd’hui est un bon jour pour passer un cap.','Une séance de plus vers ton objectif.','La régularité aujourd’hui, les résultats demain.','Joue avec intention. Tu peux le faire !','Ce que tu travailles aujourd’hui se verra au prochain tournoi.']
  },
  Coach:{
    es:['Tus jugadores cuentan contigo hoy.','Un buen plan hoy, mejores partidos mañana.','Cada evaluación les marca el camino.','Hoy toca sacar lo mejor de tu equipo.','Gracias por tu dedicación. ¡A darle!'],
    en:['Your players are counting on you today.','A good plan today, better matches tomorrow.','Every review shows them the way.','Time to bring out the best in your team.','Thanks for your dedication. Let’s go!'],
    fr:['Tes joueurs comptent sur toi aujourd’hui.','Un bon plan aujourd’hui, de meilleurs matchs demain.','Chaque évaluation leur montre le chemin.','Aujourd’hui, fais ressortir le meilleur de ton équipe.','Merci pour ton engagement. Allez !']
  },
  Tutor:{
    es:['Gracias por acompañar su camino en el tenis.','Tu apoyo también juega cada partido.','Aquí ves cómo avanza, paso a paso.','Cada semana suma. ¡Gracias por estar!'],
    en:['Thanks for supporting their tennis journey.','Your support plays every match too.','See their progress here, step by step.','Every week adds up. Thanks for being there!'],
    fr:['Merci d’accompagner son parcours au tennis.','Ton soutien joue aussi chaque match.','Suis ici sa progression, pas à pas.','Chaque semaine compte. Merci d’être là !']
  }
};
function dailyGreeting(){
  const person=actor()||state.profile||{};
  const first=String(person.firstName||person.name||'').trim().split(/\s+/)[0];
  const lines=(DAILY_LINES[role]||DAILY_LINES.Jugador)[coverLanguage]||DAILY_LINES.Jugador.es;
  const today=localDay(),day=Math.floor(Date.parse(today+'T12:00:00')/864e5);
  const line=lines[(day+first.length)%lines.length];
  const hello=coverText('Bienvenid@','Welcome','Bienvenue');
  return `<div class="demo greeting"><b>${esc(first?hello+', '+first:hello)} 👋</b><span>${esc(line)}</span></div>`;
}
