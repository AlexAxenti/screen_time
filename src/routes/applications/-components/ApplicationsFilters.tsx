import { Box, Card } from "@mui/material";
import ApplicationsSearch from "./ApplicationsSearch";
import DateRangeSelector, { type DateRangeOption } from "./DateRangeSelector";
import SortSelector, { type SortOption } from "./SortSelector";

interface ApplicationsFiltersProps {
	dateRangeOption: DateRangeOption;
	onDateRangeOptionChange: (option: DateRangeOption) => void;
	customStartMs: number;
	customEndMs: number;
	onCustomStartChange: (ms: number) => void;
	onCustomEndChange: (ms: number) => void;
	onSearchChange: (query: string) => void;
	sortOption: SortOption;
	onSortChange: (option: SortOption) => void;
}

const ApplicationsFilters = ({
	dateRangeOption,
	onDateRangeOptionChange,
	customStartMs,
	customEndMs,
	onCustomStartChange,
	onCustomEndChange,
	onSearchChange,
	sortOption,
	onSortChange,
}: ApplicationsFiltersProps) => {
	return (
		<Card
			elevation={0}
			sx={{
				padding: 2.5,
				marginBottom: 3,
			}}
		>
			<Box
				sx={{
					display: "flex",
					flexDirection: { xs: "column", md: "row" },
					justifyContent: "space-between",
					alignItems: { xs: "flex-start", md: "flex-start" },
					gap: 2,
				}}
			>
				<DateRangeSelector
					selectedOption={dateRangeOption}
					onOptionChange={onDateRangeOptionChange}
					customStartMs={customStartMs}
					customEndMs={customEndMs}
					onCustomStartChange={onCustomStartChange}
					onCustomEndChange={onCustomEndChange}
				/>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 2,
					}}
				>
					<ApplicationsSearch onChange={onSearchChange} />
					<SortSelector value={sortOption} onChange={onSortChange} />
				</Box>
			</Box>
		</Card>
	);
};

export default ApplicationsFilters;
