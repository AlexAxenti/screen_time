import { Box } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import PageHeader from "../../components/UI/PageHeader";
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
	const [customStartMs, setCustomStartMs] = useState<number>(
		getWeekStartMs(today),
	);
	const [customEndMs, setCustomEndMs] = useState<number>(
		getEndOfDayMs(today),
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
					startTime: getStartOfDayMs(new Date(customStartMs)),
					endTime: getEndOfDayMs(new Date(customEndMs)),
				};
			default:
				return {
					startTime: todayStartMs - 6 * 24 * 60 * 60 * 1000,
					endTime: todayEndMs,
				};
		}
	}, [dateRangeOption, customStartMs, customEndMs, today]);

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
				customStartMs={customStartMs}
				customEndMs={customEndMs}
				onCustomStartChange={setCustomStartMs}
				onCustomEndChange={setCustomEndMs}
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
