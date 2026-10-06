/**
 * Scrolly: text, pictures, video and sound in one continuous scroll.
 *
 * No dependencies. Everything is driven by scroll position:
 *   - which picture or video is on screen,
 *   - how loud each sound is,
 *   - where a "scrubbed" video's playhead sits.
 *
 * Markup and attributes are documented in README.md.
 */

const DEFAULTS = {
  root: document,
  trigger: 0.5, // a step becomes active when its top crosses this point (0 = top of screen, 1 = bottom)
  fadeTime: 0.35, // seconds; how quickly volume settles on its new level
  pauseAfter: 1200, // ms; how long a hidden layer's video keeps running while it fades out
  preloadMargin: '150% 0px', // start loading media this far before it scrolls into view
};

const clamp = (x, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
const smoothstep = (x) => x * x * (3 - 2 * x);

// iOS ignores element.volume, so fades there go through Web Audio instead.
const canSetVolume = (() => {
  try {
    const a = document.createElement('audio');
    a.volume = 0.5;
    return a.volume === 0.5;
  } catch {
    return false;
  }
})();
const AudioCtx = window.AudioContext || window.webkitAudioContext;

function store(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    localStorage.setItem(key, value);
  } catch {
    return null;
  }
}

export function createStory(options = {}) {
  const opts = { ...DEFAULTS, ...options };
  const root = opts.root;
  const html = document.documentElement;
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');

  let reducedMotion = motionQuery.matches;
  let soundOn = false;
  let captionsOn = store('scrolly:captions') === 'on';
  let hidden = document.hidden;
  let audioCtx = null;
  let raf = 0;
  let lastTime = 0;

  const sources = new Map(); // media element -> sound source
  const retryAt = new WeakMap(); // media element -> time before which play() is not retried
  const cssCache = new WeakMap(); // element -> { [prop]: last value written }

  // ---------- setup ----------

  function registerSource(el) {
    if (!(el instanceof HTMLMediaElement)) return null;
    if (sources.has(el)) return sources.get(el);
    const src = {
      el,
      id: el.id || '',
      label: el.dataset.label || el.id || el.currentSrc || 'sound',
      caption: el.dataset.caption || '',
      level: 0,
      target: 0,
      mode: null, // 'volume' | 'webaudio' | 'mute', decided when sound is first switched on
      gain: null,
    };
    el.muted = true;
    sources.set(el, src);
    return src;
  }

  // "night:0.5, fire" -> [{ source, volume }]
  function parseAudio(value) {
    if (!value) return [];
    return value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [id, vol] = part.split(':');
        const el = document.getElementById(id.trim());
        const source = registerSource(el);
        if (!source) console.warn(`[scrolly] data-audio: no <audio> or <video> with id "${id}"`);
        return source && { source, volume: vol === undefined ? 1 : clamp(parseFloat(vol)) };
      })
      .filter(Boolean);
  }

  function readVolume(value, fallback) {
    const v = parseFloat(value);
    return Number.isFinite(v) ? clamp(v) : fallback;
  }

  function prepareVideo(video) {
    video.muted = true;
    video.playsInline = true;
    video.addEventListener('loadedmetadata', schedule);
    video.addEventListener('seeked', schedule);
    // Captions are drawn by us (see updateCaptions) so the browser shouldn't draw them too.
    for (const track of video.textTracks) {
      if (track.kind === 'captions' || track.kind === 'subtitles') {
        track.mode = 'hidden';
        track.addEventListener('cuechange', schedule);
      }
    }
  }

  function setupSection(el) {
    const stage = el.querySelector('.scrolly-stage');
    const layers = [...stage.querySelectorAll('.scrolly-layer')].map((layerEl) => {
      const media = layerEl.querySelector('video, img');
      const video = media instanceof HTMLVideoElement ? media : null;
      const layer = {
        name: layerEl.dataset.layer,
        el: layerEl,
        video,
        scrub: !!video && video.hasAttribute('data-scrub'),
        steps: [],
        visible: false,
        hideAt: 0,
        scrubTime: null,
      };
      if (video) {
        prepareVideo(video);
        if (video.hasAttribute('data-sound')) registerSource(video);
      }
      return layer;
    });
    const byName = new Map(layers.map((l) => [l.name, l]));
    const sectionAudio = parseAudio(el.dataset.audio);

    let previous = layers[0] || null;
    const steps = [...el.querySelectorAll('.scrolly-step')].map((stepEl, index) => {
      // A step without data-layer keeps showing the previous step's layer.
      const layer = byName.get(stepEl.dataset.layer) || previous;
      previous = layer;
      const step = {
        el: stepEl,
        index,
        layer,
        volume: readVolume(stepEl.dataset.volume, readVolume(layer?.video?.dataset.volume, 1)),
        audio: stepEl.hasAttribute('data-audio') ? parseAudio(stepEl.dataset.audio) : sectionAudio,
        top: 0,
        bottom: 0,
      };
      layer?.steps.push(step);
      return step;
    });

    const caption = document.createElement('p');
    caption.className = 'scrolly-caption';
    caption.hidden = true;
    stage.append(caption);

    el.classList.add('is-ready');
    return { el, stage, layers, steps, active: null, presence: 0, caption, captionText: '' };
  }

  function setupInline(video) {
    prepareVideo(video);
    const source = video.hasAttribute('data-sound') ? registerSource(video) : null;
    return { el: video, source, volume: readVolume(video.dataset.volume, 1), visible: 0 };
  }

  function setupZone(el) {
    return { el, audio: parseAudio(el.dataset.audio) };
  }

  const sections = [...root.querySelectorAll('.scrolly')].map(setupSection);
  const inline = [...root.querySelectorAll('video[data-inline]')].map(setupInline);
  // Any other element with data-audio is a "sound zone": its sound plays while it's on screen.
  const zones = [...root.querySelectorAll('[data-audio]')]
    .filter((el) => !el.classList.contains('scrolly') && !el.closest('.scrolly-steps'))
    .map(setupZone);
  for (const el of root.querySelectorAll('audio[data-sound], video[data-sound]')) registerSource(el);

  // ---------- loading ----------

  function warm(el) {
    if (el.preload === 'none' || !el.preload) {
      el.preload = 'auto';
      if (el.paused && el.currentTime === 0 && el.readyState === 0) el.load();
    }
  }

  const loader = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        loader.unobserve(entry.target);
        const media = entry.target.matches('video, audio') ? [entry.target] : [...entry.target.querySelectorAll('video')];
        for (const el of media) warm(el);
        for (const z of [...sections, ...zones]) {
          if (z.el !== entry.target) continue;
          const audio = z.steps ? z.steps.flatMap((s) => s.audio) : z.audio;
          for (const a of audio) warm(a.source.el);
        }
      }
    },
    { rootMargin: opts.preloadMargin }
  );
  for (const s of sections) loader.observe(s.el);
  for (const z of zones) loader.observe(z.el);
  for (const i of inline) loader.observe(i.el);

  // ---------- sound routing ----------

  function sameOrigin(el) {
    if (el.crossOrigin) return true; // the author has promised CORS headers
    const url = el.currentSrc || el.src || el.querySelector('source')?.src;
    try {
      return !url || new URL(url, location.href).origin === location.origin;
    } catch {
      return false;
    }
  }

  function route(src) {
    if (src.mode) return;
    if (canSetVolume) {
      src.mode = 'volume';
      return;
    }
    if (AudioCtx && sameOrigin(src.el)) {
      try {
        audioCtx ||= new AudioCtx();
        const node = audioCtx.createMediaElementSource(src.el);
        src.gain = audioCtx.createGain();
        src.gain.gain.value = 0;
        node.connect(src.gain).connect(audioCtx.destination);
        src.mode = 'webaudio';
        return;
      } catch {
        // fall through
      }
    }
    src.mode = 'mute'; // no way to fade: switch on and off instead
  }

  function applyLevel(src) {
    const el = src.el;
    if (!soundOn || !src.mode) {
      el.muted = true;
      return;
    }
    if (src.mode === 'volume') {
      el.muted = false;
      el.volume = clamp(src.level);
    } else if (src.mode === 'webaudio') {
      el.muted = false;
      src.gain.gain.setTargetAtTime(src.level, audioCtx.currentTime, 0.015);
    } else {
      el.muted = src.level < 0.08;
    }
  }

  function setPlaying(el, want) {
    if (want && el.paused) {
      const now = performance.now();
      if (now < (retryAt.get(el) || 0)) return;
      const attempt = el.play();
      if (attempt) {
        attempt.catch(() => {
          retryAt.set(el, performance.now() + 2000);
          // The browser refused sound: keep the picture moving silently.
          if (el instanceof HTMLVideoElement && !el.muted) {
            el.muted = true;
            el.play().catch(() => {});
          }
        });
      }
    } else if (!want && !el.paused) {
      el.pause();
    }
  }

  // ---------- public controls ----------

  function setSound(on) {
    soundOn = !!on;
    if (soundOn) {
      if (audioCtx) audioCtx.resume?.();
      // This runs inside the click that turned sound on. Starting every source here
      // "unlocks" it, so the browser lets us play it later without another tap.
      for (const src of sources.values()) {
        route(src);
        applyLevel(src);
        const el = src.el;
        if (el.paused && !el.hasAttribute('data-scrub')) {
          el.play()
            ?.then(() => schedule())
            .catch(() => {});
        }
      }
      audioCtx?.resume?.();
    }
    html.dataset.scrollySound = soundOn ? 'on' : 'off';
    syncToggles();
    document.dispatchEvent(new CustomEvent('scrolly:sound', { detail: { on: soundOn } }));
    schedule();
  }

  function setCaptions(on) {
    captionsOn = !!on;
    store('scrolly:captions', captionsOn ? 'on' : 'off');
    for (const item of inline) {
      for (const track of item.el.textTracks) {
        if (track.kind === 'captions' || track.kind === 'subtitles') track.mode = captionsOn ? 'showing' : 'hidden';
      }
    }
    syncToggles();
    schedule();
  }

  function syncToggles() {
    for (const b of document.querySelectorAll('[data-scrolly-sound="toggle"]')) b.setAttribute('aria-pressed', String(soundOn));
    for (const b of document.querySelectorAll('[data-scrolly-captions="toggle"]')) b.setAttribute('aria-pressed', String(captionsOn));
  }

  function onClick(event) {
    const sound = event.target.closest('[data-scrolly-sound]');
    if (sound) {
      const v = sound.dataset.scrollySound;
      setSound(v === 'toggle' ? !soundOn : v === 'on');
    }
    const cc = event.target.closest('[data-scrolly-captions]');
    if (cc) {
      const v = cc.dataset.scrollyCaptions;
      setCaptions(v === 'toggle' ? !captionsOn : v === 'on');
    }
  }

  // ---------- the frame loop ----------

  function setVar(el, prop, value) {
    const v = Math.round(value * 1000) / 1000;
    let cache = cssCache.get(el);
    if (!cache) cssCache.set(el, (cache = {}));
    if (cache[prop] === v) return;
    cache[prop] = v;
    el.style.setProperty(prop, v);
  }

  function activate(section, step) {
    const previous = section.active;
    section.active = step;
    const now = performance.now();
    for (const s of section.steps) s.el.classList.toggle('is-active', s === step);
    for (const layer of section.layers) {
      const on = layer === step.layer;
      if (on) {
        layer.visible = true;
        layer.hideAt = 0;
      } else if (layer.visible) {
        layer.visible = false;
        layer.hideAt = now + opts.pauseAfter;
      }
      layer.el.classList.toggle('is-active', on);
    }
    section.el.dispatchEvent(
      new CustomEvent('scrolly:step', {
        bubbles: true,
        detail: { step: step.el, index: step.index, layer: step.layer?.name ?? null, previous: previous?.el ?? null },
      })
    );
  }

  function scrub(layer, p, dt) {
    const v = layer.video;
    if (reducedMotion) return false;
    warm(v);
    if (!v.duration || v.readyState < 1) return false; // 'loadedmetadata' will wake us
    const target = p * Math.max(0, v.duration - 0.05);
    if (layer.scrubTime === null) layer.scrubTime = target;
    layer.scrubTime += (target - layer.scrubTime) * (1 - Math.exp(-dt / 0.1));
    if (Math.abs(target - layer.scrubTime) < 0.005) layer.scrubTime = target;
    if (!v.seeking && Math.abs(v.currentTime - layer.scrubTime) > 0.01) v.currentTime = layer.scrubTime;
    return layer.scrubTime !== target;
  }

  function update(now) {
    raf = 0;
    const dt = lastTime ? Math.min(0.1, (now - lastTime) / 1000) : 1 / 60;
    lastTime = now;
    const vh = window.innerHeight;
    const triggerY = vh * opts.trigger;
    let busy = false;

    const wantVisual = new Map();
    for (const src of sources.values()) src.target = 0;
    const raise = (src, value) => {
      src.target = Math.max(src.target, value);
    };

    for (const section of sections) {
      const r = section.el.getBoundingClientRect();
      const presence = clamp(Math.min(vh - r.top, r.bottom) / vh);
      section.presence = presence;
      setVar(section.el, '--presence', presence);
      const near = r.bottom > -vh && r.top < vh * 2;

      for (const layer of section.layers) {
        if (!layer.video || layer.scrub) continue;
        const showing = layer.visible || now < layer.hideAt;
        if (now < layer.hideAt) busy = true;
        wantVisual.set(layer.video, near && presence > 0 && showing && !reducedMotion && !hidden);
      }
      if (!near) continue;

      let active = section.steps[0];
      for (const step of section.steps) {
        const sr = step.el.getBoundingClientRect();
        step.top = sr.top;
        step.bottom = sr.bottom;
        if (sr.top <= triggerY) active = step;
        setVar(step.el, '--progress', clamp((triggerY - sr.top) / (sr.height || 1)));
      }
      if (active && active !== section.active) {
        activate(section, active);
        // visibility just changed; recompute playback wishes for this section
        for (const layer of section.layers) {
          if (layer.video && !layer.scrub) wantVisual.set(layer.video, presence > 0 && (layer.visible || now < layer.hideAt) && !reducedMotion && !hidden);
        }
        busy = true;
      }

      for (const layer of section.layers) {
        if (!layer.steps.length) continue;
        const start = layer.steps[0].top;
        const end = layer.steps[layer.steps.length - 1].bottom;
        const p = clamp((triggerY - start) / (end - start || 1));
        setVar(layer.el, '--p', p);
        if (layer.scrub && layer.visible) busy = scrub(layer, p, dt) || busy;
      }

      const step = section.active;
      if (step && presence > 0) {
        const layerVideo = step.layer?.video;
        if (layerVideo && sources.has(layerVideo)) raise(sources.get(layerVideo), step.volume * presence);
        for (const a of step.audio) raise(a.source, a.volume * presence);
      }
    }

    for (const zone of zones) {
      const r = zone.el.getBoundingClientRect();
      const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      const presence = clamp(visible / Math.min(r.height || 1, vh * 0.6));
      if (presence > 0) for (const a of zone.audio) raise(a.source, a.volume * smoothstep(presence));
    }

    for (const item of inline) {
      const r = item.el.getBoundingClientRect();
      const visible = clamp((Math.min(r.bottom, vh) - Math.max(r.top, 0)) / Math.min(r.height || 1, vh));
      item.visible = visible;
      wantVisual.set(item.el, visible > 0.2 && !reducedMotion && !hidden);
      if (item.source) raise(item.source, item.volume * smoothstep(visible));
    }

    // Mix: ease every level towards its target, then start or stop the media behind it.
    const k = 1 - Math.exp(-dt / opts.fadeTime);
    let soundHere = false;
    for (const src of sources.values()) {
      src.level += (src.target - src.level) * k;
      if (Math.abs(src.target - src.level) < 0.002) src.level = src.target;
      else busy = true;
      applyLevel(src);
      if (src.target > 0.05) soundHere = true;
    }
    for (const [el, want] of wantVisual) setPlaying(el, want || audible(el));
    for (const src of sources.values()) {
      if (!wantVisual.has(src.el) && !src.el.hasAttribute('data-scrub')) setPlaying(src.el, audible(src.el));
    }

    html.toggleAttribute('data-scrolly-sound-here', soundHere);
    updateCaptions();
    if (busy) schedule();
  }

  function audible(el) {
    const src = sources.get(el);
    return !!src && soundOn && !hidden && (src.target > 0.001 || src.level > 0.002);
  }

  function cueText(video) {
    for (const track of video.textTracks) {
      if (track.kind !== 'captions' && track.kind !== 'subtitles') continue;
      const cues = track.activeCues;
      if (cues && cues.length) return [...cues].map((c) => c.text).join('\n');
      // Not playing (e.g. sound is off): describe it with its first caption instead.
      if (video.paused && track.cues?.length) return track.cues[0].text;
    }
    return video.dataset.caption || '';
  }

  function updateCaptions() {
    for (const section of sections) {
      let text = '';
      if (captionsOn && section.presence > 0.5 && section.active) {
        const lines = new Set();
        const video = section.active.layer?.video;
        if (video && sources.has(video)) lines.add(cueText(video));
        for (const a of section.active.audio) {
          if (a.source.target > 0.05) lines.add(a.source.el instanceof HTMLVideoElement ? cueText(a.source.el) : a.source.caption);
        }
        lines.delete('');
        text = [...lines].join('\n');
      }
      if (text !== section.captionText) {
        section.captionText = text;
        section.caption.textContent = text;
        section.caption.hidden = !text;
      }
    }
  }

  function schedule() {
    if (!raf) raf = requestAnimationFrame(update);
  }

  // ---------- wiring ----------

  const onVisibility = () => {
    hidden = document.hidden;
    schedule();
  };
  const onMotion = () => {
    reducedMotion = motionQuery.matches;
    schedule();
  };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  document.addEventListener('visibilitychange', onVisibility);
  motionQuery.addEventListener('change', onMotion);
  document.addEventListener('click', onClick);

  html.dataset.scrollySound = 'off';
  setCaptions(captionsOn);
  schedule();

  return {
    setSound,
    setCaptions,
    get sound() {
      return soundOn;
    },
    get captions() {
      return captionsOn;
    },
    refresh: schedule,
    /** A snapshot of what's on screen and what's playing, for debugging or a custom UI. */
    state() {
      return {
        sound: soundOn,
        captions: captionsOn,
        sections: sections.map((s) => ({
          id: s.el.id,
          presence: s.presence,
          step: s.active ? s.active.index : -1,
          steps: s.steps.length,
          layer: s.active?.layer?.name ?? null,
        })),
        sources: [...sources.values()].map((s) => ({
          id: s.id,
          label: s.label,
          level: s.level,
          target: s.target,
          playing: !s.el.paused,
          mode: s.mode,
        })),
      };
    },
    destroy() {
      cancelAnimationFrame(raf);
      loader.disconnect();
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', onVisibility);
      motionQuery.removeEventListener('change', onMotion);
      document.removeEventListener('click', onClick);
      for (const src of sources.values()) src.el.pause();
      for (const item of inline) item.el.pause();
    },
  };
}
