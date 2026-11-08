import test from "node:test";
import assert from "node:assert/strict";
import { fetchFeed } from "../src/fetchFeed.mjs";

test("retries rate limits and honors Retry-After", async () => {
  const originalFetch = globalThis.fetch;
  const originalSetTimeout = globalThis.setTimeout;
  const delays = [];
  let calls = 0;
  globalThis.fetch = async (_url, { signal }) => {
    assert.ok(signal instanceof AbortSignal);
    calls++;
    if (calls <= 2) return new Response("rate limited", { status: 429, headers: { "Retry-After": "1" } });
    return new Response('{"sessions":[]}', { status: 200 });
  };
  globalThis.setTimeout = (callback, delay) => {
    delays.push(delay);
    queueMicrotask(callback);
    return 0;
  };

  try {
    assert.deepEqual(await fetchFeed("https://feed.example"), { sessions: [] });
    assert.equal(calls, 3);
    assert.deepEqual(delays, [1000, 1000]);
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.setTimeout = originalSetTimeout;
  }
});

test("does not retry non-retryable responses", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return new Response("unauthorized", { status: 401 });
  };

  try {
    await assert.rejects(fetchFeed("https://feed.example"), /HTTP 401/);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("stops retrying after the configured limit", async () => {
  const originalFetch = globalThis.fetch;
  const originalSetTimeout = globalThis.setTimeout;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return new Response("unavailable", { status: 503 });
  };
  globalThis.setTimeout = (callback) => {
    queueMicrotask(callback);
    return 0;
  };

  try {
    await assert.rejects(fetchFeed("https://feed.example", { retries: 2 }), /HTTP 503/);
    assert.equal(calls, 3);
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.setTimeout = originalSetTimeout;
  }
});

test("applies the per-request timeout", async () => {
  const originalFetch = globalThis.fetch;
  const keepAlive = setTimeout(() => {}, 50);
  globalThis.fetch = (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(signal.reason), { once: true });
  });

  try {
    await assert.rejects(fetchFeed("https://feed.example", { timeoutMs: 5 }), (error) => error.name === "TimeoutError");
  } finally {
    clearTimeout(keepAlive);
    globalThis.fetch = originalFetch;
  }
});
