import { Router } from 'express';
import {
  createTransaction,
  deleteTransaction,
  exportTransactions,
  listTransactions,
  updateTransaction,
} from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  transactionBodySchema,
  transactionUpdateSchema,
} from '../validation/schemas.js';

const router = Router();

router.use(protect);

router.get('/', listTransactions);
router.get('/export', exportTransactions);
router.post('/', validate(transactionBodySchema), createTransaction);
router.patch('/:id', validate(transactionUpdateSchema), updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
