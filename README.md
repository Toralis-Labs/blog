# Scrolly

A small framework for stories that move between text, pictures, video and sound as you scroll, with no breaks between them. One script, one stylesheet, no dependencies and no build step.

`index.html` is a working demo: **Low Tide**, a short story with a sunset you scrub through, surf that rises under the text, and a fire you hear before you see it.

## Run the demo

Any static server works, but it needs to support byte-range requests so video can seek:

```sh
npx http-server -c-1 .
# then open http://localhost:8080
```

Opening `index.html` straight from disk won't work, because browsers block ES modules on `file://`.

## How it works

Each scene is a `.scrolly` section with two parts:

- a **stage** that pins to the screen and holds the pictures and videos (the "layers"), and
- a list of **steps**, the blocks of text that scroll over the stage.

As each step crosses the middle of the screen it becomes active and shows its layer. Every frame, the script works out which sounds should be audible and how loud, and eases each one towards that level. Sound is tied to scroll position, not a timeline, so scrolling back works just as well as scrolling forward.

```html
<link rel="stylesheet" href="scrolly/scrolly.css">
<script type="module">
  import { createStory } from './scrolly/scrolly.js';
  const story = createStory();
</script>

<section class="scrolly" data-enter="grow">
  <div class="scrolly-stage">
    <div class="scrolly-layer" data-layer="beach">
      <img src="beach.jpg" alt="…" data-zoom>
    </div>
    <div class="scrolly-layer" data-layer="surf">
      <video id="surf" data-sound loop muted playsinline preload="none" poster="surf.jpg">
        <source src="surf.mp4" type="video/mp4">
        <track kind="captions" src="surf.vtt" srclang="en">
      </video>
    </div>
  </div>
  <div class="scrolly-steps">
    <div class="scrolly-step" data-layer="beach">
      <div class="scrolly-card"><p>Text over the picture.</p></div>
    </div>
    <div class="scrolly-step" data-layer="surf" data-volume="0.4" data-align="right">
      <div class="scrolly-card"><p>Text over the video, with its sound turned down.</p></div>
    </div>
  </div>
</section>
```

## Attributes

| Attribute | Goes on | What it does |
| --- | --- | --- |
| `class="scrolly"` | section | Pins a full-screen stage while its steps scroll over it. |
| `data-layer="name"` | `.scrolly-layer`, `.scrolly-step` | Names a layer, and picks which layer a step shows. A step without one keeps the previous step's layer. |
| `data-sound` | `<video>`, `<audio>` | Makes the media audible once the reader turns sound on. |
| `data-volume="0.4"` | step, layer video, inline video | Level from 0 to 1. On a step it overrides the layer video's default. |
| `data-audio="id:0.5, id2"` | section, step, any other element | Plays other sound sources by element id while it's on screen. On a section it's the default for its steps; on a step it replaces that default. On any other element (a paragraph, a `<div>` of text) it's a **sound zone**: the sound fades with how much of the element is visible. |
| `data-zoom` | `<img>`/`<video>` in a layer | Pushes in as you scroll through the layer's steps. Tune with `--zoom` (amount, default `0.15`) and `--zoom-origin`. |
| `data-scrub` | `<video>` in a layer | Scroll position sets the playhead. Encode with frequent keyframes (e.g. `ffmpeg -g 2`) so seeking is smooth. |
| `data-inline` | `<video>` in the text | Plays while at least 20% is on screen. With `data-sound`, its volume follows how much is visible. |
| `data-enter="grow"` | section | The stage opens from a framed picture to full screen as it arrives, and closes as it leaves. |
| `data-align="right"` / `"center"` | step | Card position. Default is left. |
| `data-caption="…"` | `<audio>` | Caption shown while it's audible. Videos use a `<track kind="captions">` file. |
| `data-label="…"` | `<video>`, `<audio>` | Name shown in `story.state()` (the demo's mixer panel uses it). |

### Controls

Put these on any button and the script handles the click:

- `data-scrolly-sound="on" | "off" | "toggle"`
- `data-scrolly-captions="on" | "off" | "toggle"`

Toggle buttons get `aria-pressed` kept in sync. The script also sets `data-scrolly-sound="on|off"` on `<html>`, plus `data-scrolly-sound-here` whenever something on screen has sound. The demo uses that to nudge the sound button while sound is off.

### CSS hooks

The script writes these custom properties, so you can drive your own effects from scroll position:

- `--presence` on each section: 0 off screen, 1 when the stage fills the screen.
- `--p` on each layer: 0 to 1 across the steps that show it.
- `--progress` on each step: 0 to 1 as it passes the trigger line.

The defaults can be restyled with `--scrolly-stage-bg`, `--scrolly-card-bg`, `--scrolly-card-fg`, `--scrolly-veil`, `--scrolly-fade`, `--scrolly-gutter` and the caption colours.

### JavaScript API

```js
const story = createStory({ trigger: 0.5, fadeTime: 0.35 });

story.setSound(true);  // call from a click: browsers only allow sound after the reader interacts
story.setCaptions(true);
story.state();         // { sound, captions, sections: [...], sources: [{ id, level, target, playing }] }
story.refresh();       // re-measure after changing the page
story.destroy();

document.addEventListener('scrolly:step', (e) => console.log(e.detail)); // { step, index, layer, previous }
document.addEventListener('scrolly:sound', (e) => console.log(e.detail.on));
```

## Sound, browsers and phones

- **Nothing makes a sound until the reader asks.** Browsers block autoplay with sound, so videos start muted and the script waits for a click on a `data-scrolly-sound` button. That click also "unlocks" every sound source on iOS, so later fades work without another tap.
- **Fades.** Desktop and Android fade with `element.volume`. iOS ignores that, so there the script routes same-origin media through Web Audio. Media from another origin needs CORS headers and a `crossorigin` attribute for this. Without them it switches the sound on and off instead of fading.
- **Formats.** Give each video an MP4 (H.264/AAC) source for Safari and iOS. A WebM (VP9/Opus) source as well covers browsers built without H.264. MP3 works everywhere for audio-only tracks.
- **Reduced motion.** With `prefers-reduced-motion`, videos show their poster instead of playing, scrubbing and zooms are off, and the grow effect is off. Sound still works if the reader turns it on.
- **Background tabs.** Everything pauses when the tab is hidden and resumes when it's back.

## Demo media

Everything in `media/` was generated for this demo. The pictures were drawn with canvas code and the sounds were synthesised with ffmpeg. Swap the `src` attributes for real footage. Sound loops work best when the clip's last frame flows into its first.
