'use strict';

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
let TOKEN          = localStorage.getItem('admin_token') || null;
let CURRENT_SECTION = 'general';
let CONTENT        = {};
let RSVP_DATA      = [];
let DRAG_SRC       = null;

// ─────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────
async function api(method, path, body = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

async function uploadImage(folder, file) {
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch(`/api/upload/${folder}`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body:    fd,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

// ─────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────
function toast(msg, type = 'success') {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('fadeout');
    setTimeout(() => el.remove(), 350);
  }, 3000);
}

// ─────────────────────────────────────────────
// Confirm dialog
// ─────────────────────────────────────────────
function confirm(msg) {
  return new Promise(resolve => {
    const modal     = document.getElementById('confirmModal');
    const msgEl     = document.getElementById('confirmMsg');
    const okBtn     = document.getElementById('confirmOk');
    const cancelBtn = document.getElementById('confirmCancel');

    msgEl.textContent = msg;
    modal.hidden = false;

    const cleanup = (result) => {
      modal.hidden = true;
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      resolve(result);
    };

    const onOk     = () => cleanup(true);
    const onCancel = () => cleanup(false);

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
  });
}

// ─────────────────────────────────────────────
// Escape HTML
// ─────────────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─────────────────────────────────────────────
// Upload zone helper
// ─────────────────────────────────────────────
function makeUploadZone(folder, currentUrl, onSuccess) {
  const zoneId = `uz-${Math.random().toString(36).slice(2)}`;
  const div = document.createElement('div');
  div.innerHTML = `
    <div class="upload-zone" id="${zoneId}">
      <div class="upload-icon">☁️</div>
      <p class="upload-text">Kéo thả ảnh vào đây hoặc click để chọn</p>
      <p class="upload-hint">JPEG, PNG, WebP · Tối đa 20MB</p>
      <input type="file" accept="image/*" />
    </div>
    ${currentUrl ? `
    <div class="upload-preview" id="prev-${zoneId}">
      <img class="upload-preview-img" src="${esc(currentUrl)}" alt="Current image" />
      <div class="upload-preview-info">
        <p class="upload-preview-name">${esc(currentUrl.split('/').pop())}</p>
        <p class="upload-preview-size upload-status">Ảnh hiện tại</p>
      </div>
    </div>` : `<div id="prev-${zoneId}" class="upload-preview" style="display:none"></div>`}
  `;

  const zone  = div.querySelector('.upload-zone');
  const input = zone.querySelector('input[type="file"]');
  const prev  = div.querySelector(`#prev-${zoneId}`);

  const handleFile = async (file) => {
    if (!file.type.startsWith('image/')) return toast('Chỉ chấp nhận file ảnh', 'error');
    const statusEl = prev.querySelector('.upload-status');
    zone.querySelector('.upload-text').textContent = 'Đang tải lên...';

    try {
      const result = await uploadImage(folder, file);
      // Populate preview if empty (no existing image)
      if (!prev.querySelector('.upload-preview-img')) {
        prev.innerHTML = `
          <img class="upload-preview-img" src="" alt="Preview" />
          <div class="upload-preview-info">
            <p class="upload-preview-name"></p>
            <p class="upload-preview-size upload-status"></p>
          </div>`;
      }
      // Show preview
      prev.style.display = 'flex';
      prev.querySelector('.upload-preview-img').src = result.url;
      prev.querySelector('.upload-preview-name').textContent = result.filename;
      const statusEl2 = prev.querySelector('.upload-status');
      if (statusEl2) statusEl2.textContent = 'Đã tải lên thành công ✓';
      zone.querySelector('.upload-text').textContent = 'Tải ảnh khác';
      onSuccess(result.url);
      toast('Tải ảnh thành công!');
    } catch (err) {
      zone.querySelector('.upload-text').textContent = 'Kéo thả ảnh vào đây hoặc click để chọn';
      toast('Lỗi tải ảnh: ' + err.message, 'error');
    }
  };

  input.addEventListener('change', () => input.files[0] && handleFile(input.files[0]));
  zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  return div;
}

// ─────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────
function initLogin() {
  const form  = document.getElementById('loginForm');
  const error = document.getElementById('loginError');
  const btn   = document.getElementById('loginBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw = document.getElementById('loginPassword').value;
    btn.disabled = true;
    btn.textContent = 'Đang đăng nhập...';
    error.hidden = true;

    try {
      const data = await api('POST', '/api/login', { password: pw });
      TOKEN = data.token;
      localStorage.setItem('admin_token', TOKEN);
      showAdmin();
    } catch (err) {
      error.textContent = err.message || 'Sai mật khẩu';
      error.hidden = false;
      btn.disabled = false;
      btn.textContent = 'Đăng nhập';
    }
  });
}

// ─────────────────────────────────────────────
// Show/hide screens
// ─────────────────────────────────────────────
function showAdmin() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('adminLayout').hidden = false;
  document.getElementById('adminLayout').classList.remove('hidden');
  loadContent().then(() => renderSection('general'));
}

function showLogin() {
  TOKEN = null;
  localStorage.removeItem('admin_token');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('adminLayout').hidden = true;
}

async function loadContent() {
  try {
    CONTENT = await api('GET', '/api/content');
  } catch {
    CONTENT = {};
  }
}

// ─────────────────────────────────────────────
// Sidebar navigation
// ─────────────────────────────────────────────
function initSidebar() {
  const navItems = document.querySelectorAll('.nav-item[data-section]');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      CURRENT_SECTION = item.dataset.section;
      document.getElementById('breadcrumbSection').textContent = item.textContent.trim();
      renderSection(CURRENT_SECTION);
      closeSidebar();
    });
  });

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    const ok = await confirm('Bạn có chắc muốn đăng xuất?');
    if (ok) showLogin();
  });

  // Mobile hamburger
  const ham      = document.getElementById('hamburger');
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebarOverlay');

  ham.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  overlay.addEventListener('click', closeSidebar);

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  }

  // Save buttons
  const saveFn = () => saveCurrentSection();
  document.getElementById('saveTopBtn').addEventListener('click', saveFn);
  document.getElementById('saveBarBtn').addEventListener('click', saveFn);
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

// ─────────────────────────────────────────────
// Save
// ─────────────────────────────────────────────
async function saveCurrentSection() {
  const data = collectSection(CURRENT_SECTION);
  if (data === null) return; // special sections (rsvp, password)

  try {
    await api('PUT', `/api/content/${CURRENT_SECTION}`, data);
    CONTENT[CURRENT_SECTION] = data;
    toast('Đã lưu thay đổi ✓');
  } catch (err) {
    toast('Lỗi lưu: ' + err.message, 'error');
  }
}

// ─────────────────────────────────────────────
// Render sections
// ─────────────────────────────────────────────
function renderSection(section) {
  const wrap = document.getElementById('panelWrap');
  wrap.innerHTML = '';

  const renderers = {
    general:    renderGeneral,
    hero:       renderHero,
    story:      renderStory,
    couple:     renderCouple,
    location:   renderLocation,
    schedule:   renderSchedule,
    gallery:    renderGallery,
    details:    renderDetails,
    saigonGuide: renderSaigonGuide,
    rsvp:       renderRsvp,
    password:   renderPassword,
  };

  (renderers[section] || (() => { wrap.textContent = 'Section chưa có'; }))(wrap);
}

// ─────────────────────────────────────────────
// Collect data from DOM before saving
// ─────────────────────────────────────────────
function collectSection(section) {
  const collectors = {
    general:     collectGeneral,
    hero:        collectHero,
    story:       collectStory,
    couple:      collectCouple,
    location:    collectLocation,
    schedule:    collectSchedule,
    gallery:     collectGallery,
    details:     collectDetails,
    saigonGuide: collectSaigonGuide,
    rsvp:        () => null,
    password:    () => null,
  };
  return (collectors[section] || (() => null))();
}

// ─────────────────────────────────────────────
// Section: General
// ─────────────────────────────────────────────
function renderGeneral(wrap) {
  const g = CONTENT.general || {};
  wrap.innerHTML = `
    <h1 class="panel-title">Thông tin chung</h1>
    <p class="panel-desc">Thông tin cơ bản của cặp đôi, xuất hiện trên toàn site</p>
    <div class="admin-card">
      <p class="admin-card-title">Tên cặp đôi</p>
      <div class="form-row">
        <div class="form-group">
          <label>Tên chú rể (VI)</label>
          <input type="text" id="g-groom-vi" value="${esc(g.groom?.vi || 'Kevin')}" />
        </div>
        <div class="form-group">
          <label>Groom name (EN)</label>
          <input type="text" id="g-groom-en" value="${esc(g.groom?.en || 'Kevin')}" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Tên cô dâu (VI)</label>
          <input type="text" id="g-bride-vi" value="${esc(g.bride?.vi || 'Ady')}" />
        </div>
        <div class="form-group">
          <label>Bride name (EN)</label>
          <input type="text" id="g-bride-en" value="${esc(g.bride?.en || 'Ady')}" />
        </div>
      </div>
    </div>
    <div class="admin-card">
      <p class="admin-card-title">Ngày &amp; Địa điểm</p>
      <div class="form-group">
        <label>Ngày cưới (ISO datetime)</label>
        <input type="datetime-local" id="g-date" value="${esc((g.weddingDate || '2026-11-15T18:00').slice(0,16))}" />
      </div>
      <div class="form-group">
        <label>Hashtag</label>
        <input type="text" id="g-hashtag" value="${esc(g.hashtag || '#KevinAndAdyForever')}" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Địa điểm ngắn (VI)</label>
          <input type="text" id="g-venue-vi" value="${esc(g.venue?.vi || '')}" />
        </div>
        <div class="form-group">
          <label>Short venue (EN)</label>
          <input type="text" id="g-venue-en" value="${esc(g.venue?.en || '')}" />
        </div>
      </div>
    </div>
  `;
}

function collectGeneral() {
  return {
    groom:       { vi: val('g-groom-vi'), en: val('g-groom-en') },
    bride:       { vi: val('g-bride-vi'), en: val('g-bride-en') },
    weddingDate: val('g-date') + ':00+07:00',
    hashtag:     val('g-hashtag'),
    venue:       { vi: val('g-venue-vi'), en: val('g-venue-en') },
  };
}

// ─────────────────────────────────────────────
// Section: Hero
// ─────────────────────────────────────────────
function renderHero(wrap) {
  const h = CONTENT.hero || {};
  const card = document.createElement('div');
  card.innerHTML = `
    <h1 class="panel-title">Hero</h1>
    <p class="panel-desc">Ảnh nền và text hiển thị trên màn hình đầu tiên</p>
    <div class="admin-card">
      <p class="admin-card-title">Ảnh nền Hero</p>
      <div id="hero-upload-zone"></div>
      <input type="hidden" id="hero-image" value="${esc(h.image || '')}" />
    </div>
    <div class="admin-card">
      <p class="admin-card-title">Text góc dưới trái</p>
      <div class="form-row">
        <div class="form-group">
          <label>Ngày (VI)</label>
          <input type="text" id="h-date-vi" value="${esc(h.dateText?.vi || '15 Tháng Mười Một 2026')}" />
        </div>
        <div class="form-group">
          <label>Date (EN)</label>
          <input type="text" id="h-date-en" value="${esc(h.dateText?.en || '15 November 2026')}" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Địa điểm (VI)</label>
          <input type="text" id="h-venue-vi" value="${esc(h.venueText?.vi || '')}" />
        </div>
        <div class="form-group">
          <label>Venue (EN)</label>
          <input type="text" id="h-venue-en" value="${esc(h.venueText?.en || '')}" />
        </div>
      </div>
    </div>
    <div class="admin-card">
      <p class="admin-card-title">Hashtag (góc dưới phải)</p>
      <div class="form-group">
        <input type="text" id="h-hashtag" value="${esc(h.hashtag || '#KevinAndAdyForever')}" />
      </div>
    </div>
  `;

  wrap.appendChild(card);

  const zone = makeUploadZone('hero', h.image, url => {
    document.getElementById('hero-image').value = url;
  });
  card.querySelector('#hero-upload-zone').appendChild(zone);
}

function collectHero() {
  return {
    image:     val('hero-image'),
    dateText:  { vi: val('h-date-vi'), en: val('h-date-en') },
    venueText: { vi: val('h-venue-vi'), en: val('h-venue-en') },
    hashtag:   val('h-hashtag'),
  };
}

// ─────────────────────────────────────────────
// Section: Story
// ─────────────────────────────────────────────
function renderStory(wrap) {
  const s = CONTENT.story || {};
  const card = document.createElement('div');
  card.innerHTML = `
    <h1 class="panel-title">Love Story</h1>
    <p class="panel-desc">Câu chuyện tình yêu của cặp đôi</p>
    <div class="admin-card">
      <p class="admin-card-title">Subtitle</p>
      <div class="form-row">
        <div class="form-group"><label>VI</label><input type="text" id="s-sub-vi" value="${esc(s.subtitle?.vi || '')}" /></div>
        <div class="form-group"><label>EN</label><input type="text" id="s-sub-en" value="${esc(s.subtitle?.en || '')}" /></div>
      </div>
    </div>
    <div class="admin-card">
      <p class="admin-card-title">Các đoạn văn</p>
      <div id="story-repeater"></div>
      <button class="btn-add" id="story-add-para">+ Thêm đoạn</button>
    </div>
    <div class="admin-card">
      <p class="admin-card-title">Ảnh minh hoạ bên phải</p>
      <div id="story-upload-zone"></div>
      <input type="hidden" id="story-image" value="${esc(s.image || '')}" />
    </div>
  `;

  wrap.appendChild(card);

  const repeater = card.querySelector('#story-repeater');
  (s.paragraphs || []).forEach((p, i) => repeater.appendChild(makeParaItem(p, i)));
  initDragReorder(repeater);

  card.querySelector('#story-add-para').addEventListener('click', () => {
    const idx = repeater.querySelectorAll('.repeater-item').length;
    repeater.appendChild(makeParaItem({ vi: '', en: '' }, idx));
  });

  const zone = makeUploadZone('story', s.image, url => {
    card.querySelector('#story-image').value = url;
  });
  card.querySelector('#story-upload-zone').appendChild(zone);
}

function makeParaItem(p, idx) {
  const div = document.createElement('div');
  div.className = 'repeater-item';
  div.dataset.idx = idx;
  div.draggable = true;
  div.innerHTML = `
    <span class="repeater-handle" aria-hidden="true">⋮⋮</span>
    <div class="repeater-content">
      <div class="form-group"><label>Nội dung VI</label><textarea class="para-vi" rows="3">${esc(p.vi)}</textarea></div>
      <div class="form-group"><label>Content EN</label><textarea class="para-en" rows="3">${esc(p.en)}</textarea></div>
    </div>
    <div class="repeater-actions">
      <button class="btn-icon delete" title="Xóa đoạn" aria-label="Xóa">✕</button>
    </div>
  `;
  div.querySelector('.delete').addEventListener('click', async () => {
    const ok = await confirm('Xóa đoạn văn này?');
    if (ok) div.remove();
  });
  return div;
}

function collectStory() {
  const paras = [];
  document.querySelectorAll('#story-repeater .repeater-item').forEach(item => {
    paras.push({ vi: item.querySelector('.para-vi').value, en: item.querySelector('.para-en').value });
  });
  return {
    subtitle:   { vi: val('s-sub-vi'), en: val('s-sub-en') },
    paragraphs: paras,
    image:      val('story-image'),
  };
}

// ─────────────────────────────────────────────
// Section: Couple
// ─────────────────────────────────────────────
function renderCouple(wrap) {
  const c = CONTENT.couple || {};
  wrap.innerHTML = `<h1 class="panel-title">Couple</h1><p class="panel-desc">Thông tin cô dâu và chú rể</p>`;

  ['groom', 'bride'].forEach(role => {
    const p    = (c[role] || {});
    const card = document.createElement('div');
    card.className = 'admin-card';
    const label = role === 'groom' ? 'Chú rể' : 'Cô dâu';
    card.innerHTML = `
      <p class="admin-card-title">${label}</p>
      <div id="${role}-upload-zone"></div>
      <input type="hidden" id="${role}-portrait" value="${esc(p.portrait || '')}" />
      <div class="form-group" style="margin-top:16px">
        <label>Tên hiển thị</label>
        <input type="text" id="${role}-name" value="${esc(p.name || '')}" />
      </div>
      <div class="form-row">
        <div class="form-group"><label>Role (VI)</label><input type="text" id="${role}-role-vi" value="${esc(p.role?.vi || '')}" /></div>
        <div class="form-group"><label>Role (EN)</label><input type="text" id="${role}-role-en" value="${esc(p.role?.en || '')}" /></div>
      </div>
      <div class="form-group"><label>Mô tả (VI)</label><textarea id="${role}-desc-vi" rows="3">${esc(p.desc?.vi || '')}</textarea></div>
      <div class="form-group"><label>Description (EN)</label><textarea id="${role}-desc-en" rows="3">${esc(p.desc?.en || '')}</textarea></div>
    `;
    wrap.appendChild(card);

    const zone = makeUploadZone('couple', p.portrait, url => {
      card.querySelector(`#${role}-portrait`).value = url;
    });
    card.querySelector(`#${role}-upload-zone`).appendChild(zone);
  });
}

function collectCouple() {
  return {
    groom: {
      name:    val('groom-name'),
      role:    { vi: val('groom-role-vi'), en: val('groom-role-en') },
      desc:    { vi: val('groom-desc-vi'), en: val('groom-desc-en') },
      portrait: val('groom-portrait'),
    },
    bride: {
      name:    val('bride-name'),
      role:    { vi: val('bride-role-vi'), en: val('bride-role-en') },
      desc:    { vi: val('bride-desc-vi'), en: val('bride-desc-en') },
      portrait: val('bride-portrait'),
    },
  };
}

// ─────────────────────────────────────────────
// Section: Location
// ─────────────────────────────────────────────
function renderLocation(wrap) {
  const loc = CONTENT.location || {};
  const venues = loc.venues || [];

  wrap.innerHTML = `<h1 class="panel-title">Location</h1><p class="panel-desc">Địa điểm tổ chức và ghi chú di chuyển</p>`;

  // Note card
  const noteCard = document.createElement('div');
  noteCard.className = 'admin-card';
  noteCard.innerHTML = `
    <p class="admin-card-title">Ghi chú di chuyển</p>
    <div class="form-row">
      <div class="form-group"><label>Ghi chú (VI)</label><textarea id="loc-note-vi" rows="4">${esc(loc.note?.vi||'')}</textarea></div>
      <div class="form-group"><label>Note (EN)</label><textarea id="loc-note-en" rows="4">${esc(loc.note?.en||'')}</textarea></div>
    </div>
  `;
  wrap.appendChild(noteCard);

  // Venues list
  const listWrap = document.createElement('div');
  listWrap.id = 'loc-list';
  wrap.appendChild(listWrap);
  venues.forEach(v => listWrap.appendChild(makeVenueCard(v)));

  const addBtn = document.createElement('button');
  addBtn.className = 'btn-add';
  addBtn.textContent = '+ Thêm địa điểm';
  addBtn.addEventListener('click', () => {
    const newV = { id: Date.now().toString(), name: '', address: { vi:'', en:'' }, image: '', mapUrl: '' };
    listWrap.appendChild(makeVenueCard(newV));
  });
  wrap.appendChild(addBtn);
}

function makeVenueCard(v) {
  const card = document.createElement('div');
  card.className = 'admin-card';
  card.dataset.venueId = v.id;
  card.innerHTML = `
    <p class="admin-card-title">Địa điểm</p>
    <div class="form-group"><label>Tên địa điểm</label><input type="text" class="v-name" value="${esc(v.name||'')}" /></div>
    <div class="form-row">
      <div class="form-group"><label>Địa chỉ (VI)</label><input type="text" class="v-addr-vi" value="${esc(v.address?.vi||'')}" /></div>
      <div class="form-group"><label>Address (EN)</label><input type="text" class="v-addr-en" value="${esc(v.address?.en||'')}" /></div>
    </div>
    <div class="form-group"><label>Link Google Maps</label><input type="url" class="v-mapurl" value="${esc(v.mapUrl||'')}" placeholder="https://maps.google.com/..." /></div>
    <div class="form-group"><label>Ảnh địa điểm</label><div class="v-upload-zone"></div><input type="hidden" class="v-image" value="${esc(v.image||'')}" /></div>
    <div style="display:flex;justify-content:flex-end;margin-top:8px">
      <button class="btn-danger v-delete">Xóa địa điểm</button>
    </div>
  `;

  const zone = makeUploadZone('hero', v.image, url => {
    card.querySelector('.v-image').value = url;
  });
  card.querySelector('.v-upload-zone').appendChild(zone);

  card.querySelector('.v-delete').addEventListener('click', async () => {
    const ok = await confirm('Xóa địa điểm này?');
    if (ok) card.remove();
  });
  return card;
}

function collectLocation() {
  const venues = [];
  document.querySelectorAll('#loc-list .admin-card').forEach(card => {
    venues.push({
      id:      card.dataset.venueId || Date.now().toString(),
      name:    card.querySelector('.v-name').value,
      address: { vi: card.querySelector('.v-addr-vi').value, en: card.querySelector('.v-addr-en').value },
      mapUrl:  card.querySelector('.v-mapurl').value,
      image:   card.querySelector('.v-image').value,
    });
  });
  return {
    note:   { vi: val('loc-note-vi'), en: val('loc-note-en') },
    venues,
  };
}

// ─────────────────────────────────────────────
// Section: Schedule
// ─────────────────────────────────────────────
function renderSchedule(wrap) {
  const s = CONTENT.schedule || {};
  const div = document.createElement('div');
  div.innerHTML = `
    <h1 class="panel-title">Schedule</h1>
    <p class="panel-desc">Lịch trình ngày cưới và ảnh venue</p>
    <div class="admin-card">
      <p class="admin-card-title">Tiêu đề ngày</p>
      <div class="form-row">
        <div class="form-group"><label>VI</label><input type="text" id="sc-date-vi" value="${esc(s.dateHeading?.vi||'')}" /></div>
        <div class="form-group"><label>EN</label><input type="text" id="sc-date-en" value="${esc(s.dateHeading?.en||'')}" /></div>
      </div>
    </div>
    <div class="admin-card">
      <p class="admin-card-title">Ảnh venue bên phải</p>
      <div id="sc-upload-zone"></div>
      <input type="hidden" id="sc-image" value="${esc(s.image||'')}" />
      <div class="form-row" style="margin-top:16px">
        <div class="form-group"><label>Label ảnh (VI)</label><input type="text" id="sc-label-vi" value="${esc(s.imageLabel?.vi||'')}" /></div>
        <div class="form-group"><label>Image label (EN)</label><input type="text" id="sc-label-en" value="${esc(s.imageLabel?.en||'')}" /></div>
      </div>
    </div>
    <div class="admin-card">
      <p class="admin-card-title">Các mốc thời gian</p>
      <div id="sc-repeater"></div>
      <button class="btn-add" id="sc-add-item">+ Thêm mốc thời gian</button>
    </div>
  `;
  wrap.appendChild(div);

  const repeater = div.querySelector('#sc-repeater');
  (s.items || []).forEach(item => repeater.appendChild(makeTimelineItem(item)));
  initDragReorder(repeater);

  div.querySelector('#sc-add-item').addEventListener('click', () => {
    repeater.appendChild(makeTimelineItem({ id: Date.now().toString(), time: '', event: { vi: '', en: '' } }));
  });

  const zone = makeUploadZone('schedule', s.image, url => {
    div.querySelector('#sc-image').value = url;
  });
  div.querySelector('#sc-upload-zone').appendChild(zone);
}

function makeTimelineItem(item) {
  const d = document.createElement('div');
  d.className = 'repeater-item';
  d.draggable = true;
  d.dataset.id = item.id || Date.now();
  d.innerHTML = `
    <span class="repeater-handle">⋮⋮</span>
    <div class="repeater-content">
      <div class="form-group"><label>Giờ (vd: 9:00 SA)</label><input type="text" class="ti-time" value="${esc(item.time||'')}" /></div>
      <div class="form-row">
        <div class="form-group"><label>Tên sự kiện (VI)</label><input type="text" class="ti-event-vi" value="${esc(item.event?.vi||'')}" /></div>
        <div class="form-group"><label>Event name (EN)</label><input type="text" class="ti-event-en" value="${esc(item.event?.en||'')}" /></div>
      </div>
    </div>
    <div class="repeater-actions">
      <button class="btn-icon delete" aria-label="Xóa">✕</button>
    </div>
  `;
  d.querySelector('.delete').addEventListener('click', async () => {
    const ok = await confirm('Xóa mốc thời gian này?');
    if (ok) d.remove();
  });
  return d;
}

function collectSchedule() {
  const items = [];
  document.querySelectorAll('#sc-repeater .repeater-item').forEach(item => {
    items.push({
      id:    item.dataset.id || Date.now().toString(),
      time:  item.querySelector('.ti-time').value,
      event: { vi: item.querySelector('.ti-event-vi').value, en: item.querySelector('.ti-event-en').value },
    });
  });
  return {
    dateHeading: { vi: val('sc-date-vi'), en: val('sc-date-en') },
    image:       val('sc-image'),
    imageLabel:  { vi: val('sc-label-vi'), en: val('sc-label-en') },
    items,
  };
}

// ─────────────────────────────────────────────
// Section: Gallery
// ─────────────────────────────────────────────
function renderGallery(wrap) {
  const items = (CONTENT.gallery || []).sort((a, b) => (a.order||0) - (b.order||0));
  const div = document.createElement('div');
  div.innerHTML = `
    <h1 class="panel-title">Gallery</h1>
    <p class="panel-desc">Quản lý ảnh album cưới</p>
    <div class="admin-card">
      <p class="admin-card-title">Upload ảnh mới</p>
      <div id="gallery-upload-zone"></div>
    </div>
    <div class="admin-card">
      <p class="admin-card-title">Ảnh hiện tại (kéo để sắp xếp lại)</p>
      <div class="gallery-admin-grid" id="gallery-admin-grid"></div>
    </div>
  `;
  wrap.appendChild(div);

  const grid = div.querySelector('#gallery-admin-grid');
  items.forEach(item => grid.appendChild(makeGalleryAdminItem(item)));

  // Multi-upload zone
  const uploadZoneWrap = div.querySelector('#gallery-upload-zone');
  const zone = document.createElement('div');
  zone.className = 'upload-zone';
  zone.innerHTML = `
    <div class="upload-icon">🖼️</div>
    <p class="upload-text">Kéo thả nhiều ảnh hoặc click để chọn</p>
    <p class="upload-hint">JPEG, PNG, WebP · Tối đa 20MB mỗi ảnh</p>
    <input type="file" accept="image/*" multiple />
  `;
  uploadZoneWrap.appendChild(zone);

  const input = zone.querySelector('input');
  const handleFiles = async (files) => {
    for (const file of Array.from(files)) {
      try {
        const result = await uploadImage('gallery', file);
        const newItem = {
          id:      Date.now().toString(),
          src:     result.url,
          size:    'square',
          caption: { vi: '', en: '' },
          order:   grid.children.length + 1,
        };
        grid.appendChild(makeGalleryAdminItem(newItem));
        toast(`Đã upload: ${result.filename}`);
      } catch (err) {
        toast('Lỗi upload: ' + err.message, 'error');
      }
    }
  };

  input.addEventListener('change', () => handleFiles(input.files));
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
}

function makeGalleryAdminItem(item) {
  const sizeOptions = ['big','tall','wide','square','small','medium'];
  const div = document.createElement('div');
  div.className = 'gallery-admin-item';
  div.dataset.id  = item.id;
  div.dataset.src = item.src;

  const thumbHtml = item.src
    ? `<img src="${esc(item.src)}" alt="" loading="lazy" />`
    : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:0.75rem;color:#aaa;">Chưa có ảnh</div>`;

  div.innerHTML = `
    <div class="gallery-admin-thumb">${thumbHtml}</div>
    <div class="gallery-admin-info">
      <select class="gallery-size">
        ${sizeOptions.map(s => `<option value="${s}" ${item.size===s?'selected':''}>${s}</option>`).join('')}
      </select>
      <input type="text" class="gallery-caption-vi" value="${esc(item.caption?.vi||'')}" placeholder="Caption VI" />
      <input type="text" class="gallery-caption-en" value="${esc(item.caption?.en||'')}" placeholder="Caption EN" />
    </div>
    <div class="gallery-admin-footer">
      <span style="font-size:0.75rem;color:#aaa;">⋮⋮ Kéo để sắp xếp</span>
      <button class="btn-icon delete" aria-label="Xóa ảnh">✕</button>
    </div>
  `;

  div.querySelector('.delete').addEventListener('click', async () => {
    const ok = await confirm('Xóa ảnh này? (file trên server sẽ không bị xóa)');
    if (ok) div.remove();
  });

  return div;
}

function collectGallery() {
  const items = [];
  document.querySelectorAll('#gallery-admin-grid .gallery-admin-item').forEach((item, idx) => {
    items.push({
      id:      item.dataset.id,
      src:     item.dataset.src,
      size:    item.querySelector('.gallery-size').value,
      caption: { vi: item.querySelector('.gallery-caption-vi').value, en: item.querySelector('.gallery-caption-en').value },
      order:   idx + 1,
    });
  });
  return items;
}

// ─────────────────────────────────────────────
// Section: Details
// ─────────────────────────────────────────────
function renderDetails(wrap) {
  const d = CONTENT.details || {};
  wrap.innerHTML = `<h1 class="panel-title">Details</h1><p class="panel-desc">Dress Code, Wishing Well, Dining Notes</p>`;

  const cardKeys = [
    { key: 'dressCode',   label: 'Dress Code',    hasSwatch: true },
    { key: 'wishingWell', label: 'Wishing Well',   hasSwatch: false },
    { key: 'diningNotes', label: 'Dining Notes',   hasSwatch: false },
  ];
  const flowers = ['rose','daisy','tulip','peony','lily'];

  cardKeys.forEach(({ key, label, hasSwatch }) => {
    const c = d[key] || {};
    const card = document.createElement('div');
    card.className = 'admin-card';
    card.dataset.key = key;

    card.innerHTML = `
      <p class="admin-card-title">${label}</p>
      <div class="form-row">
        <div class="form-group"><label>Title (VI)</label><input type="text" class="det-title-vi" value="${esc(c.title?.vi||'')}" /></div>
        <div class="form-group"><label>Title (EN)</label><input type="text" class="det-title-en" value="${esc(c.title?.en||'')}" /></div>
      </div>
      <div class="form-group">
        <label>Flower</label>
        <select class="det-flower">
          ${flowers.map(f => `<option value="${f}" ${c.flower===f?'selected':''}>${f}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label>Nội dung (VI)</label><textarea class="det-content-vi" rows="5">${esc(c.content?.vi||'')}</textarea></div>
      <div class="form-group"><label>Content (EN)</label><textarea class="det-content-en" rows="5">${esc(c.content?.en||'')}</textarea></div>
      ${hasSwatch ? `
        <div class="form-group">
          <label>Màu sắc (Swatches)</label>
          <div class="swatches-admin" id="swatches-${key}"></div>
          <div class="swatch-add-row">
            <input type="color" id="swatch-picker-${key}" value="#d4cfc0" />
            <button class="btn-secondary swatch-add-btn" data-key="${key}">+ Thêm màu</button>
          </div>
        </div>
      ` : ''}
    `;
    wrap.appendChild(card);

    if (hasSwatch) {
      const swatchesEl = card.querySelector(`#swatches-${key}`);
      (c.swatches || []).forEach(color => swatchesEl.appendChild(makeSwatchEl(color, swatchesEl)));

      card.querySelector(`.swatch-add-btn`).addEventListener('click', () => {
        const color = card.querySelector(`#swatch-picker-${key}`).value;
        swatchesEl.appendChild(makeSwatchEl(color, swatchesEl));
      });
    }
  });
}

function makeSwatchEl(color, container) {
  const span = document.createElement('span');
  span.className = 'swatch-admin';
  span.style.background = color;
  span.dataset.color = color;
  span.title = color;
  const removeBtn = document.createElement('span');
  removeBtn.className = 'swatch-remove';
  removeBtn.textContent = '✕';
  removeBtn.addEventListener('click', () => span.remove());
  span.appendChild(removeBtn);
  return span;
}

function collectDetails() {
  const result = {};
  document.querySelectorAll('.admin-card[data-key]').forEach(card => {
    const key = card.dataset.key;
    const swatches = [];
    card.querySelectorAll('.swatch-admin').forEach(s => swatches.push(s.dataset.color));

    result[key] = {
      title:   { vi: card.querySelector('.det-title-vi').value, en: card.querySelector('.det-title-en').value },
      flower:  card.querySelector('.det-flower').value,
      content: { vi: card.querySelector('.det-content-vi').value, en: card.querySelector('.det-content-en').value },
      ...(swatches.length ? { swatches } : {}),
    };
  });
  return result;
}

// ─────────────────────────────────────────────
// Section: Saigon Guide
// ─────────────────────────────────────────────
function renderSaigonGuide(wrap) {
  const g = CONTENT.saigonGuide || {};
  const tabs = [
    { key: 'stays',     label: '🏨 Lưu trú' },
    { key: 'eat',       label: '🍜 Ăn & Uống' },
    { key: 'explore',   label: '📸 Khám phá' },
    { key: 'transport', label: '✈️ Di chuyển' },
  ];

  const div = document.createElement('div');
  div.innerHTML = `
    <h1 class="panel-title">Saigon Guide</h1>
    <p class="panel-desc">Gợi ý cho khách về Sài Gòn</p>
    <div class="admin-card">
      <div class="admin-tabs" id="sg-admin-tabs">
        ${tabs.map((t, i) => `<button class="admin-tab-btn ${i===0?'active':''}" data-tab="${t.key}">${t.label}</button>`).join('')}
      </div>
      <div id="sg-tab-panels"></div>
    </div>
    <div class="admin-card">
      <p class="admin-card-title">Insider Tip</p>
      <div class="form-row">
        <div class="form-group"><label>VI</label><textarea id="sg-tip-vi" rows="3">${esc(g.tip?.vi||'')}</textarea></div>
        <div class="form-group"><label>EN</label><textarea id="sg-tip-en" rows="3">${esc(g.tip?.en||'')}</textarea></div>
      </div>
    </div>
  `;
  wrap.appendChild(div);

  const tabPanels = div.querySelector('#sg-tab-panels');
  tabs.forEach((t, i) => {
    const panel = document.createElement('div');
    panel.dataset.panel = t.key;
    panel.style.display = i === 0 ? 'block' : 'none';

    const list = document.createElement('div');
    list.id = `sg-list-${t.key}`;
    panel.appendChild(list);

    (g[t.key] || []).forEach(item => list.appendChild(makeSaigonCard(item, t.key)));

    const addBtn = document.createElement('button');
    addBtn.className = 'btn-add';
    addBtn.textContent = '+ Thêm địa điểm';
    addBtn.addEventListener('click', () => {
      list.appendChild(makeSaigonCard({ id: Date.now().toString(), tag:{vi:'',en:''}, name:'', desc:{vi:'',en:''}, area:{vi:'',en:''} }, t.key));
    });
    panel.appendChild(addBtn);
    tabPanels.appendChild(panel);
  });

  // Tab switching
  div.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      div.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tabPanels.querySelectorAll('[data-panel]').forEach(p => {
        p.style.display = p.dataset.panel === btn.dataset.tab ? 'block' : 'none';
      });
    });
  });
}

function makeSaigonCard(item, category) {
  const div = document.createElement('div');
  div.className = 'repeater-item';
  div.dataset.id       = item.id;
  div.dataset.category = category;
  div.innerHTML = `
    <span class="repeater-handle">⋮⋮</span>
    <div class="repeater-content">
      <div class="form-row">
        <div class="form-group"><label>Tag (VI)</label><input type="text" class="sg-tag-vi" value="${esc(item.tag?.vi||'')}" /></div>
        <div class="form-group"><label>Tag (EN)</label><input type="text" class="sg-tag-en" value="${esc(item.tag?.en||'')}" /></div>
      </div>
      <div class="form-group"><label>Tên địa điểm</label><input type="text" class="sg-name" value="${esc(item.name||'')}" /></div>
      <div class="form-row">
        <div class="form-group"><label>Mô tả (VI)</label><textarea class="sg-desc-vi" rows="2">${esc(item.desc?.vi||'')}</textarea></div>
        <div class="form-group"><label>Description (EN)</label><textarea class="sg-desc-en" rows="2">${esc(item.desc?.en||'')}</textarea></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Khu vực (VI)</label><input type="text" class="sg-area-vi" value="${esc(item.area?.vi||'')}" /></div>
        <div class="form-group"><label>Area (EN)</label><input type="text" class="sg-area-en" value="${esc(item.area?.en||'')}" /></div>
      </div>
    </div>
    <div class="repeater-actions">
      <button class="btn-icon delete" aria-label="Xóa">✕</button>
    </div>
  `;
  div.querySelector('.delete').addEventListener('click', async () => {
    const ok = await confirm('Xóa địa điểm này?');
    if (ok) div.remove();
  });
  return div;
}

function collectSaigonGuide() {
  const result = { tip: { vi: val('sg-tip-vi'), en: val('sg-tip-en') } };
  ['stays','eat','explore','transport'].forEach(key => {
    const list = [];
    document.querySelectorAll(`#sg-list-${key} .repeater-item`).forEach(item => {
      list.push({
        id:   item.dataset.id,
        tag:  { vi: item.querySelector('.sg-tag-vi').value, en: item.querySelector('.sg-tag-en').value },
        name: item.querySelector('.sg-name').value,
        desc: { vi: item.querySelector('.sg-desc-vi').value, en: item.querySelector('.sg-desc-en').value },
        area: { vi: item.querySelector('.sg-area-vi').value, en: item.querySelector('.sg-area-en').value },
      });
    });
    result[key] = list;
  });
  return result;
}

// ─────────────────────────────────────────────
// Section: RSVP
// ─────────────────────────────────────────────
async function renderRsvp(wrap) {
  wrap.innerHTML = `
    <h1 class="panel-title">Danh sách RSVP</h1>
    <p class="panel-desc">Khách đã xác nhận tham dự</p>
    <div id="rsvp-stats" class="rsvp-stats"></div>
    <div class="admin-card">
      <div class="rsvp-toolbar">
        <input type="text" id="rsvp-search" placeholder="🔍 Tìm theo tên, SĐT..." />
        <select id="rsvp-filter">
          <option value="">Tất cả</option>
          <option value="yes">Tham dự</option>
          <option value="no">Vắng mặt</option>
        </select>
        <a href="/api/rsvp/export" download class="btn-secondary" id="rsvp-export"
           onclick="this.href='/api/rsvp/export'; return true;"
           style="padding:9px 20px;border:1.5px solid #d1d5db;border-radius:6px;font-size:.875rem;color:#374151;text-decoration:none;display:inline-flex;align-items:center;">
          📥 Xuất CSV
        </a>
      </div>
      <div class="rsvp-table-wrap">
        <table class="rsvp-table" id="rsvp-table">
          <thead><tr>
            <th>STT</th><th>Tên</th><th>SĐT</th><th>Tham dự</th>
            <th>Khách</th><th>Sự kiện</th><th>Thời gian</th><th></th>
          </tr></thead>
          <tbody id="rsvp-tbody">
            <tr><td colspan="8" style="text-align:center;padding:30px;color:#aaa">Đang tải...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Export link with token
  const exportLink = wrap.querySelector('#rsvp-export');
  exportLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = `/api/rsvp/export?token=${TOKEN}`;
  });

  // Override the export to use header auth
  exportLink.href = '#';

  try {
    RSVP_DATA = await api('GET', '/api/rsvp');
    renderRsvpTable(RSVP_DATA, wrap);
    renderRsvpStats(RSVP_DATA, wrap);
  } catch (err) {
    wrap.querySelector('#rsvp-tbody').innerHTML = `<tr><td colspan="8" style="text-align:center;color:#dc2626">Lỗi tải: ${esc(err.message)}</td></tr>`;
  }

  wrap.querySelector('#rsvp-search').addEventListener('input', () => filterRsvp(wrap));
  wrap.querySelector('#rsvp-filter').addEventListener('change', () => filterRsvp(wrap));
}

function filterRsvp(wrap) {
  const search = wrap.querySelector('#rsvp-search').value.toLowerCase();
  const filter = wrap.querySelector('#rsvp-filter').value;
  const filtered = RSVP_DATA.filter(r => {
    const matchSearch = !search || r.name.toLowerCase().includes(search) || (r.phone || '').includes(search);
    const matchFilter = !filter || r.attend === filter;
    return matchSearch && matchFilter;
  });
  renderRsvpTable(filtered, wrap);
}

function renderRsvpStats(data, wrap) {
  const total    = data.length;
  const yes      = data.filter(r => r.attend === 'yes').length;
  const no       = data.filter(r => r.attend === 'no').length;
  const guests   = data.filter(r => r.attend === 'yes').reduce((s, r) => s + (r.guests || 1), 0);

  const stats = wrap.querySelector('#rsvp-stats');
  stats.innerHTML = [
    { label: 'Tổng RSVP',            num: total  },
    { label: 'Xác nhận tham dự',     num: yes    },
    { label: 'Vắng mặt',             num: no     },
    { label: 'Tổng khách dự kiến',   num: guests },
  ].map(s => `
    <div class="stat-card">
      <div class="stat-num">${s.num}</div>
      <div class="stat-label">${s.label}</div>
    </div>
  `).join('');
}

function renderRsvpTable(data, wrap) {
  const tbody = wrap.querySelector('#rsvp-tbody');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:#aaa">Chưa có RSVP nào</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((r, i) => `
    <tr data-id="${esc(r.id)}">
      <td>${i+1}</td>
      <td><strong>${esc(r.name)}</strong></td>
      <td>${esc(r.phone || '—')}</td>
      <td><span class="badge ${r.attend}">${r.attend === 'yes' ? '✓ Có' : '✕ Không'}</span></td>
      <td>${r.guests || 1}</td>
      <td>${esc(r.event || '—')}</td>
      <td style="font-size:.75rem;color:#888">${new Date(r.createdAt).toLocaleDateString('vi-VN')}</td>
      <td><button class="btn-icon delete rsvp-del" data-id="${esc(r.id)}" aria-label="Xóa RSVP">✕</button></td>
    </tr>
  `).join('');

  // Row click → detail modal
  tbody.querySelectorAll('tr[data-id]').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.classList.contains('rsvp-del')) return;
      const id = row.dataset.id;
      const r  = RSVP_DATA.find(x => x.id === id);
      if (r) showRsvpDetail(r, wrap);
    });
  });

  // Delete buttons
  tbody.querySelectorAll('.rsvp-del').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const ok = await confirm('Xóa RSVP này?');
      if (!ok) return;
      try {
        await api('DELETE', `/api/rsvp/${btn.dataset.id}`);
        RSVP_DATA = RSVP_DATA.filter(r => r.id !== btn.dataset.id);
        renderRsvpTable(RSVP_DATA, wrap);
        renderRsvpStats(RSVP_DATA, wrap);
        toast('Đã xóa RSVP');
      } catch (err) {
        toast('Lỗi xóa: ' + err.message, 'error');
      }
    });
  });
}

function showRsvpDetail(r, wrap) {
  // Remove existing
  wrap.querySelector('.rsvp-detail-modal')?.remove();

  const modal = document.createElement('div');
  modal.className = 'rsvp-detail-modal';
  modal.innerHTML = `
    <div class="rsvp-detail-backdrop"></div>
    <div class="rsvp-detail-box">
      <h3 class="rsvp-detail-title">${esc(r.name)}</h3>
      <div class="detail-row"><span class="detail-row-label">SĐT</span><span class="detail-row-value">${esc(r.phone||'—')}</span></div>
      <div class="detail-row"><span class="detail-row-label">Tham dự</span><span class="detail-row-value"><span class="badge ${r.attend}">${r.attend==='yes'?'Có':'Không'}</span></span></div>
      <div class="detail-row"><span class="detail-row-label">Số khách</span><span class="detail-row-value">${r.guests||1}</span></div>
      <div class="detail-row"><span class="detail-row-label">Sự kiện</span><span class="detail-row-value">${esc(r.event||'—')}</span></div>
      <div class="detail-row"><span class="detail-row-label">Lời nhắn</span><span class="detail-row-value">${esc(r.message||'—')}</span></div>
      <div class="detail-row"><span class="detail-row-label">Thời gian</span><span class="detail-row-value">${new Date(r.createdAt).toLocaleString('vi-VN')}</span></div>
      <div style="margin-top:20px;text-align:right">
        <button class="btn-secondary close-detail">Đóng</button>
      </div>
    </div>
  `;
  wrap.appendChild(modal);
  modal.querySelector('.close-detail').addEventListener('click', () => modal.remove());
  modal.querySelector('.rsvp-detail-backdrop').addEventListener('click', () => modal.remove());
}

// ─────────────────────────────────────────────
// Section: Change Password
// ─────────────────────────────────────────────
function renderPassword(wrap) {
  wrap.innerHTML = `
    <h1 class="panel-title">Đổi mật khẩu</h1>
    <p class="panel-desc">Đổi mật khẩu admin của bạn</p>
    <div class="admin-card" style="max-width:480px">
      <div class="form-group">
        <label>Mật khẩu cũ</label>
        <input type="password" id="pw-old" autocomplete="current-password" />
      </div>
      <div class="form-group">
        <label>Mật khẩu mới (tối thiểu 8 ký tự)</label>
        <input type="password" id="pw-new" autocomplete="new-password" />
      </div>
      <div class="form-group">
        <label>Xác nhận mật khẩu mới</label>
        <input type="password" id="pw-confirm" autocomplete="new-password" />
      </div>
      <p id="pw-error" style="color:#dc2626;font-size:.85rem;margin-bottom:12px;display:none"></p>
      <button class="btn-primary" id="pw-save">Đổi mật khẩu</button>
    </div>
  `;

  wrap.querySelector('#pw-save').addEventListener('click', async () => {
    const oldPw = val('pw-old');
    const newPw = val('pw-new');
    const conf  = val('pw-confirm');
    const errEl = wrap.querySelector('#pw-error');
    errEl.style.display = 'none';

    if (!oldPw || !newPw) { errEl.textContent = 'Vui lòng điền đầy đủ'; errEl.style.display = 'block'; return; }
    if (newPw.length < 8) { errEl.textContent = 'Mật khẩu mới tối thiểu 8 ký tự'; errEl.style.display = 'block'; return; }
    if (newPw !== conf)   { errEl.textContent = 'Mật khẩu xác nhận không khớp'; errEl.style.display = 'block'; return; }

    const btn = wrap.querySelector('#pw-save');
    btn.disabled = true;
    try {
      await api('POST', '/api/change-password', { oldPassword: oldPw, newPassword: newPw });
      toast('Đổi mật khẩu thành công!');
      wrap.querySelector('#pw-old').value    = '';
      wrap.querySelector('#pw-new').value    = '';
      wrap.querySelector('#pw-confirm').value = '';
    } catch (err) {
      errEl.textContent = err.message;
      errEl.style.display = 'block';
    } finally {
      btn.disabled = false;
    }
  });
}

// ─────────────────────────────────────────────
// Drag-to-reorder (simple)
// ─────────────────────────────────────────────
function initDragReorder(container) {
  container.addEventListener('dragstart', (e) => {
    const item = e.target.closest('.repeater-item');
    if (item) {
      DRAG_SRC = item;
      item.style.opacity = '0.5';
    }
  });
  container.addEventListener('dragend', () => {
    if (DRAG_SRC) { DRAG_SRC.style.opacity = ''; DRAG_SRC = null; }
  });
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    const item = e.target.closest('.repeater-item');
    if (item && DRAG_SRC && item !== DRAG_SRC) {
      const rect = item.getBoundingClientRect();
      const after = e.clientY > rect.top + rect.height / 2;
      container.insertBefore(DRAG_SRC, after ? item.nextSibling : item);
    }
  });
}

// ─────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

// ─────────────────────────────────────────────
// Init
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initSidebar();

  // Check existing token
  if (TOKEN) {
    // Quick verify by loading content
    api('GET', '/api/content')
      .then(data => {
        CONTENT = data;
        showAdmin();
      })
      .catch(() => showLogin());
  }
});
