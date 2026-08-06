/* ============================================================================
   Dark-theme motion runtime (homepage only)
   ----------------------------------------------------------------------------
   Ported from the Design Canvas source of the editorial teal design. The
   project pages are restyled by dark.css alone and do not load this file.

   Two rules this file is built around, both carried over from the original:

     1. Content is authored in its VISIBLE state in index.html. This script
        applies the hidden pre-state itself, and only when the document is
        actually visible. A visitor with JS off, or a tab restored from the
        background, sees finished content rather than a blank page.

     2. Nothing correct depends on a timer, rAF, IntersectionObserver or a
        transition completing — all of those are throttled or frozen in a hidden
        document. Every animated path has a synchronous fallback, and a sweep
        plays anything the observer missed.
   ========================================================================== */
(function () {
    'use strict';

    var EASE = 'cubic-bezier(.16,1,.3,1)';
    var ACCENT = '#0F766E';
    var INK = '#EFEDE8';
    var MUTED = 'rgba(239,237,232,.56)';

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var started = false;
    var io = null;
    var ioAlive = false;

    function root() { return document.querySelector('.pn-dark'); }
    function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }
    function all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

    /* ---------------------------------------------------------- reveal engine */

    function hide(el, kind) {
        el.style.transition = 'none';
        if (kind === 'up') { el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; }
        else if (kind === 'line-in') { el.style.transform = 'translateY(112%)'; }
        else if (kind === 'rule') { el.style.transform = 'scaleX(0)'; el.style.transformOrigin = '0 50%'; }
        else if (kind === 'wipe') { el.style.clipPath = 'inset(0 100% 0 0)'; }
        else if (kind === 'img') { el.style.clipPath = 'inset(0 0 100% 0)'; el.style.transform = 'scale(1.12)'; }
        else if (kind === 'words') {
            all('[data-word]', el).forEach(function (w) {
                w.style.transition = 'none';
                w.style.transform = 'translateY(105%)';
            });
        }
    }

    /* Number that spins up out of noise and lands on its real value.
       Randomness is scaled by (1-p)^2 so it is wild at the start and has
       collapsed to nothing well before the end — the figure decelerates into
       the truth rather than snapping to it. */
    function countUp(el, instant) {
        var raw = el.getAttribute('data-dcount');
        var target = parseFloat(raw);
        if (isNaN(target)) return;
        var decimals = (raw.split('.')[1] || '').length;
        var pad = +(el.getAttribute('data-dpad') || 0);
        var fmt = function (n) {
            var s = Math.max(0, n).toFixed(decimals);
            while (s.replace(/\..*$/, '').length < pad) s = '0' + s;
            return s;
        };
        var settled = function () { el.textContent = fmt(target); };

        /* settle() asks for the finished value outright. A hidden tab also
           throttles rAF to nothing — never leave a placeholder number on
           screen if the frames are not going to arrive. */
        if (instant || reduced || document.visibilityState !== 'visible') {
            settled();
            return;
        }

        var DUR = 1600;
        var t0 = 0;
        var step = function (ts) {
            if (!t0) t0 = ts;
            var p = Math.min(1, (ts - t0) / DUR);
            if (p >= 1) { settled(); return; }
            var eased = 1 - Math.pow(1 - p, 4);          // easeOutQuart
            var noise = (1 - p) * (1 - p) * target * 0.85;
            el.textContent = fmt(target * eased + (Math.random() * 2 - 1) * noise);
            requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    function play(el) {
        if (el.hasAttribute('data-played')) return;
        el.setAttribute('data-played', '1');

        if (el.hasAttribute('data-dcount')) countUp(el);

        var kind = el.getAttribute('data-danim');
        var i = +(el.getAttribute('data-i') || 0);
        var delay = reduced ? 0 : i * 70;
        var t = function (ms, prop) {
            el.style.transition = prop + ' ' + (reduced ? 1 : ms) + 'ms ' + EASE + ' ' + delay + 'ms';
        };

        if (kind === 'up') {
            t(800, 'transform, opacity');
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        } else if (kind === 'line-in') {
            t(1000, 'transform');
            el.style.transform = 'translateY(0)';
        } else if (kind === 'rule') {
            t(1100, 'transform');
            el.style.transform = 'scaleX(1)';
        } else if (kind === 'wipe') {
            t(1000, 'clip-path');
            el.style.clipPath = 'inset(0 0 0 0)';
        } else if (kind === 'img') {
            t(1300, 'clip-path, transform');
            el.style.clipPath = 'inset(0 0 0 0)';
            el.style.transform = 'scale(1)';
        } else if (kind === 'words') {
            all('[data-word]', el).forEach(function (w, j) {
                w.style.transition = 'transform ' + (reduced ? 1 : 900) + 'ms ' + EASE +
                    ' ' + (reduced ? 0 : j * 26) + 'ms';
                w.style.transform = 'translateY(0)';
            });
        }
    }

    /* Drop straight to the finished state — used when motion is off, the tab is
       hidden, or something threw. */
    function settle(el) {
        el.setAttribute('data-played', '1');
        /* A counter settled mid-roll would be stranded showing noise. */
        if (el.hasAttribute('data-dcount')) countUp(el, true);
        /* Mark it observed too, so a later scan never hides an element that has
           already been settled — doing so would strand it in its pre-state. */
        el.setAttribute('data-obs', '1');
        el.style.removeProperty('transition');
        el.style.removeProperty('opacity');
        el.style.removeProperty('transform');
        el.style.removeProperty('clip-path');
        all('[data-word]', el).forEach(function (w) {
            w.style.removeProperty('transition');
            w.style.removeProperty('transform');
        });
    }

    /* Split a paragraph into per-word spans so words can rise independently. */
    function splitWords(scope) {
        all('[data-danim="words"]:not([data-split])', scope).forEach(function (p) {
            p.setAttribute('data-split', '1');
            var words = (p.textContent || '').split(/\s+/).filter(Boolean);
            p.textContent = '';
            words.forEach(function (word) {
                var outer = document.createElement('span');
                outer.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top';
                var inner = document.createElement('span');
                inner.style.cssText = 'display:inline-block';
                inner.setAttribute('data-word', '1');
                inner.textContent = word + ' ';
                outer.appendChild(inner);
                p.appendChild(outer);
            });
        });
    }

    /* Elements inside a [data-dstagger] group play in sequence, not together. */
    function stagger(scope) {
        all('[data-dstagger]', scope).forEach(function (group) {
            all('[data-danim]', group).forEach(function (el, i) {
                if (!el.hasAttribute('data-i')) el.setAttribute('data-i', String(i));
            });
        });
    }

    function observeReveals(scope) {
        if (!io) {
            io = new IntersectionObserver(function (entries) {
                ioAlive = true;
                entries.forEach(function (e) {
                    if (e.isIntersecting) { play(e.target); io.unobserve(e.target); }
                });
            }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
        }

        all('[data-danim]:not([data-obs])', scope).forEach(function (el) {
            el.setAttribute('data-obs', '1');
            try {
                /* Already finished (settled while the tab was hidden, say) —
                   leave it alone rather than hiding something that will never
                   be played again. */
                if (el.hasAttribute('data-played')) return;
                if (reduced || document.visibilityState !== 'visible') { settle(el); return; }

                hide(el, el.getAttribute('data-danim'));
                void el.offsetHeight; // flush the pre-state before transitioning

                /* Anything already on screen plays at once rather than waiting. */
                if (el.closest('.dk-header') || el.closest('#d-hero')) { play(el); return; }
                var r = el.getBoundingClientRect();
                if (r.top < window.innerHeight * 0.94 && r.bottom > 0) { play(el); return; }

                io.observe(el);
            } catch (err) {
                settle(el);
            }
        });
    }

    /* Safety net: if the observer never fires (background tab, older browser),
       play anything still waiting rather than leaving the page blank. */
    function armSweep() {
        var n = 0;
        var sweep = function () {
            n++;
            all('[data-danim]:not([data-played])').forEach(function (el) {
                try {
                    var r = el.getBoundingClientRect();
                    if (!ioAlive || n > 3 || r.top < window.innerHeight * 1.6) play(el);
                } catch (err) { settle(el); }
            });
            if (n < 6) setTimeout(sweep, 1400);
        };
        setTimeout(sweep, 2600);
    }

    /* ------------------------------------------------------------ interactions */

    function wireRows(scope) {
        all('[data-drow]:not([data-wired])', scope).forEach(function (row) {
            row.setAttribute('data-wired', '1');
            var bg = row.querySelector('[data-drowbg]');
            var num = row.querySelector('[data-dnum]');
            var arrow = row.querySelector('[data-drowarrow]');
            var title = row.querySelector('.dk-row-title');

            var on = function (enter) {
                var D = (reduced ? 1 : 600) + 'ms';
                if (bg) {
                    bg.style.transition = 'transform ' + D + ' ' + EASE;
                    bg.style.transform = enter ? 'scaleY(1)' : 'scaleY(0)';
                }
                if (num) {
                    num.style.transition = 'color ' + D + ' ease, transform ' + D + ' ' + EASE;
                    num.style.color = enter ? ACCENT : MUTED;
                    num.style.transform = enter ? 'translateX(6px)' : 'none';
                }
                if (title) {
                    title.style.transition = 'transform ' + D + ' ' + EASE;
                    title.style.transform = enter ? 'translateX(10px)' : 'none';
                }
                if (arrow) {
                    arrow.style.transition = 'opacity ' + D + ' ease, transform ' + D + ' ' + EASE;
                    arrow.style.opacity = enter ? '1' : '.4';
                    arrow.style.transform = enter ? 'translateX(6px)' : 'none';
                }
            };
            row.addEventListener('mouseenter', function () { on(true); });
            row.addEventListener('mouseleave', function () { on(false); });
            row.addEventListener('focus', function () { on(true); });
            row.addEventListener('blur', function () { on(false); });
        });
    }

    function wireCerts(scope) {
        all('[data-dcert]:not([data-wired])', scope).forEach(function (cert) {
            cert.setAttribute('data-wired', '1');
            var bg = cert.querySelector('[data-dcertbg]');
            var texts = all('[data-dcerttxt]', cert);

            var on = function (enter) {
                var D = (reduced ? 1 : 560) + 'ms';
                if (bg) {
                    bg.style.transition = 'transform ' + D + ' ' + EASE;
                    bg.style.transform = enter ? 'translateY(0)' : 'translateY(101%)';
                }
                texts.forEach(function (t, i) {
                    t.style.transition = 'color ' + D + ' ease, transform ' + D + ' ' + EASE +
                        ' ' + (enter ? i * 40 : 0) + 'ms';
                    t.style.color = enter ? '#131412' : (i === 0 ? MUTED : INK);
                    t.style.transform = enter ? 'translateY(-4px)' : 'translateY(0)';
                });
            };
            cert.addEventListener('mouseenter', function () { on(true); });
            cert.addEventListener('mouseleave', function () { on(false); });
            cert.addEventListener('focus', function () { on(true); });
            cert.addEventListener('blur', function () { on(false); });
        });
    }

    function wireSkills(scope) {
        all('[data-dskill]:not([data-wired])', scope).forEach(function (skill) {
            skill.setAttribute('data-wired', '1');
            var on = function (enter) {
                skill.style.transition = 'transform ' + (reduced ? 1 : 420) + 'ms ' + EASE + ', color 260ms ease';
                skill.style.transform = enter ? 'translateX(7px)' : 'translateX(0)';
                skill.style.color = enter ? ACCENT : INK;
            };
            skill.addEventListener('mouseenter', function () { on(true); });
            skill.addEventListener('mouseleave', function () { on(false); });
        });
    }

    /* Underline that sweeps in from the left, drawn as a background so it
       tracks the text box exactly. */
    function wireLinks(scope) {
        all('[data-dlink]:not([data-wired])', scope).forEach(function (a) {
            a.setAttribute('data-wired', '1');
            a.style.backgroundImage = 'linear-gradient(' + ACCENT + ',' + ACCENT + ')';
            a.style.backgroundRepeat = 'no-repeat';
            a.style.backgroundPosition = '0 100%';
            a.style.backgroundSize = '0% 1px';
            a.style.paddingBottom = '3px';
            var set = function (on) {
                a.style.transition = 'background-size ' + (reduced ? 1 : 520) + 'ms ' + EASE + ', color 300ms ease';
                a.style.backgroundSize = on ? '100% 1px' : '0% 1px';
            };
            a.addEventListener('mouseenter', function () { set(true); });
            a.addEventListener('mouseleave', function () { set(false); });
            a.addEventListener('focus', function () { set(true); });
            a.addEventListener('blur', function () { set(false); });
        });
    }

    /* Buttons lean very slightly toward the cursor, fill with teal from the
       bottom, and extend their arrow rule. */
    function wireButtons(scope) {
        all('[data-dmagnet]:not([data-wired])', scope).forEach(function (btn) {
            btn.setAttribute('data-wired', '1');
            var fill = btn.querySelector('[data-dfill]');
            var arrow = btn.querySelector('[data-darrow]');

            btn.addEventListener('mouseenter', function () {
                if (fill) {
                    fill.style.transition = 'transform ' + (reduced ? 1 : 520) + 'ms ' + EASE;
                    fill.style.transform = 'scaleY(1)';
                }
                if (arrow) {
                    arrow.style.transition = 'width ' + (reduced ? 1 : 460) + 'ms ' + EASE;
                    arrow.style.width = '30px';
                }
            });
            btn.addEventListener('mouseleave', function () {
                if (fill) fill.style.transform = 'scaleY(0)';
                if (arrow) arrow.style.width = '16px';
                btn.style.transition = 'transform ' + (reduced ? 1 : 700) + 'ms ' + EASE;
                btn.style.transform = 'translate(0,0)';
            });
            if (reduced) return;
            btn.addEventListener('mousemove', function (e) {
                var r = btn.getBoundingClientRect();
                btn.style.transition = 'transform 120ms linear';
                btn.style.transform = 'translate(' +
                    ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + 'px,' +
                    ((e.clientY - r.top - r.height / 2) * 0.16).toFixed(1) + 'px)';
            });
        });
    }

    function wireFields(scope) {
        all('[data-dfield]:not([data-wired])', scope).forEach(function (field) {
            field.setAttribute('data-wired', '1');
            var underline = field.querySelector('[data-dunderline]');
            var input = field.querySelector('input, textarea');
            if (!underline || !input) return;
            var set = function (on) {
                underline.style.transition = 'transform ' + (reduced ? 1 : 520) + 'ms ' + EASE;
                underline.style.transform = on ? 'scaleX(1)' : 'scaleX(0)';
            };
            input.addEventListener('focus', function () { set(true); });
            input.addEventListener('blur', function () { set(!!input.value); });
        });
    }

    function wireMarquee(scope) {
        var wrap = (scope || document).querySelector('[data-dmarquee-wrap]');
        if (!wrap || wrap.hasAttribute('data-wired')) return;
        wrap.setAttribute('data-wired', '1');
        var track = wrap.querySelector('[data-dmarquee]');
        if (!track) return;
        wrap.addEventListener('mouseenter', function () { track.style.animationPlayState = 'paused'; });
        wrap.addEventListener('mouseleave', function () { track.style.animationPlayState = 'running'; });
    }

    /* The dark contact form hands off to the visitor's mail client, exactly as
       the light one does — same address, same subject and body format. */
    function wireForm(scope) {
        var form = (scope || document).querySelector('[data-dform]');
        if (!form || form.hasAttribute('data-wired')) return;
        form.setAttribute('data-wired', '1');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var read = function (id) {
                var el = form.querySelector(id);
                return el ? el.value.trim() : '';
            };
            var name = read('#dk-cf-name');
            var email = read('#dk-cf-email');
            var message = read('#dk-cf-message');

            var subject = name ? 'Portfolio enquiry from ' + name : 'Portfolio enquiry';
            var body = message + '\n\n---\nFrom: ' + (name || '(not given)') +
                '\nReply to: ' + (email || '(not given)');

            var label = form.querySelector('[data-dsubmitlabel]');
            var fill = form.querySelector('[data-dfill]');
            if (fill) {
                fill.style.transition = 'transform ' + (reduced ? 1 : 500) + 'ms ' + EASE;
                fill.style.transform = 'scaleY(1)';
            }
            if (label) label.textContent = 'Opening mail…';

            window.location.href = 'mailto:' + (window.PN_CONTACT_EMAIL || 'panveenaidu5@gmail.com') +
                '?subject=' + encodeURIComponent(subject) +
                '&body=' + encodeURIComponent(body);
        });
    }

    /* ------------------------------------------------------------------ scroll */

    var scrollWired = false;

    function wireScroll() {
        if (scrollWired) return;
        scrollWired = true;

        var last = 0;
        var raf = 0;

        var frame = function () {
            raf = 0;
            if (!isDark()) return;

            var y = window.scrollY || 0;
            var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

            var bar = document.querySelector('[data-dprogress]');
            if (bar) bar.style.transform = 'scaleX(' + Math.min(1, y / max) + ')';

            /* Header gains a blurred backing past the fold and gets out of the
               way while scrolling down. */
            var header = document.querySelector('[data-dheader]');
            if (header) {
                header.style.transition = 'background 350ms ease, backdrop-filter 350ms ease, transform 500ms ' + EASE;
                header.style.background = y > 40 ? 'rgba(19,20,18,.86)' : 'transparent';
                header.style.backdropFilter = y > 40 ? 'blur(10px)' : 'none';
                header.style.transform = (y > last && y > 260) ? 'translateY(-102%)' : 'translateY(0)';
            }

            if (!reduced) {
                all('[data-dparallax]').forEach(function (el) {
                    var r = el.getBoundingClientRect();
                    var off = (r.top + r.height / 2 - window.innerHeight / 2) *
                        -parseFloat(el.getAttribute('data-dparallax'));
                    el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0) scale(1.03)';
                });
            }

            /* Sidebar counter tracks whichever project row is nearest the
               reading line. */
            var counter = document.querySelector('[data-drowcount]');
            var nums = all('[data-drow] [data-dnum]');
            if (counter && nums.length) {
                var best = 0, bestDist = Infinity;
                nums.forEach(function (n, i) {
                    var d = Math.abs(n.getBoundingClientRect().top - window.innerHeight * 0.42);
                    if (d < bestDist) { bestDist = d; best = i; }
                });
                counter.textContent = String(best + 1).padStart(2, '0');
            }

            /* Nav scrollspy. */
            var links = all('[data-dnavlink]');
            if (links.length) {
                var activeId = null;
                links.forEach(function (link) {
                    var target = document.querySelector(link.getAttribute('href'));
                    if (target && target.getBoundingClientRect().top <= window.innerHeight * 0.4) {
                        activeId = link.getAttribute('href');
                    }
                });
                links.forEach(function (link) {
                    link.classList.toggle('is-active', link.getAttribute('href') === activeId);
                });
            }

            last = y;
        };

        var onScroll = function () { if (!raf) raf = requestAnimationFrame(frame); };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        frame();
    }

    /* -------------------------------------------------------------------- boot */

    function start() {
        var scope = root();
        if (!scope || started) return;
        started = true;

        splitWords(scope);
        stagger(scope);
        observeReveals(scope);
        wireRows(scope);
        wireCerts(scope);
        wireSkills(scope);
        wireLinks(scope);
        wireButtons(scope);
        wireFields(scope);
        wireMarquee(scope);
        wireForm(scope);
        wireScroll();
        armSweep();
    }

    /* Switching into dark after load initialises the runtime on first use. */
    window.addEventListener('pn:themechange', function (e) {
        if (e.detail && e.detail.theme === 'dark') {
            if (!started) start();
            else window.dispatchEvent(new Event('scroll'));
        }
    });

    /* A tab hidden during load never ran its transitions — settle everything
       the moment it becomes visible. */
    document.addEventListener('visibilitychange', function () {
        /* Only meaningful once the runtime owns the pre-state. Settling before
           start() would flag elements as done and strand them when the engine
           later hides them. */
        if (started && document.visibilityState === 'visible') {
            all('[data-danim]:not([data-played])').forEach(settle);
        }
    });

    function boot() { if (isDark()) start(); }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
