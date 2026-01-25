import { createFileRoute } from '@tanstack/react-router'
import { Box, Typography } from '@mui/material'
import './index.css'
import DashboardSummary from './_components/DashboardSummary';
import TopExesChart from './_components/TopExesChart';
import UsageFragmentationChart from './_components/UsageFragmentationChart';
import { getStartOfDayMs, getWeekEndMs, getWeekStartMs } from '../lib/epochDayHelpers';
import WeeklyUsageChart from './_components/WeeklyUsageChart';
import { useState } from 'react';

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const today: Date = new Date();
  
  const weekStartMs = getWeekStartMs(today);
  const weekEndMs = getWeekEndMs(today);
  const startOfDayMs = getStartOfDayMs(today);

  const [rangeStartMs, setRangeStartMs] = useState<number>(weekStartMs);
  const [rangeEndMs, setRangeEndMs] = useState<number>(weekEndMs);

  console.log("range start: ", rangeStartMs);
  console.log("range end: ", rangeEndMs);

  const handleSetRange = (startMs: number, endMs: number) => {
    if (startMs === rangeStartMs) {
      setRangeStartMs(weekStartMs);
      setRangeEndMs(weekEndMs);
    } else {
      setRangeStartMs(startMs);
      setRangeEndMs(endMs);
    }
  }

  return (
    <div>    
      <Typography variant="h1" sx={{textAlign: 'center'}}>Screen Time</Typography>
      <DashboardSummary epochStartOfDayMs={startOfDayMs} />

      <WeeklyUsageChart 
        epochStartOfWeekMs={weekStartMs} 
        epochEndOfWeekMs={weekEndMs} 
        handleSetRange={handleSetRange}
      />

      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>  
        <TopExesChart epochStartOfDayMs={startOfDayMs} />
        <UsageFragmentationChart epochStartOfDayMs={startOfDayMs} />
      </Box>
    </div>
  );
};