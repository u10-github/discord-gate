import { describe, expect, it, vi } from 'vitest';
import type { InvitePolicy } from './policy';
import type { AuditLogger, Clock, HumanVerifier, InviteIssuer, RateLimiter } from './ports';
import { InviteUseCase } from './use-case';

function createFakes() {
  const verifier: HumanVerifier = {
    verify: vi.fn().mockResolvedValue(true),
  };

  const issuer: InviteIssuer = {
    createInvite: vi.fn().mockResolvedValue('https://discord.gg/example'),
  };

  const rateLimiter: RateLimiter = {
    check: vi.fn().mockResolvedValue(true),
  };

  const logger: AuditLogger = {
    log: vi.fn(),
  };

  const clock: Clock = {
    now: vi.fn().mockReturnValue(new Date('2026-07-08T12:00:00Z')),
  };

  const policy: InvitePolicy = {
    maxUses: 1,
    maxAgeSeconds: 900,
  };

  return { verifier, issuer, rateLimiter, logger, clock, policy };
}

describe('InviteUseCase', () => {
  describe('execute', () => {
    it('returns invite URL on successful verification', async () => {
      const fakes = createFakes();
      const useCase = new InviteUseCase(
        fakes.policy,
        fakes.verifier,
        fakes.issuer,
        fakes.rateLimiter,
        fakes.logger,
        fakes.clock,
      );

      const result = await useCase.execute('valid-token', 'client-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.inviteUrl).toBe('https://discord.gg/example');
      }
      expect(fakes.logger.log).toHaveBeenCalledWith('invite_issued', { maxUses: 1, maxAgeSeconds: 900 });
      expect(fakes.issuer.createInvite).toHaveBeenCalledWith(1, 900);
    });

    it('returns error when human verification fails', async () => {
      const fakes = createFakes();
      fakes.verifier.verify = vi.fn().mockResolvedValue(false);
      const useCase = new InviteUseCase(
        fakes.policy,
        fakes.verifier,
        fakes.issuer,
        fakes.rateLimiter,
        fakes.logger,
        fakes.clock,
      );

      const result = await useCase.execute('invalid-token', 'client-1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('human_verification_failed');
      }
      expect(fakes.logger.log).toHaveBeenCalledWith('human_verification_failed', expect.any(Object));
    });

    it('returns error when rate limited', async () => {
      const fakes = createFakes();
      fakes.rateLimiter.check = vi.fn().mockResolvedValue(false);
      const useCase = new InviteUseCase(
        fakes.policy,
        fakes.verifier,
        fakes.issuer,
        fakes.rateLimiter,
        fakes.logger,
        fakes.clock,
      );

      const result = await useCase.execute('valid-token', 'client-1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('rate_limited');
      }
      expect(fakes.logger.log).toHaveBeenCalledWith('rate_limited', expect.any(Object));
    });

    it('returns error when invite issuance fails', async () => {
      const fakes = createFakes();
      fakes.issuer.createInvite = vi.fn().mockRejectedValue(new Error('API error'));
      const useCase = new InviteUseCase(
        fakes.policy,
        fakes.verifier,
        fakes.issuer,
        fakes.rateLimiter,
        fakes.logger,
        fakes.clock,
      );

      const result = await useCase.execute('valid-token', 'client-1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('invite_issuance_failed');
      }
      expect(fakes.logger.log).toHaveBeenCalledWith('invite_issuance_failed', expect.any(Object));
    });

    it('does not call issuer when verifier rejects', async () => {
      const fakes = createFakes();
      fakes.verifier.verify = vi.fn().mockResolvedValue(false);

      const useCase = new InviteUseCase(
        fakes.policy,
        fakes.verifier,
        fakes.issuer,
        fakes.rateLimiter,
        fakes.logger,
        fakes.clock,
      );

      await useCase.execute('bad-token', 'client-1');

      expect(fakes.issuer.createInvite).not.toHaveBeenCalled();
    });

    it('does not call issuer when rate limited', async () => {
      const fakes = createFakes();
      fakes.rateLimiter.check = vi.fn().mockResolvedValue(false);

      const useCase = new InviteUseCase(
        fakes.policy,
        fakes.verifier,
        fakes.issuer,
        fakes.rateLimiter,
        fakes.logger,
        fakes.clock,
      );

      await useCase.execute('valid-token', 'client-1');

      expect(fakes.verifier.verify).not.toHaveBeenCalled();
      expect(fakes.issuer.createInvite).not.toHaveBeenCalled();
    });

    it('does not call issuer when verifier throws', async () => {
      const fakes = createFakes();
      fakes.verifier.verify = vi.fn().mockRejectedValue(new Error('Network error'));

      const useCase = new InviteUseCase(
        fakes.policy,
        fakes.verifier,
        fakes.issuer,
        fakes.rateLimiter,
        fakes.logger,
        fakes.clock,
      );

      const result = await useCase.execute('token', 'client-1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('human_verification_failed');
      }
      expect(fakes.issuer.createInvite).not.toHaveBeenCalled();
    });

    it('still returns invite URL even if logger throws', async () => {
      const fakes = createFakes();
      fakes.logger.log = vi.fn().mockImplementation(() => {
        throw new Error('Log storage full');
      });

      const useCase = new InviteUseCase(
        fakes.policy,
        fakes.verifier,
        fakes.issuer,
        fakes.rateLimiter,
        fakes.logger,
        fakes.clock,
      );

      const result = await useCase.execute('valid-token', 'client-1');

      expect(result.success).toBe(true);
    });
  });
});
