import { useMemo, useState } from "react";
import { alpha } from "@mui/material/styles";
import useGetHeatmapUsage from "../../../../hooks/queries/useGetHeatmapUsage";
import { formatMsToHoursOrMinutes } from "../../../../lib/durationFormatHelpers";

interface YearlyHeatmapProps {
	appId: string;
}

interface DayData {
	date: Date;
	dateKey: string;
	usage?: number;
}

const BASE_COLOR = "#00c3ff";
const EMPTY_COLOR = "#161b22";
const TIER_OPACITIES: Record<number, number> = {
	0: 0,
	1: 0.14,
	2: 0.34,
	3: 0.6,
	4: 1,
};

const getTierColor = (tier: number): string => {
	const opacity = TIER_OPACITIES[tier];
	if (opacity === 0) return EMPTY_COLOR;
	return alpha(BASE_COLOR, opacity);
};

interface UsageThresholds {
	p25: number;
	p50: number;
	p75: number;
}

//TODO move heatmap helpers to separate file
const calculatePercentileThresholds = (
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

const getUsageTier = (
	usage: number | undefined,
	thresholds: UsageThresholds | null,
): number => {
	if (usage === undefined || usage === 0) return 0;
	if (!thresholds) return 0;
	if (usage <= thresholds.p25) return 1;
	if (usage <= thresholds.p50) return 2;
	if (usage <= thresholds.p75) return 3;
	return 4;
};

const formatDateKey = (date: Date): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const formatTooltipDate = (date: Date): string => {
	return date.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

const YearlyHeatmap = ({ appId }: YearlyHeatmapProps) => {
	const [tooltip, setTooltip] = useState<{ x: number; y: number; date: Date; usage?: number } | null>(null);

	const startMs = new Date(2026, 0, 1).getTime();
	const endMs = new Date(2027, 0, 1).getTime();

	const { data: heatmapUsage } = useGetHeatmapUsage(startMs, endMs, appId);

	// Convert usage data to a lookup map
	const usageData = useMemo(() => {
		if (!heatmapUsage) return {};
		return heatmapUsage.reduce<Record<string, number>>((acc, usage) => {
			const dateKey = formatDateKey(new Date(usage.day_start_ms));
			acc[dateKey] = usage.total_duration_ms;
			return acc;
		}, {});
	}, [heatmapUsage]);

	const thresholds = useMemo(() => calculatePercentileThresholds(usageData), [usageData]);

	// Generate weeks data structure (columns)
	const { weeks, monthPositions } = useMemo(() => {
		const weeks: DayData[][] = [];
		const monthPositions: { month: number; weekIndex: number }[] = [];
		
		const startDate = new Date(2026, 0, 1);
		const endDate = new Date(2026, 11, 31);
		
		// Start from the Sunday of the week containing Jan 1
		const firstDay = new Date(startDate);
		const dayOfWeek = firstDay.getDay(); // 0 = Sunday
		firstDay.setDate(firstDay.getDate() - dayOfWeek);
		
		let currentDate = new Date(firstDay);
		let currentWeek: DayData[] = [];
		let lastMonth = -1;
		
		while (currentDate <= endDate || currentWeek.length > 0) {
			const dayOfWeek = currentDate.getDay();
			
			// Track month positions for labels
			if (currentDate >= startDate && currentDate <= endDate) {
				const month = currentDate.getMonth();
				if (month !== lastMonth) {
					monthPositions.push({ month, weekIndex: weeks.length });
					lastMonth = month;
				}
			}
			
			// Check if date is within 2026
			const isInYear = currentDate >= startDate && currentDate <= endDate;
			
			currentWeek.push({
				date: new Date(currentDate),
				dateKey: formatDateKey(currentDate),
				usage: isInYear ? usageData[formatDateKey(currentDate)] : undefined,
			});
			
			// End of week (Saturday)
			if (dayOfWeek === 6) {
				weeks.push(currentWeek);
				currentWeek = [];
			}
			
			currentDate.setDate(currentDate.getDate() + 1);
			
			// Stop after we've passed the end date and finished the week
			if (currentDate > endDate && dayOfWeek === 6) {
				break;
			}
		}
		
		// Push any remaining days
		if (currentWeek.length > 0) {
			weeks.push(currentWeek);
		}
		
		return { weeks, monthPositions };
	}, [usageData]);

	const handleDayClick = (day: DayData) => {
		console.log("Day clicked:", {
			date: day.date.toISOString(),
			dateKey: day.dateKey,
			usage: day.usage,
		});
	};

	const handleMouseEnter = (e: React.MouseEvent, day: DayData) => {
		const rect = e.currentTarget.getBoundingClientRect();
		setTooltip({
			x: rect.left + rect.width / 2,
			y: rect.top - 8,
			date: day.date,
			usage: day.usage,
		});
	};

	const handleMouseLeave = () => {
		setTooltip(null);
	};

	return (
		<div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
			{/* Month labels */}
			<div style={{ 
				display: "flex", 
				fontSize: 12,
				color: "#848d97",
			}}>
				{monthPositions.map(({ month, weekIndex }) => (
					<span
						key={`${month}-${weekIndex}`}
						style={{
							position: "absolute",
							left: 32 + weekIndex * 14,
						}}
					>
						{MONTH_LABELS[month]}
					</span>
				))}
			</div>

			<div style={{ display: "flex", marginTop: 20 }}>
				{/* Day labels */}
				<div style={{ 
					display: "flex", 
					flexDirection: "column", 
					gap: 7,
					marginRight: 4,
          marginBottom: 5,
					fontSize: 12,
					color: "#848d97",
				}}>
					{DAY_LABELS.map((label, i) => (
						<div 
							key={i} 
							style={{ 
								height: 12, 
								lineHeight: "12px",
								textAlign: "right",
								paddingRight: 4,
							}}
						>
							{label}
						</div>
					))}
				</div>

				{/* Heatmap grid */}
				<div style={{ display: "flex", gap: 2 }}>
					{weeks.map((week, weekIndex) => (
						<div key={weekIndex} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
							{week.map((day) => {
								const isInYear = day.date.getFullYear() === 2026;
								const tier = isInYear ? getUsageTier(day.usage, thresholds) : 0;
								const color = getTierColor(tier);
								
								return (
									<div
										key={day.dateKey}
										onClick={() => isInYear && handleDayClick(day)}
										onMouseEnter={(e) => isInYear && handleMouseEnter(e, day)}
										onMouseLeave={handleMouseLeave}
										style={{
											width: 11,
											height: 15,
                      marginBottom: 2,
											backgroundColor: isInYear ? color : "transparent",
											borderRadius: 2,
											cursor: isInYear ? "pointer" : "default",
											transition: "background-color 0.1s",
										}}
									/>
								);
							})}
						</div>
					))}
				</div>
			</div>

			{/* Legend */}
			<div style={{ 
				display: "flex", 
				alignItems: "center", 
				justifyContent: "flex-end",
				gap: 4,
				marginTop: 8,
				fontSize: 12,
				color: "#848d97",
			}}>
				<span>Less</span>
				{[0, 1, 2, 3, 4].map((tier) => (
					<div
						key={tier}
						style={{
							width: 12,
							height: 12,
							backgroundColor: getTierColor(tier),
							borderRadius: 2,
						}}
					/>
				))}
				<span>More</span>
			</div>

			{/* Tooltip */}
			{tooltip && (
				<div
					style={{
						position: "fixed",
						left: tooltip.x,
						top: tooltip.y,
						transform: "translate(-50%, -100%)",
						backgroundColor: "#1f2428",
						border: "1px solid #444c56",
						borderRadius: 6,
						padding: "8px 12px",
						fontSize: 12,
						color: "#e6edf3",
						whiteSpace: "nowrap",
						pointerEvents: "none",
						zIndex: 1000,
					}}
				>
					<div style={{ fontWeight: 600 }}>
						{tooltip.usage !== undefined 
							? formatMsToHoursOrMinutes(tooltip.usage)
							: "No data"
						}
					</div>
					<div style={{ color: "#848d97" }}>
						{formatTooltipDate(tooltip.date)}
					</div>
				</div>
			)}
		</div>
	);
};

export default YearlyHeatmap;
