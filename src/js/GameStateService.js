export default class GameStateService {
  constructor(storage) {
    this.storage = storage;
  }

  save(state) {
    this.storage.setItem('state', JSON.stringify(state));
  }

  load() {
    try {
      return JSON.parse(this.storage.getItem('state'));
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      throw new Error('Invalid state');
    }
  }
}