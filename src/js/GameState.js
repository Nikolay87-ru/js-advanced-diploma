export default class GameState {
  static from(object) {
    return new GameState(object.currentTurn, object.maxScore);
  }

  constructor(currentTurn = 'player', maxScore = 0) {
    this.currentTurn = currentTurn;
    this.maxScore = maxScore;
  }
}