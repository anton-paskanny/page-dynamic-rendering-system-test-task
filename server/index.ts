import { app } from './app';
import { API_CONFIG, BACKEND_ROUTES } from '../shared/constants/api';

const PORT = process.env.PORT || API_CONFIG.PORT;

app.listen(PORT, () => {
  console.log(`BFF Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}${API_CONFIG.API_PREFIX}${BACKEND_ROUTES.HEALTH}`);
  console.log(`API Base: http://localhost:${PORT}${API_CONFIG.API_PREFIX}`);
});
