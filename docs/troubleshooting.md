# Troubleshooting

## `/join` returns `server_config_error`

Check that required runtime values are configured.

Required non-secret vars in `wrangler.toml`:

- `TURNSTILE_SITE_KEY`
- `DISCORD_CHANNEL_ID`
- `INVITE_MAX_AGE`
- `INVITE_MAX_USES`

Required Cloudflare Worker Secrets:

- `DISCORD_BOT_TOKEN`
- `TURNSTILE_SECRET_KEY`

## Turnstile Verification Fails

Check Worker logs for `turnstile_verification_failed`.

Common diagnostic reasons:

- `missing_secret_key`: `TURNSTILE_SECRET_KEY` is not configured.
- `missing_token`: request did not include a Turnstile token.
- `siteverify_rejected`: Cloudflare Siteverify rejected the token.
- `non_ok_response`: Siteverify returned an HTTP error.
- `malformed_response`: Siteverify response was not valid JSON.
- `network_error`: Worker could not reach Siteverify.

Also verify that the Turnstile site key and secret key belong to the same widget, and that the widget hostname settings include your Worker hostname.

## Discord Invite Issuance Fails

Check:

- `DISCORD_BOT_TOKEN` is configured as a Worker Secret.
- `DISCORD_CHANNEL_ID` points to the intended channel.
- the bot has access to the channel.
- the bot has permission to create invites for the channel.

## Users Can Still Join Without Turnstile

Discord Gate does not invalidate existing invite links.

Check Discord directly:

- delete existing active invite links.
- remove `Create Invite` / `招待リンク作成` from `@everyone`.
- check channel-level permission overrides.
- restrict invite creation to the bot and trusted operators.
