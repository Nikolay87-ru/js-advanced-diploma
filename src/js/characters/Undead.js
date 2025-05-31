import Character from '../Character.js';

export default class Undead extends Character {
  constructor(level) {
    super(level);
    this.attack = '30-40';
    this.defence = 10;
    this.type = 'undead';
    this.moveDistance = 4;
    this.attackDistance = 2;

    this.actions = {
      attack: () => {
        const damage = Math.floor(Math.random() * 11) + 30;
        const isCritical = Math.random() < 0.15;
        return {
          damage: isCritical ? damage * 1.5 : damage,
          cost: 1,
          isCritical
        };
      }
    };
  }
}