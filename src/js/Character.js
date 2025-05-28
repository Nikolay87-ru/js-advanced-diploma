/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */
export default class Character {
  constructor(level, type = "generic") {
    this.level = level;
    this.health = 100;
    this.type = type;
    this.moveDistance = 1;
    this.attackDistance = 1;
    this.actionPoints = 4; // Очки действий на ход
    this.currentActionPoints = 4;
    this.actions = {
      attack: () => ({ damage: 10, cost: 1 }),
      hardAttack: () => ({ damage: 15, cost: 2 }),
      defence: () => ({ defence: this.defence * 2, cost: this.currentActionPoints })
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
}
