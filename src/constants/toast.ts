import type { DefaultToastOptions } from 'react-hot-toast';

// Colors mirror the --success/--error CSS variables in App.css.
const SUCCESS_COLOR = '#22c55e';
const ERROR_COLOR = '#ef4444';

export const TOAST_OPTIONS: DefaultToastOptions = {
  duration: 4000,
  style: {
    background: '#363636',
    color: '#fff',
  },
  success: {
    duration: 3000,
    iconTheme: {
      primary: SUCCESS_COLOR,
      secondary: '#fff',
    },
  },
  error: {
    duration: 5000,
    iconTheme: {
      primary: ERROR_COLOR,
      secondary: '#fff',
    },
  },
};
