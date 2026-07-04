import express from 'express';
import cors from 'cors';
import { accountsRouter } from './routes/accounts';
import { layoutsRouter } from './routes/layouts';
import { API_CONFIG, BACKEND_ROUTES } from '../shared/constants/api';

const app = express();
const PORT = process.env.PORT || API_CONFIG.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(`${API_CONFIG.API_PREFIX}${BACKEND_ROUTES.ACCOUNTS}`, accountsRouter);
app.use(`${API_CONFIG.API_PREFIX}${BACKEND_ROUTES.LAYOUTS}`, layoutsRouter);

// Health check endpoint
app.get(`${API_CONFIG.API_PREFIX}${BACKEND_ROUTES.HEALTH}`, (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`BFF Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}${API_CONFIG.API_PREFIX}${BACKEND_ROUTES.HEALTH}`);
  console.log(`API Base: http://localhost:${PORT}${API_CONFIG.API_PREFIX}`);
});
