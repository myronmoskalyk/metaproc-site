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
