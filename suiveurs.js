class Suiveurs {
    constructor(x, y) {
      this.pos = createVector(x, y); // Initial position
      this.vel = createVector(0, 0); // Velocity
      this.acc = createVector(0, 0); // Acceleration
      this.maxSpeed = 2; // Maximum speed
      this.maxForce = 0.1; // Maximum force
      this.r = 20; // Radius (controls the size of the displayed image)
      this.leaderRadius = 100; // Maximum distance allowed from the leader
      this.cohesionRadius = 50; // Radius for cohesion with other suiveurs
    }
  
    // Follow the target (leader or preceding suiveur)
    followTarget(target) {
      let desired = p5.Vector.sub(target, this.pos); // Direction to target
      desired.setMag(this.maxSpeed); // Set to max speed
      let steer = p5.Vector.sub(desired, this.vel); // Calculate steering force
      steer.limit(this.maxForce); // Limit steering force
      this.applyForce(steer); // Apply the force
    }
  
    // Stay close to the leader
    stayCloseToLeader(leaderPos) {
      let distance = p5.Vector.dist(this.pos, leaderPos);
      if (distance > this.leaderRadius) {
        let force = p5.Vector.sub(leaderPos, this.pos);
        force.setMag(this.maxSpeed); // Force to move closer
        let steer = p5.Vector.sub(force, this.vel); // Steering calculation
        steer.limit(this.maxForce);
        this.applyForce(steer);
      }
    }
  
    // Avoid collision with other suiveurs
    separate(others) {
      if (!Array.isArray(others)) return; // Ensure others is iterable
  
      let steer = createVector(0, 0);
      let count = 0;
  
      for (let other of others) {
        let d = p5.Vector.dist(this.pos, other.pos); // Distance to another suiveur
        if (other !== this && d < this.r * 2) {
          let diff = p5.Vector.sub(this.pos, other.pos); // Vector pointing away
          diff.normalize(); // Normalize the direction
          diff.div(d); // Weight by distance (closer = stronger avoidance)
          steer.add(diff);
          count++;
        }
      }
  
      if (count > 0) {
        steer.div(count); // Average out the steering forces
        steer.setMag(this.maxSpeed); // Set magnitude to max speed
        steer.sub(this.vel); // Steering formula: desired - current velocity
        steer.limit(this.maxForce); // Limit the steering force
      }
      return steer;
    }
  
    // Cohesion: Steer toward the average position of nearby suiveurs
    cohesion(others) {
      if (!Array.isArray(others)) return createVector(0, 0); // Ensure others is iterable
  
      let center = createVector(0, 0);
      let count = 0;
  
      for (let other of others) {
        let d = p5.Vector.dist(this.pos, other.pos);
        if (other !== this && d < this.cohesionRadius) {
          center.add(other.pos); // Sum of positions of nearby suiveurs
          count++;
        }
      }
  
      if (count > 0) {
        center.div(count); // Average position
        return this.seek(center); // Steer toward the average position
      }
      return createVector(0, 0);
    }
  
    // Seek a specific target (used in cohesion)
    seek(target) {
      let desired = p5.Vector.sub(target, this.pos);
      desired.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxForce);
      return steer;
    }
  
    // Apply a force to the suiveur
    applyForce(force) {
      this.acc.add(force);
    }
  
    // Update the position, velocity, and apply behaviors
    update(leaderPos, others) {
      let separationForce = this.separate(others); // Avoid collision with other suiveurs
      let cohesionForce = this.cohesion(others); // Stay close to other suiveurs
  
      this.applyForce(separationForce);
      this.applyForce(cohesionForce);
      this.stayCloseToLeader(leaderPos); // Stay within proximity of the leader
  
      this.vel.add(this.acc); // Update velocity
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
      image(suiveurImg, this.pos.x, this.pos.y, this.r * 2, this.r * 2); // Use the suiveur image
    }
  
    // Debug method to visualize the suiveur's behavior
    debug(target, leaderPos) {
      if (debug) {
        // Debug line to the target
        stroke(0, 255, 0);
        line(this.pos.x, this.pos.y, target.x, target.y);
  
        // Debug leader radius
        noFill();
        stroke(0, 0, 255, 100);
        ellipse(leaderPos.x, leaderPos.y, this.leaderRadius * 2);
  
        // Debug collision radius
        noFill();
        stroke(255, 0, 0, 100);
        ellipse(this.pos.x, this.pos.y, this.r * 2);
  
        // Debug cohesion radius
        noFill();
        stroke(0, 255, 255, 100);
        ellipse(this.pos.x, this.pos.y, this.cohesionRadius * 2);
      }
    }
  }
  