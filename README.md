# Discord Gate

Discord Gate is a Cloudflare Turnstile based one-time invite gateway for Discord servers.

It serves a `/join` page, verifies Cloudflare Turnstile server-side, creates a one-time short-lived Discord invite through the Discord API, and redirects the user to that invite.

## Maintenance Policy

This repository is published as an as-is OSS reference implementation.

- This project is not actively maintained.
- Pull requests are not accepted for normal upstream development.
- Feature requests and support requests are not guaranteed to be answered.
- Forks are welcome. If you want to modify or operate this project, fork it and maintain your own copy.

The intended usage model is:

1. Read the code and documentation.
2. Fork the repository.
3. Configure your own Cloudflare, Turnstile, and Discord resources.
4. Operate your fork at your own risk.

## What This Does

- Shows a public `/join` page.
- Verifies Cloudflare Turnstile server-side.
- Creates a Discord invite through the Discord API only after verification succeeds.
- Uses one-time, short-lived invite links.
- Avoids exposing a fixed Discord invite link in frontend HTML.

## What This Does Not Do

- It does not moderate Discord users after they join.
- It does not replace Discord server role design.
- It does not delete or invalidate existing Discord invite links.
- It does not prevent trusted users with invite permissions from creating bypass links.
- It does not provide managed hosting or support.

## Quick Start

```bash
npm install
npm run check
```

Local / preview execution depends on your Cloudflare Workers setup. See `docs/setup.md`.

## Required Discord Operations

Discord Gate only controls invite links that it creates. It does not invalidate existing Discord invite links.

After setting up this application for a real Discord server, perform these Discord-side operations.

### 1. Delete existing active invite links

- Go to Discord Server Settings.
- Open the invite management screen.
- Revoke/delete all existing active invite links that can bypass Discord Gate.

### 2. Remove invite creation from `@everyone`

- Go to Discord Server Settings → Roles → `@everyone`.
- Disable `Create Invite` / `招待リンク作成`.
- Check channel-level permission overrides as well.
- Remove `Create Invite` / `招待リンク作成` from `@everyone` wherever it is explicitly allowed.

### 3. Restrict invite creation

- The Discord bot used by this Worker needs permission to create invites for the configured channel.
- Trusted operators may also keep invite creation permission if your server operation requires it.
- Ordinary members should not be able to create bypass invite links.

If these Discord-side operations are skipped, users may still join through old or manually-created Discord invite links without passing Cloudflare Turnstile.

## Expected Discord Server Posture

- Verification Level is normally `High`.
- New members are constrained by Discord-side roles after joining.
- During suspicious activity, operators can raise Verification Level to `Highest`.
- Invite creation is limited to the bot and trusted operators.

## Secrets

Never commit secrets.

- Discord Bot Token: Cloudflare Worker Secret only.
- Turnstile Secret Key: Cloudflare Worker Secret only.
- GitHub Secrets: Cloudflare deploy credentials only.

## Deployment Model

This project is designed for Cloudflare Workers with Wrangler.

The active GitHub Actions workflow in this repository runs CI only. A deploy workflow is provided as an example under `docs/examples/deploy.yml`; copy it into `.github/workflows/deploy.yml` in your fork only after you have reviewed and configured your own Cloudflare credentials.

Runtime secrets stay in Cloudflare Worker Secrets.

## Project Structure

```text
src/app         Worker routes and request/response handling
src/core        Invite policy, use-case, domain types, and ports
src/extensions  Cloudflare Turnstile, Discord API, rate-limit, and logging adapters
docs            Public setup and operation notes
scripts         Local guard scripts
```

## Forking

Forking is the recommended way to use this project.

Suggested fork workflow:

1. Fork this repository.
2. Rename the Cloudflare Worker and Discord resources for your own environment.
3. Review all security settings before public use.
4. Configure secrets in Cloudflare and GitHub.
5. Delete old Discord invite links and remove invite creation from `@everyone`.
6. Deploy your fork.

## License

This project is published under the MIT License. See `LICENSE`.