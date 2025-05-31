export default class Character {
  constructor(level, type = "generic") {
    if (typeof level !== 'number' || level < 1) {
      throw new Error('Level must be a positive number');
    }
    this.level = level;
    this.health = 50;
    this.maxHealth = 100;
    this.type = type;
    this.moveDistance = 1;
    this.attackDistance = 1;
    this.actionPoints = 4;
    this.currentActionPoints = 4;
    this.team = 'player'; 
    this.isDead = false;

    for (let i = 1; i < level; i++) {
      this.levelUp();
    }
    
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

  levelUp() {
    this.level++;
    const newHealth = this.health + 80;
    this.health = Math.min(newHealth, this.maxHealth);
    
    const healthPercentage = this.health / this.maxHealth * 100;
    const improvementFactor = (80 + healthPercentage) / 100;
    
    if (typeof this.attack === 'number') {
      this.attack = Math.max(this.attack, Math.round(this.attack * improvementFactor));
    }
    
    if (typeof this.defence === 'number') {
      this.defence = Math.max(this.defence, Math.round(this.defence * improvementFactor));
    }
    
    this.resetActionPoints();
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
    this.health = 0;
    this.currentActionPoints = 0; 
  }
}
