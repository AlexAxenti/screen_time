import { Box } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import PageHeader from "../../components/UI/PageHeader";
import { formatDateToYYYYMMDD, parseLocalDateString } from "../../lib/durationFormatHelpers";
import { getEndOfDayMs, getStartOfDayMs, getWeekStartMs } from "../../lib/epochDayHelpers";
import useGetApplications from "../../hooks/queries/useGetApplications";
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
		formatDateToYYYYMMDD(new Date(getWeekStartMs(today))),
	);
	const [customEndDate, setCustomEndDate] = useState<string>(
		formatDateToYYYYMMDD(today),
	);

	const { startTime, endTime } = useMemo(() => {
		const todayStartMs = getStartOfDayMs(today);
		const todayEndMs = getEndOfDayMs(today);

		switch (dateRangeOption) {
			case "today":
				return { startTime: todayStartMs, endTime: todayEndMs };
			case "last7days": {
				const sevenDaysAgoMs = todayStartMs - 6 * 24 * 60 * 60 * 1000;
				return { startTime: sevenDaysAgoMs, endTime: todayEndMs };
			}
			case "last30days": {
				const thirtyDaysAgoMs = todayStartMs - 29 * 24 * 60 * 60 * 1000;
				return { startTime: thirtyDaysAgoMs, endTime: todayEndMs };
			}
			case "custom":
				return {
					startTime: getStartOfDayMs(parseLocalDateString(customStartDate)),
					endTime: getEndOfDayMs(parseLocalDateString(customEndDate)),
				};
			default:
				return {
					startTime: todayStartMs - 6 * 24 * 60 * 60 * 1000,
					endTime: todayEndMs,
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
			app.app_info.display_name.toLowerCase().includes(query),
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
