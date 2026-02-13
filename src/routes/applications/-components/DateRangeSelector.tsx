import { Box, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";

type DateRangeOption = "today" | "last7days" | "last30days" | "custom";

interface DateRangeSelectorProps {
	selectedOption: DateRangeOption;
	onOptionChange: (option: DateRangeOption) => void;
	customStartMs: number;
	customEndMs: number;
	onCustomStartChange: (ms: number) => void;
	onCustomEndChange: (ms: number) => void;
}

const DateRangeSelector = ({
	selectedOption,
	onOptionChange,
	customStartMs,
	customEndMs,
	onCustomStartChange,
	onCustomEndChange,
}: DateRangeSelectorProps) => {
	const handleStartChange = (value: Dayjs | null) => {
		if (value) {
			onCustomStartChange(value.valueOf());
		}
	};

	const handleEndChange = (value: Dayjs | null) => {
		if (value) {
			onCustomEndChange(value.valueOf());
		}
	};

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
				<LocalizationProvider dateAdapter={AdapterDayjs}>
					<Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
						<DatePicker
							label="Start Date"
							value={dayjs(customStartMs)}
							onChange={handleStartChange}
							slotProps={{
								textField: { size: "small", sx: { minWidth: 150 } },
								actionBar: { actions: [] },
								layout: { sx: { height: 300 } },
							}}
						/>
						<DatePicker
							label="End Date"
							value={dayjs(customEndMs)}
							onChange={handleEndChange}
							slotProps={{
								textField: { size: "small", sx: { minWidth: 150 } },
								actionBar: { actions: [] },
								layout: { sx: { height: 300 } },
							}}
						/>
					</Box>
				</LocalizationProvider>
			)}
		</Box>
	);
};

export type { DateRangeOption };
export default DateRangeSelector;
