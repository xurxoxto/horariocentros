import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('admin'), (req, res) => {
  res.json({ users: [] });
});

router.get('/:id', authenticate, (req, res) => {
  res.json({ user: { id: req.params.id, name: 'User' } });
});

export default router;
