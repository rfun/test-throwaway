export async function fetchFeed(url, { retries = 4, timeoutMs = 10_000, maxDelayMs = 30_000 } = {}) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (res.ok) return res.json();

    await res.body?.cancel();
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt >= retries) {
      throw new Error(`feed request failed: HTTP ${res.status}`);
    }

    const retryAfter = res.headers.get("retry-after");
    const retryAfterSeconds = retryAfter === null ? NaN : Number(retryAfter);
    const retryAfterDate = retryAfter === null ? NaN : Date.parse(retryAfter);
    const requested = Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0
      ? retryAfterSeconds * 1000
      : Number.isFinite(retryAfterDate)
        ? Math.max(0, retryAfterDate - Date.now())
        : 500 * 2 ** attempt;
    const delay = Math.min(requested, maxDelayMs);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
