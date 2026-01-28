import { Box } from "@mui/material";
import DashboardCard from "../../components/UI/DashboardCard";
import SimpleDataCard from "../../components/UI/SimpleDataCard";
import { formatMsToHoursAndMinutes } from "../../lib/durationHelpers";
import useGetUsageSummary from "../../queries/getUsageSummary";

interface DashboardSummaryProps {
	startOfRangeMs: number;
	endOfRangeMs: number;
}

function DashboardSummary({
	startOfRangeMs,
	endOfRangeMs,
}: DashboardSummaryProps) {
	const { data: usageSummary } = useGetUsageSummary(
		startOfRangeMs,
		endOfRangeMs,
	);
	if (!usageSummary) return null;

	return (
		<DashboardCard>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					gap: 2,
					flex: 1,
				}}
			>
				<SimpleDataCard
					dataValue={formatMsToHoursAndMinutes(usageSummary.total_duration)}
					dataLabel="Total Focus Time"
				/>

				<SimpleDataCard
					dataValue={usageSummary.segments_count - 1}
					dataLabel="Focus Switches"
					tooltip="Counts how often the active foreground application changed during tracked time."
				/>

				<SimpleDataCard
					dataValue={usageSummary.exe_count}
					dataLabel="Unique Apps"
				/>
			</Box>
		</DashboardCard>
	);
}

export default DashboardSummary;
