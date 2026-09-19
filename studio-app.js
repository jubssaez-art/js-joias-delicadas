/* ===========================
   STUDIO MIURA — página principal
   Monta o conteúdo a partir de data/studio.js (editado pelo painel) e liga
   menu, carrossel e animações. O HTML traz o mesmo conteúdo escrito à mão,
   que só aparece se este script ou os dados não carregarem.
   =========================== */

(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');

  var PREVIEW_KEY = 'studio_miura_preview';

  // ---------- Dados: prévia do painel (só neste navegador) ou publicados ----------
  var S = window.STUDIO || null;
  var emPrevia = false;
  try {
    var bruto = localStorage.getItem(PREVIEW_KEY);
    if (bruto) { S = JSON.parse(bruto); emPrevia = true; }
  } catch (e) { /* sem storage: segue com os publicados */ }

  var ICONES = window.STUDIO_ICONES || {};
  var GRADS = window.STUDIO_GRADIENTES || [['#8c3b43', '#3e171c']];

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // *itálico* e **negrito**, depois de escapar
  function fmt(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
  }
  function lista(a) { return (a || []).filter(function (x) { return String(x || '').trim(); }); }
  function dois(n) { return (n < 10 ? '0' : '') + n; }
  function icone(chave, traco) {
    var i = ICONES[chave] || ICONES.estrela || { svg: '' };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + traco + '" aria-hidden="true">' + i.svg + '</svg>';
  }

  var numero = S && S.contato && String(S.contato.whatsapp || '').replace(/\D/g, '');
  function wa(msg) { return 'https://wa.me/' + numero + (msg ? '?text=' + encodeURIComponent(msg) : ''); }
  function telefoneBonito(d) {
    var n = String(d || '').replace(/^55/, '');
    if (n.length === 11) return '(' + n.slice(0, 2) + ') ' + n.slice(2, 7) + '-' + n.slice(7);
    if (n.length === 10) return '(' + n.slice(0, 2) + ') ' + n.slice(2, 6) + '-' + n.slice(6);
    return d;
  }

  if (S) {
    try { montar(); } catch (e) { if (window.console) console.error('Studio: falha ao montar a página', e); }
  }
  ligarInterface();

  // ===================================================================
  function montar() {
    var areas = (S.areas || []).filter(function (a) { return a && a.visivel !== false; });
    var laserOn = !S.laser || S.laser.visivel !== false;

    // Todos os links de WhatsApp escritos à mão passam a usar o número dos dados
    if (numero) {
      document.querySelectorAll('a[href^="https://wa.me/"]').forEach(function (a) {
        a.href = a.href.replace(/wa\.me\/\d+/, 'wa.me/' + numero);
      });
    }

    // Barra de avisos: no celular ficam o primeiro e o último
    var avisos = lista(S.avisos);
    if ($('annInner')) {
      if (!avisos.length) $('announcementBar').hidden = true;
      $('annInner').innerHTML = avisos.map(function (t, i) {
        var meio = i > 0 && i < avisos.length - 1 ? ' hide-sm' : '';
        return (i ? '<span class="sep' + meio + '">|</span>' : '') + '<span class="' + meio.trim() + '">' + esc(t) + '</span>';
      }).join('');
    }

    // Capa
    if (S.capa) {
      if ($('heroSub')) $('heroSub').innerHTML = fmt(S.capa.subtitulo);
      if ($('heroBadges')) $('heroBadges').innerHTML = lista(S.capa.selos).map(function (t) {
        return '<div class="badge"><span class="badge-icon">✦</span><span>' + esc(t) + '</span></div>';
      }).join('');
    }

    // Conceito
    var c = S.conceito;
    if (c) {
      if ($('conceptTitle')) $('conceptTitle').innerHTML = fmt(c.titulo);
      if ($('conceptTexts')) $('conceptTexts').innerHTML = lista(c.textos).map(function (t) { return '<p>' + fmt(t) + '</p>'; }).join('');
      if ($('conceptUniao')) $('conceptUniao').innerHTML = lista(c.uniao).map(function (t, i) {
        return '<li><span class="plus">' + (i ? '+' : '') + '</span>' + esc(t) + '</li>';
      }).join('');
      if ($('conceptFoot')) { $('conceptFoot').innerHTML = fmt(c.rodape); $('conceptFoot').hidden = !c.rodape; }
    }

    // Cabeçalho dos serviços
    if (S.servicos) {
      if ($('servTitle')) $('servTitle').innerHTML = fmt(S.servicos.titulo);
      if ($('servSub')) $('servSub').innerHTML = fmt(S.servicos.subtitulo);
    }

    function linkMais(a) {
      if (a.id === 'laser' && laserOn) return { href: '#laser', texto: 'Ver áreas atendidas →', externo: false };
      return { href: '#card-' + a.id, texto: 'Todos os serviços →', externo: false };
    }

    // Carrossel
    var total = areas.length;
    if ($('areasCarousel')) {
      $('areasCarousel').hidden = !total;
      $('acTabs').innerHTML = areas.map(function (a, i) {
        return '<button class="ac-tab' + (i ? '' : ' is-active') + '" role="tab" id="ac-tab-' + i + '" aria-controls="ac-slide-' + i +
          '" aria-selected="' + (i ? 'false' : 'true') + '"' + (i ? ' tabindex="-1"' : '') + '><span class="n">' + dois(i + 1) + '</span>' +
          esc(a.aba || a.nome) + '</button>';
      }).join('');
      $('acViewport').innerHTML = areas.map(function (a, i) {
        var g = GRADS[i % GRADS.length];
        var mais = linkMais(a);
        return '<article class="ac-slide' + (i ? '' : ' is-active') + '" role="tabpanel" id="ac-slide-' + i + '" aria-labelledby="ac-tab-' + i +
          '" style="--g1:' + g[0] + ';--g2:' + g[1] + '">' +
          '<div class="ac-art" aria-hidden="true"><span class="ac-num">' + dois(i + 1) + '</span>' +
          '<img src="img/studio/simbolo-creme.png" alt="" class="ac-symbol">' +
          '<div class="ac-icon">' + icone(a.icone, 0.7) + '</div>' +
          '<span class="ac-caption">Studio Miura' + (a.legenda ? ' · ' + esc(a.legenda) : '') + '</span></div>' +
          '<div class="ac-body"><p class="ac-kicker">Área ' + dois(i + 1) + ' / ' + dois(total) + '</p>' +
          '<h3 class="ac-title">' + fmt(a.titulo || a.nome) + '</h3>' +
          (a.texto ? '<p class="ac-text">' + fmt(a.texto) + '</p>' : '') +
          (lista(a.destaques).length ? '<ul class="ac-highlights">' + lista(a.destaques).map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul>' : '') +
          '<div class="ac-actions"><a href="' + wa(a.mensagem) + '" target="_blank" rel="noopener" class="btn btn-marsala">' + esc(a.botao || 'Agendar') + '</a>' +
          '<a href="' + mais.href + '" class="ac-more">' + mais.texto + '</a></div></div></article>';
      }).join('');
      if ($('acTotal')) $('acTotal').textContent = dois(total);
    }

    // Grade de cartões
    if ($('servicesGrid')) {
      $('servicesGrid').innerHTML = areas.map(function (a, i) {
        var link = a.id === 'laser' && laserOn
          ? '<a href="#laser" class="service-link">Ver áreas atendidas →</a>'
          : '<a href="' + wa(a.mensagem) + '" target="_blank" rel="noopener" class="service-link">Agendar →</a>';
        return '<article class="service-card reveal" id="card-' + esc(a.id) + '"><span class="service-num">' + dois(i + 1) + '</span>' +
          '<div class="service-icon">' + icone(a.icone, 1.5) + '</div>' +
          '<h3>' + esc(a.nome) + '</h3>' +
          (a.descricao ? '<p>' + fmt(a.descricao) + '</p>' : '') +
          (lista(a.servicos).length ? '<ul class="service-tags">' + lista(a.servicos).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
          link + '</article>';
      }).join('');
    }

    // Depilação a laser (seção de destaque)
    if ($('laser')) {
      $('laser').hidden = !laserOn;
      document.querySelectorAll('a[href="#laser"].nav-link, a[href="#laser"].mobile-nav-link').forEach(function (l) { l.hidden = !laserOn; });
      var L = S.laser;
      if (L && laserOn) {
        $('laserTexts').innerHTML = lista(L.textos).map(function (t) { return '<p class="laser-text">' + fmt(t) + '</p>'; }).join('');
        var etapas = (L.etapas || []).filter(function (e) { return e && (e.titulo || e.texto); });
        $('laserSteps').hidden = !etapas.length;
        $('laserSteps').innerHTML = etapas.map(function (e, i) {
          return '<li><span class="step-n">' + (i + 1) + '</span><div><strong>' + esc(e.titulo) + '</strong><span class="desc">' + esc(e.texto) + '</span></div></li>';
        }).join('');
        var ar = lista(L.areas);
        $('laserAreasBox').hidden = !ar.length;
        $('laserAreas').innerHTML = ar.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
        $('laserBtn').href = wa(L.mensagem);
      }
    }

    // Joias parceiras
    if ($('joias') && S.joias) {
      $('joias').hidden = S.joias.visivel === false;
      if (S.joias.titulo) $('joiasTitle').innerHTML = fmt(S.joias.titulo);
      if (S.joias.texto) $('joiasText').innerHTML = fmt(S.joias.texto);
      if (S.joias.visivel !== false) vitrineDeJoias();
    }

    // Rodapé
    if ($('footerServices')) {
      $('footerServices').innerHTML = areas.map(function (a) {
        var href = a.id === 'laser' && laserOn ? '#laser' : '#card-' + a.id;
        return '<li><a href="' + href + '">' + esc(a.nome) + '</a></li>';
      }).join('');
    }
    var ct = S.contato || {};
    if ($('footerContact')) {
      var h = '';
      if (numero) {
        h += '<p>WhatsApp</p><a href="' + wa('') + '" target="_blank" rel="noopener">' + esc(telefoneBonito(numero)) + '</a>';
        h += '<p>Telefone</p><a href="tel:+' + numero + '">' + esc(telefoneBonito(numero)) + '</a>';
      }
      if (ct.instagram) {
        var ig = String(ct.instagram).replace(/^@/, '');
        h += '<p>Instagram</p><a href="https://instagram.com/' + encodeURIComponent(ig) + '" target="_blank" rel="noopener">@' + esc(ig) + '</a>';
      }
      if (ct.endereco) h += '<p>Endereço</p><span>' + esc(ct.endereco) + '</span>';
      if (ct.horario) h += '<p>Horário</p><span>' + esc(ct.horario) + '</span>';
      $('footerContact').innerHTML = h;
    }
    if (ct.endereco) {
      if ($('footerDesc')) $('footerDesc').textContent = 'Centro integrado de beleza e estética em ' + ct.endereco + '.';
      if ($('footerAddr')) $('footerAddr').textContent = ct.endereco;
    }

    if (emPrevia) avisoDePrevia();
  }

  /* Vitrine das joias: mesmos dados e mesma regra de "lançamento" do catálogo
     (script.js). Sem lançamento marcado, mostra uma peça de cada tipo à venda
     para a seção nunca ficar vazia. */
  function vitrineDeJoias() {
    var auto = window.PRODUCTS_AUTO || [];
    var estado = {
      overrides: window.PRODUCTS_OVERRIDE || {},
      extras: window.PRODUCTS_EXTRA || []
    };
    try {
      var pj = JSON.parse(localStorage.getItem('js_joias_override_preview') || 'null');
      if (pj && (pj.overrides || pj.extras)) estado = { overrides: pj.overrides || {}, extras: pj.extras || [] };
    } catch (e) { /* segue com o publicado */ }

    var pecas = auto.map(function (p) {
      var o = estado.overrides[p.id] || {};
      if (o.hidden) return null;
      var q = {};
      for (var k in p) q[k] = p[k];
      ['name', 'badge'].forEach(function (k) { if (typeof o[k] === 'string' && o[k].trim()) q[k] = o[k].trim(); });
      if (typeof o.badge === 'string' && !o.badge.trim()) delete q.badge;
      if (typeof o.price === 'number' && o.price > 0) q.price = o.price;
      if (typeof o.soldOut === 'boolean') q.soldOut = o.soldOut;
      if (typeof o.lancamento === 'boolean') q.lancamento = o.lancamento;
      return q;
    }).filter(Boolean);
    var extras = estado.extras.filter(function (x) { return x && !x.hidden && String(x.image || '').indexOf('data:') !== 0; })
      .map(function (x) { var q = {}; for (var k in x) q[k] = x[k]; q.lancamento = x.lancamento !== false; return q; });
    pecas = extras.concat(pecas).filter(function (p) { return !p.soldOut && p.image; });

    function eLancamento(p) {
      if (typeof p.lancamento === 'boolean') return p.lancamento;
      return /novidade|lan[cç]amento|\bnovo\b/i.test(p.badge || '');
    }
    var lancs = pecas.filter(eLancamento);
    var mostrar, temLanc = lancs.length > 0;
    if (temLanc) {
      mostrar = lancs.slice(0, 4);
    } else {
      var vistos = {};
      mostrar = pecas.filter(function (p) {
        var tipo = String(p.tag || '').split('·')[0].trim();
        if (vistos[tipo]) return false;
        vistos[tipo] = true;
        return true;
      }).slice(0, 4);
    }
    if (!mostrar.length) return;   // fica a vitrine escrita no HTML

    function preco(v) { return 'R$ ' + Number(v).toFixed(2).replace('.', ','); }
    $('joiasGrid').innerHTML = mostrar.map(function (p) {
      return '<a href="produto.html?id=' + encodeURIComponent(p.id) + '" class="partner-card">' +
        '<div class="pc-img"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy">' +
        (temLanc ? '<span class="pc-badge">Lançamento</span>' : '') + '</div>' +
        '<div class="pc-info"><span class="pc-tag">' + esc(p.tag || '') + '</span><h3>' + esc(p.name) + '</h3>' +
        '<span class="pc-price">' + preco(p.price) + '</span></div></a>';
    }).join('');
    $('joiasGrid').style.setProperty('--n', mostrar.length);
    $('joiasStripLabel').textContent = temLanc ? '✦ Lançamentos' : '✦ Destaques da coleção';
    $('joiasStripLink').href = temLanc ? 'joias.html#lancamentos' : 'joias.html';
    $('joiasStripLink').textContent = temLanc ? 'Ver todos os lançamentos →' : 'Ver todas →';
    $('joiasCta').href = temLanc ? 'joias.html#lancamentos' : 'joias.html';
    $('joiasCta').textContent = temLanc ? 'Ver Lançamentos' : 'Ver as Joias';
  }

  function avisoDePrevia() {
    var d = document.createElement('div');
    d.className = 'preview-flag';
    d.innerHTML = '<span>✦ Prévia do painel — só você vê</span><button type="button">Sair da prévia</button>';
    d.querySelector('button').addEventListener('click', function () {
      try { localStorage.removeItem(PREVIEW_KEY); } catch (e) { /* ignora */ }
      location.reload();
    });
    document.body.appendChild(d);
  }

  // ===================================================================
  function ligarInterface() {
    var bar = $('announcementBar');
    if ($('closeAnnouncement')) $('closeAnnouncement').addEventListener('click', function () { bar.classList.add('hidden'); });

    var navbar = $('navbar');
    function onScroll() { navbar.classList.toggle('scrolled', window.scrollY > 10); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var menu = $('mobileMenu'), overlay = $('mobileOverlay'), burger = $('hamburger');
    function setMenu(open) {
      menu.classList.toggle('open', open);
      overlay.classList.toggle('active', open);
      burger.setAttribute('aria-expanded', open);
      menu.setAttribute('aria-hidden', !open);
      document.body.style.overflow = open ? 'hidden' : '';
    }
    burger.addEventListener('click', function () { setMenu(true); });
    $('mobileClose').addEventListener('click', function () { setMenu(false); });
    overlay.addEventListener('click', function () { setMenu(false); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

    carrossel();

    var itens = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      itens.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    itens.forEach(function (el) { io.observe(el); });
  }

  // Carrossel das áreas: a barra de progresso da aba ativa é uma animação CSS
  // e o fim dela avança o slide — pausar é só parar a animação.
  function carrossel() {
    var root = $('areasCarousel');
    if (!root || root.hidden) return;
    var tabs = root.querySelectorAll('.ac-tab');
    var slides = root.querySelectorAll('.ac-slide');
    if (!slides.length) return;
    var contador = $('acCurrent');
    var atual = 0;
    var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (semMovimento) root.classList.add('is-static');

    function ir(i, foco) {
      atual = (i + slides.length) % slides.length;
      tabs.forEach(function (t, k) {
        var ativo = k === atual;
        t.classList.toggle('is-active', ativo);
        t.setAttribute('aria-selected', ativo);
        t.tabIndex = ativo ? 0 : -1;
      });
      slides.forEach(function (s, k) {
        var ativo = k === atual;
        s.classList.toggle('is-active', ativo);
        s.setAttribute('aria-hidden', !ativo);
        s.inert = !ativo;
      });
      contador.textContent = dois(atual + 1);
      if (foco) tabs[atual].focus();
      var aba = tabs[atual];
      aba.classList.remove('is-active'); void aba.offsetWidth; aba.classList.add('is-active');
      // No celular as abas rolam na horizontal: centraliza a ativa sem mexer na página
      var barra = aba.parentNode;
      barra.scrollTo({ left: aba.offsetLeft - (barra.clientWidth - aba.offsetWidth) / 2, behavior: semMovimento ? 'auto' : 'smooth' });
    }

    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { ir(k); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); ir(atual + 1, true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); ir(atual - 1, true); }
      });
      t.addEventListener('animationend', function () { if (!semMovimento && k === atual && slides.length > 1) ir(atual + 1); });
    });
    $('acPrev').addEventListener('click', function () { ir(atual - 1); });
    $('acNext').addEventListener('click', function () { ir(atual + 1); });

    // Pausa com o mouse em cima, com foco dentro, ou fora da tela
    var pausas = { hover: false, foco: false, fora: true };
    function atualizarPausa() { root.classList.toggle('is-paused', pausas.hover || pausas.foco || pausas.fora); }
    root.addEventListener('mouseenter', function () { pausas.hover = true; atualizarPausa(); });
    root.addEventListener('mouseleave', function () { pausas.hover = false; atualizarPausa(); });
    root.addEventListener('focusin', function () { pausas.foco = true; atualizarPausa(); });
    root.addEventListener('focusout', function () { pausas.foco = false; atualizarPausa(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { pausas.fora = !en[0].isIntersecting; atualizarPausa(); }, { threshold: 0.35 }).observe(root);
    } else { pausas.fora = false; }
    atualizarPausa();

    // Arrastar com o dedo
    var vp = root.querySelector('.ac-viewport'), x0 = null;
    vp.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') x0 = e.clientX; });
    vp.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) ir(atual + (dx < 0 ? 1 : -1));
    });
    vp.addEventListener('pointercancel', function () { x0 = null; });

    ir(0);
  }
})();
