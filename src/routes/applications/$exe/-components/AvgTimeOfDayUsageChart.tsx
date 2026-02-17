import { Box } from "@mui/material";
import useGetAvgTimeOfDayUsage from "../../../../hooks/queries/useGetAvgTimeOfDayUsage";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface UsageFragmentationChartProps {
	startOfRangeMs: number;
	endOfRangeMs: number;
	appId: string;
}

const AvgTimeOfDayUsageChart = ({
	startOfRangeMs,
	endOfRangeMs,
	appId,
}: UsageFragmentationChartProps) => {
  const { data: avgUsage } = useGetAvgTimeOfDayUsage(startOfRangeMs, endOfRangeMs, appId);

  return (
    <Box sx={{ width: "100%", height: "300px" }}>
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={avgUsage}>
          <CartesianGrid vertical={false} />

          <XAxis dataKey="hour" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="avg_ms_per_hour_of_day"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
			</ResponsiveContainer>
		</Box>
  );
};

export default AvgTimeOfDayUsageChart;