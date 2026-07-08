# Public Repository Publication Checklist

Use this checklist when copying implementation files from the private development repository.

## Repository Preparation

- [x] Create a separate public repository.
- [x] Add public-facing README.
- [x] Add CONTRIBUTING policy.
- [x] Add SECURITY policy.
- [x] Add LICENSE.
- [x] Add PR template stating that normal upstream PRs are not accepted.
- [x] Disable blank issues through issue template configuration.
- [ ] Copy source files that are safe to publish.
- [ ] Remove private development notes, internal work logs, and environment-specific values.
- [ ] Confirm no secrets are included.
- [ ] Confirm no private Discord server IDs, channel IDs, account IDs, or operationally sensitive values are included.

## GitHub Settings

- [ ] Consider disabling Issues entirely if support requests should not be accepted.
- [ ] Consider adding repository description: `Cloudflare Turnstile based one-time invite gateway for Discord servers.`
- [ ] Add topics if useful: `discord`, `cloudflare-workers`, `turnstile`, `typescript`.

## Discord Operation Notes to Keep in Public README

Keep the following warnings visible in the public README:

- Discord Gate does not invalidate existing Discord invite links.
- After setup, delete existing active invite links from Discord management.
- Remove `Create Invite` / `招待リンク作成` from `@everyone`.
- Check channel-level permission overrides for `@everyone`.
- Keep invite creation limited to the bot and trusted operators.

## Final Human Review Before Adding Code

Before copying implementation files into this public repository:

- [ ] Search for `DISCORD_BOT_TOKEN` values or token-looking strings.
- [ ] Search for `TURNSTILE_SECRET_KEY` values or secret-looking strings.
- [ ] Search for Cloudflare account IDs and API tokens.
- [ ] Search for private Discord server or channel IDs if they should not be public.
- [ ] Review `wrangler.toml` and decide whether to replace real public site/channel values with placeholders.
- [ ] Review `.github/workflows/` before enabling deploy behavior in the public repository.