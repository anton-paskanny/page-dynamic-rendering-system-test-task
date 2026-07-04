import { Router } from 'express';
import { getLayout } from '../services/layoutService';
import { sendNotFound, sendServerError } from '../utils/httpErrors';

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

export { router as layoutsRouter };
