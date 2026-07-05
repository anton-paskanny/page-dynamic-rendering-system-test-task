import { Router } from 'express';
import type { Layout } from '../../shared/types/layout';
import { getLayout, updateLayout } from '../services/layoutService';
import { validateLayout } from '../validation/layoutValidation';
import { sendNotFound, sendValidationError, sendServerError } from '../utils/httpErrors';

const router = Router();

// GET /api/layouts/account - returns the layout JSON used to render the page
router.get('/account', (req, res) => {
  try {
    const layout = getLayout('account');

    if (!layout) {
      return sendNotFound(res, 'Layout not found', 'No layout found for account page');
    }

    res.json(layout);
  } catch (error) {
    console.error('Error fetching layout:', error);
    sendServerError(res, 'Failed to fetch layout data');
  }
});

// PUT /api/layouts/account - updates the layout JSON (Constructor page)
router.put('/account', (req, res) => {
  try {
    const validationResult = validateLayout(req.body);

    if (!validationResult.isValid) {
      return sendValidationError(res, validationResult.errors);
    }

    const updatedLayout = updateLayout('account', req.body as Layout);
    res.json(updatedLayout);
  } catch (error) {
    console.error('Error updating layout:', error);
    sendServerError(res, 'Failed to update layout data');
  }
});

export { router as layoutsRouter };
