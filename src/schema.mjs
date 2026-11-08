// Contract for the schedule feed (shape recorded from the real Sessionize /api/schedule).
const isStr = (v) => typeof v === "string";
const isNum = (v) => typeof v === "number";
const isArr = Array.isArray;

export function validateFeed(feed) {
  const errors = [];
  if (!feed || typeof feed !== "object") return ["feed is not an object"];
  for (const k of ["sessions", "rooms", "speakers", "categories"]) {
    if (!isArr(feed[k])) errors.push(`${k} must be an array`);
  }
  if (errors.length) return errors;
  feed.sessions.forEach((s, i) => {
    if (!isStr(s.id)) errors.push(`sessions[${i}].id must be string`);
    if (!isStr(s.title)) errors.push(`sessions[${i}].title must be string`);
    if (!isStr(s.startsAt)) errors.push(`sessions[${i}].startsAt must be string`);
    if (!isStr(s.endsAt)) errors.push(`sessions[${i}].endsAt must be string`);
    if (!isNum(s.roomId)) errors.push(`sessions[${i}].roomId must be number`);
    if (!isArr(s.speakers)) errors.push(`sessions[${i}].speakers must be array`);
  });
  feed.rooms.forEach((r, i) => {
    if (!isNum(r.id)) errors.push(`rooms[${i}].id must be number`);
    if (!isStr(r.name)) errors.push(`rooms[${i}].name must be string`);
  });
  return errors;
}
