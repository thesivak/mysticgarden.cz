import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://mysticgarden.cz',
  trailingSlash: 'always',
  output: 'static',
  devToolbar: {
    enabled: false,
  },
  integrations: [sitemap()],
});
