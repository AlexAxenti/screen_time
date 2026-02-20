import { Box, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "@tanstack/react-router";
import PageHeader from "../../../../components/UI/PageHeader";
import { getIconSrc } from "../../../../lib/iconPaths";
import PageHeaderTitle from "../../../../components/UI/PageHeaderTitle";
import Timeline from "../../../../components/Timeline/Timeline";
import TrackingDropdown from "./TrackingDropdown";

interface ApplicationDetailsPageHeaderProps {
  exe: string;
  displayName?: string;
  isTracked: boolean;
  rangeStartMs: number;
  rangeEndMs: number;
  weekStartMs: number;
  weekEndMs: number;
  onWeekChange: (newStartDate: Date) => void;
}

const ApplicationDetailsPageHeader = ({
  exe,
  displayName,
  isTracked,
  rangeStartMs,
  rangeEndMs,
  weekStartMs,
  weekEndMs,
  onWeekChange,
}: ApplicationDetailsPageHeaderProps) => {
  const router = useRouter();

  return (
    <PageHeader 
      leftContent={
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={() => router.history.back()}
            sx={{
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box
            sx={{
              width: 32,
              height: 32,
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <img
              src={getIconSrc(exe)}
              alt={displayName || exe}
              onError={(e) => {
                e.currentTarget.src = "/app_placeholder.png";
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Box>
          <Box sx={{ position: "relative" }}>
            <PageHeaderTitle title={displayName || exe} />
            <TrackingDropdown exe={exe} isTracked={isTracked} />
          </Box>
        </Box>
      }
      rightContent={
        <Timeline
          rangeStartMs={rangeStartMs}
          rangeEndMs={rangeEndMs}
          weekStartMs={weekStartMs}
          weekEndMs={weekEndMs}
          onWeekChange={onWeekChange}
          appId={exe}
        />
      }
    />
  );
}

export default ApplicationDetailsPageHeader;