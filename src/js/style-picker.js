const root = document.querySelector('[data-style-picker]');

if (root) {
  const choices = [
    { id: 'editorial-pop', kind: 'style', title: 'Editorial pop', description: 'Big type, roomy layouts, and a splash of unexpected color.', className: 'preview--editorial', colors: ['#ffdf59', '#f5a8b7', '#2365d8'] },
    { id: 'color-block-party', kind: 'style', title: 'Color block party', description: 'Confident panels and high-energy contrast.', className: 'preview--blocks', colors: ['#ff6a51', '#ffdc47', '#1f6dce'] },
    { id: 'soft-and-playful', kind: 'style', title: 'Soft and playful', description: 'Rounded shapes, friendly type, and sunny details.', className: 'preview--soft', colors: ['#f3a1bd', '#b8e48e', '#a18bf2'] },
    { id: 'bright-and-crisp', kind: 'style', title: 'Bright and crisp', description: 'Clean lines and bold color used with intention.', className: 'preview--crisp', colors: ['#f8f6ed', '#2465dc', '#ff7f51'] },
    { id: 'creative-collage', kind: 'style', title: 'Creative collage', description: 'Layered shapes and a little handmade personality.', className: 'preview--collage', colors: ['#ffcece', '#fbcb4d', '#47b8aa'] },
    { id: 'night-pop', kind: 'style', title: 'Night pop', description: 'A dark canvas that makes bright accents shine.', className: 'preview--night', colors: ['#17243e', '#e8fa57', '#fa77b3'] },
    { id: 'citrus-pop', kind: 'palette', title: 'Citrus pop', description: 'Sunny yellow, tomato red, and deep blue.', colors: ['#ffe162', '#f15b49', '#2458ae', '#fff9e9'] },
    { id: 'berry-bloom', kind: 'palette', title: 'Berry bloom', description: 'Hot pink, raspberry, lilac, and cream.', colors: ['#fa8ab2', '#bb2b68', '#c4a8ef', '#fff5ef'] },
    { id: 'ocean-candy', kind: 'palette', title: 'Ocean candy', description: 'Electric blue, aqua, coral, and white.', colors: ['#2a68e8', '#68d8cf', '#ff806d', '#f8fbfb'] },
    { id: 'peachy-keen', kind: 'palette', title: 'Peachy keen', description: 'Apricot, peach, leaf green, and ink.', colors: ['#ffba77', '#f1836f', '#6b9766', '#273b39'] },
    { id: 'lime-and-lilac', kind: 'palette', title: 'Lime & lilac', description: 'Fresh lime, violet, soft lavender, and navy.', colors: ['#c9ed63', '#7151cf', '#d9cbf8', '#202747'] },
    { id: 'sunset-punch', kind: 'palette', title: 'Sunset punch', description: 'Orange, fuchsia, butter yellow, and plum.', colors: ['#ff8a36', '#e64191', '#ffdc7d', '#4b294b'] }
  ];

  const storageKey = 'caitlin-style-picker-v1';
  const intro = root.querySelector('#intro');
  const game = root.querySelector('#game');
  const results = root.querySelector('#results');
  const cardStage = root.querySelector('#card-stage');
  const ratings = readRatings();
  let busy = false;
  let pointerStart = null;

  function readRatings() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return Object.fromEntries(Object.entries(saved).filter(([id, value]) => choices.some(choice => choice.id === id) && [0, 1, 2].includes(value)));
    } catch {
      return {};
    }
  }

  function saveRatings() {
    try { localStorage.setItem(storageKey, JSON.stringify(ratings)); } catch { /* The picker still works without storage. */ }
  }

  function nextIndex() { return choices.findIndex(choice => !Object.hasOwn(ratings, choice.id)); }

  function preview(choice) {
    const colorVars = choice.colors.map((color, index) => `--pick-${index + 1}:${color}`).join(';');
    if (choice.kind === 'palette') {
      return `<div class="palette-preview" style="${colorVars}"><div class="palette-preview__hero"><span>Caitlin Britten</span><strong>Good work feels better in color.</strong><i></i></div><div class="palette-preview__swatches">${choice.colors.map(color => `<span style="background:${color}"></span>`).join('')}</div></div>`;
    }
    return `<div class="site-preview ${choice.className}" style="${colorVars}"><div class="site-preview__nav"><strong>Caitlin Britten</strong><span>Work &nbsp; About &nbsp; Contact</span></div><div class="site-preview__hero"><div class="site-preview__words"><small>REMOTE SUPPORT · CREATIVE CARE</small><strong>Here to make the busy days feel easy.</strong><span class="site-preview__cta">Let's talk</span></div><div class="site-preview__art"><i></i><b></b><em></em></div></div><div class="site-preview__bottom"><span>01 &nbsp; Client care</span><span>02 &nbsp; Organization</span><span>03 &nbsp; Creative support</span></div></div>`;
  }

  function render() {
    const index = nextIndex();
    intro.hidden = true;
    game.hidden = index < 0;
    results.hidden = index >= 0;
    if (index < 0) { renderResults(); return; }

    const choice = choices[index];
    root.querySelector('#stage-label').textContent = choice.kind === 'style' ? 'Website styles' : 'Color palettes';
    root.querySelector('#progress-label').textContent = `${index + 1} of ${choices.length}`;
    root.querySelector('#progress-fill').style.width = `${index / choices.length * 100}%`;
    root.querySelector('#game-title').textContent = choice.kind === 'style' ? 'Which website look feels right?' : 'Which colors feel like you?';
    root.querySelector('#game-instruction').textContent = choice.kind === 'style' ? 'Imagine your own photos and work in each layout. Choose the overall feel.' : 'Think about the colors you would enjoy seeing across your website.';
    cardStage.innerHTML = `<article class="pick-card" data-choice-id="${choice.id}"><div class="pick-card__preview">${preview(choice)}</div><div class="pick-card__body"><span class="pick-card__kind">${choice.kind === 'style' ? 'Website look' : 'Color palette'}</span><h3>${choice.title}</h3><p>${choice.description}</p></div><span class="swipe-indicator swipe-indicator--pass" aria-hidden="true">Pass</span><span class="swipe-indicator swipe-indicator--like" aria-hidden="true">Like</span></article>`;
    root.querySelector('[data-undo]').disabled = Object.keys(ratings).length === 0;
    game.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function rate(value, direction = 0) {
    if (busy) return;
    const index = nextIndex();
    if (index < 0) return;
    busy = true;
    const card = cardStage.querySelector('.pick-card');
    card.style.transform = `translateX(${direction || (value === 0 ? -420 : 420)}px) rotate(${value === 0 ? -10 : 10}deg)`;
    card.style.opacity = '0';
    window.setTimeout(() => {
      ratings[choices[index].id] = value;
      saveRatings();
      busy = false;
      render();
    }, 180);
  }

  function undo() {
    if (busy) return;
    const answered = choices.filter(choice => Object.hasOwn(ratings, choice.id));
    if (!answered.length) return;
    delete ratings[answered.at(-1).id];
    saveRatings();
    render();
  }

  function labeled(kind, score) { return choices.filter(choice => choice.kind === kind && ratings[choice.id] === score).map(choice => choice.title); }

  function renderList(id, kind) {
    const loved = labeled(kind, 2);
    const liked = labeled(kind, 1);
    const list = root.querySelector(id);
    list.replaceChildren();
    for (const [label, items] of [['Loved', loved], ['Liked', liked]]) {
      items.forEach(item => { const li = document.createElement('li'); li.innerHTML = `<span>${label}</span><strong></strong>`; li.querySelector('strong').textContent = item; list.append(li); });
    }
    if (!list.children.length) { const li = document.createElement('li'); li.textContent = 'Nothing felt quite right yet'; list.append(li); }
  }

  function renderResults() {
    renderList('#style-results', 'style');
    renderList('#palette-results', 'palette');
    for (const [id, value] of [['style-loves', labeled('style', 2)], ['style-likes', labeled('style', 1)], ['palette-loves', labeled('palette', 2)], ['palette-likes', labeled('palette', 1)]]) root.querySelector(`#${id}`).value = value.join(', ') || 'None';
    root.querySelector('#all-ratings').value = choices.map(choice => `${choice.title}: ${['Pass', 'Like', 'Love'][ratings[choice.id]]}`).join(' | ');
    root.querySelector('#results-title').focus?.();
  }

  function summary() {
    const line = (label, values) => `${label}: ${values.join(', ') || 'None'}`;
    return ['Caitlin website style picks', `Name: ${root.querySelector('#picker-name').value.trim() || 'Caitlin'}`, line('Loved website looks', labeled('style', 2)), line('Liked website looks', labeled('style', 1)), line('Loved color palettes', labeled('palette', 2)), line('Liked color palettes', labeled('palette', 1)), `Note: ${root.querySelector('#picker-note').value.trim() || 'None'}`].join('\n');
  }

  root.querySelector('[data-start]').addEventListener('click', render);
  root.querySelectorAll('[data-rate]').forEach(button => button.addEventListener('click', () => rate(Number(button.dataset.rate))));
  root.querySelector('[data-undo]').addEventListener('click', undo);
  root.querySelector('[data-restart]').addEventListener('click', () => { choices.forEach(choice => delete ratings[choice.id]); saveRatings(); render(); });
  root.querySelector('[data-copy]').addEventListener('click', async event => {
    try { await navigator.clipboard.writeText(summary()); event.currentTarget.textContent = 'Copied!'; window.setTimeout(() => { event.currentTarget.textContent = 'Copy summary'; }, 1800); }
    catch { event.currentTarget.textContent = 'Copy unavailable'; }
  });
  document.addEventListener('keydown', event => {
    if (game.hidden || ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); rate(0); }
    if (event.key === 'ArrowRight') { event.preventDefault(); rate(1); }
    if (event.key === 'ArrowUp') { event.preventDefault(); rate(2); }
  });
  cardStage.addEventListener('pointerdown', event => { if (busy) return; pointerStart = { x: event.clientX, y: event.clientY }; });
  cardStage.addEventListener('pointermove', event => {
    if (!pointerStart || busy) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    if (Math.abs(dx) < Math.abs(dy)) return;
    const card = cardStage.querySelector('.pick-card');
    card.style.transition = 'none';
    card.style.transform = `translateX(${dx}px) rotate(${dx / 28}deg)`;
    card.querySelector('.swipe-indicator--pass').style.opacity = dx < -35 ? '1' : '0';
    card.querySelector('.swipe-indicator--like').style.opacity = dx > 35 ? '1' : '0';
  });
  cardStage.addEventListener('pointerup', event => {
    if (!pointerStart || busy) return;
    const dx = event.clientX - pointerStart.x;
    pointerStart = null;
    const card = cardStage.querySelector('.pick-card');
    if (Math.abs(dx) > 90) { card.style.transition = ''; rate(dx < 0 ? 0 : 1, dx < 0 ? -420 : 420); return; }
    card.style.transition = '';
    card.style.transform = '';
    card.querySelectorAll('.swipe-indicator').forEach(indicator => { indicator.style.opacity = ''; });
  });
  cardStage.addEventListener('pointercancel', () => { pointerStart = null; const card = cardStage.querySelector('.pick-card'); if (card) { card.style.transition = ''; card.style.transform = ''; } });

  if (Object.keys(ratings).length) render();
}
