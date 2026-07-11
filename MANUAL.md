# Manual do Site — Companhia do Aventureiro

## 1. Introducao

Este projeto e o site oficial do podcast **Companhia do Aventureiro**, construido com [Astro 7](https://astro.build) usando ilhas interativas em React, estilizacao com Tailwind CSS v4, player de audio com Howler.js e busca client-side com Fuse.js.

O site consome os episodios diretamente do **feed RSS real** do podcast, hospedado no Spotify for Creators (Anchor):

```
https://anchor.fm/s/1ec0a0f8/podcast/rss
```

Ou seja, voce nao precisa cadastrar episodios manualmente para o site funcionar: ao publicar um novo episodio no Spotify for Creators, ele aparece automaticamente no site no proximo build/deploy.

Site de referencia usado como inspiracao de layout e funcionalidades: [doisempregos.com.br](https://www.doisempregos.com.br/).

### Pre-requisitos

- **Node.js 22.12 ou superior** (definido em `package.json` -> `engines.node`)
- **npm** (vem junto com o Node.js)

Verifique sua versao com:

```bash
node -v
npm -v
```

---

## 2. Comandos Principais

Todos os comandos abaixo devem ser executados na raiz do projeto (`c:\Projetos\site-cda`).

| Comando | Descricao |
|---|---|
| `npm install` | Instala todas as dependencias do projeto |
| `npm run dev` | Inicia o servidor de desenvolvimento local (com hot-reload) |
| `npm run build` | Gera o build de producao estatico na pasta `dist/` |
| `npm run preview` | Serve localmente o build gerado por `npm run build`, para conferir antes do deploy |
| `npm run astro` | Executa a CLI do Astro diretamente (ex: `npm run astro -- add <integracao>`) |

Por padrao, `npm run dev` sobe o servidor em `http://localhost:4321`.

---

## 3. Estrutura de Pastas

```
site-cda/
├── astro.config.mjs        # Configuracao do Astro (integracoes React, Partytown, Tailwind)
├── tsconfig.json            # Configuracao do TypeScript
├── package.json              # Dependencias e scripts npm
├── MANUAL.md                 # Este manual
├── public/                   # Arquivos estaticos servidos "como estao" (favicon, etc.)
└── src/
    ├── content.config.ts     # Definicao do schema da collection "episodios"
    ├── content/
    │   └── episodios/        # Episodios cadastrados manualmente em .md (opcional)
    ├── layouts/
    │   ├── Base.astro        # Layout base: <html>, <head>, SEO, Header, Footer
    │   └── Episode.astro     # Layout de pagina de episodio (player + shownotes + navegacao)
    ├── components/
    │   ├── Header.astro       # Cabecalho com navegacao e menu hamburger mobile
    │   ├── Footer.astro       # Rodape com links e redes sociais
    │   ├── Hero.astro         # Secao hero da home
    │   ├── PodcastLinks.astro # Botoes de link para as plataformas de audio
    │   ├── EpisodeCard.astro  # Card estatico de episodio (usado na Home)
    │   ├── EpisodeList.tsx    # Ilha React: grid de episodios + busca (Fuse.js)
    │   ├── SearchBar.tsx      # Ilha React: campo de busca com debounce
    │   ├── Player.tsx         # Ilha React: player de audio (Howler.js)
    │   └── ContactForm.astro  # Formulario reutilizado em /contato e /envie
    ├── lib/
    │   ├── fetchRss.ts        # Busca e parseia o feed RSS real (funcao central de dados)
    │   └── site.ts             # Constantes do site: nome, tagline e links (redes/plataformas)
    ├── pages/
    │   ├── index.astro         # Home
    │   ├── podcast.astro        # Listagem de episodios com busca
    │   ├── podcast/
    │   │   └── [slug].astro     # Pagina individual do episodio (rota dinamica)
    │   ├── contato.astro
    │   ├── sobre.astro
    │   ├── envie.astro
    │   ├── apoie.astro
    │   └── rss.xml.ts           # Endpoint que gera o feed RSS do proprio site
    └── styles/
        └── global.css           # Import do Tailwind v4 + paleta de cores customizada (@theme)
```

`layouts/` fornece a "moldura" (HTML base, head, header, footer) reutilizada por varias paginas; `pages/` define o conteudo especifico de cada rota e importa o layout que precisar.

---

## 4. Customizacao de Cores e Tema (Tailwind v4)

O projeto usa **Tailwind CSS v4**, que mudou a forma de configurar temas: nao existe mais `tailwind.config.js` com um objeto `theme.extend.colors` em JavaScript. Em vez disso, a configuracao e feita **diretamente no CSS**, dentro de um bloco `@theme`.

### Onde customizar

Arquivo: `src/styles/global.css`

```css
@import "tailwindcss";

@theme {
  /* Paleta de cores do projeto */
  --color-primary: #1d76a3;
  --color-primary-dark: #0d4a6f;
  --color-primary-light: #4a9bc4;

  --color-secondary: #59bdf0;
  --color-secondary-dark: #2a8ec4;
  --color-secondary-light: #8fd4f8;

  --color-accent-red: #f00e25;
  --color-accent-red-dark: #b80a1a;
  --color-accent-red-light: #ff4d5a;

  --color-accent-yellow: #fff847;
  --color-accent-yellow-dark: #d4c91a;
  --color-accent-yellow-light: #fffb99;

  --color-accent-olive: #ada81a;
  --color-accent-olive-dark: #7a7a12;
  --color-accent-olive-light: #d4cf4d;

  --color-text-primary: #ffffff;
  --color-text-secondary: #e0e0e0;
  --color-text-muted: #a0a0a0;

  --color-bg-primary: #0d4a6f;
  --color-bg-secondary: #1d76a3;
  --color-bg-card: #2a8ec4;
  --color-bg-hover: #4a9bc4;
}
```

Cada variavel `--color-nome` declarada dentro de `@theme` gera **automaticamente** classes utilitarias do Tailwind, no padrao `{propriedade}-{nome}`. Por exemplo, `--color-bg-primary` gera as classes:

- `bg-bg-primary` — usa a cor como `background-color`
- `text-bg-primary` — usa a cor como `color` (texto)
- `border-bg-primary` — usa a cor como `border-color`

Nao e preciso registrar nada em outro lugar: o Tailwind v4 le esse bloco `@theme` no momento do build e gera as classes sob demanda, com base no que e efetivamente usado no HTML/JSX/Astro.

### Todas as variaveis de cor do projeto e suas funcoes

| Variavel | Valor | Uso recomendado |
|---|---|---|
| `--color-primary` | `#1d76a3` | Cor de marca principal (azul) |
| `--color-primary-dark` | `#0d4a6f` | Fundo principal do site (`bg-bg-primary`) |
| `--color-primary-light` | `#4a9bc4` | Bordas, hover states, destaques suaves |
| `--color-secondary` | `#59bdf0` | Fundo secundario (`bg-bg-secondary`), header/footer |
| `--color-secondary-dark` | `#2a8ec4` | Fundo dos cards de episodio (`bg-bg-card`) |
| `--color-secondary-light` | `#8fd4f8` | Texto sobre fundos escuros, subtitulos |
| `--color-accent-red` | `#f00e25` | Cor de destaque/CTA (botoes de acao, play do player) |
| `--color-accent-red-dark` | `#b80a1a` | Hover dos botoes vermelhos |
| `--color-accent-red-light` | `#ff4d5a` | Variacoes claras de destaque |
| `--color-accent-yellow` | `#fff847` | Cor de destaque secundaria (titulos, links ativos, CTA alternativo) |
| `--color-accent-yellow-dark` | `#d4c91a` | Hover de elementos amarelos |
| `--color-accent-yellow-light` | `#fffb99` | Variacoes claras de amarelo |
| `--color-accent-olive` | `#ada81a` | Cor de apoio, usada com moderacao |
| `--color-accent-olive-dark` / `-light` | `#7a7a12` / `#d4cf4d` | Variacoes da cor de apoio |
| `--color-text-primary` | `#ffffff` | Texto principal (`text-text-primary`) |
| `--color-text-secondary` | `#e0e0e0` | Texto secundario, paragrafos (`text-text-secondary`) |
| `--color-text-muted` | `#a0a0a0` | Texto auxiliar, datas, legendas (`text-text-muted`) |
| `--color-bg-primary` | `#0d4a6f` | Fundo principal (`body`) |
| `--color-bg-secondary` | `#1d76a3` | Fundo do header/footer |
| `--color-bg-card` | `#2a8ec4` | Fundo dos cards (episodios, formularios) |
| `--color-bg-hover` | `#4a9bc4` | Estado de hover de botoes/cards |

### Tailwind v4 (CSS-based) vs Tailwind v3 (config JS)

| | Tailwind v3 | Tailwind v4 (usado neste projeto) |
|---|---|---|
| Onde configurar | `tailwind.config.js`, objeto `theme.extend` | Bloco `@theme` dentro do proprio CSS |
| Integracao com Astro | Plugin `@astrojs/tailwind` | Plugin de build `@tailwindcss/vite` (ja configurado em `astro.config.mjs`) |
| Geracao de classes | Baseada no `content: []` do config | Baseada em varredura automatica dos arquivos do projeto |
| Extensibilidade | JavaScript (funcoes, plugins) | Variaveis CSS nativas (`--nome: valor`) |

Este projeto **nao usa** `@astrojs/tailwind` nem `tailwind.config.js` — toda a configuracao vive em `src/styles/global.css` e no plugin `tailwindcss()` importado em `astro.config.mjs`.

### Como adicionar uma nova cor

1. Abra `src/styles/global.css`.
2. Adicione uma nova linha dentro do bloco `@theme`, por exemplo:
   ```css
   --color-accent-purple: #8b5cf6;
   ```
3. Use a nova classe diretamente em qualquer componente: `bg-accent-purple`, `text-accent-purple`, `border-accent-purple`.
4. Nao e necessario reiniciar o servidor — o Vite detecta a mudanca automaticamente em modo `dev`.

### Como criar variantes (`hover:`, `dark:`, etc.)

O Tailwind v4 mantem a mesma sintaxe de variantes de sempre — basta prefixar a classe utilitaria:

```html
<button class="bg-accent-red hover:bg-accent-red-dark transition-colors">
  Enviar
</button>
```

Para variantes de modo escuro (`dark:`), o Tailwind v4 usa por padrao a media query `prefers-color-scheme`. Como este site ja e "dark by default" (fundo azul escuro fixo), normalmente nao ha necessidade de um tema claro/escuro alternativo — mas caso queira adicionar um, defina classes com o prefixo `dark:`, por exemplo `dark:bg-bg-primary`, e ative a estrategia baseada em classe com:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

---

## 5. Gerenciamento de Episodios

O site tem **duas fontes possiveis** de episodios:

1. **Feed RSS real (fonte principal)** — usado em `/podcast`, `/podcast/[slug]` e na Home. Nao exige nenhuma acao manual: qualquer episodio publicado no Spotify for Creators aparece automaticamente no proximo build.
2. **Content Collections (`src/content/episodios/*.md`)** — uma forma alternativa/manual de cadastrar episodios com controle total do conteudo (shownotes em Markdown, campos extras como `featured` e `guest`). Util caso voce queira, no futuro, desacoplar o site do feed RSS ou adicionar episodios "bonus" que nao estao no Spotify.

### 5.1 Schema dos Episodios

Definido em `src/content.config.ts`:

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const episodios = defineCollection({
  loader: glob({ base: 'src/content/episodios', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    audioUrl: z.string().url(),
    duration: z.string(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    thumbnail: z.string().optional(),
    guest: z.string().optional()
  })
});

export const collections = { episodios };
```

| Campo | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `title` | `string` | Sim | Titulo do episodio |
| `date` | `date` | Sim | Data de publicacao (formato `YYYY-MM-DD`) |
| `description` | `string` | Sim | Descricao/resumo do episodio |
| `audioUrl` | `string` (URL) | Sim | URL publica do arquivo de audio (MP3) |
| `duration` | `string` | Sim | Duracao no formato `MM:SS` ou `HH:MM:SS` |
| `tags` | `string[]` | Nao (default `[]`) | Palavras-chave para a busca |
| `featured` | `boolean` | Nao (default `false`) | Se `true`, pode ser destacado visualmente |
| `thumbnail` | `string` | Nao | URL da imagem de capa do episodio |
| `guest` | `string` | Nao | Nome de convidado(a), se houver |

### 5.2 Como Adicionar um Novo Episodio Manualmente

1. Crie um arquivo `.md` dentro de `src/content/episodios/`, com um nome de arquivo "slugificado" (sem espacos/acentos), ex: `029-dnd-one-shot.md`.
2. Preencha o frontmatter YAML com os campos da tabela acima.
3. Escreva o conteudo (shownotes) em Markdown, abaixo do frontmatter.
4. Rode `npm run dev` ou `npm run build` — o Astro sincroniza a collection automaticamente.
5. **Importante:** as paginas `/podcast` e `/podcast/[slug]` atualmente listam episodios vindos do **feed RSS**, nao da collection `episodios`. Se voce quiser que os `.md` manuais tambem apareçam nessas paginas, sera necessario combinar as duas fontes em `src/pages/podcast.astro` e `src/pages/podcast/[slug].astro` (mesclando o array vindo de `fetchPodcastFeed()` com `getCollection('episodios')`).

### 5.3 Exemplo de Frontmatter

```markdown
---
title: "CDA Zona de Comando 001"
date: 2025-02-25
description: "Bem vindos aventureiros esse e um piloto de um novo formato para falarmos de Magic, especificamente Commander."
audioUrl: "https://exemplo.com/audio/episodio-001.mp3"
duration: "33:52"
tags: ["magic", "commander", "card games"]
featured: false
thumbnail: "https://exemplo.com/capa/episodio-001.jpg"
guest: ""
---

Bem vindos aventureiros esse e um piloto de um novo formato para falarmos de Magic,
especificamente Commander.

## Links citados no episodio

- ...
```

Um exemplo real (com dados reais do feed) ja esta cadastrado em `src/content/episodios/cda-zona-de-comando-001.md`.

---

## 6. Player de Audio

- O player usa **Howler.js** (`howler` + `@types/howler`) encapsulado em um componente React: `src/components/Player.tsx`.
- Funcionalidades: play/pause, barra de progresso arrastavel (seek), exibicao de tempo atual/total, controle de volume e mudo.
- O player e renderizado como **ilha interativa** com a diretiva `client:load` (ver `src/layouts/Episode.astro` e `src/pages/index.astro`), ou seja, o JavaScript do player so carrega no navegador, mantendo o resto da pagina 100% estatica.
- O audio carregado e sempre o `audioUrl` do episodio — vindo do feed RSS (campo `<enclosure url="...">`) ou do frontmatter do `.md`, dependendo da fonte usada na pagina.

**Dica:** os arquivos de audio do podcast ja estao hospedados no CDN do Anchor/Spotify (via feed RSS), entao voce nao precisa hospedar nada por conta propria. Caso decida migrar os arquivos MP3 para outro provedor (ex: Cloudflare R2, AWS S3, Bunny.net), basta que a nova URL seja publica e aceite `Range requests` (necessario para o seek do player funcionar corretamente).

---

## 7. Busca de Episodios

- A busca usa **Fuse.js**, uma biblioteca de busca fuzzy 100% client-side (sem backend).
- Componentes envolvidos:
  - `src/components/SearchBar.tsx` — campo de texto controlado, com debounce de 250ms antes de disparar a busca.
  - `src/components/EpisodeList.tsx` — recebe a lista completa de episodios via props, monta o indice do Fuse (`keys: ['title', 'description', 'tags']`) e filtra os resultados conforme o usuario digita.
- A busca acontece inteiramente no navegador do usuario, sem chamadas de rede — por isso os resultados aparecem instantaneamente.
- Como os episodios vindos do RSS nao possuem `tags`, a busca por esses episodios considera apenas titulo e descricao. Episodios cadastrados manualmente via Content Collection podem ter `tags` para melhorar a relevancia da busca.

---

## 8. Paginas do Site

| Pagina | Arquivo | Descricao / Como customizar |
|---|---|---|
| Home | `src/pages/index.astro` | Hero (`Hero.astro`), player do episodio mais recente, secao "Conheca!" (descricao do canal do RSS), grid dos 3 episodios mais recentes e CTA para "Envie sua Historia". Para mudar a quantidade de episodios recentes, ajuste `feed.episodes.slice(1, 4)`. |
| Podcast | `src/pages/podcast.astro` | Lista todos os episodios do feed RSS com busca (`EpisodeList.tsx`). |
| Episodio | `src/pages/podcast/[slug].astro` | Rota dinamica gerada via `getStaticPaths()`, uma pagina por episodio do feed. Usa o layout `Episode.astro`, que renderiza o player, shownotes (HTML do RSS) e navegacao anterior/proximo. |
| Contato | `src/pages/contato.astro` | Formulario (`ContactForm.astro`) que monta um `mailto:` com os dados preenchidos. |
| Sobre | `src/pages/sobre.astro` | Descricao completa do canal (vinda do RSS) + `PodcastLinks.astro`. |
| Envie sua Historia | `src/pages/envie.astro` | Mesmo componente de formulario, com textos e assunto de e-mail diferentes. |
| Apoie | `src/pages/apoie.astro` | Cards estaticos com formas de apoiar o podcast (avaliar no Spotify, compartilhar, enviar sugestoes). |

Todas as paginas usam o layout `src/layouts/Base.astro`, que ja inclui `Header`, `Footer`, meta tags de SEO e Open Graph — basta passar `title` e `description` como props.

---

## 9. Feed RSS

- Gerado dinamicamente pelo endpoint `src/pages/rss.xml.ts` (um [Astro Endpoint](https://docs.astro.build/en/guides/endpoints/)), que reexporta os episodios obtidos de `fetchPodcastFeed()` em formato XML valido (RSS 2.0).
- URL do feed do site: `/rss.xml` (ex: `https://seu-dominio.com/rss.xml`).
- Esse feed **nao substitui** o feed original do Spotify for Creators — ele e um espelho gerado a partir dele, apontando para as paginas de episodio do proprio site (`/podcast/[slug]`) em vez do player do Spotify. Use-o caso queira submeter o site (em vez do Anchor) como fonte para agregadores.
- Para o cadastro oficial em Spotify, Apple Podcasts, Google Podcasts etc., continue usando o feed original do Anchor (`https://anchor.fm/s/1ec0a0f8/podcast/rss`), que e a fonte de verdade dos episodios.

---

## 10. Deploy

O site gera uma saida 100% estatica (`output: "static"`, o padrao do Astro) na pasta `dist/` apos `npm run build`. Isso permite hospedar em qualquer provedor de arquivos estaticos.

### Cloudflare Pages (recomendado)

1. Suba o projeto para um repositorio Git (GitHub, GitLab).
2. Em Cloudflare Pages, conecte o repositorio.
3. Configuracoes de build:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Nenhuma variavel de ambiente extra e necessaria — o build busca o feed RSS diretamente da internet no momento do build.

### Netlify

1. Conecte o repositorio Git.
2. **Build command:** `npm run build`
3. **Publish directory:** `dist`
4. O Netlify detecta o Astro automaticamente via `netlify.toml` (opcional) ou pela deteccao padrao de framework.

> **Atencao:** como as paginas de episodio (`/podcast/[slug]`) sao geradas em build time a partir do feed RSS (`getStaticPaths`), **um novo episodio publicado no Spotify so aparecera no site apos um novo build/deploy**. Configure um "build hook" agendado (ex: Cloudflare Pages Deploy Hook + cron externo, ou GitHub Actions com `schedule`) se quiser atualizacoes automaticas periodicas.

---

## 11. SEO

- Meta tags basicas (title, description, canonical, Open Graph, Twitter Card) sao centralizadas em `src/layouts/Base.astro` e podem ser sobrescritas por pagina via as props `title`, `description` e `image`:

  ```astro
  <Base title="Sobre" description="Descricao customizada da pagina" image="/imagem-og.jpg">
    ...
  </Base>
  ```

- O `<title>` de cada pagina segue o padrao `{title} | Companhia do Aventureiro` (exceto na Home, que usa apenas o nome do site).
- O dominio usado para gerar URLs canonicas e Open Graph vem de `site` em `astro.config.mjs` — atualize esse valor para o dominio final antes do deploy em producao.
- Como o site e gerado 100% estatico (HTML pre-renderizado), ele tende a pontuar bem em Lighthouse (>90) por padrao, desde que as imagens externas do feed RSS nao sejam excessivamente pesadas.
- Sitemap automatico **nao esta configurado** neste projeto. Para adicionar, instale a integracao oficial:
  ```bash
  npx astro add sitemap
  ```

---

## 12. Dicas de Customizacao Avancada

### Adicionar uma nova secao na Home

Edite `src/pages/index.astro` e adicione uma nova `<section>` entre as existentes, reaproveitando as classes de cor (`bg-bg-secondary`, `text-accent-yellow`, etc.) para manter a identidade visual.

### Modificar o menu do Header

Edite o array `navLinks` em `src/components/Header.astro`:

```ts
const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/podcast', label: 'Podcast' },
  // adicione novos itens aqui
];
```

O mesmo array e usado tanto na navegacao desktop quanto no menu mobile (hamburger), entao so precisa editar em um lugar.

### Modificar o Footer

Edite `src/components/Footer.astro`. Os links de contato/redes sociais vem centralizados em `src/lib/site.ts` (objeto `SITE_LINKS`) — atualize os valores la para refletir em Footer, Home, Sobre e Apoie ao mesmo tempo.

> **Nota:** os links `applePodcasts`, `googlePodcasts` e `loja` em `src/lib/site.ts` estao como placeholders (`'#'`) porque essas URLs reais nao foram fornecidas. Substitua pelos links reais assim que estiverem disponiveis.

### Adicionar Analytics (Google Analytics, Plausible, etc.)

Como o projeto ja tem `@astrojs/partytown` instalado e configurado como integracao, scripts de terceiros (Google Analytics, Meta Pixel, etc.) podem rodar em um Web Worker para nao impactar a performance da thread principal. Exemplo em `src/layouts/Base.astro`, dentro de `<head>`:

```astro
<script type="text/partytown" src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
<script type="text/partytown">
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXX');
</script>
```

Para Plausible (mais leve, sem necessidade de Partytown):

```astro
<script defer data-domain="seu-dominio.com" src="https://plausible.io/js/script.js"></script>
```

### Adicionar novas paginas

1. Crie um novo arquivo `.astro` em `src/pages/` (ex: `src/pages/parceiros.astro`).
2. Use o layout `Base` e siga o padrao das paginas existentes:
   ```astro
   ---
   import Base from '../layouts/Base.astro';
   ---
   <Base title="Parceiros" description="Nossos parceiros e apoiadores.">
     <section class="mx-auto max-w-3xl px-4 py-14">
       <h1 class="text-4xl font-black text-text-primary">Parceiros</h1>
     </section>
   </Base>
   ```
3. Adicione o link correspondente em `navLinks` (Header) e/ou no `Footer`, se fizer sentido para a navegacao.
