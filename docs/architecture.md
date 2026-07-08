# Architecture

Discord Gate uses a small Core & Extensions architecture.

## Layers

```text
src/app         Cloudflare Worker routes and request/response handling
src/core        invite policy, use-case, domain types, and ports
src/extensions  Cloudflare Turnstile, Discord API, rate-limit, and logging adapters
```

## Dependency Direction

Allowed direction:

```text
app -> core
app -> extensions
extensions -> core ports
core -> no app / extensions dependency
```

The core layer does not read environment variables, perform HTTP calls, or depend on Worker runtime APIs.

## Main Flow

1. User opens `/join`.
2. Worker renders an HTML page with Cloudflare Turnstile.
3. User completes the Turnstile challenge.
4. Frontend posts the Turnstile token to `/api/invite`.
5. Worker verifies the token server-side through Cloudflare Siteverify.
6. Worker creates a one-time short-lived Discord invite through the Discord API.
7. Worker returns the invite URL.
8. Browser redirects the user to Discord.

## Fail-Closed Behavior

The invite is not issued when:

- required configuration is missing
- Turnstile verification fails
- rate-limit check fails
- Discord invite issuance fails
- unexpected adapter errors occur

User-facing errors avoid sensitive internal details. Operational diagnostics are logged through the audit logger.