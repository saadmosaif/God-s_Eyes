class Suiveurs {
    constructor(x, y) {
      this.pos = createVector(x, y); //  position initial
      this.vel = createVector(0, 0);
      this.acc = createVector(0, 0);
      this.maxSpeed = 2; // Maximum speed
      this.maxForce = 0.1; // Maximum force
      this.r = 20; // Radius 
      this.leaderRadius = 100; // distance max du leader
      this.cohesionRadius = 50; // Radius for cohesion
      
    }
  
    // Follow the target
    followTarget(target) {
      let desired = p5.Vector.sub(target, this.pos); //direction vers le target
      desired.setMag(this.maxSpeed); //vitess max
      let steer = p5.Vector.sub(desired, this.vel); // Calculate steering force
      steer.limit(this.maxForce); 
      this.applyForce(steer); // Apply the force
    }
  
    // Stay close to the leader
    stayCloseToLeader(leaderPos) {
      let distance = p5.Vector.dist(this.pos, leaderPos);
      if (distance > this.leaderRadius) {
        let force = p5.Vector.sub(leaderPos, this.pos);
        force.setMag(this.maxSpeed); // to move closer
        let steer = p5.Vector.sub(force, this.vel); //calcul steer
        steer.limit(this.maxForce);
        this.applyForce(steer);
      }
    }

    
  //function separate
    separate(others, radius = 40) {
        let steer = createVector(0, 0);
        let count = 0;
      
        for (let other of others) {
          let d = p5.Vector.dist(this.pos, other.pos);
          if (other !== this && d < radius) {
            let diff = p5.Vector.sub(this.pos, other.pos); 
            diff.normalize();
            diff.div(d); 
            steer.add(diff);
            count++;
          }
        }
      
        if (count > 0) {
          steer.div(count); // Average out the separation vectors
          steer.setMag(this.maxSpeed); // Adjust to max speed
          steer.sub(this.vel); // Calculate steering
          steer.limit(this.maxForce); // Limit the steering force
        }
      
        return steer;
      }
      
    // Cohesion: Steer toward the average position of nearby suiveurs
    cohesion(others) {
      if (!Array.isArray(others)) return createVector(0, 0); //
  
      let center = createVector(0, 0);
      let count = 0;
  
      for (let other of others) {
        let d = p5.Vector.dist(this.pos, other.pos);
        if (other !== this && d < this.cohesionRadius) {
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
  
    // follow un target
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
  
    // Update la position, velocity, et apply behaviors
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
  
    // les suiveurs ne doivent pas quitter l'ecran
    edges() {
      if (this.pos.x > width) this.pos.x = width;
      if (this.pos.x < 0) this.pos.x = 0;
      if (this.pos.y > height) this.pos.y = height;
      if (this.pos.y < 0) this.pos.y = 0;
    }
  
    // afficher les suiveurs avec l'image
    show() {
      imageMode(CENTER);
      image(suiveurImg, this.pos.x, this.pos.y, this.r * 2, this.r * 2); // Use the suiveur image
    }
  
    // Debug method 
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
  
