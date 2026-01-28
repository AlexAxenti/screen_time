import { StrictMode, useMemo } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ThemeProvider, useMediaQuery } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import getTheme from "./theme.ts";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5,
		},
	},
});

const router = createRouter({
	routeTree,
	context: {
		queryClient,
	},
	defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function Root() {
	const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
	const theme = useMemo(
		() => getTheme(prefersDarkMode ? "dark" : "light"),
		[prefersDarkMode],
	);

	return (
		<ThemeProvider theme={theme}>
			<QueryClientProvider client={queryClient}>
				<CssBaseline />
				<ReactQueryDevtools initialIsOpen={false} />
				<RouterProvider router={router} />
			</QueryClientProvider>
		</ThemeProvider>
	);
}

// biome-ignore lint: biome-ignore
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Root />
	</StrictMode>,
);
