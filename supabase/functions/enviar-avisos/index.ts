// @ts-nocheck
// CORDA · Función «enviar-avisos»: manda los avisos al teléfono (notificaciones push).
// La despierta Supabase cada 5 minutos (ver 23_programar_avisos.sql). En cada vuelta:
//   1. mira quién tiene avisos activados,  2. revisa los datos de su academia,
//   3. decide qué avisos tocan ahora,  4. los manda una sola vez (la tabla push_sent evita repetidos).
// Privacidad: en la pantalla bloqueada nunca va información de salud, solo avisos generales.
import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const TZ = 'America/Mexico_City';   // hora de Guadalajara

//#core-start  (lógica pura: no toca la base de datos, se puede probar con datos de ejemplo)
const addDays = (day, n) => { const d = new Date(day + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const startMs = (date, time) => { const [y, m, d] = String(date).split('-').map(Number); const [h, mi] = String(time || '0:0').split(':').map(Number); return Date.UTC(y, m - 1, d, h || 0, mi || 0); };
export function localNow(date = new Date(), tz = TZ) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date).map(x => [x.type, x.value]));
  return { day: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute), ms: Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) };
}
// Preparación 0–100 (igual que la app): sueño, energía, ánimo, dolor muscular y estrés.
const readiness = w => {
  const part = (v, inv) => { const n = (Number(v) - 1) / 4; return inv ? 1 - n : n; };
  const parts = [part(w && w.sleepQ), part(w && w.energy), part(w && w.mood), part(w && w.soreness, true), part(w && w.stress, true)].filter(Number.isFinite);
  return parts.length === 5 ? Math.round(parts.reduce((a, b) => a + b, 0) / 5 * 100) : null;
};
const first = n => String(n || '').trim().split(/\s+/)[0] || 'tu jugador';
const dayWord = (d, L) => d === L.day ? 'hoy' : d === addDays(L.day, 1) ? 'mañana' : d;

// c = { L, users, profiles, sessions, wellness, posts, reviews, fees, coachPlayers }
export function buildNotifications(c) {
  const { L } = c, out = [];
  const memberOf = p => p.details && p.details.memberId || '';
  const childOf = p => p.details && p.details.profile && p.details.profile.childId || '';
  const well = new Map();                                   // jugador → { fecha: registro }
  (c.wellness || []).forEach(i => { if (!well.has(i.member_id)) well.set(i.member_id, {}); well.get(i.member_id)[i.key] = i.data; });
  const done = (id, day) => { const r = (well.get(id) || {})[day]; return !!r && readiness(r) !== null; };
  const streak = id => { let d = done(id, L.day) ? L.day : addDays(L.day, -1), n = 0; while (done(id, d)) { n++; d = addDays(d, -1); } return n; };
  const high = r => !!r && (((r.pain || []).some(p => Number(p.level) >= 6)) || (readiness(r) !== null && readiness(r) <= 45));
  const sessFor = (academy, playerId) => (c.sessions || []).filter(i => i.academy_id === academy && i.data && i.data.date && (i.kind === 'session' ? true : i.member_id === playerId));
  const add = (u, dedupe, title, body, aviso, tag) => out.push({ user_id: u.id, dedupe: dedupe + '|' + u.id, title, body, url: '/?aviso=' + aviso, tag: tag || dedupe.split(':')[0] });

  for (const u of c.users) {
    if (!u.approved || !u.academy_id) continue;
    const isPlayer = u.role === 'Jugador', isTutor = u.role === 'Tutor', isCoach = u.role === 'Coach';
    const pid = isPlayer ? memberOf(u) : isTutor ? childOf(u) : '';
    const kid = isTutor ? first(((c.profiles || []).find(p => memberOf(p) === pid) || {}).name) : '';
    const who = isTutor ? kid : '';

    if (isPlayer || isTutor) {
      const mine = sessFor(u.academy_id, pid);
      for (const s of mine) {
        const d = s.data;
        if (d.cancelled && d.date >= L.day && d.date <= addDays(L.day, 2))
          add(u, `can:${s.key}:${d.date}`, 'Sesión cancelada', `${dayWord(d.date, L)} ${d.time || ''} · ${d.cancelReason || 'Cancelada'}`, 'plan');
        else if (!d.cancelled && d.date === L.day && d.time) {
          const diff = (startMs(d.date, d.time) - L.ms) / 60000;
          if (diff > 0 && diff <= 65) add(u, `soon:${s.key}:${d.date}:${d.time}`, isTutor ? `${who} entrena a las ${d.time}` : `Entrenas a las ${d.time}`, [d.title, d.place].filter(Boolean).join(' · '), 'plan');
        }
      }
      if (L.minutes >= 1140 && L.minutes < 1260) {
        const tm = mine.filter(s => !s.data.cancelled && s.data.date === addDays(L.day, 1)).map(s => s.data.time).filter(Boolean).sort();
        if (tm.length) add(u, `man:${addDays(L.day, 1)}`, isTutor ? `${who} entrena mañana` : 'Mañana entrenas', `A las ${tm.join(' y ')}.`, 'plan');
      }
      if (isPlayer) {
        if (L.minutes >= 450 && L.minutes < 720 && !done(pid, L.day)) add(u, `chk:${L.day}`, '¿Cómo amaneces hoy?', 'Son 30 segundos y tu coach ajusta la carga.', 'chequeo');
        if (L.minutes >= 1140 && L.minutes < 1320 && !done(pid, L.day) && streak(pid) >= 2) add(u, `rac:${L.day}`, `Tu racha de ${streak(pid)} días sigue viva`, 'Responde hoy el chequeo para no perderla.', 'chequeo');
      }
      for (const r of c.reviews || []) {
        if (r.member_id !== pid || r.academy_id !== u.academy_id) continue;
        add(u, `rev:${r.kind}:${r.key}`, isTutor ? `Evaluación nueva de ${who}` : 'Tu coach dejó una evaluación', isTutor ? 'Míralo en Inicio, en «Su mes».' : 'Mira qué mejoró y tu siguiente ajuste.', isTutor ? 'inicio' : 'estado');
      }
      if (isTutor && pid && L.day.slice(8) >= '05' && L.minutes >= 600 && L.minutes < 1200) {
        const mk = L.day.slice(0, 7), fee = (c.fees || []).find(f => f.member_id === pid && f.key === mk && f.academy_id === u.academy_id);
        const st = fee && fee.data && fee.data.payment;
        if (st !== 'Pagado' && st !== 'En revisión') add(u, `mens:${pid}:${mk}`, 'Mensualidad pendiente', 'Sube el comprobante cuando hagas el pago.', 'pagos');
      }
    }

    if (isCoach) {
      const today = (c.sessions || []).filter(i => i.academy_id === u.academy_id && i.kind === 'session' && i.data && i.data.date === L.day && !i.data.cancelled);
      if (today.length && L.minutes >= 390 && L.minutes < 600) add(u, `hoy:${L.day}`, `Hoy tienes ${today.length} ${today.length === 1 ? 'sesión' : 'sesiones'}`, today.map(s => s.data.time).filter(Boolean).sort().join(' · '), 'inicio');
      const mineList = ((c.coachPlayers || []).find(i => i.academy_id === u.academy_id && i.key === memberOf(u)) || { data: {} }).data.players || [];
      for (const p of (c.profiles || []).filter(p => p.role === 'Jugador' && p.academy_id === u.academy_id && p.approved)) {
        const id = memberOf(p); if (!id || (mineList.length && !mineList.includes(id))) continue;
        if (high((well.get(id) || {})[L.day])) add(u, `att:${L.day}:${id}`, 'Un jugador necesita atención', 'Revisa tu lista de jugadores en CORDA.', 'jugadores');
      }
      for (const f of c.fees || []) if (f.academy_id === u.academy_id && f.data && f.data.payment === 'En revisión') add(u, `fee:${f.member_id}:${f.key}`, 'Comprobante por confirmar', 'Un jugador subió su comprobante de pago.', 'pagos');
    }

    for (const p of c.posts || []) {
      if (p.academy_id !== u.academy_id || p.author === u.id) continue;
      add(u, `post:${p.key}`, String((p.data && p.data.title) || 'Aviso de tu academia').slice(0, 90), 'Nuevo aviso en el tablón de tu academia.', 'tablon');
    }
  }
  return out;
}
//#core-end

const sb = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT') || 'mailto:info@cordatenis.com', Deno.env.get('VAPID_PUBLIC_KEY'), Deno.env.get('VAPID_PRIVATE_KEY'));

async function enviar(items, subsByUser) {
  let enviados = 0, bajas = 0, repetidos = 0;
  for (const n of items.slice(0, 400)) {
    const { data: nuevo } = await sb.from('push_sent').upsert({ dedupe: n.dedupe }, { onConflict: 'dedupe', ignoreDuplicates: true }).select();
    if (!nuevo || !nuevo.length) { repetidos++; continue; }          // ya se mandó antes
    for (const s of subsByUser.get(n.user_id) || []) {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify({ title: n.title, body: n.body, url: n.url, tag: n.tag }), { TTL: 3 * 3600 });
        enviados++;
      } catch (e) {
        if (e && (e.statusCode === 404 || e.statusCode === 410)) { await sb.from('push_subscriptions').delete().eq('endpoint', s.endpoint); bajas++; }   // el teléfono ya no los quiere
      }
    }
  }
  return { enviados, bajas, repetidos };
}

async function vuelta(prueba) {
  const { data: subs } = await sb.from('push_subscriptions').select('user_id,endpoint,p256dh,auth');
  if (!subs || !subs.length) return { avisos: 0, nota: 'Nadie tiene avisos activados todavía.' };
  const subsByUser = new Map(); subs.forEach(s => { if (!subsByUser.has(s.user_id)) subsByUser.set(s.user_id, []); subsByUser.get(s.user_id).push(s); });
  if (prueba) {
    const items = [...subsByUser.keys()].map(id => ({ user_id: id, dedupe: 'prueba:' + Date.now() + '|' + id, title: 'Prueba de CORDA', body: 'Si ves esto, los avisos al teléfono funcionan.', url: '/', tag: 'prueba' }));
    return { prueba: true, ...(await enviar(items, subsByUser)) };
  }
  const L = localNow(), ids = [...subsByUser.keys()];
  const cols = 'id,name,role,academy_id,details,approved';
  const { data: users } = await sb.from('profiles').select(cols).in('id', ids);
  const academias = [...new Set((users || []).filter(u => u.approved && u.academy_id).map(u => u.academy_id))];
  if (!academias.length) return { avisos: 0 };
  const { data: profiles } = await sb.from('profiles').select(cols).in('academy_id', academias);
  const itemCols = 'academy_id,member_id,kind,key,data,updated_at,author';
  const hace = h => new Date(Date.now() - h * 3600e3).toISOString();
  const q = (kinds) => sb.from('items').select(itemCols).in('academy_id', academias).in('kind', kinds);
  const [sessions, wellness, posts, reviews, fees, feesMes, coachPlayers] = await Promise.all([
    q(['session', 'player_session']).gte('data->>date', addDays(L.day, -1)),
    q(['wellness']).gte('key', addDays(L.day, -9)),
    q(['post']).gte('updated_at', hace(24)),
    q(['review', 'monthly_review']).gte('updated_at', hace(24)).gte('key', addDays(L.day, -3).slice(0, 7)),
    q(['fee_month']).gte('updated_at', hace(24 * 14)),                   // comprobantes recientes (para el coach)
    q(['fee_month']).eq('key', L.day.slice(0, 7)),                       // el mes actual de todos (para el recordatorio al tutor)
    q(['coach_players'])
  ]);
  const items = buildNotifications({ L, users: users || [], profiles: profiles || [], sessions: sessions.data || [], wellness: wellness.data || [], posts: posts.data || [], reviews: reviews.data || [], fees: [...(fees.data || []), ...(feesMes.data || [])], coachPlayers: coachPlayers.data || [] });
  const r = await enviar(items, subsByUser);
  await sb.from('push_sent').delete().lt('sent_at', hace(24 * 14));          // limpieza
  return { avisos: items.length, ...r, hora: L };
}

Deno.serve(async req => {
  if (req.headers.get('x-corda-secret') !== Deno.env.get('CORDA_PUSH_SECRET')) return new Response('No autorizado', { status: 401 });
  try {
    const prueba = new URL(req.url).searchParams.get('prueba');
    return Response.json(await vuelta(!!prueba));
  } catch (e) { return Response.json({ error: String(e && e.message || e) }, { status: 500 }); }
});
