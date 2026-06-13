// Shared theme-apply + custom-derive logic for the runtime theme picker.
//
// A *preset* is just an attribute: setting data-theme-preset="<id>" on <html>
// activates the matching seed-override block in global.css (which re-derives
// every surface). The default "orbital" has no block, so it resets to the
// locked base. The *mood* (light/dusk) is a separate axis on data-theme and is
// owned by the existing mood toggle.
//
// The *custom* theme cannot be a static CSS block (its seeds are user-chosen at
// runtime), so applyTheme('custom', blob) computes the full seed set in JS and
// writes it as inline custom properties on <html> (inline wins over the preset
// blocks). Text-bearing tokens (brand, brand-deep, link, muted, accent*-deep)
// are auto-deepened for WCAG AA on the chosen canvas, mirroring e2e/theme-aa.mjs.
//
// This module is imported by ThemePicker.astro. The pre-paint inline script in
// BaseLayout.astro reimplements the minimal slice it needs (it must be inline +
// blocking for zero flash) — keep the two in sync if the custom derivation
// changes.

export const THEME_KEY = 'mp-site-theme';
export const CUSTOM_KEY = 'mp-site-theme-custom';

export type Seeds = { g1: string; g2: string; a1: string; a2: string; a3: string };
type RGB = [number, number, number];

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function hexToRgb(h: string): RGB {
	h = h.replace('#', '').trim();
	if (h.length === 3) h = h.split('').map((c) => c + c).join('');
	return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex([r, g, b]: RGB): string {
	return (
		'#' +
		[r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('')
	);
}
// Linear sRGB blend approximating color-mix(in srgb, a p%, b).
function mix(aHex: string, p: number, bHex: string): string {
	const a = hexToRgb(aHex);
	const b = hexToRgb(bHex);
	const t = p / 100;
	return rgbToHex([
		a[0] * t + b[0] * (1 - t),
		a[1] * t + b[1] * (1 - t),
		a[2] * t + b[2] * (1 - t),
	]);
}
function lin(c: number): number {
	c /= 255;
	return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function lum(hex: string): number {
	const [r, g, b] = hexToRgb(hex);
	return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrast(fg: string, bg: string): number {
	const L1 = lum(fg);
	const L2 = lum(bg);
	const [hi, lo] = L1 >= L2 ? [L1, L2] : [L2, L1];
	return (hi + 0.05) / (lo + 0.05);
}
// Walk `fg` toward black (light) / white (dusk) until it clears `need` on the
// worst of `surfaces`. Returns the adjusted hex.
function deepen(fg: string, surfaces: string[], need: number, towardWhite: boolean): string {
	let rgb = hexToRgb(fg);
	const target: RGB = towardWhite ? [255, 255, 255] : [0, 0, 0];
	for (let i = 0; i < 100; i++) {
		const hex = rgbToHex(rgb);
		const worst = Math.min(...surfaces.map((s) => contrast(hex, s)));
		if (worst >= need) return hex;
		rgb = rgb.map((c, k) => c + (target[k] - c) * 0.06) as RGB;
	}
	return rgbToHex(rgb);
}

const NEED_BODY = 4.5;

// Derive the full inline seed set for a custom theme on the given mood.
// Returns a map of CSS custom-property name -> value to set on <html>.
export function deriveCustom(seeds: Seeds, mood: 'light' | 'dusk'): Record<string, string> {
	const { g1, g2, a1, a2, a3 } = seeds;
	const brand = mix(g1, 50, g2); // mid reference
	const out: Record<string, string> = {};

	if (mood === 'dusk') {
		// Dusk: near-black canvas tinted by the brand; bright seeds ride it AA.
		const canvas = mix(brand, 7, '#07090e');
		const panel = '#141C25';
		const cap = '#18222B';
		const glass = mix(brand, 9, mix('#101620', 60, canvas));
		const glassPanel = mix(brand, 10, mix('#121923', 56, canvas));
		const surf = [canvas, panel, cap, glass, glassPanel];
		const ink = mix(brand, 6, '#f4f7fb');
		out['--mp-g1'] = g1;
		out['--mp-g2'] = g2;
		out['--mp-brand'] = brand;
		out['--mp-brand-deep'] = mix(brand, 78, '#000');
		out['--mp-canvas'] = canvas;
		out['--mp-ink'] = ink;
		out['--mp-muted'] = deepen(mix(brand, 26, '#9aa6b3'), surf, NEED_BODY, true);
		out['--mp-link'] = deepen(g1, surf, NEED_BODY, true);
		out['--mp-link-hover'] = mix(out['--mp-link'], 70, '#ffffff');
		out['--mp-accent'] = deepen(a1, surf, NEED_BODY, true);
		out['--mp-accent-deep'] = mix(out['--mp-accent'], 80, '#000');
		out['--mp-accent2'] = deepen(a2, surf, NEED_BODY, true);
		out['--mp-accent2-deep'] = mix(out['--mp-accent2'], 80, '#000');
		out['--mp-accent3'] = deepen(a3, surf, NEED_BODY, true);
		out['--mp-accent3-deep'] = mix(out['--mp-accent3'], 80, '#000');
		out['--mp-on-accent'] = contrast('#fff', out['--mp-accent']) >= 4.5 ? '#fff' : '#10130a';
		out['--mp-on-accent2'] = contrast('#fff', out['--mp-accent2']) >= 4.5 ? '#fff' : '#0a0a12';
		out['--mp-on-accent3'] = contrast('#fff', out['--mp-accent3']) >= 4.5 ? '#fff' : '#06121f';
		// .mp-cta--light text sits on a white button (dark code band) in BOTH moods,
		// so even in dusk this must be AA on white, not the lighter dusk brand-deep.
		out['--mp-cta-light-fg'] = deepen(mix(brand, 88, '#000'), ['#ffffff', '#FDFCF8'], NEED_BODY, false);
		out['--mp-plot-teal'] = g1;
		out['--mp-code-fg'] = mix(g1, 55, '#dfe9ee');
	} else {
		// Light: warm near-canvas tinted by the brand; text auto-deepened.
		const canvas = mix(brand, 6, '#f4f1ea');
		const panel = '#FDFCF8';
		const tint = mix(g1, 7, canvas);
		const auroraGreen = mix(brand, 10, canvas); // worst-case drifting composite
		const glassPanel = mix(brand, 6, mix('#ffffff', 74, canvas));
		const surf = [canvas, panel, tint, auroraGreen, glassPanel];
		const ink = mix(brand, 8, '#161d27');
		out['--mp-g1'] = g1;
		out['--mp-g2'] = g2;
		out['--mp-brand'] = brand;
		out['--mp-brand-deep'] = deepen(mix(brand, 88, '#000'), surf, NEED_BODY, false);
		out['--mp-canvas'] = canvas;
		out['--mp-ink'] = ink;
		out['--mp-muted'] = deepen(mix(brand, 18, '#54606c'), surf, NEED_BODY, false);
		out['--mp-link'] = out['--mp-brand-deep'];
		out['--mp-link-hover'] = mix(out['--mp-link'], 80, '#000');
		out['--mp-accent'] = deepen(a1, surf, NEED_BODY, false);
		out['--mp-accent-deep'] = out['--mp-accent'];
		out['--mp-accent2'] = deepen(a2, surf, NEED_BODY, false);
		out['--mp-accent2-deep'] = out['--mp-accent2'];
		out['--mp-accent3'] = deepen(a3, surf, NEED_BODY, false);
		out['--mp-accent3-deep'] = out['--mp-accent3'];
		out['--mp-on-accent'] = '#fff';
		out['--mp-on-accent2'] = '#fff';
		out['--mp-on-accent3'] = '#fff';
		out['--mp-cta-light-fg'] = out['--mp-brand-deep']; // already AA on white
		out['--mp-plot-teal'] = g1;
		out['--mp-code-fg'] = mix(g1, 55, '#dfe9ee');
	}
	return out;
}

// The inline custom property names deriveCustom() writes — used to clear stale
// inline vars when switching AWAY from custom back to a preset.
const CUSTOM_VARS = [
	'--mp-g1', '--mp-g2', '--mp-brand', '--mp-brand-deep', '--mp-canvas', '--mp-ink',
	'--mp-muted', '--mp-link', '--mp-link-hover', '--mp-accent', '--mp-accent-deep',
	'--mp-accent2', '--mp-accent2-deep', '--mp-accent3', '--mp-accent3-deep',
	'--mp-on-accent', '--mp-on-accent2', '--mp-on-accent3', '--mp-cta-light-fg',
	'--mp-plot-teal', '--mp-code-fg',
];

function currentMood(): 'light' | 'dusk' {
	return document.documentElement.getAttribute('data-theme') === 'dusk' ? 'dusk' : 'light';
}

// Apply a theme to <html>. For presets: set data-theme-preset + clear any inline
// custom vars. For custom: set the attribute AND write the derived inline vars.
export function applyTheme(preset: string, customBlob?: Partial<Seeds>): void {
	const html = document.documentElement;
	// Always clear stale inline custom vars first.
	for (const v of CUSTOM_VARS) html.style.removeProperty(v);

	if (preset === 'custom') {
		const seeds: Seeds = {
			g1: customBlob?.g1 || '#11C7B4',
			g2: customBlob?.g2 || '#11B981',
			a1: customBlob?.a1 || '#E08A00',
			a2: customBlob?.a2 || '#F2613F',
			a3: customBlob?.a3 || '#38BDF8',
		};
		const vars = deriveCustom(seeds, currentMood());
		for (const [k, val] of Object.entries(vars)) html.style.setProperty(k, val);
		html.setAttribute('data-theme-preset', 'custom');
		return;
	}

	if (preset === 'orbital' || !preset) {
		html.removeAttribute('data-theme-preset');
		return;
	}
	html.setAttribute('data-theme-preset', preset);
}
