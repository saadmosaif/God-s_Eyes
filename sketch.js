let leaders = [];
let leaderImg, suiveurImg, bgImage, rockImg, enemyImg, rocketImg;
let buttonAImg, buttonDImg, buttonEImg, buttonSImg, buttonVImg;
let font; // Font for text-to-points logic
let debug = false;
let obstacles = [];
let enemies = [];
let menu = true; // Tracks if we are on the menu screen or playing
let gameTitle = "God's Eyes"; // The name of the game

// For the textToPoints title animation
let points = [];
let pointVelocities = [];
let originalPoints = [];

// Debug sliders
let leaderSpeedSlider, leaderForceSlider, suiveurSpeedSlider, suiveurForceSlider;
let enemySpeedSlider, enemyForceSlider;

function preload() {
  bgImage = loadImage('assets/map.png');
  leaderImg = loadImage('assets/leader.png');
  suiveurImg = loadImage('assets/suiveurs.png');
  rockImg = loadImage('assets/rock.png');
  enemyImg = loadImage('assets/enemy.png');
  rocketImg = loadImage('assets/rocket.png');
  buttonAImg = loadImage('assets/A.png');
  buttonDImg = loadImage('assets/D.png');
  buttonEImg = loadImage('assets/E.png');
  buttonSImg = loadImage('assets/S.png');
  buttonVImg = loadImage('assets/V.png');
  font = loadFont('assets/Roboto-Bold.ttf'); // Ensure this font file exists
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Generate text points for the game title
  textFont(font);
  textSize(150);
  let bounds = font.textBounds(gameTitle, 0, 0, 150);
  let xOffset = width / 2 - bounds.w / 2;
  let yOffset = height / 3;

  points = font.textToPoints(gameTitle, xOffset, yOffset, 150, { sampleFactor: 0.2 });

  for (let i = 0; i < points.length; i++) {
    pointVelocities.push(createVector(0, 0));
    originalPoints.push(createVector(points[i].x, points[i].y));
  }

  // Add the initial leader
  leaders.push(new Leader(width / 2, height / 2, leaderImg, 10));

  // Create and position debug sliders (hidden initially)
  leaderSpeedSlider = createSlider(1, 5, 2, 0.1);
  leaderForceSlider = createSlider(0.05, 0.5, 0.1, 0.01);
  suiveurSpeedSlider = createSlider(1, 5, 2, 0.1);
  suiveurForceSlider = createSlider(0.05, 0.5, 0.1, 0.01);
  enemySpeedSlider = createSlider(1, 5, 3, 0.1);
  enemyForceSlider = createSlider(0.05, 0.5, 0.2, 0.01);

  positionSlidersOffScreen();
}

function draw() {
  if (menu) {
    drawMenu();
  } else {
    positionSlidersOnScreen();
    drawGame();
  }

  if (debug && !menu) {
    positionSlidersOnScreen(); // Show sliders only when debug mode is on
    drawDebug();
  } else {
    positionSlidersOffScreen(); // Hide sliders when debug mode is off
  }
}

// Draw the menu screen
function drawMenu() {
  background(20);
  imageMode(CORNER);
  image(bgImage, 0, 0, width, height);

  noStroke();
  fill(255);
  for (let i = 0; i < points.length; i++) {
    let p = points[i];
    let velocity = pointVelocities[i];
    let original = originalPoints[i];
    let distance = dist(mouseX, mouseY, p.x, p.y);

    if (distance < 50) {
      let dir = createVector(p.x - mouseX, p.y - mouseY).normalize().mult(2);
      velocity.add(dir);
    }

    let restoreForce = createVector(original.x - p.x, original.y - p.y).mult(0.05);
    velocity.add(restoreForce);

    velocity.mult(0.9);

    p.x += velocity.x;
    p.y += velocity.y;

    ellipse(p.x, p.y, 5);
  }

  textAlign(CENTER, CENTER);
  textSize(40);
  fill(0, 128, 255);
  let buttonX = width / 2 - 100;
  let buttonY = height / 2;
  rect(buttonX, buttonY, 200, 50, 10);

  fill(255);
  text("Play", buttonX + 100, buttonY + 25);

  positionSlidersOffScreen();
}

// Draw the game
function drawGame() {
  background(30);
  imageMode(CORNER);
  image(bgImage, 0, 0, width, height);

  for (let leader of leaders) {
    leader.maxSpeed = leaderSpeedSlider.value();
    leader.maxForce = leaderForceSlider.value();
  }

  for (let leader of leaders) {
    for (let suiveur of leader.suiveurs) {
      suiveur.maxSpeed = suiveurSpeedSlider.value();
      suiveur.maxForce = suiveurForceSlider.value();
    }
  }

  for (let enemy of enemies) {
    enemy.maxSpeed = enemySpeedSlider.value();
    enemy.maxForce = enemyForceSlider.value();
  }

  for (let obstacle of obstacles) {
    imageMode(CENTER);
    image(rockImg, obstacle.pos.x, obstacle.pos.y, obstacle.size, obstacle.size);

    if (debug) {
      stroke(255, 0, 0, 100);
      noFill();
      ellipse(obstacle.pos.x, obstacle.pos.y, obstacle.size * 2);
    }
  }

  for (let leader of leaders) {
    leader.wander();
    leader.update(obstacles, enemies, leaders);
    leader.show();
    leader.updateRockets();

    if (debug) leader.debug();

    for (let suiveur of leader.suiveurs) {
      let target = leader.pos;
      suiveur.followTarget(target);
      suiveur.update(leader.pos, leader.suiveurs);
      suiveur.show();

      if (debug) suiveur.debug(target, leader.pos);
    }
  }

  for (let enemy of enemies) {
    enemy.flock(enemies);
    for (let leader of leaders) {
      enemy.avoidLeaderAndSuiveurs(leader);
    }
    let obstacleAvoidance = enemy.avoidObstacles(obstacles);
    enemy.applyForce(obstacleAvoidance);
    enemy.update();
    enemy.show();

    if (debug) enemy.debug();
  }

  drawKeyImages();
   // Draw the "Back to Menu" button
   drawBackToMenuButton();
}

// Draw the "Back to Menu" button
function drawBackToMenuButton() {
  let buttonX = width - 170; // Position on the top-left corner
  let buttonY = 20;
  let buttonWidth = 150;
  let buttonHeight = 50;

  // Draw the button
  fill(255, 0, 0); // Red background for the button
  rect(buttonX, buttonY, buttonWidth, buttonHeight, 10); // Rounded corners

  // Draw the button text
  fill(255); // White text
  textSize(20);
  textAlign(CENTER, CENTER);
  text("Menu", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);

  // Check if the button is clicked
  if (
    mouseIsPressed &&
    mouseX > buttonX &&
    mouseX < buttonX + buttonWidth &&
    mouseY > buttonY &&
    mouseY < buttonY + buttonHeight
  ) {
    // Return to the menu
    menu = true;
    positionSlidersOffScreen(); // Hide sliders when returning to the menu
  }
}

// Draw key images at the bottom of the screen with labels
function drawKeyImages() {
  imageMode(CENTER);
  let spacing = width / 6; // Horizontal spacing between buttons
  let yOffset = height - 50; // Y position of the images
  let labelOffset = 40; // Offset for labels above the images

    // Add text at the top center
    textAlign(CENTER, TOP);
    textSize(20);
    fill(255); // White text
    text("Si clique sur bouton gauche faire apparaître un obstacle", width / 2, 10);
  
  // Draw the images
  image(buttonAImg, spacing * 1, yOffset, 50, 50);
  image(buttonDImg, spacing * 2, yOffset, 50, 50);
  image(buttonEImg, spacing * 3, yOffset, 50, 50);
  image(buttonSImg, spacing * 4, yOffset, 50, 50);
  image(buttonVImg, spacing * 5, yOffset, 50, 50);

  // Add labels above each image
  textAlign(CENTER);
  textSize(14);
  fill(255); // White text color

  text("Apparaître un Leader", spacing * 1, yOffset - labelOffset);
  text("Debug Mode", spacing * 2, yOffset - labelOffset);
  text("Apparaître un Ennemi", spacing * 3, yOffset - labelOffset);
  text("Mode Snake", spacing * 4, yOffset - labelOffset);
  text("Formation Triangle", spacing * 5, yOffset - labelOffset);
}

// Debug UI and labels
function drawDebug() {
  fill(255);
  noStroke();
  textSize(14);
  textAlign(LEFT, TOP);

  text("Debug Mode", 10, 10);
  text("Leader Max Speed", leaderSpeedSlider.x * 2 + leaderSpeedSlider.width, leaderSpeedSlider.y + 10);
  text("Leader Max Force", leaderForceSlider.x * 2 + leaderForceSlider.width, leaderForceSlider.y + 10);
  text("Suiveur Max Speed", suiveurSpeedSlider.x * 2 + suiveurSpeedSlider.width, suiveurSpeedSlider.y + 10);
  text("Suiveur Max Force", suiveurForceSlider.x * 2 + suiveurForceSlider.width, suiveurForceSlider.y + 10);
  text("Enemy Max Speed", enemySpeedSlider.x * 2 + enemySpeedSlider.width, enemySpeedSlider.y + 10);
  text("Enemy Max Force", enemyForceSlider.x * 2 + enemyForceSlider.width, enemyForceSlider.y + 10);
}

// Mouse and key handling
function mousePressed(event) {
  if (menu) {
    let buttonX = width / 2 - 100;
    let buttonY = height / 2;
    let buttonWidth = 200;
    let buttonHeight = 50;

    if (
      mouseX > buttonX &&
      mouseX < buttonX + buttonWidth &&
      mouseY > buttonY &&
      mouseY < buttonY + buttonHeight
    ) {
      menu = false;
    }
  } else {
    if (mouseButton === LEFT) {
      let obstacle = {
        pos: createVector(mouseX, mouseY),
        size: random(30, 100),
      };
      obstacles.push(obstacle);
    }
  }
}

function keyPressed() {
  if (!menu) {
    if (key === 'a' || key === 'A') {
      leaders.push(new Leader(mouseX, mouseY, leaderImg, 10));
    }
    if (key === 'd' || key === 'D') {
      debug = !debug;
    }
    if (key === 'e' || key === 'E') {
      let swarmSize = 10;
      for (let i = 0; i < swarmSize; i++) {
        let x = mouseX + random(-50, 50);
        let y = mouseY + random(-50, 50);
        enemies.push(new Enemy(x, y, enemyImg));
      }
    }
    if (key === 's' || key === 'S') {
      for (let leader of leaders) {
        leader.formation = "snake";
      }
    }
    if (key === 'v' || key === 'V') {
      for (let leader of leaders) {
        leader.formation = "triangle";
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function positionSlidersOffScreen() {
  leaderSpeedSlider.position(-200, -200);
  leaderForceSlider.position(-200, -200);
  suiveurSpeedSlider.position(-200, -200);
  suiveurForceSlider.position(-200, -200);
  enemySpeedSlider.position(-200, -200);
  enemyForceSlider.position(-200, -200);
}

function positionSlidersOnScreen() {
  leaderSpeedSlider.position(20, 60);
  leaderForceSlider.position(20, 90);
  suiveurSpeedSlider.position(20, 120);
  suiveurForceSlider.position(20, 150);
  enemySpeedSlider.position(20, 180);
  enemyForceSlider.position(20, 210);
}
