import { Box, Button, Popover, Typography } from "@mui/material";
import { useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import IconButton from "@mui/material/IconButton";
import useToggleTrackedApp from "../../../../hooks/mutations/useToggleTrackedApp";

interface TrackingDropdownProps {
  exe: string;
  isTracked: boolean;
}

const TrackingDropdown = ({ exe, isTracked }: TrackingDropdownProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { mutate: toggleTracked, isPending } = useToggleTrackedApp();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggle = () => {
    toggleTracked(
      { appId: exe, isTracked: !isTracked },
      { onSuccess: () => handleClose() }
    );
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          position: "absolute",
          top: -4,
          right: -28,
          color: "text.secondary",
          padding: 0.5,
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        <SettingsIcon sx={{ fontSize: 16 }} />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableScrollLock
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: 2,
            py: 1.5,
            minWidth: 260,
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
            {isTracked ? "Currently tracking" : "Not currently tracking"}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={handleToggle}
            disabled={isPending}
            sx={{ ml: "auto", whiteSpace: "nowrap", textTransform: "none" }}
          >
            {isPending
              ? "Updating..."
              : isTracked
                ? "Stop tracking"
                : "Start tracking"}
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default TrackingDropdown;
