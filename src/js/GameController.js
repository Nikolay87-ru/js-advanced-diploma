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
    this.selectedCharacter = null;

    this.gameState = new GameState();
    this.selectedCharacter = null;
    this.selectedCellIndex = null;
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
  }

  generateTeams() {
    // лимит на кол-во персонажей в партии (устанавливается в maxCharacters)
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
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
  }

  updateTurnIndicator() {
    const turnElement = document.getElementById('current-turn');
    if (this.gameState.currentTurn === 'player') {
      turnElement.textContent = 'Ваш ход';
      turnElement.className = 'player-turn';
    } else {
      turnElement.textContent = 'Ход противника';
      turnElement.className = 'enemy-turn';
    }
  }

  onCellClick(index) {
    if (this.gameState.currentTurn !== 'player') {
      this.gamePlay.showError('Сейчас не ваш ход!');
      return;
    }
  
    const allChars = [...this.positionedPlayerCharacters, ...this.positionedEnemyCharacters];
    const clickedCharacter = this.gamePlay.findCharacterByPosition(allChars, index);
  
    // Если кликнули по своему персонажу - выбираем его
    if (clickedCharacter && this.playerTeam.characters.includes(clickedCharacter)) {
      if (this.selectedCharacter) {
        const prevPos = this.gamePlay.findPositionByCharacter(allChars, this.selectedCharacter);
        if (prevPos !== null) this.gamePlay.deselectCell(prevPos);
      }
  
      this.selectedCharacter = clickedCharacter;
      this.selectedCellIndex = index;
      this.gamePlay.selectCell(index, 'yellow');
      return;
    }
  
    // Если персонаж уже выбран, проверяем можно ли переместиться или атаковать
    if (this.selectedCharacter) {
      const selectedPos = this.gamePlay.findPositionByCharacter(
        this.positionedPlayerCharacters,
        this.selectedCharacter
      );
  
      const moves = this.getPossibleMoves(selectedPos, this.selectedCharacter.moveDistance);
      const attacks = this.getPossibleAttacks(selectedPos, this.selectedCharacter.attackDistance);
  
      if (moves.includes(index)) {
        // Перемещение
        const pc = this.positionedPlayerCharacters.find(p => p.character === this.selectedCharacter);
        pc.position = index;
        this.redrawTeams();
        this.switchTurn();
      } else if (attacks.includes(index)) {
        // Атака
        const target = this.gamePlay.findCharacterByPosition(allChars, index);
        const damage = this.selectedCharacter.attack - target.defence * 0.1;
        target.health -= damage;
  
        this.gamePlay.showDamage(index, Math.round(damage)).then(() => {
          this.redrawTeams();
          if (target.health <= 0) {
            this.positionedEnemyCharacters = this.positionedEnemyCharacters.filter(
              pc => pc.character !== target
            );
            this.gamePlay.showMessage(`${target.type} побеждён!`);
          }
          this.switchTurn();
        });
      } else {
        this.gamePlay.showError('Невозможно переместиться или атаковать эту клетку');
      }
    }
  }

  onCellEnter(index) {
    const character = this.gamePlay.findCharacterByPosition(
      [...this.positionedPlayerCharacters, ...this.positionedEnemyCharacters],
      index
    );

    if (character) {
      this.gamePlay.setCursor('pointer');

      if (character !== this.selectedCharacter) {
        this.gamePlay.selectCell(index, 'green');
      }

      const tooltipContent = `
        <div class="character-type">${character.type.toUpperCase()}</div>
        <div>🎖${character.level} ❤${character.health} 
        ⚔${character.attack} 🛡${character.defence}</div>
      `;

      this.gamePlay.showCellTooltip(tooltipContent, index);
    } else {
      this.gamePlay.setCursor('auto');
      this.gamePlay.hideCellTooltip(index);
    }
  }

  onCellLeave(index) {
    const character = this.gamePlay.findCharacterByPosition(
      [...this.positionedPlayerCharacters, ...this.positionedEnemyCharacters],
      index
    );

    if (character && character !== this.selectedCharacter) {
      this.gamePlay.deselectCell(index);
    }

    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor('auto');
  }

  switchTurn() {
    this.gameState.currentTurn =
      this.gameState.currentTurn === 'player' ? 'enemy' : 'player';
    this.updateTurnIndicator();

    if (this.gameState.currentTurn === 'enemy') {
      this.makeEnemyMove();
    }
  }

  getPossibleMoves(position, moveDistance) {
    // Возвращаем массив индексов доступных клеток для перемещения
    const boardSize = this.gamePlay.boardSize;
    const [row, col] = [Math.floor(position / boardSize), position % boardSize];
    const moves = [];
  
    for (let r = Math.max(0, row - moveDistance); r <= Math.min(boardSize - 1, row + moveDistance); r++) {
      for (let c = Math.max(0, col - moveDistance); c <= Math.min(boardSize - 1, col + moveDistance); c++) {
        const idx = r * boardSize + c;
        if (idx !== position) {
          moves.push(idx);
        }
      }
    }
  
    return moves.filter(idx => {
      // Проверяем, что клетка не занята другим персонажем
      const allChars = [...this.positionedPlayerCharacters, ...this.positionedEnemyCharacters];
      return !allChars.some(pc => pc.position === idx);
    });
  }
  
  getPossibleAttacks(position, attackDistance) {
    // Аналогично getPossibleMoves, но ищет вражеских персонажей
    const boardSize = this.gamePlay.boardSize;
    const [row, col] = [Math.floor(position / boardSize), position % boardSize];
    const attacks = [];
  
    for (let r = Math.max(0, row - attackDistance); r <= Math.min(boardSize - 1, row + attackDistance); r++) {
      for (let c = Math.max(0, col - attackDistance); c <= Math.min(boardSize - 1, col + attackDistance); c++) {
        const idx = r * boardSize + c;
        if (idx !== position) {
          attacks.push(idx);
        }
      }
    }
  
    const allChars = [...this.positionedPlayerCharacters, ...this.positionedEnemyCharacters];
    return attacks.filter(idx => {
      const target = allChars.find(pc => pc.position === idx);
      return target && this.enemyTeam.characters.includes(target.character);
    });
  }

  makeEnemyMove() {
    const aliveEnemies = this.enemyTeam.characters.filter((c) => c.health > 0);
    if (aliveEnemies.length === 0) {
      this.gamePlay.showMessage('Вы победили!');
      return;
    }

    const enemyCharacter =
      aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
    const enemyPos = this.gamePlay.findPositionByCharacter(
      this.positionedEnemyCharacters,
      enemyCharacter
    );

    const alivePlayers = this.playerTeam.characters.filter((c) => c.health > 0);
    if (alivePlayers.length === 0) {
      this.gamePlay.showMessage('Вы проиграли!');
      return;
    }

    const targetCharacter =
      alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
    const targetPos = this.gamePlay.findPositionByCharacter(
      this.positionedPlayerCharacters,
      targetCharacter
    );

    setTimeout(() => {
      this.gamePlay.selectCell(enemyPos, 'red');
      this.gamePlay.selectCell(targetPos, 'red');

      const damage = Math.max(
        0,
        enemyCharacter.attack - targetCharacter.defence * 0.1
      );
      targetCharacter.health -= damage;

      this.gamePlay.showDamage(targetPos, Math.round(damage)).then(() => {
        this.redrawTeams();

        if (targetCharacter.health <= 0) {
          this.gamePlay.showMessage(`${targetCharacter.type} побежден!`);
        }

        this.gamePlay.deselectCell(enemyPos);
        this.gamePlay.deselectCell(targetPos);

        this.switchTurn();
      });
    }, 1000);
  }
}
