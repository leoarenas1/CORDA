// Calendario del celular: los entrenamientos de CORDA se llevan a Apple Calendar o Google Calendar.
// Se genera un archivo .ics (estándar) con las sesiones de las próximas 4 semanas:
//   · iPhone/iPad: se abre en la app Calendario ("Agregar todo").
//   · Android: se abre en Google Calendar. Computadora: Google Calendar → Configuración → Importar.
// Cada sesión lleva un identificador fijo (UID): si el plan cambia y se vuelve a agregar, el calendario
// ACTUALIZA los eventos en vez de duplicarlos. Las sesiones canceladas se marcan como canceladas.
// Cada evento trae un recordatorio 1 hora antes. El aviso diario de Inicio avisa cuando hay algo nuevo.
// Estado local de este dispositivo: state.calendarSync = {sigs:{uid:firma}} y state.calendarPrompt = {day}|{off:true}.
const CAL_WINDOW_DAYS=28;
const CAL_REMINDER_MIN=60;

const calUid=s=>'corda-s-'+String(s.id).replace(/[^\w-]/g,'')+'@corda.app';
function calSessionsInWindow(){
  const today=localDay(),last=dateAfter(today,CAL_WINDOW_DAYS);
  return (state.sessions||[]).filter(s=>s.date&&s.time&&String(s.date)>=today&&String(s.date)<=last)
    .sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
}
const calSig=s=>JSON.stringify([s.date,s.time,s.duration,s.place,s.title,s.type,!!s.cancelled,s.coach||'']);
// Sesiones nuevas, cambiadas o canceladas desde la última vez que se agregaron al calendario.
function calPending(){
  const sigs=state.calendarSync?.sigs||{};
  return calSessionsInWindow().filter(s=>sigs[calUid(s)]!==calSig(s)&&!(s.cancelled&&!sigs[calUid(s)]));
}

// ---------- Archivo .ics ----------
const icsEscape=text=>String(text??'').replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\r?\n/g,'\\n');
function icsStamp(date){return date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}
// Líneas de máximo 75 bytes (UTF-8), como pide el estándar; las siguientes empiezan con un espacio.
function icsFold(line){
  const encoder=new TextEncoder(),parts=[];let current='',bytes=0,limit=75;
  for(const char of line){
    const size=encoder.encode(char).length;
    if(bytes+size>limit){parts.push(current);current=' ';bytes=1;limit=75}
    current+=char;bytes+=size;
  }
  parts.push(current);
  return parts.join('\r\n');
}
function icsEvent(s,stamp,sequence){
  // La fecha y hora de la sesión son las de la academia; se convierten a UTC con la zona de este dispositivo.
  const start=new Date(s.date+'T'+s.time),end=new Date(start.getTime()+(Number(s.duration)||60)*60000);
  const demo=!!s.demo,academy=state.profile?.academy||'';
  const title=(s.type?s.type+' · ':'')+s.title+(demo?' (ejemplo)':'');
  const coach=typeof sessionCoach==='function'?sessionCoach(s):(s.coach||'');
  const lines=[
    s.goal?'Objetivo: '+s.goal:'',
    s.summary?'Enfoque: '+s.summary:'',
    typeof sessionGear==='function'?'Lleva: '+sessionGear(s):'',
    coach&&coach!=='Por confirmar'?'Coach: '+coach:'',
    s.cancelled?(s.cancelReason||'Sesión cancelada'):'',
    'Abre CORDA para ver la guía completa de la sesión.'
  ].filter(Boolean);
  return [
    'BEGIN:VEVENT',
    'UID:'+calUid(s),
    'DTSTAMP:'+stamp,
    'SEQUENCE:'+sequence,
    'DTSTART:'+icsStamp(start),
    'DTEND:'+icsStamp(end),
    'SUMMARY:'+icsEscape(title),
    'LOCATION:'+icsEscape([s.place,academy].filter(Boolean).join(' · ')),
    'DESCRIPTION:'+icsEscape(lines.join('\n')),
    'STATUS:'+(s.cancelled?'CANCELLED':'CONFIRMED'),
    'TRANSP:OPAQUE',
    'CATEGORIES:CORDA',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:'+icsEscape(title),
    'TRIGGER:-PT'+CAL_REMINDER_MIN+'M',
    'END:VALARM',
    'END:VEVENT'
  ].map(icsFold).join('\r\n');
}
function buildIcs(sessions=calSessionsInWindow()){
  const now=new Date(),stamp=icsStamp(now);
  // SEQUENCE sube con el tiempo (minutos desde 2026-01-01): así el calendario acepta cada versión como una actualización.
  const sequence=Math.max(1,Math.floor((now.getTime()-Date.UTC(2026,0,1))/60000));
  const head=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//CORDA//Entrenamientos//ES','CALSCALE:GREGORIAN','METHOD:PUBLISH',
    'X-WR-CALNAME:CORDA · Entrenamientos','X-WR-CALDESC:'+icsEscape('Entrenamientos de tu academia en CORDA')].map(icsFold);
  return head.concat(sessions.map(s=>icsEvent(s,stamp,sequence)),'END:VCALENDAR').join('\r\n')+'\r\n';
}

// ---------- Descargar y marcar como agregado ----------
function addToCalendar(){
  const sessions=calSessionsInWindow();
  if(!sessions.length){toast('Todavía no hay entrenamientos en las próximas semanas.');return}
  const blob=new Blob([buildIcs(sessions)],{type:'text/calendar;charset=utf-8'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download='CORDA-entrenamientos.ics';document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
  state.calendarSync={sigs:Object.fromEntries(sessions.map(s=>[calUid(s),calSig(s)])),at:Date.now()};
  state.calendarPrompt={day:localDay()};
  try{if(!phoneDemo)localStorage.setItem('corda-v1',JSON.stringify(state))}catch{}
  toast(coverText('Listo: abre el archivo para agregar '+sessions.length+' entrenamientos a tu calendario.','Done: open the file to add '+sessions.length+' sessions to your calendar.','C’est fait : ouvrez le fichier pour ajouter '+sessions.length+' séances à votre calendrier.'));
  if(typeof render==='function'&&page==='home')render();
}

// ---------- Aviso diario en Inicio ----------
function calendarBannerDue(){
  if(entry!=='app'||phoneDemo)return false;
  const prompt=state.calendarPrompt||{};
  if(prompt.off||prompt.day===localDay())return false;
  return calPending().length>0;
}
function calendarBanner(){
  return '';
}
// Aviso emergente: se abre al tocar «Agregar a mi calendario» en Mi plan.
function openCalendarInfo(){
  const pending=calPending(),total=calSessionsInWindow().length,first=!state.calendarSync;
  const t=coverText;
  const title=first?t('Lleva tus entrenamientos a tu celular','Take your sessions to your phone','Emportez vos séances sur votre téléphone'):t('Tu plan cambió','Your plan changed','Votre programme a changé');
  const body=first
    ?t('Agrega '+total+' entrenamientos de las próximas semanas a tu calendario de Apple o Google, con un recordatorio 1 hora antes.','Add '+total+' upcoming sessions to your Apple or Google calendar, with a reminder 1 hour before.','Ajoutez '+total+' séances à votre calendrier Apple ou Google, avec un rappel 1 heure avant.')
    :t(pending.length+(pending.length===1?' entrenamiento nuevo o cambiado.':' entrenamientos nuevos o cambiados.')+' Actualiza tu calendario para tenerlo al día.',pending.length+' new or changed sessions. Update your calendar to stay current.',pending.length+' séances nouvelles ou modifiées. Mettez à jour votre calendrier.');
  const label=first?t('Agregar a mi calendario','Add to my calendar','Ajouter à mon calendrier'):t('Actualizar mi calendario','Update my calendar','Mettre à jour mon calendrier');
  modal(title,'<div class="full calendar-pop"><p>'+body+'</p><p class="hint calendar-help">'+t('En iPhone se abre en Calendario; en Android, en Google Calendar.','On iPhone it opens in Calendar; on Android, in Google Calendar.','Sur iPhone, il s’ouvre dans Calendrier ; sur Android, dans Google Agenda.')+'</p><button type="button" class="btn lime block" data-calendar-add>'+label+'</button></div>',null);
}
function calendarBannerOld(){
  if(!calendarBannerDue())return '';
  const pending=calPending(),total=calSessionsInWindow().length,first=!state.calendarSync;
  const demo=pending.every(s=>s.demo);
  const t=coverText;
  const title=first?t('Lleva tus entrenamientos a tu celular','Take your sessions to your phone','Emportez vos séances sur votre téléphone')
    :t('Tu plan cambió','Your plan changed','Votre programme a changé');
  const body=first
    ?t('Agrega '+total+' entrenamientos de las próximas semanas a tu calendario de Apple o Google, con un recordatorio 1 hora antes.','Add '+total+' upcoming sessions to your Apple or Google calendar, with a reminder 1 hour before.','Ajoutez '+total+' séances à votre calendrier Apple ou Google, avec un rappel 1 heure avant.')
    :t(pending.length+(pending.length===1?' entrenamiento nuevo o cambiado.':' entrenamientos nuevos o cambiados.')+' Actualiza tu calendario para tenerlo al día.',pending.length+' new or changed sessions. Update your calendar to stay current.',pending.length+' séances nouvelles ou modifiées. Mettez à jour votre calendrier.');
  return `<section class="card checkin-banner calendar-banner"><div><small class="eyebrow">${t('Tu calendario','Your calendar','Votre calendrier')}${demo?' · '+t('Ejemplo','Sample','Exemple'):''}</small><h2>${title}</h2><p class="hint">${body}</p>
    <p class="hint calendar-help">${t('En iPhone se abre en Calendario; en Android, en Google Calendar.','On iPhone it opens in Calendar; on Android, in Google Calendar.','Sur iPhone, il s’ouvre dans Calendrier ; sur Android, dans Google Agenda.')}</p></div>
    <div class="calendar-actions"><button class="btn lime" data-calendar-add>${first?t('Agregar a mi calendario','Add to my calendar','Ajouter à mon calendrier'):t('Actualizar mi calendario','Update my calendar','Mettre à jour mon calendrier')}</button>
    <button class="link" data-calendar-later>${t('Ahora no','Not now','Pas maintenant')}</button>
    <button class="link calendar-off" data-calendar-off>${t('No volver a preguntar','Don’t ask again','Ne plus demander')}</button></div></section>`;
}
// Botón fijo en Mi plan (siempre disponible, aunque se haya desactivado el aviso).
function calendarButton(){
  return `<button class="btn light" id="calendar-add">${coverText('Agregar a mi calendario','Add to my calendar','Ajouter à mon calendrier')}</button>`;
}
document.addEventListener('click',event=>{
  const t=event.target;
  if(t.closest?.('[data-calendar-add]')){addToCalendar();const m=document.querySelector('#modal');if(m?.open)m.close();return}
  if(t.closest?.('#calendar-add')){openCalendarInfo();return}
  if(t.closest?.('[data-calendar-later]')){state.calendarPrompt={day:localDay()};save();render();return}
  if(t.closest?.('[data-calendar-off]')){
    state.calendarPrompt={off:true};save();render();
    toast(coverText('Listo. Puedes agregar tus entrenamientos cuando quieras desde Mi plan.','Done. You can add your sessions anytime from My plan.','C’est noté. Vous pouvez ajouter vos séances depuis Mon programme.'));
  }
});
