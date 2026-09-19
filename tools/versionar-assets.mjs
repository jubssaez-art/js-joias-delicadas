#!/usr/bin/env node
/* ===========================================================
   VERSIONADOR DE ASSETS — JS Joias Delicadas

   O GitHub Pages serve os arquivos com "cache-control: max-age=600".
   Sem versão na URL, uma publicação do painel de controle pode ficar
   até 10 minutos invisível para quem já visitou a loja.

   Este passo reescreve as tags dos HTMLs com ?v=<versão> na hora do
   deploy — só no artifact publicado, nada é commitado no repositório.

   Uso:  node tools/versionar-assets.mjs [versão]
   (roda sozinho no deploy — .github/workflows/deploy.yml)
   =========================================================== */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTMLS = ['index.html', 'joias.html', 'produto.html', 'admin.html'];
const ASSETS = ['data/produtos.js', 'data/catalogo-auto.js', 'script.js', 'produto.js', 'admin.js', 'style.css', 'studio.css'];

// Versão: argumento, SHA do commit no CI, ou o horário do deploy
const versao = (process.argv[2] || process.env.GITHUB_SHA || String(Date.now())).slice(0, 8);

let total = 0;

for (const arquivo of HTMLS) {
  const caminho = join(RAIZ, arquivo);
  let html;
  try { html = readFileSync(caminho, 'utf8'); } catch { continue; }

  let trocas = 0;
  for (const asset of ASSETS) {
    // Casa src="script.js" / href="style.css", com ou sem ?v= de uma execução anterior
    const alvo = new RegExp(`((?:src|href)=")${asset.replace(/[.]/g, '\\.')}(\\?v=[^"]*)?(")`, 'g');
    html = html.replace(alvo, (_, antes, __, depois) => {
      trocas++;
      return `${antes}${asset}?v=${versao}${depois}`;
    });
  }

  if (trocas) {
    writeFileSync(caminho, html);
    total += trocas;
    console.log(`  ${arquivo} — ${trocas} asset(s)`);
  }
}

console.log(`versão ${versao} aplicada em ${total} referência(s)`);
