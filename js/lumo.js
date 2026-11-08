// ==========================================================
// Lumo la luciole, la mascotte qui guide l'enfant.
//
// Elle est dessinée en SVG (le même dessin que assets/mascotte/lumo.svg),
// mais directement dans la page : comme ça, le CSS peut animer chaque partie
// (les ailes, les yeux, la lumière) et changer son sourire.
// ==========================================================

// Ce que Lumo dit quand on la touche (tirée au hasard, jamais deux fois de suite).
const PHRASES_LUMO = [
  "Coucou !",
  "Je m'appelle Lumo !",
  "Je brille quand tu réussis !",
  "On part à l'aventure ?",
  "Hi hi, ça chatouille !",
];

let dernierePhrase = -1;

// Le dessin de Lumo. Chaque partie qui bouge a sa « classe » pour le CSS.
function dessinerLumo() {
  return `
    <svg class="lumo-svg" viewBox="0 0 200 200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <circle class="lumo-lueur" cx="100" cy="115" r="78" fill="#ffd34d" opacity=".4"/>
      <g class="lumo-corps">
        <!-- les ailes -->
        <g class="lumo-aile lumo-aile-g">
          <ellipse cx="62" cy="62" rx="30" ry="20" fill="#cfe8ff" stroke="#7fb2e5" stroke-width="3" opacity=".9" transform="rotate(-25 62 62)"/>
        </g>
        <g class="lumo-aile lumo-aile-d">
          <ellipse cx="138" cy="62" rx="30" ry="20" fill="#cfe8ff" stroke="#7fb2e5" stroke-width="3" opacity=".9" transform="rotate(25 138 62)"/>
        </g>
        <!-- les antennes -->
        <path d="M85 60 Q78 30 64 26" fill="none" stroke="#23324a" stroke-width="4" stroke-linecap="round"/>
        <path d="M115 60 Q122 30 136 26" fill="none" stroke="#23324a" stroke-width="4" stroke-linecap="round"/>
        <circle cx="63" cy="25" r="7" fill="#ffb627"/>
        <circle cx="137" cy="25" r="7" fill="#ffb627"/>
        <!-- le corps rond et le ventre clair -->
        <circle cx="100" cy="112" r="56" fill="#ffc93c" stroke="#e8a317" stroke-width="4"/>
        <ellipse cx="100" cy="135" rx="34" ry="24" fill="#fff1b8"/>
        <ellipse cx="80" cy="84" rx="16" ry="9" fill="#fff" opacity=".35" transform="rotate(-25 80 84)"/>
        <!-- les yeux (ils clignent) -->
        <g class="lumo-yeux">
          <circle cx="80" cy="102" r="10" fill="#23324a"/>
          <circle cx="120" cy="102" r="10" fill="#23324a"/>
          <circle cx="83" cy="98" r="3.5" fill="#fff"/>
          <circle cx="123" cy="98" r="3.5" fill="#fff"/>
        </g>
        <!-- les joues -->
        <circle cx="66" cy="120" r="8" fill="#ff9f8a" opacity=".7"/>
        <circle cx="134" cy="120" r="8" fill="#ff9f8a" opacity=".7"/>
        <!-- deux sourires : le normal, et le grand sourire de joie -->
        <path class="lumo-sourire" d="M88 122 Q100 134 112 122" fill="none" stroke="#23324a" stroke-width="4" stroke-linecap="round"/>
        <path class="lumo-grand-sourire" d="M86 119 Q100 142 114 119 Z" fill="#23324a"/>
      </g>
    </svg>`;
}

// Choisit une phrase au hasard, différente de la précédente.
function phraseAuHasard() {
  let numero;
  do {
    numero = Math.floor(Math.random() * PHRASES_LUMO.length);
  } while (numero === dernierePhrase && PHRASES_LUMO.length > 1);
  dernierePhrase = numero;
  return PHRASES_LUMO[numero];
}

// Quand on touche Lumo : elle saute de joie et dit une petite phrase
// dans sa bulle, puis la consigne normale revient après 3 secondes.
function toucherLumo(bouton) {
  const guide = bouton.closest(".guide");
  const bulle = guide.querySelector(".bulle-texte");

  // On garde la consigne de côté pour la remettre ensuite
  if (!bulle.dataset.consigne) {
    bulle.dataset.consigne = bulle.textContent;
  }
  bulle.textContent = phraseAuHasard();
  // …et elle la dit à voix haute (voir js/voix.js)
  parler(bulle.textContent, guide);

  // Retirer puis remettre la classe relance l'animation à chaque toucher
  bouton.classList.remove("lumo-joie");
  void bouton.offsetWidth; // petite astuce : force le navigateur à « voir » le retrait
  bouton.classList.add("lumo-joie");

  clearTimeout(bouton.minuteur);
  bouton.minuteur = setTimeout(() => {
    bouton.classList.remove("lumo-joie");
    // Si la consigne a changé entre-temps (nouvel écran), on n'y touche pas
    if (bulle.dataset.consigne !== undefined) {
      bulle.textContent = bulle.dataset.consigne;
      delete bulle.dataset.consigne;
    }
  }, 3000);
}

// Change ce que dit Lumo dans une bulle (utilisé par app.js).
function lumoDit(idBulle, texte) {
  const bulle = document.getElementById(idBulle);
  delete bulle.dataset.consigne;
  bulle.textContent = texte;
}

// Met le dessin de Lumo dans chaque emplacement prévu (les boutons « .lumo »)
// et branche le toucher.
function installerLumo() {
  document.querySelectorAll(".lumo").forEach((bouton) => {
    bouton.innerHTML = dessinerLumo();
    bouton.addEventListener("click", () => toucherLumo(bouton));
  });
}
