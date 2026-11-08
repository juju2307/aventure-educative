// ==========================================================
// La voix de Lumo : la synthèse vocale du navigateur, en français.
//
// Le téléphone lit le texte lui-même, avec une des voix déjà installées :
// rien n'est envoyé sur Internet. Plus tard, de vrais enregistrements
// pourront remplacer cette voix.
// ==========================================================

// La synthèse vocale existe-t-elle sur cet appareil ?
const VOIX_DISPONIBLE = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

// La voix française choisie (trouvée par choisirVoix)
let voixFrancaise = null;

// Le guide (Lumo + bulle) qui est en train de parler, pour animer sa bouche
let guideQuiParle = null;

// Le dessin du haut-parleur des boutons « Écouter »
const ICONE_HAUT_PARLEUR = `
  <svg viewBox="0 0 48 48" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 18 h8 l11 -9 v30 l-11 -9 h-8 Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    <path class="onde onde-1" d="M32 18 q4 6 0 12" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
    <path class="onde onde-2" d="M37 13 q8 11 0 22" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
  </svg>`;

// La voix est-elle permise ? Oui, sauf si un parent l'a coupée dans
// les réglages (le bouton viendra à l'étape 5).
function voixPermise() {
  try {
    const reglages = JSON.parse(localStorage.getItem("aventure-educative.reglages") || "{}");
    return reglages.voix !== false;
  } catch (erreur) {
    return true;
  }
}

// Des prénoms de voix féminines françaises, plus douces pour Lumo,
// sur iPhone/iPad/Mac (Audrey, Amélie, Marie, Aurélie…), Windows (Hortense,
// Julie, Denise…) et Android.
const VOIX_DOUCES = /audrey|am[ée]lie|marie|aur[ée]lie|virginie|julie|hortense|denise|eloise|[ée]lo[ïi]se|chantal|sylvie|brigitte|female|femme/i;

// Les voix de meilleure qualité (plus naturelles, moins « robot »)
const VOIX_DE_QUALITE = /premium|enhanced|am[ée]lior[ée]e|natural|neural/i;

// Donne une note à une voix : plus la note est haute, plus elle convient à Lumo.
function noterVoix(voix) {
  let note = 0;
  if (VOIX_DOUCES.test(voix.name)) note += 4;
  if (VOIX_DE_QUALITE.test(voix.name)) note += 3;
  if (/fr[-_](FR|BE)/i.test(voix.lang)) note += 1;
  return note;
}

// Cherche la meilleure voix française installée sur l'appareil.
// IMPORTANT : seulement les voix rangées DANS l'appareil (localService).
// Certaines voix (comme « Google français » dans Chrome) envoient le texte
// sur Internet pour le lire : le prénom de l'enfant partirait avec.
function choisirVoix() {
  const francaises = window.speechSynthesis.getVoices()
    .filter((voix) => /^fr/i.test(voix.lang) && voix.localService);
  francaises.sort((a, b) => noterVoix(b) - noterVoix(a));
  voixFrancaise = francaises[0] || null;
}

// Retire les émojis (🏠…) : la voix les lirait bizarrement.
function nettoyerPourLaVoix(texte) {
  return texte
    .replace(/\p{Extended_Pictographic}️?/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Lumo arrête de parler (sa bouche aussi).
function arreterVoix() {
  if (!VOIX_DISPONIBLE) {
    return;
  }
  window.speechSynthesis.cancel();
  if (guideQuiParle) {
    guideQuiParle.classList.remove("parle");
    guideQuiParle = null;
  }
}

// Fait dire un texte à Lumo. « guide » = le bloc Lumo + bulle qui parle
// (pour animer sa bouche) ; on peut ne pas le donner.
function parler(texte, guide) {
  if (!VOIX_DISPONIBLE || !voixPermise()) {
    return;
  }
  const phrase = nettoyerPourLaVoix(texte);
  // Pas de voix française dans l'appareil : on se tait plutôt que de lire
  // avec un accent étranger ou une voix qui passe par Internet
  if (!phrase || !voixFrancaise) {
    return;
  }

  // Si Lumo parlait déjà, elle s'arrête pour dire la nouvelle phrase
  arreterVoix();

  const enonce = new SpeechSynthesisUtterance(phrase);
  enonce.voice = voixFrancaise;
  enonce.lang = voixFrancaise.lang;
  enonce.rate = 0.92;  // un peu plus lentement que la normale, pour les petits
  enonce.pitch = 1.05; // à peine plus aigu : trop aigu, ça sonne plus « robot »

  if (guide) {
    guideQuiParle = guide;
    guide.classList.add("parle");
    const finir = () => {
      guide.classList.remove("parle");
      if (guideQuiParle === guide) {
        guideQuiParle = null;
      }
    };
    enonce.onend = finir;
    enonce.onerror = finir;
  }

  window.speechSynthesis.speak(enonce);
}

// Lit la consigne d'une bulle (par l'id de son texte).
function lireBulle(idBulle) {
  const texte = document.getElementById(idBulle);
  parler(texte.textContent, texte.closest(".guide"));
}

// Prépare les boutons « Écouter » de toutes les bulles.
function installerVoix() {
  const boutons = document.querySelectorAll(".bouton-ecouter");

  // Pas de voix sur cet appareil : on cache les haut-parleurs plutôt
  // que d'afficher des boutons qui ne font rien
  if (!VOIX_DISPONIBLE) {
    boutons.forEach((bouton) => { bouton.hidden = true; });
    return;
  }

  choisirVoix();
  // Sur certains appareils, la liste des voix arrive un peu plus tard
  window.speechSynthesis.addEventListener("voiceschanged", choisirVoix);

  boutons.forEach((bouton) => {
    bouton.innerHTML = ICONE_HAUT_PARLEUR;
    bouton.addEventListener("click", () => {
      const texte = bouton.closest(".bulle").querySelector(".bulle-texte");
      lireBulle(texte.id);
    });
  });
}
