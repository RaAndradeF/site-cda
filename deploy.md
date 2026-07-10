# Deploy no GitHub Pages — Companhia do Aventureiro

Guia passo a passo para publicar este site em `https://raandradef.github.io/site-cda/` usando GitHub Actions.

## O que estava dando errado

Investigando o histórico do repositório, encontrei duas causas concretas para os deploys anteriores falharem:

1. **O workflow estava no lugar errado.** O arquivo de deploy foi criado em `github/workflows/deploy.yml` (pasta sem o ponto). O GitHub só reconhece workflows dentro de **`.github/workflows/`** (com o ponto no início). Como a pasta estava errada, a Action nunca era registrada nem executada — o deploy simplesmente não acontecia, sem erro visível.
2. **`global.css` tinha diretivas do Tailwind v3.** Em algum teste anterior, o conteúdo de `src/styles/global.css` foi trocado para `@tailwind base; @tailwind components; @tailwind utilities;` (sintaxe do Tailwind v3). Este projeto usa **Tailwind v4**, que usa `@import "tailwindcss";` + bloco `@theme`. Essas diretivas antigas não fazem nada no v4, então o site ficaria sem estilo algum se essa versão fosse publicada.

Já corrigi os dois problemas no projeto local (detalhes na seção 1). Falta você revisar, commitar, enviar (push) e configurar o GitHub Pages pela interface do GitHub (seções 2 e 3).

---

## 1. O que já foi corrigido no projeto

Confira o `git status` — você verá estas mudanças pendentes de commit:

| Arquivo | O que mudou |
|---|---|
| `astro.config.mjs` | `site` voltou para `https://raandradef.github.io` e `base` voltou para `/site-cda` (necessário porque o site é publicado em um subcaminho, não em um domínio próprio) |
| `.github/workflows/deploy.yml` | **Novo arquivo**, no lugar certo (com o ponto). Workflow limpo que builda e publica o site a cada push na branch `master` |
| `github/workflows/deploy.yml` | Removido (pasta errada, sem o ponto) |
| `src/styles/global.css` | Revertido para a sintaxe correta do Tailwind v4 (`@import "tailwindcss";`) |
| `tailwind.config.js` | Removido — este projeto **não usa** esse arquivo; a configuração do tema fica inteira em `src/styles/global.css` (bloco `@theme`), que é como o Tailwind v4 funciona |

Conteúdo do novo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install, build, and upload your site
        uses: withastro/action@v3

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

A action `withastro/action` já sabe rodar `npm install` + `npm run build` e empacotar a pasta `dist/` corretamente — não precisa escrever esses passos manualmente.

Já rodei `npm run build` localmente com a configuração corrigida e confirmei que os 40 arquivos são gerados sem erro, com todos os links internos prefixados com `/site-cda/`.

### O que você precisa fazer agora (linha de comando)

Na raiz do projeto (`c:\Projetos\site-cda`):

```bash
git add astro.config.mjs src/styles/global.css .github/workflows/deploy.yml tailwind.config.js github/workflows/deploy.yml
git commit -m "Corrige localização do workflow e configuração do deploy no GitHub Pages"
git push origin master
```

> `git add` num caminho que já foi apagado do disco (`tailwind.config.js` e o `github/workflows/deploy.yml` antigo) marca a remoção corretamente — não precisa de `git rm`.

Depois do `push`, o workflow dispara automaticamente (veja a seção 3 para acompanhar).

---

## 2. Configuração necessária no GitHub (uma única vez)

1. Acesse o repositório: `https://github.com/RaAndradeF/site-cda`
2. Vá em **Settings** (aba do repositório, não da conta)
3. No menu lateral, clique em **Pages**
4. Em **Build and deployment → Source**, selecione **GitHub Actions** (não "Deploy from a branch")
5. Não é preciso configurar mais nada nessa tela — nenhum domínio customizado, nenhuma branch `gh-pages` manual. A Action cuida de tudo.

Isso só precisa ser feito uma vez. Se a opção já estiver em "GitHub Actions", pode pular esta etapa.

---

## 3. Acompanhar e validar o deploy

1. No repositório, vá na aba **Actions**.
2. Você deve ver um workflow chamado **"Deploy to GitHub Pages"** rodando (círculo amarelo) logo após o `git push`. Se não aparecer nenhum workflow, o arquivo não está no lugar certo — confirme que o caminho é exatamente `.github/workflows/deploy.yml` (pasta oculta, começando com ponto).
3. Clique no workflow em execução para ver os logs em tempo real. Ele tem dois jobs: `build` e `deploy`, nessa ordem.
4. Quando os dois jobs ficarem com ✅ verde, o site está publicado.
5. Acesse: **`https://raandradef.github.io/site-cda/`**

Se preferir disparar o deploy manualmente sem precisar de um novo commit, use o botão **"Run workflow"** na aba Actions (funciona porque o workflow tem `workflow_dispatch` configurado).

### Checklist rápido de verificação no site publicado

- [ ] A home carrega com a paleta de cores correta e o player em destaque
- [ ] O menu de navegação funciona e o item ativo fica destacado em amarelo
- [ ] `/podcast` lista os episódios e a busca filtra corretamente
- [ ] Uma página de episódio individual (ex: `/podcast/cda-zona-de-comando-001`) abre e o player toca
- [ ] `/rss.xml` retorna XML válido

---

## 4. Problemas comuns (troubleshooting)

| Sintoma | Causa provável | Solução |
|---|---|---|
| Nenhum workflow aparece na aba Actions | Arquivo fora de `.github/workflows/` (ex: `github/workflows/`, sem o ponto) | Confirme o caminho exato com `git ls-files \| grep workflows` |
| Workflow aparece mas falha no job `build` | Erro de build (dependência faltando, TypeScript, etc.) | Abra o log do job `build` na aba Actions e leia o erro — geralmente aparece exatamente qual arquivo/linha falhou |
| Deploy funciona, mas todas as páginas dão 404 | `base` não corresponde ao nome do repositório, ou `Source` nas configurações de Pages não está em "GitHub Actions" | Confira `astro.config.mjs` (`base: '/site-cda'`) e a configuração da seção 2 |
| Site publica mas aparece sem nenhum estilo (CSS quebrado) | `global.css` com sintaxe do Tailwind v3 (`@tailwind base/components/utilities`) em vez da v4 | Já corrigido nesta rodada — confirme que o arquivo local tem `@import "tailwindcss";` no topo |
| Links internos (menu, cards de episódio) levam para página em branco/404 | Alguma página ou componente com link absoluto hardcoded (`href="/podcast"`) em vez de usar o helper `withBase()` | Todos os componentes já usam `withBase()` de `src/lib/site.ts` — se criar novos links internos, sempre use esse helper |
| Site publicado mostra conteúdo antigo | Cache do navegador ou do GitHub Pages (propagação leva ~1 a 10 minutos) | Aguarde alguns minutos e recarregue com Ctrl+Shift+R (hard refresh) |
| `workflow_dispatch` não aparece na aba Actions | O workflow ainda não foi enviado (push) para a branch `master` | GitHub só mostra o botão "Run workflow" depois que o arquivo do workflow existe na branch padrão |

---

## 5. Limpeza opcional (branches de teste antigas)

O histórico do repositório tem branches criadas durante as tentativas anteriores de deploy: `gh-pages` e `githubpages`. Elas não são mais necessárias com o fluxo via GitHub Actions (que não usa nenhuma branch de build separada — publica direto a partir de `master`).

Isso é **opcional** e não afeta o deploy atual. Só remova se tiver certeza de que não precisa mais delas:

```bash
# apagar no GitHub (remoto)
git push origin --delete gh-pages
git push origin --delete githubpages

# apagar localmente, se existirem
git branch -D gh-pages githubpages
```

---

## Resumo do fluxo final

Depois da configuração inicial (seção 2, feita uma única vez), o processo do dia a dia é:

1. Editar o site normalmente
2. `git add`, `git commit`, `git push origin master`
3. A Action builda e publica sozinha em 1–2 minutos
4. Conferir em `https://raandradef.github.io/site-cda/`

Nenhum passo manual de build ou upload é necessário depois disso.
