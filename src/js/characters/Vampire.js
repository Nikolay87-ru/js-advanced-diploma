import Character from '../Character.js';

export default class Vampire extends Character {
  constructor(level) {
    super(level);
    this.attack = '15-25';
    this.defence = 25;
    this.type = 'vampire';
    this.moveDistance = 2;
    this.attackDistance = 2;

    this.actions = {
      attack: () => {
        const damage = Math.floor(Math.random() * 11) + 10;
        const isCritical = Math.random() < 0.15;
        return {
          damage: isCritical ? damage * 1.5 : damage,
          cost: 1,
          isCritical,
        };
      }
    };
  }
}
