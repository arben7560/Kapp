import { toKappAuthError } from "./authErrors";

/** Supabase builds the OAuth URL locally; check its response before opening
 * Android's browser so an unconfigured provider does not display raw JSON. */
export async function assertCustomProviderAvailable(
  authorizeUrl: string,
  request: typeof fetch = fetch,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await request(authorizeUrl, {
      redirect: "manual",
      signal: controller.signal,
    });
    // A configured provider redirects to LINE. Only errors from Supabase
    // belong to this app; the browser handles the provider's own pages.
    if (response.status < 400 ||
        (response.url && new URL(response.url).origin !== new URL(authorizeUrl).origin)) return;
    const body = await response.text();
    let detail: { error_code?: string; msg?: string; message?: string } = {};
    try { detail = JSON.parse(body); } catch { /* Use the response text below. */ }
    throw toKappAuthError(Object.assign(
      new Error(detail.msg ?? detail.message ?? body.slice(0, 500)),
      { code: detail.error_code },
    ));
  } catch (caught) {
    if (controller.signal.aborted) throw new Error("Authentication network timeout", { cause: caught });
    throw caught;
  } finally {
    clearTimeout(timer);
  }
}
