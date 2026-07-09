// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import partytown from '@astrojs/partytown';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config

export default defineConfig({
  site: 'https://raandradef.github.io',
  integrations: [react(), partytown()],
  vite: {
    plugins: [tailwindcss()]
  }
});
