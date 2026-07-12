/* =================================================
   LyLy Shop — script.js
   Features:
   - GSAP scroll reveal animations
   - Sticky nav on scroll
   - Mobile burger menu
   - Facebook Graph API: 3 latest posts + 3 latest videos
   - Fallback content when FB API not configured
   - Floating chat widget toggle
   - Back to top button
   - Form submit handler
   ================================================= */

// ─── CONFIG ─────────────────────────────────────────
// TO CONFIGURE: Replace with your actual Facebook Page details
// 1. Go to https://developers.facebook.com/ → create app
// 2. Get a Page Access Token with pages_read_engagement permission
// 3. Replace values below
const FB_CONFIG = {
  pageId: '1163715929103697',        // e.g. '123456789'
  accessToken: 'YOUR_PAGE_ACCESS_TOKEN', // long-lived page access token
  postsLimit: 3,
  videosLimit: 3,
};

// Fallback data shown when Facebook API is not configured or fails
const FALLBACK_NEWS = [
  {
    title: 'Đồ Bộ Mặc Nhà 2025: Minimalism Lên Ngôi',
    excerpt: 'Phong cách tối giản đang dẫn đầu xu hướng thời trang nhà năm nay với các gam màu trung tính và chất liệu tự nhiên...',
    date: '10 Tháng 7, 2025',
    category: 'Xu Hướng',
    img: 'hero.png',
    url: 'https://www.facebook.com/dobolylyshop',
  },
  {
    title: '5 Tips Chọn Đồ Bộ Mặc Nhà Hoàn Hảo',
    excerpt: 'Không phải ai cũng biết cách chọn đồ nhà vừa đẹp vừa thoải mái. Hãy cùng LyLy Shop khám phá bí quyết...',
    date: '5 Tháng 7, 2025',
    category: 'Bí Quyết',
    img: 'lifestyle.png',
    url: 'https://www.facebook.com/dobolylyshop',
  },
  {
    title: 'Ra Mắt BST Thu Đông 2025 — Ấm Áp & Thanh Lịch',
    excerpt: 'Bộ sưu tập mới với chất liệu flannel cao cấp, giữ ấm tốt trong những ngày se lạnh mà vẫn đẹp...',
    date: '1 Tháng 7, 2025',
    category: 'Bộ Sưu Tập',
    img: 'products.png',
    url: 'https://www.facebook.com/dobolylyshop',
  },
];

const FALLBACK_VIDEOS = [
  {
    title: 'Review Bộ Hồng Phấn — Mặc Cực Thoải Mái!',
    date: '8 Tháng 7, 2025',
    duration: '1:24',
    thumbnail: 'lifestyle.png',
    url: 'https://www.facebook.com/reel/1718402149208918',
  },
  {
    title: 'Hậu Trường Sản Xuất — Từ Vải Đến Sản Phẩm',
    date: '3 Tháng 7, 2025',
    duration: '2:10',
    thumbnail: 'hero.png',
    url: 'https://www.facebook.com/reel/812309551163547',
  },
  {
    title: 'Unboxing BST Mới — Màu Sắc Đẹp Quá!',
    date: '28 Tháng 6, 2025',
    duration: '0:58',
    thumbnail: 'products.png',
    url: 'https://www.facebook.com/reel/817267891081505',
  },
];

// ─── GSAP SETUP ──────────────────────────────────────
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── INTERSECTION OBSERVER REVEAL ───────────────────
function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger delay based on sibling index
          const siblings = Array.from(entry.target.parentNode.children);
          const idx = siblings.indexOf(entry.target);
          const delay = (idx % 4) * 90;
          setTimeout(() => entry.target.classList.add('is-visible'), delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ─── NAV SCROLL ──────────────────────────────────────
function initNavScroll() {
  const nav = document.getElementById('nav');
  const backToTop = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
      backToTop.classList.add('visible');
    } else {
      nav.classList.remove('scrolled');
      backToTop.classList.remove('visible');
    }
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ─── MOBILE MENU ─────────────────────────────────────
function initMobileMenu() {
  const burger = document.getElementById('burger-btn');
  const menu = document.getElementById('mobile-menu');
  if (!burger || !menu) return;

  burger.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', isOpen);
  });

  // Close on mobile link click
  menu.querySelectorAll('.nav__mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', false);
    });
  });
}

// ─── CHAT WIDGET TOGGLE ───────────────────────────────
function initChatWidgets() {
  const toggle = document.getElementById('chat-toggle');
  const widgets = document.querySelectorAll('.chat-widget');
  const openIcon = toggle.querySelector('.chat-toggle__icon--open');
  const closeIcon = toggle.querySelector('.chat-toggle__icon--close');
  let isOpen = false;

  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    toggle.setAttribute('aria-expanded', isOpen);
    openIcon.style.display = isOpen ? 'none' : 'block';
    closeIcon.style.display = isOpen ? 'block' : 'none';

    widgets.forEach((w, i) => {
      if (isOpen) {
        setTimeout(() => w.classList.add('visible'), i * 80);
      } else {
        const reverseI = widgets.length - 1 - i;
        setTimeout(() => w.classList.remove('visible'), reverseI * 60);
      }
    });
  });
}

// ─── FORM SUBMIT ──────────────────────────────────────
function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('fname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const product = document.getElementById('product-select').value;
    const message = document.getElementById('message').value.trim();

    if (!name || !phone) {
      alert('Vui lòng điền đầy đủ họ tên và số điện thoại.');
      return;
    }

    // Build Zalo / Messenger message pre-fill
    const orderText = `Xin chào LyLy Shop!\nTên: ${name}\nSĐT: ${phone}${product ? '\nSản phẩm: ' + product : ''}${message ? '\nGhi chú: ' + message : ''}`;
    const encoded = encodeURIComponent(orderText);

    // Open Zalo with pre-filled text
    window.open(`https://zalo.me/0775678839?text=${encoded}`, '_blank');

    // Visual feedback
    const btn = document.getElementById('form-submit');
    const orig = btn.textContent;
    btn.textContent = 'Đã gửi! Đang chuyển sang Zalo...';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3000);
  });
}

// ─── FACEBOOK API: POSTS ──────────────────────────────
async function fetchFBPosts() {
  const { pageId, accessToken, postsLimit } = FB_CONFIG;
  if (pageId === 'YOUR_PAGE_ID' || accessToken === 'YOUR_PAGE_ACCESS_TOKEN') {
    return null; // Not configured
  }
  try {
    const url = `https://graph.facebook.com/v18.0/${pageId}/posts?fields=id,message,story,created_time,full_picture,permalink_url&limit=${postsLimit}&access_token=${accessToken}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('FB posts fetch failed');
    const data = await res.json();
    return data.data || null;
  } catch (err) {
    console.warn('LyLy Shop: Could not load Facebook posts.', err.message);
    return null;
  }
}

// ─── FACEBOOK API: VIDEOS ─────────────────────────────
async function fetchFBVideos() {
  const { pageId, accessToken, videosLimit } = FB_CONFIG;
  if (pageId === 'YOUR_PAGE_ID' || accessToken === 'YOUR_PAGE_ACCESS_TOKEN') {
    return null;
  }
  try {
    const url = `https://graph.facebook.com/v18.0/${pageId}/videos?fields=id,title,description,created_time,thumbnails,permalink_url,length&limit=${videosLimit}&access_token=${accessToken}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('FB videos fetch failed');
    const data = await res.json();
    return data.data || null;
  } catch (err) {
    console.warn('LyLy Shop: Could not load Facebook videos.', err.message);
    return null;
  }
}

// ─── RENDER: NEWS CARDS ───────────────────────────────
function formatFBDate(isoString) {
  const d = new Date(isoString);
  const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
}

function formatDuration(seconds) {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function renderNewsCards(posts) {
  const grid = document.getElementById('news-grid');
  if (!grid) return;
  grid.innerHTML = '';

  posts.forEach((post, i) => {
    const text = post.message || post.story || 'Xem bài viết mới từ LyLy Shop';
    const excerpt = text.length > 120 ? text.slice(0, 120) + '...' : text;
    const date = post.created_time ? formatFBDate(post.created_time) : '';
    const url = post.permalink_url || `https://www.facebook.com/${FB_CONFIG.pageId}`;
    const imgSrc = post.full_picture || `${['hero', 'lifestyle', 'products'][i % 3]}.png`;
    const cats = ['Tin Tức', 'Bài Viết', 'Cập Nhật'];
    const cat = cats[i % cats.length];

    const card = document.createElement('article');
    card.className = 'news-card reveal';
    card.id = `news-api-${i + 1}`;
    card.innerHTML = `
      <div class="news-card__img-wrap">
        <img src="${imgSrc}" alt="${cat}" class="news-card__img" loading="lazy" onerror="this.src='hero.png'" />
        <span class="news-card__cat">${cat}</span>
      </div>
      <div class="news-card__body">
        <time class="news-card__date">${date}</time>
        <h3 class="news-card__title">${excerpt.split('\n')[0].slice(0, 80) || cat}</h3>
        <p class="news-card__excerpt">${excerpt}</p>
        <a href="${url}" target="_blank" rel="noopener" class="news-card__link" id="news-api-link-${i + 1}">Đọc thêm →</a>
      </div>`;
    grid.appendChild(card);
  });
  initReveal();
}

function renderFallbackNews() {
  const grid = document.getElementById('news-grid');
  if (!grid) return;
  grid.innerHTML = '';
  FALLBACK_NEWS.forEach((item, i) => {
    const card = document.createElement('article');
    card.className = 'news-card reveal';
    card.id = `news-${i + 1}`;
    card.innerHTML = `
      <div class="news-card__img-wrap">
        <img src="${item.img}" alt="${item.category}" class="news-card__img" loading="lazy" />
        <span class="news-card__cat">${item.category}</span>
      </div>
      <div class="news-card__body">
        <time class="news-card__date">${item.date}</time>
        <h3 class="news-card__title">${item.title}</h3>
        <p class="news-card__excerpt">${item.excerpt}</p>
        <a href="${item.url}" target="_blank" rel="noopener" class="news-card__link" id="news-link-${i + 1}">Đọc thêm →</a>
      </div>`;
    grid.appendChild(card);
  });
  initReveal();
}

// ─── RENDER: VIDEO CARDS ──────────────────────────────
function renderVideoCards(videos) {
  const grid = document.getElementById('videos-grid');
  if (!grid) return;
  grid.innerHTML = '';

  videos.forEach((vid, i) => {
    const title = vid.title || vid.description || 'Video từ LyLy Shop';
    const date = vid.created_time ? formatFBDate(vid.created_time) : '';
    const url = vid.permalink_url || `https://www.facebook.com/${FB_CONFIG.pageId}/videos`;
    const duration = vid.length ? formatDuration(vid.length) : '';
    const thumb = (vid.thumbnails && vid.thumbnails.data && vid.thumbnails.data[0])
      ? vid.thumbnails.data[0].uri
      : `${['lifestyle', 'hero', 'products'][i % 3]}.png`;

    const card = document.createElement('div');
    card.className = 'video-card reveal';
    card.id = `video-api-${i + 1}`;
    card.innerHTML = `
      <a href="${url}" target="_blank" rel="noopener" class="video-card__link" id="video-api-link-${i + 1}">
        <div class="video-card__thumb">
          <img src="${thumb}" alt="${title}" class="video-card__img" loading="lazy" onerror="this.src='lifestyle.png'" />
          <div class="video-card__play">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          ${duration ? `<div class="video-card__duration">${duration}</div>` : ''}
        </div>
        <div class="video-card__info">
          <h3 class="video-card__title">${title.slice(0, 80)}</h3>
          <span class="video-card__date">${date}</span>
        </div>
      </a>`;
    grid.appendChild(card);
  });
  initReveal();
}

function renderFallbackVideos() {
  const grid = document.getElementById('videos-grid');
  if (!grid) return;
  grid.innerHTML = '';
  FALLBACK_VIDEOS.forEach((v, i) => {
    const card = document.createElement('div');
    card.className = 'video-card reveal';
    card.id = `video-${i + 1}`;
    card.innerHTML = `
      <a href="${v.url}" target="_blank" rel="noopener" class="video-card__link" id="video-link-${i + 1}">
        <div class="video-card__thumb">
          <img src="${v.thumbnail}" alt="${v.title}" class="video-card__img" loading="lazy" />
          <div class="video-card__play">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          <div class="video-card__duration">${v.duration}</div>
        </div>
        <div class="video-card__info">
          <h3 class="video-card__title">${v.title}</h3>
          <span class="video-card__date">${v.date}</span>
        </div>
      </a>`;
    grid.appendChild(card);
  });
  initReveal();
}

// ─── LOAD FACEBOOK DATA ───────────────────────────────
async function loadFacebookContent() {
  // Load posts
  const posts = await fetchFBPosts();
  if (posts && posts.length > 0) {
    renderNewsCards(posts);
  } else {
    renderFallbackNews();
  }

  // Load videos
  const videos = await fetchFBVideos();
  if (videos && videos.length > 0) {
    renderVideoCards(videos);
  } else {
    renderFallbackVideos();
  }
}

// ─── HERO GSAP ANIMATION ─────────────────────────────
function initHeroAnimation() {
  if (typeof gsap === 'undefined') return;
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
  tl.from('#hero-badge', { opacity: 0, y: 20, duration: 0.5, delay: 0.2 })
    .from('#hero-title', { opacity: 0, y: 40, duration: 0.7 }, '-=0.2')
    .from('#hero-sub', { opacity: 0, y: 24, duration: 0.5 }, '-=0.3')
    .from('#hero-ctas', { opacity: 0, y: 18, duration: 0.5 }, '-=0.2')
    .from('#hero-stats', { opacity: 0, y: 14, duration: 0.5 }, '-=0.2');
}

// ─── SMOOTH ANCHOR SCROLL ────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('nav')?.offsetHeight || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ─── PRODUCT CARD IMG FIX ────────────────────────────
// Use object-position for alternate images
document.querySelectorAll('.product-card__img--alt').forEach(img => {
  img.style.objectPosition = 'center 30%';
});

// ─── INIT ALL ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initNavScroll();
  initMobileMenu();
  initChatWidgets();
  initForm();
  initHeroAnimation();
  initSmoothScroll();
  loadFacebookContent();

  // Add active nav link highlighting
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === '#' + entry.target.id
            ? 'var(--color-primary)' : '';
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => observer.observe(s));
});
