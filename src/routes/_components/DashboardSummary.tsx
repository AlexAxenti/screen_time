import { Box } from '@mui/material'
import useGetUsageSummary from '../../queries/getUsageSummary'
import SimpleDataCard from '../../components/UI/SimpleDataCard'
import { formatMsToHoursAndMinutes } from '../../lib/durationHelpers'

interface DashboardSummaryProps {
  epochStartOfDayMs: number
}

function DashboardSummary({ epochStartOfDayMs }: DashboardSummaryProps) {
  const { data: usageSummary } = useGetUsageSummary(epochStartOfDayMs)

  if (!usageSummary) return null

  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 2,
      marginBottom: 4
    }}>
      <SimpleDataCard dataValue={formatMsToHoursAndMinutes(usageSummary.total_duration)} dataLabel="Total Focus Time" />

      <SimpleDataCard dataValue={usageSummary.segments_count - 1} dataLabel="Focus Switches" />

      <SimpleDataCard dataValue={usageSummary.exe_count} dataLabel="Unique Apps" />
    </Box>
  )
}

export default DashboardSummary
