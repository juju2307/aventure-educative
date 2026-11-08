// ==========================================================
// Les dessins de la carte : la mer et les 9 îles.
//
// Tout est dessiné en SVG : une liste de formes décrites par des coordonnées,
// comme un dessin « relie les points ». Ça reste net à toutes les tailles
// et ça ne pèse presque rien (aucune image à télécharger).
//
// Règle de lumière, pour que tout ait l'air « vrai » : le soleil vient
// d'en haut à gauche. Donc les faces de gauche et du haut sont plus claires,
// les faces de droite plus foncées, et les ombres tombent en bas à droite.
// ==========================================================

// ---------- Petits outils de dessin ----------

// Arrondit un nombre à 1 chiffre après la virgule (dessins plus légers).
function r1(nombre) {
  return Math.round(nombre * 10) / 10;
}

// Trace une courbe douce qui passe par tous les points.
// Chaque morceau regarde le point d'avant et celui d'après pour tourner
// en douceur, comme un vélo qui prend un virage.
// « ferme » = true pour une forme fermée (le contour d'une île).
function courbeLisse(points, ferme) {
  const n = points.length;
  const pt = (i) => ferme ? points[(i + n) % n] : points[Math.max(0, Math.min(n - 1, i))];
  let d = `M${r1(points[0][0])} ${r1(points[0][1])}`;
  const fin = ferme ? n : n - 1;
  for (let i = 0; i < fin; i++) {
    const p0 = pt(i - 1), p1 = pt(i), p2 = pt(i + 1), p3 = pt(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return ferme ? d + "Z" : d;
}

// Les « bosses » de chaque contour d'île : 8 nombres proches de 1.
// Un peu plus que 1 = le bord avance, un peu moins = il rentre.
const RELIEFS = [
  [1, 0.93, 1.05, 0.97, 1.02, 0.94, 1.06, 0.98],
  [0.96, 1.05, 0.95, 1.03, 0.98, 1.05, 0.93, 1.01],
  [1.04, 0.96, 1.0, 1.06, 0.94, 1.0, 0.97, 1.05],
];

// Une forme ovale un peu cabossée, centrée en (cx, cy).
function tache(cx, cy, rx, ry, relief) {
  const points = relief.map((facteur, i) => {
    const angle = (i / relief.length) * Math.PI * 2;
    return [cx + Math.cos(angle) * rx * facteur, cy + Math.sin(angle) * ry * facteur];
  });
  return courbeLisse(points, true);
}

// Une étoile à 5 branches.
function etoile(cx, cy, rayon, couleur) {
  const points = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? rayon : rayon * 0.45;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    points.push(`${r1(cx + Math.cos(angle) * r)},${r1(cy + Math.sin(angle) * r)}`);
  }
  return `<polygon points="${points.join(" ")}" fill="${couleur}"/>`;
}

// Un cube vu un peu d'en haut, avec une lettre sur sa face avant.
function cube(x, y, cote, couleur, fonce, lettre) {
  const p = cote * 0.32; // la profondeur
  return `
    <polygon points="${x},${y} ${x + p},${y - p} ${x + cote + p},${y - p} ${x + cote},${y}" fill="${couleur}"/>
    <polygon points="${x},${y} ${x + p},${y - p} ${x + cote + p},${y - p} ${x + cote},${y}" fill="#fff" opacity=".35"/>
    <polygon points="${x + cote},${y} ${x + cote + p},${y - p} ${x + cote + p},${y + cote - p} ${x + cote},${y + cote}" fill="${fonce}"/>
    <rect x="${x}" y="${y}" width="${cote}" height="${cote}" fill="${couleur}"/>
    <text x="${x + cote / 2}" y="${r1(y + cote * 0.76)}" font-size="${r1(cote * 0.7)}" font-weight="700"
          font-family="Andika, sans-serif" text-anchor="middle" fill="#fff">${lettre}</text>`;
}

// Un buisson rond (une boule foncée + une boule claire pour la lumière).
function buisson(x, y, r) {
  return `
    <ellipse cx="${x + 2}" cy="${y + r * 0.7}" rx="${r}" ry="${r * 0.35}" fill="#1d4d1a" opacity=".25"/>
    <circle cx="${x}" cy="${y}" r="${r}" fill="#3f8a37"/>
    <circle cx="${r1(x - r * 0.25)}" cy="${r1(y - r * 0.28)}" r="${r1(r * 0.68)}" fill="#64b34c"/>
    <circle cx="${r1(x - r * 0.4)}" cy="${r1(y - r * 0.45)}" r="${r1(r * 0.25)}" fill="#8fd16a"/>`;
}

// Un palmier.
function palmier(x, y) {
  return `
    <ellipse cx="${x + 4}" cy="${y + 1}" rx="9" ry="2.5" fill="#1d4d1a" opacity=".25"/>
    <path d="M${x} ${y} Q${x + 4} ${y - 14} ${x - 2} ${y - 28}" fill="none" stroke="#8a5427" stroke-width="4" stroke-linecap="round"/>
    <path d="M${x} ${y} Q${x + 4} ${y - 14} ${x - 2} ${y - 28}" fill="none" stroke="#b07a46" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 3"/>
    <g fill="none" stroke-linecap="round" stroke-width="5">
      <path d="M${x - 2} ${y - 28} q-11 -6 -19 3" stroke="#2f7d33"/>
      <path d="M${x - 2} ${y - 28} q11 -8 20 -1" stroke="#2f7d33"/>
      <path d="M${x - 2} ${y - 28} q-6 -11 -16 -11" stroke="#4fa647"/>
      <path d="M${x - 2} ${y - 28} q7 -10 15 -12" stroke="#4fa647"/>
    </g>`;
}

// ---------- Les monuments : un par monde ----------
// Chacun reçoit la couleur vive (c) et la couleur foncée (f) de son monde.
// Ils sont dessinés dans une île de 160 × 140 ; le sol est vers y = 88.

const MONUMENTS = {
  // Maths : un grand boulier pour compter
  maths: (c, f) => {
    const perles = (y, xs, couleur) =>
      xs.map((x) => `<circle cx="${x}" cy="${y}" r="5" fill="${couleur}"/>
                     <circle cx="${x - 1.5}" cy="${y - 1.5}" r="1.8" fill="#fff" opacity=".6"/>`).join("");
    return `
      <ellipse cx="84" cy="89" rx="30" ry="5" fill="#000" opacity=".15"/>
      <rect x="52" y="40" width="6" height="49" rx="2" fill="#a0652f"/>
      <rect x="102" y="40" width="6" height="49" rx="2" fill="#7a4520"/>
      <rect x="49" y="36" width="62" height="7" rx="3" fill="#b8763a"/>
      <rect x="49" y="78" width="62" height="7" rx="3" fill="#8a5427"/>
      <g stroke="#5a3a1a" stroke-width="1.6">
        <line x1="58" y1="50" x2="102" y2="50"/>
        <line x1="58" y1="61" x2="102" y2="61"/>
        <line x1="58" y1="72" x2="102" y2="72"/>
      </g>
      ${perles(50, [63, 73, 83], c)}${perles(50, [97], "#ffffff")}
      ${perles(61, [63, 73], f)}${perles(61, [87, 97], c)}
      ${perles(72, [63], "#ffffff")}${perles(72, [77, 87, 97], c)}`;
  },

  // Mémoire : trois cartes du jeu de paires, dont une retournée
  memoire: (c, f) => {
    const dos = (x, angle) => `
      <g transform="rotate(${angle} ${x + 11} 88)">
        <rect x="${x}" y="54" width="23" height="34" rx="3.5" fill="${c}" stroke="${f}" stroke-width="1.5"/>
        <rect x="${x + 3}" y="57" width="17" height="28" rx="2" fill="none" stroke="#fff" stroke-width="1.2" opacity=".75"/>
        <circle cx="${x + 11.5}" cy="71" r="4" fill="#fff" opacity=".8"/>
      </g>`;
    return `
      <ellipse cx="84" cy="89" rx="30" ry="5" fill="#000" opacity=".15"/>
      ${dos(48, -16)}${dos(89, 16)}
      <rect x="68" y="48" width="25" height="38" rx="3.5" fill="#fff" stroke="${f}" stroke-width="1.5"/>
      <rect x="88" y="49" width="4" height="36" fill="#000" opacity=".06"/>
      ${etoile(80.5, 67, 10, c)}
      <circle cx="77" cy="64" r="1.6" fill="#fff" opacity=".8"/>`;
  },

  // Logique : un labyrinthe de haies et une grande pièce de puzzle
  logique: (c, f) => `
    <g fill="none" stroke-linecap="round">
      <ellipse cx="80" cy="90" rx="42" ry="15" stroke="#2f6e29" stroke-width="5.5" stroke-dasharray="74 14"/>
      <ellipse cx="80" cy="88.6" rx="42" ry="15" stroke="#5fae4f" stroke-width="2.5" stroke-dasharray="74 14"/>
      <ellipse cx="80" cy="90" rx="27" ry="9.5" stroke="#2f6e29" stroke-width="5.5" stroke-dasharray="44 12" stroke-dashoffset="22"/>
      <ellipse cx="80" cy="88.6" rx="27" ry="9.5" stroke="#5fae4f" stroke-width="2.5" stroke-dasharray="44 12" stroke-dashoffset="22"/>
    </g>
    <ellipse cx="84" cy="89" rx="20" ry="4" fill="#000" opacity=".18"/>
    <!-- La pièce de puzzle, un peu penchée : deux bosses (en haut, à droite)
         et un creux (à gauche), pour qu'on la reconnaisse tout de suite -->
    <g transform="translate(64 52) rotate(-8 15 30)">
      <path d="M0 0 h10 a5.5 5.5 0 1 1 10 0 h10 v10 a5.5 5.5 0 1 1 0 10 v14 h-30 v-14 a5.5 5.5 0 1 0 0 -10 Z"
            transform="translate(4 -3)" fill="${f}"/>
      <path d="M0 0 h10 a5.5 5.5 0 1 1 10 0 h10 v10 a5.5 5.5 0 1 1 0 10 v14 h-30 v-14 a5.5 5.5 0 1 0 0 -10 Z"
            fill="${c}" stroke="${f}" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M3 4 v4 M3 3 h5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
      <path d="M12 -5 a3.5 3.5 0 0 1 4 -2" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>
    </g>`,

  // Lecture : une maison dont le toit est un livre ouvert
  lecture: (c, f) => `
    <ellipse cx="84" cy="89" rx="36" ry="5" fill="#000" opacity=".15"/>
    <rect x="60" y="64" width="40" height="25" fill="#fbf4e6"/>
    <rect x="84" y="64" width="16" height="25" fill="#000" opacity=".07"/>
    <path d="M74 89 v-10 a6 6 0 0 1 12 0 v10 Z" fill="${f}"/>
    <rect x="63" y="71" width="7" height="7" rx="1.5" fill="#ffe7a3" stroke="#c9b48a"/>
    <rect x="90" y="71" width="7" height="7" rx="1.5" fill="#ffe7a3" stroke="#c9b48a"/>
    <!-- Le toit : un grand livre ouvert posé à l'envers, comme une tente.
         La couverture (couleur du monde), puis l'épaisseur des pages, puis le texte. -->
    <polygon points="38,70 80,22 122,70 115,72 80,31 45,72" fill="${c}"/>
    <polygon points="80,22 122,70 115,72 80,31" fill="${f}"/>
    <polygon points="44,68 80,27 116,68 109,68 80,35 51,68" fill="#fffdf7"/>
    <g fill="none" stroke="#e3d8c4" stroke-width="1">
      <polyline points="47,68 80,30.5 113,68"/>
      <polyline points="49.5,68 80,33 110.5,68"/>
    </g>
    <g stroke="#8e9bb0" stroke-width="1.6" stroke-linecap="round">
      <line x1="58" y1="61" x2="72" y2="45"/><line x1="63" y1="62" x2="75" y2="48.5"/><line x1="68" y1="63" x2="77" y2="53"/>
      <line x1="102" y1="61" x2="88" y2="45"/><line x1="97" y1="62" x2="85" y2="48.5"/><line x1="92" y1="63" x2="83" y2="53"/>
    </g>
    <path d="M80 22 v-0.5" stroke="${f}" stroke-width="4" stroke-linecap="round"/>
    <path d="M80 34 v26 l-3.5 -4 -3.5 4 v-22" fill="#ffc93c"/>`,

  // Vocabulaire : des cubes de lettres A, B, C
  vocabulaire: (c, f) => `
    <ellipse cx="84" cy="89" rx="32" ry="5" fill="#000" opacity=".15"/>
    ${cube(52, 66, 22, c, f, "A")}
    ${cube(78, 66, 22, "#ffb02e", "#c47a00", "B")}
    ${cube(64, 41, 22, "#3fa7d6", "#1f6f99", "C")}`,

  // Science : un grand flacon qui fait des bulles
  science: (c, f) => `
    <ellipse cx="84" cy="89" rx="26" ry="5" fill="#000" opacity=".15"/>
    <path d="M72 38 h16 v16 l15 26 q3 8 -6 8 h-34 q-9 0 -6 -8 l15 -26 Z" fill="#eaf8fc" stroke="#7d8da6" stroke-width="2"/>
    <path d="M65 66 h30 l8 14 q3 8 -6 8 h-34 q-9 0 -6 -8 Z" fill="${c}"/>
    <path d="M65 66 h30 l2 3.5 h-34 Z" fill="#fff" opacity=".35"/>
    <path d="M93 66 h2 l8 14 q3 8 -6 8 h-6 q8 -2 6 -9 Z" fill="${f}" opacity=".7"/>
    <rect x="69" y="34" width="22" height="6" rx="3" fill="#b9c6d8"/>
    <path d="M75 44 v10 l-8 14" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>
    <g class="anim-bulles" fill="#fff">
      <circle cx="78" cy="76" r="2.5" opacity=".8"/>
      <circle cx="86" cy="72" r="1.8" opacity=".8"/>
      <circle cx="81" cy="30" r="3" fill="${c}" opacity=".7"/>
      <circle cx="88" cy="22" r="2.2" fill="${c}" opacity=".5"/>
    </g>`,

  // Musique : un tambour, ses baguettes et des notes qui s'envolent
  musique: (c, f) => `
    <ellipse cx="84" cy="89" rx="28" ry="5" fill="#000" opacity=".15"/>
    <path d="M58 60 v20 a22 7 0 0 0 44 0 v-20 Z" fill="${c}"/>
    <path d="M86 60 v26.5 a22 7 0 0 0 16 -6.5 v-20 Z" fill="${f}" opacity=".6"/>
    <polyline points="58,63 65,82 72,63 79,85 86,63 93,84 100,64" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round" opacity=".9"/>
    <path d="M58 79 a22 7 0 0 0 44 0" fill="none" stroke="${f}" stroke-width="4"/>
    <ellipse cx="80" cy="60" rx="22" ry="7" fill="#fdf7ec" stroke="${f}" stroke-width="3"/>
    <g stroke-linecap="round">
      <line x1="66" y1="44" x2="84" y2="58" stroke="#a0652f" stroke-width="3"/>
      <line x1="98" y1="42" x2="78" y2="57" stroke="#a0652f" stroke-width="3"/>
      <circle cx="65" cy="43" r="3.2" fill="#fdf7ec"/><circle cx="99" cy="41" r="3.2" fill="#fdf7ec"/>
    </g>
    <g class="anim-notes" fill="${f}" font-family="sans-serif" font-weight="700">
      <text x="104" y="34" font-size="20">♪</text>
      <text x="42" y="38" font-size="17">♫</text>
    </g>`,

  // Yoga : un enfant qui médite sous un arbre, près d'un petit étang
  yoga: (c, f) => `
    <ellipse cx="112" cy="90" rx="15" ry="5.5" fill="#6ec8ee"/>
    <ellipse cx="110" cy="89" rx="8" ry="2" fill="#fff" opacity=".5"/>
    <circle cx="116" cy="90" r="2.6" fill="#f7a8c6"/>
    <rect x="47" y="58" width="6" height="30" rx="2" fill="#8a5427"/>
    <circle cx="50" cy="50" r="16" fill="#3f8a37"/>
    <circle cx="44" cy="46" r="10" fill="#64b34c"/>
    <circle cx="58" cy="44" r="9" fill="#64b34c"/>
    <circle cx="47" cy="41" r="4" fill="#8fd16a"/>
    <ellipse cx="82" cy="88" rx="20" ry="5" fill="${f}"/>
    <ellipse cx="82" cy="87" rx="18" ry="4" fill="${c}"/>
    <ellipse cx="82" cy="83" rx="14" ry="5" fill="${f}"/>
    <path d="M75 82 L77 66 h10 L89 82 Z" fill="${c}"/>
    <path d="M84 66 h3 L89 82 h-5 Z" fill="${f}" opacity=".5"/>
    <path d="M76 69 L69 80 M88 69 L95 80" stroke="#e7b48a" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="82" cy="59" r="7" fill="#e7b48a"/>
    <path d="M75 58 a7 7 0 0 1 14 0 q-7 -4 -14 0Z" fill="#5a3a1a"/>`,

  // Cuisine : une marmite qui fume, avec sa cuillère en bois
  cuisine: (c, f) => `
    <ellipse cx="84" cy="89" rx="30" ry="5" fill="#000" opacity=".15"/>
    <g fill="#8b97a8"><ellipse cx="62" cy="87" rx="6" ry="3.5"/><ellipse cx="98" cy="87" rx="6" ry="3.5"/></g>
    <path d="M72 88 q4 -10 8 -4 q3 -9 7 -1 q3 -6 4 5 Z" fill="#ff8a3d"/>
    <path d="M76 88 q3 -6 5 -2 q2 -5 4 0 q2 -3 2 2 Z" fill="#ffd34d"/>
    <path d="M56 58 h48 v12 q0 14 -14 14 h-20 q-14 0 -14 -14 Z" fill="${c}"/>
    <path d="M86 58 h18 v12 q0 14 -14 14 h-4 q12 -2 12 -16 Z" fill="${f}" opacity=".55"/>
    <path d="M60 62 v8 q0 6 4 9" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>
    <rect x="50" y="61" width="8" height="5" rx="2.5" fill="${f}"/>
    <rect x="102" y="61" width="8" height="5" rx="2.5" fill="${f}"/>
    <ellipse cx="80" cy="58" rx="25" ry="5.5" fill="${f}"/>
    <ellipse cx="80" cy="58" rx="21" ry="3.8" fill="#fff1c9"/>
    <line x1="88" y1="58" x2="101" y2="36" stroke="#b07a46" stroke-width="3.5" stroke-linecap="round"/>
    <ellipse cx="102.5" cy="33" rx="4" ry="5.5" transform="rotate(30 102.5 33)" fill="#c98b52"/>
    <g class="anim-fumee" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".85">
      <path d="M70 50 q-5 -6 0 -12 q5 -6 0 -12"/>
      <path d="M81 48 q-5 -6 0 -12 q5 -6 0 -12"/>
    </g>`,
};

// Les buissons et palmiers autour du monument (3 décors différents).
const DECORS_ILE = [
  () => buisson(36, 90, 7) + palmier(124, 92),
  () => palmier(36, 94) + buisson(122, 88, 6.5) + buisson(114, 96, 5),
  () => buisson(38, 94, 6) + buisson(46, 86, 5) + palmier(122, 90),
];

// ---------- Une île complète ----------
// Dessinée dans un rectangle de 160 × 140. Le centre de l'herbe est vers (80, 88).
function dessinerIle(monde, numero) {
  const relief = RELIEFS[numero % RELIEFS.length];
  const decor = DECORS_ILE[numero % DECORS_ILE.length];
  // Le yoga a déjà son arbre : pas de décor en plus à gauche
  const decorIle = monde.id === "yoga" ? palmier(128, 94) : decor();
  const monument = MONUMENTS[monde.id] ? MONUMENTS[monde.id](monde.couleur, monde.fonce) : "";

  return `
    <svg class="ile-svg" viewBox="0 0 160 140" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <!-- le lagon : l'eau peu profonde, plus claire, autour de l'île -->
      <path d="${tache(80, 98, 76, 36, relief)}" fill="#c8f1ff" opacity=".55"/>
      <!-- l'ombre de l'île dans l'eau -->
      <path d="${tache(84, 104, 62, 25, relief)}" fill="#1b5f8f" opacity=".22"/>
      <!-- l'écume blanche au bord de l'eau -->
      <path d="${tache(80, 99, 64, 27, relief)}" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/>
      <!-- la falaise (le côté de l'île, à l'ombre) -->
      <path d="${tache(80, 98, 62, 26, relief)}" fill="#c58f50"/>
      <!-- la plage de sable -->
      <path d="${tache(80, 91, 62, 26, relief)}" fill="#f2d79b"/>
      <path d="${tache(74, 87, 50, 18, relief)}" fill="#f8e6bb"/>
      <!-- l'herbe, avec son bord à l'ombre et sa partie au soleil -->
      <path d="${tache(80, 91, 50, 20, relief)}" fill="#4a9640"/>
      <path d="${tache(80, 88, 50, 19, relief)}" fill="#76bf57"/>
      <ellipse cx="68" cy="83" rx="27" ry="8" fill="#9ad67a" opacity=".55"/>
      ${decorIle}
      <!-- le monument, agrandi de 15 % autour de son pied (80, 88) pour bien se voir -->
      <g transform="translate(80 88) scale(1.15) translate(-80 -88)">${monument}</g>
    </svg>`;
}

// ---------- La carte au trésor : le parchemin et la mer ----------

// Les deux façons de dessiner la carte :
//   - « portrait » : haute et étroite, pour les téléphones
//   - « large »    : carrée, pour les tablettes et ordinateurs
// « marge » = la bande de parchemin autour de la mer.
// Les décors sont placés en pourcentage [depuis la gauche, depuis le haut],
// dans les espaces libres entre les îles.
const DISPOSITIONS = {
  portrait: {
    largeur: 330,
    hauteur: 790,
    marge: 16,
    vagues: [[50, 14], [50, 33], [50, 52], [50, 71]],
    mouettes: [[50, 3.5], [56, 5]],
    boussole: [88, 5],
    bateau: [76, 94],
    baleine: null,
    tresor: null, // pas assez de place sur un téléphone
  },
  large: {
    largeur: 900,
    hauteur: 900,
    marge: 34,
    vagues: [[7, 33], [93, 34], [7, 67], [93, 66]],
    mouettes: [[30, 6], [34, 4], [70, 5]],
    boussole: [33, 67],
    bateau: [33, 34],
    baleine: [67, 33],
    tresor: [67, 67],
  },
};

// Un faux « hasard » qui donne toujours les mêmes nombres (entre 0 et 1) :
// ainsi le bord déchiré du parchemin est le même à chaque ouverture.
function hasard(n) {
  const x = Math.sin(n * 91.7 + 13.3) * 43758.5453;
  return x - Math.floor(x);
}

// Fait le tour d'un rectangle (retiré de « retrait » sur chaque bord) en posant
// un point tous les « pas », chacun un peu décalé vers l'intérieur ou l'extérieur.
function tourIrregulier(L, H, retrait, pas, ecart, graine) {
  const points = [];
  const cotes = [
    [[retrait, retrait], [L - retrait, retrait]],
    [[L - retrait, retrait], [L - retrait, H - retrait]],
    [[L - retrait, H - retrait], [retrait, H - retrait]],
    [[retrait, H - retrait], [retrait, retrait]],
  ];
  let numero = graine;
  cotes.forEach(([debut, fin]) => {
    const longueur = Math.hypot(fin[0] - debut[0], fin[1] - debut[1]);
    const morceaux = Math.max(2, Math.round(longueur / pas));
    // Le vecteur qui pointe vers l'extérieur de ce côté
    const dehors = [(fin[1] - debut[1]) / longueur, -(fin[0] - debut[0]) / longueur];
    for (let i = 0; i < morceaux; i++) {
      const t = i / morceaux;
      const decalage = (hasard(numero++) - 0.5) * 2 * ecart;
      points.push([
        debut[0] + (fin[0] - debut[0]) * t + dehors[0] * decalage,
        debut[1] + (fin[1] - debut[1]) * t + dehors[1] * decalage,
      ]);
    }
  });
  return points;
}

// Une rose des vents ornée, avec le N du nord.
function boussole(x, y, taille) {
  const t = taille / 24;
  return `
    <g transform="translate(${x} ${y}) scale(${r1(t)})">
      <circle r="24" fill="#fbf0d5" stroke="#8a5427" stroke-width="2.5"/>
      <circle r="19" fill="none" stroke="#c9a35e" stroke-width="1" stroke-dasharray="2 2.5"/>
      <polygon points="0,-13 3,-3 13,0 3,3 0,13 -3,3 -13,0 -3,-3" fill="#d9b877" transform="rotate(45)"/>
      <polygon points="0,-21 4.5,-4.5 0,0" fill="#e5533d"/>
      <polygon points="0,-21 -4.5,-4.5 0,0" fill="#b02e1c"/>
      <polygon points="0,21 4.5,4.5 0,0" fill="#5a6a85"/>
      <polygon points="0,21 -4.5,4.5 0,0" fill="#23324a"/>
      <polygon points="-21,0 -4.5,-4.5 0,0" fill="#9aa7bd"/>
      <polygon points="-21,0 -4.5,4.5 0,0" fill="#7d8da6"/>
      <polygon points="21,0 4.5,-4.5 0,0" fill="#9aa7bd"/>
      <polygon points="21,0 4.5,4.5 0,0" fill="#7d8da6"/>
      <circle r="2.8" fill="#8a5427"/>
      <text y="-28" font-size="12" font-weight="700" font-family="Andika, sans-serif"
            text-anchor="middle" fill="#8a5427">N</text>
    </g>`;
}

// Le petit bateau (il tangue doucement grâce au CSS).
function bateau(x, y) {
  return `
    <g transform="translate(${x} ${y})">
      <ellipse cy="16" rx="36" ry="6" fill="#fff" opacity=".35"/>
      <g class="anim-bateau">
        <path d="M0 -44 V4" stroke="#5a3a1a" stroke-width="4" stroke-linecap="round"/>
        <path d="M3 -42 Q22 -24 3 -4 Z" fill="#ffffff"/>
        <path d="M3 -42 Q22 -24 3 -4 Q12 -24 3 -42 Z" fill="#dfe8f2"/>
        <path d="M-3 -36 L-3 -8 L-22 -8 Z" fill="#fff8ec"/>
        <path d="M0 -44 l13 4 -13 4 Z" fill="#e5533d"/>
        <path d="M-32 2 H32 L23 17 H-23 Z" fill="#a0602c"/>
        <path d="M-32 2 H32 L30 6 H-30 Z" fill="#c77d3e"/>
        <circle cx="-12" cy="10" r="2.2" fill="#5a3a1a"/><circle cx="0" cy="10" r="2.2" fill="#5a3a1a"/><circle cx="12" cy="10" r="2.2" fill="#5a3a1a"/>
      </g>
    </g>`;
}

// La queue d'une baleine qui plonge.
function baleine(x, y) {
  return `
    <g transform="translate(${x} ${y})">
      <ellipse cy="3" rx="30" ry="7" fill="#fff" opacity=".45"/>
      <path d="M-4 4 Q-3 -8 0 -14 Q3 -8 4 4 Z" fill="#3b6e9c"/>
      <path d="M0 -14 Q-12 -28 -26 -24 Q-14 -17 0 -14 Z" fill="#4a82b5"/>
      <path d="M0 -14 Q12 -28 26 -24 Q14 -17 0 -14 Z" fill="#3b6e9c"/>
      <g fill="#fff" opacity=".9"><circle cx="-18" cy="-30" r="2"/><circle cx="20" cy="-32" r="1.6"/><circle cx="-9" cy="-34" r="1.4"/></g>
    </g>`;
}

// Un tout petit îlot avec un coffre au trésor et la fameuse croix rouge.
function tresor(x, y) {
  return `
    <g transform="translate(${x} ${y})">
      <ellipse cy="6" rx="46" ry="15" fill="#c8f1ff" opacity=".6"/>
      <ellipse cy="5" rx="38" ry="11" fill="none" stroke="#fff" stroke-width="2.5" opacity=".8"/>
      <ellipse cy="4" rx="36" ry="10" fill="#c58f50"/>
      <ellipse cy="0" rx="36" ry="10" fill="#f2d79b"/>
      <ellipse cx="-6" cy="-2" rx="24" ry="5" fill="#f8e6bb"/>
      <!-- la croix rouge peinte sur le sable -->
      <g stroke="#d6402b" stroke-width="4.5" stroke-linecap="round">
        <line x1="10" y1="-5" x2="24" y2="5"/><line x1="24" y1="-5" x2="10" y2="5"/>
      </g>
      <!-- le coffre -->
      <ellipse cx="-10" cy="2" rx="16" ry="3.5" fill="#000" opacity=".18"/>
      <rect x="-24" y="-16" width="24" height="16" rx="2" fill="#a0602c"/>
      <rect x="-8" y="-16" width="8" height="16" fill="#000" opacity=".12"/>
      <path d="M-24 -16 v-4 a12 7 0 0 1 24 0 v4 Z" fill="#c77d3e"/>
      <rect x="-24" y="-17" width="24" height="3" fill="#ffc93c"/>
      <rect x="-14" y="-23" width="4" height="23" fill="#ffc93c"/>
      <rect x="-14.5" y="-12" width="5" height="5" rx="1" fill="#8a6200"/>
      <g fill="#fff6c2"><circle cx="-26" cy="-26" r="1.6"/><circle cx="4" cy="-24" r="1.3"/></g>
    </g>`;
}

// Dessine toute la carte d'une disposition : le parchemin, la mer peinte
// dessus, les décors, et le chemin en pointillés qui relie les îles.
function dessinerMer(nomDisposition) {
  const dispo = DISPOSITIONS[nomDisposition];
  const L = dispo.largeur;
  const H = dispo.hauteur;
  const m = dispo.marge;
  // Transforme un pourcentage en coordonnées du dessin
  const versDessin = ([x, y]) => [Math.round((x * L) / 100), Math.round((y * H) / 100)];
  // Chaque dessin a ses propres noms (sinon les deux versions se mélangent)
  const id = (nom) => `${nom}-${nomDisposition}`;

  // Le bord déchiré du papier : beaucoup de petits points, reliés par des
  // traits droits (ça fait « déchiré »)
  const bord = tourIrregulier(L, H, 6, 9, 3.5, 1);
  const papier = "M" + bord.map(([x, y]) => `${r1(x)} ${r1(y)}`).join(" L") + "Z";
  // Le bord de la mer : moins de points, reliés par des courbes (ça fait « peint »)
  const rivage = courbeLisse(tourIrregulier(L, H, m + 6, 60, 7, 200), true);

  const points = MONDES.map((monde) => versDessin(monde.place[nomDisposition]));
  const chemin = courbeLisse(points, false);

  let svg = `
    <svg class="mer-${nomDisposition}" viewBox="0 0 ${L} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- le papier : clair au centre, plus foncé et « brûlé » vers les bords -->
        <radialGradient id="${id("vieux-papier")}" cx="50%" cy="45%" r="70%">
          <stop offset="0" stop-color="#f8ead0"/>
          <stop offset=".7" stop-color="#efd9a8"/>
          <stop offset="1" stop-color="#d9b678"/>
        </radialGradient>
        <!-- l'eau : plus claire au centre, plus profonde vers le rivage -->
        <radialGradient id="${id("profondeur")}" cx="50%" cy="45%" r="70%">
          <stop offset="0" stop-color="#aee3f7"/>
          <stop offset=".65" stop-color="#86cbef"/>
          <stop offset="1" stop-color="#5eaedf"/>
        </radialGradient>
        <!-- un motif de petites vagues répété sur toute la mer -->
        <pattern id="${id("ondes")}" width="90" height="56" patternUnits="userSpaceOnUse">
          <path d="M6 14 q7 -6 14 0 t14 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".28"/>
          <path d="M52 42 q7 -6 14 0 t14 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".22"/>
        </pattern>
        <!-- le grain du papier : un « bruit » très léger, fabriqué par le navigateur -->
        <filter id="${id("grain")}" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/>
          <feColorMatrix values="0 0 0 0 .45  0 0 0 0 .3  0 0 0 0 .12  0 0 0 .5 0"/>
          <feComposite in2="SourceGraphic" operator="in"/>
        </filter>
        <clipPath id="${id("decoupe-papier")}"><path d="${papier}"/></clipPath>
      </defs>

      <!-- le parchemin -->
      <path d="${papier}" fill="url(#${id("vieux-papier")})"/>
      <g clip-path="url(#${id("decoupe-papier")})">
        <rect width="${L}" height="${H}" fill="#000" filter="url(#${id("grain")})" opacity=".35"/>
        <!-- quelques taches, comme sur un vieux papier -->
        <ellipse cx="${L * 0.12}" cy="${H * 0.88}" rx="${L * 0.09}" ry="${H * 0.04}" fill="#b98a4a" opacity=".18"/>
        <ellipse cx="${L * 0.9}" cy="${H * 0.1}" rx="${L * 0.07}" ry="${H * 0.03}" fill="#b98a4a" opacity=".15"/>
      </g>
      <!-- le bord du papier, brûlé -->
      <path d="${papier}" fill="none" stroke="#a8743c" stroke-width="10" opacity=".25"/>
      <path d="${papier}" fill="none" stroke="#7a4a1f" stroke-width="2.5" opacity=".6"/>

      <!-- la mer, peinte à l'aquarelle sur le papier -->
      <path d="${rivage}" fill="url(#${id("profondeur")})"/>
      <path d="${rivage}" fill="url(#${id("ondes")})"/>
      <ellipse cx="${L * 0.24}" cy="${H * 0.12}" rx="${L * 0.24}" ry="${H * 0.05}" fill="#fff" opacity=".15"/>
      <ellipse cx="${L * 0.76}" cy="${H * 0.6}" rx="${L * 0.22}" ry="${H * 0.045}" fill="#fff" opacity=".12"/>
      <!-- le trait d'encre du rivage, doublé comme sur les vieilles cartes -->
      <path d="${rivage}" fill="none" stroke="#2e6f99" stroke-width="2.5" opacity=".55"/>
      <path d="${rivage}" fill="none" stroke="#2e6f99" stroke-width="1" opacity=".3"
            transform="translate(${L / 2} ${H / 2}) scale(.975) translate(${-L / 2} ${-H / 2})"/>

      <!-- les plis de la carte, qu'on a dépliée -->
      <g clip-path="url(#${id("decoupe-papier")})">
        <line x1="${L / 2}" y1="0" x2="${L / 2}" y2="${H}" stroke="#7a4a1f" stroke-width="1.5" opacity=".14"/>
        <line x1="${L / 2 + 2}" y1="0" x2="${L / 2 + 2}" y2="${H}" stroke="#fff" stroke-width="1.5" opacity=".25"/>
        <line x1="0" y1="${H / 2}" x2="${L}" y2="${H / 2}" stroke="#7a4a1f" stroke-width="1.5" opacity=".14"/>
        <line x1="0" y1="${H / 2 + 2}" x2="${L}" y2="${H / 2 + 2}" stroke="#fff" stroke-width="1.5" opacity=".25"/>
      </g>`;

  // Les vagues plus visibles (elles scintillent doucement grâce au CSS)
  dispo.vagues.forEach((position, i) => {
    const [x, y] = versDessin(position);
    svg += `<path class="anim-vague" style="animation-delay:${i * 0.7}s"
                  d="M${x - 16} ${y} q8 -8 16 0 t16 0" fill="none" stroke="#fff"
                  stroke-width="3.5" stroke-linecap="round" opacity=".8"/>`;
  });

  // Les mouettes
  dispo.mouettes.forEach((position) => {
    const [x, y] = versDessin(position);
    svg += `<path d="M${x - 9} ${y} q4.5 -6 9 0 q4.5 -6 9 0" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`;
  });

  if (dispo.tresor) svg += tresor(...versDessin(dispo.tresor));
  if (dispo.baleine) svg += baleine(...versDessin(dispo.baleine));
  if (dispo.bateau) svg += bateau(...versDessin(dispo.bateau));
  svg += boussole(...versDessin(dispo.boussole), nomDisposition === "large" ? 40 : 22);

  // Le chemin en pointillés : une ombre légère dessous, puis les points blancs
  svg += `
    <path d="${chemin}" transform="translate(0 3)" fill="none" stroke="#1b5f8f" stroke-width="7"
          stroke-linecap="round" stroke-dasharray="1 17" opacity=".25"/>
    <path d="${chemin}" fill="none" stroke="#fff" stroke-width="7"
          stroke-linecap="round" stroke-dasharray="1 17"/>`;

  return svg + "</svg>";
}
