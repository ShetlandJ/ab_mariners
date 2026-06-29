// Shared date formatting for the UI.
//
// Dates in this database are stored as ISO `yyyy-mm-dd` strings (often historical,
// 1700s–1800s). We render them as UK-format `dd/mm/yyyy` per user preference.
//
// The ISO fast-path reformats the string directly (no Date parsing), which avoids
// both the US mm/dd ambiguity and timezone roll-over. Anything that isn't a clean
// ISO date falls back to the en-GB locale, and anything unparseable is returned as-is.
export function formatDate(dateStr, { fallback = '' } = {}) {
  if (!dateStr) return fallback;

  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dateStr));
  if (iso) {
    const [, year, month, day] = iso;
    return `${day}/${month}/${year}`;
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-GB');
}

export default formatDate;
