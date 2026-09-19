/* ===========================================================
   CATÁLOGO EM MEMÓRIA — fonte única para o feed e a planilha

   Junta as três fontes na mesma ordem de prioridade da vitrine:
   peças escritas à mão no script.js, peças geradas pelos nomes
   dos arquivos (data/catalogo-auto.js) e os ajustes publicados
   pelo painel (data/produtos.js).
   =========================================================== */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

/* Os arquivos de dados da loja só fazem window.X = ...; rodá-los
   num contexto vazio devolve o mesmo que o navegador enxerga. */
function lerWindow(arquivo) {
  const contexto = vm.createContext({ window: {} });
  vm.runInContext(readFileSync(join(RAIZ, arquivo), 'utf8'), contexto);
  return contexto.window;
}

/* O catálogo antigo mora dentro do script.js, num literal de array.
   Recortá-lo evita duplicar aqui as 16 peças escritas à mão. */
function lerCatalogoAntigo() {
  const fonte = readFileSync(join(RAIZ, 'script.js'), 'utf8');
  const trecho = fonte.match(/^const products = (\[[\s\S]*?^\]);/m);
  if (!trecho) throw new Error('script.js: array `products` não encontrado');
  return vm.runInNewContext(trecho[1]);
}

export function lerCatalogo() {
  const produtos = lerCatalogoAntigo();

  const auto = lerWindow('data/catalogo-auto.js').PRODUCTS_AUTO || [];
  const jaNoCatalogo = new Set(produtos.map(p => p.image));
  produtos.unshift(...auto.filter(p => p && p.image && !jaNoCatalogo.has(p.image)));

  // Ajustes publicados pelo painel de controle (admin.html)
  const painel = lerWindow('data/produtos.js');
  const overrides = painel.PRODUCTS_OVERRIDE || {};
  const extras = painel.PRODUCTS_EXTRA || [];

  for (let i = produtos.length - 1; i >= 0; i--) {
    const o = overrides[produtos[i].id];
    if (!o) continue;
    if (o.hidden) { produtos.splice(i, 1); continue; } // peça escondida não vai para o anúncio
    ['name', 'badge', 'desc'].forEach(k => { if (typeof o[k] === 'string' && o[k].trim()) produtos[i][k] = o[k].trim(); });
    if (typeof o.price === 'number' && o.price > 0) produtos[i].price = o.price;
    if (typeof o.oldPrice === 'number' && o.oldPrice > 0) produtos[i].oldPrice = o.oldPrice;
    if (o.oldPrice === null) delete produtos[i].oldPrice;
    if (typeof o.soldOut === 'boolean') {
      if (o.soldOut) produtos[i].soldOut = true;
      else delete produtos[i].soldOut;
    }
  }
  produtos.unshift(...extras.filter(x => x && !x.hidden));
  return produtos;
}

// "Anéis · Ouro 18k" → seção da loja, que vira o product_type do anúncio
export const secaoDe = (p) => String(p.tag || '').split('·')[0].trim() || 'Semi-joias';

export const SITE = (process.env.SITE_URL || 'https://jubssaez-art.github.io/js-joias-delicadas/').replace(/\/?$/, '/');
export const LOJA = 'JS Joias Delicadas';
export const url = (caminho) => SITE + String(caminho).replace(/^\//, '');
