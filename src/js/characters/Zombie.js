import Character from '../Character';

export default class Zombie extends Character {
  constructor(level) {
    super(level);
    this.attack = 5;
    this.defence = 5;
    this.type = 'zombie';
  }
}