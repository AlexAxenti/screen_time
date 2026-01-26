import { createFileRoute } from '@tanstack/react-router'
import { Box, Typography } from '@mui/material'
import './index.css'
import DashboardSummary from './_components/DashboardSummary';
import TopExesChart from './_components/TopExesChart';
import UsageFragmentationChart from './_components/UsageFragmentationChart';
import { getWeekEndMs, getWeekStartMs } from '../lib/epochDayHelpers';
import WeeklyUsageChart from './_components/WeeklyUsageChart';
import { useState } from 'react';

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const today: Date = new Date();
  
  const weekStartMs = getWeekStartMs(today);
  const weekEndMs = getWeekEndMs(today);

  const [rangeStartMs, setRangeStartMs] = useState<number>(weekStartMs);
  const [rangeEndMs, setRangeEndMs] = useState<number>(weekEndMs);

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

      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', gap: 6 }}>  
          <WeeklyUsageChart 
            epochStartOfWeekMs={weekStartMs} 
            epochEndOfWeekMs={weekEndMs} 
            handleSetRange={handleSetRange}
          />
          <DashboardSummary startOfRangeMs={rangeStartMs} endOfRangeMs={rangeEndMs} />
      </Box>

      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>  
        <TopExesChart startOfRangeMs={rangeStartMs} endOfRangeMs={rangeEndMs} />
        <UsageFragmentationChart startOfRangeMs={rangeStartMs} endOfRangeMs={rangeEndMs} />
      </Box>
    </div>
  );
};