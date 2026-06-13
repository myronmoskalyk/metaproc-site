// Recapture proof screenshots from the LIGHT-mode Orbital app, running BARE on
// http://127.0.0.1:7991 (native runApp, no ShinyProxy iframe / no TLS).
//
// Merges two existing harnesses from metaproc-deploy/e2e:
//   - capture.mjs       -> the 6 proof-asset tab flow + worked-example + add-to-workflow
//   - palette-capture.mjs -> the bare-app (no-iframe) page handling + tour dismissal
//
// Output: 6 PNGs at 3200x2000 (viewport 1600x1000 @ DSF 2) written straight over the
// site's proof assets, plus demo-poster.png at 1600x1000 (DSF 1) to match the video size.
//
// Usage: NODE_PATH=C:\dev\metaproc-deploy\node_modules node capture.mjs

// Resolve playwright from the metaproc-deploy repo (the only place it's installed).
// ESM ignores NODE_PATH, so import by absolute file URL instead.
import { pathToFileURL } from 'node:url';
const pw = await import(
  pathToFileURL('C:\\dev\\metaproc-deploy\\node_modules\\playwright\\index.js').href
);
const chromium = pw.chromium ?? pw.default.chromium;
import { mkdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const APP = 'http://127.0.0.1:7991';
const PROOF_DIR = 'C:\\dev\\metaproc-site\\src\\assets\\proof';
const VIEWPORT = { width: 1600, height: 1000 };
const SETTLE = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);
function ensureDir(d) { if (!existsSync(d)) mkdirSync(d, { recursive: true }); }

// --- Bare-app ports of capture.mjs helpers (operate on `page` directly) ----------

// Dismiss the first-run guided tour overlay (#mp-tour / .mp-tour-overlay).
async function dismissTour(page) {
  await page.evaluate(() => {
    if (window.metaprocTourEnd) { try { window.metaprocTourEnd(); } catch { /* */ } }
    const tour = document.querySelector('#mp-tour');
    if (tour) { tour.classList.remove('open'); tour.setAttribute('aria-hidden', 'true'); tour.remove(); }
    document.querySelectorAll('.mp-tour-overlay').forEach((el) => el.remove());
  });
  await SETTLE(700);
  log('Dismissed guided tour overlay (if present).');
}

// Click a worked-example button by data-value.
async function loadWorkedExample(page, key) {
  const btn = page.locator(`button[data-worked-example="${key}"]`).first();
  await btn.waitFor({ state: 'visible', timeout: 30_000 });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  log(`Clicked worked-example "${key}".`);
}

// Navigate to a tab by its data-value (matches top-level nav links AND dropdown items).
async function goTab(page, value) {
  const ok = await page.evaluate((v) => {
    const esc = (window.CSS && CSS.escape) ? CSS.escape(v) : v.replace(/"/g, '\\"');
    const el = document.querySelector(
      `.navbar a.nav-link[data-value="${esc}"], .navbar a.dropdown-item[data-value="${esc}"], a[data-value="${esc}"]`);
    if (el) { el.click(); return true; }
    if (window.metaprocGoTab) return !!window.metaprocGoTab(v);
    return false;
  }, value);
  await SETTLE(1800);
  log(`Navigated to tab "${value}" (matched=${ok}).`);
  return ok;
}

// Collect the current Templates result into the shared Workflow (so Plots/SoF/Report
// show real content instead of empty states).
async function addToWorkflow(page) {
  const ok = await page.evaluate(() => {
    let btn = document.querySelector('#templates-add_workflow');
    if (!btn) {
      btn = [...document.querySelectorAll('button.mp-add-workflow')]
        .find((b) => b.offsetParent !== null) || null;
    }
    if (btn) { btn.click(); return true; }
    return false;
  });
  await SETTLE(2000);
  log(`Clicked "Add to workflow" (matched=${ok}).`);
  return ok;
}

async function shoot(page, name) {
  const file = join(PROOF_DIR, `${name}.png`);
  await page.screenshot({ path: file });
  const sz = statSync(file).size;
  log(`Saved ${name}.png (${(sz / 1024).toFixed(0)} KB)`);
  return name;
}

// Boot + dismiss tour + run the binary worked example + collect it. Shared by both
// the screenshot context (DSF 2) and the poster context (DSF 1).
async function bootAndPrime(page) {
  log(`goto ${APP}`);
  await page.goto(APP, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.locator('#main_nav, .mp-brand, .navbar').first()
    .waitFor({ state: 'visible', timeout: 120_000 });
  await SETTLE(1800);
  await dismissTour(page);

  // Load the binary worked example -> Templates results.
  await loadWorkedExample(page, 'binary');

  // Wait for results (visible value box) + the forest plot.
  try {
    await page.locator('.bslib-value-box:visible, .value-box:visible').first()
      .waitFor({ state: 'visible', timeout: 90_000 });
    log('Results value boxes rendered.');
  } catch (e) { log(`No visible value box: ${e.message}`); }
  try {
    await page.locator('#templates-forest img, .shiny-plot-output img').first()
      .waitFor({ state: 'visible', timeout: 60_000 });
    log('Forest plot rendered.');
  } catch (e) { log(`Forest plot not visible: ${e.message}`); }
  await SETTLE(3500);

  // Collect the result into the shared Workflow.
  await addToWorkflow(page);
}

async function main() {
  ensureDir(PROOF_DIR);
  const browser = await chromium.launch();

  // ---- Context 1: the six 3200x2000 proof screenshots (DSF 2) ----------------
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await bootAndPrime(page);

  const captured = [];

  // hero / home overview
  await goTab(page, 'Home');
  await SETTLE(2500);
  captured.push(await shoot(page, 'hero-app-overview'));

  // workflow store — open the docked Workflow tray
  await page.evaluate(() => { if (window.metaprocToggleWorkflow) window.metaprocToggleWorkflow(); });
  await SETTLE(2500);
  captured.push(await shoot(page, 'workflow-store'));
  // close the tray so it doesn't overlay later shots
  await page.evaluate(() => {
    if (window.metaprocToggleWorkflow) {
      const tray = document.querySelector('#mp-workflow-tray.open');
      if (tray) window.metaprocToggleWorkflow();
    }
  });
  await SETTLE(1000);

  // Templates results + code panel
  await goTab(page, 'Templates');
  await SETTLE(2500);
  try { await page.locator('.mp-code').first().scrollIntoViewIfNeeded(); await SETTLE(1200); } catch { /* */ }
  captured.push(await shoot(page, 'code-panel'));

  // Plots studio
  await goTab(page, 'Plots');
  await SETTLE(2500);
  try {
    await page.locator('.shiny-plot-output img, .plotly, .girafe_container_std, .html-widget').first()
      .waitFor({ state: 'visible', timeout: 20_000 });
  } catch { /* shoot what we have */ }
  await SETTLE(1500);
  captured.push(await shoot(page, 'plots-studio'));

  // GRADE / summary-of-findings
  await goTab(page, 'GRADE');
  await SETTLE(2800);
  captured.push(await shoot(page, 'grade-sof'));

  // Report builder
  await goTab(page, 'Reproducible report');
  await SETTLE(2800);
  captured.push(await shoot(page, 'report-builder'));

  await ctx.close();

  // ---- Context 2: the demo poster at 1600x1000 (DSF 1, matches the video size) -
  // The poster shows the worked-example / forest stage (per the features.astro copy).
  const ctxP = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  const pposter = await ctxP.newPage();
  await bootAndPrime(pposter);
  // Stay on Templates with the forest plot in view -> a representative poster frame.
  await goTab(pposter, 'Templates');
  await SETTLE(2000);
  try { await pposter.locator('#templates-forest img, .shiny-plot-output img').first().scrollIntoViewIfNeeded(); } catch { /* */ }
  await SETTLE(1500);
  captured.push(await shoot(pposter, 'demo-poster'));
  await ctxP.close();

  await browser.close();
  log('==== CAPTURED ====');
  log(captured.join(', '));
  process.exit(0);
}

main().catch((e) => { console.error('FATAL', e); process.exit(2); });
