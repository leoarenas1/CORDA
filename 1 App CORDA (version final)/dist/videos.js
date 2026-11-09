// Biblioteca de video de la academia.
// - Solo los coaches agregan videos (enlace de YouTube u otro HTTPS), con categoría y nota.
// - Los videos de YouTube se ven dentro de la app (youtube-nocookie.com).
// - El jugador marca "Ya lo vi"; el coach ve quién lo vio. Se guarda en state.videoSeen[jugador][video].
// En Supabase: cada video es un item "video" de la academia y cada visto un item "video_seen" del jugador.
const VIDEO_CATEGORIES=['Saque','Derecha','Revés','Volea y red','Devolución','Táctica','Físico','Mental','Partidos'];
let videoFilter='';

function youtubeId(url){
  try{
    const u=new URL(url),host=u.hostname.replace(/^www\.|^m\./,'');
    if(host==='youtu.be')return u.pathname.slice(1).split('/')[0]||'';
    if(host==='youtube.com'||host==='youtube-nocookie.com'){
      if(u.searchParams.get('v'))return u.searchParams.get('v');
      const parts=u.pathname.split('/').filter(Boolean);
      if(['embed','shorts','live','v'].includes(parts[0]))return parts[1]||'';
    }
  }catch{}
  return '';
}
const safeYoutubeId=id=>/^[\w-]{6,20}$/.test(id)?id:'';
function videoSeenStore(playerId){
  state.videoSeen??={};
  return state.videoSeen[playerId]??={};
}
function videoKey(v){return String(v.id??(v._k??=newMemberId()))}

function videoCard(v){
  const id=safeYoutubeId(youtubeId(v.url)),key=videoKey(v);
  const me=state.profile?.memberId,seen=role==='Jugador'&&me&&videoSeenStore(me)[key];
  const thumb=id?`<button type="button" class="video-thumb" data-video-play="${esc(key)}" aria-label="Ver ${esc(v.title)}"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy"><span class="video-play">${icon('play')}</span></button>`
    :`<a class="video-thumb video-link" href="${esc(v.url)}" target="_blank" rel="noopener noreferrer">${icon('play')}<span>Abrir enlace ↗</span></a>`;
  let viewers='';
  if(role==='Coach'){
    const players=academyPlayers(actor()?.academy||state.profile.academy);
    const who=players.filter(p=>state.videoSeen?.[p.id]?.[key]);
    viewers=`<p class="video-seen-by">${players.length?`Visto por ${who.length} de ${players.length}${who.length?': '+who.map(p=>esc(p.name.split(' ')[0])).join(', '):''}`:'Aún no hay jugadores en tu academia.'}</p>`;
  }
  return `<article class="video-card${seen?' is-seen':''}">${thumb}<div class="video-body">
    ${v.category?`<span class="badge">${esc(v.category)}</span>`:''}<h3>${esc(v.title)}</h3>
    ${v.note?`<p class="video-note">${esc(v.note)}</p>`:''}
    <small class="muted">${esc(v.by||'Coach')}${v.at?' · '+dateLabel(localDay(new Date(v.at)),{day:'numeric',month:'short'}):''}</small>
    ${role==='Jugador'?`<button type="button" class="link video-seen" data-video-seen="${esc(key)}">${seen?'✓ Ya lo viste':'Marcar como visto'}</button>`:''}
    ${viewers}
    ${role==='Coach'?`<button type="button" class="link" data-video-edit="${esc(key)}">Editar</button>`:''}
  </div></article>`;
}
function videoLibrary(){
  const all=(state.videos||[]).slice().sort((a,b)=>(b.at||0)-(a.at||0));
  const used=VIDEO_CATEGORIES.filter(c=>all.some(v=>v.category===c));
  if(videoFilter&&!used.includes(videoFilter))videoFilter='';
  const list=videoFilter?all.filter(v=>v.category===videoFilter):all;
  const chips=used.length>1?`<div class="video-filters">${['',...used].map(c=>`<button type="button" data-video-filter="${esc(c)}" aria-pressed="${c===videoFilter}">${c||'Todos'}</button>`).join('')}</div>`:'';
  const empty=role==='Coach'?'Agrega videos de YouTube para que tus jugadores los vean y los analicen.':'Aquí aparecerán los videos que tu coach comparta para que los veas y los analices.';
  return `<section class="card video-library"><div class="sectiontitle"><h2>Biblioteca de video</h2>${role==='Coach'?'<button class="btn lime small" id="newvideo">+ Agregar video</button>':''}</div>
    ${chips}${list.length?`<div class="video-grid">${list.map(videoCard).join('')}</div>`:`<p class="muted">${empty}</p>`}</section>`;
}
function openVideoForm(key){
  const existing=key?(state.videos||[]).find(v=>videoKey(v)===key):null,v=existing||{};
  modal(existing?'Editar video':'Agregar video',
    field('Título','title',v.title||'')+field('Enlace de YouTube','url',v.url||'','url')+
    `<label>Categoría<select name="category"><option value="">Sin categoría</option>${VIDEO_CATEGORIES.map(c=>`<option ${c===v.category?'selected':''}>${c}</option>`).join('')}</select></label>`+
    `<label class="full">Nota para tus jugadores (opcional)<textarea name="note" maxlength="400" placeholder="Ej. Fíjate en la posición de los pies antes del impacto.">${esc(v.note||'')}</textarea></label>`+
    (existing?'<p class="full"><button type="button" class="link danger" id="video-remove">Quitar este video</button></p>':''),
    d=>{
      try{const u=new URL(d.url);if(u.protocol!=='https:')throw Error()}catch{toast('Pega un enlace HTTPS válido (por ejemplo, de YouTube).');return false}
      const data={title:d.title.trim(),url:d.url.trim(),category:d.category,note:d.note.trim()};
      if(!data.title){toast('Escribe un título.');return false}
      if(existing)Object.assign(existing,data);
      else (state.videos??=[]).push({...data,id:newMemberId(),by:actor()?.name||'Coach',at:Date.now()});
    },existing?'Guardar cambios':'Agregar video');
  const remove=$('#video-remove');
  if(remove)remove.onclick=()=>{
    if(!remove.dataset.sure){remove.dataset.sure='1';remove.textContent='¿Seguro? Toca otra vez para quitarlo';return}
    state.videos.splice(state.videos.indexOf(existing),1);
    save();$('#modal').close();render();toast('Video quitado.');
  };
}
function playVideo(key){
  const v=(state.videos||[]).find(item=>videoKey(item)===key),id=v&&safeYoutubeId(youtubeId(v.url));
  if(!id)return;
  modal(esc(v.title),`<div class="full"><div class="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0" title="${esc(v.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>${v.note?`<p class="video-note">${esc(v.note)}</p>`:''}</div>`);
}
document.addEventListener('click',event=>{
  const t=event.target;
  if(t.closest?.('#newvideo')){if(role==='Coach')openVideoForm();return}
  const play=t.closest?.('[data-video-play]');if(play){playVideo(play.dataset.videoPlay);return}
  const edit=t.closest?.('[data-video-edit]');if(edit&&role==='Coach'){openVideoForm(edit.dataset.videoEdit);return}
  const filter=t.closest?.('[data-video-filter]');if(filter){videoFilter=filter.dataset.videoFilter;render();return}
  const seen=t.closest?.('[data-video-seen]');
  if(seen&&role==='Jugador'&&state.profile?.memberId){
    const store=videoSeenStore(state.profile.memberId),key=seen.dataset.videoSeen;
    if(store[key])delete store[key];else store[key]={at:Date.now()};
    save();render();
  }
});
