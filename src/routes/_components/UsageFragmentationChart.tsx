import { Box, Typography } from "@mui/material";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useGetUsageFragmentation from "../../queries/getUsageFragmentation";
import type { UsageFragmentation } from "../../types/dto";

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

interface UsageFragmentationChartProps {
  epochStartOfDayMs: number
}

const UsageFragmentationChart = ({ epochStartOfDayMs }: UsageFragmentationChartProps) => {
  const { data: usageFragmentation } = useGetUsageFragmentation(epochStartOfDayMs);

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
  );
}

export default UsageFragmentationChart;