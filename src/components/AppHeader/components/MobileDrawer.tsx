import {
	Box,
	Drawer,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Typography,
	useTheme,
} from "@mui/material";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { FiMenu } from "react-icons/fi";
import { NAV_ITEMS } from "./NavItems";

interface MobileDrawerProps {
	isActiveRoute: (path: string) => boolean;
	sx?: object;
}

const MobileDrawer = ({ isActiveRoute, sx }: MobileDrawerProps) => {
	const theme = useTheme();
	const [drawerOpen, setDrawerOpen] = useState(false);

	return (
		<Fragment>
			<IconButton
				edge="end"
				color="inherit"
				aria-label="menu"
				onClick={() => setDrawerOpen(true)}
				sx={{ color: theme.palette.text.primary, ...sx }}
			>
				<FiMenu />
			</IconButton>

			<Drawer
				anchor="right"
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				PaperProps={{
					sx: {
						backgroundColor: "background.paper",
						width: 280,
					},
				}}
			>
				<Box sx={{ pt: 2, pb: 1, px: 2 }}>
					<Typography
						variant="h6"
						sx={{ fontWeight: 600, color: "text.primary" }}
					>
						Navigation
					</Typography>
				</Box>
				<List>
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
								<ListItem disablePadding>
									<ListItemButton
										onClick={() => setDrawerOpen(false)}
										sx={{
											mx: 1,
											borderRadius: 2,
											backgroundColor: isActive
												? theme.palette.mode === "dark"
													? "rgba(25, 118, 210, 0.15)"
													: "rgba(25, 118, 210, 0.08)"
												: "transparent",
										}}
									>
										<ListItemText
											primary={item.label}
											primaryTypographyProps={{
												fontWeight: 500,
												color: isActive ? "text.secondary" : "text.primary",
											}}
										/>
									</ListItemButton>
								</ListItem>
							</Link>
						);
					})}
				</List>
			</Drawer>
		</Fragment>
	);
};

export default MobileDrawer;
