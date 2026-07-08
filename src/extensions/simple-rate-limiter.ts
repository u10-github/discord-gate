import type { RateLimiter } from '../core/ports';

export class SimpleRateLimiter implements RateLimiter {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async check(_key: string): Promise<boolean> {
    return true;
  }
}
