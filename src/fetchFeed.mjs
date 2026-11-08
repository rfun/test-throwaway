export async function fetchFeed(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`feed request failed: HTTP ${res.status}`);
  return res.json();
}
