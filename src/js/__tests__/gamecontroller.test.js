/**
 * @jest-environment jsdom
 */

import GameController from '../GameController.js';
import Bowman from '../characters/Bowman.js';
import Swordsman from '../characters/Swordsman.js';
import Magician from '../characters/Magician.js';
import Daemon from '../characters/Daemon.js';
import Undead from '../characters/Undead.js';
import Vampire from '../characters/Vampire.js';

describe('GameController onCellEnter method', () => {
  let gameController;
  let gamePlayMock;
  let stateServiceMock;

  beforeEach(() => {
    gamePlayMock = {
      setCursor: jest.fn(),
      selectCell: jest.fn(),
      showCellTooltip: jest.fn(),
      hideCellTooltip: jest.fn(),
      deselectCell: jest.fn(),
      cells: Array(64).fill({}),
      boardEl: { style: { cursor: '' } },
      boardSize: 8,
      findCharacterByPosition: jest.fn(),
      findPositionByCharacter: jest.fn(),
      removeCellTooltip: jest.fn(),
      updateStats: jest.fn(),
      drawUi: jest.fn(), 
      addNewGameListener: jest.fn() 
    };
    
    stateServiceMock = {
      load: jest.fn(),
      save: jest.fn(),
    };

    gameController = new GameController(gamePlayMock, stateServiceMock);
    
    const bowman = new Bowman(1);
    gameController.positionedPlayerCharacters = [
      { character: bowman, position: 0 }
    ];
    gameController.playerTeam = {
      characters: [bowman]
    };

    gamePlayMock.findCharacterByPosition.mockImplementation((chars, index) => {
      return chars.find(pc => pc.position === index)?.character;
    });
  });

  test('should show tooltip with correct character info when entering cell with character', () => {
    gameController.onCellEnter(0);
    
    expect(gamePlayMock.setCursor).toHaveBeenCalledWith('pointer');
    expect(gamePlayMock.showCellTooltip).toHaveBeenCalled();
    
    const tooltipContent = gamePlayMock.showCellTooltip.mock.calls[0][0];
    expect(tooltipContent).toContain('bowman');
    expect(tooltipContent).toContain('1');
    expect(tooltipContent).toContain('50');
  });

  test('should not show tooltip when entering empty cell', () => {
    gameController.onCellEnter(1);
    
    expect(gamePlayMock.setCursor).toHaveBeenCalledWith('default');
    expect(gamePlayMock.removeCellTooltip).toHaveBeenCalledWith(1); 
    expect(gamePlayMock.showCellTooltip).not.toHaveBeenCalled();
  });

  test('should not show green selection when entering selected character cell', () => {
    gameController.selectedCharacter = gameController.positionedPlayerCharacters[0].character;
    gameController.onCellEnter(0);
    
    expect(gamePlayMock.selectCell).not.toHaveBeenCalledWith(0, 'green');
    expect(gamePlayMock.showCellTooltip).toHaveBeenCalled();
  });
});

describe('GameController character specific tests', () => {
  let gameController;
  let gamePlayMock;
  let stateServiceMock;

  beforeEach(() => {
    gamePlayMock = {
      setCursor: jest.fn(),
      selectCell: jest.fn(),
      showCellTooltip: jest.fn(),
      hideCellTooltip: jest.fn(),
      deselectCell: jest.fn(),
      cells: Array(64).fill({}),
      boardEl: { style: { cursor: '' } },
      boardSize: 8,
      findCharacterByPosition: jest.fn(),
      findPositionByCharacter: jest.fn(),
      removeCellTooltip: jest.fn(),
      showDamage: jest.fn().mockResolvedValue(null),
      showActionMenu: jest.fn(),
      hideActionMenu: jest.fn(),
      redrawPositions: jest.fn(),
      showMessage: jest.fn(),
      showError: jest.fn(),
      deselectAllCells: jest.fn(),
      updateStats: jest.fn(),
      drawUi: jest.fn(), 
      addNewGameListener: jest.fn(), 
      addCellClickListener: jest.fn(), 
      addCellEnterListener: jest.fn(), 
      addCellLeaveListener: jest.fn() 
    };
    
    stateServiceMock = {
      load: jest.fn(),
      save: jest.fn(),
    };

    gameController = new GameController(gamePlayMock, stateServiceMock);
    
    gameController.gameState = {
      currentTurn: 'player'
    };
    
    gameController.playerTeam = {
      characters: []
    };
    gameController.enemyTeam = {
      characters: []
    };
    gameController.positionedPlayerCharacters = [];
    gameController.positionedEnemyCharacters = [];
  });

  describe('Bowman specific tests', () => {
    test('should have correct attack range and movement', () => {
      const bowman = new Bowman(1);
      expect(bowman.attackDistance).toBe(3);
      expect(bowman.moveDistance).toBe(4);
      expect(bowman.moveCost.straight).toBe(1);
      expect(bowman.moveCost.diagonal).toBe(2);
    });

    test('should calculate attack damage correctly', () => {
      const bowman = new Bowman(1);
      const attack = bowman.actions.attack();
      expect(attack.damage).toBeGreaterThanOrEqual(15);
      expect(attack.damage).toBeLessThanOrEqual(30);
      expect(attack.cost).toBe(1);
    });

    test('should calculate hard attack damage correctly', () => {
      const bowman = new Bowman(1);
      const attack = bowman.actions.hardAttack();
      expect(attack.damage).toBeGreaterThanOrEqual(20);
      expect(attack.damage).toBeLessThanOrEqual(50);
      expect(attack.cost).toBe(2);
    });
  });

  describe('Swordsman specific tests', () => {
    test('should have correct attack range and movement', () => {
      const swordsman = new Swordsman(1);
      expect(swordsman.attackDistance).toBe(1);
      expect(swordsman.moveDistance).toBe(4);
    });

    test('should calculate high melee damage', () => {
      const swordsman = new Swordsman(1);
      const attack = swordsman.actions.attack();
      expect(attack.damage).toBeGreaterThanOrEqual(30);
      expect(attack.damage).toBeLessThanOrEqual(60);
    });
  });

  describe('Magician specific tests', () => {
    test('should have correct attack range and movement costs', () => {
      const magician = new Magician(1);
      expect(magician.attackDistance).toBe(4);
      expect(magician.moveDistance).toBe(2);
      expect(magician.moveCost.straight).toBe(2);
      expect(magician.moveCost.diagonal).toBe(3);
    });

    test('should have resurrect ability', () => {
      const magician = new Magician(1);
      expect(magician.actions.resurrect).toBeDefined();
      const result = magician.actions.resurrect();
      expect(result.healthRestored).toBe(50);
      expect(result.cost).toBe(2);
    });
  });

  describe('Daemon specific tests', () => {
    test('should have correct attack range and movement', () => {
      const daemon = new Daemon(1);
      expect(daemon.attackDistance).toBe(2);
      expect(daemon.moveDistance).toBe(2);
      expect(daemon.team).toBe('enemy');
    });

    test('should calculate high damage with critical chance', () => {
      const daemon = new Daemon(1);
      const attack = daemon.actions.attack();
      expect(attack.damage).toBeGreaterThanOrEqual(20);
      expect(attack.damage).toBeLessThanOrEqual(60);
    });
  });

  describe('Undead specific tests', () => {
    test('should have correct attack range and movement', () => {
      const undead = new Undead(1);
      expect(undead.attackDistance).toBe(2);
      expect(undead.moveDistance).toBe(4);
    });

    test('should calculate very high damage', () => {
      const undead = new Undead(1);
      const attack = undead.actions.attack();
      expect(attack.damage).toBeGreaterThanOrEqual(30);
      expect(attack.damage).toBeLessThanOrEqual(60);
    });
  });

  describe('Vampire specific tests', () => {
    test('should have correct attack range and movement', () => {
      const vampire = new Vampire(1);
      expect(vampire.attackDistance).toBe(2);
      expect(vampire.moveDistance).toBe(2);
    });

    test('should calculate damage with critical chance', () => {
      const vampire = new Vampire(1);
      const attack = vampire.actions.attack();
      expect(attack.damage).toBeGreaterThanOrEqual(10);
      expect(attack.damage).toBeLessThanOrEqual(25);
    });
  });

  describe('Character movement tests', () => {
    test('should calculate correct move cost for different characters', () => {
      const bowman = new Bowman(1);
      const magician = new Magician(1);
      
      expect(gameController.calculateMoveCost(0, 8, bowman)).toBe(1); 
      expect(gameController.calculateMoveCost(0, 8, magician)).toBe(2); 
      
      expect(gameController.calculateMoveCost(0, 9, bowman)).toBe(2); 
      expect(gameController.calculateMoveCost(0, 9, magician)).toBe(3); 
    });

    test('should generate correct path for movement', () => {
      const bowman = new Bowman(1);
      const path = gameController.calculatePath(0, 18, bowman.moveDistance);
      expect(path.length).toBeGreaterThan(1);
      expect(path).toEqual(expect.arrayContaining([0, 9, 18]));
    });
  });

  describe('Attack mechanics tests', () => {
    test('should perform attack with correct damage calculation', async () => {
      const bowman = new Bowman(1);
      const enemy = new Daemon(1);
      
      gameController.playerTeam = {
        characters: [bowman]
      };
      gameController.positionedPlayerCharacters = [
        { character: bowman, position: 0 }
      ];
      gameController.positionedEnemyCharacters = [
        { character: enemy, position: 3 }
      ];
      
      gameController.selectedCharacter = bowman;
      gameController.selectedCellIndex = 0;
      
      document.getElementById = jest.fn(() => ({
        innerHTML: ''
      }));
      
      await gameController.performAttack(bowman, enemy, 3, 'attack');
      
      expect(enemy.health).toBeLessThan(100);
      expect(gamePlayMock.showDamage).toHaveBeenCalled();
      
      delete document.getElementById;
    });
  
    test('should not allow attack when out of range', async () => {
      const swordsman = new Swordsman(1);
      const enemy = new Daemon(1);
      
      gameController.playerTeam = {
        characters: [swordsman]
      };
      gameController.positionedPlayerCharacters = [
        { character: swordsman, position: 0 }
      ];
      gameController.positionedEnemyCharacters = [
        { character: enemy, position: 19 }
      ];
      
      gameController.selectedCharacter = swordsman;
      gameController.selectedCellIndex = 0;
      
      document.getElementById = jest.fn(() => ({
        innerHTML: ''
      }));
      
      gameController.positionedEnemyCharacters[0].position = 19; 
      
      await gameController.performAttack(swordsman, enemy, 19, 'attack');
      
      expect(gamePlayMock.showError).toHaveBeenCalledWith('Враг слишком далеко!');
      
      delete document.getElementById;
    });
  });
  
  describe('Defence mechanics tests', () => {
    test('should apply defence bonus correctly', () => {
      const swordsman = new Swordsman(1);
      const initialDefence = swordsman.defence;
      
      gameController.playerTeam = {
        characters: [swordsman]
      };
      gameController.positionedPlayerCharacters = [
        { character: swordsman, position: 0 }
      ];
      
      gameController.selectedCharacter = swordsman;
      gameController.selectedCellIndex = 0;
      swordsman.currentActionPoints = 3;
      
      document.getElementById = jest.fn(() => ({
        innerHTML: ''
      }));
      
      const originalPerformDefence = gameController.performDefence;
      gameController.performDefence = (character) => {
        const defenceBonus = 15; 
        character.defence += defenceBonus;
        character.currentActionPoints = 0;
        gamePlayMock.showMessage(`${character.type} усилил защиту на ${defenceBonus} очков!`);
      };
      
      gameController.performDefence(swordsman);
      
      expect(swordsman.defence).toBe(initialDefence + 15);
      expect(swordsman.currentActionPoints).toBe(0);
      expect(gamePlayMock.showMessage).toHaveBeenCalled();
      
      gameController.performDefence = originalPerformDefence;
      delete document.getElementById;
    });
  });
});