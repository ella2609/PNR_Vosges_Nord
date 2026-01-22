// ============================================
// GESTION DE LA SÉLECTION DES COMMUNES
// ============================================

// Communes du PNR Vosges du Nord (coordonnées lat/lng et zoom)
const communes = {
    'bitche': { lat: 49.0431, lng: 7.4338, zoom: 13, name: 'Bitche' },
    'drachenbronn': { lat: 48.9597, lng: 7.5769, zoom: 13, name: 'Drachenbronn' },
    'ingwiller': { lat: 48.9339, lng: 7.5564, zoom: 13, name: 'Ingwiller' },
    'lorentzen': { lat: 48.9089, lng: 7.5603, zoom: 13, name: 'Lorentzen' },
    'meisenbronn': { lat: 48.9814, lng: 7.5908, zoom: 13, name: 'Meisenbronn' },
    'rahling': { lat: 48.9744, lng: 7.6578, zoom: 13, name: 'Rahling' },
    'wissembourg': { lat: 48.9453, lng: 8.0353, zoom: 13, name: 'Wissembourg' }
};

// Éléments pour la sélection de zone
const areaModal = document.getElementById('areaModal');
const selectAreaBtnToggle = document.getElementById('selectAreaBtnToggle');
const closeBtnArea = document.querySelector('.close-btn-area');
const confirmAreaBtn = document.getElementById('confirmAreaBtn');
const areaSelect = document.getElementById('areaSelect');

// Ouvrir le modal de sélection de zone
selectAreaBtnToggle.addEventListener('click', function() {
    areaModal.classList.add('show');
});

// Fermer le modal de zone
closeBtnArea.addEventListener('click', function() {
    areaModal.classList.remove('show');
});

// Zoomer sur une commune sélectionnée
confirmAreaBtn.addEventListener('click', function() {
    const commune = areaSelect.value;

    if (!commune) {
        alert('Veuillez sélectionner une commune');
        return;
    }

    const communeData = communes[commune];
    if (communeData) {
        map.setView([communeData.lat, communeData.lng], communeData.zoom);
        areaModal.classList.remove('show');
    }
});
