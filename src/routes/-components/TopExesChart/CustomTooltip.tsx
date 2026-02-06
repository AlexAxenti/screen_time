import { Box } from "@mui/material";
import { getIconSrc } from "../../../lib/iconPaths";
import { formatMsToHoursOrMinutes } from "../../../lib/durationFormatHelpers";

export const CustomTooltip = ({ active, payload }: any) => {
	if (!active || !payload || !payload[0]) return null;

	const data = payload[0].payload;
	const appInfo = data.app_info;

	return (
		<Box
			sx={{
				background: "#111",
				border: "1px solid #333",
				padding: 1.75,
				display: "flex",
				flexDirection: "column",
				gap: 1,
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				<img
					src={getIconSrc(appInfo.app_id)}
					alt={appInfo.display_name}
					onError={(e) => {
						e.currentTarget.src = "/app_placeholder.png";
					}}
					style={{
						width: 20,
						height: 20,
						objectFit: "cover",
					}}
				/>
				<Box sx={{ color: "#fff", fontSize: "16px", fontWeight: 400 }}>
					{appInfo.display_name}
				</Box>
			</Box>
			<Box sx={{ color: "#fff", fontSize: "16px" }}>
				Duration: {formatMsToHoursOrMinutes(data.duration)}
			</Box>
		</Box>
	);
};