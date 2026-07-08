import { DEFAULT_INVITE_POLICY } from '../core/policy';
import type { InvitePolicy } from '../core/policy';
import type { Env } from './worker';

function parseStrictPositiveInt(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return undefined;
  const n = parseInt(trimmed, 10);
  return n > 0 ? n : undefined;
}

export class AppConfig {
  private readonly errors: string[] = [];
  private readonly _turnstileSiteKey: string;
  private readonly _turnstileSecretKey: string;
  private readonly _discordBotToken: string;
  private readonly _discordChannelId: string;
  private readonly _policy: InvitePolicy;

  constructor(env: Env) {
    this._turnstileSiteKey = env.TURNSTILE_SITE_KEY?.trim() ?? '';
    this._turnstileSecretKey = env.TURNSTILE_SECRET_KEY?.trim() ?? '';
    this._discordBotToken = env.DISCORD_BOT_TOKEN?.trim() ?? '';
    this._discordChannelId = env.DISCORD_CHANNEL_ID?.trim() ?? '';

    if (!this._turnstileSiteKey) this.errors.push('TURNSTILE_SITE_KEY is required');
    if (!this._turnstileSecretKey) this.errors.push('TURNSTILE_SECRET_KEY is required');
    if (!this._discordBotToken) this.errors.push('DISCORD_BOT_TOKEN is required');
    if (!this._discordChannelId) this.errors.push('DISCORD_CHANNEL_ID is required');

    const maxAge = parseStrictPositiveInt(env.INVITE_MAX_AGE);
    const maxUses = parseStrictPositiveInt(env.INVITE_MAX_USES);

    this._policy = {
      maxAgeSeconds: maxAge ?? DEFAULT_INVITE_POLICY.maxAgeSeconds,
      maxUses: maxUses ?? DEFAULT_INVITE_POLICY.maxUses,
    };
  }

  getErrors(): readonly string[] {
    return this.errors;
  }

  get turnstileSiteKey(): string {
    return this._turnstileSiteKey;
  }

  get turnstileSecretKey(): string {
    return this._turnstileSecretKey;
  }

  get discordBotToken(): string {
    return this._discordBotToken;
  }

  get discordChannelId(): string {
    return this._discordChannelId;
  }

  getPolicy(): InvitePolicy {
    return this._policy;
  }
}
