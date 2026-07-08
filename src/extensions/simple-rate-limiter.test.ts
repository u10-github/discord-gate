import { describe, expect, it } from 'vitest';
import type { RateLimiter } from '../core/ports';
import { SimpleRateLimiter } from './simple-rate-limiter';

describe('SimpleRateLimiter', () => {
  it('implements RateLimiter port', () => {
    const limiter = new SimpleRateLimiter();
    expect(limiter).toSatisfy((v: RateLimiter) => typeof v.check === 'function');
  });

  it('always returns true', async () => {
    const limiter = new SimpleRateLimiter();
    expect(await limiter.check('any-key')).toBe(true);
  });
});
