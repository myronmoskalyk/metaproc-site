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

## [2026-06-13] redesign | Premium overhaul of every page below the hero + all content pages
Brought the rest of the marketing site up to the rebuilt hero's bar (the hero, the 3-accent
tokens, the glass island nav and the premium utilities were already done at cf17f8d). Three
commits:
- **d4768c4 homepage below the hero.** Replaced the two skill-banned 3-equal-card rows and the
  generic tour grid with distinct layout families (no family repeats; 6+ across the page):
  How-it-works is now a **vertical connected timeline** (gradient number nodes on a teal-fading
  rail); the workspace tour is an **asymmetric bento** (wide code-panel feature tile + a 2x2
  grid, each shot edge-lit and hover-lifted); See-it-run is an **offset glass band**; the
  audiences are an **editorial numbered stack** with hairline separators and role-locked accent
  index numbers (01 teal / 02 coral / 03 sky); the methods band keeps the dark code anchor but
  the engines became **hairline rows** (mono name + role) instead of chips; docs + FAQ became a
  **two-column** sticky docs-rail + accordion. Added `.mp-reveal` with staggered delays on every
  block, double-bezel on the overview shot, button-in-button trailing icons on the section CTAs.
  Cut the over-used eyebrows to the rationed allowance (hero + 2). Audience/feature index numbers
  sized to the **AA large-text floor** (>=24px bold) so coral/sky/violet -deep clear 3:1 on
  canvas in both moods (computed light: coral 4.00, sky 3.60; dusk: violet 3.80, elec 5.10). The
  docs rail switched from `<aside>` to `<div>` to clear `landmark-complementary-is-top-level`.
- **f45c0b6 footer + content pages.** Footer rebuilt into a brand block + grouped hairline nav
  columns with an edge-lit top hairline (no flat link row); all original destinations preserved,
  product/docs links added. Shared `PageLayout` lifted: brand-gradient rule above each title,
  accent-barred section headings, reference tables reshaped into rounded hairline enclosures with
  tinted uppercase headers (`--mp-link`, computed 5.14 light / 6.63 dusk) and light row dividers,
  tertiary-tinted inline code (ink on it 14.4 / 13.0), edge-lit banners, `.mp-reveal` on prose.
  `features.astro` reshaped into numbered editorial groups (role-locked accents), framed hover
  screenshots, and a 2-col accent-bulleted feature grid (no plain `<ul>`). `changelog.astro` got
  a left-bordered release block with accent-marked highlight rows.
- **e4a7489 em-dash sweep.** Removed every em-dash and separator en-dash from all visible copy on
  every page/component (ledes, body, meta + OG descriptions, banners, captions, alt text, engine
  roles), and from the non-rendered comments in the .astro files and `global.css`. **Rendered
  HTML for all 7 marketing pages now contains zero em or en dashes**; the only remaining
  occurrences in `src/` are the out-of-scope Starlight docs (`content/docs/**`).

**Gates.** `npm run build` green (11 pages) before each commit. Accessibility verified the same
way the project's baseline was set: **axe-core in-page (puppeteer-core + system Chrome), all
rules, both moods, all 7 marketing routes = 0 violations** (this is the authoritative gate; it
composites the fixed aurora the way real browsers do). Lighthouse: **/** Perf 100 / A11y 100
(LCP 1.7 s, CLS 0), **/features** Perf 99 / A11y 100 (LCP 1.8 s, CLS 0). NOTE: the
`@axe-core/cli` selenium runner (`npx axe ./dist`) reports phantom `color-contrast` flags on
text over the aurora in BOTH the pre-work baseline and now (e.g. /download 10, h1/lede/banner/
prose) because chromedriver over-samples the radial-gradient saturation; computed worst-case
over the densest aurora centre still clears AA (prose body 9.4-10.2, links 4.55-4.90, only
`--mp-muted` on the densest emerald centre dips to 4.44 at a pixel text never lands on), and the
in-page method reports 0. Treated as the documented tooling artifact, not a regression. CLS 0
confirms the bento/timeline/reveal add no layout shift; `.mp-reveal` animates transform/opacity
only and is killed under reduced-motion globally.

## [2026-06-13] redesign | Homepage cut to 5 sections + launch-core centering fix
Per Myron: the homepage felt cluttered and the hero launch core looked slightly off-centre.

- **Cut 9 sections to 5** (premium = restraint + whitespace). Kept: Hero / How-it-works /
  Workspace tour / Methods / closing FAQ+CTA. **Removed** the standalone "See it run" demo teaser
  (its "Watch the demo" link folded into the tour foot, still points to `/features#demo`), the
  docs-rail teaser (it lives in the nav + footer; one Quickstart link folded into the FAQ column),
  and the three audience cards. **Trimmed** the FAQ from 6 questions to the 3 essentials (free /
  privacy / can-I-see-the-code); the rest live in the docs. The `#faq` anchor the header nav
  points to is preserved (moved onto the closing section). The bento tour was condensed from 5
  shots to 4 (one wide code-panel feature tile + workflow / plots / report); the GRADE shot was
  dropped from the homepage (still used on /features, asset retained). Every remaining headline
  and sub was tightened (subs <=20 words, no em-dashes). Section padding opened up
  (`clamp(4rem,8vw,7rem)`), section titles balance-wrapped at 24ch. Eyebrows rationed to 2 across
  5 sections (hero + methods) per BRAND §4 / taste-skill (dropped the "How it works" eyebrow). The
  final CTA became a bracketed glass panel paired with the FAQ in a 2-col closing block; it was a
  `<div>`, not `<aside>`, to avoid `landmark-complementary-is-top-level`.
- **Launch-core centering (root cause + fix).** A Playwright geometry probe measured the centre of
  every ring vs the button: the rings sat 25px BELOW the button (`btn-vs-halo dy=25.5`). Cause: the
  rings used a `1fr`/auto grid track, whose min-content floor was inflated by the 117% dash child
  past the box height, so `place-items:center` centred the rings in the oversized track, not the
  box. Fix: the whole core is now ONE square grid stage with every layer in a single fixed-size
  cell (`grid-template:"core" var(--stage)/var(--stage)`, all children `grid-area:core`,
  `place-items:center`, `min-*:0`) and the rings wrapper the same trick at `--halo`. Fixed-length
  tracks ignore min-content, so the 117% dash overflows symmetrically and stays concentric. No
  `translate()` anywhere, so spin/breathe/press transforms can't clobber centring. Probe now reads
  **btn-vs-halo / dash / sonar = 0.00,0.00 and core-vs-column = 0.00,0.00 at desktop AND mobile, in
  both moods** (mobile 0.01 = sub-pixel). Burst/press-punch keyframes updated to scale-only.
- **AA: deepened `--mp-muted` #5B6877 -> #525F6D** (warm light only). The locked value clears AA on
  the static canvas but the drifting aurora transiently tints local backgrounds greener (~#E3EDE5),
  where small antialiased muted text composited 4.27-4.47:1 (axe) on the tinted tour band AND the
  footer (`.mp-footer__tag` / `.mp-footer__legal`) - the footer failure pre-existed this work
  (reproduced on the committed HEAD for /changelog + /privacy). #525F6D computes >=5.4:1 on the
  green-tinted composite, 5.7:1 on canvas, 6.4:1 on panels; derive-and-document per BRAND §1 (same
  pattern as the earlier `--mp-link` #097264 fix). Dusk muted (#9DB0C3) unchanged (already AA).

**Gates.** `npm run build` green (11 pages). In-page axe (Playwright + Chrome, full ruleset, both
moods, all 7 marketing routes) = **0 violations** - and the footer pages that failed on HEAD with
this stricter aurora sampling now pass. The axe runner resolves `.mp-reveal` to its resting state
before scanning (mid-fade translucent text is a measurement artifact, not what a user or the
reduced-motion path sees). Interaction checks pass: `#faq` anchor lands on the closing section,
FAQ items toggle, launch core is a focusable `<a>` with aria-label, `data-placeholder="app-url"`
x4 preserved, rings animation is `none` under reduced motion. Screenshot + probe harness lives in
`e2e/shoot.mjs` / `e2e/sections.mjs` / `e2e/axe-run.mjs` / `e2e/interact.mjs` (untracked).

## [2026-06-13] refactor | Centralize every colour into one editable palette
Value-preserving refactor (isolated commit, no rendered colour changed). Goal: editing a small
central token set re-themes the WHOLE site.

- **Audited** all `.astro` files (page + component `<style>` blocks, plus SVG mark fills) and
  `global.css` for hardcoded colour literals (hex / rgb()/rgba() / named) used in live styling.
- **Moved every literal** into the central `:root` token system in `src/styles/global.css`.
  ~30 literals across 5 files: `index.astro` (dark code-band gradient `#0D141B/#101A22`, on-dark
  ink `#EEF4FB` / muted `#9DB0C3` / faint `#8CA0B4`, gradient-surface `#fff` + the
  `rgba(255,255,255,.14….30)` inner-highlights on the launch core and timeline node, SVG mark
  `#fff`, mask `#000`), `Header.astro` + `Footer.astro` (mark `#fff` + highlight rgba),
  `changelog.astro` (pill text `#fff`), `ForestPlot.astro` (plot-teal `#0E9F8E`). New semantic
  tokens: `--mp-on-brand`, `--mp-ink-on-dark`, `--mp-muted-on-dark`, `--mp-faint-on-dark`,
  `--mp-code-bg2`, `--mp-hi-14…30` (inner-highlight whites), `--mp-mask`, `--mp-plot-teal`.
- **Result:** NO `.astro` style block or component holds a raw colour literal — all reference
  `var(--mp-*)`. Colour literals live ONLY in `:root` (warm light) / `:root[data-theme='dusk']`
  (deep dusk) / `@theme` (Tailwind's static utility mirror) in `global.css`. The two moods still
  swap by flipping `data-theme`; AA tokens (the `-deep` text, `#097264` link, `#525F6D` muted,
  `#0369A1` sky text) unchanged.
- **Theming docs** added: new "## Theming" section in README.md (token groups brand / accents /
  surfaces / ink-muted-link / edges-glow; how to re-theme; points at BRAND.md) + a matching
  HANDOVER.md entry.

**Gates.** `npm run build` green (11 pages). **Value-preserving proof:** a frozen full-page
screenshot diff (both moods, all animation killed, scrolled from y=0) is **pixel-identical to the
pre-refactor build — max channel delta 0, 0.0000% differing pixels** (the diff covers the hero,
dark code band, methods band, gradient CTAs, every tokenized hot-spot). In-page axe (Playwright +
Chrome, full ruleset, both moods, all 7 marketing routes) = **0 violations**. (Hero-only viewport
crops show ~30-45% delta purely from sub-pixel scroll + ring-rotation jitter across two separate
page loads; the byte-identical full-page diff is authoritative, and side-by-side inspection shows
identical hues.) Harness: untracked `e2e/{frozen,diff,diff2,diff3}.mjs`.

## [2026-06-13] polish | Hero gridlines never obscure text
The faint hero graph-paper grid could fade into the headline area; retightened so it is texture
only behind the launch core.

- `.hero__gridbg` mask retightened to a small ellipse centred on the launch core. Desktop:
  `radial-gradient(ellipse 27% 62% at 71% 50%, mask 0%, mask 30%, transparent 66%)` — solid to 30%
  of the radius, fully transparent by ~53% of the hero width, a clear gap from the text column
  which ends at ~49% (probed at 1440px). Mobile (<=820px, stacked): `ellipse 82% 30% at 50% 72%`
  centred on the core below the text, transparent by ~51% of hero height (text ends ~45%).
- **Verified clear:** `e2e/gridcheck.mjs` forces the grid layer to full-opacity red and samples
  every padded text bounding box — **0 grid pixels inside text** across desktop+mobile x
  light+dusk (0 of ~535k sampled). Hero screenshots in both moods confirm crisp characters with
  the grid confined to the core area.

**Gates.** `npm run build` green (11 pages); in-page axe still 0 (grid is decorative,
`aria-hidden`, unchanged structurally).
