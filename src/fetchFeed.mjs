export async function fetchFeed(url, { retries = 4, timeoutMs = 10_000 } = {}) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (res.ok) return res.json();

    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt >= retries) {
      throw new Error(`feed request failed: HTTP ${res.status}`);
    }

    const retryAfter = res.headers.get("retry-after");
    const retryAfterSeconds = retryAfter === null ? NaN : Number(retryAfter);
    const retryAfterDate = retryAfter === null ? NaN : Date.parse(retryAfter);
    const delay = Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0
      ? retryAfterSeconds * 1000
      : Number.isFinite(retryAfterDate)
        ? Math.max(0, retryAfterDate - Date.now())
        : Math.min(500 * 2 ** attempt, 8000);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
