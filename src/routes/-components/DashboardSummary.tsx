import { Box } from "@mui/material";
import SimpleDataCard from "../../components/UI/SimpleDataCard";
import TitledCard from "../../components/UI/TitledCard";
import { formatMsToHoursOrMinutes } from "../../lib/durationFormatHelpers";
import useGetUsageSummary from "../../hooks/queries/useGetUsageSummary";

interface DashboardSummaryProps {
	startOfRangeMs: number;
	endOfRangeMs: number;
}

//TODO create reusable generic with ApplicationDetailSummary
function DashboardSummary({
	startOfRangeMs,
	endOfRangeMs,
}: DashboardSummaryProps) {
	const { data: usageSummary, isLoading } = useGetUsageSummary(
		startOfRangeMs,
		endOfRangeMs,
	);

	return (
		<TitledCard>
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
					dataValue={formatMsToHoursOrMinutes(usageSummary?.total_duration || 0)}
					dataLabel="Total Focus Time"
					isLoading={isLoading}
				/>

				<SimpleDataCard
					dataValue={
						usageSummary ? 
						(usageSummary?.segments_count === 0 ? usageSummary?.segments_count : usageSummary?.segments_count - 1) : 
						0
					}
					dataLabel="Focus Switches"
					tooltip="Counts how often the active foreground application changed during tracked time."
					isLoading={isLoading}
				/>

				<SimpleDataCard
					dataValue={usageSummary?.exe_count || 0}
					dataLabel="Unique Apps"
					isLoading={isLoading}
				/>
			</Box>
		</TitledCard>
	);
}

export default DashboardSummary;
