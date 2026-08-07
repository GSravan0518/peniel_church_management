function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Current fellowship week: Sunday 00:00 through next Sunday 00:00 */
function getSundayWeekRange(reference = new Date()) {
  const base = startOfDay(reference);
  const day = base.getDay(); // 0 = Sunday
  const weekStart = new Date(base);
  weekStart.setDate(base.getDate() - day);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return { weekStart, weekEnd };
}

module.exports = { getSundayWeekRange, startOfDay };
