import express from 'express';
import type { ErrorRequestHandler } from 'express';
import cors from 'cors';
import { accountsRouter } from './routes/accounts';
import { layoutsRouter } from './routes/layouts';
import { API_CONFIG, BACKEND_ROUTES } from '../shared/constants/api';
import { sendValidationError, sendServerError } from './utils/httpErrors';

export const app = express();

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

// Catches malformed request bodies and any other unhandled errors so a raw
// stack trace (with local file paths) never reaches the client.
// Express identifies error-handling middleware by arity, so all 4 params
// (including the unused `next`) must stay in the signature.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    console.error('Malformed request body:', err.message);
    sendValidationError(res, ['Request body must be valid JSON']);
    return;
  }

  console.error('Unhandled error:', err);
  sendServerError(res, 'Something went wrong');
};
app.use(errorHandler);
