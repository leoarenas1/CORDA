// CORDA · Intro de la app. Cuatro versiones:
//   web     La de la página: letras, pelota que se dibuja, golpe y círculo que abre la app.
//   cancha  3D: cancha en perspectiva, la pelota viene hacia ti, destello y el nombre.
//   pelota  3D: pelota de tenis girando (se dibuja en 3D), las letras llegan desde el fondo.
//   letras  3D: letras con volumen, la pelota cae como punto y la cámara atraviesa la «O».
// Uso: CordaIntro.play('cancha'). Se salta con clic, «Saltar» o Esc. No se muestra con «menos movimiento».
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const TAG = 'Tu juego, con dirección.';
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let uid = 0;

  const ballSVG = (draw) => {
    const id = 'cib' + (++uid);
    const d = draw ? ' pathLength="1" stroke-dasharray="1 2" stroke-dashoffset="1"' : '';
    return `<svg viewBox="0 0 100 100" focusable="false" aria-hidden="true"><defs><clipPath id="${id}"><circle cx="50" cy="50" r="50"/></clipPath><radialGradient id="${id}g" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#E4FF7A"/><stop offset=".55" stop-color="#C8F03C"/><stop offset="1" stop-color="#93B921"/></radialGradient></defs><circle cx="50" cy="50" r="50" fill="url(#${id}g)"/><g clip-path="url(#${id})" fill="none" stroke="#F4EFE3" stroke-width="6" stroke-linecap="round"><path class="seam"${d} d="M6 18C42 38 42 62 6 82"/><path class="seam"${d} d="M94 18C58 38 58 62 94 82"/></g></svg>`;
  };
  const word = (cls = '') => `<div class="ci-word ${cls}" role="img" aria-label="CORDA">${[...'CORDA'].map(l => `<span class="cl" aria-hidden="true">${l}</span>`).join('')}<span class="cdot" aria-hidden="true"></span></div>`;
  const centerOf = el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; };

  /* ---------------- Núcleo ---------------- */
  function play(variant = 'web', opts = {}) {
    if (document.getElementById('corda-intro')) return;
    if (reduce() && !opts.force) { opts.onDone && opts.onDone(); return; }
    const rate = opts.rate || 1;
    const run = VARIANTS[variant] || VARIANTS.web;
    const root = document.createElement('div');
    root.className = 'ci'; root.id = 'corda-intro';
    root.innerHTML = '<div class="ci-bg"></div><div class="ci-stage"></div><button class="ci-skip" type="button">Saltar</button>';
    const behind = [...document.querySelectorAll('#app,#modal')];
    behind.forEach(e => e.setAttribute('inert', ''));
    document.body.append(root);

    const anims = [], timers = [], stops = [];
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout); stops.forEach(s => s());
      anims.forEach(a => { try { a.cancel(); } catch {} });
      behind.forEach(e => e.removeAttribute('inert'));
      removeEventListener('keydown', onKey);
      root.remove();
      opts.onDone && opts.onDone();
    };
    const onKey = e => { if (e.key === 'Escape') finish(); };
    addEventListener('keydown', onKey);
    root.addEventListener('click', finish);
    root.querySelector('.ci-skip').addEventListener('click', e => { e.stopPropagation(); finish(); });
    timers.push(setTimeout(finish, 12000 * rate));

    const c = {
      root, bg: root.querySelector('.ci-bg'), stage: root.querySelector('.ci-stage'), finish,
      isDone: () => done,
      after(ms, fn) { timers.push(setTimeout(() => { if (!done) fn(); }, ms * rate)); },
      anim(el, frames, o = {}) {
        const a = el.animate(frames, { fill: 'both', ...o, duration: (o.duration || 0) * rate, delay: (o.delay || 0) * rate });
        anims.push(a); return a;
      },
      loop(fn) {
        let id, t0;
        const f = t => { if (done) return; if (t0 === undefined) t0 = t; fn((t - t0) / rate); id = requestAnimationFrame(f); };
        id = requestAnimationFrame(f); stops.push(() => cancelAnimationFrame(id));
      },
      ring(x, y, size, ms) {
        const el = document.createElement('i');
        el.className = 'ci-ring';
        Object.assign(el.style, { left: x - size / 2 + 'px', top: y - size / 2 + 'px', width: size + 'px', height: size + 'px' });
        root.append(el);
        c.anim(el, [{ transform: 'scale(.2)', opacity: .9 }, { transform: 'scale(2.4)', opacity: 0 }], { duration: ms, easing: 'cubic-bezier(.2,.7,.3,1)' });
      },
      // Círculo que se abre desde (x,y) y deja ver la app
      reveal(x, y, ms = 750) {
        if (done) return;
        const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 20;
        const canMask = window.CSS && CSS.registerProperty && CSS.supports('mask-image', 'radial-gradient(circle at 1px 1px, #000, transparent)');
        let a;
        if (canMask) {
          try { CSS.registerProperty({ name: '--r', syntax: '<length>', inherits: false, initialValue: '0px' }); } catch {}
          const mask = `radial-gradient(circle at ${x}px ${y}px, transparent var(--r), #000 calc(var(--r) + 2px))`;
          root.style.webkitMaskImage = mask; root.style.maskImage = mask;
          a = c.anim(root, [{ '--r': '0px' }, { '--r': R + 'px' }], { duration: ms, easing: 'cubic-bezier(.65,0,.35,1)' });
        } else a = c.anim(root, [{ opacity: 1 }, { opacity: 0 }], { duration: ms * .6 });
        a.onfinish = finish;
      }
    };
    const start = () => { if (!done) run(c); };
    Promise.race([
      document.fonts ? document.fonts.load('700 100px "Space Grotesk"') : Promise.resolve(),
      new Promise(r => setTimeout(r, 800))
    ]).then(start, start);
    return c;
  }

  /* ---------------- 1 · Web (como la página) ---------------- */
  function web(c) {
    c.stage.innerHTML = `<div class="ci-center">${word()}<p class="ci-tag">${TAG}</p></div>`;
    const letters = [...c.stage.querySelectorAll('.cl')];
    const slot = c.stage.querySelector('.cdot');
    slot.innerHTML = ballSVG(true);
    const tag = c.stage.querySelector('.ci-tag'), svg = slot.querySelector('svg'), seams = [...slot.querySelectorAll('.seam')];
    slot.style.transform = 'scale(0)';
    const soft = 'cubic-bezier(.2,.8,.2,1)';
    letters.forEach((l, i) => c.anim(l, [
      { opacity: 0, transform: 'translateY(.18em)', filter: 'blur(8px)' },
      { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }
    ], { duration: 550, delay: 250 + i * 140, easing: soft }));
    c.anim(tag, [{ opacity: 0 }, { opacity: .85 }], { duration: 600, delay: 1900 });
    c.anim(slot, [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 280, delay: 1400, easing: 'cubic-bezier(.34,1.56,.64,1)' });
    c.anim(svg, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(200deg)' }], { duration: 600, delay: 1700, easing: 'ease-out' });
    seams.forEach(s => c.anim(s, [
      { strokeDashoffset: 1, opacity: 0 }, { strokeDashoffset: .95, opacity: 1, offset: .05 }, { strokeDashoffset: 0, opacity: 1 }
    ], { duration: 600, delay: 1700, easing: 'ease-in-out' }));
    c.after(2500, () => c.anim(slot, [{ transform: 'scale(1)' }, { transform: 'scale(1.35,.7)' }], { duration: 160, easing: 'ease-in' }));
    c.after(2660, () => {
      const r = slot.getBoundingClientRect();
      const S = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      const hit = letters[2].getBoundingClientRect();
      const T = { x: hit.left + hit.width / 2, y: hit.top + hit.height * .22 - r.height / 2 };
      const arc = Math.max(130, innerHeight * .3);
      const C = { x: (S.x + T.x) / 2, y: Math.min(S.y, T.y) - arc };
      const N = 40, dur = 680, pts = [];
      for (let i = 0; i <= N; i++) { const u = i / N, v = 1 - u; pts.push({ x: v * v * S.x + 2 * v * u * C.x + u * u * T.x, y: v * v * S.y + 2 * v * u * C.y + u * u * T.y }); }
      const cum = [0]; for (let i = 1; i <= N; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
      const total = cum[N];
      const tr = document.createElementNS(NS, 'svg'); tr.setAttribute('class', 'ci-trail'); tr.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('pathLength', '1'); path.setAttribute('stroke-dasharray', '1 2');
      path.setAttribute('d', pts.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' '));
      tr.append(path); c.root.append(tr);
      c.anim(path, pts.map((_, i) => ({ strokeDashoffset: 1 - cum[i] / total, offset: i / N })), { duration: dur, easing: 'linear' });
      const fly = document.createElement('div'); fly.className = 'ci-fly';
      Object.assign(fly.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
      fly.append(svg.cloneNode(true));
      fly.querySelectorAll('.seam').forEach(s => { s.setAttribute('stroke-dashoffset', '0'); s.style.opacity = 1; });
      c.root.append(fly); slot.style.visibility = 'hidden';
      c.anim(fly, pts.map((p, i) => ({ transform: `translate(${p.x - S.x}px,${p.y - S.y}px) rotate(${(i / N) * 900}deg) scale(${1 - .12 * (i / N)})`, offset: i / N })), { duration: dur, easing: 'linear' });
      c.ring(S.x, S.y, r.width * 1.4, 400);
      c.after(dur, () => {
        c.ring(T.x, T.y + r.height / 2, r.width * 2.4, 550);
        letters.forEach((l, i) => c.anim(l, [{ transform: 'translateY(0)' }, { transform: 'translateY(-.07em)', offset: .35 }, { transform: 'translateY(0)' }], { duration: 360, delay: Math.abs(i - 2) * 50, easing: 'ease-out' }));
        c.anim(fly, [{ opacity: 1 }, { opacity: 0 }], { duration: 120 });
        c.anim(tr, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 });
        c.after(180, () => c.reveal(T.x, T.y + r.height / 2));
      });
    });
  }

  /* ---------------- 2 · Cancha en 3D ---------------- */
  function cancha(c) {
    const W = 1100, L = 2377, G = 330;
    const lines = `<svg viewBox="0 0 ${W} ${L}" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="cns" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".5" stop-color="#000" stop-opacity=".42"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs>
      <rect x="0" y="${L / 2 - 16}" width="${W}" height="44" fill="url(#cns)"/>
      <g fill="none" stroke="#F4EFE3" stroke-width="9" opacity=".9">
      <rect x="6" y="6" width="${W - 12}" height="${L - 12}"/><path d="M${W * .125} 6V${L - 6}M${W * .875} 6V${L - 6}"/>
      <path d="M${W * .125} ${L * .2}H${W * .875}M${W * .125} ${L * .8}H${W * .875}M${W / 2} ${L * .2}V${L * .8}M${W / 2} 6v26M${W / 2} ${L - 6}v-26"/></g></svg>`;
    c.stage.innerHTML = `<div class="ci-scene"><div class="ci-world">
        <div class="ci-court" style="top:${G}px">${lines}</div><div class="ci-net" style="top:${G - 91}px"></div>
        <div class="ci-dustbox"></div><i class="ci-shadow"></i><div class="ci-ball3"><canvas></canvas></div></div></div>
      <div class="ci-flash"></div><div class="ci-center ci-final">${word()}<p class="ci-tag">${TAG}</p></div>`;
    const $ = s => c.stage.querySelector(s);
    const scene = $('.ci-scene'), world = $('.ci-world'), flash = $('.ci-flash'), dustbox = $('.ci-dustbox');
    const ball = $('.ci-ball3'), shadow = $('.ci-shadow');
    const letters = [...c.stage.querySelectorAll('.cl')], slot = $('.cdot'), tag = $('.ci-tag');
    slot.innerHTML = ballSVG(false); slot.style.transform = 'scale(0)';
    c.bg.style.opacity = 1;

    // La pelota se dibuja en 3D (con su costura) y gira mientras vuela
    const orb = makeOrb(300);
    const cv = $('.ci-ball3 canvas'); cv.width = cv.height = 300; const cg = cv.getContext('2d');
    c.loop(t => { orb.draw(.5, t * .011); cg.clearRect(0, 0, 300, 300); cg.drawImage(orb, 0, 0); });

    // Cámara: avanza despacio por la cancha
    c.anim(world, [{ transform: 'translate3d(0,-30px,0) rotateX(5deg)' }, { transform: 'translate3d(0,0,380px) rotateX(0deg)' }], { duration: 3150, easing: 'cubic-bezier(.45,.05,.55,.95)' });
    c.anim(scene, [{ opacity: 0 }, { opacity: 1 }], { duration: 600 });

    // Trayectoria: de la línea del fondo hacia ti, con un bote. Termina a unos 300 px de ancho (nítida).
    const N = 80, ub = .678, R = 28;
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const z = -2377 + 2727 * Math.pow(u, 1.5);
      let y;
      if (u < ub) y = -160 + (G - R + 160) * Math.pow(u / ub, 1.8);
      else { const s = (u - ub) / (1 - ub); y = (G - R) - ((G - R) + 30) * (1 - (1 - s) * (1 - s)); }
      pts.push({ x: 120 * Math.pow(1 - u, 1.3), y, z, u });
    }
    const T0 = 450, D = 2450, ib = Math.round(ub * N);
    const sq = i => { const k = Math.abs(i - ib); return k === 0 ? 'scale(1.16,.82)' : k === 1 ? 'scale(1.07,.93)' : 'scale(1)'; };
    c.anim(ball, [{ opacity: 0, offset: 0 }, ...pts.map((p, i) => ({ transform: `translate3d(${p.x}px,${p.y}px,${p.z}px) ${sq(i)}`, opacity: 1, offset: Math.max(i / N, .001) }))], { duration: D, delay: T0, easing: 'linear' });
    c.anim(shadow, pts.map((p, i) => { const h = Math.max(0, G - R - p.y); return { transform: `translate3d(${p.x}px,${G + 1}px,${p.z}px) rotateX(90deg) scale(${(1.05 + Math.min(1, h / 360) * .55).toFixed(2)})`, opacity: Math.max(0, Math.min(.8, .9 - h / 450)), offset: i / N }; }), { duration: D, delay: T0, easing: 'linear' });

    // Polvo suave al botar
    const pb = pts[ib], tb = T0 + D * ub;
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2 + Math.random() * .4, r = 70 + Math.random() * 90;
      const d = document.createElement('i'); d.className = 'ci-dust'; dustbox.append(d);
      const base = `translate3d(${pb.x}px,${G}px,${pb.z}px) rotateX(90deg)`;
      c.anim(d, [{ transform: `${base} translate(0,0) scale(.4)`, opacity: .55 }, { transform: `${base} translate(${Math.cos(a) * r}px,${Math.sin(a) * r}px) scale(${1.6 + Math.random()})`, opacity: 0 }], { duration: 700 + Math.random() * 300, delay: tb, easing: 'cubic-bezier(.2,.7,.3,1)' });
    }

    // Final suave: la escena se desenfoca y se apaga (sin destello amarillo); aparece el nombre
    const TF = T0 + D - 260;
    c.anim(scene, [{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(10px)' }], { duration: 650, delay: TF, easing: 'ease-in' });
    c.anim(flash, [{ opacity: 0 }, { opacity: .5, offset: .45 }, { opacity: 0 }], { duration: 900, delay: TF + 100, easing: 'ease-in-out' });
    letters.forEach((l, i) => c.anim(l, [
      { opacity: 0, transform: 'translateZ(260px) scale(1.5)', filter: 'blur(12px)' },
      { opacity: 1, transform: 'translateZ(0) scale(1)', filter: 'blur(0)' }
    ], { duration: 600, delay: TF + 420 + i * 70, easing: 'cubic-bezier(.2,.9,.2,1)' }));
    c.anim(slot, [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 320, delay: TF + 820, easing: 'cubic-bezier(.34,1.56,.64,1)' });
    c.anim(tag, [{ opacity: 0 }, { opacity: .85 }], { duration: 600, delay: TF + 1050 });
    c.after(TF + 780, () => { const d = centerOf(slot); c.ring(d.x, d.y, d.w * 2.4, 600); });
    c.after(TF + 2000, () => { const d = centerOf(slot); c.reveal(d.x, d.y); });
  }

  /* ---------------- 3 · Pelota 3D (se dibuja punto por punto) ---------------- */
  let TEX = null;
  function ballTexture() {
    if (TEX) return TEX;
    const w = 1024, h = 512, cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const g = cv.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff';
    const K = .42, Z = .95, M = 1600;
    for (let i = 0; i < M; i++) {
      const t = (i / M) * Math.PI * 2;
      let x = Math.cos(t) + K * Math.cos(3 * t), y = Math.sin(t) - K * Math.sin(3 * t), z = Z * Math.sin(2 * t);
      const l = Math.hypot(x, y, z); x /= l; y /= l; z /= l;
      const lon = Math.atan2(x, z), lat = Math.asin(y);
      const px = (lon / (Math.PI * 2) + .5) * w, py = (lat / Math.PI + .5) * h;
      const ry = .075 * h / Math.PI, rx = Math.min(ry / Math.max(.2, Math.cos(lat)), 60);
      for (const dx of [-w, 0, w]) { g.beginPath(); g.ellipse(px + dx, py, rx, ry, 0, 0, Math.PI * 2); g.fill(); }
    }
    const src = g.getImageData(0, 0, w, h).data, a = new Uint8Array(w * h);
    for (let i = 0; i < a.length; i++) a[i] = src[i * 4];
    return (TEX = { w, h, a });
  }
  function makeOrb(size) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = size;
    const g = cv.getContext('2d'), img = g.createImageData(size, size), d = img.data, tex = ballTexture();
    const LX = -.45, LY = -.55, LZ = .7, LL = Math.hypot(LX, LY, LZ);
    cv.draw = (yaw, pitch) => {
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      for (let py = 0; py < size; py++) {
        const ny = ((py + .5) / size) * 2 - 1;
        for (let px = 0; px < size; px++) {
          const nx = ((px + .5) / size) * 2 - 1, r2 = nx * nx + ny * ny, o = (py * size + px) * 4;
          if (r2 >= 1.02) { d[o + 3] = 0; continue; }
          const r = Math.sqrt(r2), edge = Math.min(1, Math.max(0, (1 - r) * size * .5));
          const nz = Math.sqrt(Math.max(0, 1 - r2));
          const x1 = nx * cy - nz * sy, z1 = nx * sy + nz * cy;
          const y2 = ny * cp - z1 * sp, z2 = ny * sp + z1 * cp;
          const lon = Math.atan2(x1, z2), lat = Math.asin(Math.max(-1, Math.min(1, y2)));
          const u = ((lon / 6.283185 + .5) * tex.w) | 0, v = ((lat / Math.PI + .5) * tex.h) | 0;
          const seam = tex.a[v * tex.w + u] / 255;
          const dif = Math.max(0, (nx * LX + ny * LY + nz * LZ) / LL);
          const grain = (((u * 7 + v * 13) * 2654435761 >>> 24) / 255 - .5) * .1;
          const sh = (.36 + .74 * dif) * (1 + grain), spec = Math.pow(dif, 22) * .3, rim = Math.pow(1 - nz, 2.6) * .22;
          const R = 200 + 44 * seam, Gc = 240 - seam, B = 60 + 167 * seam;
          d[o] = Math.min(255, R * sh + spec * 255 + rim * 90);
          d[o + 1] = Math.min(255, Gc * sh + spec * 255 + rim * 120);
          d[o + 2] = Math.min(255, B * sh + spec * 255 + rim * 40);
          d[o + 3] = edge * 255;
        }
      }
      g.putImageData(img, 0, 0);
    };
    return cv;
  }

  function pelota(c) {
    c.stage.innerHTML = `<div class="ci-center ci-rush">${word()}<p class="ci-tag">${TAG}</p></div><div class="ci-orb"></div>`;
    const orbBox = c.stage.querySelector('.ci-orb');
    const letters = [...c.stage.querySelectorAll('.cl')], slot = c.stage.querySelector('.cdot'), tag = c.stage.querySelector('.ci-tag');
    const S = Math.round(Math.min(innerWidth * .62, innerHeight * .42, 300));
    const glow = document.createElement('div'); glow.className = 'ci-glow'; glow.style.width = glow.style.height = S * 2.1 + 'px';
    const o1 = document.createElement('div'), o2 = document.createElement('div');
    o1.className = o2.className = 'ci-orbit'; o1.style.width = o1.style.height = S * 1.5 + 'px'; o2.style.width = o2.style.height = S * 1.85 + 'px';
    const orb = makeOrb(Math.min(360, Math.round(S * Math.min(2, devicePixelRatio || 1))));
    orb.style.width = orb.style.height = S + 'px';
    const holder = document.createElement('div'); holder.style.cssText = 'position:absolute;left:0;top:0;perspective:900px;transform-style:preserve-3d';
    orbBox.append(holder); holder.append(glow, o1, o2, orb);

    // La pelota se dibuja girando: empieza rápido y se va calmando
    const w0 = .013, tau = 800, w1 = .0009;
    c.loop(t => {
      const yaw = w0 * tau * (1 - Math.exp(-t / tau)) + w1 * t;
      orb.draw(yaw, .38 + Math.sin(t / 900) * .06);
    });
    c.anim(orbBox, [{ transform: 'scale(.25)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 750, easing: 'cubic-bezier(.2,.9,.2,1)' });
    c.anim(o1, [{ transform: 'translate(-50%,-50%) rotateX(72deg) rotateZ(0deg)' }, { transform: 'translate(-50%,-50%) rotateX(72deg) rotateZ(360deg)' }], { duration: 2600, easing: 'linear' });
    c.anim(o2, [{ transform: 'translate(-50%,-50%) rotateX(72deg) rotateY(25deg) rotateZ(360deg)' }, { transform: 'translate(-50%,-50%) rotateX(72deg) rotateY(25deg) rotateZ(0deg)' }], { duration: 2600, easing: 'linear' });
    c.anim(glow, [{ opacity: .5, transform: 'translate(-50%,-50%) scale(.9)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.08)' }], { duration: 900, direction: 'alternate', iterations: 3, easing: 'ease-in-out' });

    // Golpe, y la pelota viaja hasta el punto del logo mientras las letras llegan desde el fondo
    const T = 1500;
    c.anim(orbBox, [{ transform: 'scale(1)' }, { transform: 'scale(1.18,.84)' }, { transform: 'scale(1)' }], { duration: 220, delay: T });
    c.after(T + 90, () => c.ring(innerWidth / 2, innerHeight / 2, S * 1.1, 600));
    c.anim(o1, [{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: T + 150 });
    c.anim(o2, [{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: T + 150 });
    c.anim(glow, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: T + 400 });
    letters.forEach((l, i) => c.anim(l, [
      { opacity: 0, transform: 'translateZ(-1500px)', filter: 'blur(14px)' },
      { opacity: 1, transform: 'translateZ(0)', filter: 'blur(0)' }
    ], { duration: 760, delay: T + 260 + i * 90, easing: 'cubic-bezier(.15,.9,.2,1)' }));
    c.after(T + 200, () => {
      const d = centerOf(slot), s = d.w / S;
      c.anim(orbBox, [{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${d.x - innerWidth / 2}px,${d.y - innerHeight / 2}px) scale(${s})` }], { duration: 950, easing: 'cubic-bezier(.6,0,.2,1)' });
      c.after(950, () => { c.ring(d.x, d.y, d.w * 2.6, 650); letters.forEach((l, i) => c.anim(l, [{ transform: 'translateY(0)' }, { transform: 'translateY(-.06em)', offset: .35 }, { transform: 'translateY(0)' }], { duration: 380, delay: Math.abs(i - 4) * 45, easing: 'ease-out' })); });
    });
    c.anim(tag, [{ opacity: 0 }, { opacity: .85 }], { duration: 600, delay: T + 1600 });
    c.after(T + 2900, () => { const d = centerOf(slot); c.reveal(d.x, d.y); });
  }

  /* ---------------- 4 · Letras con volumen ---------------- */
  function letras(c) {
    const DEPTH = 16, STEP = 4;
    const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
    const lima = [200, 240, 60], verde = [15, 59, 44];
    const layer = l => { let h = ''; for (let k = DEPTH; k >= 1; k--) { const col = mix(lima, verde, k / DEPTH); h += `<i aria-hidden="true" style="transform:translateZ(${-k * STEP}px);color:rgb(${col})">${l}</i>`; } return h + `<i class="f" aria-hidden="true">${l}</i>`; };
    c.stage.innerHTML = `<div class="ci-persp"><div class="ci-par"><div class="ci-w3" role="img" aria-label="CORDA">${[...'CORDA'].map(l => `<span class="l3">${layer(l)}</span>`).join('')}<span class="cdot"></span></div></div></div><div class="ci-center" style="position:absolute;left:0;right:0;bottom:12vh"><p class="ci-tag">${TAG}</p></div>`;
    const $ = s => c.stage.querySelector(s);
    const persp = $('.ci-persp'), par = $('.ci-par'), w3 = $('.ci-w3'), slot = $('.cdot'), tag = $('.ci-tag');
    const letters = [...c.stage.querySelectorAll('.l3')];
    slot.innerHTML = ballSVG(false); slot.style.opacity = 0;

    // Chispas de pelotas flotando a distintas profundidades
    for (let i = 0; i < 20; i++) {
      const b = document.createElement('i'); b.className = 'ci-bit';
      const s = 6 + Math.random() * 16; b.style.setProperty('--s', s + 'px');
      const x = (Math.random() - .5) * innerWidth * 1.1, y = (Math.random() - .5) * innerHeight, z = -500 + Math.random() * 700;
      par.append(b);
      c.anim(b, [{ transform: `translate3d(${x}px,${y + 60}px,${z}px)`, opacity: 0 }, { opacity: .8, offset: .3 }, { transform: `translate3d(${x}px,${y - 80}px,${z}px)`, opacity: 0 }], { duration: 2600 + Math.random() * 1600, delay: Math.random() * 1500, iterations: 2, easing: 'ease-in-out' });
    }

    // Entrada: el nombre gira hacia la cámara
    c.anim(w3, [{ transform: 'translateZ(-900px) rotateY(-70deg) rotateX(16deg)' }, { transform: 'translateZ(0) rotateY(0) rotateX(0)' }], { duration: 1700, delay: 100, easing: 'cubic-bezier(.2,.8,.2,1)' });
    letters.forEach((l, i) => {
      c.anim(l, [
        { opacity: 0, transform: 'translateZ(-700px) rotateY(80deg)' },
        { opacity: 1, transform: 'translateZ(0) rotateY(0)' }
      ], { duration: 900, delay: 200 + i * 130, easing: 'cubic-bezier(.2,.85,.2,1)' });
      c.after(1300 + i * 100, () => l.querySelector('.f').classList.add('glint'));
    });
    c.anim(tag, [{ opacity: 0 }, { opacity: .85 }], { duration: 600, delay: 2500 });

    // Mueve el volumen con el dedo o el mouse, y se mece solo
    let px = 0, py = 0;
    const onMove = e => { const p = e.touches ? e.touches[0] : e; px = (p.clientX / innerWidth - .5) * 2; py = (p.clientY / innerHeight - .5) * 2; };
    addEventListener('pointermove', onMove);
    c.loop(t => { if (t > 3900) return; par.style.transform = `rotateY(${(-15 + Math.sin(t / 700) * 9 + px * 14).toFixed(2)}deg) rotateX(${(9 + Math.cos(t / 900) * 3 - py * 8).toFixed(2)}deg)`; });

    // La pelota cae y se vuelve el punto
    c.after(1900, () => {
      slot.style.opacity = 1;
      c.anim(slot, [
        { transform: 'translate3d(0,-70vh,500px) scale(.6)', offset: 0, easing: 'cubic-bezier(.5,0,1,.6)' },
        { transform: 'translate3d(0,0,0) scale(1.25,.7)', offset: .5, easing: 'ease-out' },
        { transform: 'translate3d(0,-.35em,60px) scale(.95,1.08)', offset: .72, easing: 'ease-in' },
        { transform: 'translate3d(0,0,0) scale(1.1,.88)', offset: .86 },
        { transform: 'translate3d(0,0,0) scale(1)', offset: 1 }
      ], { duration: 1000 });
      c.after(500, () => { const d = centerOf(slot); c.ring(d.x, d.y, d.w * 2.8, 650); letters.forEach((l, i) => c.anim(l, [{ transform: 'translateZ(0)' }, { transform: 'translateZ(42px)', offset: .4 }, { transform: 'translateZ(0)' }], { duration: 520, delay: Math.abs(i - 4) * 55, easing: 'ease-out', composite: 'replace' })); });
    });

    // La cámara atraviesa la «O» y se abre la app
    c.after(3800, () => {
      const rr = letters[1].getBoundingClientRect(), pr = persp.getBoundingClientRect();
      const dx = pr.left + pr.width / 2 - (rr.left + rr.width / 2), dy = pr.top + pr.height / 2 - (rr.top + rr.height * .55);
      c.anim(par, [{ transform: 'translateZ(0) translate(0,0)', opacity: 1 }, { transform: `translateZ(860px) translate(${dx}px,${dy}px)`, opacity: 1, offset: .86 }, { transform: `translateZ(880px) translate(${dx}px,${dy}px)`, opacity: 0 }], { duration: 1300, easing: 'cubic-bezier(.65,0,.9,.4)', composite: 'replace' });
      c.anim(tag, [{ opacity: .85 }, { opacity: 0 }], { duration: 300 });
      c.anim(c.bg, [{ opacity: 1 }, { opacity: 1, offset: .35 }, { opacity: 0 }], { duration: 1300 });
      c.after(1300, c.finish);
    });
  }

  /* ===================== Intros gráficas, rápidas (≈2,7 s) y nítidas ===================== */
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const eOut = u => 1 - Math.pow(1 - u, 3), eInOut = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  function fullCanvas(c) {
    const cv = document.createElement('canvas'), dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr);
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
    const g = cv.getContext('2d'); g.scale(dpr, dpr); c.stage.prepend(cv);
    return { cv, g, dpr };
  }
  function drawBall(g, x, y, r, rot = 0, a = 1) {
    g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = a;
    const gr = g.createRadialGradient(-r * .35, -r * .4, r * .1, 0, 0, r);
    gr.addColorStop(0, '#E4FF7A'); gr.addColorStop(.6, '#C8F03C'); gr.addColorStop(1, '#93B921');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 6.2832); g.fill();
    g.save(); g.clip(); g.strokeStyle = '#F4EFE3'; g.lineWidth = r * .16; g.lineCap = 'round';
    g.beginPath(); g.arc(-r * 1.15, 0, r * .98, -.95, .95); g.stroke();
    g.beginPath(); g.arc(r * 1.15, 0, r * .98, Math.PI - .95, Math.PI + .95); g.stroke();
    g.restore(); g.restore();
  }
  const wordParts = c => ({ letters: [...c.stage.querySelectorAll('.cl')], slot: c.stage.querySelector('.cdot'), tag: c.stage.querySelector('.ci-tag'), wordEl: c.stage.querySelector('.ci-word') });
  const fontPx = el => parseFloat(getComputedStyle(el).fontSize);

  /* ---------------- 5 · Cuerdas: la pelota pega en la cuerda de la raqueta y la onda revela el nombre ---------------- */
  function cuerdas(c) {
    c.stage.innerHTML = `<div class="ci-center">${word()}<p class="ci-tag">${TAG}</p></div>`;
    const { g } = fullCanvas(c);
    const { letters, slot, tag, wordEl } = wordParts(c);
    slot.innerHTML = ballSVG(false); slot.style.opacity = 0;
    const W = innerWidth, H = innerHeight, wc = centerOf(wordEl), cx = wc.x, cy = wc.y;
    const D = centerOf(slot), rb = Math.max(9, fontPx(wordEl) * .15);
    const SP = Math.round(clamp(W / 14, 24, 34)), STEP = 12;
    const xs = [], ys = [];
    for (let x = -SP; x < W + SP * 2; x += SP) xs.push(x);
    for (let y = -SP; y < H + SP * 2; y += SP) ys.push(y);
    const IMP = 850, FLY = 480, HOP = 520, LAND = IMP + HOP;
    const disp = (x, y, tt) => {
      if (tt < 0) return [0, 0];
      const dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy) || 1, front = 1.15 * tt;
      const s = clamp((front - r) / 70), a = 26 * Math.exp(-r / 260) * Math.sin(r * .04 - tt * .022) * Math.exp(-tt / 520) * s;
      return [dx / r * a, dy / r * a];
    };
    const seg = (x0, y0, x1, y1, tt, al) => {
      const d0 = disp(x0, y0, tt), d1 = disp(x1, y1, tt), k = clamp(Math.hypot(d0[0], d0[1]) / 14);
      g.strokeStyle = `rgba(${244 - 44 * k | 0},${239 + k | 0},${227 - 167 * k | 0},${(al * (.2 + .55 * k)).toFixed(3)})`;
      g.beginPath(); g.moveTo(x0 + d0[0], y0 + d0[1]); g.lineTo(x1 + d1[0], y1 + d1[1]); g.stroke();
    };
    const startP = { x: W + 30, y: H * .92 };
    c.loop(t => {
      g.clearRect(0, 0, W, H);
      const fade = 1 - clamp((t - 1750) / 450), tt = t - IMP;
      g.lineWidth = 1.2;
      xs.forEach((x, i) => {
        const al = clamp((t - Math.abs(x - cx) * .5) / 380) * fade; if (al <= 0) return;
        for (let y = -SP; y < H + SP; y += STEP) seg(x, y, x, y + STEP, tt, al);
      });
      ys.forEach(y => {
        const al = clamp((t - Math.abs(y - cy) * .35) / 380) * fade; if (al <= 0) return;
        for (let x = -SP; x < W + SP; x += STEP) seg(x, y, x + STEP, y, tt, al);
      });
      // pelota: llega, pega en la cuerda y rebota hasta el punto del logo
      if (t >= IMP - FLY && t < LAND) {
        let x, y;
        if (t < IMP) { const u = Math.pow((t - (IMP - FLY)) / FLY, 1.7); x = startP.x + (cx - startP.x) * u; y = startP.y + (cy - startP.y) * u - Math.sin(u * Math.PI) * 40; }
        else { const u = eOut((t - IMP) / HOP); x = cx + (D.x - cx) * u; y = cy + (D.y - cy) * u - Math.sin(u * Math.PI) * 120; }
        const sq = t > IMP - 40 && t < IMP + 90 ? .82 : 1;
        g.save(); g.translate(x, y); g.scale(1 / sq, sq); drawBall(g, 0, 0, rb, t * .012); g.restore();
      }
    });
    c.after(LAND, () => { slot.style.opacity = 1; c.anim(slot, [{ transform: 'scale(.6)' }, { transform: 'scale(1)' }], { duration: 220, easing: 'cubic-bezier(.34,1.56,.64,1)' }); c.ring(D.x, D.y, D.w * 2.4, 500); });
    letters.forEach((l, i) => c.anim(l, [{ opacity: 0, transform: 'translateY(.12em)', filter: 'blur(6px)' }, { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }], { duration: 450, delay: IMP + 120 + i * 70, easing: 'cubic-bezier(.2,.8,.2,1)' }));
    c.anim(tag, [{ opacity: 0 }, { opacity: .85 }], { duration: 450, delay: 1500 });
    c.after(2150, () => c.reveal(D.x, D.y, 600));
  }

  /* ---------------- 6 · Rally: el recorrido de una pelota dibuja la cancha vista desde arriba ---------------- */
  function rally(c) {
    c.stage.innerHTML = `<div class="ci-center">${word()}<p class="ci-tag">${TAG}</p></div>`;
    const { letters, slot, tag } = wordParts(c);
    slot.innerHTML = ballSVG(false); slot.style.opacity = 0;
    const W = innerWidth, H = innerHeight, D = centerOf(slot);
    let h = H * .8, w = h * .4615; if (w > W * .86) { w = W * .86; h = w / .4615; }
    const ox = (W - w) / 2, oy = (H - h) / 2;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;overflow:visible';
    const sx = w * 4.5 / 36, sv = h * 6.4 / 23.77;
    const lines = [
      `M${ox} ${oy}H${ox + w}V${oy + h}H${ox}Z`, `M${ox + sx} ${oy}V${oy + h}M${ox + w - sx} ${oy}V${oy + h}`,
      `M${ox + sx} ${oy + h / 2 - sv}H${ox + w - sx}M${ox + sx} ${oy + h / 2 + sv}H${ox + w - sx}`, `M${ox + w / 2} ${oy + h / 2 - sv}V${oy + h / 2 + sv}`
    ];
    const court = document.createElementNS(NS, 'g'); court.setAttribute('fill', 'none'); court.setAttribute('stroke', '#F4EFE3'); court.setAttribute('stroke-width', '1.4'); court.setAttribute('opacity', '.8'); court.setAttribute('stroke-linecap', 'round');
    lines.forEach(d => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('pathLength', '1'); p.setAttribute('stroke-dasharray', '1'); court.append(p); });
    const net = document.createElementNS(NS, 'path'); net.setAttribute('d', `M${ox - 14} ${oy + h / 2}H${ox + w + 14}`); net.setAttribute('stroke-dasharray', '3 6'); net.setAttribute('stroke', '#F4EFE3'); net.setAttribute('stroke-width', '2'); net.setAttribute('opacity', '.0');
    court.append(net);
    const trail = document.createElementNS(NS, 'g'); trail.setAttribute('fill', 'none'); trail.setAttribute('stroke', '#C8F03C'); trail.setAttribute('stroke-width', '1.8'); trail.setAttribute('stroke-linecap', 'round');
    const ballG = document.createElementNS(NS, 'g'); ballG.innerHTML = `<circle r="9" fill="#C8F03C"/><path d="M-8 -3.5C-2.5 -1.5 -2.5 1.5 -8 3.5M8 -3.5C2.5 -1.5 2.5 1.5 8 3.5" stroke="#F4EFE3" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    svg.append(court, trail, ballG); c.stage.prepend(svg);
    const P = [[.24, 1.08], [.28, .9], [.76, .12], [.3, .76], [.66, .28], [.5, .5]].map(([a, b]) => ({ x: ox + a * w, y: oy + b * h }));
    P.push({ x: D.x, y: D.y });
    const durs = [0, 330, 300, 270, 240, 210, 330];
    court.querySelectorAll('path[pathLength]').forEach((p, i) => c.anim(p, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 520, delay: i * 90, easing: 'ease-out' }));
    c.anim(net, [{ opacity: 0 }, { opacity: .55 }], { duration: 400, delay: 300 });
    c.anim(ballG, [{ transform: `translate(${P[0].x}px,${P[0].y}px)` }, { transform: `translate(${P[0].x}px,${P[0].y}px)` }], { duration: 1 });
    let t0 = 420; const marks = [];
    for (let i = 1; i < P.length; i++) {
      const a = P[i - 1], b = P[i], d = durs[i];
      const ln = document.createElementNS(NS, 'line'); ln.setAttribute('x1', a.x); ln.setAttribute('y1', a.y); ln.setAttribute('x2', b.x); ln.setAttribute('y2', b.y); ln.setAttribute('pathLength', '1'); ln.setAttribute('stroke-dasharray', '1'); trail.append(ln);
      c.anim(ln, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: d, delay: t0, easing: 'cubic-bezier(.35,.1,.45,1)' });
      c.anim(ln, [{ opacity: 1 }, { opacity: .2 }], { duration: 500, delay: t0 + d, composite: 'replace', fill: 'forwards' });
      marks.push({ t: t0, d, a, b }); t0 += d;
    }
    const kf = [{ transform: `translate(${P[0].x}px,${P[0].y}px) rotate(0deg)`, offset: 0 }]; const total = t0 - 420;
    let acc = 0; marks.forEach((m, i) => { acc += m.d; kf.push({ transform: `translate(${m.b.x}px,${m.b.y}px) rotate(${(i + 1) * 220}deg)`, offset: acc / total, easing: 'linear' }); });
    kf.forEach((k, i) => { k.easing = 'cubic-bezier(.35,.1,.45,1)'; });
    c.anim(ballG, kf, { duration: total, delay: 420 });
    marks.forEach((m, i) => { if (i < marks.length - 1) c.after(m.t + m.d, () => c.ring(m.b.x, m.b.y, 38, 520)); });
    const tEnd = t0;
    c.after(tEnd, () => { slot.style.opacity = 1; ballG.style.visibility = 'hidden'; c.anim(slot, [{ transform: 'scale(.6)' }, { transform: 'scale(1)' }], { duration: 220, easing: 'cubic-bezier(.34,1.56,.64,1)' }); c.ring(D.x, D.y, D.w * 2.6, 520); });
    letters.forEach((l, i) => c.anim(l, [{ opacity: 0, transform: 'translateY(.14em)', filter: 'blur(6px)' }, { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }], { duration: 420, delay: tEnd - 600 + i * 70, easing: 'cubic-bezier(.2,.8,.2,1)' }));
    c.anim(court, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: tEnd - 250 });
    c.anim(trail, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: tEnd - 100 });
    c.anim(tag, [{ opacity: 0 }, { opacity: .85 }], { duration: 450, delay: tEnd + 100 });
    c.after(tEnd + 350, () => c.reveal(D.x, D.y, 600));
  }

  /* ---------------- 7 · Marcador: tablero de letras que giran hasta formar el nombre ---------------- */
  function marcador(c) {
    const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', target = [...'CORDA'];
    const glyph = ch => ch === '•' ? '<i class="fl-ball"></i>' : ch;
    const tile = ch => `<div class="fl" aria-hidden="true"><div class="fl-h fl-top"><b>${glyph(ch)}</b></div><div class="fl-h fl-bot"><b>${glyph(ch)}</b></div><div class="fl-h fl-ft"><b>${glyph(ch)}</b></div><div class="fl-h fl-fb"><b>${glyph(ch)}</b></div></div>`;
    const counts = [6, 8, 10, 11, 12], STEP = 82;
    const starts = target.map((t, i) => ABC[(ABC.indexOf(t) - counts[i] + 260) % 26]);
    c.stage.innerHTML = `<div class="ci-center"><div class="ci-board" role="img" aria-label="CORDA">${starts.map(tile).join('')}${tile(' ')}</div><p class="ci-tag">${TAG}</p></div>`;
    const tiles = [...c.stage.querySelectorAll('.fl')], tag = c.stage.querySelector('.ci-tag');
    const set = (el, sel, v) => el.querySelectorAll(sel + ' b').forEach(b => { b.innerHTML = glyph(v); });
    const flip = (el, from, to, at) => c.after(at, () => {
      set(el, '.fl-top', to); set(el, '.fl-bot', from); set(el, '.fl-ft', from); set(el, '.fl-fb', to);
      const ft = el.querySelector('.fl-ft'), fb = el.querySelector('.fl-fb');
      c.anim(ft, [{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-90deg)' }], { duration: STEP * .5, easing: 'ease-in', fill: 'forwards' });
      c.anim(fb, [{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(0deg)' }], { duration: STEP * .5, delay: STEP * .5, easing: 'ease-out', fill: 'forwards' });
      c.after(STEP, () => { set(el, '.fl-bot', to); set(el, '.fl-ft', to); ft.getAnimations().forEach(a => a.cancel()); fb.getAnimations().forEach(a => a.cancel()); fb.style.transform = 'rotateX(90deg)'; });
    });
    let tLast = 0;
    target.forEach((tch, i) => {
      let cur = starts[i];
      for (let k = 1; k <= counts[i]; k++) { const next = ABC[(ABC.indexOf(cur) + 1) % 26]; flip(tiles[i], cur, next, 180 + i * 60 + k * STEP); cur = next; }
      tLast = Math.max(tLast, 180 + i * 60 + counts[i] * STEP + STEP);
    });
    const dot = tiles[5]; flip(dot, ' ', '•', tLast - 120); tLast += 0;
    const tDone = tLast + 80;
    c.anim(c.stage.querySelector('.ci-board'), [{ '--tb': 1 }, { '--tb': 0 }], { duration: 1, delay: 0 });
    c.after(tDone, () => tiles.forEach(t => t.querySelectorAll('.fl-h').forEach(h => c.anim(h, [{ backgroundColor: '#164A38' }, { backgroundColor: 'rgba(22,74,56,0)' }], { duration: 420, easing: 'ease-out' }))));
    c.anim(tag, [{ opacity: 0 }, { opacity: .85 }], { duration: 450, delay: tDone + 150 });
    c.after(tDone + 500, () => { const d = centerOf(dot.querySelector('.fl-ball') || dot); c.ring(d.x, d.y, 60, 520); c.reveal(d.x, d.y, 600); });
  }

  /* ---------------- 8 · Puntos: fondo verde con una cancha dibujada a mano; canicas marfil (y unas lima) que se juntan y forman CORDA ---------------- */
  function puntos(c) {
    c.root.classList.add('ci-flat');
    c.stage.innerHTML = `<div class="ci-center">${word()}<p class="ci-tag">${TAG}</p></div>`;
    const { cv, g, dpr } = fullCanvas(c);
    const { letters, slot, tag, wordEl } = wordParts(c);
    slot.style.opacity = 0;
    const W = innerWidth, H = innerHeight, D = centerOf(slot), fs = fontPx(wordEl), B = { x: W / 2, y: H * .45 };
    const FONT = `700 ${fs}px "Space Grotesk","Helvetica Neue",Arial,sans-serif`, INK = '#F4EFE3';
    const rnd = (a, b) => a + Math.random() * (b - a);

    // 0) Cancha dibujada a mano al fondo, muy tenue (con la red justo en el centro de la pantalla)
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none';
    let ch = H * .8, cw = ch * .4615; if (cw > W * .88) { cw = W * .88; ch = cw / .4615; }
    const ox = (W - cw) / 2, oy = (H - ch) / 2, sx = cw * 4.5 / 36, sv = ch * 6.4 / 23.77, my = oy + ch / 2;
    const smooth = pts => { let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`; } return d; };
    const hand = (x0, y0, x1, y1) => {
      const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(3, Math.round(L / 34)), ux = (x1 - x0) / L, uy = (y1 - y0) / L, nx = -uy, ny = ux, e0 = rnd(3, 20), e1 = rnd(3, 20), f = rnd(1, 2.2), ph = rnd(0, 6), A = rnd(1.4, 3.4), pts = [];
      for (let i = 0; i <= n; i++) { const u = i / n, o = Math.sin(u * Math.PI * f + ph) * A + rnd(-.9, .9), s = -e0 + (L + e0 + e1) * u; pts.push([x0 + ux * s + nx * o, y0 + uy * s + ny * o]); }
      return smooth(pts);
    };
    const segs = [[ox, oy, ox + cw, oy], [ox + cw, oy, ox + cw, oy + ch], [ox + cw, oy + ch, ox, oy + ch], [ox, oy + ch, ox, oy],
      [ox + sx, oy, ox + sx, oy + ch], [ox + cw - sx, oy, ox + cw - sx, oy + ch],
      [ox + sx, my - sv, ox + cw - sx, my - sv], [ox + sx, my + sv, ox + cw - sx, my + sv], [ox + cw / 2, my - sv, ox + cw / 2, my + sv],
      [ox + cw / 2, oy, ox + cw / 2, oy + 16], [ox + cw / 2, oy + ch, ox + cw / 2, oy + ch - 16], [ox - 26, my, ox + cw + 26, my]];
    const _unused = `M${ox - 4} ${oy - 3}L${ox + cw + 5} ${oy + 2}L${ox + cw + 3} ${oy + ch + 4}L${ox - 5} ${oy + ch - 2}Z`;
    // (sin relleno: el interior de la cancha es del mismo color que el fondo)
    segs.forEach((s, i) => {
      const net = i === segs.length - 1, d = hand(...s);
      [[net ? 9 : rnd(5, 7.5), net ? .22 : .17, d], [net ? 4 : rnd(2, 3.4), .12, hand(...s)]].forEach(([w, a, dd]) => {
        const p = document.createElementNS(NS, 'path'); p.setAttribute('d', dd); p.setAttribute('pathLength', '1'); p.setAttribute('fill', 'none'); p.setAttribute('stroke', `rgba(244,239,227,${a})`); p.setAttribute('stroke-width', w); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
        svg.append(p); c.anim(p, [{ strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDasharray: '1 1', strokeDashoffset: 0 }], { duration: 560, delay: 60 + i * 105 + (net ? 0 : 0), easing: 'cubic-bezier(.3,.6,.3,1)' });
      });
    });
    c.stage.prepend(svg);

    // 1) Las letras se dibujan UNA vez en un lienzo auxiliar: de ahí salen las canicas y las letras lisas finales (encuadran exacto)
    const off = document.createElement('canvas'); off.width = W; off.height = H; const o = off.getContext('2d');
    o.fillStyle = '#fff'; o.textBaseline = 'alphabetic'; o.font = FONT;
    const mt = o.measureText('C'), fa = mt.fontBoundingBoxAscent || fs * .8, fd = mt.fontBoundingBoxDescent || fs * .2;
    const LP = letters.map(l => { const r = l.getBoundingClientRect(); return { ch: l.textContent, x: r.left, y: r.top + fs * .06 + (fs - (fa + fd)) / 2 + fa }; });
    LP.forEach(l => o.fillText(l.ch, l.x, l.y));
    const wr = wordEl.getBoundingClientRect();
    const bx = Math.max(0, Math.floor(wr.left - 12)), by = Math.max(0, Math.floor(wr.top - 12));
    const bw = Math.min(W - bx, Math.ceil(wr.width + 24)), bh = Math.min(H - by, Math.ceil(wr.height + 24));
    const px = o.getImageData(bx, by, bw, bh).data;

    // 2) Distancia al borde (las canicas se quedan dentro de la letra)
    const INF = 1e6, dt = new Float32Array(bw * bh);
    for (let i = 0; i < dt.length; i++) dt[i] = px[i * 4 + 3] > 127 ? INF : 0;
    const at = (x, y) => (x < 0 || y < 0 || x >= bw || y >= bh) ? 0 : dt[y * bw + x];
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) { const i = y * bw + x; if (dt[i]) dt[i] = Math.min(dt[i], at(x - 1, y) + 1, at(x, y - 1) + 1, at(x - 1, y - 1) + 1.414, at(x + 1, y - 1) + 1.414); }
    for (let y = bh - 1; y >= 0; y--) for (let x = bw - 1; x >= 0; x--) { const i = y * bw + x; if (dt[i]) dt[i] = Math.min(dt[i], at(x + 1, y) + 1, at(x, y + 1) + 1, at(x + 1, y + 1) + 1.414, at(x - 1, y + 1) + 1.414); }

    // 3) Primera capa de canicas: sin encimarse y siguiendo el contorno. Las demás llegan después y se van encimando hasta rellenar
    const RB = Math.max(1.7, fs * .027), S = RB * 2.18, cell = S, hash = new Map();
    const near = (x, y) => { const cx = Math.floor(x / cell), cy = Math.floor(y / cell); for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const a = hash.get((cx + i) + ',' + (cy + j)); if (a) for (const q of a) if (Math.hypot(q.x - x, q.y - y) < S) return true; } return false; };
    const add = (x, y) => { const q = { x, y, lima: false, wave: 0 }; const k = Math.floor(x / cell) + ',' + Math.floor(y / cell); (hash.get(k) || hash.set(k, []).get(k)).push(q); return q; };
    const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const edge = [], inner = [], pool = [];
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) { const d = dt[y * bw + x]; if (d >= RB * .45) pool.push([x + bx, y + by]); if (d >= RB * .8) (d < RB * 1.25 ? edge : inner).push([x + bx, y + by]); }
    const T = [];
    [shuffle(edge), shuffle(inner)].forEach(list => list.forEach(([x, y]) => { if (!near(x, y)) T.push(add(x, y)); }));
    const dr = D.w / 2 * .92, inDot = () => { const a = rnd(0, 6.2832), r = Math.sqrt(Math.random()) * dr; return { x: D.x + Math.cos(a) * r, y: D.y + Math.sin(a) * r }; };
    const dc = [{ x: D.x, y: D.y }]; for (let k = 1; k <= 3; k++) for (let a = 0; a < k * 6; a++) dc.push({ x: D.x + Math.cos(a / (k * 6) * 6.2832 + k) * k * S * .98, y: D.y + Math.sin(a / (k * 6) * 6.2832 + k) * k * S * .98 });
    dc.filter(p => Math.hypot(p.x - D.x, p.y - D.y) <= dr + S * .3).forEach(p => T.push({ x: p.x, y: p.y, lima: true, wave: 3 }));
    const nExtra = Math.round(clamp(W * H / 190, 600, 3000));
    for (let k = 0; k < nExtra; k++) {
      if (Math.random() < .045) { const q = inDot(); T.push({ x: q.x, y: q.y, lima: true, wave: 3 }); }
      else { const q = pool[Math.random() * pool.length | 0]; T.push({ x: q[0] + rnd(-.5, .5), y: q[1] + rnd(-.5, .5), lima: false, wave: 1 + (Math.random() * 3 | 0) }); }
    }

    // 4) Canicas verdes con volumen (y unas pocas lima)
    const marble = (a, b, c2) => { const s = document.createElement('canvas'); s.width = s.height = 48; const k = s.getContext('2d'); const gr = k.createRadialGradient(17, 15, 2, 24, 24, 23); gr.addColorStop(0, a); gr.addColorStop(.55, b); gr.addColorStop(1, c2); k.fillStyle = gr; k.beginPath(); k.arc(24, 24, 23, 0, 6.2832); k.fill(); return s; };
    const SP = [marble('#FFFFFF', '#F4EFE3', '#C9C1A8'), marble('#FBF9F2', '#EDE7D4', '#BDB59B'), marble('#FFFFFF', '#F1EBDB', '#C4BCA2')], SL = marble('#F3FFB4', '#C8F03C', '#7FA318');

    // 5) Todas las canicas flotan por la pantalla y todas se van a formar las letras
    const N = T.length, GA = 2.39996, RM = Math.hypot(W, H) / 2 * .98, BD = 700;
    const order = shuffle(Array.from({ length: N }, (_, i) => i));
    const P = T.map((t, k) => { const i = order[k]; return { t, th: i * GA, Rf: Math.sqrt((i + .5) / N) * RM * (.78 + Math.random() * .44), em: Math.random() * 70, tau: 85 + Math.random() * 200, lat: (Math.random() - .5) * 90, ox: (Math.random() - .5) * 16, oy: (Math.random() - .5) * 16, w: (Math.random() < .5 ? -1 : 1) * (.0004 + Math.random() * .0012), wob: 4 + Math.random() * 12, wf: .0016 + Math.random() * .003, wp: Math.random() * 6.28, rs: .88 + Math.random() * .26,
      sp: t.lima ? SL : (Math.random() < .12 ? SL : SP[Math.random() * 3 | 0]) }; });
    const base = (p, t) => {                       // estallido: salen a toda velocidad en todas direcciones y frenan de golpe; cada una con su curva
      const tt = Math.max(0, t - p.em), e = 1 - Math.exp(-tt / p.tau), a = p.th + .45 * e + p.w * Math.max(0, t - 700), R = p.Rf * e;
      const ca = Math.cos(a), sa = Math.sin(a), lat = p.lat * Math.sin(Math.min(1, tt / 760) * Math.PI), wk = Math.min(1, e * 4);
      return [B.x + p.ox * (1 - e) + ca * R - sa * lat + Math.sin(t * p.wf + p.wp) * p.wob * wk, B.y + p.oy * (1 - e) + sa * R + ca * lat + Math.cos(t * p.wf * .83 + p.wp) * p.wob * wk];
    };
    // emparejar por x (canicas en la espiral ↔ lugares en la letra) → trayectorias que casi no se cruzan
    const lt = P.filter(p => !p.t.lima), tl = lt.map(p => p.t).sort((a, b) => a.x - b.x), spiral = [...lt].sort((a, b) => base(a, 2000)[0] - base(b, 2000)[0]);
    spiral.forEach((p, k) => { p.t = tl[k]; });
    const xs = tl.map(t => t.x), x0 = Math.min(...xs), x1 = Math.max(...xs), WV = [450, 640, 800, 960];
    P.forEach(p => {
      const w = p.t.wave;
      if (p.t.lima) { p.start = 860 + Math.random() * 100; p.conv = 620; p.spin = (Math.random() < .5 ? -1 : 1) * (2.2 + Math.random() * 1.2); }
      else { p.start = WV[w] + (w === 0 ? ((p.t.x - x0) / (x1 - x0 || 1)) * 240 : Math.random() * 110); p.conv = 520 + Math.random() * 110; p.sw = (Math.random() < .5 ? -1 : 1) * (40 + Math.random() * 110); }
      p.p1 = base(p, p.start);
      if (!p.t.lima) { const mx = (p.p1[0] + p.t.x) / 2, my2 = (p.p1[1] + p.t.y) / 2, dx = p.t.x - p.p1[0], dy = p.t.y - p.p1[1], dl = Math.hypot(dx, dy) || 1; p.cx = mx - dy / dl * p.sw; p.cy = my2 + dx / dl * p.sw; }
      p.end = p.start + p.conv;
    });
    const bk = u => { const c1 = 1.05, c2 = c1 * 1.525; return u < .5 ? (Math.pow(2 * u, 2) * ((c2 + 1) * 2 * u - c2)) / 2 : (Math.pow(2 * u - 2, 2) * ((c2 + 1) * (2 * u - 2) + c2) + 2) / 2; };
    const TS = Math.max(...P.map(p => p.end)), POP = TS + 30, TF = POP + 240, FILL = 440, SWP = TF + FILL - 120, SHUT = TF + FILL + 380;
    const rip = (x, y, t) => {
      if (t < POP) return [0, 0];
      const tt = t - POP, dx = x - D.x, dy = y - D.y, r = Math.hypot(dx, dy) || 1, s = clamp((.9 * tt - r) / 40);
      const a = 5 * Math.exp(-r / 120) * Math.sin(r * .1 - tt * .03) * Math.exp(-tt / 190) * s; return [dx / r * a, dy / r * a];
    };
    const pos = (p, t) => {
      if (t < p.start) return base(p, t);
      const u = clamp((t - p.start) / p.conv);
      if (p.t.lima) { const e = eInOut(u), vx = (p.p1[0] - p.t.x) * (1 - e), vy = (p.p1[1] - p.t.y) * (1 - e), a = p.spin * e, ca = Math.cos(a), sa = Math.sin(a); return [p.t.x + vx * ca - vy * sa, p.t.y + vx * sa + vy * ca]; }
      const e = bk(u), k = 1 - e, x = k * k * p.p1[0] + 2 * k * e * p.cx + e * e * p.t.x, y = k * k * p.p1[1] + 2 * k * e * p.cy + e * e * p.t.y;
      if (t > POP) { const r = rip(x, y, t); return [x + r[0], y + r[1]]; } return [x, y];
    };
    const OS = Math.max(56, Math.min(220, Math.round(D.w * dpr * 1.04))), orb = makeOrb(OS);
    const lay = document.createElement('canvas'); lay.width = Math.round(bw * dpr); lay.height = Math.round(bh * dpr); const ly = lay.getContext('2d');
    const sparks = Array.from({ length: 14 }, (_, k) => ({ a: k / 14 * 6.2832 + Math.random() * .3, v: 40 + Math.random() * 46, r: 1.1 + Math.random() * 1.5 }));
    let frozen = false;
    c.loop(t => {
      if (frozen) return;
      g.clearRect(0, 0, W, H);
      const f = clamp((t - TF) / FILL), fe = eInOut(f);
      if (t < 380) {                                         // destello del estallido
        const u = t / 380, r = 40 + 150 * eOut(u), gr = g.createRadialGradient(B.x, B.y, 0, B.x, B.y, r);
        gr.addColorStop(0, `rgba(244,239,227,${(.55 * (1 - u)).toFixed(3)})`); gr.addColorStop(.45, `rgba(200,240,60,${(.22 * (1 - u)).toFixed(3)})`); gr.addColorStop(1, 'rgba(200,240,60,0)');
        g.fillStyle = gr; g.fillRect(B.x - r, B.y - r, r * 2, r * 2);
      }
      if (f < 1) for (const p of P) {
        const [x, y] = pos(p, t), grow = eOut(clamp((t - p.em) / 120));
        if (t < 440 && t > p.em) { const [x0, y0] = pos(p, t - 16); g.globalAlpha = .4 * (1 - t / 440); g.strokeStyle = '#F4EFE3'; g.lineWidth = RB * 1.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x, y); g.stroke(); }
        let s = RB * 2 * grow * p.rs * (1 + .1 * fe); if (p.t.lima && t > POP && t < POP + 260) s *= 1 + .28 * Math.sin((t - POP) / 260 * Math.PI);
        g.globalAlpha = 1 - fe; g.drawImage(p.sp, x - s / 2, y - s / 2, s, s);
      }
      if (f > 0) {                                           // las canicas, ya encimadas, se funden en letra lisa
        g.save(); g.globalAlpha = fe; g.fillStyle = INK; g.font = FONT; g.textBaseline = 'alphabetic';
        g.shadowColor = 'rgba(244,239,227,.6)'; g.shadowBlur = 14 * (1 - fe);
        LP.forEach(l => g.fillText(l.ch, l.x, l.y)); g.restore();
        const pop = 1 + .2 * Math.sin(clamp((t - TF) / 460) * Math.PI), ds = D.w * pop;
        orb.draw(.6 + t * .0021, .42);                       // gira despacio, como una pelota de verdad
        g.save(); g.globalAlpha = fe; g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 8; g.shadowOffsetY = 3; g.drawImage(orb, D.x - ds / 2, D.y - ds / 2, ds, ds); g.restore();
      }
      const sw = (t - SWP) / 620;                              // brillo suave que cruza las letras
      if (sw > 0 && sw < 1) {
        ly.setTransform(dpr, 0, 0, dpr, 0, 0); ly.clearRect(0, 0, bw, bh); ly.save(); ly.translate(-bx, -by); ly.fillStyle = '#fff'; ly.font = FONT; ly.textBaseline = 'alphabetic';
        LP.forEach(l => ly.fillText(l.ch, l.x, l.y)); ly.restore(); ly.globalCompositeOperation = 'source-in';
        const cx = -bh + (bw + bh * 2) * eInOut(sw), gr = ly.createLinearGradient(cx - bh * .5, 0, cx + bh * .5, bh); gr.addColorStop(0, 'rgba(200,240,60,0)'); gr.addColorStop(.5, 'rgba(200,240,60,.8)'); gr.addColorStop(1, 'rgba(200,240,60,0)');
        ly.fillStyle = gr; ly.fillRect(0, 0, bw, bh); ly.globalCompositeOperation = 'source-over';
        g.globalAlpha = 1; g.drawImage(lay, 0, 0, lay.width, lay.height, bx, by, bw, bh);
      }
      if (t > POP && t < POP + 520) {                         // chispas al caer el punto final
        const u = eOut((t - POP) / 520); g.fillStyle = '#C8F03C'; sparks.forEach(sp => { g.globalAlpha = (1 - u) * .85; g.beginPath(); g.arc(D.x + Math.cos(sp.a) * sp.v * u * 1.6, D.y + Math.sin(sp.a) * sp.v * u * 1.6, sp.r, 0, 6.2832); g.fill(); });
      }
      g.globalAlpha = 1;
    });
    c.after(POP, () => c.ring(D.x, D.y, D.w * 2.6, 600));
    c.anim(tag, [{ opacity: 0 }, { opacity: .85 }], { duration: 500, delay: TF + 160 });

    // Salida: toda la pantalla de la intro se desvanece suavemente hasta que aparece la app
    c.after(TF + FILL + 330, () => {
      c.root.style.pointerEvents = 'none';
      c.anim(c.root, [{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(10px)' }], { duration: 950, easing: 'cubic-bezier(.4,0,.2,1)' });
      c.anim(c.stage, [{ transform: 'scale(1)' }, { transform: 'scale(1.035)' }], { duration: 950, easing: 'cubic-bezier(.4,0,.2,1)' });
      c.after(980, c.finish);
    });
  }

  const VARIANTS = { web, cancha, pelota, letras, cuerdas, rally, marcador, puntos };
  window.CordaIntro = { play, variants: Object.keys(VARIANTS) };
})();
