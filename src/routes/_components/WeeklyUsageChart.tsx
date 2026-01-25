import { Box, Typography } from "@mui/material";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useGetWeeksDailyUsage from "../../queries/getWeeksDailyUsage";
import { getStartOfDayMs } from "../../lib/epochDayHelpers";
import { formatMsToHoursOrMinutes } from "../../lib/durationHelpers";

interface LastWeekScaffold {
  startOfDayMs: number;
  dayLabel: string;
  order: number;
}

interface UsageFragmentationChartProps {
  epochStartOfWeekMs: number,
  epochEndOfWeekMs: number,
}

const WeeklyUsageChart = ({ epochStartOfWeekMs, epochEndOfWeekMs }: UsageFragmentationChartProps) => {
  const { data: weeksDailyUsage } = useGetWeeksDailyUsage(epochStartOfWeekMs, epochEndOfWeekMs);

  const lastWeekScaffold: LastWeekScaffold[] = [];

  const startOfWeekDate: Date = new Date(epochStartOfWeekMs);
  for (let i = 0; i < 7; i++) {
    startOfWeekDate.setDate(startOfWeekDate.getDate() + (i === 0 ? 0 : 1));

    const dayLabel = startOfWeekDate.toLocaleDateString('en-US', { weekday: 'short' });

    lastWeekScaffold.push({
      startOfDayMs: getStartOfDayMs(startOfWeekDate),
      dayLabel,
      order: i + 1,
    });
  }

  const mergedWeeksDailyUsage = lastWeekScaffold.map((day) => {
    const match = weeksDailyUsage?.find((usage) => usage.day_start_ms === day.startOfDayMs);
    
    return {
      ...day,
      totalDurationMs: match ? match.total_duration_ms : 0,
      segmentCount: match ? match.segment_count : 0,
      exeCount: match ? match.exe_count : 0,
    };
  });
  
  return (
    <Box>
      <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: 2 }}>
        Focus Time Blocks
      </Typography>
      <Box sx={{ width: '750px', height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={mergedWeeksDailyUsage}
            margin={{
              top: 5,
              right: 20,
              left: 40,
              bottom: 5,
            }}
          >
            <XAxis
              type="category"
              dataKey="dayLabel"
            />
            <YAxis
              type="number"
              allowDecimals={false}
              label={{ value: 'Daily usage', angle: -90, position: 'left', offset: 20 }}
              tickFormatter={(v) => formatMsToHoursOrMinutes(Number(v))}
            />
            <Tooltip
              contentStyle={{ background: '#111', border: '1px solid #333' }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value) => [`${formatMsToHoursOrMinutes(Number(value))}`, 'Duration']}
            />
            <Bar
              dataKey="totalDurationMs"
              fill="#1976d2"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

export default WeeklyUsageChart;