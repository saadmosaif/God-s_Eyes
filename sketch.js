let leaders = [];
let leaderImg, suiveurImg, bgImage, rockImg, enemyImg, rocketImg;
let font; // Font for text-to-points logic
let debug = false;
let obstacles = [];
let enemies = [];
let menu = true; // Tracks if we are on the menu screen or playing
let gameTitle = "God's Eyes"; // The name of the game
let points = []; // Stores points for the game title
let pointVelocities = []; // Velocities for the points to move dynamically
let originalPoints = []; // Original positions of the points

function preload() {
  bgImage = loadImage('assets/map.png');
  leaderImg = loadImage('assets/leader.png');
  suiveurImg = loadImage('assets/suiveurs.png');
  rockImg = loadImage('assets/rock.png');
  enemyImg = loadImage('assets/enemy.png');
  rocketImg = loadImage('assets/rocket.png');
  font = loadFont('assets/Roboto-Bold.ttf'); // Use an existing font
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Generate text points for the game title
  textFont(font);
  textSize(150);
  let bounds = font.textBounds(gameTitle, 0, 0, 150); // Get bounding box of text
  let xOffset = width / 2 - bounds.w / 2; // Center horizontally
  let yOffset = height / 3; // Place vertically

  points = font.textToPoints(gameTitle, xOffset, yOffset, 150, {
    sampleFactor: 0.2,
  });

  // Initialize velocities and store original positions
  for (let i = 0; i < points.length; i++) {
    pointVelocities.push(createVector(0, 0));
    originalPoints.push(createVector(points[i].x, points[i].y)); // Save original positions
  }

  // Add the initial leader
  leaders.push(new Leader(width / 2, height / 2, leaderImg, 10));
}

function draw() {
  if (menu) {
    drawMenu();
  } else {
    drawGame();
  }
}

function drawMenu() {
  background(20);
  imageMode(CORNER);
  image(bgImage, 0, 0, width, height);

  // Draw title with textToPoints
  noStroke();
  fill(255);
  for (let i = 0; i < points.length; i++) {
    let p = points[i];
    let velocity = pointVelocities[i];
    let original = originalPoints[i];
    let distance = dist(mouseX, mouseY, p.x, p.y);

    if (distance < 50) {
      // Evade mouse if it's close
      let dir = createVector(p.x - mouseX, p.y - mouseY).normalize().mult(2);
      velocity.add(dir);
    }

    // Restore to original position
    let restoreForce = createVector(original.x - p.x, original.y - p.y).mult(0.05);
    velocity.add(restoreForce);

    // Apply friction to slow the points down over time
    velocity.mult(0.9);

    // Update the point position
    p.x += velocity.x;
    p.y += velocity.y;

    // Display the point
    ellipse(p.x, p.y, 5);
  }

  // Draw "Play" button
  textAlign(CENTER, CENTER);
  textSize(40);
  fill(0, 128, 255); // Blue for button background
  let buttonX = width / 2 - 100;
  let buttonY = height / 2;
  rect(buttonX, buttonY, 200, 50, 10); // Rounded rectangle

  fill(255); // White text
  text("Play", buttonX + 100, buttonY + 25);
}

function drawGame() {
  background(30);
  imageMode(CORNER);
  image(bgImage, 0, 0, width, height);

  // Draw obstacles
  for (let obstacle of obstacles) {
    imageMode(CENTER);
    image(rockImg, obstacle.pos.x, obstacle.pos.y, obstacle.size, obstacle.size);

    if (debug) {
      stroke(255, 0, 0, 100); // Red for obstacle radius
      noFill();
      ellipse(obstacle.pos.x, obstacle.pos.y, obstacle.size * 2); // Debug obstacle radius
    }
  }

  // Update and display leaders
  for (let i = 0; i < leaders.length; i++) {
    let leader = leaders[i];
    leader.wander();
    leader.update(obstacles, enemies, leaders);
    leader.show();
    leader.updateRockets();

    if (debug) leader.debug();

    // Update and display suiveurs
    for (let suiveur of leader.suiveurs) {
      let target = leader.pos;
      suiveur.followTarget(target);
      suiveur.update(leader.pos, leader.suiveurs);
      suiveur.show();

      if (debug) suiveur.debug(target, leader.pos);
    }
  }

  // Update and display enemies
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
}

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
