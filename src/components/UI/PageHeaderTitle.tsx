import { Typography } from "@mui/material";

const PageHeaderTitle = ({ title }: { title: string }) => {
  return (
    <Typography
      variant="h4"
      sx={{
        fontWeight: 600,
        color: "text.primary",
      }}
    >
      {title}
    </Typography>
  );
}

export default PageHeaderTitle;