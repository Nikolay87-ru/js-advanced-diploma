import themes from './themes.js';
import { PositionedCharacter } from './PositionedCharacter.js';
import { generateTeam } from './generators.js';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.playerTeam = [];
    this.enemyTeam = [];
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(themes.prairie);
    this.generateTeams();
    this.redrawTeams();
  }

  generateTeams() {
    this.playerTeam = generateTeam(this.playerTypes, this.maxLevel, this.characterCount);
    this.positionedPlayerCharacters = this.positionCharacters(this.playerTeam.characters, [0, 1]);
    
    this.enemyTeam = generateTeam(this.enemyTypes, this.maxLevel, this.characterCount);
    this.positionedEnemyCharacters = this.positionCharacters(this.enemyTeam.characters, [6, 7]);
  }

  

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}