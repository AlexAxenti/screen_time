const getWeekStartMs = (todayInput: Date): number => {
  const today: Date = new Date(todayInput);
  today.setHours(0, 0, 0, 0);

  const weekStart: Date = new Date(today);
  weekStart.setDate(today.getDate() - 6);
  
  return weekStart.getTime();
}

const getWeekEndMs = (todayInput: Date): number => {
  const today: Date = new Date(todayInput);
  today.setHours(0, 0, 0, 0);

  const weekEnd: Date = new Date(today);
  weekEnd.setDate(today.getDate() + 1);
  
  return weekEnd.getTime();  
}

const getStartOfDayMs = (todayInput: Date): number => {
  const today: Date = new Date(todayInput);
  today.setHours(0, 0, 0, 0);

  return today.getTime();
}

export { 
  getWeekStartMs,
  getWeekEndMs,
  getStartOfDayMs
 };