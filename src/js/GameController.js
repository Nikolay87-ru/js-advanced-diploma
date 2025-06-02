import { PositionedCharacter } from './PositionedCharacter.js';
import { generateTeam } from './generators.js';
import GameStateService from './GameStateService.js';
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
    this.stateService = stateService || new GameStateService(localStorage, this.gamePlay);
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

    this.currentLevel = 1;
    this.maxLevel = 4;
    this.themes = ['prairie', 'desert', 'arctic', 'mountain'];
    this.maxScore = 0;

    // this.stateService = new GameStateService(localStorage, this.gamePlay);
  }

  async checkWinConditions() {
    const allEnemiesDead = this.positionedEnemyCharacters.every(
      (pc) => pc.character.isDead || pc.character.health <= 0
    );

    const allPlayersDead = this.positionedPlayerCharacters.every(
      (pc) => pc.character.isDead || pc.character.health <= 0
    );

    if (allEnemiesDead) {
      const score = this.calculateScore();
      this.maxScore = Math.max(this.maxScore, score);
      
      if (this.currentLevel < this.maxLevel) {
        await this.nextLevel();
      } else {
        this.gamePlay.showMessage(`Поздравляем! Вы прошли все уровни! Максимальный счет: ${this.maxScore}`);
        this.lockGame();
      }
      return true;
    }

    if (allPlayersDead) {
      this.gamePlay.showMessage(`Игра окончена. Вы проиграли. Максимальный счет: ${this.maxScore}`);
      this.lockGame();
      return true;
    }

    return false;
  }

  async nextLevel() {
    this.currentLevel++;
    const theme = this.themes[this.currentLevel - 1];
    
    this.increaseScore(100);
    
    this.playerTeam.characters
      .filter(c => !c.isDead)
      .forEach(c => {
        const newHealth = c.level + 80;
        c.health = Math.min(newHealth, c.maxHealth);
        
        const healthPercentage = (c.health / c.maxHealth) * 100;
        if (healthPercentage > 50) {
          c.defence = Math.round(c.defence * 1.1); 
        } else if (healthPercentage > 30) {
          c.defence = Math.round(c.defence * 1.05); 
        }
        
        c.levelUp();
      });
      
    this.gamePlay.showMessage(`Уровень ${this.currentLevel}! Тема: ${theme}`);
    this.gamePlay.drawUi(theme);
    this.generateTeams();
    this.redrawTeams();
    this.resetCharactersActionPoints();
    this.updateTurnIndicator();
    this.updateStats();
  }

  calculateScore() {
    return this.playerTeam.characters.reduce((score, char) => {
      return score + char.level * 10 + char.health;
    }, 0);
  }

  increaseScore(points) {
    this.maxScore += points;
    this.updateStats();
  }

  lockGame() {
    this.gamePlay.deselectAllCells();
    this.gamePlay.hideActionMenu();
    this.isGameLocked = true;
  }

  updateStats() {
    this.gamePlay.updateStats(this.currentLevel, this.maxScore);
  }

  saveGame() {
    try {
      const gameState = new GameState(
        this.gameState.currentTurn,
        this.maxScore,
        this.currentLevel,
        this.playerTeam,
        this.enemyTeam,
        this.positionedPlayerCharacters,
        this.positionedEnemyCharacters
      );
      this.stateService.save(gameState);
    } catch (error) {
      this.gamePlay.showError('Ошибка при сохранении игры');
      console.error('Save error:', error);
    }
  }
  
  async loadGame() {
    this.isGameLocked = false;
    try {
      const loadedState = this.stateService.load();
      
      const restoreTeam = (team, types) => {
        if (!team || !team.characters) return team;
        team.characters = team.characters.map(charData => {
          const CharClass = types.find(t => t.name.toLowerCase() === charData.type);
          if (!CharClass) return charData;
          
          const character = new CharClass(charData.level);
          
          Object.keys(charData).forEach(key => {
            if (key !== 'actions' && key !== 'moveCost') {
              character[key] = charData[key];
            }
          });
          
          return character;
        });
        return team;
      };

      const restoreActionsAndMoveCost = (character) => {
        const CharClass = [...this.playerTypes, ...this.enemyTypes].find(
          t => t.name.toLowerCase() === character.type
        );
        if (CharClass) {
          const tempChar = new CharClass(character.level);
          character.actions = {...tempChar.actions};
          character.moveCost = {...tempChar.moveCost};
        }
      };
  
      this.maxScore = loadedState.maxScore;
      this.currentLevel = loadedState.currentLevel;
      this.gameState.currentTurn = loadedState.currentTurn;
      
      this.playerTeam = restoreTeam(loadedState.playerTeam, this.playerTypes);
      this.enemyTeam = restoreTeam(loadedState.enemyTeam, this.enemyTypes);

      [...this.playerTeam.characters, ...this.enemyTeam.characters].forEach(
        restoreActionsAndMoveCost
      );
      
      const restorePositioned = (team, positioned) => {
        return positioned.map(pc => {
          const char = team?.characters?.find(c => 
            c.type === pc.character.type && 
            c.level === pc.character.level
          ) || pc.character;
          return new PositionedCharacter(char, pc.position);
        });
      };
  
      this.positionedPlayerCharacters = restorePositioned(
        this.playerTeam, 
        loadedState.positionedPlayerCharacters
      );
      this.positionedEnemyCharacters = restorePositioned(
        this.enemyTeam,
        loadedState.positionedEnemyCharacters
      );
  
      const theme = this.themes[this.currentLevel - 1];
      this.gamePlay.drawUi(theme);
      
      this.setupEventListeners();
      this.gamePlay.addNewGameListener(() => this.newGame());
      this.gamePlay.addSaveGameListener(() => this.saveGame());
      this.gamePlay.addLoadGameListener(() => this.loadGame());
      
      this.redrawTeams();
      this.updateTurnIndicator();
      this.updateStats();
      this.resetCharactersActionPoints();
      
      console.log('Game loaded successfully:', {
        playerTeam: this.playerTeam,
        enemyTeam: this.enemyTeam,
        positionedChars: this.positionedPlayerCharacters
      });
    } catch (error) {
      console.error('Load error:', error);
      this.gamePlay.showError('Не удалось загрузить игру');
      this.newGame();
    }
  }

  init() {
    try {
      const theme = this.themes[this.currentLevel - 1];
      this.gamePlay.drawUi(theme);
      this.generateTeams();
      this.redrawTeams();
      this.setupEventListeners();
      
      this.gamePlay.addNewGameListener(() => this.newGame());
      this.gamePlay.addSaveGameListener(() => this.saveGame());
      this.gamePlay.addLoadGameListener(() => this.loadGame());
  
      this.gamePlay.setCursor = (cursorType) => {
        this.gamePlay.boardEl.style.cursor = cursorType;
      };
      this.gamePlay.setCursor('default');
    } catch (error) {
      this.gamePlay.showError(error.message);
    }
    this.updateTurnIndicator();
    this.resetCharactersActionPoints();
    this.updateStats();
  }

  newGame() {
    this.currentLevel = 1;
    this.isGameLocked = false;
    const theme = this.themes[this.currentLevel - 1];
    this.gamePlay.drawUi(theme);
    this.generateTeams();
    this.redrawTeams();
    this.resetCharactersActionPoints();
    this.updateTurnIndicator();
    this.updateStats();
  }

  resetCharactersActionPoints() {
    this.playerTeam.characters.forEach((c) => {
      if (!c.isDead) c.resetActionPoints();
    });
    this.enemyTeam.characters.forEach((c) => {
      if (!c.isDead) c.resetActionPoints();
    });
  }

  generateTeams() {
    const actualCount = Math.min(this.characterCount, this.maxCharacters);
    this.playerTeam = generateTeam(
      this.playerTypes,
      this.maxLevel,
      actualCount
    );
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

      const position =
        availablePositions[
          Math.floor(Math.random() * availablePositions.length)
        ];
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
    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellEnterListeners = [];
    this.gamePlay.cellLeaveListeners = [];

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
    if (this.isGameLocked) {
      console.warn('Game is locked!');
      return;
    }
    
    const allChars = this.getAllCharacters();
    const clickedChar = this.gamePlay.findCharacterByPosition(allChars, index);
    
    if (!clickedChar) {
      console.log('No character at position', index);
    } else {
      console.log('Clicked character:', {
        type: clickedChar.type,
        team: clickedChar.team,
        isDead: clickedChar.isDead,
        proto: Object.getPrototypeOf(clickedChar)
      });
    }

    if (clickedChar) {
      if (this.playerTeam.characters.includes(clickedChar)) {
        this.selectCharacter(clickedChar, index);
      } else if (this.isCharacterSelected) {
        this.showAttackMenu(this.selectedCharacter, clickedChar, index);
      }
    } else if (this.isCharacterSelected) {
      this.moveCharacter(this.selectedCharacter, index);
    }
  }

  onCellEnter(index) {
    const allChars = [
      ...this.positionedPlayerCharacters,
      ...this.positionedEnemyCharacters,
    ];
    const positionedChar = allChars.find(pc => pc.position === index);
    
    if (positionedChar) {
      const cursor = positionedChar.character.isDead ? 'not-allowed' : 'pointer';
      this.gamePlay.setCursor(cursor);
      
      if (!positionedChar.character.isDead) {
        this.gamePlay.showCellTooltip(
          `${positionedChar.character.type} \n (🎖${positionedChar.character.level} ⚔${positionedChar.character.attack} 🛡${positionedChar.character.defence} ❤${positionedChar.character.health})`,
          index
        );
      } else {
        this.gamePlay.removeCellTooltip(index);
      }
    } else {
      this.gamePlay.setCursor('default');
      this.gamePlay.removeCellTooltip(index);
    }
  }

  onCellLeave(index) {
    this.gamePlay.removeCellTooltip(index);
    this.gamePlay.setCursor('default');
  }

  getAllCharacters() {
    return [
      ...this.positionedPlayerCharacters,
      ...this.positionedEnemyCharacters
    ].filter(pc => !pc.character.isDead);
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
    const fromIndex = this.selectedCellIndex;
    const path = this.calculatePath(fromIndex, toIndex, character.moveDistance);

    if (!path || !path.includes(toIndex)) {
      this.gamePlay.showMessage(
        'Невозможно переместиться! Персонаж блокирует путь.'
      );
      return false;
    }

    const moveCost = this.calculateMoveCost(fromIndex, toIndex, character);
    if (moveCost > character.currentActionPoints) {
      this.gamePlay.showError('Недостаточно очков действий!');
      return false;
    }

    await this.animateMovement(character, path);

    character.currentActionPoints -= moveCost;
    this.selectedCellIndex = toIndex;
    this.updateCharacterPosition(character, toIndex);

    this.redrawTeams();
    this.updateAvailableActions();

    if (this.checkTurnEnd()) {
      this.switchTurn();
    }
    return true;
  }

  calculateMoveCost(fromIndex, toIndex, character) {
    const fromPos = this.indexToPosition(fromIndex);
    const toPos = this.indexToPosition(toIndex);
    const dx = Math.abs(fromPos.x - toPos.x);
    const dy = Math.abs(fromPos.y - toPos.y);
  
    const isDiagonal = dx > 0 && dy > 0;
    const steps = Math.max(dx, dy);
  
    if (character.type === 'magician' || character.type === 'daemon') {
      return steps * (isDiagonal ? 3 : 2);
    }
    
    return steps * (isDiagonal ? 2 : 1);
  }

  calculatePath(fromIndex, toIndex, maxDistance) {
    if (fromIndex === toIndex) return [fromIndex];
  
    const boardSize = this.gamePlay.boardSize;
    const fromPos = this.indexToPosition(fromIndex);
    const toPos = this.indexToPosition(toIndex);
    
    const path = [fromIndex];
    let currentPos = {...fromPos};
    let steps = 0;
  
    while (steps < maxDistance && (currentPos.x !== toPos.x || currentPos.y !== toPos.y)) {
      if (currentPos.x < toPos.x) currentPos.x++;
      else if (currentPos.x > toPos.x) currentPos.x--;
      
      if (currentPos.y < toPos.y) currentPos.y++;
      else if (currentPos.y > toPos.y) currentPos.y--;
  
      const nextIndex = currentPos.y * boardSize + currentPos.x;
      
      const charAtPos = this.gamePlay.findCharacterByPosition(
        [...this.positionedPlayerCharacters, ...this.positionedEnemyCharacters],
        nextIndex
      );
      
      if (charAtPos) break;
      
      path.push(nextIndex);
      steps++;
    }
  
    return path;
  }

  async animateMovement(character, path) {
    const originalType = character.type;
    character.type = 'moving';

    for (let i = 1; i < path.length; i++) {
      const toIndex = path[i];
      this.updateCharacterPosition(character, toIndex);
      this.redrawTeams();
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    character.type = originalType;
  }

  updateCharacterPosition(character, newPosition) {
    console.log(`Updating position for ${character.type} to ${newPosition}`);
    
    if (this.playerTeam.characters.includes(character)) {
      this.positionedPlayerCharacters = this.positionedPlayerCharacters.map(
        (pc) => pc.character === character
          ? new PositionedCharacter(character, newPosition)
          : pc
      );
    } else {
      this.positionedEnemyCharacters = this.positionedEnemyCharacters.map(
        (pc) => pc.character === character
          ? new PositionedCharacter(character, newPosition)
          : pc
      );
    }
    
    const checkPos = this.findPositionByCharacter(
      [...this.positionedPlayerCharacters, ...this.positionedEnemyCharacters],
      character
    );
    console.assert(checkPos === newPosition, 
      `Position update failed for ${character.type}! Expected ${newPosition}, got ${checkPos}`);
  }

  showAttackMenu(attacker, target, targetIndex) {
    const menuItems = [];

    if (attacker.currentActionPoints >= 1) {
      menuItems.push({
        text: `Атака (1 очко)`,
        action: () =>
          this.performAttack(attacker, target, targetIndex, 'attack'),
      });
    }

    if (attacker.currentActionPoints >= 2) {
      menuItems.push({
        text: `Сильная атака (2 очка)`,
        action: () =>
          this.performAttack(attacker, target, targetIndex, 'hardAttack'),
      });
    }

    this.gamePlay.showActionMenu(targetIndex, menuItems, 'attack');
  }

  showDefenceButton(position) {
    if (!this.selectedCharacter?.currentActionPoints) return;

    const menuItems = [
      {
        text: `Защита (${this.selectedCharacter.currentActionPoints} очков)`,
        action: () => this.performDefence(this.selectedCharacter),
      },
    ];

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
          const allChars = [
            ...this.positionedPlayerCharacters,
            ...this.positionedEnemyCharacters,
          ];
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
    const currentTeam =
      this.gameState.currentTurn === 'player'
        ? this.positionedEnemyCharacters
        : this.positionedPlayerCharacters;

    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const idx = row * boardSize + col;
        const rowDiff = Math.abs(Math.floor(position / boardSize) - row);
        const colDiff = Math.abs((position % boardSize) - col);

        if (rowDiff <= distance && colDiff <= distance && idx !== position) {
          const char = this.gamePlay.findCharacterByPosition(currentTeam, idx);
          if (char) {
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
      this.getPossibleMoves(position, maxDistance).forEach((idx) =>
        this.gamePlay.selectCell(idx, 'green')
      );
    }

    this.getPossibleAttacks(
      position,
      this.selectedCharacter.attackDistance
    ).forEach((idx) => this.gamePlay.selectCell(idx, 'red'));
  }

  async performAttack(attacker, target, targetIndex, attackType) {
    if (!attacker) {
      console.error('Attacker is undefined');
      return;
    }
  
    const attackerPos = this.findPositionByCharacter(
      [...this.positionedPlayerCharacters, ...this.positionedEnemyCharacters],
      attacker
    );
    
    if (attackerPos === null) {
      console.error('Attacker position not found:', attacker);
      this.gamePlay.showError(`${attacker.type}: Не могу найти позицию атакующего!`);
      return;
    }
  
    const distance = attacker.calculateDistance(
      this.indexToPosition(attackerPos),
      this.indexToPosition(targetIndex)
    );
  
    if (distance > attacker.attackDistance) {
      if (attacker.team === 'player') {
        this.gamePlay.showError('Враг слишком далеко!');
      }
      return;
    }
    
    const cost = attackType === 'attack' ? 1 : 2;
    if (attacker.currentActionPoints < cost) {
      this.gamePlay.showError('Недостаточно очков действий!');
      return;
    }
  
    const attack = attacker.actions[attackType]();
    const damage = Math.round(attack.damage);
    
    await this.gamePlay.showDamage(targetIndex, damage, attack.isCritical);
    
    target.takeDamage(damage);
    attacker.currentActionPoints -= attack.cost;
    
    this.gamePlay.hideActionMenu();
    this.redrawTeams();
    
    if (target.health <= 0) {
      this.handleCharacterDeath(target);
    }
    
    if (this.checkTurnEnd()) {
      this.switchTurn();
    }
  }

  handleCharacterDeath(character) {
    character.die();
    this.gamePlay.showMessage(`${character.type} погиб!`);
    this.redrawTeams();

    if (this.checkWinConditions()) {
      return;
    }
  }

  performDefence(character) {
    const defenceBonus = character.currentActionPoints * 5;
    character.defence += defenceBonus;
    character.currentActionPoints = 0;

    this.gamePlay.showMessage(
      `${character.type} усилил защиту на ${defenceBonus} очков!`
    );
    this.gamePlay.hideActionMenu();
    this.redrawTeams();
    this.updateAvailableActions();

    if (this.checkTurnEnd()) {
      this.switchTurn();
    }
  }

  indexToPosition(index) {
    const boardSize = this.gamePlay.boardSize;
    return {
      x: index % boardSize,
      y: Math.floor(index / boardSize),
    };
  }

  updateActionPointsDisplay() {
    const actionPointsElement = document.getElementById('action-points');
    if (!actionPointsElement) return;

    let html = '<h3>Очки действий:</h3>';
    this.playerTeam.characters.forEach((char) => {
      html += `<p>${char.type}: ${char.currentActionPoints}/${char.actionPoints}</p>`;
    });

    actionPointsElement.innerHTML = html;
  }

  checkTurnEnd() {
    return this.playerTeam.characters
      .filter(c => !c.isDead)
      .every(c => c.currentActionPoints <= 0);
  }

  async switchTurn() {
    this.gamePlay.deselectAllCells();
    this.gamePlay.hideActionMenu();
  
    if (this.gameState.currentTurn === 'player') {
      this.enemyTeam.characters.forEach((c) => c.resetActionPoints());
    } else {
      this.playerTeam.characters.forEach((c) => c.resetActionPoints());
    }
  
    this.gameState.currentTurn = 
      this.gameState.currentTurn === 'player' ? 'enemy' : 'player';
    this.updateTurnIndicator();
  
    if (this.gameState.currentTurn === 'enemy' && !this.isGameLocked) {
      await this.makeEnemyMove();
    }
  }

  async makeEnemyMove() {
    console.log('Starting enemy move. Current positions:', {
      players: this.positionedPlayerCharacters.map(pc => `${pc.character.type}:${pc.position}`),
      enemies: this.positionedEnemyCharacters.map(pc => `${pc.character.type}:${pc.position}`)
    });
    if (await this.checkWinConditions()) {
      return;
    }
  
    try {
      const activeEnemies = this.positionedEnemyCharacters
        .filter(pc => !pc.character.isDead && pc.character.currentActionPoints > 0)
        .sort((a, b) => b.character.attackDistance - a.character.attackDistance);
  
      for (const positionedChar of activeEnemies) {
        const enemy = positionedChar.character;
        const enemyPos = positionedChar.position;
        
        const targets = this.positionedPlayerCharacters
          .filter(pc => !pc.character.isDead)
          .map(pc => ({
            character: pc.character,
            position: pc.position,
            distance: enemy.calculateDistance(
              this.indexToPosition(enemyPos),
              this.indexToPosition(pc.position)
            )
          }));
  
        if (targets.length === 0) continue;
  
        const sortedTargets = targets.sort((a, b) => {
          if (a.distance === b.distance) {
            return a.character.health - b.character.health;
          }
          return a.distance - b.distance;
        });
  
        const attackableTargets = sortedTargets.filter(t => 
          t.distance <= enemy.attackDistance
        );
  
        if (attackableTargets.length > 0) {
          await this.performAttack(
            enemy,
            attackableTargets[0].character,
            attackableTargets[0].position,
            'attack'
          );
          if (await this.checkWinConditions()) return;
          continue;
        }
  
        const nearestTarget = sortedTargets[0];
        const path = this.calculatePath(
          enemyPos,
          nearestTarget.position,
          enemy.moveDistance
        );
  
        if (path && path.length > 1) {
          const moveToIndex = path[Math.min(path.length - 1, enemy.moveDistance)];
          const moveCost = this.calculateMoveCost(enemyPos, moveToIndex, enemy);
          
          if (moveCost <= enemy.currentActionPoints) {
            await this.moveEnemyCharacter(enemy, moveToIndex);
            if (await this.checkWinConditions()) return;
          }
        }
      }
    } catch (error) {
      console.error('AI move error:', error);
    } finally {
      this.switchTurn();
    }
  }

  getAttackTargets(enemy, enemyPos, playerChars) {
    return playerChars.filter((playerChar) => {
      const distance = enemy.calculateDistance(
        this.indexToPosition(enemyPos),
        this.indexToPosition(playerChar.position)
      );
      return distance <= enemy.attackDistance;
    });
  }

  async moveTowardsNearestPlayer(enemy, enemyPos, playerChars) {
    const nearestPlayer = playerChars.reduce((prev, current) => {
      const prevDistance = enemy.calculateDistance(
        this.indexToPosition(enemyPos),
        this.indexToPosition(prev.position)
      );
      const currentDistance = enemy.calculateDistance(
        this.indexToPosition(enemyPos),
        this.indexToPosition(current.position)
      );
      return currentDistance < prevDistance ? current : prev;
    });

    const path = this.calculatePath(
      enemyPos,
      nearestPlayer.position,
      enemy.moveDistance
    );

    if (path && path.length > 1) {
      const moveToIndex = path[Math.min(path.length - 1, enemy.moveDistance)];
      await this.moveEnemyCharacter(enemy, moveToIndex);
    }
  }

  async moveEnemyCharacter(character, toIndex) {
    try {
      const fromIndex = this.findPositionByCharacter(
        [...this.positionedPlayerCharacters, ...this.positionedEnemyCharacters],
        character
      );
      
      if (fromIndex === null || typeof fromIndex !== 'number') {
        console.error('Cannot find character position before move:', character);
        return false;
      }
  
      const path = this.calculatePath(fromIndex, toIndex, character.moveDistance);
      if (!path || !path.includes(toIndex)) {
        return false;
      }
  
      const moveCost = this.calculateMoveCost(fromIndex, toIndex, character);
      if (moveCost > character.currentActionPoints) {
        return false;
      }
  
      await this.animateMovement(character, path);
      character.currentActionPoints -= moveCost;
      this.updateCharacterPosition(character, toIndex);
      this.redrawTeams();
      return true;
    } catch (error) {
      console.error('Error in moveEnemyCharacter:', error);
      return false;
    }
  }

  findPositionByCharacter(positionedCharacters, character) {
    const allPositionedChars = [
      ...this.positionedPlayerCharacters,
      ...this.positionedEnemyCharacters
    ];
    
    const positionedChar = allPositionedChars.find(
      (pc) => pc.character === character
    );
    
    if (!positionedChar) {
      console.error('Character not found:', {
        character,
        allPositionedChars: allPositionedChars.map(pc => ({
          type: pc.character.type,
          position: pc.position,
          isDead: pc.character.isDead
        }))
      });
    }
    
    return positionedChar ? positionedChar.position : null;
  }
}
