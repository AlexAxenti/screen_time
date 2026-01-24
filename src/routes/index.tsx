import { createFileRoute } from '@tanstack/react-router'
import { Box, Typography } from '@mui/material'
import './index.css'
import DashboardSummary from './_components/DashboardSummary';
import TopExesChart from './_components/TopExesChart';
import UsageFragmentationChart from './_components/UsageFragmentationChart';
import useGetWeeksDailyUsage from '../queries/getWeeksDailyUsage';

export const Route = createFileRoute('/')({
  component: Index,
})


function Index() {
  const todayStart: Date = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const weekStart: Date = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() - 6);
  const weekStartMs = weekStart.getTime();

  const weekEnd: Date = new Date(todayStart);
  weekEnd.setDate(todayStart.getDate() + 1);
  const weekEndMs = weekEnd.getTime();  

  const epochStartOfDayMs = todayStart.getTime();

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