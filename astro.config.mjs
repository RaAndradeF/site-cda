// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import partytown from '@astrojs/partytown';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config

export default defineConfig({
  // Para deploy no GitHub Pages, descomente as linhas abaixo e configure o site e base corretamente
  //site: 'https://raandradef.github.io',
  //base: '/site-cda',
  // Para teste em localhost
  site: 'https://companhiadoaventureiro.com.br',
  integrations: [react(), partytown()],
  vite: {
    plugins: [tailwindcss()]
  }
});
