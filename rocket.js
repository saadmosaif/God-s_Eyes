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
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        imageMode(CENTER);
        image(rocketImg, 0, 0, this.r * 4, this.r * 2); // Display rocket image
        pop();
      }
  
    hits(target) {
      let d = p5.Vector.dist(this.pos, target.pos);
      return d < this.r + target.r; // Check if rocket hits the enemy
    }
  }
  