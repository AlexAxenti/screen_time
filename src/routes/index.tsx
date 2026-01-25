import { createFileRoute } from '@tanstack/react-router'
import { Box, Typography } from '@mui/material'
import './index.css'
import DashboardSummary from './_components/DashboardSummary';
import TopExesChart from './_components/TopExesChart';
import UsageFragmentationChart from './_components/UsageFragmentationChart';
import { getStartOfDayMs, getWeekEndMs, getWeekStartMs } from '../lib/epochDayHelpers';
import WeeklyUsageChart from './_components/WeeklyUsageChart';

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const today: Date = new Date();
  
  const weekStartMs = getWeekStartMs(today);
  const weekEndMs = getWeekEndMs(today);
  const epochStartOfDayMs = getStartOfDayMs(today);

  return (
    <div>    
      <Typography variant="h1" sx={{textAlign: 'center'}}>Screen Time</Typography>
      <DashboardSummary epochStartOfDayMs={epochStartOfDayMs} />

      <WeeklyUsageChart epochStartOfWeekMs={weekStartMs} epochEndOfWeekMs={weekEndMs} />

      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>  
        <TopExesChart epochStartOfDayMs={epochStartOfDayMs} />
        <UsageFragmentationChart epochStartOfDayMs={epochStartOfDayMs} />
      </Box>
    </div>
  );
};