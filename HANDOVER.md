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
Post-retheme gates 2026-06-12: **axe 0 violations on all 11 pages in BOTH moods** — verified
in-page across every route under `prefers-color-scheme: light` *and* `dark`. (The first
post-retheme run only exercised deep dusk, because the test host was in OS dark mode; that
missed a warm-light-only regression where the `--mp-link` text token `#0A7A68` measured
4.38–4.48:1 on tinted surfaces — below AA. Fixed by deepening the warm-light link/eyebrow
text token to `#097264`; see PROJECT_LOG.) Lighthouse **/** 99/100/100/100 (LCP 1.81 s, CLS 0)
· **/features** 99/100/100/100 (LCP 1.96 s, CLS 0).

**Premium overhaul 2026-06-13 (commits d4768c4, f45c0b6, e4a7489):** every section below the
hero and all 6 content pages + the footer are now rebuilt to the hero's bar. Homepage de-boxed
into 6+ distinct layout families (timeline / asymmetric bento / offset glass band / editorial
numbered stack / dark hairline-row methods / two-column docs+FAQ); footer is a brand block +
grouped hairline nav; `PageLayout` carries a brand rule, accent-barred headings, reshaped
hairline-enclosure tables, tertiary code and `.mp-reveal`; `features.astro` is numbered editorial
groups + framed shots + a 2-col accent feature grid. Every em-dash and separator en-dash is gone
from all visible copy (rendered marketing HTML = 0; only the out-of-scope `content/docs/**` still
has them). Role-locked accents applied throughout (amber active, violet/coral secondary, electric
blue/sky data+links+focus), each at its computed AA tier. Gates re-run: **build green (11 pages);
in-page axe 0 violations, all rules, both moods, all 7 marketing routes** (the authoritative
gate); Lighthouse **/** 100/100 perf+a11y (LCP 1.7 s, CLS 0), **/features** 99/100 (LCP 1.8 s,
CLS 0). The `@axe-core/cli` selenium runner still over-reports `color-contrast` on aurora-backed
text in both the baseline and now (chromedriver over-samples the gradient); the in-page method
and computed worst-case both pass. See the PROJECT_LOG redesign entry.

**Remaining before public:**
1. **Recapture proof assets** — **DONE 2026-06-13** for the six screenshots + the poster
   frame: `src/assets/proof/hero-app-overview.png`, `workflow-store.png`, `plots-studio.png`,
   `report-builder.png`, `grade-sof.png`, `code-panel.png`, `demo-poster.png` all now show the
   **Orbital** teal/amber app (light mode), recaptured from the native app on 127.0.0.1:7991
   (Playwright, same content/views and exact dimensions as before — 3200×2000 shots, 1600×1000
   poster). Harness lives in `e2e/recapture/` (Rscript path fixed to the R-4.5.1 install present
   on this box; deploy-repo harness was *not* modified). **Still stale: `demo.webm`** — the demo
   VIDEO still shows the violet UI; recapturing it is a **Stage-8 follow-up** (see Stage 8 below).
   Its current poster (`demo-poster.png`) is fresh, so the /features hero frame is Orbital even
   though the clip behind it is not yet.
2. **Re-run quality gates** (Lighthouse + axe) after recapture — no npm script exists;
   use the devDependency CLIs against `astro preview` as on 2026-06-11.
3. **H6 — Myron's copy approval** (privacy/ToS draft banners stay until then).
4. **Stage 8 — deploy hooks**: real domain in `astro.config.mjs` (`SITE`), Cloudflare Workers
   static-assets deploy, Cloudflare Web Analytics token in `BaseLayout.astro`, `/download`
   un-gating (public repo + tag match, GPL §6), and an **H.264 MP4 fallback** for
   `src/assets/proof/demo.webm` (needs full ffmpeg — Playwright's bundled build decodes VP8
   but can't encode H.264; see HTML comment next to the `<video>` in `src/pages/features.astro`).
   **Also recapture `demo.webm` in the Orbital UI** (out of scope for the 2026-06-13 screenshot
   refresh — the clip still shows the violet app). Do it alongside the H.264 encode so the WebM
   and the MP4 fallback are produced from the same fresh Orbital recording; the poster is already
   Orbital. The `e2e/recapture/` harness boots the app the same way the old video capture did.

**Nice-to-have (not blocking):** the docs Quickstart still uses `placeholder.svg` (now
Orbital-tinted) in 5 markdown image slots — fill with real Orbital shots when convenient
(these were *out of scope* for the 2026-06-13 screenshot refresh, which only covered the
home/features proof assets). The `e2e/recapture/` harness can capture the Data / Templates /
forest+code / GRADE / Report views these slots want.

**Standing rules:**
- Brand source of truth: `metaproc-deploy/design/BRAND.md` (+ app `R/app_theme.R`). Derived
  shades documented in README ("Rules"): CTA gradient `#0B8170 → #0A7A68` (white text ≥4.5:1)
  and warm-light link/eyebrow text token `#097264` (brand-deep `#0A7A68` as text is only
  4.38–4.48:1 on tinted surfaces). When checking AA, test BOTH moods — the warm-light default
  and deep dusk resolve different tokens on different canvases.
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
