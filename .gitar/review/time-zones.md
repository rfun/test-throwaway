# Time zones

- Sessionize `startsAt`/`endsAt` are naive local venue time (no offset). Never parse them as UTC.
- Convert with an explicit IANA zone (`America/Denver` for KubeCon NA 2026), not a fixed offset.
- Tests must cover a session that crosses midnight and a device in a different zone.
