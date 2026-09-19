/* ===========================
   STUDIO MIURA — Ícones das áreas
   Usados pelo site (index.html) e pelo painel (admin.html), que oferece
   esta lista para escolher o ícone de cada área.
   Cada ícone é o miolo de um <svg viewBox="0 0 24 24">, em traço.
   =========================== */

window.STUDIO_ICONES = {
  laser:       { nome: 'Laser / brilho',  svg: '<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>' },
  tesoura:     { nome: 'Tesoura',         svg: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>' },
  esmalte:     { nome: 'Esmalte',         svg: '<rect x="7" y="10" width="10" height="12" rx="2"/><path d="M9.5 10V6.5h5V10"/><path d="M11 6.5V2h2v4.5"/>' },
  olho:        { nome: 'Olho / cílios',   svg: '<path d="M2 13s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 13 2 13z"/><circle cx="12" cy="13" r="2.5"/><path d="M12 7V3.5M7 8.2 5.3 5.5M17 8.2l1.7-2.7"/>' },
  sobrancelha: { nome: 'Sobrancelha',     svg: '<path d="M3 11c3-4 8-5.5 13-4.5 2 .4 3.6 1.3 5 2.5"/><path d="M4 17s3-3 8-3 8 3 8 3"/>' },
  pedras:      { nome: 'Pedras / massagem', svg: '<ellipse cx="12" cy="19" rx="8" ry="2.6"/><ellipse cx="12" cy="13.6" rx="6" ry="2.3"/><ellipse cx="12" cy="8.6" rx="4" ry="1.9"/><path d="M12 6.7c0-2 1.2-3.4 3-4.2-.3 2-1.3 3.4-3 4.2z"/>' },
  gota:        { nome: 'Gota / skincare', svg: '<path d="M12 2.5s-6.5 7.2-6.5 11.5a6.5 6.5 0 0013 0C18.5 9.7 12 2.5 12 2.5z"/><path d="M9 14.5a3 3 0 003 3"/>' },
  folha:       { nome: 'Folha / natural', svg: '<path d="M5 19c0-8 5.5-13.5 15-14-.5 9.5-6 15-14 15"/><path d="M5 19c3-3.5 6-6.5 10-9"/>' },
  flor:        { nome: 'Flor',            svg: '<circle cx="12" cy="12" r="2.2"/><path d="M12 9.8c-1.6-2.6-1.2-5.3 0-6.8 1.2 1.5 1.6 4.2 0 6.8zM12 14.2c1.6 2.6 1.2 5.3 0 6.8-1.2-1.5-1.6-4.2 0-6.8zM9.8 12c-2.6 1.6-5.3 1.2-6.8 0 1.5-1.2 4.2-1.6 6.8 0zM14.2 12c2.6-1.6 5.3-1.2 6.8 0-1.5 1.2-4.2 1.6-6.8 0z"/>' },
  espelho:     { nome: 'Espelho',         svg: '<ellipse cx="12" cy="9.5" rx="6" ry="7"/><path d="M12 16.5V22M9 22h6"/><path d="M9.5 6.5c.8-1 1.8-1.5 3-1.5"/>' },
  coracao:     { nome: 'Coração',         svg: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0112 7.4a4.3 4.3 0 017.5 2.4C19.5 15.4 12 20 12 20z"/>' },
  estrela:     { nome: 'Estrela',         svg: '<path d="M12 2.5l1.9 6.2 6.1.1-4.9 3.8 1.8 6.1L12 15l-4.9 3.7 1.8-6.1L4 8.8l6.1-.1z"/>' },
  maos:        { nome: 'Mãos / cuidado',  svg: '<path d="M4 14c2.5-.5 4.5.5 6 2l2 2"/><path d="M4 14v6h4l6-1.5c1.2-.3 1.9-1.6 1.4-2.7-.3-.8-1.2-1.2-2-1l-3.4.7"/><path d="M13 9.5c0-2 1.6-3.5 3.5-3.5S20 7.5 20 9.5c0 3-3.5 5-3.5 5S13 12.5 13 9.5z"/>' }
};

/* Gradientes do painel de arte do carrossel, usados em rodízio */
window.STUDIO_GRADIENTES = [
  ['#8c3b43', '#3e171c'],
  ['#7a3a3c', '#2f1216'],
  ['#94474d', '#4a1d23'],
  ['#6e2f36', '#2a0f13'],
  ['#a0555a', '#512127'],
  ['#834046', '#36141a']
];
