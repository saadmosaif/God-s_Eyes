class Leader {
    constructor(x, y) {
      this.pos = createVector(x, y); // Position initiale
      this.vel = createVector(0, 0); // Vitesse initiale
      this.acc = createVector(0, 0); // Accélération
      this.maxSpeed = 2; // Vitesse maximale
      this.maxForce = 0.1; // Force maximale
      this.rayonZoneDeFreinage = 100; // Rayon où le leader commence à ralentir
      this.stopped = false; // Indique si le leader est arrêté
      this.size = 40;
    }
  
    seek(target, arrival = false) {
      if (this.stopped) return createVector(0, 0); // Aucune force si le leader est arrêté
  
      let force = p5.Vector.sub(target, this.pos); // Calcul de la direction vers la cible
      let desiredSpeed = this.maxSpeed;
  
      if (arrival) {
        const dist = p5.Vector.dist(this.pos, target); // Distance à la cible
  
        // Ralentir progressivement dans la zone de freinage
        if (dist < this.rayonZoneDeFreinage) {
          desiredSpeed = map(dist, 0, this.rayonZoneDeFreinage, 0, this.maxSpeed);
  
          // Si très proche de la cible, arrêter complètement
          if (dist < 5) { // Tolérance de 5 pixels
            this.stop(); // Appeler la méthode pour arrêter le leader
            return createVector(0, 0); // Pas de force
          }
        }
      }
  
      // Calcul de la force pour ajuster la vitesse
      force.setMag(desiredSpeed);
      force.sub(this.vel);
      force.limit(this.maxForce);
      return force;
    }
  
    arrive(target) {
      return this.seek(target, true); // Activer le mode "arrive"
    }
  
    applyForce(force) {
      if (!this.stopped) { // Appliquer la force seulement si le leader n'est pas arrêté
        this.acc.add(force);
      }
    }
  
    update() {
      if (!this.stopped) { // Mettre à jour seulement si le leader n'est pas arrêté
        this.vel.add(this.acc); // Ajouter l'accélération à la vitesse
        this.vel.limit(this.maxSpeed); // Limiter la vitesse
        this.pos.add(this.vel); // Mettre à jour la position
        this.acc.set(0, 0); // Réinitialiser l'accélération
      }
    }
  
    stop() {
      this.vel.set(0, 0); // Mettre la vitesse à zéro
      this.acc.set(0, 0); // Mettre l'accélération à zéro
      this.stopped = true; // Marquer le leader comme arrêté
    }
  
    resume() {
      this.stopped = false; // Permettre au leader de se déplacer à nouveau
    }
  
    show() {
        // Afficher l'image du leader
        push();
        translate(this.pos.x, this.pos.y);
        if (this.vel.mag() > 0) {
            rotate(this.vel.heading() + HALF_PI); // Ajuster la rotation pour aligner correctement l'image
          }
        imageMode(CENTER);
        image(leaderImg, 0, 0, this.size, this.size); // Afficher l'image avec la taille définie
        pop();
      }
  }
  