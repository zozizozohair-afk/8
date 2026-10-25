import { safeExternalUrl } from './unitCatalog.mjs';

// A shared camera view (/maps/@...) has no selected place. Search the same
// coordinates to show a pin, while retaining existing place and short links.
export function projectMapUrl(link, location = '') {
  const safe = safeExternalUrl(link);
  if (safe) {
    const url = new URL(safe);
    const google = /^(www\.)?google\.[a-z.]+$/.test(url.hostname) || url.hostname === 'maps.google.com';
    if (google && !/\/maps\/(place|dir|search)(\/|$)/.test(url.pathname) && !url.searchParams.has('q') && !url.searchParams.has('query') && !url.searchParams.has('cid')) {
      const match = url.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:,|\/|$)/);
      if (match) {
        const latitude = Number(match[1]);
        const longitude = Number(match[2]);
        if (Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180) {
          return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;
        }
      }
    }
    return safe;
  }
  return location.trim() ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.trim())}` : null;
}
