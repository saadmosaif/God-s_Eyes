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

  // Separation behavior for leaders
  separate(others) {
    let steer = createVector(0, 0);
    let count = 0;

    for (let other of others) {
      if (other !== this) {
        let d = p5.Vector.dist(this.pos, other.pos);
        if (d > 0 && d < this.separationRadius) {
          let diff = p5.Vector.sub(this.pos, other.pos);
          diff.normalize();
          diff.div(d); // Weight by distance
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

   // Strong obstacle avoidance logic
   avoidObstacles(obstacles) {
    let steer = createVector(0, 0);

    for (let obstacle of obstacles) {
      let d = p5.Vector.dist(this.pos, obstacle.pos);
      let avoidanceRadius = obstacle.size * 1.5;

      if (d < avoidanceRadius) {
        // Calculate a strong force to move the leader away
        let diff = p5.Vector.sub(this.pos, obstacle.pos);
        diff.normalize();
        let weight = map(d, 0, avoidanceRadius, 5, 1); // Stronger force closer to the obstacle
        diff.mult(weight); // Amplify the force
        steer.add(diff);

        // Optional: immediately move leader outside the radius
        let displacement = p5.Vector.sub(this.pos, obstacle.pos);
        if (d < obstacle.size) {
          this.pos.add(displacement.normalize().mult(avoidanceRadius - d)); // Push out
        }
      }
    }

    if (steer.mag() > 0) {
      steer.setMag(this.maxSpeed);
      steer.sub(this.vel);
      steer.limit(this.maxForce * 2); // Increase force for obstacle avoidance
    }

    return steer;
  }


  // Wander behavior
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
    // Apply separation force to avoid other leaders
    let separationForce = this.separate(otherLeaders);
    this.applyForce(separationForce);

    // Avoid obstacles
    let avoidanceForce = this.avoidObstacles(obstacles);
    this.applyForce(avoidanceForce);

    // Pursue the closest enemy if available
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
      // Wander if no enemies are nearby
      this.wander();
    }

    // Update physics
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);

    // Ensure the leader stays within the screen boundaries
    this.edges();
  }

  // Pursue the predicted future position of an enemy
  pursue(enemy) {
    let prediction = enemy.vel.copy();
    prediction.mult(10); // Predict 10 frames ahead
    let futurePos = p5.Vector.add(enemy.pos, prediction);
    return this.seek(futurePos);
  }

  // Seek behavior
  seek(target) {
    let desired = p5.Vector.sub(target, this.pos);
    desired.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  }

  // Keep the leader within the screen boundaries
  edges() {
    if (this.pos.x > width) this.pos.x = width;
    if (this.pos.x < 0) this.pos.x = 0;
    if (this.pos.y > height) this.pos.y = height;
    if (this.pos.y < 0) this.pos.y = 0;
  }

  // Display the leader
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
