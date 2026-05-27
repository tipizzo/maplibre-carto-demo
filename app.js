const map = new maplibregl.Map({
    container: 'map',
    // style: 'https://tiles.openfreemap.org/styles/bright', // Ceci est une version libre, legère qui ne demande pas de clé API pour le OpenStreetMap
    style: 'https://api.maptiler.com/maps/streets-v4/style.json?key=QjCZXnsGZAfLPiMGCTBy', // OpenStreetMap fourni par MapTiler
    // style: 'https://api.maptiler.com/maps/hybrid-v4/style.json?key=QjCZXnsGZAfLPiMGCTBy', // Satelite hybrid fourni par MapTiler
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

    // Afficher les info du batiment via une popup lorsqu;on y clique

    map.on('click', 'buildings-layer', (e) => {
    const feature = e.features[0];
    if (!feature) return;

    const gref = feature.properties.gref || "Non renseigné";
    const isEligible = feature.properties.is_eligible;


    let eligibilityText = "";
    if (isEligible === "true" || isEligible === true) {
        eligibilityText = '<strong style="color: #31b96a;">Le bâtiment est éligible</strong>';
    } else if (isEligible === "false" || isEligible === false) {
        eligibilityText = '<strong style="color: #e74c3c;">Le bâtiment n\'est pas éligible</strong>';
    } else {
        eligibilityText = '<strong style="color: #95a5a6;">Statut inconnu</strong>';
    }

    const htmlContent = `
        <div style="font-family: sans-serif; padding: 5px;">
            <h4 style="margin: 0 0 8px 0; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Infos Bâtiment</h4>
            <p style="margin: 4px 0;"><strong>gref :</strong> ${gref}</p>
            <p style="margin: 4px 0;">${eligibilityText}</p>
        </div>
    `;

    // La popup
    new maplibregl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(htmlContent)
        .addTo(map);
});

    // Changement du curseur de la souris
    map.on('mouseenter', 'buildings-layer', () => {
        map.getCanvas().style.cursor = 'pointer'
    })

    map.on('mouseleave', 'buildings-layer', () => {
        map.getCanvas().style.cursor = '';
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

    // Recherche par coordonnées

    // Pourquoi du regex ? C'est pour detecter si la saisie ressemble à "lat, lng" ou "lng, lat" +ve ou -ve
    const coordRegex = /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/;
    const match = value.match(coordRegex);

    if(match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);

        if(lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            map.flyTo({
                center: [lng, lat],
                zoom: 18,
                essential: true
            });
            return; // La fonction s'arrete si la recherche reussie
        } else {
            alert("Coordonnées invalides");
            return;
        }
    }

    // Recherche par gref

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
            alert(`Batiment introuvable pour: ${value}`)
        }
    }
}