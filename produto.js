/* ===========================
   JS JOIAS DELICADAS — Página de Produto
   Depende de script.js (products, cart, addToCart, showToast, updateCartUI, openCart)
   =========================== */

'use strict';

(function initProductPage() {
  const params = new URLSearchParams(window.location.search);
  const product = products.find(p => p.id === params.get('id'));

  if (!product) {
    window.location.replace('joias.html#produtos');
    return;
  }

  const fmt = v => 'R$ ' + v.toFixed(2).replace('.', ',');
  const WA = 'https://wa.me/' + ((window.SITE_CONFIG && SITE_CONFIG.whatsapp) || '5541989043923');

  // Peça vista — alimenta remarketing e anúncios dinâmicos do catálogo
  metaTrack('ViewContent', {
    content_type: 'product',
    content_ids: [product.id],
    content_name: product.name,
    content_category: product.categories || '',
    value: product.price,
    currency: 'BRL'
  });

  // ===== PREENCHER DADOS =====
  document.title = `${product.name} — JS Joias Delicadas`;

  // ===== DADOS PARA OS CANAIS =====
  // Open Graph reescrito com a peça certa e JSON-LD Product no corpo: é assim que
  // o Google Merchant, o Pinterest e o Search entendem preço e disponibilidade
  // sem precisar de uma página estática por produto.
  publicarMetadados(product);

  document.getElementById('crumbName').textContent = product.name;
  const tagEl = document.getElementById('pdpTag');
  tagEl.textContent = product.tag;
  // Diferencial da loja: cada peça é garimpada em unidade única
  tagEl.insertAdjacentHTML('afterend',
    '<span class="unique-seal unique-seal-lg pdp-anim" title="Peça única — última unidade em estoque">' +
    '<span class="unique-seal-star">✦</span>Peça Única</span>');
  document.getElementById('pdpName').textContent = product.name;
  document.getElementById('pdpDesc').textContent = product.desc || '';
  document.getElementById('pdpPrice').textContent = fmt(product.price);
  document.getElementById('pdpPix').textContent = `ou ${fmt(product.price * 0.95)} no Pix ✦`;

  if (product.oldPrice && product.oldPrice > product.price) {
    const oldEl = document.getElementById('pdpOldPrice');
    oldEl.textContent = fmt(product.oldPrice);
    oldEl.hidden = false;
  }
  if (product.badge) {
    const badgeEl = document.getElementById('pdpBadge');
    badgeEl.textContent = product.badge;
    badgeEl.hidden = false;
  }

  document.getElementById('pdpChips').innerHTML =
    product.details.map(d => `<span class="pdp-chip">✦ ${d}</span>`).join('');

  // ===== GALERIA =====
  const mainImg = document.getElementById('pdpImage');
  const thumbsEl = document.getElementById('pdpThumbs');
  const gallery = [product.image, product.imageAlt].filter(Boolean);

  mainImg.src = product.image;
  mainImg.alt = product.name;

  if (gallery.length > 1) {
    thumbsEl.innerHTML = gallery.map((src, i) =>
      `<button class="pdp-thumb ${i === 0 ? 'active' : ''}" data-src="${src}" aria-label="Foto ${i + 1}">
         <img src="${src}" alt="${product.name} — foto ${i + 1}">
       </button>`).join('');

    thumbsEl.querySelectorAll('.pdp-thumb').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) return;
        thumbsEl.querySelector('.active').classList.remove('active');
        btn.classList.add('active');
        mainImg.classList.add('swapping');
        setTimeout(() => {
          mainImg.src = btn.dataset.src;
          mainImg.classList.remove('swapping');
        }, 220);
      });
    });
  }

  // ===== SOLD OUT HANDLING =====
  const isSoldOut = product.soldOut === true;
  if (isSoldOut) {
    // Add grayscale to gallery
    const galleryWrap = mainImg.closest('.pdp-gallery') || mainImg.parentElement;
    if (galleryWrap) galleryWrap.style.filter = 'grayscale(50%) brightness(0.95)';

    // Update badge
    const badgeEl = document.getElementById('pdpBadge');
    badgeEl.textContent = 'Esgotado';
    badgeEl.hidden = false;
    badgeEl.classList.add('sold-out-badge');

    // Insert sold-out banner before the price
    const priceEl = document.getElementById('pdpPrice');
    const bannerHtml = `<div class="pdp-sold-out-banner">
      <span class="sold-out-icon">✦</span>
      <div class="pdp-sold-out-banner-text">
        <strong>Peça Esgotada</strong>
        <span>Esta peça está temporariamente indisponível</span>
      </div>
    </div>`;
    priceEl.parentElement.insertAdjacentHTML('beforebegin', bannerHtml);

    // Update price display
    priceEl.textContent = 'Esgotado';
    priceEl.classList.add('sold-out-price');
    const pixEl = document.getElementById('pdpPix');
    if (pixEl) pixEl.style.display = 'none';
    const oldPriceEl = document.getElementById('pdpOldPrice');
    if (oldPriceEl) oldPriceEl.style.display = 'none';

    // Disable qty controls
    const qtySection = document.querySelector('.pdp-qty');
    if (qtySection) qtySection.style.display = 'none';

    // Replace buy buttons with notification
    const addBtn = document.getElementById('pdpAddBtn');
    const buyNow = document.getElementById('pdpBuyNow');
    if (addBtn) {
      addBtn.textContent = '✦ Avise-me Quando Voltar';
      addBtn.classList.add('sold-out-notify-btn');
      addBtn.style.cssText = 'background: linear-gradient(135deg, #a07845, #c9a06c); color: #fff; border: none; cursor: pointer; position: relative; overflow: hidden;';
      // Remove old listener by cloning
      const newAddBtn = addBtn.cloneNode(true);
      addBtn.parentNode.replaceChild(newAddBtn, addBtn);
      newAddBtn.addEventListener('click', () => {
        const waNum = (window.SITE_CONFIG && SITE_CONFIG.whatsapp) || '5541989043923';
        window.open(`https://wa.me/${waNum}?text=Ol%C3%A1!%20Quero%20ser%20avisada%20quando%20o%20${encodeURIComponent(product.name)}%20voltar%20ao%20estoque%20%F0%9F%92%9B`, '_blank');
      });
    }
    if (buyNow) {
      buyNow.textContent = '✦ Consultar Disponibilidade';
      buyNow.href = `https://wa.me/${(window.SITE_CONFIG && SITE_CONFIG.whatsapp) || '5541989043923'}?text=Ol%C3%A1!%20Gostaria%20de%20saber%20quando%20o%20${encodeURIComponent(product.name)}%20voltar%C3%A1%20ao%20estoque%20%F0%9F%92%9B`;
    }
    return; // Skip qty and buy setup below
  }

  // ===== QUANTIDADE =====
  let qty = 1;
  const qtyValue = document.getElementById('qtyValue');
  const setQty = v => { qty = Math.min(10, Math.max(1, v)); qtyValue.textContent = qty; updateBuyNow(); };
  document.getElementById('qtyMinus').addEventListener('click', () => setQty(qty - 1));
  document.getElementById('qtyPlus').addEventListener('click', () => setQty(qty + 1));

  // ===== COMPRAR =====
  function updateBuyNow() {
    const total = fmt(product.price * qty).replace('R$ ', 'R%24%20');
    const msg = `Ol%C3%A1!%20Quero%20comprar%3A%0A${qty}x%20${encodeURIComponent(product.name)}%0ATotal%3A%20${total}%20%F0%9F%92%9B`;
    document.getElementById('pdpBuyNow').href = `${WA}?text=${msg}`;
  }
  updateBuyNow();

  document.getElementById('pdpAddBtn').addEventListener('click', () => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) existing.qty += qty;
    else cart.push({ id: product.id, name: product.name, price: product.price, qty, image: product.image });
    saveCart();
    updateCartUI();
    openCart();
    showToast(`✦ ${qty}x "${product.name}" na sacola!`);
    // Esta página monta o item na mão, então não passa pelo addToCart()
    // do script.js — o evento precisa ser disparado aqui.
    metaTrack('AddToCart', {
      content_type: 'product',
      content_ids: [product.id],
      content_name: product.name,
      contents: [{ id: product.id, quantity: qty }],
      value: product.price * qty,
      currency: 'BRL'
    });
  });

  // Comprar agora vai direto pro WhatsApp — é um checkout iniciado
  document.getElementById('pdpBuyNow').addEventListener('click', () => {
    metaTrack('InitiateCheckout', {
      content_type: 'product',
      content_ids: [product.id],
      contents: [{ id: product.id, quantity: qty }],
      num_items: qty,
      value: product.price * qty,
      currency: 'BRL'
    });
  });

  // ===== AVALIAÇÕES =====
  const SEEDS = {
    brincos: [
      { name: 'Camila R.', stars: 5, avatar: 'imagens/avatars/camila-r.jpg', date: '28 jun 2026', verified: true, text: 'Apaixonada! Ainda mais delicado pessoalmente, e não senti nenhuma alergia. Chegou super bem embalado 💛' },
      { name: 'Fernanda L.', stars: 5, avatar: 'imagens/avatars/fernanda-l.jpg', date: '11 jun 2026', verified: true, text: 'Uso todos os dias e o banho continua perfeito. Atendimento pelo WhatsApp foi um amor.' }
    ],
    colares: [
      { name: 'Juliana M.', stars: 5, avatar: 'imagens/avatars/juliana-m.jpg', date: '02 jul 2026', verified: true, text: 'O colar é ainda mais bonito ao vivo, caimento perfeito no decote. Recebi elogios no mesmo dia!' },
      { name: 'Patrícia S.', stars: 4, avatar: 'imagens/avatars/patricia-s.jpg', date: '19 mai 2026', verified: true, text: 'Peça linda e delicada. Só demorou um pouquinho o envio, mas valeu a espera.' }
    ],
    pulseiras: [
      { name: 'Aline T.', stars: 5, avatar: 'imagens/avatars/aline-t.jpg', date: '24 jun 2026', verified: true, text: 'Delicada do jeito que eu queria, não enrosca na roupa e o fecho é firme. Amei!' },
      { name: 'Bruna C.', stars: 5, avatar: 'imagens/avatars/bruna-c.jpg', date: '07 jun 2026', verified: true, text: 'Comprei de presente para minha mãe e ela não tira mais do braço 💛' }
    ],
    aneis: [
      { name: 'Larissa F.', stars: 5, avatar: 'imagens/avatars/larissa-f.jpg', date: '30 jun 2026', verified: true, text: 'A pedra brilha demais! Parece joia de verdade, uso sem tirar e continua impecável.' },
      { name: 'Renata O.', stars: 4, avatar: 'imagens/avatars/renata-o.jpg', date: '14 mai 2026', verified: true, text: 'Anel lindo e confortável. O tamanho veio certinho como combinamos pelo WhatsApp.' }
    ]
  };
  const typeKey = product.tag.split('·')[0].trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const storageKey = `js_joias_reviews_${product.id}`;
  // A primeira avaliação-exemplo mostra fotos da própria peça, como na Shein
  const seedReviews = (SEEDS[typeKey] || SEEDS.brincos).map((r, i) =>
    i === 0 ? { ...r, photos: [product.image, product.imageAlt].filter(Boolean) } : r);
  const loadUserReviews = () => JSON.parse(localStorage.getItem(storageKey) || '[]');
  const safePhotos = r => (r.photos || []).filter(p =>
    typeof p === 'string' && (p.startsWith('data:image/') || p.startsWith('imagens/')));

  const starRow = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function allReviews() {
    return [...loadUserReviews(), ...seedReviews];
  }

  function renderRating() {
    const reviews = allReviews();
    const avg = reviews.reduce((s, r) => s + r.stars, 0) / reviews.length;
    document.getElementById('pdpRating').innerHTML =
      `<span class="stars">${starRow(Math.round(avg))}</span>
       <a href="#avaliacoes" class="rating-link">${avg.toFixed(1)} · ${reviews.length} avaliações</a>`;
    document.getElementById('ratingSummary').innerHTML =
      `<span class="summary-avg">${avg.toFixed(1)}</span>
       <div><span class="stars">${starRow(Math.round(avg))}</span>
       <p>baseado em ${reviews.length} avaliações</p></div>`;
  }

  function renderReviews() {
    document.getElementById('reviewsList').innerHTML = allReviews().map(r => {
      const avatarHtml = r.avatar
        ? `<span class="review-avatar"><img src="${r.avatar}" alt="Foto de ${esc(r.name)}" loading="lazy"></span>`
        : `<span class="review-avatar">${esc(r.name.trim().charAt(0).toUpperCase())}</span>`;
      const verifiedHtml = r.verified
        ? '<span class="review-verified"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Compra verificada</span>'
        : '';
      const photos = safePhotos(r);
      const photosHtml = photos.length
        ? `<div class="review-photos">${photos.map(src =>
            `<button type="button" class="review-photo" data-src="${src}" aria-label="Ampliar foto">
               <img src="${src}" alt="Foto da cliente" loading="lazy">
             </button>`).join('')}</div>`
        : '';
      return `
      <article class="review-card">
        <div class="review-head">
          ${avatarHtml}
          <div class="review-meta">
            <p class="review-name">${esc(r.name)}</p>
            <span class="stars small">${starRow(r.stars)}</span>
          </div>
          <div class="review-side">
            ${r.date ? `<span class="review-date">${esc(r.date)}</span>` : ''}
            ${verifiedHtml}
          </div>
        </div>
        <p class="review-text">"${esc(r.text)}"</p>
        ${photosHtml}
      </article>`;
    }).join('');
  }

  renderRating();
  renderReviews();

  // Formulário — estrelas interativas
  let selectedStars = 5;
  const starBtns = document.querySelectorAll('#starInput button');
  const paintStars = n => starBtns.forEach(b => b.classList.toggle('lit', +b.dataset.star <= n));
  paintStars(selectedStars);
  starBtns.forEach(btn => {
    btn.addEventListener('mouseenter', () => paintStars(+btn.dataset.star));
    btn.addEventListener('mouseleave', () => paintStars(selectedStars));
    btn.addEventListener('click', () => { selectedStars = +btn.dataset.star; paintStars(selectedStars); });
  });

  // ===== FOTOS DA AVALIAÇÃO =====
  const MAX_PHOTOS = 3;
  let pendingPhotos = [];
  const photoInput = document.getElementById('reviewPhotos');
  const photoAddBtn = document.getElementById('photoAddBtn');
  const previewsEl = document.getElementById('photoPreviews');

  // Reduz a foto (máx. 640px, JPEG) para caber no armazenamento do navegador
  function compressImage(file) {
    return new Promise(resolve => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const scale = Math.min(1, 640 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  }

  function renderPreviews() {
    previewsEl.querySelectorAll('.photo-preview').forEach(el => el.remove());
    pendingPhotos.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'photo-preview';
      div.innerHTML = `<img src="${src}" alt="Foto ${i + 1}"><button type="button" class="photo-remove" data-i="${i}" aria-label="Remover foto">×</button>`;
      previewsEl.insertBefore(div, photoAddBtn);
    });
    photoAddBtn.style.display = pendingPhotos.length >= MAX_PHOTOS ? 'none' : '';
  }

  photoAddBtn.addEventListener('click', () => photoInput.click());
  photoInput.addEventListener('change', async () => {
    const files = [...photoInput.files].slice(0, MAX_PHOTOS - pendingPhotos.length);
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const compressed = await compressImage(file);
      if (compressed) pendingPhotos.push(compressed);
    }
    photoInput.value = '';
    renderPreviews();
    if (pendingPhotos.length) showToast('✦ Foto adicionada!');
  });
  previewsEl.addEventListener('click', e => {
    const btn = e.target.closest('.photo-remove');
    if (!btn) return;
    pendingPhotos.splice(+btn.dataset.i, 1);
    renderPreviews();
  });

  // ===== LIGHTBOX (usa o global de script.js) =====
  // Imagem principal do produto amplia ao clique
  mainImg.classList.add('zoomable');
  mainImg.addEventListener('click', () => openLightbox(mainImg.src));

  // Fotos das avaliações ampliam ao clique
  document.getElementById('reviewsList').addEventListener('click', e => {
    const photo = e.target.closest('.review-photo');
    if (photo) openLightbox(photo.dataset.src);
  });

  document.getElementById('reviewForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('reviewName').value.trim();
    const text = document.getElementById('reviewText').value.trim();
    if (!name || !text) return;

    const userReviews = loadUserReviews();
    const now = new Date();
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const date = `${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}`;
    userReviews.unshift({ name, stars: selectedStars, text, date, photos: pendingPhotos });
    try {
      localStorage.setItem(storageKey, JSON.stringify(userReviews));
    } catch (err) {
      // Armazenamento cheio — salva a avaliação sem as fotos
      userReviews[0].photos = [];
      localStorage.setItem(storageKey, JSON.stringify(userReviews));
    }
    pendingPhotos = [];
    renderPreviews();

    renderRating();
    renderReviews();
    const first = document.querySelector('#reviewsList .review-card');
    if (first) first.classList.add('review-new');
    e.target.reset();
    selectedStars = 5;
    paintStars(5);
    showToast('✦ Obrigada pela sua avaliação!');
    first && first.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // ===== RELACIONADOS =====
  const sameType = products.filter(p => p.id !== product.id && p.tag.startsWith(product.tag.split('·')[0]));
  const others = products.filter(p => p.id !== product.id && !sameType.includes(p));
  const related = [...sameType, ...others].slice(0, 3);

  document.getElementById('relatedGrid').innerHTML = related.map(p => `
    <a class="product-card related-card" href="produto.html?id=${p.id}" data-reveal>
      <div class="product-img-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
      </div>
      <div class="product-info">
        <p class="product-tag">${p.tag}</p>
        <h3 class="product-name">${p.name}</h3>
        <div class="product-price"><span class="price-current">${fmt(p.price)}</span></div>
      </div>
    </a>`).join('');

  // ===== ANIMAÇÕES =====
  // Entrada escalonada do topo da página
  document.querySelectorAll('.pdp-anim').forEach((el, i) => {
    el.style.animationDelay = `${i * 0.09}s`;
  });

  // Reveal on scroll (os data-reveal criados agora, após o observer do script.js)
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-reveal]:not(.revealed)').forEach(el => observer.observe(el));

  function publicarMetadados(p) {
    const SITE = location.href.replace(/[^/]*$/, '');
    const absoluto = (caminho) => new URL(caminho, SITE).href;
    const foto = absoluto(p.image);

    const og = (propriedade, conteudo) => {
      let el = document.querySelector(`meta[property="${propriedade}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', propriedade);
        document.head.appendChild(el);
      }
      el.setAttribute('content', conteudo);
    };

    og('og:title', `${p.name} — JS Joias Delicadas`);
    og('og:description', p.desc || `${p.name}, semi-joia antialérgica com 1 ano de garantia.`);
    og('og:image', foto);
    og('og:url', location.href);
    og('product:price:amount', p.price.toFixed(2));
    og('product:price:currency', 'BRL');
    og('product:availability', p.soldOut ? 'out of stock' : 'in stock');

    const dados = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      description: p.desc || '',
      image: [foto],
      sku: p.id,
      brand: { '@type': 'Brand', name: 'JS Joias Delicadas' },
      material: (p.details || []).find(d => /ouro|ródio|rodio|prata/i.test(d)) || 'Ouro 18k',
      offers: {
        '@type': 'Offer',
        url: location.href,
        priceCurrency: 'BRL',
        price: p.price.toFixed(2),
        itemCondition: 'https://schema.org/NewCondition',
        availability: p.soldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'JS Joias Delicadas' }
      }
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(dados);
    document.head.appendChild(script);
  }

})();
