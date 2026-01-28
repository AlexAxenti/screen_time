import { Box } from "@mui/material";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import InfoTooltip from "./InfoTooltip";

interface SimpleDataCardProps {
	dataValue: string | number;
	dataLabel: string;
	tooltip?: string;
	sx?: object;
}

const SimpleDataCard = ({
	dataValue,
	dataLabel,
	tooltip,
	sx,
}: SimpleDataCardProps) => {
	return (
		<Card
			sx={{
				padding: 2,
				textAlign: "center",
				backgroundColor: "background.default",
				position: "relative",
				...sx,
			}}
		>
			{tooltip && (
				<Box sx={{ position: "absolute", top: 4, right: 4 }}>
					<InfoTooltip text={tooltip} placement="left" />
				</Box>
			)}
			<Typography variant="h4" color="text.secondary">
				{dataValue}
			</Typography>
			<Typography variant="body2" color="text.primary" sx={{ marginTop: 1 }}>
				{dataLabel}
			</Typography>
		</Card>
	);
};

export default SimpleDataCard;
