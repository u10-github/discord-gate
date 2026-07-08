import type { InvitePolicy } from './policy';
import type { AuditLogger, Clock, HumanVerifier, InviteIssuer, RateLimiter } from './ports';
import type { InviteError, InviteResult } from './types';

export class InviteUseCase {
  constructor(
    private readonly policy: InvitePolicy,
    private readonly verifier: HumanVerifier,
    private readonly issuer: InviteIssuer,
    private readonly rateLimiter: RateLimiter,
    private readonly logger: AuditLogger,
    private readonly clock: Clock,
  ) {}

  async execute(token: string, clientId: string): Promise<InviteResult> {
    const rateCheck = await this.safeRun(() => this.rateLimiter.check(clientId));
    if (!rateCheck) {
      return this.fail('rate_limited');
    }

    const verified = await this.safeRun(() => this.verifier.verify(token));
    if (!verified) {
      return this.fail('human_verification_failed');
    }

    return this.createInvite();
  }

  private async createInvite(): Promise<InviteResult> {
    try {
      const inviteUrl = await this.issuer.createInvite(this.policy.maxUses, this.policy.maxAgeSeconds);
      this.safeLog('invite_issued', { maxUses: this.policy.maxUses, maxAgeSeconds: this.policy.maxAgeSeconds });
      return { success: true, inviteUrl };
    } catch {
      return this.fail('invite_issuance_failed');
    }
  }

  private async safeRun<T>(fn: () => Promise<T>): Promise<T | undefined> {
    try {
      return await fn();
    } catch {
      return undefined;
    }
  }

  private fail(error: InviteError): InviteResult {
    this.safeLog(error, {});
    return { success: false, error };
  }

  private safeLog(event: string, data: Record<string, unknown>): void {
    try {
      this.logger.log(event, data);
    } catch {
      // Logger failure must not block the use-case
    }
  }
}
