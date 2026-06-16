/* ============================================================
   INOVA ANÁPOLIS — Motion Engine
   Sistema de motion design · vanilla, zero dependências
   Conceito: "ativos isolados → ecossistema integrado"
   ------------------------------------------------------------
   Módulos:
     1. Rede Viva (canvas) — nós, conexões, fluxos e pulsos
     2. Parallax de profundidade do hero (scroll + mouse)
     3. Logo orgânica (respiração + reação)
     4. Scroll storytelling (reveal coreografado)
     5. Data viz viva (KPIs, barras, donut)
     6. Magnetic hover + nav shrink + barra de progresso
   Acessibilidade: respeita prefers-reduced-motion em tudo.
   ============================================================ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BRAND = {
    navy:  '#001A2E',
    deep:  '#000014',
    green: '#00E5C8',
    greenD:'#00E5A0',
    blue:  '#2A6F97',
    teal:  '#00E5C8',
    light: '#8FC5E0'
  };

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  /* ----------------------------------------------------------
     1. REDE VIVA — Canvas
     O hero deixa de ser estático e passa a respirar como um
     ecossistema: nós (atores) que se conectam por proximidade,
     pulsos de conhecimento que viajam pelas arestas, e parallax
     de profundidade que reage ao mouse. Significado: conexão,
     fluxo e inteligência coletiva.
  ---------------------------------------------------------- */
  function LivingNetwork(canvas) {
    var ctx = canvas.getContext('2d');
    var hero = canvas.parentElement;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    var nodes = [];
    var pulses = [];
    var palette = [BRAND.navy, BRAND.blue, BRAND.teal, BRAND.green, BRAND.greenD, BRAND.light];
    // Parallax do cursor: alvo (tx/ty) é interpolado suavemente. Inicia no
    // centro (não em -9999) para nunca provocar "lurch"/reinício ao reentrar.
    var mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false, init: false };
    var raf = null, running = false, lastPulse = 0, assemble = 0;

    function size() {
      var r = hero.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!mouse.init) {
        mouse.x = mouse.tx = W / 2;
        mouse.y = mouse.ty = H / 2;
        mouse.init = true;
      }
      build();
    }

    function build() {
      var target = Math.round(Math.min(46, Math.max(14, (W * H) / 26000)));
      nodes = [];
      for (var i = 0; i < target; i++) {
        var depth = 0.32 + Math.random() * 0.68;
        nodes.push({
          hx: Math.random() * W,
          hy: Math.random() * H,
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: (1.1 + Math.random() * 2.0) * depth,
          z: depth,
          color: palette[(Math.random() * palette.length) | 0],
          phase: Math.random() * Math.PI * 2
        });
      }
      pulses = [];
    }

    var maxDist = 168;

    function step(t) {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      var cx = W / 2, cy = H / 2;
      if (!mouse.active) { mouse.tx = cx; mouse.ty = cy; }
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;

      assemble = Math.min(1, assemble + 0.012);
      var ease = assemble * assemble * (3 - 2 * assemble);

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.phase += 0.01;
        n.hx += n.vx; n.hy += n.vy;
        if (n.hx < 0 || n.hx > W) n.vx *= -1;
        if (n.hy < 0 || n.hy > H) n.vy *= -1;
        n.hx = Math.max(0, Math.min(W, n.hx));
        n.hy = Math.max(0, Math.min(H, n.hy));

        var drift = mouse.active ? 0 : Math.sin(t / 4000) * cx * 0.02;
        var px = ((mouse.x - cx) + drift) * n.z * 0.06;
        var py = (mouse.y - cy) * n.z * 0.06;
        n.x = n.hx + px + Math.sin(n.phase) * 2 * n.z;
        n.y = n.hy + py + Math.cos(n.phase) * 2 * n.z;
      }

      for (var a = 0; a < nodes.length; a++) {
        for (var b = a + 1; b < nodes.length; b++) {
          var na = nodes[a], nb = nodes[b];
          var dx = na.x - nb.x, dy = na.y - nb.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) {
            var alpha = (1 - d / maxDist) * 0.62 * ease * Math.min(na.z, nb.z);
            ctx.strokeStyle = 'rgba(0,26,46,' + alpha.toFixed(3) + ')';
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(na.x, na.y);
            ctx.lineTo(nb.x, nb.y);
            ctx.stroke();
          }
        }
      }

      if (mouse.active) {
        for (var m = 0; m < nodes.length; m++) {
          var nm = nodes[m];
          var mdx = nm.x - mouse.x, mdy = nm.y - mouse.y;
          var md = Math.sqrt(mdx * mdx + mdy * mdy);
          if (md < 150) {
            ctx.strokeStyle = 'rgba(42,111,151,' + ((1 - md / 150) * 0.45).toFixed(3) + ')';
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(nm.x, nm.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      for (var k = 0; k < nodes.length; k++) {
        var nk = nodes[k];
        ctx.globalAlpha = (0.45 + nk.z * 0.5) * ease;
        ctx.fillStyle = nk.color;
        ctx.beginPath();
        ctx.arc(nk.x, nk.y, nk.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (t - lastPulse > 520 && nodes.length > 1 && ease > 0.5) {
        lastPulse = t;
        var src = nodes[(Math.random() * nodes.length) | 0];
        var best = null, bestD = maxDist;
        for (var p = 0; p < nodes.length; p++) {
          if (nodes[p] === src) continue;
          var ddx = nodes[p].x - src.x, ddy = nodes[p].y - src.y;
          var dd = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dd < bestD) { bestD = dd; best = nodes[p]; }
        }
        if (best) pulses.push({ a: src, b: best, t: 0, color: src.color });
      }
      for (var pi = pulses.length - 1; pi >= 0; pi--) {
        var pl = pulses[pi];
        pl.t += 0.018;
        if (pl.t >= 1) { pulses.splice(pi, 1); continue; }
        var ex = pl.a.x + (pl.b.x - pl.a.x) * pl.t;
        var ey = pl.a.y + (pl.b.y - pl.a.y) * pl.t;
        var glow = Math.sin(pl.t * Math.PI);
        ctx.globalAlpha = glow * 0.9 * ease;
        ctx.fillStyle = pl.color;
        ctx.shadowColor = pl.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(ex, ey, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(step);
    }

    function start() { if (!running) { running = true; raf = requestAnimationFrame(step); } }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.isIntersecting ? start() : stop(); });
      }, { threshold: 0.01 }).observe(hero);
    } else { start(); }

    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      mouse.tx = e.clientX - r.left;
      mouse.ty = e.clientY - r.top;
      mouse.active = true;
    });
    hero.addEventListener('mouseleave', function () { mouse.active = false; });

    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 160); });
    size();
  }

  /* ----------------------------------------------------------
     2. PARALLAX DE PROFUNDIDADE DO HERO + 3. LOGO ORGÂNICA
  ---------------------------------------------------------- */
  function heroDepth() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var grid = hero.querySelector('.hero__dot-grid');
    var content = hero.querySelector('.hero__inner');
    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight) {
          if (grid) grid.style.transform = 'translateY(' + (y * 0.18) + 'px)';
          if (content) {
            content.style.transform = 'translateY(' + (y * -0.05) + 'px)';
            content.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.9)));
          }
        }
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ----------------------------------------------------------
     4. SCROLL STORYTELLING — reveal coreografado
  ---------------------------------------------------------- */
  function reveals() {
    var groups = document.querySelectorAll('.section-inner');
    var revealSel = ['.mono-label', '.section-title', '.section-lead', '.section-lead--dark',
      '.sub-label', '.concept-card', '.concept-card--plain', '.logo-panel', '.logo-variant',
      '.color-swatch', '.neutral-swatch', '.mini-swatch', '.type-card', '.type-scale',
      '.spacing-card', '.radius-card', '.grid-card', '.elevation-card', '.icon-tile',
      '.comp-panel', '.startup-card', '.data-table-wrap', '.kpi-card', '.chart-panel',
      '.pattern-tile', '.logo-clearspace', '.logo-misuse'];

    groups.forEach(function (group) {
      var items = group.querySelectorAll(revealSel.join(','));
      items.forEach(function (el, i) {
        el.setAttribute('data-reveal', '');
        el.style.setProperty('--reveal-delay', Math.min(i * 55, 360) + 'ms');
      });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------
     5. DATA VIZ VIVA — KPIs, barras e donut animam ao entrar
  ---------------------------------------------------------- */
  function countUp(el) {
    var raw = el.textContent.trim();
    var m = raw.match(/([^\d]*)([\d.,]+)(.*)$/s);
    if (!m) return;
    var prefix = m[1];
    var numStr = m[2];
    var decimals = (numStr.split(/[.,]/)[1] || '').length;
    var sep = numStr.indexOf(',') > -1 ? ',' : (numStr.indexOf('.') > -1 ? '.' : '');
    var target = parseFloat(numStr.replace(/\./g, '').replace(',', '.'));
    if (isNaN(target)) return;
    var dur = 1300, t0 = null;
    function frame(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      var out = decimals ? val.toFixed(decimals).replace('.', sep) : Math.round(val).toString();
      el.firstChild.nodeValue = prefix + out;
      if (p < 1) requestAnimationFrame(frame);
    }
    if (el.firstChild && el.firstChild.nodeType === 3) {
      el.firstChild.nodeValue = prefix + (decimals ? (0).toFixed(decimals) : '0');
      requestAnimationFrame(frame);
    }
  }

  function dataViz() {
    var dash = document.querySelector('.dashboard');
    if (!dash) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);

        e.target.querySelectorAll('.kpi-card__value').forEach(countUp);

        e.target.querySelectorAll('.bar-col__bar').forEach(function (bar, i) {
          var h = bar.style.height || getComputedStyle(bar).height;
          bar.style.transition = 'none';
          bar.style.height = '0%';
          void bar.offsetHeight;
          bar.style.transition = 'height 1s cubic-bezier(.22,.61,.36,1) ' + (i * 90) + 'ms';
          requestAnimationFrame(function () { bar.style.height = h; });
        });

        var donut = e.target.querySelector('.donut');
        if (donut) {
          donut.style.setProperty('--donut-sweep', '0deg');
          donut.classList.add('donut--animate');
          requestAnimationFrame(function () {
            donut.style.setProperty('--donut-sweep', '360deg');
          });
        }
      });
    }, { threshold: 0.3 });

    io.observe(dash);
  }

  /* ----------------------------------------------------------
     6. MAGNETIC HOVER — botões e marca atraem o cursor
  ---------------------------------------------------------- */
  function magnetic() {
    var els = document.querySelectorAll('.btn--primary, .btn--accent, .nav__brand, .startup-card');
    els.forEach(function (el) {
      var strength = el.classList.contains('startup-card') ? 6 : 10;
      el.style.transition = 'transform .25s cubic-bezier(.22,.61,.36,1)';
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2;
        var my = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + (mx / r.width * strength) + 'px,' + (my / r.height * strength) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ----------------------------------------------------------
     7. NAV SHRINK + BARRA DE PROGRESSO DE SCROLL
  ---------------------------------------------------------- */
  function chrome() {
    var nav = document.querySelector('.nav');
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
    var ticking = false;
    function update() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        var p = max > 0 ? h.scrollTop / max : 0;
        bar.style.transform = 'scaleX(' + p + ')';
        if (nav) nav.classList.toggle('nav--scrolled', h.scrollTop > 24);
        ticking = false;
      });
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ----------------------------------------------------------
     8. CÓPIA DE COR — clipboard vanilla + toast
  ---------------------------------------------------------- */
  function clipboard() {
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
    var hideT;

    function show(val) {
      toast.innerHTML = '<span class="toast__check">✓</span>Copiado <span class="toast__hex"></span>';
      toast.querySelector('.toast__hex').textContent = val;
      toast.classList.add('toast--show');
      clearTimeout(hideT);
      hideT = setTimeout(function () { toast.classList.remove('toast--show'); }, 1500);
    }

    function legacy(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-9999px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
    }

    function copy(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)['catch'](function () { legacy(text); });
      } else {
        legacy(text);
      }
    }

    document.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-copy]') : null;
      if (!el) return;
      var val = el.getAttribute('data-copy');
      if (!val) return;
      copy(val);
      show(val);
      el.classList.add('is-copied');
      setTimeout(function () { el.classList.remove('is-copied'); }, 650);
    });
  }

  /* ----------------------------------------------------------
     9. DASHBOARD — FLUXO DIRECIONAL
  ---------------------------------------------------------- */
  function DashboardFlow(canvas) {
    var ctx = canvas.getContext('2d');
    var host = canvas.parentElement;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, nodes = [], links = [], pulses = [];
    var raf = null, running = false, lastPulse = 0;
    var palette = [BRAND.light, BRAND.teal, BRAND.green, BRAND.greenD, BRAND.blue];

    function size() {
      var r = host.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function build() {
      nodes = []; links = []; pulses = [];
      var cols = W < 640 ? 4 : 6, rows = 3;
      for (var c = 0; c < cols; c++) {
        for (var rr = 0; rr < rows; rr++) {
          nodes.push({
            x: (c + 0.5) / cols * W + (Math.random() - 0.5) * (W / cols) * 0.4,
            y: (rr + 0.5) / rows * H + (Math.random() - 0.5) * (H / rows) * 0.5,
            r: 1.5 + Math.random() * 1.6,
            color: palette[(Math.random() * palette.length) | 0],
            phase: Math.random() * Math.PI * 2,
            col: c
          });
        }
      }
      for (var i = 0; i < nodes.length; i++) {
        for (var j = 0; j < nodes.length; j++) {
          if (nodes[j].col === nodes[i].col + 1 &&
              Math.abs(nodes[j].y - nodes[i].y) < H * 0.45) {
            links.push({ a: nodes[i], b: nodes[j] });
          }
        }
      }
    }

    function step(t) {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      var i, n;
      for (i = 0; i < nodes.length; i++) { nodes[i].phase += 0.012; }

      for (var l = 0; l < links.length; l++) {
        var a = links[l].a, b = links[l].b;
        var ay = a.y + Math.sin(a.phase) * 3, by = b.y + Math.sin(b.phase) * 3;
        var g = ctx.createLinearGradient(a.x, ay, b.x, by);
        g.addColorStop(0, 'rgba(143,197,224,0.12)');
        g.addColorStop(1, 'rgba(0,229,160,0.12)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x, ay); ctx.lineTo(b.x, by); ctx.stroke();
      }

      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        var ny = n.y + Math.sin(n.phase) * 3;
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = n.color;
        ctx.beginPath(); ctx.arc(n.x, ny, n.r, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (t - lastPulse > 340 && links.length) {
        lastPulse = t;
        var lk = links[(Math.random() * links.length) | 0];
        pulses.push({ a: lk.a, b: lk.b, t: 0, color: lk.a.color });
      }
      for (var pi = pulses.length - 1; pi >= 0; pi--) {
        var pl = pulses[pi];
        pl.t += 0.014;
        if (pl.t >= 1) { pulses.splice(pi, 1); continue; }
        var pay = pl.a.y + Math.sin(pl.a.phase) * 3, pby = pl.b.y + Math.sin(pl.b.phase) * 3;
        var ex = pl.a.x + (pl.b.x - pl.a.x) * pl.t;
        var ey = pay + (pby - pay) * pl.t;
        ctx.strokeStyle = 'rgba(143,197,224,0.28)';
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(pl.a.x, pay); ctx.lineTo(ex, ey); ctx.stroke();
        var glow = Math.sin(pl.t * Math.PI);
        ctx.globalAlpha = glow;
        ctx.fillStyle = pl.color;
        ctx.shadowColor = pl.color;
        ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(ex, ey, 2.4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(step);
    }

    function start() { if (!running) { running = true; raf = requestAnimationFrame(step); } }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.isIntersecting ? start() : stop(); });
      }, { threshold: 0.01 }).observe(host);
    } else { start(); }

    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 160); });
    size();
  }

  /* ---------------------------- BOOT ---------------------------- */
  onReady(function () {
    chrome();
    clipboard();

    if (REDUCED) {
      document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var canvas = document.querySelector('.hero__network');
    if (canvas) LivingNetwork(canvas);
    var flow = document.querySelector('.dashboard__flow');
    if (flow) DashboardFlow(flow);
    heroDepth();
    reveals();
    dataViz();
    magnetic();
  });
})();
