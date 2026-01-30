import { Box, CircularProgress, Typography } from "@mui/material";
import type { ApplicationUsage } from "../../../types/dto";
import ApplicationCard from "./ApplicationCard";
import ApplicationsListHeader from "./ApplicationsListHeader";

interface ApplicationsListProps {
	applications: ApplicationUsage[] | undefined;
	isLoading: boolean;
	isError: boolean;
}

const ApplicationsList = ({
	applications,
	isLoading,
	isError,
}: ApplicationsListProps) => {
	const totalDuration =
		applications?.reduce((sum, app) => sum + app.duration, 0) ?? 0;

	if (isLoading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: 200,
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (isError) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: 200,
				}}
			>
				<Typography color="error">
					Failed to load applications. Please try again.
				</Typography>
			</Box>
		);
	}

	if (!applications || applications.length === 0) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: 200,
				}}
			>
				<Typography color="text.secondary">
					No applications found for the selected time range.
				</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
			<ApplicationsListHeader />
			{applications.map((app) => {
				const durationPercent =
					totalDuration > 0 ? (app.duration / totalDuration) * 100 : 0;

				return (
					<ApplicationCard
						key={app.window_exe}
						name={app.window_exe}
						segmentCount={app.segment_count}
						duration={app.duration}
						durationPercent={durationPercent}
					/>
				);
			})}
		</Box>
	);
};

export default ApplicationsList;
