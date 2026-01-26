import { createFileRoute } from '@tanstack/react-router'
import { Box } from '@mui/material'
import './index.css'
import DashboardSummary from './_components/DashboardSummary';
import TopExesChart from './_components/TopExesChart';
import UsageFragmentationChart from './_components/UsageFragmentationChart';
import { getWeekEndMs, getWeekStartMs } from '../lib/epochDayHelpers';
import WeeklyUsageChart from './_components/WeeklyUsageChart';
import DashboardHeader from './_components/DashboardHeader';
import DashboardCard from '../components/UI/DashboardCard';
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
    <Box>    
      <DashboardHeader 
        rangeStartMs={rangeStartMs} 
        rangeEndMs={rangeEndMs}
        weekStartMs={weekStartMs}
        weekEndMs={weekEndMs}
      />

      {/* Top Row: Weekly Chart (2/3) + Summary Cards (1/3) */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: 3,
        marginBottom: 3
      }}>  
        <DashboardCard title="Weekly Overview">
          <WeeklyUsageChart 
            epochStartOfWeekMs={weekStartMs} 
            epochEndOfWeekMs={weekEndMs} 
            handleSetRange={handleSetRange}
          />
        </DashboardCard>
        <DashboardSummary startOfRangeMs={rangeStartMs} endOfRangeMs={rangeEndMs} />
      </Box>

      {/* Bottom Row: Top Apps (1/2) + Fragmentation (1/2) */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: 3
      }}>  
        <DashboardCard title="Top Applications Used">
          <TopExesChart startOfRangeMs={rangeStartMs} endOfRangeMs={rangeEndMs} />
        </DashboardCard>
        <DashboardCard title="Focus Time Blocks">
          <UsageFragmentationChart startOfRangeMs={rangeStartMs} endOfRangeMs={rangeEndMs} />
        </DashboardCard>
      </Box>
    </Box>
  );
};