import { Box, Card, Typography } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { formatMsToHoursOrMinutes } from "../../../lib/durationFormatHelpers";
import { getIconSrc } from "../../../lib/iconPaths";

interface ApplicationCardProps {
	app_id: string;
	exe: string;
	displayName: string;
	segmentCount: number;
	duration: number;
	durationPercent: number;
}

const ApplicationCard = ({
	app_id,
	exe,
	displayName,
	segmentCount,
	duration,
	durationPercent,
}: ApplicationCardProps) => {
	return (
		<Link
			to="/applications/$exe"
			params={{ exe: app_id }}
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
				<Box sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0, gap: 2 }}>
					<Box
						sx={{
							width: 24,
							height: 24,
							flexShrink: 0,
							overflow: "hidden",
						}}
					>
						<img
							src={getIconSrc(app_id)}
							alt={displayName || exe}
							onError={(e) => {
								e.currentTarget.src = "/app_placeholder.png";
							}}
							style={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
							}}
						/>
					</Box>
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
						{displayName || exe}
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
							variant="body1"
							sx={{ fontWeight: 500, color: "text.primary" }}
						>
							{segmentCount.toLocaleString()}
						</Typography>
					</Box>

					<Box sx={{ textAlign: "center", minWidth: 80 }}>
						<Typography
							variant="body1"
							sx={{ fontWeight: 500, color: "text.primary" }}
						>
							{formatMsToHoursOrMinutes(duration)}
						</Typography>
					</Box>

					<Box sx={{ textAlign: "center", minWidth: 80 }}>
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
