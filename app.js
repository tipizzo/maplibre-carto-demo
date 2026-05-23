const map = new maplibregl.Map({
    container: 'map',
    style: 'https://api.maptiler.com/maps/streets-v4/style.json?key=QjCZXnsGZAfLPiMGCTBy',
    center: [29.2228, -1.6792], // Localisation sur Goma
    zoom: 12,
    attributionControl: false
})

map.addControl(new maplibregl.AttributionControl({
    compact: true
}), 'bottom-left');

map.on('load', () => {
    map.addSource('goma-buildings', {
        type: 'geojson',
        data: './building_eligibility_goma.geojson'
    });

    map.addLayer({
        id: 'buildings-layer',
        type: 'fill',
        source: 'goma-buildings',
        paint: {
            'fill-color': [
                'match',
                ['get', 'is_eligible'],
                'true', '#198ceb',
                'false', '#e74c3c',
                '#95a5a6'
            ],
            'fill-opacity': 0.75,
            'fill-outline-color': '#1a1a1a'
        }
    })

    map.addLayer({
        id: 'buildings-labels-layer',
        type: 'symbol',
        source: 'goma-buildings',
        minzoom: 16,
        layout: {
            'text-field': ['get', 'gref'],
            'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
            'text-size': 11,
            'text-anchor': 'center',
            'text-justify': 'center',
            'text-allow-overlap': false
        },

        paint: {
            'text-color': '#000000',
            'text-halo-color': '#ffffff',
            'text-halo-width': 1.5
        }
    })

    initSearchFeature();
})

function initSearchFeature() {
    const searchInput = document.getElementById('search-input-2')
    const searchButton = document.querySelector('.search-button');

    searchButton.addEventListener('click', () => {
        performSearch(searchInput.value)
    })

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value)
        }
    })
}

function performSearch(query) {
    const value = query.trim();
    if (!value) return;

    const features = map.querySourceFeatures('goma-buildings');

    const targetBuilding = features.find(f => f.properties.gref && String(f.properties.gref) === value);

    if (targetBuilding) {
        let coordinates;

        if (targetBuilding.geometry.type === 'Polygon') {
            coordinates = targetBuilding.geometry.coordinates[0][0];
        } else if (targetBuilding.geometry.type === 'MultiPolygon') {
            coordinates = targetBuilding.geometry.coordinates[0][0][0];
        } else if (targetBuilding.geometry.type === 'Point') {
            coordinates = targetBuilding.geometry.coordinates
        }

        if (coordinates) {
            map.flyTo({
                center: coordinates,
                zoom: 20,
                essential: true
            })
        }

        else {
            alert('Batiment introuvable pour: "${value}')
        }
    }
}