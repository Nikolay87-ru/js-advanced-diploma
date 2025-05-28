import Character from '../Character.js';

export default class Magician extends Character {
  constructor(level) {
    super(level);
    this.attack = '10-20';
    this.defence = 40;
    this.type = 'magician';
    this.moveDistance = 2;
    this.attackDistance = 4;

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
      defence: () => ({
        defence: this.defence * 2
      })
    };

    this.actions.resurrect = () => ({
      healthRestored: this.maxHealth / 2,
      cost: 2
    });

    this.moveCost = {
      straight: 2,
      diagonal: 3
    };
  }
}
