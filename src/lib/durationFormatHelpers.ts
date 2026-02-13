const formatMsToHoursOrMinutes = (ms: number) => {
	const seconds = Math.floor((ms % 60000) / 1000);
	const minutes = Math.floor((ms % 3600000) / 60000);
	const hours = Math.floor(ms / 3600000);

	if (ms < 60000) {
		return `${seconds}s`;
	} else if (ms < 3600000) {
		return `${minutes}m`;
	} else {
		return `${hours}h ${minutes}m`;
	}
};

const formatDateToYYYYMMDD = (date: Date): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const parseLocalDateString = (dateString: string): Date => {
	return new Date(dateString + "T00:00:00");
};

export {
	formatMsToHoursOrMinutes,
	formatDateToYYYYMMDD,
	parseLocalDateString,
};
