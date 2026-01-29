import { Box, Card, Typography } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { formatMsToHoursOrMinutes } from "../../../lib/durationFormatHelpers";

interface ApplicationCardProps {
	name: string;
	segmentCount: number;
	duration: number;
	durationPercent: number;
}

const ApplicationCard = ({
	name,
	segmentCount,
	duration,
	durationPercent,
}: ApplicationCardProps) => {
	return (
		<Link
			to="/applications/$exe"
			params={{ exe: name }}
			style={{
				textDecoration: "none",
			}}
		>
			<Card
				elevation={0}
				sx={{
					padding: 2,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					transition: "background-color 0.2s ease",
					"&:hover": {
						backgroundColor: "action.hover",
						cursor: "pointer",
					},
					"&:hover .application-title": {
						color: "text.secondary",
					},
				}}
			>
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography
						variant="body1"
						className="application-title"
						sx={{
							fontWeight: 500,
							color: "text.primary",
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						{name}
					</Typography>
				</Box>

				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 4,
						flexShrink: 0,
					}}
				>
					<Box sx={{ textAlign: "center", minWidth: 80 }}>
						<Typography
							variant="body2"
							sx={{ color: "text.secondary", fontSize: "0.75rem" }}
						>
							Segments
						</Typography>
						<Typography
							variant="body1"
							sx={{ fontWeight: 500, color: "text.primary" }}
						>
							{segmentCount.toLocaleString()}
						</Typography>
					</Box>

					<Box sx={{ textAlign: "center", minWidth: 80 }}>
						<Typography
							variant="body2"
							sx={{ color: "text.secondary", fontSize: "0.75rem" }}
						>
							Duration
						</Typography>
						<Typography
							variant="body1"
							sx={{ fontWeight: 500, color: "text.primary" }}
						>
							{formatMsToHoursOrMinutes(duration)}
						</Typography>
					</Box>

					<Box sx={{ textAlign: "center", minWidth: 80 }}>
						<Typography
							variant="body2"
							sx={{ color: "text.secondary", fontSize: "0.75rem" }}
						>
							% of Total
						</Typography>
						<Typography
							variant="body1"
							sx={{ fontWeight: 500, color: "primary.main" }}
						>
							{durationPercent.toFixed(1)}%
						</Typography>
					</Box>
				</Box>
			</Card>
		</Link>
	);
};

export default ApplicationCard;
