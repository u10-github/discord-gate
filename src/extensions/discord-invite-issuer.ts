import type { InviteIssuer } from '../core/ports';

interface CreateInviteResponse {
  code: string;
}

const API_BASE = 'https://discord.com/api/v10';

const ISSUANCE_FAILED = 'Discord invite issuance failed';

export class DiscordInviteIssuer implements InviteIssuer {
  constructor(
    private readonly botToken: string,
    private readonly channelId: string,
    private readonly fetchFn: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> = (input, init) =>
      fetch(input, init),
  ) {}

  async createInvite(maxUses: number, maxAgeSeconds: number): Promise<string> {
    const botToken = this.botToken.trim();
    const channelId = this.channelId.trim();

    if (!botToken) throw new Error('Missing bot token');
    if (!channelId) throw new Error('Missing channel ID');

    try {
      const url = `${API_BASE}/channels/${channelId}/invites`;
      const response = await this.fetchFn(url, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          max_age: maxAgeSeconds,
          max_uses: maxUses,
          unique: true,
          temporary: false,
        }),
      });

      if (!response.ok) throw new Error();
      const data: CreateInviteResponse = await response.json();
      if (!data?.code) throw new Error();
      return `https://discord.gg/${data.code}`;
    } catch {
      throw new Error(ISSUANCE_FAILED);
    }
  }
}
