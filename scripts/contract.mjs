// Schedule-feed contract: fetch from upstream, validate schema, map sessions.
import { fetchFeed } from "../src/fetchFeed.mjs";
import { validateFeed } from "../src/schema.mjs";
import { mapFeed } from "../src/mapper.mjs";

const url = process.env.FEED_URL ?? "http://127.0.0.1:8089/api/schedule";
const feed = await fetchFeed(url);
const errors = validateFeed(feed);
if (errors.length) {
  console.error(`Schema validation failed (${errors.length} errors):`);
  errors.slice(0, 10).forEach((e) => console.error(" - " + e));
  process.exit(1);
}
const sessions = mapFeed(feed);
if (!sessions.length) throw new Error("no sessions mapped");
console.log(`contract ok: ${sessions.length} sessions`);
