import { createFileRoute } from '@tanstack/react-router'
import { Box, Typography } from '@mui/material'
import './index.css'
import DashboardSummary from './_components/DashboardSummary';
import TopExesChart from './_components/TopExesChart';
import UsageFragmentationChart from './_components/UsageFragmentationChart';
import useGetWeeksDailyUsage from '../queries/getWeeksDailyUsage';
import { getStartOfDayMs, getWeekEndMs, getWeekStartMs } from '../lib/epochDayHelpers';

export const Route = createFileRoute('/')({
  component: Index,
})


function Index() {
  const today: Date = new Date();
  
  const weekStartMs = getWeekStartMs(today);
  const weekEndMs = getWeekEndMs(today);
  const epochStartOfDayMs = getStartOfDayMs(today);

  const { data: weeksDailyUsage } = useGetWeeksDailyUsage(weekStartMs, weekEndMs);

  console.log('weeksDailyUsage', weeksDailyUsage);

  return (
    <div>    
      <Typography variant="h1" sx={{textAlign: 'center'}}>Screen Time</Typography>
      <DashboardSummary epochStartOfDayMs={epochStartOfDayMs} />

      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>  
        <TopExesChart epochStartOfDayMs={epochStartOfDayMs} />
        <UsageFragmentationChart epochStartOfDayMs={epochStartOfDayMs} />
      </Box>
    </div>
  );
};