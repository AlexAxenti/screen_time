import { Box } from '@mui/material'
import { createFileRoute } from '@tanstack/react-router'
import useToggleTrackedApp from '../../hooks/mutations/useToogleTrackedApp';
import useGetUntrackedApps from '../../hooks/queries/useGetUntrackedApps';

export const Route = createFileRoute('/settings/')({
  component: Index,
})

function Index() {
  const { data: untrackedApps } = useGetUntrackedApps();
  console.log("Untracked apps:", untrackedApps);

  const toggleTracked = useToggleTrackedApp();

  const handleToggle = () => {
    toggleTracked.mutate({ appId: "d1af8a5a7298fdde40ca87f5a2f43b2d", isTracked: false });
  }

  return (
    <Box>
      <div>Hello "/settings/"!</div>
      <button onClick={handleToggle}>Track</button>
    </Box>
  );
}
