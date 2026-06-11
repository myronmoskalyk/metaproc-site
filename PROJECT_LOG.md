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
