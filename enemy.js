class Enemy {
    constructor(x, y, img) {
      this.pos = createVector(x, y);
      this.vel = p5.Vector.random2D();
      this.acc = createVector(0, 0);
      this.maxSpeed = 3;
      this.maxForce = 0.2;
      this.r = 20; // Visual size
      this.img = img;
    }
  
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
  
    avoidLeaderAndSuiveurs(leader) {
      let fleeForce = this.flee(leader.pos);
      for (let suiveur of leader.suiveurs) {
        let suiveurFlee = this.flee(suiveur.pos);
        fleeForce.add(suiveurFlee);
      }
      this.applyForce(fleeForce);
    }
  
    avoidObstacles(obstacles) {
      let steer = createVector(0, 0);
  
      for (let obstacle of obstacles) {
        let d = p5.Vector.dist(this.pos, obstacle.pos);
        let avoidanceRadius = obstacle.size * 1.5;
  
        if (d < avoidanceRadius) {
          let diff = p5.Vector.sub(this.pos, obstacle.pos);
          diff.normalize();
          diff.mult(this.maxSpeed);
          diff.sub(this.vel);
          diff.limit(this.maxForce);
          steer.add(diff);
        }
      }
  
      return steer;
    }
  
    applyForce(force) {
      this.acc.add(force);
    }
  
    update() {
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed);
      this.pos.add(this.vel);
      this.acc.set(0, 0);
  
      // Ensure enemies stay within the canvas
      this.edges();
    }
  
    edges() {
      if (this.pos.x > width) this.pos.x = width;
      if (this.pos.x < 0) this.pos.x = 0;
      if (this.pos.y > height) this.pos.y = height;
      if (this.pos.y < 0) this.pos.y = 0;
    }
  
    show() {
      imageMode(CENTER);
      image(this.img, this.pos.x, this.pos.y, this.r * 2, this.r * 2);
  
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
  