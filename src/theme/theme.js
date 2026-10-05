import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#4b134f', // Tu morado principal
    },
    secondary: {
      main: '#c94b4b', // Tu rojo/granate secundario
    },
    background: {
      default: '#fdfbf7', // Tu color de fondo global
    },
  },
  typography: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
});