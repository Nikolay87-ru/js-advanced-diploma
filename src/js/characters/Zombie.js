import Character from '../Character.js';

export default class Vampire extends Character {
  constructor(level) {
    super(level);
    this.attack = 5;
    this.defence = 5;
    this.type = 'zombie';
  }
}