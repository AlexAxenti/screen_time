import { createTheme, type PaletteMode } from "@mui/material/styles";

const getTheme = (mode: PaletteMode) =>
	createTheme({
		palette: {
			mode,
			// Clean consistency beneath
			...(mode === "dark"
				? {
						primary: {
							main: "#90caf9",
						},
						secondary: {
							main: "#ce93d8",
						},
						background: {
							default: "#1a1a2e",
							paper: "#252540",
						},
						text: {
							primary: "#ffffffde",
							secondary: "#90caf9",
						},
						divider: "rgba(255, 255, 255, 0.12)",
					}
				: {
						primary: {
							main: "#1976d2",
						},
						secondary: {
							main: "#9c27b0",
						},
						background: {
							default: "#f0f2f5",
							paper: "#ffffff",
						},
						text: {
							primary: "#213547",
							secondary: "#1976d2",
						},
						divider: "rgba(0, 0, 0, 0.12)",
					}),
		},
		typography: {
			fontFamily: 'system-ui, "Roboto", Arial, sans-serif',
			h1: {
				fontSize: "3.5rem",
				fontWeight: 700,
				fontFamily: '"Roboto", Arial, sans-serif',
			},
			h2: {
				fontSize: "2rem",
				fontWeight: 600,
			},
			h4: {
				fontSize: "1.5rem",
				fontWeight: 500,
			},
			h5: {
				fontSize: "1.25rem",
				fontWeight: 500,
			},
			h6: {
				fontSize: "1rem",
				fontWeight: 500,
			},
		},
		shape: {
			borderRadius: 12,
		},
		components: {
			MuiCard: {
				styleOverrides: {
					root: {
						backgroundImage: "none",
						border: "1px solid",
						borderColor:
							mode === "dark"
								? "rgba(255, 255, 255, 0.08)"
								: "rgba(0, 0, 0, 0.08)",
					},
				},
			},
			MuiTooltip: {
				styleOverrides: {
					tooltip: {
						backgroundColor: mode === "dark" ? "#1a1a2e" : "#ffffff",
						color: mode === "dark" ? "#ffffffde" : "#213547",
						border: `1px solid ${
							mode === "dark"
								? "rgba(255, 255, 255, 0.12)"
								: "rgba(0, 0, 0, 0.12)"
						}`,
						padding: "12px 16px",
						fontSize: "0.875rem",
						lineHeight: 1.5,
						maxWidth: 300,
						boxShadow:
							mode === "dark"
								? "0 4px 20px rgba(0, 0, 0, 0.4)"
								: "0 4px 20px rgba(0, 0, 0, 0.15)",
						borderRadius: 8,
					},
					arrow: {
						color: mode === "dark" ? "#1a1a2e" : "#ffffff",
						"&::before": {
							border: `1px solid ${
								mode === "dark"
									? "rgba(255, 255, 255, 0.12)"
									: "rgba(0, 0, 0, 0.12)"
							}`,
						},
					},
				},
			},
		},
	});

export default getTheme;
