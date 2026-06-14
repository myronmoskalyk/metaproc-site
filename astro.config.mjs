// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

// Production domain — evidenced by the Auth0 roles namespace https://metaproc.app/.
// Confirm/replace before public launch if the real domain differs.
const SITE = 'https://metaproc.app';

// https://astro.build/config
export default defineConfig({
	site: SITE,
	vite: {
		// Tailwind v4 — configured entirely in CSS (src/styles/global.css via @import "tailwindcss").
		plugins: [tailwindcss()],
	},
	integrations: [
		// Docs live under /docs/* — the marketing landing page owns the site root (src/pages/index.astro).
		starlight({
			title: 'MetaProc Docs',
			disable404Route: true, // let the Astro app own the global 404, not Starlight
			customCss: ['./src/styles/global.css'],
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/myronmoskalyk/metaproc' },
			],
			// Docs files live under src/content/docs/docs/* so every route is /docs/*,
			// leaving the site root (/) to the marketing landing page.
			sidebar: [
				{ label: 'Overview', slug: 'docs' },
				{
					label: 'Getting started',
					items: [
						{ label: 'Quickstart — your first meta-analysis', slug: 'docs/quickstart' },
						{ label: 'Web vs desktop', slug: 'docs/web-vs-desktop' },
					],
				},
				{
					label: 'Reference',
					items: [
						// Synced one-way from the app repo by scripts/sync-docs.mjs — do not hand-edit.
						{ label: 'Product manual (generated)', slug: 'docs/manual' },
					],
				},
			],
		}),
	],
});
