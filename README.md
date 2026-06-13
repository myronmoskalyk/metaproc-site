# metaproc-site

Public marketing + documentation website for [MetaProc](https://github.com/myronmoskalyk/metaproc) —
button-driven, reproducible meta-analysis in the browser.

**Stack:** Astro 6 + Starlight (docs) + Tailwind v4. Deployed free on Cloudflare (Workers static
assets) at Stage 8; until then, local preview only (`npm run dev` → http://localhost:4321).

## Layout

```
src/pages/              landing, /features, /methods, /privacy, /license, /download (gated), /changelog
src/content/docs/       Starlight docs — hand-written Quickstart + synced manual/glossary
src/assets/proof/       real UI screenshots + 60–90 s demo video (captured from the running app)
scripts/sync-docs.*     one-way sync from the app repo (PRODUCT_MANUAL.md, fct_manual.R, fct_glossary.R)
                        with a desktop-only filter — never hand-edit synced copies
```

## Rules

- Brand: **"Orbital"** (locked 2026-06-12, revised 2026-06-13) — source of truth
  `metaproc-deploy/design/BRAND.md`, mirrored in the app's `R/app_theme.R`. Teal→emerald
  gradient `#11C7B4 → #11B981`, AA-safe deep `#0A7A68`; **three** accents per mood (amber +
  coral + sky in warm light, amber + violet + electric-blue in deep dusk); **Geist + Geist
  Mono** (self-hosted). Marketing default is warm light with a deep-dusk
  toggle in the header (`mp-site-mood`); Starlight keeps its own light/dark toggle.
  Derived shades (documented per BRAND.md §1): CTA gradient `#0B8170 → #0A7A68` — brand-deep
  nudged ≤4% toward brand so white CTA text stays ≥4.5:1 across the surface; warm-light link/
  eyebrow **text** token `#097264` — brand-deep deepened one notch because `#0A7A68` text only
  reaches 4.38–4.48:1 on the tinted surfaces it lands on (footer tint, download banner) once
  aurora compositing is counted (buttons/gradients keep `#0A7A68`, where white-on passes);
  warm-light **muted body** token `#525F6D` (BRAND §3 lists `#5B6877`) - deepened because the
  drifting aurora tints local backgrounds green enough (~`#E3EDE5`) that small antialiased muted
  text composited 4.27-4.47:1 on the tinted tour band and the footer; `#525F6D` computes >=5.4:1
  there, 5.7:1 on canvas, 6.4:1 on panels (dusk muted `#9DB0C3` unchanged, already AA).
- Gates: Lighthouse ≥ 95 ×4, LCP < 2 s, CLS ≈ 0, WCAG 2.2 AA, reduced-motion fallbacks.
- **Proof assets are stale — recapture pending:** every screenshot in `src/assets/proof/`
  plus `demo.webm`/`demo-poster.png` still shows the violet-era app UI. Recapture happens
  after the app itself is rethemed to Orbital (later stage) — do not recapture before that.
- `/download` renders only when the public source repo + matching release tag exist (GPL §6).
- No `/pricing` page until a real number exists — "Free while in beta" copy only (D5).

## Theming

**Every colour lives in one place: `src/styles/global.css`.** The whole site is themed
from a single central token set, so editing those variables re-themes the entire site —
no component or page `<style>` block contains a raw colour literal. The conceptual palette
(roles, hexes, AA reasoning) is `metaproc-deploy/design/BRAND.md`; this file is its runtime
expression.

Colour literals (`#hex`, `rgb()/rgba()`, etc.) appear in exactly three kinds of block in
`global.css` and nowhere else:

- **`:root`** — the **warm-light** mood (the marketing default) plus the mood-independent
  core (brand, gradient, code-panel anchor, on-dark text, inner-highlight whites).
- **`:root[data-theme='dusk']`** — the **deep-dusk** mood. It overrides the same token names
  with their dusk values; flipping `data-theme` on `<html>` swaps the whole palette. (The
  `[data-theme='dark']`/`[data-theme='light']` blocks do the equivalent for Starlight's own
  docs toggle.)
- **`:root[data-theme-preset='<id>']`** (+ its `[data-theme='dusk']` pairing) — the **runtime
  theme presets** (Indigo, Ember, …). Each restates only the SEED tokens for that palette;
  surfaces re-derive. See "Runtime theme presets + the picker" below.
- **`@theme`** — Tailwind v4's static utility mirror (it needs literal values at build time;
  it cannot read `var()`). These duplicate a few `:root` brand colours so `bg-brand` etc.
  exist as utilities. They are currently unused by the markup, kept only as the Tailwind hook.

To re-theme, edit the tokens in `:root` (light) and `:root[data-theme='dusk']` (dusk). The
token groups:

| Group | Tokens |
|---|---|
| **Brand** | `--mp-g1` `--mp-g2` (gradient stops), `--mp-brand`, `--mp-brand-deep`, `--mp-grad`, `--mp-grad-cta`, `--mp-cta-light-fg` (white-button text, always the dark AA-on-white value) |
| **Accents** (3 per mood, role-locked) | `--mp-accent`/`-deep` (amber = active), `--mp-accent2`/`-deep` (coral · violet = secondary), `--mp-accent3`/`-deep` (sky · electric-blue = data/links/focus), plus `--mp-on-accent*` |
| **Surfaces** | `--mp-canvas`, `--mp-panel`, `--mp-cap`, `--mp-glass`, `--mp-tint`, `--mp-bg-teal/-emer/-acc`, and the always-dark code panel `--mp-code-bg`/`-bg2`/`-fg`/`-edge` |
| **Ink / muted / link** | `--mp-ink`, `--mp-muted`, `--mp-link`/`-hover`; plus the on-dark trio `--mp-on-brand`, `--mp-ink-on-dark`, `--mp-muted-on-dark`, `--mp-faint-on-dark` |
| **Edges / glow** | `--mp-edge`, `--mp-hair`, `--mp-glow`, `--mp-aglow`/`-aglow2`, `--mp-shadow-panel`, the `--mp-hi-*` inner-highlight whites, `--mp-focus`, `--mp-tshine`/`-tshadow`, `--mp-mask` (mask shape, not a rendered colour) |

AA is computed, not eyeballed (BRAND §9). Several tokens are deliberately deepened past
the BRAND table for AA on the drifting-aurora composite (documented per BRAND §1's
derive-and-document rule): warm-light link/eyebrow text `#097264`, muted body `#525F6D`,
the CTA-gradient pair `#0B8170 → #0A7A68`, and `--mp-accent3-deep #0369A1` (sky text) — the
brighter `#38BDF8` sky / `#4DA3FF` electric-blue stay decorative/data only.

### Runtime theme presets + the picker

On top of the locked **Orbital** identity, a visitor can switch the **whole site** between
**18 preset palettes** plus a live **Custom** option, via a compact picker in the header (the
swatch button next to the mood toggle). The 18 presets are the shared spec in
`metaproc-deploy/design/themes.md` — the app uses the same seeds, so the site and the app
render identical themes. Presets are a web-mode user layer; the default stays **Orbital**.

**Two orthogonal axes.** `data-theme` on `<html>` is the **mood** (light vs dusk, owned by the
mood toggle, also `dark`/`light` for Starlight). `data-theme-preset` on `<html>` is the
**palette** (the active preset). They compose: the mood toggle switches the light/dusk variant
*within* the active preset.

**A preset is just seed overrides.** Because every surface (panels, glass, edges, glow, tints,
shadows) already derives from `brand` + `canvas` via `color-mix`, a preset only needs to
restate the SEED tokens — `--mp-g1`/`--mp-g2`, `--mp-brand`/`-deep`, `--mp-canvas`, `--mp-ink`,
`--mp-muted`, `--mp-link`/`-hover`, the three accents + `-deep` + `--mp-on-accent*`, plus
`--mp-plot-teal` / `--mp-code-fg` / `--mp-cta-light-fg`. Everything else re-derives. The blocks
live in `global.css` under `:root[data-theme-preset="<id>"]` (light seeds) and
`:root[data-theme-preset="<id>"][data-theme="dusk"]` (dusk seeds). **Orbital has no block** —
selecting it removes the attribute so the locked `:root` base wins (its rendered values, incl.
golden, never change).

| Preset | Light brand | Preset | Light brand |
|---|---|---|---|
| **Orbital** (default) | teal → emerald | **Crimson** | deep red → rose |
| **Indigo** | blue-violet | **Nord** | arctic blue-grey |
| **Ember** | coral → amber | **Dracula** | purple → pink |
| **Forest** | canopy green | **Solarized** | petrol → cyan |
| **Royal** | violet → magenta | **Catppuccin** | mauve → blue |
| **Graphite** | slate + electric blue | **Tokyo Night** | blue → violet |
| **Ocean** | azure → cyan | **Gruvbox** | retro orange |
| **Rose** | blush → magenta | **One Dark** | editor blue → cyan |
| **Atelier** | bronze → gold | **Rosé Pine** | muted rose → gold |

The first 10 are the original palettes; presets 11–18 (**Nord, Dracula, Solarized, Catppuccin,
Tokyo Night, Gruvbox, One Dark, Rosé Pine**) are premium takes on familiar editor themes, each
keeping its own dusk canvas (Nord slate, Tokyo Night deep blue, Solarized petrol, Gruvbox
warm-charcoal, …) so the dark background changes per theme.

The seeds match `themes.md` **exactly**. Per-theme, the text-bearing tokens (`brand-deep`, each
`accent*-deep`, `link`, `muted`) are computed for WCAG AA on that theme's canvas/panels and the
worst-case drifting-aurora composite, then **auto-deepened** until they clear 4.5:1 (3:1 for
accents used only on lines/borders/icons). Several seeds measured below 4.5:1 on their own
canvas/aurora and were deepened (light, toward black) or lightened (dusk, toward white), as
`themes.md` explicitly allows: light `brand-deep` Ember `#C2410C→#B63D0B`, Forest
`#2B7A2B→#287328`, Ocean `#0E7490→#0D6D87`, Atelier `#92600E→#895A0D`, Solarized
`#1E6FA8→#1C689E`; dusk `accent2` Nord `#B48EAD→#B995B2`, Solarized `#D33682→#DF6BA3`, Gruvbox
`#FB4934→#FC6856`; dusk `link` Solarized `#268BD2→#4EA1DA`; dusk `muted` Nord `#95A9B9→#99ACBC`
(the last two lifted to clear the in-page axe measurement on tinted panels). One mood-independent helper,
`--mp-cta-light-fg`, exists because `.mp-cta--light` is a white button on the always-dark code
band in *both* moods, so its text must stay the dark AA-on-white value even in dusk (where a
theme's `--mp-brand-deep` goes light for the dark canvas).

**Custom.** The picker's Custom entry exposes colour inputs for the brand `g1`/`g2` + the 3
accents; `src/scripts/theme.ts` derives the rest (brand, brand-deep, canvas, ink, muted, link,
accent `-deep`, `on-accent`) and **auto-deepens text for AA** on the chosen canvas, writing the
result as inline custom properties on `<html>` (inline wins over the preset blocks). It persists
as a JSON blob (`mp-site-theme-custom`).

**Persistence + no flash.** The active preset persists in `localStorage` under `mp-site-theme`
(+ the custom blob), and is applied **before first paint** by the inline script in
`BaseLayout.astro` (which already set the mood) — it sets `data-theme-preset` (or, for custom,
writes the derived inline vars). The picker UI is `src/components/ThemePicker.astro` (a real
`<button>` trigger + a `role="radio"` swatch grid + the custom form; keyboard + focus-visible).

**To add a preset:** (1) add a light + dusk seed-override block in `global.css` (copy an
existing pair, set the 7 light seeds + link/muted, and the dusk seeds); (2) run
`node e2e/theme-aa.mjs` to compute/deepen the `-deep`/`link`/`muted` text tokens and paste the
AA values in; (3) add the preset to `PRESETS` in `ThemePicker.astro` (id, label, gradient stops,
3 accent dots) so a swatch renders; (4) mirror it in the app's `metaproc_palette()` so both
surfaces match (`themes.md`); (5) re-run `npm run build`, `node e2e/verify-seeds.mjs` (seeds
match `themes.md`), and `node e2e/axe-themes.mjs` (in-page axe, both moods).
