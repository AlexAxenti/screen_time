import { Typography } from "@mui/material";
import PageHeader from "../../../components/PageHeader/PageHeader";

interface DashboardHeaderProps {
	rangeStartMs: number;
	rangeEndMs: number;
	weekStartMs: number;
	weekEndMs: number;
	onWeekChange: (startDate: Date) => void;
}

//TODO remove and move to index
const DashboardHeader = ({
	rangeStartMs,
	rangeEndMs,
	weekStartMs,
	weekEndMs,
	onWeekChange,
}: DashboardHeaderProps) => {
	return (
		<PageHeader
			leftSlot={
				<Typography
					variant="h4"
					sx={{
						fontWeight: 600,
						color: "text.primary",
					}}
				>
					Dashboard
				</Typography>
			}
			rangeStartMs={rangeStartMs}
			rangeEndMs={rangeEndMs}
			weekStartMs={weekStartMs}
			weekEndMs={weekEndMs}
			onWeekChange={onWeekChange}
		/>
	);
};

export default DashboardHeader;
