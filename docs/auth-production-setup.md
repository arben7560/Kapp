# K-App authentication — production setup

The client is configured for Supabase PKCE auth and the native callback scheme
`kapp://`. No service-role secret belongs in Expo or in a client `.env` file.

## Supabase dashboard

1. Enable **Anonymous Sign-Ins**, Email, Google and Apple under Authentication.
   Configure CAPTCHA and the anonymous sign-in/IP rate limits before launch to
   prevent automated anonymous-user abuse.
2. Enable **Manual identity linking**. K-App uses `linkIdentity` while the current
   user is anonymous so the existing UID and `user_progress` row are preserved.
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

## Conflict policy

`user_progress` is the cloud source and the device snapshot is local-first. On
login, K-App downloads the target UID's row and performs a monotonic merge:
completed content is unioned and advancement counters/scores keep the furthest
known value. It then uploads the merged snapshot. A fresh guest UID therefore
cannot overwrite a more advanced permanent account.
