/* Theme engine — shared by index.html and every project page.
   Light = the original brutalist design. Dark = the editorial teal design.
   The <html data-theme> attribute is the single switch both stylesheets read.

   Load order matters: a small inline block at the top of each <head> sets
   data-theme BEFORE first paint, so there is no flash of the wrong theme.
   This file then wires up the toggles. */
(function () {
    'use strict';

    var STORE_KEY = 'pn-theme';
    var root = document.documentElement;

    function stored() {
        try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; }
    }

    function systemTheme() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark' : 'light';
    }

    function current() {
        return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    /* Keep the mobile browser chrome in step with the page. */
    function syncMeta(theme) {
        var meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'theme-color');
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', theme === 'dark' ? '#131412' : '#f9f9f9');
    }

    function apply(theme) {
        root.setAttribute('data-theme', theme);
        /* tailwind.config.js uses darkMode:"class", so keep .dark in sync for any
           utility that still relies on the dark: prefix. */
        root.classList.toggle('dark', theme === 'dark');
        syncMeta(theme);

        document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
            btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
            btn.setAttribute('aria-label',
                theme === 'dark' ? 'Switch to light design' : 'Switch to dark design');
            var label = btn.querySelector('[data-theme-label]');
            if (label) label.textContent = theme === 'dark' ? 'Light' : 'Dark';
        });

        window.dispatchEvent(new CustomEvent('pn:themechange', { detail: { theme: theme } }));
    }

    function set(theme, remember) {
        if (remember !== false) {
            try { localStorage.setItem(STORE_KEY, theme); } catch (e) { /* private mode */ }
        }
        apply(theme);
    }

    /* ---- discovery cue -----------------------------------------------------
       Nobody thinks to look for a second design, so the toggle carries a
       standing nudge. Both views own a cue; only the visible view's is in the
       document flow, so this just turns on whichever one is showing and keeps
       its copy pointing at the design you are NOT currently looking at. */
    var CUE_COPY = {
        light: 'See it in a whole different design',
        dark:  'Back to the original design'
    };

    function initCue() {
        document.querySelectorAll('[data-theme-cue]').forEach(function (cue) {
            var txt = cue.querySelector('[data-cue-text]');
            if (txt) txt.textContent = CUE_COPY[current()] || CUE_COPY.light;
            cue.hidden = false;
            /* Re-arm the entry animation so the cue replays after a swap. */
            cue.classList.remove('is-on');
            void cue.offsetWidth;
            requestAnimationFrame(function () { cue.classList.add('is-on'); });
        });
    }

    /* ---- switching between the two designs ---------------------------------
       The designs are separate DOM subtrees swapped with display:none, so the
       incoming one can only ever appear instantly. Covering the viewport for
       the length of the swap turns that cut into one continuous dissolve.
       Built here rather than in markup so all seven pages get it for free. */
    var fader = null;
    var switching = false;

    function cover() {
        if (!fader) {
            fader = document.createElement('div');
            fader.className = 'pn-theme-fade';
            document.body.appendChild(fader);
        }
        return fader;
    }

    function prefersReduced() {
        return window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function toggleTheme() {
        var next = current() === 'dark' ? 'light' : 'dark';

        /* Press feedback via a class, so it can't outrank the :hover rules the
           way an inline transform would. */
        document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
            btn.classList.remove('is-switching');
            void btn.offsetWidth; // restart the animation on a repeat click
            btn.classList.add('is-switching');
        });

        if (prefersReduced() || switching) {
            if (!switching) { set(next); initCue(); }
            return;
        }
        switching = true;

        var el = cover();
        /* Pin the outgoing background so the cover does not jump colour the
           moment data-theme flips underneath it. */
        el.style.background = current() === 'dark' ? '#131412' : '#f9f9f9';
        el.style.transitionDuration = '.18s';
        void el.offsetWidth;
        el.classList.add('is-active');

        /* Timers, not transitionend — a backgrounded tab never fires it. */
        setTimeout(function () {
            set(next);
            initCue(); // re-point the copy and replay the entry in the incoming view
            el.style.transitionDuration = '.28s';
            requestAnimationFrame(function () {
                el.classList.remove('is-active');
                setTimeout(function () { switching = false; }, 300);
            });
        }, 190);
    }

    /* Park the cue while the visitor is actually reading. It is permanent now,
       so without this it would hover over the content for the whole session. */
    function wireCueParking() {
        var raf = 0;
        var frame = function () {
            raf = 0;
            var parked = (window.scrollY || 0) > 120;
            document.querySelectorAll('[data-theme-cue]').forEach(function (cue) {
                cue.classList.toggle('is-parked', parked);
            });
        };
        window.addEventListener('scroll', function () {
            if (!raf) raf = requestAnimationFrame(frame);
        }, { passive: true });
        frame();
    }

    function init() {
        document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                toggleTheme();
            });
            btn.addEventListener('animationend', function () {
                btn.classList.remove('is-switching');
            });
        });

        /* Follow the OS only until the visitor makes a choice of their own. */
        if (window.matchMedia) {
            var mq = window.matchMedia('(prefers-color-scheme: dark)');
            var onChange = function (e) { if (!stored()) set(e.matches ? 'dark' : 'light', false); };
            if (mq.addEventListener) mq.addEventListener('change', onChange);
            else if (mq.addListener) mq.addListener(onChange);
        }

        apply(current());
        initCue();
        wireCueParking();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.PNTheme = { get: current, set: set, system: systemTheme };
})();
