// Reseñas de la portada.
// IMPORTANTE: estas reseñas son EJEMPLOS inventados para el prototipo y se
// muestran rotuladas como tales. Antes de publicar, cámbialas por reseñas reales
// (con permiso de cada persona) y pon EXAMPLE_REVIEWS en false.
// "foto": ruta a la imagen de la persona (p. ej. 'assets/resenas/ana.jpg').
// Si está vacía, se muestran sus iniciales.
const EXAMPLE_REVIEWS=true;
const REVIEWS=[
  {nombre:'Valeria M.',rol:'Jugadora junior',foto:'',estrellas:5,texto:'Antes de cada entrenamiento ya sé qué vamos a trabajar. Mi segundo saque mejoró porque por fin sigo el mismo plan toda la semana.'},
  {nombre:'Diego R.',rol:'Coach de alto rendimiento',foto:'',estrellas:5,texto:'Dejo la corrección del día en dos minutos y el jugador llega a la siguiente sesión sabiendo qué ajustar. Me ahorra explicaciones repetidas.'},
  {nombre:'Laura G.',rol:'Mamá de jugador',foto:'',estrellas:5,texto:'Veo la agenda de mi hijo, sus avances y la mensualidad en un solo lugar. Ya no tengo que preguntar por WhatsApp a qué hora entrena.'},
  {nombre:'Santiago P.',rol:'Jugador de circuito',foto:'',estrellas:5,texto:'La cuenta regresiva al torneo me ordena la semana. Llegué al último torneo sabiendo exactamente qué había preparado.'},
  {nombre:'Mariana T.',rol:'Preparadora física',foto:'',estrellas:5,texto:'La rutina física queda conectada con el objetivo de cancha. Los jugadores entienden por qué hacen cada ejercicio.'},
  {nombre:'Andrés L.',rol:'Director de academia',foto:'',estrellas:5,texto:'Coaches, familias y jugadores ven la misma información. Las juntas de seguimiento ahora son más cortas y más claras.'}
];
function reviewInitials(name){
  return name.split(/\s+/).map(part=>part[0]||'').join('').slice(0,2).toUpperCase();
}
function reviewStars(count){
  const star='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>';
  return `<span class="review-stars" role="img" aria-label="${count} de 5 estrellas">${star.repeat(count)}</span>`;
}
function reviewCard(review,hidden){
  // Las iniciales quedan debajo; si hay foto, la cubre. Si la foto falla, se ven las iniciales.
  const photo=`<span class="avatar review-avatar" aria-hidden="true">${esc(reviewInitials(review.nombre))}${review.foto?`<img src="${esc(review.foto)}" alt="" onerror="this.remove()">`:''}</span>`;
  return `<figure class="review-card"${hidden?' aria-hidden="true"':''}>${reviewStars(review.estrellas)}<blockquote>${esc(review.texto)}</blockquote><figcaption>${photo}<span><b>${esc(review.nombre)}</b><small>${esc(review.rol)}</small></span></figcaption></figure>`;
}
function reviewsSection(){
  const t=coverText;
  const cards=REVIEWS.map(r=>reviewCard(r,false)).join('');
  // La fila se repite una vez (oculta a lectores de pantalla) para que el movimiento sea continuo.
  const loop=REVIEWS.map(r=>reviewCard(r,true)).join('');
  return `<section class="cover-reviews" aria-labelledby="reviews-title">
    <div class="cover-reviews__head"><small class="eyebrow">${EXAMPLE_REVIEWS?t('Reseñas de ejemplo','Sample reviews','Avis d’exemple'):t('Reseñas','Reviews','Avis')}</small>
    <h2 id="reviews-title">${t('Lo que dicen de CORDA','What people say about CORDA','Ce que l’on dit de CORDA')}</h2>
    ${EXAMPLE_REVIEWS?`<p class="hint">${t('Textos ilustrativos del prototipo. Aún no son opiniones de usuarios reales.','Illustrative prototype copy. These are not real user reviews yet.','Textes d’illustration du prototype. Ce ne sont pas encore de vrais avis.')}</p>`:''}</div>
    <div class="reviews-viewport"><div class="reviews-track">${cards}${loop}</div></div>
  </section>`;
}
