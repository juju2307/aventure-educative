// ==========================================================
// Le chef d'orchestre de l'application.
// Il montre le bon écran au bon moment et réagit aux boutons.
// Les profils eux-mêmes sont gérés par js/profils.js.
// ==========================================================

// Un petit raccourci pour attraper un élément de la page par son id.
function el(id) {
  return document.getElementById(id);
}

// ----- Changer d'écran -----

// Montre un seul écran et cache les autres, comme on tourne la page d'un livre.
function afficherEcran(idEcran) {
  document.querySelectorAll(".ecran").forEach((ecran) => {
    ecran.hidden = ecran.id !== idEcran;
  });
  window.scrollTo(0, 0);
  // On place le « curseur invisible » sur le titre : les lecteurs d'écran
  // annoncent ainsi le nouvel écran à l'enfant qui ne voit pas bien.
  const titre = el(idEcran).querySelector("h1");
  if (titre) {
    titre.focus({ preventScroll: true });
  }
}

// ----- Écran « Qui joue ? » -----

function afficherQuiJoue() {
  const profils = lireProfils();
  const liste = el("liste-profils");
  liste.innerHTML = "";

  profils.forEach((profil) => {
    const avatar = trouverAvatar(profil.avatar);

    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "bouton-profil";

    const image = document.createElement("span");
    image.className = "avatar";
    image.style.background = avatar.couleur;
    image.textContent = avatar.image;
    image.setAttribute("aria-hidden", "true");

    // textContent (et pas innerHTML) : le prénom est affiché tel quel,
    // jamais interprété comme du code.
    const nom = document.createElement("span");
    nom.className = "nom-profil";
    nom.textContent = profil.prenom;

    bouton.append(image, nom);
    bouton.addEventListener("click", () => ouvrirProfil(profil));

    const ligne = document.createElement("li");
    ligne.append(bouton);
    liste.append(ligne);
  });

  // La consigne change selon qu'il y a déjà des joueurs ou non
  el("consigne-qui-joue").textContent = profils.length > 0
    ? "Touche ton image pour commencer."
    : "Crée ton joueur pour commencer l'aventure.";

  // Au-delà de 4 joueurs, le bouton « Nouveau joueur » disparaît
  const complet = profils.length >= MAX_PROFILS;
  el("bouton-nouveau").hidden = complet;
  el("message-complet").hidden = !complet;

  afficherEcran("ecran-qui-joue");
}

// ----- Écran de création -----

// Fabrique une case à choisir (une image ou un niveau).
// On utilise de vrais « boutons radio » cachés : un seul choix possible,
// et ça marche tout seul avec le clavier et les lecteurs d'écran.
function creerChoix(groupe, valeur, contenu, etiquette, desactive) {
  const label = document.createElement("label");
  label.className = "choix";

  const radio = document.createElement("input");
  radio.type = "radio";
  radio.name = groupe;
  radio.value = valeur;
  radio.className = "cache-visuel";
  radio.disabled = desactive;
  radio.setAttribute("aria-label", etiquette);

  const boite = document.createElement("span");
  boite.className = "choix-boite";
  boite.append(contenu);

  label.append(radio, boite);
  return label;
}

function afficherCreation() {
  // On remet la fiche à zéro
  el("formulaire-profil").reset();
  cacherAide();

  // Les images déjà prises par un autre joueur sont grisées :
  // chaque enfant reconnaît ainsi la sienne sans savoir lire.
  const prises = lireProfils().map((profil) => profil.avatar);

  const grilleAvatars = el("choix-avatar");
  grilleAvatars.innerHTML = "";
  AVATARS.forEach((avatar) => {
    const prise = prises.includes(avatar.id);
    const image = document.createElement("span");
    image.className = "avatar";
    image.style.background = avatar.couleur;
    image.textContent = avatar.image;
    const etiquette = prise ? avatar.nom + " (déjà pris)" : avatar.nom;
    grilleAvatars.append(creerChoix("avatar", avatar.id, image, etiquette, prise));
  });

  const grilleNiveaux = el("choix-niveau");
  grilleNiveaux.innerHTML = "";
  NIVEAUX.forEach((niveau) => {
    const contenu = document.createElement("span");
    contenu.className = "niveau";
    contenu.innerHTML =
      '<span class="niveau-image" aria-hidden="true">' + niveau.image + "</span>" +
      '<span class="niveau-nom">' + niveau.nom + "</span>" +
      '<span class="niveau-age">' + niveau.age + "</span>";
    grilleNiveaux.append(
      creerChoix("niveau", niveau.id, contenu, niveau.nom + ", " + niveau.age, false)
    );
  });

  afficherEcran("ecran-creation");
}

function montrerAide(texte) {
  const aide = el("message-aide");
  aide.textContent = "💡 " + texte;
  aide.hidden = false;
}

function cacherAide() {
  el("message-aide").hidden = true;
}

// Quand on appuie sur « C'est parti ! »
function validerCreation(evenement) {
  // Empêche le navigateur de recharger la page (comportement normal d'un formulaire)
  evenement.preventDefault();

  const fiche = new FormData(el("formulaire-profil"));
  const prenom = nettoyerPrenom(fiche.get("prenom") || "");
  const avatarId = fiche.get("avatar");
  const niveauId = fiche.get("niveau");

  // On vérifie dans l'ordre de la fiche, avec un message doux
  if (!prenom) {
    montrerAide("Écris ton prénom.");
    el("prenom").focus();
    return;
  }
  if (!avatarId) {
    montrerAide("Choisis une image.");
    return;
  }
  if (!niveauId) {
    montrerAide("Choisis ton niveau.");
    return;
  }

  const profil = creerProfil(prenom, avatarId, niveauId);
  if (!profil) {
    montrerAide("Oups, le joueur n'a pas pu être enregistré sur cet appareil.");
    return;
  }

  ouvrirProfil(profil);
}

// ----- Écran « Bonjour » -----

function ouvrirProfil(profil) {
  const avatar = trouverAvatar(profil.avatar);
  const niveau = trouverNiveau(profil.niveauDepart);

  el("bonjour-avatar").textContent = avatar.image;
  el("bonjour-avatar").style.background = avatar.couleur;
  el("bonjour-titre").textContent = "Bonjour " + profil.prenom + " !";
  el("bonjour-niveau").textContent = niveau.image + " " + niveau.nom;

  afficherEcran("ecran-bonjour");
}

// ----- Démarrage -----

function demarrer() {
  // On branche chaque bouton sur ce qu'il doit faire
  el("bouton-nouveau").addEventListener("click", afficherCreation);
  el("bouton-retour").addEventListener("click", afficherQuiJoue);
  el("bouton-changer").addEventListener("click", afficherQuiJoue);
  el("formulaire-profil").addEventListener("submit", validerCreation);
  // Dès que l'enfant corrige quelque chose, le message d'aide s'en va
  el("formulaire-profil").addEventListener("input", cacherAide);

  afficherQuiJoue();

  // La classe « pret » déclenche l'apparition douce des cartes (voir le CSS)
  document.body.classList.add("pret");
}

// On attend que la page soit chargée avant de démarrer,
// comme on attend que tous les invités soient arrivés pour commencer la fête.
document.addEventListener("DOMContentLoaded", demarrer);
