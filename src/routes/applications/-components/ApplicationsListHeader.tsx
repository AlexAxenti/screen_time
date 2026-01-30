import { Box, Divider, Typography } from "@mui/material";

const ApplicationsListHeader = () => {
	return (
		<Box sx={{ mb: 1 }}>
			<Box
				sx={{
					padding: 2,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<Box sx={{ flex: 1 }}>
					<Typography variant="body2" sx={{ color: "text.secondary" }}>
						Executable
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
						<Typography variant="body2" sx={{ color: "text.secondary" }}>
							Segments
						</Typography>
					</Box>

					<Box sx={{ textAlign: "center", minWidth: 80 }}>
						<Typography variant="body2" sx={{ color: "text.secondary" }}>
							Duration
						</Typography>
					</Box>

					<Box sx={{ textAlign: "center", minWidth: 80 }}>
						<Typography variant="body2" sx={{ color: "text.secondary" }}>
							% of Total
						</Typography>
					</Box>
				</Box>
			</Box>
			<Divider />
		</Box>
	);
};

export default ApplicationsListHeader;
