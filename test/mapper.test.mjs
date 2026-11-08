import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateFeed } from "../src/schema.mjs";
import { mapFeed } from "../src/mapper.mjs";

const feed = JSON.parse(readFileSync(new URL("../fixtures/sessionize-v1.json", import.meta.url), "utf8"));
const feedV2 = JSON.parse(readFileSync(new URL("../fixtures/sessionize-v2.json", import.meta.url), "utf8"));

test("v1 fixture matches schema", () => assert.deepEqual(validateFeed(feed), []));
test("v2 fixture matches schema", () => assert.deepEqual(validateFeed(feedV2), []));
test("maps v1 building/level/room", () => {
  const s = mapFeed({ ...feed, sessions: [{ ...feed.sessions[0], roomId: 82947 }] })[0];
  assert.equal(s.building, "Salt Palace");
  assert.equal(s.level, "Level 1");
  assert.equal(s.room, "Hall DE");
});
test("maps v2 timestamps and building/level/room", () => {
  const source = feedV2.sessions[0];
  const s = mapFeed({ ...feedV2, sessions: [{ ...source, roomId: 82947 }] })[0];
  assert.equal(s.startsAt, source.starts_at);
  assert.equal(s.endsAt, source.ends_at);
  assert.equal(s.building, "Salt Palace");
  assert.equal(s.level, "Level 1");
  assert.equal(s.room, "Hall DE");
});
test("rejects non-string v2 timestamps", () => {
  const invalid = { ...feedV2, sessions: [{ ...feedV2.sessions[0], starts_at: 123 }] };
  assert.ok(validateFeed(invalid).some((error) => error.includes("startsAt or starts_at must be string")));
});
test("all sessions map", () => assert.equal(mapFeed(feed).length, feed.sessions.length));
test("rejects non-object", () => assert.ok(validateFeed(null).length > 0));
