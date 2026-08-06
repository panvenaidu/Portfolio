/* ============================================================================
   anime.js v4 motion layer — LIGHT design only
   ----------------------------------------------------------------------------
   Scoped deliberately: dark.js already owns the dark design's motion, and two
   engines writing the same inline styles would fight. The light design only had
   section fades, so this is where a real library earns its weight.

   Three v4 features from the anime.js docs, not hand-rolled tweens:
     1. text.scrambleText  — hero wordmark decodes into place
     2. stagger({ grid })  — project cards bloom outward from the centre
     3. svg.createDrawable — section underlines draw themselves left to right

   Vendored in /vendor so the page never depends on a CDN. Everything is
   authored visible in the markup; this only animates FROM a hidden state it
   sets itself, after confirming the library loaded and motion is welcome.
   ========================================================================== */
(function () {
    'use strict';

    if (!window.anime) return;
    var A = window.anime;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var animate = A.animate,
        stagger = A.stagger,
        scrambleText = A.text && A.text.scrambleText,
        createDrawable = A.svg && A.svg.createDrawable;

    function isLight() {
        return document.documentElement.getAttribute('data-theme') !== 'dark';
    }

    var done = new WeakSet();
    function once(el) {
        if (!el || done.has(el)) return false;
        done.add(el);
        return true;
    }

    /* ---- 1. hero wordmark decodes ---------------------------------------- */
    function heroScramble() {
        var h1 = document.querySelector('.pn-light #hero h1');
        if (!once(h1) || !scrambleText) return;
        try {
            scrambleText(h1, { duration: 1400, speed: 28, ease: 'outQuad' });
        } catch (e) { /* leave the real text in place */ }
    }

    /* ---- 2. project cards bloom from the centre --------------------------
       These carry .stagger-child, which the page's own observer fades in. Drop
       that class first so exactly one system owns each card. */
    function cardGrid() {
        var cards = document.querySelectorAll('.pn-light #projects .stagger-child');
        if (!cards.length || !once(cards[0])) return;

        cards.forEach(function (c) {
            c.classList.remove('stagger-child');
            c.style.opacity = '0';
        });

        animate(cards, {
            opacity: [0, 1],
            scale: [0.86, 1],
            duration: 900,
            ease: 'out(3)',
            delay: stagger(90, { grid: [2, Math.ceil(cards.length / 2)], from: 'center' }),
            autoplay: A.onScroll
                ? A.onScroll({ enter: 'bottom-=100 top', once: true })
                : true
        });
    }

    /* ---- 3. section underlines draw themselves ---------------------------
       The rule is a border on the heading's wrapper. Swap it for an SVG line
       so createDrawable can stroke it on, then draw as it scrolls in. */
    function drawRules() {
        if (!createDrawable) return;

        document.querySelectorAll('.pn-light h2').forEach(function (h2) {
            var box = h2.closest('.border-b-2');
            if (!box || !once(box)) return;

            box.classList.remove('border-b-2');
            box.style.position = 'relative';

            var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 100 2');
            svg.setAttribute('preserveAspectRatio', 'none');
            svg.setAttribute('aria-hidden', 'true');
            svg.style.cssText =
                'position:absolute;left:0;bottom:-2px;width:100%;height:2px;overflow:visible';

            var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '0');
            line.setAttribute('y1', '1');
            line.setAttribute('x2', '100');
            line.setAttribute('y2', '1');
            line.setAttribute('stroke', 'currentColor');
            line.setAttribute('stroke-width', '2');
            line.setAttribute('vector-effect', 'non-scaling-stroke');
            svg.appendChild(line);
            box.appendChild(svg);

            try {
                animate(createDrawable(line), {
                    draw: ['0 0', '0 1'],
                    duration: 1100,
                    ease: 'inOutQuart',
                    autoplay: A.onScroll
                        ? A.onScroll({ enter: 'bottom-=60 top', once: true })
                        : true
                });
            } catch (e) {
                box.classList.add('border-b-2');   // put the plain rule back
                svg.remove();
            }
        });
    }

    /* ---- toggle press: a ring pings out of the button --------------------- */
    function pingToggle(btn) {
        var host = btn.closest('.theme-indicator-wrapper') || btn.parentNode;
        if (!host) return;
        var ring = document.createElement('span');
        ring.className = 'pn-ping';
        host.appendChild(ring);
        animate(ring, {
            scale: [{ from: 0.6, to: 1.9 }],
            opacity: [{ from: 0.55, to: 0 }],
            duration: 700,
            ease: 'outQuad',
            onComplete: function () { if (ring.parentNode) ring.remove(); }
        });
    }

    function startLight() {
        if (!isLight()) return;
        heroScramble();
        cardGrid();
        drawRules();
    }

    function boot() {
        document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
            btn.addEventListener('click', function () { pingToggle(btn); });
        });
        startLight();
        /* Loaded in dark? The light markup is display:none and measures wrong,
           so wait until it is actually on screen. */
        window.addEventListener('pn:themechange', function (e) {
            if (e.detail && e.detail.theme === 'light') startLight();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
