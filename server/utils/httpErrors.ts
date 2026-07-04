import type { Response } from 'express';

export const sendNotFound = (res: Response, error: string, message: string): void => {
  res.status(404).json({ error, message });
};

export const sendValidationError = (res: Response, errors: string[]): void => {
  res.status(400).json({ error: 'Validation failed', details: errors });
};

export const sendServerError = (res: Response, message: string): void => {
  res.status(500).json({ error: 'Internal server error', message });
};
