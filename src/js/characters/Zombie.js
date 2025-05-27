import Character from '../Character.js';

export default class Zombie extends Character {
  constructor(level) {
    super(level);
    this.attack = '10-15';
    this.defence = 5;
    this.type = 'zombie';
    this.moveDistance = 1;
    this.attackDistance = 1;

    this.actions = {
      attack: () => {
        const damage = Math.floor(Math.random() * 11) + 10;
        return {
          damage: damage,
          cost: 1,
        };
      }
    };
  }
}