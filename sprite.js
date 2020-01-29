import { FireRate, MaxBoost, TurnRate } from './upgrade.js';

class Sprite {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  draw() {
    throw new Error('This method must be implemented by the subclass');
  }

  set xPos(x) {
    this.x = x;
  }

  set yPos(y) {
    this.y = y;
  }
}

export class Enemy extends Sprite {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.velocity = [0, 0];
    this.velocityFactor = Math.max(Math.random() * (1 - 0.5)) + 0.5;
    this.marker = false;
  }

  //applies velocity to enemy position directly toward player.
  //scales upward with score via difficulty
  updateVelocity(playerCenterX, playerCenterY, difficulty) {
    let sideA = playerCenterX - (this.x + this.width / 2);
    let sideB = playerCenterY - (this.y + this.height / 2);
    //get vector angle and apply velocity vector to current position
    let angle = Math.atan2(sideA, sideB);
    this.velocity[0] = Math.sin(angle) * difficulty;
    this.velocity[1] = Math.cos(angle) * difficulty;
    //Apply enemy vector components to enemy possition
    this.x += this.velocity[0] * this.velocityFactor;
    this.y += this.velocity[1] * this.velocityFactor;
  }

  draw(ctx) {
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    if (this.marker === true) {
      //console.log('drawing marker');
      ctx.fillStyle = 'red';
      let x;
      let y;
      let width = 5;
      let height = 5;
      if (this.x <= 0) x = 0;
      else if (this.x >= ctx.canvas.width) x = ctx.canvas.width - width;
      else x = this.x;
      if (this.y <= 0) y = 0;
      else if (this.y >= ctx.canvas.height) y = ctx.canvas.height - height;
      else y = this.y;
      ctx.fillRect(x, y, width, height);
    }
  }
}

export class Player extends Sprite {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.velocity = [0, 0];
    this.angle = 0;
    this.mass = 10;
    this.force = 1.5;
    this.acceleration = 0;
    this.speed;
    this.resistance = 0.015;
    this._fireRate = new FireRate(5, 500, [30, 20, 10, 5, 2, 1], 'fireRate');
    this._maxBoost = new MaxBoost(5, 500, [100, 125, 150, 175, 200, 250], 'maxBoost');
    this._turnRate = new TurnRate(5, 500, [3.5, 4, 4.5, 5, 5.5, 6], 'turnRate');
    this.upgradeables = [this._fireRate, this._maxBoost, this._turnRate];
    this.bulletArr = [];
    this._boost = 100;
    this.boostConsumptionRate = 2;
    this.boostRefillRate = 2;
    this.noBoost = false;
    this._cannonTemp = 50;
    this._maxCannonTemp = 50;
    this.cannonCooldownRate = 0.5;
    this.image = new Image();
  }

  set ang(val) {
    this.angle = val;
  }

  set vel(val) {
    this.velocity = val;
  }

  get fireRate() {
    return this._fireRate;
  }

  get maxBoost() {
    return this._maxBoost;
  }

  get turnRate() {
    return this._turnRate;
  }

  set boost(val) {
    this._boost = val;
  }
  get boost() {
    return this._boost;
  }

  get cannonTemp() {
    return this._cannonTemp;
  }
  set cannonTemp(val) {
    this._cannonTemp = val;
  }

  get maxCannonTemp() {
    return this._maxCannonTemp;
  }

  updateVelocity() {
    let velMagnitude,
      velAngle,
      degToRad = Math.PI / 180;

    this.velocity[0] += Math.sin(this.angle * degToRad) * this.acceleration;
    this.velocity[1] -= Math.cos(this.angle * degToRad) * this.acceleration;

    velMagnitude = Math.sqrt(this.velocity[0] * this.velocity[0] + this.velocity[1] * this.velocity[1]);
    if (velMagnitude > 0) {
      velAngle = Math.atan2(this.velocity[0], this.velocity[1]);
      this.velocity[0] += Math.sin(velAngle + Math.PI) * this.resistance * velMagnitude;
      this.velocity[1] += Math.cos(velAngle + Math.PI) * this.resistance * velMagnitude;
    }

    this.x += this.velocity[0];
    this.y += this.velocity[1];
  }

  accelerate(bool) {
    if (bool === true) {
      //console.log("player boost is " + this._boost);
      if (this._boost >= 0) {
        this.noBoost = false;
        this._boost -= this.boostConsumptionRate;
        this.acceleration = this.force / this.mass;
      } else if (this.noBoost === false) {
        this.noBoost = true;
        this._boost = -25;
        this._boost += this.boostRefillRate;
        this.acceleration = 0;
      } else {
        this._boost += this.boostRefillRate;
        this.acceleration = 0;
      }
    } else if (bool === false) {
      this.acceleration = 0;
      if (this._boost < this._maxBoost.maxBoost) {
        let temp = this._boost;
        this._boost = Math.min((temp += this.boostRefillRate), this._maxBoost.maxBoost);
      } else {
        this._boost = this._maxBoost.maxBoost;
      }
    } else {
      //console.log('Error, passed value is not boolean in Player.accelerate()');
    }
  }

  left() {
    this.angle -= this._turnRate.turnRate;
  }

  right() {
    this.angle += this._turnRate.turnRate;
  }

  draw(ctx) {
    //draw boost gauge
    ctx.fillStyle = 'red';
    ctx.fillRect(10, 10, 104, 10);
    ctx.fillStyle = 'black';
    ctx.fillRect(12, 12, 100, 6);
    if (this._boost >= 0) {
      ctx.fillStyle = 'violet';
      ctx.fillRect(12, 12, this._boost, 6);
    }

    //draw player
    let centerX = this.x + this.width / 2;
    let centerY = this.y + this.height / 2;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((this.angle * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
    if (this.acceleration > 0) {
      ctx.drawImage(this.image, 35, 0, 35, 60, this.x, this.y, this.width, this.height + 18);
    } else {
      ctx.drawImage(this.image, 0, 0, 35, 42, this.x, this.y, this.width, this.height);
    }
    ctx.restore();
  }
}

export class Coin extends Sprite {
  constructor(x, y, width, height) {
    super(x, y, width, height);
  }

  draw(ctx) {
    ctx.fillStyle = 'gold';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

export class Bullet extends Sprite {
  constructor(x, y, width, height, angle, img) {
    super(x, y, width, height);
    this.image = img;
    this.angle = angle;
    this.bulletSpeed = 3;
    this.velocity = [0, 0];
    this.x += Math.sin((this.angle * Math.PI) / 180) * 20;
    this.y -= Math.cos((this.angle * Math.PI) / 180) * 20;
  }

  updateVelocity() {
    let degToRad = Math.PI / 180;
    this.velocity[0] = Math.sin(this.angle * degToRad) * this.bulletSpeed;
    this.velocity[1] = Math.cos(this.angle * degToRad) * this.bulletSpeed;

    this.x += this.velocity[0];
    this.y -= this.velocity[1];
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate((this.angle * Math.PI) / 180);
    ctx.translate(-this.x - this.width / 2, -this.y - this.height / 2);
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    ctx.restore();
  }
}
