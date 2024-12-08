class Suiveurs {
    constructor(x, y) {
      this.pos = createVector(x, y); // Initial position
      this.vel = createVector(0, 0); // Velocity
      this.acc = createVector(0, 0); // Acceleration
      this.maxSpeed = 2; // Maximum speed
      this.maxForce = 0.1; // Maximum force
      this.r = 20; // Radius (controls the size of the displayed image)
    }
  
    // Method to follow a target position
    followTarget(target) {
      let desired = p5.Vector.sub(target, this.pos); // Direction to target
      desired.setMag(this.maxSpeed); // Set to max speed
      let steer = p5.Vector.sub(desired, this.vel); // Calculate steering force
      steer.limit(this.maxForce); // Limit steering force
      this.applyForce(steer); // Apply the force
    }
  
    // Method to apply a force to the suiveur
    applyForce(force) {
      this.acc.add(force);
    }
  
    // Update the position and velocity
    update() {
      this.vel.add(this.acc); // Add acceleration to velocity
      this.vel.limit(this.maxSpeed); // Limit velocity
      this.pos.add(this.vel); // Update position
      this.acc.set(0, 0); // Reset acceleration for the next frame
    }
  
    // Ensure suiveurs stay within screen bounds
    edges() {
      if (this.pos.x > width) this.pos.x = width;
      if (this.pos.x < 0) this.pos.x = 0;
      if (this.pos.y > height) this.pos.y = height;
      if (this.pos.y < 0) this.pos.y = 0;
    }
  
    // Display the suiveur using the image
    show() {
      imageMode(CENTER);
      image(suiveurImg, this.pos.x, this.pos.y, this.r * 2, this.r * 2); // Display suiveur image
    }
  
    // Debug method to visualize the suiveur's behavior
    debug(target) {
      if (debug) {
        stroke(0, 255, 0); // Green debug line
        line(this.pos.x, this.pos.y, target.x, target.y); // Line to target
      }
    }
  }
  