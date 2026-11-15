const GOLDEN_ANGLE = 137.5;

export function eventColorMap(sessions = []) {
  const names = [...new Set(sessions.map((session) => session.event_name).filter(Boolean))].sort();
  return names.reduce((map, name, index) => {
    const hue = Math.round((index * GOLDEN_ANGLE) % 360);
    return { ...map, [name]: { backgroundColor: `hsl(${hue} 85% 92%)`, color: `hsl(${hue} 62% 27%)` } };
  }, {});
}