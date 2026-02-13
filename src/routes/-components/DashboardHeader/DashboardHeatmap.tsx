import { Tooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { PickersDay, type PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import type { Dayjs } from "dayjs";
import { formatMsToHoursOrMinutes } from "../../../lib/durationFormatHelpers";

export interface UsageThresholds {
	p25: number;
	p50: number;
	p75: number;
}
//TODO REMOVE FILE
export const calculatePercentileThresholds = (
	usageData: Record<string, number>,
): UsageThresholds | null => {
	const values = Object.values(usageData).filter((v) => v > 0).sort((a, b) => a - b);
	if (values.length === 0) return null;

	const getPercentile = (arr: number[], p: number): number => {
		const index = (p / 100) * (arr.length - 1);
		const lower = Math.floor(index);
		const upper = Math.ceil(index);
		if (lower === upper) return arr[lower];
		return arr[lower] + (arr[upper] - arr[lower]) * (index - lower);
	};

	return {
		p25: getPercentile(values, 25),
		p50: getPercentile(values, 50),
		p75: getPercentile(values, 75),
	};
};

export const getUsageTier = (
	minutes: number | undefined,
	thresholds: UsageThresholds | null,
): number => {
	if (minutes === undefined || minutes === 0) return 0;
	if (!thresholds) return 0;
	if (minutes <= thresholds.p25) return 1;
	if (minutes <= thresholds.p50) return 2;
	if (minutes <= thresholds.p75) return 3;
	return 4;
};

const TIER_OPACITIES: Record<number, number | undefined> = {
	0: undefined,
	1: 0.14,
	2: 0.34,
	3: 0.6,
	4: 1,
};

export interface HeatmapDayProps extends PickersDayProps {
	usageData?: Record<string, number>;
	thresholds?: UsageThresholds | null;
}

export const HeatmapDay = (props: HeatmapDayProps) => {
	const { day, usageData = {}, thresholds = null, ...other } = props;
	const dateKey = (day as Dayjs).format("YYYY-MM-DD");
	const usage = usageData[dateKey];
	const tier = getUsageTier(usage, thresholds);
	const opacity = TIER_OPACITIES[tier];
	//TODO use theme colors
	const backgroundColor = opacity !== undefined 
		? alpha("#1976d2", opacity) 
		: undefined;

	const dayComponent = (
		<PickersDay
			{...other}
			day={day}
			sx={{
				backgroundColor,
				"&:hover": {
					backgroundColor: backgroundColor ?? undefined,
				},
				"&.Mui-selected": {
					border: "1px solid",
					borderColor: "primary.main",
					backgroundColor: backgroundColor ?? undefined,
					color: "text.primary",
				},
			}}
		/>
	);

	if (usage !== undefined) {
		return (
			<Tooltip title={`${formatMsToHoursOrMinutes(usage)} screen time`} arrow>
				{dayComponent}
			</Tooltip>
		);
	}

	return dayComponent;
};
