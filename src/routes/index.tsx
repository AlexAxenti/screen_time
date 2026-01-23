import { createFileRoute } from '@tanstack/react-router'
import { Card, Typography } from '@mui/material'
import './index.css'
import useGetUsage from '../queries/getUsage';
import useGetUsageSummary from '../queries/getUsageSummary';
import useGetUsageFragmentation from '../queries/getUsageFragmentation';

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const now: Date = new Date();
  now.setHours(0, 0, 0, 0);

  const epochStartOfDayMs = now.getTime();

  const { data: WindowSegments } = useGetUsage(epochStartOfDayMs);
  const { data: UsageSummary } = useGetUsageSummary(epochStartOfDayMs);
  const { data: usageFragmentation } = useGetUsageFragmentation(epochStartOfDayMs);

  console.log("UsageSummary:", UsageSummary);
  console.log("UsageFragmentation:", usageFragmentation);

  return (
    <div>    
      <h1>Screen Time</h1>
      {WindowSegments && WindowSegments.map((segment, index) => (
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
  )
}