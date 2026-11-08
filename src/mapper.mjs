// Maps the upstream feed to the app's session model.
export function mapFeed(feed) {
  const rooms = new Map(feed.rooms.map((r) => [r.id, r]));
  return feed.sessions.map((s) => {
    const r = rooms.get(s.roomId);
    let building = "Room TBD", level = null, room = null;
    if (r?.building !== undefined) ({ building, level = null, room = null } = r);
    else if (r?.name) {
      const [b, l, ...rest] = r.name.split(" | ");
      building = b;
      level = rest.length ? l : null;
      room = rest.length ? rest.join(" | ") : l ?? null;
    }
    return {
      id: s.id,
      title: s.title,
      // Sessionize times are naive local (Mountain) time, no offset.
      startsAt: s.startsAt ?? s.starts_at,
      endsAt: s.endsAt ?? s.ends_at,
      building,
      level,
      room,
      speakerIds: s.speakers,
    };
  });
}
