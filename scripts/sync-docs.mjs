// sync-docs.mjs — one-way sync of the app's PRODUCT_MANUAL.md into the docs site.
//
// Reads PRODUCT_MANUAL.md from the metaproc app repo, strips desktop-only sections
// (installer / TinyTeX / .dmg / .exe / desktop-menu content that doesn't apply to
// the web docs), prepends Starlight frontmatter + a "GENERATED — do not edit"
// header, and writes src/content/docs/docs/manual.md.
//
// One-way only: the app repo is the source of truth. Never hand-edit manual.md —
// re-run this script instead:  node scripts/sync-docs.mjs
//
// TODO (future): extend this to also extract the in-app help/glossary by reading
//   R/fct_manual.R and R/fct_glossary.R from the app repo, so the docs glossary
//   stays in lockstep with the running app's ⓘ info-tips. For now we only sync the
//   hand-maintained PRODUCT_MANUAL.md.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

// Source: the app repo (read-only). Overridable via env for CI / other checkouts.
const SOURCE =
	process.env.METAPROC_MANUAL ??
	resolve(
		REPO_ROOT,
		'..',
		'..',
		'Users',
		'myron',
		'OneDrive',
		'Documents',
		'Metaproc_Parent',
		'metaproc',
		'PRODUCT_MANUAL.md',
	);

const OUT = join(REPO_ROOT, 'src', 'content', 'docs', 'docs', 'manual.md');

// Headings whose section (until the next heading of the same-or-higher level) is
// desktop-only and should be dropped from the web docs.
const DESKTOP_KEYWORDS = [
	'tinytex',
	'installer',
	'desktop menu',
	'.dmg',
	'.exe',
];

const headingRe = /^(#{1,6})\s+(.*)$/;

function isDesktopHeading(text) {
	const t = text.toLowerCase();
	return DESKTOP_KEYWORDS.some((kw) => t.includes(kw));
}

/**
 * Drop every section (heading + body) whose heading matches a desktop keyword,
 * up to the next heading of the same or higher level.
 */
function stripDesktopSections(markdown) {
	const lines = markdown.split(/\r?\n/);
	const out = [];
	let skipUntilLevel = null; // when set, skip lines until a heading <= this level

	for (const line of lines) {
		const m = line.match(headingRe);
		if (m) {
			const level = m[1].length;
			if (skipUntilLevel !== null) {
				// We're inside a skipped block: stop skipping at a same/higher heading.
				if (level <= skipUntilLevel) {
					skipUntilLevel = null;
				} else {
					continue; // still inside the skipped subtree
				}
			}
			if (isDesktopHeading(m[2])) {
				skipUntilLevel = level;
				continue; // drop this heading and everything under it
			}
			out.push(line);
		} else if (skipUntilLevel === null) {
			out.push(line);
		}
	}
	return out.join('\n');
}

function build(body) {
	const today = new Date().toISOString().slice(0, 10);
	const frontmatter = [
		'---',
		'title: Product manual (generated)',
		'description: Full MetaProc capability inventory, synced from the app repository.',
		'---',
		'',
	].join('\n');

	const banner = [
		'<!-- GENERATED — do not edit. Synced from the metaproc app repo by',
		'     scripts/sync-docs.mjs. Edit PRODUCT_MANUAL.md in the app repo and re-run',
		'     the script instead. Desktop-only sections (installer / TinyTeX / .dmg /',
		'     .exe / desktop menu) are filtered out for the web docs. -->',
		'',
		':::note',
		`This page is **generated** from the MetaProc app repository (last synced ${today}).`,
		'Do not edit it here — changes will be overwritten. Update `PRODUCT_MANUAL.md` in the',
		'app repo and re-run `scripts/sync-docs.mjs`.',
		':::',
		'',
	].join('\n');

	return `${frontmatter}${banner}${body.trimStart()}\n`;
}

function main() {
	if (!existsSync(SOURCE)) {
		console.error(`[sync-docs] source manual not found: ${SOURCE}`);
		console.error('[sync-docs] set METAPROC_MANUAL to override the path.');
		process.exit(1);
	}

	const raw = readFileSync(SOURCE, 'utf8');
	const filtered = stripDesktopSections(raw);
	const final = build(filtered);

	mkdirSync(dirname(OUT), { recursive: true });
	writeFileSync(OUT, final, 'utf8');
	console.log(`[sync-docs] wrote ${OUT} (${final.length} bytes) from ${SOURCE}`);
}

main();
