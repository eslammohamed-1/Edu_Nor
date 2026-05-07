import { mockDeep, mockReset, type DeepMockProxy } from 'vitest-mock-extended';
import type { PrismaClient } from '@prisma/client';

export const prismaMock = mockDeep<PrismaClient>();

export function resetPrismaMock(): DeepMockProxy<PrismaClient> {
  mockReset(prismaMock);
  return prismaMock;
}
