const formatMsToHoursAndMinutes = (ms: number) => {
	const hours = Math.floor(ms / 3600000);
	const minutes = Math.floor((ms % 3600000) / 60000);
	return `${hours}h ${minutes}m`;
};

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
	return date.toISOString().split("T")[0];
};

export { formatMsToHoursAndMinutes, formatMsToHoursOrMinutes, formatDateToYYYYMMDD };