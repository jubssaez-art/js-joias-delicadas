#!/usr/bin/env node
/* ===========================================================
   SITEMAP — JS Joias Delicadas

   Escreve sitemap.xml (home + uma URL por peça à venda) e o
   robots.txt que aponta para ele. Serve o Google Search e as
   listagens gratuitas do Merchant Center: sem sitemap, uma
   loja de página única praticamente não é rastreada.

   Uso:  node tools/gerar-sitemap.mjs
   =========================================================== */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ, SITE, lerCatalogo, url } from './ler-catalogo.mjs';

const escapar = (t) => String(t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

// Peça esgotada sai do sitemap: URL que não vende vira rastreio desperdiçado.
const produtos = lerCatalogo().filter(p => !p.soldOut);

const enderecos = [
  { loc: SITE, prioridade: '1.0' },
  { loc: url('joias.html'), prioridade: '0.9' },
  ...produtos.map(p => ({
    loc: `${url('produto.html')}?id=${encodeURIComponent(p.id)}`,
    prioridade: '0.8'
  }))
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- GERADO AUTOMATICAMENTE — não edite à mão.
     Recriar: node tools/gerar-sitemap.mjs -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${enderecos.map(e => `  <url>\n    <loc>${escapar(e.loc)}</loc>\n    <priority>${e.prioridade}</priority>\n  </url>`).join('\n')}
</urlset>
`;

writeFileSync(join(RAIZ, 'sitemap.xml'), xml);

// Caminhos absolutos a partir da raiz do domínio: em subdiretório (github.io)
// "/admin.html" apontaria para o lugar errado.
const base = new URL(SITE).pathname;

// Só a raiz do domínio é lida pelos robôs. Enquanto o site morar em
// jubssaez-art.github.io/js-joias-delicadas/ este arquivo é ignorado — vale a
// partir do domínio próprio. O sitemap, esse, dá para enviar à mão no
// Search Console e funciona hoje.
writeFileSync(join(RAIZ, 'robots.txt'),
`# GERADO AUTOMATICAMENTE — recriar: node tools/gerar-sitemap.mjs
User-agent: *
Allow: ${base}
Disallow: ${base}admin.html
Disallow: ${base}marketplace.html
Disallow: ${base}pinterest.html
Disallow: ${base}acesso/

Sitemap: ${url('sitemap.xml')}
`);

console.log(`${enderecos.length} URL(s) → sitemap.xml + robots.txt`);
