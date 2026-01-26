import { Box, Typography } from "@mui/material";
import { useMemo } from "react";

interface DashboardHeaderProps {
  rangeStartMs: number;
  rangeEndMs: number;
  weekStartMs: number;
  weekEndMs: number;
}

const DashboardHeader = ({ rangeStartMs, rangeEndMs, weekStartMs, weekEndMs }: DashboardHeaderProps) => {
  const timeframeLabel = useMemo(() => {
    const startDate = new Date(rangeStartMs);
    
    // Check if it's a single day (24 hours difference)
    const isSingleDay = (rangeEndMs - rangeStartMs) === 24 * 60 * 60 * 1000;
    
    // Check if it's the full week
    const isFullWeek = rangeStartMs === weekStartMs && rangeEndMs === weekEndMs;
    
    if (isSingleDay) {
      return startDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    
    if (isFullWeek) {
      const startFormatted = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endFormatted = new Date(rangeEndMs - 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${startFormatted} - ${endFormatted} (This Week)`;
    }
    
    // Default range display
    const startFormatted = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endFormatted = new Date(rangeEndMs - 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startFormatted} - ${endFormatted}`;
  }, [rangeStartMs, rangeEndMs, weekStartMs, weekEndMs]);

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: 4,
      paddingBottom: 2,
      borderBottom: '1px solid',
      borderColor: 'divider'
    }}>
      <Typography variant="h2" sx={{ fontWeight: 600 }}>
        Dashboard
      </Typography>
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', marginBottom: 0.5 }}>
          Selected Timeframe
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
          {timeframeLabel}
        </Typography>
      </Box>
    </Box>
  );
};

export default DashboardHeader;
