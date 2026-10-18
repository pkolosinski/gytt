import { describe, expect, it } from 'vitest';

import { localDateSchema } from './local-date.ts';

describe('localDateSchema', () => {
  it.each(['1900-01-01', '2100-12-31', '2000-02-29', '2024-02-29'])(
    'accepts supported calendar date %s',
    (value) => {
      expect(localDateSchema.safeParse(value).success).toBe(true);
    },
  );

  it.each([
    '1899-12-31',
    '2101-01-01',
    '1900-02-29',
    '2100-02-29',
    '2023-02-29',
    '2024-04-31',
    '2026-13-01',
    '2026-00-01',
    '2026-01-00',
    '2026-01-32',
    '2026-1-01',
  ])('rejects unsupported or invalid calendar date %s', (value) => {
    expect(localDateSchema.safeParse(value).success).toBe(false);
  });
});
