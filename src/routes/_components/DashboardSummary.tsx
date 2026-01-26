import { Box } from '@mui/material'
import useGetUsageSummary from '../../queries/getUsageSummary'
import SimpleDataCard from '../../components/UI/SimpleDataCard'
import { formatMsToHoursAndMinutes } from '../../lib/durationHelpers'

interface DashboardSummaryProps {
  startOfRangeMs: number,
  endOfRangeMs: number,
}

function DashboardSummary({ startOfRangeMs, endOfRangeMs }: DashboardSummaryProps) {
  const { data: usageSummary } = useGetUsageSummary(startOfRangeMs, endOfRangeMs)
  if (!usageSummary) return null

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 2,
      flex: 1,
      marginBottom: 4
    }}>
      <SimpleDataCard dataValue={formatMsToHoursAndMinutes(usageSummary.total_duration)} dataLabel="Total Focus Time" />

      <SimpleDataCard dataValue={usageSummary.segments_count - 1} dataLabel="Focus Switches" />

      <SimpleDataCard dataValue={usageSummary.exe_count} dataLabel="Unique Apps" />
    </Box>
  )
}

export default DashboardSummary
