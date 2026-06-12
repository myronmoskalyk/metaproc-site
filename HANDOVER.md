# metaproc-site — Handover

**State (2026-06-12):** site fully rethemed to the locked **"Orbital"** brand
(`metaproc-deploy/design/BRAND.md`; reference mockup
`metaproc-deploy/design/portal-proposal/mockup-g-orbital-final.html`): warm-light default +
deep-dusk mood toggle in the header (localStorage `mp-site-mood`, applied pre-paint, honours
`prefers-color-scheme` on first visit), glass header (only glass surface), edge-lit panels with
amber HUD brackets, AA-safe teal CTA gradient with ripple + press punch, hero rise/shine + a
CSS-only launch-core ring miniature, forest-plot hero recoloured to the teal/amber plot palette,
Starlight docs mapped to Orbital in both of its modes, teal forest-plot favicon + regenerated
512px Auth0 logo PNG (`public/brand/metaproc-logo.png`). `npm run build` green.
Post-retheme gates re-run 2026-06-12: **axe 0 violations on all 11 pages** (after fixing a
latent CTA-text-colour specificity bug + underlining in-text links); Lighthouse
**/** 99/100/100/100 (LCP 1.81 s, CLS 0) · **/features** 99/100/100/100 (LCP 1.96 s, CLS 0).

**Remaining before public:**
1. **Recapture proof assets** — all current captures show the **old violet app UI**
   (stale — recapture pending, after the app repo is rethemed to Orbital):
   `src/assets/proof/hero-app-overview.png`, `workflow-store.png`, `plots-studio.png`,
   `report-builder.png`, `grade-sof.png`, `code-panel.png`, `demo.webm`, `demo-poster.png`.
2. **Re-run quality gates** (Lighthouse + axe) after recapture — no npm script exists;
   use the devDependency CLIs against `astro preview` as on 2026-06-11.
3. **H6 — Myron's copy approval** (privacy/ToS draft banners stay until then).
4. **Stage 8 — deploy hooks**: real domain in `astro.config.mjs` (`SITE`), Cloudflare Workers
   static-assets deploy, Cloudflare Web Analytics token in `BaseLayout.astro`, `/download`
   un-gating (public repo + tag match, GPL §6), and an **H.264 MP4 fallback** for
   `src/assets/proof/demo.webm` (needs full ffmpeg — Playwright's bundled build decodes VP8
   but can't encode H.264; see HTML comment next to the `<video>` in `src/pages/features.astro`).

**Nice-to-have (not blocking):** the docs Quickstart still uses `placeholder.svg` (now
Orbital-tinted) in 5 markdown image slots — fill with real shots at recapture.

**Standing rules:**
- Brand source of truth: `metaproc-deploy/design/BRAND.md` (+ app `R/app_theme.R`). Derived
  shades documented in README ("Rules"): CTA gradient `#0B8170 → #0A7A68` (white text ≥4.5:1).
  Accessibility floor per BRAND §9: computed AA, 2px partner-accent `:focus-visible` (the
  `-deep` coral variant in warm light for ≥3:1), reduced-motion kills every animation/transition.
- Mood toggles are **not unified**: marketing pages use `mp-site-mood` (`light`/`dusk` on
  `<html data-theme>`), Starlight keeps `starlight-theme` (`light`/`dark`/`auto`). Unifying
  would mean swizzling Starlight's ThemeSelect component + reconciling 3-state vs 2-state
  storage — judged non-trivial, deliberately left as two controls. `[data-theme="dark"]`
  (Starlight) also flips the `--mp-*` tokens so shared chrome (focus ring, skip link) matches.
- One CTA ("Launch MetaProc free"); engine names demoted to a credibility row.
- `/download` gated on public repo + tag match (GPL §6). No `/pricing` page (D5 beta copy).
- Privacy/ToS copy is DRAFT until Myron approves (H6).
- `src/content/docs/docs/manual.md` is generated — never hand-edit; re-run
  `node scripts/sync-docs.mjs`. (It still describes the violet app theme — it will pick up
  Orbital automatically when the app repo is rethemed and the sync re-runs.)
- Plan of record: wiki note "MetaProc — Phase 11 Plan — SaaS & Website"; execution plan:
  C:\Users\myron\.claude\plans\mellow-hatching-bear.md
