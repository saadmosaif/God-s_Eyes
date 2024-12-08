let leaders = [];
let leaderImg, suiveurImg, bgImage, rockImg, enemyImg;
let debug = false;
let obstacles = [];
let enemies = [];

function preload() {
  bgImage = loadImage('assets/map.png');
  leaderImg = loadImage('assets/leader.png');
  suiveurImg = loadImage('assets/suiveurs.png');
  rockImg = loadImage('assets/rock.png');
  enemyImg = loadImage('assets/enemy.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  leaders.push(new Leader(width / 2, height / 2, leaderImg, 5));
}

function draw() {
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
    leader.wander(); // Wander behavior
    leader.update(obstacles, enemies, leaders);// Update with obstacle and enemy avoidance
    leader.show(); // Display the leader

    if (debug) leader.debug(); // Display leader debug info

    // Update and display suiveurs
    for (let j = 0; j < leader.suiveurs.length; j++) {
      let suiveur = leader.suiveurs[j];
      let target = j === 0 ? leader.pos : leader.suiveurs[j - 1].pos;

      suiveur.followTarget(target); // Follow the leader or the previous suiveur
      suiveur.update(leader.pos, leader.suiveurs); // Update with leader and other suiveurs
      suiveur.show(); // Display the suiveur

      if (debug) suiveur.debug(target, leader.pos); // Debug visuals for the suiveur
    }
  }

  // Update and display enemies
  for (let enemy of enemies) {
    enemy.flock(enemies); // Apply flocking behavior (separation, alignment, cohesion)
    for (let leader of leaders) {
      enemy.avoidLeaderAndSuiveurs(leader); // Avoid all leaders and their suiveurs
    }
    let obstacleAvoidance = enemy.avoidObstacles(obstacles); // Avoid obstacles
    enemy.applyForce(obstacleAvoidance); // Apply obstacle avoidance force
    enemy.update(); // Update enemy position and velocity
    enemy.show(); // Display enemy

    if (debug) {
      // Additional debug for enemies
      enemy.debug();
    }
  }
}



function mousePressed(event) {
  if (mouseButton === LEFT) {
    event.preventDefault();
    let obstacle = {
      pos: createVector(mouseX, mouseY),
      size: random(30, 100),
    };
    obstacles.push(obstacle);
  }
}

function keyPressed() {
  if (key === 'a' || key === 'A') {
    leaders.push(new Leader(mouseX, mouseY, leaderImg, 5));
  }
  if (key === 'd' || key === 'D') {
    debug = !debug;
  }
  if (key === 'e' || key === 'E') {
    let swarmSize = 5; // Number of enemies in the swarm
    for (let i = 0; i < swarmSize; i++) {
      let x = mouseX + random(-50, 50);
      let y = mouseY + random(-50, 50);
      enemies.push(new Enemy(x, y, enemyImg)); // Instantiate using the Enemy class
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
