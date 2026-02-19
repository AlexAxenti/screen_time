import { Box, useTheme } from "@mui/material";
import { createFileRoute, Link } from "@tanstack/react-router";
import "./index.css";
import { useState } from "react";
import UsageFragmentationChart from "../components/Charts/UsageFragmentationChart";
import WeeklyUsageChart from "../components/Charts/WeeklyUsageChart";
import TitledCard from "../components/UI/TitledCard";
import { getStartOfDayMs, getWeekEndFromStartMs, getWeekStartMs } from "../lib/epochDayHelpers";
import DashboardSummary from "./-components/DashboardSummary";
import TopExesChart from "./-components/TopExesChart/TopExesChart";
import Timeline from "../components/Timeline/Timeline";
import PageHeader from "../components/UI/PageHeader";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const theme = useTheme();

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
			<PageHeader 
				title="Dashboard"
				rightContent={
					<Timeline
						rangeStartMs={rangeStartMs}
						rangeEndMs={rangeEndMs}
						weekStartMs={weekStartMs}
						weekEndMs={weekEndMs}
						onWeekChange={handleWeekChange}
					/>
				}
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
				<TitledCard
					title="Top Applications Used"
					headerAction={
						<Link
							to="/applications"
							style={{ fontSize: "0.875rem", color: theme.palette.text.secondary, textDecoration: "none" }}
						>
							See more
						</Link>
					}
				>
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
