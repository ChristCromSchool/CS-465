import {BROWSER_STORAGE} from './storage';

describe('Storage', () => {
  it('should have a valid injection token', () => {
    expect(BROWSER_STORAGE).toBeTruthy();
  });
});
