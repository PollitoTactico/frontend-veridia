import { createTheme } from '@mui/material/styles';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

const theme = createTheme({
  palette: {
    primary: { main: '#0066cc' },
    secondary: { main: '#00a896' },
    background: {
      default: '#fafbfc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
    },
    divider: '#e8ecf1',
    success: { main: '#00a896' },
    error: { main: '#d32f2f' },
    warning: { main: '#f57c00' },
    info: { main: '#0066cc' },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: '32px',
      letterSpacing: '-0.5px',
    },
    h2: {
      fontWeight: 700,
      fontSize: '28px',
      letterSpacing: '-0.3px',
    },
    h3: {
      fontWeight: 700,
      fontSize: '24px',
    },
    h4: {
      fontWeight: 700,
      fontSize: '20px',
      textAlign: 'center',
    },
    h5: {
      fontWeight: 600,
      fontSize: '16px',
    },
    h6: {
      fontWeight: 600,
      fontSize: '14px',
    },
    body1: {
      fontSize: '14px',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '13px',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '12px',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '14px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '12px',
        },
      },
    },
  },
});

export default theme;