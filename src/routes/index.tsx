import { createFileRoute } from '@tanstack/react-router'
import { Box, Typography } from '@mui/material'
import './index.css'
import DashboardSummary from './_components/DashboardSummary';
import TopExesChart from './_components/TopExesChart';
import UsageFragmentationChart from './_components/UsageFragmentationChart';

export const Route = createFileRoute('/')({
  component: Index,
})


function Index() {
  const now: Date = new Date();
  now.setHours(0, 0, 0, 0);

  const epochStartOfDayMs = now.getTime();

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
        <TopExesChart epochStartOfDayMs={epochStartOfDayMs} />
        <UsageFragmentationChart epochStartOfDayMs={epochStartOfDayMs} />
      </Box>
    </div>
  )
}