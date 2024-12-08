class Leader {
    constructor(x, y, image) {
      this.pos = createVector(x, y); // Initial position
      this.vel = createVector(1, 0); // Initial velocity
      this.acc = createVector(0, 0); // Acceleration
      this.maxSpeed = 2; // Maximum speed
      this.maxForce = 0.1; // Maximum steering force
      this.image = image; // Image for the leader
      this.r = 46; // Size of the leader
  
      // Wander behavior parameters
      this.distanceCercle = 150; // Distance to the wandering circle
      this.wanderRadius = 50; // Radius of the wandering circle
      this.wanderTheta = PI / 2; // Initial wandering angle
      this.displaceRange = 0.3; // Range of random angle displacement
    }
  
    wander() {
      // Calculate the center of the wandering circle
      let circleCenter = this.vel.copy();
      circleCenter.setMag(this.distanceCercle);
      circleCenter.add(this.pos);
  
      // Calculate the wandering point on the circle
      this.wanderTheta += random(-this.displaceRange, this.displaceRange);
      let wanderPoint = createVector(
        this.wanderRadius * cos(this.wanderTheta),
        this.wanderRadius * sin(this.wanderTheta)
      );
      wanderPoint.add(circleCenter);
  
      // Calculate the steering force toward the wandering point
      let force = p5.Vector.sub(wanderPoint, this.pos);
      force.setMag(this.maxForce);
      this.applyForce(force);
  
      // Save debug info
      this.debugInfo = { circleCenter, wanderPoint };
    }
  
    applyForce(force) {
      this.acc.add(force); // Add force to acceleration
    }
  
    update() {
      this.vel.add(this.acc); // Update velocity
      this.vel.limit(this.maxSpeed); // Limit the velocity
      this.pos.add(this.vel); // Update position
      this.acc.set(0, 0); // Reset acceleration
    }
  
    edges() {
      // Prevent the leader from leaving the screen
      if (this.pos.x - this.r < 0) {
        this.pos.x = this.r; // Left edge
        this.vel.x *= -1;
      } else if (this.pos.x + this.r > width) {
        this.pos.x = width - this.r; // Right edge
        this.vel.x *= -1;
      }
      if (this.pos.y - this.r < 0) {
        this.pos.y = this.r; // Top edge
        this.vel.y *= -1;
      } else if (this.pos.y + this.r > height) {
        this.pos.y = height - this.r; // Bottom edge
        this.vel.y *= -1;
      }
    }
  
    show() {
      // Draw the leader with the image
      push();
      translate(this.pos.x, this.pos.y);
      rotate(this.vel.heading() - PI / 2); // Rotate the image to align with direction
      imageMode(CENTER);
      image(this.image, 0, 0, this.r * 2, this.r * 2); // Draw the image
      pop();
    }
  
    debug() {
      // Draw the wandering circle
      noFill();
      stroke(255, 0, 0, 150); // Red color for the wandering circle
      ellipse(this.debugInfo.circleCenter.x, this.debugInfo.circleCenter.y, this.wanderRadius * 2);
  
      // Draw the wandering point
      fill(0, 255, 0); // Green color for the wandering point
      noStroke();
      ellipse(this.debugInfo.wanderPoint.x, this.debugInfo.wanderPoint.y, 8);
  
      // Draw the velocity line from the leader's center
      stroke(255, 255, 0, 150); // Yellow color for the velocity line
      line(
        this.pos.x,
        this.pos.y,
        this.pos.x + this.vel.x * 50, // Extend the line in the velocity direction
        this.pos.y + this.vel.y * 50
      );
    }
  }
  