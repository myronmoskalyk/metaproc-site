// Regenerate the marketing demo video (demo.webm) from the BARE Onest app running on
// http://127.0.0.1:7991 (native runApp / a `docker run -p 7991:3838` container — no
// ShinyProxy iframe, no auth). Mirrors the storyline + timing of the existing
// public/media/demo-captions.vtt (~73 s) so the descriptive captions stay aligned:
//   0-6 open · 6-12 load+run binary template · 12-28 results · 28-50 scroll results
//   · 50-58 GRADE · 58-68 Report · 68-73 Plots.
// Output: C:\dev\metaproc-site\src\assets\proof\demo.webm (1600x1000, DSF2).
//
// Usage: APP_URL=http://127.0.0.1:7991 node e2e/recapture/capture-demo.mjs
import { pathToFileURL } from 'node:url';
const pw = await import(pathToFileURL('C:\\dev\\metaproc-deploy\\node_modules\\playwright\\index.js').href);
const chromium = pw.chromium ?? pw.default.chromium;
import { mkdirSync, existsSync, readdirSync, copyFileSync, statSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const APP = process.env.APP_URL || 'http://127.0.0.1:7991';
const PROOF_DIR = 'C:\\dev\\metaproc-site\\src\\assets\\proof';
const VIDEO_DIR = 'C:\\dev\\metaproc-site\\e2e\\recapture\\_video';
const VIEWPORT = { width: 1600, height: 1000 };
const SETTLE = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);

async function dismissTour(page) {
  await page.evaluate(() => {
    if (window.metaprocTourEnd) { try { window.metaprocTourEnd(); } catch { /* */ } }
    const t = document.querySelector('#mp-tour'); if (t) { t.classList.remove('open'); t.remove(); }
    document.querySelectorAll('.mp-tour-overlay').forEach((el) => el.remove());
  });
  await SETTLE(400);
}
async function loadWorkedExample(page, key) {
  const b = page.locator(`button[data-worked-example="${key}"]`).first();
  await b.waitFor({ state: 'visible', timeout: 30_000 });
  await b.scrollIntoViewIfNeeded(); await b.click();
  log(`worked-example "${key}"`);
}
async function goTab(page, value) {
  await page.evaluate((v) => {
    const esc = (window.CSS && CSS.escape) ? CSS.escape(v) : v;
    const el = document.querySelector(`.navbar a.nav-link[data-value="${esc}"], .navbar a.dropdown-item[data-value="${esc}"], a[data-value="${esc}"]`);
    if (el) { el.click(); return; }
    if (window.metaprocGoTab) window.metaprocGoTab(v);
  }, value);
  log(`tab "${value}"`);
}
async function addToWorkflow(page) {
  await page.evaluate(() => {
    let b = document.querySelector('#templates-add_workflow');
    if (!b) b = [...document.querySelectorAll('button.mp-add-workflow')].find((x) => x.offsetParent !== null) || null;
    if (b) b.click();
  });
}

async function main() {
  if (existsSync(VIDEO_DIR)) { try { rmSync(VIDEO_DIR, { recursive: true, force: true }); } catch { /* */ } }
  mkdirSync(VIDEO_DIR, { recursive: true });
  if (!existsSync(PROOF_DIR)) mkdirSync(PROOF_DIR, { recursive: true });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: VIEWPORT, deviceScaleFactor: 2,
    recordVideo: { dir: VIDEO_DIR, size: VIEWPORT },
  });
  const page = await ctx.newPage();
  const t0 = Date.now();
  const pace = async (sec) => { const d = sec * 1000 - (Date.now() - t0); if (d > 0) await SETTLE(d); };

  log(`goto ${APP}`);
  await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.locator('#main_nav, .mp-brand, .navbar').first().waitFor({ state: 'visible', timeout: 120_000 });
  await dismissTour(page);
  await page.evaluate(() => window.scrollTo(0, 0));

  // 0-6 s — the app open on the Home/welcome screen.
  await goTab(page, 'Home');
  await pace(6);

  // 6-12 s — load + run the pairwise binary template (auto-runs to Templates results).
  await loadWorkedExample(page, 'binary');
  try { await page.locator('.bslib-value-box:visible, .value-box:visible').first().waitFor({ state: 'visible', timeout: 90_000 }); } catch { /* */ }
  await pace(12);

  // 12-28 s — the headline results (value boxes: RR 0.69, I^2 = 0%, k = 10).
  await page.evaluate(() => window.scrollTo(0, 0));
  await pace(28);

  // 28-50 s — scroll the results: heterogeneity, prediction interval, clinical translation.
  const steps = 9;
  for (let i = 1; i <= steps; i++) {
    await page.evaluate((f) => window.scrollTo({ top: document.body.scrollHeight * f, behavior: 'smooth' }), i / (steps + 2));
    await pace(28 + (22 * i) / steps);
  }
  await addToWorkflow(page); // collect so the Plots flourish isn't empty

  // 50-58 s — GRADE certainty form.
  await page.evaluate(() => window.scrollTo(0, 0));
  await goTab(page, 'GRADE');
  await pace(58);

  // 58-68 s — Report builder.
  await goTab(page, 'Reproducible report');
  await pace(68);

  // 68-73 s — Plots studio flourish (saved forest + its R code).
  await goTab(page, 'Plots');
  await pace(73);

  await ctx.close();   // writes the .webm
  await browser.close();

  // Move the newest recording to the proof dir as demo.webm.
  const vids = readdirSync(VIDEO_DIR).filter((f) => f.endsWith('.webm'));
  if (!vids.length) { console.error('NO VIDEO RECORDED'); process.exit(2); }
  const newest = vids.map((f) => ({ f, t: statSync(join(VIDEO_DIR, f)).mtimeMs })).sort((a, b) => b.t - a.t)[0].f;
  const out = join(PROOF_DIR, 'demo.webm');
  copyFileSync(join(VIDEO_DIR, newest), out);
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  log(`demo.webm -> ${out} (${(statSync(out).size / 1024 / 1024).toFixed(2)} MB, storyline ~${secs}s)`);
  process.exit(0);
}
main().catch((e) => { console.error('FATAL', e); process.exit(2); });
