// CORDA · Academia de pruebas: carga datos de ejemplo y genera la hoja de códigos para probar con gente real.
// Solo aparece para el coach de la academia llamada «CORDA Pruebas». Usa los mismos caminos que la app, así los datos tienen la forma correcta.
const TEST_ACADEMY='CORDA Pruebas';
const testOn=()=>role==='Coach'&&actor()?.academy===TEST_ACADEMY;
const TEST_PLAYERS=[
  ['Mateo Ruiz',0.95,1],['Sofía Pérez',0.9,1],['Diego Hernández',0.85,1],['Valentina Cruz',0.6,1],['Emiliano Torres',0.5,1],['Camila Ortega',0.9,1],
  ['Santiago Vega',0.8,1],['Renata Flores',0.95,1],['Leonardo Núñez',0.4,1],['Isabella Mora',0.85,1],['Andrés Salazar',0.9,0],['Ximena Ibarra',0.7,0]
];
const TEST_GOOD=['Más profundidad en el revés cruzado.','Mejoró su primer saque y el balance de pies.','Más paciencia en los puntos largos.','Mejor lectura del juego del rival.','Buena actitud y mucha energía en el calentamiento.'];
const TEST_FOCUS=['Llegar a tiempo a la red después del saque.','Subir la altura sobre la red en el drive.','Mejorar el segundo saque con más efecto.','Recuperar la posición después de cada golpe.','Mantener la concentración al final del set.'];
function testSeed(){
  if(!testOn())return;
  const academy=TEST_ACADEMY,today=localDay(),have=new Set((state.directory||[]).filter(m=>m.academy===academy).map(m=>m.name));
  if(TEST_PLAYERS.every(([n])=>have.has(n))){toast('La academia de pruebas ya tiene sus jugadores.');return}
  state.directory??=[];state.checkins??={};
  const coaches=(state.directory||[]).filter(m=>m.role==='Coach'&&m.academy===academy);
  for(const n of ['Coach Ana López','Coach Luis Medina'])if(!coaches.some(c=>c.name===n)&&!have.has(n)){const c={id:newMemberId(),role:'Coach',name:n,academy,phone:'',email:'',bio:'',photo:''};state.directory.push(c);coaches.push(c)}
  const by=n=>String(n).split(' ').slice(0,2).join(' ');
  const group=groupData(),cur=today.slice(0,7),prev=shiftMonthKey(cur,-1);
  group.feeBank={bank:'Banco de prueba',holder:'CORDA PRUEBAS',account:'',clabe:'012345678901234567',payLink:''};
  group.feePlayers??=[];
  const payments=['Pagado','Pagado','Pendiente','En revisión','Pagado','Pendiente','Pagado','Pagado','Pendiente','Pagado','Pagado','Pendiente'];
  TEST_PLAYERS.forEach(([name,rate,minor],i)=>{
    if(have.has(name))return;
    const id=newMemberId(),m={id,role:'Jugador',name,academy,phone:'',email:'',bio:'',photo:''};
    state.directory.push(m);
    const athlete=athleteFor(m);
    athlete.goals=[{id:Date.now()+i,title:['Construir un segundo saque confiable','Ganar consistencia desde el fondo','Mejorar la volea','Subir el nivel de juego en torneo'][i%4],detail:'',progress:[25,40,60,75,15,50][i%6]}];
    // Asistencia de las últimas 5 semanas (lunes, miércoles y viernes), con ritmo distinto por jugador.
    const store=state.checkins[id]??={coach:{},player:{}};store.coach??={};
    for(let d=35;d>=0;d--){
      const day=dateAfter(today,-d),wd=(new Date(day+'T12:00:00').getDay()+6)%7;
      if(![0,2,4].includes(wd)||day>today)continue;
      const seed=(i*7+d*13)%100/100,coach=coaches[(i+d)%coaches.length];
      store.coach[day]={attended:seed<rate,by:by(coach.name),at:day+'T18:00:00'};
    }
    // Notas del coach: las más recientes, para los primeros jugadores.
    if(i<9){
      const day=dateAfter(today,-(i%4)),e=store.coach[day]||(store.coach[day]={attended:true,by:by(coaches[0].name),at:day+'T18:00:00'});
      if(e.attended!==false){e.good=TEST_GOOD[i%TEST_GOOD.length];e.missing=TEST_FOCUS[i%TEST_FOCUS.length];e.score=[85,65,85,65,40][i%5];e.by=by(coaches[i%coaches.length].name)}
      athlete.reviews??={};athlete.reviews[day]={good:e.good||'',focus:e.missing||''};
    }
    // Mensualidad: mes pasado pagado casi para todos; este mes variado.
    const ledger={id,code:'PR'+String(1000+i*37).slice(0,4),months:{}};
    ledger.months[prev]={amount:1800,payment:i===3?'Pendiente':'Pagado'};
    ledger.months[cur]={amount:1800,payment:payments[i]};
    group.feePlayers.push(ledger);
  });
  // Plan de la semana actual y la próxima.
  const mon=weekOf(today),plan=[[0,'07:00','Tenis','Consistencia y profundidad','Cancha 3',90],[2,'07:00','Tenis','Saque + primera pelota','Cancha 2',90],[2,'16:00','Físico','Fuerza y estabilidad','Gimnasio',60],[4,'08:00','Tenis','Patrones de partido','Cancha 1',90]];
  for(const w of [0,7])for(const [off,time,type,title,place,dur] of plan){
    const date=dateAfter(mon,w+off);
    if(state.sessions.some(s=>s.date===date&&s.time===time&&s.title===title))continue;
    state.sessions.push({id:Date.now()+Math.floor(Math.random()*1e6),date,day:off,time,type,title,duration:String(dur),place,goal:type==='Físico'?'Preparación física':'Ganar consistencia desde el fondo',notes:'Sesión de prueba.',done:false});
  }
  if(save()){toast('Academia de pruebas cargada');render()}
}
function testSheetOpen(){
  if(!testOn())return;
  const kids=academyPlayers(TEST_ACADEMY).filter(m=>TEST_PLAYERS.find(([n,,minor])=>n===m.name&&minor));
  if(!kids.length){toast('Primero carga los datos de la academia de pruebas.');return}
  const opt=kids.map(k=>`<option value="${esc(k.id)}">${esc(k.name)}</option>`).join('');
  modal('Hoja de códigos de prueba',`<p class="full hint">Crea un código de un solo uso (vence en 30 días) para cada persona que va a probar. Escribe su nombre; no uses datos reales de menores sin permiso.</p>
    <label class="full">Coach de prueba<input name="coach" placeholder="Nombre del coach"></label>
    <label class="full">Familia 1 · nombre del tutor<input name="t1" placeholder="Nombre de mamá o papá"></label><label class="full">Su hijo(a)<select name="k1">${opt}</select></label>
    <label class="full">Familia 2 · nombre del tutor<input name="t2" placeholder="Nombre de mamá o papá"></label><label class="full">Su hijo(a)<select name="k2">${opt}</select></label>
    <label class="full">Jugador adulto<input name="pl" placeholder="Nombre del jugador"></label>`,
    async data=>{
      const rows=[],ask=async(role,label,child)=>{const r=await cloud.rpc('create_access_code',{p_role:role,p_label:label,p_ref:'',p_child:child||''});if(r.error)throw r.error;rows.push([role,label,child?(kids.find(k=>k.id===child)?.name||''):'',r.data])};
      try{
        const {data:s}=await cloud.auth.getSession();if(!s?.session){toast('Inicia sesión con tu cuenta de coach.');return false}
        if(data.coach.trim())await ask('Coach',data.coach.trim());
        if(data.t1.trim())await ask('Tutor','Tutor: '+data.t1.trim(),data.k1);
        if(data.t2.trim())await ask('Tutor','Tutor: '+data.t2.trim(),data.k2);
        if(data.pl.trim())await ask('Jugador',data.pl.trim());
      }catch(e){toast((e&&e.message)||'No se pudo crear un código.');return false}
      if(!rows.length){toast('Escribe al menos un nombre.');return false}
      const url=location.origin+location.pathname,text=['HOJA DE CÓDIGOS · '+TEST_ACADEMY,'Entrar en: '+url,'',...rows.map(r=>`${r[0]} · ${r[1]}${r[2]?' (hijo(a): '+r[2]+')':''}: ${r[3]}`)].join('\n');
      setTimeout(()=>modal('Hoja de códigos',`<p class="full hint">Cada código sirve una sola vez. Cópiala y guárdala; los códigos no vuelven a mostrarse completos si los pierdes (puedes crear otros).</p><textarea class="full" rows="${rows.length+4}" readonly>${esc(text)}</textarea><div class="full"><button type="button" class="btn lime" id="ts-copy">Copiar hoja</button></div>`,null),150);
      setTimeout(()=>{const b=$('#ts-copy');if(b)b.onclick=()=>navigator.clipboard.writeText(text).then(()=>toast('Hoja copiada'),()=>toast('No se pudo copiar.'))},400);
    },'Crear códigos');
}
function testToolsCard(){
  if(!testOn())return '';
  return `<section class="card own-cta"><div><small class="eyebrow">Solo para pruebas</small><h2>Academia de pruebas</h2><p class="hint">Carga jugadores, asistencia, notas y mensualidades de ejemplo, y crea los códigos para quienes van a probar.</p></div><div class="own-actions"><button class="btn lime" id="ts-seed">Cargar datos de ejemplo</button><button class="btn light" id="ts-sheet">Hoja de códigos</button></div></section>`;
}
function bindTestSeed(){
  if(role!=='Coach')return;
  if($('#ts-seed'))$('#ts-seed').onclick=testSeed;
  if($('#ts-sheet'))$('#ts-sheet').onclick=testSheetOpen;
}
