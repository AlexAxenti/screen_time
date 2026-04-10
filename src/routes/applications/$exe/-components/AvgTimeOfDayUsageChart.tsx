import { Box } from "@mui/material";
import { useMemo } from "react";
import useGetAvgTimeOfDayUsage from "../../../../hooks/queries/useGetAvgTimeOfDayUsage";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMsToHoursOrMinutes } from "../../../../lib/durationFormatHelpers";

interface UsageFragmentationChartProps {
	startOfRangeMs: number;
	endOfRangeMs: number;
	appId?: string;
}

//TODO move to helpers?
export function formatHourToAmPm(hour: number): string {
  const h = hour % 24;

  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;

  return `${hour12}${ampm.toLowerCase()}`;
}

function formatHourRange(hour: number) {
  const start = formatHourToAmPm(hour);
  const end = formatHourToAmPm((hour + 1) % 24);
  return `${start} - ${end}`;
}

const AvgTimeOfDayUsageChart = ({
	startOfRangeMs,
	endOfRangeMs,
	appId,
}: UsageFragmentationChartProps) => {
  const { data: avgUsage } = useGetAvgTimeOfDayUsage(startOfRangeMs, endOfRangeMs, appId);

  //TODO decide if i want this or entire day
  //TODO fix x axis so it doesnt show less than 1 hour increments.
  const domain = useMemo(() => {
    if (!avgUsage || avgUsage.length === 0) return [0, 23];

    const hoursWithData = avgUsage
      .filter((d) => d.avg_ms_per_hour_of_day > 0)
      .map((d) => d.hour);

    if (hoursWithData.length === 0) return [0, 23];

    const firstHour = Math.min(...hoursWithData);
    const lastHour = Math.max(...hoursWithData);

    const domainStart = Math.max(0, firstHour - 2);
    const domainEnd = Math.min(23, lastHour + 2);

    return [domainStart, domainEnd];
  }, [avgUsage]);

  return (
    <Box sx={{ width: "100%", height: "300px" }}>
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={avgUsage}>
          <CartesianGrid vertical={false} />

          <XAxis 
            dataKey="hour" 
            type="number" 
            domain={domain} allowDataOverflow 
            tickFormatter={formatHourToAmPm} 
          />

          <YAxis 
            label={{
							value: "Time Spent",
							angle: -90,   
							position: "insideLeft",
							style: { textAnchor: "middle" },
						}}
            tickFormatter={(v) => formatMsToHoursOrMinutes(Number(v))}
          />

          <Tooltip 
            contentStyle={{ background: "#111", border: "1px solid #333" }}
						labelStyle={{ color: "#fff" }}
						itemStyle={{ color: "#fff" }}
            labelFormatter={(label) => formatHourRange(Number(label))}
            formatter={(value) => [formatMsToHoursOrMinutes(Number(value)), "Average time"]}
          />

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