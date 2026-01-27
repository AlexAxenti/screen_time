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
    
    const isSingleDay = (rangeEndMs - rangeStartMs) === 24 * 60 * 60 * 1000;
    
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
    
    const startFormatted = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endFormatted = new Date(rangeEndMs - 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startFormatted} - ${endFormatted}`;
  }, [rangeStartMs, rangeEndMs, weekStartMs, weekEndMs]);

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: 3,
      paddingBottom: 2,
      //TODO maybe remove below
      borderBottom: '1px solid',
      borderColor: 'divider'
    }}>
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 600,
          color: "text.primary",
        }}
      >
        Dashboard
      </Typography>
      <Box sx={{ textAlign: 'right' }}>
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block', 
            marginBottom: 0.25,
            color: "text.secondary",
            letterSpacing: '0.05em',
          }}
        >
          Selected Timeframe
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            color: "text.secondary",
          }}
        >
          {timeframeLabel}
        </Typography>
      </Box>
    </Box>
  );
};

export default DashboardHeader;
