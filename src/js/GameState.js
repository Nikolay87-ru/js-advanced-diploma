import Character from "./Character.js";
import { PositionedCharacter } from "./PositionedCharacter.js";

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
    const safeSerialize = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(item => safeSerialize(item));
      }
      if (obj instanceof PositionedCharacter) {
        return {
          character: safeSerialize(obj.character),
          position: obj.position
        };
      }
      if (obj instanceof Character) {
        const serialized = {};
        Object.keys(obj).forEach(key => {
          if (typeof obj[key] !== 'function' && key !== 'actions' && key !== 'moveCost') {
            serialized[key] = obj[key];
          }
        });
        return serialized;
      }
      return obj;
    };
    
    return safeSerialize({
      currentTurn: this.currentTurn,
      maxScore: this.maxScore,
      currentLevel: this.currentLevel,
      playerTeam: this.playerTeam,
      enemyTeam: this.enemyTeam,
      positionedPlayerCharacters: this.positionedPlayerCharacters,
      positionedEnemyCharacters: this.positionedEnemyCharacters
    });
  }
}