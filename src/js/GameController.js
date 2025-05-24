import themes from './themes.js';
import { PositionedCharacter } from './PositionedCharacter.js';
import { generateTeam } from './generators.js';
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
  }

  init() {
    try {
      this.gamePlay.drawUi(themes.prairie);
      this.generateTeams();
      this.redrawTeams();
    } catch (error) {
      this.gamePlay.showError(error.message);
    }

    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
  }

  generateTeams() {
    // лимит на кол-во персонажей в команде (устанавливается в this.maxCharacters)
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

  onCellClick(index) {
    const clickedCharacter = [
      ...this.positionedPlayerCharacters,
      ...this.positionedEnemyCharacters,
    ].find((pc) => pc.position === index)?.character;
    if (clickedCharacter) {
      this.gamePlay.selectCell(index, 'yellow');
    }
  }

  onCellEnter(index) {
    this.gamePlay.setCursor('pointer');
    const character = [
      ...this.positionedPlayerCharacters,
      ...this.positionedEnemyCharacters,
    ].find((pc) => pc.position === index)?.character;
    if (character) {
      this.gamePlay.selectCell(index, 'green');
      this.gamePlay.showCellTooltip(
        `${character.type} (🎖${character.level} ⚔${character.attack} 🛡${character.defence} ❤${character.health})`,
        index
      );
    }
  }

  onCellLeave(index) {
    this.gamePlay.deselectCell(index);
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor('auto');
  }
}
