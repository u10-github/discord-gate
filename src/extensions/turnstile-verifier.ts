import type { AuditLogger } from '../core/ports';
import type { HumanVerifier } from '../core/ports';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface SiteverifyResponse {
  success?: boolean;
  'error-codes'?: string[];
}

export class TurnstileVerifier implements HumanVerifier {
  constructor(
    private readonly secretKey: string,
    private readonly fetchFn: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> = (input, init) =>
      fetch(input, init),
    private readonly logger?: AuditLogger,
  ) {}

  async verify(token: string): Promise<boolean> {
    if (!this.secretKey?.trim()) {
      this.logger?.log('turnstile_verification_failed', { reason: 'missing_secret_key' });
      return false;
    }
    if (!token?.trim()) {
      this.logger?.log('turnstile_verification_failed', { reason: 'missing_token' });
      return false;
    }

    try {
      const body = new URLSearchParams({ secret: this.secretKey, response: token });
      const response = await this.fetchFn(SITEVERIFY_URL, {
        method: 'POST',
        body,
      });
      if (!response.ok) {
        this.logger?.log('turnstile_verification_failed', {
          reason: 'non_ok_response',
          httpStatus: response.status,
          tokenLength: token.length,
        });
        return false;
      }
      let data: SiteverifyResponse;
      try {
        data = (await response.json()) as SiteverifyResponse;
      } catch {
        this.logger?.log('turnstile_verification_failed', {
          reason: 'malformed_response',
          tokenLength: token.length,
        });
        return false;
      }
      if (data.success !== true) {
        this.logger?.log('turnstile_verification_failed', {
          reason: 'siteverify_rejected',
          errorCodes: data['error-codes'],
          tokenLength: token.length,
        });
        return false;
      }
      return true;
    } catch (error) {
      this.logger?.log('turnstile_verification_failed', {
        reason: 'network_error',
        errorName: error instanceof Error ? error.name : undefined,
        tokenLength: token.length,
      });
      return false;
    }
  }
}
