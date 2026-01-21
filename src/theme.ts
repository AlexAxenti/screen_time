import { createTheme, type PaletteMode } from "@mui/material/styles";

const getTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    ...(mode === 'dark' ? {
      background: {
        default: '#242424',
        paper: '#222222',
      },
      text: {
        primary: 'rgba(255, 255, 255, 0.87)',
      },
    } : {
      background: {
        default: '#ffffff',
        paper: '#f5f5f5',
      },
      text: {
        primary: '#213547',
      },
    }),
  },
  typography: {
    fontFamily: 'system-ui, "Roboto", Arial, sans-serif',
  }
})

export default getTheme;