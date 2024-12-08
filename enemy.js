class Enemy {
    constructor(x, y, img) {
      this.pos = createVector(x, y);
      this.vel = p5.Vector.random2D();
      this.acc = createVector(0, 0);
      this.maxSpeed = 3;
      this.maxForce = 0.2;
      this.r = 20; // Radius for visual size
      this.img = img;
      this.perceptionRadius = 50; // Radius for flocking behaviors
    }
  
    // Separation: Avoid crowding nearby enemies
    separate(enemies) {
      let steer = createVector(0, 0);
      let count = 0;
  
      for (let other of enemies) {
        let d = p5.Vector.dist(this.pos, other.pos);
        if (other !== this && d < this.perceptionRadius) {
          let diff = p5.Vector.sub(this.pos, other.pos);
          diff.normalize();
          diff.div(d); // Weight by distance
          steer.add(diff);
          count++;
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
  
    // Alignment: Steer toward the average velocity of nearby enemies
    align(enemies) {
      let avgVel = createVector(0, 0);
      let count = 0;
  
      for (let other of enemies) {
        let d = p5.Vector.dist(this.pos, other.pos);
        if (other !== this && d < this.perceptionRadius) {
          avgVel.add(other.vel);
          count++;
        }
      }
  
      if (count > 0) {
        avgVel.div(count);
        avgVel.setMag(this.maxSpeed);
        let steer = p5.Vector.sub(avgVel, this.vel);
        steer.limit(this.maxForce);
        return steer;
      }
      return createVector(0, 0);
    }
  
    // Cohesion: Steer toward the average position of nearby enemies
    cohesion(enemies) {
      let center = createVector(0, 0);
      let count = 0;
  
      for (let other of enemies) {
        let d = p5.Vector.dist(this.pos, other.pos);
        if (other !== this && d < this.perceptionRadius) {
          center.add(other.pos);
          count++;
        }
      }
  
      if (count > 0) {
        center.div(count); // Average position
        return this.seek(center); // Steer toward the average position
      }
      return createVector(0, 0);
    }
  
    // Seek behavior for cohesion
    seek(target) {
      let desired = p5.Vector.sub(target, this.pos);
      desired.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxForce);
      return steer;
    }
  
    // Flocking behavior: Combine separation, alignment, and cohesion
    flock(enemies) {
      let separation = this.separate(enemies);
      let alignment = this.align(enemies);
      let cohesion = this.cohesion(enemies);
  
      // Weigh the forces
      separation.mult(1.5); // More weight for separation
      alignment.mult(1.0);
      cohesion.mult(1.0);
  
      this.applyForce(separation);
      this.applyForce(alignment);
      this.applyForce(cohesion);
    }
  
    // Avoid obstacles
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
  
    // Flee from leader and its suiveurs
    avoidLeaderAndSuiveurs(leader) {
      let fleeForce = this.flee(leader.pos);
      for (let suiveur of leader.suiveurs) {
        let suiveurFlee = this.flee(suiveur.pos);
        fleeForce.add(suiveurFlee);
      }
      this.applyForce(fleeForce);
    }
  
    // Flee behavior
    flee(target) {
      let desired = p5.Vector.sub(this.pos, target);
      let d = desired.mag();
      if (d < 150) { // Flee radius
        desired.setMag(this.maxSpeed);
        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce);
        return steer;
      }
      return createVector(0, 0);
    }
  
    // Apply force to the enemy
    applyForce(force) {
      this.acc.add(force);
    }
  
    // Update position and velocity
    update() {
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed);
      this.pos.add(this.vel);
      this.acc.set(0, 0);
  
      this.edges(); // Keep enemies within canvas
    }
  
    // Keep enemies within the canvas
    edges() {
      if (this.pos.x > width) this.pos.x = width;
      if (this.pos.x < 0) this.pos.x = 0;
      if (this.pos.y > height) this.pos.y = height;
      if (this.pos.y < 0) this.pos.y = 0;
    }
  
    // Display the enemy
    show() {
      imageMode(CENTER);
      image(this.img, this.pos.x, this.pos.y, this.r * 2, this.r * 2);
    }
  
    // Debug visuals
    debug() {
      if (debug) {
        // Debug fleeing radius
        noFill();
        stroke(0, 255, 0, 100); // Green for flee radius
        ellipse(this.pos.x, this.pos.y, 300); // Radius is 2x flee distance (150)
  
        // Debug velocity vector
        stroke(255, 255, 0, 150); // Yellow for velocity vector
        line(
          this.pos.x,
          this.pos.y,
          this.pos.x + this.vel.x * 20,
          this.pos.y + this.vel.y * 20
        );
      }
    }
  }
      