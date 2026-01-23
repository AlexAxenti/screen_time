import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";

interface SimpleDataCardProps {
  dataValue: string | number;
  dataLabel: string;
  sx?: object;
}

const SimpleDataCard  = ({ dataValue, dataLabel, sx }: SimpleDataCardProps) => {
  return (
    <Card sx={{ 
      padding: 2,
      textAlign: 'center',
      ...sx
    }}>
      <Typography variant="h4" color="text.secondary">
        {dataValue}
      </Typography>
      <Typography variant="body2" color="text.primary" sx={{ marginTop: 1 }}>
        {dataLabel}
      </Typography>
    </Card>
  );
}

export default SimpleDataCard;