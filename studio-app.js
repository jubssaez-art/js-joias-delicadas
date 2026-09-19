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
  var abasSvc = null, abasProd = null;   // controles das abas dos catálogos
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

    // Faixa de procedimentos (fotos)
    var PR = S.procedimentos;
    if ($('procedimentos')) {
      var fotos = PR && PR.visivel !== false ? (PR.itens || []).filter(function (x) { return x && x.foto && x.nome; }) : [];
      $('procedimentos').hidden = !fotos.length;
      if (fotos.length) {
        if (PR.titulo) $('procTitle').innerHTML = fmt(PR.titulo);
        var cartao = function (x, copia) {
          return '<a class="proc-card" href="' + wa(x.mensagem || ('Olá! Gostaria de agendar: ' + x.nome + '.')) + '" target="_blank" rel="noopener"' +
            (copia ? ' aria-hidden="true" tabindex="-1"' : '') + '>' +
            '<img src="' + esc(x.foto) + '" alt="' + (copia ? '' : esc(x.nome)) + '" decoding="async" draggable="false">' +
            '<span class="proc-info"><span class="proc-area">' + esc(x.area || 'Studio Miura') + '</span>' +
            '<span class="proc-name">' + esc(x.nome) + '</span><span class="proc-cta">Agendar →</span></span></a>';
        };
        // Duas cópias seguidas: quando a primeira sai inteira da tela, a faixa volta sem emenda
        $('procTrack').innerHTML = fotos.map(function (x) { return cartao(x, false); }).join('') +
          fotos.map(function (x) { return cartao(x, true); }).join('');
      }
    }

    // Cabeçalho dos serviços
    if (S.servicos) {
      if ($('servTitle')) $('servTitle').innerHTML = fmt(S.servicos.titulo);
      if ($('servSub')) $('servSub').innerHTML = fmt(S.servicos.subtitulo);
    }

    function linkMais(a) {
      if (a.id === 'laser' && laserOn) return { href: '#laser', texto: 'Ver áreas atendidas →', externo: false };
      return { href: '#servico-' + a.id, texto: 'Todos os serviços →', externo: false };
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

    // Catálogo de serviços: uma aba por área, um cartão por serviço (sem preço)
    if ($('svcPanes') && areas.length) {
      var cs = S.catalogoServicos || {};
      if (cs.titulo) $('svcTitle').innerHTML = fmt(cs.titulo);
      if ($('svcSub')) { $('svcSub').innerHTML = fmt(cs.subtitulo || ''); $('svcSub').hidden = !cs.subtitulo; }
      abasSvc = montarAbas($('svcTabs'), $('svcPanes'), 'svc', areas.map(function (a, ai) {
        var g = GRADS[ai % GRADS.length];
        var itens = (a.servicos || []).map(function (s) { return typeof s === 'string' ? { nome: s } : s; })
          .filter(function (s) { return s && String(s.nome || '').trim(); });
        var topo = '<div class="svc-pane-head"><div>' +
          '<p class="svc-pane-kicker">' + dois(ai + 1) + ' · ' + esc(a.legenda || 'Studio Miura') + '</p>' +
          '<h4>' + fmt(a.titulo || a.nome) + '</h4>' +
          (a.descricao ? '<p>' + fmt(a.descricao) + '</p>' : '') + '</div>' +
          '<div class="svc-pane-actions">' +
          (a.id === 'laser' && laserOn ? '<a href="#laser" class="ac-more">Ver áreas atendidas →</a>' : '') +
          '<a href="' + wa(a.mensagem) + '" target="_blank" rel="noopener" class="btn btn-marsala">' + esc(a.botao || 'Agendar') + '</a></div></div>';
        var cards = itens.map(function (s, si) {
          var msg = 'Olá! Gostaria de agendar: ' + s.nome + ' (' + a.nome + ').';
          var arte = s.foto
            ? '<img src="' + esc(s.foto) + '" alt="' + esc(s.nome) + '" loading="lazy">'
            : '<span class="svc-num">' + dois(si + 1) + '</span><span class="svc-ico">' + icone(a.icone, 0.8) + '</span>';
          return '<article class="svc-card" style="--g1:' + g[0] + ';--g2:' + g[1] + ';--i:' + si + '">' +
            '<div class="svc-art' + (s.foto ? ' has-photo' : '') + '">' + arte + '</div>' +
            '<div class="svc-info"><span class="svc-area">' + esc(a.aba || a.nome) + '</span>' +
            '<h5>' + esc(s.nome) + '</h5>' + (s.descricao ? '<p>' + fmt(s.descricao) + '</p>' : '') +
            '<a href="' + wa(msg) + '" target="_blank" rel="noopener" class="svc-link">Agendar →</a></div></article>';
        }).join('');
        return {
          id: a.id,
          rotulo: '<span class="ct-ico">' + icone(a.icone, 1.5) + '</span>' + esc(a.aba || a.nome),
          html: topo + (cards ? '<div class="svc-grid">' + cards + '</div>' : '')
        };
      }));
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

    // Botão flutuante de lançamentos das joias
    if ((S.joias || {}).botao !== false) botaoLancamentos(selecionarJoias());

    // Produtos: uma aba por categoria cadastrada no painel
    if ($('prodPanes')) {
      var P = S.produtos || {};
      if (P.titulo) $('prodTitle').innerHTML = fmt(P.titulo);
      if ($('prodSub')) { $('prodSub').innerHTML = fmt(P.subtitulo || ''); $('prodSub').hidden = !P.subtitulo; }
      var ICONE_CAT = { maquiagem: 'espelho', skincare: 'gota', cabelo: 'folha' };
      var itensP = (P.itens || []).filter(function (x) { return x && x.visivel !== false && String(x.nome || '').trim(); });
      var abasP = (P.categorias || []).filter(function (c) { return c && c.visivel !== false; }).map(function (c) {
        var meus = itensP.filter(function (x) { return x.categoria === c.id; });
        var ic = c.icone || ICONE_CAT[c.id] || 'estrela';
        var html = meus.length
          ? '<div class="partner-grid prod-grid" style="--n:' + Math.min(4, meus.length) + '">' + meus.map(function (x) {
              var msg = 'Olá! Tenho interesse no produto ' + x.nome + (x.marca ? ' (' + x.marca + ')' : '') + '.';
              return '<a href="' + wa(msg) + '" target="_blank" rel="noopener" class="partner-card">' +
                '<div class="pc-img">' + (x.foto ? '<img src="' + esc(x.foto) + '" alt="' + esc(x.nome) + '" loading="lazy">'
                  : '<span class="pc-placeholder">' + icone(ic, 0.8) + '</span>') + '</div>' +
                '<div class="pc-info"><span class="pc-tag">' + esc(x.marca || c.nome) + '</span><h3>' + esc(x.nome) + '</h3>' +
                (x.descricao ? '<p class="pc-desc">' + fmt(x.descricao) + '</p>' : '') +
                '<span class="pc-price">' + (x.preco ? esc(x.preco) : 'Consulte') + '</span>' +
                '<span class="pc-link">Quero este →</span></div></a>';
            }).join('') + '</div>'
          : '<div class="cat-empty"><span class="cat-empty-ico">' + icone(ic, 0.9) + '</span>' +
            '<h4>' + esc(c.nome) + ' <em>em breve</em></h4>' +
            '<p>Estamos selecionando os produtos desta linha. Pergunte no WhatsApp o que já temos disponível no Studio.</p>' +
            '<a href="' + wa('Olá! Quais produtos de ' + c.nome.toLowerCase() + ' vocês têm disponíveis?') + '" target="_blank" rel="noopener" class="btn btn-outline">Perguntar no WhatsApp</a></div>';
        return { id: c.id, rotulo: '<span class="ct-ico">' + icone(ic, 1.5) + '</span>' + esc(c.nome), html: html, vazio: !meus.length };
      });
      $('produtos').hidden = !abasP.length;
      if (abasP.length) {
        // Abre na primeira aba com produtos (as vazias continuam acessíveis)
        var inicial = abasP.filter(function (a) { return !a.vazio; })[0] || abasP[0];
        abasProd = montarAbas($('prodTabs'), $('prodPanes'), 'prod', abasP, inicial.id);
      }
    }

    // Rodapé
    if ($('footerServices')) {
      $('footerServices').innerHTML = areas.map(function (a) {
        var href = a.id === 'laser' && laserOn ? '#laser' : '#servico-' + a.id;
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

    ligarLinksDeAba();
    if (emPrevia) avisoDePrevia();
  }

  /* Peças para a vitrine e o botão de lançamentos: mesmos dados e mesma regra
     de "lançamento" do catálogo (script.js). Sem lançamento marcado, uma peça
     de cada tipo à venda, para nada ficar vazio. */
  function selecionarJoias() {
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
    return { mostrar: mostrar, temLanc: temLanc, qtdLanc: lancs.length };
  }

  function preco(v) { return 'R$ ' + Number(v).toFixed(2).replace('.', ','); }

  /* Botão flutuante "Lançamentos": abre um painel com as fotos das peças.
     Fecha no ×, no Esc ou clicando fora. */
  function botaoLancamentos(sel) {
    if (!sel.mostrar.length) return;
    var temLanc = sel.temLanc;
    var destino = temLanc ? 'joias.html#lancamentos' : 'joias.html';
    var fab = document.createElement('div');
    fab.className = 'launch-fab' + (temLanc ? ' has-new' : '');
    fab.innerHTML =
      '<button type="button" class="lf-btn" aria-expanded="false" aria-controls="lfPanel">' +
        '<span class="lf-spark" aria-hidden="true">✦</span>' +
        '<span class="lf-label">Lançamentos</span>' +
        (temLanc ? '<span class="lf-count">' + sel.qtdLanc + '</span>' : '') +
      '</button>' +
      '<div class="lf-panel" id="lfPanel" role="dialog" aria-label="Lançamentos das joias" hidden>' +
        '<div class="lf-head"><div>' +
          '<p class="lf-kicker">Lançamentos · JS Joias</p>' +
          '<h3>' + (temLanc ? 'Acabaram de <em>chegar</em>' : 'Novidades <em>em breve</em>') + '</h3>' +
          (temLanc ? '' : '<p class="lf-note">Enquanto isso, veja os destaques da coleção.</p>') +
        '</div><button type="button" class="lf-close" aria-label="Fechar">×</button></div>' +
        '<div class="lf-items">' + sel.mostrar.map(function (p, i) {
          return '<a class="lf-item" href="produto.html?id=' + encodeURIComponent(p.id) + '" style="--i:' + i + '">' +
            '<span class="lf-img"><img src="' + esc(p.image) + '" alt="" loading="lazy"></span>' +
            '<span class="lf-name">' + esc(p.name) + '</span><span class="lf-price">' + preco(p.price) + '</span></a>';
        }).join('') + '</div>' +
        '<a class="btn btn-marsala lf-cta" href="' + destino + '">' + (temLanc ? 'Ver todos os lançamentos' : 'Ver as joias') + ' →</a>' +
      '</div>';
    document.body.appendChild(fab);

    var btn = fab.querySelector('.lf-btn');
    var painel = fab.querySelector('.lf-panel');
    function abrir(sim) {
      fab.classList.toggle('is-open', sim);
      btn.setAttribute('aria-expanded', sim);
      if (sim) {
        painel.hidden = false;
        void painel.offsetWidth;          // deixa a animação de entrada acontecer
        painel.classList.add('is-in');
      } else {
        painel.classList.remove('is-in');
        setTimeout(function () { if (!fab.classList.contains('is-open')) painel.hidden = true; }, 260);
      }
    }
    btn.addEventListener('click', function () { abrir(!fab.classList.contains('is-open')); });
    fab.querySelector('.lf-close').addEventListener('click', function () { abrir(false); btn.focus(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && fab.classList.contains('is-open')) { abrir(false); btn.focus(); } });
    document.addEventListener('click', function (e) { if (fab.classList.contains('is-open') && !fab.contains(e.target)) abrir(false); });
    // Entra depois que a capa aparece
    setTimeout(function () { fab.classList.add('is-visible'); }, 1200);
  }

  /* Abas de catálogo (serviços e produtos). Cada item: { id, rotulo (HTML),
     html } para criar o painel, ou { id, rotulo, no } para reaproveitar um
     elemento que já está na página. Devolve { abrir(id) }. */
  function montarAbas(barra, paineis, prefixo, itens, inicialId) {
    var nos = itens.map(function (it) {
      var el = it.no || document.createElement('div');
      if (!it.no) { el.innerHTML = it.html; el.id = prefixo + '-' + it.id; }
      el.classList.add('cat-pane');
      el.setAttribute('role', 'tabpanel');
      el.setAttribute('aria-labelledby', prefixo + '-tab-' + it.id);
      return el;
    });
    paineis.innerHTML = '';
    nos.forEach(function (el) { paineis.appendChild(el); });
    barra.innerHTML = itens.map(function (it) {
      return '<button type="button" class="cat-tab" role="tab" id="' + prefixo + '-tab-' + esc(it.id) + '" aria-controls="' +
        nos[itens.indexOf(it)].id + '" data-id="' + esc(it.id) + '">' + it.rotulo + '</button>';
    }).join('');
    var botoes = barra.querySelectorAll('.cat-tab');

    function abrir(id, foco) {
      var achou = false;
      itens.forEach(function (it, k) {
        var ativo = it.id === id;
        if (ativo) achou = true;
        botoes[k].classList.toggle('is-active', ativo);
        botoes[k].setAttribute('aria-selected', ativo);
        botoes[k].tabIndex = ativo ? 0 : -1;
        nos[k].hidden = !ativo;
        nos[k].classList.remove('is-in');
        if (ativo) { void nos[k].offsetWidth; nos[k].classList.add('is-in'); }
        if (ativo && foco) botoes[k].focus();
        if (ativo) barra.scrollTo({ left: botoes[k].offsetLeft - (barra.clientWidth - botoes[k].offsetWidth) / 2, behavior: 'smooth' });
      });
      if (!achou && itens.length) abrir(itens[0].id, foco);
    }
    botoes.forEach(function (b, k) {
      b.addEventListener('click', function () { abrir(itens[k].id); });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        abrir(itens[(k + d + itens.length) % itens.length].id, true);
      });
    });
    abrir(inicialId || (itens[0] && itens[0].id));
    return { abrir: abrir };
  }

  // Links "#servico-<área>" abrem a aba da área no catálogo
  function ligarLinksDeAba() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#servico-"]');
      if (!a) return;
      var alvo = a.getAttribute('href');
      if (!abasSvc) return;
      e.preventDefault();
      abasSvc.abrir(alvo.slice('#servico-'.length));
      $('svcCatalog').scrollIntoView({ behavior: 'smooth' });
    });
    var m = location.hash.match(/^#servico-(.+)$/);
    if (m && abasSvc) { abasSvc.abrir(m[1]); setTimeout(function () { $('svcCatalog').scrollIntoView(); }, 0); }
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
    quemSomos();
    faixaProcedimentos();

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

  /* Faixa de procedimentos: anda sozinha para a esquerda; pausa com o mouse
     em cima ou fora da tela; dá para arrastar (dedo ou mouse) e usar as setas
     do teclado. Arrastar não conta como clique na foto. */
  function faixaProcedimentos() {
    var box = $('procMarquee'), trilho = $('procTrack');
    if (!box || !trilho || $('procedimentos').hidden || !trilho.children.length) return;
    var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var VEL = 38;                 // px por segundo
    var x = 0, meio = 0, ultimo = 0, emCima = false, visivel = true;
    var arrastando = false, x0 = 0, xIni = 0, moveu = false, vel = 0, tPrev = 0, xPrev = 0;

    function medir() { meio = trilho.scrollWidth / 2; }
    function ajustar() {
      if (meio <= 0) return;
      while (x <= -meio) x += meio;
      while (x > 0) x -= meio;
      trilho.style.transform = 'translate3d(' + x + 'px,0,0)';
    }
    function passo(t) {
      var dt = ultimo ? Math.min(0.05, (t - ultimo) / 1000) : 0;
      ultimo = t;
      if (!arrastando && visivel) {
        if (Math.abs(vel) > 5) { x += vel * dt; vel *= Math.pow(0.04, dt); }   // embalo depois de soltar
        else if (!emCima && !semMovimento) x -= VEL * dt;
        ajustar();
      }
      requestAnimationFrame(passo);
    }

    box.addEventListener('mouseenter', function () { emCima = true; box.classList.add('is-paused'); });
    box.addEventListener('mouseleave', function () { emCima = false; box.classList.remove('is-paused'); });
    box.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      arrastando = true; moveu = false; x0 = e.clientX; xIni = x; vel = 0; tPrev = performance.now(); xPrev = x;
      box.classList.add('is-dragging');
    });
    window.addEventListener('pointermove', function (e) {
      if (!arrastando) return;
      var dx = e.clientX - x0;
      if (Math.abs(dx) > 6) moveu = true;
      x = xIni + dx;
      var agora = performance.now();
      if (agora - tPrev > 16) { vel = (x - xPrev) / ((agora - tPrev) / 1000); tPrev = agora; xPrev = x; }
      ajustar();
    });
    function soltar() {
      if (!arrastando) return;
      arrastando = false;
      box.classList.remove('is-dragging');
      if (performance.now() - tPrev > 120) vel = 0;
    }
    window.addEventListener('pointerup', soltar);
    window.addEventListener('pointercancel', soltar);
    // Clique que foi arrasto não abre o WhatsApp
    trilho.addEventListener('click', function (e) { if (moveu) { e.preventDefault(); moveu = false; } }, true);
    box.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { vel = -520; e.preventDefault(); }
      if (e.key === 'ArrowLeft') { vel = 520; e.preventDefault(); }
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visivel = en[0].isIntersecting; }).observe(box);
    }
    window.addEventListener('resize', medir);
    trilho.querySelectorAll('img').forEach(function (im) { if (!im.complete) im.addEventListener('load', medir); });
    medir();
    requestAnimationFrame(passo);
  }

  /* "Quem somos": o texto do Studio fica recolhido atrás de um botão.
     Os links #studio (menu e rodapé) abrem o painel antes de rolar até ele. */
  function quemSomos() {
    var btn = $('aboutToggle'), painel = $('aboutPanel');
    if (!btn || !painel) return;
    function abrir(sim) {
      btn.setAttribute('aria-expanded', sim);
      btn.classList.toggle('is-open', sim);
      if (sim) {
        painel.hidden = false;
        painel.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
        void painel.offsetWidth;
        painel.classList.add('is-in');
      } else {
        painel.classList.remove('is-in');
        painel.hidden = true;
      }
    }
    btn.addEventListener('click', function () { abrir(painel.hidden); });
    document.querySelectorAll('a[href="#studio"]').forEach(function (a) {
      a.addEventListener('click', function () { abrir(true); });
    });
    if (location.hash === '#studio') abrir(true);
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
