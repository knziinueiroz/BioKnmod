const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const yearEl = document.getElementById('year');
const bgCanvas = document.getElementById('bgCanvas');
const ctx = bgCanvas?.getContext('2d');
const countrySelect = document.getElementById('country');

// --- Traduções simples (pt/en) ---
const I18N = {
  pt: {
    'nav.products': 'Produtos',
    'btn.theme': 'Tema',
    'products.title': 'Produtos e Planos',
    'products.subtitle': 'Exemplos de itens que você pode oferecer.',
    'footer.policy': 'Política de uso',
    'site.label': 'Página Oficial',
    'nav.back': 'Voltar',
    'checkout.title': 'Checkout',
    'checkout.pay': 'Prosseguir para pagamento',
    'label.country': 'País',
    'label.product': 'Produto',
    'product.notFound': 'Produto não encontrado',
    'product.loadError': 'Erro ao carregar produto',
    'image.unavailable': 'Imagem indisponível',
    'cta.buy': 'Comprar',
    'toast.offer.desc': 'Oferta: confira este plano com ótimo custo.',
    'toast.offer.cta': 'Ver oferta',
    'product.imageAlt': 'Imagem do produto {title}'
  },
  en: {
    'nav.products': 'Products',
    'btn.theme': 'Theme',
    'products.title': 'Products and Plans',
    'products.subtitle': 'Examples of items you can offer.',
    'footer.policy': 'Usage policy',
    'site.label': 'Official Page',
    'nav.back': 'Back',
    'checkout.title': 'Checkout',
    'checkout.pay': 'Proceed to payment',
    'label.country': 'Country',
    'label.product': 'Product',
    'product.notFound': 'Product not found',
    'product.loadError': 'Error loading product',
    'image.unavailable': 'Image unavailable',
    'cta.buy': 'Buy',
    'toast.offer.desc': 'Deal: check out this plan with great value.',
    'toast.offer.cta': 'View deal',
    'product.imageAlt': 'Product image {title}'
  }
};

let __lang = 'pt';
function setLang(lang) {
  __lang = (lang === 'en' ? 'en' : 'pt');
  document.documentElement.setAttribute('lang', __lang === 'pt' ? 'pt-br' : 'en');
}

function countryToLang(code) { return code === 'US' ? 'en' : 'pt'; }

function t(key) {
  const dict = I18N[__lang] || I18N.pt;
  return dict[key] || key;
}

function tFormat(key, params = {}) {
  let s = t(key);
  Object.keys(params).forEach(k => { s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), params[k]); });
  return s;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    el.textContent = t(key);
  });
}

function applyTranslationsByCountry(code) {
  setLang(countryToLang(code));
  applyTranslations();
}

// expõe utilitários para páginas que usam script inline
window.applyTranslationsByCountry = applyTranslationsByCountry;
window.t = t;
window.tFormat = tFormat;

// Ano no footer
yearEl.textContent = new Date().getFullYear();

// Tema claro/escuro com persistência
const savedTheme = localStorage.getItem('theme');
if (savedTheme) document.body.setAttribute('data-theme', savedTheme);

function toggleTheme() {
  const isLight = document.body.getAttribute('data-theme') === 'light';
  const next = isLight ? 'dark' : 'light';
  document.body.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

themeToggle?.addEventListener('click', () => {
  toggleTheme();
  // atualizar cor das partículas quando alternar tema
  ParticleBG.updateTheme();
});

// Smooth scroll para âncoras
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const targetId = link.getAttribute('href').substring(1);
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Fundo com partículas circulares
const ParticleBG = (() => {
  let particles = [];
  let w = 0, h = 0;
  let color = 'rgba(110, 231, 183, 0.18)'; // default para dark (mais visível)
  let running = false;

  function setThemeColor() {
    const isLight = document.body.getAttribute('data-theme') === 'light';
    color = isLight ? 'rgba(37, 99, 235, 0.16)' : 'rgba(110, 231, 183, 0.18)';
  }

  function resize() {
    if (!bgCanvas || !ctx) return;
    w = bgCanvas.width = window.innerWidth;
    h = bgCanvas.height = window.innerHeight;
    const targetCount = Math.min(240, Math.round((w * h) / 30000));
    if (particles.length < targetCount) {
      const add = targetCount - particles.length;
      for (let i = 0; i < add; i++) particles.push(makeParticle());
    } else if (particles.length > targetCount) {
      particles = particles.slice(0, targetCount);
    }
  }

  function makeParticle() {
    const size = 3 + Math.random() * 3.5; // quadrado maior para visibilidade
    const speed = 0.2 + Math.random() * 0.45;
    const dir = Math.random() * Math.PI * 2;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: Math.cos(dir) * speed,
      vy: Math.sin(dir) * speed,
      size,
      alpha: 0.5 + Math.random() * 0.5,
    };
  }

  function step() {
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);

    // leve gradiente para profundidade
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(0,0,0,0.0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.015)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // desenhar círculos
    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = color;
      // círculo
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // linhas sutis entre próximos
    ctx.globalAlpha = 0.14;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 100 * 100) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    if (running) requestAnimationFrame(step);
  }

  function start() {
    if (!bgCanvas || !ctx) return;
    setThemeColor();
    resize();
    running = true;
    requestAnimationFrame(step);
  }

  function stop() { running = false; }

  function updateTheme() {
    setThemeColor();
  }

  window.addEventListener('resize', resize);

  return { start, stop, resize, updateTheme };
})();

// iniciar mesmo se DOM já estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ParticleBG.start();
    // inicializar seletor de país
    initCountrySelect();
    // aplica traduções com base no país salvo ou padrão ANTES de renderizar produtos
    const savedCountry = localStorage.getItem('country') || 'BR';
    applyTranslationsByCountry(savedCountry);
    // aplicar cloaking global de links
    cloakLinks();
    // carregar produtos via JSON
    loadProducts();
    // inicializar filtros de produtos (index)
    initProductFilters();
    // inicializar toggle de notificações (inicia ou desativa conforme preferência)
    initNotifyToggle();
  });
} else {
  ParticleBG.start();
  initCountrySelect();
  // aplica traduções com base no país salvo ou padrão ANTES de renderizar produtos
  const savedCountry = localStorage.getItem('country') || 'BR';
  applyTranslationsByCountry(savedCountry);
  // aplicar cloaking global de links
  cloakLinks();
  // carregar produtos via JSON
  loadProducts();
  // inicializar filtros de produtos (index)
  initProductFilters();
  // inicializar toggle de notificações (inicia ou desativa conforme preferência)
  initNotifyToggle();
}

// UI helper para atualizar bandeira e rótulo no dropdown custom
function updateCountryUI(code) {
  const picker = document.querySelector('.country-picker');
  if (!picker) return;
  const toggle = picker.querySelector('.country-toggle');
  const flagEl = toggle ? toggle.querySelector('.flag') : null;
  const labelEl = toggle ? toggle.querySelector('.label') : null;
  const src = code === 'US' ? 'assets/flags/us.svg' : 'assets/flags/br.svg';
  const name = code === 'US' ? 'Estados Unidos' : 'Brasil';
  if (flagEl) flagEl.src = src;
  if (labelEl) labelEl.textContent = name;
}

// Persistência simples do país selecionado + integração com dropdown custom
function initCountrySelect() {
  if (!countrySelect) return;
  const saved = localStorage.getItem('country') || 'BR';
  countrySelect.value = saved;
  document.body.setAttribute('data-country', saved);
  updateCountryUI(saved);

  // Clique nas opções da lista custom para sincronizar o <select>
  document.querySelectorAll('.country-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const val = opt.getAttribute('data-value');
      if (!val) return;
      countrySelect.value = val;
      // Dispara change para reaproveitar persistência e data-country
      countrySelect.dispatchEvent(new Event('change', { bubbles: true }));
      const picker = document.querySelector('.country-picker');
      if (picker) picker.removeAttribute('open');
    });
  });

  countrySelect.addEventListener('change', () => {
    const val = countrySelect.value;
    localStorage.setItem('country', val);
    document.body.setAttribute('data-country', val);
    updateCountryUI(val);
    const summary = document.querySelector('.country-picker .country-toggle');
    if (summary) summary.setAttribute('aria-expanded', 'false');
    // aplicar traduções e linguagem ao trocar país
    applyTranslationsByCountry(val);
    // re-render produtos conforme país selecionado
    loadProducts();
  });
}

// atualizar cor quando alternar tema
// listener adicional removido (TypeScript cast não é válido em JS)

// --- Produtos via JSON ---
function loadProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  fetch('assets/products.json')
    .then(res => res.json())
    .then(data => {
      __productsCache = Array.isArray(data) ? data : [];
      renderProducts(applyFilters(__productsCache));
      cloakLinks();
    })
    .catch(err => console.error('Erro ao carregar produtos:', err));
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  if (!grid || !Array.isArray(products)) return;
  grid.innerHTML = '';

  const tagClass = {
    'PC': 'tag--pc',
    'Mobile': 'tag--mobile',
    'iOS': 'tag--ios',
    'Android': 'tag--android',
    'Emulador': 'tag--emulador'
  };

  const currentCountry = document.body.getAttribute('data-country') || 'BR';

  products.forEach(p => {
    // filtro por país, se definido no JSON
    if (Array.isArray(p.countries) && !p.countries.includes(currentCountry)) {
      return; // pula produtos que não pertencem ao país atual
    }

    const article = document.createElement('article');
    article.className = 'product-card';

    const tagsSrc = getLocalizedList(p, 'tags');
    const tagsHTML = (tagsSrc || []).map(t => {
      const cls = tagClass[t] || '';
      const label = translateTag(t);
      return `<span class="tag ${cls}">${escapeHtml(label)}</span>`;
    }).join('');

    const featuresSrc = getLocalizedList(p, 'features');
    const featuresHTML = (featuresSrc || []).map(f => `<li>${escapeHtml(translateFeature(f))}</li>`).join('');
    const priceText = p.prices && p.prices[currentCountry] ? p.prices[currentCountry] : '';
    const priceHTML = priceText ? `<div class="price">${escapeHtml(priceText)}</div>` : '';

    // link de checkout por país: usa p.checkout[país] se existir; senão gera padrão local
    const pid = p.id || (p.title ? p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$|/g, '') : 'produto');
    const defaultCheckout = `checkout.html?country=${encodeURIComponent(currentCountry)}&id=${encodeURIComponent(pid)}`;
    const checkoutLink = (p.checkout && p.checkout[currentCountry]) ? p.checkout[currentCountry] : defaultCheckout;

    article.innerHTML = `
      <div class="media">
        <img src="${p.image}" alt="${escapeHtml(tFormat('product.imageAlt', { title: p.title }))}" />
      </div>
      <div class="top">
        <div class="logo" aria-hidden="true">${escapeHtml(p.logoText || (p.title ? p.title.substring(0,2).toUpperCase() : 'PR'))}</div>
        <div class="meta">
          <h3>${escapeHtml(p.title)}</h3>
          <div class="tags">${tagsHTML}</div>
          ${priceHTML}
        </div>
      </div>
      <p class="desc">${escapeHtml(getLocalizedText(p, 'desc'))}</p>
      <ul>${featuresHTML}</ul>
      <div class="actions">
        <a class="btn btn-primary" href="#" data-href="${checkoutLink}">${escapeHtml(getLocalizedText(p, 'ctaText') || t('cta.buy'))}</a>
      </div>
    `;

    // clique explícito no botão "Comprar" leva ao checkout
    const btnPrimary = article.querySelector('.btn-primary');
    if (btnPrimary) {
      btnPrimary.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = checkoutLink;
      });
    }

    // tornar o card inteiro clicável para o checkout
    article.style.cursor = 'pointer';
    article.tabIndex = 0;
    article.addEventListener('click', () => { window.location.href = checkoutLink; });
    article.addEventListener('keydown', (e) => { if (e.key === 'Enter') window.location.href = checkoutLink; });

    grid.appendChild(article);

    // Extrai a cor dominante da imagem do produto e aplica ao logo e botão
    getDominantColorFromImage(p.image)
      .then(hex => {
        const logoEl = article.querySelector('.logo');
        const btnEl = article.querySelector('.btn-primary');
        const textColor = getContrastColor(hex);
        if (logoEl) {
          logoEl.style.backgroundColor = hex;
          logoEl.style.color = textColor;
        }
        if (btnEl) {
          btnEl.style.backgroundColor = hex;
          btnEl.style.borderColor = 'transparent';
          btnEl.style.color = textColor;
        }
      })
      .catch(() => {
        // se falhar (ex.: CORS em imagens), mantém cores padrão
      });
  });
}

// --- Filtro de produtos ---
let __productsCache = [];
const __filters = { tags: new Set() };

function applyFilters(list) {
  const country = document.body.getAttribute('data-country') || 'BR';
  let res = (list || []).filter(p => {
    if (Array.isArray(p.countries) && !p.countries.includes(country)) return false;
    return true;
  });

  if (__filters.tags && __filters.tags.size > 0) {
    res = res.filter(p => {
      const tags = getLocalizedList(p, 'tags') || p.tags || [];
      const set = new Set(tags);
      for (const t of __filters.tags) { if (!set.has(t)) return false; }
      return true;
    });
  }

  return res;
}

function rerenderFromCache() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  renderProducts(applyFilters(__productsCache || []));
  cloakLinks();
}

function initProductFilters() {
  const tagButtons = document.querySelectorAll('[data-tag]');

  if (tagButtons.length === 0) return; // nada para inicializar

  tagButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.getAttribute('data-tag');
      if (!tag) return;
      if (__filters.tags.has(tag)) {
        __filters.tags.delete(tag);
        btn.classList.remove('is-active');
      } else {
        __filters.tags.add(tag);
        btn.classList.add('is-active');
      }
      rerenderFromCache();
    });
  });
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --- Utilidades de cor para produtos ---
const __colorCache = {};

function getDominantColorFromImage(src) {
  return new Promise((resolve, reject) => {
    if (__colorCache[src]) return resolve(__colorCache[src]);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 32;
        canvas.width = size;
        canvas.height = size;
        const c = canvas.getContext('2d');
        if (!c) return reject('no ctx');
        c.drawImage(img, 0, 0, size, size);
        const data = c.getImageData(0, 0, size, size).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          const rr = data[i], gg = data[i + 1], bb = data[i + 2], aa = data[i + 3];
          if (aa < 128) continue; // ignora pixels transparentes
          const max = Math.max(rr, gg, bb);
          const min = Math.min(rr, gg, bb);
          const sat = max === 0 ? 0 : (max - min) / max;
          const val = max / 255;
          // ignora muito escuro, muito claro e sem saturação
          if (val < 0.2 || val > 0.95 || sat < 0.15) continue;
          r += rr; g += gg; b += bb; count++;
        }
        if (count === 0) {
          // fallback: média simples
          for (let i = 0; i < data.length; i += 4) {
            r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
          }
        }
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        const hex = rgbToHex(r, g, b);
        __colorCache[src] = hex;
        resolve(hex);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject('img load error');
  });
}

function rgbToHex(r, g, b) {
  const toHex = (x) => x.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getContrastColor(hex) {
  // converte #rrggbb para r,g,b
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!m) return '#ffffff';
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  // luminância relativa (aprox.)
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // 0-255
  return luma > 180 ? '#0b0f14' : '#ffffff';
}

// --- Notificações de ofertas ---
const OfferNotifier = (() => {
  let timer = null;
  let productsCache = null;
  let lastIndex = -1;
  let container = null;

  function ensureContainer() {
    if (container && document.body.contains(container)) return container;
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  }

  function priceToNumber(txt) {
    if (!txt || typeof txt !== 'string') return Infinity;
    // Normaliza: BR usa vírgula, US usa ponto
    let s = txt.replace(/[^0-9,\.]/g, '');
    if (s.includes(',') && !s.includes('.')) s = s.replace(',', '.');
    const n = parseFloat(s);
    return isNaN(n) ? Infinity : n;
  }

  function pickCheapest(products, country) {
    const list = (products || []).filter(p => {
      if (Array.isArray(p.countries) && !p.countries.includes(country)) return false;
      return p.prices && p.prices[country];
    });
    list.sort((a, b) => priceToNumber(a.prices[country]) - priceToNumber(b.prices[country]));
    if (list.length === 0) return null;
    // Varie entre os 3 mais baratos
    const top = list.slice(0, Math.min(3, list.length));
    lastIndex = (lastIndex + 1) % top.length;
    return top[lastIndex];
  }

  function buildCheckoutLink(p, country) {
    const pid = p.id || (p.title ? p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$|/g, '') : 'produto');
    const defaultCheckout = `checkout.html?country=${encodeURIComponent(country)}&id=${encodeURIComponent(pid)}`;
    return (p.checkout && p.checkout[country]) ? p.checkout[country] : defaultCheckout;
  }

  function showToast(p, country) {
    const cont = ensureContainer();
    const el = document.createElement('div');
    el.className = 'toast';
    const price = p.prices && p.prices[country] ? p.prices[country] : '';
    const link = buildCheckoutLink(p, country);
    el.innerHTML = `
      <div class="media"><img src="${p.image}" alt="${escapeHtml(p.title)}" /></div>
      <div class="text">
        <p class="title">${escapeHtml(p.title)} • <span class="price">${escapeHtml(price)}</span></p>
        <p class="desc">${escapeHtml(t('toast.offer.desc'))}</p>
        <div class="actions">
          <a class="btn btn-primary" href="#" data-href="${link}">${escapeHtml(t('toast.offer.cta'))}</a>
        </div>
      </div>
      <button class="close" aria-label="Fechar">✕</button>
    `;
    // aplicar cor dominante ao botão
    const btn = el.querySelector('.btn-primary');
    getDominantColorFromImage(p.image).then(hex => {
      const tc = getContrastColor(hex);
      if (btn) { btn.style.backgroundColor = hex; btn.style.color = tc; btn.style.borderColor = 'transparent'; }
    }).catch(() => {});

    const close = el.querySelector('.close');
    const remove = () => { el.remove(); };
    close?.addEventListener('click', remove);
    // Remove automático após 6s
    setTimeout(remove, 6000);
    cont.appendChild(el);
    // som de notificação
    playToastSound();
  }

  function tick() {
    const country = document.body.getAttribute('data-country') || 'BR';
    if (!productsCache) return;
    const p = pickCheapest(productsCache, country);
    if (p) showToast(p, country);
  }

  function start() {
    if (timer) return; // já rodando
    fetch('assets/products.json')
      .then(res => res.json())
      .then(data => { productsCache = Array.isArray(data) ? data : []; tick(); })
      .catch(() => { productsCache = []; });
    timer = setInterval(tick, 25000); // a cada 25s
  }

  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  function clear() {
    const cont = ensureContainer();
    cont.querySelectorAll('.toast').forEach(el => el.remove());
  }

  return { start, stop, clear };
})();

// --- Som para notificações ---
let __audioCtx = null;
function getAudioContext() {
  try {
    __audioCtx = __audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    return __audioCtx;
  } catch (e) { return null; }
}

function playToastSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  ctx.resume().then(() => {
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    gain.connect(ctx.destination);

    const o1 = ctx.createOscillator();
    o1.type = 'sine';
    o1.frequency.setValueAtTime(1200, now);
    o1.connect(gain);
    o1.start(now);
    o1.stop(now + 0.20);

    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.setValueAtTime(900, now + 0.22);
    o2.connect(gain);
    o2.start(now + 0.22);
    o2.stop(now + 0.52);
  }).catch(() => {});
}

// --- Toggle de notificações ---
function initNotifyToggle() {
  const btn = document.getElementById('notifyToggle');
  const saved = localStorage.getItem('notify') || 'on';

  const updateUI = (state) => {
    if (!btn) return;
    const isOn = state === 'on';
    // Ícones baseados em estilos de feather/lucide para visual consistente
    const ICON_BELL = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 20a2 2 0 0 1-4 0"/><path d="M18 8a6 6 0 0 0-12 0v4a2 2 0 0 1-2 2h16a2 2 0 0 1-2-2Z"/></svg>';
    const ICON_BELL_OFF = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 20a2 2 0 0 1-4 0"/><path d="M18 8a6 6 0 0 0-12 0v4a2 2 0 0 1-2 2h12"/><path d="M4 4l16 16"/></svg>';
    btn.innerHTML = isOn ? ICON_BELL : ICON_BELL_OFF;
    btn.setAttribute('aria-label', isOn ? 'Desativar notificações' : 'Ativar notificações');
    btn.setAttribute('title', isOn ? 'Desativar notificações' : 'Ativar notificações');
  };

  const applyState = (state) => {
    if (state === 'on') {
      OfferNotifier.start();
    } else {
      OfferNotifier.stop();
      OfferNotifier.clear();
    }
  };

  updateUI(saved);
  applyState(saved);

  btn?.addEventListener('click', () => {
    const curr = localStorage.getItem('notify') || 'on';
    const next = curr === 'on' ? 'off' : 'on';
    localStorage.setItem('notify', next);
    updateUI(next);
    applyState(next);
  });
}
// Obtém campo localizado (ex.: desc_pt/desc_en ou descByLang)
function getLocalizedText(obj, key) {
  const lang = __lang === 'en' ? 'en' : 'pt';
  const variants = lang === 'en' ? ['en'] : ['pt', 'br'];
  for (const v of variants) {
    const val = obj[`${key}_${v}`] || obj[`${key}${v.toUpperCase()}`] || obj[`${key}${v[0].toUpperCase()}${v.slice(1)}`];
    if (typeof val === 'string' && val.trim()) return val;
  }
  const dict = obj[`${key}ByLang`] || obj[`${key}I18n`] || (obj.i18n && obj.i18n[key]);
  if (dict) {
    const val = dict[lang] || (lang === 'pt' ? (dict.br || dict.pt) : dict.en);
    if (typeof val === 'string' && val.trim()) return val;
  }
  // fallback específico por produto (quando JSON não traz traduções)
  if (key === 'desc' && obj && obj.id) {
    const PRODUCT_DESC_I18N = {
      '1': {
        pt: 'Dashboard completo para gestão de acessos e relatórios.',
        en: 'Complete dashboard for access management and reporting.'
      },
      'automacao-premium': {
        pt: 'Ferramentas para automatizar tarefas legítimas com eficiência.',
        en: 'Tools to automate legitimate tasks efficiently.'
      },
      'consultoria': {
        pt: 'Ajuda personalizada para configurar seu painel e serviço.',
        en: 'Personalized help to set up your panel and service.'
      }
    };
    const map = PRODUCT_DESC_I18N[obj.id];
    if (map && map[lang]) return map[lang];
  }
  // Para CTA: se não houver variante localizada, não use o valor base em EN
  if (key === 'ctaText') {
    return lang === 'en' ? '' : (obj[key] || '');
  }
  return obj[key] || '';
}

// Obtém lista localizada (ex.: features_en/features_pt ou featuresByLang)
function getLocalizedList(obj, key) {
  const lang = __lang === 'en' ? 'en' : 'pt';
  const variants = lang === 'en' ? ['en'] : ['pt', 'br'];
  for (const v of variants) {
    const val = obj[`${key}_${v}`] || obj[`${key}${v.toUpperCase()}`] || obj[`${key}${v[0].toUpperCase()}${v.slice(1)}`];
    if (Array.isArray(val) && val.length) return val;
  }
  const dict = obj[`${key}ByLang`] || obj[`${key}I18n`] || (obj.i18n && obj.i18n[key]);
  if (dict) {
    const val = dict[lang] || (lang === 'pt' ? (dict.br || dict.pt) : dict.en);
    if (Array.isArray(val) && val.length) return val;
  }
  return Array.isArray(obj[key]) ? obj[key] : [];
}

// Tradução básica para tags e features quando não há lista localizada no JSON
const TAG_I18N = {
  'Emulador': { pt: 'Emulador', en: 'Emulator' },
  'Mobile': { pt: 'Mobile', en: 'Mobile' },
  'PC': { pt: 'PC', en: 'PC' },
  'Android': { pt: 'Android', en: 'Android' },
  'iOS': { pt: 'iOS', en: 'iOS' }
};

const FEATURE_I18N = {
  'Aimbot': { pt: 'Aimbot', en: 'Aimbot' },
  'Gelo invertido': { pt: 'Gelo invertido', en: 'Inverted ice' },
  'Mira pro': { pt: 'Mira pro', en: 'Pro aim' },
  'Integrações com APIs': { pt: 'Integrações com APIs', en: 'API integrations' },
  'Logs e auditoria': { pt: 'Logs e auditoria', en: 'Logs and auditing' },
  'Suporte prioritário': { pt: 'Suporte prioritário', en: 'Priority support' },
  'Onboarding': { pt: 'Onboarding', en: 'Onboarding' },
  'Boas práticas de segurança': { pt: 'Boas práticas de segurança', en: 'Security best practices' },
  'Documentação': { pt: 'Documentação', en: 'Documentation' }
};

function translateTag(tag) {
  const m = TAG_I18N[tag];
  if (!m) return tag;
  return __lang === 'en' ? (m.en || tag) : (m.pt || tag);
}

function translateFeature(f) {
  const m = FEATURE_I18N[f];
  if (!m) return f;
  return __lang === 'en' ? (m.en || f) : (m.pt || f);
}
// --- Ocultar URLs dos links (cloaking) ---
function cloakLinks(rootEl = document) {
  const anchors = rootEl.querySelectorAll('a[href]');
  anchors.forEach(a => {
    const href = a.getAttribute('href') || '';
    const cloak = a.getAttribute('data-cloak');
    if (cloak === 'false') return; // opt-out
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
    // Preserve original destination
    if (!a.dataset.href) a.dataset.href = href;
    a.setAttribute('href', '#');
    if (!a.getAttribute('role')) a.setAttribute('role', 'button');
    a.setAttribute('aria-label', a.textContent.trim() || 'Abrir link');
  });
}

// Navegação delegada para links ocultos
document.addEventListener('click', (e) => {
  const target = e.target && (e.target.closest ? e.target.closest('a[data-href]') : null);
  if (target) {
    e.preventDefault();
    const to = target.getAttribute('data-href');
    if (to) window.location.href = to;
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const target = document.activeElement;
  if (target && target.matches && target.matches('a[data-href]')) {
    e.preventDefault();
    const to = target.getAttribute('data-href');
    if (to) window.location.href = to;
  }
});