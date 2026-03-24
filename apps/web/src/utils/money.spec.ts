import { formatCopFromCents } from '@web/utils/money';

describe('formatCopFromCents', () => {
  it('formatea centavos a COP', () => {
    const s = formatCopFromCents(100_000);
    expect(s).toMatch(/COP|cop/);
    expect(s.length).toBeGreaterThan(3);
  });
});
