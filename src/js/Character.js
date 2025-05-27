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
  }

  resetActionPoints() {
    this.currentActionPoints = this.actionPoints;
  }
}
