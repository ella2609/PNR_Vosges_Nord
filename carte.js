// CREATION DE LA CARTE //
// Création de la carte avec limites de déplacement et de zoom //
var map = L.map('mapid', {
    center: [49.00615477814114, 7.704741449501225],
    zoom: 10,

});

// Ajouter l'échelle sur la carte //
L.control.scale().addTo(map);

// Fond de carte simple //
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd'
}).addTo(map);

// Reprojection helper (Lambert-93 -> WGS84) so the GeoJSON draws in Leaflet
const LAMBERT93 = 'EPSG:2154';
const WGS84 = 'EPSG:4326';
if (typeof proj4 !== 'undefined') {
    proj4.defs(LAMBERT93, '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
}

function reprojectCoords(coords) {
    if (typeof coords[0] === 'number') {
        const [x, y] = coords;
        const [lon, lat] = proj4(LAMBERT93, WGS84, [x, y]);
        return [lon, lat];
    }
    return coords.map(reprojectCoords);
}

function reprojectGeoJSON(geojson) {
    return {
        ...geojson,
        features: geojson.features.map(f => ({
            ...f,
            geometry: {
                ...f.geometry,
                coordinates: reprojectCoords(f.geometry.coordinates)
            }
        }))
    };
}

// Load and display the PNR polygon
fetch('Data/Pnr_vosges_nord/PNR_VN.geojson')
    .then(resp => resp.json())
    .then(data => {
        const reprojected = reprojectGeoJSON(data);
        const pnrLayer = L.geoJSON(reprojected, {
            style: {
                color: '#2c7a3f',
                weight: 2,
                fillColor: '#7bd38b',
                fillOpacity: 0.25
            }
        }).addTo(map);
        if (pnrLayer.getBounds && pnrLayer.getBounds().isValid()) {
            map.fitBounds(pnrLayer.getBounds(), { padding: [20, 20] });
        }
    })
    .catch(err => {
        console.error('Erreur lors du chargement du PNR:', err);
    });