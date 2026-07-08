import { describe, expect, it, vi } from 'vitest';
import type { HumanVerifier } from '../core/ports';
import { TurnstileVerifier } from './turnstile-verifier';

function createMockFetch(overrides: Partial<{ ok: boolean; status: number; json: () => unknown }>): typeof fetch {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ success: true }),
    ...overrides,
  }) as unknown as typeof fetch;
}

function createRejectingFetch(error: Error): typeof fetch {
  return vi.fn().mockRejectedValue(error) as unknown as typeof fetch;
}

describe('TurnstileVerifier', () => {
  it('implements HumanVerifier port', () => {
    const verifier = new TurnstileVerifier('test-secret');
    expect(verifier).toSatisfy((v: HumanVerifier) => typeof v.verify === 'function');
  });

  it('returns true when Siteverify responds with success: true', async () => {
    const mockFetch = createMockFetch({
      json: () => ({ success: true }),
    });
    const verifier = new TurnstileVerifier('test-secret', mockFetch);

    const result = await verifier.verify('valid-token');

    expect(result).toBe(true);
  });

  it('returns false when Siteverify responds with success: false', async () => {
    const mockFetch = createMockFetch({
      json: () => ({ success: false, 'error-codes': ['invalid-input-response'] }),
    });
    const verifier = new TurnstileVerifier('test-secret', mockFetch);

    const result = await verifier.verify('invalid-token');

    expect(result).toBe(false);
  });

  it('returns false on network error', async () => {
    const mockFetch = createRejectingFetch(new Error('Network failure'));
    const verifier = new TurnstileVerifier('test-secret', mockFetch);

    const result = await verifier.verify('token');

    expect(result).toBe(false);
  });

  it('returns false on malformed response without success field', async () => {
    const mockFetch = createMockFetch({
      json: () => ({ 'error-codes': ['internal-error'] }),
    });
    const verifier = new TurnstileVerifier('test-secret', mockFetch);

    const result = await verifier.verify('token');

    expect(result).toBe(false);
  });

  it('returns false on non-ok HTTP response', async () => {
    const mockFetch = createMockFetch({
      ok: false,
      status: 500,
    });
    const verifier = new TurnstileVerifier('test-secret', mockFetch);

    const result = await verifier.verify('token');

    expect(result).toBe(false);
  });

  it('returns false when secretKey is empty', async () => {
    const mockFetch = vi.fn() as unknown as typeof fetch;
    const verifier = new TurnstileVerifier('', mockFetch);

    const result = await verifier.verify('valid-token');

    expect(result).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns false when secretKey is only whitespace', async () => {
    const mockFetch = vi.fn() as unknown as typeof fetch;
    const verifier = new TurnstileVerifier('   ', mockFetch);

    const result = await verifier.verify('valid-token');

    expect(result).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns false when token is empty', async () => {
    const mockFetch = vi.fn() as unknown as typeof fetch;
    const verifier = new TurnstileVerifier('test-secret', mockFetch);

    const result = await verifier.verify('');

    expect(result).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns false when token is only whitespace', async () => {
    const mockFetch = vi.fn() as unknown as typeof fetch;
    const verifier = new TurnstileVerifier('test-secret', mockFetch);

    const result = await verifier.verify('   ');

    expect(result).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('sends secret key and token in the request body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => ({ success: true }),
    }) as unknown as typeof fetch;
    const verifier = new TurnstileVerifier('my-secret', mockFetch);

    await verifier.verify('my-token');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      expect.objectContaining({
        method: 'POST',
      }),
    );
    const callBody = (mockFetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body;
    expect(callBody.toString()).toContain('secret=my-secret');
    expect(callBody.toString()).toContain('response=my-token');
  });

  it('logs missing secret key reason', async () => {
    const logger = { log: vi.fn() };
    const verifier = new TurnstileVerifier('', vi.fn() as unknown as typeof fetch, logger);

    await verifier.verify('token');

    expect(logger.log).toHaveBeenCalledWith('turnstile_verification_failed', { reason: 'missing_secret_key' });
  });

  it('logs missing token reason', async () => {
    const logger = { log: vi.fn() };
    const mockFetch = vi.fn() as unknown as typeof fetch;
    const verifier = new TurnstileVerifier('secret', mockFetch, logger);

    await verifier.verify('');

    expect(logger.log).toHaveBeenCalledWith('turnstile_verification_failed', { reason: 'missing_token' });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('logs siteverify error codes on rejection', async () => {
    const logger = { log: vi.fn() };
    const mockFetch = createMockFetch({
      json: () => ({ success: false, 'error-codes': ['invalid-input-response'] }),
    });
    const verifier = new TurnstileVerifier('secret', mockFetch, logger);

    await verifier.verify('some-token');

    expect(logger.log).toHaveBeenCalledWith('turnstile_verification_failed', {
      reason: 'siteverify_rejected',
      errorCodes: ['invalid-input-response'],
      tokenLength: 10,
    });
  });

  it('logs non-ok HTTP status', async () => {
    const logger = { log: vi.fn() };
    const mockFetch = createMockFetch({ ok: false, status: 500 });
    const verifier = new TurnstileVerifier('secret', mockFetch, logger);

    await verifier.verify('token');

    expect(logger.log).toHaveBeenCalledWith('turnstile_verification_failed', {
      reason: 'non_ok_response',
      httpStatus: 500,
      tokenLength: 5,
    });
  });

  it('logs network error', async () => {
    const logger = { log: vi.fn() };
    const mockFetch = createRejectingFetch(new Error('Network failure'));
    const verifier = new TurnstileVerifier('secret', mockFetch, logger);

    await verifier.verify('token');

    expect(logger.log).toHaveBeenCalledWith('turnstile_verification_failed', {
      reason: 'network_error',
      errorName: 'Error',
      tokenLength: 5,
    });
  });

  it('logs malformed response when json() throws', async () => {
    const logger = { log: vi.fn() };
    const mockFetch = createMockFetch({
      json: () => {
        throw new Error('invalid json');
      },
    });
    const verifier = new TurnstileVerifier('secret', mockFetch, logger);

    await verifier.verify('token');

    expect(logger.log).toHaveBeenCalledWith('turnstile_verification_failed', {
      reason: 'malformed_response',
      tokenLength: 5,
    });
  });

  it('does not log raw token or secret in diagnostics', async () => {
    const logger = { log: vi.fn() };
    const mockFetch = createMockFetch({
      json: () => ({ success: false, 'error-codes': ['invalid-input-response'] }),
    });
    const verifier = new TurnstileVerifier('my-secret-key', mockFetch, logger);

    await verifier.verify('my-sensitive-token');

    const logged = JSON.stringify(logger.log.mock.calls);
    expect(logged).not.toContain('my-secret-key');
    expect(logged).not.toContain('my-sensitive-token');
  });
});
