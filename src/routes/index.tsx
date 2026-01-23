import { createFileRoute } from '@tanstack/react-router'
import { Box, Card, Typography } from '@mui/material'
import './index.css'
import useGetUsage from '../queries/getUsage';
import useGetUsageFragmentation from '../queries/getUsageFragmentation';
import DashboardSummary from './_components/DashboardSummary';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatMsToHoursOrMinutes } from '../lib/durationHelpers';

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const now: Date = new Date();
  now.setHours(0, 0, 0, 0);

  const epochStartOfDayMs = now.getTime();

  const { data: windowSegments } = useGetUsage(epochStartOfDayMs);
  const { data: usageFragmentation } = useGetUsageFragmentation(epochStartOfDayMs);

  console.log("UsageFragmentation:", usageFragmentation);

  const truncate = (s: string, n = 10) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

  return (
    <div>    
      <Typography variant="h1" sx={{textAlign: 'center'}}>Screen Time</Typography>
      <DashboardSummary epochStartOfDayMs={epochStartOfDayMs} />
      <div>
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
      </div>

      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row' }}>  
        <Box sx={{ width: '550px', height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={windowSegments}
              margin={{
                top: 5,
                right: 0,
                left: 40,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="window_exe"
                angle={-25}
                textAnchor="end"
                height={80}
                tickMargin={10}
                tickFormatter={(v) => truncate(String(v))}
              />
              <YAxis 
                width={70} 
                label={{ value: 'Duration', angle: -90, position: 'insideLeft' }} 
                tickFormatter={(v) => formatMsToHoursOrMinutes(v)} 
              />
              <Tooltip 
                labelFormatter={(label) => `Executable: ${String(label)}`}
                contentStyle={{ background: '#111', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value) => [formatMsToHoursOrMinutes(Number(value ?? 0)), 'Duration']}
              />
              <Legend />
              <Bar dataKey="duration" fill="#1976d2" radius={[10, 10, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box sx={{ width: '550px', height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={windowSegments}
              layout="vertical"
              margin={{
                top: 5,
                right: 20,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickFormatter={(v) => formatMsToHoursOrMinutes(Number(v))}
              />
              <YAxis
                type="category"
                dataKey="window_exe"
                width={170}
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
              <Legend />
              <Bar
                dataKey="duration"
                fill="#1976d2"
                radius={[0, 10, 10, 0]} // rounded right edge
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </div>
  )
}