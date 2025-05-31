import GameState from './GameState.js';

export default class GameStateService {
  constructor(storage) {
    this.storage = storage;
  }

  save(state) {
    const gameState = {
      currentTurn: state.currentTurn,
      maxScore: state.maxScore
    };
    this.storage.setItem('state', JSON.stringify(gameState));
  }

  load() {
    try {
      const data = JSON.parse(this.storage.getItem('state'));
      return new GameState(data.currentTurn, data.maxScore || 0);
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      throw new Error('Invalid state');
    }
  }
}