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

- Brand: violet `#7C3AED`, blue `#2563EB`, Inter + IBM Plex Mono (tokens from app `R/app_theme.R`).
- Gates: Lighthouse ≥ 95 ×4, LCP < 2 s, CLS ≈ 0, WCAG 2.2 AA, reduced-motion fallbacks.
- `/download` renders only when the public source repo + matching release tag exist (GPL §6).
- No `/pricing` page until a real number exists — "Free while in beta" copy only (D5).
