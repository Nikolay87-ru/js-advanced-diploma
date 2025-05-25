import GameController from '../GameController.js';
import Bowman from '../characters/Bowman.js';

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
  });

  test('should show tooltip with correct character info when entering cell with character', () => {
    gameController.onCellEnter(0);
    
    expect(gamePlayMock.setCursor).toHaveBeenCalledWith('pointer');
    
    expect(gamePlayMock.selectCell).toHaveBeenCalledWith(0, 'green');
    
    expect(gamePlayMock.showCellTooltip).toHaveBeenCalled();
    
    const tooltipContent = gamePlayMock.showCellTooltip.mock.calls[0][0];
    
    expect(tooltipContent).toContain('BOWMAN');
    expect(tooltipContent).toContain('🎖1');
    expect(tooltipContent).toContain('❤50'); 
    expect(tooltipContent).toContain('⚔25'); 
    expect(tooltipContent).toContain('🛡25'); 
  });

  test('should not show tooltip when entering empty cell', () => {
    gameController.onCellEnter(1);
    
    expect(gamePlayMock.setCursor).toHaveBeenCalledWith('auto');
    
    expect(gamePlayMock.hideCellTooltip).toHaveBeenCalledWith(1);
    
    expect(gamePlayMock.showCellTooltip).not.toHaveBeenCalled();
  });

  test('should not show green selection when entering selected character cell', () => {
    gameController.selectedCharacter = gameController.positionedPlayerCharacters[0].character;
    
    gameController.onCellEnter(0);
    
    expect(gamePlayMock.selectCell).not.toHaveBeenCalledWith(0, 'green');
    
    expect(gamePlayMock.showCellTooltip).toHaveBeenCalled();
  });
});