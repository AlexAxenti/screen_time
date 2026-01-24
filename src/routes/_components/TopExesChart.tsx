import { Box, Typography } from "@mui/material";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatMsToHoursOrMinutes } from "../../lib/durationHelpers";
import useGetTopUsage from "../../queries/getTopUsage";


interface TopExesChartProps {
  epochStartOfDayMs: number
}

const TopExesChart = ({ epochStartOfDayMs }: TopExesChartProps) => {
  const { data: windowSegments } = useGetTopUsage(epochStartOfDayMs);

  const truncate = (s: string, n = 12) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

  return (
    <Box>
      <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: 2 }}>
        Top Applications Used
      </Typography>
      <Box sx={{ width: '550px', height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={windowSegments}
            layout="vertical"
            barSize={60}
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
  );
}

export default TopExesChart;