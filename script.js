// Nombre d'images par seconde
let fps = 30;

// déclaration des variables globales
let map = createArray(50, 40);
let typeAlgo = 0;
let tpsTouche;
// variables pour Dijkstra
let distance = createArray(50, 40);
let Q = createArray(50, 40);
let predecesseur = createArray(50, 40);
let posDepart, posFin;
let cheminTrouve;

// lien avec le canvas dans la page HTML
let canvas = document.getElementById('moncanvas');
let ctx = canvas.getContext('2d');

// lancement
init();
// Event Listener pour la capture des touches clavier
document.addEventListener('keydown', keyDownListener);
document.addEventListener('keyup', keyUpListener);
document.addEventListener('mousedown', mouseDownListener);
document.addEventListener('mouseup', mouseUpListener);
// début de la boucle de rendu
requestAnimationFrame(renduCanvas);

// routine de lecture des touches clavier et de la souris
let keyPresses = {};
let mousePress = false;
let mousePos;

function keyDownListener(event) {
  // événement touche appuyée
  keyPresses[event.key] = true;
}
function keyUpListener(event) {
  // événement touche relâchée
  keyPresses[event.key] = false;
}
function mouseDownListener(event) {
  // événement clic souris + capture de sa position
  mousePress = true;
  mousePos = getMousePos(event);
}
function mouseUpListener(event) {
  // événement clic souris relaché
  mousePress = false;
}
function getMousePos(evt) {
  // retourne la position de la souris dans une structure x,y
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  }
}

function enrCoord(xVal, yVal, array) {
  // enregistrement d'un tableau de coordonnées x,y
  array.push({ x: xVal, y: yVal });
}

function enrCoord4(xVal, yVal, xVal2, yVal2, array) {
  // enregistrement d'un tableau de coordonnées left, top, right, bottom
  array.push({ left: xVal, top: yVal, right: xVal2, bottom: yVal2 });
}

function enrCoordNoeud(xVal, yVal, coutVal, heuristiqueVal, array) {
  // enregistrement d'une structure de tableau pour les éléments tombants
  array.push({ x: xVal, y: yVal, cout: coutVal, heuristique: heuristiqueVal });
}

function createArray(length) {
  // fonction de création d'un tableau à n dimensions
  var arr = new Array(length || 0),
    i = length;

  if (arguments.length > 1) {
    var args = Array.prototype.slice.call(arguments, 1);
    while (i--) arr[length - 1 - i] = createArray.apply(this, args);
  }

  return arr;
}

function GetRandom(min, max) {
  // retroune un nombre au hazard en min et max inclus
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pad(num, size) {
  /// formate un nombre sur size caractères (ex : 12 -> 000012)
  return ('000000' + num).substr(-size);
}

function getPixel(x, y, contextTmp) {
  // retourne les caractéristiques d'un pixel situé en x,y sur un context
  return contextTmp.getImageData(x, y, 1, 1).data;
}

function getTimeSecond() {
  // retourne le temps en secondes
  let d = new Date();
  return Math.floor(d.getTime() / (60 * 10));
}
function getTimeMilli() {
  // retourne le temps en millisecondes
  let d = new Date();
  return d.getTime();
}

function init() {
  // fonction d'initialisation quelque soit l'algorithme
  let i, x, y, j, k;
  for (i = 0; i < 50; i++) {
    for (j = 0; j < 40; j++) {
      // remise à zéro de la map
      map[i][j] = 0;
      // sur les bords on génère un mur
      if (i == 0 || j == 0 || i == 49 || j == 39) { map[i][j] = 9; }
    }
  }
  // position aléatoire du début et de la fin (début à gauche et fin à droite)
  posDepart = GetRandom(1, 38);
  posFin = GetRandom(1, 38);
  map[1][posDepart] = 1;
  map[48][posFin] = 2;
  // on génère des obstacles
  for (i = 1; i <= 15; i++) {
    x = GetRandom(5, 45); y = GetRandom(5, 35); taille = GetRandom(2, 5);
    for (j = x - taille; j <= x + taille; j++) {
      for (k = y - taille; k <= y + taille; k++) {
        // pas d'obstacle sur le départ ou l'arrivée
        if (j != 1 && j != 48 && j >= 0 && k >= 0 && j <= 49 && k <= 39) { map[j][k] = 9; }
      }
    }
  }
  // initialisation de l'algorithme de Dijkstra
  Dijkstra_init();
}

// Fonctions pour l'algorithme de Dijkstra
function Dijkstra_init() {
  let i, j;
  cheminTrouve = false;
  for (i = 0; i < 50; i++) {
    for (j = 0; j < 40; j++) {
      distance[i][j] = 99999;
      Q[i][j] = true;
      if (map[i][j] == 8) { map[i][j] = 0; }
    }
  }
  distance[1][posDepart] = 0;
  predecesseur = createArray(50, 40);
}
function Dijkstra_trouve_min() {
  let mini = 99999;
  let sommetx, sommety;
  sommetx = -1;
  sommety = -1;
  for (i = 0; i < 50; i++) {
    for (j = 0; j < 40; j++) {
      if (Q[i][j] && map[i][j] <= 2) {
        if (distance[i][j] < mini) {
          mini = distance[i][j];
          sommetx = i; sommety = j;
        }
      }
    }
  }
  return {
    x: sommetx,
    y: sommety
  }
}
function Dijkstra_poids(x1, y1, x2, y2) {
  // retourne un "poids" entre deux points
  // remarque : dans un jeu, on pourrait mettre un poids plus important s'il y a une colline à franchir par exemple.
  if (map[x2][y2] > 2) {
    // si ce n'est pas un espace vide, c'est impossible de passer
    return 99999;
  } else {
    if (x1 == x2 || y1 == y2) {
      // si c'est une case adjacente, on met un poids de 1
      return 1;
    } else {
      // si c'est une diagonale, on met un poids de 1.5 pour favoriser le chemin le plus droit
      return 1.5;
    }
  }
}
function Dijkstra_maj_distances(x1, y1, x2, y2) {
  // remplacer dans le if suivant le +1 par le poids entre deux points si nécessaire
  if (distance[x2][y2] > distance[x1][y1] + Dijkstra_poids(x1, y1, x2, y2)) {
    distance[x2][y2] = distance[x1][y1] + Dijkstra_poids(x1, y1, x2, y2);
    predecesseur[x2][y2] = { x: x1, y: y1 };
  }
}
function Dijkstra_tout_parcouru() {
  let i, j;
  let tout_parcouru = true;
  for (i = 49; i >= 0; i--) {
    for (j = 39; j >= 0; j--) {
      if (Q[i][j]) { tout_parcouru = false; i = -1; j = -1; }
    }
  }
  return tout_parcouru;
}
function Dijkstra() {
  let paire;
  let curX, curY, tx, ty;
  if (!Dijkstra_tout_parcouru() && !cheminTrouve) {
    paire = Dijkstra_trouve_min();
    if (paire.x != -1) {
      Q[paire.x][paire.y] = false;
      for (i = -1; i <= 1; i++) {
        for (j = -1; j <= 1; j++) {
          if (!(i == 0 && j == 0)) {
            Dijkstra_maj_distances(paire.x, paire.y, paire.x + i, paire.y + j);
          }
        }
      }
    }
  }
  // on établit le chemin si la fin a été trouvée
  curX = 48; curY = posFin;
  if (predecesseur[48][posFin]) {
    cheminTrouve = true;
    while (!(curX == 1 && curY == posDepart)) {
      if (!(curX == 48 && curY == posFin) && !(curX == 1 && curY == posDepart)) { map[curX][curY] = 8; }
      tx = predecesseur[curX][curY].x;
      ty = predecesseur[curX][curY].y;
      curX = tx; curY = ty;
    }
  }
}



function renduCanvas() {
  ctx.beginPath();
  // on efface le fond
  ctx.fillStyle = "#000000"; ctx.fillRect(0, 0, 1000, 800);
  ctx.strokeStyle = "#FFFFFF"; ctx.font = "16px Arial";
  // on trace le quadrillage
  for (i = 0; i < 50; i++) {
    ctx.moveTo(i * 20, 0); ctx.lineTo(i * 20, 800);
    if (i <= 39) { ctx.moveTo(0, i * 20); ctx.lineTo(1000, i * 20); }
  }
  // appel de l'algo de Dijkstra ou Astar
  if (typeAlgo == 0) { Dijkstra(); } /*else {
    Astar();
  }*/
  // affichage des éléments de la grille
  for (i = 0; i < 50; i++) {
    for (j = 0; j < 40; j++) {
      // le départ
      if (map[i][j] == 1) { ctx.fillStyle = "#0000FF"; ctx.fillRect(i * 20 + 1, j * 20 + 1, 18, 18); ctx.fillStyle = "#FFFFFF"; ctx.fillText("D", i * 20 + 5, j * 20 + 15); }
      // l'arrivée
      if (map[i][j] == 2) { ctx.fillStyle = "#FF0000"; ctx.fillRect(i * 20 + 1, j * 20 + 1, 18, 18); ctx.fillStyle = "#FFFFFF"; ctx.fillText("F", i * 20 + 5, j * 20 + 15); }
      // un mur
      if (map[i][j] == 9) { ctx.fillStyle = "whitesmoke"; ctx.fillRect(i * 20 + 1, j * 20 + 1, 18, 18); }
      // le tracé du chemin final
      if (map[i][j] == 8) { ctx.fillStyle = "#FFFF00"; ctx.fillRect(i * 20 + 1, j * 20 + 1, 18, 18); }
      // les zones explorées
      if (!Q[i][j] && !(i == 1 && j == posDepart) && !(i == 48 && j == posFin)) { ctx.fillStyle = "#FF0000"; ctx.fillRect(i * 20 + 7, j * 20 + 7, 5, 5); }
    }
  }
  ctx.stroke();
  // réinitialisation de l'algorithme ?
  if (keyPresses.r) {
    if (typeAlgo == 0) { Dijkstra_init(); }

  }
  // reset complet et génération d'une nouvelle map
  if (keyPresses.n) { init(); }

  if (typeAlgo == 0) { ctx.fillStyle = "#FF0000"; ctx.fillText("Dijkstra", 5, 15); }

  setTimeout(function () { // on rafraichi la page "fps" fois par seconde
    requestAnimationFrame(renduCanvas);
  }, 5 / fps)
}
