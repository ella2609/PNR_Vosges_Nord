// ============================================
// GESTION DE LA COMPARAISON DE DATES
// ============================================

const dateModal = document.getElementById('dateModal');
const compareBtnToggle = document.getElementById('compareBtnToggle');
const closeBtn = document.querySelector('.close-btn');
const confirmDatesBtn = document.getElementById('confirmDatesBtn');
const date1Select = document.getElementById('date1Select');
const date2Select = document.getElementById('date2Select');

let lczLayer1, lczLayer2;
// INUTILISÉ: Les variables currentDate1 et currentDate2 ne sont pas utilisées dans le reste du code
// let currentDate1, currentDate2;

// Ouvrir le modal de sélection de dates
compareBtnToggle.addEventListener('click', function() {
    dateModal.classList.add('show');
});

// Fermer le modal
closeBtn.addEventListener('click', function() {
    dateModal.classList.remove('show');
});

// Fermer le modal au clic à l'extérieur
window.addEventListener('click', function(event) {
    if (event.target === dateModal) {
        dateModal.classList.remove('show');
    }
});

// Charger les données et initialiser la comparaison
confirmDatesBtn.addEventListener('click', function() {
    const date1 = date1Select.value;
    const date2 = date2Select.value;

    if (!date1 || !date2) {
        alert('Veuillez sélectionner deux dates différentes');
        return;
    }

    if (date1 === date2) {
        alert('Veuillez sélectionner deux dates différentes');
        return;
    }

    dateModal.classList.remove('show');
    // INUTILISÉ: Ces assignations ne sont pas utilisées
    // currentDate1 = date1;
    // currentDate2 = date2;
    
    loadComparisonLayers(date1, date2);
});

function loadComparisonLayers(date1, date2) {
    // Retirer les anciennes couches si elles existent
    if (lczLayer1) map.removeLayer(lczLayer1);
    if (lczLayer2) map.removeLayer(lczLayer2);

    // Charger les deux fichiers GeoJSON
    Promise.all([
        fetch(`Data/LCZ_${date1}.geojson`).then(r => r.json()),
        fetch(`Data/LCZ_${date2}.geojson`).then(r => r.json())
    ])
    .then(([data1, data2]) => {
        console.log('Données chargées - LCZ1:', data1.features?.length || 0, 'features, LCZ2:', data2.features?.length || 0, 'features');
        
        const reprojected1 = reprojectGeoJSON(data1);
        const reprojected2 = reprojectGeoJSON(data2);

        // Créer les couches
        lczLayer1 = createLCZLayer(reprojected1, 1);
        lczLayer2 = createLCZLayer(reprojected2, 1);

        // Ajouter à la carte (Layer2 par-dessus)
        lczLayer1.addTo(map);
        lczLayer2.addTo(map);

        console.log('Couches affichées avec opacité');
    })
    .catch(err => {
        console.error('Erreur lors du chargement des données:', err);
        alert(`Erreur: ${err.message}`);
    });
}
