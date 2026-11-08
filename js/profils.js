// ==========================================================
// Le tiroir des profils.
// Ce fichier sait lire, créer et ranger les profils des joueurs
// dans le « localStorage » : un petit tiroir que le navigateur
// garde dans l'appareil, même quand on ferme l'application.
// Rien ne part sur Internet.
// ==========================================================

// Le nom de l'étiquette collée sur notre tiroir.
const CLE_PROFILS = "aventure-educative.profils";

// Pas plus de 4 joueurs par appareil (une fratrie).
const MAX_PROFILS = 4;

// Les images qu'un enfant peut choisir. Le « nom » sert aux lecteurs d'écran
// (VoiceOver, TalkBack), la « couleur » au fond de l'image.
const AVATARS = [
  { id: "renard",     image: "🦊", nom: "le renard",     couleur: "#ffe0c7" },
  { id: "panda",      image: "🐼", nom: "le panda",      couleur: "#e6e9f0" },
  { id: "grenouille", image: "🐸", nom: "la grenouille", couleur: "#d9f2d0" },
  { id: "chat",       image: "🐱", nom: "le chat",       couleur: "#fff0c2" },
  { id: "lion",       image: "🦁", nom: "le lion",       couleur: "#ffe6a8" },
  { id: "lapin",      image: "🐰", nom: "le lapin",      couleur: "#fde0ec" },
  { id: "pieuvre",    image: "🐙", nom: "la pieuvre",    couleur: "#f3dcf5" },
  { id: "licorne",    image: "🦄", nom: "la licorne",    couleur: "#dfe4ff" },
];

// Les 3 niveaux de départ (voir le cahier des charges, section 2).
const NIVEAUX = [
  { id: "explorateur", nom: "Explorateur", age: "6-7 ans",   image: "🌱" },
  { id: "aventurier",  nom: "Aventurier",  age: "8-9 ans",   image: "🧭" },
  { id: "expert",      nom: "Expert",      age: "10-12 ans", image: "🚀" },
];

// Retrouver un avatar ou un niveau à partir de son identifiant.
function trouverAvatar(id) {
  return AVATARS.find((avatar) => avatar.id === id) || AVATARS[0];
}

function trouverNiveau(id) {
  return NIVEAUX.find((niveau) => niveau.id === id) || NIVEAUX[0];
}

// Lire la liste des profils rangés dans le tiroir.
// Le tiroir ne contient que du texte : JSON.parse le retransforme en liste.
// Si le tiroir est vide ou abîmé, on repart d'une liste vide plutôt que de planter.
function lireProfils() {
  try {
    const texte = localStorage.getItem(CLE_PROFILS);
    if (!texte) {
      return [];
    }
    const liste = JSON.parse(texte);
    return Array.isArray(liste) ? liste : [];
  } catch (erreur) {
    return [];
  }
}

// Ranger la liste dans le tiroir (JSON.stringify la transforme en texte).
// Renvoie false si le navigateur refuse (navigation privée, mémoire pleine…).
function enregistrerProfils(liste) {
  try {
    localStorage.setItem(CLE_PROFILS, JSON.stringify(liste));
    return true;
  } catch (erreur) {
    return false;
  }
}

// Nettoyer un prénom : on enlève les espaces en trop et on coupe à 15 lettres.
function nettoyerPrenom(texte) {
  return texte.replace(/\s+/g, " ").trim().slice(0, 15);
}

// Créer un nouveau profil et le ranger.
// Renvoie le profil créé, ou null si ce n'est pas possible.
function creerProfil(prenom, avatarId, niveauId) {
  const liste = lireProfils();
  if (liste.length >= MAX_PROFILS) {
    return null;
  }

  const profil = {
    // Un numéro unique, fabriqué à partir de l'heure et d'un peu de hasard
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    prenom: nettoyerPrenom(prenom),
    avatar: avatarId,
    niveauDepart: niveauId,
    creeLe: new Date().toISOString(),
  };

  liste.push(profil);
  return enregistrerProfils(liste) ? profil : null;
}
