/* ============================================================
   TzerK Portfolio — Main JS
   Three.js · GSAP · Cursor · Animations · Contact Form
   ============================================================ */

'use strict';

/* ── Globals ── */
const DOT   = document.getElementById('cursor-dot');
const RING  = document.getElementById('cursor-ring');
let   mouseX = 0, mouseY = 0;
let   ringX  = 0, ringY  = 0;

/* ══════════════════════════════════════════════════════════
   1. LOADER
   ══════════════════════════════════════════════════════════ */
(function initLoader() {
  const bar   = document.getElementById('loader-bar');
  const pct   = document.getElementById('loader-pct');
  const loader = document.getElementById('loader');

  const prog = { v: 0 };

  gsap.to(prog, {
    v: 100,
    duration: 2.2,
    ease: 'power2.inOut',
    onUpdate() {
      const val = Math.round(prog.v);
      bar.style.width = val + '%';
      pct.textContent  = val + '%';
    },
    onComplete() {
      gsap.to(loader, {
        opacity: 0,
        scale: 1.04,
        duration: 0.45,
        ease: 'power2.in',
        onComplete() {
          loader.style.display = 'none';
          startPortfolio();
        }
      });
    }
  });
})();

/* ══════════════════════════════════════════════════════════
   2. CURSOR
   ══════════════════════════════════════════════════════════ */
function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    DOT.style.left = mouseX + 'px';
    DOT.style.top  = mouseY + 'px';
  });

  // Ring follows with lag
  (function animRing() {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    RING.style.left = ringX - 18 + 'px';
    RING.style.top  = ringY - 18 + 'px';
    requestAnimationFrame(animRing);
  })();

  // Hover states
  document.querySelectorAll('a, button, [role="button"], .proj-card, .mem-card, .contact-method').forEach(el => {
    el.addEventListener('mouseenter', () => {
      DOT.classList.add('cursor-hover');
      RING.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      DOT.classList.remove('cursor-hover');
      RING.classList.remove('cursor-hover');
    });
  });

  document.addEventListener('mousedown', () => DOT.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => DOT.classList.remove('cursor-click'));
}

/* ══════════════════════════════════════════════════════════
   3. THREE.JS BACKGROUND
   ══════════════════════════════════════════════════════════ */
function initThree() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  const scene    = new THREE.Scene();
  scene.fog      = new THREE.FogExp2(0x0a0a0f, 0.012);

  const camera   = new THREE.PerspectiveCamera(70, W() / H(), 0.1, 200);
  camera.position.z = 35;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(W(), H());
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  /* Lights */
  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  const lPurple = new THREE.PointLight(0xa855f7, 3, 80);
  lPurple.position.set(10, 12, 10);
  scene.add(lPurple);
  const lCyan = new THREE.PointLight(0x00ffff, 3, 80);
  lCyan.position.set(-12, -10, 15);
  scene.add(lCyan);

  /* Particles */
  const COUNT = 220;
  const pos   = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT * 3; i++) pos[i] = (Math.random() - 0.5) * 100;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const particles = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xa855f7, size: 0.18, transparent: true, opacity: 0.55
  }));
  scene.add(particles);

  /* Geometric shapes */
  const shapeDefs = [
    { g: new THREE.IcosahedronGeometry(3, 0),         c: 0xa855f7, p: [-16,  8, -22] },
    { g: new THREE.OctahedronGeometry(2.2, 0),        c: 0x00ffff, p: [ 20, -6, -28] },
    { g: new THREE.TorusKnotGeometry(1.8, 0.5, 60, 8),c: 0xffd700, p: [  4,-13, -32] },
    { g: new THREE.TetrahedronGeometry(2.8, 0),       c: 0xff6b6b, p: [-11,-10, -18] },
  ];

  const meshes = shapeDefs.map(({ g, c, p }) => {
    const mat  = new THREE.MeshStandardMaterial({ color: c, wireframe: true, transparent: true, opacity: 0.35 });
    const mesh = new THREE.Mesh(g, mat);
    mesh.position.set(...p);
    scene.add(mesh);
    return mesh;
  });

  /* Mouse reactive */
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx =  (e.clientX / W() - 0.5) * 2;
    my = -(e.clientY / H() - 0.5) * 2;
  });

  /* Animate */
  const speeds = [0.004, 0.006, 0.003, 0.005];
  function animate() {
    requestAnimationFrame(animate);
    particles.rotation.y += 0.0004;
    particles.rotation.x += 0.0002;
    meshes.forEach((m, i) => {
      m.rotation.x += speeds[i] * (i % 2 ? 1 : -1);
      m.rotation.y += speeds[i] * 1.3;
    });
    camera.position.x += (mx * 3 - camera.position.x) * 0.025;
    camera.position.y += (my * 2 - camera.position.y) * 0.025;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
    renderer.setSize(W(), H());
  });
}

/* ══════════════════════════════════════════════════════════
   4. GSAP SCROLL TRIGGER + HERO ANIMATIONS
   ══════════════════════════════════════════════════════════ */
function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  /* Hero entrance */
  const heroTl = gsap.timeline({ delay: 0.1 });
  heroTl
    .to('#hero-greeting', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
    .to('#hero-title',    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.3')
    .to('#hero-sub',      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
    .to('#hero-tags',     { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.2')
    .to('#hero-cta',      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.2');

  /* Typewriter */
  const words  = ['TzerK', 'a Frontend Dev', 'a Builder', 'a Creator'];
  let   wi     = 0, ci = 0, deleting = false;
  const target = document.getElementById('typewriter-text');

  function typeLoop() {
    const word = words[wi];
    if (!deleting) {
      target.textContent = word.slice(0, ++ci);
      if (ci === word.length) { deleting = true; setTimeout(typeLoop, 1800); return; }
    } else {
      target.textContent = word.slice(0, --ci);
      if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; setTimeout(typeLoop, 400); return; }
    }
    setTimeout(typeLoop, deleting ? 55 : 90);
  }
  setTimeout(typeLoop, 800);

  /* Scroll reveals */
  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
    const delay = parseFloat(el.dataset.delay || 0) / 1000;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter() {
        gsap.to(el, { opacity: 1, x: 0, y: 0, duration: 0.8, delay, ease: 'power3.out' });
        el.classList.add('visible');
      }
    });
  });

  /* Stats counters */
  ScrollTrigger.create({
    trigger: '#about',
    start: 'top 70%',
    once: true,
    onEnter() {
      document.querySelectorAll('.counter').forEach(el => {
        const target = parseInt(el.dataset.target);
        gsap.to({ v: 0 }, {
          v: target,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate() { el.textContent = Math.round(this.targets()[0].v); }
        });
      });
    }
  });

  /* Skill circles */
  ScrollTrigger.create({
    trigger: '#skills',
    start: 'top 70%',
    once: true,
    onEnter() {
      document.querySelectorAll('.skill-fill').forEach((circle, i) => {
        const pct    = parseFloat(circle.dataset.pct);
        const circum = 263.9;
        const offset = circum * (1 - pct / 100);
        gsap.to(circle, {
          strokeDashoffset: offset,
          duration: 1.4,
          delay: i * 0.12,
          ease: 'power2.out'
        });
      });

      document.querySelectorAll('.skill-bar-fill').forEach((bar, i) => {
        gsap.to(bar, {
          width: bar.dataset.width + '%',
          duration: 1.2,
          delay: i * 0.1,
          ease: 'power2.out'
        });
      });
    }
  });

  /* Navbar active link */
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 100) cur = s.id; });
    document.querySelectorAll('.nav-link').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
    });
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════════
   5. NAVBAR SCROLL
   ══════════════════════════════════════════════════════════ */
function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  /* Hamburger */
  const ham    = document.getElementById('hamburger');
  const mMenu  = document.getElementById('mobile-menu');
  ham.addEventListener('click', () => {
    ham.classList.toggle('open');
    mMenu.classList.toggle('open');
    ham.setAttribute('aria-expanded', ham.classList.contains('open'));
  });

  /* Close mobile menu on link click */
  document.querySelectorAll('.mobile-link').forEach(a => {
    a.addEventListener('click', () => {
      ham.classList.remove('open');
      mMenu.classList.remove('open');
    });
  });
}

/* ══════════════════════════════════════════════════════════
   6. SMOOTH SCROLL
   ══════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('.smooth-scroll').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════
   7. MAGNETIC BUTTONS
   ══════════════════════════════════════════════════════════ */
function initMagnetic() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * 0.28;
      const y = (e.clientY - r.top  - r.height / 2) * 0.28;
      gsap.to(btn, { x, y, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.35)' });
    });
  });
}

/* ══════════════════════════════════════════════════════════
   8. RIPPLE EFFECT
   ══════════════════════════════════════════════════════════ */
function initRipple() {
  document.querySelectorAll('.ripple-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const r    = btn.getBoundingClientRect();
      const dot  = document.createElement('span');
      dot.className = 'ripple-effect';
      dot.style.left = (e.clientX - r.left) + 'px';
      dot.style.top  = (e.clientY - r.top)  + 'px';
      btn.appendChild(dot);
      setTimeout(() => dot.remove(), 700);
    });
  });
}

/* ══════════════════════════════════════════════════════════
   9. THEME TOGGLE
   ══════════════════════════════════════════════════════════ */
function initTheme() {
  const btn  = document.getElementById('theme-toggle');
  const html = document.documentElement;
  let   dark = true;

  btn.addEventListener('click', () => {
    dark = !dark;
    html.setAttribute('data-theme', dark ? 'dark' : 'light');
    btn.innerHTML = dark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    showToast(dark ? '🌙 Dark mode activated' : '☀️ Light mode activated', 'info');
  });
}

/* ══════════════════════════════════════════════════════════
   10. TOAST NOTIFICATIONS
   ══════════════════════════════════════════════════════════ */
function showToast(msg, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  const toast     = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

/* ══════════════════════════════════════════════════════════
   11. CONFETTI
   ══════════════════════════════════════════════════════════ */
function fireConfetti() {
  if (typeof confetti === 'undefined') return;
  const colors = ['#a855f7', '#00ffff', '#ffd700', '#f0abfc'];
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors });
  setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { x: 0.1, y: 0.5 }, colors }), 200);
  setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { x: 0.9, y: 0.5 }, colors }), 400);
}

/* ══════════════════════════════════════════════════════════
   12. CONTACT FORM
   ══════════════════════════════════════════════════════════ */
function initContactForm() {
  const form    = document.getElementById('contact-form');
  const nameEl  = document.getElementById('form-name');
  const emailEl = document.getElementById('form-email');
  const msgEl   = document.getElementById('form-message');
  const submitBtn  = document.getElementById('form-submit');
  const submitText = document.getElementById('submit-text');
  const submitLoad = document.getElementById('submit-loading');
  const successEl  = document.getElementById('form-success');

  function setError(id, inputEl, show) {
    const err = document.getElementById(id);
    if (show) {
      err.classList.add('visible');
      inputEl.classList.add('error');
    } else {
      err.classList.remove('visible');
      inputEl.classList.remove('error');
    }
  }

  function validate() {
    let ok = true;
    if (!nameEl.value.trim()) { setError('name-error', nameEl, true);  ok = false; }
    else                       { setError('name-error', nameEl, false); }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(emailEl.value.trim())) { setError('email-error', emailEl, true);  ok = false; }
    else                                      { setError('email-error', emailEl, false); }

    if (!msgEl.value.trim()) { setError('message-error', msgEl, true);  ok = false; }
    else                      { setError('message-error', msgEl, false); }

    return ok;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) { showToast('❌ Please fill all fields correctly', 'error'); return; }

    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    submitLoad.classList.remove('hidden');

    try {
      const res  = await fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    nameEl.value.trim(),
          email:   emailEl.value.trim(),
          message: msgEl.value.trim()
        })
      });
      const data = await res.json();

      if (data.success) {
        successEl.classList.remove('hidden');
        form.reset();
        showToast('🚀 ' + data.message, 'success', 5000);
        fireConfetti();
        gsap.from(successEl, { opacity: 0, y: 20, duration: 0.5, ease: 'power3.out' });
      } else {
        showToast('❌ ' + (data.error || 'Something went wrong'), 'error');
      }
    } catch {
      showToast('❌ Network error. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitText.classList.remove('hidden');
      submitLoad.classList.add('hidden');
    }
  });

  /* Live validation */
  [nameEl, emailEl, msgEl].forEach(input => {
    input.addEventListener('input', () => {
      if (input === nameEl)  setError('name-error',    input, !input.value.trim());
      if (input === msgEl)   setError('message-error', input, !input.value.trim());
      if (input === emailEl) setError('email-error',   input, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value));
    });
  });
}

/* ══════════════════════════════════════════════════════════
   13. GAMES PANEL TOGGLE
   ══════════════════════════════════════════════════════════ */
function initGamesPanel() {
  const panel   = document.getElementById('games-panel');
  const openBtn = document.getElementById('games-btn');
  const closeBtn= document.getElementById('games-close');
  const overlay = document.getElementById('games-overlay');

  function open() {
    panel.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    panel.classList.add('hidden');
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* ══════════════════════════════════════════════════════════
   14. PARALLAX ON SCROLL
   ══════════════════════════════════════════════════════════ */
function initParallax() {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) heroContent.style.transform = `translateY(${y * 0.25}px)`;
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════════
   15. INIT — called after loader
   ══════════════════════════════════════════════════════════ */
function startPortfolio() {
  initCursor();
  initThree();
  initAnimations();
  initNavbar();
  initSmoothScroll();
  initMagnetic();
  initRipple();
  initTheme();
  initContactForm();
  initGamesPanel();
  initParallax();
}
