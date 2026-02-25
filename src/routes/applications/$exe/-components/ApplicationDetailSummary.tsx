import { Box } from "@mui/material";
import SimpleDataCard from "../../../../components/UI/SimpleDataCard";
import TitledCard from "../../../../components/UI/TitledCard";
import useGetAppUsageSummary from "../../../../hooks/queries/useGetAppUsageSummary";
import { formatMsToHoursOrMinutes } from "../../../../lib/durationFormatHelpers";

interface ApplicationDetailSummaryProps {
	startOfRangeMs: number;
	endOfRangeMs: number;
  appId: string;
}

function ApplicationDetailSummary({ 
  startOfRangeMs, 
  endOfRangeMs, 
  appId 
}: ApplicationDetailSummaryProps) {
  const { data: usageSummary, isLoading } = useGetAppUsageSummary(
		startOfRangeMs,
		endOfRangeMs,
		appId,
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
						(usageSummary?.segments_count === 0 ? usageSummary?.segments_count : usageSummary?.segments_count - 1) 
						: 0
					}
					dataLabel="Session Counts"
					tooltip="Counts how many times this application became the active foreground application focus."
					isLoading={isLoading}
				/>

				<SimpleDataCard
					dataValue={formatMsToHoursOrMinutes(usageSummary?.avg_segment_duration || 0)}
					dataLabel="Average Session Duration"
          tooltip="Displays how long you remain focused on this application without switching to another app."
					isLoading={isLoading}
				/>
			</Box>
		</TitledCard>
	);
}

export default ApplicationDetailSummary;
