import Character from '../Character.js';

export default class Magician extends Character {
  constructor(level) {
    super(level);
    this.attack = '10-20';
    this.defence = 40;
    this.type = 'magician';
    this.moveDistance = 1;
    this.attackDistance = 2;

    this.actions = {
      attack: () => {
        const damage = Math.floor(Math.random() * 11) + 10;
        const isCritical = Math.random() < 0.15;
        return {
          damage: isCritical ? damage * 1.5 : damage,
          cost: 1,
          isCritical
        };
      },
      hardAttack: () => {
        const damage = Math.floor(Math.random() * 11) + 15;
        const isCritical = Math.random() < 0.1;
        return {
          damage: isCritical ? damage * 2 : damage,
          cost: 2,
          isCritical
        };
      },
      defence: () => ({
        defence: this.defence * 2
      })
    };
  }
}
