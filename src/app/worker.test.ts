import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import worker from './worker';
import type { Env } from './worker';

const env: Env = {
  DISCORD_BOT_TOKEN: 'test-bot-token',
  TURNSTILE_SECRET_KEY: 'test-secret',
  TURNSTILE_SITE_KEY: 'test-site-key',
  DISCORD_CHANNEL_ID: 'test-channel',
};

beforeEach(() => {
  const mockFetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
    if (url.includes('turnstile')) {
      const params = new URLSearchParams(init?.body?.toString() ?? '');
      const token = params.get('response') ?? '';
      const success = token === 'valid-token';
      return new Response(JSON.stringify({ success }), { status: 200 });
    }
    if (url.includes('discord.com')) {
      return new Response(JSON.stringify({ code: 'test-invite' }), { status: 200 });
    }
    return new Response('ok', { status: 200 });
  });
  vi.stubGlobal('fetch', mockFetch);
});

describe('worker fetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns 200 with HTML on GET /join', async () => {
    const request = new Request('http://test/join');
    const response = await worker.fetch(request, env);

    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('test-site-key');
    expect(text).toContain('cf-turnstile');
  });

  it('returns 404 on unknown path', async () => {
    const request = new Request('http://test/unknown');
    const response = await worker.fetch(request, env);

    expect(response.status).toBe(404);
  });

  it('returns 200 with JSON inviteUrl on valid token', async () => {
    const request = new Request('http://test/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'token=valid-token',
    });
    const response = await worker.fetch(request, env);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('inviteUrl');
  });

  it('returns 400 with error on invalid token', async () => {
    const request = new Request('http://test/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'token=invalid-token',
    });
    const response = await worker.fetch(request, env);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('returns 400 with error on missing token', async () => {
    const request = new Request('http://test/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: '',
    });
    const response = await worker.fetch(request, env);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('returns 500 with error on missing config for GET /join', async () => {
    const request = new Request('http://test/join');
    const response = await worker.fetch(request, { ...env, TURNSTILE_SITE_KEY: '' });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('returns 500 with error on missing config for POST', async () => {
    const request = new Request('http://test/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'token=valid-token',
    });
    const response = await worker.fetch(request, { ...env, TURNSTILE_SITE_KEY: '' });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('returns 400 with error on malformed POST body', async () => {
    const request = new Request('http://test/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ broken json',
    });
    const response = await worker.fetch(request, env);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('returns 404 for GET /api/invite (wrong method)', async () => {
    const request = new Request('http://test/api/invite');
    const response = await worker.fetch(request, env);

    expect(response.status).toBe(404);
  });

  it('returns 400 with error on verification-failed token', async () => {
    const request = new Request('http://test/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'token=rate-limited-token',
    });
    const response = await worker.fetch(request, env);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });
});
