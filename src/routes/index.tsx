import { createFileRoute } from '@tanstack/react-router'
import { Box, Typography } from '@mui/material'
import './index.css'
import DashboardSummary from './_components/DashboardSummary';
import TopExesChart from './_components/TopExesChart';
import UsageFragmentationChart from './_components/UsageFragmentationChart';
import useGetWeeksDailyUsage from '../queries/getWeeksDailyUsage';
import { getStartOfDayMs, getWeekEndMs, getWeekStartMs } from '../lib/epochDayHelpers';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatMsToHoursOrMinutes } from '../lib/durationHelpers';

export const Route = createFileRoute('/')({
  component: Index,
})

interface LastWeekScaffold {
  startOfDayMs: number;
  dayLabel: string;
  order: number;
}

function Index() {
  const today: Date = new Date();
  
  const weekStartMs = getWeekStartMs(today);
  const weekEndMs = getWeekEndMs(today);
  const epochStartOfDayMs = getStartOfDayMs(today);

  const { data: weeksDailyUsage } = useGetWeeksDailyUsage(weekStartMs, weekEndMs);

  console.log("Saturday", weeksDailyUsage && new Date(weeksDailyUsage[6].day_start_ms).toString());

  //GetWeekScaffold
  const lastWeekScaffold: LastWeekScaffold[] = [];

  const startOfWeekDate: Date = new Date(getWeekStartMs(today));
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

  console.log("lastWeekScaffold", mergedWeeksDailyUsage);

  console.log('weeksDailyUsage', weeksDailyUsage);

  return (
    <div>    
      <Typography variant="h1" sx={{textAlign: 'center'}}>Screen Time</Typography>
      <DashboardSummary epochStartOfDayMs={epochStartOfDayMs} />

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
                // tickFormatter={(v) => bucketLabel(String(v))}
              />
              <YAxis
                type="number"
                allowDecimals={false}
                label={{ value: 'Daily usage', angle: -90, position: 'left', offset: 20 }}
                tickFormatter={(v) => formatMsToHoursOrMinutes(Number(v))}
              />
              <Tooltip
                // labelFormatter={(label) => `Bucket: ${bucketLabel(String(label))}`}
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

      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>  
        <TopExesChart epochStartOfDayMs={epochStartOfDayMs} />
        <UsageFragmentationChart epochStartOfDayMs={epochStartOfDayMs} />
      </Box>
    </div>
  );
};