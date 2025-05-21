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
});



