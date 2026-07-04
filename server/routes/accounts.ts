import { Router } from 'express';
import { getAccountData, updateAccountData } from '../services/accountService';
import { validateAccountUpdate } from '../validation/accountValidation';

const router = Router();

// GET /api/accounts/:id - returns account data used by the page
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const accountData = getAccountData(id);
    
    if (!accountData) {
      return res.status(404).json({ 
        error: 'Account not found',
        message: `No account found with ID: ${id}`
      });
    }
    
    res.json(accountData);
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch account data'
    });
  }
});

// PATCH /api/accounts/:id - accepts updates for editable fields on the page
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Validate the update request
    const validationResult = validateAccountUpdate(updates);
    if (!validationResult.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.errors
      });
    }
    
    // Update the account data
    const updatedAccount = updateAccountData(id, updates);
    
    if (!updatedAccount) {
      return res.status(404).json({
        error: 'Account not found',
        message: `No account found with ID: ${id}`
      });
    }
    
    res.json(updatedAccount);
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update account data'
    });
  }
});

export { router as accountsRouter };
