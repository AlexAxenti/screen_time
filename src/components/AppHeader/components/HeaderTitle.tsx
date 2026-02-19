import { Typography } from "@mui/material";
import { Link } from "@tanstack/react-router";

const HeaderTitle = () => {
	return (
		<Link to="/" style={{ textDecoration: "none" }}>
			<Typography
				variant="h6"
				sx={{
					fontWeight: 700,
					fontSize: { xs: "1.1rem", sm: "1.25rem" },
					color: "text.primary",
					textDecoration: "none",
					letterSpacing: "-0.01em",
					flexShrink: 0,
				}}
			>
				Screen Time
			</Typography>
		</Link>
	);
};

export default HeaderTitle;
