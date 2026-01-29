import { Box } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import PageHeader from "../../components/UI/PageHeader";
import { formatDateToYYYYMMDD } from "../../lib/durationFormatHelpers";
import { getEndOfDayMs, getStartOfDayMs } from "../../lib/epochDayHelpers";
import useGetApplications from "../../queries/getApplications";
import ApplicationsFilters from "./-components/ApplicationsFilters";
import ApplicationsList from "./-components/ApplicationsList";
import type { DateRangeOption } from "./-components/DateRangeSelector";
import { parseSortOption, type SortOption } from "./-components/SortSelector";

export const Route = createFileRoute("/applications/")({
	component: Index,
});

function Index() {
	const today = new Date();

	const [dateRangeOption, setDateRangeOption] =
		useState<DateRangeOption>("last7days");
	const [customStartDate, setCustomStartDate] = useState<string>(
		formatDateToYYYYMMDD(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)),
	);
	const [customEndDate, setCustomEndDate] = useState<string>(
		formatDateToYYYYMMDD(today),
	);

	const { startTime, endTime } = useMemo(() => {
		const nowMs = Date.now();
		const todayStartMs = getStartOfDayMs(today);
		const tomorrowMs = todayStartMs + 24 * 60 * 60 * 1000;

		switch (dateRangeOption) {
			case "today":
				return { startTime: todayStartMs, endTime: tomorrowMs };
			case "last7days": {
				const sevenDaysAgoMs = todayStartMs - 6 * 24 * 60 * 60 * 1000;
				return { startTime: sevenDaysAgoMs, endTime: tomorrowMs };
			}
			case "last30days": {
				const thirtyDaysAgoMs = todayStartMs - 29 * 24 * 60 * 60 * 1000;
				return { startTime: thirtyDaysAgoMs, endTime: tomorrowMs };
			}
			case "custom":
				return {
					startTime: getStartOfDayMs(new Date(customStartDate)),
					endTime: getEndOfDayMs(new Date(customEndDate)),
				};
			default:
				return {
					startTime: nowMs - 6 * 24 * 60 * 60 * 1000,
					endTime: tomorrowMs,
				};
		}
	}, [dateRangeOption, customStartDate, customEndDate, today]);

	const [sortOption, setSortOption] = useState<SortOption>("duration-desc");
	const [searchQuery, setSearchQuery] = useState<string>("");

	const { sortValue, sortDirection } = parseSortOption(sortOption);

	const {
		data: applications,
		isLoading,
		isError,
	} = useGetApplications(startTime, endTime, sortValue, sortDirection);

	const filteredApplications = useMemo(() => {
		if (!applications || !searchQuery.trim()) {
			return applications;
		}
		const query = searchQuery.toLowerCase().trim();
		return applications.filter((app) =>
			app.window_exe.toLowerCase().includes(query),
		);
	}, [applications, searchQuery]);

	return (
		<Box>
			<PageHeader title="Applications" />

			<ApplicationsFilters
				dateRangeOption={dateRangeOption}
				onDateRangeOptionChange={setDateRangeOption}
				customStartDate={customStartDate}
				customEndDate={customEndDate}
				onCustomStartChange={setCustomStartDate}
				onCustomEndChange={setCustomEndDate}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				sortOption={sortOption}
				onSortChange={setSortOption}
			/>

			<ApplicationsList
				applications={filteredApplications}
				isLoading={isLoading}
				isError={isError}
			/>
		</Box>
	);
}
