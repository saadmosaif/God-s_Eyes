let leader;
let leaderImg; // Image of the leader
let bgImage; // Background image
let suiveurs = []; // Array of followers
let debug = false; // Debug mode flag

function preload() {
  // Load the images
  bgImage = loadImage('assets/map.png'); // Ensure the path is correct
  leaderImg = loadImage('assets/leader.png'); // Load the leader's image
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Initialize the leader at the center
  leader = new Leader(width / 2, height / 2, leaderImg);

  // Create followers
  for (let i = 0; i < 10; i++) {
    suiveurs.push(new Suiveurs(width / 2, height / 2 + (i + 1) * 20));
  }
}

function draw() {
  background(30);

  // Draw the background image
  image(bgImage, 0, 0, width, height);

  // Call the leader's wander behavior
  leader.wander();

  // Update and display the leader
  leader.update();
  leader.edges();
  leader.show();

  // Show debug info for the leader
  if (debug) {
    leader.debug();
  }

  // Update and display followers in a triangular formation aligned with the leader
  for (let i = 0; i < suiveurs.length; i++) {
    let target = suiveurs[i].triangularTarget(leader, i); // Get triangular target position
    suiveurs[i].followTarget(target); // Move toward the target
    suiveurs[i].update(); // Update position
    suiveurs[i].show(); // Display

    // Show debug info for followers
    if (debug) {
      suiveurs[i].debug(target);
    }
  }
}

function keyPressed() {
  // Toggle debug mode when "D" is pressed
  if (key === 'd' || key === 'D') {
    debug = !debug;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // Adjust canvas to window size
}
