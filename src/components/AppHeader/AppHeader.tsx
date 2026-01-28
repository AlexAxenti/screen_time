import { AppBar, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import { useMatchRoute } from "@tanstack/react-router";
import HeaderTitle from "./components/Headertitle";
import MobileDrawer from "./components/MobileDrawer";
import NavLinks from "./components/NavLinks";
import SearchBar from "./components/SearchBar";

const AppHeader = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	const matchRoute = useMatchRoute();

	const isActiveRoute = (to: string) => {
		if (to === "/") {
			return matchRoute({ to: "/" }) !== false;
		}
		return matchRoute({ to, fuzzy: true }) !== false;
	};

	return (
		<AppBar
			position="sticky"
			elevation={0}
			sx={{
				backgroundColor:
					theme.palette.mode === "dark"
						? "rgba(26, 26, 46, 0.95)"
						: "rgba(255, 255, 255, 0.95)",
				backdropFilter: "blur(8px)",
				borderBottom: "1px solid",
				borderColor: theme.palette.divider,
			}}
		>
			<Toolbar
				sx={{
					maxWidth: 1280,
					width: "100%",
					mx: "auto",
					px: { xs: 2, sm: 3 },
					minHeight: { xs: 56, sm: 64 },
					justifyContent: "space-between",
				}}
			>
				<HeaderTitle />

				{!isMobile && <SearchBar />}

				{isMobile ? (
					<MobileDrawer isActiveRoute={isActiveRoute} />
				) : (
					<NavLinks isActiveRoute={isActiveRoute} />
				)}
			</Toolbar>
		</AppBar>
	);
};

export default AppHeader;
