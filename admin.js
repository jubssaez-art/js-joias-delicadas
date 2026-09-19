/* ===========================
   JS JOIAS DELICADAS — Painel de Controle
   Estado: { overrides: {id: {...}}, extras: [peças novas], site: {whatsapp, instagram, announcement} }
   =========================== */

'use strict';

(function initAdmin() {
  // Hash SHA-256 de "js-joias-<senha>" — a senha em si não aparece no código
  const PASS_HASH = '726dd2cd45f968e4da685859e324d766658232caab7e8df3b8b75f9086d4d2c9';
  const SESSION_KEY = 'js_joias_admin_session';
  const PREVIEW_KEY = 'js_joias_override_preview';
  const TOKEN_KEY = 'js_joias_gh_token';
  const REPO = 'jubssaez-art/js-joias-delicadas';
  const OVERRIDE_PATH = 'data/produtos.js';

  const loginEl = document.getElementById('adminLogin');
  const panelEl = document.getElementById('adminPanel');
  const fmt = v => 'R$ ' + v.toFixed(2).replace('.', ',');
  const escAttr = s => String(s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ===== LOGIN =====
  function showPanel() {
    loginEl.hidden = true;
    panelEl.hidden = false;
    renderPanel();
  }

  document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const input = document.getElementById('loginPass');
    const hash = await sha256('js-joias-' + input.value.trim());
    if (hash === PASS_HASH) {
      sessionStorage.setItem(SESSION_KEY, hash);
      showPanel();
    } else {
      const card = document.getElementById('loginCard');
      document.getElementById('loginError').hidden = false;
      card.classList.remove('shake');
      void card.offsetWidth;
      card.classList.add('shake');
      input.value = '';
      input.focus();
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.reload();
  });

  // ===== ESTADO =====
  const published = {
    overrides: JSON.parse(JSON.stringify((typeof PRODUCTS_OVERRIDE !== 'undefined' && PRODUCTS_OVERRIDE) || {})),
    extras: JSON.parse(JSON.stringify((typeof PRODUCTS_EXTRA !== 'undefined' && PRODUCTS_EXTRA) || [])),
    site: JSON.parse(JSON.stringify((typeof SITE_OVERRIDE !== 'undefined' && SITE_OVERRIDE) || {}))
  };
  let preview = null;
  try { preview = JSON.parse(localStorage.getItem(PREVIEW_KEY) || 'null'); } catch (e) { /* ignora */ }
  if (preview && !preview.overrides && !preview.extras && !preview.site) preview = { overrides: preview };
  if (preview) preview = Object.assign({ overrides: {}, extras: [], site: {} }, preview);

  const edits = JSON.parse(JSON.stringify(preview || published));
  edits.overrides = edits.overrides || {};
  edits.extras = edits.extras || [];
  edits.site = edits.site || {};

  function savedState() { return JSON.stringify(preview || published); }

  function effective(p) {
    const o = edits.overrides[p.id] || {};
    return {
      name: (typeof o.name === 'string' && o.name.trim()) ? o.name : p.name,
      price: (typeof o.price === 'number' && o.price > 0) ? o.price : p.price,
      oldPrice: o.oldPrice === null ? undefined : (typeof o.oldPrice === 'number' ? o.oldPrice : p.oldPrice),
      badge: typeof o.badge === 'string' ? (o.badge.trim() || undefined) : p.badge,
      desc: (typeof o.desc === 'string' && o.desc.trim()) ? o.desc : (p.desc || ''),
      soldOut: typeof o.soldOut === 'boolean' ? o.soldOut : !!p.soldOut,
      lancamento: typeof o.lancamento === 'boolean' ? o.lancamento : isLancamento(p),
      hidden: !!o.hidden
    };
  }

  const parseNum = v => parseFloat(String(v).replace(',', '.'));

  // ===== RECOMPUTE =====
  function recomputeBase(p, row, descRow) {
    const name = row.querySelector('[data-f="name"]').value.trim();
    const price = parseNum(row.querySelector('[data-f="price"]').value);
    const oldRaw = row.querySelector('[data-f="oldPrice"]').value.trim();
    const oldPrice = oldRaw === '' ? null : parseNum(oldRaw);
    const badge = row.querySelector('[data-f="badge"]').value.trim();
    const visible = row.querySelector('[data-f="visible"]').checked;
    const soldOut = !row.querySelector('[data-f="stock"]').checked;
    const lanc = row.querySelector('[data-f="lanc"]').checked;
    const desc = descRow.querySelector('[data-f="desc"]').value.trim();

    const o = {};
    if (name && name !== p.name) o.name = name;
    if (!isNaN(price) && price > 0 && Math.abs(price - p.price) > 0.001) o.price = Math.round(price * 100) / 100;
    if (oldPrice === null) { if (p.oldPrice) o.oldPrice = null; }
    else if (!isNaN(oldPrice) && oldPrice > 0 && Math.abs(oldPrice - (p.oldPrice || 0)) > 0.001) o.oldPrice = Math.round(oldPrice * 100) / 100;
    if (badge !== (p.badge || '')) o.badge = badge;
    if (desc && desc !== (p.desc || '')) o.desc = desc;
    if (soldOut !== !!p.soldOut) o.soldOut = soldOut;
    if (lanc !== isLancamento(p)) o.lancamento = lanc;
    if (!visible) o.hidden = true;

    if (Object.keys(o).length) edits.overrides[p.id] = o;
    else delete edits.overrides[p.id];
    updatePending();
  }

  function recomputeExtra(x, row, descRow) {
    x.name = row.querySelector('[data-f="name"]').value.trim() || x.name;
    const price = parseNum(row.querySelector('[data-f="price"]').value);
    if (!isNaN(price) && price > 0) x.price = Math.round(price * 100) / 100;
    const oldRaw = row.querySelector('[data-f="oldPrice"]').value.trim();
    const oldPrice = parseNum(oldRaw);
    if (oldRaw === '' || isNaN(oldPrice) || oldPrice <= 0) delete x.oldPrice;
    else x.oldPrice = Math.round(oldPrice * 100) / 100;
    const badge = row.querySelector('[data-f="badge"]').value.trim();
    if (badge) x.badge = badge; else delete x.badge;
    x.desc = descRow.querySelector('[data-f="desc"]').value.trim();
    if (row.querySelector('[data-f="stock"]').checked) delete x.soldOut;
    else x.soldOut = true;
    x.lancamento = row.querySelector('[data-f="lanc"]').checked;
    if (row.querySelector('[data-f="visible"]').checked) delete x.hidden;
    else x.hidden = true;
    updatePending();
  }

  function recomputeSite() {
    const site = {};
    const wa = document.getElementById('cfgWhatsapp').value.replace(/\D/g, '');
    if (wa && wa !== '5541989043923') site.whatsapp = wa;
    const insta = document.getElementById('cfgInstagram').value.trim().replace(/^@/, '');
    if (insta && insta !== 'js_joiasdelicadas') site.instagram = insta;
    const ann = [0, 1, 2].map(i => document.getElementById('cfgAnn' + i).value.trim());
    if (ann.some(Boolean)) site.announcement = ann;
    edits.site = site;
    updatePending();
  }

  function updatePending() {
    const n = Object.keys(edits.overrides).length + edits.extras.length + (Object.keys(edits.site).length ? 1 : 0);
    const dirty = JSON.stringify(edits) !== savedState();
    document.getElementById('pendingNote').textContent = n
      ? `${n} ajuste${n > 1 ? 's' : ''} ativo${n > 1 ? 's' : ''}${dirty ? ' · não salvos' : ''}`
      : 'Nenhuma alteração pendente';
    document.getElementById('actionsBar').classList.toggle('dirty', dirty);
    renderStats();
  }

  // ===== RENDER =====
  function renderStats() {
    const base = (window.PRODUCTS_BASE || []).map(effective);
    const extras = edits.extras;
    const all = [...base, ...extras.map(x => ({ ...x, hidden: !!x.hidden, lancamento: x.lancamento !== false }))];
    const visiveis = all.filter(p => !p.hidden);
    const aVenda = visiveis.filter(p => !p.soldOut);
    const promo = aVenda.filter(p => p.oldPrice && p.oldPrice > p.price);
    const lancs = visiveis.filter(p => p.lancamento);
    const medio = aVenda.length ? aVenda.reduce((s, p) => s + p.price, 0) / aVenda.length : 0;
    document.getElementById('adminStats').innerHTML = `
      <div class="stat-card"><span class="stat-value">${aVenda.length}</span><span class="stat-name">peças à venda</span></div>
      <div class="stat-card"><span class="stat-value">${visiveis.length - aVenda.length}</span><span class="stat-name">esgotadas</span></div>
      <div class="stat-card"><span class="stat-value">${all.length - visiveis.length}</span><span class="stat-name">ocultas</span></div>
      <div class="stat-card"><span class="stat-value">${lancs.length}</span><span class="stat-name">lançamentos</span></div>
      <div class="stat-card"><span class="stat-value">${promo.length}</span><span class="stat-name">em promoção</span></div>
      <div class="stat-card"><span class="stat-value">${fmt(medio)}</span><span class="stat-name">preço médio</span></div>`;
  }

  function rowPair({ id, image, tag, name, price, oldPrice, badge, desc, soldOut, hidden, lancamento, isExtra, linkable }) {
    const imgTag = linkable
      ? `<a href="produto.html?id=${id}" target="_blank" title="Ver página da peça"><img src="${image}" alt=""></a>`
      : `<img src="${image}" alt="">`;
    return `
      <tr data-rid="${id}" class="${hidden ? 'row-hidden' : ''} ${soldOut ? 'row-soldout' : ''} ${isExtra ? 'row-extra' : ''}">
        <td class="cell-piece">
          ${imgTag}
          <div class="cell-piece-meta">
            <span class="cell-tag">${tag}${isExtra ? ' · <em>nova</em>' : ''}</span>
            <button type="button" class="desc-toggle" data-for="${id}">✎ descrição</button>
            ${isExtra ? `<button type="button" class="extra-remove" data-for="${id}">✕ remover</button>` : ''}
          </div>
        </td>
        <td><input type="text" data-f="name" value="${escAttr(name)}"></td>
        <td><input type="text" data-f="price" inputmode="decimal" value="${price.toFixed(2).replace('.', ',')}" class="input-num"></td>
        <td><input type="text" data-f="oldPrice" inputmode="decimal" value="${oldPrice ? oldPrice.toFixed(2).replace('.', ',') : ''}" placeholder="—" class="input-num"></td>
        <td><input type="text" data-f="badge" value="${escAttr(badge || '')}" placeholder="—" class="input-badge"></td>
        <td class="cell-visible">
          <label class="switch" title="Ligue para a peça aparecer na aba Lançamentos do catálogo">
            <input type="checkbox" data-f="lanc" ${lancamento ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </td>
        <td class="cell-visible">
          <label class="switch" title="Desligue para marcar a peça como esgotada na vitrine">
            <input type="checkbox" data-f="stock" ${soldOut ? '' : 'checked'}>
            <span class="slider"></span>
          </label>
        </td>
        <td class="cell-visible">
          <label class="switch" title="Desligue para tirar a peça da vitrine">
            <input type="checkbox" data-f="visible" ${hidden ? '' : 'checked'}>
            <span class="slider"></span>
          </label>
        </td>
      </tr>
      <tr class="desc-row" data-desc="${id}" hidden>
        <td colspan="8">
          <label>Descrição exibida na página da peça</label>
          <textarea data-f="desc" rows="2" maxlength="300">${escAttr(desc)}</textarea>
        </td>
      </tr>`;
  }

  /* Ajuste órfão: a peça que ele editava não existe mais na loja — a foto foi
     renomeada ou removida de imagens/, então o id mudou junto. Sem esse aviso
     o ajuste fica no arquivo publicado sem efeito nenhum na vitrine. */
  function renderOrphans() {
    const el = document.getElementById('orphanNote');
    if (!el) return;
    const vivos = new Set((window.PRODUCTS_BASE || []).map(p => p.id));
    const orfaos = Object.keys(edits.overrides).filter(id => !vivos.has(id));
    if (!orfaos.length) { el.hidden = true; el.innerHTML = ''; return; }
    const lista = orfaos.map(id => id.replace(/^auto-/, '').replace(/-/g, ' ')).join(', ');
    el.hidden = false;
    el.innerHTML = `<strong>${orfaos.length} ajuste${orfaos.length > 1 ? 's' : ''} sem peça correspondente</strong>`
      + ` — a foto foi renomeada ou saiu de imagens/: ${escAttr(lista)}.`
      + ` <button type="button" class="btn btn-outline-sm" id="orphanClear">Limpar</button>`;
    document.getElementById('orphanClear').addEventListener('click', () => {
      orfaos.forEach(id => delete edits.overrides[id]);
      renderPanel();
      setStatus('Ajustes sem peça removidos. Publique para gravar no site.', 'ok');
    });
  }

  function renderPanel() {
    const rows = document.getElementById('adminRows');
    const baseHtml = (window.PRODUCTS_BASE || []).map(p => {
      const e = effective(p);
      return rowPair({ id: p.id, image: p.image, tag: p.tag, ...e, isExtra: false, linkable: true });
    }).join('');
    const extraHtml = edits.extras.map(x =>
      rowPair({ id: x.id, image: x.image, tag: x.tag, name: x.name, price: x.price, oldPrice: x.oldPrice, badge: x.badge, desc: x.desc || '', soldOut: !!x.soldOut, hidden: !!x.hidden, lancamento: x.lancamento !== false, isExtra: true, linkable: !String(x.image).startsWith('data:') })
    ).join('');
    rows.innerHTML = baseHtml + extraHtml;
    renderOrphans();

    rows.querySelectorAll('tr[data-rid]').forEach(row => {
      const id = row.dataset.rid;
      const descRow = rows.querySelector(`tr[data-desc="${id}"]`);
      const base = (window.PRODUCTS_BASE || []).find(p => p.id === id);
      const extra = edits.extras.find(x => x.id === id);
      const recompute = () => base ? recomputeBase(base, row, descRow) : recomputeExtra(extra, row, descRow);
      [...row.querySelectorAll('input'), ...descRow.querySelectorAll('textarea')].forEach(inp => {
        inp.addEventListener('input', () => {
          recompute();
          if (inp.dataset.f === 'visible') row.classList.toggle('row-hidden', !inp.checked);
        });
      });
    });

    rows.querySelectorAll('.desc-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const dr = rows.querySelector(`tr[data-desc="${btn.dataset.for}"]`);
        dr.hidden = !dr.hidden;
        btn.classList.toggle('open', !dr.hidden);
      });
    });

    rows.querySelectorAll('.extra-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = edits.extras.findIndex(x => x.id === btn.dataset.for);
        if (i >= 0) edits.extras.splice(i, 1);
        renderPanel();
      });
    });

    // Configurações
    const site = edits.site || {};
    document.getElementById('cfgWhatsapp').value = site.whatsapp || '5541989043923';
    document.getElementById('cfgInstagram').value = site.instagram || 'js_joiasdelicadas';
    const annDefaults = ['✦ Frete Grátis acima de R$150', '1 Ano de Garantia em todas as peças', 'Pix com 5% de desconto ✦'];
    [0, 1, 2].forEach(i => {
      document.getElementById('cfgAnn' + i).value = (site.announcement && site.announcement[i]) || annDefaults[i];
    });

    document.getElementById('ghToken').value = localStorage.getItem(TOKEN_KEY) || '';
    updatePending();
  }

  ['cfgWhatsapp', 'cfgInstagram', 'cfgAnn0', 'cfgAnn1', 'cfgAnn2'].forEach(id => {
    document.getElementById(id).addEventListener('input', recomputeSite);
  });

  // ===== NOVA PEÇA (janela de postagem) =====
  const modalEl = document.getElementById('newPieceModal');

  // O aviso mora dentro da janela: a barra de status fica atrás dela
  function setNpError(msg) {
    const el = document.getElementById('npError');
    el.textContent = msg || '';
    el.hidden = !msg;
  }

  function openNewPiece() {
    modalEl.hidden = false;
    document.body.style.overflow = 'hidden';
    setNpError('');
    document.getElementById('npName').focus();
  }

  function closeNewPiece() {
    modalEl.hidden = true;
    document.body.style.overflow = '';
    document.getElementById('openNewPieceBtn').focus();
  }

  document.getElementById('openNewPieceBtn').addEventListener('click', openNewPiece);
  modalEl.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', closeNewPiece));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modalEl.hidden) closeNewPiece();
  });

  function compressImage(file) {
    return new Promise(resolve => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const scale = Math.min(1, 900 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  }

  let npPhotoData = null;
  document.getElementById('npPhotoBtn').addEventListener('click', () => document.getElementById('npPhoto').click());
  document.getElementById('npPhoto').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    npPhotoData = await compressImage(file);
    const prev = document.getElementById('npPreview');
    prev.src = npPhotoData;
    prev.hidden = false;
    document.getElementById('npPhotoBtn').classList.add('has-photo');
    e.target.value = '';
  });

  document.getElementById('newPieceForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('npName').value.trim();
    const price = parseNum(document.getElementById('npPrice').value);
    if (!name || isNaN(price) || price <= 0) { setNpError('Preencha o nome e um preço válido.'); return; }
    if (!npPhotoData) { setNpError('Escolha uma foto para a peça.'); return; }
    setNpError('');

    const tipo = document.getElementById('npTipo').value;
    const material = document.getElementById('npMaterial').value;
    const matKey = material === 'Ouro 18k' ? 'ouro' : (material === 'Pérola' ? 'perola' : 'prata');
    const cats = [matKey];
    if (document.getElementById('npPerola').checked && matKey !== 'perola') cats.push('perola');
    if (document.getElementById('npKids').checked) cats.push('kids');

    const x = {
      id: 'x' + Date.now(),
      name,
      tag: `${tipo} · ${material}`,
      categories: cats.join(' '),
      image: npPhotoData,
      price: Math.round(price * 100) / 100,
      details: ['Antialérgico', material],
      desc: document.getElementById('npDesc').value.trim(),
      lancamento: document.getElementById('npLanc').checked
    };
    const oldPrice = parseNum(document.getElementById('npOldPrice').value);
    if (!isNaN(oldPrice) && oldPrice > 0) x.oldPrice = Math.round(oldPrice * 100) / 100;
    const badge = document.getElementById('npBadge').value.trim();
    if (badge) x.badge = badge;

    edits.extras.push(x);
    e.target.reset();
    npPhotoData = null;
    document.getElementById('npPreview').hidden = true;
    document.getElementById('npPhotoBtn').classList.remove('has-photo');
    closeNewPiece();
    renderPanel();
    // A peça nova fica na última linha da tabela — levo o dono até ela
    const linha = document.querySelector(`tr[data-rid="${x.id}"]`);
    if (linha) linha.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setStatus(`✦ "${name}" adicionada — salve a prévia ou publique para ela entrar na loja.`, 'ok');
  });

  // ===== AÇÕES =====
  document.getElementById('previewBtn').addEventListener('click', () => {
    localStorage.setItem(PREVIEW_KEY, JSON.stringify(edits));
    preview = JSON.parse(JSON.stringify(edits));
    updatePending();
    setStatus('Prévia salva! Abra a loja neste navegador para conferir — os visitantes ainda veem a versão publicada.', 'ok');
  });

  document.getElementById('discardBtn').addEventListener('click', () => {
    localStorage.removeItem(PREVIEW_KEY);
    window.location.reload();
  });

  document.getElementById('saveTokenBtn').addEventListener('click', () => {
    const t = document.getElementById('ghToken').value.trim();
    if (t) { localStorage.setItem(TOKEN_KEY, t); setStatus('Token salvo neste navegador.', 'ok'); }
    else { localStorage.removeItem(TOKEN_KEY); setStatus('Token removido.', 'ok'); }
  });

  function setStatus(msg, kind) {
    const el = document.getElementById('publishStatus');
    el.textContent = msg;
    el.className = 'publish-status ' + (kind || '');
  }

  document.getElementById('publishBtn').addEventListener('click', async () => {
    const token = (document.getElementById('ghToken').value || '').trim();
    if (!token) {
      setStatus('Cole um token do GitHub no campo abaixo para publicar.', 'err');
      document.getElementById('ghToken').focus();
      return;
    }
    localStorage.setItem(TOKEN_KEY, token);

    const btn = document.getElementById('publishBtn');
    btn.disabled = true;
    btn.textContent = 'Publicando…';

    try {
      const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' };
      const api = path => `https://api.github.com/repos/${REPO}/contents/${path}`;

      // 1. Sobe fotos das peças novas
      for (const x of edits.extras) {
        if (!String(x.image).startsWith('data:')) continue;
        setStatus(`Enviando foto de "${x.name}"…`);
        const path = `imagens/painel/${x.id}.jpg`;
        const g = await fetch(api(path), { headers });
        const body = { message: `Painel: foto da peça "${x.name}"`, content: x.image.split(',')[1] };
        if (g.ok) body.sha = (await g.json()).sha;
        const put = await fetch(api(path), { method: 'PUT', headers, body: JSON.stringify(body) });
        if (!put.ok) throw new Error(`Erro ao enviar a foto de "${x.name}" (HTTP ${put.status}).`);
        x.image = path;
      }

      // 2. Publica o arquivo de ajustes
      setStatus('Enviando alterações para o site…');
      const getRes = await fetch(api(OVERRIDE_PATH), { headers });
      if (!getRes.ok) throw new Error(getRes.status === 401 ? 'Token inválido ou sem permissão.' : `Erro ao ler o arquivo (HTTP ${getRes.status}).`);
      const current = await getRes.json();

      const content = `/* Ajustes publicados pelo painel de controle (admin.html). */\n` +
        `window.PRODUCTS_OVERRIDE = ${JSON.stringify(edits.overrides, null, 2)};\n` +
        `window.PRODUCTS_EXTRA = ${JSON.stringify(edits.extras, null, 2)};\n` +
        `window.SITE_OVERRIDE = ${JSON.stringify(edits.site, null, 2)};\n`;
      const putRes = await fetch(api(OVERRIDE_PATH), {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: 'Painel: atualização da loja',
          content: btoa(unescape(encodeURIComponent(content))),
          sha: current.sha
        })
      });
      if (!putRes.ok) throw new Error(`Erro ao publicar (HTTP ${putRes.status}).`);

      localStorage.removeItem(PREVIEW_KEY);
      preview = null;
      published.overrides = JSON.parse(JSON.stringify(edits.overrides));
      published.extras = JSON.parse(JSON.stringify(edits.extras));
      published.site = JSON.parse(JSON.stringify(edits.site));
      renderPanel();
      setStatus('✦ Publicado! O deploy leva cerca de 1 minuto — depois disso a loja abre já com as alterações.', 'ok');
    } catch (err) {
      setStatus(err.message || 'Falha ao publicar. Verifique o token e a internet.', 'err');
    } finally {
      btn.disabled = false;
      btn.textContent = '✦ Publicar no site';
    }
  });

  // Restaura a sessão (depois de todo o estado inicializado)
  if (sessionStorage.getItem(SESSION_KEY) === PASS_HASH) showPanel();
})();
