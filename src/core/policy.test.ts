import { describe, expect, it } from 'vitest';
import { DEFAULT_INVITE_POLICY } from './policy';

describe('DEFAULT_INVITE_POLICY', () => {
  it('has maxUses set to 1 (one-time use)', () => {
    expect(DEFAULT_INVITE_POLICY.maxUses).toBe(1);
  });

  it('has maxAgeSeconds set to 900 (15 minutes)', () => {
    expect(DEFAULT_INVITE_POLICY.maxAgeSeconds).toBe(900);
  });
});
