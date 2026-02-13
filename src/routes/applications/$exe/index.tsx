import { Box, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import PageHeader from "../../../components/PageHeader/PageHeader";
import TitledCard from "../../../components/UI/TitledCard";
import { getStartOfDayMs, getWeekEndFromStartMs, getWeekStartMs } from "../../../lib/epochDayHelpers";
import ApplicationDetailSummary from "./-components/ApplicationDetailSummary";

export const Route = createFileRoute("/applications/$exe/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { exe } = Route.useParams();

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
				leftSlot={
					<Typography
						variant="h4"
						sx={{
							fontWeight: 600,
							color: "text.primary",
						}}
					>
						{exe}
					</Typography>
				}
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
					<Box sx={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "text.secondary" }}>
						Weekly Usage Chart Placeholder
					</Box>
				</TitledCard>
				<ApplicationDetailSummary />
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
					<Box sx={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", color: "text.secondary" }}>
						Usage Distribution Chart Placeholder
					</Box>
				</TitledCard>
				<TitledCard title="Focus Time Blocks">
					<Box sx={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", color: "text.secondary" }}>
						Focus Time Blocks Chart Placeholder
					</Box>
				</TitledCard>
			</Box>
		</Box>
	);
}
