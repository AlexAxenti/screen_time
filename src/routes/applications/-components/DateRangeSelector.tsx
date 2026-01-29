import {
	Box,
	FormControlLabel,
	Radio,
	RadioGroup,
	TextField,
} from "@mui/material";

type DateRangeOption = "today" | "last7days" | "last30days" | "custom";

interface DateRangeSelectorProps {
	selectedOption: DateRangeOption;
	onOptionChange: (option: DateRangeOption) => void;
	customStartDate: string;
	customEndDate: string;
	onCustomStartChange: (date: string) => void;
	onCustomEndChange: (date: string) => void;
}

const DateRangeSelector = ({
	selectedOption,
	onOptionChange,
	customStartDate,
	customEndDate,
	onCustomStartChange,
	onCustomEndChange,
}: DateRangeSelectorProps) => {
	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
			<RadioGroup
				row
				value={selectedOption}
				onChange={(e) => onOptionChange(e.target.value as DateRangeOption)}
				sx={{ gap: 1 }}
			>
				<FormControlLabel
					value="today"
					control={<Radio size="small" />}
					label="Today"
					sx={{
						"& .MuiFormControlLabel-label": {
							fontSize: "0.875rem",
						},
					}}
				/>
				<FormControlLabel
					value="last7days"
					control={<Radio size="small" />}
					label="Last 7 Days"
					sx={{
						"& .MuiFormControlLabel-label": {
							fontSize: "0.875rem",
						},
					}}
				/>
				<FormControlLabel
					value="last30days"
					control={<Radio size="small" />}
					label="Last 30 Days"
					sx={{
						"& .MuiFormControlLabel-label": {
							fontSize: "0.875rem",
						},
					}}
				/>
				<FormControlLabel
					value="custom"
					control={<Radio size="small" />}
					label="Custom"
					sx={{
						"& .MuiFormControlLabel-label": {
							fontSize: "0.875rem",
						},
					}}
				/>
			</RadioGroup>

			{selectedOption === "custom" && (
				<Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
					<TextField
						type="date"
						label="Start Date"
						value={customStartDate}
						onChange={(e) => onCustomStartChange(e.target.value)}
						size="small"
						InputLabelProps={{ shrink: true }}
						sx={{ minWidth: 150 }}
					/>
					<TextField
						type="date"
						label="End Date"
						value={customEndDate}
						onChange={(e) => onCustomEndChange(e.target.value)}
						size="small"
						InputLabelProps={{ shrink: true }}
						sx={{ minWidth: 150 }}
					/>
				</Box>
			)}
		</Box>
	);
};

export type { DateRangeOption };
export default DateRangeSelector;
