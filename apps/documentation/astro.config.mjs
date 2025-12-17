// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Documentation',
			description: 'Official documentation for Orbis',
			logo: {
				src: './src/assets/logo.png',
			},
			customCss: [
				'./src/styles/custom.css',
			],
			social: [
				{ 
					icon: 'github', 
					label: 'GitHub', 
					href: 'https://github.com/orbisplace/orbis' 
				},
				{ 
					icon: 'discord', 
					label: 'Discord', 
					href: 'https://discord.gg/orbis' 
				},
				{ 
					icon: 'x.com', 
					label: 'X (Twitter)', 
					href: 'https://x.com/orbisplace' 
				},
			],
			components: {
				ThemeSelect: './src/components/ThemeSelect.astro',
			},
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Welcome', slug: 'index' },
						{ label: 'Quick Start', slug: 'guides/quick-start' },
					],
				},
				{
					label: 'Guides',
					autogenerate: { directory: 'guides' },
				},
				{
					label: 'API Reference',
					autogenerate: { directory: 'reference' },
				},
			],
			head: [
				{
					tag: 'meta',
					attrs: { property: 'og:image', content: '/og-image.png' },
				},
			],
		}),
	],
});
