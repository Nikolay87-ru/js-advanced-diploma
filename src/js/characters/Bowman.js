import Character from '../Character.js';

export default class Bowman extends Character {
  constructor(level) {
    super(level);
    this.attack = '15-25';
    this.defence = 25;
    this.type = 'bowman';
    this.moveDistance = 3;
    this.attackDistance = 3;
    
    this.actions = {
      attack: () => {
        const damage = Math.floor(Math.random() * 11) + 15;
        const isCritical = Math.random() < 0.15;
        return {
          damage: isCritical ? damage * 1.5 : damage,
          cost: 1,
          isCritical
        };
      },
      hardAttack: () => {
        const damage = Math.floor(Math.random() * 11) + 20;
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

    this.moveCost = {
      straight: 1,
      diagonal: 2
    };
  }
}
