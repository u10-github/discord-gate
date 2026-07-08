import { describe, expect, it } from 'vitest';
import { AppConfig } from './config';
import type { Env } from './worker';

function makeEnv(overrides?: Partial<Env>): Env {
  return {
    TURNSTILE_SITE_KEY: 'site-key',
    TURNSTILE_SECRET_KEY: 'secret',
    DISCORD_BOT_TOKEN: 'bot-token',
    DISCORD_CHANNEL_ID: 'channel-id',
    ...overrides,
  };
}

describe('AppConfig', () => {
  it('returns no errors with valid env', () => {
    const config = new AppConfig(makeEnv());
    expect(config.getErrors()).toHaveLength(0);
    expect(config.turnstileSiteKey).toBe('site-key');
    expect(config.turnstileSecretKey).toBe('secret');
    expect(config.discordBotToken).toBe('bot-token');
    expect(config.discordChannelId).toBe('channel-id');
  });

  it('detects missing TURNSTILE_SITE_KEY', () => {
    const config = new AppConfig(makeEnv({ TURNSTILE_SITE_KEY: '' }));
    expect(config.getErrors()).toContain('TURNSTILE_SITE_KEY is required');
  });

  it('detects missing TURNSTILE_SITE_KEY when whitespace', () => {
    const config = new AppConfig(makeEnv({ TURNSTILE_SITE_KEY: '  ' }));
    expect(config.getErrors()).toContain('TURNSTILE_SITE_KEY is required');
  });

  it('detects missing TURNSTILE_SECRET_KEY', () => {
    const config = new AppConfig(makeEnv({ TURNSTILE_SECRET_KEY: '' }));
    expect(config.getErrors()).toContain('TURNSTILE_SECRET_KEY is required');
  });

  it('detects missing DISCORD_BOT_TOKEN', () => {
    const config = new AppConfig(makeEnv({ DISCORD_BOT_TOKEN: '' }));
    expect(config.getErrors()).toContain('DISCORD_BOT_TOKEN is required');
  });

  it('detects missing DISCORD_CHANNEL_ID', () => {
    const config = new AppConfig(makeEnv({ DISCORD_CHANNEL_ID: '' }));
    expect(config.getErrors()).toContain('DISCORD_CHANNEL_ID is required');
  });

  it('reports multiple missing values', () => {
    const config = new AppConfig(
      makeEnv({
        TURNSTILE_SITE_KEY: '',
        TURNSTILE_SECRET_KEY: '',
        DISCORD_BOT_TOKEN: '',
        DISCORD_CHANNEL_ID: '',
      }),
    );
    expect(config.getErrors()).toHaveLength(4);
  });

  it('uses INVITE_MAX_AGE from env', () => {
    const config = new AppConfig(makeEnv({ INVITE_MAX_AGE: '1800' }));
    expect(config.getPolicy().maxAgeSeconds).toBe(1800);
  });

  it('uses INVITE_MAX_USES from env', () => {
    const config = new AppConfig(makeEnv({ INVITE_MAX_USES: '3' }));
    expect(config.getPolicy().maxUses).toBe(3);
  });

  it('falls back to default INVITE_MAX_AGE when env is missing', () => {
    const config = new AppConfig(makeEnv({ INVITE_MAX_AGE: undefined }));
    expect(config.getPolicy().maxAgeSeconds).toBe(900);
  });

  it('falls back to default INVITE_MAX_AGE when env is invalid', () => {
    const config = new AppConfig(makeEnv({ INVITE_MAX_AGE: 'invalid' }));
    expect(config.getPolicy().maxAgeSeconds).toBe(900);
  });

  it('falls back to default INVITE_MAX_AGE when env is zero', () => {
    const config = new AppConfig(makeEnv({ INVITE_MAX_AGE: '0' }));
    expect(config.getPolicy().maxAgeSeconds).toBe(900);
  });

  it('falls back to default INVITE_MAX_AGE when env has partial numeric suffix', () => {
    const config = new AppConfig(makeEnv({ INVITE_MAX_AGE: '900abc' }));
    expect(config.getPolicy().maxAgeSeconds).toBe(900);
  });

  it('falls back to default INVITE_MAX_USES when env has partial numeric prefix', () => {
    const config = new AppConfig(makeEnv({ INVITE_MAX_USES: 'abc1' }));
    expect(config.getPolicy().maxUses).toBe(1);
  });

  it('falls back to default INVITE_MAX_USES when env is missing', () => {
    const config = new AppConfig(makeEnv({ INVITE_MAX_USES: undefined }));
    expect(config.getPolicy().maxUses).toBe(1);
  });

  it('trims whitespace from env values', () => {
    const config = new AppConfig(makeEnv({ TURNSTILE_SITE_KEY: '  site-key  ' }));
    expect(config.turnstileSiteKey).toBe('site-key');
  });
});
