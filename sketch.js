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
  for (let leader of leaders) {
    leader.wander(); // Wandering behavior
    leader.update(obstacles, enemies); // Avoid obstacles and pursue enemies
    leader.show();

    if (debug) leader.debug(); // Debug leader behavior
  }

  // Update and display suiveurs for each leader
  for (let leader of leaders) {
    for (let i = 0; i < leader.suiveurs.length; i++) {
      let suiveur = leader.suiveurs[i];
      let target = i === 0 ? leader.pos : leader.suiveurs[i - 1].pos; // Follow leader or previous suiveur

      suiveur.followTarget(target);
      suiveur.update();
      suiveur.show();

      if (debug) suiveur.debug(target); // Debug suiveur behavior
    }
  }

  for (let enemy of enemies) {
    enemy.flock(enemies); // Apply flocking behavior
    enemy.avoidLeaderAndSuiveurs(leaders[0]); // Flee from the first leader and its suiveurs
    let obstacleAvoidance = enemy.avoidObstacles(obstacles); // Avoid obstacles
    enemy.applyForce(obstacleAvoidance); // Apply obstacle avoidance
    enemy.update(); // Update position
    enemy.show(); // Display enemy
  }
  

}


function mousePressed(event) {
  if (mouseButton === RIGHT) {
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
