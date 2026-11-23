// CORDA · Avisos (campana). Fase 1: se calculan en la app con los datos que ya tiene; no necesita servidor.
// Los mismos avisos también llegan al teléfono como notificaciones (ver push.js).
(() => {
  const KEY = 'corda-avisos-v1';
  const safe = (fn, fb) => { try { return fn(); } catch (e) { return fb; } };
  const IC = {
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    drop: '<path d="M12 3.5c3.5 4.2 5.5 7 5.5 10a5.5 5.5 0 0 1-11 0c0-3 2-5.8 5.5-10z"/>',
    flame: '<path d="M12 3c1 3.2 4.5 5 4.5 9.2a4.5 4.5 0 0 1-9 0c0-1.6.7-2.7 1.5-3.7.3 1 .8 1.6 1.5 1.9C10.2 8.5 10.7 5.6 12 3z"/>',
    alert: '<path d="M12 4 21 19.5H3z"/><path d="M12 10v4.5M12 17.2v.1"/>',
    check: '<circle cx="12" cy="12" r="8.5"/><path d="m8.2 12.3 2.6 2.6 5-5.4"/>',
    coin: '<rect x="3.5" y="6.5" width="17" height="11" rx="2.5"/><circle cx="12" cy="12" r="2.4"/>',
    trophy: '<path d="M8 4.5h8v4.2a4 4 0 0 1-8 0z"/><path d="M8 6H5c0 3 1.2 4.5 3 4.8M16 6h3c0 3-1.2 4.5-3 4.8M12 12.8v3.2M8.5 19.5h7M10 16h4"/>',
    chat: '<path d="M4 5.5h16v10.5H9.5L5.5 19.5V16H4z"/>',
    bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>',
    phone: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>'
  };
  const svg = (n, s = 22) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;
  const first = n => String(n || '').trim().split(/\s+/)[0] || 'tu jugador';
  const dayName = d => { const t = localDay(); return d === t ? 'hoy' : d === dateAfter(t, 1) ? 'mañana' : dateLabel(d, { weekday: 'long', day: 'numeric' }); };
  const owner = () => safe(() => { const a = typeof actor === 'function' ? actor() : state.profile; return (a && (a.memberId || a.id)) || state.profile.memberId; }, '') || 'anon';

  /* ---------- Cálculo de avisos por rol ---------- */
  function build() {
    const out = [], add = (id, tone, icon, title, text, go) => out.push({ id, tone, icon, title, text, go });
    const today = localDay(), tomorrow = dateAfter(today, 1), week = dateAfter(today, 7), now = Date.now();
    const sessions = state.sessions || [];
    const upcoming = d => (typeof sessionsFor === 'function' ? sessionsFor(d) : []).filter(s => !s.cancelled && !s.done && (d !== today || safe(() => sessionTimes(s).end > now, true)));
    const cancelled = sessions.filter(s => s.cancelled && s.date >= today && s.date <= week);
    const posts = safe(() => (groupData().posts || []).filter(p => p.at && now - p.at < 3 * 864e5), []);
    const sessTxt = s => `${s.title}${s.place ? ' · ' + s.place : ''}`;

    if (role === 'Jugador') {
      const id = state.profile.memberId;
      cancelled.forEach(s => add('can:' + s.id, 'alert', 'drop', `Sesión cancelada ${dayName(s.date)}`, `${s.time ? s.time + ' · ' : ''}${s.cancelReason || 'Cancelada'}`, { page: 'calendar' }));
      const done = safe(() => { const r = wellPeek(id)[today]; return !!r && readiness(r) !== null; }, true);
      if (!done) add('chk:' + today, 'info', 'check', 'Responde «¿Cómo amaneces hoy?»', 'Son 30 segundos y tu coach ajusta la carga.', { wellness: true });
      const streak = safe(() => wellStreak(id).current, 0);
      if (!done && streak >= 2) add('rac:' + today, 'info', 'flame', `Tu racha de ${streak} días sigue viva`, 'Responde hoy para no perderla.', { wellness: true });
      [today, tomorrow].forEach(d => upcoming(d).forEach(s => add(`ses:${s.id}:${s.date}:${s.time}`, 'info', 'cal', `Entrenas ${dayName(d)} a las ${s.time}`, sessTxt(s), { page: 'calendar' })));
      const rev = Object.keys(state.reviews || {}).sort().pop();
      if (rev && rev >= dateAfter(today, -7)) add('rev:' + rev, 'ok', 'chat', 'Tu coach dejó una evaluación', 'Mira qué mejoró y tu siguiente ajuste.', { page: 'goals' });
      const next = ((state.playerTournaments || {})[id] || []).concat(state.competition || []).filter(c => c.date >= today && c.date <= dateAfter(today, 3)).sort((a, b) => String(a.date).localeCompare(String(b.date)))[0];
      if (next) add('tor:' + next.date + next.name, 'info', 'trophy', `Torneo ${dayName(next.date)}`, next.name || '', { page: 'calendar' });
    } else if (role === 'Coach') {
      const members = safe(() => academyPlayers(actor().academy), []);
      let yellow = 0;
      members.forEach(m => {
        const st = safe(() => playerStatus(m.id), { level: 'none' });
        if (st.level === 'red') add(`st:${m.id}:${today}`, 'alert', 'alert', `${first(m.name)} necesita atención`, st.reason || '', { page: 'goals' });
        else if (st.level === 'yellow' && yellow++ < 3) add(`st:${m.id}:${today}`, 'info', 'alert', `Seguimiento: ${first(m.name)}`, st.reason || '', { page: 'goals' });
      });
      safe(() => (groupData().feePlayers || []).forEach(f => Object.entries(f.months || {}).forEach(([k, v]) => {
        if (v && v.payment === 'En revisión') {
          const m = (state.directory || []).find(x => x.id === f.id);
          add(`fee:${f.id}:${k}`, 'info', 'coin', `Comprobante por confirmar${m ? ' · ' + first(m.name) : ''}`, dateLabel(k + '-01', { month: 'long', year: 'numeric' }), { page: 'private-payments' });
        }
      })));
      const n = upcoming(today).length;
      if (n) add('hoy:' + today, 'info', 'cal', `Hoy tienes ${n} ${n === 1 ? 'sesión' : 'sesiones'}`, upcoming(today).map(s => s.time).join(' · '), { page: 'home' });
    } else if (role === 'Tutor') {
      const a = safe(() => actor(), {}), child = safe(() => academyPlayers(a.academy).find(m => m.id === a.childId), null), nm = first(child && child.name);
      cancelled.forEach(s => add('can:' + s.id, 'alert', 'drop', `Sesión cancelada ${dayName(s.date)}`, `${s.time ? s.time + ' · ' : ''}${s.cancelReason || 'Cancelada'}`, { page: 'calendar' }));
      [today, tomorrow].forEach(d => upcoming(d).forEach(s => add(`ses:${s.id}:${s.date}:${s.time}`, 'info', 'cal', `${nm} entrena ${dayName(d)} a las ${s.time}`, sessTxt(s), { page: 'calendar' })));
      if (child) {
        const st = safe(() => playerStatus(child.id), { level: 'none' });
        if (st.level === 'red') add(`st:${child.id}:${today}`, 'alert', 'alert', `${nm} necesita tu apoyo`, st.reason || '', { page: 'home' });
        const mk = today.slice(0, 7), mr = safe(() => athleteFor(child).profile.monthlyReviews || {}, {});
        if (mr[mk]) add('mrev:' + mk, 'ok', 'chat', `Hay una evaluación nueva de ${nm}`, 'Míralo en Inicio, en «Su mes».', { page: 'home' });
      }
      const fee = safe(() => feeStatus(feeLedger(), today.slice(0, 7)), '');
      if (fee === 'Pendiente') add('mens:' + today.slice(0, 7), 'alert', 'coin', 'Mensualidad pendiente', dateLabel(today, { month: 'long' }), { page: 'payments' });
      else if (fee === 'En revisión') add('mens-rev:' + today.slice(0, 7), 'info', 'coin', 'Tu comprobante está en revisión', 'El coach lo confirmará.', { page: 'payments' });
    }
    posts.forEach(p => add('post:' + p.at, 'info', 'chat', p.title || 'Aviso de la academia', 'Del tablón de tu academia.', { page: 'team' }));
    const rank = { alert: 0, info: 1, ok: 2 };
    return out.sort((a, b) => rank[a.tone] - rank[b.tone]);
  }

  /* ---------- Leídos (por persona, en este dispositivo) ---------- */
  const readSet = () => safe(() => new Set(JSON.parse(localStorage.getItem(KEY + ':' + owner()) || '[]')), new Set());
  const saveRead = set => safe(() => localStorage.setItem(KEY + ':' + owner(), JSON.stringify([...set].slice(-300))));
  const list = () => safe(build, []);
  const unread = () => { const r = readSet(); return list().filter(x => !r.has(x.id)).length; };
  const badge = n => n > 0 ? `<span class="bell-n" aria-hidden="true">${n > 9 ? '9+' : n}</span>` : '';

  window.bellButton = () => {
    const n = unread();
    return `<button type="button" class="bell" id="bell" aria-label="Avisos${n ? ': ' + n + ' sin leer' : ''}" aria-haspopup="dialog">${svg('bell', 22)}${badge(n)}</button>`;
  };
  const refreshBell = () => { const b = document.getElementById('bell'); if (!b) return; const n = unread(); b.querySelector('.bell-n')?.remove(); if (n) b.insertAdjacentHTML('beforeend', badge(n)); b.setAttribute('aria-label', 'Avisos' + (n ? ': ' + n + ' sin leer' : '')); };

  /* ---------- Panel ---------- */
  function open() {
    if (document.getElementById('avisos')) return close();
    const r = readSet(), items = list();
    const rows = items.map(x => `<li><button type="button" class="aviso is-${x.tone}${r.has(x.id) ? '' : ' is-new'}" data-aviso="${x.id.replace(/"/g, '&quot;')}"><span class="aviso-ic">${svg(x.icon, 20)}</span><span class="aviso-tx"><b>${esc(x.title)}</b>${x.text ? `<small>${esc(x.text)}</small>` : ''}</span></button></li>`).join('');
    const el = document.createElement('div'); el.id = 'avisos'; el.className = 'avisos';
    el.innerHTML = `<div class="avisos-back" data-avisos-close></div><section class="avisos-panel" role="dialog" aria-label="Avisos"><header><h2>Avisos</h2><button type="button" class="avisos-x" data-avisos-close aria-label="Cerrar">×</button></header>${rows ? `<ul class="avisos-list">${rows}</ul>` : `<div class="avisos-empty">${svg('check', 30)}<b>Todo al día</b><small>Cuando haya algo nuevo, lo verás aquí.</small></div>`}<div id="avisos-push"></div></section>`;
    document.body.append(el); document.getElementById('bell')?.setAttribute('aria-expanded', 'true');
    el.querySelector('.avisos-x')?.focus();
    pushRow();
  }
  /* ---------- Avisos al teléfono (fila al final del panel) ---------- */
  const PUSH_TXT = { Jugador: 'Te recordamos el chequeo y tus entrenamientos.', Coach: 'Te avisamos si un jugador necesita atención y de comprobantes por confirmar.', Tutor: 'Te avisamos de cambios de sesión y de la mensualidad.' };
  async function pushRow(msg) {
    const box = document.getElementById('avisos-push'); if (!box || typeof pushStatus !== 'function') return;
    const st = await pushStatus().catch(() => 'na'); if (!document.getElementById('avisos-push')) return;
    const row = (title, small, btn) => `<div class="avisos-push"><span class="ai-ic">${svg('bell', 22)}</span><div><b>${title}</b><small>${small}</small></div>${btn || ''}</div>`;
    if (st === 'na') { box.innerHTML = ''; return; }
    if (st === 'off') box.innerHTML = row('Avisos en tu teléfono', msg || (PUSH_TXT[role] || PUSH_TXT.Jugador), '<button type="button" class="btn lime sm" data-push-on>Activar</button>');
    else if (st === 'on') box.innerHTML = row('Avisos activados', msg || 'Te llegan a este teléfono, aunque CORDA esté cerrada.', '<button type="button" class="link" data-push-off>Desactivar</button>');
    else if (st === 'denied') box.innerHTML = row('Avisos bloqueados', 'Este navegador los tiene bloqueados. Actívalos en los ajustes del sitio y vuelve a abrir CORDA.');
    else if (st === 'nosup') box.innerHTML = row('Avisos no disponibles aquí', 'Este navegador no permite avisos al teléfono. Abre CORDA en Chrome (Android) o Safari (iPhone, iOS 16.4 o más) y no desde WhatsApp o Instagram.');
    else if (st === 'ios') box.innerHTML = row('Avisos en tu iPhone', 'Abre CORDA desde su ícono en la pantalla de inicio para poder activarlos.');
  }
  async function pushToggle(on) {
    const b = document.querySelector('[data-push-on],[data-push-off]'); if (b) b.disabled = true;
    try {
      if (on) { const ok = await pushEnable(); pushRow(ok ? 'Listo: te llegarán a este teléfono.' : 'No diste permiso. Puedes intentarlo otra vez.'); }
      else { await pushDisable(); pushRow(); }
    } catch (e) { pushRow('No se pudo activar. Intenta de nuevo en un momento.'); }
  }

  function close() {
    const el = document.getElementById('avisos'); if (!el) return;
    const set = readSet(); list().forEach(x => set.add(x.id)); saveRead(set);       // al cerrar, lo visto queda como leído
    el.remove(); document.getElementById('bell')?.setAttribute('aria-expanded', 'false'); refreshBell();
  }
  function go(id) {
    const it = list().find(x => x.id === id); if (!it) return;
    close();
    if (it.go && it.go.wellness && typeof openWellness === 'function') { window.scrollTo(0, 0); setTimeout(openWellness, 50); return; }
    if (it.go && it.go.page) { page = it.go.page; render(); window.scrollTo(0, 0); }
  }
  document.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('#bell')) return open();
    if (t.closest('[data-avisos-close]')) return close();
    if (t.closest('[data-push-on]')) return pushToggle(true);
    if (t.closest('[data-push-off]')) return pushToggle(false);
    const a = t.closest('[data-aviso]'); if (a) go(a.getAttribute('data-aviso'));
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  setInterval(refreshBell, 60000);

  /* ---------- Al tocar un aviso del teléfono, la app abre justo donde corresponde (?aviso=...) ---------- */
  const DEEP = { chequeo: { wellness: true }, plan: { page: 'calendar' }, estado: { page: 'goals' }, jugadores: { page: 'goals' }, tablon: { page: 'team' }, inicio: { page: 'home' } };
  let pending = new URLSearchParams(location.search).get('aviso');
  const tryDeep = () => {
    if (!pending || typeof entry === 'undefined' || entry !== 'app' || !state.profile) return;
    const k = pending; pending = null; safe(() => history.replaceState(null, '', location.pathname));
    const it = k === 'pagos' ? { page: role === 'Coach' ? 'private-payments' : 'payments' } : DEEP[k]; if (!it) return;
    if (it.wellness && typeof openWellness === 'function') { window.scrollTo(0, 0); setTimeout(openWellness, 300); }
    else if (it.page) { page = it.page; render(); window.scrollTo(0, 0); }
  };
  if (pending) { const t = setInterval(() => { tryDeep(); if (!pending) clearInterval(t); }, 400); setTimeout(() => clearInterval(t), 40000); }
  if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', e => { if (e.data && e.data.type === 'aviso') { pending = new URL(e.data.url || '/', location.origin).searchParams.get('aviso'); tryDeep(); } });
})();
