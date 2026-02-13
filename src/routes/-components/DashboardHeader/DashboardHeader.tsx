import { Box, Typography } from "@mui/material";
import DashboardTimeline from "./DashboardTimeline";

interface DashboardHeaderProps {
	rangeStartMs: number;
	rangeEndMs: number;
	weekStartMs: number;
	weekEndMs: number;
	onWeekChange: (startDate: Date) => void;
}

const DashboardHeader = ({
	rangeStartMs,
	rangeEndMs,
	weekStartMs,
	weekEndMs,
	onWeekChange,
}: DashboardHeaderProps) => {
	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				marginBottom: 3,
				paddingBottom: 2,
				borderBottom: "1px solid",
				borderColor: "divider",
			}}
		>
			<Typography
				variant="h4"
				sx={{
					fontWeight: 600,
					color: "text.primary",
				}}
			>
				Dashboard
			</Typography>
			<DashboardTimeline
				rangeStartMs={rangeStartMs}
				rangeEndMs={rangeEndMs}
				weekStartMs={weekStartMs}
				weekEndMs={weekEndMs}
				onWeekChange={onWeekChange}
			/>
		</Box>
	);
};

export default DashboardHeader;
