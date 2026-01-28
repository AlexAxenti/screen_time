import { Box, useTheme } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { NAV_ITEMS } from "./NavItems";

interface NavLinksProps {
	isActiveRoute: (route: string) => boolean;
}

const NavLinks = ({ isActiveRoute }: NavLinksProps) => {
	const theme = useTheme();

	return (
		<Box
			sx={{
				display: "flex",
				gap: 1,
				alignItems: "center",
			}}
		>
			{NAV_ITEMS.map((item) => {
				const isActive = isActiveRoute(item.to);

				const isDashboard = item.to === "/";
				return (
					<Link
						key={item.to}
						to={item.to}
						preload={isDashboard ? false : undefined}
						style={{ textDecoration: "none" }}
					>
						<Box
							sx={{
								px: 2,
								py: 1,
								borderRadius: 2,
								textDecoration: "none",
								// Fix theme
								color: isActive ? "text.secondary" : "text.primary",
								backgroundColor: isActive
									? theme.palette.mode === "dark"
										? "rgba(25, 118, 210, 0.15)"
										: "rgba(25, 118, 210, 0.08)"
									: "transparent",
								fontWeight: 500,
								fontSize: "0.875rem",
								transition:
									"background-color 0.2s ease-in-out, color 0.2s ease-in-out",
								"&:hover": {
									backgroundColor:
										theme.palette.mode === "dark"
											? "rgba(255, 255, 255, 0.08)"
											: "rgba(0, 0, 0, 0.04)",
									color: "primary.main",
								},
							}}
						>
							{item.label}
						</Box>
					</Link>
				);
			})}
		</Box>
	);
};

export default NavLinks;
