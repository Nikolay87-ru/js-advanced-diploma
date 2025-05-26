import Character from '../Character.js';

export default class Bowman extends Character {
  constructor(level) {
    super(level);
    this.attack = 25;
    this.defence = 25;
    this.type = 'bowman';
    this.moveDistance = 2;
    this.attackDistance = 4;
  }
}