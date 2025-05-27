import themes from './themes.js';
import { PositionedCharacter } from './PositionedCharacter.js';
import { generateTeam } from './generators.js';
import GameState from './GameState.js';
import Bowman from './characters/Bowman.js';
import Swordsman from './characters/Swordsman.js';
import Magician from './characters/Magician.js';
import Daemon from './characters/Daemon.js';
import Undead from './characters/Undead.js';
import Vampire from './characters/Vampire.js';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.playerTypes = [Bowman, Swordsman, Magician];
    this.enemyTypes = [Daemon, Undead, Vampire];

    this.maxLevel = 4;
    this.maxCharacters = 3;
    this.characterCount = 2;

    this.playerTeam = [];
    this.enemyTeam = [];
    this.positionedPlayerCharacters = [];
    this.positionedEnemyCharacters = [];

    this.gameState = new GameState();
    this.selectedCharacter = null;
    this.selectedCellIndex = null;
    this.isCharacterSelected = false;

    this.movingCharacter = null;
    this.movingPath = [];
  }

  init() {
    try {
      this.gamePlay.drawUi(themes.prairie);
      this.generateTeams();
      this.redrawTeams();
      this.setupEventListeners();
    } catch (error) {
      this.gamePlay.showError(error.message);
    }
    this.updateTurnIndicator();
    this.resetCharactersActionPoints();
  }

  resetCharactersActionPoints() {
    this.playerTeam.characters.forEach((c) => c.resetActionPoints());
    this.enemyTeam.characters.forEach((c) => c.resetActionPoints());
  }

  generateTeams() {
    const actualCount = Math.min(this.characterCount, this.maxCharacters);
    this.playerTeam = generateTeam(this.playerTypes, this.maxLevel, actualCount);
    this.enemyTeam = generateTeam(this.enemyTypes, this.maxLevel, actualCount);

    this.positionedPlayerCharacters = this.positionCharacters(
      this.playerTeam.characters,
      [0, 1]
    );
    this.positionedEnemyCharacters = this.positionCharacters(
      this.enemyTeam.characters,
      [6, 7]
    );
  }

  positionCharacters(characters, allowedColumns) {
    const boardSize = this.gamePlay.boardSize;
    const usedPositions = new Set();
    const maxPossible = boardSize * allowedColumns.length;

    if (characters.length > maxPossible) {
      throw new Error(`Недостаточно места для ${characters.length} персонажей`);
    }

    return characters.map((character) => {
      const availablePositions = allowedColumns
        .flatMap((col) =>
          Array.from({ length: boardSize }, (_, row) => row * boardSize + col)
        )
        .filter((pos) => !usedPositions.has(pos));

      const position = availablePositions[Math.floor(Math.random() * availablePositions.length)];
      usedPositions.add(position);

      return new PositionedCharacter(character, position);
    });
  }

  redrawTeams() {
    const allPositionedCharacters = [
      ...this.positionedPlayerCharacters,
      ...this.positionedEnemyCharacters,
    ];
    this.gamePlay.redrawPositions(allPositionedCharacters);
  }

  setupEventListeners() {
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
  }

  updateTurnIndicator() {
    const turnElement = document.getElementById('current-turn');
    if (!turnElement) return;

    if (this.gameState.currentTurn === 'player') {
      turnElement.textContent = 'Ваш ход';
      turnElement.className = 'player-turn';
    } else {
      turnElement.textContent = 'Ход противника';
      turnElement.className = 'enemy-turn';
    }
  }

  onCellClick(index) {
    const allChars = [...this.positionedPlayerCharacters, ...this.positionedEnemyCharacters];
    const clickedChar = this.gamePlay.findCharacterByPosition(allChars, index);

    if (clickedChar && this.playerTeam.characters.includes(clickedChar)) {
      this.selectCharacter(clickedChar, index);
      return;
    }

    if (this.isCharacterSelected && clickedChar && this.enemyTeam.characters.includes(clickedChar)) {
      this.showAttackMenu(this.selectedCharacter, clickedChar, index);
      return;
    }

    if (this.isCharacterSelected && !clickedChar) {
      this.moveCharacter(this.selectedCharacter, index);
    }
  }

  selectCharacter(character, position) {
    this.gamePlay.deselectAllCells();
    this.gamePlay.hideActionMenu();

    this.selectedCharacter = character;
    this.selectedCellIndex = position;
    this.isCharacterSelected = true;
    
    this.gamePlay.selectCell(position, 'yellow');
    this.updateAvailableActions();
  }

  updateAvailableActions() {
    if (!this.selectedCharacter) return;

    this.showPossibleActions();
    this.updateActionPointsDisplay();
    this.showDefenceButton(this.selectedCellIndex);
  }

  async moveCharacter(character, toIndex) {
    if (!this.isCharacterSelected) return false;

    const path = this.calculatePath(
      this.selectedCellIndex, 
      toIndex,
      Math.min(character.moveDistance, character.currentActionPoints)
    );

    if (!path?.length) return false;

    this.movingCharacter = character;
    this.movingPath = path;

    await this.animateMovement();

    this.positionedPlayerCharacters = this.positionedPlayerCharacters.map(pc => 
      pc.character === character ? new PositionedCharacter(character, toIndex) : pc
    );

    character.currentActionPoints -= (path.length - 1);
    this.selectedCellIndex = toIndex;

    this.redrawTeams();
    this.updateAvailableActions();

    if (this.checkTurnEnd()) {
      this.switchTurn();
    }

    return true;
  }

  calculatePath(fromIndex, toIndex, maxDistance) {
    const boardSize = this.gamePlay.boardSize;
    const fromRow = Math.floor(fromIndex / boardSize);
    const fromCol = fromIndex % boardSize;
    const toRow = Math.floor(toIndex / boardSize);
    const toCol = toIndex % boardSize;

    const path = [fromIndex];
    let currentRow = fromRow;
    let currentCol = fromCol;

    while (currentRow !== toRow || currentCol !== toCol) {
      const rowStep = currentRow < toRow ? 1 : currentRow > toRow ? -1 : 0;
      const colStep = currentCol < toCol ? 1 : currentCol > toCol ? -1 : 0;
      
      currentRow += rowStep;
      currentCol += colStep;

      const nextIndex = currentRow * boardSize + currentCol;
      const allChars = [...this.positionedPlayerCharacters, ...this.positionedEnemyCharacters];
      const charAtPos = this.gamePlay.findCharacterByPosition(allChars, nextIndex);
      
      if (charAtPos) break;
      path.push(nextIndex);
      if (path.length > maxDistance) break;
    }

    return path;
  }

  async animateMovement() {
    if (!this.movingPath.length) return;

    const character = this.movingCharacter;
    const originalType = character.type;
    character.type = 'generic';

    for (let i = 1; i < this.movingPath.length; i++) {
      const toIndex = this.movingPath[i];
      this.positionedPlayerCharacters = this.positionedPlayerCharacters.map(pc => 
        pc.character === character ? new PositionedCharacter(character, toIndex) : pc
      );

      this.redrawTeams();
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    character.type = originalType;
    this.movingCharacter = null;
    this.movingPath = [];
  }

  showAttackMenu(attacker, target, targetIndex) {
    const menuItems = [];
    
    if (attacker.currentActionPoints >= 1) {
      menuItems.push({
        text: `Атака (1 очко)`,
        action: () => this.performAttack(attacker, target, targetIndex, 'attack')
      });
    }
    
    if (attacker.currentActionPoints >= 2) {
      menuItems.push({
        text: `Сильная атака (2 очка)`,
        action: () => this.performAttack(attacker, target, targetIndex, 'hardAttack')
      });
    }
    
    this.gamePlay.showActionMenu(targetIndex, menuItems, 'attack');
  }

  showDefenceButton(position) {
    if (!this.selectedCharacter?.currentActionPoints) return;
    
    const menuItems = [{
      text: `Защита (${this.selectedCharacter.currentActionPoints} очков)`,
      action: () => this.performDefence(this.selectedCharacter)
    }];
    
    this.gamePlay.showActionMenu(position, menuItems, 'defence');
  }

  getPossibleMoves(position, distance) {
    const boardSize = this.gamePlay.boardSize;
    const moves = [];

    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const idx = row * boardSize + col;
        const rowDiff = Math.abs(Math.floor(position / boardSize) - row);
        const colDiff = Math.abs((position % boardSize) - col);

        if (rowDiff + colDiff <= distance && idx !== position) {
          const allChars = [...this.positionedPlayerCharacters, ...this.positionedEnemyCharacters];
          if (!this.gamePlay.findCharacterByPosition(allChars, idx)) {
            moves.push(idx);
          }
        }
      }
    }

    return moves;
  }

  getPossibleAttacks(position, distance) {
    const boardSize = this.gamePlay.boardSize;
    const attacks = [];
    const currentTeam = this.gameState.currentTurn === 'player' 
      ? this.positionedEnemyCharacters 
      : this.positionedPlayerCharacters;

    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const idx = row * boardSize + col;
        const rowDiff = Math.abs(Math.floor(position / boardSize) - row);
        const colDiff = Math.abs((position % boardSize) - col);

        if (rowDiff <= distance && colDiff <= distance && idx !== position) {
          if (this.gamePlay.findCharacterByPosition(currentTeam, idx)) {
            attacks.push(idx);
          }
        }
      }
    }

    return attacks;
  }

  showPossibleActions() {
    if (!this.selectedCharacter) return;

    this.gamePlay.deselectAllCells();
    const position = this.gamePlay.findPositionByCharacter(
      this.positionedPlayerCharacters,
      this.selectedCharacter
    );
    if (position === null) return;

    this.gamePlay.selectCell(position, 'yellow');

    const maxDistance = Math.min(
      this.selectedCharacter.moveDistance,
      this.selectedCharacter.currentActionPoints
    );

    if (maxDistance > 0) {
      this.getPossibleMoves(position, maxDistance)
        .forEach(idx => this.gamePlay.selectCell(idx, 'green'));
    }

    this.getPossibleAttacks(position, this.selectedCharacter.attackDistance)
      .forEach(idx => this.gamePlay.selectCell(idx, 'red'));
  }

  performAttack(attacker, target, targetIndex, attackType) {
    const cost = attackType === 'attack' ? 1 : 2;
    if (attacker.currentActionPoints < cost) return;

    const attack = attacker.actions[attackType]();
    const isCritical = Math.random() < (attackType === 'attack' ? 0.15 : 0.1);
    const damage = Math.round(attack.damage * (isCritical ? 1.5 : 1));

    this.gamePlay.showDamage(
      targetIndex, 
      isCritical ? `Крит: ${damage}!` : damage
    );

    target.health -= damage;
    attacker.currentActionPoints -= cost;

    this.gamePlay.hideActionMenu();
    this.redrawTeams();
    this.updateAvailableActions();

    if (target.health <= 0) {
      this.positionedEnemyCharacters = this.positionedEnemyCharacters.filter(
        pc => pc.character !== target
      );
      this.gamePlay.showMessage(`${target.type} побежден!`);
    }

    if (this.checkTurnEnd()) {
      this.switchTurn();
    }
  }

  performDefence(character) {
    const defenceBonus = character.currentActionPoints * 0.5;
    character.defence += defenceBonus;
    character.currentActionPoints = 0;

    this.gamePlay.showMessage(
      `${character.type} усилил защиту на ${defenceBonus.toFixed(1)}!`
    );
    this.gamePlay.hideActionMenu();
    this.redrawTeams();
    this.updateAvailableActions();

    if (this.checkTurnEnd()) {
      this.switchTurn();
    }
  }

  updateActionPointsDisplay() {
    const actionPointsElement = document.getElementById('action-points');
    if (!actionPointsElement) return;

    let html = '<h3>Очки действий:</h3>';
    this.playerTeam.characters.forEach(char => {
      html += `<p>${char.type}: ${char.currentActionPoints}/${char.actionPoints}</p>`;
    });

    actionPointsElement.innerHTML = html;
  }

  checkTurnEnd() {
    return this.playerTeam.characters.every(c => c.currentActionPoints <= 0);
  }

  switchTurn() {
    this.gamePlay.deselectAllCells();
    this.gamePlay.hideActionMenu();

    if (this.gameState.currentTurn === 'player') {
      this.enemyTeam.characters.forEach(c => c.resetActionPoints());
    } else {
      this.playerTeam.characters.forEach(c => c.resetActionPoints());
    }

    this.gameState.currentTurn = this.gameState.currentTurn === 'player' ? 'enemy' : 'player';
    this.updateTurnIndicator();

    if (this.gameState.currentTurn === 'enemy') {
      this.makeEnemyMove();
    }
  }
}