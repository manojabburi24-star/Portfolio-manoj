/* ==========================================================================
   MANOJ UI/UX DESIGNER PORTFOLIO - JAVASCRIPT LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toast = document.getElementById('toast');
  const toastText = toast ? toast.querySelector('.toast-text') : null;

  const showToast = (message, duration = 3500) => {
    if (!toast) return;
    if (toastText) toastText.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), duration);
  };

  // 0. Smooth scrolling (Lenis). Falls back to native scrolling if the library
  //    didn't load or the visitor prefers reduced motion.
  let lenis = null;
  const rafCallbacks = [];
  if (window.Lenis && !prefersReducedMotion) {
    lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    root.style.scrollBehavior = 'auto';
  }
  const rafLoop = (time) => {
    if (lenis) lenis.raf(time);
    if (caseLenisRef.current) caseLenisRef.current.raf(time);
    rafCallbacks.forEach(cb => cb(time));
    requestAnimationFrame(rafLoop);
  };
  const caseLenisRef = { current: null };
  requestAnimationFrame(rafLoop);

  const scrollToTarget = (target, opts = {}) => {
    const el = typeof target === 'string' ? document.querySelector(target) : null;
    const top = el ? el.getBoundingClientRect().top + window.scrollY : (typeof target === 'number' ? target : 0);
    if (lenis) lenis.scrollTo(top, { duration: 1.4, ...opts });
    else window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  // In-page links (#about, #work, …) glide with the smooth scroller
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || a.closest('dialog')) return;
    const href = a.getAttribute('href');
    if (href.length < 2 || !document.querySelector(href)) return;
    e.preventDefault();
    scrollToTarget(href);
  });

  // Pause page scrolling while any dialog is open
  document.querySelectorAll('dialog').forEach(d => {
    d.addEventListener('close', () => { if (lenis) lenis.start(); });
  });

  const isTyping = (el) => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);

  // 1. Day / Night theme
  const themeToggle = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeLabel');

  const applyThemeUI = () => {
    const isLight = root.dataset.theme === 'light';
    if (themeLabel) themeLabel.textContent = isLight ? 'Night' : 'Day';
    if (themeToggle) themeToggle.setAttribute('aria-label', isLight ? 'Switch to night theme' : 'Switch to day theme');
  };

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) { /* storage unavailable */ }
      applyThemeUI();
    });
  }
  applyThemeUI();

  // 2. Hero video sound toggle (video always starts muted)
  const heroVideo = document.getElementById('heroVideo');
  const soundToggle = document.getElementById('soundToggle');

  if (heroVideo && soundToggle) {
    heroVideo.muted = true;
    if (prefersReducedMotion) heroVideo.pause();

    soundToggle.addEventListener('click', () => {
      heroVideo.muted = !heroVideo.muted;
      if (!heroVideo.muted) heroVideo.play().catch(() => {});
      soundToggle.setAttribute('aria-pressed', String(!heroVideo.muted));
      soundToggle.setAttribute('aria-label', heroVideo.muted ? 'Turn video sound on' : 'Mute video sound');
    });

    // Pause the video (and its sound) once the hero is off screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          if (!prefersReducedMotion) heroVideo.play().catch(() => {});
        } else {
          heroVideo.pause();
        }
      }, { threshold: 0.1 }).observe(heroVideo);
    }
  }

  // 3. Dock: highlight the section in view
  const dockLinks = document.querySelectorAll('.dock-link');
  const sectionToDock = { top: 'top', story: 'story', journey: 'journey', work: 'work', projects: 'work', stack: 'work', process: 'work', contact: 'contact' };

  if ('IntersectionObserver' in window) {
    const dockObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const target = sectionToDock[entry.target.id];
        dockLinks.forEach(link => link.classList.toggle('active', link.dataset.section === target));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    Object.keys(sectionToDock).forEach(id => {
      const section = document.getElementById(id);
      if (section) dockObserver.observe(section);
    });
  }

  // 4. Marker highlights swipe in when they scroll into view
  const highlights = document.querySelectorAll('.hl:not(.tell .hl)');
  if ('IntersectionObserver' in window) {
    const hlObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('on');
          hlObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.8 });
    highlights.forEach(hl => hlObserver.observe(hl));
  } else {
    highlights.forEach(hl => hl.classList.add('on'));
  }

  // 5. Story text: words light up as you scroll through the section
  const tell = document.getElementById('tell');
  if (tell) {
    const walker = document.createTreeWalker(tell, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) {
      if (walker.currentNode.textContent.trim() && !walker.currentNode.parentElement.closest('svg')) {
        textNodes.push(walker.currentNode);
      }
    }

    textNodes.forEach(node => {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement('span');
          span.className = 'w';
          span.textContent = part;
          frag.appendChild(span);
        }
      });
      node.replaceWith(frag);
    });

    const words = [...tell.querySelectorAll('.w')];
    const tellHighlights = [...tell.querySelectorAll('.hl')];

    const updateTell = () => {
      const rect = tell.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the text's top reaches 85% of the viewport, 1 when its bottom reaches 55%
      const progress = (vh * 0.85 - rect.top) / (rect.height + vh * 0.3);
      const litCount = prefersReducedMotion ? words.length : Math.round(Math.min(Math.max(progress, 0), 1) * words.length);

      words.forEach((w, i) => w.classList.toggle('lit', i < litCount));
      tellHighlights.forEach(hl => {
        const lastWord = [...hl.querySelectorAll('.w')].pop();
        if (lastWord) hl.classList.toggle('on', lastWord.classList.contains('lit'));
      });
    };

    window.addEventListener('scroll', updateTell, { passive: true });
    window.addEventListener('resize', updateTell);
    updateTell();
  }

  // 6. Draggable sticky notes
  document.querySelectorAll('.desk .note').forEach(note => {
    let startX = 0, startY = 0, baseX = 0, baseY = 0;

    note.addEventListener('pointerdown', (e) => {
      if (window.matchMedia('(max-width: 800px)').matches) return;
      note.setPointerCapture(e.pointerId);
      note.classList.add('dragging');
      startX = e.clientX;
      startY = e.clientY;
      baseX = parseFloat(note.style.getPropertyValue('--x')) || 0;
      baseY = parseFloat(note.style.getPropertyValue('--y')) || 0;
    });

    note.addEventListener('pointermove', (e) => {
      if (!note.classList.contains('dragging')) return;
      note.style.setProperty('--x', `${baseX + e.clientX - startX}px`);
      note.style.setProperty('--y', `${baseY + e.clientY - startY}px`);
    });

    const stop = () => note.classList.remove('dragging');
    note.addEventListener('pointerup', stop);
    note.addEventListener('pointercancel', stop);
  });

  // 6b. Journey: heart-shaped trail on a map, walked stop by stop as you scroll.
  //     Edit journeyStops to change the stops (e.g. add your college, jobs and years).
  const PORTRAIT = 'assets/manoj.jpg';
  const FIGMA_SVG = '<svg viewBox="0 0 38 57" aria-hidden="true"><path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1ABCFE"/><path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0ACF83"/><path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#FF7262"/><path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E"/><path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF"/></svg>';

  // Content comes from Manoj's portfolio deck (assets/work/*.jpg are its pages)
  const journeyStops = [
    {
      name: 'Hyderabad', meta: 'Home base · India', color: '#ef6f4f', logo: { img: PORTRAIT },
      title: 'Hello, I’m Manoj Abburi.',
      text: 'A <strong>UI/UX, product and visual designer</strong> based in Hyderabad, designing digital experiences that turn ideas into something people can actually use.',
      label: 'Gallery', polaroids: [{ img: PORTRAIT, cap: 'that’s me :)' }]
    },
    {
      name: 'The process', meta: 'UX → Prototype', color: '#a259ff', logo: { svg: FIGMA_SVG },
      title: 'Every project starts with people.',
      text: 'My process runs <strong>UX → Flow → Wireframe → UI → Prototype</strong>, so every screen is built on real needs before it gets pixels.',
      label: 'Highlights', chips: ['UX', 'Flow', 'Wireframe', 'UI', 'Prototype']
    },
    {
      name: 'Mobile apps', meta: '04+ apps designed', color: '#3b5bdb', logo: { text: '04+' },
      title: 'I design for the screen in your hand.',
      text: 'From user flows and wireframes to <strong>polished interfaces and interactive prototypes</strong>, like a community app for rallies, events and groups.',
      label: 'Highlights', polaroids: [{ img: 'assets/work/mobile-apps.jpg', cap: 'mobile experiences', pos: 'center 75%' }],
      chips: ['User flows', 'Wireframes', 'Prototypes']
    },
    {
      name: 'Websites', meta: '10+ websites designed', color: '#ef6f4f', logo: { text: '10+' },
      title: 'I design websites with a purpose.',
      text: 'Digital experiences focused on <strong>clarity, usability, and visual impact</strong>, from structure and UX to the final visual design.',
      label: 'Highlights', polaroids: [{ img: 'assets/work/websites.jpg', cap: 'digital experiences', pos: 'center 70%' }],
      chips: ['Structure', 'UX', 'Visual design', 'Usability']
    },
    {
      name: 'Social & marketing', meta: 'Visual communication', color: '#e8a33a', logo: { text: 'Aa' },
      title: 'I make brands look consistent.',
      text: 'Visual content that helps brands communicate clearly across <strong>marketing campaigns and promotional creatives</strong>. Design that gets noticed.',
      label: 'Highlights', polaroids: [{ img: 'assets/work/visual-communication.jpg', cap: 'campaign creatives', pos: 'center 65%' }],
      chips: ['Campaigns', 'Promo creatives', 'Social posts']
    },
    {
      name: 'Presentations', meta: 'Presentation design', color: '#2f9e5b', logo: { text: 'P' },
      title: 'I turn information into a story.',
      text: 'Company profiles, pitch decks, product and marketing presentations. <strong>Less information. Better structure. Stronger impact.</strong>',
      label: 'Highlights', polaroids: [{ img: 'assets/work/presentations.jpg', cap: 'decks that inspire', pos: 'center 65%' }],
      chips: ['Pitch decks', 'Company profiles', 'Marketing decks']
    },
    {
      name: 'Today', meta: 'Open to work', color: '#1f4a63', logo: { text: 'NOW' },
      title: 'Building something? Maybe I can help.',
      text: 'Open to <strong>opportunities, freelance projects &amp; collaborations</strong>, from UI/UX and websites to presentations and AI automation.',
      label: 'Let’s talk', cta: true
    }
  ];

  const journey = document.getElementById('journey');
  if (journey) {
    const W = 1600, H = 1200;
    const HEART = 'M800 1060 C560 860 300 700 300 470 C300 300 430 220 560 220 C690 220 780 310 800 420 C820 310 910 220 1040 220 C1170 220 1300 300 1300 470 C1300 700 1040 860 800 1060';
    const N = journeyStops.length;
    // stops spread evenly along the heart, leaving a little trail before the first and after the last
    const STOP_AT = journeyStops.map((_, i) => 0.08 + (0.84 * i) / Math.max(N - 1, 1));
    const U = N + 2; // scroll units: intro + one per stop + outro

    const world = document.getElementById('jWorld');
    const mapEl = document.getElementById('jMap');
    const pinsLayer = document.getElementById('jPins');
    const marker = document.getElementById('jMarker');
    const markerArrow = marker.querySelector('span');
    const head = document.getElementById('jHead');
    const card = document.getElementById('jCard');
    const needle = document.getElementById('jNeedle');
    const dotsEl = document.getElementById('jDots');
    const progressText = document.getElementById('jProgressText');

    journey.style.height = `${(U + 1) * 100}vh`;

    // --- Build the map (seeded so it looks the same on every visit) ---
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    let blocks = '';
    for (let x = -148; x < W + 148; x += 74) {
      for (let y = -148; y < H + 148; y += 74) {
        const r = rand();
        const bx = x + 9, by = y + 9, s = 56;
        if (r < 0.1) continue;
        if (r < 0.32) blocks += `<rect class="m-block" x="${bx}" y="${by}" width="${s}" height="${s}" rx="3"/>`;
        else if (r < 0.6) blocks += `<rect class="m-block" x="${bx}" y="${by}" width="${s}" height="25" rx="3"/><rect class="m-block" x="${bx}" y="${by + 31}" width="${s}" height="25" rx="3"/>`;
        else if (r < 0.82) blocks += `<rect class="m-block" x="${bx}" y="${by}" width="25" height="${s}" rx="3"/><rect class="m-block" x="${bx + 31}" y="${by}" width="25" height="${s}" rx="3"/>`;
        else blocks += `<rect class="m-block" x="${bx}" y="${by}" width="25" height="25" rx="3"/><rect class="m-block" x="${bx + 31}" y="${by}" width="25" height="25" rx="3"/><rect class="m-block" x="${bx}" y="${by + 31}" width="25" height="25" rx="3"/><rect class="m-block" x="${bx + 31}" y="${by + 31}" width="25" height="25" rx="3"/>`;
      }
    }

    world.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
        <rect class="m-bg" x="-2000" y="-2000" width="${W + 4000}" height="${H + 4000}"/>
        ${blocks}
        <path class="m-avenue" d="M-200 80 L700 760 M1800 120 L900 790 M150 1300 L620 840 M1500 1300 L1010 860 M-200 960 L380 700"/>
        <path class="m-park" d="M560 820c60-40 170-30 200 20s-20 110-110 110-150-90-90-130z"/>
        <path class="m-park" d="M1110 560c50-50 170-40 190 10s-40 100-120 90-120-50-70-100z"/>
        <path class="m-park" d="M1240 820c40-20 110-10 120 25s-40 60-90 55-70-55-30-80z"/>
        <path class="m-park" d="M380 590c40-30 110-20 120 20s-30 70-80 65-80-55-40-85z"/>
        <path class="m-hwy" d="M-200 652 C200 640 500 668 800 655 S1300 640 1800 650"/>
        <path class="m-river" d="M806 -200 C790 100 820 300 800 520 S790 900 806 1400"/>
        <path class="m-water" d="M520 455c40-55 150-60 200-20s30 105-40 125-200 0-160-105z"/>
        <text class="m-small" x="585" y="512">Hussain Sagar</text>
        <g class="m-hwy-tag" transform="translate(1130 640)"><rect width="46" height="22" rx="4"/><text x="9" y="15">NH44</text></g>
        <text class="m-label" x="560" y="625" text-anchor="middle">HYDERABAD</text>
        <text class="m-label" x="1050" y="625" text-anchor="middle">SECUNDERABAD</text>
      </svg>`;

    // The trail lives in its own layer above the map's edge fade, so the whole heart stays visible
    const trailWorld = document.getElementById('jTrailWorld');
    trailWorld.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}">
        <path class="j-trail-glow" d="${HEART}"/>
        <path class="j-trail-base" d="${HEART}"/>
        <path class="j-trail-fill" d="${HEART}"/>
      </svg>`;

    const trailFill = trailWorld.querySelector('.j-trail-fill');
    const total = trailFill.getTotalLength();
    trailFill.style.strokeDasharray = `${total} ${total}`;
    const stopLen = STOP_AT.slice(0, N).map(f => f * total);
    const pointAt = (len) => trailFill.getPointAtLength(Math.min(Math.max(len, 0), total));

    // --- Pins, labels and progress dots ---
    const logoHtml = (logo) => {
      if (logo.img) return `<img src="${logo.img}" alt="">`;
      if (logo.svg) return `<span style="background:#1e1e1e">${logo.svg}</span>`;
      return `<span>${logo.text}</span>`;
    };

    const pins = journeyStops.map((stop, i) => {
      const pin = document.createElement('button');
      // stops on the left half of the heart get their label on the left, so labels don't collide
      pin.className = i < N / 2 ? 'jpin label-left' : 'jpin';
      pin.style.setProperty('--c', stop.color);
      pin.setAttribute('aria-label', `Go to stop ${i + 1}: ${stop.name}`);
      pin.innerHTML = `<span class="jpin-inner"><span class="jpin-head">${logoHtml(stop.logo)}</span></span><span class="jpin-label">${stop.name}</span>`;
      pin.addEventListener('click', () => goToStop(i));
      pinsLayer.appendChild(pin);
      return pin;
    });

    const dots = journeyStops.map((stop, i) => {
      const dot = document.createElement('button');
      dot.style.setProperty('--dc', stop.color);
      dot.setAttribute('aria-label', `Go to stop ${i + 1}: ${stop.name}`);
      dot.addEventListener('click', () => goToStop(i));
      dotsEl.appendChild(dot);
      return dot;
    });

    // --- Story card ---
    const jc = {
      logo: document.getElementById('jcLogo'),
      name: document.getElementById('jcName'),
      meta: document.getElementById('jcMeta'),
      count: document.getElementById('jcCount'),
      title: document.getElementById('jcTitle'),
      text: document.getElementById('jcText'),
      label: document.getElementById('jcLabel'),
      extra: document.getElementById('jcExtra')
    };
    let shownStop = -1;

    const showStop = (i) => {
      if (i === shownStop) return;
      shownStop = i;
      const stop = journeyStops[i];
      card.style.setProperty('--c', stop.color);
      jc.logo.innerHTML = stop.logo.svg ? stop.logo.svg : (stop.logo.img ? `<img src="${stop.logo.img}" alt="">` : stop.logo.text);
      jc.logo.style.background = stop.logo.svg ? '#1e1e1e' : '';
      jc.name.textContent = stop.name;
      jc.meta.textContent = stop.meta;
      jc.count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
      jc.title.textContent = stop.title;
      jc.text.innerHTML = stop.text;
      jc.label.textContent = stop.label;

      let extra = '';
      (stop.polaroids || []).forEach(p => {
        const pos = p.pos ? ` style="object-position:${p.pos}"` : '';
        extra += `<figure class="j-polaroid"><img src="${p.img}" alt=""${pos}><small>${p.cap}</small></figure>`;
      });
      if (stop.art) {
        extra += `<figure class="j-polaroid"><span class="j-art" style="--c1:${stop.art.c1};--c2:${stop.art.c2}">${stop.art.big}</span><small>${stop.art.cap}</small></figure>`;
      }
      if (stop.chips) {
        extra += `<div class="j-extra" style="flex-direction:column;align-items:flex-start;margin:0">${stop.chips.map(c => `<span class="j-chip">${c}</span>`).join('')}</div>`;
      }
      if (stop.cta) {
        extra += '<a href="#contact" class="pill pill-yellow">Let’s talk ↗</a>';
      }
      jc.extra.innerHTML = extra;

      pins.forEach((pin, j) => pin.classList.toggle('current', j === i));
      progressText.textContent = `${stop.name} · ${stop.meta.split(' · ').pop()}`;

      card.classList.remove('swap');
      void card.offsetWidth;
      card.classList.add('swap');
    };

    // --- Camera ---
    let userZoom = 1;
    const isMobile = () => window.matchMedia('(max-width: 800px)').matches;
    const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const lerp = (a, b, t) => a + (b - a) * t;

    const overviewCam = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      // leave room above the trail for the pins (80px tall on screen) and below for the button / dock
      const top = head.offsetTop + head.offsetHeight + (isMobile() ? 60 : 72);
      const availH = Math.max(vh - top - (isMobile() ? 130 : 140), 160);
      const availW = vw - (isMobile() ? 90 : 300);
      const s = Math.min(availW / 1000, availH / 840);
      return { cx: 800, cy: 640, s, fx: vw / 2, fy: top + availH / 2 };
    };

    const zoomCam = (len) => {
      const vw = window.innerWidth, vh = window.innerHeight;
      const p = pointAt(len);
      if (isMobile()) return { cx: p.x, cy: p.y, s: 1.15 * userZoom, fx: vw / 2, fy: vh * 0.3 };
      const cardRight = card.offsetLeft + card.offsetWidth;
      return { cx: p.x, cy: p.y, s: 1.8 * userZoom, fx: cardRight + (vw - cardRight) / 2, fy: vh * 0.5 };
    };

    const mixCam = (a, b, t) => ({
      cx: lerp(a.cx, b.cx, t), cy: lerp(a.cy, b.cy, t), s: lerp(a.s, b.s, t),
      fx: lerp(a.fx, b.fx, t), fy: lerp(a.fy, b.fy, t)
    });

    let target = null;
    let cam = null;

    const computeTarget = () => {
      const rect = journey.getBoundingClientRect();
      const range = journey.offsetHeight - window.innerHeight;
      const x = Math.min(Math.max(-rect.top / range, 0), 1) * U;
      const ov = overviewCam();
      let camT, drawn, current = 0, zoomed = false, labels = false, outro = false;

      if (x < 0.55) {
        camT = ov; drawn = 0;
      } else if (x < 1) {
        const t = ease((x - 0.55) / 0.45);
        drawn = stopLen[0] * t;
        camT = mixCam(ov, zoomCam(drawn), t);
        zoomed = t > 0.35;
      } else if (x < 1 + N) {
        const k = Math.min(Math.floor(x - 1), N - 1);
        const f = x - 1 - k;
        if (f < 0.55 || k === N - 1) {
          drawn = stopLen[k];
          current = k;
        } else {
          const t = ease((f - 0.55) / 0.45);
          drawn = lerp(stopLen[k], stopLen[k + 1], t);
          current = t < 0.5 ? k : k + 1;
        }
        camT = zoomCam(drawn);
        zoomed = true;
        labels = true;
      } else {
        const t = ease(Math.min((x - 1 - N) / 0.55, 1));
        drawn = lerp(stopLen[N - 1], total, t);
        camT = mixCam(zoomCam(stopLen[N - 1]), ov, t);
        current = N - 1;
        zoomed = t < 0.6;
        labels = true;
        outro = t >= 0.6;
      }

      target = { ...camT, drawn, current, zoomed, labels, outro };
      if (!cam || prefersReducedMotion) cam = { ...target };
    };

    const render = () => {
      if (!target) return;
      const k = prefersReducedMotion ? 1 : 0.16;
      ['cx', 'cy', 's', 'fx', 'fy', 'drawn'].forEach(key => { cam[key] = lerp(cam[key], target[key], k); });

      const tx = cam.fx - cam.cx * cam.s;
      const ty = cam.fy - cam.cy * cam.s;
      world.style.transform = `translate(${tx}px, ${ty}px) scale(${cam.s})`;
      trailWorld.style.transform = world.style.transform;
      trailFill.style.strokeDashoffset = total - cam.drawn;

      const ov = overviewCam();
      mapEl.style.setProperty('--fx', `${ov.fx}px`);
      mapEl.style.setProperty('--fy', `${ov.fy}px`);
      mapEl.style.setProperty('--fw', `${760 * ov.s}px`);
      mapEl.style.setProperty('--fh', `${640 * ov.s}px`);

      journey.classList.toggle('zoomed', target.zoomed);
      journey.classList.toggle('labels', target.labels);
      journey.classList.toggle('outro', target.outro);
      if (target.zoomed) showStop(target.current);

      stopLen.forEach((len, i) => {
        const p = pointAt(len);
        pins[i].style.transform = `translate(${tx + p.x * cam.s - 31}px, ${ty + p.y * cam.s - 80}px)`;
        dots[i].classList.toggle('done', len <= target.drawn + 1 && i !== target.current);
        dots[i].classList.toggle('current', target.zoomed && i === target.current);
      });

      const here = pointAt(cam.drawn);
      const ahead = pointAt(cam.drawn + 2);
      const behind = pointAt(cam.drawn - 2);
      const heading = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI + 90;
      marker.style.transform = `translate(${tx + here.x * cam.s}px, ${ty + here.y * cam.s}px)`;
      markerArrow.style.setProperty('--hd', `${heading}deg`);
      needle.style.setProperty('--rot', `${heading}deg`);
    };

    let visible = false;
    const loop = () => {
      if (visible) render();
      requestAnimationFrame(loop);
    };

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: '200px 0px' }).observe(journey);
    } else {
      visible = true;
    }

    window.addEventListener('scroll', computeTarget, { passive: true });
    window.addEventListener('resize', computeTarget);
    computeTarget();
    requestAnimationFrame(loop);

    // --- Controls ---
    function goToStop(i) {
      const range = journey.offsetHeight - window.innerHeight;
      const top = journey.getBoundingClientRect().top + window.scrollY;
      scrollToTarget(top + range * ((1 + i + 0.25) / U));
    }

    document.getElementById('jView').addEventListener('click', () => goToStop(0));
    document.getElementById('jLocate').addEventListener('click', () => { userZoom = 1; computeTarget(); });
    document.getElementById('jZoomIn').addEventListener('click', () => { userZoom = Math.min(userZoom * 1.25, 2.4); computeTarget(); });
    document.getElementById('jZoomOut').addEventListener('click', () => { userZoom = Math.max(userZoom / 1.25, 0.55); computeTarget(); });
  }

  // 6c. Case studies: mobile product design and website design projects.
  //     Qennect features come from the Qennect platform guide; features marked
  //     `concept: true` are design concepts whose implementation is not confirmed.
  const caseStudies = [
    {
      id: 'qennect', type: 'mobile', title: 'Qennect',
      category: 'Mobile app · Community engagement platform',
      headline: 'One app for every kind of community.',
      overview: 'Qennect is a private community platform for sailing clubs, sports communities, residential communities and member organizations. Each community gets its own space for members, events, sign-ups, payments and conversation, and switches on only the parts it needs.',
      role: 'UI/UX & Product Designer',
      responsibilities: [
        'Mapped user flows for members across community types',
        'Designed wireframes, high-fidelity mobile screens and interactive prototypes',
        'Shaped navigation around modules each community can switch on and rename'
      ],
      featuresLabel: 'Key features',
      features: [
        'Community feed with stories, polls and pinned announcements',
        'Member directory and member map',
        'Events and sign-up forms, pre-filled for sailing rallies',
        'Facility bookings and tournaments for sports clubs',
        'Boats, crew finding and rally tracking for sailing clubs',
        'Private messaging and notifications',
        'Passwordless sign-in and switching between communities'
      ],
      approach: 'Start with what every community shares (feed, members, events and messages), then layer each community type’s tools on top. A sailing club and a housing community get the same familiar structure without inheriting each other’s complexity.',
      challenge: 'One product had to serve four very different kinds of community without feeling generic or overloaded.',
      solution: 'A shared core of screens with community-specific modules, and consistent patterns for lists, details and sign-ups so every new module feels familiar. Flows only diverge where the experience genuinely differs, such as pre-filled rally sign-ups for sailing clubs versus custom event forms for everyone else.',
      tools: ['Figma'],
      deliverables: ['User flows', 'Wireframes', 'High-fidelity mobile UI', 'Interactive prototype'],
      highlight: 'Four kinds of community, one familiar experience.',
      img: 'assets/work/qennect-phones.jpg', c1: '#5b4bd6', c2: '#1f4a63'
    },
    {
      id: 'just-show-up', type: 'mobile', title: 'Just Show Up',
      category: 'Mobile app · Social planning',
      headline: 'Making plans should be easier than showing up.',
      overview: 'Just Show Up is a social planning app that makes it easier for people to create plans, coordinate with friends and take part in activities, so ideas for getting together turn into plans that actually happen.',
      role: 'UI/UX & Product Designer',
      responsibilities: [
        'Mapped the core planning and invitation flows',
        'Designed wireframes, mobile UI and interactive prototypes'
      ],
      featuresLabel: 'Core flows',
      concept: true,
      features: [
        'A weekly plan delivered on WhatsApp',
        'One-tap In / Maybe / Out',
        'Groups built from your contacts',
        'Plan details and RSVP in one place'
      ],
      approach: 'Keep plan creation to a few quick steps, make everyone’s attendance visible at a glance, and use clear visual hierarchy so the next action (join, invite or confirm) is always obvious.',
      challenge: 'Creating a plan had to feel as quick as sending a message, while still giving everyone enough detail to commit.',
      solution: 'A short, focused creation flow and plan cards that put the essentials first: what, when, where and who’s going. Secondary details stay one tap away instead of crowding the screen.',
      tools: ['Figma'],
      deliverables: ['User flows', 'Wireframes', 'Mobile UI design', 'Interactive prototype'],
      highlight: 'From “we should hang out” to a plan everyone can see.',
      cover: { mark: 'JSU', word: 'Just<br>Show Up' }, c1: '#ffb347', c2: '#ef6f4f'
    },
    {
      id: 'enfuze', type: 'mobile', title: 'Enfuze',
      category: 'Mobile app · Brand & creator platform concept',
      headline: 'Where brands and creators find the right fit.',
      overview: 'Enfuze is a concept for a collaboration platform that connects brands with influencers and creators, making it easier for both sides to find the right partners and work together.',
      role: 'UI/UX & Product Designer',
      responsibilities: [
        'Defined the concept’s key flows for brands and creators',
        'Designed wireframes, mobile UI and interactive prototypes'
      ],
      featuresLabel: 'Concept features',
      concept: true,
      features: [
        'Tailored onboarding for three personas',
        'Campaigns built from templates',
        'Creator discovery and profiles',
        'Chat, deliverables and payments'
      ],
      approach: 'Two audiences, one product: separate entry points for brands and creators, built on shared patterns so both sides read the same campaign the same way.',
      challenge: 'Brands and creators come to the product with different goals and need different information to make a decision.',
      solution: 'Role-based onboarding and home screens, with profile and campaign cards structured around the details each side needs to decide quickly.',
      tools: ['Figma'],
      deliverables: ['Product concept', 'User flows', 'Wireframes', 'Mobile UI design', 'Interactive prototype'],
      highlight: 'Designed for both sides of the deal.',
      cover: { mark: 'E', word: 'Enfuze' }, c1: '#c86dd7', c2: '#3023ae'
    },
    {
      id: 'cloud-first', type: 'web', title: 'Cloud First Computing',
      category: 'Website · Corporate technology services',
      headline: 'Complex technology services, made clear.',
      overview: 'A corporate website for a technology services company, covering cloud infrastructure, product engineering, Shopify solutions, enterprise solutions and business process automation.',
      role: 'UI/UX & Web Designer',
      responsibilities: [
        'Structured the site around the company’s service lines',
        'Designed page layouts and the visual design of key pages'
      ],
      featuresLabel: 'Key sections',
      features: [
        'Cloud infrastructure',
        'Product engineering',
        'Shopify solutions',
        'Enterprise solutions',
        'Business process automation'
      ],
      approach: 'Group a broad range of services into clear categories, lead each page with business value before technical detail, and reuse a consistent page structure so visitors can compare services easily.',
      challenge: 'Five very different service lines had to sit on one site without overwhelming visitors.',
      solution: 'A service-led information architecture with clear navigation, a repeatable section structure and strong visual hierarchy, so each offering is easy to scan and compare.',
      tools: ['Figma'],
      deliverables: ['Site structure', 'Page layouts', 'High-fidelity website design'],
      highlight: 'Five service lines, one clear story.',
      cover: { mark: 'CF', word: 'Cloud First<br>Computing' }, c1: '#38a3e8', c2: '#123a6b'
    },
    {
      id: 'qennect-web', type: 'web', title: 'Qennect Website',
      category: 'Website · SaaS marketing',
      headline: 'Showing every community where it fits in.',
      overview: 'The marketing website for Qennect, communicating the platform’s value, features and use cases for different kinds of communities.',
      role: 'UI/UX & Web Designer',
      responsibilities: [
        'Structured the site’s story from value proposition to use cases',
        'Designed page layouts and the visual design of key pages'
      ],
      featuresLabel: 'Key sections',
      features: [
        'Value proposition',
        'Platform features',
        'Use cases for sailing clubs, sports clubs, residential communities and member organizations',
        'Calls to action'
      ],
      approach: 'Lead with the value every community shares, then let visitors find their own community type and see the features that matter most to them.',
      challenge: 'A flexible, multi-purpose platform is hard to explain without sounding generic.',
      solution: 'Community-specific use-case sections and feature groupings that connect each capability to a real club or community scenario.',
      tools: ['Figma'],
      deliverables: ['Site structure', 'Page layouts', 'High-fidelity website design'],
      highlight: 'One platform, a story for every community.',
      cover: { mark: 'Q', word: 'Qennect' }, c1: '#7b6cf6', c2: '#2b2f77'
    },
    {
      id: 'ingaje', type: 'web', title: 'Ingaje Website',
      category: 'Website · HR & employee experience',
      headline: 'A complete HR suite, made approachable.',
      overview: 'A website for an HR and employee experience platform, presenting employee portals, attendance and leave, engagement, performance and AI-powered HR capabilities.',
      role: 'UI/UX & Web Designer',
      responsibilities: [
        'Organized the platform’s modules into a clear page structure',
        'Designed page layouts and the visual design of key pages'
      ],
      featuresLabel: 'Key sections',
      features: [
        'Employee portal',
        'Attendance and leave',
        'Engagement',
        'Performance',
        'AI-powered HR capabilities'
      ],
      approach: 'Organize the story around HR workflows and the employee experience, give each module its own clearly separated section, and keep the AI capabilities grounded in practical HR tasks.',
      challenge: 'A broad HR suite can easily feel heavy and complicated to the people evaluating it.',
      solution: 'Module-based sections with consistent layouts, concise headlines and clear visual cues, so HR teams can quickly find what is relevant to them.',
      tools: ['Figma'],
      deliverables: ['Site structure', 'Page layouts', 'High-fidelity website design'],
      highlight: 'Every HR module, one clear journey.',
      cover: { mark: 'In', word: 'Ingaje' }, c1: '#2fbf8f', c2: '#145a52'
    }
  ];

  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const coverHtml = (cs) => {
    if (cs.img) return `<img src="${cs.img}" alt="${esc(cs.title)} screens" loading="lazy">`;
    const frame = cs.type === 'mobile'
      ? `<span class="cv-phone"><b>${cs.cover.mark}</b><i></i><i></i><i></i></span>`
      : `<span class="cv-browser"><span class="cv-bar"><i></i><i></i><i></i></span><b>${cs.cover.mark}</b><i></i><i></i></span>`;
    return `<span class="cv-word">${cs.cover.word}</span>${frame}`;
  };

  const caseModal = document.getElementById('caseModal');
  const caseBody = document.getElementById('caseBody');

  const listHtml = (items) => `<ul>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;

  // Short copy for the cards in the box and the list under it
  const cardInfo = {
    'qennect': { mark: 'Q', line: 'One app, every community.', sub: 'Mobile app · Community' },
    'just-show-up': { mark: 'JSU', line: 'Plans that actually happen.', sub: 'Mobile app · Social planning' },
    'enfuze': { mark: 'E', line: 'Brands, meet creators.', sub: 'Mobile app · Concept' },
    'cloud-first': { mark: 'CF', line: 'Complex services, made clear.', sub: 'Website · Tech services' },
    'qennect-web': { mark: 'Q', line: 'A story for every community.', sub: 'Website · SaaS marketing' },
    'ingaje': { mark: 'In', line: 'HR, made approachable.', sub: 'Website · HR platform' }
  };

  // --- Case study page (full-screen dialog with its own smooth scroller) ---
  let caseLenis = null;
  let caseRevealObserver = null;

  const titleHtml = (title) => {
    const words = title.split(' ');
    const last = words.pop();
    return `${words.length ? esc(words.join(' ')) + ' ' : ''}<span class="hl">${esc(last)}</span>`;
  };

  // --- Long-form story pages (content lives in case-stories.js) ---
  const ICONS = {
    sail: '<path d="M12 3v14M12 4l7 11h-7M12 7l-6 8h6M3 19c3 2 15 2 18 0" />',
    ball: '<circle cx="12" cy="12" r="9" /><path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18M3 12h18" />',
    home: '<path d="M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6" />',
    people: '<circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14.5a5 5 0 0 1 5.5 5.5" />',
    brand: '<path d="M4 7h16l-1.5 12a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2zM9 7a3 3 0 0 1 6 0" />',
    creator: '<rect x="3" y="6" width="13" height="12" rx="2" /><path d="M16 10l5-3v10l-5-3" />',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5" />'
  };
  const icon = (name) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  const twoTone = (lines) => `${esc(lines[0])}<br><span class="sg">${esc(lines[1])}</span>`;

  const blockHtml = (b) => {
    switch (b.type) {
      case 'notes':
        return `<div class="st-notes">${b.items.map((n, i) => `
          <div class="st-note" style="--i:${i}"><small>${String(i + 1).padStart(2, '0')}</small><b>${esc(n.t)}</b><span>${esc(n.d)}</span></div>`).join('')}</div>`;
      case 'cards':
        return `<div class="st-cards ${b.numbered ? 'numbered' : ''}">${b.items.map((c, i) => `
          <div class="st-card" style="--i:${i}">
            <span class="st-ic">${b.numbered ? String(i + 1).padStart(2, '0') : icon(c.icon)}</span>
            <b>${esc(c.t)}</b><p>${esc(c.d)}</p>
          </div>`).join('')}</div>`;
      case 'tiles':
        return `<div class="st-tiles">${b.items.map((t, i) => `
          <div class="st-tile" style="--i:${i}"><strong>${esc(t.v)}</strong><b>${esc(t.l)}</b><span>${esc(t.d)}</span></div>`).join('')}</div>`;
      case 'callout':
        return `<div class="st-callout"><span class="st-orb"></span><small>${esc(b.kicker)}</small><p>${esc(b.text)}</p><span>${esc(b.sub)}</span></div>`;
      case 'steps': {
        const list = (steps) => `<ol class="st-steps">${steps.map((s, i) => `
          <li style="--i:${i}"><span>${String(i + 1).padStart(2, '0')}</span><div><b>${esc(s.t)}</b><p>${esc(s.d)}</p></div></li>`).join('')}</ol>`;
        if (b.tabs) {
          return `<div class="st-tabs" role="tablist">${b.tabs.map((t, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-tab="${i}">${esc(t.label)}</button>`).join('')}</div>
            ${b.tabs.map((t, i) => `<div class="st-panel" data-panel="${i}" ${i ? 'hidden' : ''}>${list(t.steps)}</div>`).join('')}`;
        }
        return `<div class="st-steps-wrap">${list(b.steps)}${b.img ? `<figure class="st-phone st-phone-lg" data-zoom="${b.img}"><img src="${b.img}" alt="" loading="lazy"></figure>` : ''}</div>`;
      }
      case 'compare':
        return `<div class="st-compare">
          <div class="st-compare-list">${b.items.map((it, i) => `
            <article class="st-cmp" data-cmp="${i}">
              <span class="st-cmp-no">${String(i + 1).padStart(2, '0')} / ${String(b.items.length).padStart(2, '0')}</span>
              <h4>${esc(it.name)}</h4>
              <figure class="st-phone st-cmp-inline" data-zoom="${it.img}"><img src="${it.img}" alt="${esc(it.name)} screen" loading="lazy"></figure>
              <div class="st-cmp-cols">
                <div class="was"><small>Problem</small><ul>${it.problems.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>
                <div class="now"><small>Redesign</small><ul>${it.fixes.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>
              </div>
            </article>`).join('')}
          </div>
          <div class="st-compare-stage"><div class="st-phone st-phone-lg st-cmp-phone">${b.items.map((it, i) => `<img src="${it.img}" alt="" data-cmp-img="${i}" class="${i ? '' : 'on'}" loading="lazy">`).join('')}</div></div>
        </div>`;
      case 'flows':
        return `<div class="st-tabs" role="tablist">${b.tabs.map((t, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-tab="${i}">${esc(t.label)}</button>`).join('')}</div>
          ${b.tabs.map((t, i) => `<div class="st-panel" data-panel="${i}" ${i ? 'hidden' : ''}>
            <p class="st-flow-desc">${esc(t.desc)}</p>
            <div class="st-flow">${t.screens.map((s, j) => `
              <figure class="st-shot" style="--i:${j}" data-zoom="${s.img}" data-cap="${esc(s.cap)}">
                <span class="st-phone"><img src="${s.img}" alt="${esc(s.cap)}" loading="lazy"></span>
                <figcaption><small>${String(j + 1).padStart(2, '0')}</small>${esc(s.cap)}</figcaption>
              </figure>`).join('')}</div>
          </div>`).join('')}`;
      case 'countries':
        return `<div class="st-tabs st-tabs-sm" role="tablist">${b.countries.map((c, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-tab="${i}">${esc(c.name)}</button>`).join('')}</div>
          <div class="st-country">
            <div class="st-docs">${b.countries.map((c, i) => `<ul data-panel="${i}" ${i ? 'hidden' : ''}>${c.docs.map((d, j) => `<li style="--i:${j}"><span>${icon('check')}</span>${esc(d)}</li>`).join('')}</ul>`).join('')}</div>
            <div class="st-status">${b.statuses.map((s, i) => `<span class="s${i}">${esc(s)}</span>`).join('<i>→</i>')}</div>
          </div>`;
      case 'checklist':
        return `<ul class="st-check">${b.items.map((c, i) => `<li style="--i:${i}"><span>${icon('check')}</span>${esc(c)}</li>`).join('')}</ul>`;
      case 'deliverables':
        return `<div class="st-deliv">${b.items.map((d, i) => `<span style="--i:${i}">${esc(d)}</span>`).join('')}</div>`;
      default:
        return '';
    }
  };

  function renderStory(cs, story) {
    const others = caseStudies.filter(c => c.id !== cs.id).slice(0, 3);
    const logo = story.logo.img
      ? `<img src="${story.logo.img}" alt="">`
      : `<i>${esc(story.logo.mark)}</i>`;
    caseBody.style.setProperty('--g1', story.theme.g1);
    caseBody.style.setProperty('--g2', story.theme.g2);
    caseBody.classList.add('is-story');
    caseBody.innerHTML = `
      <div class="cp-progress"><i></i></div>
      <div class="cp-top">
        <button class="cp-back" type="button" data-close aria-label="Back to the portfolio">
          <svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <span class="cp-pill">${esc(cs.title)}</span>
      </div>
      <header class="st-hero">
        <span class="st-brand">${logo}<b>${esc(story.logo.name)}</b></span>
        <p class="st-tag">✦ ${esc(story.tag)}</p>
        <h1 id="csTitle">${twoTone(story.title)}</h1>
        <p class="st-sub">${esc(story.sub)}</p>
        <div class="st-chips">${story.chips.map(([k, v]) => `<span><small>${esc(k)}</small>${esc(v)}</span>`).join('')}</div>
        <div class="st-hero-phones">${story.hero.map((src, i) => `<span class="st-phone" style="--i:${i}" data-zoom="${src}"><img src="${src}" alt=""></span>`).join('')}</div>
      </header>
      ${story.chapters.map((ch, i) => `
        <section class="st-chapter st-${ch.block.type}-ch">
          <div class="st-head cp-reveal">
            <span class="st-kicker"><i>✦ ${String(i + 1).padStart(2, '0')}</i>${esc(ch.kicker)}</span>
            <h2>${twoTone(ch.title)}</h2>
            ${ch.sub ? `<p>${esc(ch.sub)}</p>` : ''}
          </div>
          <div class="st-body cp-reveal">${blockHtml(ch.block)}</div>
        </section>`).join('')}
      <section class="st-wrap cp-reveal">
        <small>That’s a wrap</small>
        <h2>${esc(story.wrap.title[0])} <span class="st-scribble">${esc(story.wrap.title[1])}</span></h2>
        <p class="st-line">${esc(story.wrap.line)}</p>
        <p>Designed with care by Manoj Abburi.</p>
        <div class="st-wrap-links">
          <a href="mailto:uixmanoj@gmail.com">Email me ↗</a>
          <a href="#contact" data-close>Let’s talk ↗</a>
          <button type="button" data-close>Back to the box</button>
        </div>
      </section>
      <section class="st-more cp-reveal">
        <p>Got a minute for another story?</p>
        <div class="st-more-grid">${others.map(o => `
          <button type="button" class="st-more-card" data-next="${o.id}" style="--n1:${o.c1};--n2:${o.c2}">
            <span class="st-more-top"><i>${esc(cardInfo[o.id].mark)}</i><em>${o.type === 'mobile' ? 'Mobile app' : 'Website'}</em></span>
            <b>${esc(cardInfo[o.id].line)}</b>
            <span class="st-more-name">${esc(o.title)}</span>
            <small>Read the case study →</small>
          </button>`).join('')}</div>
      </section>
      <div class="st-lightbox" hidden>
        <button type="button" class="st-lb-close" aria-label="Close">×</button>
        <button type="button" class="st-lb-nav prev" aria-label="Previous screen">←</button>
        <figure><img alt=""><figcaption></figcaption></figure>
        <button type="button" class="st-lb-nav next" aria-label="Next screen">→</button>
      </div>`;
    setupStory();
  }

  // Interactions for a rendered story page
  let storyCleanup = null;
  function setupStory() {
    if (storyCleanup) storyCleanup();
    const cleanups = [];

    // Tabs (flows, steps, countries): switch panels with a short fade
    caseBody.querySelectorAll('.st-tabs').forEach(tabs => {
      const scope = tabs.parentElement;
      tabs.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-tab]');
        if (!btn) return;
        tabs.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-selected', String(b === btn)));
        scope.querySelectorAll('[data-panel]').forEach(p => {
          const show = p.dataset.panel === btn.dataset.tab;
          p.hidden = !show;
          if (show) {
            p.classList.remove('swap');
            void p.offsetWidth;
            p.classList.add('swap');
          }
        });
      });
    });

    // "Screen by screen": the sticky phone follows the item in view
    const cmpItems = caseBody.querySelectorAll('[data-cmp]');
    if (cmpItems.length && 'IntersectionObserver' in window) {
      const imgs = caseBody.querySelectorAll('[data-cmp-img]');
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const i = entry.target.dataset.cmp;
          cmpItems.forEach(it => it.classList.toggle('on', it.dataset.cmp === i));
          imgs.forEach(img => img.classList.toggle('on', img.dataset.cmpImg === i));
        });
      }, { root: caseModal, rootMargin: '-45% 0px -45% 0px' });
      cmpItems.forEach(it => io.observe(it));
      cleanups.push(() => io.disconnect());
    }

    // Reading progress bar + hero phone parallax
    const bar = caseBody.querySelector('.cp-progress i');
    const phones = caseBody.querySelector('.st-hero-phones');
    const onScroll = () => {
      const max = caseModal.scrollHeight - caseModal.clientHeight;
      const y = caseModal.scrollTop;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      if (phones && !prefersReducedMotion) phones.style.setProperty('--par', Math.min(y, 900));
    };
    caseModal.addEventListener('scroll', onScroll, { passive: true });
    cleanups.push(() => caseModal.removeEventListener('scroll', onScroll));
    onScroll();

    // Lightbox: tap any screen to see it large; arrows step through its group
    const lb = caseBody.querySelector('.st-lightbox');
    const lbImg = lb.querySelector('img');
    const lbCap = lb.querySelector('figcaption');
    let group = [];
    let at = 0;
    const show = (i) => {
      at = (i + group.length) % group.length;
      lbImg.src = group[at].dataset.zoom;
      lbCap.textContent = group[at].dataset.cap || '';
      lb.classList.toggle('single', group.length < 2);
    };
    const closeLb = () => {
      lb.hidden = true;
      lb.classList.remove('open');
    };
    caseBody.addEventListener('click', (e) => {
      const z = e.target.closest('[data-zoom]');
      if (z && !lb.contains(z)) {
        const container = z.closest('.st-panel, .st-hero-phones, .st-compare-list, .st-steps-wrap') || caseBody;
        group = [...container.querySelectorAll('[data-zoom]')].filter(el => el.offsetParent !== null);
        if (!group.length) group = [z];
        show(Math.max(group.indexOf(z), 0));
        lb.hidden = false;
        requestAnimationFrame(() => lb.classList.add('open'));
      }
    });
    lb.addEventListener('click', (e) => {
      if (e.target.closest('.prev')) show(at - 1);
      else if (e.target.closest('.next')) show(at + 1);
      else if (e.target === lb || e.target.closest('.st-lb-close')) closeLb();
    });
    const onKey = (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLb();
      } else if (e.key === 'ArrowRight') show(at + 1);
      else if (e.key === 'ArrowLeft') show(at - 1);
    };
    caseModal.addEventListener('keydown', onKey);
    // Esc closes the lightbox first, not the whole page
    const onCancel = (e) => {
      if (!lb.hidden) {
        e.preventDefault();
        closeLb();
      }
    };
    caseModal.addEventListener('cancel', onCancel);
    cleanups.push(() => {
      caseModal.removeEventListener('keydown', onKey);
      caseModal.removeEventListener('cancel', onCancel);
    });

    storyCleanup = () => cleanups.forEach(fn => fn());
  }

  function renderCase(cs) {
    const story = window.CASE_STORIES && window.CASE_STORIES[cs.id];
    caseBody.classList.remove('is-story');
    if (storyCleanup) {
      storyCleanup();
      storyCleanup = null;
    }
    if (story) {
      renderStory(cs, story);
      afterRender();
      return;
    }
    const idx = caseStudies.indexOf(cs);
    const next = caseStudies[(idx + 1) % caseStudies.length];
    const info = cardInfo[cs.id];
    caseBody.style.setProperty('--c1', cs.c1);
    caseBody.style.setProperty('--c2', cs.c2);
    caseBody.innerHTML = `
      <div class="cp-top">
        <button class="cp-back" type="button" data-close aria-label="Back to the portfolio">
          <svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <span class="cp-pill">${esc(cs.title)}</span>
      </div>
      <header class="cp-hero">
        <span class="cp-mark">${esc(info.mark)}</span>
        <h1 id="csTitle">${titleHtml(cs.title)}</h1>
        <p class="cp-sub">${esc(cs.headline)}<br><span>${esc(cs.category)}</span></p>
        <span class="cp-scroll">Scroll, the story starts here
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v17M6 14l6 6 6-6" /></svg>
        </span>
      </header>
      <div class="cs-content cp-body">
        <div class="cs-cover cp-reveal ${cs.img ? 'has-img' : ''} ${cs.type}">${coverHtml(cs)}</div>
        <dl class="cs-meta cp-reveal">
          <div><dt>Role</dt><dd>${esc(cs.role)}</dd></div>
          <div><dt>Type</dt><dd>${cs.type === 'mobile' ? 'Mobile product design' : 'Website design'}</dd></div>
          <div><dt>Tools</dt><dd>${cs.tools.map(esc).join(', ')}</dd></div>
        </dl>
        <section class="cp-reveal"><h4>Overview</h4><p>${esc(cs.overview)}</p></section>
        <section class="cp-reveal"><h4>My role</h4>${listHtml(cs.responsibilities)}</section>
        <section class="cp-reveal"><h4>${esc(cs.featuresLabel)}${cs.concept ? ' <span class="cs-concept">Concept</span>' : ''}</h4>${listHtml(cs.features)}</section>
        <section class="cp-reveal"><h4>Design approach</h4><p>${esc(cs.approach)}</p></section>
        <section class="cs-challenge cp-reveal">
          <div><h4>The challenge</h4><p>${esc(cs.challenge)}</p></div>
          <div><h4>How I solved it</h4><p>${esc(cs.solution)}</p></div>
        </section>
        <section class="cp-reveal"><h4>Deliverables</h4><div class="cs-chips">${cs.deliverables.map(d => `<span>${esc(d)}</span>`).join('')}</div></section>
        <blockquote class="cs-highlight cp-reveal">${esc(cs.highlight)}</blockquote>
        <a href="#contact" class="pill pill-yellow cs-cta cp-reveal" data-close>Talk to me about a project like this ↗</a>
        <button class="cp-next cp-reveal" type="button" data-next="${next.id}" style="--n1:${next.c1};--n2:${next.c2}">
          <small>Next project</small>
          <b>${esc(next.title)}</b>
          <span>${esc(next.headline)} →</span>
        </button>
      </div>`;
    afterRender();
  }

  function afterRender() {
    caseModal.scrollTop = 0;
    if (caseLenis) caseLenis.scrollTo(0, { immediate: true });
    requestAnimationFrame(() => {
      const hl = caseBody.querySelector('.cp-hero .hl, .st-hero .sg');
      if (hl) setTimeout(() => hl.classList.add('on'), 450);
    });

    if (caseRevealObserver) caseRevealObserver.disconnect();
    const reveals = caseBody.querySelectorAll('.cp-reveal, .st-hero');
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      caseRevealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            caseRevealObserver.unobserve(entry.target);
          }
        });
      }, { root: caseModal, threshold: 0, rootMargin: '0px 0px -12% 0px' });
      reveals.forEach(el => caseRevealObserver.observe(el));
    } else {
      reveals.forEach(el => el.classList.add('in'));
    }
  }

  function openCase(id) {
    const cs = caseStudies.find(c => c.id === id);
    if (!cs || !caseModal || typeof caseModal.showModal !== 'function') return;
    renderCase(cs);
    if (!caseModal.open) caseModal.showModal();
    // reset after the dialog is visible; a closed dialog can't be scrolled
    caseModal.scrollTop = 0;
    // the hero is always on screen at the top, so reveal it now instead of waiting for the observer
    requestAnimationFrame(() => {
      void caseBody.offsetWidth;
      caseBody.querySelectorAll('.st-hero, .cp-hero.cp-reveal').forEach(el => el.classList.add('in'));
    });
    if (caseLenis) caseLenis.scrollTo(0, { immediate: true });
    if (lenis) lenis.stop();
    if (window.Lenis && !prefersReducedMotion && !caseLenis) {
      caseLenis = new window.Lenis({ wrapper: caseModal, content: caseBody, lerp: 0.1 });
      caseLenisRef.current = caseLenis;
    }
  }

  // Card → page: a copy of the card lifts out, grows to fill the screen, then the case page fades in over it
  function zoomToCase(id, from, done) {
    const cs = caseStudies.find(c => c.id === id);
    if (!cs) return;
    const r = from && from.getBoundingClientRect();
    if (prefersReducedMotion || !r || !r.width || typeof document.body.animate !== 'function') {
      openCase(id);
      if (done) done();
      return;
    }
    const info = cardInfo[cs.id];
    const story = window.CASE_STORIES && window.CASE_STORIES[id];
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.min(340, vw * 0.72);
    const h = w * 1.3;
    const z = document.createElement('div');
    z.className = 'case-zoom';
    z.style.setProperty('--c1', cs.c1);
    z.style.setProperty('--c2', cs.c2);
    z.style.setProperty('--g1', story ? story.theme.g1 : cs.c1);
    z.style.setProperty('--g2', story ? story.theme.g2 : cs.c2);
    z.style.setProperty('--w', `${w}px`);
    z.style.setProperty('--h', `${h}px`);
    z.innerHTML = `
      <div class="cz-face">
        <span class="pc-top"><span class="pc-mark">${esc(info.mark)}</span><span class="pc-no">${String(caseStudies.indexOf(cs) + 1).padStart(2, '0')}</span></span>
        <span class="pc-name">${esc(cs.title)}</span>
        <span class="pc-line">${esc(info.line)}</span>
        <span class="pc-sub">${esc(info.sub)}</span>
      </div>
      <div class="cz-page"></div>`;
    document.body.appendChild(z);
    if (lenis) lenis.stop();

    const T = 1100;
    const at = (x, y, bw, bh, rad) => ({ left: `${x}px`, top: `${y}px`, width: `${bw}px`, height: `${bh}px`, borderRadius: `${rad}px` });
    const mid = at((vw - w) / 2, (vh - h) / 2, w, h, 28);
    const lift = 'cubic-bezier(0.22, 1, 0.36, 1)';
    const grow = 'cubic-bezier(0.76, 0, 0.24, 1)';
    // 1) lift to the centre, 2) hold a beat, 3) zoom to full screen
    z.animate([
      { ...at(r.left, r.top, r.width, r.height, 20), transform: 'rotate(0deg)', easing: lift },
      { ...mid, transform: 'rotate(-3deg)', offset: 0.38 },
      { ...mid, transform: 'rotate(0deg)', offset: 0.46, easing: grow },
      { ...at(0, 0, vw, vh, 0), transform: 'rotate(0deg)', boxShadow: '0 0 0 rgba(0,0,0,0)' }
    ], { duration: T, fill: 'forwards' });
    const s0 = r.width / w;
    const face = (k) => `translate(-50%, -50%) scale(${k})`;
    z.querySelector('.cz-face').animate([
      { transform: face(s0), opacity: 1, easing: lift },
      { transform: face(1), opacity: 1, offset: 0.38 },
      { transform: face(1), opacity: 1, offset: 0.46, easing: grow },
      { transform: face(2.2), opacity: 0, offset: 0.8 },
      { transform: face(2.2), opacity: 0 }
    ], { duration: T, fill: 'forwards' });
    z.querySelector('.cz-page').animate([
      { opacity: 0 },
      { opacity: 0, offset: 0.5 },
      { opacity: 1, offset: 0.85 },
      { opacity: 1 }
    ], { duration: T, fill: 'forwards' });

    setTimeout(() => {
      caseModal.classList.add('zoom-in');
      openCase(id);
      setTimeout(() => {
        z.remove();
        caseModal.classList.remove('zoom-in');
        if (done) done();
      }, 700);
    }, T * 0.8);
  }

  // Back: the page shrinks and fades to reveal the portfolio
  function closeCase() {
    if (!caseModal.open || caseModal.classList.contains('closing')) return;
    if (prefersReducedMotion) {
      caseModal.close();
      return;
    }
    caseModal.classList.add('closing');
    setTimeout(() => caseModal.close(), 400);
  }

  if (caseModal) {
    caseModal.addEventListener('click', (e) => {
      const nextBtn = e.target.closest('[data-next]');
      if (nextBtn) {
        openCase(nextBtn.dataset.next);
        return;
      }
      if (e.target.closest('[data-close]')) closeCase();
    });
    // Esc animates out too, unless the lightbox is open (that closes first)
    caseModal.addEventListener('cancel', (e) => {
      e.preventDefault();
      const lb = caseBody.querySelector('.st-lightbox');
      if (lb && !lb.hidden) return;
      closeCase();
    });
    caseModal.addEventListener('close', () => {
      caseModal.classList.remove('closing');
      if (caseLenis) {
        caseLenis.destroy();
        caseLenis = null;
        caseLenisRef.current = null;
      }
      if (lenis) lenis.start();
      // a "Talk to me" link closes the page, then scrolls to contact
      if (caseModal.dataset.goto) {
        scrollToTarget(caseModal.dataset.goto);
        delete caseModal.dataset.goto;
      }
    });
    caseModal.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (a) {
        e.preventDefault();
        caseModal.dataset.goto = a.getAttribute('href');
      }
    }, true);
  }

  // --- The box: cards built from caseStudies ---
  const boxScene = document.getElementById('boxScene');
  const boxCards = document.getElementById('boxCards');
  const workList = document.getElementById('workList');
  const viewBubble = document.getElementById('viewBubble');

  if (boxScene && boxCards && workList) {
    const cards = [];
    const items = [];
    let active = -1;

    const setActive = (i) => {
      if (i === active) return;
      active = i;
      cards.forEach((c, j) => c.classList.toggle('active', j === i));
      items.forEach((it, j) => it.classList.toggle('active', j === i));
      boxScene.classList.toggle('has-active', i >= 0);
    };

    // Click: the card zooms out of the box into its case study
    const popAndOpen = (i, from) => {
      const face = cards[i].querySelector('.pc-face');
      const src = from || face;
      if (viewBubble) viewBubble.classList.remove('show');
      cards[i].classList.add('popped');
      zoomToCase(caseStudies[i].id, src.getBoundingClientRect().width ? src : face, () => {
        cards[i].classList.remove('popped');
        setActive(-1);
      });
    };

    caseStudies.forEach((cs, i) => {
      const info = cardInfo[cs.id];
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'pcard';
      card.style.setProperty('--n', i);
      card.style.setProperty('--c1', cs.c1);
      card.style.setProperty('--c2', cs.c2);
      card.setAttribute('aria-label', `Open case study ${i + 1}: ${cs.title}`);
      card.innerHTML = `
        <span class="pc-face">
          <span class="pc-top"><span class="pc-mark">${esc(info.mark)}</span><span class="pc-no">${String(i + 1).padStart(2, '0')}</span></span>
          <span class="pc-name">${esc(cs.title)}</span>
          <span class="pc-line">${esc(info.line)}</span>
          <span class="pc-sub">${esc(info.sub)}</span>
        </span>
        <span class="pc-back">
          <span class="pc-label">The work</span>
          ${cs.features.slice(0, 3).map(f => `<span class="pc-feat">${esc(f)}</span>`).join('')}
          <span class="pc-open">Open case study ↗</span>
        </span>`;
      card.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') setActive(i); });
      card.addEventListener('click', (e) => {
        // touch: first tap flips the card, second tap opens it
        if (e.pointerType === 'touch' && active !== i) {
          setActive(i);
          return;
        }
        popAndOpen(i);
      });
      boxCards.appendChild(card);
      cards.push(card);

      const li = document.createElement('li');
      li.style.setProperty('--c1', cs.c1);
      li.innerHTML = `<button type="button"><span class="n">${String(i + 1).padStart(2, '0')}</span><span><b>${esc(cs.title)}</b><small>${esc(info.sub)}</small></span></button>`;
      li.addEventListener('pointerenter', () => setActive(i));
      li.querySelector('button').addEventListener('click', () => popAndOpen(i, cards[i].querySelector('.pc-face')));
      li.querySelector('button').addEventListener('focus', () => setActive(i));
      workList.appendChild(li);
      items.push(li);
    });

    boxScene.addEventListener('pointerleave', () => setActive(-1));

    // The box starts shut. Scrolling in swings the lid open, then the cards rise out one by one.
    const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const boxPin = document.getElementById('boxPin');
    const openBox = () => {
      // progress through the pinned stretch: 0 = just pinned (shut), 1 = about to unpin (open)
      const pinTop = parseFloat(getComputedStyle(boxScene).top) || 0;
      const travel = boxPin.offsetHeight - boxScene.offsetHeight;
      const p = prefersReducedMotion ? 1 : clamp01((pinTop - boxPin.getBoundingClientRect().top) / (travel * 0.85));
      const lid = easeOut(clamp01(p / 0.45));
      boxScene.style.setProperty('--lid', `${-90 + 120 * lid}deg`);
      boxScene.style.setProperty('--tag', (1 - clamp01(lid * 3)).toFixed(2));
      cards.forEach((card, i) => {
        const rise = easeOut(clamp01((p - 0.38 - i * 0.06) / 0.28));
        card.style.setProperty('--sink', `${Math.round((1 - rise) * 340)}px`);
      });
      const open = p >= 0.98;
      if (open !== boxScene.classList.contains('in')) {
        boxScene.classList.toggle('in', open);
        if (!open) setActive(-1);
      }
    };
    window.addEventListener('scroll', openBox, { passive: true });
    window.addEventListener('resize', openBox);
    openBox();

    // "View" bubble follows the pointer over the cards
    if (viewBubble && window.matchMedia('(hover: hover)').matches) {
      let tx = 0, ty = 0, x = 0, y = 0, running = false;
      const follow = () => {
        x += (tx - x) * 0.2;
        y += (ty - y) * 0.2;
        viewBubble.style.transform = `translate(${x}px, ${y}px)`;
        if (Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5) requestAnimationFrame(follow);
        else running = false;
      };
      boxScene.addEventListener('pointermove', (e) => {
        const r = boxScene.getBoundingClientRect();
        tx = e.clientX - r.left;
        ty = e.clientY - r.top;
        viewBubble.classList.toggle('show', !!e.target.closest('.pcard'));
        if (!running) {
          running = true;
          requestAnimationFrame(follow);
        }
      });
      boxScene.addEventListener('pointerleave', () => viewBubble.classList.remove('show'));
    }
  }

  // 7. Projects: card box + list open a details modal
  const projects = [
    {
      cat: 'Mobile experiences · 04+ apps designed',
      title: 'I design for the screen in your hand.',
      desc: 'From user flows and wireframes to polished interfaces and interactive prototypes. Shown here: Qennect, a community app for rallies, events, groups and finding people nearby.',
      tags: ['UX', 'Flow', 'Wireframe', 'UI', 'Prototype'],
      img: 'assets/work/qennect-phones.jpg', fit: 'contain', c1: '#f4efe6', c2: '#e9e1d3',
      cases: ['qennect', 'just-show-up', 'enfuze']
    },
    {
      cat: 'Digital experiences · 10+ websites designed',
      title: 'I design websites with a purpose.',
      desc: 'Digital experiences focused on clarity, usability, and visual impact, from site structure and UX to the final visual design.',
      tags: ['Structure', 'UX', 'Visual design', 'Usability'],
      img: 'assets/work/websites.jpg', c1: '#ff9a7b', c2: '#ef6f4f',
      cases: ['cloud-first', 'qennect-web', 'ingaje']
    },
    {
      cat: 'Visual communication · Social & marketing',
      title: 'I make brands look consistent.',
      desc: 'Visual content that helps brands communicate clearly across marketing campaigns and promotional creatives. Design that gets noticed.',
      tags: ['Marketing campaigns', 'Promotional creatives', 'Social media'],
      img: 'assets/work/visual-communication.jpg', c1: '#ffd27a', c2: '#e8a33a'
    },
    {
      cat: 'Presentation design',
      title: 'I turn information into a story.',
      desc: 'Company profiles, pitch decks, product presentations, marketing decks and internal presentations. Less information. Better structure. Stronger impact.',
      tags: ['Pitch decks', 'Company profiles', 'Product presentations', 'Marketing decks'],
      img: 'assets/work/presentations.jpg', c1: '#6fd39a', c2: '#2f9e5b'
    }
  ];

  const modal = document.getElementById('projectModal');
  if (modal && typeof modal.showModal === 'function') {
    const pmArt = document.getElementById('pmArt');
    const pmImg = document.getElementById('pmImg');
    const pmCases = document.getElementById('pmCases');
    const pmCat = document.getElementById('pmCat');
    const pmTitle = document.getElementById('pmTitle');
    const pmDesc = document.getElementById('pmDesc');
    const pmTags = document.getElementById('pmTags');

    const openProject = (index) => {
      const p = projects[index];
      if (!p) return;
      pmArt.style.setProperty('--c1', p.c1);
      pmArt.style.setProperty('--c2', p.c2);
      pmImg.src = p.img;
      pmImg.alt = p.title;
      pmImg.style.objectFit = p.fit || '';
      pmImg.style.objectPosition = p.fit ? 'center' : '';
      pmCases.innerHTML = '';
      (p.cases || []).forEach(id => {
        const cs = caseStudies.find(c => c.id === id);
        if (!cs) return;
        const b = document.createElement('button');
        b.type = 'button';
        b.innerHTML = `<b>${esc(cs.title)}</b><span>${esc(cs.headline)}</span><i aria-hidden="true">↗</i>`;
        b.addEventListener('click', () => {
          zoomToCase(id, b);
          modal.close();
        });
        pmCases.appendChild(b);
      });
      pmCat.textContent = p.cat;
      pmTitle.textContent = p.title;
      pmDesc.textContent = p.desc;
      pmTags.innerHTML = '';
      p.tags.forEach(tag => {
        const li = document.createElement('li');
        li.textContent = tag;
        pmTags.appendChild(li);
      });
      modal.showModal();
      if (lenis) lenis.stop();
    };

    document.querySelectorAll('[data-project]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openProject(Number(btn.dataset.project));
      });
    });

    document.getElementById('pmClose').addEventListener('click', () => modal.close());
    document.getElementById('pmCta').addEventListener('click', () => modal.close());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.close();
    });
  }

  // 8. Stack: unwrap the gift
  const giftStage = document.getElementById('giftStage');
  if (giftStage) {
    const unwrap = () => giftStage.classList.add('open');
    document.getElementById('giftBtn').addEventListener('click', unwrap);
    document.getElementById('giftCta').addEventListener('click', unwrap);
  }

  // 9. Process: one screen evolves through five stages while the section is pinned
  const forge = document.getElementById('forge');
  if (forge) {
    const stick = forge.querySelector('.forge-stick');
    const stage = forge.querySelector('.forge-stage');
    const canvas = forge.querySelector('.forge-canvas');
    const items = [...forge.querySelectorAll('.forge-rail li')];
    const count = forge.querySelector('.forge-count b');
    const cap = forge.querySelector('.forge-cap');
    const n = items.length;
    let current = -1;

    // the canvas is drawn at 600×600 and scaled to whatever room the stage has
    const fit = () => {
      const room = stage.clientWidth < 500 ? 610 : 660;
      const k = Math.min(stage.clientWidth / room, stage.clientHeight / room, 1.2);
      canvas.style.setProperty('--k', k.toFixed(3));
    };

    const updateForge = () => {
      const r = forge.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? Math.min(Math.max(-r.top / span, 0), 0.9999) : 0;
      const s = Math.floor(p * n);
      items.forEach((li, i) => li.style.setProperty('--p', i < s ? 1 : i > s ? 0 : (p * n - s).toFixed(3)));
      if (s === current) return;
      current = s;
      stick.dataset.stage = s;
      items.forEach((li, i) => {
        li.classList.toggle('on', i === s);
        li.classList.toggle('done', i < s);
      });
      count.textContent = String(s + 1).padStart(2, '0');
      cap.textContent = items[s].querySelector('small').textContent;
      // keep the active pill in view on phones
      const pill = items[s];
      pill.parentElement.scrollTo({ left: pill.offsetLeft - 16, behavior: 'smooth' });
    };

    // a stage button scrolls to the middle of that stage's stretch
    forge.querySelectorAll('[data-go]').forEach(btn => {
      btn.addEventListener('click', () => {
        const span = forge.offsetHeight - window.innerHeight;
        const y = forge.getBoundingClientRect().top + window.scrollY + span * ((Number(btn.dataset.go) + 0.5) / n);
        if (lenis) lenis.scrollTo(y, { duration: 1.2 });
        else window.scrollTo({ top: y, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    });

    window.addEventListener('scroll', updateForge, { passive: true });
    window.addEventListener('resize', () => {
      fit();
      updateForge();
    });
    fit();
    updateForge();
  }

  // 10. Contact keycaps: keyboard shortcuts M / I / L / R and email copy
  const keyLinks = {};
  document.querySelectorAll('.key[data-key]').forEach(key => { keyLinks[key.dataset.key] = key; });

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || isTyping(document.activeElement)) return;
    if ((modal && modal.open) || (caseModal && caseModal.open)) return;
    const key = keyLinks[e.key.toLowerCase()];
    if (!key) return;
    key.classList.add('pressed');
    setTimeout(() => {
      key.classList.remove('pressed');
      key.click();
    }, 140);
  });

  const copyMail = document.getElementById('copyMail');
  if (copyMail) {
    copyMail.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('uixmanoj@gmail.com');
        showToast('Email copied to clipboard!');
      } catch (err) {
        window.location.href = 'mailto:uixmanoj@gmail.com';
      }
    });
  }

  const resumeBtn = document.getElementById('resumeBtn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => showToast('Manoj Resume download started!'));
  }

  // 11. Contact note: validate, then hand off to WhatsApp
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const submitBtn = contactForm.querySelector('.form-submit');
    const originalBtnHtml = submitBtn.innerHTML;

    // Inline Error Helpers
    const clearFieldErrors = () => {
      contactForm.querySelectorAll('.form-control').forEach(input => {
        input.classList.remove('is-invalid');
      });
      contactForm.querySelectorAll('.field-error-msg').forEach(msg => msg.remove());
    };

    const showFieldError = (input, msgText) => {
      input.classList.add('is-invalid');
      let errSpan = input.parentNode.querySelector('.field-error-msg');
      if (!errSpan) {
        errSpan = document.createElement('span');
        errSpan.className = 'field-error-msg';
        input.parentNode.appendChild(errSpan);
      }
      errSpan.textContent = msgText;
    };

    // Keyboard shortcut: Shift+Enter = new line, Enter = submit
    if (messageInput) {
      messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          contactForm.requestSubmit();
        }
      });
    }

    // Clear a field's error as soon as the user types
    [nameInput, emailInput, messageInput].forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          input.classList.remove('is-invalid');
          const errSpan = input.parentNode.querySelector('.field-error-msg');
          if (errSpan) errSpan.remove();
        });
      }
    });

    // The note goes to WhatsApp, written and ready for the visitor to send
    const WHATSAPP_NUMBER = '916300692483';
    const openWhatsApp = (name, email, message) => {
      const text = `Hi Manoj, I found you through your portfolio.\n\n${message}\n\n— ${name}\n${email}`;
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
      // must run inside the click, or the browser blocks the new tab
      const win = window.open(url, '_blank');
      if (!win) window.location.href = url;
    };

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearFieldErrors();

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      let hasError = false;

      if (!name || name.length < 2) {
        showFieldError(nameInput, 'Name must be at least 2 characters long.');
        hasError = true;
      } else if (name.length > 100) {
        showFieldError(nameInput, 'Name cannot exceed 100 characters.');
        hasError = true;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        showFieldError(emailInput, 'Please enter a valid email address.');
        hasError = true;
      }

      if (!message || message.length < 10) {
        showFieldError(messageInput, 'Message must be at least 10 characters long.');
        hasError = true;
      } else if (message.length > 3000) {
        showFieldError(messageInput, 'Message cannot exceed 3000 characters.');
        hasError = true;
      }

      if (hasError) return;

      openWhatsApp(name, email, message);

      submitBtn.classList.add('submit-success');
      submitBtn.textContent = 'Opening WhatsApp ✓';
      showToast('Your note is ready in WhatsApp. Just hit send.', 4500);
      contactForm.reset();
      setTimeout(() => {
        submitBtn.classList.remove('submit-success');
        submitBtn.innerHTML = originalBtnHtml;
      }, 3500);
    });
  }

});
