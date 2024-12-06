let mapImage;

function preload() {
  mapImage = loadImage('assets/map.png'); // Chargez l'image de la carte
}

function setup() {
  createCanvas(windowWidth, windowHeight); // Créez un canevas qui prend toute la fenêtre
  background('#102B4C'); // Définissez la couleur de fond en bleu

  // Dessinez l'image de la carte
  image(mapImage, (width - mapImage.width) / 2, (height - mapImage.height) / 2); // Centrez l'image
}

function windowResized() {
  // Cette fonction est pour redimonsionner l'image 
  resizeCanvas(windowWidth, windowHeight); 
  background('#102B4C'); 
  image(mapImage, (width - mapImage.width) / 2, (height - mapImage.height) / 2); 
}
