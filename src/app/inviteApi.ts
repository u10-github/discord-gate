import type { InviteResult } from '../core/types';
import { InviteUseCase } from '../core/use-case';
import { ConsoleAuditLogger } from '../extensions/console-audit-logger';
import { DiscordInviteIssuer } from '../extensions/discord-invite-issuer';
import { SimpleRateLimiter } from '../extensions/simple-rate-limiter';
import { TurnstileVerifier } from '../extensions/turnstile-verifier';
import type { AppConfig } from './config';

export async function handleInvite(request: Request, config: AppConfig): Promise<Response> {
  const errors = config.getErrors();
  if (errors.length > 0) {
    return Response.json({ error: 'server_config_error' }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: 'invalid_request' }, { status: 400 });
  }
  const auditLogger = new ConsoleAuditLogger();
  const token = formData.get('token')?.toString() ?? '';

  const useCase = new InviteUseCase(
    config.getPolicy(),
    new TurnstileVerifier(config.turnstileSecretKey, undefined, auditLogger),
    new DiscordInviteIssuer(config.discordBotToken, config.discordChannelId),
    new SimpleRateLimiter(),
    auditLogger,
    { now: () => new Date() },
  );

  const result: InviteResult = await useCase.execute(token, request.headers.get('CF-Connecting-IP') ?? 'unknown');

  if (result.success) {
    return Response.json({ inviteUrl: result.inviteUrl }, { status: 200 });
  }

  return Response.json({ error: result.error }, { status: 400 });
}
