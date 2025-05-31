import Character from '../Character';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';
import Daemon from '../characters/Daemon';
import Undead from '../characters/Undead';
import Vampire from '../characters/Vampire';
import { characterGenerator, generateTeam } from '../generators';

describe('Character base class', () => {
  test('should throw error when creating Character instance directly', () => {
    expect(() => new Character(1)).toThrow("Can't use new Character");
  });

  test('inherited classes should not throw errors', () => {
    expect(() => new Bowman(1)).not.toThrow();
    expect(() => new Swordsman(1)).not.toThrow();
    expect(() => new Magician(1)).not.toThrow();
    expect(() => new Daemon(1)).not.toThrow();
    expect(() => new Undead(1)).not.toThrow();
    expect(() => new Vampire(1)).not.toThrow();
  });
});

describe('Character level 1 stats', () => {
  const testStats = (CharacterClass, expectedAttackRange, expectedDefence) => {
    test(`${CharacterClass.name} has correct stats`, () => {
      const char = new CharacterClass(1);
      const [minAttack, maxAttack] = expectedAttackRange.split('-').map(Number);
      const attackValue = parseInt(char.attack.split('-')[0], 10);
      expect(attackValue).toBeGreaterThanOrEqual(minAttack);
      expect(attackValue).toBeLessThanOrEqual(maxAttack);
      
      expect(char.defence).toBe(expectedDefence);
      expect(char.health).toBe(50);
      expect(char.level).toBe(1);
    });
  };

  testStats(Bowman, '15-25', 25);
  testStats(Swordsman, '30-40', 10);
  testStats(Magician, '10-20', 40);
  testStats(Daemon, '10-20', 40);
  testStats(Undead, '30-40', 10);
  testStats(Vampire, '15-25', 25);
});

describe('characterGenerator', () => {
  const allowedTypes = [Bowman, Swordsman, Magician];
  const maxLevel = 3;

  test('should generate characters infinitely', () => {
    const generator = characterGenerator(allowedTypes, maxLevel);
    const characters = new Set();
    
    for (let i = 0; i < 10; i++) {
      const character = generator.next().value;
      expect(character).toBeInstanceOf(Character);
      characters.add(character.type);
    }
    
    expect(characters.size).toBeGreaterThanOrEqual(1);
  });

  test('should only generate allowed types', () => {
    const generator = characterGenerator(allowedTypes, maxLevel);
    
    for (let i = 0; i < 10; i++) {
      const character = generator.next().value;
      expect(allowedTypes.some(Type => character instanceof Type)).toBeTruthy();
    }
  });

  test('should generate characters with correct levels', () => {
    const generator = characterGenerator(allowedTypes, maxLevel);
    
    for (let i = 0; i < 10; i++) {
      const character = generator.next().value;
      expect(character.level).toBeGreaterThanOrEqual(1);
      expect(character.level).toBeLessThanOrEqual(maxLevel);
    }
  });
});

describe('generateTeam', () => {
  const allowedTypes = [Daemon, Undead, Vampire];
  const maxLevel = 4;
  const characterCount = 3;

  test('should generate team with correct number of characters', () => {
    const team = generateTeam(allowedTypes, maxLevel, characterCount);
    expect(team.characters.length).toBe(characterCount);
  });

  test('should generate characters with correct levels', () => {
    const team = generateTeam(allowedTypes, maxLevel, characterCount);
    team.characters.forEach(character => {
      expect(character.level).toBeGreaterThanOrEqual(1);
      expect(character.level).toBeLessThanOrEqual(maxLevel);
    });
  });

  test('should generate only allowed types', () => {
    const team = generateTeam(allowedTypes, maxLevel, characterCount);
    team.characters.forEach(character => {
      expect(allowedTypes.some(Type => character instanceof Type)).toBeTruthy();
    });
  });

  test('should handle zero character count', () => {
    const team = generateTeam(allowedTypes, maxLevel, 0);
    expect(team.characters.length).toBe(0);
  });
});