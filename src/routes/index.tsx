import { createFileRoute } from '@tanstack/react-router'
import { Box, Card, Typography } from '@mui/material'
import './index.css'
import useGetUsage from '../queries/getUsage';
import useGetUsageFragmentation from '../queries/getUsageFragmentation';
import DashboardSummary from './_components/DashboardSummary';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatMsToHoursOrMinutes } from '../lib/durationHelpers';
import type { UsageFragmentation } from '../types/dto';

export const Route = createFileRoute('/')({
  component: Index,
})

const BUCKETS = [
  { bucket: 'lt_1m', order: 1 },
  { bucket: '1_2m', order: 2 },
  { bucket: '2_5m', order: 3 },
  { bucket: '5_15m', order: 4 },
  { bucket: '15_60m', order: 5 },
  { bucket: '60m_plus', order: 6 },
] as const;

const BUCKET_LABELS: Record<string, string> = {
  'lt_1m': '< 1m',
  '1_2m': '1 - 2m',
  '2_5m': '2 - 5m',
  '5_15m': '5 - 15m',
  '15_60m': '15 - 60m',
  '60m_plus': '> 60m',
}

function Index() {
  const now: Date = new Date();
  now.setHours(0, 0, 0, 0);

  const epochStartOfDayMs = now.getTime();

  const { data: windowSegments } = useGetUsage(epochStartOfDayMs);
  const { data: usageFragmentation } = useGetUsageFragmentation(epochStartOfDayMs);

  console.log("UsageFragmentation:", usageFragmentation);

  const truncate = (s: string, n = 12) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

  const normalizeBuckets = (rows: UsageFragmentation[]) => {
    const map = new Map(rows.map(r => [r.duration_bucket, r.count]));

    return BUCKETS.map(b => ({
      bucket: b.bucket,
      bucket_order: b.order,
      count: map.get(b.bucket) ?? 0,
    }));
  }

  const bucketLabel = (bucket: string) => {
    return BUCKET_LABELS[bucket] || bucket;
  }

  return (
    <div>    
      <Typography variant="h1" sx={{textAlign: 'center'}}>Screen Time</Typography>
      <DashboardSummary epochStartOfDayMs={epochStartOfDayMs} />
      {/* <div>
        {windowSegments && windowSegments.map((segment, index) => (
          <Card key={index} sx={{ 
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: 2,
            marginBottom: 2
          }}>
            <Typography>{segment.window_exe}</Typography>
            <Typography>Duration: {Math.floor(segment.duration / 60000)} minutes</Typography>
          </Card>
        ))}
      </div> */}

      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>  
        <Box>
          <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: 2 }}>
            Top Applications Used
          </Typography>
          <Box sx={{ width: '550px', height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={windowSegments}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 20,
                  left: 0,
                  bottom: 5,
                }}
              >
                {/* <CartesianGrid strokeDasharray="3 3" /> */}
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
                  contentStyle={{ background: '#111', border: '1px solid #333' }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value) => [
                    formatMsToHoursOrMinutes(Number(value ?? 0)),
                    'Duration',
                  ]}
                />
                <Bar
                  dataKey="duration"
                  fill="#1976d2"
                  radius={[0, 10, 10, 0]} // rounded right edge
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        <Box>
          <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: 2 }}>
            Focus Time Blocks
          </Typography>
          <Box sx={{ width: '550px', height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={normalizeBuckets(usageFragmentation ?? [])}
                margin={{
                  top: 5,
                  right: 20,
                  left: 0,
                  bottom: 5,
                }}
              >
                {/* <CartesianGrid strokeDasharray="3 3" /> */}
                <XAxis
                  type="category"
                  dataKey="bucket"
                  tickFormatter={(v) => bucketLabel(String(v))}
                />
                <YAxis
                  type="number"
                  allowDecimals={false}
                  label={{ value: 'Segment Counts', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  labelFormatter={(label) => `Bucket: ${bucketLabel(String(label))}`}
                  contentStyle={{ background: '#111', border: '1px solid #333' }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value) => [`${value} segments`, 'Count']}
                />
                <Bar
                  dataKey="count"
                  fill="#1976d2"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Box>
    </div>
  )
}