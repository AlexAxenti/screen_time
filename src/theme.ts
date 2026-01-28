import { createTheme, type PaletteMode } from "@mui/material/styles";

const getTheme = (mode: PaletteMode) =>
	createTheme({
		palette: {
			mode,
			primary: {
				main: mode === "dark" ? "#90caf9" : "#1976d2",
			},
			secondary: {
				main: mode === "dark" ? "#ce93d8" : "#9c27b0",
			},
			...(mode === "dark"
				? {
						background: {
							default: "#1a1a2e",
							paper: "#252540",
						},
						text: {
							primary: "rgba(255, 255, 255, 0.87)",
							secondary: "#90caf9",
						},
						divider: "rgba(255, 255, 255, 0.12)",
					}
				: {
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
		},
	});

export default getTheme;
