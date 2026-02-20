import { Box } from '@mui/material'
import { createFileRoute } from '@tanstack/react-router'
import useToggleTrackedApp from '../../hooks/mutations/useToogleTrackedApp';

export const Route = createFileRoute('/settings/')({
  component: Index,
})

function Index() {
  const toggleTracked = useToggleTrackedApp();

  const handleToggle = () => {
    toggleTracked.mutate({ appId: "7bca0866455944160038fa86c2007765", isTracked: false });
  }

  return (
    <Box>
      <div>Hello "/settings/"!</div>
      <button onClick={handleToggle}>Track</button>
    </Box>
  );
}
