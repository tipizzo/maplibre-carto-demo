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