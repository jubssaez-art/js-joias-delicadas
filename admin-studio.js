/* ===========================
   STUDIO MIURA — aba do painel de controle
   Edita data/studio.js (conteúdo do index.html). Mesmo fluxo da aba de
   joias: as mudanças ficam pendentes, a prévia vale só neste navegador e
   "Publicar" grava o arquivo no GitHub com o token salvo no painel.
   =========================== */

'use strict';

(function initStudioAdmin() {
  const REPO = 'jubssaez-art/js-joias-delicadas';
  const DATA_PATH = 'data/studio.js';
  const PREVIEW_KEY = 'studio_miura_preview';
  const TOKEN_KEY = 'js_joias_gh_token';
  const TAB_KEY = 'painel_aba';
  const ICONES = window.STUDIO_ICONES || {};

  const $ = id => document.getElementById(id);
  const clone = o => JSON.parse(JSON.stringify(o));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ===== ABAS DO PAINEL =====
  function abrirAba(nome) {
    document.querySelectorAll('.panel-tab').forEach(b => {
      const ativo = b.dataset.tab === nome;
      b.classList.toggle('is-active', ativo);
      b.setAttribute('aria-selected', ativo);
    });
    $('pane-studio').hidden = nome !== 'studio';
    $('pane-joias').hidden = nome !== 'joias';
    try { localStorage.setItem(TAB_KEY, nome); } catch (e) { /* ignora */ }
  }
  document.querySelectorAll('.panel-tab').forEach(b => b.addEventListener('click', () => abrirAba(b.dataset.tab)));
  let abaSalva = 'studio';
  try { abaSalva = localStorage.getItem(TAB_KEY) || 'studio'; } catch (e) { /* ignora */ }
  abrirAba(abaSalva === 'joias' ? 'joias' : 'studio');

  // ===== ESTADO =====
  let published = clone(window.STUDIO || {});
  let preview = null;
  try { preview = JSON.parse(localStorage.getItem(PREVIEW_KEY) || 'null'); } catch (e) { /* ignora */ }
  let edits = clone(preview || published);
  edits.contato = edits.contato || {};
  edits.avisos = edits.avisos || [];
  edits.capa = edits.capa || {};
  edits.conceito = edits.conceito || {};
  edits.servicos = edits.servicos || {};
  edits.areas = edits.areas || [];
  edits.laser = edits.laser || { visivel: true };
  edits.joias = edits.joias || { visivel: true };

  const abertas = new Set();   // áreas com o editor aberto

  // ===== CONVERSÃO CAMPO ⇄ DADO =====
  function pegar(obj, caminho) {
    return caminho.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }
  function pôr(obj, caminho, valor) {
    const partes = caminho.split('.');
    let o = obj;
    partes.slice(0, -1).forEach((k, i) => {
      if (o[k] == null) o[k] = /^\d+$/.test(partes[i + 1]) ? [] : {};
      o = o[k];
    });
    o[partes[partes.length - 1]] = valor;
  }
  const paraCampo = {
    texto: v => v == null ? '' : String(v),
    linhas: v => (v || []).join('\n'),
    paragrafos: v => (v || []).join('\n\n'),
    etapas: v => (v || []).map(e => e.texto ? `${e.titulo}: ${e.texto}` : e.titulo).join('\n'),
    bool: v => v !== false
  };
  const doCampo = {
    texto: s => s.trim(),
    linhas: s => s.split('\n').map(x => x.trim()).filter(Boolean),
    paragrafos: s => s.split(/\n\s*\n/).map(x => x.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean),
    etapas: s => s.split('\n').map(x => x.trim()).filter(Boolean).map(l => {
      const i = l.indexOf(':');
      return i > 0 ? { titulo: l.slice(0, i).trim(), texto: l.slice(i + 1).trim() } : { titulo: l, texto: '' };
    }),
    bool: el => el.checked
  };
  function lerCampo(el) {
    const t = el.dataset.t || 'texto';
    return t === 'bool' ? doCampo.bool(el) : doCampo[t](el.value);
  }
  function escreverCampo(el, v) {
    const t = el.dataset.t || 'texto';
    if (t === 'bool') el.checked = paraCampo.bool(v);
    else el.value = paraCampo[t](v);
  }

  // Campos fixos (data-k no HTML)
  const fixos = document.querySelectorAll('#pane-studio [data-k]');
  function preencherFixos() { fixos.forEach(el => escreverCampo(el, pegar(edits, el.dataset.k))); }
  fixos.forEach(el => {
    el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', () => {
      let v = lerCampo(el);
      if (el.dataset.k === 'contato.whatsapp') v = String(v).replace(/\D/g, '');
      pôr(edits, el.dataset.k, v);
      atualizar();
    });
  });

  // ===== ÁREAS =====
  const CAMPOS_AREA = [
    { k: 'nome', rotulo: 'Nome da área <small>(cartão e rodapé)</small>', meio: true },
    { k: 'aba', rotulo: 'Nome curto <small>(aba do carrossel)</small>', meio: true },
    { k: 'titulo', rotulo: 'Título no carrossel <small>(*itálico* se quiser)</small>', meio: true },
    { k: 'legenda', rotulo: 'Legenda do painel <small>(ex.: Salão, Bem-estar)</small>', meio: true },
    { k: 'icone', rotulo: 'Ícone', tipo: 'icone', meio: true },
    { k: 'botao', rotulo: 'Texto do botão', meio: true },
    { k: 'descricao', rotulo: 'Descrição no cartão', tipo: 'area', linhas: 2 },
    { k: 'texto', rotulo: 'Texto no carrossel', tipo: 'area', linhas: 2 },
    { k: 'servicos', rotulo: 'Serviços da área <small>(um por linha — viram as etiquetas do cartão)</small>', tipo: 'area', t: 'linhas', linhas: 6, meio: true },
    { k: 'destaques', rotulo: 'Destaques do carrossel <small>(um por linha, até 4 fica melhor)</small>', tipo: 'area', t: 'linhas', linhas: 6, meio: true },
    { k: 'mensagem', rotulo: 'Mensagem que chega no WhatsApp ao agendar' }
  ];

  function iconeSvg(chave) {
    const i = ICONES[chave] || ICONES.estrela || { svg: '' };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${i.svg}</svg>`;
  }

  function campoArea(a, c) {
    const id = `ar-${a.id}-${c.k}`;
    const dt = c.t ? ` data-t="${c.t}"` : '';
    let ctl;
    if (c.tipo === 'icone') {
      ctl = `<select id="${id}" data-ak="${c.k}">` + Object.keys(ICONES).map(k =>
        `<option value="${k}"${a.icone === k ? ' selected' : ''}>${esc(ICONES[k].nome)}</option>`).join('') + '</select>';
    } else if (c.tipo === 'area') {
      ctl = `<textarea id="${id}" rows="${c.linhas || 3}" data-ak="${c.k}"${dt}></textarea>`;
    } else {
      ctl = `<input type="text" id="${id}" data-ak="${c.k}"${dt}>`;
    }
    return `<div class="config-field${c.meio ? ' half' : ''}"><label for="${id}">${c.rotulo}</label>${ctl}</div>`;
  }

  function renderAreas() {
    const box = $('stAreas');
    const n = edits.areas.length;
    box.innerHTML = n ? edits.areas.map((a, i) => `
      <div class="area-item${abertas.has(a.id) ? ' open' : ''}${a.visivel === false ? ' is-off' : ''}" data-i="${i}">
        <div class="area-head">
          <button type="button" class="area-toggle" aria-expanded="${abertas.has(a.id)}">
            <span class="area-ico">${iconeSvg(a.icone)}</span>
            <span class="area-num">${String(i + 1).padStart(2, '0')}</span>
            <span class="area-name">${esc(a.nome || 'Sem nome')}</span>
            <span class="area-count">${(a.servicos || []).length} serviço${(a.servicos || []).length === 1 ? '' : 's'}</span>
            <span class="area-caret" aria-hidden="true">▾</span>
          </button>
          <div class="area-ctrls">
            <label class="switch" title="Mostrar esta área no site"><input type="checkbox" data-act="vis"${a.visivel === false ? '' : ' checked'}><span class="slider"></span></label>
            <button type="button" class="area-btn" data-act="up" title="Subir"${i === 0 ? ' disabled' : ''}>↑</button>
            <button type="button" class="area-btn" data-act="down" title="Descer"${i === n - 1 ? ' disabled' : ''}>↓</button>
            <button type="button" class="area-btn danger" data-act="del" title="Remover área">✕</button>
          </div>
        </div>
        <div class="area-body"${abertas.has(a.id) ? '' : ' hidden'}>
          <div class="area-grid">${CAMPOS_AREA.map(c => campoArea(a, c)).join('')}</div>
        </div>
      </div>`).join('') : '<p class="area-empty">Nenhuma área. Clique em <strong>＋ Adicionar área</strong>.</p>';

    box.querySelectorAll('.area-item').forEach(item => {
      const i = +item.dataset.i;
      const a = edits.areas[i];
      item.querySelectorAll('[data-ak]').forEach(el => {
        escreverCampo(el, a[el.dataset.ak]);
        el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', () => {
          a[el.dataset.ak] = lerCampo(el);
          if (el.dataset.ak === 'nome') item.querySelector('.area-name').textContent = a.nome || 'Sem nome';
          if (el.dataset.ak === 'icone') item.querySelector('.area-ico').innerHTML = iconeSvg(a.icone);
          if (el.dataset.ak === 'servicos') {
            const q = (a.servicos || []).length;
            item.querySelector('.area-count').textContent = `${q} serviço${q === 1 ? '' : 's'}`;
          }
          atualizar();
        });
      });
      item.querySelector('.area-toggle').addEventListener('click', () => {
        const abrir = !abertas.has(a.id);
        if (abrir) abertas.add(a.id); else abertas.delete(a.id);
        item.classList.toggle('open', abrir);
        item.querySelector('.area-body').hidden = !abrir;
        item.querySelector('.area-toggle').setAttribute('aria-expanded', abrir);
      });
      item.querySelector('[data-act="vis"]').addEventListener('change', e => {
        a.visivel = e.target.checked;
        item.classList.toggle('is-off', !a.visivel);
        atualizar();
      });
      item.querySelectorAll('.area-btn').forEach(b => b.addEventListener('click', () => {
        const act = b.dataset.act;
        if (act === 'up' && i > 0) edits.areas.splice(i - 1, 0, edits.areas.splice(i, 1)[0]);
        if (act === 'down' && i < edits.areas.length - 1) edits.areas.splice(i + 1, 0, edits.areas.splice(i, 1)[0]);
        if (act === 'del') {
          if (!confirm(`Remover a área "${a.nome}" do site?`)) return;
          edits.areas.splice(i, 1);
        }
        renderAreas();
        atualizar();
      }));
    });
  }

  $('stAddArea').addEventListener('click', () => {
    const a = {
      id: 'area-' + Date.now().toString(36),
      visivel: true,
      nome: 'Nova área',
      aba: 'Nova área',
      titulo: 'Nova área',
      icone: 'estrela',
      legenda: '',
      descricao: '',
      servicos: [],
      texto: '',
      destaques: [],
      botao: 'Agendar',
      mensagem: 'Olá! Gostaria de agendar um horário no Studio Miura.'
    };
    edits.areas.push(a);
    abertas.add(a.id);
    renderAreas();
    atualizar();
    const campo = document.getElementById(`ar-${a.id}-nome`);
    if (campo) { campo.scrollIntoView({ behavior: 'smooth', block: 'center' }); campo.select(); }
    status('✦ Área adicionada no fim da lista — preencha e depois salve a prévia ou publique.', 'ok');
  });

  // ===== RESUMO E PENDÊNCIAS =====
  function telefoneBonito(d) {
    const n = String(d || '').replace(/^55/, '');
    if (n.length === 11) return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
    if (n.length === 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
    return d || '—';
  }
  function atualizar() {
    const vis = edits.areas.filter(a => a.visivel !== false);
    const servicos = vis.reduce((s, a) => s + (a.servicos || []).length, 0);
    $('stStats').innerHTML = `
      <div class="stat-card"><span class="stat-value">${vis.length}</span><span class="stat-name">áreas no site</span></div>
      <div class="stat-card"><span class="stat-value">${servicos}</span><span class="stat-name">serviços listados</span></div>
      <div class="stat-card"><span class="stat-value">${(edits.laser.areas || []).length}</span><span class="stat-name">áreas do laser</span></div>
      <div class="stat-card stat-wide"><span class="stat-value">${esc(telefoneBonito(edits.contato.whatsapp))}</span><span class="stat-name">WhatsApp de agendamento</span></div>`;
    const salvo = JSON.stringify(preview || published);
    const sujo = JSON.stringify(edits) !== salvo;
    const noSite = JSON.stringify(edits) !== JSON.stringify(published);
    $('stPending').textContent = sujo ? 'Alterações não salvas'
      : (noSite ? 'Prévia salva · ainda não publicada' : 'Tudo publicado');
    $('stActionsBar').classList.toggle('dirty', sujo);
  }

  // ===== AÇÕES =====
  function status(msg, tipo) {
    const el = $('publishStatus');
    el.textContent = msg;
    el.className = 'publish-status ' + (tipo || '');
  }

  function validar() {
    const w = String(edits.contato.whatsapp || '');
    if (w.length < 12 || w.length > 13) return 'Confira o WhatsApp: use 55 + DDD + número, só números (ex.: 5541997117882).';
    if (edits.areas.some(a => !String(a.nome || '').trim())) return 'Toda área precisa de um nome.';
    return '';
  }

  $('stPreview').addEventListener('click', () => {
    const erro = validar();
    if (erro) { status(erro, 'err'); return; }
    localStorage.setItem(PREVIEW_KEY, JSON.stringify(edits));
    preview = clone(edits);
    atualizar();
    status('Prévia do Studio salva! Abra o site neste navegador para conferir — os visitantes ainda veem a versão publicada.', 'ok');
  });

  $('stDiscard').addEventListener('click', () => {
    if (!confirm('Descartar as alterações do Studio que não foram publicadas?')) return;
    localStorage.removeItem(PREVIEW_KEY);
    preview = null;
    edits = clone(published);
    abertas.clear();
    preencherFixos();
    renderAreas();
    atualizar();
    status('Alterações do Studio descartadas.', 'ok');
  });

  $('stPublish').addEventListener('click', async () => {
    const erro = validar();
    if (erro) { status(erro, 'err'); return; }
    const token = ($('ghToken').value || '').trim();
    if (!token) {
      status('Cole um token do GitHub no campo "Publicação" abaixo para publicar.', 'err');
      $('ghToken').focus();
      return;
    }
    localStorage.setItem(TOKEN_KEY, token);

    const btn = $('stPublish');
    btn.disabled = true;
    btn.textContent = 'Publicando…';
    try {
      const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' };
      const url = `https://api.github.com/repos/${REPO}/contents/${DATA_PATH}`;
      status('Enviando o Studio para o site…');
      const g = await fetch(url, { headers });
      if (g.status === 401) throw new Error('Token inválido ou sem permissão.');
      const body = {
        message: 'Painel: atualização do Studio Miura',
        content: btoa(unescape(encodeURIComponent(
          '/* Conteúdo do Studio Miura (index.html) — editado e publicado pelo painel (admin.html).\n' +
          '   Nos textos: *itálico* e **negrito**. */\n' +
          'window.STUDIO = ' + JSON.stringify(edits, null, 2) + ';\n'
        )))
      };
      if (g.ok) body.sha = (await g.json()).sha;
      const put = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(body) });
      if (!put.ok) throw new Error(put.status === 403 || put.status === 404
        ? 'O token não tem permissão de escrita neste repositório.'
        : `Erro ao publicar (HTTP ${put.status}).`);

      localStorage.removeItem(PREVIEW_KEY);
      preview = null;
      published = clone(edits);
      atualizar();
      status('✦ Studio publicado! Em cerca de 1 a 2 minutos o site já abre com as alterações.', 'ok');
    } catch (err) {
      status(err.message || 'Falha ao publicar. Verifique o token e a internet.', 'err');
    } finally {
      btn.disabled = false;
      btn.textContent = '✦ Publicar o Studio';
    }
  });

  preencherFixos();
  renderAreas();
  atualizar();
})();
