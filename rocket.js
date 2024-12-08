class Rocket {
    constructor(x, y, target) {
      this.pos = createVector(x, y); // Starting position
      this.vel = createVector(0, 0); // Velocity
      this.acc = createVector(0, 0); // Acceleration
      this.maxSpeed = 6; // Maximum speed
      this.maxForce = 0.2; // Steering force
      this.target = target; // Target enemy
      this.r = 10; // Rocket size
    }
  
    seek(target) {
      let desired = p5.Vector.sub(target, this.pos); // Direction to target
      desired.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(desired, this.vel); // Steering force
      steer.limit(this.maxForce);
      return steer;
    }
  
    applyForce(force) {
      this.acc.add(force);
    }
  
    update() {
      if (this.target) {
        let steer = this.seek(this.target.pos); // Seek the target's position
        this.applyForce(steer);
      }
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed);
      this.pos.add(this.vel);
      this.acc.set(0, 0);
    }
  
    show() {
      fill(255, 0, 0);
      noStroke();
      ellipse(this.pos.x, this.pos.y, this.r * 2); // Draw the rocket
    }
  
    hits(target) {
      let d = p5.Vector.dist(this.pos, target.pos);
      return d < this.r + target.r; // Check if rocket hits the enemy
    }
  }
  