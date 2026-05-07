import { describe, expect, it } from 'vitest';
import { resetPrismaMock } from './utils/prismaMock.js';

describe('server test setup', () => {
  it('provides test env and prisma mock helper', () => {
    const prisma = resetPrismaMock();

    expect(process.env.JWT_SECRET).toContain('test');
    expect(prisma).toBeDefined();
  });
});
