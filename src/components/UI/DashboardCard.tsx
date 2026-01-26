import { Card, Typography, Box } from "@mui/material";
import type { ReactNode } from "react";

interface DashboardCardProps {
  title?: string;
  children: ReactNode;
  sx?: object;
}

const DashboardCard = ({ title, children, sx }: DashboardCardProps) => {
  return (
    <Card 
      elevation={0}
      sx={{ 
        padding: 3,
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...sx
      }}
    >
      {title && (
        <Typography 
          variant="h5" 
          sx={{ 
            marginBottom: 2, 
            fontWeight: 500,
            textAlign: 'center'
          }}
        >
          {title}
        </Typography>
      )}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    </Card>
  );
};

export default DashboardCard;
