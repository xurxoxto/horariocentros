import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { Constraint } from '../models/types';

const router = Router();

const constraints: Constraint[] = [];

router.get('/', authenticate, (req, res) => {
  const { timetableId } = req.query;
  const filtered = timetableId
    ? constraints.filter((c) => c.timetableId === timetableId)
    : constraints;
  res.json({ constraints: filtered });
});

router.post('/', authenticate, (req, res) => {
  const constraint: Constraint = {
    id: `const_${Date.now()}`,
    ...req.body,
  };
  constraints.push(constraint);
  res.status(201).json({ constraint });
});

router.put('/:id', authenticate, (req, res) => {
  const index = constraints.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Constraint not found' });
  }
  constraints[index] = { ...constraints[index], ...req.body };
  res.json({ constraint: constraints[index] });
});

router.delete('/:id', authenticate, (req, res) => {
  const index = constraints.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Constraint not found' });
  }
  constraints.splice(index, 1);
  res.status(204).send();
});

export default router;
