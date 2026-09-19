/* ===========================
   JS JOIAS DELICADAS — Script
   =========================== */

'use strict';

// ===== META PIXEL =====
// O snippet base vive no <head> das páginas públicas. Aqui só disparamos
// os eventos de e-commerce. content_ids usa o mesmo p.id do feed.xml —
// é o que faz o Meta casar o anúncio do catálogo com a peça vista.
function metaTrack(evento, dados) {
  if (typeof fbq === 'function') fbq('track', evento, dados);
}

// ===== CART STATE =====
let cart = JSON.parse(localStorage.getItem('js_joias_cart') || '[]');

function saveCart() {
  localStorage.setItem('js_joias_cart', JSON.stringify(cart));
}

// ===== NAVBAR SCROLL =====
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();

// ===== ANNOUNCEMENT BAR =====
(function initAnnouncement() {
  const bar = document.getElementById('announcementBar');
  const closeBtn = document.getElementById('closeAnnouncement');
  if (!bar || !closeBtn) return;
  closeBtn.addEventListener('click', () => {
    bar.style.height = bar.offsetHeight + 'px';
    requestAnimationFrame(() => {
      bar.style.transition = 'height 0.35s ease, opacity 0.35s ease';
      bar.style.height = '0';
      bar.style.opacity = '0';
      bar.style.overflow = 'hidden';
    });
  });
})();

// ===== HAMBURGER MENU =====
(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileClose = document.getElementById('mobileClose');
  if (!hamburger) return;

  function openMenu() {
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeMenu() : openMenu();
  });
  if (mobileClose) mobileClose.addEventListener('click', closeMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);

  // Close on mobile link click
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
})();

// ===== SEARCH OVERLAY =====
(function initSearch() {
  const searchBtn = document.getElementById('searchBtn');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchClose = document.getElementById('searchClose');
  const searchInput = document.getElementById('searchInput');
  if (!searchBtn) return;

  searchBtn.addEventListener('click', () => {
    searchOverlay.classList.toggle('active');
    if (searchOverlay.classList.contains('active')) {
      setTimeout(() => searchInput && searchInput.focus(), 100);
    }
  });
  if (searchClose) searchClose.addEventListener('click', () => searchOverlay.classList.remove('active'));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') searchOverlay.classList.remove('active');
  });
})();

// ===== PRODUCT DATA =====
// Catálogo classificado a partir das fotos reais em imagens/.
// imageAlt = segundo ângulo da mesma peça, exibido no hover.
const products = [
  { id: '1', name: 'Brinco Madrepérola Cravejado', tag: 'Brincos · Ouro 18k', categories: 'ouro perola', image: 'imagens/brinco-01.png', price: 75.90, oldPrice: 110.00, details: ['Antialérgico', 'Ouro 18k'], badge: 'Mais Vendido', soldOut: true, desc: 'Um clássico repaginado: madrepérola facetada em moldura de zircônias cravejadas à mão, com banho de ouro 18k. Brilho suave que acompanha do dia ao evento.' },
  { id: '2', name: 'Brinco Nó de Prata', tag: 'Brincos · Ródio Branco', categories: 'prata', image: 'imagens/brinco-02.png', price: 67.90, oldPrice: 79.90, details: ['Antialérgico', 'Ródio Branco'], soldOut: true, desc: 'Design escultural em formato de nó, com banho de ródio branco e acabamento espelhado. Uma peça statement para quem ama prata.' },
  { id: '3', name: 'Brinco Coração Zircônia & Pérola', tag: 'Brincos · Prata', categories: 'prata perola', image: 'imagens/brinco-03.png', imageAlt: 'imagens/brinco-03-alt.png', price: 84.90, oldPrice: 99.90, details: ['Antialérgico', 'Ródio Branco'], badge: 'Novidade', soldOut: true, desc: 'Coração de zircônia lapidada com pérola em formato de coração pendente. Romântico, delicado e cheio de movimento.' },
  { id: '4', name: 'Argola Máxi Dourada', tag: 'Brincos · Ouro 18k', categories: 'ouro', image: 'imagens/brinco-04.png', price: 59.90, oldPrice: 69.90, details: ['Antialérgico', 'Ouro 18k'], soldOut: true, desc: 'A argola máxi que não pode faltar: leve, fina e com fecho seguro. Banho de ouro 18k de alta durabilidade.' },
  { id: '5', name: 'Anel Halo Rosa Pink', tag: 'Anéis · Ródio Branco', categories: 'prata', image: 'imagens/anel-01.png', price: 92.90, oldPrice: 109.90, details: ['Antialérgico', 'Ródio Branco'], soldOut: true, desc: 'Zircônia rosa pink cercada por um halo cravejado. Banho de ródio branco antialérgico com brilho intenso.' },
  { id: '6', name: 'Brinco Ponto de Luz Dourado', tag: 'Brincos · Ouro 18k', categories: 'ouro', image: 'imagens/brinco-09.png', imageAlt: 'imagens/brinco-09-alt.png', price: 84.90, oldPrice: 99.90, details: ['Antialérgico', 'Ouro 18k'], soldOut: true, desc: 'Ponto de luz clássico: zircônia redonda em lapidação brilhante com moldura texturizada e banho de ouro 18k. Combina com qualquer produção.' },
  { id: '7', name: 'Brinco Quadrado Cravejado', tag: 'Brincos · Ouro 18k', categories: 'ouro', image: 'imagens/brinco-05.png', price: 71.90, oldPrice: 84.90, details: ['Antialérgico', 'Ouro 18k'], soldOut: true, desc: 'Quadradinho cravejado com micro zircônias, discreto e luminoso. O ponto de luz perfeito para o dia a dia.' },
  { id: '8', name: 'Brinco Pedra Verde Facetada', tag: 'Brincos · Ouro 18k', categories: 'ouro', image: 'imagens/brinco-06.png', price: 67.90, oldPrice: 79.90, details: ['Antialérgico', 'Ouro 18k'], soldOut: true, desc: 'Pedra verde facetada em tom opalescente com moldura dourada. Cor e sofisticação em uma peça só.' },
  { id: '9', name: 'Brinco Esmeralda Delicado', tag: 'Brincos · Ouro 18k', categories: 'ouro', image: 'imagens/brinco-07.png', imageAlt: 'imagens/brinco-07-alt.png', price: 75.90, oldPrice: 89.90, details: ['Antialérgico', 'Ouro 18k'], soldOut: true, desc: 'Mini marquise de zircônia esmeralda com detalhe em ponto de luz. Delicadeza para quem ama joias minimalistas.' },
  { id: '10', name: 'Kit 3 Argolinhas Cravejadas', tag: 'Brincos · Ouro 18k', categories: 'ouro', image: 'imagens/brinco-08.png', imageAlt: 'imagens/brinco-08-alt.png', price: 109.90, oldPrice: 129.90, details: ['Antialérgico', 'Ouro 18k'], badge: 'Favorita', soldOut: true, desc: 'Trio de argolinhas huggie cravejadas em micro zircônias. Use juntas ou separadas — combinam com tudo.' },
  { id: '11', name: 'Pulseira Corrente Bolinhas', tag: 'Pulseiras · Ouro 18k', categories: 'ouro', image: 'imagens/pulseira-03.png', price: 101.90, oldPrice: 119.90, details: ['Antialérgico', 'Ouro 18k'], soldOut: true, desc: 'Corrente bolinha com berloques ovais diamantados. Movimento e brilho a cada passo.' },
  { id: '12', name: 'Pulseira Borboletas de Pérola', tag: 'Pulseiras · Ouro 18k', categories: 'ouro perola', image: 'imagens/pulseira-01.png', price: 80.90, oldPrice: 95.90, details: ['Antialérgico', 'Ouro 18k'], soldOut: true, desc: 'Borboletas de madrepérola sobre corrente dourada com esferas facetadas. Feminina e cheia de significado.' },
  { id: '13', name: 'Pulseira Corações Dourados', tag: 'Pulseiras · Ouro 18k', categories: 'ouro', image: 'imagens/pulseira-02.png', price: 75.90, oldPrice: 105.00, details: ['Antialérgico', 'Ouro 18k'], soldOut: true, desc: 'Corações lisos em acabamento acetinado sobre corrente cartier. Um mimo delicado para o pulso.' },
  { id: '14', name: 'Pulseira Elos de Coração', tag: 'Pulseiras · Ródio Branco', categories: 'prata', image: 'imagens/pulseira-04.png', price: 109.90, oldPrice: 129.90, details: ['Antialérgico', 'Ródio Branco'], soldOut: true, desc: 'Elos entrelaçados com corações em alto relevo e banho de ródio branco. Presença e delicadeza na mesma pulseira.' },
  { id: '15', name: 'Pulseira Pérolas Barrocas', tag: 'Pulseiras · Prata', categories: 'prata perola', image: 'imagens/pulseira-05.png', price: 118.90, oldPrice: 139.90, details: ['Antialérgico', 'Ródio Branco'], soldOut: true, desc: 'Pérolas barrocas e esferas de prata alternadas em corrente delicada. Elegância orgânica, peça única.' },
  { id: '16', name: 'Pulseira Berloques de Prata', tag: 'Pulseiras · Ródio Branco', categories: 'prata', image: 'imagens/pulseira-06.png', price: 92.90, oldPrice: 109.90, details: ['Antialérgico', 'Ródio Branco'], soldOut: true, desc: 'Corrente dupla com berloques ovais espelhados. Minimalista, moderna e fácil de amar.' }
];

// ===== PEÇAS AUTOMÁTICAS =====
// Toda foto em imagens/ nomeada como a peça ("anel dourado com pedra preta.png")
// vira produto. O arquivo data/catalogo-auto.js é gerado por tools/gerar-catalogo.mjs.
(function mergeAuto() {
  const auto = window.PRODUCTS_AUTO;
  if (!Array.isArray(auto) || !auto.length) return;
  const jaNoCatalogo = new Set(products.map(p => p.image));
  // Entram no topo da grade: peça nova é a primeira que a cliente vê.
  products.unshift(...auto.filter(p => p && p.image && !jaNoCatalogo.has(p.image)));
})();

// ===== LANÇAMENTOS =====
// Peça é lançamento quando o painel marca (lancamento: true/false manda) ou,
// sem marcação, quando o selo diz Novidade/Lançamento/Novo e a peça está à venda.
window.isLancamento = function (p) {
  if (typeof p.lancamento === 'boolean') return p.lancamento;
  return !p.soldOut && /novidade|lan[cç]amento|\bnovo\b/i.test(p.badge || '');
};

// ===== AJUSTES DO PAINEL =====
// Prioridade: prévia local (admin testando neste navegador) > publicado (data/produtos.js)
(function applyOverrides() {
  // Catálogo original preservado para o painel de controle
  window.PRODUCTS_BASE = products.map(p => ({ ...p }));

  let preview = null;
  try { preview = JSON.parse(localStorage.getItem('js_joias_override_preview') || 'null'); } catch (e) { /* prévia corrompida */ }
  // Compatibilidade: prévias antigas eram só o mapa de overrides
  if (preview && !preview.overrides && !preview.extras && !preview.site) preview = { overrides: preview };

  const state = preview || {
    overrides: (typeof PRODUCTS_OVERRIDE !== 'undefined' && PRODUCTS_OVERRIDE) || {},
    extras: (typeof PRODUCTS_EXTRA !== 'undefined' && PRODUCTS_EXTRA) || [],
    site: (typeof SITE_OVERRIDE !== 'undefined' && SITE_OVERRIDE) || {}
  };
  const overrides = state.overrides || {};

  for (let i = products.length - 1; i >= 0; i--) {
    const o = overrides[products[i].id];
    if (!o) continue;
    if (o.hidden) { products.splice(i, 1); continue; }
    ['name', 'badge', 'desc'].forEach(k => { if (typeof o[k] === 'string' && o[k].trim()) products[i][k] = o[k].trim(); });
    if (typeof o.badge === 'string' && !o.badge.trim()) delete products[i].badge;
    if (typeof o.price === 'number' && o.price > 0) products[i].price = o.price;
    if (typeof o.oldPrice === 'number' && o.oldPrice > 0) products[i].oldPrice = o.oldPrice;
    if (o.oldPrice === null) delete products[i].oldPrice;
    if (typeof o.lancamento === 'boolean') products[i].lancamento = o.lancamento;
    // Estoque: o painel manda tanto para marcar quanto para liberar a peça
    if (typeof o.soldOut === 'boolean') {
      if (o.soldOut) products[i].soldOut = true;
      else delete products[i].soldOut;
    }
  }

  // Peças novas criadas no painel — entram no topo, junto com as fotos recém-publicadas
  // Peça criada no painel nasce lançamento, a menos que o painel desmarque
  const extras = (state.extras || []).filter(x => x && !x.hidden).map(x => ({ ...x, lancamento: x.lancamento !== false }));
  if (extras.length) products.unshift(...extras);

  // Configurações da loja (com padrões)
  window.SITE_CONFIG = Object.assign({
    whatsapp: '5541989043923',
    instagram: 'js_joiasdelicadas',
    announcement: []
  }, state.site || {});
})();

// ===== CONFIGURAÇÕES DA LOJA NO DOM =====
(function applySiteConfig() {
  const cfg = window.SITE_CONFIG;

  const spans = document.querySelectorAll('.announcement-inner > span:not(.sep)');
  (cfg.announcement || []).forEach((t, i) => {
    if (spans[i] && typeof t === 'string' && t.trim()) spans[i].textContent = t.trim();
  });

  document.querySelectorAll('a[href*="wa.me/"]').forEach(a => {
    a.href = a.href.replace(/wa\.me\/\d+/, 'wa.me/' + cfg.whatsapp);
  });
  const fone = cfg.whatsapp.replace(/^55/, '');
  if (fone.length >= 10) {
    const foneFmt = `(${fone.slice(0, 2)}) ${fone.slice(2, -4)}-${fone.slice(-4)}`;
    document.querySelectorAll('.footer-contact-link[href*="wa.me"]').forEach(a => { a.textContent = foneFmt; });
  }

  document.querySelectorAll('a[href*="instagram.com/"]').forEach(a => {
    a.href = a.href.replace(/instagram\.com\/[\w.]+/, 'instagram.com/' + cfg.instagram);
  });
  document.querySelectorAll('.insta-brand span, .footer-contact-link[href*="instagram"]').forEach(el => {
    if (el.textContent.trim().startsWith('@')) el.textContent = '@' + cfg.instagram;
  });
})();

// Deriva o tipo da peça a partir da tag ("Brincos · Ouro 18k" → "brincos")
function productType(product) {
  return product.tag.split('·')[0].trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function renderProducts() {
  const container = document.getElementById('productsGrid');
  if (!container) return;

  container.innerHTML = products.map((product, index) => {
    const hasOldPrice = product.oldPrice && product.oldPrice > product.price;
    const isSoldOut = product.soldOut === true;
    const badgeHtml = isSoldOut
      ? `<div class="product-badge sold-out-badge">Esgotado</div>`
      : (product.badge ? `<div class="product-badge">${product.badge}</div>` : '');
    const detailsHtml = product.details.map(detail => `<span>${detail}</span>`).join('<span>•</span>');

    const soldOutOverlay = isSoldOut ? `
          <div class="sold-out-overlay">
            <div class="sold-out-stamp">
              <span class="sold-out-icon">✦</span>
              <span class="sold-out-text">Esgotado</span>
              <span class="sold-out-sub">Em breve de volta</span>
            </div>
          </div>` : '';

    const quickActionsHtml = isSoldOut
      ? `<div class="product-quick-actions">
              <button class="quick-add-btn sold-out-notify-btn" data-id="${product.id}" data-name="${product.name}" onclick="event.preventDefault();event.stopPropagation();window.open('https://wa.me/${(window.SITE_CONFIG && SITE_CONFIG.whatsapp) || '5541989043923'}?text=Ol%C3%A1!%20Quero%20ser%20avisada%20quando%20o%20${encodeURIComponent(product.name)}%20voltar%20ao%20estoque%20%F0%9F%92%9B','_blank')">✦ Avise-me Quando Voltar</button>
            </div>`
      : `<div class="product-quick-actions">
              <button class="quick-add-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price.toFixed(2)}">Adicionar à Sacola</button>
            </div>`;

    return `
      <article class="product-card${isSoldOut ? ' sold-out' : ''}" data-category="${product.categories} ${productType(product)}${isLancamento(product) ? ' lancamento' : ''}" id="prod-${product.id}">
        <div class="product-img-wrap">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          ${product.imageAlt ? `<img src="${product.imageAlt}" alt="" class="img-alt" loading="lazy" aria-hidden="true">` : ''}
          ${badgeHtml}
          ${soldOutOverlay}
          <button class="wishlist-btn" aria-label="Favoritar">♡</button>
          ${quickActionsHtml}
        </div>
        <div class="product-info">
          <span class="unique-seal" title="Peça única — última unidade em estoque"><span class="unique-seal-star">✦</span>Peça Única</span>
          <p class="product-tag">${product.tag}</p>
          <h3 class="product-name"><a href="produto.html?id=${product.id}">${product.name}</a></h3>
          <div class="product-price">${isSoldOut ? '<span class="price-current sold-out-price">Esgotado</span>' : (hasOldPrice ? `<span class="price-old">R$ ${product.oldPrice.toFixed(2).replace('.', ',')}</span>` : '') + `<span class="price-current">R$ ${product.price.toFixed(2).replace('.', ',')}</span>`}</div>
          <div class="product-details">${detailsHtml}</div>
        </div>
      </article>`;
  }).join('');
}

// ===== FILTER TABS =====
function applyFilter(filter) {
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(t => {
    const active = t.dataset.filter === filter;
    t.classList.toggle('active', active);
    t.setAttribute('aria-selected', String(active));
  });

  // Nas telas pequenas as abas rolam na horizontal: centraliza a ativa
  const activeTab = document.querySelector('.filter-tab.active');
  const strip = activeTab && activeTab.parentElement;
  if (strip && strip.scrollWidth > strip.clientWidth) {
    strip.scrollTo({
      left: activeTab.offsetLeft - (strip.clientWidth - activeTab.offsetWidth) / 2,
      behavior: 'smooth'
    });
  }

  let visiveis = 0;
  document.querySelectorAll('.product-card').forEach((card, i) => {
    const categories = card.dataset.category || '';
    const show = filter === 'todos' || categories.split(' ').includes(filter);
    if (show) visiveis++;
    card.classList.remove('hidden', 'fade-in');
    if (!show) {
      card.classList.add('hidden');
    } else {
      void card.offsetWidth; // reflow
      card.classList.add('fade-in');
      card.style.animationDelay = `${(i % 6) * 0.06}s`;
    }
  });

  // Aba sem peças (ex.: nenhum lançamento no momento) não fica em branco
  const grid = document.getElementById('productsGrid');
  let vazio = document.getElementById('filterEmpty');
  if (!vazio && grid) {
    vazio = document.createElement('p');
    vazio.id = 'filterEmpty';
    vazio.className = 'filter-empty';
    grid.after(vazio);
  }
  if (vazio) {
    vazio.hidden = visiveis > 0;
    vazio.textContent = filter === 'lancamento'
      ? '✦ Novos lançamentos chegando em breve — fale com a gente no WhatsApp para saber em primeira mão.'
      : 'Nenhuma peça nesta categoria no momento.';
  }
}

(function initFilterTabs() {
  renderProducts();
  // Quantidade de lançamentos na própria aba
  const qtd = products.filter(isLancamento).length;
  const abaNova = document.getElementById('tab-lancamento');
  if (abaNova && qtd) abaNova.insertAdjacentHTML('beforeend', ` <span class="filter-count">${qtd}</span>`);
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => applyFilter(tab.dataset.filter));
  });
  // Links do menu que levam direto a uma aba (ex.: Lançamentos)
  document.querySelectorAll('[data-goto-filter]').forEach(link => {
    link.addEventListener('click', () => applyFilter(link.dataset.gotoFilter));
  });
  if (location.hash === '#lancamentos') {
    applyFilter('lancamento');
    const sec = document.getElementById('produtos');
    if (sec) setTimeout(() => sec.scrollIntoView(), 0);
  }
})();

// ===== CONTAGEM REAL DAS COLEÇÕES =====
// Os cards de coleção mostram quantas peças existem de fato no catálogo
// (respeitando peças ocultas e novas peças criadas no painel).
(function updateCategoryCounts() {
  document.querySelectorAll('.cat-info p[data-count]').forEach(el => {
    const n = products.filter(p => p.tag && productType(p) === el.dataset.count).length;
    el.textContent = n === 1 ? '1 peça' : `${n} peças`;
  });
})();

// ===== CART LOGIC =====
function updateCartUI() {
  const countEl = document.getElementById('cartCount');
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  if (countEl) {
    countEl.textContent = totalCount;
    countEl.classList.toggle('visible', totalCount > 0);
  }
  renderCartItems();
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  const emptyEl = document.getElementById('cartEmpty');
  const footer = document.getElementById('cartFooter');
  const totalEl = document.getElementById('cartTotal');
  if (!container) return;

  // Remove existing cart items (keep empty element)
  const existing = container.querySelectorAll('.cart-item');
  existing.forEach(el => el.remove());

  if (cart.length === 0) {
    if (emptyEl) emptyEl.style.display = 'flex';
    if (footer) footer.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (footer) footer.style.display = 'block';

  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <a href="produto.html?id=${item.id}" class="cart-item-img" aria-label="Ver ${item.name}">
        <img src="${item.image || 'img/product_brincos.png'}" alt="${item.name}" loading="lazy">
      </a>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')} × ${item.qty}</div>
      </div>
      <button class="cart-item-remove" data-id="${item.id}" aria-label="Remover ${item.name}">×</button>
    `;
    container.appendChild(el);
  });

  if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

  // Update checkout button
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    const itemsList = cart.map(i => `${i.qty}x ${i.name} (R$ ${i.price.toFixed(2).replace('.', ',')})`).join('%0A');
    const totalStr = total.toFixed(2).replace('.', ',');
    const waNum = (window.SITE_CONFIG && SITE_CONFIG.whatsapp) || '5541989043923';
    checkoutBtn.href = `https://wa.me/${waNum}?text=Ol%C3%A1!%20Gostaria%20de%20finalizar%20meu%20pedido%3A%0A${itemsList}%0A%0ATotal%3A%20R%24%20${totalStr}%20%F0%9F%92%9B`;
  }

  // Remove buttons
  container.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      cart = cart.filter(item => item.id !== id);
      saveCart();
      updateCartUI();
      showToast('Peça removida da sacola');
    });
  });
}

function addToCart(id, name, price) {
  // Block sold-out products
  const prod = products.find(p => p.id === id);
  if (prod && prod.soldOut) {
    showToast('Esta peça está esgotada no momento ✦');
    return;
  }
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty++;
  } else {
    const product = products.find(p => p.id === id);
    cart.push({
      id,
      name,
      price: parseFloat(price),
      qty: 1,
      image: product ? product.image : 'img/product_brincos.png'
    });
  }
  saveCart();
  updateCartUI();
  openCart();
  showToast(`✦ "${name}" adicionado à sacola!`);
  metaTrack('AddToCart', {
    content_type: 'product',
    content_ids: [id],
    content_name: name,
    value: parseFloat(price),
    currency: 'BRL'
  });
}

// ===== CART SIDEBAR =====
function openCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if (sidebar) sidebar.classList.add('open');
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

(function initCart() {
  const cartBtn = document.getElementById('cartBtn');
  const cartClose = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Ir pro WhatsApp é o nosso checkout — registrado aqui uma única vez,
  // porque updateCartUI() só reescreve o href do botão.
  const checkout = document.getElementById('checkoutBtn');
  if (checkout) {
    checkout.addEventListener('click', () => {
      if (!cart.length) return;
      metaTrack('InitiateCheckout', {
        content_type: 'product',
        content_ids: cart.map(i => i.id),
        num_items: cart.reduce((s, i) => s + i.qty, 0),
        value: cart.reduce((s, i) => s + i.price * i.qty, 0),
        currency: 'BRL'
      });
    });
  }

  // Quick add buttons
  document.querySelectorAll('.quick-add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      addToCart(btn.dataset.id, btn.dataset.name, btn.dataset.price);
    });
  });

  // Wishlist buttons
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      btn.classList.toggle('active');
      btn.textContent = btn.classList.contains('active') ? '♥' : '♡';
      showToast(btn.classList.contains('active') ? 'Adicionado aos favoritos ♥' : 'Removido dos favoritos');
    });
  });

  // Card click → página de detalhes
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = 'produto.html?id=' + card.id.replace('prod-', '');
    });
  });

  updateCartUI();
})();

// ===== TOAST NOTIFICATION =====
let toastTimeout;
function showToast(message) {
  let toast = document.getElementById('jsToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'jsToast';
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: #2c211c;
      color: #e2c89a;
      padding: 14px 24px;
      border-radius: 2px;
      font-family: 'Jost', sans-serif;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.5px;
      z-index: 9999;
      opacity: 0;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 30px rgba(44,33,28,0.25);
      white-space: nowrap;
      max-width: 90vw;
      text-align: center;
    `;
    document.body.appendChild(toast);
  }

  clearTimeout(toastTimeout);
  toast.textContent = message;
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  toastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 3000);
}

// ===== CATEGORY CARD FILTER LINKS =====
(function initCatFilters() {
  document.querySelectorAll('.cat-card[data-filter]').forEach(card => {
    card.addEventListener('click', e => {
      const filter = card.dataset.filter;
      if (filter && filter !== 'noivas') {
        e.preventDefault();
        applyFilter(filter);
        setTimeout(() => {
          const section = document.getElementById('produtos');
          if (section) section.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    });
  });
})();

// ===== SCROLL REVEAL ANIMATIONS =====
(function initScrollReveal() {
  const reveals = ['#colecoes', '#produtos', '#sobre', '#noivas', '#fidelidade', '#garantia', '#instagram',
    '.loyalty-card', '.guarantee-item', '.product-card', '.cat-card', '.story-stats'];

  // Add data-reveal to targeted elements
  document.querySelectorAll('.loyalty-card, .guarantee-item, .cat-card, .cat-banner, .product-card').forEach(el => {
    el.setAttribute('data-reveal', '');
  });

  // Cascata: cards da mesma grade entram em sequência, não todos de uma vez
  document.querySelectorAll('.products-grid .product-card, .categories-grid .cat-card').forEach((el, i) => {
    el.style.setProperty('--reveal-delay', `${(i % 6) * 0.08}s`);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
})();

// ===== SMOOTH ANCHOR SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const navH = document.getElementById('navbar')?.offsetHeight || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ===== HERO IMAGE PARALLAX =====
(function initParallax() {
  const heroImg = document.getElementById('heroImg');
  if (!heroImg) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroImg.style.transform = `scale(1.04) translateY(${scrolled * 0.25}px)`;
    }
  }, { passive: true });
})();

// ===== PRODUCT CARD HOVER - NUMBER COUNTER FOR STATS =====
(function initCounters() {
  const stats = document.querySelectorAll('.stat-num');
  if (!stats.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const text = el.textContent;
      const num = parseInt(text.replace(/\D/g, ''));
      if (!num) return;

      const prefix = text.includes('+') ? '+' : '';
      const suffix = text.includes('%') ? '%' : (text.includes(' Ano') ? ' Ano' : '');
      let start = 0;
      const duration = 1500;
      const step = num / (duration / 16);

      const update = () => {
        start = Math.min(start + step, num);
        el.textContent = prefix + Math.floor(start) + suffix;
        if (start < num) requestAnimationFrame(update);
        else el.textContent = text;
      };
      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  stats.forEach(el => observer.observe(el));
})();

// ===== LIGHTBOX GLOBAL =====
const lightboxEl = document.createElement('div');
lightboxEl.className = 'pdp-lightbox';
lightboxEl.innerHTML = '<button class="lightbox-close" aria-label="Fechar">×</button><img alt="Imagem ampliada">';
document.body.appendChild(lightboxEl);
lightboxEl.addEventListener('click', () => lightboxEl.classList.remove('open'));
document.addEventListener('keydown', e => { if (e.key === 'Escape') lightboxEl.classList.remove('open'); });

function openLightbox(src) {
  lightboxEl.querySelector('img').src = src;
  lightboxEl.classList.add('open');
}

// Imagens de seção ampliáveis ao clique (página inicial)
document.querySelectorAll('.story-img, .noivas-image img').forEach(img => {
  img.classList.add('zoomable');
  img.addEventListener('click', e => {
    e.stopPropagation();
    openLightbox(img.src);
  });
});

console.log('✦ JS Joias Delicadas — Site carregado com sucesso!');
