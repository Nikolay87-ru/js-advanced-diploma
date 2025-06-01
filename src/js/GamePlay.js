import { calcHealthLevel, calcTileType } from './utils.js';

export default class GamePlay {
  constructor() {
    this.boardSize = 8;
    this.container = null;
    this.boardEl = null;
    this.cells = [];
    this.cellClickListeners = [];
    this.cellEnterListeners = [];
    this.cellLeaveListeners = [];
    this.newGameListeners = [];
    this.saveGameListeners = [];
    this.loadGameListeners = [];
  }

  bindToDOM(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('container is not HTMLElement');
    }
    this.container = container;
  }

  drawUi(theme) {
    this.checkBinding();

    this.container.innerHTML = `
      <div class="controls">
        <button data-id="action-restart" class="btn">New Game</button>
        <button data-id="action-save" class="btn">Save Game</button>
        <button data-id="action-load" class="btn">Load Game</button>
      </div>
      <div id="game-stats">
        <div>Уровень: <span id="current-level">1</span></div>
        <div>Макс. счет: <span id="max-score">0</span></div>
      </div>
      <div id="action-points"></div>
      <div class="board-container">
        <div data-id="board" class="board"></div>
      </div>
      <div class="game-info">
        <div id="current-turn" class="turn-indicator"></div>
        <div id="game-message" class="game-message"></div>
        <div id="game-error" class="game-error"></div>
      </div>
    `;

    this.newGameEl = this.container.querySelector('[data-id=action-restart]');
    this.saveGameEl = this.container.querySelector('[data-id=action-save]');
    this.loadGameEl = this.container.querySelector('[data-id=action-load]');

    this.newGameEl.addEventListener('click', event => this.onNewGameClick(event));
    this.saveGameEl.addEventListener('click', event => this.onSaveGameClick(event));
    this.loadGameEl.addEventListener('click', event => this.onLoadGameClick(event));

    this.boardEl = this.container.querySelector('[data-id=board]');
    this.boardEl.classList.add(theme);

    for (let i = 0; i < this.boardSize ** 2; i += 1) {
      const cellEl = document.createElement('div');
      cellEl.classList.add('cell', 'map-tile', `map-tile-${calcTileType(i, this.boardSize)}`);
      cellEl.addEventListener('mouseenter', event => this.onCellEnter(event));
      cellEl.addEventListener('mouseleave', event => this.onCellLeave(event));
      cellEl.addEventListener('click', event => this.onCellClick(event));
      this.boardEl.appendChild(cellEl);
    }

    this.cells = Array.from(this.boardEl.children);
  }

  updateStats(level, maxScore) {
    const levelEl = document.getElementById('current-level');
    const scoreEl = document.getElementById('max-score');
    
    if (levelEl) levelEl.textContent = level;
    if (scoreEl) scoreEl.textContent = maxScore;
  }

  redrawPositions(positions) {
    this.cells.forEach(cell => cell.innerHTML = '');
  
    positions.forEach(position => {
      const cellEl = this.boardEl.children[position.position];
      const charEl = document.createElement('div');
      
      charEl.classList.add('character', position.character.isDead ? 'dead' : position.character.type);
  
      const healthEl = document.createElement('div');
      healthEl.classList.add('health-level');
  
      const healthIndicatorEl = document.createElement('div');
      healthIndicatorEl.classList.add(
        'health-level-indicator', 
        `health-level-indicator-${calcHealthLevel(position.character.health)}`
      );
      healthIndicatorEl.style.width = `${position.character.health}%`;
      
      healthEl.appendChild(healthIndicatorEl);
      charEl.appendChild(healthEl);
      cellEl.appendChild(charEl);
    });
  }

  addCellClickListener(callback) {
    this.cellClickListeners.push(callback);
  }

  addCellEnterListener(callback) {
    this.cellEnterListeners.push(callback);
  }

  addCellLeaveListener(callback) {
    this.cellLeaveListeners.push(callback);
  }

  addNewGameListener(callback) {
    this.newGameListeners.push(callback);
  }

  addSaveGameListener(callback) {
    this.saveGameListeners.push(callback);
  }

  addLoadGameListener(callback) {
    this.loadGameListeners.push(callback);
  }

  findCharacterByPosition(positionedCharacters, index) {
    return positionedCharacters.find(c => c.position === index)?.character;
  }
  
  findPositionByCharacter(positionedCharacters, character) {
    const positionedChar = positionedCharacters.find(
      (c) => c.character === character
    );
    if (!positionedChar) {
      console.error('Character not found in positionedCharacters:', character);
      console.log('Current positionedCharacters:', positionedCharacters);
    }
    return positionedChar ? positionedChar.position : null;
  }

  onCellEnter(event) {
    event.preventDefault();
    const index = this.cells.indexOf(event.currentTarget);
    this.cellEnterListeners.forEach(o => o.call(null, index));
  }

  onCellLeave(event) {
    this.setCursor('default');
    event.preventDefault();
    const index = this.cells.indexOf(event.currentTarget);
    this.cellLeaveListeners.forEach(o => o.call(null, index));
  }

  onCellClick(event) {
    const index = this.cells.indexOf(event.currentTarget);
    this.cellClickListeners.forEach(o => o.call(null, index));
  }

  onNewGameClick(event) {
    event.preventDefault();
    this.newGameListeners.forEach(o => o.call(null));
  }

  onSaveGameClick(event) {
    event.preventDefault();
    this.saveGameListeners.forEach(o => o.call(null));
  }

  onLoadGameClick(event) {
    event.preventDefault();
    this.loadGameListeners.forEach(o => o.call(null));
  }

  setCursor(cursorType) {
    this.boardEl.style.cursor = cursorType;
  }

  showError(message) {
    const errorElement = document.getElementById('game-error');
    if (errorElement) {
      errorElement.textContent = message;
      setTimeout(() => errorElement.textContent = '', 3000);
    }
  }

  showMessage(message) {
    const messageElement = document.getElementById('game-message');
    if (messageElement) {
      messageElement.textContent = message;
      setTimeout(() => messageElement.textContent = '', 3000);
    }
  }

  selectCell(index, color = 'yellow', style = 'solid') {
    this.deselectCell(index);
    this.cells[index].classList.add('selected', `selected-${color}`);
    if (style === 'dashed') {
      this.cells[index].classList.add('selected-dashed');
    }
  }

  deselectCell(index) {
    const cell = this.cells[index];
    cell.classList.remove(
      'selected', 
      'selected-yellow', 
      'selected-green', 
      'selected-red',
      'selected-dashed'
    );
  }

  deselectAllCells() {
    this.cells.forEach((_, index) => this.deselectCell(index));
  }

  hideActionMenu() {
    const menus = document.querySelectorAll('.action-menu');
    menus.forEach(menu => {
      try {
        menu.parentNode?.removeChild(menu);
      } catch (e) {
        console.error('Error removing action menu:', e);
      }
    });
  }

  showActionMenu(index, items, type = 'attack') {
    this.hideActionMenu();
    
    const menu = document.createElement('div');
    menu.className = `action-menu ${type}-menu`;
    
    items.forEach(item => {
      const button = document.createElement('button');
      button.className = 'action-button';
      button.textContent = item.text;
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        item.action();
      });
      menu.appendChild(button);
    });
    
    const cell = this.cells[index];
    cell.appendChild(menu);
  }

  showAttackRange(character, positionedCharacters) {
    const position = this.findPositionByCharacter(positionedCharacters, character);
    if (position === null) return;
  
    const enemyTeam = positionedCharacters.filter(pc => 
      pc.character.team !== character.team
    );
  
    enemyTeam.forEach(enemy => {
      const distance = character.calculateDistance(
        { x: position % this.boardSize, y: Math.floor(position / this.boardSize) },
        { x: enemy.position % this.boardSize, y: Math.floor(enemy.position / this.boardSize) }
      );
      
      if (distance <= character.attackDistance) {
        this.selectCell(enemy.position, 'red', 'dashed');
      }
    });
  }

  async showDamage(index, damage, isCritical = false) {
    const cell = this.cells[index];
    if (!cell) return;
  
    const existingDamage = cell.querySelector('.damage');
    if (existingDamage && cell.contains(existingDamage)) {
      cell.removeChild(existingDamage);
    }
  
    const damageEl = document.createElement('div');
    damageEl.className = `damage ${isCritical ? 'critical' : ''}`;
    damageEl.textContent = `-${damage}`;
    cell.appendChild(damageEl);
  
    await new Promise(resolve => {
      damageEl.addEventListener('animationend', () => {
        if (cell.contains(damageEl)) {
          cell.removeChild(damageEl);
        }
        resolve();
      }, { once: true });
    });
  }

  showCellTooltip(message, index) {
    const cell = this.cells[index];
    if (!cell) return;
  
    const oldTooltip = cell.querySelector('.custom-tooltip');
    if (oldTooltip) {
      cell.removeChild(oldTooltip);
    }
  
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    
    tooltip.innerHTML = `
      <span class="character-type">${message}</span>
    `;
  
    cell.appendChild(tooltip);
    cell.tooltip = tooltip; 
  }
  
  removeCellTooltip(index) {
    const cell = this.cells[index];
    if (!cell) return;
    
    const tooltip = cell.querySelector('.custom-tooltip');
    if (tooltip && cell.contains(tooltip)) {
      cell.removeChild(tooltip);
    }
    delete cell.tooltip;
  }

  checkBinding() {
    if (this.container === null) {
      throw new Error('GamePlay not bind to DOM');
    }
  }
}