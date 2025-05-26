import Character from '../Character.js';

export default class Vampire extends Character {
  constructor(level) {
    super(level);
    this.attack = 25;
    this.defence = 25;
    this.type = 'vampire';
    this.moveDistance = 2;
    this.attackDistance = 2;
  }
}