document.addEventListener("DOMContentLoaded", () => {
    // Only initialize on pages that have the shared villas map container
    const mapElement = document.getElementById("villas-map");
    if (!mapElement) return;

    const map = L.map('villas-map', {
        scrollWheelZoom: false // avoid hijacking page scroll
    }).setView([6.1200, 80.1250], 12);

    // Same CartoDB Voyager tiles as the homepage map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Localize the popup action label from the document language
    const lang = document.documentElement.lang || 'en';
    const labels = {
        en: 'View this villa ↑',
        de: 'Zu dieser Villa ↑',
        ru: 'К этой вилле ↑'
    };
    const viewLabel = labels[lang] || labels.en;

    // Coordinates extracted from the villas' original Google Maps embeds / site map data.
    // Villa names are brand names and stay in Latin script across all languages.
    const villas = [
        { id: 'serene-luxe',  name: 'Villa Serene Luxe',        lat: 6.129982, lng: 80.123576 },
        { id: 'birdsong',     name: 'Birdsong Villa',           lat: 6.107092, lng: 80.143286 },
        { id: 'coco-garden',  name: 'Coco Garden Villas',       lat: 6.131356, lng: 80.103640 },
        { id: 'sterrling',    name: 'Sterrling Villa',          lat: 6.138000, lng: 80.110500 },
        { id: 'villa-one-64', name: 'Villa One 64 Beachfront',  lat: 6.107156, lng: 80.125062 }
    ];

    const bounds = [];
    villas.forEach(v => {
        const marker = L.marker([v.lat, v.lng]).addTo(map);
        bounds.push([v.lat, v.lng]);

        const popupContent = `
            <div style="font-family: 'Inter', sans-serif; text-align: center; color: #333; min-width: 150px;">
                <h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #0b3c5d;">${v.name}</h4>
                <a href="#${v.id}" style="display: inline-block; background: #0b3c5d; color: #fff; text-decoration: none; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 500;">${viewLabel}</a>
            </div>`;

        marker.bindPopup(popupContent);
    });

    // Frame all five markers with a little padding
    if (bounds.length) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }
});
