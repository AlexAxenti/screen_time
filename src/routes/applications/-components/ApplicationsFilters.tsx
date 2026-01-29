import { Box, Card } from "@mui/material";
import ApplicationsSearch from "./ApplicationsSearch";
import DateRangeSelector, { type DateRangeOption } from "./DateRangeSelector";
import SortSelector, { type SortOption } from "./SortSelector";

interface ApplicationsFiltersProps {
	dateRangeOption: DateRangeOption;
	onDateRangeOptionChange: (option: DateRangeOption) => void;
	customStartDate: string;
	customEndDate: string;
	onCustomStartChange: (date: string) => void;
	onCustomEndChange: (date: string) => void;
	searchQuery: string;
	onSearchChange: (query: string) => void;
	sortOption: SortOption;
	onSortChange: (option: SortOption) => void;
}

const ApplicationsFilters = ({
	dateRangeOption,
	onDateRangeOptionChange,
	customStartDate,
	customEndDate,
	onCustomStartChange,
	onCustomEndChange,
	searchQuery,
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
					customStartDate={customStartDate}
					customEndDate={customEndDate}
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
					<ApplicationsSearch value={searchQuery} onChange={onSearchChange} />
					<SortSelector value={sortOption} onChange={onSortChange} />
				</Box>
			</Box>
		</Card>
	);
};

export default ApplicationsFilters;
