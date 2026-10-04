// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://rishu.blog',
  integrations: [sitemap()],
  markdown: {
    // a soft pastel theme for code blocks
    shikiConfig: { theme: 'catppuccin-latte' },
  },
});
