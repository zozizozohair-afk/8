const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export function cleanRecentIds(value) {
  return Array.isArray(value) ? [...new Set(value.filter(id => typeof id === 'string' && UUID.test(id)))].slice(0, 3) : [];
}
export function rememberUnit(ids, id) { return cleanRecentIds([id, ...ids]); }
export function readSharedSelection(search) {
  const params = new URLSearchParams(search);
  const unit = params.get('unit');
  if (unit && UUID.test(unit)) return { type: 'details', ids: [unit] };
  const ids = cleanRecentIds((params.get('compare') || '').split(','));
  return ids.length ? { type: 'compare', ids } : null;
}
export function unitShareUrl(origin, ids, comparison = false) {
  const url = new URL('/', origin);
  const valid = cleanRecentIds(ids);
  if (valid.length) url.searchParams.set(comparison ? 'compare' : 'unit', comparison ? valid.join(',') : valid[0]);
  url.hash = 'unit-models';
  return url.href;
}
export function saudiToday(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type).value).join('-');
}
export function viewingRequestUrl(unit, date, period) {
  const message = `مرحبًا، أرغب في طلب معاينة (بانتظار تأكيد الفريق):\nالنموذج: ${unit.title}\nالمشروع: ${unit.projectName}\nالتاريخ المفضّل: ${date}\nالفترة المفضّلة: ${period}\nمعرف النموذج: ${unit.id}`;
  return `https://wa.me/966570109444?text=${encodeURIComponent(message)}`;
}
