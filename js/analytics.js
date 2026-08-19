(function () {
    'use strict';

    function pageContext() {
        return {
            page_path: window.location.pathname,
            page_language: document.documentElement.lang || 'en'
        };
    }

    window.eranorrisTrack = function (eventName, params) {
        if (typeof window.gtag !== 'function') return;
        window.gtag('event', eventName, Object.assign(pageContext(), params || {}));
    };

    window.trackWhatsApp = function (intent, itemName, ctaLocation) {
        window.eranorrisTrack('whatsapp_click', {
            inquiry_intent: intent || 'general',
            item_name: itemName || 'general',
            cta_location: ctaLocation || 'unknown'
        });
    };

    function cleanName(value) {
        return (value || 'general').replace(/\s+/g, ' ').trim().replace(/\s+[—|·].*$/, '');
    }

    function clickContext(link) {
        var card = link.closest('.villa-card-full, .exp-card-full, .villa-card, .experience-card');
        var heading = card && card.querySelector('h2, h3');
        var itemName = cleanName(heading && heading.textContent);
        var ctaLocation = 'page';
        var intent = 'general';

        if (card && card.classList.contains('villa-card-full')) {
            ctaLocation = 'villa_card';
            intent = 'villa_booking';
        } else if (card && card.classList.contains('exp-card-full')) {
            ctaLocation = 'experience_card';
            intent = 'experience';
        } else if (link.closest('footer')) {
            ctaLocation = 'footer';
        } else if (link.classList.contains('whatsapp-float')) {
            ctaLocation = 'floating_button';
        } else if (link.closest('.hero, .page-hero')) {
            ctaLocation = 'hero';
        }

        if (/long.stay|monthly|monat|langzeit|длитель/i.test(link.href + ' ' + link.textContent)) {
            intent = 'long_stay';
        }

        return { intent: intent, itemName: itemName, ctaLocation: ctaLocation };
    }

    document.addEventListener('click', function (event) {
        var link = event.target.closest('a[href]');
        if (!link) return;

        var context = clickContext(link);
        if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(link.href)) {
            window.trackWhatsApp(context.intent, context.itemName, context.ctaLocation);
        } else if (/airbnb\./i.test(link.hostname)) {
            window.eranorrisTrack('airbnb_click', {
                item_name: context.itemName,
                cta_location: context.ctaLocation
            });
        } else if (/booking\.com$/i.test(link.hostname) || /\.booking\.com$/i.test(link.hostname)) {
            window.eranorrisTrack('booking_click', {
                item_name: context.itemName,
                cta_location: context.ctaLocation
            });
        }
    });
})();
