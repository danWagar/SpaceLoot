class Upgradeable {
  constructor(maxLvl, cost, upgradeRates, name) {
    this._currentLevel = 0;
    this._maxLevel = maxLvl;
    this.upgradeCost = cost;
    this._upgradeLevelRate = upgradeRates; //Length should always be this.maxLevel + 1: Value by which to improve upgrade at given level, including default value
    this._name = name;
  }

  get currentLevel() {
    return this._currentLevel;
  }
  set currentLevel(lvl) {
    this._currentLevel = lvl;
  }

  get maxLevel() {
    return this._maxLevel;
  }

  get upgradeCost() {
    return this._upgradeCost;
  }
  set upgradeCost(val) {
    this._upgradeCost = val;
  }

  get upgradeLevelRate() {
    return this._upgradeLevelRate;
  }

  get name() {
    return this._name;
  }

  upgrade() {
    throw new Error('error: this method to be implemented by subclass');
  }

  downgrade() {
    throw new Error('error: this method to be implemented by subclass');
  }

  reset() {
    throw new Error('error: this method to be implemented by subclass');
  }
}

export class FireRate extends Upgradeable {
  constructor(maxLvl, cost, upgradeRates, name) {
    super(maxLvl, cost, upgradeRates, name);
    this._fireRate = upgradeRates[0];
  }

  get fireRate() {
    return this._fireRate;
  }

  upgrade(user) {
    if (this.currentLevel < this.maxLevel) {
      if (user.verifyTransaction(this._upgradeCost)) {
        //console.log('In upgrade current level is ' + this.currentLevel + ' and maxLevel is ' + this.maxLevel);
        //console.log('upgrading player fire rate');
        this.currentLevel++;
        this._fireRate = this.upgradeLevelRate[this.currentLevel];
      }
    } else {
      console.log('Max upgrade already achieved');
    }
  }

  downgrade() {
    if (this.currentLevel != 0) {
      this.currentLevel--;
      this._fireRate = this.upgradeLevelRate[this.currentLevel];
    } else {
      console.log('Error, cannot downgrade past level 0;');
    }
  }

  reset() {
    this.currentLevel = 0;
    this._fireRate = this.upgradeLevelRate[this.currentLevel];
  }
}

class missiles extends Upgradeable {}

export class MaxBoost extends Upgradeable {
  constructor(maxLvl, cost, upgradeRates, name) {
    super(maxLvl, cost, upgradeRates, name);
    this._maxBoost = upgradeRates[0];
  }

  get maxBoost() {
    return this._maxBoost;
  }

  upgrade(user) {
    if (this.currentLevel < this.maxLevel) {
      if (user.verifyTransaction(this._upgradeCost)) {
        this.currentLevel++;
        this._maxBoost = this.upgradeLevelRate[this.currentLevel];
      }
    } else {
      console.log('Max upgrade already achieved');
    }
  }

  downgrade() {
    if (this.currentLevel != 0) {
      this.currentLevel--;
      this._maxBoost = this.upgradeLevelRate[this.currentLevel];
    } else {
      console.log('Error, cannot downgrade past level 0;');
    }
  }

  reset() {
    this.currentLevel = 0;
    this._maxBoost = this.upgradeLevelRate[this.currentLevel];
  }
}

export class TurnRate extends Upgradeable {
  constructor(maxLvl, cost, upgradeRates, name) {
    super(maxLvl, cost, upgradeRates, name);
    this._turnRate = upgradeRates[0];
  }

  get turnRate() {
    return this._turnRate;
  }

  upgrade(user) {
    if (this.currentLevel < this.maxLevel) {
      if (user.verifyTransaction(this._upgradeCost)) {
        this.currentLevel++;
        this._turnRate = this.upgradeLevelRate[this.currentLevel];
      }
    } else {
      console.log('Max upgrade already achieved');
    }
  }

  downgrade() {
    if (this.currentLevel != 0) {
      this.currentLevel--;
      this._turnRate = this.upgradeLevelRate[this.currentLevel];
    } else {
      console.log('Error, cannot downgrade past level 0;');
    }
  }

  reset() {
    this.currentLevel = 0;
    this._turnRate = this.upgradeLevelRate[this.currentLevel];
  }
}
