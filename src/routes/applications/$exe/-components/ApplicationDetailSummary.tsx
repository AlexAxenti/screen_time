import { Box } from "@mui/material";
import SimpleDataCard from "../../../../components/UI/SimpleDataCard";
import TitledCard from "../../../../components/UI/TitledCard";

function ApplicationDetailSummary() {
	return (
		<TitledCard>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					gap: 2,
					flex: 1,
				}}
			>
				<SimpleDataCard
					dataValue="4h 32m"
					dataLabel="Total Focus Time"
				/>

				<SimpleDataCard
					dataValue={42}
					dataLabel="Focus Switches"
					tooltip="Counts how often the active foreground application changed during tracked time."
				/>

				<SimpleDataCard
					dataValue={1}
					dataLabel="Unique Apps"
				/>
			</Box>
		</TitledCard>
	);
}

export default ApplicationDetailSummary;
