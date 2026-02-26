import { Box } from "@mui/material";
import { createRootRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import AppHeader from "../components/AppHeader/AppHeader";
import OnboardingFlow from "../components/OnboardingFlow/OnboardingFlow";
import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import useGetApplicationSettings from "../hooks/queries/useGetApplicationSettings";

export const Route = createRootRoute({
	component: () => {
		const navigate = useNavigate();
		const { data: settings } = useGetApplicationSettings();

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

		if (!settings) {
			return null;
		}

		if (!settings.is_onboarded) {
			return <OnboardingFlow />;
		}

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
