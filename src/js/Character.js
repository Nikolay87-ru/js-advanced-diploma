export default class Character {
  constructor(level, type = "generic") {
    this.level = level;
    this.health = 100;
    this.maxHealth = 100;
    this.type = type;
    this.moveDistance = 1;
    this.attackDistance = 1;
    this.actionPoints = 4;
    this.currentActionPoints = 4;
    this.team = 'player'; 
    this.isDead = false;
    this.deathTimer = 0;
    this.resurrectionCount = 0;
    
    this.actions = {
      attack: () => ({ damage: 10, cost: 1 }),
      hardAttack: () => ({ damage: 15, cost: 2 }),
      defence: () => ({ defence: this.defence * 2, cost: this.currentActionPoints }),
      resurrect: () => ({ health: this.maxHealth / 2, cost: 2 })
    };
    
    this.moveCost = {
      straight: 1,
      diagonal: 1 
    };
  }

  calculateDistance(pos1, pos2) {
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    return Math.max(dx, dy);
  }

  canAttack(targetPosition) {
    return this.calculateDistance(this.position, targetPosition) <= this.attackDistance;
  }

  getMoveCost(fromIndex, toIndex, boardSize) {
    const fromRow = Math.floor(fromIndex / boardSize);
    const fromCol = fromIndex % boardSize;
    const toRow = Math.floor(toIndex / boardSize);
    const toCol = toIndex % boardSize;
    
    const isDiagonal = (fromRow !== toRow) && (fromCol !== toCol);
    return isDiagonal ? this.moveCost.diagonal : this.moveCost.straight;
  }

  resetActionPoints() {
    this.currentActionPoints = this.actionPoints;
  }

  takeDamage(damage) {
    this.health -= damage;
    if (this.health <= 0) {
      this.die();
    }
    return this.health;
  }

  die() {
    this.isDead = true;
    this.deathTimer = 3;
    this.health = 0;
  }

  resurrect() {
    if (this.isDead && this.deathTimer > 0) {
      this.isDead = false;
      this.health = this.maxHealth / 2;
      this.deathTimer = 0;
      return true;
    }
    return false;
  }

  updateDeathTimer() {
    if (this.isDead && this.deathTimer > 0) {
      this.deathTimer--;
      if (this.deathTimer === 0) {
        return false; 
      }
      return true; 
    }
    return false;
  }
}
