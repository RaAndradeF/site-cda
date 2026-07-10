// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import partytown from '@astrojs/partytown';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config

export default defineConfig({
  site: 'https://raandradef.github.io/site-cda',
  base: '/site-cda/',
  integrations: [react(), partytown(), tailwindcss()],
  vite: {
    //plugins: [tailwindcss()] // Alterado para integrations
  }
});
