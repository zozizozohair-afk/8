export function unitKind(type = '') {
  const value = String(type).toLowerCase().replace(/[\s_-]/g, '');
  if (/town|تاون/.test(value)) return 'townhouse';
  if (/villa|فيلا|فيلل|فلل/.test(value)) return 'villa';
  if (/apartment|flat|شقة|شقه|شقق/.test(value)) return 'apartment';
  return 'other';
}

export function discoverProjects(projects, units, kind = 'all', availableOnly = false) {
  return projects.map(project => {
    const models = units.filter(unit => unit.project_id === project.id &&
      (kind === 'all' || unitKind(unit.type) === kind) &&
      (!availableOnly || unit.status === 'available'));
    const areas = models.map(unit => Number(unit.size)).filter(area => Number.isFinite(area) && area > 0);
    return {
      ...project,
      models,
      availableModels: models.filter(unit => unit.status === 'available').length,
      minArea: areas.length ? Math.min(...areas) : null,
      maxArea: areas.length ? Math.max(...areas) : null,
    };
  }).filter(project => (kind === 'all' && !availableOnly) || project.models.length > 0);
}
