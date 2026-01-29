const getWeekStartMs = (todayInput: Date): number => {
	const today: Date = new Date(todayInput);
	today.setHours(0, 0, 0, 0);

	const weekStart: Date = new Date(today);
	weekStart.setDate(today.getDate() - 6);

	return weekStart.getTime();
};

const getWeekEndMs = (todayInput: Date): number => {
	const today: Date = new Date(todayInput);
	today.setHours(0, 0, 0, 0);

	const weekEnd: Date = new Date(today);
	weekEnd.setDate(today.getDate() + 1);

	return weekEnd.getTime();
};

const getStartOfDayMs = (todayInput: Date): number => {
	const today: Date = new Date(todayInput);
	today.setHours(0, 0, 0, 0);

	return today.getTime();
};

const getEndOfDayMs = (todayInput: Date): number => {
	const today: Date = new Date(todayInput);
	today.setHours(23, 59, 59, 999);

	return today.getTime();
};

const utcMidnightToLocalMidnight = (utcMidnightMs: number): number => {
	const date = new Date(utcMidnightMs);

	const year = date.getUTCFullYear();
	const month = date.getUTCMonth();
	const day = date.getUTCDate();

	return new Date(year, month, day, 0, 0, 0, 0).getTime();
};

export {
	getWeekStartMs,
	getWeekEndMs,
	getStartOfDayMs,
	getEndOfDayMs,
	utcMidnightToLocalMidnight,
};
