import { AppConfig } from './config';
import { handleInvite } from './inviteApi';
import { renderJoinPage } from './joinPage';

export interface Env {
  DISCORD_BOT_TOKEN: string;
  TURNSTILE_SECRET_KEY: string;
  TURNSTILE_SITE_KEY: string;
  DISCORD_CHANNEL_ID: string;
  INVITE_MAX_AGE?: string;
  INVITE_MAX_USES?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const config = new AppConfig(env);
    const url = new URL(request.url);

    if (url.pathname === '/join' && request.method === 'GET') {
      const errors = config.getErrors();
      if (errors.length > 0) {
        return Response.json({ error: 'server_config_error' }, { status: 500 });
      }
      return new Response(renderJoinPage(config.turnstileSiteKey), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    if (url.pathname === '/api/invite' && request.method === 'POST') {
      return handleInvite(request, config);
    }

    return new Response('Not Found', { status: 404 });
  },
};
