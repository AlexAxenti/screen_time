import { Box } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import UsageFragmentationChart from "../../../components/Charts/UsageFragmentationChart";
import WeeklyUsageChart from "../../../components/Charts/WeeklyUsageChart";
import TitledCard from "../../../components/UI/TitledCard";
import { getStartOfDayMs, getWeekEndFromStartMs, getWeekStartMs } from "../../../lib/epochDayHelpers";
import ApplicationDetailSummary from "./-components/ApplicationDetailSummary";
import AvgTimeOfDayUsageChart from "./-components/AvgTimeOfDayUsageChart";
import ApplicationDetailsPageHeader from "./-components/ApplicationDetailsPageHeader";
import useGetApplicationMetadata from "../../../hooks/queries/useGetApplicationMetadata";

interface SearchParams {
	displayName?: string;
}

export const Route = createFileRoute("/applications/$exe/")({
	component: RouteComponent,
	validateSearch: (search: Record<string, unknown>): SearchParams => {
		return {
			displayName: typeof search.displayName === "string" ? search.displayName : undefined,
		};
	},
});

function RouteComponent() {
	const { exe } = Route.useParams();
	const { displayName } = Route.useSearch();

	const { data: applicationMetadata } = useGetApplicationMetadata(exe);

	const [weekStartMs, setWeekStartMs] = useState<number>(() => getWeekStartMs(new Date()));
	const weekEndMs = getWeekEndFromStartMs(weekStartMs);

	const [rangeStartMs, setRangeStartMs] = useState<number>(weekStartMs);
	const [rangeEndMs, setRangeEndMs] = useState<number>(weekEndMs);

	const handleSetRange = (startMs: number, endMs: number) => {
		if (startMs === rangeStartMs && endMs === rangeEndMs) {
			setRangeStartMs(weekStartMs);
			setRangeEndMs(weekEndMs);
		} else {
			setRangeStartMs(startMs);
			setRangeEndMs(endMs);
		}
	};

	const handleWeekChange = (newStartDate: Date) => {
		const newStartMs = getStartOfDayMs(newStartDate);
		const newEndMs = getWeekEndFromStartMs(newStartMs);
		setWeekStartMs(newStartMs);
		setRangeStartMs(newStartMs);
		setRangeEndMs(newEndMs);
	};

	return (
		<Box>
			<ApplicationDetailsPageHeader
				exe={exe}
				displayName={applicationMetadata?.app_info.display_name || displayName}
				rangeStartMs={rangeStartMs}
				rangeEndMs={rangeEndMs}
				weekStartMs={weekStartMs}
				weekEndMs={weekEndMs}
				onWeekChange={handleWeekChange}
			/>

			{/* Top Row: Weekly Chart (2/3) + Summary Cards (1/3) */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "2fr 1fr",
					gap: 3,
					marginBottom: 3,
				}}
			>
				<TitledCard title="Weekly Overview">
					<WeeklyUsageChart
						epochStartOfWeekMs={weekStartMs}
						epochEndOfWeekMs={weekEndMs}
						handleSetRange={handleSetRange}
						appId={exe}
					/>
				</TitledCard>
				<ApplicationDetailSummary 
					startOfRangeMs={rangeStartMs}
					endOfRangeMs={rangeEndMs}
					appId={exe}
				/>
			</Box>

			{/* Bottom Row: Two charts (1/2 each) */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: 3,
				}}
			>
				<TitledCard title="Usage Distribution">
					<AvgTimeOfDayUsageChart 
						startOfRangeMs={rangeStartMs}
						endOfRangeMs={rangeEndMs}
						appId={exe}
					/>
				</TitledCard>
				<TitledCard title="Focus Time Blocks">
					<UsageFragmentationChart
						startOfRangeMs={rangeStartMs}
						endOfRangeMs={rangeEndMs}
						appId={exe}
					/>
				</TitledCard>
			</Box>
		</Box>
	);
}
