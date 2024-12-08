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
  update(obstacles, enemies, otherLeaders) {
    // Apply separation force to avoid other leaders
    let separationForce = this.separate(otherLeaders);
    this.applyForce(separationForce);

    // Avoid obstacles
    let avoidanceForce = this.avoidObstacles(obstacles);
    this.applyForce(avoidanceForce);

    // Update physics
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);

    // Ensure the leader stays within the screen boundaries
    this.edges();
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
}
