// Tarjeta "Tu balance del mes" del inicio. La gráfica de progreso vive en progress-hub.js.
const exampleAssessment={good:'Tu segundo saque entra con más regularidad, incluso cuando juegas con el marcador en contra.',focus:'Dale más efecto al segundo saque para ganar margen sobre la red. En la próxima sesión, practica al cuerpo empezando en 30–40 y registra cuántos saques entran profundos.'};
function monthlyReviewCard(){
  const key=localDay().slice(0,7),assessment=state.profile.monthlyReviews?.[key];
  const note=assessment||exampleAssessment;
  const last=Object.entries(state.reviews).sort(([a],[b])=>b.localeCompare(a))[0];
  return `<section class="card coach-month"><small class="eyebrow">Seguimiento del coach</small><h2>Tu balance del mes</h2><small class="review-period">${assessment?dateLabel(key+'-01',{month:'long',year:'numeric'}):'Ejemplo · Leonardo · Octubre 2026'}</small><div class="monthly-gain"><b><span class="gain-check" aria-hidden="true">✓</span>Lo que mejoraste</b><p>${esc(note.good)}</p></div><div><b>Tu siguiente ajuste</b><p>${esc(note.focus)}</p></div>
  ${last?`<p class="hint">Última corrección · ${dateLabel(last[0],{day:'numeric',month:'short'})}<br>${esc(last[1].focus)}</p>`:''}
  <button data-page="goals" class="link">Ver mi progreso ↗</button>${role==='Coach'?'<button class="link" id="edit-month">Evaluar este mes</button><button class="link" id="review-today">Evaluar hoy</button>':''}</section>`;
}
function bindAnnual(){
  const edit=document.querySelector('#edit-month');
  if(edit)edit.onclick=()=>{
    const key=localDay().slice(0,7),previous=state.profile.monthlyReviews?.[key]||{};
    modal('Balance de este mes','<label class="full">Lo que mejoró<textarea required maxlength="600" name="good">'+esc(previous.good)+'</textarea></label><label class="full">Siguiente ajuste<textarea required maxlength="600" name="focus">'+esc(previous.focus)+'</textarea></label>',data=>{
      state.profile.monthlyReviews??={};state.profile.monthlyReviews[key]={...previous,...data};
    });
  };
}
