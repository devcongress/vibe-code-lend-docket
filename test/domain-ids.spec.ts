import { describe, expect, it } from 'vitest';

import { createDomainId } from '../shared/domain/ids';

describe('domain IDs', () => {
  it.each([
    'lender',
    'branch',
    'staff',
    'lprod',
    'lappl',
    'ldec',
    'lfile',
    'laudit',
    'lreq',
  ] as const)('creates a typed %s ID', (prefix) => {
    expect(createDomainId(prefix)).toMatch(new RegExp(`^${prefix}_[0-9a-f-]{36}$`));
  });
});
