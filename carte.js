
// ============================================
// CREATION DE LA CARTE PRINCIPALE
// ============================================

var map = L.map('mapid', {
    center: [49.00615477814114, 7.704741449501225],
    zoom: 10,
});

// Ajouter l'échelle sur la carte
L.control.scale().addTo(map);

// Fond de carte simple
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd'
}).addTo(map);

// ============================================
// REPROJECTION DES COORDONNÉES
// ============================================

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
    if (!geojson || !geojson.features) {
        console.error('GeoJSON invalide:', geojson);
        return geojson;
    }

    try {
        // Vérifier la projection du CRS
        const crs = geojson.crs?.properties?.name || '';
        console.log('CRS détecté:', crs);
        
        // Si déjà en WGS84, ne pas reprojeter
        if (crs.includes('4326') || crs.includes('WGS84')) {
            console.log('Données déjà en WGS84, pas de reprojection nécessaire');
            return geojson;
        }

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
    } catch (error) {
        console.error('Erreur lors de la reprojection:', error);
        return geojson;
    }
}

// Couleurs pour les couches LCZ (palette cohérente)
const lczColors = {
    '1': '#E60000',   // Compact high-rise
    '2': '#CC0000',   // Compact mid-rise
    '3': '#B30000',   // Compact low-rise
    '4': '#990033',   // Open high-rise
    '5': '#800033',   // Open mid-rise
    '6': '#660033',   // Open low-rise
    '7': '#FF6600',   // Lightweight low-rise
    '8': '#FFB3B3',   // Large low-rise
    '9': '#B3CCFF',   // Sparsely built
    'A': '#99FF99',   // Green spaces
    'B': '#0099CC',   // Water
    'default': '#999999'
};

function getColorForLCZ(lcz) {
    return lczColors[lcz] || lczColors['default'];
}

function createLCZLayer(data, opacity = 1) {
    return L.geoJSON(data, {
        style: function(feature) {
            // Chercher la propriété LCZ - le nom exact est LCZ_PRIMAR (sans Y)
            let lcz = feature.properties?.LCZ_PRIMAR || 
                      feature.properties?.LCZ_PRIMARY ||
                      feature.properties?.LCZ || 
                      feature.properties?.lcz ||
                      feature.properties?.LCZ_CLASS ||
                      'default';
            
            const color = getColorForLCZ(lcz);
            
            return {
                color: color,
                weight: 1.5,
                opacity: opacity,
                fillColor: color,
                fillOpacity: opacity * 0.7
            };
        },
        onEachFeature: function(feature, layer) {
            // Chercher la propriété LCZ
            let lcz = feature.properties?.LCZ_PRIMAR || 
                      feature.properties?.LCZ_PRIMARY ||
                      feature.properties?.LCZ || 
                      feature.properties?.lcz ||
                      feature.properties?.LCZ_CLASS ||
                      'N/A';
            let icu = feature.properties?.ICU_theori || 'N/A';
            
            const popupContent = `<strong>LCZ:</strong> ${lcz}<br><strong>ICU Théorique:</strong> ${icu}`;
            layer.bindPopup(popupContent);
        }
    });
}

// ============================================
// AFFICHAGE DE LA COUCHE PNR AU DÉMARRAGE
// ============================================

fetch('Data/PNR_VN.geojson')
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

