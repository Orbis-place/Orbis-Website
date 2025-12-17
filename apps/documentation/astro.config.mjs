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
			favicon: '/favicon.ico',
			customCss: [
				'./src/styles/custom.css',
			],
			social: [
				{ 
					icon: 'github', 
					label: 'GitHub', 
					href: 'https://github.com/Orbis-place' 
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
					],
				},
				{
					label: 'Tutorials',
					autogenerate: { directory: 'tutorials' },
				},
				{
					label: 'API',
					autogenerate: { directory: 'reference' },
				},
			],
			expressiveCode: {
				themes: ['github-dark'],
				styleOverrides: {
					borderRadius: '0.5rem',
					borderWidth: '1px',
				},
			},
			head: [
				{
					tag: 'meta',
					attrs: { property: 'og:image', content: '/og-image.png' },
				},
			],
		}),
	],
});
