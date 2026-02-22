import { Avatar, Box, Button, Typography } from "@mui/material";
import { getIconSrc } from "../../../lib/iconPaths";
import useToggleTrackedApp from "../../../hooks/mutations/useToogleTrackedApp";
import type { ApplicationInfo } from "../../../types/tauriDtos";

const UntrackedAppRow = ({ app }: { app: ApplicationInfo }) => {
	const toggleTracked = useToggleTrackedApp();

	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				py: 1.5,
				px: 2,
				"&:not(:last-child)": {
					borderBottom: "1px solid",
					borderColor: "divider",
				},
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
				<Avatar
					src={getIconSrc(app.app_id)}
					variant="rounded"
					sx={{ width: 28, height: 28 }}
				/>
				<Typography variant="body2">{app.display_name}</Typography>
			</Box>
			<Button
				size="small"
				variant="outlined"
				onClick={() =>
					toggleTracked.mutate({ appId: app.app_id, isTracked: true })
				}
				disabled={toggleTracked.isPending}
			>
				Resume Tracking
			</Button>
		</Box>
	);
};

export default UntrackedAppRow;