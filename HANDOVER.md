# metaproc-site — Handover

**State (2026-06-11):** site is **feature-complete for local preview**. Astro 6 + Starlight +
Tailwind 4; all real proof assets wired (6 screenshots via astro:assets `<Picture>` AVIF/WebP,
73 s WebM demo with extracted poster + captions track); docs synced from the app repo;
quality gates green on / and /features (Perf 99–100 / A11y 100 / BP 100 / SEO 100,
LCP ≤1.9 s, CLS 0; axe 0 violations).

**Remaining before public:**
1. **H6 — Myron's copy approval** (privacy/ToS draft banners stay until then).
2. **Stage 8 — deploy hooks**: real domain in `astro.config.mjs` (`SITE`), Cloudflare Workers
   static-assets deploy, Cloudflare Web Analytics token in `BaseLayout.astro`, `/download`
   un-gating (public repo + tag match, GPL §6), and an **H.264 MP4 fallback** for
   `src/assets/proof/demo.webm` (needs full ffmpeg — Playwright's bundled build decodes VP8
   but can't encode H.264; see HTML comment next to the `<video>` in `src/pages/features.astro`).

**Nice-to-have (not blocking):** the docs Quickstart still uses `placeholder.svg` in 5
markdown image slots — plots-studio / grade-sof / report-builder shots could fill three of them.

**Standing rules:**
- One CTA ("Launch MetaProc free"); engine names demoted to a credibility row.
- `/download` gated on public repo + tag match (GPL §6). No `/pricing` page (D5 beta copy).
- Privacy/ToS copy is DRAFT until Myron approves (H6).
- `src/content/docs/docs/manual.md` is generated — never hand-edit; re-run
  `node scripts/sync-docs.mjs`.
- Plan of record: wiki note "MetaProc — Phase 11 Plan — SaaS & Website"; execution plan:
  C:\Users\myron\.claude\plans\mellow-hatching-bear.md
