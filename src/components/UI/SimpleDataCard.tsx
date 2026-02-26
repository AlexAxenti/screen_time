import { Box } from "@mui/material";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import InfoTooltip from "./InfoTooltip";

interface SimpleDataCardProps {
	dataValue: string | number;
	dataLabel: string;
	isLoading: boolean;
	tooltip?: string;
	sx?: object;
}

const SimpleDataCard = ({
	dataValue,
	dataLabel,
	tooltip,
	sx,
	isLoading,
}: SimpleDataCardProps) => {
	return (
		<Card
			sx={{
				padding: 2,
				textAlign: "center",
				backgroundColor: "background.default",
				position: "relative",
				height: "92px",
				...sx,
			}}
		>
			{tooltip && (
				<Box sx={{ position: "absolute", top: 4, right: 4 }}>
					<InfoTooltip text={tooltip} placement="left" />
				</Box>
			)}
			<Typography variant="h4" color="text.secondary" sx={{ height: "30px" }}>
				{!isLoading && dataValue}
			</Typography>
			<Typography variant="body2" color="text.primary" sx={{ marginTop: 1 }}>
				{dataLabel}
			</Typography>
		</Card>
	);
};

export default SimpleDataCard;
