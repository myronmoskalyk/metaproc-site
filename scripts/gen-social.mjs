// Generate the social-share card (og:image) and the apple-touch-icon from
// inline SVG via sharp. Run from the site root: `node scripts/gen-social.mjs`.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0B1517"/><stop offset="1" stop-color="#0E1E1C"/>
    </linearGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#11C7B4"/><stop offset="1" stop-color="#11B981"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.8" cy="0.26" r="0.55">
      <stop offset="0" stop-color="#11C7B4" stop-opacity="0.20"/>
      <stop offset="1" stop-color="#11C7B4" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g transform="translate(96,92)">
    <rect x="36" y="2" width="7" height="58" rx="3.5" fill="#11C7B4" opacity="0.45"/>
    <polygon points="39,14 78,31 39,48 0,31" fill="url(#brand)"/>
  </g>
  <text x="94" y="306" font-family="Arial, Helvetica, sans-serif" font-size="120" font-weight="800" fill="url(#brand)" letter-spacing="-4">MetaProc</text>
  <text x="98" y="372" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="600" fill="#DCE6E4">Reproducible meta-analysis in your browser</text>
  <text x="98" y="426" font-family="Arial, Helvetica, sans-serif" font-size="29" font-weight="400" fill="#8FA6A2">Data to forest plot to GRADE, with the exact R code for every step.</text>
  <g transform="translate(98,486)" stroke-linecap="round">
    <line x1="0" y1="0" x2="190" y2="0" stroke="#2A3B38" stroke-width="2"/>
    <line x1="44" y1="0" x2="126" y2="0" stroke="#11C7B4" stroke-width="6"/>
    <circle cx="82" cy="0" r="7" fill="#11C7B4"/>
    <line x1="0" y1="34" x2="190" y2="34" stroke="#2A3B38" stroke-width="2"/>
    <line x1="70" y1="34" x2="158" y2="34" stroke="#11B981" stroke-width="6"/>
    <circle cx="110" cy="34" r="7" fill="#11B981"/>
    <polygon points="64,66 100,56 136,66 100,76" fill="#E08A00"/>
  </g>
  <text x="1104" y="588" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="600" fill="#6C817E">metaproc.app</text>
</svg>`;

const touch = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <defs>
    <linearGradient id="b" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#13CDB8"/><stop offset="1" stop-color="#0E9C84"/>
    </linearGradient>
  </defs>
  <rect width="180" height="180" rx="40" fill="url(#b)"/>
  <rect x="86" y="42" width="8" height="96" rx="4" fill="#ffffff" opacity="0.55"/>
  <polygon points="90,64 132,90 90,116 48,90" fill="#ffffff"/>
</svg>`;

mkdirSync('public/og', { recursive: true });
await sharp(Buffer.from(og)).png().toFile('public/og/metaproc-og.png');
await sharp(Buffer.from(touch)).png().toFile('public/apple-touch-icon.png');
console.log('generated public/og/metaproc-og.png (1200x630) and public/apple-touch-icon.png (180x180)');
