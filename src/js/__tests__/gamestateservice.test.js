import GameStateService from '../GameStateService.js';
import GameState from '../GameState.js';
import GameController from '../GameController.js';

describe('GameStateService', () => {
  let storageMock;
  let gamePlayMock;
  let stateService;

  beforeEach(() => {
    storageMock = {
      getItem: jest.fn(),
      setItem: jest.fn()
    };
    
    gamePlayMock = {
      showMessage: jest.fn(),
      showError: jest.fn(),
      drawUi: jest.fn(), 
      redrawPositions: jest.fn(), 
      updateStats: jest.fn(), 
      deselectAllCells: jest.fn(), 
      hideActionMenu: jest.fn(),
      bindToDOM: jest.fn()
    };
    
    stateService = new GameStateService(storageMock, gamePlayMock);
  });

  describe('save', () => {
    test('should save game state and show success message', () => {
      const gameState = new GameState(
        'player',
        100,
        2,
        { characters: [] },
        { characters: [] },
        [],
        []
      );
      
      stateService.save(gameState);
      
      expect(storageMock.setItem).toHaveBeenCalledWith(
        'state',
        expect.any(String)
      );
      expect(gamePlayMock.showMessage).toHaveBeenCalledWith('Игра сохранена');
    });

    test('should show error message when save fails', () => {
      storageMock.setItem.mockImplementation(() => {
        throw new Error('Save error');
      });
      
      const gameState = new GameState();
      stateService.save(gameState);
      
      expect(gamePlayMock.showError).toHaveBeenCalledWith('Не удалось сохранить игру');
    });
  });

  describe('load', () => {
    test('should load game state and show success message', () => {
      const savedState = {
        currentTurn: 'player',
        maxScore: 100,
        currentLevel: 2,
        playerTeam: { characters: [] },
        enemyTeam: { characters: [] },
        positionedPlayerCharacters: [],
        positionedEnemyCharacters: []
      };
      
      storageMock.getItem.mockReturnValue(JSON.stringify(savedState));
      
      const result = stateService.load();
      
      expect(result).toBeInstanceOf(GameState);
      expect(gamePlayMock.showMessage).toHaveBeenCalledWith('Игра загружена');
    });

    test('should show error message when load fails (invalid data)', () => {
      storageMock.getItem.mockReturnValue('invalid json');
      
      expect(() => stateService.load()).toThrow(SyntaxError);
      expect(gamePlayMock.showError).toHaveBeenCalledWith('Не удалось загрузить игру');
    });

    test('should show error message when no saved data', () => {
      storageMock.getItem.mockReturnValue(null);
      
      expect(() => stateService.load()).toThrow('Нет сохраненных данных');
      expect(gamePlayMock.showError).toHaveBeenCalledWith('Не удалось загрузить игру');
    });
  });
});

describe('GameController save/load', () => {
  let gameController;
  let gamePlayMock;
  let stateServiceMock;

  beforeEach(() => {
    gamePlayMock = {
      addSaveGameListener: jest.fn(),
      addLoadGameListener: jest.fn(),
      addNewGameListener: jest.fn(),
      showMessage: jest.fn(),
      showError: jest.fn(),
      drawUi: jest.fn(),
      redrawPositions: jest.fn(),
      updateStats: jest.fn(),
      deselectAllCells: jest.fn(),
      hideActionMenu: jest.fn(),
      addCellClickListener: jest.fn(),
      addCellEnterListener: jest.fn(),
      addCellLeaveListener: jest.fn(),
      boardEl: { style: { cursor: '' } },
      boardSize: 8,
      bindToDOM: jest.fn(),
      container: document.createElement('div')
    };
    
    stateServiceMock = {
      save: jest.fn(),
      load: jest.fn().mockReturnValue(new GameState())
    };
    
    gameController = new GameController(gamePlayMock, stateServiceMock);
    
    gameController.playerTeam = { characters: [] };
    gameController.enemyTeam = { characters: [] };
    gameController.positionedPlayerCharacters = [];
    gameController.positionedEnemyCharacters = [];
    gameController.gameState = { currentTurn: 'player' };
    gameController.isGameLocked = false;
  });

  test('should bind save and load listeners on init', () => {
    gameController.init();
    
    expect(gamePlayMock.addSaveGameListener).toHaveBeenCalled();
    expect(gamePlayMock.addLoadGameListener).toHaveBeenCalled();
    expect(gamePlayMock.addNewGameListener).toHaveBeenCalled();
  });

  test('should call stateService.save on saveGame', () => {
    const originalSaveGame = gameController.saveGame;
    
    gameController.saveGame = jest.fn(() => {
      originalSaveGame.call(gameController);
    });
    
    gamePlayMock.addSaveGameListener.mockImplementation((callback) => {
      callback();
    });
    
    gameController.init();
    
    expect(stateServiceMock.save).toHaveBeenCalled();
  });

  test('should call stateService.load on loadGame', () => {
    const originalLoadGame = gameController.loadGame;
    
    gameController.loadGame = jest.fn(() => {
      originalLoadGame.call(gameController);
    });
    
    gamePlayMock.addLoadGameListener.mockImplementation((callback) => {
      callback();
    });
    
    gameController.init();
    
    expect(stateServiceMock.load).toHaveBeenCalled();
  });

  test('should show error message when save fails', () => {
    stateServiceMock.save.mockImplementation(() => {
      throw new Error('Save error');
    });
    
    gamePlayMock.addSaveGameListener.mockImplementation((callback) => {
      callback();
    });
    
    gameController.init();
    
    expect(gamePlayMock.showError).toHaveBeenCalledWith('Ошибка при сохранении игры');
  });
});