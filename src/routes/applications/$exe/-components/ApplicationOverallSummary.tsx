import { Box } from "@mui/material";
import SimpleDataCard from "../../../../components/UI/SimpleDataCard";
import TitledCard from "../../../../components/UI/TitledCard";
import useGetAppOverallSummary from "../../../../hooks/queries/useGetAppOverallSummary";
import { formatDateToYYYYMMDD, formatMsToHoursOrMinutes } from "../../../../lib/durationFormatHelpers";

interface ApplicationOverallSummaryProps {
	appId: string;
	sx?: object;
}

function ApplicationOverallSummary({ appId, sx }: ApplicationOverallSummaryProps) {
	const { data: overallSummary, isLoading } = useGetAppOverallSummary(appId);

	return (
		<TitledCard title="Lifetime Summary" sx={sx}>
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr 1fr",
					gap: 2,
				}}
			>
				<SimpleDataCard
					dataValue={formatMsToHoursOrMinutes(overallSummary?.total_duration_ms || 0)}
					dataLabel="Total Time Used"
					isLoading={isLoading}
				/>
				<SimpleDataCard
					dataValue={formatDateToYYYYMMDD(new Date(overallSummary?.first_used_ms ?? 0))}
					dataLabel="First Used"
					isLoading={isLoading}
				/>
				<SimpleDataCard
					dataValue={formatDateToYYYYMMDD(new Date(overallSummary?.last_used_ms ?? 0))}
					dataLabel="Last Used"
					isLoading={isLoading}
				/>
			</Box>
		</TitledCard>
	);
}

export default ApplicationOverallSummary;
