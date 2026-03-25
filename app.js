const map = new maplibregl.Map({
    container: 'map',
    style: 'https://demotiles.maplibre.org/globe.json',
    center: [0, 0],
    zoom: 1
})

map.addControl(new maplibregl.NavigationControl())