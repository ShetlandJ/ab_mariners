// Build a chronological RN career table for a mariner: one row per ship service,
// ordered by start date. Prefers the modern person_ship assignments; falls back to
// the legacy ship1/ship2/ship3 columns when no relational assignments exist.
//
// Each row: { ship, rank, start, end } where start/end are raw ISO strings (the
// caller formats them for display/export).
export function buildCareerRows(mariner) {
  if (!mariner) return [];

  const assignments = Array.isArray(mariner.shipAssignments) ? mariner.shipAssignments : [];

  let rows;
  if (assignments.length > 0) {
    rows = assignments.map(a => ({
      ship: a.ship_name || 'Unknown ship',
      rank: a.rank || '',
      start: a.start_date || '',
      end: a.end_date || ''
    }));
  } else {
    // Legacy fallback: up to three hard-coded ship columns on the person row.
    rows = [];
    for (let i = 1; i <= 3; i++) {
      const ship = mariner[`ship${i}`];
      if (!ship) continue;
      rows.push({
        ship,
        rank: '',
        start: mariner[`appdate${i}`] || '',
        end: mariner[`entdate${i}`] || ''
      });
    }
  }

  // Chronological by start date. Empty start dates sort last.
  return rows.sort((a, b) => {
    if (!a.start) return 1;
    if (!b.start) return -1;
    return a.start < b.start ? -1 : a.start > b.start ? 1 : 0;
  });
}

export default buildCareerRows;
