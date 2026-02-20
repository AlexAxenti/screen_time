import { Box } from '@mui/material'
import { createFileRoute } from '@tanstack/react-router'
import PageHeader from '../../components/UI/PageHeader';
import GeneralSection from './-components/GeneralSection';
import UntrackedAppsSection from './-components/UntrackedAppsSection';

export const Route = createFileRoute('/settings/')({
  component: Index,
})

function Index() {
  return (
    <Box>
      <PageHeader title="Settings" />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <GeneralSection />
        <UntrackedAppsSection />
      </Box>
    </Box>
  );
}
