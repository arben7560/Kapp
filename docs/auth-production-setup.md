# K-App authentication — production setup

The client is configured for Supabase PKCE auth and the native callback scheme
`kapp://`. No service-role secret belongs in Expo or in a client `.env` file.

## Supabase dashboard

1. Enable **Anonymous Sign-Ins**, Email, Google and Apple under Authentication.
   Configure CAPTCHA and the anonymous sign-in/IP rate limits before launch to
   prevent automated anonymous-user abuse.
2. Enable **Manual identity linking** for the Apple account-conversion flow.
   Google uses the standard OAuth sign-in flow for both registration and login;
   the existing local/cloud merge preserves guest progress across the UID change.
3. Add `kapp://**` to Authentication → URL Configuration → Redirect URLs.
4. Keep the project Site URL as the real web application URL; do not use it as a
   native callback and do not rely on `localhost:3000` in a release build.
5. Apply `supabase/migrations/20260818120000_user_progress.sql`.
6. Deploy the authenticated function:

   ```text
   supabase functions deploy delete-account
   ```

   JWT verification must remain enabled. The function obtains
   `SUPABASE_SERVICE_ROLE_KEY` only from the Edge Functions runtime.

## Google Cloud Console

1. Create/configure the Google OAuth consent screen.
2. Create a Web OAuth client for Supabase Auth.
3. Add Supabase's callback URL shown by the Google provider panel, generally
   `https://<project-ref>.supabase.co/auth/v1/callback`, as an authorized redirect.
4. Copy the client ID and client secret into the Supabase Google provider panel.

The app opens the Supabase authorization URL in a secure auth session; Supabase
then returns to `kapp://account`.

## Apple Developer

1. Configure Sign in with Apple for the K-App App ID
   (`com.arben60.kapp`) and create a Services ID for the Supabase web OAuth flow.
2. Register the Supabase domain and callback URL shown by the Apple provider
   panel (normally the same `/auth/v1/callback` endpoint).
3. Create an Apple Sign in key and configure its Team ID, Key ID, Services ID and
   private key in Supabase.
4. Verify the Apple secret rotation procedure before expiry.

K-App shows the Apple option only on iOS. Because this implementation uses the
Supabase browser OAuth flow rather than the native AppleAuthentication API, no
Apple entitlement is added by `app.json`.

## Expo / EAS environment

Set these public values for every build profile:

```text
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
EXPO_PUBLIC_SUPABASE_DELETE_ACCOUNT_FUNCTION=delete-account
```

After changing auth providers, redirect URLs or native configuration, produce a
new development/release build and test the complete flow on physical Android and
iOS devices. Expo Go is not the production callback environment.

## OAuth callback diagnostics and device validation

Supabase still receives `kapp://account?action=oauth-login-google` (or the
corresponding Apple/link action). The browser session matches `kapp://account`
without query parameters: Expo's Android polyfill uses a string prefix, and
Supabase may return `code` before `action`. K-App then validates the destination
and processes query or fragment auth parameters through the same handler for
Linking, the initial URL and the browser result. Duplicate delivery shares the
same exchange. The action remains available to Expo Router's onboarding guard.

OAuth success requires a callback-established, non-anonymous session and a
server-verified user with the requested provider; linking also checks the UID.
Android browser dismissal waits for an already received Linking exchange.
Cancellation without a callback releases loading immediately. There is no new
authentication timeout; a pending browser or network exchange remains pending
until the browser or SDK reports its result.

Temporary `[auth:oauth]` logs are enabled only in development (`__DEV__`). They
record steps, callback source, payload-presence flags and mapped error labels.
They never log URLs, auth codes, tokens, identities or raw errors. Remove these
temporary diagnostics after device validation.

Automated checks: `npm run test:oauth`, `npm run test:auth-production`,
`npm run test:auth-sync`, `npm run test:progress-cloud`, and `npx tsc --noEmit`.
The OAuth tests use native/browser/Supabase adapters; they do not authenticate
against a live service. Validate the following on physical devices:

- Android development build: Google sign-in from a guest, both new and existing
  Google accounts, with the app warm and after a cold start. Confirm the Google
  account is shown and guest progress survives the existing merge.
- Close the account picker/custom tab or press Android Back; also deny access.
  Confirm loading clears and another attempt works.
- Return to K-App without a recognized auth callback; confirm loading clears
  when the browser reports dismissal. Check a slow valid authentication can
  still finish, and test loss of connectivity during the exchange.
- In development logs, confirm `callback.received`, one `callback.exchange-code`,
  `success` and `loading.released`; callbacks can arrive through Linking and the
  browser in either order. On failure, expect `failed` and `loading.released`.
- Verify email/password login, password-recovery and account-protection links,
  ordinary app deep links, and Apple linking on iOS (including cancellation).

## Conflict policy

`user_progress` is the cloud source and the device snapshot is local-first. On
login, K-App downloads the target UID's row and performs a monotonic merge:
completed content is unioned and advancement counters/scores keep the furthest
known value. It then uploads the merged snapshot. A fresh guest UID therefore
cannot overwrite a more advanced permanent account.
