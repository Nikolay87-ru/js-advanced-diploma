import Character from '../Character.js';

export default class Daemon extends Character {
  constructor(level) {
    super(level);
    this.attack = '10-20';
    this.defence = 40;
    this.type = 'daemon';
    this.moveDistance = 2;
    this.attackDistance = 2;
    this.team = 'enemy';

    this.actions = {
      attack: () => {
        const damage = Math.floor(Math.random() * 11) + 20;
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