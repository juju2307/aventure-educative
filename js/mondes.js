// ==========================================================
// La liste des 9 mondes de l'aventure.
// Pour changer une couleur, un nom ou la place d'une île,
// c'est ici et nulle part ailleurs.
//
//   couleur : la couleur vive du monde (monument de l'île)
//   fonce   : une version foncée, pour l'ombre et le ruban du nom
//             (assez foncée pour que le texte blanc se lise bien)
//   clair   : la couleur pâle utilisée en fond quand on est dans ce monde
//   pret    : false tant que le monde n'est pas construit (il affiche « Bientôt ! »)
//   place   : où se trouve le centre de l'île sur la carte, en pourcentage
//             [depuis la gauche, depuis le haut]
//             - « portrait » : la carte haute et étroite des téléphones
//             - « large »    : la carte carrée des tablettes et ordinateurs
// L'ordre de la liste est aussi l'ordre du chemin en pointillés.
// Le dessin de chaque île se trouve dans js/dessins.js (même « id »).
// ==========================================================

const MONDES = [
  { id: "maths",       nom: "Maths",       couleur: "#2f8fe0", fonce: "#1b62a8", clair: "#dcecfb", pret: false,
    place: { portrait: [27, 9], large: [17, 17.5] } },
  { id: "memoire",     nom: "Mémoire",     couleur: "#9b5fd6", fonce: "#6b3aa3", clair: "#efe5fa", pret: false,
    place: { portrait: [72, 18.7], large: [51, 17] } },
  { id: "logique",     nom: "Logique",     couleur: "#f28c28", fonce: "#b05a0c", clair: "#feecd9", pret: false,
    place: { portrait: [29, 28.4], large: [83, 18] } },
  { id: "lecture",     nom: "Lecture",     couleur: "#e5533d", fonce: "#b02e1c", clair: "#fde4df", pret: false,
    place: { portrait: [73, 38.1], large: [82, 50] } },
  { id: "vocabulaire", nom: "Vocabulaire", couleur: "#e0559c", fonce: "#a8306e", clair: "#fbe3ef", pret: false,
    place: { portrait: [27, 47.8], large: [49, 49] } },
  { id: "science",     nom: "Science",     couleur: "#1fa59f", fonce: "#0f716c", clair: "#d9f2f1", pret: false,
    place: { portrait: [72, 57.5], large: [18, 51] } },
  { id: "musique",     nom: "Musique",     couleur: "#5865d6", fonce: "#3540a8", clair: "#e3e5fa", pret: false,
    place: { portrait: [29, 67.2], large: [17, 83] } },
  { id: "yoga",        nom: "Yoga",        couleur: "#5cb85c", fonce: "#2f7d33", clair: "#e2f4e2", pret: false,
    place: { portrait: [73, 76.9], large: [51, 82] } },
  { id: "cuisine",     nom: "Cuisine",     couleur: "#f2c12e", fonce: "#8a6200", clair: "#fdf4d3", pret: false,
    place: { portrait: [29, 86.6], large: [83, 83] } },
];
