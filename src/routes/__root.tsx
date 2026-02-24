import { Box } from "@mui/material";
import { createRootRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import AppHeader from "../components/AppHeader/AppHeader";
import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";

export const Route = createRootRoute({
	component: () => {
		const navigate = useNavigate();

		useEffect(() => {
			let unlisten: null | (() => void) = null;

			(async () => {
				try {
					unlisten = await listen("app:reset-to-dashboard", () => {
						navigate({ to: "/", replace: true });
					});
				} catch (e) {
					console.error("FAILED to register listener", e);
				}
			})();

			return () => {
				if (unlisten) unlisten();
			};
		}, [navigate]);

		return (
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
		)
	},
});
