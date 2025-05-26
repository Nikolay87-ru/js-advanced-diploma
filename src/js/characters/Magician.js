import Character from '../Character.js';

export default class Magician extends Character {
  constructor(level) {
    super(level);
    this.attack = 10;
    this.defence = 40;
    this.type = 'magician';
    this.moveDistance = 1;
    this.attackDistance = 2;
  }
}
