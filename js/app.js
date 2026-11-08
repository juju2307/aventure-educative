// ==========================================================
// Le chef d'orchestre de l'application.
// Pour l'instant, il se contente de dire « je suis prêt ».
// Les prochaines étapes y ajouteront les profils, la carte, etc.
// ==========================================================

function demarrer() {
  // On ajoute la classe « pret » à la page : le CSS fait alors
  // apparaître la carte de bienvenue en douceur.
  document.body.classList.add("pret");
}

// On attend que la page soit chargée avant de démarrer,
// comme on attend que tous les invités soient arrivés pour commencer la fête.
document.addEventListener("DOMContentLoaded", demarrer);
