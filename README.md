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

- Brand: **"Orbital"** (locked 2026-06-12) — source of truth `metaproc-deploy/design/BRAND.md`,
  mirrored in the app's `R/app_theme.R`. Teal→emerald gradient `#11C7B4 → #11B981`,
  AA-safe deep `#0A7A68`; two accents per mood (amber + coral in warm light, amber + violet
  in deep dusk); Inter + IBM Plex Mono. Marketing default is warm light with a deep-dusk
  toggle in the header (`mp-site-mood`); Starlight keeps its own light/dark toggle.
  Derived shades (documented per BRAND.md §1): CTA gradient `#0B8170 → #0A7A68` — brand-deep
  nudged ≤4% toward brand so white CTA text stays ≥4.5:1 across the surface; warm-light link/
  eyebrow **text** token `#097264` — brand-deep deepened one notch because `#0A7A68` text only
  reaches 4.38–4.48:1 on the tinted surfaces it lands on (footer tint, download banner) once
  aurora compositing is counted (buttons/gradients keep `#0A7A68`, where white-on passes).
- Gates: Lighthouse ≥ 95 ×4, LCP < 2 s, CLS ≈ 0, WCAG 2.2 AA, reduced-motion fallbacks.
- **Proof assets are stale — recapture pending:** every screenshot in `src/assets/proof/`
  plus `demo.webm`/`demo-poster.png` still shows the violet-era app UI. Recapture happens
  after the app itself is rethemed to Orbital (later stage) — do not recapture before that.
- `/download` renders only when the public source repo + matching release tag exist (GPL §6).
- No `/pricing` page until a real number exists — "Free while in beta" copy only (D5).
