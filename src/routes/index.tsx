import { createFileRoute } from '@tanstack/react-router'
import { Card, Typography } from '@mui/material'
import './index.css'
import useGetUsage from '../queries/getUsage';
import useGetUsageSummary from '../queries/getUsageSummary';

export interface WindowSegment {
  window_exe: string,
  duration: number
}

export const Route = createFileRoute('/')({
  component: Index,
})


function Index() {
  const { data: WindowSegments } = useGetUsage();
  const { data: UsageSummary } = useGetUsageSummary();

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
