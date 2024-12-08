class Obstacle {
    constructor(x, y, size, image) {
      this.pos = createVector(x, y);
      this.size = size;
      this.image = image;
    }
  
    show() {
      push();
      translate(this.pos.x, this.pos.y);
      imageMode(CENTER);
      image(this.image, 0, 0, this.size, this.size);
      pop();
    }
  }
  