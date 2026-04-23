document.addEventListener("DOMContentLoaded", () => {
    // Only initialize if the global map container exists on the specific page
    const mapElement = document.getElementById("global-map");
    if (!mapElement) return;

    // Initialize map centered roughly in Southern Sri Lanka, positioned to show Hikkaduwa and Rathgama
    const map = L.map('global-map', {
        scrollWheelZoom: false // Prevent accidentally scrolling the map when navigating page
    }).setView([6.1200, 80.1250], 12);

    // Add clean CartoDB Voyager tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Determine target localization from the document's language tag
    const lang = document.documentElement.lang || 'en';

    // Geolocation data for the villas
    const properties = [
        {
            id: 'serene-luxe',
            name: "Villa Serene Luxe",
            lat: 6.129982,
            lng: 80.123576,
            linkEn: "villas.html#serene-luxe",
            linkDe: "villas-de.html#serene-luxe",
            linkRu: "villas-ru.html#serene-luxe",
            priceEn: "USD 32",
            priceDe: "32 USD",
            priceRu: "USD 32"
        },
        {
            id: 'birdsong',
            name: "Birdsong Villa",
            lat: 6.107092,
            lng: 80.143286,
            linkEn: "villas.html#birdsong",
            linkDe: "villas-de.html#birdsong",
            linkRu: "villas-ru.html#birdsong",
            priceEn: "USD 18",
            priceDe: "18 USD",
            priceRu: "USD 18"
        },
        {
            id: 'coco-garden',
            name: "Coco Garden Villas",
            lat: 6.131356,
            lng: 80.103640,
            linkEn: "villas.html#coco-garden",
            linkDe: "villas-de.html#coco-garden",
            linkRu: "villas-ru.html#coco-garden",
            priceEn: "USD 18",
            priceDe: "18 USD",
            priceRu: "USD 18"
        },
        {
            id: 'sterrling',
            name: "Sterrling Villa",
            lat: 6.138000,
            lng: 80.110500,
            linkEn: "villas.html#sterrling",
            linkDe: "villas-de.html#sterrling",
            linkRu: "villas-ru.html#sterrling",
            priceEn: "USD 30",
            priceDe: "30 USD",
            priceRu: "USD 30"
        },
        {
            id: 'villa-one-64',
            name: "Villa One 64 Beachfront",
            lat: 6.107156,
            lng: 80.125062,
            linkEn: "villas.html#villa-one-64",
            linkDe: "villas-de.html#villa-one-64",
            linkRu: "villas-ru.html#villa-one-64",
            priceEn: "",
            priceDe: "",
            priceRu: ""
        }
    ];

    // Localized popup action strings
    const texts = {
        en: { view: "View Villa", perNight: "per night" },
        de: { view: "Villa ansehen", perNight: "pro Nacht" },
        ru: { view: "Посмотреть виллу", perNight: "за ночь" }
    };

    const t = texts[lang] || texts['en'];

    // Map the locations
    properties.forEach(prop => {
        let link = prop.linkEn;
        let price = prop.priceEn;

        if (lang === 'de') {
            link = prop.linkDe;
            price = prop.priceDe;
        } else if (lang === 'ru') {
            link = prop.linkRu;
            price = prop.priceRu;
        }

        const marker = L.marker([prop.lat, prop.lng]).addTo(map);
        
        let priceHtml = "";
        if (price) {
            priceHtml = `<p style="margin: 0 0 12px 0; font-size: 13px; color: #555;"><strong>${price}</strong> ${t.perNight}</p>`;
        } else {
            priceHtml = `<p style="margin: 0 0 12px 0; font-size: 13px; color: #555;"></p>`;
        }
        
        // Build interactive popups
        const popupContent = `
            <div style="font-family: 'Inter', sans-serif; text-align: center; color: #333; min-width: 140px;">
                <h4 style="margin: 0 0 5px 0; font-size: 15px; font-weight: 600; color: #2A4325;">${prop.name}</h4>
                ${priceHtml}
                <a href="${link}" style="display: block; background: #DDA15E; color: white; text-decoration: none; padding: 6px 12px; border-radius: 4px; font-size: 13px; font-weight: 500;">
                    ${t.view}
                </a>
            </div>
        `;
        
        marker.bindPopup(popupContent);
    });
});
