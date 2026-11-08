// Maps the upstream feed to the app's session model.
export function mapFeed(feed) {
  const rooms = new Map(feed.rooms.map((r) => [r.id, r.name]));
  return feed.sessions.map((s) => {
    const [building, level, ...rest] = (rooms.get(s.roomId) ?? "Room TBD").split(" | ");
    return {
      id: s.id,
      title: s.title,
      // Sessionize times are naive local (Mountain) time, no offset.
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      building,
      level: rest.length ? level : null,
      room: rest.length ? rest.join(" | ") : level ?? null,
      speakerIds: s.speakers,
    };
  });
}
