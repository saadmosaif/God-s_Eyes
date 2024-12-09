class Leader {
  constructor(x, y, img, numSuiveurs = 5) {
    this.pos = createVector(x, y);
    this.vel = createVector(1, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 2;
    this.maxForce = 0.1;
    this.img = img;
    this.r = 46;
    this.suiveurs = [];
    this.separationRadius = 60; // Minimum distance to maintain from other leaders
    this.rockets = []; // Rockets fired by the leader
    this.lastShot = 0; // Timestamp of the last shot
    this.detectionRadius = 150; // Radius to detect enemies
    this.formation = "snake"; // Default formation
    // Wander behavior parameters
    this.distanceCercle = 150;
    this.wanderRadius = 50;
    this.wanderTheta = PI / 2;
    this.displaceRange = 0.3;

    // Initialize suiveurs
    for (let i = 0; i < numSuiveurs; i++) {
      this.suiveurs.push(new Suiveurs(this.pos.x, this.pos.y));
    }
  }

  // method pour les formation dispo
  updateSuiveursFormation() {
    if (this.formation === "snake") {
      for (let i = 0; i < this.suiveurs.length; i++) {
        let target = i === 0 ? this.pos : this.suiveurs[i - 1].pos;
        this.suiveurs[i].followTarget(target);
      }
    } else if (this.formation === "triangle") {
      let rowSpacing = 60; // Vertical spacing between rows
      let colSpacing = 50; // Horizontal spacing between suiveurs in a row
      let separationRadius = 60; // Minimum distance between suiveurs
  
      let index = 0; // Index of the current suiveur
      let row = 0; // Current row index
  
      while (index < this.suiveurs.length) {
        let numInRow = row + 1; // Number of suiveurs in the current row
        let rowStartX = -((numInRow - 1) * colSpacing) / 2; // Center the row horizontally
  
        for (let col = 0; col < numInRow && index < this.suiveurs.length; col++) {
          let xOffset = rowStartX + col * colSpacing;
          let yOffset = (row + 1) * rowSpacing;
  
          // Target position for the suiveur
          let target = p5.Vector.add(this.pos, createVector(xOffset, yOffset));
  
          // Apply separation force to avoid overlaps
          let separationForce = this.suiveurs[index].separate(this.suiveurs, separationRadius);
          this.suiveurs[index].applyForce(separationForce);
  
          // Move toward the calculated target
          this.suiveurs[index].followTarget(target);
  
          index++;
        }
        row++;
      }
    }
  }

  //shoot method
  shoot(enemies) {
    let now = millis();
    if (now - this.lastShot >= 1000) {
      // Find enemies within the detection radius
      let targets = enemies.filter(enemy => p5.Vector.dist(this.pos, enemy.pos) < this.detectionRadius);
      
      if (targets.length > 0) {
        // Target le plus proche
        let closestEnemy = targets[0];
        let closestDist = p5.Vector.dist(this.pos, closestEnemy.pos);
        for (let enemy of targets) {
          let d = p5.Vector.dist(this.pos, enemy.pos);
          if (d < closestDist) {
            closestDist = d;
            closestEnemy = enemy;
          }
        }
        // Cree un rocket envoyee vers le target
        this.rockets.push(new Rocket(this.pos.x, this.pos.y, closestEnemy));
        this.lastShot = now;
      }
    }
  }


  // Separation behavior
  separate(others) {
    let steer = createVector(0, 0);
    let count = 0;

    for (let other of others) {
      if (other !== this) {
        let d = p5.Vector.dist(this.pos, other.pos);
        if (d > 0 && d < this.separationRadius) {
          let diff = p5.Vector.sub(this.pos, other.pos);
          diff.normalize();
          diff.div(d); 
          steer.add(diff);
          count++;
        }
      }
    }

    if (count > 0) {
      steer.div(count);
      steer.setMag(this.maxSpeed);
      steer.sub(this.vel);
      steer.limit(this.maxForce);
    }
    return steer;
  }

   // logic AvoidObstacle comme vu dans le cours :)
   avoidObstacles(obstacles) {
    let steer = createVector(0, 0);

    for (let obstacle of obstacles) {
      let d = p5.Vector.dist(this.pos, obstacle.pos);
      let avoidanceRadius = obstacle.size * 1.5;

      if (d < avoidanceRadius) {
    
        let diff = p5.Vector.sub(this.pos, obstacle.pos);
        diff.normalize();
        let weight = map(d, 0, avoidanceRadius, 5, 1); // Stronger force closer to the obstacle
        diff.mult(weight); /
        steer.add(diff);

       
        let displacement = p5.Vector.sub(this.pos, obstacle.pos);
        if (d < obstacle.size) {
          this.pos.add(displacement.normalize().mult(avoidanceRadius - d)); // Push out
        }
      }
    }

    if (steer.mag() > 0) {
      steer.setMag(this.maxSpeed);
      steer.sub(this.vel);
      steer.limit(this.maxForce * 2); //ajoute la force pour obstacle avoidance
    }

    return steer;
  }


  // Wander behavior comme vu dans le cours aussi hhh
  wander() {
    let circleCenter = this.vel.copy();
    circleCenter.setMag(this.distanceCercle);
    circleCenter.add(this.pos);

    this.wanderTheta += random(-this.displaceRange, this.displaceRange);
    let wanderPoint = createVector(
      this.wanderRadius * cos(this.wanderTheta),
      this.wanderRadius * sin(this.wanderTheta)
    );
    wanderPoint.add(circleCenter);

    let force = p5.Vector.sub(wanderPoint, this.pos);
    force.setMag(this.maxForce);
    this.applyForce(force);

    this.debugInfo = { circleCenter, wanderPoint };
  }

  // Apply a force to the leader
  applyForce(force) {
    this.acc.add(force);
  }

  // Update leader position, velocity, and behavior
  update(obstacles = [], enemies = [], otherLeaders = []) {

      //on update la shoothing methods
      this.shoot(enemies);
    // la separation
    let separationForce = this.separate(otherLeaders);
    this.applyForce(separationForce);

    //evitement d'obstacle
    let avoidanceForce = this.avoidObstacles(obstacles);
    this.applyForce(avoidanceForce);

    // et la poursuite 
    if (enemies.length > 0) {
      let closestEnemy = null;
      let closestDist = Infinity;

      for (let enemy of enemies) {
        let d = p5.Vector.dist(this.pos, enemy.pos);
        if (d < closestDist) {
          closestDist = d;
          closestEnemy = enemy;
        }
      }

      if (closestEnemy) {
        let pursuitForce = this.pursue(closestEnemy);
        this.applyForce(pursuitForce);
      }
    } else {
      // si aucun enemie dans les parrage le leader est dans un wander state
      this.wander();
    }

    // Update physics
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);

    // les edges pour le leader
    this.edges();
    this.updateSuiveursFormation();
  }
  // Update rockets
  updateRockets() {
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      let rocket = this.rockets[i];
      rocket.update();
      rocket.show();

      // Remove rocket if it hits a target
      if (rocket.target && rocket.hits(rocket.target)) {
        enemies.splice(enemies.indexOf(rocket.target), 1); // Remove enemy
        this.rockets.splice(i, 1); // Remove rocket
      }
    }
  }

  // poursuite de l enemie (comme celle du cours aussi)
  pursue(enemy) {
    let prediction = enemy.vel.copy();
    prediction.mult(10); // Predict 10 frames ahead
    let futurePos = p5.Vector.add(enemy.pos, prediction);
    return this.seek(futurePos);
  }

  // Seek behavior(meme cas)
  seek(target) {
    let desired = p5.Vector.sub(target, this.pos);
    desired.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  }

  // les edges du leader
  edges() {
    if (this.pos.x > width) this.pos.x = width;
    if (this.pos.x < 0) this.pos.x = 0;
    if (this.pos.y > height) this.pos.y = height;
    if (this.pos.y < 0) this.pos.y = 0;
  }

  // affichage
  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading() - PI / 2);
    imageMode(CENTER);
    image(this.img, 0, 0, this.r * 2, this.r * 2);
    pop();
  }

  // Debug visuals
  debug() {
    if (debug && this.debugInfo) {
      // Wandering circle
      noFill();
      stroke(255, 0, 0, 150);
      ellipse(this.debugInfo.circleCenter.x, this.debugInfo.circleCenter.y, this.wanderRadius * 2);

      // Wandering point
      fill(0, 255, 0);
      noStroke();
      ellipse(this.debugInfo.wanderPoint.x, this.debugInfo.wanderPoint.y, 8);

      // Velocity vector
      stroke(255, 255, 0, 150);
      line(
        this.pos.x,
        this.pos.y,
        this.pos.x + this.vel.x * 50,
        this.pos.y + this.vel.y * 50
      );
    }

    // Debug obstacle avoidance
    if (debug) {
      for (let obstacle of obstacles) {
        let d = p5.Vector.dist(this.pos, obstacle.pos);
        if (d < obstacle.size * 1.5) {
          stroke(255, 100, 100, 150);
          line(this.pos.x, this.pos.y, obstacle.pos.x, obstacle.pos.y);
        }
      }
    }
  }
}
