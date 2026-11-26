(() => {
'use strict';
const { SATE, SIDES_BUILDER, CATEGORIES, BRANCHES, LOGO, HERO, FACTORY } = window.SK;

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rm = v => 'RM ' + v.toFixed(2);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clampInt = (v, a, b) => Math.min(b, Math.max(a, Math.round(+v || 0)));
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2000);
}

const ITEMS = {};
CATEGORIES.forEach(c => c.items.forEach(i => { ITEMS[i.id] = i; if (c.id === 'minuman') i.fit = true; }));

function unitPrice(item, sel) {
  if (item.priceTable) return item.priceTable[sel.map(o => o.label).join('|')] ?? 0;
  const abs = sel.filter(o => o.price > 0);
  return abs.length ? abs.reduce((t, o) => t + o.price, 0) : (item.price ?? 0);
}
function fromPrice(item) {
  if (item.price != null && !item.groups) return { v: item.price, from: false };
  if (item.priceTable) { const v = Object.values(item.priceTable); return { v: Math.min(...v), from: new Set(v).size > 1 }; }
  const prices = [];
  item.groups.forEach(g => g.options.forEach(o => { if (o.price > 0) prices.push(o.price); }));
  if (!prices.length) return { v: item.price, from: false };
  return { v: Math.min(...prices), from: new Set(prices).size > 1 };
}

const S = {
  mode: store.get('sk.mode', 'delivery'),
  cart: store.get('sk.cart', []),
  bld: Object.fromEntries(SATE.map(s => [s.id, 0])),
  bldSides: Object.fromEntries(SIDES_BUILDER.map(s => [s.id, 0])),
  sel: SATE[0].id,
};
const save = () => { store.set('sk.cart', S.cart); store.set('sk.mode', S.mode); };
const cartQty = () => S.cart.reduce((t, l) => t + l.qty, 0);
const cartSub = () => S.cart.reduce((t, l) => t + l.qty * l.unit, 0);

$('#logoImg').src = LOGO; $('#footLogo').src = LOGO;
const hero = $('#heroImg'); hero.onload = () => hero.classList.add('in'); hero.src = HERO;
$('#factoryImg').src = FACTORY;
$('#yr').textContent = new Date().getFullYear();

const header = $('#header');
function setMode(m) {
  S.mode = m; save();
  $$('.mode button').forEach(b => b.setAttribute('aria-checked', b.dataset.mode === m));
  renderDrawerMode();
}
$$('.mode button').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));

const SATE_BY = Object.fromEntries(SATE.map(s => [s.id, s]));
const grillMax = () => Math.max(24, Math.min(60, Math.round($("#grill").clientWidth / 14)));
const grillEls = new Map();
const rand = n => { n = Math.imul(n ^ (n >>> 15), 0x2c1b3c6d); n = Math.imul(n ^ (n >>> 12), 0x297a2d39); return ((n ^ (n >>> 15)) >>> 0) / 4294967296; };

function renderPicker() {
  $('#picker').innerHTML = SATE.map(s => `
    <button class="pick" role="tab" data-id="${s.id}" aria-selected="${s.id === S.sel}">
      <span class="pick-media"><img src="${s.cut}" alt=""></span>
      <span class="pick-name">${esc(s.name.replace('Sate ', ''))}</span>
      <span class="pick-price">${rm(s.price)}</span>
      <i aria-hidden="true"></i>
    </button>`).join('');
}
function selectSate(id) {
  S.sel = id;
  const s = SATE_BY[id];
  $$('.pick').forEach(p => p.setAttribute('aria-selected', p.dataset.id === id));
  $('#stageName').textContent = s.name;
  $('#stagePrice').textContent = `${rm(s.price)} / cucuk`;
  $('#stageDesc').textContent = s.desc;
  syncStage();
  dimGrill();
}
function syncStage() { $('#stageQty').value = S.bld[S.sel]; }
function setCount(id, n) {
  const before = S.bld[id];
  S.bld[id] = clampInt(n, 0, 500);
  syncStage();
  if (S.bld[id] !== before) renderTray(S.bld[id] > before);
}

function grillPlan() {
  const total = bldSticks();
  const max = grillMax(), scale = total > max ? max / total : 1;
  const out = [];
  SATE.forEach((s, ti) => {
    const n = S.bld[s.id], show = scale < 1 && n ? Math.max(1, Math.round(n * scale)) : n;
    for (let k = 0; k < show; k++) out.push({ s, key: s.id + ':' + k, seed: ti * 1000 + k });
  });
  return out;
}
function dimGrill() {
  const total = bldSticks(), mine = S.bld[S.sel];
  $$('#grillSticks .gs').forEach(el => el.classList.toggle('dim', mine > 0 && total > mine && el.dataset.id !== S.sel));
}
function renderGrill(animate) {
  const g = $('#grill'), box = $('#grillSticks'), W = g.clientWidth, H = g.clientHeight;
  const plan = grillPlan(), total = bldSticks();
  $('#grillEmpty').hidden = total > 0;
  $('#grillCount').textContent = total ? `${total} cucuk` : '';
  $('#grillCount').classList.toggle('on', total > 0);
  if (!W) return;
  const L = H * .82, th = L * .19;
  const n = plan.length, usable = W * .9;
  const pitch = n > 1 ? Math.min(th * .8, (usable - th) / (n - 1)) : 0;
  const x0 = W / 2 - (pitch * (n - 1)) / 2;
  const keep = new Set();
  plan.forEach((p, i) => {
    keep.add(p.key);
    let el = grillEls.get(p.key);
    const fresh = !el;
    if (fresh) {
      el = document.createElement('img');
      el.className = 'gs'; el.src = p.s.cut; el.alt = ''; el.dataset.id = p.s.id; el.draggable = false;
      if (animate) el.classList.add('in');
      grillEls.set(p.key, el);
    }
    const r = rand(p.seed + 7), r2 = rand(p.seed + 31);
    el.style.width = L + 'px';
    el.style.left = x0 + i * pitch + 'px';
    el.style.top = H * (.53 + (r2 - .5) * .03) + 'px';
    el.style.setProperty('--rot', (-90 + (r - .5) * 3.2).toFixed(2) + 'deg');
    el.style.zIndex = i + 1;
    if (box.children[i] !== el) box.insertBefore(el, box.children[i] || null);
  });
  grillEls.forEach((el, key) => {
    if (keep.has(key)) return;
    grillEls.delete(key);
    el.classList.add('out');
    setTimeout(() => el.remove(), 300);
  });
  dimGrill();
}
new ResizeObserver(() => renderGrill(false)).observe($('#grill'));
$('#grillSticks').addEventListener('click', e => { const el = e.target.closest('.gs'); if (el) selectSate(el.dataset.id); });

$('#picker').addEventListener('click', e => { const p = e.target.closest('.pick'); if (p) selectSate(p.dataset.id); });
$('#picker').addEventListener('keydown', e => {
  if (!/Arrow(Left|Right)/.test(e.key)) return;
  const i = SATE.findIndex(s => s.id === S.sel), j = (i + (e.key === 'ArrowRight' ? 1 : -1) + SATE.length) % SATE.length;
  selectSate(SATE[j].id); $(`.pick[data-id="${SATE[j].id}"]`).focus();
});
$('#stageStepper').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setCount(S.sel, S.bld[S.sel] + +b.dataset.d); });
$('#stageQty').addEventListener('change', e => setCount(S.sel, e.target.value));
$('.quick').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setCount(S.sel, S.bld[S.sel] + +b.dataset.d); });

function renderSidesBuilder() {
  $('#traySides').innerHTML = SIDES_BUILDER.map(s => `
    <div class="side-row${S.bldSides[s.id] ? ' on' : ''}" data-id="${s.id}">
      <img src="${s.img}" alt="" loading="lazy">
      <div class="side-txt">${esc(s.name)}<small>${rm(s.price)}</small></div>
      <div class="stepper sm"><button data-d="-1" aria-label="Kurang ${esc(s.name)}">−</button><input value="${S.bldSides[s.id]}" readonly tabindex="-1" aria-label="${esc(s.name)}"><button data-d="1" aria-label="Tambah ${esc(s.name)}">+</button></div>
    </div>`).join('');
}
$('#traySides').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const row = b.closest('.side-row'), id = row.dataset.id;
  S.bldSides[id] = clampInt(S.bldSides[id] + +b.dataset.d, 0, 50);
  b.parentElement.querySelector('input').value = S.bldSides[id];
  row.classList.toggle('on', S.bldSides[id] > 0);
  renderTray();
});

const bldSticks = () => Object.values(S.bld).reduce((a, b) => a + b, 0);
const bldTotal = () => SATE.reduce((t, s) => t + S.bld[s.id] * s.price, 0) + SIDES_BUILDER.reduce((t, s) => t + S.bldSides[s.id] * s.price, 0);

function renderTray(grew) {
  const total = bldSticks();
  $('#trayCount').textContent = total + ' cucuk';
  renderGrill(grew);
  const lines = SATE.filter(s => S.bld[s.id]).map(s =>
    `<li><span class="dot" style="--c:${s.tone}"></span><span>${esc(s.name)} × ${S.bld[s.id]}</span><span class="amt">${rm(S.bld[s.id] * s.price)}</span></li>`);
  $('#trayLines').innerHTML = lines.length ? lines.join('') : '<li class="tray-empty">Belum ada sate dipilih.</li>';
  $$('.pick').forEach(p => { const n = S.bld[p.dataset.id], i = $('i', p); i.textContent = n; i.classList.toggle('on', n > 0); });
  $('#trayTotal').textContent = rm(bldTotal());
  $('#trayAdd').disabled = total === 0;
}
const SIDE_TO_ITEM = { himpitK: 's-himpitK', himpitB: 's-himpitB', ketupat: 's-ketupat', kuah: 's-kuah180', cili: 's-cili', timun: 's-timun', bawang: 's-bawang' };
function resetBuilder() {
  Object.keys(S.bld).forEach(k => { S.bld[k] = 0; });
  Object.keys(S.bldSides).forEach(k => { S.bldSides[k] = 0; });
  renderSidesBuilder(); syncStage(); renderTray();
}
$('#trayAdd').addEventListener('click', () => {
  const n = bldSticks();
  SATE.forEach(s => { if (S.bld[s.id]) addLine(ITEMS['c-' + s.id], [], S.bld[s.id], ''); });
  SIDES_BUILDER.forEach(s => { if (S.bldSides[s.id]) addLine(ITEMS[SIDE_TO_ITEM[s.id]], [], S.bldSides[s.id], ''); });
  const box = $('#grillSticks'), mid = box.children[Math.floor(box.children.length / 2)];
  if (mid) fly(mid, true);
  $$('.gs', box).forEach(el => el.classList.add('lift'));
  toast(`${n} cucuk sate ditambah ke troli`);
  setTimeout(resetBuilder, 380);
});
$('#bldReset').addEventListener('click', resetBuilder);

function cardHTML(item) {
  const p = fromPrice(item), inCart = S.cart.filter(l => l.id === item.id).reduce((t, l) => t + l.qty, 0);
  const priceTxt = `${p.from ? '<small>dari </small>' : ''}${rm(p.v)}${item.unit ? '<small> / ' + item.unit + '</small>' : ''}`;
  if (!item.img) {
    return `<button class="row-item" data-item="${item.id}"><h4>${esc(item.name)}</h4>${inCart ? `<span class="in-cart">${inCart} dalam troli</span>` : ''}<span class="price">${priceTxt}</span><span class="add" aria-hidden="true">+</span></button>`;
  }
  return `<button class="card" data-item="${item.id}">
    <div class="card-media${item.fit ? ' fit' : ''}"><img src="${item.img.replace('w=800', 'w=560')}" alt="" loading="lazy">${item.tag ? `<span class="card-tag">${esc(item.tag)}</span>` : ''}</div>
    <div class="card-body">
      <h4>${esc(item.name)}</h4>
      ${item.desc ? `<p>${esc(item.desc)}</p>` : ''}
      <div class="card-foot"><span class="price">${priceTxt}</span>${inCart ? `<span class="in-cart">${inCart} dalam troli</span>` : '<span class="add" aria-hidden="true">+</span>'}</div>
    </div></button>`;
}
function renderMenu() {
  $('#catsIn').innerHTML = CATEGORIES.map(c => `<button role="tab" data-cat="${c.id}">${esc(c.name)}</button>`).join('');
  $('#menuBody').innerHTML = CATEGORIES.map(c => {
    const withImg = c.items.filter(i => i.img), noImg = c.items.filter(i => !i.img);
    return `<div class="cat" id="cat-${c.id}">
      <div class="cat-head"><h3>${esc(c.name)}</h3>${c.note ? `<p>${esc(c.note)}</p>` : ''}</div>
      ${withImg.length ? `<div class="grid">${withImg.map(cardHTML).join('')}</div>` : ''}
      ${noImg.length ? `<div class="list">${noImg.map(cardHTML).join('')}</div>` : ''}
    </div>`;
  }).join('');
  restoreCatState();
}
$('#catsIn').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $('#cat-' + b.dataset.cat).scrollIntoView({ behavior: 'smooth' });
});
$('#menuBody').addEventListener('click', e => { const b = e.target.closest('[data-item]'); if (b) openProduct(ITEMS[b.dataset.item]); });

let lastFocus = null;
function openScrim(id) {
  lastFocus = document.activeElement;
  const s = $('#' + id); s.hidden = false; document.body.style.overflow = 'hidden';
  setTimeout(() => {
    const f = s.querySelector('.x, button.btn');
    if (f) f.focus({ preventScroll: true });
  }, 30);
}
function closeScrim(id) {
  $('#' + id).hidden = true;
  if (!$$('.scrim').some(s => !s.hidden)) document.body.style.overflow = '';
  if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
}
$$('.scrim').forEach(s => {
  s.addEventListener('click', e => { if (e.target === s || e.target.closest('[data-close]')) closeScrim(s.id); });
});
addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const open = $$('.scrim').filter(s => !s.hidden).pop();
  if (open && open.id !== 'okScrim') closeScrim(open.id);
});

let P = null;
function openProduct(item) {
  P = { item };
  const media = $('#pMedia');
  media.className = 'p-media' + (item.img ? '' : ' none') + (item.fit ? ' fit' : '');
  media.innerHTML = item.img ? `<img src="${item.img}" alt="${esc(item.name)}">` : '';
  $('#pName').textContent = item.name;
  $('#pDesc').textContent = item.desc || '';
  $('#pGroups').innerHTML = (item.groups || []).map((g, gi) => `
    <div class="opt-group"><h5>${esc(g.label)}<span>Wajib</span></h5>
      <div class="opts">${g.options.map((o, oi) => {
        const sub = [o.price > 0 && !item.priceTable ? rm(o.price) : '', o.detail ? esc(o.detail) : ''].filter(Boolean).join(' · ');
        return `<label><input type="radio" name="g${gi}" value="${oi}" ${oi ? '' : 'checked'}><span>${esc(o.label)}${sub ? `<small>${sub}</small>` : ''}</span></label>`;
      }).join('')}
      </div></div>`).join('');
  $('#pNote').value = '';
  $('#pQty').value = item.defaultQty || 1;
  updateProductPrice();
  openScrim('productScrim');
}
function productSel() {
  return (P.item.groups || []).map((g, gi) => g.options[+($(`input[name="g${gi}"]:checked`)?.value || 0)]);
}
function updateProductPrice() {
  const q = clampInt($('#pQty').value, 1, 500);
  $('#pAdd').textContent = `Tambah · ${rm(unitPrice(P.item, productSel()) * q)}`;
}
$('#pGroups').addEventListener('change', updateProductPrice);
$('#pStepper').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $('#pQty').value = clampInt(+$('#pQty').value + +b.dataset.d, 1, 500); updateProductPrice();
});
$('#pQty').addEventListener('input', updateProductPrice);
$('#pQty').addEventListener('change', e => { e.target.value = clampInt(e.target.value, 1, 500); updateProductPrice(); });
$('#pAdd').addEventListener('click', () => {
  const sel = productSel(), qty = clampInt($('#pQty').value, 1, 500);
  const img = $('#pMedia img');
  if (img) fly(img);
  closeScrim('productScrim');
  addLine(P.item, sel, qty, $('#pNote').value.trim());
  toast(`${P.item.name} ditambah ke troli`);
});

function addLine(item, sel, qty, note) {
  const opts = sel.map(o => o.label);
  const key = [item.id, ...opts, note].join('|');
  const ex = S.cart.find(l => l.key === key);
  if (ex) ex.qty = Math.min(999, ex.qty + qty);
  else S.cart.push({ key, id: item.id, name: item.name, img: item.img || null, opts, note, unit: unitPrice(item, sel), qty });
  cartChanged(true);
}
function cartChanged(bump) {
  save();
  const q = cartQty(), sub = cartSub();
  $('#cartCount').textContent = q;
  $('#cartTotalBtn').textContent = rm(sub);
  $('#mbarCount').textContent = q; $('#mbarTotal').textContent = rm(sub);
  $('#mbar').hidden = q === 0;
  if (bump) { const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
  renderCart();
  renderMenu();
}
function renderDrawerMode() {
  $('#drawerMode').innerHTML = S.mode === 'delivery'
    ? '<span>Cara: <b>Penghantaran</b></span><button class="link" data-switch>Tukar ke ambil sendiri</button>'
    : '<span>Cara: <b>Ambil sendiri</b></span><button class="link" data-switch>Tukar ke penghantaran</button>';
  $('#cFee').textContent = S.mode === 'delivery' ? 'Dikira mengikut alamat' : 'Tiada';
}
$('#drawerMode').addEventListener('click', e => { if (e.target.closest('[data-switch]')) setMode(S.mode === 'delivery' ? 'pickup' : 'delivery'); });
function renderCart() {
  const body = $('#cartBody');
  if (!S.cart.length) {
    body.innerHTML = '<div class="c-empty"><h4>Troli anda kosong</h4><p>Pilih dari menu atau pesan sate mengikut cucuk.</p></div>';
    $('#cartFoot').hidden = true; return;
  }
  $('#cartFoot').hidden = false;
  body.innerHTML = S.cart.map((l, i) => `
    <div class="c-item" data-i="${i}">
      ${l.img ? `<img class="c-thumb${ITEMS[l.id]?.fit ? ' fit' : ''}" src="${l.img.replace('w=800', 'w=160')}" alt="">` : `<div class="c-thumb blank">SK</div>`}
      <div>
        <h4>${esc(l.name)}</h4>
        ${l.opts.length || l.note ? `<div class="c-opts">${esc([...l.opts, l.note && '“' + l.note + '”'].filter(Boolean).join(' · '))}</div>` : ''}
        <div class="c-ctrl">
          <div class="stepper sm"><button data-d="-1" aria-label="Kurang">−</button><input value="${l.qty}" readonly tabindex="-1" aria-label="Kuantiti"><button data-d="1" aria-label="Tambah">+</button></div>
          <button class="c-remove" data-remove>Buang</button>
        </div>
      </div>
      <span class="c-price">${rm(l.unit * l.qty)}</span>
    </div>`).join('');
  $('#cSub').textContent = rm(cartSub());
}
$('#cartBody').addEventListener('click', e => {
  const row = e.target.closest('.c-item'); if (!row) return;
  const i = +row.dataset.i, l = S.cart[i];
  if (e.target.closest('[data-remove]')) S.cart.splice(i, 1);
  else { const b = e.target.closest('button[data-d]'); if (!b) return; l.qty += +b.dataset.d; if (l.qty < 1) S.cart.splice(i, 1); }
  cartChanged();
});
const openCart = () => { renderDrawerMode(); renderCart(); openScrim('cartScrim'); };
$('#cartBtn').addEventListener('click', openCart);
$('#mbar').addEventListener('click', openCart);

function fly(fromImg, cutout) {
  if (!fromImg || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const mobile = matchMedia('(max-width: 640px)').matches;
  const target = mobile && !$('#mbar').hidden ? $('#mbar') : $('#cartBtn');
  const a = fromImg.getBoundingClientRect(), b = target.getBoundingClientRect();
  if (!a.width || !b.width) return;
  const w = cutout ? 220 : Math.min(a.width, 180), h = cutout ? 44 : w * .68, el = document.createElement('img');
  el.src = fromImg.currentSrc || fromImg.src; el.className = cutout ? 'fly cut' : 'fly'; el.alt = '';
  Object.assign(el.style, { width: w + 'px', height: h + 'px', left: a.left + a.width / 2 - w / 2 + 'px', top: a.top + a.height / 2 - h / 2 + 'px' });
  document.body.appendChild(el);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  el.animate([
    { transform: 'translate(0,0) scale(1)', opacity: 1 },
    { transform: `translate(${dx * .45}px, ${dy * .45 - 70}px) scale(.55)`, opacity: 1, offset: .5 },
    { transform: `translate(${dx}px, ${dy}px) scale(.12)`, opacity: .3 },
  ], { duration: 700, easing: 'cubic-bezier(.5,0,.5,1)' }).onfinish = () => el.remove();
}

function fmtTime(min) {
  const h = Math.floor(min / 60), m = min % 60;
  const p = h < 12 ? 'pg' : h < 14 ? 'tgh' : h < 19 ? 'ptg' : 'mlm';
  return `${h % 12 || 12}.${String(m).padStart(2, '0')} ${p}`;
}
function klNow() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kuala_Lumpur', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')), min: +get('hour') * 60 + +get('minute') };
}
const toMin = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const hoursOn = (b, day) => b.hours[day].map(toMin);

const co = $('.checkout');
let coStep = 0;
function fillTimes() {
  const { day, min } = klNow(), b = BRANCHES[+$('#coBranch').value || 0];
  const [o, c] = hoursOn(b, day);
  const opts = [];
  if (min >= o && min < c - 45) opts.push('<option>Secepat mungkin (anggaran 45 minit)</option>');
  for (let t = Math.max(o + 30, Math.ceil((min + 60) / 30) * 30); t <= c - 30 && opts.length < 12; t += 30) opts.push(`<option>Hari ini, ${fmtTime(t)}</option>`);
  if (!opts.length) {
    const [o2, c2] = hoursOn(b, (day + 1) % 7);
    for (let t = o2 + 30; t <= c2 - 30 && opts.length < 12; t += 60) opts.push(`<option>Esok, ${fmtTime(t)}</option>`);
  }
  $('#coTime').innerHTML = opts.join('');
}
function coRenderSummary() {
  $('#coLines').innerHTML = S.cart.map(l => `<li><span>${l.qty} × ${esc(l.name)}${l.opts.length ? `<small>${esc(l.opts.join(' · '))}</small>` : ''}</span><span>${rm(l.unit * l.qty)}</span></li>`).join('');
  const sub = cartSub(), pickup = S.mode === 'pickup';
  $('#coSub').textContent = rm(sub);
  $('#coFee').textContent = pickup ? 'Tiada' : 'Mengikut jarak';
  $('#coTotal').textContent = pickup ? rm(sub) : rm(sub) + ' + caj';
}
function coSetMode(m) {
  setMode(m);
  co.classList.toggle('pickup', m === 'pickup');
  $$('#coMode input').forEach(i => { i.checked = i.value === m; });
  if (m === 'delivery' && $('input[name=pay]:checked')?.value === 'Kaunter') $('input[name=pay][value=FPX]').checked = true;
  coRenderSummary();
}
function coGo(step) {
  coStep = step;
  $$('.co-pane').forEach(p => { p.hidden = +p.dataset.pane !== step; });
  $$('.co-steps li').forEach((li, i) => li.classList.toggle('on', i <= step));
  $('#coBack').hidden = step === 0;
  $('#coNext').textContent = step === 0 ? 'Teruskan ke bayaran' : 'Buat pesanan';
}
$('#checkoutBtn').addEventListener('click', () => {
  closeScrim('cartScrim');
  $('#coBranch').innerHTML = BRANCHES.map((b, i) => `<option value="${i}">${esc(b.name)}</option>`).join('');
  $('#coErr0').textContent = '';
  coSetMode(S.mode); fillTimes(); coGo(0);
  openScrim('coScrim');
});
$('#coMode').addEventListener('change', e => coSetMode(e.target.value));
$('#coBranch').addEventListener('change', fillTimes);
$('#coBack').addEventListener('click', () => coGo(0));
$('#coForm').addEventListener('submit', e => {
  e.preventDefault();
  if (coStep === 0) {
    const name = $('#coName').value.trim(), phone = $('#coPhone').value.replace(/[\s-]/g, ''), addr = $('#coAddr').value.trim();
    let err = '';
    if (!name) err = 'Sila masukkan nama.';
    else if (!/^(\+?60|0)1\d{7,9}$/.test(phone)) err = 'Sila masukkan nombor telefon bimbit yang sah.';
    else if (S.mode === 'delivery' && addr.length < 10) err = 'Sila masukkan alamat penghantaran yang lengkap.';
    $('#coErr0').textContent = err;
    if (!err) coGo(1);
    return;
  }
  const b = BRANCHES[+$('#coBranch').value];
  $('#okNo').textContent = 'SK' + Date.now().toString().slice(-7);
  $('#okMeta').innerHTML = [
    ['Cara', S.mode === 'delivery' ? 'Penghantaran' : 'Ambil sendiri'],
    ['Cawangan', b.name],
    ['Masa', $('#coTime').value],
    ['Bayaran', $('input[name=pay]:checked').value],
    ['Jumlah', rm(cartSub()) + (S.mode === 'delivery' ? ' + caj penghantaran' : '')],
  ].map(([k, v]) => `<div class="row"><span class="muted">${k}</span><span>${esc(v)}</span></div>`).join('');
  closeScrim('coScrim');
  S.cart = []; cartChanged();
  $('#coForm').reset();
  openScrim('okScrim');
});
$('#okDone').addEventListener('click', () => closeScrim('okScrim'));

function branchStatus(b) {
  const { day, min } = klNow(), [o, c] = hoursOn(b, day);
  if (min >= o && min < c) return { open: true, text: `Buka · tutup ${fmtTime(c)}` };
  if (min < o) return { open: false, text: `Tutup · buka ${fmtTime(o)}` };
  return { open: false, text: `Tutup · buka esok ${fmtTime(hoursOn(b, (day + 1) % 7)[0])}` };
}
let branchFilter = 'all';
function renderBranches() {
  const { day } = klNow();
  $('#branchGrid').innerHTML = BRANCHES.filter(b => branchFilter === 'all' || b.area === branchFilter).map(b => {
    const st = branchStatus(b), [o, c] = hoursOn(b, day);
    return `<article class="branch">
      <div class="branch-top"><h3>${esc(b.name)}</h3><span class="status ${st.open ? 'open' : 'closed'}">${st.text}</span></div>
      <p>${esc(b.addr)}</p>
      <p class="branch-note">Hari ini ${fmtTime(o)} – ${fmtTime(c)}${b.note ? ' · ' + esc(b.note) : ''}</p>
      <div class="branch-meta">
        ${b.tel.map(t => `<a href="tel:${t.replace(/[^\d]/g, '')}">${t}</a>`).join('')}
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Sate Kajang Hj Samuri ' + b.name)}" target="_blank" rel="noopener">Arah ke sini</a>
      </div>
    </article>`;
  }).join('');
}
$('#branchFilter').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  branchFilter = b.dataset.f;
  $$('#branchFilter button').forEach(x => x.setAttribute('aria-checked', x === b));
  renderBranches();
});

let activeCat = CATEGORIES[0].id;
function restoreCatState() { $$('#catsIn button').forEach(b => b.classList.toggle('on', b.dataset.cat === activeCat)); }
function onScroll() {
  header.classList.toggle('scrolled', scrollY > 10);
  const line = 160;
  let cur = CATEGORIES[0].id;
  for (const c of CATEGORIES) { const el = $('#cat-' + c.id); if (el && el.getBoundingClientRect().top <= line) cur = c.id; }
  if (cur !== activeCat) {
    activeCat = cur; restoreCatState();
    const btn = $(`#catsIn button[data-cat="${cur}"]`);
    if (btn) { const bar = $('#catsIn'), b = btn.getBoundingClientRect(), r = bar.getBoundingClientRect(); bar.scrollTo({ left: bar.scrollLeft + b.left - r.left - (r.width - b.width) / 2, behavior: 'smooth' }); }
  }
  let sec = '';
  for (const id of ['pesan', 'menu', 'tentang', 'cawangan']) { if ($('#' + id).getBoundingClientRect().top <= line) sec = id; }
  $$('.nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + sec));
}
addEventListener('scroll', onScroll, { passive: true });

renderPicker(); selectSate(S.sel); renderSidesBuilder(); renderTray();
setMode(S.mode); renderBranches(); cartChanged(); onScroll();
setInterval(renderBranches, 60000);
})();
