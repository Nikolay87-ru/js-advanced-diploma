/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
export function calcTileType(index, boardSize) {
  const topLeftCell = 0;
  const topRightCell = boardSize - 1;
  const bottomRightCell = boardSize * boardSize - 1;
  const bottomLeftCell = bottomRightCell - (boardSize - 1);

  if (index === topLeftCell) return 'top-left';
  if (index === topRightCell) return 'top-right';
  if (index === bottomLeftCell) return 'bottom-left';
  if (index === bottomRightCell) return 'bottom-right';

  if (index < topRightCell) return 'top';
  if (index > bottomLeftCell) return 'bottom';

  if (index % boardSize === 0) return 'left';
  if (index % boardSize === boardSize - 1) return 'right';
  
  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
