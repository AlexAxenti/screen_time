import { IconButton, Tooltip, keyframes, useTheme } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const RefreshCacheButton = () => {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const [spinning, setSpinning] = useState(false);

  const handleClick = () => {
    queryClient.invalidateQueries();
    setSpinning(true);
    setTimeout(() => setSpinning(false), 600);
  };

  return (
    <Tooltip title="Refresh data">
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ color: theme.palette.text.secondary }}
      >
        <RefreshIcon
          sx={spinning ? { animation: `${spin} 0.6s ease-in-out` } : undefined}
        />
      </IconButton>
    </Tooltip>
  );
}

export default RefreshCacheButton;