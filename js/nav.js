/* Shared site navigation: mobile drawer + language dropdown.
 *
 * Both are accessible disclosure patterns — aria-expanded on the trigger,
 * aria-controls pointing at the panel, Esc to close, click-outside to close,
 * focus returned to the trigger on close.
 *
 * toggleMobileNav() / closeMobileNav() stay on window because the nav links
 * in every page's markup call them from inline onclick attributes.
 */
(function () {
    'use strict';

    var DESKTOP = '(min-width: 821px)'; // must match the CSS nav breakpoint

    function $(id) { return document.getElementById(id); }

    // ── Mobile drawer ──────────────────────────────────────────────
    function drawerOpen() {
        var nav = $('navWrapper');
        return !!nav && nav.classList.contains('open');
    }

    function setDrawer(open) {
        var nav = $('navWrapper'), ham = $('hamburger'), overlay = $('mobileOverlay');
        if (!nav || !ham) return;
        nav.classList.toggle('open', open);
        ham.classList.toggle('open', open);
        if (overlay) overlay.classList.toggle('open', open);
        ham.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.style.overflow = open ? 'hidden' : '';
    }

    window.toggleMobileNav = function () { setDrawer(!drawerOpen()); };
    window.closeMobileNav = function () { setDrawer(false); setLang(false); };

    // ── Language dropdown ──────────────────────────────────────────
    function langItems() {
        var menu = $('langDdMenu');
        return menu ? Array.prototype.slice.call(menu.querySelectorAll('a')) : [];
    }

    function langOpen() {
        var menu = $('langDdMenu');
        return !!menu && !menu.hidden;
    }

    function setLang(open) {
        var dd = $('langDd'), btn = $('langDdToggle'), menu = $('langDdMenu');
        if (!btn || !menu) return;
        menu.hidden = !open;
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (dd) dd.classList.toggle('open', open);
    }

    function init() {
        var ham = $('hamburger'), overlay = $('mobileOverlay');
        var dd = $('langDd'), btn = $('langDdToggle'), menu = $('langDdMenu');

        if (ham) {
            ham.addEventListener('click', function (e) {
                e.stopPropagation();
                setLang(false);
                setDrawer(!drawerOpen());
            });
        }

        if (overlay) {
            overlay.addEventListener('click', function () { setDrawer(false); });
        }

        if (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                setLang(!langOpen());
            });
            btn.addEventListener('keydown', function (e) {
                if (e.key === 'ArrowDown' || e.key === 'Down') {
                    e.preventDefault();
                    setLang(true);
                    var first = langItems()[0];
                    if (first) first.focus();
                }
            });
        }

        if (menu) {
            // Roving arrow-key navigation between the three options
            menu.addEventListener('keydown', function (e) {
                var items = langItems();
                var i = items.indexOf(document.activeElement);
                if (i === -1) return;
                if (e.key === 'ArrowDown' || e.key === 'Down') {
                    e.preventDefault();
                    items[(i + 1) % items.length].focus();
                } else if (e.key === 'ArrowUp' || e.key === 'Up') {
                    e.preventDefault();
                    items[(i - 1 + items.length) % items.length].focus();
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    items[0].focus();
                } else if (e.key === 'End') {
                    e.preventDefault();
                    items[items.length - 1].focus();
                }
            });
        }

        // Click outside closes whichever is open
        document.addEventListener('click', function (e) {
            if (dd && langOpen() && !dd.contains(e.target)) setLang(false);
            var nav = $('navWrapper');
            if (drawerOpen() && nav && !nav.contains(e.target) && ham && !ham.contains(e.target)) {
                setDrawer(false);
            }
        });

        // Esc closes the innermost thing first and restores focus
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape' && e.key !== 'Esc') return;
            if (langOpen()) {
                setLang(false);
                if (btn) btn.focus();
                return;
            }
            if (drawerOpen()) {
                setDrawer(false);
                if (ham) ham.focus();
            }
        });

        // Returning to desktop width must not leave the drawer state stuck on
        var mq = window.matchMedia(DESKTOP);
        var onChange = function (ev) { if (ev.matches) { setDrawer(false); setLang(false); } };
        if (mq.addEventListener) mq.addEventListener('change', onChange);
        else if (mq.addListener) mq.addListener(onChange);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
