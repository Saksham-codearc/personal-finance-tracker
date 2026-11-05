import { Router } from 'express';
import {
  deleteBudget,
  listBudgets,
  upsertBudget,
} from '../controllers/budgetController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { budgetBodySchema } from '../validation/schemas.js';

const router = Router();

router.use(protect);

router.get('/', listBudgets);
router.put('/', validate(budgetBodySchema), upsertBudget);
router.delete('/:id', deleteBudget);

export default router;
