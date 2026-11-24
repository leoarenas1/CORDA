// CORDA · Intro de entrada (app y página web): «Puntos».
// Un estallido de canicas llena la pantalla; motos de luz dibujan una cancha exacta y golpean las canicas, que se juntan, se encima
// y se funden en las letras de CORDA; el punto final es una pelota de tenis y toda la pantalla se desvanece hasta mostrar el sitio.
// Se adapta a celular (cancha vertical) y a computadora (cancha horizontal). Se salta con clic, «Saltar» o Esc.
// No se muestra con «reducir movimiento». Uso: CordaIntro.play('puntos').
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
  function play(variant = 'puntos', opts = {}) {
    if (document.getElementById('corda-intro')) return;
    if (reduce() && !opts.force) { opts.onDone && opts.onDone(); return; }
    const rate = opts.rate || 1.4;                      // 1 = ritmo original; 1.4 = un poco más lento, para disfrutarla
    const run = VARIANTS[variant] || VARIANTS.puntos;
    const root = document.createElement('div');
    root.className = 'ci'; root.id = 'corda-intro';
    root.innerHTML = '<div class="ci-bg"></div><div class="ci-stage"></div><button class="ci-skip" type="button">Saltar</button>';
    const behind = [...document.querySelectorAll(opts.inert || '#app,#modal,body>header,body>main,body>footer,body>.skip')];
    behind.forEach(e => e.setAttribute('inert', ''));
    document.body.append(root); document.documentElement.classList.add('ci-open');

    const anims = [], timers = [], stops = [];
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout); stops.forEach(s => s());
      anims.forEach(a => { try { a.cancel(); } catch {} });
      behind.forEach(e => e.removeAttribute('inert'));
      removeEventListener('keydown', onKey);
      root.remove(); document.documentElement.classList.remove('ci-open');
      opts.onDone && opts.onDone();
    };
    const onKey = e => { if (e.key === 'Escape') finish(); };
    addEventListener('keydown', onKey);
    root.addEventListener('click', finish);
    root.querySelector('.ci-skip').addEventListener('click', e => { e.stopPropagation(); finish(); });
    timers.push(setTimeout(finish, 14000 * rate));

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
  const wordParts = c => ({ letters: [...c.stage.querySelectorAll('.cl')], slot: c.stage.querySelector('.cdot'), tag: c.stage.querySelector('.ci-tag'), wordEl: c.stage.querySelector('.ci-word') });
  const fontPx = el => parseFloat(getComputedStyle(el).fontSize);


  /* ---------------- 8 · Puntos: fondo verde con una cancha dibujada a mano; canicas marfil (y unas lima) que se juntan y forman CORDA ---------------- */
  function puntos(c) {
    c.root.classList.add('ci-vignette');
    c.stage.innerHTML = `<div class="ci-center">${word()}<p class="ci-tag">${TAG}</p></div>`;
    const { cv, g, dpr } = fullCanvas(c);
    const { letters, slot, tag, wordEl } = wordParts(c);
    slot.style.opacity = 0;
    const W = innerWidth, H = innerHeight, D = centerOf(slot), fs = fontPx(wordEl), B = { x: W / 2, y: H * .45 };
    const FONT = `700 ${fs}px "Space Grotesk","Helvetica Neue",Arial,sans-serif`, INK = '#F4EFE3';
    const rnd = (a, b) => a + Math.random() * (b - a);

    // 0) Cancha exacta (rectas y ángulos rectos). Se dibuja con «motos de luz»: líneas que corren por la pantalla y dejan su estela.
    const land = W / H > 1.12;                                   // pantalla ancha (computadora): la cancha se dibuja horizontal, con la red en el centro
    let ch = H * .8, cw = ch * .4615;
    if (land) { ch = Math.min(W * .84, H * .9 / .4615); cw = ch * .4615; } else if (cw > W * .88) { cw = W * .88; ch = cw / .4615; }
    const sx = cw * 4.5 / 36, sv = ch * 6.4 / 23.77, mc = ch / 2, cm = cw / 2, pad = Math.min(cw, ch) * .06;
    const M = (px, py) => land ? [(W - ch) / 2 + py, (H - cw) / 2 + px] : [(W - cw) / 2 + px, (H - ch) / 2 + py];
    const S1 = (px, py) => M(px, py).map(v => Math.round(v) + .5);   // medio pixel: líneas nítidas
    const SPD = 2 * (cw + ch) / 1100;                             // el contorno tarda ~1,1 s en dibujarse
    const defs = [
      { pts: [[0, 0], [cw, 0], [cw, ch], [0, ch], [0, 0]], t0: 300 },          // contorno
      { pts: [[-pad, mc], [cw + pad, mc]], t0: 520 },                           // red
      { pts: [[sx, ch], [sx, 0]], t0: 760 }, { pts: [[cw - sx, 0], [cw - sx, ch]], t0: 860 },   // líneas de sencillos
      { pts: [[sx, mc - sv], [cw - sx, mc - sv]], t0: 1000 }, { pts: [[cw - sx, mc + sv], [sx, mc + sv]], t0: 1080 },  // líneas de saque
      { pts: [[cm, mc - sv], [cm, mc + sv]], t0: 1240 }                          // línea central de saque
    ];
    const CY = defs.map(d => {
      const pts = d.pts.map(([a2, b2]) => S1(a2, b2)), cum = [0];
      for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      return { pts, cum, len: cum[cum.length - 1], t0: d.t0, dur: cum[cum.length - 1] / SPD };
    });
    const ptAt = (cy, d) => {
      for (let i = 1; i < cy.pts.length; i++) if (d <= cy.cum[i] + 1e-6) { const u = (d - cy.cum[i - 1]) / (cy.cum[i] - cy.cum[i - 1] || 1); return [cy.pts[i - 1][0] + (cy.pts[i][0] - cy.pts[i - 1][0]) * u, cy.pts[i - 1][1] + (cy.pts[i][1] - cy.pts[i - 1][1]) * u]; }
      return cy.pts[cy.pts.length - 1];
    };
    // Cada giro y cada llegada de una moto «golpea» a las canicas que andan cerca
    const PUL = []; CY.forEach(cy => cy.pts.forEach((q, i) => PUL.push({ x: q[0], y: q[1], t0: cy.t0 + cy.cum[i] / SPD })));
    const pulseDisp = (x, y, t) => {
      let ox = 0, oy = 0;
      for (const q of PUL) {
        const tt = t - q.t0; if (tt < 0 || tt > 900) continue;
        const dx = x - q.x, dy = y - q.y, r = Math.hypot(dx, dy) || 1, f2 = clamp((.8 * tt - r) / 50); if (!f2) continue;
        const a2 = 16 * Math.exp(-r / 130) * Math.exp(-tt / 300) * Math.sin(r * .05 - tt * .025) * f2; ox += dx / r * a2; oy += dy / r * a2;
      }
      return [ox, oy];
    };
    const drawCourt = (g2, t) => {
      g2.save(); g2.lineCap = 'round'; g2.lineJoin = 'miter';
      for (const cy of CY) {
        const u = clamp((t - cy.t0) / cy.dur); if (u <= 0) continue;
        const Ld = u * cy.len, settle = clamp((t - cy.t0 - cy.dur) / 700), al = .38 + .3 * (1 - settle), h = ptAt(cy, Ld);
        g2.strokeStyle = `rgba(244,239,227,${al.toFixed(3)})`; g2.lineWidth = 2.6; g2.beginPath(); g2.moveTo(cy.pts[0][0], cy.pts[0][1]);
        for (let i = 1; i < cy.pts.length && cy.cum[i - 1] < Ld; i++) { if (cy.cum[i] <= Ld) g2.lineTo(cy.pts[i][0], cy.pts[i][1]); else g2.lineTo(h[0], h[1]); }
        g2.stroke();
        if (u < 1) {                                               // estela de luz y cabeza de la moto
          const tail = Math.max(0, Ld - 160), s0 = ptAt(cy, tail);
          g2.strokeStyle = 'rgba(200,240,60,.92)'; g2.shadowColor = '#C8F03C'; g2.shadowBlur = 14; g2.lineWidth = 3.6; g2.beginPath(); g2.moveTo(s0[0], s0[1]);
          for (let i = 1; i < cy.pts.length; i++) if (cy.cum[i] > tail && cy.cum[i] < Ld) g2.lineTo(cy.pts[i][0], cy.pts[i][1]);
          g2.lineTo(h[0], h[1]); g2.stroke();
          g2.shadowBlur = 20; g2.fillStyle = '#F6FFD6'; g2.beginPath(); g2.arc(h[0], h[1], 3.8, 0, 6.2832); g2.fill();
        }
      }
      for (const q of PUL) {                                       // anillo suave en cada golpe
        const tt = t - q.t0; if (tt < 0 || tt > 520) continue;
        g2.strokeStyle = `rgba(200,240,60,${(.5 * (1 - tt / 520)).toFixed(3)})`; g2.lineWidth = 1.4; g2.beginPath(); g2.arc(q.x, q.y, 6 + .22 * tt, 0, 6.2832); g2.stroke();
      }
      g2.restore();
    };

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
      const x = B.x + p.ox * (1 - e) + ca * R - sa * lat + Math.sin(t * p.wf + p.wp) * p.wob * wk, y = B.y + p.oy * (1 - e) + sa * R + ca * lat + Math.cos(t * p.wf * .83 + p.wp) * p.wob * wk, pd = pulseDisp(x, y, t);
      return [x + pd[0], y + pd[1]];
    };
    // emparejar por x (canicas en la espiral ↔ lugares en la letra) → trayectorias que casi no se cruzan
    const lt = P.filter(p => !p.t.lima), tl = lt.map(p => p.t).sort((a, b) => a.x - b.x), spiral = [...lt].sort((a, b) => base(a, 2000)[0] - base(b, 2000)[0]);
    spiral.forEach((p, k) => { p.t = tl[k]; });
    const xs = tl.map(t => t.x), x0 = Math.min(...xs), x1 = Math.max(...xs), WV = [950, 1170, 1390, 1610];
    P.forEach(p => {
      const w = p.t.wave;
      if (p.t.lima) { p.start = 1550 + Math.random() * 120; p.conv = 760; p.spin = (Math.random() < .5 ? -1 : 1) * (2.2 + Math.random() * 1.2); }
      else { p.start = WV[w] + (w === 0 ? ((p.t.x - x0) / (x1 - x0 || 1)) * 240 : Math.random() * 110); p.conv = 700 + Math.random() * 120; p.sw = (Math.random() < .5 ? -1 : 1) * (40 + Math.random() * 110); }
      p.p1 = base(p, p.start);
      if (!p.t.lima) { const mx = (p.p1[0] + p.t.x) / 2, my2 = (p.p1[1] + p.t.y) / 2, dx = p.t.x - p.p1[0], dy = p.t.y - p.p1[1], dl = Math.hypot(dx, dy) || 1; p.cx = mx - dy / dl * p.sw; p.cy = my2 + dx / dl * p.sw; }
      p.end = p.start + p.conv;
    });
    const bk = u => { const c1 = 1.05, c2 = c1 * 1.525; return u < .5 ? (Math.pow(2 * u, 2) * ((c2 + 1) * 2 * u - c2)) / 2 : (Math.pow(2 * u - 2, 2) * ((c2 + 1) * (2 * u - 2) + c2) + 2) / 2; };
    const TS = Math.max(...P.map(p => p.end)), POP = TS + 30, TF = POP + 330, FILL = 640, SWP = TF + FILL - 160, SHUT = TF + FILL + 380;
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
      drawCourt(g, t);
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
      const sw = (t - SWP) / 820;                              // brillo suave que cruza las letras
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
    c.after(TF + FILL + 420, () => {
      c.root.style.pointerEvents = 'none';
      c.anim(c.root, [{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(10px)' }], { duration: 950, easing: 'cubic-bezier(.4,0,.2,1)' });
      c.anim(c.stage, [{ transform: 'scale(1)' }, { transform: 'scale(1.035)' }], { duration: 950, easing: 'cubic-bezier(.4,0,.2,1)' });
      c.after(980, c.finish);
    });
  }


  /* ===================== Intros ligeras (≈2,5 s): solo el nombre, con el mismo cierre difuminado ===================== */
  const dotBall = slot => { slot.style.cssText += ';border-radius:50%;background:radial-gradient(circle at 35% 30%,#E4FF7A,#C8F03C 55%,#93B921)'; };
  const lightExit = (c, t) => c.after(t, () => {
    c.root.style.pointerEvents = 'none';
    c.anim(c.root, [{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(10px)' }], { duration: 900, easing: 'cubic-bezier(.4,0,.2,1)' });
    c.anim(c.stage, [{ transform: 'scale(1)' }, { transform: 'scale(1.03)' }], { duration: 900, easing: 'cubic-bezier(.4,0,.2,1)' });
    c.after(930, c.finish);
  });

  // A · Luz: una luz suave se abre en el centro, el nombre aparece enfocándose y la pelota cae al final.
  function luz(c) {
    c.root.classList.add('ci-vignette');
    c.stage.innerHTML = `<div class="ci-glow"></div><div class="ci-center">${word()}<p class="ci-tag">${TAG}</p></div>`;
    const { letters, slot, tag } = wordParts(c); dotBall(slot);
    const glow = c.stage.querySelector('.ci-glow');
    c.anim(glow, [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 1100, easing: 'cubic-bezier(.2,.7,.3,1)' });
    letters.forEach((l, i) => c.anim(l, [{ opacity: 0, filter: 'blur(14px)', transform: 'translateY(.12em)', letterSpacing: '.12em' }, { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0)', letterSpacing: '0em' }], { duration: 800, delay: 380 + i * 90, easing: 'cubic-bezier(.2,.7,.3,1)' }));
    c.anim(slot, [{ opacity: 0, transform: 'translateY(-3.2em)' }, { opacity: 1, transform: 'translateY(0)', offset: .55 }, { transform: 'translateY(-.45em)', offset: .75 }, { transform: 'translateY(0)' }], { duration: 760, delay: 1050, easing: 'cubic-bezier(.4,0,.6,1)' });
    c.anim(tag, [{ opacity: 0 }, { opacity: .85 }], { duration: 600, delay: 1750 });
    lightExit(c, 2750);
  }

  // B · Línea: una sola línea fina cruza la pantalla (la red / la línea de fondo); el nombre sube desde detrás de ella.
  function linea(c) {
    c.root.classList.add('ci-vignette');
    c.stage.innerHTML = `<div class="ci-center ci-cut"><div class="ci-line"></div><div class="ci-clip">${word()}</div><p class="ci-tag">${TAG}</p></div>`;
    const { letters, slot, tag } = wordParts(c); dotBall(slot);
    const line = c.stage.querySelector('.ci-line');
    c.anim(line, [{ transform: 'scaleX(0)', opacity: 1 }, { transform: 'scaleX(1)', opacity: 1 }], { duration: 750, easing: 'cubic-bezier(.65,0,.35,1)' });
    letters.forEach((l, i) => c.anim(l, [{ opacity: 1, transform: 'translateY(105%)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 700, delay: 620 + i * 80, easing: 'cubic-bezier(.2,.8,.2,1)' }));
    c.anim(slot, [{ opacity: 0, transform: 'translateY(105%)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 700, delay: 620 + 5 * 80, easing: 'cubic-bezier(.2,.8,.2,1)' });
    c.anim(tag, [{ opacity: 0 }, { opacity: .85 }], { duration: 600, delay: 1650 });
    c.anim(line, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: 1900 });
    lightExit(c, 2750);
  }

  // C · Rebote: una pelota entra, rebota dos veces con su sombra y se queda como el punto de CORDA; las letras aparecen en cada rebote.
  function rebote(c) {
    c.root.classList.add('ci-vignette');
    c.stage.innerHTML = `<div class="ci-center">${word()}<p class="ci-tag">${TAG}</p></div>`;
    const { letters, slot, tag, wordEl } = wordParts(c); dotBall(slot);
    const fs = fontPx(wordEl);
    slot.style.opacity = 0;
    const ball = document.createElement('i'), shadow = document.createElement('i');
    ball.className = 'ci-ball'; shadow.className = 'ci-ballshadow';
    const d = centerOf(slot), r = d.w / 2;
    Object.assign(ball.style, { width: d.w + 'px', height: d.w + 'px', left: d.x - r + 'px', top: d.y - r + 'px' });
    Object.assign(shadow.style, { width: d.w * 1.1 + 'px', left: d.x - d.w * .55 + 'px', top: d.y + r - 2 + 'px' });
    c.root.append(shadow, ball);
    const H1 = fs * 2.1, H2 = fs * .8, H3 = fs * .26;
    c.anim(ball, [
      { opacity: 0, transform: `translate(${-fs * 1.6}px,${-H1 * 1.4}px) scale(.7)`, offset: 0 },
      { opacity: 1, transform: `translate(${-fs * 1.0}px,${-H1 * .55}px) scale(.9)`, offset: .14 },
      { transform: `translate(${-fs * .62}px,0px) scale(1)`, offset: .3, easing: 'cubic-bezier(.2,.7,.3,1)' },
      { transform: `translate(${-fs * .36}px,${-H2}px)`, offset: .46 },
      { transform: `translate(${-fs * .16}px,0px)`, offset: .62, easing: 'cubic-bezier(.2,.7,.3,1)' },
      { transform: `translate(${-fs * .05}px,${-H3}px)`, offset: .76 },
      { transform: 'translate(0,0)', offset: 1 }
    ], { duration: 1350, delay: 250, easing: 'cubic-bezier(.55,0,.8,.4)' });
    c.anim(shadow, [{ opacity: 0, transform: 'scaleX(.4)' }, { opacity: .3, transform: 'scaleX(1)', offset: .3 }, { opacity: .2, transform: 'scaleX(.7)', offset: .46 }, { opacity: .3, transform: 'scaleX(1)', offset: .62 }, { opacity: .3, transform: 'scaleX(.9)', offset: .85 }, { opacity: 0, transform: 'scaleX(.9)' }], { duration: 1500, delay: 250 });
    const hit = [.30, .62, 1];       // letras que aparecen cuando la pelota toca el suelo
    letters.forEach((l, i) => c.anim(l, [{ opacity: 0, filter: 'blur(10px)', transform: 'translateY(.1em)' }, { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0)' }], { duration: 650, delay: 250 + 1350 * hit[Math.min(2, Math.floor(i / 2))] - 100 + (i % 2) * 70, easing: 'cubic-bezier(.2,.7,.3,1)' }));
    c.after(1600, () => { slot.style.opacity = 1; ball.remove(); });
    c.anim(tag, [{ opacity: 0 }, { opacity: .85 }], { duration: 600, delay: 1950 });
    lightExit(c, 2900);
  }

  // D · Blanco: fondo blanco, el nombre aparece en negro y se va poniendo verde letra por letra (el punto al final);
  // después se dibuja a mano la cancha por detrás.
  function blanco(c) {
    c.root.classList.add('ci-white');
    c.stage.innerHTML = `<div class="ci-center">${word()}<p class="ci-tag">${TAG}</p></div>`;
    const { letters, slot, tag } = wordParts(c);
    slot.style.cssText += ';border-radius:50%;background:#111';
    const GREEN = '#1E6B4F', INK = '#111111';
    letters.forEach((l, i) => {
      c.anim(l, [{ opacity: 0, transform: 'translateY(.08em)', color: INK }, { opacity: 1, transform: 'translateY(0)', color: INK }], { duration: 520, delay: 60 + i * 55, easing: 'cubic-bezier(.2,.7,.3,1)' });
      c.anim(l, [{ color: INK }, { color: GREEN }], { duration: 600, delay: 800 + i * 130, easing: 'ease-in-out', composite: 'replace' });
    });
    c.anim(slot, [{ opacity: 0, transform: 'scale(.4)', backgroundColor: INK }, { opacity: 1, transform: 'scale(1)', backgroundColor: INK }], { duration: 520, delay: 60 + 5 * 55, easing: 'cubic-bezier(.2,.7,.3,1)' });
    c.anim(slot, [{ backgroundColor: INK }, { backgroundColor: GREEN }], { duration: 600, delay: 800 + 5 * 130, easing: 'ease-in-out' });
    c.anim(tag, [{ opacity: 0 }, { opacity: .8 }], { duration: 600, delay: 2100 });

    // Cancha dibujada a mano, por detrás del nombre
    const W = innerWidth, H = innerHeight, rnd = (a, b) => a + Math.random() * (b - a);
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none';
    const land = W / H > 1.12;
    let ch = H * .8, cw = ch * .4615;
    if (land) { ch = Math.min(W * .84, H * .9 / .4615); cw = ch * .4615; } else if (cw > W * .88) { cw = W * .88; ch = cw / .4615; }
    const sx = cw * 4.5 / 36, sv = ch * 6.4 / 23.77, mc = ch / 2, cm = cw / 2;
    const M = (px, py) => land ? [(W - ch) / 2 + py, (H - cw) / 2 + px] : [(W - cw) / 2 + px, (H - ch) / 2 + py];
    const smooth = pts => { let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`; } return d; };
    const hand = (x0, y0, x1, y1) => {
      const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(3, Math.round(L / 34)), ux = (x1 - x0) / L, uy = (y1 - y0) / L, nx = -uy, ny = ux, e0 = rnd(3, 20), e1 = rnd(3, 20), f = rnd(1, 2.2), ph = rnd(0, 6), A = rnd(1.4, 3.4), pts = [];
      for (let i = 0; i <= n; i++) { const u = i / n, o = Math.sin(u * Math.PI * f + ph) * A + rnd(-.9, .9), s2 = -e0 + (L + e0 + e1) * u; pts.push([x0 + ux * s2 + nx * o, y0 + uy * s2 + ny * o]); }
      return smooth(pts);
    };
    const loc = [[0, 0, cw, 0], [cw, 0, cw, ch], [cw, ch, 0, ch], [0, ch, 0, 0], [sx, 0, sx, ch], [cw - sx, 0, cw - sx, ch],
      [sx, mc - sv, cw - sx, mc - sv], [sx, mc + sv, cw - sx, mc + sv], [cm, mc - sv, cm, mc + sv], [cm, 0, cm, 16], [cm, ch, cm, ch - 16], [-26, mc, cw + 26, mc]];
    const segs = loc.map(([a, b, c2, d]) => [...M(a, b), ...M(c2, d)]);
    const T0 = 1700;
    segs.forEach((sg, i) => {
      const net = i === segs.length - 1;
      [[net ? 8 : rnd(4.5, 6.5), net ? .17 : .13, hand(...sg)], [net ? 3.5 : rnd(1.8, 3), .12, hand(...sg)]].forEach(([w, a, dd]) => {
        const p = document.createElementNS(NS, 'path'); p.setAttribute('d', dd); p.setAttribute('pathLength', '1'); p.setAttribute('fill', 'none');
        p.setAttribute('stroke', `rgba(30,107,79,${a})`); p.setAttribute('stroke-width', w); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
        svg.append(p); c.anim(p, [{ strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDasharray: '1 1', strokeDashoffset: 0 }], { duration: 520, delay: T0 + i * 80, easing: 'cubic-bezier(.3,.6,.3,1)' });
      });
    });
    c.stage.prepend(svg);
    lightExit(c, 3300);
  }

  /* ===== Intro «Blanco» con distintos fondos que representan la unión de cuerdas (coach y jugador) ===== */
  function blancoTexto(c, small) {
    c.root.classList.add('ci-white');
    c.stage.innerHTML = `<div class="ci-center">${word()}<p class="ci-tag">${TAG}</p></div>`;
    const { letters, slot, tag } = wordParts(c);
    slot.style.cssText += ';border-radius:50%;background:#111' + (small ? ';width:.17em;height:.17em;margin-left:.09em;transform-origin:50% 50%' : '');
    const GREEN = '#1E6B4F', INK = '#111111';
    letters.forEach((l, i) => {
      c.anim(l, [{ opacity: 0, transform: 'translateY(.08em)', color: INK }, { opacity: 1, transform: 'translateY(0)', color: INK }], { duration: 520, delay: 60 + i * 55, easing: 'cubic-bezier(.2,.7,.3,1)' });
      c.anim(l, [{ color: INK }, { color: GREEN }], { duration: 600, delay: 800 + i * 130, easing: 'ease-in-out' });
    });
    c.anim(slot, [{ opacity: 0, transform: 'scale(.4)', backgroundColor: INK }, { opacity: 1, transform: 'scale(1)', backgroundColor: INK }], { duration: 520, delay: 60 + 5 * 55, easing: 'cubic-bezier(.2,.7,.3,1)' });
    c.anim(slot, [{ backgroundColor: INK }, { backgroundColor: small ? '#C8F03C' : GREEN }], { duration: 600, delay: 800 + 5 * 130, easing: 'ease-in-out' });
    c.anim(tag, [{ opacity: 0 }, { opacity: .8 }], { duration: 600, delay: 2100 });
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none';
    c.stage.prepend(svg);
    return { svg, slot, W: innerWidth, H: innerHeight };
  }
  const svgLine = (svg, x0, y0, x1, y1, stroke, w) => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', `M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}`);
    p.setAttribute('pathLength', '1'); p.setAttribute('fill', 'none'); p.setAttribute('stroke', stroke); p.setAttribute('stroke-width', w); p.setAttribute('stroke-linecap', 'round');
    svg.append(p); return p;
  };
  const drawIn = (c, el, delay, dur) => c.anim(el, [{ strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDasharray: '1 1', strokeDashoffset: 0 }], { duration: dur, delay, easing: 'cubic-bezier(.3,.6,.3,1)' });

  // Cruce: una cuerda vertical (el coach) y una horizontal (el jugador) se encuentran justo en el punto de CORDA.
  function cruce(c) {
    const { svg, slot, W, H } = blancoTexto(c);
    const D = centerOf(slot), V = '#1E6B4F', Hc = '#7FA894';
    const T = 1500;
    drawIn(c, svgLine(svg, D.x, D.y, D.x, 0, V, 1.6), T, 800);
    drawIn(c, svgLine(svg, D.x, D.y, D.x, H, V, 1.6), T, 800);
    drawIn(c, svgLine(svg, D.x, D.y, 0, D.y, Hc, 1.6), T + 140, 800);
    drawIn(c, svgLine(svg, D.x, D.y, W, D.y, Hc, 1.6), T + 140, 800);
    const ring = document.createElementNS(NS, 'circle'); ring.setAttribute('cx', D.x); ring.setAttribute('cy', D.y); ring.setAttribute('r', D.w * .5); ring.setAttribute('fill', 'none'); ring.setAttribute('stroke', V); ring.setAttribute('stroke-width', 1.4);
    svg.append(ring);
    ring.style.cssText = 'transform-box:fill-box;transform-origin:center';
    c.anim(ring, [{ opacity: .7, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(5)' }], { duration: 1100, delay: T, easing: 'cubic-bezier(.2,.7,.3,1)' });
    lightExit(c, 3100);
  }

  // Malla: una trama muy fina de cuerdas verticales y horizontales se teje detrás del nombre; el punto de CORDA queda justo en un cruce
  // y al final late como una pelota que recibe un golpe.
  function malla(c) {
    const { svg, slot, W, H } = blancoTexto(c, true);
    const D = centerOf(slot), gap = Math.max(34, Math.min(60, W / 13)), cx = D.x, cy = D.y;
    svg.style.webkitMaskImage = svg.style.maskImage = `radial-gradient(ellipse 62% 52% at 50% 46%, #000 18%, transparent 80%)`;
    for (let k = -16; k <= 16; k++) {
      const x = cx + k * gap, y = cy + k * gap, dl = 1000 + Math.abs(k) * 45;
      if (x > -gap && x < W + gap) drawIn(c, svgLine(svg, x, 0, x, H, 'rgba(15,59,44,.20)', 1.3), dl, 800);
      if (y > -gap && y < H + gap) drawIn(c, svgLine(svg, 0, y, W, y, 'rgba(30,107,79,.15)', 1.3), dl + 80, 800);
    }
    // Latido: un solo pulso del punto, como el golpe a la pelota
    c.anim(slot, [{ transform: 'scale(1)' }, { transform: 'scale(1.75)', offset: .28 }, { transform: 'scale(1)' }], { duration: 620, delay: 2500, fill: 'forwards', easing: 'cubic-bezier(.3,.7,.3,1)' });
    lightExit(c, 3700);
  }

  // Cordaje: la cabeza de una raqueta, hecha solo con cuerdas finas que se cruzan, detrás del nombre.
  function cordaje(c) {
    const { svg, W, H } = blancoTexto(c);
    const cx = W / 2, cy = H * .46, ry = Math.min(H * .44, W * .62), rx = ry / 1.18, gap = ry / 9;
    const id = 'cc' + (++uid), cp = document.createElementNS(NS, 'clipPath'); cp.setAttribute('id', id);
    const el = document.createElementNS(NS, 'ellipse'); [['cx', cx], ['cy', cy], ['rx', rx - 3], ['ry', ry - 3]].forEach(([k, v]) => el.setAttribute(k, v)); cp.append(el);
    const defs = document.createElementNS(NS, 'defs'); defs.append(cp); svg.append(defs);
    const frame = document.createElementNS(NS, 'ellipse'); [['cx', cx], ['cy', cy], ['rx', rx], ['ry', ry]].forEach(([k, v]) => frame.setAttribute(k, v));
    frame.setAttribute('fill', 'none'); frame.setAttribute('stroke', 'rgba(15,59,44,.28)'); frame.setAttribute('stroke-width', 2.2); frame.setAttribute('pathLength', '1');
    svg.append(frame); drawIn(c, frame, 1300, 1100);
    const g = document.createElementNS(NS, 'g'); g.setAttribute('clip-path', `url(#${id})`); svg.append(g);
    for (let k = -10; k <= 10; k++) {
      const x = cx + k * gap, y = cy + k * gap * 1.04, dl = 1800 + Math.abs(k) * 50;
      drawIn(c, svgLine(g, x, cy - ry, x, cy + ry, 'rgba(15,59,44,.20)', 1.3), dl, 800);
      drawIn(c, svgLine(g, cx - rx, y, cx + rx, y, 'rgba(30,107,79,.16)', 1.3), dl + 80, 800);
    }
    lightExit(c, 3400);
  }

  const VARIANTS = { puntos, luz, linea, rebote, blanco, cruce, malla, cordaje };
  window.CordaIntro = { play, variants: Object.keys(VARIANTS) };
})();
