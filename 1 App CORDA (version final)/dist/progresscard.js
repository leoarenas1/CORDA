// CORDA · Tarjeta de avance: una imagen con lo que mejoró el jugador, para compartir con la familia.
// Solo incluye asistencia, lo que mejoró, el siguiente ajuste y un objetivo. Nada de salud ni de pagos.
function pcData(member){
  const id=member.id,today=localDay(),from=dateAfter(today,-30);
  let went=0,total=0;
  for(const [d,c] of Object.entries(peekCheckins(id).coach||{})){if(d<from||d>today)continue;total++;if(c.attended!==false)went++}
  const cap=t=>t?t.charAt(0).toUpperCase()+t.slice(1):t,note=coachLatest(id),clean=s=>String(s||'').replace(/^(Mejoró|Siguiente ajuste):\s*/i,'').trim();
  const goal=(athleteFor(member).goals||[])[0]||null;
  return {name:String(member.name||'').trim(),first:String(member.name||'').trim().split(/\s+/)[0],academy:member.academy||actor()?.academy||'',
    month:dateLabel(today.slice(0,7)+'-01',{month:'long',year:'numeric'}),went,total,good:note?cap(clean(note.good)):'',focus:note?cap(clean(note.focus)):'',goal,photo:member.photo||''};
}
function pcCount(ctx,text,maxW){
  let n=0,line='';for(const w of String(text).split(/\s+/)){const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){n++;line=w}else line=t}
  return n+(line?1:0);
}
function pcWrap(ctx,text,x,y,maxW,lh,maxLines){
  const words=String(text).split(/\s+/),lines=[];let line='';
  for(const w of words){const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){lines.push(line);line=w}else line=t}
  if(line)lines.push(line);
  if(lines.length>maxLines){lines.length=maxLines;lines[maxLines-1]=lines[maxLines-1].replace(/[\s.,;:]*$/,'')+'…'}
  lines.forEach((l,i)=>ctx.fillText(l,x,y+i*lh));
  return y+lines.length*lh;
}
async function pcDraw(member){
  const d=pcData(member),W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;
  const ctx=c.getContext('2d'),fam=getComputedStyle(document.body).fontFamily||'sans-serif';
  try{await document.fonts.ready}catch{}
  ctx.fillStyle='#0F3B2C';ctx.fillRect(0,0,W,H);
  // trama de cordaje, muy tenue
  ctx.strokeStyle='rgba(247,244,236,.06)';ctx.lineWidth=2;
  for(let x=60;x<W;x+=90){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
  for(let y=60;y<H;y+=90){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
  const M=84;ctx.textBaseline='alphabetic';
  ctx.fillStyle='#F7F4EC';ctx.font='800 64px '+fam;ctx.fillText('CORDA',M,140);
  const cw=ctx.measureText('CORDA').width;ctx.fillStyle='#C8F03C';ctx.beginPath();ctx.arc(M+cw+14,131,8,0,7);ctx.fill();
  ctx.fillStyle='rgba(247,244,236,.7)';ctx.font='600 30px '+fam;ctx.textAlign='right';ctx.fillText(d.month.toUpperCase(),W-M,138);ctx.textAlign='left';
  // jugador
  let nameX=M;
  if(d.photo){
    try{const img=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=d.photo});
      const s=Math.min(img.width,img.height);ctx.save();ctx.beginPath();ctx.arc(M+70,300,70,0,7);ctx.clip();ctx.drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,M,230,140,140);ctx.restore();nameX=M+170}catch{}
  }
  ctx.fillStyle='#F7F4EC';ctx.font='800 76px '+fam;
  let y=pcWrap(ctx,d.name,nameX,d.photo?292:300,W-M-nameX,84,2);
  ctx.fillStyle='rgba(247,244,236,.7)';ctx.font='600 32px '+fam;ctx.fillText(d.academy,nameX,y+6);
  y=Math.max(y+60,d.photo?420:400);
  // asistencia
  if(d.total){
    const pct=Math.round(d.went/d.total*100);
    ctx.fillStyle='#C8F03C';ctx.font='800 120px '+fam;ctx.fillText(pct+'%',M,y+100);
    ctx.fillStyle='#F7F4EC';ctx.font='700 36px '+fam;ctx.fillText('de asistencia',M+ctx.measureText(pct+'%').width*0+330,y+60);
    ctx.fillStyle='rgba(247,244,236,.7)';ctx.font='600 30px '+fam;ctx.fillText(d.went+' de '+d.total+' entrenamientos este mes',M+330,y+104);
    y+=170;
  }
  // bloques
  const block=(label,text,hl,top)=>{
    ctx.fillStyle=hl?'#C8F03C':'rgba(247,244,236,.08)';
    ctx.font='600 40px '+fam;const n=Math.min(3,Math.max(1,pcCount(ctx,text,W-2*M-80)));
    const h=110+n*52;ctx.beginPath();ctx.roundRect(M,top,W-2*M,h,28);ctx.fill();
    ctx.fillStyle=hl?'#0F3B2C':'rgba(247,244,236,.7)';ctx.font='800 28px '+fam;ctx.fillText(label.toUpperCase(),M+40,top+60);
    ctx.fillStyle=hl?'#0F3B2C':'#F7F4EC';ctx.font='600 40px '+fam;pcWrap(ctx,text,M+40,top+120,W-2*M-80,52,3);
    return top+h+28;
  };
  if(d.good)y=block('✓ Lo que mejoró',d.good,true,y);
  if(d.focus)y=block('➜ Siguiente ajuste',d.focus,false,y);
  if(!d.good&&!d.focus){ctx.fillStyle='rgba(247,244,236,.7)';ctx.font='600 38px '+fam;pcWrap(ctx,'Aún no hay una nota del coach este mes.',M,y+40,W-2*M,50,2)}
  if(d.goal&&y<H-260){
    const p=Math.max(0,Math.min(100,Number(d.goal.progress)||0));
    ctx.fillStyle='rgba(247,244,236,.7)';ctx.font='800 26px '+fam;ctx.fillText('OBJETIVO',M,y+34);
    ctx.fillStyle='#F7F4EC';ctx.font='600 34px '+fam;pcWrap(ctx,d.goal.title,M,y+84,W-2*M-150,44,1);
    ctx.fillStyle='#C8F03C';ctx.font='800 34px '+fam;ctx.textAlign='right';ctx.fillText(p+'%',W-M,y+84);ctx.textAlign='left';
    ctx.fillStyle='rgba(247,244,236,.15)';ctx.beginPath();ctx.roundRect(M,y+108,W-2*M,14,7);ctx.fill();
    ctx.fillStyle='#C8F03C';ctx.beginPath();ctx.roundRect(M,y+108,Math.max(14,(W-2*M)*p/100),14,7);ctx.fill();
  }
  ctx.fillStyle='rgba(247,244,236,.55)';ctx.font='600 26px '+fam;ctx.fillText('Tu juego, con dirección · cordatenis.com',M,H-60);
  return {canvas:c,data:d};
}
async function progressCardOpen(id){
  const member=(state.directory||[]).find(m=>m.id===id);if(!member)return;
  modal('Tarjeta de avance','<p class="full hint">Una imagen con el avance del mes para compartir con la familia. Incluye asistencia, lo que mejoró, el siguiente ajuste y un objetivo; no incluye salud ni pagos.</p><div class="full pc-wrap"><div class="pc-loading hint">Preparando la tarjeta…</div></div><div class="full pc-actions"><button type="button" class="btn lime" id="pc-share">Compartir</button><button type="button" class="btn light" id="pc-save">Descargar imagen</button></div>',null);
  const {canvas,data}=await pcDraw(member),wrap=$('#modal .pc-wrap');if(!wrap)return;
  canvas.className='pc-canvas';canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Tarjeta de avance de '+data.name);wrap.replaceChildren(canvas);
  const blob=()=>new Promise(r=>canvas.toBlob(r,'image/png')),fname='avance-'+data.first.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g,'')+'.png';
  $('#pc-save').onclick=async()=>{const b=await blob(),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=fname;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};
  $('#pc-share').onclick=async()=>{
    const b=await blob(),file=new File([b],fname,{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],text:'Avance de '+data.first+' · '+data.academy});return}catch(e){if(e&&e.name==='AbortError')return}}
    $('#pc-save').click();toast('Imagen descargada. Envíala por WhatsApp desde tus archivos.');
  };
}
function bindProgressCard(){
  document.querySelectorAll('[data-progress-card]').forEach(b=>b.onclick=()=>progressCardOpen(b.dataset.progressCard));
}
