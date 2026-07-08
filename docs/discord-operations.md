# Discord Operations

Discord Gate only controls invite links that it creates. It does not invalidate existing Discord invite links.

Complete these operations before treating Discord Gate as effective for a real server.

## 1. Delete Existing Active Invite Links

- Open Discord Server Settings.
- Open the invite management screen.
- Revoke or delete existing active invite links.

Old invite links can bypass Discord Gate because they do not pass through Cloudflare Turnstile.

## 2. Remove Invite Creation from `@everyone`

- Open Discord Server Settings → Roles → `@everyone`.
- Disable `Create Invite` / `招待リンク作成`.
- Check channel-level permission overrides.
- Remove `Create Invite` / `招待リンク作成` from `@everyone` wherever it is explicitly allowed.

## 3. Restrict Invite Creation

Keep invite creation limited to:

- the Discord bot used by this Worker
- trusted operators, if your server operation requires it

Ordinary members should not be able to create bypass invite links.

## 4. Incident Response

If suspicious activity occurs:

1. Raise Discord Server Verification Level to `Highest`.
2. Remove the public `/join` URL from websites, social links, and announcements.
3. Revoke suspicious or unexpected Discord invite links.
4. Disable or roll back the Cloudflare Worker if invite issuance must stop.
5. Rotate relevant credentials if compromise is suspected.

## 5. Restore Normal Operation

After investigation:

- restore Discord Verification Level to the intended setting
- re-enable or redeploy the Worker
- confirm old invite links are still revoked
- confirm `@everyone` still cannot create invites
