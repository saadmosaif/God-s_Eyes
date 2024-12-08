class Suiveurs {
    constructor(x, y) {
      this.pos = createVector(x, y); // Initial position
      this.vel = createVector(0, 0); // Initial velocity
      this.acc = createVector(0, 0); // Acceleration
      this.maxSpeed = 2; // Maximum speed
      this.maxForce = 0.1; // Maximum steering force
      this.size = 8; // Size of the follower
    }
  
    triangularTarget(leader, index, spacing = 30) {
      let row = Math.floor((-1 + Math.sqrt(1 + 8 * index)) / 2); // Row number in the triangle
      let positionInRow = index - (row * (row + 1)) / 2; // Position in the row
      let offsetX = (positionInRow - row / 2) * spacing; // Horizontal offset
      let offsetY = (row + 1) * spacing; // Vertical offset
      let heading = leader.vel.heading();
      let offset = createVector(offsetX, offsetY).rotate(heading); // Rotate to align with leader
      return p5.Vector.add(leader.pos, offset); // Global target
    }
  
    followTarget(target) {
      let desired = p5.Vector.sub(target, this.pos); // Direction to the target
      desired.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(desired, this.vel); // Steering force
      steer.limit(this.maxForce);
      this.applyForce(steer);
    }
  
    applyForce(force) {
      this.acc.add(force);
    }
  
    update() {
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed);
      this.pos.add(this.vel);
      this.acc.set(0, 0); // Reset acceleration
    }
  
    show() {
      fill(0, 255, 0);
      noStroke();
      ellipse(this.pos.x, this.pos.y, this.size);
    }
  
    // Debug method to visualize follower behavior
    debug(target) {
      stroke(0, 255, 0);
      line(this.pos.x, this.pos.y, target.x, target.y); // Line to the target
      fill(255, 0, 0);
      ellipse(target.x, target.y, 6); // Mark the target
    }
  }
  