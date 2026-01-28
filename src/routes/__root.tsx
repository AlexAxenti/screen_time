import { Box } from "@mui/material";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import AppHeader from "../components/AppHeader";

export const Route = createRootRoute({
	component: () => (
		<Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
			<AppHeader />
			<Box
				component="main"
				sx={{
					flex: 1,
					width: "100%",
					px: { xs: 2, sm: 3 },
					py: 3,
				}}
			>
				<Outlet />
			</Box>
			<TanStackRouterDevtools />
		</Box>
	),
});
