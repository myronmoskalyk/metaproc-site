# metaproc-site — Project Log

Append-only log. Newest at the bottom.

| Fact | Value |
|---|---|
| Purpose | Public marketing + docs site for MetaProc (Astro 6 + Starlight + Tailwind 4) |
| Plan of record | Wiki note "MetaProc — Phase 11 Plan — SaaS & Website" (Stage 7) |
| Hosting | Cloudflare Workers static assets (Stage 8); local preview until then |
| Quality gates | Lighthouse ≥95 ×4 · LCP <2 s · CLS ≈0 · WCAG 2.2 AA · proof assets before public |

---

## [2026-06-11] setup | Repo created (Phase 11 Stage 0.5)
Initialized site repo at C:\dev\metaproc-site (outside OneDrive per plan).
Scaffolded README, .gitignore, PROJECT_LOG, HANDOVER.

## [2026-06-11] qa | Quality gates run (Lighthouse + axe) — all gates met
Lighthouse (headless Chrome, built dist via `astro preview`):
- **/** before: 100/100/100/100, LCP 1.5 s, CLS 0 → after: same (100 ×4, LCP 1.51 s, CLS 0).
- **/features** 100/100/100/100, LCP 1.36 s, CLS 0.
- **/docs/quickstart/** before: Perf 100 / **A11y 96** / BP 100 / SEO 100 → after: 100 ×4, LCP 1.44 s, CLS 0.
axe-core 4.11 (10 pages: all 7 marketing + 3 docs): 6 violations found → all fixed/resolved, 0 remaining.
Fixed:
- `link-in-text-block` (5 links on /docs/quickstart/ + /docs/web-vs-desktop/): Starlight prose links relied on colour alone — added underline rule for `.sl-markdown-content` links in `src/styles/global.css`.
- `empty-table-header` (/docs/web-vs-desktop/): first header cell of the comparison table was empty — now "Aspect" (`src/content/docs/docs/web-vs-desktop.md`).
Not a defect (verified): `scrollable-region-focusable` on /docs/manual/ `<pre>` is an axe timing race — Expressive Code's runtime script adds `tabindex="0"`/`role="region"` to scrollable code blocks ~250 ms after load; axe passes with `--load-delay 1000`.
Known non-blocking: Lighthouse "render-blocking" insight on / (~460 ms est., the CSS bundle) — Perf already 100, LCP well under 2 s; not worth inlining critical CSS. Proof screenshots still placeholders (Stage 4) — re-run perf gates after real images land.
Tooling: added `lighthouse` + `@axe-core/cli` as devDependencies; reports under `lighthouse-report/` (gitignored).

## [2026-06-11] build | Stage 7 final assembly — real proof assets wired, gates re-run, green
Replaced every placeholder proof slot with the six real 3200×2000 screenshots from the live
containerized app (`src/assets/proof/`): rewrote `ProofAsset.astro` around astro:assets
`<Picture>` (AVIF + WebP, widths 480/800/1200/1600 — full-width slots up to 2000 — srcset +
sizes, explicit dimensions, `loading="lazy"` everywhere; 0.8–1.6 MB PNGs emit 20–190 kB
variants at build). Index: 5-shot workspace tour + hero-app-overview under How-it-works +
"See it run" teaser → /features#demo; hero stays image-free (animated SVG; LCP element is
still the hero h1). Features: 73 s demo.webm embedded at top (`<video controls preload="none">`,
1600×1000, MP4/H.264 fallback deferred to Stage 8 — noted in an HTML comment next to the
element), poster frame extracted at 12 s via Playwright-bundled ffmpeg (VP8 decode → PNG →
960w WebP, 33 kB, head-preloaded with `fetchpriority=high` through a new named `head` slot in
Base/PageLayout), silent-video captions track added (`public/media/demo-captions.vtt`); groups
restructured to real shots + honest capability lists; stale "placeholders arrive in Stage 4"
copy removed.
Measured (headless Chrome, `astro preview` of built dist):
- **/** 99 / 100 / 100 / 100 · LCP 1.8 s · CLS 0
- **/features** 100 / 100 / 100 / 100 · LCP 1.9 s · CLS 0
(First /features run was LCP 2.2 s — the un-prioritized poster; fixed by the 960w poster +
preload.) axe: 0 violations on both pages. Re-ran `scripts/sync-docs.mjs` (manual re-synced
from app repo @ 2026-05-31 review, GPL notices included). Deferred: H.264 MP4 fallback
(Stage 8, full ffmpeg) · quickstart docs still use `placeholder.svg` in 5 markdown slots
(out of Stage 7 scope; 3–4 real shots could fill them).

## [2026-06-12] build | Orbital retheme — full visual overhaul to the locked brand
Rethemed the whole site from the violet palette to **"Orbital"** (locked 2026-06-12; source of
truth `metaproc-deploy/design/BRAND.md`, reference mockup
`design/portal-proposal/mockup-g-orbital-final.html` — motion language reused verbatim).
- **Tokens** (`src/styles/global.css`): warm-light default + deep-dusk mood via
  `[data-theme="dusk"]`; per-mood accents exactly per BRAND §2 (amber+coral light,
  amber+violet dusk); tinted canvas `#F3F0E9`/`#060A11` with two drifting aurora layers;
  shared Orbital components (edge-lit `.mp-panel`, AA-safe `.mp-cta`, ripple, shine, rise);
  approved keyframes only; global reduced-motion kill (every animation + transition).
- **Mood toggle**: accessible moon/sun button in the header (`aria-pressed` + labels),
  persisted under `mp-site-mood`, applied before first paint by an inline head script,
  `prefers-color-scheme` honoured on first visit.
- **Sweep**: Header (glass chrome + forest-plot logo tile), Footer, index (hero rise/shine,
  CSS-only launch-core ring miniature, bracketed step/audience panels, dark code-anchor
  Methods band), ForestPlot (teal series + amber pooled diamond, per-mood contrast ≥3:1
  computed), ProofAsset (hover lift + brand glow), PageLayout (token banners/prose/tables),
  features, changelog, placeholder.svg retinted. Shared `.mp-cta` moved from index-scoped
  CSS to global (header CTA on subpages was previously unstyled there).
- **Starlight**: both docs modes mapped to Orbital via `--sl-*` props (teal accent triplet,
  dusk/warm surfaces, Inter/IBM Plex Mono); Starlight's own toggle remains the docs mode
  control — NOT unified with the marketing toggle (different storage keys/state models;
  would require swizzling ThemeSelect).
- **Favicon**: replaced default Astro icon with the teal forest-plot mark (app geometry,
  `#11C7B4 → #11B981` at 160°); regenerated `public/brand/metaproc-logo.png` (512px, sharp).
- **AA computed, not eyeballed**: links `#0A7A68` ≈4.6:1 on warm canvas / `#12BBA0` ≈8.2:1 on
  dusk; white on CTA gradient ≥4.5:1 (derived `#0B8170 → #0A7A68`); focus ring = partner
  accent, `-deep` coral on light (coral itself is only ≈2.8:1 vs canvas); banner text tokens
  ≈5:1 on their tints; muted text ≈5:1 both moods.
- **Stale — recapture pending**: all proof assets still show the violet app UI
  (`src/assets/proof/`: hero-app-overview/workflow-store/plots-studio/report-builder/
  grade-sof/code-panel PNGs + demo.webm + demo-poster.png). Recapture after the app retheme.
- Verified: `npm run build` green (11 pages). Battery run separately — see the qa entry below.

## [2026-06-12] qa | Post-retheme quality gates (axe + Lighthouse) — green after 2 fixes
axe-core 4.11 (headless Chrome, built dist via `astro preview`; OS dark mode, so marketing
pages rendered in **deep dusk** — first-visit `prefers-color-scheme` logic confirmed live):
- First pass found 2 violations: `color-contrast` on `.mp-cta--light` (computed fg was
  `#12BBA0` — the generic `.mp-marketing a` rule (specificity 0-1-1) was overriding every
  CTA's own text colour (0-1-0); latent pre-retheme bug, surfaced by the teal palette) and
  `link-in-text-block` on the footer-legal License link.
- Fixed: generic link rule is now `a:where(:not(.mp-cta))`; footer-legal + marketing prose
  links underlined (same rule the docs already had). Re-run: **0 violations on all 11 pages**
  (7 marketing + 4 docs).
Lighthouse (headless Chrome, same preview):
- **/** 99 / 100 / 100 / 100 · LCP 1.81 s · CLS 0
- **/features** 99 / 100 / 100 / 100 · LCP 1.96 s · CLS 0
Both inside the gates (≥95 ×4, LCP <2 s, CLS ≈0). /features BP dropped nothing; Perf 100→99
vs 2026-06-11 (aurora/ring compositing + slightly larger CSS) — not chased further; re-check
at proof-asset recapture. Reports: `lighthouse-report/home-orbital.json`,
`features-orbital.json` (gitignored).

## [2026-06-12] qa | Warm-light AA regression found + fixed (axe both moods)
Re-ran axe **in both `prefers-color-scheme` states** (previous post-retheme run only hit deep
dusk — the test host was in OS dark mode, so the warm-light default never got exercised).
- **Deep dusk:** still 0 violations on all 10 routes (7 marketing + 3 docs).
- **Warm light (the marketing default):** 7–8 `color-contrast` violations *per marketing page* —
  all the **`--mp-link` text token** (`#0A7A68`) on tinted surfaces: footer/section tint
  `#E3EDE5` = **4.38:1**, download banner `#FCE9E2` = **4.47:1** (both below AA 4.5). Footer
  links, footer wordmark, section "more" links, hero secondary link, eyebrow. Docs clean
  (Starlight's light accent `#084B40` is deeper). The retheme's documented "≈4.6:1 on warm
  canvas" was the pure-canvas figure; real surfaces are tinted and the hero sits over the
  aurora layers, so the composited ratio lands lower.
- **Fix** (`src/styles/global.css`, commit on this date): warm-light `--mp-link` deepened
  `#0A7A68 → #097264` (derived per BRAND.md §1, text role only — buttons/gradients keep
  `#0A7A68`). Computed `#097264`: canvas 5.12, footer tint 4.86, download banner 4.97, white-on
  5.83 — all ≥4.5 with margin. `--mp-muted` (#5B6877, ≥4.74) and `--mp-ink` (≥13) re-checked, fine.
- **Re-verified** with axe-core 4.11 driven in-page (puppeteer-core + system Chrome) across all
  10 routes under light AND dark: **0 violations in both moods.** `npm run build` green (11
  pages). Lighthouse re-run unchanged: **/** 99/100/100/100 (LCP 1.8 s, CLS 0), **/features**
  99/100/100/100 (a11y now genuinely 100 in the default mood, not just dusk).

## [2026-06-13] build | Proof screenshots recaptured in the Orbital app
Replaced the six violet-era proof screenshots + the demo poster with fresh **Orbital** (teal/
amber, light mode) captures from the live app. They now match the rethemed site instead of
contradicting it.
- **Refreshed** (`src/assets/proof/`, same filenames/dimensions, so no component edits needed —
  `ProofAsset`/`<Picture>` read intrinsic dims and `features.astro`'s `<video>` poster stays
  1600×1000): `hero-app-overview.png`, `workflow-store.png`, `plots-studio.png`,
  `report-builder.png`, `grade-sof.png`, `code-panel.png` (all **3200×2000**) + `demo-poster.png`
  (**1600×1000**). Same content/views as the originals: home overview, Workflow tray open, the
  ten-study RR forest (pooled 0.69 [0.62, 0.78], I² 0%) with the Reproducible-R panel, Templates
  value boxes, GRADE five-domain form, the report builder. Removed the "stale violet UI" comment
  atop `src/pages/index.astro`.
- **Capture harness** (new, `e2e/recapture/`): adapted from the deploy repo's
  `palette-*`/`capture.mjs` pattern — boots the app **bare** on 127.0.0.1:7991 via native
  `runApp` (no ShinyProxy iframe), dismisses the `#mp-tour` overlay, clicks
  `button[data-worked-example="binary"]`, waits for `#templates-forest img`, adds the result to
  the Workflow, then walks the tabs. Playwright drives it at viewport 1600×1000 (DSF 2 → 3200×
  2000 shots; a second DSF-1 context → the 1600×1000 poster). **Rscript path fixed to the
  R-4.5.1 install present on this machine** (the deploy-repo scripts hardcode R-4.5.3 — that
  binary also exists here, but per the run-book the R home is 4.5.1; the deploy repo was **not**
  modified, only this local copy). Playwright is resolved by absolute file URL from
  `metaproc-deploy/node_modules` (it isn't installed in the site repo; ESM ignores NODE_PATH).
  App was started and **stopped** cleanly (port 7991 freed, no stray Rscript).
- **Out of scope / still to do:** the demo **VIDEO** (`demo.webm`) still shows the violet UI —
  recapturing it is a **Stage-8 follow-up**, bundled with the pending H.264 MP4 fallback so both
  encodes come from one fresh Orbital recording (the poster is already Orbital). The Quickstart
  docs' 5 `placeholder.svg` slots were also out of scope (not part of the home/features proof
  set). `manual.md` remains generated-from-app and still describes the violet theme until
  `sync-docs.mjs` re-runs — unchanged here.
- `npm run build` **green: 11 pages**, all proof assets resolve (the AVIF/WebP variants were
  re-derived from the new PNGs — "before" sizes in the build log match the recaptured files).
