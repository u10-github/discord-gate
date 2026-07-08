export interface HumanVerifier {
  verify(token: string): Promise<boolean>;
}

export interface InviteIssuer {
  createInvite(maxUses: number, maxAgeSeconds: number): Promise<string>;
}

export interface RateLimiter {
  check(key: string): Promise<boolean>;
}

export interface AuditLogger {
  log(event: string, data?: Record<string, unknown>): void;
}

export interface Clock {
  now(): Date;
}
