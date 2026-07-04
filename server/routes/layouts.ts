import { Router } from 'express';
import { getLayout } from '../services/layoutService';

const router = Router();

// GET /api/layouts/account - returns the layout JSON used to render the page
router.get('/account', (req, res) => {
  try {
    const layout = getLayout('account');
    
    if (!layout) {
      return res.status(404).json({
        error: 'Layout not found',
        message: 'No layout found for account page'
      });
    }
    
    res.json(layout);
  } catch (error) {
    console.error('Error fetching layout:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch layout data'
    });
  }
});

export { router as layoutsRouter };
