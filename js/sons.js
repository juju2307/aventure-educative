// ==========================================================
// Les sons de base de l'application.
//
// Aucun fichier son : ils sont fabriqués par l'appareil avec la « Web Audio API »,
// un petit synthétiseur caché dans le navigateur. Une note = un « oscillateur »
// (qui vibre à une certaine hauteur) + un « volume » qui monte vite puis s'éteint
// doucement, comme une cloche qu'on frappe.
//
// Règle du cahier des charges : jamais de son négatif, et l'application
// doit rester utilisable sans le son.
// ==========================================================

// L'étiquette du tiroir des réglages (le bouton pour couper les sons
// viendra à l'étape 5, derrière la barrière parentale).
const CLE_REGLAGES = "aventure-educative.reglages";

// Le synthétiseur, créé au premier son seulement : les téléphones exigent
// que l'enfant ait touché l'écran avant que la page ait le droit de faire du bruit.
let synthe = null;

// Les sons sont-ils permis ? Oui, sauf si un parent les a coupés dans les réglages.
function sonsPermis() {
  try {
    const reglages = JSON.parse(localStorage.getItem(CLE_REGLAGES) || "{}");
    return reglages.sons !== false;
  } catch (erreur) {
    return true;
  }
}

// Prépare le synthétiseur (une seule fois) et le réveille s'il dort.
function preparerSynthe() {
  const Synthe = window.AudioContext || window.webkitAudioContext;
  if (!Synthe) {
    return null; // très vieux navigateur : on reste simplement silencieux
  }
  if (!synthe) {
    synthe = new Synthe();
  }
  if (synthe.state === "suspended") {
    synthe.resume();
  }
  return synthe;
}

// Joue une note.
//   frequence : la hauteur (en hertz ; plus c'est grand, plus c'est aigu)
//   depart    : dans combien de secondes elle commence
//   duree     : combien de temps elle résonne
//   forme     : le « timbre » ("sine" = doux et rond, "triangle" = un peu plus clair)
//   volume    : entre 0 et 1 (on reste bas : c'est pour des oreilles d'enfants)
//   glisse    : si on donne une 2e fréquence, la note glisse vers elle
function jouerNote(frequence, depart, duree, forme, volume, glisse) {
  const maintenant = synthe.currentTime + depart;
  const oscillateur = synthe.createOscillator();
  const gain = synthe.createGain();

  oscillateur.type = forme;
  oscillateur.frequency.setValueAtTime(frequence, maintenant);
  if (glisse) {
    oscillateur.frequency.exponentialRampToValueAtTime(glisse, maintenant + duree * 0.8);
  }

  // Le volume monte en 1 centième de seconde, puis s'éteint doucement
  gain.gain.setValueAtTime(0.0001, maintenant);
  gain.gain.exponentialRampToValueAtTime(volume, maintenant + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, maintenant + duree);

  oscillateur.connect(gain);
  gain.connect(synthe.destination);
  oscillateur.start(maintenant);
  oscillateur.stop(maintenant + duree + 0.05);
}

// Les recettes des sons. Les nombres sont des notes de musique :
// 523 = do, 659 = mi, 784 = sol, 1047 = le do au-dessus.
const SONS = {
  // Un petit « pop » doux quand on touche un bouton
  pop: () => jouerNote(520, 0, 0.09, "sine", 0.25, 880),

  // Un « bloup » qui monte, pour ouvrir une île
  ouverture: () => {
    jouerNote(330, 0, 0.22, "sine", 0.25, 660);
    jouerNote(990, 0.12, 0.25, "sine", 0.12);
  },

  // Des étincelles qui montent, quand on touche Lumo
  magie: () => {
    [1319, 1568, 2093, 2637].forEach((note, i) => {
      jouerNote(note, i * 0.06, 0.3, "sine", 0.12);
    });
  },

  // Un « ta-da » joyeux : do, mi, sol, do (pour une réussite)
  joie: () => {
    [523, 659, 784, 1047].forEach((note, i) => {
      jouerNote(note, i * 0.09, i === 3 ? 0.5 : 0.25, "triangle", 0.2);
    });
  },
};

// Joue un son par son nom, si les sons sont permis.
function jouerSon(nom) {
  if (!sonsPermis() || !SONS[nom]) {
    return;
  }
  try {
    if (preparerSynthe()) {
      SONS[nom]();
    }
  } catch (erreur) {
    // Un son qui rate ne doit jamais empêcher de jouer : on l'ignore.
  }
}

// Branche les sons sur les boutons de toute l'application, en un seul endroit.
// (Un seul « écouteur » sur la page entière plutôt qu'un par bouton :
// il attrape tous les touchers, même sur les boutons créés plus tard.)
function installerSons() {
  document.addEventListener("click", (evenement) => {
    const bouton = evenement.target.closest("button");
    if (!bouton || bouton.disabled) {
      return;
    }
    if (bouton.classList.contains("lumo")) {
      jouerSon("magie");
    } else if (bouton.classList.contains("ile")) {
      jouerSon("ouverture");
    } else if (bouton.classList.contains("bouton-ecouter")) {
      // Le haut-parleur : pas de « pop », Lumo parle directement
    } else if (bouton.type === "submit") {
      // « C'est parti ! » : le son de joie est joué par app.js,
      // seulement si le joueur a bien été créé
    } else {
      jouerSon("pop");
    }
  });

  // Les cases à choisir (images, niveaux) font aussi « pop »
  document.addEventListener("change", (evenement) => {
    if (evenement.target.matches('input[type="radio"]')) {
      jouerSon("pop");
    }
  });
}
