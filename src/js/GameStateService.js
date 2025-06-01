import GameState from './GameState.js';

export default class GameStateService {
  constructor(storage, gamePlay) {
    this.storage = storage;
    this.gamePlay = gamePlay;
  }

  save(state) {
    try {
      const gameState = new GameState(
        state.currentTurn,
        state.maxScore,
        state.currentLevel,
        state.playerTeam,
        state.enemyTeam,
        state.positionedPlayerCharacters,
        state.positionedEnemyCharacters
      ).serialize();
      
      this.storage.setItem('state', JSON.stringify(gameState));
      this.gamePlay.showMessage('Игра сохранена');
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      this.gamePlay.showError('Не удалось сохранить игру');
    }
  }

  load() {
    try {
      const data = JSON.parse(this.storage.getItem('state'));
      if (!data) throw new Error('Нет сохраненных данных');
      
      console.log('Loaded data:', JSON.parse(JSON.stringify(data)));
      
      this.gamePlay.showMessage('Игра загружена');
      return GameState.from(data);
    } catch (error) {
      console.error('Load error:', error);
      this.gamePlay.showError('Не удалось загрузить игру');
      throw error;
    }
  }
}