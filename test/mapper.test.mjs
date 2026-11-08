import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateFeed } from "../src/schema.mjs";
import { mapFeed } from "../src/mapper.mjs";

const feed = JSON.parse(readFileSync(new URL("../fixtures/sessionize-v1.json", import.meta.url), "utf8"));

test("fixture matches schema", () => assert.deepEqual(validateFeed(feed), []));
test("maps building/level/room", () => {
  const s = mapFeed({ ...feed, sessions: [{ ...feed.sessions[0], roomId: 82947 }] })[0];
  assert.equal(s.building, "Salt Palace");
  assert.equal(s.level, "Level 1");
  assert.equal(s.room, "Hall DE");
});
test("all sessions map", () => assert.equal(mapFeed(feed).length, feed.sessions.length));
test("rejects non-object", () => assert.ok(validateFeed(null).length > 0));
