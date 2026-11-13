// Movimiento de la app: entrada de cada página, números que suben, barras que se llenan y confeti al confirmar asistencia.
// Todo se apaga si la persona pidió «reducir movimiento» en su dispositivo.
(()=>{
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce)return;
  const app=document.getElementById('app');
  if(!app)return;
  let lastKey='',timer=null;

  // Números que suben de 0 al valor: «79», «7,0 h», «1840 UA».
  function countUp(el){
    const m=el.textContent.trim().match(/^(\d+(?:[.,]\d+)?)(.*)$/s);if(!m)return;
    const sep=/[.,]/.exec(m[1])?.[0]||'',dec=sep?m[1].split(sep)[1].length:0,target=parseFloat(m[1].replace(',','.')),tail=m[2],final=el.textContent;
    if(!Number.isFinite(target)||target===0)return;
    const t0=performance.now(),dur=900;
    const step=now=>{
      const u=Math.min(1,(now-t0)/dur),v=target*(1-Math.pow(1-u,3));
      el.textContent=(dec?v.toFixed(dec).replace('.',sep):Math.round(v))+tail;
      if(u<1&&el.isConnected)requestAnimationFrame(step);else if(el.isConnected)el.textContent=final;
    };
    requestAnimationFrame(step);
  }

  // Cada vez que se cambia de página (no en cada actualización de datos) las tarjetas entran en cascada.
  new MutationObserver(()=>{
    const shell=app.querySelector('.shell');if(!shell)return;
    const key=(app.querySelector('.nav .active')?.dataset.page||'')+'|'+(shell.querySelector('main h1')?.textContent||'');
    if(key===lastKey)return;
    lastKey=key;
    shell.classList.add('motion-enter');
    shell.querySelectorAll('.well-metrics b,[data-count]').forEach(countUp);
    clearTimeout(timer);timer=setTimeout(()=>shell.classList.remove('motion-enter'),1500);
  }).observe(app,{childList:true});

  // Confeti al confirmar asistencia.
  function burst(el){
    const r=el.getBoundingClientRect(),box=document.createElement('div');
    box.className='confetti';box.style.left=(r.left+r.width/2)+'px';box.style.top=(r.top+r.height/2)+'px';
    const colors=['#C8F03C','#8FBF6E','#F4EFE3','#E8DCC2'];
    for(let i=0;i<20;i++){
      const s=document.createElement('i'),a=Math.random()*Math.PI*2,d=60+Math.random()*80;
      s.style.setProperty('--dx',Math.cos(a)*d+'px');s.style.setProperty('--dy',(Math.sin(a)*d-24)+'px');
      s.style.setProperty('--r',(Math.random()*540-270)+'deg');s.style.background=colors[i%colors.length];
      box.appendChild(s);
    }
    document.body.appendChild(box);setTimeout(()=>box.remove(),1100);
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest?.('[data-confirm-session]');
    if(b&&b.getAttribute('aria-pressed')!=='true')burst(b);
  },true);
})();
