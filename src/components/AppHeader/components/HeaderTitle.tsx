import { Box, Typography } from "@mui/material";
import { Link } from "@tanstack/react-router";

const HeaderTitle = () => {
	return (
		<Link to="/" style={{ textDecoration: "none" }}>
			<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				<Box
						sx={{
							width: 24,
							height: 24,
							flexShrink: 0,
							overflow: "hidden",
						}}
					>
						<img
							src="/icon.png"
							alt="Screen Time Icon"
							style={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
							}}
						/>
					</Box>
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
			</Box>
		</Link>
	);
};

export default HeaderTitle;
