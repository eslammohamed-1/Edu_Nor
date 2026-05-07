import { describe, expect, it } from 'vitest';

describe('app test setup', () => {
  it('runs in jsdom', () => {
    const el = document.createElement('div');
    el.textContent = 'EduNor';

    expect(el.textContent).toBe('EduNor');
  });
});
