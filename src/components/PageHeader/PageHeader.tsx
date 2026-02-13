import { Box } from "@mui/material";
import type { ReactNode } from "react";
import Timeline from "./Timeline/Timeline";

interface PageHeaderProps {
	leftSlot: ReactNode;
	rangeStartMs: number;
	rangeEndMs: number;
	weekStartMs: number;
	weekEndMs: number;
	onWeekChange: (startDate: Date) => void;
  appId?: string;
}

const PageHeader = ({
	leftSlot,
	rangeStartMs,
	rangeEndMs,
	weekStartMs,
	weekEndMs,
	onWeekChange,
  appId,
}: PageHeaderProps) => {
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
			{leftSlot}
			<Timeline
				rangeStartMs={rangeStartMs}
				rangeEndMs={rangeEndMs}
				weekStartMs={weekStartMs}
				weekEndMs={weekEndMs}
				onWeekChange={onWeekChange}
        appId={appId}
			/>
		</Box>
	);
};

export default PageHeader;
