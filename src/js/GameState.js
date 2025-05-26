export default class GameState {
  static from(object) {
    return new GameState(object.currentTurn);
  }

  constructor(currentTurn = 'player') {
    this.currentTurn = currentTurn; 
  }
}