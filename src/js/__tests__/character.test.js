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
      boardEl: { style: { cursor: '' } },
      boardSize: 8,
      findCharacterByPosition: jest.fn(),
      findPositionByCharacter: jest.fn(),
      removeCellTooltip: jest.fn()
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
    expect(tooltipContent).toMatch(/bowman/i);
    expect(tooltipContent).toMatch(/\d+/); 
  });

  test('should handle empty cell correctly', () => {
    gameController.onCellEnter(1);
    
    expect(gamePlayMock.setCursor).toHaveBeenCalledWith('default');
    
    expect(gamePlayMock.removeCellTooltip).toHaveBeenCalledWith(1);
    expect(gamePlayMock.showCellTooltip).not.toHaveBeenCalled();
  });

  test('should not select already selected character', () => {
    gameController.selectedCharacter = gameController.positionedPlayerCharacters[0].character;
    gameController.onCellEnter(0);
    
    expect(gamePlayMock.selectCell).not.toHaveBeenCalledWith(0, 'green');
    expect(gamePlayMock.showCellTooltip).toHaveBeenCalled();
  });
});