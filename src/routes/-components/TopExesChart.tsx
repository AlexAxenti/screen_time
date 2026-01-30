import { Box } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import {
	Bar,
	BarChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { formatMsToHoursOrMinutes } from "../../lib/durationFormatHelpers";
import useGetTopUsage from "../../queries/getTopUsage";

const TOP_APP_COUNT = 7;

interface TopExesChartProps {
	startOfRangeMs: number;
	endOfRangeMs: number;
}

const TopExesChart = ({ startOfRangeMs, endOfRangeMs }: TopExesChartProps) => {
	const navigate = useNavigate();
	const { data: topUsage } = useGetTopUsage(
		startOfRangeMs,
		endOfRangeMs,
		TOP_APP_COUNT,
	);

	const truncate = (s: string, n = 12) =>
		s.length > n ? `${s.slice(0, n - 1)}…` : s;

	const handleBarClick = (window_exe: string) => {
		if (window_exe) {
			navigate({
				to: "/applications/$exe",
				params: { exe: window_exe },
			});
		}
	};

	return (
		<Box sx={{ width: "100%", height: "300px" }}>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart
					data={topUsage?.window_segments || []}
					layout="vertical"
					barSize={60}
					margin={{
						top: 5,
						right: 20,
						left: 0,
						bottom: 5,
					}}
					onClick={(e) => {
						const idx = e?.activeTooltipIndex;
						if (idx === null || idx === undefined) return;

						let selectedSegment = topUsage?.window_segments[Number(idx)];

						if (!selectedSegment) return;

						handleBarClick(selectedSegment.window_exe);
					}}
				>
					<XAxis
						type="number"
						tickFormatter={(v) => formatMsToHoursOrMinutes(Number(v))}
					/>
					<YAxis
						type="category"
						dataKey="window_exe"
						width={120}
						tickFormatter={(v) => truncate(String(v))}
					/>
					<Tooltip
						labelFormatter={(label) => `Executable: ${String(label)}`}
						contentStyle={{ background: "#111", border: "1px solid #333" }}
						labelStyle={{ color: "#fff" }}
						itemStyle={{ color: "#fff" }}
						formatter={(value) => [
							formatMsToHoursOrMinutes(Number(value ?? 0)),
							"Duration",
						]}
					/>
					<Bar
						dataKey="duration"
						fill="#1976d2"
						radius={[0, 10, 10, 0]}
						cursor="pointer"
					/>
				</BarChart>
			</ResponsiveContainer>
		</Box>
	);
};

export default TopExesChart;
