import Character from '../Character.js';

export default class Zombie extends Character {
  constructor(level) {
    super(level);
    this.attack = 5;
    this.defence = 5;
    this.type = 'zombie';
    this.moveDistance = 1;
    this.attackDistance = 1;
  }
}