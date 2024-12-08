let leader;

let leaderImg; // Image du leader
let bgImage; // Image de fond
let target; // Position cible du leader
let targetSet = false; // Indique si une cible a été définie (touche "a")

function preload() {
  // Charger les images
  bgImage = loadImage('assets/map.png'); // Assurez-vous que le chemin est correct
  leaderImg = loadImage('assets/leader.png'); // Charger l'image du leader
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Initialiser le leader au centre
  leader = new Leader(width / 2, height / 2);

  // Initialiser la position cible à la position actuelle du leader
  target = leader.pos.copy();
    
}

function draw() {
  background(30);

  // Dessiner l'image de fond
  image(bgImage, 0, 0, width, height);

  // Dessiner la cible (marqueur rouge)
  if (targetSet) {
    fill(255, 0, 0, 150);
    noStroke();
    ellipse(target.x, target.y, 20); // Cercle rouge pour la cible
  }

  // Déplacer le leader vers la cible s'il est en mouvement
  if (targetSet && !leader.stopped) {
    let force = leader.arrive(target);
    leader.applyForce(force);
  }

  // Mettre à jour et afficher le leader
  leader.update();
  leader.show();
}

function keyPressed() {
  // Lorsque la touche "a" est pressée, définir une nouvelle cible
  if (key === 'a' || key === 'A') {
    target.set(mouseX, mouseY); // Mettre à jour la cible
    targetSet = true; // Activer la cible
    leader.resume(); // Reprendre le mouvement du leader
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // Adapter le canevas à la fenêtre
}
