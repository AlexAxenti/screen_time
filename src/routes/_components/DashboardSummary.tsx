import { Box, Card, Typography } from '@mui/material'
import useGetUsageSummary from '../../queries/getUsageSummary'

interface DashboardSummaryProps {
  epochStartOfDayMs: number
}

function DashboardSummary({ epochStartOfDayMs }: DashboardSummaryProps) {
  const { data: usageSummary } = useGetUsageSummary(epochStartOfDayMs)

  if (!usageSummary) return null

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    return `${hours}h ${minutes}m`
  }

  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 2,
      marginBottom: 4
    }}>
      <Card sx={{ 
        padding: 2,
        textAlign: 'center'
      }}>
        <Typography variant="h4" color="text.secondary">
          {formatDuration(usageSummary.total_duration)}
        </Typography>
        <Typography variant="body2" color="text.primary" sx={{ marginTop: 1 }}>
          Total Focus Time
        </Typography>
      </Card>

      <Card sx={{ 
        padding: 2,
        textAlign: 'center'
      }}>
        <Typography variant="h4" color="text.secondary">
          {usageSummary.segments_count - 1}
        </Typography>
        <Typography variant="body2" color="text.primary" sx={{ marginTop: 1 }}>
          Focus Switches
        </Typography>
      </Card>

      <Card sx={{ 
        padding: 2,
        textAlign: 'center'
      }}>
        <Typography variant="h4" color="text.secondary">
          {usageSummary.exe_count}
        </Typography>
        <Typography variant="body2" color="text.primary" sx={{ marginTop: 1 }}>
          Unique Apps
        </Typography>
      </Card>
    </Box>
  )
}

export default DashboardSummary
