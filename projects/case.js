/* Scroll-stacked cards for the case-study pages.
 *
 * Markup contract:
 *   <div class="stack" data-stack>
 *     <div class="stack-track" data-track>
 *       <div class="stack-vp" data-vp>
 *         <div class="stack-head">…<div class="stack-ticks" data-ticks></div></div>
 *         <div class="stack-cards" data-cards>
 *           <article class="stack-card" data-card>…</article>
 *         </div>
 *       </div>
 *     </div>
 *   </div>
 *
 * Falls back to a plain vertical list when JS is off, on narrow screens, or
 * when the visitor prefers reduced motion.
 */
(function () {
    'use strict';

    var STICKY_TOP = 104;   // minimum px below the fixed header
    var PER_CARD   = 0.62;  // scroll distance per card, as a fraction of viewport height
    var LIFT       = 40;    // px a retreating card moves up
    var DROP       = 150;   // px an incoming card travels up from
    var SHRINK     = 0.07;  // scale lost by a retreating card
    var FADE       = 0.28;  // fraction of a step spent fading (kept short: the
                            // cards are opaque, so the incoming one covers the
                            // outgoing one instead of cross-fading into mush)

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var wide   = window.matchMedia('(min-width: 768px)');

    var stacks = Array.prototype.map.call(
        document.querySelectorAll('[data-stack]'),
        function (el) {
            var cards = Array.prototype.slice.call(el.querySelectorAll('[data-card]'));
            var ticks = el.querySelector('[data-ticks]');
            if (ticks) {
                cards.forEach(function () {
                    var t = document.createElement('span');
                    t.className = 'stack-tick';
                    ticks.appendChild(t);
                });
            }
            return {
                el: el,
                track: el.querySelector('[data-track]'),
                vp: el.querySelector('[data-vp]'),
                box: el.querySelector('[data-cards]'),
                cards: cards,
                ticks: ticks ? Array.prototype.slice.call(ticks.children) : [],
                vpH: 0,
                stickyTop: STICKY_TOP
            };
        }
    );

    var enabled = false;

    function clearInline(s) {
        s.track.style.height = '';
        s.box.style.height = '';
        s.vp.style.top = '';
        s.cards.forEach(function (c) {
            c.style.transform = '';
            c.style.opacity = '';
            c.style.zIndex = '';
            c.style.pointerEvents = '';
        });
        s.ticks.forEach(function (t) { t.classList.remove('is-on'); });
    }

    function measure(s) {
        // Measure natural heights with the cards in normal flow.
        s.el.classList.remove('is-stacked');
        var tallest = 0;
        s.cards.forEach(function (c) {
            if (c.offsetHeight > tallest) { tallest = c.offsetHeight; }
        });
        s.el.classList.add('is-stacked');
        s.box.style.height = tallest + 'px';

        // Pinned block = heading + tallest card. Centre it in the viewport so
        // the pinned state doesn't leave a void underneath.
        s.vpH = s.vp.offsetHeight;
        var top = Math.round((window.innerHeight - s.vpH) / 2);
        if (top < STICKY_TOP) { top = STICKY_TOP; }
        s.vp.style.top = top + 'px';
        s.stickyTop = top;

        s.track.style.height =
            (s.vpH + (s.cards.length - 1) * window.innerHeight * PER_CARD) + 'px';
    }

    function render(s) {
        var rect = s.track.getBoundingClientRect();
        var range = s.track.offsetHeight - s.vpH;
        var p = range > 0 ? (s.stickyTop - rect.top) / range : 0;
        if (p < 0) { p = 0; } else if (p > 1) { p = 1; }

        var pos = p * (s.cards.length - 1);

        s.cards.forEach(function (card, i) {
            var d = pos - i;               // 0 = front and centre
            var y, scale, opacity;

            if (d <= -1 || d >= 1) {
                card.style.opacity = '0';
                card.style.pointerEvents = 'none';
                card.style.transform = 'translate3d(0,' + (d < 0 ? DROP : -LIFT) + 'px,0)';
                card.style.zIndex = String(i);
                return;
            }

            // Opaque for most of the step, fading only at the far edge.
            opacity = (1 - Math.abs(d)) / FADE;
            if (opacity > 1) { opacity = 1; } else if (opacity < 0) { opacity = 0; }

            if (d < 0) {                   // sliding up into place, covering the card behind
                y = DROP * -d;
                scale = 1;
            } else {                       // retreating backwards
                y = -LIFT * d;
                scale = 1 - SHRINK * d;
            }

            card.style.transform = 'translate3d(0,' + y.toFixed(2) + 'px,0) scale(' + scale.toFixed(4) + ')';
            card.style.opacity = opacity.toFixed(3);
            card.style.pointerEvents = Math.abs(d) < 0.5 ? 'auto' : 'none';
            card.style.zIndex = String(i);
        });

        var current = Math.round(pos);
        s.ticks.forEach(function (t, i) {
            t.classList.toggle('is-on', i <= current);
        });
    }

    var queued = false;
    function onScroll() {
        if (queued) { return; }
        queued = true;
        window.requestAnimationFrame(function () {
            queued = false;
            if (!enabled) { return; }
            stacks.forEach(render);
        });
    }

    function sync() {
        var want = wide.matches && !reduce.matches;
        if (want === enabled) {
            if (enabled) { stacks.forEach(function (s) { measure(s); render(s); }); }
            return;
        }
        enabled = want;
        if (enabled) {
            stacks.forEach(function (s) { measure(s); render(s); });
        } else {
            stacks.forEach(function (s) {
                s.el.classList.remove('is-stacked');
                clearInline(s);
            });
        }
    }

    if (!stacks.length) { return; }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', sync);
    if (reduce.addEventListener) { reduce.addEventListener('change', sync); }
    if (wide.addEventListener) { wide.addEventListener('change', sync); }
    window.addEventListener('load', sync);
    sync();
}());
