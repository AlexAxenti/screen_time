import { Box, Card, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface DashboardCardProps {
	title?: string;
	headerAction?: ReactNode;
	children: ReactNode;
	sx?: object;
}

const DashboardCard = ({ title, headerAction, children, sx }: DashboardCardProps) => {
	return (
		<Card
			elevation={0}
			sx={{
				padding: 3,
				borderRadius: 3,
				height: "100%",
				display: "flex",
				flexDirection: "column",
				...sx,
			}}
		>
			{(title || headerAction) && (
				<Box
					sx={{
						display: "flex",
						justifyContent: title ? "center" : "flex-end",
						alignItems: "flex-end",
						marginBottom: 2,
						position: "relative",
					}}
				>
					{title && (
						<Typography
							variant="h5"
							sx={{
								fontWeight: 500,
							}}
						>
							{title}
						</Typography>
					)}
					{headerAction && (
						<Box sx={{ position: "absolute", right: 0 }}>
							{headerAction}
						</Box>
					)}
				</Box>
			)}
			<Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
				{children}
			</Box>
		</Card>
	);
};

export default DashboardCard;
