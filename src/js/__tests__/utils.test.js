import { calcTileType } from '../utils';

describe("calcTileType", () => {
  test("should return 'top-left'", () => {
    expect(calcTileType(0, 8)).toBe("top-left");
  });

  test("should return 'top'", () => {
    expect(calcTileType(1, 8)).toBe("top");
  });

  test("should return 'bottom-right'", () => {
    expect(calcTileType(63, 8)).toBe("bottom-right");
  });

  test("should return 'left'", () => {
    expect(calcTileType(7, 7)).toBe("left");
  });

  test("should return 'top-right'", () => {
    expect(calcTileType(7, 8)).toBe("top-right");
  });
  
  test("should return 'bottom-left'", () => {
    expect(calcTileType(56, 8)).toBe("bottom-left");
  });
  
  test("should return 'right'", () => {
    expect(calcTileType(15, 8)).toBe("right");
  });
  
  test("should return 'center'", () => {
    expect(calcTileType(36, 8)).toBe("center");
  });
});

test("should return correct values for 5x5 board", () => {
  expect(calcTileType(0, 5)).toBe("top-left");
  expect(calcTileType(4, 5)).toBe("top-right");
  expect(calcTileType(24, 5)).toBe("bottom-right");
});

