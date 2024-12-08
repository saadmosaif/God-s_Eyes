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

    this.distanceCercle = 150;
    this.wanderRadius = 50;
    this.wanderTheta = PI / 2;
    this.displaceRange = 0.3;

    for (let i = 0; i < numSuiveurs; i++) {
      this.suiveurs.push(new Suiveurs(this.pos.x, this.pos.y));
    }
  }

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

  avoidObstacles(obstacles) {
    let steer = createVector(0, 0);
    for (let obstacle of obstacles) {
      let d = p5.Vector.dist(this.pos, obstacle.pos);
      let avoidanceRadius = obstacle.size * 1.5;
      if (d < avoidanceRadius) {
        let diff = p5.Vector.sub(this.pos, obstacle.pos);
        diff.normalize();
        diff.div(d);
        steer.add(diff);
      }
    }
    if (steer.mag() > 0) {
      steer.setMag(this.maxSpeed);
      steer.sub(this.vel);
      steer.limit(this.maxForce);
    }
    return steer;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update(obstacles) {
    let avoidanceForce = this.avoidObstacles(obstacles);
    this.applyForce(avoidanceForce);

    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
    this.edges();
  }

  edges() {
    if (this.pos.x > width) this.pos.x = width;
    if (this.pos.x < 0) this.pos.x = 0;
    if (this.pos.y > height) this.pos.y = height;
    if (this.pos.y < 0) this.pos.y = 0;
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading() - PI / 2);
    imageMode(CENTER);
    image(this.img, 0, 0, this.r * 2, this.r * 2);
    pop();
  }

  debug() {
    if (debug) {
      noFill();
      stroke(255, 0, 0, 150);
      ellipse(this.debugInfo.circleCenter.x, this.debugInfo.circleCenter.y, this.wanderRadius * 2);

      fill(0, 255, 0);
      noStroke();
      ellipse(this.debugInfo.wanderPoint.x, this.debugInfo.wanderPoint.y, 8);

      stroke(255, 255, 0, 150);
      line(
        this.pos.x,
        this.pos.y,
        this.pos.x + this.vel.x * 50,
        this.pos.y + this.vel.y * 50
      );
    }
  }
}
  