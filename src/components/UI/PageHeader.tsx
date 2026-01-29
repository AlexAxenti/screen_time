import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface PageHeaderProps {
	title: string;
	rightContent?: ReactNode;
}

const PageHeader = ({ title, rightContent }: PageHeaderProps) => {
	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				marginBottom: 3,
				paddingBottom: 2,
				borderBottom: "1px solid",
				borderColor: "divider",
			}}
		>
			<Typography
				variant="h4"
				sx={{
					fontWeight: 600,
					color: "text.primary",
				}}
			>
				{title}
			</Typography>
			{rightContent && <Box sx={{ textAlign: "right" }}>{rightContent}</Box>}
		</Box>
	);
};

export default PageHeader;
