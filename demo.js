import { createStory } from './scrolly/scrolly.js';

const story = createStory();
window.story = story; // handy for poking at from the console

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

// The two opening buttons set the sound (handled by scrolly) and then take you into the story.
for (const button of document.querySelectorAll('[data-start]')) {
  button.addEventListener('click', () => {
    document.getElementById('story').scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  });
}

// Reading progress along the top edge.
const bar = document.querySelector('.progress span');
function updateProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
}
addEventListener('scroll', updateProgress, { passive: true });
addEventListener('resize', updateProgress);
updateProgress();

// The mixer panel shows every sound source, its live level and the level it's heading for.
const mixer = document.getElementById('mixer');
const mixerToggle = document.getElementById('mixer-toggle');
const rowsEl = document.getElementById('mixer-rows');
const whereEl = document.getElementById('mixer-where');
const sceneNames = { bay: 'The bay', sunset: 'Sunset', 'fire-scene': 'The fire' };
const rows = new Map();

function rowFor(source) {
  if (rows.has(source.id)) return rows.get(source.id);
  const li = document.createElement('li');
  li.className = 'mixer-row';
  li.innerHTML = '<span class="mixer-name"></span><span class="mixer-state"></span><span class="meter"><span class="meter-fill"></span><span class="meter-target"></span></span>';
  li.querySelector('.mixer-name').textContent = source.label;
  rowsEl.append(li);
  const row = {
    el: li,
    state: li.querySelector('.mixer-state'),
    fill: li.querySelector('.meter-fill'),
    target: li.querySelector('.meter-target'),
  };
  rows.set(source.id, row);
  return row;
}

function renderMixer() {
  if (mixer.hidden) return;
  const state = story.state();
  const scene = state.sections.reduce((best, s) => (s.presence > (best?.presence ?? 0) ? s : best), null);
  whereEl.textContent =
    scene && scene.presence > 0.5
      ? `${sceneNames[scene.id] ?? scene.id} · step ${scene.step + 1} of ${scene.steps} · ${scene.layer}`
      : 'Text';
  for (const source of state.sources) {
    const row = rowFor(source);
    row.fill.style.width = `${(source.level * 100).toFixed(1)}%`;
    row.target.style.left = `calc(${(source.target * 100).toFixed(1)}% - 1px)`;
    row.el.classList.toggle('is-muted', !state.sound);
    row.state.textContent = !state.sound
      ? source.target > 0.01 ? 'muted' : '–'
      : source.playing ? `${Math.round(source.level * 100)}%` : 'stopped';
  }
  requestAnimationFrame(renderMixer);
}

function setMixer(open) {
  mixer.hidden = !open;
  mixerToggle.setAttribute('aria-pressed', String(open));
  try {
    localStorage.setItem('lowtide:mixer', open ? 'open' : 'closed');
  } catch {}
  if (open) renderMixer();
}

let saved = null;
try {
  saved = localStorage.getItem('lowtide:mixer');
} catch {}
setMixer(saved ? saved === 'open' : matchMedia('(min-width: 1100px)').matches);
mixerToggle.addEventListener('click', () => setMixer(mixer.hidden));
