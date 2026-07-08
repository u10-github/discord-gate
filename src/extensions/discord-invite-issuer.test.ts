import { describe, expect, it, vi } from 'vitest';
import type { InviteIssuer } from '../core/ports';
import { DiscordInviteIssuer } from './discord-invite-issuer';

function createMockFetch(overrides: Partial<{ ok: boolean; status: number; json: () => unknown }>): typeof fetch {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ code: 'abc123' }),
    ...overrides,
  }) as unknown as typeof fetch;
}

describe('DiscordInviteIssuer', () => {
  it('implements InviteIssuer port', () => {
    const issuer = new DiscordInviteIssuer('bot-token', 'channel-123');
    expect(issuer).toSatisfy((v: InviteIssuer) => typeof v.createInvite === 'function');
  });

  it('returns invite URL on successful API response', async () => {
    const mockFetch = createMockFetch({
      json: () => ({ code: 'abc123' }),
    });
    const issuer = new DiscordInviteIssuer('bot-token', 'channel-123', mockFetch);

    const url = await issuer.createInvite(1, 900);

    expect(url).toBe('https://discord.gg/abc123');
  });

  it('throws when bot token is empty', async () => {
    const issuer = new DiscordInviteIssuer('', 'channel-123');

    await expect(issuer.createInvite(1, 900)).rejects.toThrow('Missing bot token');
  });

  it('throws when bot token is only whitespace', async () => {
    const issuer = new DiscordInviteIssuer('   ', 'channel-123');

    await expect(issuer.createInvite(1, 900)).rejects.toThrow('Missing bot token');
  });

  it('throws when channel ID is empty', async () => {
    const issuer = new DiscordInviteIssuer('bot-token', '');

    await expect(issuer.createInvite(1, 900)).rejects.toThrow('Missing channel ID');
  });

  it('throws when channel ID is only whitespace', async () => {
    const issuer = new DiscordInviteIssuer('bot-token', '   ');

    await expect(issuer.createInvite(1, 900)).rejects.toThrow('Missing channel ID');
  });

  it('normalizes bot token with leading/trailing whitespace', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ code: 'abc' }),
    }) as unknown as typeof fetch;
    const issuer = new DiscordInviteIssuer('  my-token  ', 'channel-123', mockFetch);

    await issuer.createInvite(1, 900);

    const headers = (mockFetch as ReturnType<typeof vi.fn>).mock.calls[0][1].headers;
    expect(headers.Authorization).toBe('Bot my-token');
  });

  it('normalizes channel ID with leading/trailing whitespace', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ code: 'abc' }),
    }) as unknown as typeof fetch;
    const issuer = new DiscordInviteIssuer('bot-token', '  ch-123  ', mockFetch);

    await issuer.createInvite(1, 900);

    const url = (mockFetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(url).toBe('https://discord.com/api/v10/channels/ch-123/invites');
  });

  it('throws generic error on non-ok HTTP response', async () => {
    const mockFetch = createMockFetch({ ok: false, status: 401 });
    const issuer = new DiscordInviteIssuer('bot-token', 'channel-123', mockFetch);

    await expect(issuer.createInvite(1, 900)).rejects.toThrow('Discord invite issuance failed');
  });

  it('throws generic error on malformed response without code field', async () => {
    const mockFetch = createMockFetch({
      json: () => ({ max_uses: 1 }),
    });
    const issuer = new DiscordInviteIssuer('bot-token', 'channel-123', mockFetch);

    await expect(issuer.createInvite(1, 900)).rejects.toThrow('Discord invite issuance failed');
  });

  it('throws generic error on network error', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network failure')) as unknown as typeof fetch;
    const issuer = new DiscordInviteIssuer('bot-token', 'channel-123', mockFetch);

    await expect(issuer.createInvite(1, 900)).rejects.toThrow('Discord invite issuance failed');
  });

  it('sends correct request body and headers', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ code: 'invite123' }),
    }) as unknown as typeof fetch;
    const issuer = new DiscordInviteIssuer('my-token', 'my-channel', mockFetch);

    await issuer.createInvite(1, 900);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://discord.com/api/v10/channels/my-channel/invites',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bot my-token',
          'Content-Type': 'application/json',
        }),
      }),
    );
    const callBody = JSON.parse((mockFetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(callBody).toEqual({
      max_age: 900,
      max_uses: 1,
      unique: true,
      temporary: false,
    });
  });
});
