import { Router } from 'express';
import { getAccountData, updateAccountData } from '../services/accountService';
import { validateAccountUpdate } from '../validation/accountValidation';
import { sendNotFound, sendValidationError, sendServerError } from '../utils/httpErrors';

const router = Router();

// GET /api/accounts/:id - returns account data used by the page
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const accountData = getAccountData(id);

    if (!accountData) {
      return sendNotFound(res, 'Account not found', `No account found with ID: ${id}`);
    }

    res.json(accountData);
  } catch (error) {
    console.error('Error fetching account:', error);
    sendServerError(res, 'Failed to fetch account data');
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
      return sendValidationError(res, validationResult.errors);
    }

    // Update the account data
    const updatedAccount = updateAccountData(id, updates);

    if (!updatedAccount) {
      return sendNotFound(res, 'Account not found', `No account found with ID: ${id}`);
    }

    res.json(updatedAccount);
  } catch (error) {
    console.error('Error updating account:', error);
    sendServerError(res, 'Failed to update account data');
  }
});

export { router as accountsRouter };
