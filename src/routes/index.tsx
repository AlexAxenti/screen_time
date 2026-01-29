import { Box } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import "./index.css";
import { useState } from "react";
import TitledCard from "../components/UI/TitledCard";
import { getWeekEndMs, getWeekStartMs } from "../lib/epochDayHelpers";
import DashboardHeader from "./-components/DashboardHeader";
import DashboardSummary from "./-components/DashboardSummary";
import TopExesChart from "./-components/TopExesChart";
import UsageFragmentationChart from "./-components/UsageFragmentationChart";
import WeeklyUsageChart from "./-components/WeeklyUsageChart";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const today: Date = new Date();

	const weekStartMs = getWeekStartMs(today);
	const weekEndMs = getWeekEndMs(today);

	const [rangeStartMs, setRangeStartMs] = useState<number>(weekStartMs);
	const [rangeEndMs, setRangeEndMs] = useState<number>(weekEndMs);

	const handleSetRange = (startMs: number, endMs: number) => {
		if (startMs === rangeStartMs) {
			setRangeStartMs(weekStartMs);
			setRangeEndMs(weekEndMs);
		} else {
			setRangeStartMs(startMs);
			setRangeEndMs(endMs);
		}
	};

	return (
		<Box>
			<DashboardHeader
				rangeStartMs={rangeStartMs}
				rangeEndMs={rangeEndMs}
				weekStartMs={weekStartMs}
				weekEndMs={weekEndMs}
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
					/>
				</TitledCard>
				<DashboardSummary
					startOfRangeMs={rangeStartMs}
					endOfRangeMs={rangeEndMs}
				/>
			</Box>

			{/* Bottom Row: Top Apps (1/2) + Fragmentation (1/2) */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: 3,
				}}
			>
				<TitledCard title="Top Applications Used">
					<TopExesChart
						startOfRangeMs={rangeStartMs}
						endOfRangeMs={rangeEndMs}
					/>
				</TitledCard>
				<TitledCard title="Focus Time Blocks">
					<UsageFragmentationChart
						startOfRangeMs={rangeStartMs}
						endOfRangeMs={rangeEndMs}
					/>
				</TitledCard>
			</Box>
		</Box>
	);
}
