'use strict';

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
let CONTENT    = null;
let LANG       = localStorage.getItem('lang') || 'vi';
let galleryItems = [];
let lightboxIndex = 0;

// ─────────────────────────────────────────────
// Language
// ─────────────────────────────────────────────
function setLang(lang) {
  LANG = lang;
  localStorage.setItem('lang', lang);
  if (lang === 'en') {
    document.body.classList.add('en');
  } else {
    document.body.classList.remove('en');
  }
}

function t(obj) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return (LANG === 'en' ? obj.en : obj.vi) || obj.vi || obj.en || '';
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, '0'); }

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const months = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
  const monthsEn = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
  if (LANG === 'en') {
    const ord = d.getDate();
    return `${ord} ${monthsEn[d.getMonth()]} ${d.getFullYear()}`;
  }
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ─────────────────────────────────────────────
// Fetch content from API
// ─────────────────────────────────────────────
async function loadContent() {
  try {
    const res = await fetch('/api/content');
    if (!res.ok) throw new Error('API error');
    CONTENT = await res.json();
  } catch {
    CONTENT = null;
  }
  render();
}

// ─────────────────────────────────────────────
// Render all sections
// ─────────────────────────────────────────────
function render() {
  if (!CONTENT) return;
  renderHero();
  renderStory();
  renderCouple();
  renderSchedule();
  renderGallery();
  renderDetails();
  renderSaigonGuide();
  renderLocation();
}

// Hero
function renderHero() {
  const h = CONTENT.hero;
  if (!h) return;

  if (h.image) {
    document.getElementById('heroBg').style.backgroundImage = `url(${h.image})`;
  }

  // Date text
  const dateVi = document.querySelector('#heroDate [data-vi]');
  const dateEn = document.querySelector('#heroDate [data-en]');
  if (dateVi && h.dateText) dateVi.textContent = h.dateText.vi || dateVi.textContent;
  if (dateEn && h.dateText) dateEn.textContent = h.dateText.en || dateEn.textContent;

  // Venue text
  const venueVi = document.querySelector('#heroVenue [data-vi]');
  const venueEn = document.querySelector('#heroVenue [data-en]');
  if (venueVi && h.venueText) venueVi.textContent = h.venueText.vi || venueVi.textContent;
  if (venueEn && h.venueText) venueEn.textContent = h.venueText.en || venueEn.textContent;

  // Hashtag
  const ht = document.querySelector('.hero-hashtag');
  if (ht && h.hashtag) ht.textContent = h.hashtag;
}

// Story
function renderStory() {
  const s = CONTENT.story;
  if (!s) return;

  // Subtitle
  const subVi = document.querySelector('#storySubtitle [data-vi]');
  const subEn = document.querySelector('#storySubtitle [data-en]');
  if (subVi && s.subtitle) subVi.textContent = s.subtitle.vi;
  if (subEn && s.subtitle) subEn.textContent = s.subtitle.en;

  // Paragraphs
  const container = document.getElementById('storyParagraphs');
  if (container && s.paragraphs) {
    container.innerHTML = s.paragraphs.map(p => `
      <p><span data-vi>${escHtml(p.vi)}</span><span data-en class="hidden">${escHtml(p.en)}</span></p>
    `).join('');
    applyLang();
  }

  // Image
  const frame = document.getElementById('storyImageFrame');
  if (frame && s.image) {
    const img = document.createElement('img');
    img.src = s.image;
    img.alt = 'Our Love Story';
    img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
    const placeholder = frame.querySelector('.story-image-placeholder');
    if (placeholder) placeholder.remove();
    frame.insertBefore(img, frame.firstChild);
  }
}

// Couple
function renderCouple() {
  const c = CONTENT.couple;
  if (!c) return;

  const grid = document.getElementById('coupleGrid');
  if (!grid) return;

  const people = [c.groom, c.bride];
  grid.innerHTML = people.map((p, i) => {
    const portraitHtml = p.portrait
      ? `<img src="${p.portrait}" alt="${escHtml(p.name)}" loading="lazy" />`
      : `<div class="couple-portrait-placeholder">${p.name.charAt(0)}</div>`;

    return `
      <div class="couple-card">
        <div class="couple-portrait">${portraitHtml}</div>
        <h3 class="couple-name">${escHtml(p.name)}</h3>
        <p class="couple-role">
          <span data-vi>${escHtml(p.role?.vi || '')}</span>
          <span data-en class="hidden">${escHtml(p.role?.en || '')}</span>
        </p>
        <p class="couple-desc">
          <span data-vi>${escHtml(p.desc?.vi || '')}</span>
          <span data-en class="hidden">${escHtml(p.desc?.en || '')}</span>
        </p>
      </div>
    `;
  }).join('');

  applyLang();
}

// Location
function renderLocation() {
  const loc = CONTENT.location;
  if (!loc) return;

  const venuesEl = document.getElementById('locationVenues');
  const noteEl   = document.getElementById('locationNote');
  if (!venuesEl || !noteEl) return;

  const venues = loc.venues || [];
  venuesEl.innerHTML = venues.map(v => {
    const imgHtml = v.image
      ? `<div class="loc-img-wrap"><img src="${escHtml(v.image)}" alt="${escHtml(v.name)}" loading="lazy" /></div>`
      : `<div class="loc-img-wrap loc-img-placeholder"></div>`;
    const mapLink = v.mapUrl
      ? `<a class="loc-map-link" href="${escHtml(v.mapUrl)}" target="_blank" rel="noopener">
           <span data-vi>Xem bản đồ</span><span data-en class="hidden">View on map</span>
         </a>`
      : '';
    return `
      <div class="loc-venue">
        ${imgHtml}
        <h3 class="loc-name">${escHtml(v.name)}</h3>
        <p class="loc-address">
          <span data-vi>${escHtml(v.address?.vi || '')}</span>
          <span data-en class="hidden">${escHtml(v.address?.en || '')}</span>
        </p>
        ${mapLink}
      </div>
    `;
  }).join('');

  if (loc.note) {
    noteEl.innerHTML = `
      <p class="loc-note-text">
        <span data-vi>${escHtml(loc.note.vi || '')}</span>
        <span data-en class="hidden">${escHtml(loc.note.en || '')}</span>
      </p>
    `;
  }

  applyLang();
}

// Schedule
function renderSchedule() {
  const s = CONTENT.schedule;
  if (!s) return;

  // Date heading
  const dhVi = document.querySelector('#scheduleDateHeading [data-vi]');
  const dhEn = document.querySelector('#scheduleDateHeading [data-en]');
  if (dhVi && s.dateHeading) dhVi.textContent = s.dateHeading.vi;
  if (dhEn && s.dateHeading) dhEn.textContent = s.dateHeading.en;

  // Timeline
  const timeline = document.getElementById('timeline');
  if (timeline && s.items) {
    timeline.innerHTML = s.items.map(item => `
      <div class="timeline-item">
        <span class="timeline-time">${escHtml(item.time)}</span>
        <span class="timeline-event">
          <span data-vi>${escHtml(item.event?.vi || '')}</span>
          <span data-en class="hidden">${escHtml(item.event?.en || '')}</span>
        </span>
      </div>
    `).join('');
    applyLang();
  }

  // Image
  if (s.image) {
    const frame = document.getElementById('scheduleImageFrame');
    if (frame) {
      const img = document.createElement('img');
      img.src = s.image;
      img.alt = t(s.imageLabel) || 'Wedding Venue';
      img.loading = 'lazy';
      frame.innerHTML = '';
      frame.appendChild(img);
      frame.style.filter = 'grayscale(100%)';
    }
  }

  // Label
  const labelVi = document.querySelector('#scheduleImageLabel [data-vi]');
  const labelEn = document.querySelector('#scheduleImageLabel [data-en]');
  if (labelVi && s.imageLabel) labelVi.textContent = s.imageLabel.vi;
  if (labelEn && s.imageLabel) labelEn.textContent = s.imageLabel.en;
}

// Gallery
function renderGallery() {
  const items = CONTENT.gallery;
  const grid  = document.getElementById('galleryGrid');
  if (!grid) return;

  const sorted = (items || []).filter(i => i.src).sort((a, b) => (a.order || 0) - (b.order || 0));
  galleryItems = sorted;

  if (!sorted.length) {
    grid.innerHTML = `<p class="gallery-empty">Ảnh sẽ được thêm sớm · Photos coming soon</p>`;
    return;
  }

  grid.innerHTML = sorted.map((item, idx) => `
    <div class="gallery-item ${item.size || 'square'}"
         role="listitem"
         tabindex="0"
         aria-label="Photo ${idx + 1}: ${escHtml(t(item.caption))}"
         data-index="${idx}">
      <div class="gallery-item-inner">
        <img src="${item.src}" alt="${escHtml(t(item.caption))}" loading="lazy" />
        <span class="gallery-zoom" aria-hidden="true">+</span>
        <div class="gallery-caption">
          <span class="gallery-num">${pad(idx+1)} / ${pad(sorted.length)}</span>
          <span class="gallery-desc">${escHtml(t(item.caption))}</span>
        </div>
      </div>
    </div>
  `).join('');

  // Click / keyboard events
  grid.querySelectorAll('.gallery-item').forEach(el => {
    el.addEventListener('click', () => openLightbox(parseInt(el.dataset.index)));
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(parseInt(el.dataset.index));
      }
    });
  });
}

// Details
function renderDetails() {
  const d = CONTENT.details;
  const grid = document.getElementById('detailsGrid');
  if (!grid || !d) return;

  const cards = [d.dressCode, d.wishingWell, d.diningNotes];
  grid.innerHTML = cards.map(card => {
    if (!card) return '';

    const flowerSvg = getFlowerSvg(card.flower || 'rose');
    const swatchesHtml = card.swatches
      ? `<div class="dress-swatches">${card.swatches.map(c =>
          `<span class="swatch" style="background:${escHtml(c)};" title="${escHtml(c)}" aria-label="Color ${escHtml(c)}"></span>`
        ).join('')}</div>`
      : '';

    const contentHtml = (card.content?.vi || '').split('\n\n').map((para, i) => {
      const paraVi = para;
      const allParasEn = (card.content?.en || '').split('\n\n');
      const paraEn = allParasEn[i] || '';
      return `<p><span data-vi>${escHtml(paraVi)}</span><span data-en class="hidden">${escHtml(paraEn)}</span></p>`;
    }).join('');

    return `
      <div class="detail-card">
        <div class="detail-flower" aria-hidden="true">${flowerSvg}</div>
        <h3 class="detail-title">
          <span data-vi>${escHtml(card.title?.vi || '')}</span>
          <span data-en class="hidden">${escHtml(card.title?.en || '')}</span>
        </h3>
        <div class="detail-content">${contentHtml}</div>
        ${swatchesHtml}
      </div>
    `;
  }).join('');

  applyLang();
}

// Saigon Guide
function renderSaigonGuide() {
  const g = CONTENT.saigonGuide;
  if (!g) return;

  const tabPanels = document.getElementById('tabPanels');
  if (!tabPanels) return;

  const tabKeys = ['stays', 'eat', 'explore', 'transport'];

  tabPanels.innerHTML = tabKeys.map((key, i) => {
    const cards = (g[key] || []).map((c, idx) => `
      <div class="guide-card">
        <div class="guide-num">${pad(idx+1)}</div>
        <p class="guide-tag">
          <span data-vi>${escHtml(c.tag?.vi || c.tag || '')}</span>
          <span data-en class="hidden">${escHtml(c.tag?.en || c.tag || '')}</span>
        </p>
        <h3 class="guide-name">${escHtml(c.name)}</h3>
        <p class="guide-desc">
          <span data-vi>${escHtml(c.desc?.vi || c.desc || '')}</span>
          <span data-en class="hidden">${escHtml(c.desc?.en || c.desc || '')}</span>
        </p>
        <p class="guide-footer">
          <span data-vi>${escHtml(c.area?.vi || c.area || '')}</span>
          <span data-en class="hidden">${escHtml(c.area?.en || c.area || '')}</span>
        </p>
      </div>
    `).join('');

    return `
      <div class="tab-panel ${i === 0 ? 'active' : ''}" data-panel="${key}" role="tabpanel">
        <div class="guide-grid">${cards}</div>
      </div>
    `;
  }).join('');

  // Insider tip
  const tip = document.getElementById('insiderTip');
  if (tip && g.tip) {
    tip.innerHTML = `
      <span data-vi>${escHtml(g.tip.vi || '')}</span>
      <span data-en class="hidden">${escHtml(g.tip.en || '')}</span>
    `;
  }

  applyLang();
}

// ─────────────────────────────────────────────
// Countdown
// ─────────────────────────────────────────────
function updateCountdown() {
  const target = CONTENT?.general?.weddingDate
    ? new Date(CONTENT.general.weddingDate)
    : new Date('2026-11-15T18:00:00+07:00');

  const now  = new Date();
  const diff = target - now;

  if (diff <= 0) {
    document.getElementById('cd-days').textContent    = '00';
    document.getElementById('cd-hours').textContent   = '00';
    document.getElementById('cd-minutes').textContent = '00';
    document.getElementById('cd-seconds').textContent = '00';
    return;
  }

  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  document.getElementById('cd-days').textContent    = pad(days);
  document.getElementById('cd-hours').textContent   = pad(hours);
  document.getElementById('cd-minutes').textContent = pad(minutes);
  document.getElementById('cd-seconds').textContent = pad(seconds);
}

// ─────────────────────────────────────────────
// Lightbox
// ─────────────────────────────────────────────
function openLightbox(index) {
  lightboxIndex = index;
  const lb = document.getElementById('lightbox');
  lb.hidden = false;
  lb.focus();
  showLightboxItem(index);
}

function showLightboxItem(index) {
  lightboxIndex = index;
  const item = galleryItems[index];
  if (!item) return;

  const img = document.getElementById('lightboxImg');
  img.src = item.src;
  img.alt = t(item.caption) || '';

  document.getElementById('lightboxCaption').textContent = t(item.caption) || '';
  document.getElementById('lightboxCounter').textContent =
    `${pad(index+1)} / ${pad(galleryItems.length)}`;
}

function closeLightbox() {
  document.getElementById('lightbox').hidden = true;
}

// ─────────────────────────────────────────────
// Apply language to dynamically injected content
// ─────────────────────────────────────────────
function applyLang() {
  const isEn = document.body.classList.contains('en');
  document.querySelectorAll('[data-vi]').forEach(el => {
    el.classList.toggle('hidden', isEn);
  });
  document.querySelectorAll('[data-en]').forEach(el => {
    el.classList.toggle('hidden', !isEn);
  });
}

// ─────────────────────────────────────────────
// Scroll reveal (IntersectionObserver)
// ─────────────────────────────────────────────
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.section-reveal').forEach(el => obs.observe(el));
}

// ─────────────────────────────────────────────
// Navbar scroll + mobile menu
// ─────────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });

  // Close on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ─────────────────────────────────────────────
// Saigon Guide tabs
// ─────────────────────────────────────────────
function initTabs() {
  const tabBtns   = document.querySelectorAll('#saigonTabs .tab-btn');
  const tabPanels = document.getElementById('tabPanels');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      if (tabPanels) {
        tabPanels.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        const panel = tabPanels.querySelector(`[data-panel="${btn.dataset.tab}"]`);
        if (panel) panel.classList.add('active');
      }
    });
  });
}

// ─────────────────────────────────────────────
// RSVP Form
// ─────────────────────────────────────────────
function initRsvp() {
  const form    = document.getElementById('rsvpForm');
  const success = document.getElementById('rsvpSuccess');
  const btn     = document.getElementById('rsvpSubmit');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = form.querySelector('#rsvpName').value.trim();
    const attend  = form.querySelector('input[name="attend"]:checked')?.value;

    if (!name)   return highlightError(form.querySelector('#rsvpName'), 'Vui lòng nhập tên');
    if (!attend) return showAlert('Vui lòng chọn xác nhận tham dự');

    const data = {
      name,
      phone:   form.querySelector('#rsvpPhone').value.trim(),
      attend,
      guests:  form.querySelector('#rsvpGuests').value,
      event:   form.querySelector('#rsvpEvent').value,
      message: form.querySelector('#rsvpMessage').value.trim(),
    };

    btn.disabled = true;
    btn.innerHTML = '<span style="opacity:.6">Đang gửi...</span>';

    try {
      const res = await fetch('/api/rsvp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Lỗi gửi form');

      form.style.display = 'none';
      success.hidden = false;
      applyLang();
    } catch (err) {
      btn.disabled = false;
      btn.innerHTML = '<span data-vi>Gửi xác nhận</span><span data-en class="hidden">Send RSVP</span>';
      applyLang();
      showAlert(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  });
}

function highlightError(el, msg) {
  el.style.borderColor = '#dc2626';
  el.focus();
  el.addEventListener('input', () => { el.style.borderColor = ''; }, { once: true });
  if (msg) showAlert(msg);
}

function showAlert(msg) {
  alert(msg);
}

// ─────────────────────────────────────────────
// Language toggle
// ─────────────────────────────────────────────
function initLangToggle() {
  const btn = document.getElementById('langToggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const newLang = LANG === 'vi' ? 'en' : 'vi';
    setLang(newLang);
    applyLang();
    if (CONTENT) render(); // re-render dynamic sections with new lang
  });
}

// ─────────────────────────────────────────────
// Lightbox events
// ─────────────────────────────────────────────
function initLightbox() {
  const lb       = document.getElementById('lightbox');
  const prevBtn  = document.getElementById('lightboxPrev');
  const nextBtn  = document.getElementById('lightboxNext');
  const closeBtn = document.getElementById('lightboxClose');
  const backdrop = document.getElementById('lightboxBackdrop');

  if (!lb) return;

  closeBtn.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', closeLightbox);

  prevBtn.addEventListener('click', () => {
    lightboxIndex = (lightboxIndex - 1 + galleryItems.length) % galleryItems.length;
    showLightboxItem(lightboxIndex);
  });
  nextBtn.addEventListener('click', () => {
    lightboxIndex = (lightboxIndex + 1) % galleryItems.length;
    showLightboxItem(lightboxIndex);
  });

  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   { lightboxIndex = (lightboxIndex - 1 + galleryItems.length) % galleryItems.length; showLightboxItem(lightboxIndex); }
    if (e.key === 'ArrowRight')  { lightboxIndex = (lightboxIndex + 1) % galleryItems.length; showLightboxItem(lightboxIndex); }
  });
}

// ─────────────────────────────────────────────
// Flower SVGs
// ─────────────────────────────────────────────
function getFlowerSvg(type) {
  const svgs = {
    rose: `<svg class="flower-svg" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="90" cy="90" r="12" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="90" cy="60" rx="14" ry="24" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="90" cy="120" rx="14" ry="24" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="60" cy="90" rx="24" ry="14" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="120" cy="90" rx="24" ry="14" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="70" cy="70" rx="14" ry="22" transform="rotate(-45 70 70)" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="110" cy="70" rx="14" ry="22" transform="rotate(45 110 70)" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="70" cy="110" rx="14" ry="22" transform="rotate(45 70 110)" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="110" cy="110" rx="14" ry="22" transform="rotate(-45 110 110)" stroke="currentColor" stroke-width="1.5"/>
      <line x1="90" y1="140" x2="90" y2="168" stroke="currentColor" stroke-width="1.5"/>
      <path d="M90 155 Q76 145 68 148" stroke="currentColor" stroke-width="1.5" fill="none"/>
    </svg>`,

    daisy: `<svg class="flower-svg" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="90" cy="90" r="16" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="90" cy="52" rx="9" ry="28" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="90" cy="128" rx="9" ry="28" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="52" cy="90" rx="28" ry="9" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="128" cy="90" rx="28" ry="9" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="63" cy="63" rx="9" ry="28" transform="rotate(-45 63 63)" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="117" cy="63" rx="9" ry="28" transform="rotate(45 117 63)" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="63" cy="117" rx="9" ry="28" transform="rotate(45 63 117)" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="117" cy="117" rx="9" ry="28" transform="rotate(-45 117 117)" stroke="currentColor" stroke-width="1.5"/>
      <line x1="90" y1="142" x2="90" y2="168" stroke="currentColor" stroke-width="1.5"/>
    </svg>`,

    tulip: `<svg class="flower-svg" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M90 100 C68 100 52 80 55 58 C58 42 72 28 90 26 C108 28 122 42 125 58 C128 80 112 100 90 100Z"
            stroke="currentColor" stroke-width="1.5"/>
      <path d="M75 85 C60 72 56 50 64 36" stroke="currentColor" stroke-width="1.5"/>
      <path d="M105 85 C120 72 124 50 116 36" stroke="currentColor" stroke-width="1.5"/>
      <line x1="90" y1="100" x2="90" y2="160" stroke="currentColor" stroke-width="1.5"/>
      <path d="M90 130 Q72 122 66 112" stroke="currentColor" stroke-width="1.5" fill="none"/>
      <path d="M90 145 Q108 137 114 127" stroke="currentColor" stroke-width="1.5" fill="none"/>
    </svg>`,

    peony: `<svg class="flower-svg" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="90" cy="90" r="18" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="90" cy="55" rx="12" ry="26" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="90" cy="125" rx="12" ry="26" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="55" cy="90" rx="26" ry="12" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="125" cy="90" rx="26" ry="12" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="64" cy="64" rx="12" ry="26" transform="rotate(-45 64 64)" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="116" cy="64" rx="12" ry="26" transform="rotate(45 116 64)" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="64" cy="116" rx="12" ry="26" transform="rotate(45 64 116)" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="116" cy="116" rx="12" ry="26" transform="rotate(-45 116 116)" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="90" cy="72" rx="8" ry="14" stroke="currentColor" stroke-width="1"/>
      <ellipse cx="90" cy="108" rx="8" ry="14" stroke="currentColor" stroke-width="1"/>
      <ellipse cx="72" cy="90" rx="14" ry="8" stroke="currentColor" stroke-width="1"/>
      <ellipse cx="108" cy="90" rx="14" ry="8" stroke="currentColor" stroke-width="1"/>
      <line x1="90" y1="142" x2="90" y2="168" stroke="currentColor" stroke-width="1.5"/>
    </svg>`,

    lily: `<svg class="flower-svg" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M90 95 C80 75 72 50 78 34 C82 22 90 18 90 18 C90 18 98 22 102 34 C108 50 100 75 90 95Z"
            stroke="currentColor" stroke-width="1.5"/>
      <path d="M90 95 C105 78 128 68 142 74 C152 78 155 86 155 86 C155 86 151 94 142 96 C128 100 105 91 90 95Z"
            stroke="currentColor" stroke-width="1.5"/>
      <path d="M90 95 C105 112 112 136 106 150 C102 160 95 162 95 162 C95 162 87 160 84 150 C78 136 82 112 90 95Z"
            stroke="currentColor" stroke-width="1.5"/>
      <path d="M90 95 C75 112 52 120 38 114 C28 110 26 102 26 102 C26 102 29 94 38 92 C52 88 75 96 90 95Z"
            stroke="currentColor" stroke-width="1.5"/>
      <path d="M90 95 C73 80 62 56 68 42 C72 32 80 29 80 29" stroke="currentColor" stroke-width="1.5"/>
      <path d="M90 95 C107 80 124 70 136 78" stroke="currentColor" stroke-width="1.5"/>
    </svg>`,
  };

  return svgs[type] || svgs.rose;
}

// ─────────────────────────────────────────────
// Escape HTML
// ─────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─────────────────────────────────────────────
// Init
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Set initial language
  setLang(LANG);

  initNavbar();
  initLangToggle();
  initTabs();
  initLightbox();
  initRsvp();
  initScrollReveal();

  // Countdown tick
  setInterval(updateCountdown, 1000);
  updateCountdown();

  // Load content
  loadContent();
});
