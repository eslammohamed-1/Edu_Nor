import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/http/client', () => ({
  getApiBase: vi.fn()
}));

import { getApiBase } from '@/services/http/client';
import { fetchPublicQuestionsBank } from '@/services/questionsBankService';

const mockGetApiBase = vi.mocked(getApiBase);

describe('fetchPublicQuestionsBank', () => {
  beforeEach(() => {
    mockGetApiBase.mockReset();
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({})
        })
      )
    );
  });

  it('returns null when getApiBase is null', async () => {
    mockGetApiBase.mockReturnValue(null);
    const map = await fetchPublicQuestionsBank();
    expect(map).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('returns map with only string-id questions', async () => {
    mockGetApiBase.mockReturnValue('http://localhost:3001');
    const mcqBank = {
      id: 'a1',
      type: 'mcq' as const,
      stem: 's',
      choices: [{ id: 'c', label: 'l', isCorrect: true }]
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        questions: [
          mcqBank,
          null,
          { notId: 'x' },
          { id: 42 },
          { id: 'b2', type: 'string' as const, stem: 't', answer: 'ok' },
          'not-an-object'
        ]
      })
    } as Response);

    const map = await fetchPublicQuestionsBank();
    expect(map).not.toBeNull();
    expect(map!.size).toBe(2);
    expect(map!.get('a1')).toBe(mcqBank);
    expect(map!.get('b2')).toMatchObject({ id: 'b2', type: 'string' });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/questions-bank',
      expect.objectContaining({ headers: expect.anything() })
    );
  });

  it('returns null when response not ok', async () => {
    mockGetApiBase.mockReturnValue('http://x');
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({})
    } as Response);

    expect(await fetchPublicQuestionsBank()).toBeNull();
  });

  it('returns null when fetch throws', async () => {
    mockGetApiBase.mockReturnValue('http://x');
    vi.mocked(fetch).mockRejectedValue(new Error('network'));

    expect(await fetchPublicQuestionsBank()).toBeNull();
  });

  it('returns null when json rejects', async () => {
    mockGetApiBase.mockReturnValue('http://x');
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error('bad json');
      }
    } as Response);

    expect(await fetchPublicQuestionsBank()).toBeNull();
  });
});
