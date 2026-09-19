#!/usr/bin/env node
/* ===========================================================
   FILA DO PINTEREST — página de postagem manual

   Escreve pinterest.html: uma ficha por peça com o pin já no
   formato que a plataforma entrega (2:3), a pasta onde salvar,
   o título, a descrição e o link de destino.

   Existe porque o Pinterest só publica sozinho pelo catálogo,
   e o catálogo depende de reivindicar o domínio — coisa que o
   endereço github.io não permite (está na Public Suffix List).
   Enquanto o domínio próprio não entra, o pin sai à mão, e um
   pin por dia com a pasta certa rende mais que trinta de uma vez.

   O pin vertical é montado no navegador, com canvas, a partir da
   foto quadrada da loja: nada de imagem nova pesando no repositório.

   Uso:  node tools/gerar-pinterest.mjs
   =========================================================== */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ, lerCatalogo, secaoDe, SITE, url } from './ler-catalogo.mjs';
import { dinheiro, acabamentoDe, textos, link } from './textos-anuncio.mjs';
import { esc, slug, CHECK, BAIXAR, campo, ESTILO, comportamento } from './balcao.mjs';

const SAIDA = join(RAIZ, 'pinterest.html');

// Limites do próprio Pinterest — passar disso o texto sai cortado no pin
const LIMITE_TITULO = 100;
const LIMITE_DESCRICAO = 500;

const FIXOS = [
  ['Salve na pasta certa primeiro', 'a primeira pasta é o que classifica o pin — uma por seção'],
  ['Formato 2:3', 'o botão já baixa 1000×1500; foto quadrada é entregue muito menos'],
  ['Link de destino', 'a página da peça, nunca a home — é ela que tem preço e botão'],
  ['Um pin por dia', 'todo dia vale mais que trinta num sábado'],
  ['Texto alternativo', 'descreva a peça: o Pinterest lê isso como busca'],
  ['Resultado é lento', 'um pin bom traz visita por meses — não meça na primeira semana']
];

const produtos = lerCatalogo().filter(p => !p.soldOut);
const secoes = [...new Set(produtos.map(secaoDe))];

const fichas = produtos.map((p, i) => {
  const t = textos(p);
  const acabamento = acabamentoDe(p);
  const material = /ouro/i.test(acabamento) ? 'ouro' : 'prata';
  const arquivo = `pin-${slug(p.name)}.jpg`;
  const alt = `${p.name}, ${acabamento.toLowerCase()}, semi-joia antialérgica da JS Joias Delicadas`;
  return `<article class="ficha" data-id="${esc(p.id)}" data-secao="${esc(secaoDe(p))}" data-busca="${esc((p.name + ' ' + secaoDe(p)).toLowerCase())}" data-feito="0">
  <figure class="foto pin">
    <img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" width="600" height="600" crossorigin="anonymous">
    <figcaption>
      <span>${esc(arquivo)}</span>
      <button class="botao" type="button" data-pin="${esc(arquivo)}">${BAIXAR} Baixar pin 1000×1500</button>
    </figcaption>
  </figure>
  <div class="corpo">
    <div class="cab">
      <div>
        <h3 class="nome">${esc(p.name)}</h3>
        <div class="tags"><span class="tag pasta">pasta: ${esc(secaoDe(p))}</span><span class="tag mat-${material}">${esc(acabamento.toLowerCase())}</span></div>
      </div>
      <div class="preco">${dinheiro(p.price)}<small>5% off no Pix</small></div>
    </div>
    ${campo('Título do pin', t.tituloPinterest, `${t.tituloPinterest.length}/${LIMITE_TITULO}`)}
    ${campo('Descrição', t.descricaoPinterest, `${t.descricaoPinterest.length}/${LIMITE_DESCRICAO}`)}
    ${campo('Link de destino', link(p))}
    ${campo('Texto alternativo', alt)}
    <div class="rodape">
      <label class="marcar"><input type="checkbox" data-feito-input> Pin publicado</label>
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
<title>Fila do Pinterest — JS Joias Delicadas</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Karla:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
${ESTILO}
/* O pin é vertical: a prévia mostra a peça como ela vai ser entregue */
.foto.pin img{aspect-ratio:2/3;object-fit:contain;background:#FFFFFF}
.tag.pasta{color:var(--done);background:var(--done-soft);border-color:transparent}
.passos{counter-reset:passo;display:grid;gap:12px}
.passo{display:flex;gap:12px;align-items:flex-start}
.passo::before{counter-increment:passo;content:counter(passo);flex:none;width:22px;height:22px;border-radius:99px;border:1px solid rgba(201,161,92,.45);color:#E4C387;font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:11px;display:grid;place-items:center;margin-top:2px}
.passo b{font-weight:600}
.passo small{display:block;color:#B4ACA1;font-size:13px;line-height:1.45}
.criativo.guia{grid-template-columns:1fr}
</style>
</head>
<body>
<div class="wrap">
<header>
  <div>
    <p class="eyebrow">JS Joias Delicadas · Pinterest</p>
    <h1>Fila do <em>Pinterest</em></h1>
    <p class="lede">${produtos.length} peças com pin vertical, título, descrição e link prontos. Um pin por dia, salvo primeiro na pasta da seção — é assim que o Pinterest classifica.</p>
  </div>
  <div class="counter"><b id="feitos">0</b><span>de ${produtos.length}<br>pinadas</span><span class="bar"><span id="barra"></span></span></div>
</header>

<div class="filtros">
  <button class="chip" type="button" data-secao="" aria-pressed="true">Todas</button>
  ${secoes.map(s => `<button class="chip" type="button" data-secao="${esc(s)}" aria-pressed="false">${esc(s)}</button>`).join('\n  ')}
  <input class="busca" type="search" id="busca" placeholder="Buscar peça…" aria-label="Buscar peça">
  <label class="esconder"><input type="checkbox" id="esconder"> esconder pinadas</label>
</div>

<section class="criativo guia">
  <div>
    <p class="eyebrow">Antes do primeiro pin</p>
    <h2>Conta business, pastas e — se der — <em>catálogo</em></h2>
    <p>O pin manual funciona desde hoje. O catálogo automático, que sobe as ${produtos.length} peças de uma vez, depende de reivindicar o site: o endereço <code>github.io</code> costuma ser recusado, e aí o caminho é o domínio próprio.</p>
    <div class="passos">
      <div class="passo"><div><b>Criar conta business</b><small>pinterest.com/business/create — grátis, e libera estatística e catálogo.</small></div></div>
      <div class="passo"><div><b>Criar as pastas</b><small>uma por seção: ${secoes.join(', ')}. A primeira pasta em que o pin é salvo é a que vale.</small></div></div>
      <div class="passo"><div><b>Reivindicar o site</b><small>Configurações → Contas conectadas → Sites. O Pinterest devolve uma meta tag <code>p:domain_verify</code>; me mande o código que eu coloco no <code>index.html</code>.</small></div></div>
      <div class="passo"><div><b>Ligar o catálogo (depois da reivindicação)</b><small>Anúncios → Catálogos → Adicionar feed de dados, formato RSS/XML, país Brasil, moeda BRL. A URL é a de baixo.</small></div></div>
    </div>
    ${campo('URL do feed de dados', url('feed.xml'))}
    ${campo('Site a reivindicar', SITE)}
  </div>
</section>

<section class="fixos">
  <h2>Vale para todo pin</h2>
  ${FIXOS.map(([t, d]) => `<div class="fixo">${CHECK}<div><b>${esc(t)}</b><small>${esc(d)}</small></div></div>`).join('\n  ')}
</section>

${fichas}

<p class="vazio" id="vazio" hidden>Nenhuma peça com esse filtro.</p>

<footer>
  <span>Gerado do catálogo — <a href="joias.html">voltar para a loja</a> · <a href="marketplace.html">fila do Marketplace</a></span>
  <span>Marcações ficam salvas neste navegador</span>
</footer>
</div>

<script>
${comportamento('pinterest-publicadas')}

/* ---- pin vertical ----
   A loja fotografa em quadrado e o Pinterest entrega vertical.
   Em vez de guardar uma segunda imagem de cada peça, a página
   monta o 1000x1500 na hora: fundo branco e a foto centralizada. */
for (const botao of document.querySelectorAll('[data-pin]')) {
  botao.addEventListener('click', async () => {
    const original = botao.closest('.ficha').querySelector('img');
    const rotulo = botao.innerHTML;
    botao.textContent = 'Montando…';
    try {
      const foto = new Image();
      foto.crossOrigin = 'anonymous';
      foto.src = original.currentSrc || original.src;
      await foto.decode();

      const tela = document.createElement('canvas');
      tela.width = 1000; tela.height = 1500;
      const ctx = tela.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 1000, 1500);
      const escala = Math.min(1000 / foto.naturalWidth, 1500 / foto.naturalHeight);
      const l = foto.naturalWidth * escala, a = foto.naturalHeight * escala;
      ctx.drawImage(foto, (1000 - l) / 2, (1500 - a) / 2, l, a);

      const blob = await new Promise(r => tela.toBlob(r, 'image/jpeg', 0.9));
      const endereco = URL.createObjectURL(blob);
      const baixar = document.createElement('a');
      baixar.href = endereco; baixar.download = botao.dataset.pin;
      baixar.click();
      URL.revokeObjectURL(endereco);
      botao.dataset.ok = '1'; botao.textContent = 'Baixado';
    } catch (e) {
      botao.textContent = 'Não deu — abra a foto e salve à mão';
    }
    setTimeout(() => { botao.removeAttribute('data-ok'); botao.innerHTML = rotulo; }, 1800);
  });
}
</script>
</body>
</html>
`;

writeFileSync(SAIDA, html);
console.log(`${produtos.length} peça(s) → pinterest.html`);
