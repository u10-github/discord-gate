# Security Policy

## Maintenance Status

This project is published as an as-is OSS reference implementation and is not actively maintained.

There is no guaranteed security support window, response timeline, patch schedule, or release schedule.

Use this project at your own risk. If you operate it for a real Discord server, you are responsible for reviewing, deploying, monitoring, and maintaining your own fork.

## Supported Versions

No upstream versions are formally supported.

| Version | Supported |
|---|---|
| main | No guaranteed support |
| forks | Maintained by each fork owner |

## Reporting Security Issues

Avoid posting credentials, tokens, live server information, or detailed operational secrets in public issues.

If GitHub private vulnerability reporting is enabled for the public repository, use it. Otherwise, keep public reports minimal and remove sensitive details.

The maintainer may review reports when possible, but response and fixes are not guaranteed.

## Operator Responsibilities

Before operating this project publicly:

- Review Discord bot permissions.
- Store Discord Bot Token only in Cloudflare Worker Secrets.
- Store Turnstile Secret Key only in Cloudflare Worker Secrets.
- Do not store Discord or Turnstile runtime secrets in GitHub Secrets.
- Delete existing active Discord invite links after enabling Discord Gate.
- Remove `Create Invite` / `招待リンク作成` from `@everyone`.
- Check channel-level permission overrides for `@everyone`.
- Keep invite creation limited to the bot and trusted operators.
- Monitor Cloudflare Worker logs after release.

## Emergency Operation

If suspicious activity occurs:

1. Raise Discord Server Verification Level to `Highest`.
2. Remove the public `/join` URL from websites, social links, and announcements.
3. Disable or roll back the Cloudflare Worker if invite issuance must stop.
4. Revoke suspicious Discord invite links.
5. Rotate relevant credentials if compromise is suspected.