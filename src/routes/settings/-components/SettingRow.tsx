import { Box, Typography } from "@mui/material";

interface SettingRowProps {
	label: string;
	description: string;
	children: React.ReactNode;
}

const SettingRow = ({ label, description, children }: SettingRowProps) => (
	<Box
		sx={{
			display: "flex",
			justifyContent: "space-between",
			alignItems: "center",
			py: 2,
			"&:not(:last-child)": {
				borderBottom: "1px solid",
				borderColor: "divider",
			},
		}}
	>
		<Box sx={{ flex: 1, mr: 3 }}>
			<Typography variant="body1" fontWeight={500}>
				{label}
			</Typography>
			<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
				{description}
			</Typography>
		</Box>
		<Box sx={{ flexShrink: 0 }}>{children}</Box>
	</Box>
);

export default SettingRow;