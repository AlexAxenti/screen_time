import { Box, Button, Popover, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import RefreshIcon from "@mui/icons-material/Refresh";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { type PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import { HeatmapDay, type HeatmapDayProps, calculatePercentileThresholds } from "./Heatmap";
import { getWeekStartMs } from "../../lib/epochDayHelpers";
import useGetHeatmapUsage from "../../hooks/queries/useGetHeatmapUsage";

const computeHeatmapRange = (month: Dayjs) => {
	const prevMonthStart = month.subtract(1, "month").startOf("month");
	const nextNextMonthStart = month.add(2, "month").startOf("month");
	return {
		startMs: prevMonthStart.valueOf(),
		endMs: nextNextMonthStart.valueOf(),
	};
};

interface TimelineProps {
	rangeStartMs: number;
	rangeEndMs: number;
	weekStartMs: number;
	weekEndMs: number;
	onWeekChange: (startDate: Date) => void;
  appId?: string;
}

const Timeline = ({
	rangeStartMs,
	rangeEndMs,
	weekStartMs,
	weekEndMs,
	onWeekChange,
  appId,
}: TimelineProps) => {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const open = Boolean(anchorEl);

	const [visibleMonth, setVisibleMonth] = useState<Dayjs>(dayjs(new Date()).startOf("month"));
	const [pickerValue, setPickerValue] = useState<Dayjs | null>(dayjs(weekStartMs));

	const { startMs, endMs } = computeHeatmapRange(visibleMonth);

	const { data: heatmapUsage } = useGetHeatmapUsage(startMs, endMs, appId);

	const usageData = useMemo(() => {
		if (!heatmapUsage) return {};
		return heatmapUsage.reduce<Record<string, number>>((acc, usage) => {
			const dateKey = dayjs(usage.day_start_ms).format("YYYY-MM-DD");
			// acc[dateKey] = Math.round(usage.total_duration_ms / 60000);
			acc[dateKey] = Math.round(usage.total_duration_ms);
			return acc;
		}, {});
	}, [heatmapUsage]);

	const thresholds = useMemo(() => calculatePercentileThresholds(usageData), [usageData]);

	const handleMonthChange = (month: Dayjs) => {
		setVisibleMonth(month.startOf("month"));
	};

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setPickerValue(dayjs(weekStartMs));
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleDateChange = (value: Dayjs | null) => {
		if (value) {
			setPickerValue(value);
			onWeekChange(value.toDate());
			handleClose();
		}
	};

	const handleResetToThisWeek = () => {
		const currentWeekStart = getWeekStartMs(new Date());
		onWeekChange(new Date(currentWeekStart));
		setPickerValue(dayjs(currentWeekStart));
		handleClose();
	};

	const isCurrentWeek = weekStartMs === getWeekStartMs(new Date());

	const timeframeLabel = useMemo(() => {
		const startDate = new Date(rangeStartMs);

		const isSingleDay = rangeEndMs - rangeStartMs === 24 * 60 * 60 * 1000;

		console.log("rangeStartMs", rangeStartMs);
		console.log("rangeEndMs", rangeEndMs);
		console.log("isSingleDay", isSingleDay);

		if (isSingleDay) {
			return startDate.toLocaleDateString("en-US", {
				weekday: "long",
				month: "short",
				day: "numeric",
			});
		} else {
			const startFormatted = startDate.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			});
			const endFormatted = new Date(rangeEndMs - 1).toLocaleDateString(
				"en-US",
				{ month: "short", day: "numeric" },
			);
			return `${startFormatted} - ${endFormatted}`;
		}
	}, [rangeStartMs, rangeEndMs, weekStartMs, weekEndMs]);

	return (
		<>
			<Box
				onClick={handleClick}
				sx={{
					textAlign: "right",
					cursor: "pointer",
					padding: "6px 14px",
					borderRadius: 2,
					transition: "background-color 0.2s",
					"&:hover": {
						backgroundColor: "action.hover",
					},
				}}
			>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "flex-end",
						gap: 0.5,
						marginBottom: 0.25,
					}}
				>
					<Typography
						variant="caption"
						sx={{
							color: "text.secondary",
							letterSpacing: "0.05em",
						}}
					>
						Selected Timeframe
					</Typography>
					<KeyboardArrowDownIcon
						sx={{
							fontSize: 16,
							color: "text.secondary",
							transform: open ? "rotate(180deg)" : "rotate(0deg)",
							transition: "transform 0.2s",
						}}
					/>
				</Box>
				<Typography
					variant="body2"
					sx={{
						fontWeight: 500,
						color: "text.secondary",
					}}
				>
					{timeframeLabel}
				</Typography>
			</Box>
			<Popover
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				disableScrollLock
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				slotProps={{
					paper: {
						sx: {
							border: "1px solid",
							borderColor: "divider",
							borderRadius: 3,
							mt: 1,
							overflow: "hidden",
						},
					},
				}}
			>
				<LocalizationProvider dateAdapter={AdapterDayjs}>
					<DateCalendar
						value={pickerValue}
						onChange={handleDateChange}
						onMonthChange={handleMonthChange}
						referenceDate={visibleMonth}
						maxDate={dayjs()}
						sx={{ height: "300px" }}
						slots={{
							day: HeatmapDay as React.ComponentType<PickersDayProps>,
						}}
						slotProps={{
							day: {
								usageData,
								thresholds,
							} as HeatmapDayProps,
						}}
					/>
				</LocalizationProvider>
				<Box sx={{ px: 2, pb: 2 }}>
					<Button
						variant="outlined"
						size="small"
						fullWidth
						startIcon={<RefreshIcon />}
						onClick={handleResetToThisWeek}
						disabled={isCurrentWeek}
						sx={{ textTransform: "none" }}
					>
						Reset to This Week
					</Button>
				</Box>
			</Popover>
		</>
	);
};

export default Timeline;
