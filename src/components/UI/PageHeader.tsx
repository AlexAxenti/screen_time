import { Box } from "@mui/material";
import type { ReactNode } from "react";
import PageHeaderTitle from "./PageHeaderTitle";

interface PageHeaderProps {
	title?: string;
	leftContent?: ReactNode;
	rightContent?: ReactNode;
}

const PageHeader = ({ title, leftContent, rightContent }: PageHeaderProps) => {
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
				height: "58px"
			}}
		>
			{leftContent ?? <PageHeaderTitle title={title ?? ""} />}
			{rightContent}
		</Box>
	);
};

export default PageHeader;
