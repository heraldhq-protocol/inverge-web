# Public creator profiles

Status: **shipped for the existing data model.** No Prisma migration was needed:
`CreatorProfile.username` is already unique and the API already exposes
`GET /api/v1/auth/creators/:idOrUsername`.

## Route

`/u/[username]` is a public marketing route. It renders inside the marketing
layout (header and footer), so it is reachable without a session. The route
normalises the parameter to lowercase, strips a leading `@`, and accepts only
`^[a-z0-9_-]{3,30}$`. Anything else is a 404 without an API call.

The page resolves the profile through
`src/features/profile/server/public-profile.ts`:

- `404` from the API becomes the app's not-found page.
- An unconfigured or unreachable API renders an "unavailable" state rather than
  claiming the creator does not exist.
- Any other API failure reaches the route error boundary.

`generateMetadata` uses the same cached lookup, so the title and canonical URL
cannot describe a different creator from the one on screen.

## What is public

The API projection (`toPublicCreator`) is already an allowlist. The web maps it
again into `PublicProfile` and never spreads the response:

- display name, username, avatar URL, bio, links, tier, completed campaigns,
  identity-verified flag, and tenure start;
- recent public ideas (`VALIDATING`, `THRESHOLD_MET`, `CONVERTED`), capped by the
  API;
- public ideas the creator has supported.

The "public ideas" count is the number of public rows returned, not the API's
`ideasPublished` count, because that count includes drafts.

The following never leave the API through this route and are not rendered:

- email addresses, provider subject ids, wallet addresses, KYC/AML records,
  account settings, moderation notes, and internal timestamps.

Profile links are user-authored. Only absolute `http:`/`https:` URLs are
rendered, so a stored `javascript:` or `data:` value cannot become a click
target. Avatars are rendered only from the configured image hosts and paths
(`images.unsplash.com/photo-*` and Google's
`lh3`–`lh6.googleusercontent.com/a*`); otherwise the initials fallback is used.

## OAuth profile image

When Web3Auth verifies a Google identity token with a `picture` claim, the API
validates the URL against Google's avatar hosts and stores it as
`CreatorProfile.avatarUrl` only when the profile has no avatar. The browser
never supplies this URL: it comes from the verified token. The web filters it
again before rendering, so the allowlist is enforced on both sides. This stores
an external reference, not an uploaded file; the upload pipeline remains
deferred.

## Username resolution

The API can resolve an id as well as a stored username. The web route only
serves a **stored, routable handle**:

- the requested value must match `creator.username` after normalisation;
- the handle must not equal the internal user id;
- a derived display-name slug or the id fallback is rejected.

This keeps `/u/[username]` stable when a display name changes and avoids
publishing an internal identifier as a profile URL.

## Links into profiles

- The authenticated marketing navbar links to `/u/<username>` when the session
  has a stored handle; otherwise it links to the signed-in profile at
  `/d/profile`.
- An idea detail page links its creator name to the public profile when the
  API supplied a stored handle.

## Deferred: image uploads

Avatar and idea/campaign media uploads are **out of scope** for this change. No
storage provider, upload endpoint, signed-upload flow, image-processing
pipeline, or new storage environment variable was added. A future upload
feature needs:

- file type and size validation, and image re-encoding;
- per-object ownership and deletion rules;
- a storage provider and credentials;
- moderation and abuse handling;
- a migration only if the current `avatarUrl`/`coverImageUrl` string fields are
  insufficient.

Until then, the profile shows initials when no allowlisted avatar URL exists.
