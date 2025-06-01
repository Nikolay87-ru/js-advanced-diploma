export default class GameState {
  static from(object) {
    return new GameState(
      object.currentTurn,
      object.maxScore,
      object.currentLevel,
      object.playerTeam,
      object.enemyTeam,
      object.positionedPlayerCharacters,
      object.positionedEnemyCharacters
    );
  }

  constructor(
    currentTurn = 'player',
    maxScore = 0,
    currentLevel = 1,
    playerTeam = null,
    enemyTeam = null,
    positionedPlayerCharacters = [],
    positionedEnemyCharacters = []
  ) {
    this.currentTurn = currentTurn;
    this.maxScore = maxScore;
    this.currentLevel = currentLevel;
    this.playerTeam = playerTeam;
    this.enemyTeam = enemyTeam;
    this.positionedPlayerCharacters = positionedPlayerCharacters;
    this.positionedEnemyCharacters = positionedEnemyCharacters;
  }

  serialize() {
    return {
      currentTurn: this.currentTurn,
      maxScore: this.maxScore,
      currentLevel: this.currentLevel,
      playerTeam: this.playerTeam,
      enemyTeam: this.enemyTeam,
      positionedPlayerCharacters: this.positionedPlayerCharacters,
      positionedEnemyCharacters: this.positionedEnemyCharacters
    };
  }
}