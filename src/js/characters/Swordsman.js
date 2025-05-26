import Character from '../Character.js';

export default class Swordsman extends Character {
  constructor(level) {
    super(level);
    this.attack = 40;
    this.defence = 10;
    this.type = 'swordsman';
    this.moveDistance = 4;
    this.attackDistance = 1;
  }
}