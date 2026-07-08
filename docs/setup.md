# Setup Guide

This guide is intentionally generic. Use your own Cloudflare, Turnstile, and Discord resources.

## Requirements

- Node.js 20+
- npm
- Cloudflare account
- Cloudflare Workers / Wrangler setup
- Cloudflare Turnstile widget
- Discord server where you can manage bot permissions and invite permissions
- Discord bot token with the minimum permissions needed to create invites for the configured channel

## Install

```bash
npm install
npm run check
```

## Configure Wrangler

Copy `wrangler.toml` values to your own environment.

```toml
name = "discord-gate"
main = "src/app/worker.ts"
compatibility_date = "2026-07-08"

[vars]
TURNSTILE_SITE_KEY = "your-turnstile-site-key"
DISCORD_CHANNEL_ID = "your-discord-channel-id"
INVITE_MAX_AGE = "900"
INVITE_MAX_USES = "1"
```

`TURNSTILE_SITE_KEY` and `DISCORD_CHANNEL_ID` are not secrets, but they are environment-specific. Do not reuse the example values blindly.

## Configure Worker Secrets

Store runtime secrets in Cloudflare Worker Secrets.

Required secrets:

- `DISCORD_BOT_TOKEN`
- `TURNSTILE_SECRET_KEY`

Do not put these values in GitHub, `wrangler.toml`, `.env`, docs, issues, or pull requests.

## Discord Permissions

The bot needs permission to create invites for the configured channel.

After setup, also complete the Discord-side hardening steps in `docs/discord-operations.md`.

## Deploy

This repository only includes CI as an active GitHub Actions workflow.

A deploy workflow example is available at `docs/examples/deploy.yml`. Copy it to `.github/workflows/deploy.yml` in your fork only after reviewing it and adding your own GitHub Secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

Runtime secrets still belong in Cloudflare Worker Secrets, not GitHub Secrets.
