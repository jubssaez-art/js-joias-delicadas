#!/usr/bin/env node
/* ===========================================================
   GERADOR DE FEED DE DADOS — JS Joias Delicadas

   Monta o mesmo catálogo que a loja mostra e escreve feed.xml
   no formato de feed de produtos do Facebook/Instagram
   (RSS 2.0 com o namespace g:). O mesmo arquivo serve os tres
   canais gratuitos: Meta Commerce Manager, Google Merchant
   Center (listagens gratuitas) e Pinterest Catalogs.

   Uso:  node tools/gerar-feed.mjs
   (também roda sozinho no deploy — .github/workflows/deploy.yml)

   No Commerce Manager: Catálogo → Fontes de dados → Feed de dados
   → agendar busca por URL, apontando para

     https://jubssaez-art.github.io/js-joias-delicadas/feed.xml

   Rode tools/gerar-catalogo.mjs antes: o feed lê o catálogo já
   gerado, então nenhuma regra de nome de arquivo vive aqui.
   Endereço do site pode vir de SITE_URL (útil em domínio próprio).
   =========================================================== */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ, SITE, LOJA, lerCatalogo, secaoDe, url } from './ler-catalogo.mjs';

const SAIDA = join(RAIZ, 'feed.xml');
const MOEDA = 'BRL';

const produtos = lerCatalogo();

// ---------- feed ----------

const escapar = (t) => String(t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const dinheiro = (valor) => `${Number(valor).toFixed(2)} ${MOEDA}`;
const tag = (nome, valor) => `      <${nome}>${escapar(valor)}</${nome}>`;

// Acabamento vira cor do anúncio: Google e Pinterest usam esse campo para
// agrupar "anel dourado" com quem busca por cor.
function corDe(p) {
  const texto = `${p.name} ${p.tag || ''}`;
  if (/dourad|ouro/i.test(texto)) return 'Dourado';
  if (/prata|r[oó]dio/i.test(texto)) return 'Prata';
  return '';
}

// Frete grátis acima de R$ 150 é a régua da vitrine. Abaixo disso o valor muda
// por CEP, então só entra no feed se FRETE_BRL for informado no deploy —
// declarar frete errado gera reprovação no Merchant Center.
const FRETE_GRATIS_ACIMA = 150;
const FRETE_PADRAO = Number(process.env.FRETE_BRL || '') || null;
const freteDe = (p) => (p.price >= FRETE_GRATIS_ACIMA ? 0 : FRETE_PADRAO);

function item(p) {
  const linhas = [
    tag('g:id', p.id),
    tag('g:title', p.name),
    tag('g:description', p.desc || `${p.name} — semi-joia ${secaoDe(p).toLowerCase()} da ${LOJA}.`),
    tag('g:link', `${url('produto.html')}?id=${encodeURIComponent(p.id)}`),
    tag('g:image_link', url(p.image))
  ];
  if (p.imageAlt) linhas.push(tag('g:additional_image_link', url(p.imageAlt)));
  linhas.push(
    tag('g:availability', p.soldOut ? 'out of stock' : 'in stock'),
    tag('g:condition', 'new'),
    tag('g:brand', LOJA),
    // Preço cheio no g:price e o promocional no g:sale_price: é assim que o
    // Meta mostra o "de/por" que a vitrine já exibe.
    tag('g:price', dinheiro(p.oldPrice && p.oldPrice > p.price ? p.oldPrice : p.price))
  );
  if (p.oldPrice && p.oldPrice > p.price) linhas.push(tag('g:sale_price', dinheiro(p.price)));
  linhas.push(
    tag('g:product_type', secaoDe(p)),
    tag('g:google_product_category', 'Apparel & Accessories > Jewelry'),
    tag('g:material', (p.details || []).find(d => /ouro|ródio|rodio|prata/i.test(d)) || 'Ouro 18k'),
    // Peça de catálogo próprio não tem código de barras. Sem esta linha o Google
    // reprova o produto por identificador ausente — e com ela não se envia
    // g:gtin nem g:mpn.
    tag('g:identifier_exists', 'no'),
    tag('g:age_group', /\bkids\b/.test(p.categories || '') ? 'kids' : 'adult'),
    tag('g:gender', 'female'),
    tag('g:custom_label_0', secaoDe(p))
  );
  const cor = corDe(p);
  if (cor) linhas.push(tag('g:color', cor));
  const frete = freteDe(p);
  if (frete !== null) {
    linhas.push(
      '      <g:shipping>',
      `        <g:country>BR</g:country>`,
      `        <g:price>${escapar(dinheiro(frete))}</g:price>`,
      '      </g:shipping>'
    );
  }
  return `    <item>\n${linhas.join('\n')}\n    </item>`;
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- GERADO AUTOMATICAMENTE — não edite à mão.
     Recriar: node tools/gerar-feed.mjs -->
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapar(LOJA)}</title>
    <link>${escapar(SITE)}</link>
    <description>Semi-joias banhadas a ouro 18k e ródio branco, antialérgicas e com 1 ano de garantia.</description>
${produtos.map(item).join('\n')}
  </channel>
</rss>
`;

writeFileSync(SAIDA, xml);

const disponiveis = produtos.filter(p => !p.soldOut).length;
console.log(`${produtos.length} produto(s) → feed.xml (${disponiveis} disponível(is), ${produtos.length - disponiveis} esgotado(s))`);
console.log(`URL do feed: ${url('feed.xml')}`);
