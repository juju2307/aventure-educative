// ==========================================================
// Le chef d'orchestre de l'application.
// Il montre le bon écran au bon moment et réagit aux boutons.
// Les profils sont gérés par js/profils.js, la liste des mondes est dans js/mondes.js.
// ==========================================================

// Le joueur en train de jouer (null tant que personne n'est choisi).
let profilActif = null;

// Les écrans où la barre du haut (maison + joueur) est visible.
const ECRANS_AVEC_BARRE = ["ecran-carte", "ecran-monde"];

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

  // La barre du haut n'apparaît qu'une fois un joueur choisi
  const avecBarre = ECRANS_AVEC_BARRE.includes(idEcran);
  el("barre").hidden = !avecBarre;
  document.body.classList.toggle("avec-barre", avecBarre);
  // Sur la carte, on est déjà à la maison : le bouton maison se cache
  el("bouton-maison").hidden = idEcran === "ecran-carte";

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
  profilActif = null;
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

// ----- La carte des mondes -----

// Quand un joueur est choisi : on le retient, on met son image dans la barre,
// puis on l'emmène sur la carte.
function ouvrirProfil(profil) {
  profilActif = profil;
  const avatar = trouverAvatar(profil.avatar);

  el("joueur-avatar").textContent = avatar.image;
  el("joueur-avatar").style.background = avatar.couleur;
  el("bouton-joueur").setAttribute("aria-label", "Changer de joueur (" + profil.prenom + ")");

  afficherCarte();
}

// Les dessins (la mer, les îles) sont dans js/dessins.js.

// Fabrique la carte une seule fois, au démarrage.
function construireCarte() {
  // La mer (deux versions ; le CSS montre la bonne selon la taille de l'écran)
  el("fond-mer").innerHTML = dessinerMer("portrait") + dessinerMer("large");

  const liste = el("liste-mondes");

  MONDES.forEach((monde, numero) => {
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "ile";
    // La couleur et la place de l'île sont passées au CSS par des « variables »
    bouton.style.setProperty("--couleur-monde", monde.couleur);
    bouton.style.setProperty("--couleur-monde-fonce", monde.fonce);
    bouton.style.setProperty("--x-portrait", monde.place.portrait[0] + "%");
    bouton.style.setProperty("--y-portrait", monde.place.portrait[1] + "%");
    bouton.style.setProperty("--x-large", monde.place.large[0] + "%");
    bouton.style.setProperty("--y-large", monde.place.large[1] + "%");

    // L'île dessinée, avec le monument de son monde
    const dessin = document.createElement("span");
    dessin.className = "ile-dessin";
    dessin.innerHTML = dessinerIle(monde, numero);

    // Un monde pas encore prêt porte l'étiquette « Bientôt ! » sur sa plage
    if (!monde.pret) {
      const bientot = document.createElement("span");
      bientot.className = "ile-bientot";
      bientot.textContent = "Bientôt !";
      dessin.append(bientot);
    }

    // Le nom, sur un ruban de la couleur du monde
    const nom = document.createElement("span");
    nom.className = "ile-nom";
    nom.textContent = monde.nom;

    bouton.append(dessin, nom);
    // Ce que lit le lecteur d'écran : le nom d'abord, puis « bientôt »
    bouton.setAttribute("aria-label", monde.pret ? monde.nom : monde.nom + ", bientôt !");
    bouton.addEventListener("click", () => ouvrirMonde(monde));

    const ligne = document.createElement("li");
    ligne.append(bouton);
    liste.append(ligne);
  });
}

function afficherCarte() {
  // Sécurité : sans joueur choisi, on revient au choix du joueur
  if (!profilActif) {
    afficherQuiJoue();
    return;
  }
  el("carte-titre").textContent = "Bonjour " + profilActif.prenom + " !";
  afficherEcran("ecran-carte");
}

// ----- Un monde -----

// Pour l'instant, tous les mondes affichent « Bientôt ! ».
// Les phases suivantes ouvriront ici les vraies activités.
function ouvrirMonde(monde) {
  const ecran = el("ecran-monde");
  // Le fond de l'écran prend la couleur pâle du monde
  ecran.style.setProperty("--couleur-monde", monde.couleur);
  ecran.style.setProperty("--couleur-monde-fonce", monde.fonce);
  ecran.style.setProperty("--couleur-monde-clair", monde.clair);

  // On montre l'île du monde en grand
  el("monde-image").innerHTML = dessinerIle(monde, MONDES.indexOf(monde));
  el("monde-titre").textContent = monde.nom;

  afficherEcran("ecran-monde");
}

// ----- Démarrage -----

function demarrer() {
  // On branche chaque bouton sur ce qu'il doit faire
  el("bouton-nouveau").addEventListener("click", afficherCreation);
  el("bouton-retour").addEventListener("click", afficherQuiJoue);
  el("bouton-maison").addEventListener("click", afficherCarte);
  el("bouton-joueur").addEventListener("click", afficherQuiJoue);
  el("formulaire-profil").addEventListener("submit", validerCreation);
  // Dès que l'enfant corrige quelque chose, le message d'aide s'en va
  el("formulaire-profil").addEventListener("input", cacherAide);

  construireCarte();
  afficherQuiJoue();

  // La classe « pret » déclenche l'apparition douce des écrans (voir le CSS)
  document.body.classList.add("pret");
}

// On attend que la page soit chargée avant de démarrer,
// comme on attend que tous les invités soient arrivés pour commencer la fête.
document.addEventListener("DOMContentLoaded", demarrer);
