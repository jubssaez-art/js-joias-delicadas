#!/usr/bin/env node
/* ===========================================================
   FILA DO MARKETPLACE — página de postagem manual

   Escreve marketplace.html: uma ficha por peça com a foto, o
   título dentro do limite de 100 caracteres, a descrição pronta
   e o botão de baixar a foto. Existe porque o Facebook
   Marketplace não tem API para joia — o anúncio é criado à mão,
   do perfil pessoal, e esta página é o balcão de apoio.

   Fica fora do sitemap e com noindex: é ferramenta de trabalho,
   não vitrine.

   Uso:  node tools/gerar-marketplace.mjs
   =========================================================== */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ, lerCatalogo, secaoDe } from './ler-catalogo.mjs';
import { dinheiro, acabamentoDe, textos, ANUNCIO_PAGO } from './textos-anuncio.mjs';
import { esc, slug, CHECK, BAIXAR, campo, ESTILO, comportamento } from './balcao.mjs';

const SAIDA = join(RAIZ, 'marketplace.html');

const FIXOS = [
  ['Categoria', 'Roupas e acessórios › Joias e acessórios'],
  ['Condição', 'Novo'],
  ['Anunciar como estoque', 'marque, senão o anúncio some na primeira venda'],
  ['Publicar em grupos', 'até 10 grupos de compra e venda da sua região'],
  ['Localização', 'sua cidade — o comprador busca por raio'],
  ['Nada de link no texto', 'o site vai na resposta do chat, não na descrição']
];

const produtos = lerCatalogo().filter(p => !p.soldOut);
const secoes = [...new Set(produtos.map(secaoDe))];

const fichas = produtos.map((p, i) => {
  const t = textos(p);
  const acabamento = acabamentoDe(p);
  const material = /ouro/i.test(acabamento) ? 'ouro' : 'prata';
  const extensao = (p.image.split('.').pop() || 'png').split('?')[0];
  const arquivo = `${slug(p.name)}.${extensao}`;
  return `<article class="ficha" data-id="${esc(p.id)}" data-secao="${esc(secaoDe(p))}" data-busca="${esc((p.name + ' ' + secaoDe(p)).toLowerCase())}" data-feito="0">
  <figure class="foto">
    <img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" width="600" height="600">
    <figcaption>
      <span>${esc(arquivo)}</span>
      <a class="botao" href="${esc(p.image)}" download="${esc(arquivo)}">${BAIXAR} Baixar foto</a>
    </figcaption>
  </figure>
  <div class="corpo">
    <div class="cab">
      <div>
        <h3 class="nome">${esc(p.name)}</h3>
        <div class="tags"><span class="tag">${esc(secaoDe(p))}</span><span class="tag mat-${material}">${esc(acabamento.toLowerCase())}</span></div>
      </div>
      <div class="preco">${dinheiro(p.price)}<small>5% off no Pix</small></div>
    </div>
    ${campo('Título', t.tituloMarketplace, `${t.tituloMarketplace.length}/100`)}
    ${campo('Descrição', t.descricaoMarketplace)}
    <div class="rodape">
      <label class="marcar"><input type="checkbox" data-feito-input> Publicado no Marketplace</label>
      <span class="ordem">${String(i + 1).padStart(3, '0')} / ${String(produtos.length).padStart(3, '0')}</span>
    </div>
  </div>
</article>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Fila do Marketplace — JS Joias Delicadas</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Karla:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
${ESTILO}
</style>
</head>
<body>
<div class="wrap">
<header>
  <div>
    <p class="eyebrow">JS Joias Delicadas · Facebook Marketplace</p>
    <h1>Fila do <em>Marketplace</em></h1>
    <p class="lede">${produtos.length} peças com foto, título dentro do limite e descrição prontos. Publique 5 a 10 por dia, do perfil pessoal, e marque as que já foram.</p>
  </div>
  <div class="counter"><b id="feitos">0</b><span>de ${produtos.length}<br>publicadas</span><span class="bar"><span id="barra"></span></span></div>
</header>

<div class="filtros">
  <button class="chip" type="button" data-secao="" aria-pressed="true">Todas</button>
  ${secoes.map(s => `<button class="chip" type="button" data-secao="${esc(s)}" aria-pressed="false">${esc(s)}</button>`).join('\n  ')}
  <input class="busca" type="search" id="busca" placeholder="Buscar peça…" aria-label="Buscar peça">
  <label class="esconder"><input type="checkbox" id="esconder"> esconder publicadas</label>
</div>

<section class="criativo">
  <div>
    <p class="eyebrow">Arte do anúncio</p>
    <h2>Frete grátis <em>acima de R$ 150</em></h2>
    <p>A peça de campanha nos dois formatos que a Meta pede no mesmo criativo: feed 1080×1080 e story 1080×1920. Serve para o impulsionamento, para o post e para o story.</p>
    <div class="acoes">
      <a class="botao" href="artes/anuncio-frete-gratis-feed.png" download>${BAIXAR} Baixar feed 1:1</a>
      <a class="botao" href="artes/anuncio-frete-gratis-story.png" download>${BAIXAR} Baixar story 9:16</a>
    </div>
    ${campo('Título do anúncio', ANUNCIO_PAGO.titulo, `${ANUNCIO_PAGO.titulo.length}/40`)}
    ${campo('Texto do anúncio', ANUNCIO_PAGO.texto)}
  </div>
  <div class="previas">
    <a href="artes/anuncio-frete-gratis-feed.png" target="_blank" rel="noopener"><img src="artes/anuncio-frete-gratis-feed.png" alt="Arte do anúncio, formato feed" loading="lazy"></a>
    <a href="artes/anuncio-frete-gratis-story.png" target="_blank" rel="noopener"><img src="artes/anuncio-frete-gratis-story.png" alt="Arte do anúncio, formato story" loading="lazy"></a>
  </div>
</section>

<section class="fixos">
  <h2>Igual em todos os anúncios</h2>
  ${FIXOS.map(([t, d]) => `<div class="fixo">${CHECK}<div><b>${esc(t)}</b><small>${esc(d)}</small></div></div>`).join('\n  ')}
</section>

${fichas}

<p class="vazio" id="vazio" hidden>Nenhuma peça com esse filtro.</p>

<footer>
  <span>Gerado do catálogo — <a href="joias.html">voltar para a loja</a> · <a href="pinterest.html">fila do Pinterest</a></span>
  <span>Marcações ficam salvas neste navegador</span>
</footer>
</div>

<script>
${comportamento('marketplace-publicadas')}
</script>
</body>
</html>
`;

writeFileSync(SAIDA, html);
console.log(`${produtos.length} peça(s) → marketplace.html`);
