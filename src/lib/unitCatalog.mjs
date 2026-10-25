import { unitKind } from './projectDiscovery.mjs';

export const kindLabels = { apartment: 'شقة', villa: 'فيلا', townhouse: 'تاون هاوس', other: 'وحدة سكنية' };
export const statusLabels = { available: 'متاح', reserved: 'محجوز', sold: 'مباع' };
export const formatNumber = value => new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 2 }).format(value);
export const positiveNumber = value => Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : null;
export const areaLabel = unit => unit.area ? `${formatNumber(unit.area)} م²` : 'غير محددة';
export const priceLabel = unit => unit.price ? `${formatNumber(unit.price)} ر.س` : 'السعر عند التواصل';

export function normalizeSearch(value = '') {
  return String(value).toLowerCase().replace(/[أإآ]/g, 'ا').replace(/[\u064B-\u065F\u0670]/g, '').replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))).replace(/[٬,]/g, '').trim();
}

export function mapUnit(row) {
  const project = Array.isArray(row.projects) ? row.projects[0] : row.projects;
  return {
    id: row.id, title: row.unit_number || 'نموذج سكني', kind: unitKind(row.type),
    type: kindLabels[unitKind(row.type)], area: positiveNumber(row.size), price: positiveNumber(row.price),
    image: row.main_image || null, status: row.status, details: row.model_details || '',
    count: row.model_count !== null && row.model_count !== undefined && Number.isFinite(Number(row.model_count)) && Number(row.model_count) >= 0 ? Number(row.model_count) : null,
    projectId: row.project_id, projectName: project?.name || 'مشروع سكني', location: project?.location || '', locationLink: project?.link || '',
  };
}

export function filterUnits(units, { search = '', project = 'all', kind = 'all', available = false, favoritesOnly = false, favorites = [], sort = 'latest' } = {}) {
  const query = normalizeSearch(search);
  const filtered = units.filter(unit => (project === 'all' || unit.projectId === project) &&
    (kind === 'all' || unit.kind === kind) && (!available || unit.status === 'available') &&
    (!favoritesOnly || favorites.includes(unit.id)) && (!query || normalizeSearch([unit.title, unit.projectName, unit.location, unit.type, unit.details, unit.area ?? '', unit.price ?? ''].join(' ')).includes(query)));
  if (sort === 'latest') return filtered;
  const field = sort.startsWith('area') ? 'area' : 'price';
  const direction = sort.endsWith('desc') ? -1 : 1;
  return filtered.sort((a, b) => a[field] === null ? (b[field] === null ? 0 : 1) : b[field] === null ? -1 : direction * (a[field] - b[field]));
}

export function safeExternalUrl(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch { return null; }
}

export function unitContactUrl(unit) {
  return `https://wa.me/966570109444?text=${encodeURIComponent(`مرحبًا، أرغب في الاستفسار وترتيب معاينة لهذا النموذج:\n${unit.title}\nالمشروع: ${unit.projectName}\nالنوع: ${unit.type}\nالمساحة: ${areaLabel(unit)}\n${priceLabel(unit)}\nالحالة: ${statusLabels[unit.status] || 'تُؤكد عند التواصل'}\nمعرف النموذج: ${unit.id}`)}`;
}
