import { Box, FormControl, IconButton, MenuItem, Select, Stack, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
//TODO use proper PageHeader component
import PageHeader from "../../components/UI/PageHeader";
import { getEndOfDayMs, getStartOfDayMs, getWeekStartMs } from "../../lib/epochDayHelpers";
import useGetApplications from "../../hooks/queries/useGetApplications";
import ApplicationsFilters from "./-components/ApplicationsFilters";
import ApplicationsList from "./-components/ApplicationsList";
import type { DateRangeOption } from "./-components/DateRangeSelector";
import { parseSortOption, type SortOption } from "./-components/SortSelector";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export const Route = createFileRoute("/applications/")({
	component: Index,
});

// TODO add count to getApplications
const TOTAL_COUNT = 50;

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
	const [pageCount, setPageCount] = useState<number>(0);
	const [pageSize, setPageSize] = useState<number>(10);

	const { sortValue, sortDirection } = parseSortOption(sortOption);

	const searchValue = searchQuery.trim() || undefined;

	const {
		data: applications,
		isLoading,
		isError,
	} = useGetApplications(
		startTime,
		endTime,
		pageCount,
		pageSize,
		sortValue,
		sortDirection,
		searchValue
	);

	const totalPages = Math.ceil(TOTAL_COUNT / pageSize);
	const showingStart = pageCount * pageSize + 1;
	const showingEnd = Math.min((pageCount + 1) * pageSize, TOTAL_COUNT);

	const handlePageSizeChange = (newSize: number) => {
		setPageSize(newSize);
		setPageCount(0);
	};

	const handlePrevPage = () => {
		setPageCount((prev) => Math.max(0, prev - 1));
	};

	const handleNextPage = () => {
		setPageCount((prev) => Math.min(totalPages - 1, prev + 1));
	};

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
				onSearchChange={setSearchQuery}
				sortOption={sortOption}
				onSortChange={setSortOption}
			/>

			<ApplicationsList
				applications={applications}
				isLoading={isLoading}
				isError={isError}
			/>

			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				sx={{ mt: 2, px: 1 }}
			>
				<Stack direction="row" alignItems="center" spacing={1}>
					<Typography variant="body2" color="text.secondary">
						Rows per page:
					</Typography>
					<FormControl size="small">
						<Select
							value={pageSize}
							onChange={(e) => handlePageSizeChange(Number(e.target.value))}
							sx={{ minWidth: 70 }}
						>
							<MenuItem value={5}>5</MenuItem>
							<MenuItem value={10}>10</MenuItem>
							<MenuItem value={25}>25</MenuItem>
							<MenuItem value={50}>50</MenuItem>
							<MenuItem value={100}>100</MenuItem>
						</Select>
					</FormControl>
				</Stack>

				<Stack direction="row" alignItems="center" spacing={1}>
					<Typography variant="body2" color="text.secondary">
						Showing {showingStart}-{showingEnd} of {TOTAL_COUNT} applications
					</Typography>
					<IconButton
						onClick={handlePrevPage}
						disabled={pageCount === 0}
						size="small"
					>
						<ChevronLeftIcon />
					</IconButton>
					<IconButton
						onClick={handleNextPage}
						disabled={pageCount >= totalPages - 1}
						size="small"
					>
						<ChevronRightIcon />
					</IconButton>
				</Stack>
			</Stack>
		</Box>
	);
}
