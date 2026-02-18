import { Box, IconButton, Typography } from "@mui/material";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import UsageFragmentationChart from "../../../components/Charts/UsageFragmentationChart";
import PageHeader from "../../../components/PageHeader/PageHeader";
import TitledCard from "../../../components/UI/TitledCard";
import { getStartOfDayMs, getWeekEndFromStartMs, getWeekStartMs } from "../../../lib/epochDayHelpers";
import { getIconSrc } from "../../../lib/iconPaths";
import ApplicationDetailSummary from "./-components/ApplicationDetailSummary";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SettingsIcon from "@mui/icons-material/Settings";
import AvgTimeOfDayUsageChart from "./-components/AvgTimeOfDayUsageChart";
import YearlyHeatmap from "./-components/YearlyHeatmap";

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
	const router = useRouter();

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
					<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
						<IconButton
							onClick={() => router.history.back()}
							sx={{
								color: "text.secondary",
								"&:hover": {
									backgroundColor: "action.hover",
								},
							}}
						>
							<ArrowBackIcon />
						</IconButton>
						<Box
							sx={{
								width: 32,
								height: 32,
								flexShrink: 0,
								overflow: "hidden",
							}}
						>
							<img
								src={getIconSrc(exe)}
								alt={displayName || exe}
								onError={(e) => {
									e.currentTarget.src = "/app_placeholder.png";
								}}
								style={{
									width: "100%",
									height: "100%",
									objectFit: "cover",
								}}
							/>
						</Box>
						<Box sx={{ position: "relative" }}>
							<Typography
								variant="h4"
								sx={{
									fontWeight: 600,
									color: "text.primary",
								}}
							>
								{displayName || exe}
							</Typography>
							<IconButton
								onClick={() => console.log("Settings clicked")}
								size="small"
								sx={{
									position: "absolute",
									top: -4,
									right: -28,
									color: "text.secondary",
									padding: 0.5,
									"&:hover": {
										backgroundColor: "action.hover",
									},
								}}
							>
								<SettingsIcon sx={{ fontSize: 16 }} />
							</IconButton>
						</Box>
					</Box>
				}
				rangeStartMs={rangeStartMs}
				rangeEndMs={rangeEndMs}
				weekStartMs={weekStartMs}
				weekEndMs={weekEndMs}
				onWeekChange={handleWeekChange}
				appId={exe}
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
				<TitledCard title="Yearly Overview">
					<YearlyHeatmap appId={exe} />
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
